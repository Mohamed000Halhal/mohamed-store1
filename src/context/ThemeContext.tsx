'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore'

interface ThemeContextType {
  settings: {
    siteTitle: string
    primaryColor: string
    secondaryColor: string
    navbarColor: string
    cardColor: string
    footerColor: string
    accentColor: string
    textColor: string
    logoUrl: string
    darkMode: boolean
  }
  toggleDarkMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState({
    siteTitle: 'Mohamed Store',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    navbarColor: 'rgba(255,255,255,0.92)',
    cardColor: '#ffffff',
    footerColor: '#ffffff',
    accentColor: '#6366f1',
    textColor: '#0f172a',
    logoUrl: '',
    darkMode: true // Dark mode is the default
  })

  useEffect(() => {
    let unsub = () => {}

    // 0. Read from localStorage first (user preference takes priority)
    const savedDarkMode = localStorage.getItem('darkMode')
    const savedThemeColor = localStorage.getItem('themeColor')
    
    // If localStorage has a saved value, use it; otherwise default to dark (true)
    const initialDark = savedDarkMode !== null ? savedDarkMode === 'true' : true
    
    if (savedThemeColor) {
      document.documentElement.style.setProperty('--primary-color', savedThemeColor)
    }
    
    setSettings(prev => ({ ...prev, darkMode: initialDark }))
    if (initialDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    const applyTheme = (data: any) => {
      const root = document.documentElement

      const savedColor = localStorage.getItem('themeColor')
      // CSS variable overrides from Firestore (admin customization), only if user hasn't selected a local override
      if (data.primaryColor && !savedColor)   root.style.setProperty('--primary-color', data.primaryColor)
      if (data.secondaryColor) root.style.setProperty('--secondary-color', data.secondaryColor)
      if (data.accentColor)    root.style.setProperty('--accent-color', data.accentColor)
      if (data.siteTitle)      document.title = data.siteTitle

      // Dark mode from Firestore only if localStorage hasn't been set by user yet
      if (data.darkMode !== undefined && localStorage.getItem('darkMode') === null) {
        const dark = data.darkMode
        if (dark) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
        setSettings(prev => ({ ...prev, darkMode: dark }))
      }
    }

    const initThemeSync = async () => {
      try {
        const themeDocRef = doc(db, 'settings', 'ui')

        // Initial fetch
        const snapshot = await getDoc(themeDocRef)
        if (snapshot.exists()) {
          const data = snapshot.data() as any
          setSettings(prev => ({ ...prev, ...data, darkMode: initialDark }))
          applyTheme(data)
        }

        // Continuous listener
        unsub = onSnapshot(themeDocRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data() as any
            setSettings(prev => ({ ...prev, ...data, darkMode: initialDark }))
            applyTheme(data)
          }
        }, (error) => {
          if (error.code !== 'permission-denied') {
            console.warn('Theme settings sync error:', error)
          }
        })
      } catch (error: any) {
        if (error.code !== 'permission-denied') {
          console.warn('Theme initialization error:', error)
        }
      }
    }

    initThemeSync()
    return () => unsub()
  }, [])

  const toggleDarkMode = async () => {
    const newDarkMode = !settings.darkMode

    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Always persist user choice locally
    localStorage.setItem('darkMode', String(newDarkMode))
    setSettings(prev => ({ ...prev, darkMode: newDarkMode }))

    try {
      const adminEmails = ['mohamed@store.com', 'mohamedemara@store.com', 'mohamedemara@stroe.com']
      const { auth } = await import('@/lib/firebase')
      const currentUser = auth.currentUser

      if (currentUser && adminEmails.includes(currentUser.email || '')) {
        await setDoc(doc(db, 'settings', 'ui'), { darkMode: newDarkMode }, { merge: true })
      }
    } catch {
      // Silent — expected for non-admins
    }
  }

  return (
    <ThemeContext.Provider value={{ settings, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
