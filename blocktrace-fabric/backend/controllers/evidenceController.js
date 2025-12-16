'use strict'

const fabricClient = require('../services/fabricClient')

exports.registerEvidence = async (req, res, next) => {
  try {
    const payload = await fabricClient.submit('RegisterEvidence', [
      req.body.evidenceId,
      req.body.hash,
      JSON.stringify(req.body.metadata || {})
    ])
    res.status(201).json(payload)
  } catch (err) {
    next(err)
  }
}

exports.transferCustody = async (req, res, next) => {
  try {
    const payload = await fabricClient.submit('TransferCustody', [
      req.params.id,
      req.body.from,
      req.body.to,
      req.body.timestamp
    ])
    res.json(payload)
  } catch (err) {
    next(err)
  }
}

exports.verifyEvidence = async (req, res, next) => {
  try {
    const payload = await fabricClient.submit('VerifyEvidence', [
      req.params.id,
      req.body.hash
    ])
    res.json(payload)
  } catch (err) {
    next(err)
  }
}

exports.getEvidence = async (req, res, next) => {
  try {
    const payload = await fabricClient.evaluate('GetEvidenceHistory', [req.params.id])
    res.json(payload)
  } catch (err) {
    next(err)
  }
}

exports.annotateEvidence = async (req, res, next) => {
  try {
    const payload = await fabricClient.submit('AnnotateEvidence', [
      req.params.id,
      req.body.note
    ])
    res.json(payload)
  } catch (err) {
    next(err)
  }
}
