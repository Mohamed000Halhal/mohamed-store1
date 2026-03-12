'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Settings, 
  LogOut, 
  ArrowLeft,
  ShoppingBag,
  Clock,
  ChevronRight,
  Shield,
  Home,
  Layers,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useRouter } from 'next/navigation'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export default function ProfilePage() {
  const { currentUser, logout, loading } = useAuth()
  const { settings } = useTheme()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/')
    }
  }, [currentUser, loading, router])

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* --- Navbar --- */}
      <nav className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <ShoppingBag size={20} />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              {settings.siteTitle || 'المتجر'}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 font-bold text-slate-600">
             <Link href="/" className="hover:text-primary transition-colors flex items-center gap-2">
                <Home size={18} /> الرئيسية
             </Link>
             <Link href="/services" className="hover:text-primary transition-colors flex items-center gap-2">
                <Layers size={18} /> الخدمات
             </Link>
             <Link href="/contact" className="hover:text-primary transition-colors flex items-center gap-2">
                <MessageSquare size={18} /> اتصل بنا
             </Link>
          </div>

          <div className="flex items-center gap-4">
             <button 
               onClick={() => logout()}
               className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-full font-bold hover:bg-red-100 transition-colors"
             >
                <LogOut size={18} />
                <span>خروج</span>
             </button>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
        
        {/* Profile Header */}
        <motion.div 
          variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row items-center gap-8 text-center md:text-right"
        >
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-5xl font-black shadow-xl shadow-primary/20">
            {currentUser.displayName ? currentUser.displayName[0] : (currentUser.email ? currentUser.email[0].toUpperCase() : 'U')}
          </div>
          <div className="flex-1 space-y-2">
             <h1 className="text-4xl font-black text-slate-800">{currentUser.displayName || 'مستخدم'}</h1>
             <p className="text-lg text-slate-500 font-medium flex items-center justify-center md:justify-end gap-2">
                <Mail size={18} className="text-slate-400" /> {currentUser.email}
             </p>
             <div className="flex flex-wrap gap-2 justify-center md:justify-end pt-2">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/10">حساب مفعل</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">عميل مميز</span>
             </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Quick Actions */}
          <motion.div 
            variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}
            className="md:col-span-1 space-y-4"
          >
             <h3 className="text-xl font-black text-slate-800 mr-2">وصلات سريعة</h3>
             <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-2">
                {[
                  { icon: Clock, title: 'طلباتي', href: '/orders' },
                  { icon: Shield, title: 'الأمان', href: '/security' },
                  { icon: Settings, title: 'الإعدادات', href: '/settings' }
                ].map((item, i) => (
                  <Link key={i} href={item.href} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors group">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary">
                           <item.icon size={20} />
                        </div>
                        <span className="font-bold text-slate-700">{item.title}</span>
                     </div>
                     <ChevronRight size={18} className="text-slate-300" />
                  </Link>
                ))}
             </div>
          </motion.div>

          {/* Activity/Placeholder */}
          <motion.div 
            variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}
            className="md:col-span-2 space-y-4"
          >
             <h3 className="text-xl font-black text-slate-800 mr-2">آخر النشاطات</h3>
             <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                   <Clock size={40} />
                </div>
                <p className="text-slate-400 font-bold">لا يوجد نشاط مسجل حالياً</p>
             </div>
          </motion.div>

        </div>

      </main>

      {/* --- Footer --- */}
      <footer className="bg-white py-12 border-t border-slate-200 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-slate-500 font-medium">
            © {new Date().getFullYear()} <span className="font-black text-primary">{settings.siteTitle}</span>. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  )
}
