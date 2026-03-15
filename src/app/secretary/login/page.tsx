'use client'

import React, { useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { 
  ShoppingBag, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2,
  ShieldAlert
} from 'lucide-react'
import toast from 'react-hot-toast'
import ThemeToggle from '@/components/ThemeToggle'
import { useLanguage } from '@/context/LanguageContext'

export default function SecretaryLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t, dir } = useLanguage()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast.success(t('sec_login_success'))
      router.push('/secretary/dashboard')
    } catch (error: any) {
      console.error(error)
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        toast.error(t('sec_login_invalid'))
      } else {
        toast.error(t('sec_login_error'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-[#0f172a]" dir={dir}>
      <div className="absolute top-8 right-8">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[440px]">
        <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-700">
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl shadow-primary/30 transform -rotate-6">
              <ShoppingBag size={40} />
            </div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2">{t('sec_login_title')}</h1>
            <p className="text-slate-500 font-bold">{t('sec_login_subtitle')}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-500 pr-2">{t('login.email')}</label>
              <div className="relative group">
                <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type="email" 
                  required
                  placeholder="name@store.com"
                  className="w-full pr-14 pl-6 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 font-bold focus:ring-4 ring-primary/10 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-500 pr-2">{t('login.password')}</label>
              <div className="relative group">
                <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full pr-14 pl-6 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 font-bold focus:ring-4 ring-primary/10 outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/95 text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-primary/25 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <span>{t('login.submit')}</span>
                  <ArrowRight size={22} className={`group-hover:${dir === 'rtl' ? '-translate-x-1' : 'translate-x-1'} transition-transform`} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-700 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-4 py-2 rounded-full border border-amber-100 dark:border-amber-500/20">
              <ShieldAlert size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">{t('sec_login_alert_title')}</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center leading-relaxed font-bold">
              {t('sec_login_alert_msg')}
            </p>
          </div>
        </div>
        
        <p className="mt-8 text-center text-slate-400 font-bold text-sm">
           {t('sec_login_rights')} {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
