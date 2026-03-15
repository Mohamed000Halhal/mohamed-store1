'use client'

import React, { useState, useEffect } from 'react'
import { auth, db } from '@/lib/firebase'
import { 
  signInWithEmailAndPassword, 
  setPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence,
  onAuthStateChanged
} from 'firebase/auth'
import { 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { 
  ShoppingBag, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageToggle from '@/components/LanguageToggle'
import { useLanguage } from '@/context/LanguageContext'

export default function UnifiedLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { t, dir } = useLanguage()

  // Auto-redirect if already logged in
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await handleRoleBasedRedirection(user.email)
      } else {
        setCheckingAuth(false)
      }
    })
    return () => unsub()
  }, [])

  const handleRoleBasedRedirection = async (userEmail: string | null) => {
    if (!userEmail) {
      setCheckingAuth(false)
      return
    }

    // 1. Check if Admin (Support potential variants)
    const emailLower = userEmail.toLowerCase().trim()
    const adminEmails = ['mohamed@store.com', 'mohamedemara@store.com', 'mohamedemara@stroe.com']
    
    const isAdminMatch = adminEmails.some(adminEmail => adminEmail === emailLower)
    
    if (isAdminMatch) {
      window.location.href = '/admin/dashboard'
      return
    }

    // 2. Check if Secretary
    try {
      const q = query(collection(db, 'secretaries'), where('email', '==', emailLower))
      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        window.location.href = '/secretary/dashboard'
      } else {
        if (!checkingAuth) {
           toast.error(t('login.error_not_found'))
        }
        setCheckingAuth(false)
        setLoading(false)
      }
    } catch (error: any) {
      setCheckingAuth(false)
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Set persistence based on "Remember Me"
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)
      
      const trimmedEmail = email.trim().toLowerCase()
      const trimmedPassword = password.trim()
      console.log('Attempting Unified Login for:', trimmedEmail)
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword)
      toast.success(t('login.success'))
      
      await handleRoleBasedRedirection(userCredential.user.email)
    } catch (error: any) {
      console.error('Unified Login Error:', error.code, error.message)
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('تم إرسال الكثير من الطلبات، يرجى المحاولة لاحقاً')
      } else {
        toast.error(t('login.error_auth'))
      }
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg-color)] transition-colors duration-500" dir={dir}>
      <Toaster position="top-center" />
      
      {/* Settings Bar */}
      <div className="absolute top-8 right-8 left-8 flex justify-between items-center pointer-events-none">
        <div className="flex gap-3 pointer-events-auto">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>

      <div className="w-full max-w-[480px] animate-fade-in">
        <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 relative overflow-hidden">
          {/* Decorative background blur */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10" />
          
          <div className="flex flex-col items-center mb-12 relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-indigo-600 rounded-[2rem] flex items-center justify-center text-white mb-8 shadow-2xl shadow-primary/30 transform transition-transform hover:scale-105 active:scale-95 duration-500">
              <ShoppingBag size={40} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{t('login.title')}</h1>
            <p className="text-slate-500 font-bold text-center text-sm">{t('login.subtitle')}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8 relative z-10">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 px-1 flex items-center gap-2 uppercase tracking-widest">
                <Mail size={14} />
                {t('login.email')}
              </label>
              <input 
                type="email" 
                required
                placeholder="name@store.com"
                className="w-full px-8 py-5 rounded-[1.5rem] bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] font-bold focus:ring-4 ring-primary/10 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
 
              <div className="relative">
                <Lock className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  placeholder="••••••••"
                  className={`w-full ${dir === 'rtl' ? 'pr-12 pl-12' : 'pl-12 pr-12'} py-5 rounded-[1.5rem] bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] font-bold focus:ring-4 ring-primary/10 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${dir === 'rtl' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors`}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

            <div className="flex items-center justify-between px-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-lg border-2 transition-all ${rememberMe ? 'bg-primary border-primary' : 'border-slate-300 dark:border-slate-600'}`}>
                    {rememberMe && (
                      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white absolute top-1 left-1" stroke="currentColor" strokeWidth="4">
                        <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm font-black text-slate-500 group-hover:text-primary transition-colors">{t('login.remember')}</span>
              </label>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/95 text-white py-6 rounded-[1.5rem] font-black text-lg shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group overflow-hidden relative"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <span className="relative z-10 tracking-tight">{t('login.submit')}</span>
                  <ArrowRight size={24} className={`relative z-10 transition-transform ${dir === 'rtl' ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-700 flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2 text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-100 dark:border-indigo-500/20">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">{t('login.secure')}</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed font-bold">
              {t('login.footer')}
            </p>
          </div>
        </div>
        
        <p className="mt-10 text-center text-slate-400 font-bold text-xs tracking-wide opacity-60">
           {t('common.author_credit')} © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
