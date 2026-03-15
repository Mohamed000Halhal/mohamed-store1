'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Mail, 
  Settings, 
  LogOut, 
  ShoppingBag,
  Clock,
  Shield,
  Home,
  Layers,
  MessageSquare,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'
import { useRouter } from 'next/navigation'
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { updateProfile, sendPasswordResetEmail } from 'firebase/auth'
import toast from 'react-hot-toast'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageToggle from '@/components/LanguageToggle'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

interface Order {
  id: string
  productName: string
  totalAmount: number
  paymentStatus: string
  deliveryStatus: string
  date: string
}

export default function ProfilePage() {
  const { currentUser, logout, loading: authLoading } = useAuth()
  const { settings } = useTheme()
  const { t, language } = useLanguage()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState<'orders' | 'settings' | 'security'>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [newName, setNewName] = useState(currentUser?.displayName || '')
  const [updatingName, setUpdatingName] = useState(false)

  // Auth Protection
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/')
    }
  }, [currentUser, authLoading, router])

  // Fetch Orders
  useEffect(() => {
    if (!currentUser) return
    
    const q = query(
      collection(db, 'orders'), 
      where('userId', '==', currentUser.uid),
      orderBy('date', 'desc')
    )
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[]
      setOrders(fetchedOrders)
      setOrdersLoading(false)
    }, (err) => {
      console.error("Orders Fetch Error:", err)
      setOrdersLoading(false)
    })

    return () => unsubscribe()
  }, [currentUser])

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !newName) return
    setUpdatingName(true)
    try {
      await updateProfile(currentUser, { displayName: newName })
      toast.success(language === 'ar' ? 'تم تحديث الاسم بنجاح' : 'Name updated successfully')
    } catch (error) {
       console.error(error)
       toast.error(language === 'ar' ? 'حدث خطأ أثناء التحديث' : 'Error updating name')
    } finally {
      setUpdatingName(false)
    }
  }

  const handleResetPassword = async () => {
    if (!currentUser?.email) return
    try {
      await sendPasswordResetEmail(auth, currentUser.email)
      toast.success(language === 'ar' ? 'تم إرسال بريد إعادة التعيين' : 'Reset email sent')
    } catch (error) {
      console.error(error)
      toast.error(language === 'ar' ? 'حدث خطأ' : 'Error')
    }
  }

  if (authLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
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
             <Link href="/contact" className="hover:text-primary transition-colors flex items-center gap-2">
                <MessageSquare size={18} /> {t('nav.contact')}
             </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
             <ThemeToggle />
             <LanguageToggle />
             <button 
               onClick={() => logout()}
               className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
             >
                <LogOut size={18} />
                <span className="hidden sm:inline">{t('nav.logout')}</span>
             </button>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
        
        {/* Profile Header */}
        <motion.div 
          variants={fadeUp} initial="hidden" animate="visible"
          className="bg-[var(--card-color)] rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-slate-100 dark:border-slate-800 mb-8 flex flex-col md:flex-row items-center gap-8 text-center md:text-right"
        >
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-5xl font-black shadow-xl shadow-primary/20">
            {currentUser.displayName ? currentUser.displayName[0] : (currentUser.email ? currentUser.email[0].toUpperCase() : 'U')}
          </div>
          <div className="flex-1 space-y-2">
             <h1 className="text-4xl font-black">{currentUser.displayName || t('nav.profile')}</h1>
             <p className="text-lg text-slate-500 font-medium flex items-center justify-center md:justify-end gap-2">
                <Mail size={18} className="text-slate-400" /> {currentUser.email}
             </p>
             <div className="flex flex-wrap gap-2 justify-center md:justify-end pt-2">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/10">Active Account</span>
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold rounded-full">Premium Client</span>
             </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Tabs Menu */}
          <motion.div 
            variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}
            className="md:col-span-1 space-y-4"
          >
             <h3 className="text-xl font-black mr-2 uppercase tracking-wider text-slate-400">{t('profile.title')}</h3>
             <div className="bg-[var(--card-color)] rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 space-y-2">
                {[
                  { id: 'orders', icon: Clock, title: t('profile.orders') },
                  { id: 'settings', icon: Settings, title: t('profile.settings') },
                  { id: 'security', icon: Lock, title: t('profile.security') }
                ].map((item) => (
                  <button 
                    key={item.id} 
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${activeTab === item.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === item.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-primary'}`}>
                           <item.icon size={20} />
                        </div>
                        <span className="font-bold">{item.title}</span>
                     </div>
                  </button>
                ))}
             </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div 
            variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}
            className="md:col-span-2 space-y-4"
          >
             <AnimatePresence mode="wait">
                {activeTab === 'orders' && (
                  <motion.div 
                    key="orders"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                     <h3 className="text-xl font-black mr-2">{t('profile.orders')}</h3>
                     {ordersLoading ? (
                       <div className="bg-[var(--card-color)] rounded-3xl p-12 flex justify-center border border-slate-100 dark:border-slate-800">
                          <Loader2 className="animate-spin text-primary" size={32} />
                       </div>
                     ) : orders.length === 0 ? (
                       <div className="bg-[var(--card-color)] rounded-3xl p-12 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
                          <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                             <Clock size={40} />
                          </div>
                          <p className="text-slate-400 font-bold">{t('orders.empty')}</p>
                       </div>
                     ) : (
                       <div className="space-y-4">
                          {orders.map((order) => (
                            <div key={order.id} className="bg-[var(--card-color)] p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                               <div className="space-y-1">
                                  <h4 className="font-black text-lg line-clamp-1">{order.productName || 'منتج'}</h4>
                                  <div className="flex gap-3 text-xs font-bold text-slate-400">
                                     <span>{new Date(order.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                                     <span>•</span>
                                     <span className="text-primary">{order.totalAmount.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')} {t('common.currency')}</span>
                                  </div>
                               </div>
                               <div className="flex gap-2">
                                  <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${order.deliveryStatus === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                     {order.deliveryStatus || 'Pending'}
                                  </span>
                               </div>
                            </div>
                          ))}
                       </div>
                     )}
                  </motion.div>
                )}

                {activeTab === 'settings' && (
                  <motion.div 
                    key="settings"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                     <h3 className="text-xl font-black mr-2">{t('profile.settings')}</h3>
                     <div className="bg-[var(--card-color)] rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <form onSubmit={handleUpdateName} className="space-y-6">
                           <div className="space-y-2">
                              <label className="text-sm font-black text-slate-400 mr-2">{t('profile.name_label')}</label>
                              <input 
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-primary outline-none transition-all font-bold"
                              />
                           </div>
                           <button 
                             disabled={updatingName}
                             type="submit"
                             className="px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                           >
                              {updatingName ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                              {t('profile.save')}
                           </button>
                        </form>
                     </div>
                  </motion.div>
                )}

                {activeTab === 'security' && (
                  <motion.div 
                    key="security"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                     <h3 className="text-xl font-black mr-2">{t('profile.security')}</h3>
                     <div className="bg-[var(--card-color)] rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                        <div className="flex items-start gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                              <AlertCircle size={24} />
                           </div>
                           <div className="space-y-1">
                              <h4 className="font-bold text-lg">{t('profile.reset_pass')}</h4>
                              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                 {t('profile.reset_desc')}
                              </p>
                           </div>
                        </div>
                        <button 
                          onClick={handleResetPassword}
                          className="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                           <Mail size={20} />
                           {t('profile.send_email')}
                        </button>
                     </div>
                  </motion.div>
                )}
             </AnimatePresence>
          </motion.div>

        </div>

      </main>

      {/* --- Footer --- */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-slate-500 font-medium">
            © {new Date().getFullYear()} <span className="font-black text-primary">{settings.siteTitle}</span>. {t('footer.copyright')}
          </p>
        </div>
      </footer>
    </div>
  )
}
