import { motion } from 'framer-motion'
import { Settings as SettingsIcon, User, Shield, Bell, Globe, Lock, Database, Save } from 'lucide-react'
import { useState } from 'react'

export default function Settings() {
  const [settings, setSettings] = useState({
    organization: 'ForensicsOrg',
    mspId: 'ForensicsOrgMSP',
    notifications: true,
    autoVerify: false,
    apiEndpoint: 'http://localhost:4000',
    ipfsGateway: 'https://ipfs.io/ipfs/',
  })

  const handleSave = () => {
    // Save settings logic here
    alert('Settings saved successfully!')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-[1200px] mx-auto"
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon to-accent mb-2">
          Settings
        </h1>
        <p className="text-sm md:text-base text-gray-400">Configure your BlockTrace preferences</p>
      </div>

      {/* Organization Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-hover"
      >
        <h2 className="text-xl font-bold text-gray-100 mb-6 flex items-center">
          <Shield className="w-5 h-5 text-neon mr-2" />
          Organization
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Organization Name
            </label>
            <input
              type="text"
              value={settings.organization}
              onChange={(e) => setSettings({ ...settings, organization: e.target.value })}
              className="input w-full"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Read-only: Set during network initialization</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              MSP ID
            </label>
            <input
              type="text"
              value={settings.mspId}
              onChange={(e) => setSettings({ ...settings, mspId: e.target.value })}
              className="input w-full font-mono"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Membership Service Provider Identifier</p>
          </div>
        </div>
      </motion.div>

      {/* User Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-hover"
      >
        <h2 className="text-xl font-bold text-gray-100 mb-6 flex items-center">
          <User className="w-5 h-5 text-accent mr-2" />
          User Preferences
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-abyss/30 border border-neon/10">
            <div>
              <p className="font-medium text-gray-100">Enable Notifications</p>
              <p className="text-sm text-gray-400">Receive alerts for evidence updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-neon rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-abyss/30 border border-neon/10">
            <div>
              <p className="font-medium text-gray-100">Auto-Verify Evidence</p>
              <p className="text-sm text-gray-400">Automatically verify evidence on upload</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoVerify}
                onChange={(e) => setSettings({ ...settings, autoVerify: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-neon rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon"></div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* API Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-hover"
      >
        <h2 className="text-xl font-bold text-gray-100 mb-6 flex items-center">
          <Globe className="w-5 h-5 text-success mr-2" />
          API Configuration
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Backend API Endpoint
            </label>
            <input
              type="text"
              value={settings.apiEndpoint}
              onChange={(e) => setSettings({ ...settings, apiEndpoint: e.target.value })}
              className="input w-full font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">URL to the BlockTrace backend API</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              IPFS Gateway
            </label>
            <input
              type="text"
              value={settings.ipfsGateway}
              onChange={(e) => setSettings({ ...settings, ipfsGateway: e.target.value })}
              className="input w-full font-mono"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Gateway URL for accessing IPFS content (Currently simulated - not connected to real IPFS)</p>
          </div>
        </div>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card-hover"
      >
        <h2 className="text-xl font-bold text-gray-100 mb-6 flex items-center">
          <Lock className="w-5 h-5 text-warning mr-2" />
          Security
        </h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-abyss/30 border border-warning/30">
            <div className="flex items-start space-x-3">
              <Lock className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <p className="font-medium text-gray-100">Certificate Authentication</p>
                <p className="text-sm text-gray-400 mt-1">
                  Using X.509 certificates for blockchain authentication
                </p>
                <p className="text-xs font-mono text-success mt-2">✓ Active</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-abyss/30 border border-success/30">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-success mt-0.5" />
              <div>
                <p className="font-medium text-gray-100">TLS Encryption</p>
                <p className="text-sm text-gray-400 mt-1">
                  All peer-to-peer communication is encrypted
                </p>
                <p className="text-xs font-mono text-success mt-2">✓ Enabled</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-end"
      >
        <button
          onClick={handleSave}
          className="btn-primary px-6 py-3 flex items-center space-x-2"
        >
          <Save className="w-5 h-5" />
          <span>Save Settings</span>
        </button>
      </motion.div>
    </motion.div>
  )
}
