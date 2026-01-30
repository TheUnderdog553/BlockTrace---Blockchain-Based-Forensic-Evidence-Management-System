import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle, DollarSign, Server, Plus, Search, Filter, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

function RansomwareTracking() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')

  const [newIncident, setNewIncident] = useState({
    incidentId: '',
    ransomwareFamily: '',
    walletAddresses: '',
    metadata: {
      severity: 'CRITICAL',
      targetedSectors: '',
      ransomNote: '',
      encryptionType: '',
      demandAmount: '',
      demandCurrency: 'BTC'
    }
  })

  useEffect(() => {
    fetchIncidents()
  }, [])

  const fetchIncidents = async () => {
    try {
      setLoading(true)
      // Load from localStorage instead of API
      const savedData = localStorage.getItem('ransomwareIncidents')
      const data = savedData ? JSON.parse(savedData) : []
      setIncidents(data)
    } catch (error) {
      console.error('Error fetching incidents:', error)
      toast.error('Failed to fetch ransomware incidents')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const walletArray = newIncident.walletAddresses
        .split(',')
        .map(w => w.trim())
        .filter(w => w)

      const sectorsArray = newIncident.metadata.targetedSectors
        .split(',')
        .map(s => s.trim())
        .filter(s => s)

      // Save to localStorage
      const savedIncidents = JSON.parse(localStorage.getItem('ransomwareIncidents') || '[]')
      
      const incident = {
        incidentId: newIncident.incidentId,
        ransomwareFamily: newIncident.ransomwareFamily,
        walletAddresses: walletArray,
        status: 'ACTIVE',
        discoveryDate: new Date().toISOString(),
        metadata: {
          ...newIncident.metadata,
          targetedSectors: sectorsArray,
          demandAmount: parseFloat(newIncident.metadata.demandAmount) || 0
        },
        infectedSystems: [],
        paymentTrails: []
      }

      savedIncidents.push(incident)
      localStorage.setItem('ransomwareIncidents', JSON.stringify(savedIncidents))

      toast.success('Ransomware incident registered successfully!')
      setShowModal(false)
      fetchIncidents()
      setNewIncident({
        incidentId: '',
        ransomwareFamily: '',
        walletAddresses: '',
        metadata: {
          severity: 'CRITICAL',
          targetedSectors: '',
          ransomNote: '',
          encryptionType: '',
          demandAmount: '',
          demandCurrency: 'BTC'
        }
      })
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to register incident')
    }
  }

  const getSeverityColor = (severity) => {
    const colors = {
      CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/50',
      HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      LOW: 'bg-blue-500/20 text-blue-400 border-blue-500/50'
    }
    return colors[severity] || colors.CRITICAL
  }

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'bg-red-500/20 text-red-400',
      INVESTIGATING: 'bg-yellow-500/20 text-yellow-400',
      CONTAINED: 'bg-blue-500/20 text-blue-400',
      RESOLVED: 'bg-green-500/20 text-green-400',
      CLOSED: 'bg-gray-500/20 text-gray-400'
    }
    return colors[status] || colors.ACTIVE
  }

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.incidentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.ransomwareFamily.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.walletAddresses?.some(w => w.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterStatus === 'ALL' || incident.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: incidents.length,
    active: incidents.filter(i => i.status === 'ACTIVE').length,
    resolved: incidents.filter(i => i.status === 'RESOLVED').length,
    totalSystems: incidents.reduce((sum, i) => sum + (i.infectedSystems?.length || 0), 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="text-red-500" size={36} />
            Ransomware Traceability
          </h1>
          <p className="text-gray-400 mt-2">Track and investigate ransomware incidents on the blockchain</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-lg font-semibold flex items-center gap-2 hover:from-red-500 hover:to-red-600"
        >
          <Plus size={20} />
          Register Incident
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Incidents', value: stats.total, icon: AlertTriangle, color: 'text-red-500' },
          { label: 'Active Cases', value: stats.active, icon: Shield, color: 'text-orange-500' },
          { label: 'Resolved', value: stats.resolved, icon: Shield, color: 'text-green-500' },
          { label: 'Infected Systems', value: stats.totalSystems, icon: Server, color: 'text-blue-500' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-dark-lighter border border-cyber-blue/20 rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <stat.icon className={stat.color} size={32} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by Incident ID or Ransomware Family..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-dark-lighter border border-cyber-blue/20 rounded-lg focus:outline-none focus:border-cyber-blue"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-3 bg-dark-lighter border border-cyber-blue/20 rounded-lg focus:outline-none focus:border-cyber-blue appearance-none"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="CONTAINED">Contained</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Incidents List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyber-blue border-r-transparent"></div>
          <p className="text-gray-400 mt-4">Loading incidents...</p>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="text-center py-12 bg-dark-lighter border border-cyber-blue/20 rounded-lg">
          <AlertTriangle className="mx-auto text-gray-500" size={48} />
          <p className="text-gray-400 mt-4">No ransomware incidents found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredIncidents.map((incident, index) => (
            <motion.div
              key={incident.incidentId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-dark-lighter border border-cyber-blue/20 rounded-lg p-6 hover:border-cyber-blue/50 transition-all cursor-pointer"
              onClick={() => setSelectedIncident(incident)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{incident.incidentId}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(incident.status)}`}>
                      {incident.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(incident.metadata?.severity)}`}>
                      {incident.metadata?.severity}
                    </span>
                  </div>
                  <p className="text-gray-300 font-semibold">Family: {incident.ransomwareFamily}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                    <div>
                      <p className="text-gray-500">Infected Systems</p>
                      <p className="text-white font-semibold">{incident.infectedSystems?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Wallet Addresses</p>
                      <p className="text-white font-semibold">{incident.walletAddresses?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Payment Trails</p>
                      <p className="text-white font-semibold">{incident.paymentTrail?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Linked Evidence</p>
                      <p className="text-white font-semibold">{incident.evidenceLinks?.length || 0}</p>
                    </div>
                  </div>
                  {incident.metadata?.demandAmount > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-yellow-400">
                      <DollarSign size={16} />
                      <span className="font-semibold">Ransom Demand: {incident.metadata.demandAmount} {incident.metadata.demandCurrency}</span>
                    </div>
                  )}
                </div>
                <ExternalLink className="text-gray-500" size={20} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Register Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-lighter border border-cyber-blue/30 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Register Ransomware Incident</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Incident ID *</label>
                  <input
                    type="text"
                    required
                    value={newIncident.incidentId}
                    onChange={(e) => setNewIncident({ ...newIncident, incidentId: e.target.value })}
                    className="w-full px-4 py-2 bg-dark border border-cyber-blue/20 rounded-lg focus:outline-none focus:border-cyber-blue"
                    placeholder="RW-2026-001"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Ransomware Family *</label>
                  <input
                    type="text"
                    required
                    value={newIncident.ransomwareFamily}
                    onChange={(e) => setNewIncident({ ...newIncident, ransomwareFamily: e.target.value })}
                    className="w-full px-4 py-2 bg-dark border border-cyber-blue/20 rounded-lg focus:outline-none focus:border-cyber-blue"
                    placeholder="LockBit, REvil, etc."
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Wallet Addresses (comma-separated)</label>
                <input
                  type="text"
                  value={newIncident.walletAddresses}
                  onChange={(e) => setNewIncident({ ...newIncident, walletAddresses: e.target.value })}
                  className="w-full px-4 py-2 bg-dark border border-cyber-blue/20 rounded-lg focus:outline-none focus:border-cyber-blue"
                  placeholder="1A2B3C..., 4D5E6F..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Severity</label>
                  <select
                    value={newIncident.metadata.severity}
                    onChange={(e) => setNewIncident({ ...newIncident, metadata: { ...newIncident.metadata, severity: e.target.value }})}
                    className="w-full px-4 py-2 bg-dark border border-cyber-blue/20 rounded-lg focus:outline-none focus:border-cyber-blue"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Encryption Type</label>
                  <input
                    type="text"
                    value={newIncident.metadata.encryptionType}
                    onChange={(e) => setNewIncident({ ...newIncident, metadata: { ...newIncident.metadata, encryptionType: e.target.value }})}
                    className="w-full px-4 py-2 bg-dark border border-cyber-blue/20 rounded-lg focus:outline-none focus:border-cyber-blue"
                    placeholder="AES-256, RSA-2048"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-gray-300 mb-2">Ransom Demand Amount</label>
                  <input
                    type="number"
                    step="0.00000001"
                    value={newIncident.metadata.demandAmount}
                    onChange={(e) => setNewIncident({ ...newIncident, metadata: { ...newIncident.metadata, demandAmount: e.target.value }})}
                    className="w-full px-4 py-2 bg-dark border border-cyber-blue/20 rounded-lg focus:outline-none focus:border-cyber-blue"
                    placeholder="5.5"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Currency</label>
                  <select
                    value={newIncident.metadata.demandCurrency}
                    onChange={(e) => setNewIncident({ ...newIncident, metadata: { ...newIncident.metadata, demandCurrency: e.target.value }})}
                    className="w-full px-4 py-2 bg-dark border border-cyber-blue/20 rounded-lg focus:outline-none focus:border-cyber-blue"
                  >
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                    <option value="XMR">XMR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Targeted Sectors (comma-separated)</label>
                <input
                  type="text"
                  value={newIncident.metadata.targetedSectors}
                  onChange={(e) => setNewIncident({ ...newIncident, metadata: { ...newIncident.metadata, targetedSectors: e.target.value }})}
                  className="w-full px-4 py-2 bg-dark border border-cyber-blue/20 rounded-lg focus:outline-none focus:border-cyber-blue"
                  placeholder="Healthcare, Finance, Government"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Ransom Note</label>
                <textarea
                  value={newIncident.metadata.ransomNote}
                  onChange={(e) => setNewIncident({ ...newIncident, metadata: { ...newIncident.metadata, ransomNote: e.target.value }})}
                  className="w-full px-4 py-2 bg-dark border border-cyber-blue/20 rounded-lg focus:outline-none focus:border-cyber-blue"
                  rows="3"
                  placeholder="Content of the ransom note..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-lg font-semibold hover:from-red-500 hover:to-red-600"
                >
                  Register Incident
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setSelectedIncident(null)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-lighter border border-cyber-blue/30 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedIncident.incidentId}</h2>
                <p className="text-gray-400">Family: {selectedIncident.ransomwareFamily}</p>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Wallet Addresses */}
              {selectedIncident.walletAddresses?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Wallet Addresses</h3>
                  <div className="space-y-2">
                    {selectedIncident.walletAddresses.map((wallet, i) => (
                      <div key={i} className="bg-dark p-3 rounded-lg font-mono text-sm text-cyan-400">
                        {wallet}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Infected Systems */}
              {selectedIncident.infectedSystems?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Infected Systems ({selectedIncident.infectedSystems.length})</h3>
                  <div className="space-y-2">
                    {selectedIncident.infectedSystems.map((system, i) => (
                      <div key={i} className="bg-dark p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="text-gray-500">Hostname:</span> <span className="text-white">{system.hostname}</span></div>
                          <div><span className="text-gray-500">IP:</span> <span className="text-white">{system.ipAddress}</span></div>
                          <div><span className="text-gray-500">OS:</span> <span className="text-white">{system.osVersion}</span></div>
                          <div><span className="text-gray-500">Status:</span> <span className="text-white">{system.recoveryStatus}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Trail */}
              {selectedIncident.paymentTrail?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Payment Trail</h3>
                  <div className="space-y-2">
                    {selectedIncident.paymentTrail.map((payment, i) => (
                      <div key={i} className="bg-dark p-4 rounded-lg">
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Amount:</span>
                            <span className="text-yellow-400 font-semibold">{payment.amount} {payment.currency}</span>
                          </div>
                          <div className="font-mono text-xs text-cyan-400">TX: {payment.transactionHash}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              {selectedIncident.timeline?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Timeline</h3>
                  <div className="space-y-2">
                    {selectedIncident.timeline.slice(-5).reverse().map((event, i) => (
                      <div key={i} className="bg-dark p-3 rounded-lg text-sm">
                        <div className="flex justify-between">
                          <span className="text-white font-semibold">{event.action}</span>
                          <span className="text-gray-500">{new Date(event.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default RansomwareTracking
