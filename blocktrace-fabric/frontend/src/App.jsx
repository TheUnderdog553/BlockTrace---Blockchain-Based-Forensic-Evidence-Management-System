import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import EvidenceList from './pages/EvidenceList'
import EvidenceUpload from './pages/EvidenceUpload'
import EvidenceDetails from './pages/EvidenceDetails'
import CustodyTransfer from './pages/CustodyTransfer'
import Verification from './pages/Verification'
import Analytics from './pages/Analytics'
import BlockchainStatus from './pages/BlockchainStatus'
import Settings from './pages/Settings'
import CourtReport from './pages/CourtReport'
import RansomwareTracking from './pages/RansomwareTracking'
import RansomwareDashboard from './pages/RansomwareDashboard'
import WalletMonitoring from './pages/WalletMonitoring'
import PaymentFlowVisualization from './pages/PaymentFlowVisualization'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-midnight text-gray-100">
          {/* Cyber Grid Background */}
          <div className="cyber-grid" />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Routes */}
            <Route path="/*" element={
              <PrivateRoute>
                <>
                  {/* Navbar */}
                  <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                  
                  {/* Main Layout */}
                  <div className="flex pt-16">
                    {/* Sidebar */}
                    <Sidebar isOpen={sidebarOpen} />
                    
                    {/* Main Content */}
                    <main className={`flex-1 transition-all duration-300 px-4 py-6 md:px-6 md:py-8 lg:px-8 ${
                      sidebarOpen ? 'ml-64' : 'ml-0'
                    }`}>
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/evidence" element={<EvidenceList />} />
                        <Route path="/evidence/:id" element={<EvidenceDetails />} />
                        <Route path="/upload" element={<EvidenceUpload />} />
                        <Route path="/transfer" element={<CustodyTransfer />} />
                        <Route path="/verify" element={<Verification />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/ransomware" element={<RansomwareTracking />} />
                        <Route path="/ransomware-analytics" element={<RansomwareDashboard />} />
                        <Route path="/wallet-monitoring" element={<WalletMonitoring />} />
                        <Route path="/payment-flow" element={<PaymentFlowVisualization />} />
                        <Route path="/status" element={<BlockchainStatus />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/court-report" element={<CourtReport />} />
                        
                        {/* Catch all - redirect to dashboard */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </main>
                  </div>
                </>
              </PrivateRoute>
            } />
          </Routes>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
            duration: 4000,
            style: {
              background: '#122B39',
              color: '#fff',
              border: '1px solid #00BFFF',
              borderRadius: '0.5rem',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
      </AuthProvider>
    </Router>
  )
}

export default App
