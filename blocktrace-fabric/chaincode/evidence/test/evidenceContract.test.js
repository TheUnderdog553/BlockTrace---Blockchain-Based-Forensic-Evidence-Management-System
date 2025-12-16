'use strict'

const { expect } = require('chai')
const sinon = require('sinon')
const EvidenceContract = require('../lib/evidenceContract')

const mockTimestamp = () => ({ seconds: { low: 1 }, nanos: 0 })

const createCtx = () => {
  return {
    stub: {
      getState: sinon.stub().resolves(Buffer.alloc(0)),
      putState: sinon.stub().resolves(),
      setEvent: sinon.stub(),
      getTxID: sinon.stub().returns('TX123'),
      getTxTimestamp: sinon.stub().returns(mockTimestamp()),
      getHistoryForKey: sinon.stub().resolves({
        next: async () => ({ done: true }),
        close: async () => {}
      })
    },
    clientIdentity: {
      getMSPID: sinon.stub().returns('ForensicsOrgMSP'),
      getID: sinon.stub().returns('x509::/CN=analyst')
    }
  }
}

describe('EvidenceContract', () => {
  let contract
  let ctx

  beforeEach(() => {
    contract = new EvidenceContract()
    ctx = createCtx()
  })

  it('registers new evidence once', async () => {
    const result = await contract.RegisterEvidence(ctx, 'EV-1', 'hash-abc', JSON.stringify({ caseId: 'CASE-1' }))
    expect(result.evidenceId).to.equal('EV-1')
    expect(ctx.stub.putState.calledOnce).to.be.true
    const [, buffer] = ctx.stub.putState.getCall(0).args
    const stored = JSON.parse(buffer.toString())
    expect(stored.currentOwner).to.equal('ForensicsOrgMSP')
  })

  it('throws when evidence already exists', async () => {
    ctx.stub.getState.resolves(Buffer.from('{}'))
    try {
      await contract.RegisterEvidence(ctx, 'EV-2', 'hash', '{}')
      expect.fail('expected error')
    } catch (err) {
      expect(err.message).to.contain('Evidence EV-2 already exists')
    }
  })

  it('transfers custody when invoker matches owner', async () => {
    const existing = {
      evidenceId: 'EV-3',
      hash: 'hash',
      currentOwner: 'ForensicsOrgMSP',
      status: 'REGISTERED',
      custodyTrail: [],
      annotations: []
    }
    ctx.stub.getState.resolves(Buffer.from(JSON.stringify(existing)))

    const updated = await contract.TransferCustody(ctx, 'EV-3', 'ForensicsOrgMSP', 'PoliceOrgMSP')
    expect(updated.currentOwner).to.equal('PoliceOrgMSP')
    expect(ctx.stub.putState.calledOnce).to.be.true
  })

  it('blocks transfer when invoker MSP mismatches owner', async () => {
    const existing = {
      evidenceId: 'EV-4',
      hash: 'hash',
      currentOwner: 'ForensicsOrgMSP',
      status: 'REGISTERED',
      custodyTrail: [],
      annotations: []
    }
    ctx.stub.getState.resolves(Buffer.from(JSON.stringify(existing)))
    ctx.clientIdentity.getMSPID.returns('CourtOrgMSP')

    try {
      await contract.TransferCustody(ctx, 'EV-4', 'ForensicsOrgMSP', 'PoliceOrgMSP')
      expect.fail('expected transfer to fail')
    } catch (err) {
      expect(err.message).to.contain('Invoker MSP CourtOrgMSP must match current owner ForensicsOrgMSP')
    }
  })

  it('verifies hash mismatch status', async () => {
    const existing = {
      evidenceId: 'EV-5',
      hash: 'expected',
      currentOwner: 'ForensicsOrgMSP',
      custodyTrail: [],
      annotations: []
    }
    ctx.stub.getState.resolves(Buffer.from(JSON.stringify(existing)))
    const result = await contract.VerifyEvidence(ctx, 'EV-5', 'wrong-hash')
    expect(result.match).to.be.false
    expect(result.expectedHash).to.equal('expected')
    expect(ctx.stub.setEvent.calledOnce).to.be.true
  })
})
