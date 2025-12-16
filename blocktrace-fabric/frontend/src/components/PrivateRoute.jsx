import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute({ children }) {
  const { currentUser } = useAuth()

  if (!currentUser) {
    return <Navigate to="/login" />
  }

  if (!currentUser.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-abyss p-4">
        <div className="card p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Email Verification Required</h2>
          <p className="text-gray-400 mb-6">
            Please verify your email address to access this page. Check your inbox for a verification link.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            I've Verified My Email
          </button>
        </div>
      </div>
    )
  }

  return children
}
