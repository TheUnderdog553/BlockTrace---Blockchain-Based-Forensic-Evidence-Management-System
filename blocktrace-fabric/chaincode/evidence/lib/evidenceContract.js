  
  .'use strict'

const { Contract } = require('fabric-contract-api')

class EvidenceContract extends Contract {
  constructor () {
    super('blocktrace.evidence')
  }

  async _evidenceExists (ctx, evidenceId) {
    const data = await ctx.stub.getState(evidenceId)
    return data && data.length > 0
  }

  _getInvoker (ctx) {
    return {
      mspId: ctx.clientIdentity.getMSPID(),
      id: ctx.clientIdentity.getID()
    }
  }

  _now (ctx) {
    const ts = ctx.stub.getTxTimestamp()
    const seconds = ts.seconds ? ts.seconds.low : 0
    const nanos = ts.nanos || 0
    return new Date(seconds * 1000 + Math.floor(nanos / 1e6)).toISOString()
  }

  async RegisterEvidence (ctx, evidenceId, contentHash, metadataJson) {
    if (!evidenceId) throw new Error('evidenceId is required')
    const exists = await this._evidenceExists(ctx, evidenceId)
    if (exists) {
      throw new Error(`Evidence ${evidenceId} already exists`)
    }

    let metadata
    try {
      metadata = metadataJson ? JSON.parse(metadataJson) : {}
    } catch (err) {
      throw new Error('metadata must be valid JSON')
    }

    const owner = this._getInvoker(ctx)
    const now = this._now(ctx)
    const record = {
      evidenceId,
      hash: contentHash,
      algorithm: metadata.algorithm || 'sha256',
      currentOwner: owner.mspId,
      status: 'REGISTERED',
      metadata,
      custodyTrail: [
        {
          from: owner.mspId,
          to: owner.mspId,
          timestamp: now,
          txId: ctx.stub.getTxID(),
          actorId: owner.id
        }
      ],
      annotations: [],
      createdAt: now,
      updatedAt: now
    }

    await ctx.stub.putState(evidenceId, Buffer.from(JSON.stringify(record)))
    ctx.stub.setEvent('blocktrace.evidence.registered', Buffer.from(JSON.stringify(record)))
    return record
  }

  async TransferCustody (ctx, evidenceId, fromOrg, toOrg, transferTs) {
    const evidence = await this._getEvidenceOrThrow(ctx, evidenceId)
    if (evidence.currentOwner !== fromOrg) {
      throw new Error(`Transfer denied. ${evidenceId} is owned by ${evidence.currentOwner}`)
    }

    const invoker = this._getInvoker(ctx)
    if (invoker.mspId !== fromOrg) {
      throw new Error(`Invoker MSP ${invoker.mspId} must match current owner ${fromOrg}`)
    }

    const timestamp = transferTs || this._now(ctx)
    evidence.currentOwner = toOrg
    evidence.status = 'IN_CUSTODY'
    evidence.updatedAt = timestamp
    evidence.custodyTrail.push({
      from: fromOrg,
      to: toOrg,
      timestamp,
      txId: ctx.stub.getTxID(),
      actorId: invoker.id
    })

    await ctx.stub.putState(evidenceId, Buffer.from(JSON.stringify(evidence)))
    ctx.stub.setEvent('blocktrace.evidence.transferred', Buffer.from(JSON.stringify({ evidenceId, fromOrg, toOrg, timestamp })))
    return evidence
  }

  async VerifyEvidence (ctx, evidenceId, providedHash) {
    const evidence = await this._getEvidenceOrThrow(ctx, evidenceId)
    const match = evidence.hash === providedHash
    const payload = {
      evidenceId,
      providedHash,
      expectedHash: evidence.hash,
      match,
      verifiedAt: this._now(ctx)
    }
    ctx.stub.setEvent('blocktrace.evidence.verified', Buffer.from(JSON.stringify(payload)))
    return payload
  }

  async GetEvidenceHistory (ctx, evidenceId) {
    const iterator = await ctx.stub.getHistoryForKey(evidenceId)
    const history = []
    while (true) {
      const result = await iterator.next()
      if (result.value && result.value.value) {
        const txRecord = {
          txId: result.value.tx_id,
          timestamp: result.value.timestamp ? result.value.timestamp.seconds.low : undefined,
          isDelete: result.value.is_delete,
          value: undefined
        }
        if (result.value.value.length > 0) {
          txRecord.value = JSON.parse(result.value.value.toString('utf8'))
        }
        history.push(txRecord)
      }
      if (result.done) {
        await iterator.close()
        break
      }
    }
    return history
  }

  async AnnotateEvidence (ctx, evidenceId, note) {
    if (!note) throw new Error('Annotation note text required')
    const evidence = await this._getEvidenceOrThrow(ctx, evidenceId)
    const invoker = this._getInvoker(ctx)
    const timestamp = this._now(ctx)
    const annotation = {
      author: invoker.id,
      org: invoker.mspId,
      note,
      timestamp
    }
    evidence.annotations.push(annotation)
    evidence.updatedAt = timestamp
    await ctx.stub.putState(evidenceId, Buffer.from(JSON.stringify(evidence)))
    ctx.stub.setEvent('blocktrace.evidence.annotated', Buffer.from(JSON.stringify({ evidenceId, annotation })))
    return evidence
  }

  async _getEvidenceOrThrow (ctx, evidenceId) {
    const data = await ctx.stub.getState(evidenceId)
    if (!data || data.length === 0) {
      throw new Error(`Evidence ${evidenceId} does not exist`)
    }
    return JSON.parse(data.toString())
  }

  async ReadEvidence (ctx, evidenceId) {
    return await this._getEvidenceOrThrow(ctx, evidenceId)
  }

  async GetAllEvidence (ctx) {
    const allResults = []
    const iterator = await ctx.stub.getStateByRange('', '')
    let result = await iterator.next()
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString('utf8')
      let record
      try {
        record = JSON.parse(strValue)
      } catch (err) {
        console.log(err)
        record = strValue
      }
      allResults.push(record)
      result = await iterator.next()
    }
    await iterator.close()
    return JSON.stringify(allResults)
  }

  // ==================== RANSOMWARE TRACEABILITY FUNCTIONS ====================

  async RegisterRansomwareIncident (ctx, incidentId, ransomwareFamily, walletAddresses, metadataJson) {
    if (!incidentId) throw new Error('incidentId is required')
    const key = `RANSOMWARE_${incidentId}`
    const exists = await this._evidenceExists(ctx, key)
    if (exists) {
      throw new Error(`Ransomware incident ${incidentId} already exists`)
    }

    let metadata
    try {
      metadata = metadataJson ? JSON.parse(metadataJson) : {}
    } catch (err) {
      throw new Error('metadata must be valid JSON')
    }

    let wallets = []
    try {
      wallets = walletAddresses ? JSON.parse(walletAddresses) : []
    } catch (err) {
      throw new Error('walletAddresses must be valid JSON array')
    }

    const reporter = this._getInvoker(ctx)
    const now = this._now(ctx)

    const incident = {
      incidentId,
      type: 'RANSOMWARE_INCIDENT',
      ransomwareFamily: ransomwareFamily || 'UNKNOWN',
      status: 'ACTIVE',
      walletAddresses: wallets,
      infectedSystems: [],
      evidenceLinks: [],
      paymentTrail: [],
      metadata: {
        ...metadata,
        firstSeen: metadata.firstSeen || now,
        severity: metadata.severity || 'CRITICAL',
        targetedSectors: metadata.targetedSectors || [],
        ransomNote: metadata.ransomNote || '',
        encryptionType: metadata.encryptionType || '',
        demandAmount: metadata.demandAmount || 0,
        demandCurrency: metadata.demandCurrency || 'BTC'
      },
      reportedBy: reporter.mspId,
      reporterId: reporter.id,
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          action: 'INCIDENT_REGISTERED',
          timestamp: now,
          actor: reporter.id,
          txId: ctx.stub.getTxID()
        }
      ]
    }

    await ctx.stub.putState(key, Buffer.from(JSON.stringify(incident)))
    ctx.stub.setEvent('blocktrace.ransomware.registered', Buffer.from(JSON.stringify({ incidentId, ransomwareFamily })))
    return incident
  }

  async AddInfectedSystem (ctx, incidentId, systemInfo) {
    const key = `RANSOMWARE_${incidentId}`
    const incident = await this._getEvidenceOrThrow(ctx, key)

    let system
    try {
      system = JSON.parse(systemInfo)
    } catch (err) {
      throw new Error('systemInfo must be valid JSON')
    }

    const invoker = this._getInvoker(ctx)
    const now = this._now(ctx)

    const infectedSystem = {
      hostname: system.hostname,
      ipAddress: system.ipAddress,
      macAddress: system.macAddress,
      osVersion: system.osVersion,
      infectionDate: system.infectionDate || now,
      filesEncrypted: system.filesEncrypted || 0,
      recoveryStatus: system.recoveryStatus || 'INFECTED',
      addedBy: invoker.mspId,
      timestamp: now
    }

    incident.infectedSystems.push(infectedSystem)
    incident.updatedAt = now
    incident.timeline.push({
      action: 'SYSTEM_ADDED',
      hostname: system.hostname,
      timestamp: now,
      actor: invoker.id,
      txId: ctx.stub.getTxID()
    })

    await ctx.stub.putState(key, Buffer.from(JSON.stringify(incident)))
    ctx.stub.setEvent('blocktrace.ransomware.system_added', Buffer.from(JSON.stringify({ incidentId, hostname: system.hostname })))
    return incident
  }

  async TrackPayment (ctx, incidentId, paymentInfo) {
    const key = `RANSOMWARE_${incidentId}`
    const incident = await this._getEvidenceOrThrow(ctx, key)

    let payment
    try {
      payment = JSON.parse(paymentInfo)
    } catch (err) {
      throw new Error('paymentInfo must be valid JSON')
    }

    const invoker = this._getInvoker(ctx)
    const now = this._now(ctx)

    const paymentRecord = {
      transactionHash: payment.transactionHash,
      fromWallet: payment.fromWallet,
      toWallet: payment.toWallet,
      amount: payment.amount,
      currency: payment.currency || 'BTC',
      timestamp: payment.timestamp || now,
      blockHeight: payment.blockHeight,
      confirmations: payment.confirmations || 0,
      trackedBy: invoker.mspId,
      notes: payment.notes || '',
      recordedAt: now
    }

    incident.paymentTrail.push(paymentRecord)
    incident.updatedAt = now
    incident.timeline.push({
      action: 'PAYMENT_TRACKED',
      transactionHash: payment.transactionHash,
      amount: payment.amount,
      timestamp: now,
      actor: invoker.id,
      txId: ctx.stub.getTxID()
    })

    await ctx.stub.putState(key, Buffer.from(JSON.stringify(incident)))
    ctx.stub.setEvent('blocktrace.ransomware.payment_tracked', Buffer.from(JSON.stringify({ incidentId, transactionHash: payment.transactionHash })))
    return incident
  }

  async LinkEvidenceToRansomware (ctx, incidentId, evidenceId, relationship) {
    const key = `RANSOMWARE_${incidentId}`
    const incident = await this._getEvidenceOrThrow(ctx, key)
    const evidence = await this._getEvidenceOrThrow(ctx, evidenceId)

    const invoker = this._getInvoker(ctx)
    const now = this._now(ctx)

    const link = {
      evidenceId,
      relationship: relationship || 'RELATED',
      linkedAt: now,
      linkedBy: invoker.mspId
    }

    incident.evidenceLinks.push(link)
    incident.updatedAt = now
    incident.timeline.push({
      action: 'EVIDENCE_LINKED',
      evidenceId,
      relationship,
      timestamp: now,
      actor: invoker.id,
      txId: ctx.stub.getTxID()
    })

    await ctx.stub.putState(key, Buffer.from(JSON.stringify(incident)))
    ctx.stub.setEvent('blocktrace.ransomware.evidence_linked', Buffer.from(JSON.stringify({ incidentId, evidenceId })))
    return incident
  }

  async UpdateRansomwareStatus (ctx, incidentId, newStatus, notes) {
    const key = `RANSOMWARE_${incidentId}`
    const incident = await this._getEvidenceOrThrow(ctx, key)

    const validStatuses = ['ACTIVE', 'CONTAINED', 'RESOLVED', 'INVESTIGATING', 'CLOSED']
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`)
    }

    const invoker = this._getInvoker(ctx)
    const now = this._now(ctx)
    const oldStatus = incident.status

    incident.status = newStatus
    incident.updatedAt = now
    incident.timeline.push({
      action: 'STATUS_UPDATED',
      oldStatus,
      newStatus,
      notes: notes || '',
      timestamp: now,
      actor: invoker.id,
      txId: ctx.stub.getTxID()
    })

    await ctx.stub.putState(key, Buffer.from(JSON.stringify(incident)))
    ctx.stub.setEvent('blocktrace.ransomware.status_updated', Buffer.from(JSON.stringify({ incidentId, oldStatus, newStatus })))
    return incident
  }

  async GetRansomwareIncident (ctx, incidentId) {
    const key = `RANSOMWARE_${incidentId}`
    return await this._getEvidenceOrThrow(ctx, key)
  }

  async QueryRansomwareByFamily (ctx, ransomwareFamily) {
    const query = {
      selector: {
        type: 'RANSOMWARE_INCIDENT',
        ransomwareFamily
      }
    }
    const queryString = JSON.stringify(query)
    const iterator = await ctx.stub.getQueryResult(queryString)
    const results = []

    let result = await iterator.next()
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString('utf8')
      results.push(JSON.parse(strValue))
      result = await iterator.next()
    }
    await iterator.close()
    return JSON.stringify(results)
  }

  async QueryRansomwareByWallet (ctx, walletAddress) {
    const query = {
      selector: {
        type: 'RANSOMWARE_INCIDENT',
        walletAddresses: {
          $elemMatch: {
            $eq: walletAddress
          }
        }
      }
    }
    const queryString = JSON.stringify(query)
    const iterator = await ctx.stub.getQueryResult(queryString)
    const results = []

    let result = await iterator.next()
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString('utf8')
      results.push(JSON.parse(strValue))
      result = await iterator.next()
    }
    await iterator.close()
    return JSON.stringify(results)
  }

  async GetAllRansomwareIncidents (ctx) {
    const query = {
      selector: {
        type: 'RANSOMWARE_INCIDENT'
      }
    }
    const queryString = JSON.stringify(query)
    const iterator = await ctx.stub.getQueryResult(queryString)
    const results = []

    let result = await iterator.next()
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString('utf8')
      results.push(JSON.parse(strValue))
      result = await iterator.next()
    }
    await iterator.close()
    return JSON.stringify(results)
  }
}

module.exports = EvidenceContract
