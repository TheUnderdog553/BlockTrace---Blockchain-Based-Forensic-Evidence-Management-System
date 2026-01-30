import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  FileText, 
  Upload, 
  ArrowLeftRight, 
  ShieldCheck, 
  BarChart3,
  Database,
  Settings,
  Scale,
  Shield,
  Activity,
  Wallet,
  GitBranch
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: FileText, label: 'Evidence List', path: '/evidence' },
  { icon: Upload, label: 'Upload Evidence', path: '/upload' },
  { icon: ArrowLeftRight, label: 'Transfer Custody', path: '/transfer' },
  { icon: ShieldCheck, label: 'Verification', path: '/verify' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Shield, label: 'Ransomware Tracking', path: '/ransomware' },
  { icon: Activity, label: 'Ransomware Analytics', path: '/ransomware-analytics' },
  { icon: Wallet, label: 'Wallet Monitoring', path: '/wallet-monitoring' },
  { icon: GitBranch, label: 'Payment Flow', path: '/payment-flow' },
  { icon: Scale, label: 'Court Report', path: '/court-report' },
]

const bottomItems = [
  { icon: Database, label: 'Blockchain Status', path: '/status' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

export default function Sidebar({ isOpen }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed left-0 top-16 bottom-0 w-64 glass border-r border-neon/20 overflow-y-auto z-40"
        >
          <div className="p-6 space-y-6">
            {/* Organization Info */}
            <div className="card p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon to-accent flex items-center justify-center">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-100">ForensicsOrg</p>
                  <p className="text-xs text-gray-400">MSPID: ForensicsOrgMSP</p>
                </div>
              </div>
            </div>

            {/* Main Navigation */}
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-neon/10 border border-neon/30 text-neon shadow-lg shadow-neon/10'
                        : 'text-gray-300 hover:bg-abyss/50 hover:text-neon'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`w-5 h-5 ${isActive ? 'animate-pulse-slow' : ''}`} />
                      <span className="font-medium">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Divider */}
            <div className="border-t border-neon/10" />

            {/* Bottom Navigation */}
            <nav className="space-y-1">
              {bottomItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-neon/10 border border-neon/30 text-neon'
                        : 'text-gray-400 hover:bg-abyss/50 hover:text-gray-300'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Stats Card */}
            <div className="card p-4 space-y-3">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Quick Stats</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Total Evidence</span>
                  <span className="text-sm font-bold text-neon">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Pending Review</span>
                  <span className="text-sm font-bold text-warning">2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Verified</span>
                  <span className="text-sm font-bold text-success">5</span>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
