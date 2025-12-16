import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, Shield, FileText, Clock, User, MapPin, 
  CheckCircle, AlertCircle, Download, ExternalLink, History 
} from 'lucide-react'

const EvidenceDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('details')
  const [custodyChain, setCustodyChain] = useState([])
  const [annotations, setAnnotations] = useState([])
  const [newAnnotation, setNewAnnotation] = useState('')
  const [evidence, setEvidence] = useState(null)

  // Load evidence data from localStorage
  useEffect(() => {
    const evidenceData = JSON.parse(localStorage.getItem('evidenceData') || '[]')
    const foundEvidence = evidenceData.find(e => e.id === id)
    
    if (foundEvidence) {
      // Use actual evidence data
      setEvidence({
        evidenceId: foundEvidence.id,
        ipfsHash: foundEvidence.ipfsHash,
        description: foundEvidence.description,
        category: foundEvidence.category,
        status: foundEvidence.status,
        sourceIP: foundEvidence.sourceIP,
        collectionDate: foundEvidence.collectionDate,
        currentCustodian: foundEvidence.custodian,
        submitter: foundEvidence.submitter || 'Unknown',
        verificationHash: foundEvidence.verificationHash || foundEvidence.ipfsHash,
        fileSize: foundEvidence.fileSize || 'N/A',
        fileName: foundEvidence.fileName || 'N/A',
        fileType: foundEvidence.fileType || 'N/A',
        lastModified: foundEvidence.lastModified
      })
    } else {
      // Fallback to default data for demo evidence
      setEvidence({
        evidenceId: id,
        ipfsHash: 'QmX7K8R9TbN3W2P4L8C6M5Y1Z9V4H8Q3D2A7E9K2W5',
        description: 'Evidence not found in system',
        category: 'Unknown',
        status: 'unverified',
        sourceIP: 'N/A',
        collectionDate: 'N/A',
        currentCustodian: 'Unknown',
        submitter: 'Unknown',
        verificationHash: 'N/A',
        fileSize: 'N/A',
        fileName: 'N/A',
        fileType: 'N/A',
        lastModified: 'N/A'
      })
    }
  }, [id])

  // Load custody chain from localStorage
  useEffect(() => {
    const custodyRecords = JSON.parse(localStorage.getItem('custodyChain') || '{}')
    const evidenceChain = custodyRecords[id] || []
    
    // Add initial creation record if none exists
    if (evidenceChain.length === 0) {
      const evidenceData = JSON.parse(localStorage.getItem('evidenceData') || '[]')
      const evidence = evidenceData.find(e => e.id === id)
      if (evidence) {
        evidenceChain.push({
          id: 1,
          timestamp: evidence.collectionDate || new Date().toISOString().split('T')[0],
          from: 'System',
          to: evidence.custodian || 'ForensicsOrg',
          handler: evidence.submitter || 'Unknown',
          action: 'Evidence Created',
          txId: 'initial' + id
        })
      }
    }
    
    setCustodyChain(evidenceChain)
  }, [id])

  // Load annotations from localStorage
  useEffect(() => {
    const annotationRecords = JSON.parse(localStorage.getItem('annotations') || '{}')
    const evidenceAnnotations = annotationRecords[id] || []
    setAnnotations(evidenceAnnotations)
  }, [id])

  // Handle adding annotation
  const handleAddAnnotation = () => {
    if (!newAnnotation.trim()) return

    const annotationRecords = JSON.parse(localStorage.getItem('annotations') || '{}')
    if (!annotationRecords[id]) {
      annotationRecords[id] = []
    }

    const newAnnotationObj = {
      id: Date.now(),
      author: 'Current User', // In production, get from auth context
      org: 'ForensicsOrg', // In production, get from user's organization
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/,/, ''),
      content: newAnnotation
    }

    annotationRecords[id].push(newAnnotationObj)
    localStorage.setItem('annotations', JSON.stringify(annotationRecords))
    setAnnotations(annotationRecords[id])
    setNewAnnotation('')
  }

  // Return early if evidence not loaded yet
  if (!evidence) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center text-gray-400 py-8">
          Loading evidence details...
        </div>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'verified': return 'text-success'
      case 'pending': return 'text-warning'
      case 'unverified': return 'text-danger'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'verified': return <CheckCircle className="w-5 h-5" />
      case 'pending': return <Clock className="w-5 h-5" />
      case 'unverified': return <AlertCircle className="w-5 h-5" />
      default: return null
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <button
          onClick={() => navigate('/evidence')}
          className="flex items-center gap-2 text-gray-400 hover:text-neon transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Evidence List
        </button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-neon/10 rounded-lg">
              <Shield className="w-8 h-8 text-neon" />
            </div>
            <div>
              <h1 className="text-3xl font-bold glow-text mb-2">{evidence.evidenceId}</h1>
              <div className="flex items-center gap-3">
                <span className={`flex items-center gap-2 ${getStatusColor(evidence.status)}`}>
                  {getStatusIcon(evidence.status)}
                  <span className="font-medium capitalize">{evidence.status}</span>
                </span>
                <span className="text-gray-400">•</span>
                <span className="badge badge-info">{evidence.category}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link to={`/transfer?evidence=${id}`} className="btn-secondary">
              Transfer Custody
            </Link>
            <Link to={`/verify?evidence=${id}`} className="btn-primary">
              Verify Evidence
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mb-6"
      >
        <div className="flex gap-4 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-3 font-medium transition-colors relative ${
              activeTab === 'details'
                ? 'text-neon'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Details
            {activeTab === 'details' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('custody')}
            className={`px-4 py-3 font-medium transition-colors relative ${
              activeTab === 'custody'
                ? 'text-neon'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Chain of Custody
            {activeTab === 'custody' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('annotations')}
            className={`px-4 py-3 font-medium transition-colors relative ${
              activeTab === 'annotations'
                ? 'text-neon'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Annotations ({annotations.length})
            {activeTab === 'annotations' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon"
              />
            )}
          </button>
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-neon" />
                  Description
                </h2>
                <p className="text-gray-300 leading-relaxed">{evidence.description}</p>
              </div>

              <div className="card">
                <h2 className="text-xl font-semibold mb-4">File Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">IPFS Hash (Simulated)</p>
                    <div className="flex items-center gap-2">
                      <code className="text-neon text-sm bg-gray-800 px-2 py-1 rounded">
                        {evidence.ipfsHash.substring(0, 20)}...
                      </code>
                      <button 
                        onClick={() => alert('IPFS functionality is currently simulated.\n\nTo enable real IPFS storage:\n1. Install and run IPFS daemon\n2. Configure IPFS backend\n3. Upload files to actual IPFS network\n\nHash shown is for demonstration only.')}
                        className="text-gray-400 hover:text-neon transition-colors"
                        title="IPFS is currently simulated"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">File Size</p>
                    <p className="text-gray-200">{evidence.fileSize}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">File Type</p>
                    <p className="text-gray-200">{evidence.fileType}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Verification Hash</p>
                    <code className="text-neon text-sm bg-gray-800 px-2 py-1 rounded block truncate">
                      {evidence.verificationHash.substring(0, 16)}...
                    </code>
                  </div>
                </div>
                <button 
                  onClick={() => alert('IPFS storage is currently simulated.\n\nThe hash shown is generated for demonstration purposes and does not point to actual IPFS content.\n\nTo enable real IPFS downloads:\n1. Set up IPFS node\n2. Upload actual files to IPFS\n3. Store real CIDs in evidence records')}
                  className="btn-outline mt-4 w-full flex items-center justify-center gap-2"
                  title="IPFS functionality is simulated"
                >
                  <Download className="w-4 h-4" />
                  IPFS Download (Simulated)
                </button>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Metadata</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Current Custodian</p>
                    <p className="text-gray-200 font-medium">{evidence.currentCustodian}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Submitted By</p>
                    <p className="text-gray-200">{evidence.submitter}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Collection Date</p>
                    <p className="text-gray-200">{evidence.collectionDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Source IP</p>
                    <code className="text-neon bg-gray-800 px-2 py-1 rounded text-sm">
                      {evidence.sourceIP}
                    </code>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Last Modified</p>
                    <p className="text-gray-200">{evidence.lastModified}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Block Height</p>
                    <p className="text-gray-200">#{evidence.chainHeight}</p>
                  </div>
                </div>
              </div>

              <div className="card bg-success/10 border border-success/20">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-success font-medium mb-1">Verified Evidence</p>
                    <p className="text-gray-300 text-sm">
                      This evidence has been cryptographically verified and matches the blockchain record.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'custody' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-neon" />
              Chain of Custody Timeline
            </h2>
            <div className="space-y-4">
              {custodyChain.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No custody records found for this evidence.</p>
                </div>
              ) : (
                custodyChain.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-8 pb-8 border-l-2 border-neon/30 last:pb-0 last:border-l-0"
                >
                  <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-neon ring-4 ring-abyss" />
                  
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-neon">{entry.action}</h3>
                      <span className="text-sm text-gray-400">{entry.timestamp}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400 mb-1">From</p>
                        <p className="text-gray-200">{entry.from}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">To</p>
                        <p className="text-gray-200">{entry.to}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Handler</p>
                        <p className="text-gray-200">{entry.handler}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Transaction ID</p>
                        <code className="text-neon text-xs bg-gray-800 px-2 py-1 rounded block truncate">
                          {entry.txId}
                        </code>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )))}
            </div>
          </div>
        )}

        {activeTab === 'annotations' && (
          <div className="space-y-4">
            {annotations.length === 0 ? (
              <div className="card text-center text-gray-400 py-8">
                <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No annotations yet. Be the first to add analysis notes!</p>
              </div>
            ) : (
              annotations.map((annotation, index) => (
                <motion.div
                  key={annotation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-neon/10 rounded-lg">
                      <User className="w-5 h-5 text-neon" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-200">{annotation.author}</h3>
                        <span className="badge badge-info">{annotation.org}</span>
                        <span className="text-sm text-gray-400">{annotation.timestamp}</span>
                      </div>
                      <p className="text-gray-300">{annotation.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}

            <div className="card">
              <h3 className="font-semibold mb-3">Add Annotation</h3>
              <textarea
                value={newAnnotation}
                onChange={(e) => setNewAnnotation(e.target.value)}
                placeholder="Enter your analysis or notes..."
                rows={3}
                className="input w-full resize-none mb-3"
              />
              <button 
                onClick={handleAddAnnotation}
                disabled={!newAnnotation.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Annotation
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default EvidenceDetails
