'use client'

import React, { useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { useRouter, usePathname } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore'
import { Loader2, LogOut, User, LayoutDashboard, ShoppingBag, Truck, UserCog } from 'lucide-react'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageToggle from '@/components/LanguageToggle'
import { useLanguage } from '@/context/LanguageContext'
import toast from 'react-hot-toast'
import NetworkBackground from '@/components/NetworkBackground'

import SecretarySidebar from '@/components/secretary/SecretarySidebar'
import { useActiveDeviceTracker } from '@/hooks/useActiveDeviceTracker'

export default function SecretaryLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [secretary, setSecretary] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { t, dir } = useLanguage()

  const isLoginPage = pathname === '/login' || pathname === '/secretary/login'

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Verify if user is a secretary
        const q = query(collection(db, 'secretaries'), where('email', '==', user.email))
        const snapshot = await getDocs(q)
        
        if (!snapshot.empty) {
          const secData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
          setSecretary(secData)
          setLoading(false)

          // Presence Logic: True Real-time
          const secRef = doc(db, 'secretaries', secData.id)
          
          const updateSecretaryPresence = async (isOnline: boolean) => {
            try {
              await updateDoc(secRef, { 
                onlineStatus: isOnline, 
                lastSeen: serverTimestamp() 
              })
            } catch (e) {
              console.warn("Failed to update secretary presence:", e)
            }
          }

          // Initial presence
          updateSecretaryPresence(document.visibilityState === 'visible')

          // Handle visibility changes
          const handleSecVisibilityChange = () => {
             updateSecretaryPresence(document.visibilityState === 'visible')
          }
          
          const handleSecPageHide = () => {
             updateSecretaryPresence(false)
          }

          window.addEventListener('visibilitychange', handleSecVisibilityChange)
          window.addEventListener('pagehide', handleSecPageHide)
          window.addEventListener('beforeunload', handleSecPageHide)

          // Heartbeat interval (every 1 minute if visible)
          const heartbeatInterval = setInterval(() => {
            if (document.visibilityState === 'visible') {
              updateSecretaryPresence(true)
            }
          }, 60000)

          return () => {
            clearInterval(heartbeatInterval)
            window.removeEventListener('visibilitychange', handleSecVisibilityChange)
            window.removeEventListener('pagehide', handleSecPageHide)
            window.removeEventListener('beforeunload', handleSecPageHide)
            updateSecretaryPresence(false) // When component unmounts
          }
        } else {
          // If not secretary, redirect to login unless it's an admin
          const adminEmails = ['mohamed@store.com', 'mohamedemara@store.com', 'mohamedemara@stroe.com']
          const isAdmin = user.email && adminEmails.includes(user.email)
          if (!isAdmin) {
            toast.error(t('common.error_unauthorized'))
            setLoading(false)
            if (!isLoginPage) router.push('/login')
          } else {
            // Admin can also see secretary dashboard for monitoring
            setSecretary({ name: 'Admin (Viewing)', email: user.email, id: 'admin' })
            setLoading(false)
          }
        }
      } else {
        setSecretary(null)
        setLoading(false)
        if (!isLoginPage) router.push('/login')
      }
    })
    return () => unsub()
  }, [router, isLoginPage])

  // Track secretary device presence
  useActiveDeviceTracker(secretary?.id || null, 'secretary')

  if (loading && !isLoginPage) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-color)]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    )
  }

  if (isLoginPage) return <>{children}</>

  return (
    <div className="min-h-screen flex transition-colors duration-500" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }} dir={dir}>
      <NetworkBackground />
      <SecretarySidebar secretary={secretary} />

      <main className={`flex-1 transition-all duration-300 ${dir === 'rtl' ? 'lg:mr-64 pt-16 lg:pt-0' : 'lg:ml-64 pt-16 lg:pt-0'} relative z-10`}>
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

