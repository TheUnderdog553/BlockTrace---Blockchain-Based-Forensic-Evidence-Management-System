import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Shield, AlertCircle, CheckCircle, Loader, User, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

const CustodyTransfer = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedEvidence = searchParams.get('evidence')

  const [formData, setFormData] = useState({
    evidenceId: preselectedEvidence || '',
    destinationOrg: '',
    handlerName: '',
    handlerTitle: '',
    reason: ''
  })
  const [transferring, setTransferring] = useState(false)
  const [errors, setErrors] = useState({})
  const [evidenceList, setEvidenceList] = useState([])

  // Default evidence list
  const defaultEvidenceList = [
    { id: 'EV001', description: 'Ransomware executable file', custodian: 'ForensicsOrg' },
    { id: 'EV002', description: 'Ransom note file', custodian: 'PoliceOrg' },
    { id: 'EV003', description: 'Network traffic capture', custodian: 'ForensicsOrg' },
    { id: 'EV004', description: 'Disk image', custodian: 'CourtOrg' },
    { id: 'EV005', description: 'Memory dump', custodian: 'ForensicsOrg' }
  ]

  // Load evidence from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('evidenceData')
    if (savedData) {
      const parsed = JSON.parse(savedData)
      // Merge saved data with default, removing duplicates by ID
      const allData = [...parsed, ...defaultEvidenceList]
      const uniqueData = allData.filter((item, index, self) =>
        index === self.findIndex((t) => t.id === item.id)
      )
      setEvidenceList(uniqueData)
    } else {
      setEvidenceList(defaultEvidenceList)
    }
  }, [])

  const organizations = [
    { id: 'ForensicsOrg', name: 'Forensics Organization', msp: 'ForensicsOrgMSP' },
    { id: 'PoliceOrg', name: 'Police Organization', msp: 'PoliceOrgMSP' },
    { id: 'CourtOrg', name: 'Court Organization', msp: 'CourtOrgMSP' }
  ]

  const selectedEvidence = evidenceList.find(e => e.id === formData.evidenceId)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.evidenceId) {
      newErrors.evidenceId = 'Please select an evidence record'
    }

    if (!formData.destinationOrg) {
      newErrors.destinationOrg = 'Please select a destination organization'
    }

    if (selectedEvidence && formData.destinationOrg === selectedEvidence.custodian) {
      newErrors.destinationOrg = 'Cannot transfer to the current custodian'
    }

    if (!formData.handlerName.trim()) {
      newErrors.handlerName = 'Handler name is required'
    }

    if (!formData.handlerTitle.trim()) {
      newErrors.handlerTitle = 'Handler title is required'
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Transfer reason is required'
    } else if (formData.reason.length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setTransferring(true)

    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Save custody transfer to localStorage
      const custodyRecords = JSON.parse(localStorage.getItem('custodyChain') || '{}')
      if (!custodyRecords[formData.evidenceId]) {
        custodyRecords[formData.evidenceId] = []
      }
      
      const transferRecord = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('en-US', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).replace(/,/, ''),
        from: selectedEvidence?.custodian || 'Unknown',
        to: formData.destinationOrg,
        handler: formData.handlerName,
        handlerTitle: formData.handlerTitle,
        action: 'Custody Transferred',
        reason: formData.reason,
        txId: `tx${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
      }
      
      custodyRecords[formData.evidenceId].push(transferRecord)
      localStorage.setItem('custodyChain', JSON.stringify(custodyRecords))

      // Update evidence custodian
      const evidenceData = JSON.parse(localStorage.getItem('evidenceData') || '[]')
      const evidenceIndex = evidenceData.findIndex(e => e.id === formData.evidenceId)
      if (evidenceIndex !== -1) {
        evidenceData[evidenceIndex].custodian = formData.destinationOrg
        evidenceData[evidenceIndex].lastModified = new Date().toISOString()
        localStorage.setItem('evidenceData', JSON.stringify(evidenceData))
      }

      // Add notification to bell icon
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]')
      const orgName = organizations.find(o => o.id === formData.destinationOrg)?.name || formData.destinationOrg
      const newNotification = {
        id: Date.now(),
        type: 'warning',
        title: 'Custody Transferred',
        message: `${formData.evidenceId} transferred to ${orgName}`,
        time: 'Just now',
        unread: true
      }
      notifications.unshift(newNotification)
      localStorage.setItem('notifications', JSON.stringify(notifications))
      window.dispatchEvent(new Event('notificationUpdate'))

      // Show success toast
      toast.success(`Custody of ${formData.evidenceId} transferred to ${orgName}!`, {
        duration: 4000,
        icon: '✅'
      })

      // Success - navigate to evidence details
      setTimeout(() => {
        navigate(`/evidence/${formData.evidenceId}`)
      }, 1000)
    } catch (error) {
      console.error('Transfer failed:', error)
      setErrors({ submit: 'Failed to transfer custody. Please try again.' })
      setTransferring(false)
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
          <div className="p-2 bg-neon/10 rounded-lg">
            <ArrowRight className="w-6 h-6 text-neon" />
          </div>
          <h1 className="text-3xl font-bold glow-text">Transfer Custody</h1>
        </div>
        <p className="text-gray-400">
          Securely transfer evidence custody between organizations on the blockchain
        </p>
      </motion.div>

      {/* Transfer Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Select Evidence */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Select Evidence</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Evidence Record <span className="text-danger">*</span>
            </label>
            <input
              list="evidence-list"
              name="evidenceId"
              value={formData.evidenceId}
              onChange={handleInputChange}
              placeholder="Type or select evidence ID..."
              className={`input w-full ${errors.evidenceId ? 'border-danger' : ''}`}
              disabled={transferring}
            />
            <datalist id="evidence-list">
              {evidenceList.map(evidence => (
                <option key={evidence.id} value={evidence.id}>
                  {evidence.id} - {evidence.description}
                </option>
              ))}
            </datalist>
            <p className="text-gray-500 text-xs mt-1">
              💡 You can type manually or select from the dropdown ({evidenceList.length} items available)
            </p>
            {errors.evidenceId && (
              <p className="text-danger text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.evidenceId}
              </p>
            )}
          </div>

          {selectedEvidence && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-gray-800/50 rounded-lg p-4"
            >
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Evidence ID</p>
                  <p className="text-gray-200 font-medium">{selectedEvidence.id}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Current Custodian</p>
                  <span className="badge badge-info">{selectedEvidence.custodian}</span>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400 mb-1">Description</p>
                  <p className="text-gray-200">{selectedEvidence.description}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Destination Organization */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Destination Organization</h2>
          
          <div className="space-y-4">
            {organizations.map(org => (
              <motion.label
                key={org.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`block cursor-pointer ${transferring ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name="destinationOrg"
                  value={org.id}
                  checked={formData.destinationOrg === org.id}
                  onChange={handleInputChange}
                  disabled={transferring || (selectedEvidence && org.id === selectedEvidence.custodian)}
                  className="hidden"
                />
                <div className={`p-4 rounded-lg border-2 transition-all ${
                  formData.destinationOrg === org.id
                    ? 'border-neon bg-neon/10'
                    : selectedEvidence && org.id === selectedEvidence.custodian
                    ? 'border-gray-700 bg-gray-800/30 opacity-50'
                    : 'border-gray-700 hover:border-neon/50'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      formData.destinationOrg === org.id ? 'bg-neon/20' : 'bg-gray-700'
                    }`}>
                      <Building2 className={`w-5 h-5 ${
                        formData.destinationOrg === org.id ? 'text-neon' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-200">{org.name}</h3>
                      <p className="text-sm text-gray-400">{org.msp}</p>
                    </div>
                    {selectedEvidence && org.id === selectedEvidence.custodian && (
                      <span className="badge badge-warning">Current Custodian</span>
                    )}
                    {formData.destinationOrg === org.id && (
                      <CheckCircle className="w-5 h-5 text-neon" />
                    )}
                  </div>
                </div>
              </motion.label>
            ))}
          </div>

          {errors.destinationOrg && (
            <p className="text-danger text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.destinationOrg}
            </p>
          )}
        </div>

        {/* Handler Information */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Handler Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Handler Name <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="handlerName"
                  value={formData.handlerName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className={`input w-full pl-10 ${errors.handlerName ? 'border-danger' : ''}`}
                  disabled={transferring}
                />
              </div>
              {errors.handlerName && (
                <p className="text-danger text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.handlerName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Handler Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="handlerTitle"
                value={formData.handlerTitle}
                onChange={handleInputChange}
                placeholder="Senior Investigator"
                className={`input w-full ${errors.handlerTitle ? 'border-danger' : ''}`}
                disabled={transferring}
              />
              {errors.handlerTitle && (
                <p className="text-danger text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.handlerTitle}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Transfer Reason <span className="text-danger">*</span>
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              placeholder="Provide a detailed reason for this custody transfer..."
              rows={4}
              className={`input w-full resize-none ${errors.reason ? 'border-danger' : ''}`}
              disabled={transferring}
            />
            {errors.reason && (
              <p className="text-danger text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.reason}
              </p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              {formData.reason.length} characters (minimum 10)
            </p>
          </div>
        </div>

        {/* Transfer Preview */}
        {formData.evidenceId && formData.destinationOrg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-neon/5 border-2 border-neon/30"
          >
            <h2 className="text-xl font-semibold mb-4">Transfer Preview</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">From</p>
                  <p className="font-semibold text-gray-200">{selectedEvidence?.custodian}</p>
                </div>

                <ArrowRight className="w-8 h-8 text-neon animate-pulse" />

                <div className="text-center">
                  <Building2 className="w-8 h-8 text-neon mx-auto mb-2" />
                  <p className="text-sm text-gray-400">To</p>
                  <p className="font-semibold text-neon">
                    {organizations.find(o => o.id === formData.destinationOrg)?.name}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-400 mb-1">Handler</p>
                <p className="font-semibold text-gray-200">{formData.handlerName || '-'}</p>
                <p className="text-sm text-gray-400">{formData.handlerTitle || '-'}</p>
              </div>
            </div>
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
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={transferring}
            className="btn-primary flex items-center gap-2 flex-1"
          >
            {transferring ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Transferring...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Confirm Transfer
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/evidence')}
            disabled={transferring}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>

        {/* Warning */}
        <div className="bg-warning/5 border border-warning/20 rounded-lg p-4 text-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-gray-300 font-medium">Blockchain Transaction</p>
              <p className="text-gray-400">
                This custody transfer will be permanently recorded on the blockchain. 
                Ensure all information is accurate before confirming.
              </p>
            </div>
          </div>
        </div>
      </motion.form>
    </div>
  )
}

export default CustodyTransfer
