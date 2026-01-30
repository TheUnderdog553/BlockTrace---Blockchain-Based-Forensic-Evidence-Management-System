import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GitBranch, ArrowRight, ExternalLink, TrendingUp, AlertCircle, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import { tracePaymentFlow } from '../services/blockchainAPI'

const PaymentFlowVisualization = () => {
  const [startAddress, setStartAddress] = useState('')
  const [depth, setDepth] = useState(2)
  const [flowData, setFlowData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedNode, setSelectedNode] = useState(null)

  const traceFlow = async () => {
    if (!startAddress.trim()) {
      toast.error('Please enter a starting address')
      return
    }

    setLoading(true)
    try {
      const data = await tracePaymentFlow(startAddress, depth)
      setFlowData(data)
      
      if (data.nodes.length === 0) {
        toast.error('No payment flow found')
      } else {
        toast.success(`Found ${data.nodes.length} connected addresses`)
      }
    } catch (error) {
      toast.error('Failed to trace payment flow')
    } finally {
      setLoading(false)
    }
  }

  const getNodeConnections = (address) => {
    if (!flowData) return { incoming: [], outgoing: [] }
    
    const incoming = flowData.edges.filter(e => e.to === address)
    const outgoing = flowData.edges.filter(e => e.from === address)
    
    return { incoming, outgoing }
  }

  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 8)}...${address.slice(-6)}`
  }

  const getTotalFlow = (address) => {
    const { incoming, outgoing } = getNodeConnections(address)
    const totalIn = incoming.reduce((sum, e) => sum + e.amount, 0)
    const totalOut = outgoing.reduce((sum, e) => sum + e.amount, 0)
    return { totalIn, totalOut }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl">
              <GitBranch className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Payment Flow Visualization</h1>
              <p className="text-gray-400">Trace cryptocurrency transactions across multiple addresses</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">Trace Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Starting Address *
                  </label>
                  <input
                    type="text"
                    value={startAddress}
                    onChange={(e) => setStartAddress(e.target.value)}
                    placeholder="Enter Bitcoin address"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Trace Depth: {depth}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={depth}
                    onChange={(e) => setDepth(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1 hop</span>
                    <span>5 hops</span>
                  </div>
                </div>

                <button
                  onClick={traceFlow}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Tracing...</span>
                    </>
                  ) : (
                    <>
                      <GitBranch className="w-5 h-5" />
                      <span>Trace Flow</span>
                    </>
                  )}
                </button>
              </div>

              {flowData && (
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <h3 className="text-sm font-semibold text-white mb-3">Flow Statistics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Addresses Found</span>
                      <span className="text-white font-semibold">{flowData.nodes.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Connections</span>
                      <span className="text-white font-semibold">{flowData.edges.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Volume</span>
                      <span className="text-white font-semibold">
                        {flowData.edges.reduce((sum, e) => sum + e.amount, 0).toFixed(4)} BTC
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-300">
                    <p className="font-semibold mb-1">How it works</p>
                    <p className="text-xs">
                      This tool traces payment flows by analyzing transaction history.
                      Higher depth values explore more connections but take longer to process.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Visualization Area */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">Payment Flow Network</h2>

              {!flowData ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <GitBranch className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg">Enter an address to trace payment flow</p>
                  <p className="text-sm mt-2">Visualize cryptocurrency transactions across the network</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Address List */}
                  <div className="max-h-[600px] overflow-y-auto space-y-3">
                    {flowData.nodes.map((address, index) => {
                      const { incoming, outgoing } = getNodeConnections(address)
                      const { totalIn, totalOut } = getTotalFlow(address)
                      const isStart = address === startAddress

                      return (
                        <motion.div
                          key={address}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedNode === address
                              ? 'border-purple-500 bg-slate-700/50'
                              : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                          }`}
                          onClick={() => setSelectedNode(selectedNode === address ? null : address)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="font-mono text-sm text-white">{formatAddress(address)}</p>
                                {isStart && (
                                  <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-xs rounded">
                                    START
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 font-mono break-all">{address}</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(`https://blockchain.com/btc/address/${address}`, '_blank')
                              }}
                              className="text-gray-400 hover:text-white"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="bg-green-900/20 border border-green-500/30 rounded p-2">
                              <p className="text-xs text-green-400 mb-1">Incoming</p>
                              <p className="text-sm font-bold text-white">{totalIn.toFixed(4)} BTC</p>
                              <p className="text-xs text-gray-400">{incoming.length} tx</p>
                            </div>
                            <div className="bg-red-900/20 border border-red-500/30 rounded p-2">
                              <p className="text-xs text-red-400 mb-1">Outgoing</p>
                              <p className="text-sm font-bold text-white">{totalOut.toFixed(4)} BTC</p>
                              <p className="text-xs text-gray-400">{outgoing.length} tx</p>
                            </div>
                          </div>

                          {/* Show connections when selected */}
                          {selectedNode === address && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="pt-3 border-t border-slate-600"
                            >
                              {incoming.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-xs font-semibold text-green-400 mb-2">Incoming Payments</p>
                                  {incoming.map((edge, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs text-gray-300 mb-1">
                                      <span className="font-mono">{formatAddress(edge.from)}</span>
                                      <ArrowRight className="w-3 h-3 mx-1 text-green-400" />
                                      <span className="font-semibold">{edge.amount.toFixed(4)} BTC</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {outgoing.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-red-400 mb-2">Outgoing Payments</p>
                                  {outgoing.map((edge, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs text-gray-300 mb-1">
                                      <span className="font-semibold">{edge.amount.toFixed(4)} BTC</span>
                                      <ArrowRight className="w-3 h-3 mx-1 text-red-400" />
                                      <span className="font-mono">{formatAddress(edge.to)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Flow Summary */}
                  <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-white mb-3">Flow Summary</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Network Size</p>
                        <p className="text-lg font-bold text-white">{flowData.nodes.length}</p>
                        <p className="text-xs text-gray-400">addresses</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Connections</p>
                        <p className="text-lg font-bold text-white">{flowData.edges.length}</p>
                        <p className="text-xs text-gray-400">transactions</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Total Flow</p>
                        <p className="text-lg font-bold text-white">
                          {flowData.edges.reduce((sum, e) => sum + e.amount, 0).toFixed(4)}
                        </p>
                        <p className="text-xs text-gray-400">BTC</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentFlowVisualization
