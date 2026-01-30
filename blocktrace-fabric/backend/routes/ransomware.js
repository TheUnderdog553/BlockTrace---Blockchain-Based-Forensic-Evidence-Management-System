'use strict'

const express = require('express')
const router = express.Router()
const ransomwareController = require('../controllers/ransomwareController')

// Register new ransomware incident
router.post('/', ransomwareController.registerIncident)

// Get all ransomware incidents
router.get('/', ransomwareController.getAllIncidents)

// Get specific incident
router.get('/:incidentId', ransomwareController.getIncident)

// Query by ransomware family
router.get('/family/:family', ransomwareController.queryByFamily)

// Query by wallet address
router.get('/wallet/:wallet', ransomwareController.queryByWallet)

// Add infected system to incident
router.post('/:incidentId/systems', ransomwareController.addInfectedSystem)

// Track payment
router.post('/:incidentId/payments', ransomwareController.trackPayment)

// Link evidence to incident
router.post('/:incidentId/evidence', ransomwareController.linkEvidence)

// Update incident status
router.patch('/:incidentId/status', ransomwareController.updateStatus)

module.exports = router
