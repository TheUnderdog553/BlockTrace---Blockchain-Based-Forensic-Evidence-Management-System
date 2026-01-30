'use strict'

const { Gateway, Wallets } = require('fabric-network')
const path = require('path')
const fs = require('fs')

// BlockTrace network paths
const NETWORK_DIR = path.resolve(__dirname, '../../network')
const CHANNEL_NAME = 'mychannel'
const CHAINCODE_NAME = 'evidence'
const MSP_ID = 'ForensicsOrgMSP'
const ORG_NAME = 'forensics.blocktrace.com'

let gateway = null
let contract = null

async function connectToNetwork() {
  if (contract) return contract

  try {
    // Build connection profile for BlockTrace network
    const ccp = {
      name: 'blocktrace-network',
      version: '1.0.0',
      client: {
        organization: 'ForensicsOrg',
        connection: {
          timeout: {
            peer: { endorser: '300' },
            orderer: '300'
          }
        }
      },
      channels: {
        mychannel: {
          orderers: ['orderer.blocktrace.com'],
          peers: {
            'peer0.forensics.blocktrace.com': {
              endorsingPeer: true,
              chaincodeQuery: true,
              ledgerQuery: true,
              eventSource: true
            }
          }
        }
      },
      organizations: {
        ForensicsOrg: {
          mspid: 'ForensicsOrgMSP',
          peers: ['peer0.forensics.blocktrace.com']
        }
      },
      orderers: {
        'orderer.blocktrace.com': {
          url: 'grpc://localhost:7050',
          grpcOptions: {
            'ssl-target-name-override': 'orderer.blocktrace.com'
          }
        }
      },
      peers: {
        'peer0.forensics.blocktrace.com': {
          url: 'grpc://localhost:7051',
          grpcOptions: {
            'ssl-target-name-override': 'peer0.forensics.blocktrace.com'
          }
        }
      }
    }

    // Build wallet with Admin identity
    const walletPath = path.join(__dirname, '../wallet')
    const wallet = await Wallets.newFileSystemWallet(walletPath)

    // Check if Admin identity exists
    const identity = await wallet.get('admin')
    if (!identity) {
      console.log('Creating admin identity for BlockTrace network...')
      const cryptoPath = path.join(NETWORK_DIR, 'crypto-config', 'peerOrganizations', ORG_NAME)
      const certPath = path.join(cryptoPath, 'users', `Admin@${ORG_NAME}`, 'msp', 'signcerts', `Admin@${ORG_NAME}-cert.pem`)
      const keyPath = path.join(cryptoPath, 'users', `Admin@${ORG_NAME}`, 'msp', 'keystore')
      
      if (!fs.existsSync(certPath)) {
        throw new Error(`Certificate not found at ${certPath}. Make sure the network is running.`)
      }

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
      console.log('Admin identity created for ForensicsOrg')
    }

    // Connect to gateway
    gateway = new Gateway()
    await gateway.connect(ccp, {
      wallet,
      identity: 'admin',
      discovery: { enabled: false, asLocalhost: true }
    })

    // Get network and contract
    const network = await gateway.getNetwork(CHANNEL_NAME)
    contract = network.getContract(CHAINCODE_NAME)

    console.log('Connected to BlockTrace Fabric network')
    return contract
  } catch (error) {
    console.error('Failed to connect to BlockTrace network:', error)
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
