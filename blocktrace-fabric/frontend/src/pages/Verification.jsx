import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { Shield, Upload, FileText, CheckCircle, XCircle, AlertCircle, Loader, Hash } from 'lucide-react'

const Verification = () => {
  const [searchParams] = useSearchParams()
  const preselectedEvidence = searchParams.get('evidence')

  const [selectedEvidence, setSelectedEvidence] = useState(preselectedEvidence || '')
  const [file, setFile] = useState(null)
  const [verifying, setVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState(null)
  const [calculatedHash, setCalculatedHash] = useState('')
  const [evidenceList, setEvidenceList] = useState([])

  // Default evidence data
  const defaultEvidenceList = [
    { 
      id: 'EV001', 
      description: 'Ransomware executable file',
      ipfsHash: 'QmX7K8R9TbN3W2P4L8C6M5Y1Z9V4H8Q3D2A7E9K2W5',
      verificationHash: 'a8b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7'
    },
    { 
      id: 'EV002', 
      description: 'Ransom note file',
      ipfsHash: 'QmP4N3W2K9L8C6M5Y1Z9V4H8Q3D2A7E9K2W5X7T1B6',
      verificationHash: 'b9c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8'
    },
    { 
      id: 'EV003', 
      description: 'Network traffic capture',
      ipfsHash: 'QmB9T1K5N8P2C6M5Y1Z9V4H8Q3D2A7E9K2W5X7L4M3',
      verificationHash: 'c0d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9'
    }
  ]

  // Load evidence from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('evidenceData')
    if (savedData) {
      const parsed = JSON.parse(savedData)
      // Map to verification format
      const mappedData = parsed.map(e => ({
        id: e.id,
        description: e.description,
        ipfsHash: e.ipfsHash,
        verificationHash: e.verificationHash || e.ipfsHash // Use ipfsHash as fallback
      }))
      // Merge with default, removing duplicates
      const allData = [...mappedData, ...defaultEvidenceList]
      const uniqueData = allData.filter((item, index, self) =>
        index === self.findIndex((t) => t.id === item.id)
      )
      setEvidenceList(uniqueData)
    } else {
      setEvidenceList(defaultEvidenceList)
    }
  }, [])

  const selectedEvidenceData = evidenceList.find(e => e.id === selectedEvidence)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setVerificationResult(null)
      setCalculatedHash('')
    }
  }

  const calculateFileHash = async (file) => {
    // Calculate actual SHA-256 hash of the file
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  }

  const handleVerify = async () => {
    if (!selectedEvidence || !file) {
      return
    }

    setVerifying(true)
    setVerificationResult(null)

    try {
      // Calculate file hash
      const hash = await calculateFileHash(file)
      setCalculatedHash(hash)

      // Compare with blockchain record
      await new Promise(resolve => setTimeout(resolve, 1000))

      const expectedHash = selectedEvidenceData?.verificationHash || selectedEvidenceData?.ipfsHash
      const matches = hash === expectedHash

      // Update evidence status if verification successful
      if (matches) {
        const evidenceData = JSON.parse(localStorage.getItem('evidenceData') || '[]')
        const evidenceIndex = evidenceData.findIndex(e => e.id === selectedEvidence)
        if (evidenceIndex !== -1) {
          evidenceData[evidenceIndex].status = 'verified'
          evidenceData[evidenceIndex].lastModified = new Date().toISOString()
          localStorage.setItem('evidenceData', JSON.stringify(evidenceData))
        }
      }

      setVerificationResult({
        success: matches,
        timestamp: new Date().toISOString(),
        evidenceId: selectedEvidence,
        expectedHash: expectedHash,
        calculatedHash: hash
      })

    } catch (error) {
      console.error('Verification failed:', error)
      setVerificationResult({
        success: false,
        error: 'Verification process failed. Please try again.'
      })
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-neon/10 rounded-lg">
            <Shield className="w-6 h-6 text-neon" />
          </div>
          <h1 className="text-3xl font-bold glow-text">Evidence Verification</h1>
        </div>
        <p className="text-gray-400">
          Verify file integrity by comparing cryptographic hashes with blockchain records
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Input */}
        <div className="space-y-6">
          {/* Select Evidence */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <h2 className="text-xl font-semibold mb-4">Step 1: Select Evidence Record</h2>
            
            <input
              list="evidence-verify-list"
              value={selectedEvidence}
              onChange={(e) => {
                setSelectedEvidence(e.target.value)
                setVerificationResult(null)
                setCalculatedHash('')
              }}
              placeholder="Type or select evidence ID..."
              className="input w-full mb-4"
              disabled={verifying}
            />
            <datalist id="evidence-verify-list">
              {evidenceList.map(evidence => (
                <option key={evidence.id} value={evidence.id}>
                  {evidence.id} - {evidence.description}
                </option>
              ))}
            </datalist>
            <p className="text-gray-500 text-xs mb-4">
              💡 You can type manually or select from the dropdown ({evidenceList.length} items available)
            </p>

            {selectedEvidenceData && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-gray-800/50 rounded-lg p-4 space-y-3"
              >
                <div>
                  <p className="text-gray-400 text-sm mb-1">Evidence ID</p>
                  <p className="text-gray-200 font-medium">{selectedEvidenceData.id}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Description</p>
                  <p className="text-gray-200">{selectedEvidenceData.description}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">IPFS Hash</p>
                  <code className="text-neon text-xs bg-gray-800 px-2 py-1 rounded block break-all">
                    {selectedEvidenceData.ipfsHash}
                  </code>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1 flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    Blockchain Verification Hash
                  </p>
                  <code className="text-neon text-xs bg-gray-800 px-2 py-1 rounded block break-all">
                    {selectedEvidenceData.verificationHash}
                  </code>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Upload File */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <h2 className="text-xl font-semibold mb-4">Step 2: Upload File to Verify</h2>
            
            <div className="border-2 border-dashed border-gray-600 hover:border-neon rounded-lg p-8 text-center transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="verify-file-upload"
                disabled={verifying || !selectedEvidence}
              />
              <label htmlFor="verify-file-upload" className={`cursor-pointer ${!selectedEvidence ? 'opacity-50' : ''}`}>
                {file ? (
                  <div className="space-y-2">
                    <FileText className="w-12 h-12 text-neon mx-auto" />
                    <p className="text-gray-300 font-medium">{file.name}</p>
                    <p className="text-gray-500 text-sm">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {!verifying && (
                      <p className="text-neon text-sm hover:underline">Click to change file</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <p className="text-gray-300">Click to upload file</p>
                    <p className="text-gray-500 text-sm">
                      {selectedEvidence ? 'Select the file to verify' : 'Select evidence record first'}
                    </p>
                  </div>
                )}
              </label>
            </div>
          </motion.div>

          {/* Verify Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={handleVerify}
            disabled={!selectedEvidence || !file || verifying}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {verifying ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Verify Evidence Integrity
              </>
            )}
          </motion.button>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {/* Verification Process */}
          {verifying && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card"
            >
              <h2 className="text-xl font-semibold mb-4">Verification Process</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Loader className="w-5 h-5 text-neon animate-spin" />
                  <div>
                    <p className="text-gray-300 font-medium">Calculating file hash...</p>
                    <p className="text-gray-400 text-sm">Using SHA-256 algorithm</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                  <div>
                    <p className="text-gray-400">Querying blockchain record...</p>
                    <p className="text-gray-500 text-sm">Waiting for hash calculation</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                  <div>
                    <p className="text-gray-400">Comparing hashes...</p>
                    <p className="text-gray-500 text-sm">Pending</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Verification Result */}
          <AnimatePresence mode="wait">
            {verificationResult && (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`card border-2 ${
                  verificationResult.success
                    ? 'bg-success/5 border-success'
                    : 'bg-danger/5 border-danger'
                }`}
              >
                <div className="flex items-start gap-4 mb-4">
                  {verificationResult.success ? (
                    <div className="p-3 bg-success/20 rounded-full">
                      <CheckCircle className="w-8 h-8 text-success" />
                    </div>
                  ) : (
                    <div className="p-3 bg-danger/20 rounded-full">
                      <XCircle className="w-8 h-8 text-danger" />
                    </div>
                  )}
                  <div>
                    <h2 className={`text-2xl font-bold ${
                      verificationResult.success ? 'text-success' : 'text-danger'
                    }`}>
                      {verificationResult.success ? 'Verification Passed' : 'Verification Failed'}
                    </h2>
                    <p className="text-gray-300 mt-1">
                      {verificationResult.success
                        ? 'File integrity confirmed. Hash matches blockchain record.'
                        : 'File has been modified or does not match the blockchain record.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Evidence ID</p>
                    <p className="text-gray-200 font-medium">{verificationResult.evidenceId}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Verification Time</p>
                    <p className="text-gray-200">{new Date(verificationResult.timestamp).toLocaleString()}</p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-1 flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      Expected Hash (Blockchain)
                    </p>
                    <code className={`text-xs px-2 py-1 rounded block break-all ${
                      verificationResult.success ? 'bg-success/10 text-success' : 'bg-gray-800 text-gray-400'
                    }`}>
                      {verificationResult.expectedHash}
                    </code>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-1 flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      Calculated Hash (File)
                    </p>
                    <code className={`text-xs px-2 py-1 rounded block break-all ${
                      verificationResult.success ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                    }`}>
                      {verificationResult.calculatedHash}
                    </code>
                  </div>

                  {!verificationResult.success && (
                    <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-danger font-medium mb-1">Security Alert</p>
                        <p className="text-gray-300">
                          This file may have been tampered with or is not the original evidence file. 
                          Do not use this file for legal proceedings.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info Box */}
          {!verifying && !verificationResult && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="card bg-neon/5 border border-neon/20"
            >
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-neon flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300 font-medium">How Verification Works</p>
                  <ol className="text-gray-400 space-y-1 list-decimal list-inside">
                    <li>Select the evidence record from the blockchain</li>
                    <li>Upload the file you want to verify</li>
                    <li>System calculates SHA-256 hash of the uploaded file</li>
                    <li>Compares calculated hash with blockchain record</li>
                    <li>Displays match/mismatch result</li>
                  </ol>
                  <p className="text-gray-400 mt-3">
                    <strong className="text-gray-300">Note:</strong> If hashes match, the file is 
                    authentic and hasn't been tampered with since submission.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Verification
