'use strict'

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
}

module.exports = EvidenceContract
