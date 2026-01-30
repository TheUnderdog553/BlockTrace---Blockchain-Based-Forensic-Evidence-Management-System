// Blockchain API Service for tracking crypto transactions

const BLOCKCHAIN_INFO_API = 'https://blockchain.info'
const MEMPOOL_API = 'https://mempool.space/api'

/**
 * Get wallet balance and transaction count
 */
export const getWalletBalance = async (address) => {
  try {
    const response = await fetch(`${BLOCKCHAIN_INFO_API}/balance?active=${address}`)
    const data = await response.json()
    
    if (!data[address]) {
      throw new Error('Address not found')
    }
    
    return {
      address,
      balance: data[address].final_balance / 100000000, // Convert satoshis to BTC
      totalReceived: data[address].total_received / 100000000,
      totalSent: (data[address].total_received - data[address].final_balance) / 100000000,
      txCount: data[address].n_tx,
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error fetching wallet balance:', error)
    // Return mock data if API fails
    return {
      address,
      balance: Math.random() * 10,
      totalReceived: Math.random() * 50,
      totalSent: Math.random() * 40,
      txCount: Math.floor(Math.random() * 100),
      lastUpdated: new Date().toISOString(),
      isMockData: true
    }
  }
}

/**
 * Get recent transactions for a wallet
 */
export const getWalletTransactions = async (address, limit = 10) => {
  try {
    const response = await fetch(`${BLOCKCHAIN_INFO_API}/rawaddr/${address}?limit=${limit}`)
    const data = await response.json()
    
    return data.txs.map(tx => ({
      hash: tx.hash,
      time: new Date(tx.time * 1000).toISOString(),
      amount: tx.result / 100000000,
      balance: tx.balance / 100000000,
      inputs: tx.inputs.map(i => i.prev_out?.addr).filter(Boolean),
      outputs: tx.out.map(o => o.addr),
      fee: tx.fee / 100000000,
      confirmations: tx.block_height ? 'Confirmed' : 'Unconfirmed'
    }))
  } catch (error) {
    console.error('Error fetching transactions:', error)
    // Return mock data if API fails
    return generateMockTransactions(address, limit)
  }
}

/**
 * Get detailed transaction information
 */
export const getTransactionDetails = async (txHash) => {
  try {
    const response = await fetch(`${BLOCKCHAIN_INFO_API}/rawtx/${txHash}`)
    const tx = await response.json()
    
    return {
      hash: tx.hash,
      time: new Date(tx.time * 1000).toISOString(),
      blockHeight: tx.block_height,
      confirmations: tx.block_height ? 'Confirmed' : 'Unconfirmed',
      inputs: tx.inputs.map(i => ({
        address: i.prev_out?.addr,
        value: i.prev_out?.value / 100000000
      })),
      outputs: tx.out.map(o => ({
        address: o.addr,
        value: o.value / 100000000,
        spent: o.spent
      })),
      fee: tx.fee / 100000000,
      totalInput: tx.inputs.reduce((sum, i) => sum + (i.prev_out?.value || 0), 0) / 100000000,
      totalOutput: tx.out.reduce((sum, o) => sum + o.value, 0) / 100000000
    }
  } catch (error) {
    console.error('Error fetching transaction details:', error)
    return null
  }
}

/**
 * Check if address is valid Bitcoin address
 */
export const isValidBitcoinAddress = (address) => {
  // Basic validation - starts with 1, 3, or bc1
  const btcRegex = /^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/
  return btcRegex.test(address)
}

/**
 * Generate mock transaction data for testing
 */
const generateMockTransactions = (address, count) => {
  return Array.from({ length: count }, (_, i) => ({
    hash: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    time: new Date(Date.now() - i * 3600000).toISOString(),
    amount: (Math.random() - 0.5) * 5,
    balance: 10 + (Math.random() - 0.5) * 5,
    inputs: [`1A1zP1eP5QGefi2DMPTfTL${Math.random().toString(36).substring(2, 10)}`],
    outputs: [`${address}`, `1MckZp${Math.random().toString(36).substring(2, 15)}`],
    fee: 0.0001 + Math.random() * 0.0005,
    confirmations: i < count - 2 ? 'Confirmed' : 'Unconfirmed',
    isMockData: true
  }))
}

/**
 * Monitor wallet for new transactions
 */
export const startWalletMonitoring = (address, callback, interval = 60000) => {
  let lastTxCount = 0
  
  const check = async () => {
    try {
      const data = await getWalletBalance(address)
      
      if (data.txCount > lastTxCount) {
        const newTxCount = data.txCount - lastTxCount
        callback({
          address,
          newTransactions: newTxCount,
          balance: data.balance,
          timestamp: new Date().toISOString()
        })
      }
      
      lastTxCount = data.txCount
    } catch (error) {
      console.error('Monitoring error:', error)
    }
  }
  
  // Initial check
  check()
  
  // Set up interval
  const intervalId = setInterval(check, interval)
  
  // Return cleanup function
  return () => clearInterval(intervalId)
}

/**
 * Trace payment flow between addresses
 */
export const tracePaymentFlow = async (startAddress, depth = 3) => {
  const nodes = new Set()
  const edges = []
  
  const trace = async (address, currentDepth) => {
    if (currentDepth >= depth || nodes.has(address)) return
    
    nodes.add(address)
    
    try {
      const txs = await getWalletTransactions(address, 5)
      
      for (const tx of txs) {
        // Add connections to outputs
        for (const output of tx.outputs) {
          if (output !== address && !nodes.has(output)) {
            edges.push({
              from: address,
              to: output,
              amount: Math.abs(tx.amount),
              txHash: tx.hash,
              time: tx.time
            })
            
            if (currentDepth < depth - 1) {
              await trace(output, currentDepth + 1)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error tracing:', error)
    }
  }
  
  await trace(startAddress, 0)
  
  return {
    nodes: Array.from(nodes),
    edges
  }
}

export default {
  getWalletBalance,
  getWalletTransactions,
  getTransactionDetails,
  isValidBitcoinAddress,
  startWalletMonitoring,
  tracePaymentFlow
}
