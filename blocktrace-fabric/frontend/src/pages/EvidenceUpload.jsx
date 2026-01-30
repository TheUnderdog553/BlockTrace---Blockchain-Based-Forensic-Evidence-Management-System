import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, Shield, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const EvidenceUpload = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    evidenceId: '',
    description: '',
    category: 'Malware',
    sourceIP: '',
    collectionDate: new Date().toISOString().split('T')[0],
    submitterName: ''
  })
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [ipfsHash, setIpfsHash] = useState('')
  const [fileHash, setFileHash] = useState('')
  const [errors, setErrors] = useState({})

  const categories = ['Malware', 'Ransom Note', 'Network Log', 'Disk Image', 'Memory Dump', 'Email', 'Other']

  const normalizeEvidenceId = (id) => id.trim().toUpperCase()

  const getHashRegistry = () => {
    try {
      return JSON.parse(localStorage.getItem('evidenceHashIndex') || '{}')
    } catch {
      return {}
    }
  }

  const setHashRegistry = (registry) => {
    localStorage.setItem('evidenceHashIndex', JSON.stringify(registry))
  }

  const seedHashRegistryFromEvidence = () => {
    const savedEvidence = JSON.parse(localStorage.getItem('evidenceData') || '[]')
    if (!savedEvidence.length) return

    const registry = getHashRegistry()
    let changed = false

    savedEvidence.forEach((item) => {
      const normalizedId = normalizeEvidenceId(item.id || '')
      if (normalizedId && item.verificationHash && registry[normalizedId] !== item.verificationHash) {
        registry[normalizedId] = item.verificationHash
        changed = true
      }
    })

    if (changed) {
      setHashRegistry(registry)
    }
  }

  useEffect(() => {
    seedHashRegistryFromEvidence()
  }, [])

  // Calculate SHA-256 hash of file
  const calculateFileHash = async (file) => {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  }

  // Verify if file matches existing evidence
  const verifyFileIntegrity = async (file, evidenceId) => {
    const savedEvidence = JSON.parse(localStorage.getItem('evidenceData') || '[]')
    const existingEvidence = savedEvidence.find(e => e.id === evidenceId)
    
    console.log('🔍 Verifying file integrity for:', evidenceId)
    console.log('📋 Existing evidence:', existingEvidence)
    
    if (existingEvidence && existingEvidence.verificationHash) {
      const currentHash = await calculateFileHash(file)
      
      console.log('🔐 Stored hash:', existingEvidence.verificationHash)
      console.log('🔐 Current hash:', currentHash)
      console.log('✅ Hashes match:', currentHash === existingEvidence.verificationHash)
      
      if (currentHash !== existingEvidence.verificationHash) {
        return {
          isValid: false,
          message: `File hash mismatch! This file has been modified or is not the original evidence.`,
          expectedHash: existingEvidence.verificationHash,
          actualHash: currentHash
        }
      }
      
      return {
        isValid: true,
        message: 'File integrity verified successfully',
        hash: currentHash
      }
    }
    
    // New evidence - calculate hash
    console.log('✨ New evidence - calculating hash')
    const hash = await calculateFileHash(file)
    console.log('🔐 New hash:', hash)
    return {
      isValid: true,
      message: 'New evidence file',
      hash: hash
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    const nextValue = name === 'evidenceId' ? normalizeEvidenceId(value) : value
    setFormData(prev => ({ ...prev, [name]: nextValue }))
    
    // Check if evidence ID already exists
    if (name === 'evidenceId' && value) {
      const savedEvidence = JSON.parse(localStorage.getItem('evidenceData') || '[]')
      const existing = savedEvidence.find(ev => ev.id === value)
      if (existing && existing.verificationHash) {
        console.log('⚠️ Evidence ID exists - file verification will be required')
      }
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // Validate file size (max 100MB)
      if (selectedFile.size > 100 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, file: 'File size must be less than 100MB' }))
        return
      }
      setFile(selectedFile)
      setErrors(prev => ({ ...prev, file: '' }))
      
      // Calculate and store file hash
      try {
        const hash = await calculateFileHash(selectedFile)
        setFileHash(hash)
      } catch (error) {
        console.error('Error calculating file hash:', error)
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}

    const normalizedEvidenceId = normalizeEvidenceId(formData.evidenceId)

    if (!normalizedEvidenceId) {
      newErrors.evidenceId = 'Evidence ID is required'
    } else if (!/^EV\d{3,}$/.test(normalizedEvidenceId)) {
      newErrors.evidenceId = 'Evidence ID must be in format EV001, EV002, etc.'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }

    if (!formData.sourceIP.trim()) {
      newErrors.sourceIP = 'Source IP is required'
    } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(formData.sourceIP)) {
      newErrors.sourceIP = 'Invalid IP address format'
    }

    if (!formData.submitterName.trim()) {
      newErrors.submitterName = 'Your name is required'
    } else if (formData.submitterName.length < 3) {
      newErrors.submitterName = 'Name must be at least 3 characters'
    }

    if (!file) {
      newErrors.file = 'Please select a file to upload'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const simulateUpload = async () => {
    // Simulate IPFS upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setUploadProgress(i)
    }
    // Simulate IPFS hash generation
    const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
    return mockHash
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const normalizedId = normalizeEvidenceId(formData.evidenceId)
      const savedEvidence = JSON.parse(localStorage.getItem('evidenceData') || '[]')

      // Calculate current file hash
      const currentFileHash = await calculateFileHash(file)
      
      console.log('🔍 VERIFICATION CHECK')
      console.log('Evidence ID:', normalizedId)
      console.log('Current file hash:', currentFileHash)
      console.log('All saved evidence IDs:', savedEvidence.map(e => e.id))
      console.log('All saved evidence (full):', savedEvidence)
      console.log('Normalized saved IDs:', savedEvidence.map(e => normalizeEvidenceId(e.id || '')))

      // Use dedicated registry for verification
      const hashRegistry = getHashRegistry()
      console.log('Hash registry:', hashRegistry)
      console.log('Registry has this ID?', normalizedId in hashRegistry)
      
      const existingEvidence = savedEvidence.find(e => {
        const savedNormalized = normalizeEvidenceId(e.id || '')
        console.log(`  Comparing: "${savedNormalized}" === "${normalizedId}" ? ${savedNormalized === normalizedId}`)
        return savedNormalized === normalizedId
      })
      console.log('Found existing evidence?', !!existingEvidence)
      console.log('Existing has verificationHash?', existingEvidence?.verificationHash)
      
      const storedHash = hashRegistry[normalizedId] || existingEvidence?.verificationHash
      console.log('Stored hash to compare:', storedHash)
      console.log('Hashes match?', currentFileHash === storedHash)

      if (existingEvidence?.verificationHash && !hashRegistry[normalizedId]) {
        console.log('💾 Backfilling registry with existing hash')
        setHashRegistry({ ...hashRegistry, [normalizedId]: existingEvidence.verificationHash })
      }

      if (storedHash && currentFileHash !== storedHash) {
        setUploading(false)
        setErrors({
          file: 'File hash mismatch! This is not the original evidence file.',
          hashMismatch: true
        })

        toast.error('⚠️ INCORRECT EVIDENCE FILE!', {
          duration: 6000,
          style: {
            background: '#991b1b',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '16px'
          }
        })

        toast.error(`Expected: ${storedHash.substring(0, 20)}...`, {
          duration: 5000,
          style: { background: '#7f1d1d', color: '#fff' }
        })

        toast.error(`Got: ${currentFileHash.substring(0, 20)}...`, {
          duration: 5000,
          style: { background: '#7f1d1d', color: '#fff' }
        })

        return
      }

      const isReUpload = !!storedHash

      // Simulate file upload to IPFS
      const generatedHash = await simulateUpload()
      setIpfsHash(generatedHash)

      const existingIndex = savedEvidence.findIndex(e => normalizeEvidenceId(e.id || '') === normalizedId)

      // Save to localStorage (simulating database)
      const newEvidence = {
        id: normalizedId,
        ipfsHash: generatedHash,
        verificationHash: currentFileHash,
        description: formData.description,
        category: formData.category,
        status: isReUpload ? 'verified' : 'uploaded',
        custodian: 'ForensicsOrg',
        submitter: formData.submitterName,
        sourceIP: formData.sourceIP,
        collectionDate: formData.collectionDate,
        lastModified: new Date().toISOString(),
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        integrityVerified: isReUpload
      }
      
      if (existingIndex !== -1) {
        savedEvidence[existingIndex] = newEvidence
      } else {
        savedEvidence.push(newEvidence)
      }
      
      localStorage.setItem('evidenceData', JSON.stringify(savedEvidence))

      // Update hash registry after successful save
      const updatedRegistry = { ...hashRegistry, [normalizedId]: currentFileHash }
      setHashRegistry(updatedRegistry)

      // Add notification to bell icon
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]')
      const newNotification = {
        id: Date.now(),
        type: 'success',
        title: 'Evidence Uploaded',
        message: `${formData.evidenceId} has been uploaded successfully`,
        time: 'Just now',
        unread: true
      }
      notifications.unshift(newNotification)
      localStorage.setItem('notifications', JSON.stringify(notifications))
      window.dispatchEvent(new Event('notificationUpdate'))

      // Show success toast notification
      toast.success(`Evidence ${formData.evidenceId} uploaded successfully!`, {
        duration: 4000,
        icon: '\u2705'
      })

      // Success - navigate to evidence list
      setTimeout(() => {
        navigate('/evidence')
      }, 1500)
    } catch (error) {
      console.error('Upload failed:', error)
      setErrors({ submit: 'Failed to upload evidence. Please try again.' })
      setUploading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-neon" />
          <h1 className="text-3xl font-bold glow-text">Upload Evidence</h1>
        </div>
        <p className="text-gray-400">
          Submit forensic evidence to the blockchain with tamper-proof storage
        </p>
      </motion.div>

      {/* Upload Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="card space-y-6"
      >
        {/* Evidence ID */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Evidence ID <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="evidenceId"
            value={formData.evidenceId}
            onChange={handleInputChange}
            placeholder="EV001"
            className={`input w-full ${errors.evidenceId ? 'border-danger' : ''}`}
            disabled={uploading}
          />
          {errors.evidenceId && (
            <p className="text-danger text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.evidenceId}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description <span className="text-danger">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Detailed description of the evidence..."
            rows={4}
            className={`input w-full resize-none ${errors.description ? 'border-danger' : ''}`}
            disabled={uploading}
          />
          {errors.description && (
            <p className="text-danger text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.description}
            </p>
          )}
          <p className="text-gray-500 text-sm mt-1">
            {formData.description.length} characters (minimum 10)
          </p>
        </div>

        {/* Category and Source IP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category <span className="text-danger">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="input w-full cursor-pointer"
              disabled={uploading}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Source IP Address <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="sourceIP"
              value={formData.sourceIP}
              onChange={handleInputChange}
              placeholder="192.168.1.100"
              className={`input w-full ${errors.sourceIP ? 'border-danger' : ''}`}
              disabled={uploading}
            />
            {errors.sourceIP && (
              <p className="text-danger text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.sourceIP}
              </p>
            )}
          </div>
        </div>

        {/* Collection Date */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Collection Date <span className="text-danger">*</span>
          </label>
          <input
            type="date"
            name="collectionDate"
            value={formData.collectionDate}
            onChange={handleInputChange}
            className="input w-full"
            disabled={uploading}
          />
        </div>

        {/* Submitter Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Name (Handler) <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="submitterName"
            value={formData.submitterName}
            onChange={handleInputChange}
            placeholder="John Doe"
            className={`input w-full ${errors.submitterName ? 'border-danger' : ''}`}
            disabled={uploading}
          />
          {errors.submitterName && (
            <p className="text-danger text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.submitterName}
            </p>
          )}
          <p className="text-gray-500 text-sm mt-1">
            This name will appear in the Chain of Custody as the handler
          </p>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Evidence File <span className="text-danger">*</span>
          </label>
          <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            errors.file ? 'border-danger' : 'border-gray-600 hover:border-neon'
          }`}>
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              disabled={uploading}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              {file ? (
                <div className="space-y-2">
                  <FileText className="w-12 h-12 text-neon mx-auto" />
                  <p className="text-gray-300 font-medium">{file.name}</p>
                  <p className="text-gray-500 text-sm">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {!uploading && (
                    <p className="text-neon text-sm hover:underline">Click to change file</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <p className="text-gray-300">Click to upload or drag and drop</p>
                  <p className="text-gray-500 text-sm">Max file size: 100MB</p>
                </div>
              )}
            </label>
          </div>
          {errors.file && (
            <p className="text-danger text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.file}
            </p>
          )}
          
          {/* File Hash Display */}
          {file && fileHash && !errors.file && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 bg-dark-lighter border border-gray-700 rounded-lg"
            >
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-neon mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-300 mb-1">File Hash (SHA-256)</p>
                  <p className="text-xs text-gray-400 font-mono break-all">{fileHash}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    This hash will be used to verify file integrity on future uploads
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Hash Mismatch Warning */}
          {errors.hashMismatch && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 p-4 bg-danger/10 border-2 border-danger rounded-lg"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-danger mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-danger font-bold text-sm mb-2">
                    ⚠️ FILE INTEGRITY CHECK FAILED
                  </h4>
                  <p className="text-danger/90 text-sm mb-2">
                    The uploaded file does not match the original evidence. The file may have been:
                  </p>
                  <ul className="list-disc list-inside text-danger/80 text-xs space-y-1 ml-2">
                    <li>Modified or tampered with</li>
                    <li>Corrupted during transfer</li>
                    <li>The wrong file for this evidence ID</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Upload Progress */}
        {uploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                {uploadProgress < 100 ? 'Uploading to IPFS...' : 'Submitting to blockchain...'}
              </span>
              <span className="text-neon font-medium">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-neon to-accent"
              />
            </div>
            {ipfsHash && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-success text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                <span>IPFS Hash: {ipfsHash}</span>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Submit Error */}
        {errors.submit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 p-4 bg-danger/10 border border-danger rounded-lg text-danger"
          >
            <AlertCircle className="w-5 h-5" />
            <span>{errors.submit}</span>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={uploading}
            className="btn-primary flex items-center gap-2 flex-1"
          >
            {uploading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Submit Evidence
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/evidence')}
            disabled={uploading}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-neon/5 border border-neon/20 rounded-lg p-4 text-sm">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-neon flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-gray-300 font-medium">Blockchain Immutability</p>
              <p className="text-gray-400">
                Once submitted, evidence records cannot be altered or deleted. The file will be stored
                on IPFS and its hash recorded permanently on the blockchain for tamper-proof verification.
              </p>
            </div>
          </div>
        </div>
      </motion.form>
    </div>
  )
}

export default EvidenceUpload
