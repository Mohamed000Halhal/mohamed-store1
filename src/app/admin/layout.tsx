'use client'

import React, { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { useRouter, usePathname } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'
import { onAuthStateChanged } from 'firebase/auth'
import { Loader2 } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (user && user.email === 'mohamedemara@stroe.com') {
        setAuthorized(true)
        setLoading(false)
      } else {
        setAuthorized(false)
        setLoading(false)
        if (!isLoginPage) {
          router.push('/admin/login')
        }
      }
    })
    return () => unsub()
  }, [router, isLoginPage])

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
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-color)' }} dir="rtl">
      {/* Sidebar — fixed on desktop, draws from right */}
      <AdminSidebar />

      {/* Main content — leaves space for 256px sidebar on desktop */}
      <main className="flex-1 lg:mr-64 p-6 pt-20 lg:pt-8 min-h-screen transition-all duration-300 custom-scrollbar overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
