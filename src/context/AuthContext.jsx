import React, { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../config/firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [authTab, setAuthTab] = useState('login')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password)
  }

  const signup = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await sendEmailVerification(userCredential.user)
    return userCredential
  }

  const logout = async () => {
    return await signOut(auth)
  }

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    return await signInWithPopup(auth, provider)
  }

  const loginWithFacebook = async () => {
    const provider = new FacebookAuthProvider()
    return await signInWithPopup(auth, provider)
  }

  const resetPassword = async (email) => {
    return await sendPasswordResetEmail(auth, email)
  }

  const value = {
    currentUser,
    login,
    signup,
    logout,
    loginWithGoogle,
    loginWithFacebook,
    resetPassword,
    showAuth,
    setShowAuth,
    authTab,
    setAuthTab
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
