import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wallet, Plus, Trash2, RefreshCw, Eye, Bell, 
  TrendingUp, TrendingDown, Activity, Clock, 
  AlertCircle, CheckCircle, Search, ExternalLink 
} from 'lucide-react'
import toast from 'react-hot-toast'
import { 
  getWalletBalance, 
  getWalletTransactions, 
  isValidBitcoinAddress,
  startWalletMonitoring 
} from '../services/blockchainAPI'

const WalletMonitoring = () => {
  const [watchlist, setWatchlist] = useState([])
  const [newAddress, setNewAddress] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [alerts, setAlerts] = useState([])

  // Load watchlist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('walletWatchlist')
    if (saved) {
      setWatchlist(JSON.parse(saved))
    }

    // Load alerts
    const savedAlerts = localStorage.getItem('walletAlerts')
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts))
    }
  }, [])

  // Save watchlist to localStorage
  useEffect(() => {
    if (watchlist.length > 0) {
      localStorage.setItem('walletWatchlist', JSON.stringify(watchlist))
    }
  }, [watchlist])

  // Auto-refresh wallet balances
  useEffect(() => {
    if (!autoRefresh || watchlist.length === 0) return

    const interval = setInterval(() => {
      refreshAllWallets()
    }, 60000) // Refresh every minute

    return () => clearInterval(interval)
  }, [autoRefresh, watchlist])

  // Monitor wallets for activity
  useEffect(() => {
    if (watchlist.length === 0) return

    const cleanupFunctions = []

    watchlist.forEach(wallet => {
      if (wallet.alertEnabled) {
        const cleanup = startWalletMonitoring(
          wallet.address,
          (data) => handleWalletActivity(wallet, data),
          120000 // Check every 2 minutes
        )
        cleanupFunctions.push(cleanup)
      }
    })

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup())
    }
  }, [watchlist])

  const handleWalletActivity = (wallet, data) => {
    const alert = {
      id: Date.now(),
      walletLabel: wallet.label,
      address: wallet.address,
      message: `${data.newTransactions} new transaction(s) detected`,
      balance: data.balance,
      timestamp: data.timestamp,
      read: false
    }

    setAlerts(prev => {
      const updated = [alert, ...prev].slice(0, 50) // Keep last 50 alerts
      localStorage.setItem('walletAlerts', JSON.stringify(updated))
      return updated
    })

    toast.success(`Activity detected on ${wallet.label}!`, {
      icon: '🔔',
      duration: 5000
    })
  }

  const addToWatchlist = async () => {
    if (!newAddress.trim()) {
      toast.error('Please enter a wallet address')
      return
    }

    if (!isValidBitcoinAddress(newAddress)) {
      toast.error('Invalid Bitcoin address format')
      return
    }

    if (watchlist.some(w => w.address === newAddress)) {
      toast.error('Address already in watchlist')
      return
    }

    setLoading(true)
    try {
      const data = await getWalletBalance(newAddress)
      
      const wallet = {
        id: Date.now(),
        address: newAddress,
        label: newLabel || `Wallet ${watchlist.length + 1}`,
        ...data,
        alertEnabled: true,
        addedAt: new Date().toISOString()
      }

      setWatchlist(prev => [...prev, wallet])
      setNewAddress('')
      setNewLabel('')
      
      toast.success(`${wallet.label} added to watchlist ${data.isMockData ? '(using demo data)' : ''}`)
    } catch (error) {
      toast.error('Failed to add wallet')
    } finally {
      setLoading(false)
    }
  }

  const removeFromWatchlist = (id) => {
    setWatchlist(prev => prev.filter(w => w.id !== id))
    if (selectedWallet?.id === id) {
      setSelectedWallet(null)
      setTransactions([])
    }
    toast.success('Wallet removed from watchlist')
  }

  const refreshWallet = async (wallet) => {
    setLoading(true)
    try {
      const data = await getWalletBalance(wallet.address)
      
      setWatchlist(prev => prev.map(w => 
        w.id === wallet.id 
          ? { ...w, ...data }
          : w
      ))
      
      toast.success(`${wallet.label} refreshed`)
    } catch (error) {
      toast.error('Failed to refresh wallet')
    } finally {
      setLoading(false)
    }
  }

  const refreshAllWallets = async () => {
    setLoading(true)
    try {
      const updates = await Promise.all(
        watchlist.map(wallet => getWalletBalance(wallet.address))
      )
      
      setWatchlist(prev => prev.map((wallet, index) => ({
        ...wallet,
        ...updates[index]
      })))
      
    } catch (error) {
      console.error('Failed to refresh all wallets:', error)
    } finally {
      setLoading(false)
    }
  }

  const viewTransactions = async (wallet) => {
    setSelectedWallet(wallet)
    setLoading(true)
    try {
      const txs = await getWalletTransactions(wallet.address, 20)
      setTransactions(txs)
    } catch (error) {
      toast.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const toggleAlert = (id) => {
    setWatchlist(prev => prev.map(w => 
      w.id === id 
        ? { ...w, alertEnabled: !w.alertEnabled }
        : w
    ))
  }

  const markAlertAsRead = (alertId) => {
    setAlerts(prev => {
      const updated = prev.map(a => 
        a.id === alertId ? { ...a, read: true } : a
      )
      localStorage.setItem('walletAlerts', JSON.stringify(updated))
      return updated
    })
  }

  const clearAllAlerts = () => {
    setAlerts([])
    localStorage.removeItem('walletAlerts')
    toast.success('All alerts cleared')
  }

  const filteredWatchlist = watchlist.filter(wallet =>
    wallet.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wallet.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const unreadAlerts = alerts.filter(a => !a.read).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Wallet Monitoring</h1>
                <p className="text-gray-400">Track cryptocurrency wallets in real-time</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshAllWallets}
                disabled={loading || watchlist.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh All</span>
              </button>
              
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  autoRefresh 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>{autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Monitored Wallets</p>
                  <p className="text-2xl font-bold text-white">{watchlist.length}</p>
                </div>
                <Wallet className="w-8 h-8 text-purple-400" />
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Balance</p>
                  <p className="text-2xl font-bold text-white">
                    {watchlist.reduce((sum, w) => sum + (w.balance || 0), 0).toFixed(4)} BTC
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Alerts</p>
                  <p className="text-2xl font-bold text-white">
                    {watchlist.filter(w => w.alertEnabled).length}
                  </p>
                </div>
                <Bell className="w-8 h-8 text-yellow-400" />
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Unread Notifications</p>
                  <p className="text-2xl font-bold text-white">{unreadAlerts}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Add Wallet & Watchlist */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Wallet Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Add Wallet to Watchlist
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bitcoin Address *
                  </label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Suspect Wallet, Exchange Address, etc."
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={addToWatchlist}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Add to Watchlist</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Watchlist */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Watchlist</h2>
                
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search wallets..."
                    className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredWatchlist.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No wallets in watchlist</p>
                    <p className="text-sm">Add a Bitcoin address to start monitoring</p>
                  </div>
                ) : (
                  filteredWatchlist.map((wallet) => (
                    <motion.div
                      key={wallet.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`bg-slate-700/50 border rounded-lg p-4 hover:border-purple-500 transition-all ${
                        selectedWallet?.id === wallet.id 
                          ? 'border-purple-500 ring-2 ring-purple-500/50' 
                          : 'border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-white">{wallet.label}</h3>
                            {wallet.alertEnabled && (
                              <Bell className="w-4 h-4 text-green-400" />
                            )}
                            {wallet.isMockData && (
                              <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-0.5 rounded">
                                DEMO
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 font-mono break-all">
                            {wallet.address}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-gray-400">Balance</p>
                          <p className="text-lg font-bold text-white">
                            {wallet.balance?.toFixed(8) || '0.00000000'} BTC
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Transactions</p>
                          <p className="text-lg font-bold text-white">
                            {wallet.txCount || 0}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewTransactions(wallet)}
                          className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center justify-center space-x-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Txs</span>
                        </button>
                        
                        <button
                          onClick={() => refreshWallet(wallet)}
                          disabled={loading}
                          className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        
                        <button
                          onClick={() => toggleAlert(wallet.id)}
                          className={`px-3 py-1.5 text-sm rounded ${
                            wallet.alertEnabled
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-600 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => removeFromWatchlist(wallet.id)}
                          className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        Last updated: {new Date(wallet.lastUpdated).toLocaleString()}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Transactions & Alerts */}
          <div className="space-y-6">
            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Transactions
              </h2>

              {selectedWallet ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  <p className="text-sm text-gray-400 mb-3">
                    Showing transactions for: <span className="text-white font-semibold">{selectedWallet.label}</span>
                  </p>
                  
                  {transactions.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">No transactions found</p>
                  ) : (
                    transactions.map((tx, index) => (
                      <div
                        key={index}
                        className="bg-slate-700/50 border border-slate-600 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {tx.amount > 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-400" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-400" />
                            )}
                            <span className={`font-semibold ${
                              tx.amount > 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(8)} BTC
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            tx.confirmations === 'Confirmed'
                              ? 'bg-green-600/20 text-green-400'
                              : 'bg-yellow-600/20 text-yellow-400'
                          }`}>
                            {tx.confirmations}
                          </span>
                        </div>

                        <p className="text-xs text-gray-400 font-mono mb-1 truncate">
                          {tx.hash}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(tx.time).toLocaleString()}
                          </span>
                          <span>Fee: {tx.fee?.toFixed(6)} BTC</span>
                        </div>
                        
                        {tx.isMockData && (
                          <span className="inline-block mt-2 text-xs bg-yellow-600/20 text-yellow-400 px-2 py-0.5 rounded">
                            Demo Data
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Select a wallet to view transactions</p>
                </div>
              )}
            </motion.div>

            {/* Alerts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Activity Alerts
                  {unreadAlerts > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">
                      {unreadAlerts}
                    </span>
                  )}
                </h2>
                
                {alerts.length > 0 && (
                  <button
                    onClick={clearAllAlerts}
                    className="text-sm text-gray-400 hover:text-white"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No alerts yet</p>
                    <p className="text-sm">Enable alerts on wallets to get notified</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`border rounded-lg p-3 cursor-pointer hover:border-purple-500 transition-all ${
                        alert.read 
                          ? 'bg-slate-700/30 border-slate-600' 
                          : 'bg-purple-900/20 border-purple-500/50'
                      }`}
                      onClick={() => markAlertAsRead(alert.id)}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-semibold text-white text-sm">
                          {alert.walletLabel}
                        </p>
                        {!alert.read && (
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 mb-1">{alert.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WalletMonitoring
