import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Download, Eye, AlertCircle, CheckCircle, Clock, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const EvidenceList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Default mock data
  const defaultData = [
    {
      id: 'EV001',
      ipfsHash: 'QmX7K8R9...',
      description: 'Ransomware executable file from infected system',
      category: 'Malware',
      status: 'verified',
      custodian: 'ForensicsOrg',
      collectionDate: '2025-06-15',
      lastModified: '2025-06-15 14:30:22'
    },
    {
      id: 'EV002',
      ipfsHash: 'QmP4N3W2...',
      description: 'Ransom note file recovered from desktop',
      category: 'Ransom Note',
      status: 'pending',
      custodian: 'PoliceOrg',
      collectionDate: '2025-06-14',
      lastModified: '2025-06-16 09:15:10'
    },
    {
      id: 'EV003',
      ipfsHash: 'QmB9T1K5...',
      description: 'Network traffic capture during attack',
      category: 'Network Log',
      status: 'verified',
      custodian: 'ForensicsOrg',
      collectionDate: '2025-06-13',
      lastModified: '2025-06-14 16:42:33'
    },
    {
      id: 'EV004',
      ipfsHash: 'QmL8C6M3...',
      description: 'Full disk image of compromised server',
      category: 'Disk Image',
      status: 'verified',
      custodian: 'CourtOrg',
      collectionDate: '2025-06-12',
      lastModified: '2025-06-13 11:20:45'
    },
    {
      id: 'EV005',
      ipfsHash: 'QmW5Y7N1...',
      description: 'Memory dump from active process',
      category: 'Memory Dump',
      status: 'unverified',
      custodian: 'ForensicsOrg',
      collectionDate: '2025-06-11',
      lastModified: '2025-06-11 18:55:12'
    },
    {
      id: 'EV006',
      ipfsHash: 'QmZ2V4H8...',
      description: 'Browser history and cache data',
      category: 'Network Log',
      status: 'verified',
      custodian: 'PoliceOrg',
      collectionDate: '2025-06-10',
      lastModified: '2025-06-12 08:33:29'
    },
    {
      id: 'EV007',
      ipfsHash: 'QmQ3D9K2...',
      description: 'Email correspondence with attacker',
      category: 'Ransom Note',
      status: 'pending',
      custodian: 'ForensicsOrg',
      collectionDate: '2025-06-09',
      lastModified: '2025-06-10 13:47:55'
    },
    {
      id: 'EV008',
      ipfsHash: 'QmA7E5M9...',
      description: 'Encrypted file samples',
      category: 'Malware',
      status: 'verified',
      custodian: 'CourtOrg',
      collectionDate: '2025-06-08',
      lastModified: '2025-06-09 10:12:18'
    }
  ]

  // Load evidence from localStorage or use default
  const [evidenceData, setEvidenceData] = useState([])

  const loadEvidence = () => {
    const savedData = localStorage.getItem('evidenceData')
    if (savedData) {
      const parsed = JSON.parse(savedData)
      // Merge saved data with default, removing duplicates by ID
      const allData = [...parsed, ...defaultData]
      const uniqueData = allData.filter((item, index, self) =>
        index === self.findIndex((t) => t.id === item.id)
      )
      setEvidenceData(uniqueData)
    } else {
      setEvidenceData(defaultData)
    }
  }

  useEffect(() => {
    loadEvidence()
    
    // Reload when window gets focus (user navigates back)
    const handleFocus = () => {
      loadEvidence()
    }
    
    window.addEventListener('focus', handleFocus)
    
    // Also listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'evidenceData' || !e.key) {
        loadEvidence()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const categories = ['all', 'Malware', 'Ransom Note', 'Network Log', 'Disk Image', 'Memory Dump']
  const statuses = ['all', 'verified', 'pending', 'unverified']

  const filteredEvidence = evidenceData.filter(item => {
    const matchesSearch = item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredEvidence.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentEvidence = filteredEvidence.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteEvidence = (evidenceId) => {
    if (!confirm(`Are you sure you want to delete evidence ${evidenceId}? This action cannot be undone.`)) {
      return
    }

    // Remove from evidenceData
    const evidenceData = JSON.parse(localStorage.getItem('evidenceData') || '[]')
    const updatedEvidence = evidenceData.filter(e => e.id !== evidenceId)
    localStorage.setItem('evidenceData', JSON.stringify(updatedEvidence))

    // Remove from custody chain
    const custodyChain = JSON.parse(localStorage.getItem('custodyChain') || '{}')
    delete custodyChain[evidenceId]
    localStorage.setItem('custodyChain', JSON.stringify(custodyChain))

    // Remove from annotations
    const annotations = JSON.parse(localStorage.getItem('annotations') || '{}')
    delete annotations[evidenceId]
    localStorage.setItem('annotations', JSON.stringify(annotations))

    // Reload evidence list
    loadEvidence()

    toast.success(`Evidence ${evidenceId} deleted successfully`, {
      duration: 3000,
      icon: '🗑️'
    })
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'verified': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'unverified': return <AlertCircle className="w-4 h-4" />
      default: return null
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'verified': return 'badge-success'
      case 'pending': return 'badge-warning'
      case 'unverified': return 'badge-danger'
      default: return 'badge-info'
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold glow-text">Evidence Repository</h1>
          <p className="text-gray-400 mt-1">Manage and track all forensic evidence</p>
        </div>
        <Link to="/upload" className="btn-primary">
          + Upload Evidence
        </Link>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="stat-card">
          <div className="text-2xl font-bold text-neon">{evidenceData.length}</div>
          <div className="text-sm text-gray-400">Total Records</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-success">{evidenceData.filter(e => e.status === 'verified').length}</div>
          <div className="text-sm text-gray-400">Verified</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-warning">{evidenceData.filter(e => e.status === 'pending').length}</div>
          <div className="text-sm text-gray-400">Pending</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-danger">{evidenceData.filter(e => e.status === 'unverified').length}</div>
          <div className="text-sm text-gray-400">Unverified</div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input pl-10 pr-8 cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input pr-8 cursor-pointer"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status === 'all' ? 'All Status' : status}</option>
              ))}
            </select>
          </div>

          {/* Export Button */}
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </motion.div>

      {/* Evidence Table */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {filteredEvidence.length === 0 ? (
          <motion.div variants={item} className="card text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No evidence found matching your filters</p>
          </motion.div>
        ) : (
          currentEvidence.map((evidence) => (
            <motion.div
              key={evidence.id}
              variants={item}
              className="card-hover group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Main Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-neon group-hover:text-cyan-300 transition-colors">
                      {evidence.id}
                    </h3>
                    <span className={`badge ${getStatusColor(evidence.status)} flex items-center gap-1`}>
                      {getStatusIcon(evidence.status)}
                      {evidence.status}
                    </span>
                    <span className="badge badge-info">{evidence.category}</span>
                  </div>
                  <p className="text-gray-300 mb-2 line-clamp-1">{evidence.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    <span>IPFS: {evidence.ipfsHash}</span>
                    <span>•</span>
                    <span>Custodian: {evidence.custodian}</span>
                    <span>•</span>
                    <span>Collected: {evidence.collectionDate}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    to={`/evidence/${evidence.id}`}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Link>
                  <button
                    onClick={() => handleDeleteEvidence(evidence.id)}
                    className="btn-secondary bg-danger/10 hover:bg-danger/20 border-danger/50 text-danger flex items-center gap-2"
                    title="Delete Evidence"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Pagination */}
      {filteredEvidence.length > 0 && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-2 items-center"
        >
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`px-4 py-2 ${
                currentPage === index + 1 ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              {index + 1}
            </button>
          ))}
          
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </motion.div>
      )}
    </div>
  )
}

export default EvidenceList
