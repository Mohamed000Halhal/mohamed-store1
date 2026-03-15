'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  ChevronLeft,
  ArrowLeft,
  Home,
  Layers,
  MessageSquare,
  ShoppingBag,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useTheme } from '@/context/ThemeContext'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageToggle from '@/components/LanguageToggle'
import { useLanguage } from '@/context/LanguageContext'
import toast from 'react-hot-toast'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

export default function ContactPage() {
  const { settings } = useTheme()
  const { t } = useLanguage()
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      await addDoc(collection(db, 'contacts'), {
        ...formData,
        createdAt: serverTimestamp()
      })
      setStatus('success')
      setFormData({ name: '', email: '', message: '' })
      toast.success(t('contact.success'))
    } catch (err) {
      console.error(err)
      setStatus('error')
      toast.error('Error sending message')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] transition-colors duration-500 font-sans">
      
      {/* --- Navbar --- */}
      <nav className="fixed top-0 w-full z-40 bg-[var(--navbar-color)] backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <ShoppingBag size={20} />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-color)] to-[var(--text-color)]/70">
              {settings.siteTitle || 'المتجر'}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 font-bold text-slate-600 dark:text-slate-400">
             <Link href="/" className="hover:text-primary transition-colors flex items-center gap-2">
                <Home size={18} /> {t('nav.home')}
             </Link>
             <Link href="/services" className="hover:text-primary transition-colors flex items-center gap-2">
                <Layers size={18} /> {t('nav.services')}
             </Link>
             <Link href="/contact" className="text-primary transition-colors flex items-center gap-2">
                <MessageSquare size={18} /> {t('nav.contact')}
             </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <LanguageToggle />
            <Link href="/" className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-primary">
              <ArrowLeft size={22} />
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="pt-40 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <h1 className="text-5xl font-black leading-tight">
                {t('contact.title')}
              </h1>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                {t('contact.desc')}
              </p>
            </div>

            <div className="space-y-8 text-right ltr:text-left">
              {[
                { icon: Phone, title: t('nav.contact'), value: '+20 123 456 7890' },
                { icon: Mail, title: t('contact.email'), value: 'contact@mohamed-store.com' },
                { icon: MapPin, title: 'Location', value: t('common.language') === 'ar' ? 'القاهرة، مدينتي' : 'Cairo, Madinaty' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--card-color)] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <item.icon size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{item.title}</p>
                    <p className="text-xl font-black">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--card-color)] rounded-[2.5rem] p-8 sm:p-12 shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden"
          >
            {status === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-black">{t('contact.success')}</h2>
                <p className="text-slate-500 font-medium text-lg">{t('contact.success_desc')}</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="px-8 py-3 bg-[var(--text-color)] text-[var(--bg-color)] rounded-full font-bold hover:opacity-90 transition-all"
                >
                  {t('contact.send_another')}
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 mr-2">{t('contact.name')}</label>
                    <input 
                      required
                      type="text" 
                      placeholder="..."
                      value={formData.name}
                      onChange={e => setFormData(prev => ({...prev, name: e.target.value}))}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-primary transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 mr-2">{t('contact.email')}</label>
                    <input 
                      required
                      type="email" 
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={e => setFormData(prev => ({...prev, email: e.target.value}))}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-primary transition-all font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 mr-2">{t('contact.message')}</label>
                  <textarea 
                    required
                    rows={5}
                    placeholder="..."
                    value={formData.message}
                    onChange={e => setFormData(prev => ({...prev, message: e.target.value}))}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-primary transition-all font-bold resize-none"
                  ></textarea>
                </div>
                <button 
                  disabled={status === 'loading'}
                  className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {status === 'loading' ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                  {status === 'loading' ? t('contact.sending') : t('contact.send')}
                </button>
              </form>
            )}
          </motion.div>

        </div>
      </main>

      {/* --- Footer --- */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 text-center relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-slate-500 font-medium">
            © {new Date().getFullYear()} <span className="font-black text-primary">{settings.siteTitle}</span>. {t('footer.copyright')}
          </p>
        </div>
      </footer>
    </div>
  )
}
