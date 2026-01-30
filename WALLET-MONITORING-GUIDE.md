# Wallet Monitoring & Transaction Tracking System

## Overview
The Wallet Monitoring system in BlockTrace allows forensic investigators to track cryptocurrency wallets in real-time, analyze transaction flows, and receive alerts on wallet activity. This is crucial for ransomware investigations and cryptocurrency crime tracing.

## Features Implemented

### 1. **Wallet Monitoring Dashboard** (`/wallet-monitoring`)

#### Key Capabilities:
- **Add wallets to watchlist** - Monitor multiple Bitcoin addresses simultaneously
- **Real-time balance tracking** - Automatic updates every 60 seconds
- **Transaction history** - View recent transactions for any monitored wallet
- **Activity alerts** - Get notified when new transactions occur
- **Custom labels** - Tag wallets with meaningful names (Suspect Wallet, Exchange, etc.)

#### Statistics Tracked:
- Total monitored wallets
- Cumulative balance across all wallets
- Active alert count
- Unread notifications

#### How to Use:
1. Navigate to **Wallet Monitoring** in the sidebar
2. Enter a Bitcoin address (e.g., `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa`)
3. Add an optional label to identify the wallet
4. Click "Add to Watchlist"
5. Enable/disable alerts using the bell icon
6. Click "View Txs" to see transaction history
7. Refresh individual wallets or all at once

#### Alert System:
- **Background monitoring** - Checks for new transactions every 2 minutes
- **Toast notifications** - Instant alerts when activity is detected
- **Alert log** - Historical record of all wallet activities
- **Mark as read** - Click alerts to mark them as reviewed

### 2. **Payment Flow Visualization** (`/payment-flow`)

#### Key Capabilities:
- **Trace payment flows** - Follow cryptocurrency transactions across multiple addresses
- **Configurable depth** - Trace from 1 to 5 transaction hops
- **Visual network mapping** - See connections between addresses
- **Flow statistics** - Total volume, network size, and connection counts
- **Detailed transaction info** - View amounts, timestamps, and fees

#### How to Use:
1. Navigate to **Payment Flow** in the sidebar
2. Enter a starting Bitcoin address
3. Set trace depth (1-5 hops) - higher values explore more connections
4. Click "Trace Flow"
5. View the network of connected addresses
6. Click any address to see incoming/outgoing payments
7. Click the external link icon to view on Blockchain.com

#### Analysis Features:
- **Incoming/Outgoing totals** - See net flow for each address
- **Transaction details** - Hash, amount, fee, confirmation status
- **Network statistics** - Total addresses found, connections, volume
- **Flow summary** - Aggregate data across entire network

### 3. **Blockchain API Service** (`blockchainAPI.js`)

#### API Integration:
The system integrates with public blockchain APIs:
- **Blockchain.info API** - Primary data source for Bitcoin transactions
- **Mempool.space API** - Alternative data source
- **Fallback mode** - Uses mock data when APIs are unavailable

#### Functions Available:
```javascript
// Get wallet balance and transaction count
getWalletBalance(address)

// Fetch recent transactions
getWalletTransactions(address, limit)

// Get detailed transaction info
getTransactionDetails(txHash)

// Validate Bitcoin address format
isValidBitcoinAddress(address)

// Monitor wallet for new activity
startWalletMonitoring(address, callback, interval)

// Trace payment flow through network
tracePaymentFlow(startAddress, depth)
```

## Data Storage

All data is stored in localStorage:

### Storage Keys:
- **`walletWatchlist`** - Array of monitored wallets with balances and metadata
- **`walletAlerts`** - Array of activity alerts (last 50 kept)

### Wallet Object Structure:
```json
{
  "id": 1675432100000,
  "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "label": "Suspect Wallet",
  "balance": 1.23456789,
  "totalReceived": 10.5,
  "totalSent": 9.26543211,
  "txCount": 42,
  "alertEnabled": true,
  "addedAt": "2026-01-29T10:30:00.000Z",
  "lastUpdated": "2026-01-29T11:00:00.000Z"
}
```

### Alert Object Structure:
```json
{
  "id": 1675432200000,
  "walletLabel": "Suspect Wallet",
  "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "message": "3 new transaction(s) detected",
  "balance": 1.23456789,
  "timestamp": "2026-01-29T11:00:00.000Z",
  "read": false
}
```

## Real-World Use Cases

### 1. Ransomware Payment Tracking
**Scenario:** A ransomware attack demands payment to a Bitcoin address.

**Workflow:**
1. Add the ransom address to wallet monitoring
2. Enable alerts to be notified when payment occurs
3. Once payment detected, use Payment Flow to trace where funds move
4. Track funds through mixers, exchanges, and cash-out points
5. Identify endpoints for law enforcement action

### 2. Cryptocurrency Theft Investigation
**Scenario:** Funds stolen from exchange or wallet.

**Workflow:**
1. Add victim's wallet and known attacker addresses to watchlist
2. Monitor for fund movement
3. Use Payment Flow to trace stolen funds
4. Map entire transaction network
5. Identify exchange deposits for subpoena requests

### 3. Money Laundering Detection
**Scenario:** Suspected illicit funds being laundered through crypto.

**Workflow:**
1. Monitor source wallets for suspicious activity
2. Track volume and frequency of transactions
3. Use Payment Flow to identify layering techniques
4. Detect patterns like mixing, structuring, or rapid movement
5. Generate evidence for financial crimes unit

## Technical Implementation Details

### Auto-Refresh System
```javascript
// Refreshes all wallets every 60 seconds when enabled
useEffect(() => {
  if (!autoRefresh || watchlist.length === 0) return
  
  const interval = setInterval(() => {
    refreshAllWallets()
  }, 60000)
  
  return () => clearInterval(interval)
}, [autoRefresh, watchlist])
```

### Alert Monitoring
```javascript
// Monitors each wallet with alerts enabled every 2 minutes
useEffect(() => {
  const cleanupFunctions = []
  
  watchlist.forEach(wallet => {
    if (wallet.alertEnabled) {
      const cleanup = startWalletMonitoring(
        wallet.address,
        (data) => handleWalletActivity(wallet, data),
        120000
      )
      cleanupFunctions.push(cleanup)
    }
  })
  
  return () => cleanupFunctions.forEach(cleanup => cleanup())
}, [watchlist])
```

### Address Validation
```javascript
// Validates Bitcoin address format
const isValidBitcoinAddress = (address) => {
  const btcRegex = /^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/
  return btcRegex.test(address)
}
```

## API Limitations & Demo Mode

### Blockchain.info API:
- **Rate limit:** ~1 request per second
- **No authentication** required for basic queries
- **Public data** only - no private wallet info

### Demo Mode:
When API calls fail or rate limits are reached, the system automatically uses mock data:
- Random but realistic Bitcoin values
- Plausible transaction histories
- Marked with "DEMO" badge for transparency

This ensures the system remains testable without constant internet connectivity or API availability.

## UI Features

### Color Coding:
- **Green** - Incoming transactions, positive balances
- **Red** - Outgoing transactions, spending
- **Purple** - Selected/active items
- **Blue** - Information, trace actions
- **Yellow** - Alerts, unconfirmed transactions

### Responsive Design:
- **Desktop** - Three-column layout with full details
- **Mobile** - Stacked layout with collapsible sections
- **Touch-friendly** - Large buttons and tap targets

### Animations:
- Smooth transitions with Framer Motion
- Loading spinners on async operations
- Toast notifications for user feedback
- Hover effects for interactive elements

## Future Enhancements

### Potential Features:
1. **Multi-chain support** - Ethereum, Monero, other cryptocurrencies
2. **Advanced analytics** - ML-based pattern detection
3. **Export reports** - PDF/Excel export of tracking data
4. **Collaborative watchlists** - Share lists between investigators
5. **Integration with Chainalysis** - Professional-grade analysis
6. **Graph visualization** - Interactive D3.js network diagrams
7. **Risk scoring** - Automated risk assessment for addresses
8. **Exchange identification** - Detect known exchange addresses
9. **Mixer detection** - Identify privacy service usage
10. **Timeline view** - Chronological transaction timeline

## Security & Privacy Considerations

### Data Privacy:
- All data stored locally in browser
- No server-side storage of sensitive addresses
- Clear browser data to remove all watchlists

### Operational Security:
- Do not monitor personal wallets from agency computers
- Use VPN when making API requests in sensitive cases
- Consider running own blockchain node for enhanced privacy

### Legal Compliance:
- Ensure proper authorization before monitoring wallets
- Document chain of custody for all evidence
- Follow jurisdictional requirements for crypto investigations
- Obtain warrants/subpoenas when required

## Troubleshooting

### Common Issues:

**Issue:** "Invalid Bitcoin address format"
- **Solution:** Check address format (must start with 1, 3, or bc1)
- **Solution:** Ensure no extra spaces or characters

**Issue:** Demo data showing instead of real data
- **Solution:** Check internet connection
- **Solution:** Wait a moment - might be rate limited
- **Solution:** Try refreshing individual wallets

**Issue:** Alerts not working
- **Solution:** Ensure bell icon is green (alerts enabled)
- **Solution:** Keep browser tab open for monitoring
- **Solution:** Check if auto-refresh is enabled

**Issue:** Payment flow not showing connections
- **Solution:** Try lower depth value (1-2 hops)
- **Solution:** Address might have no recent transactions
- **Solution:** Wait for API rate limit to reset

## Sample Bitcoin Addresses for Testing

These are real, public Bitcoin addresses you can use for testing:

1. **Genesis Block Address** (Satoshi Nakamoto)
   - `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa`
   - Historical transactions, famous address

2. **Pizza Transaction Address**
   - `17SkEw2md5avVNyYgj6RiXuQKNwkXaxFyQ`
   - First real-world Bitcoin purchase

3. **FBI Seized Silk Road Wallet**
   - `1F1tAaz5x1HUXrCNLbtMDqcw6o5GNn4xqX`
   - High-value seized assets

## Support & Documentation

For questions or issues with the wallet monitoring system:
1. Check this documentation
2. Review browser console for errors
3. Verify localStorage data integrity
4. Test with known working addresses
5. Check API status at blockchain.com

## Credits

Built for BlockTrace Forensic Evidence Management System
Utilizes Blockchain.info and Mempool.space public APIs
React + Framer Motion + TailwindCSS
