'use strict'

const { Gateway, Wallets } = require('fabric-network')
const path = require('path')
const fs = require('fs')

// Test network paths
const TEST_NETWORK_DIR = path.resolve(__dirname, '../../../fabric-samples/test-network')
const CHANNEL_NAME = 'mychannel'
const CHAINCODE_NAME = 'evidence'
const MSP_ID = 'Org1MSP'

let gateway = null
let contract = null

async function connectToNetwork() {
  if (contract) return contract

  try {
    // Build connection profile
    const ccpPath = path.join(TEST_NETWORK_DIR, 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json')
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'))

    // Build wallet with Admin identity
    const walletPath = path.join(__dirname, '../wallet')
    const wallet = await Wallets.newFileSystemWallet(walletPath)

    // Check if Admin identity exists
    const identity = await wallet.get('admin')
    if (!identity) {
      console.log('Creating admin identity...')
      const certPath = path.join(TEST_NETWORK_DIR, 'organizations', 'peerOrganizations', 'org1.example.com', 'users', 'Admin@org1.example.com', 'msp', 'signcerts', 'Admin@org1.example.com-cert.pem')
      const keyPath = path.join(TEST_NETWORK_DIR, 'organizations', 'peerOrganizations', 'org1.example.com', 'users', 'Admin@org1.example.com', 'msp', 'keystore')
      
      const cert = fs.readFileSync(certPath).toString()
      const keyFiles = fs.readdirSync(keyPath)
      const keyFile = keyFiles[0]
      const key = fs.readFileSync(path.join(keyPath, keyFile)).toString()

      const x509Identity = {
        credentials: {
          certificate: cert,
          privateKey: key
        },
        mspId: MSP_ID,
        type: 'X.509'
      }

      await wallet.put('admin', x509Identity)
      console.log('Admin identity created')
    }

    // Connect to gateway
    gateway = new Gateway()
    await gateway.connect(ccp, {
      wallet,
      identity: 'admin',
      discovery: { enabled: true, asLocalhost: true }
    })

    // Get network and contract
    const network = await gateway.getNetwork(CHANNEL_NAME)
    contract = network.getContract(CHAINCODE_NAME)

    console.log('Connected to Fabric network')
    return contract
  } catch (error) {
    console.error('Failed to connect to network:', error)
    throw error
  }
}

async function submit(functionName, ...args) {
  try {
    const c = await connectToNetwork()
    const result = await c.submitTransaction(functionName, ...args)
    return result.toString()
  } catch (error) {
    console.error(`Failed to submit ${functionName}:`, error)
    throw error
  }
}

async function evaluate(functionName, ...args) {
  try {
    const c = await connectToNetwork()
    const result = await c.evaluateTransaction(functionName, ...args)
    return result.toString()
  } catch (error) {
    console.error(`Failed to evaluate ${functionName}:`, error)
    throw error
  }
}

async function disconnect() {
  if (gateway) {
    await gateway.disconnect()
    gateway = null
    contract = null
    console.log('Disconnected from Fabric network')
  }
}

process.on('SIGINT', async () => {
  await disconnect()
  process.exit(0)
})

exports.submit = submit
exports.evaluate = evaluate
exports.disconnect = disconnect
