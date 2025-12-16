import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Shield, Bell, User, Search, X, LogOut, Settings as SettingsIcon, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notifications, setNotifications] = useState([])

  // Load notifications from localStorage
  useEffect(() => {
    const loadNotifications = () => {
      const stored = localStorage.getItem('notifications')
      if (stored) {
        setNotifications(JSON.parse(stored))
      } else {
        // Default notifications
        const defaultNotifications = [
          {
            id: 1,
            type: 'success',
            title: 'Evidence Verified',
            message: 'EV001 has been successfully verified',
            time: '5 mins ago',
            unread: true
          },
          {
            id: 2,
            type: 'warning',
            title: 'Transfer Pending',
            message: 'EV002 custody transfer awaiting approval',
            time: '1 hour ago',
            unread: true
          },
          {
            id: 3,
            type: 'info',
            title: 'New Evidence',
            message: 'EV008 uploaded to the ledger',
            time: '2 hours ago',
            unread: false
          }
        ]
        setNotifications(defaultNotifications)
      }
    }
    
    loadNotifications()
    
    // Listen for storage changes (from other tabs or components)
    const handleStorageChange = () => {
      loadNotifications()
    }
    
    window.addEventListener('storage', handleStorageChange)
    // Also listen for custom event
    window.addEventListener('notificationUpdate', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('notificationUpdate', handleStorageChange)
    }
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to evidence list with search query
      navigate(`/evidence?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  const handleNotificationClick = (notification) => {
    // Navigate based on notification type
    if (notification.title.includes('Evidence')) {
      navigate('/evidence')
    } else if (notification.title.includes('Transfer')) {
      navigate('/transfer')
    }
    setShowNotifications(false)
  }

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, unread: false }))
    setNotifications(updatedNotifications)
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications))
    window.dispatchEvent(new Event('notificationUpdate'))
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-abyss/70 backdrop-blur-xl border-b border-neon/30"
      style={{ backdropFilter: 'blur(20px)' }}
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-neon/10 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6 text-neon" />
            </button>

            <div 
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="relative">
                <Shield className="w-8 h-8 text-neon animate-pulse-slow" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-ping" />
              </div>
              <div>
                <h1 className="text-xl font-bold glow-text">BlockTrace</h1>
                <p className="text-xs text-gray-400">Forensic Evidence Ledger</p>
              </div>
            </div>
          </div>

          {/* Center - Search */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search evidence by ID, hash, or description..."
                className="input w-full pl-10 pr-4"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-abyss/50 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </form>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-3">
            {/* Network Status */}
            <div 
              className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/30 cursor-pointer hover:bg-success/20 transition-colors"
              onClick={() => navigate('/status')}
              title="View blockchain status"
            >
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-sm text-success font-medium">Network Active</span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-neon/10 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-gray-300" />
                {notifications.filter(n => n.unread).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-80 bg-abyss/95 backdrop-blur-xl border border-neon/30 rounded-lg shadow-2xl overflow-hidden"
                    style={{ backdropFilter: 'blur(20px)' }}
                  >
                    <div className="p-4 border-b border-neon/30 bg-abyss/50 flex items-center justify-between">
                      <h3 className="font-bold text-white text-lg">Notifications</h3>
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-neon hover:text-accent transition-colors"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-4 border-b border-neon/10 cursor-pointer hover:bg-neon/10 transition-colors ${
                            notification.unread ? 'bg-neon/5' : 'bg-abyss/20'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notification.type === 'success' ? 'bg-success' :
                              notification.type === 'warning' ? 'bg-warning' :
                              'bg-accent'
                            }`} />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">{notification.title}</p>
                              <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 text-center border-t border-neon/30 bg-abyss/50">
                      <button
                        onClick={() => {
                          setShowNotifications(false)
                          navigate('/analytics')
                        }}
                        className="text-sm font-medium text-neon hover:text-accent transition-colors"
                      >
                        View All Activity
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile */}
            <div className="relative">
              <div 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-neon/20 hover:border-neon/40 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon to-accent flex items-center justify-center">
                  {currentUser?.photoURL ? (
                    <img src={currentUser.photoURL} alt="Profile" className="w-full h-full rounded-full" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-100">
                    {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {currentUser?.emailVerified ? 'Verified' : 'Pending Verification'}
                  </p>
                </div>
              </div>

              {/* User Menu Dropdown */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-64 bg-abyss/95 backdrop-blur-xl border border-neon/30 rounded-lg shadow-2xl overflow-hidden"
                    style={{ backdropFilter: 'blur(20px)' }}
                  >
                    <div className="p-4 border-b border-neon/30 bg-abyss/50">
                      <p className="font-bold text-white text-lg">
                        {currentUser?.displayName || 'User'}
                      </p>
                      <p className="text-sm text-gray-300">{currentUser?.email}</p>
                      <p className="text-xs text-neon mt-1 font-medium">
                        {currentUser?.emailVerified ? '✓ Email Verified' : '⚠ Email Not Verified'}
                      </p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          navigate('/settings')
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-neon/10 hover:text-neon rounded-lg transition-colors"
                      >
                        <SettingsIcon className="w-4 h-4" />
                        Settings
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          navigate('/status')
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-neon/10 hover:text-neon rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Blockchain Status
                      </button>
                    </div>
                    <div className="p-2 border-t border-neon/30 bg-abyss/50">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/20 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showUserMenu) && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => {
            setShowNotifications(false)
            setShowUserMenu(false)
          }}
        />
      )}
    </motion.nav>
  )
}
