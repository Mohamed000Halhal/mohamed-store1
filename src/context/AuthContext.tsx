'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { auth, db } from '@/lib/firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'

interface AuthContextType {
  currentUser: User | null
  loading: boolean
  showAuth: boolean
  setShowAuth: (v: boolean) => void
  authTab: 'login' | 'signup'
  setAuthTab: (v: 'login' | 'signup') => void
  login: (email: string, password: string) => Promise<any>
  signup: (email: string, password: string, name: string) => Promise<any>
  loginWithGoogle: () => Promise<any>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  // Save user data to Firestore on first login
  const saveUserToFirestore = async (user: User, displayName?: string) => {
    const userRef = doc(db, 'users', user.uid)
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      })
    } else {
      await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true })
    }
  }

  const login = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password)
    await saveUserToFirestore(result.user)
    return result
  }

  const signup = async (email: string, password: string, name: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await saveUserToFirestore(result.user, name)
    return result
  }

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    await saveUserToFirestore(result.user)
    return result
  }

  const logout = async () => {
    await signOut(auth)
  }

  const value: AuthContextType = {
    currentUser,
    loading,
    showAuth,
    setShowAuth,
    authTab,
    setAuthTab,
    login,
    signup,
    loginWithGoogle,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
