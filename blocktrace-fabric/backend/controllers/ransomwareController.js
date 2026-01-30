'use strict'

const fabricClient = require('../services/fabricClient')

exports.registerIncident = async (req, res) => {
  try {
    const { incidentId, ransomwareFamily, walletAddresses, metadata } = req.body

    if (!incidentId || !ransomwareFamily) {
      return res.status(400).json({ error: 'incidentId and ransomwareFamily are required' })
    }

    const result = await fabricClient.submit(
      'RegisterRansomwareIncident',
      incidentId,
      ransomwareFamily,
      JSON.stringify(walletAddresses || []),
      JSON.stringify(metadata || {})
    )

    const incident = JSON.parse(result)
    res.status(201).json({ success: true, data: incident })
  } catch (error) {
    console.error('Error registering ransomware incident:', error)
    res.status(500).json({ error: error.message })
  }
}

exports.addInfectedSystem = async (req, res) => {
  try {
    const { incidentId } = req.params
    const systemInfo = req.body

    if (!incidentId || !systemInfo.hostname) {
      return res.status(400).json({ error: 'incidentId and hostname are required' })
    }

    const result = await fabricClient.submit(
      'AddInfectedSystem',
      incidentId,
      JSON.stringify(systemInfo)
    )

    const incident = JSON.parse(result)
    res.json({ success: true, data: incident })
  } catch (error) {
    console.error('Error adding infected system:', error)
    res.status(500).json({ error: error.message })
  }
}

exports.trackPayment = async (req, res) => {
  try {
    const { incidentId } = req.params
    const paymentInfo = req.body

    if (!incidentId || !paymentInfo.transactionHash) {
      return res.status(400).json({ error: 'incidentId and transactionHash are required' })
    }

    const result = await fabricClient.submit(
      'TrackPayment',
      incidentId,
      JSON.stringify(paymentInfo)
    )

    const incident = JSON.parse(result)
    res.json({ success: true, data: incident })
  } catch (error) {
    console.error('Error tracking payment:', error)
    res.status(500).json({ error: error.message })
  }
}

exports.linkEvidence = async (req, res) => {
  try {
    const { incidentId } = req.params
    const { evidenceId, relationship } = req.body

    if (!incidentId || !evidenceId) {
      return res.status(400).json({ error: 'incidentId and evidenceId are required' })
    }

    const result = await fabricClient.submit(
      'LinkEvidenceToRansomware',
      incidentId,
      evidenceId,
      relationship || 'RELATED'
    )

    const incident = JSON.parse(result)
    res.json({ success: true, data: incident })
  } catch (error) {
    console.error('Error linking evidence:', error)
    res.status(500).json({ error: error.message })
  }
}

exports.updateStatus = async (req, res) => {
  try {
    const { incidentId } = req.params
    const { status, notes } = req.body

    if (!incidentId || !status) {
      return res.status(400).json({ error: 'incidentId and status are required' })
    }

    const result = await fabricClient.submit(
      'UpdateRansomwareStatus',
      incidentId,
      status,
      notes || ''
    )

    const incident = JSON.parse(result)
    res.json({ success: true, data: incident })
  } catch (error) {
    console.error('Error updating status:', error)
    res.status(500).json({ error: error.message })
  }
}

exports.getIncident = async (req, res) => {
  try {
    const { incidentId } = req.params

    const result = await fabricClient.evaluate(
      'GetRansomwareIncident',
      incidentId
    )

    const incident = JSON.parse(result)
    res.json({ success: true, data: incident })
  } catch (error) {
    console.error('Error getting incident:', error)
    res.status(500).json({ error: error.message })
  }
}

exports.queryByFamily = async (req, res) => {
  try {
    const { family } = req.params

    const result = await fabricClient.evaluate(
      'QueryRansomwareByFamily',
      family
    )

    const incidents = JSON.parse(result)
    res.json({ success: true, data: incidents })
  } catch (error) {
    console.error('Error querying by family:', error)
    res.status(500).json({ error: error.message })
  }
}

exports.queryByWallet = async (req, res) => {
  try {
    const { wallet } = req.params

    const result = await fabricClient.evaluate(
      'QueryRansomwareByWallet',
      wallet
    )

    const incidents = JSON.parse(result)
    res.json({ success: true, data: incidents })
  } catch (error) {
    console.error('Error querying by wallet:', error)
    res.status(500).json({ error: error.message })
  }
}

exports.getAllIncidents = async (req, res) => {
  try {
    const result = await fabricClient.evaluate(
      'GetAllRansomwareIncidents'
    )

    const incidents = JSON.parse(result)
    res.json({ success: true, data: incidents })
  } catch (error) {
    console.error('Error getting all incidents:', error)
    res.status(500).json({ error: error.message })
  }
}
