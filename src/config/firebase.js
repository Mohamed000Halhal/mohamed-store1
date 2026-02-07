import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getMessaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: "AIzaSyC0BjvQRGMxQMwksldcawRwQa54Q_h2XMc",
  authDomain: "mohamedemara-79f1a.firebaseapp.com",
  projectId: "mohamedemara-79f1a",
  storageBucket: "mohamedemara-79f1a.firebasestorage.app",
  messagingSenderId: "271024419210",
  appId: "1:271024419210:web:3e43ddec7c8aaeb8c85873",
  measurementId: "G-9ECM4W877L"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)

// Messaging initialization (only in browser)
let messaging = null
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app)
  } catch (error) {
    console.warn('Messaging not available:', error)
  }
}
export { messaging }

export default app
