'use strict'

const router = require('express').Router()
const controller = require('../controllers/evidenceController')

router.post('/', controller.registerEvidence)
router.get('/:id', controller.getEvidence)
router.post('/:id/transfer', controller.transferCustody)
router.post('/:id/verify', controller.verifyEvidence)
router.post('/:id/annotations', controller.annotateEvidence)

module.exports = router
