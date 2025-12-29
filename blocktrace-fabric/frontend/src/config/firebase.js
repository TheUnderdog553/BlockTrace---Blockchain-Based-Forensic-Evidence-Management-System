import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAm5-BGqRcnQnnDbPTfic3aE7gOqoXVus",
  authDomain: "blocktrace-91613.firebaseapp.com",
  projectId: "blocktrace-91613",
  storageBucket: "blocktrace-91613.firebasestorage.app",
  messagingSenderId: "646767713536",
  appId: "1:646767713536:web:0734dfa8536de2014567e5"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication
export const auth = getAuth(app)

export default app
