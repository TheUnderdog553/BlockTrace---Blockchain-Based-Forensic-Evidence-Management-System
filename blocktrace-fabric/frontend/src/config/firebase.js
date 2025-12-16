import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAg4V-3yLFeRnxb0JSxrtJk4OqKDCKHJls",
  authDomain: "blocktrace-13138.firebaseapp.com",
  projectId: "blocktrace-13138",
  storageBucket: "blocktrace-13138.firebasestorage.app",
  messagingSenderId: "161167522910",
  appId: "1:161167522910:web:b2cd9042bdc8fb41ca08cf"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication
export const auth = getAuth(app)

export default app
