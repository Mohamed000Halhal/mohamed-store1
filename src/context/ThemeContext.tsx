'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'

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
    darkMode: boolean
  }
  toggleDarkMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState({
    siteTitle: 'Mohamed Store',
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    navbarColor: '#ffffff',
    cardColor: '#ffffff',
    footerColor: '#ffffff',
    accentColor: '#667eea',
    textColor: '#000000',
    darkMode: false
  })

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'ui'), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as any
        setSettings(prev => {
          const newSettings = { ...prev, ...data }
          
          // Apply Theme Class
          const root = document.documentElement
          if (newSettings.darkMode) {
            root.classList.add('dark')
          } else {
            root.classList.remove('dark')
          }

          // Apply CSS Variables only if NOT default or specifically set
          // If darkMode is on, we prefer CSS variable defaults from globals.css 
          // unless the user has specifically overridden them with a custom color.
          
          const applyProperty = (prop: string, value: string, darkDefault: string, lightDefault: string) => {
            if (newSettings.darkMode) {
              // In dark mode, only override if value is NOT the light default
              if (value && value !== lightDefault) {
                root.style.setProperty(prop, value)
              } else {
                root.style.removeProperty(prop)
              }
            } else {
              // In light mode, override if value exists
              if (value) {
                root.style.setProperty(prop, value)
              } else {
                root.style.removeProperty(prop)
              }
            }
          }

          root.style.setProperty('--primary-color', newSettings.primaryColor)
          applyProperty('--navbar-color', newSettings.navbarColor, '#1e293b', '#ffffff')
          applyProperty('--card-color', newSettings.cardColor, '#1e293b', '#ffffff')
          applyProperty('--footer-color', newSettings.footerColor, '#0f172a', '#ffffff')
          root.style.setProperty('--accent-color', newSettings.accentColor)
          applyProperty('--text-color', newSettings.textColor, '#ffffff', '#000000')

          if (newSettings.siteTitle) {
            document.title = newSettings.siteTitle
          }

          return newSettings
        })
      }
    })

    return () => unsub()
  }, [])

  const toggleDarkMode = async () => {
    const newDarkMode = !settings.darkMode
    
    // Apply immediately for instant feedback
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    setSettings(prev => ({ ...prev, darkMode: newDarkMode }))
    
    try {
      // Only sync to Firestore if the user is the admin to avoid permission errors
      const adminEmail = 'mohamedemara@stroe.com'
      const { auth } = await import('@/lib/firebase')
      const currentUser = auth.currentUser
      
      if (currentUser && currentUser.email === adminEmail) {
        await setDoc(doc(db, 'settings', 'ui'), { darkMode: newDarkMode }, { merge: true })
      }
    } catch (error) {
      console.error('Error toggling dark mode:', error)
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
