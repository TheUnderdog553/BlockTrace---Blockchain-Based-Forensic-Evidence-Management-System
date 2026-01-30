'use strict'

require('dotenv').config()
const express = require('express')
const morgan = require('morgan')

const evidenceRouter = require('./routes/evidence')
const ransomwareRouter = require('./routes/ransomware')

const app = express()
app.use(express.json({ limit: '10mb' }))
app.use(morgan('dev'))

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', service: 'blocktrace-backend' })
})

app.use('/api/v1/evidence', evidenceRouter)
app.use('/api/v1/ransomware', ransomwareRouter)

const port = process.env.PORT || 4000
if (require.main === module) {
  app.listen(port, () => {
    console.log(`BlockTrace API listening on ${port}`)
  })
}

module.exports = app
