# Wallet Monitoring - Quick Test Guide

## 🚀 Quick Start (60 seconds)

### Step 1: Add Your First Wallet
```
1. Navigate to "Wallet Monitoring" in sidebar
2. Enter address: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
3. Label: "Genesis Block"
4. Click "Add to Watchlist"
```

### Step 2: View Transactions
```
1. Click "View Txs" button on the wallet card
2. See transaction history on the right panel
3. Check incoming/outgoing amounts
```

### Step 3: Trace Payment Flow
```
1. Navigate to "Payment Flow" in sidebar
2. Enter same address: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
3. Set depth to 2
4. Click "Trace Flow"
5. Explore connected addresses
```

---

## 📋 Test Wallet Addresses

### High Activity Wallets
```
1. Genesis Block (Satoshi)
   Address: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
   Label: "Genesis - Satoshi's Wallet"
   
2. Bitcoin Pizza
   Address: 17SkEw2md5avVNyYgj6RiXuQKNwkXaxFyQ
   Label: "First Pizza Purchase"
   
3. FBI Silk Road Seizure
   Address: 1F1tAaz5x1HUXrCNLbtMDqcw6o5GNn4xqX
   Label: "FBI Seized Assets"
```

### For Flow Visualization
```
Start Address: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
Depth: 2-3 hops
Expected: 5-10 connected addresses
```

---

## 🧪 Test Scenarios

### Scenario 1: Ransomware Payment Tracking
**Goal:** Track a ransom payment from victim to attacker

1. Add victim wallet to monitoring: `[Victim Address]`
2. Enable alerts (click bell icon)
3. Wait for payment transaction
4. Once detected, use Payment Flow to trace
5. Document all connected addresses
6. Identify exchange deposits

**Sample Test:**
```
Victim: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
Trace depth: 3
Expected: See fund movement through network
```

### Scenario 2: Multiple Suspect Wallets
**Goal:** Monitor several related wallets simultaneously

1. Add 3-5 related addresses
2. Label each: "Suspect A", "Suspect B", etc.
3. Enable alerts on all
4. Monitor balances and activities
5. Look for coordinated movements

**Sample Test:**
```
Add these wallets:
- 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa (Suspect A)
- 17SkEw2md5avVNyYgj6RiXuQKNwkXaxFyQ (Suspect B)
- 1F1tAaz5x1HUXrCNLbtMDqcw6o5GNn4xqX (Suspect C)
```

### Scenario 3: Fund Flow Analysis
**Goal:** Map entire transaction network from known bad actor

1. Start with known attacker address
2. Use Payment Flow with depth 4-5
3. Document all connected wallets
4. Identify high-value endpoints
5. Check for exchange addresses

**Sample Test:**
```
Start: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
Depth: 4
Look for: Exchanges, mixers, cash-out points
```

---

## ⚡ Feature Checklist

### Wallet Monitoring
- [ ] Add wallet to watchlist
- [ ] View real-time balance
- [ ] Check transaction count
- [ ] Enable/disable alerts
- [ ] Refresh individual wallet
- [ ] Refresh all wallets
- [ ] View transaction history
- [ ] Delete wallet from list
- [ ] Search watchlist
- [ ] Toggle auto-refresh

### Payment Flow
- [ ] Enter starting address
- [ ] Set trace depth (1-5)
- [ ] Trace payment flow
- [ ] View network statistics
- [ ] Explore connected addresses
- [ ] View incoming/outgoing flows
- [ ] See transaction details
- [ ] Open address on blockchain.com
- [ ] Check total flow volume

### Alerts
- [ ] Receive activity notification
- [ ] View alert history
- [ ] Mark alerts as read
- [ ] Clear all alerts
- [ ] See unread count

---

## 🎯 Expected Results

### When Adding Wallet:
```
✅ Success toast: "[Label] added to watchlist"
✅ Wallet appears in list with balance
✅ Shows total received/sent/transactions
✅ Alert bell icon visible
✅ Refresh and delete buttons active
```

### When Viewing Transactions:
```
✅ Transaction list appears on right panel
✅ Shows amount (+ for incoming, - for outgoing)
✅ Displays transaction hash
✅ Shows confirmation status
✅ Includes timestamp and fee
```

### When Tracing Flow:
```
✅ Shows network of connected addresses
✅ Displays incoming/outgoing totals
✅ Lists individual transactions
✅ Shows network statistics
✅ Allows address expansion for details
```

---

## 🔍 What to Look For

### Suspicious Patterns:
1. **Rapid movement** - Funds quickly transferred through multiple wallets
2. **Equal splits** - Dividing funds into equal amounts (common laundering)
3. **Mixing services** - Funds routed through known mixers
4. **Exchange deposits** - Large amounts sent to exchanges
5. **Round numbers** - Suspicious precision in amounts
6. **Time patterns** - Transactions at unusual hours
7. **Address reuse** - Same addresses used repeatedly

### Red Flags:
- High transaction count with low balance (pass-through wallet)
- Frequent small deposits, one large withdrawal (aggregation)
- Multiple inputs, single output (consolidation)
- Single input, multiple outputs (distribution)
- Connections to known bad actors or services

---

## 📊 Sample Data for Testing

### Wallet Labels to Use:
```
- "Ransomware Victim"
- "Suspect Primary Wallet"
- "Money Laundering Node"
- "Exchange Deposit Address"
- "Cash-Out Wallet"
- "Unknown Entity A"
- "Mixer Service Input"
- "Investigation Target"
```

### Test Notes Template:
```
Date: [Date]
Case ID: [ID]
Wallet: [Address]
Label: [Label]
Initial Balance: [Amount] BTC
Activity Detected: [Yes/No]
New Transactions: [Count]
Flow Trace Depth: [Depth]
Connected Addresses: [Count]
Suspicious Activity: [Yes/No]
Notes: [Your observations]
```

---

## 🛠️ Troubleshooting Quick Fixes

### Problem: Demo data showing
**Fix:** Check internet, wait 30 seconds, try again

### Problem: No transactions visible
**Fix:** Address might be new or inactive

### Problem: Can't add address
**Fix:** Verify format (starts with 1, 3, or bc1)

### Problem: Alerts not working
**Fix:** Ensure bell is green, keep tab open

### Problem: Payment flow empty
**Fix:** Try depth 1-2, address might have no history

---

## 💡 Pro Tips

1. **Start with depth 2-3** - Higher values take longer
2. **Enable alerts strategically** - Don't alert on everything
3. **Use meaningful labels** - Future you will thank you
4. **Document everything** - Copy addresses to case notes
5. **Test with known addresses** - Verify system works first
6. **Check multiple times** - Balances update periodically
7. **Use external links** - Verify on blockchain.com
8. **Monitor patterns, not just amounts** - Behavior matters
9. **Save screenshots** - Evidence for court
10. **Export data regularly** - Don't rely on localStorage

---

## 📱 Mobile Testing

The system works on mobile devices:
- Responsive layout stacks vertically
- Touch-friendly buttons
- Scrollable transaction lists
- All features accessible

Test on: Chrome Mobile, Safari iOS, Firefox Android

---

## 🎓 Learning Path

### Beginner (Day 1):
1. Add 1-2 test wallets
2. View transaction history
3. Enable/disable alerts
4. Refresh balances

### Intermediate (Week 1):
1. Monitor 5+ wallets simultaneously
2. Use payment flow tracing (depth 2-3)
3. Analyze transaction patterns
4. Document suspicious activity

### Advanced (Month 1):
1. Track complex money laundering schemes
2. Map entire criminal networks
3. Identify exchange cash-out points
4. Coordinate with law enforcement
5. Generate evidence reports

---

## 📞 Support

If you encounter issues:
1. Check browser console (F12)
2. Verify localStorage data
3. Test with known working address
4. Clear cache and reload
5. Review WALLET-MONITORING-GUIDE.md

---

## ✅ Final Checklist

Before using in real investigation:
- [ ] Tested with sample addresses
- [ ] Verified alerts working
- [ ] Understand payment flow visualization
- [ ] Know how to export/document findings
- [ ] Legal authorization obtained
- [ ] Case number documented
- [ ] Proper operational security measures
- [ ] Backup of all data maintained

---

**Ready to start? Add your first wallet now!** 🚀
