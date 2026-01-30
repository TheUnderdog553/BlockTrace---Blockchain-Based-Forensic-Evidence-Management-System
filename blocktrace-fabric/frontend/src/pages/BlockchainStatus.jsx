import { motion } from 'framer-motion'
import { Server, Activity, CheckCircle, AlertCircle, Database, HardDrive, Network } from 'lucide-react'

export default function BlockchainStatus() {
  const peers = [
    { name: 'Org1 Peer', org: 'ForensicsOrgMSP', status: 'online', address: 'localhost:7051', blocks: 127, uptime: '99.9%' },
    { name: 'Org2 Peer', org: 'PoliceOrgMSP', status: 'online', address: 'localhost:9051', blocks: 127, uptime: '99.8%' },
    { name: 'Org3 Peer', org: 'CourtOrgMSP', status: 'online', address: 'localhost:11051', blocks: 127, uptime: '99.7%' },
  ]

  const channelInfo = {
    name: 'mychannel',
    height: 127,
    chaincode: 'evidence',
    version: '2.0',
    transactions: 342
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-[1600px] mx-auto"
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon to-accent mb-2">
          Blockchain Status
        </h1>
        <p className="text-sm md:text-base text-gray-400">Monitor network health and performance</p>
      </div>

      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Network Status</p>
              <p className="text-2xl font-bold text-success">Active</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-success/20 border border-success/30 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Active Peers</p>
              <p className="text-2xl font-bold text-neon">{peers.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-neon/20 border border-neon/30 flex items-center justify-center">
              <Server className="w-6 h-6 text-neon" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Block Height</p>
              <p className="text-2xl font-bold text-accent">{channelInfo.height}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
              <Database className="w-6 h-6 text-accent" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Channel Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card-hover"
      >
        <h2 className="text-xl font-bold text-gray-100 mb-6 flex items-center">
          <Network className="w-5 h-5 text-neon mr-2" />
          Channel Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-lg bg-abyss/30 border border-neon/10">
            <p className="text-sm text-gray-400 mb-1">Channel Name</p>
            <p className="font-mono text-neon">{channelInfo.name}</p>
          </div>
          <div className="p-4 rounded-lg bg-abyss/30 border border-neon/10">
            <p className="text-sm text-gray-400 mb-1">Block Height</p>
            <p className="font-mono text-gray-100">{channelInfo.height}</p>
          </div>
          <div className="p-4 rounded-lg bg-abyss/30 border border-neon/10">
            <p className="text-sm text-gray-400 mb-1">Chaincode</p>
            <p className="font-mono text-gray-100">{channelInfo.chaincode}</p>
          </div>
          <div className="p-4 rounded-lg bg-abyss/30 border border-neon/10">
            <p className="text-sm text-gray-400 mb-1">Version</p>
            <p className="font-mono text-gray-100">{channelInfo.version}</p>
          </div>
          <div className="p-4 rounded-lg bg-abyss/30 border border-neon/10">
            <p className="text-sm text-gray-400 mb-1">Transactions</p>
            <p className="font-mono text-gray-100">{channelInfo.transactions}</p>
          </div>
        </div>
      </motion.div>

      {/* Peer Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card-hover"
      >
        <h2 className="text-xl font-bold text-gray-100 mb-6 flex items-center">
          <Server className="w-5 h-5 text-accent mr-2" />
          Peer Nodes
        </h2>
        <div className="space-y-4">
          {peers.map((peer, index) => (
            <motion.div
              key={peer.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="p-4 rounded-lg bg-abyss/30 border border-neon/10 hover:border-neon/30 transition-colors"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
                  <div>
                    <p className="font-semibold text-gray-100">{peer.name}</p>
                    <p className="text-sm text-gray-400">{peer.org}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-8">
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm font-mono text-gray-300">{peer.address}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Blocks</p>
                    <p className="text-sm font-mono text-neon">{peer.blocks}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Uptime</p>
                    <p className="text-sm font-mono text-success">{peer.uptime}</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-success/20 border border-success/30">
                    <span className="text-xs font-medium text-success">Online</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Orderer Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card-hover"
      >
        <h2 className="text-xl font-bold text-gray-100 mb-6 flex items-center">
          <Activity className="w-5 h-5 text-warning mr-2" />
          Orderer Node
        </h2>
        <div className="p-4 rounded-lg bg-abyss/30 border border-neon/10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
              <div>
                <p className="font-semibold text-gray-100">Orderer</p>
                <p className="text-sm text-gray-400">OrdererMSP</p>
              </div>
            </div>
            <div className="flex items-center space-x-8">
              <div>
                <p className="text-xs text-gray-500">Address</p>
                <p className="text-sm font-mono text-gray-300">localhost:7050</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Consensus</p>
                <p className="text-sm font-mono text-gray-300">Raft</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">TLS</p>
                <p className="text-sm font-mono text-success">Enabled</p>
              </div>
              <div className="px-3 py-1 rounded-full bg-success/20 border border-success/30">
                <span className="text-xs font-medium text-success">Online</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
