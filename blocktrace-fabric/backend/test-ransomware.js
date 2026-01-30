'use strict'

/**
 * Ransomware Traceability Test Script
 * Populates the blockchain with sample ransomware incidents for testing
 */

// Using built-in fetch (Node.js 18+)

const API_BASE = 'http://localhost:4000/api/v1'

// Sample ransomware test data
const testIncidents = [
  {
    incidentId: 'RW-2026-001',
    ransomwareFamily: 'LockBit 3.0',
    walletAddresses: [
      'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      'bc1q5s8x9w3z6t7y8u9v0a1b2c3d4e5f6g7h8i9j0k'
    ],
    metadata: {
      severity: 'CRITICAL',
      targetedSectors: ['Healthcare', 'Finance', 'Manufacturing'],
      ransomNote: 'Your files have been encrypted. Pay 5 BTC within 72 hours or data will be leaked.',
      encryptionType: 'AES-256 + RSA-2048',
      demandAmount: 5.5,
      demandCurrency: 'BTC',
      firstSeen: '2026-01-15T08:30:00Z'
    }
  },
  {
    incidentId: 'RW-2026-002',
    ransomwareFamily: 'BlackCat (ALPHV)',
    walletAddresses: [
      '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      '0x8d12A197cB00D4747a1fe03395095ce2A5CC6819'
    ],
    metadata: {
      severity: 'CRITICAL',
      targetedSectors: ['Government', 'Energy', 'Healthcare'],
      ransomNote: 'All your data has been exfiltrated and encrypted. Contact us via TOR.',
      encryptionType: 'ChaCha20',
      demandAmount: 2.8,
      demandCurrency: 'BTC',
      firstSeen: '2026-01-14T14:20:00Z'
    }
  },
  {
    incidentId: 'RW-2026-003',
    ransomwareFamily: 'Royal Ransomware',
    walletAddresses: [
      'bc1q9x8y7z6a5b4c3d2e1f0g9h8i7j6k5l4m3n2o1p'
    ],
    metadata: {
      severity: 'HIGH',
      targetedSectors: ['Education', 'Retail'],
      ransomNote: 'Your network is compromised. Pay to decrypt and prevent data leak.',
      encryptionType: 'AES-256',
      demandAmount: 1.2,
      demandCurrency: 'BTC',
      firstSeen: '2026-01-16T11:45:00Z'
    }
  },
  {
    incidentId: 'RW-2026-004',
    ransomwareFamily: 'Play Ransomware',
    walletAddresses: [
      'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq'
    ],
    metadata: {
      severity: 'MEDIUM',
      targetedSectors: ['Technology', 'Media'],
      ransomNote: 'Files encrypted. Contact play@onionmail.org for decryption key.',
      encryptionType: 'RSA-4096',
      demandAmount: 0.8,
      demandCurrency: 'BTC',
      firstSeen: '2026-01-13T09:15:00Z'
    }
  },
  {
    incidentId: 'RW-2026-005',
    ransomwareFamily: 'Cl0p',
    walletAddresses: [
      'bc1q5n7y8m9x0w1v2u3t4s5r6q7p8o9n0m1l2k3j4i'
    ],
    metadata: {
      severity: 'CRITICAL',
      targetedSectors: ['Finance', 'Legal', 'Professional Services'],
      ransomNote: 'MOVEit vulnerability exploited. All files encrypted and exfiltrated.',
      encryptionType: 'AES-128',
      demandAmount: 10.5,
      demandCurrency: 'BTC',
      firstSeen: '2026-01-12T16:30:00Z'
    }
  }
]

// Sample infected systems for each incident
const infectedSystems = {
  'RW-2026-001': [
    {
      hostname: 'WKS-FIN-001',
      ipAddress: '192.168.10.45',
      macAddress: '00:1B:44:11:3A:B7',
      osVersion: 'Windows Server 2019',
      filesEncrypted: 15420,
      recoveryStatus: 'INFECTED',
      infectionDate: '2026-01-15T08:30:00Z'
    },
    {
      hostname: 'SRV-DB-MAIN',
      ipAddress: '192.168.10.50',
      macAddress: '00:1B:44:11:3A:B8',
      osVersion: 'Windows Server 2022',
      filesEncrypted: 28934,
      recoveryStatus: 'INFECTED',
      infectionDate: '2026-01-15T09:15:00Z'
    },
    {
      hostname: 'WKS-HR-005',
      ipAddress: '192.168.10.78',
      macAddress: '00:1B:44:11:3A:C2',
      osVersion: 'Windows 11 Pro',
      filesEncrypted: 8752,
      recoveryStatus: 'RECOVERING',
      infectionDate: '2026-01-15T10:00:00Z'
    }
  ],
  'RW-2026-002': [
    {
      hostname: 'DC01-GOV',
      ipAddress: '10.0.1.10',
      macAddress: '00:50:56:C0:00:01',
      osVersion: 'Windows Server 2016',
      filesEncrypted: 45230,
      recoveryStatus: 'INFECTED',
      infectionDate: '2026-01-14T14:20:00Z'
    },
    {
      hostname: 'FILE-SRV-02',
      ipAddress: '10.0.1.25',
      macAddress: '00:50:56:C0:00:08',
      osVersion: 'Ubuntu Server 20.04',
      filesEncrypted: 67891,
      recoveryStatus: 'INFECTED',
      infectionDate: '2026-01-14T15:30:00Z'
    }
  ],
  'RW-2026-003': [
    {
      hostname: 'CAMPUS-WEB',
      ipAddress: '172.16.5.100',
      macAddress: '00:0C:29:3E:7A:4B',
      osVersion: 'CentOS 8',
      filesEncrypted: 12340,
      recoveryStatus: 'CONTAINED',
      infectionDate: '2026-01-16T11:45:00Z'
    }
  ],
  'RW-2026-005': [
    {
      hostname: 'LEGAL-FS01',
      ipAddress: '192.168.50.10',
      macAddress: '00:15:5D:01:02:03',
      osVersion: 'Windows Server 2019',
      filesEncrypted: 89234,
      recoveryStatus: 'INFECTED',
      infectionDate: '2026-01-12T16:30:00Z'
    }
  ]
}

// Sample payment trails
const paymentTrails = {
  'RW-2026-001': [
    {
      transactionHash: '3a4f5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4',
      fromWallet: 'bc1qunknownwallet123456789',
      toWallet: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      amount: 2.75,
      currency: 'BTC',
      timestamp: '2026-01-16T18:30:00Z',
      blockHeight: 825643,
      confirmations: 3,
      notes: 'Partial payment detected'
    }
  ],
  'RW-2026-005': [
    {
      transactionHash: 'f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3',
      fromWallet: 'bc1qvictimwallet987654321',
      toWallet: 'bc1q5n7y8m9x0w1v2u3t4s5r6q7p8o9n0m1l2k3j4i',
      amount: 10.5,
      currency: 'BTC',
      timestamp: '2026-01-14T22:15:00Z',
      blockHeight: 825512,
      confirmations: 6,
      notes: 'Full ransom payment confirmed'
    }
  ]
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function registerIncident(incident) {
  try {
    console.log(`\n📝 Registering incident: ${incident.incidentId}`)
    const response = await fetch(`${API_BASE}/ransomware`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incident)
    })
    
    const data = await response.json()
    if (data.success) {
      console.log(`✅ Incident ${incident.incidentId} registered successfully`)
      return true
    } else {
      console.error(`❌ Failed to register ${incident.incidentId}: ${data.error}`)
      return false
    }
  } catch (error) {
    console.error(`❌ Error registering ${incident.incidentId}:`, error.message)
    return false
  }
}

async function addInfectedSystems(incidentId, systems) {
  for (const system of systems) {
    try {
      console.log(`  └─ Adding infected system: ${system.hostname}`)
      const response = await fetch(`${API_BASE}/ransomware/${incidentId}/systems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(system)
      })
      
      const data = await response.json()
      if (data.success) {
        console.log(`     ✅ System added`)
      } else {
        console.error(`     ❌ Failed: ${data.error}`)
      }
      await delay(500)
    } catch (error) {
      console.error(`     ❌ Error:`, error.message)
    }
  }
}

async function trackPayments(incidentId, payments) {
  for (const payment of payments) {
    try {
      console.log(`  └─ Tracking payment: ${payment.amount} ${payment.currency}`)
      const response = await fetch(`${API_BASE}/ransomware/${incidentId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment)
      })
      
      const data = await response.json()
      if (data.success) {
        console.log(`     ✅ Payment tracked`)
      } else {
        console.error(`     ❌ Failed: ${data.error}`)
      }
      await delay(500)
    } catch (error) {
      console.error(`     ❌ Error:`, error.message)
    }
  }
}

async function updateIncidentStatus(incidentId, status, notes) {
  try {
    console.log(`  └─ Updating status to: ${status}`)
    const response = await fetch(`${API_BASE}/ransomware/${incidentId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes })
    })
    
    const data = await response.json()
    if (data.success) {
      console.log(`     ✅ Status updated`)
    } else {
      console.error(`     ❌ Failed: ${data.error}`)
    }
  } catch (error) {
    console.error(`     ❌ Error:`, error.message)
  }
}

async function main() {
  console.log('🔐 BlockTrace - Ransomware Traceability Test Script')
  console.log('=' .repeat(60))
  console.log('\n🚀 Starting data population...\n')
  
  let successCount = 0
  
  for (const incident of testIncidents) {
    const registered = await registerIncident(incident)
    
    if (registered) {
      successCount++
      await delay(1000)
      
      // Add infected systems if available
      if (infectedSystems[incident.incidentId]) {
        console.log(`\n💻 Adding infected systems for ${incident.incidentId}`)
        await addInfectedSystems(incident.incidentId, infectedSystems[incident.incidentId])
        await delay(1000)
      }
      
      // Track payments if available
      if (paymentTrails[incident.incidentId]) {
        console.log(`\n💰 Tracking payments for ${incident.incidentId}`)
        await trackPayments(incident.incidentId, paymentTrails[incident.incidentId])
        await delay(1000)
      }
      
      // Update status for resolved incidents
      if (incident.incidentId === 'RW-2026-003') {
        await updateIncidentStatus(incident.incidentId, 'CONTAINED', 'Systems isolated, investigation ongoing')
      } else if (incident.incidentId === 'RW-2026-004') {
        await updateIncidentStatus(incident.incidentId, 'INVESTIGATING', 'Forensics team analyzing attack vector')
      }
    }
    
    await delay(2000)
  }
  
  console.log('\n' + '='.repeat(60))
  console.log(`\n✨ Test data population complete!`)
  console.log(`📊 Summary: ${successCount}/${testIncidents.length} incidents registered\n`)
  console.log('🌐 You can now test the feature at:')
  console.log('   - Ransomware Tracking: http://localhost:5173/ransomware')
  console.log('   - Ransomware Analytics: http://localhost:5173/ransomware-analytics')
  console.log('\n💡 Tip: Try searching by family name or wallet address!\n')
}

// Run the script
main().catch(console.error)
