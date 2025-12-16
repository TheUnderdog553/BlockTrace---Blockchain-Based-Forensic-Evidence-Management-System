import { createContext, useContext, useState, useEffect } from 'react'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { auth } from '../config/firebase'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Signup with email and password
  const signup = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await sendEmailVerification(userCredential.user)
      
      // Store user info in localStorage
      localStorage.setItem('userProfile', JSON.stringify({
        email,
        displayName,
        uid: userCredential.user.uid,
        emailVerified: false
      }))
      
      toast.success('Account created! Please check your email for verification.')
      return userCredential.user
    } catch (error) {
      console.error('Signup error:', error)
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already in use')
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password should be at least 6 characters')
      } else {
        toast.error('Failed to create account')
      }
      throw error
    }
  }

  // Login with email and password
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      if (!userCredential.user.emailVerified) {
        toast.error('Please verify your email before logging in')
        await signOut(auth)
        throw new Error('Email not verified')
      }
      
      toast.success('Logged in successfully!')
      return userCredential.user
    } catch (error) {
      console.error('Login error:', error)
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        toast.error('Invalid email or password')
      } else if (error.message === 'Email not verified') {
        // Already handled
      } else {
        toast.error('Failed to login')
      }
      throw error
    }
  }

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      
      // Store user info
      localStorage.setItem('userProfile', JSON.stringify({
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        uid: userCredential.user.uid,
        emailVerified: userCredential.user.emailVerified,
        photoURL: userCredential.user.photoURL
      }))
      
      toast.success('Logged in with Google successfully!')
      return userCredential.user
    } catch (error) {
      console.error('Google login error:', error)
      toast.error('Failed to login with Google')
      throw error
    }
  }

  // Logout
  const logout = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem('userProfile')
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout')
    }
  }

  // Resend verification email
  const resendVerification = async () => {
    try {
      if (currentUser) {
        await sendEmailVerification(currentUser)
        toast.success('Verification email sent!')
      }
    } catch (error) {
      console.error('Resend verification error:', error)
      toast.error('Failed to send verification email')
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
      
      if (user) {
        localStorage.setItem('userProfile', JSON.stringify({
          email: user.email,
          displayName: user.displayName,
          uid: user.uid,
          emailVerified: user.emailVerified,
          photoURL: user.photoURL
        }))
      }
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout,
    resendVerification
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
