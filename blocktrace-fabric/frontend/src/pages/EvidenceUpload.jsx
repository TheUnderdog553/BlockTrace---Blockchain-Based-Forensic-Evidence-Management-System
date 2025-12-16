import { useState } from 'react'
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
  const [errors, setErrors] = useState({})

  const categories = ['Malware', 'Ransom Note', 'Network Log', 'Disk Image', 'Memory Dump', 'Email', 'Other']

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // Validate file size (max 100MB)
      if (selectedFile.size > 100 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, file: 'File size must be less than 100MB' }))
        return
      }
      setFile(selectedFile)
      setErrors(prev => ({ ...prev, file: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.evidenceId.trim()) {
      newErrors.evidenceId = 'Evidence ID is required'
    } else if (!/^EV\d{3,}$/.test(formData.evidenceId)) {
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

    // Check for duplicate evidence ID
    const savedEvidence = JSON.parse(localStorage.getItem('evidenceData') || '[]')
    const isDuplicate = savedEvidence.some(evidence => evidence.id === formData.evidenceId)
    
    if (isDuplicate) {
      setErrors({ evidenceId: `Evidence ID "${formData.evidenceId}" already exists. Please use a different ID.` })
      toast.error(`Evidence ID "${formData.evidenceId}" already exists!`, {
        duration: 4000,
        icon: '❌'
      })
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Simulate file upload to IPFS
      const generatedHash = await simulateUpload()
      setIpfsHash(generatedHash)

      // Save to localStorage (simulating database)
      const newEvidence = {
        id: formData.evidenceId,
        ipfsHash: generatedHash,
        verificationHash: generatedHash,
        description: formData.description,
        category: formData.category,
        status: 'pending',
        custodian: 'ForensicsOrg',
        submitter: formData.submitterName,
        sourceIP: formData.sourceIP,
        collectionDate: formData.collectionDate,
        lastModified: new Date().toISOString(),
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`
      }
      savedEvidence.push(newEvidence)
      localStorage.setItem('evidenceData', JSON.stringify(savedEvidence))

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
