'use client'

import React, { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { useRouter, usePathname } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'
import { onAuthStateChanged } from 'firebase/auth'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import NetworkBackground from '@/components/NetworkBackground'
import { useActiveDeviceTracker } from '@/hooks/useActiveDeviceTracker'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      console.log('Auth State Changed:', user?.email)
      if (user) {
        const adminEmails = ['mohamed@store.com', 'mohamedemara@store.com', 'mohamedemara@stroe.com']
        const userEmail = (user.email || '').toLowerCase().trim()
        const isAdmin = adminEmails.includes(userEmail)
        
        if (isAdmin) {
          console.log('Admin Authorized:', userEmail)
          setAuthorized(true)
          setLoading(false)
        } else {
          console.log('User is not admin:', userEmail, 'redirecting to /')
          toast.error('غير مصرح لك بالدخول كمسؤول')
          setAuthorized(false)
          setLoading(false)
          window.location.href = '/login'
        }
      } else {
        console.log('No user logged in, redirecting to /')
        setAuthorized(false)
        setLoading(false)
        // Redirect to home if not authorized and not already at home
        if (pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    })
    return () => unsub()
  }, [router, isLoginPage])

  // Track admin device presence
  useActiveDeviceTracker(authorized ? (auth.currentUser?.uid || 'admin_user') : null, 'admin')

  if (loading && !isLoginPage) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
        <Loader2 className="animate-spin" size={40} style={{ color: 'var(--primary-color)' }} />
      </div>
    )
  }

  // If it's the login page, we don't need the sidebar or the guard
  if (isLoginPage) {
    return <>{children}</>
  }

  if (!authorized) {
    return null // Will redirect due to useEffect
  }

  return (
    <div className="min-h-screen flex transition-colors duration-500" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }} dir="rtl">
      <NetworkBackground />
      {/* Sidebar — fixed on desktop, draws from right */}
      <AdminSidebar />

      {/* Main content — leaves space for 256px sidebar on desktop */}
      <main className="flex-1 lg:mr-64 p-6 pt-20 lg:pt-8 min-h-screen transition-all duration-300 custom-scrollbar overflow-y-auto relative z-10">
        {children}
      </main>
    </div>
  )
}
