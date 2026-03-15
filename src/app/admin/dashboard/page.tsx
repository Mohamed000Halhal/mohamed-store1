'use client'

import React, { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, where, doc } from 'firebase/firestore'
import { useLanguage } from '@/context/LanguageContext'
import toast from 'react-hot-toast'
import {
  ShoppingBag,
  Users,
  CreditCard,
  TrendingUp,
  Package,
  Clock,
  Loader2,
  Search,
  LogOut,
  AlertCircle,
  DollarSign,
  Undo2,
  RefreshCcw,
  X,
  Menu,
  Languages,
  Sun,
  Moon,
  Smartphone,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  FileText
} from 'lucide-react'


export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [allOrdersData, setAllOrdersData] = useState<any[]>([])
  const [activeProductsCount, setActiveProductsCount] = useState(0)
  const [resetTimestamp, setResetTimestamp] = useState<number>(0)
  const [startDateFormatted, setStartDateFormatted] = useState<string>('')
  const [totalDevices, setTotalDevices] = useState(0)

  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
      const allOrders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[]
      setAllOrdersData(allOrders)
    }, (err) => {
      console.warn("Dashboard Orders Listener Permission Error:", err)
    })

    // 2. Listen to products
    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      setActiveProductsCount(snap.size)
      setLoading(false)
    }, (err) => {
      console.warn("Dashboard Products Listener Permission Error:", err)
      setLoading(false)
    })
    
    // 3. Listen to system settings (for resetTimestamp)
    const unsubSettings = onSnapshot(doc(db, 'system_settings', 'dashboard'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().resetTimestamp) {
        const ms = docSnap.data().resetTimestamp.toMillis ? docSnap.data().resetTimestamp.toMillis() : docSnap.data().resetTimestamp;
        setResetTimestamp(ms)
        setStartDateFormatted(new Date(ms).toLocaleDateString())
      } else {
        setResetTimestamp(0)
      }
    }, (err) => {
      console.warn("Dashboard Settings Listener Permission Error:", err)
    })

    // 4. Listen to active devices heartbeat
    const unsubDevices = onSnapshot(collection(db, 'active_devices'), (snap) => {
      let activeCount = 0;
      const now = Date.now();
      snap.forEach(doc => {
        const data = doc.data();
        if (data.role === 'admin' && data.isOnline !== false) {
           const lastSeenMs = data.lastSeen; 
           if (typeof lastSeenMs === 'number' && (now - lastSeenMs) <= 150000) { 
             activeCount++
           }
        }
      })
      setTotalDevices(activeCount)
    }, (err) => {
      console.warn("Dashboard Devices Listener Permission Error:", err)
    })

    // Active devices sweep interval to trigger re-renders to remove stale devices visually
    const timer = setInterval(() => {
      // Force a slight state update to re-evaluate active timers if needed, handled passively
    }, 60000)

    return () => {
      unsubOrders()
      unsubProducts()
      unsubSettings()
      unsubDevices()
      clearInterval(timer)
    }
  }, [])

  const handleResetTotalSales = async () => {
    if (!confirm(t('admin.dashboard_total_sales_confirm'))) return
    try {
      const { setDoc, serverTimestamp } = await import('firebase/firestore')
      await setDoc(doc(db, 'system_settings', 'dashboard'), {
        resetTimestamp: serverTimestamp()
      }, { merge: true })
      toast.success(t('admin.dashboard_reset_success'))
    } catch (error) {
      console.error(error)
      toast.error(t('admin.dashboard_reset_error'))
    }
  }

  // Derive stats
  const visibleOrders = allOrdersData.filter((o: any) => o.deliveryStatus !== 'registered')
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayOrders = visibleOrders.filter((o: any) => {
    const orderDate = o.date?.toMillis ? new Date(o.date.toMillis()) : new Date(o.date)
    return orderDate >= today
  }).length
  
  const returnedOrders = visibleOrders.filter((o: any) => o.deliveryStatus === 'returned').length

  // Only calculate sales for delivered orders AFTER the reset timestamp
  const totalSales = allOrdersData
    .filter((o: any) => {
      if (o.deliveryStatus !== 'delivered') return false;
      const orderTime = o.date?.toMillis ? o.date.toMillis() : (Number(o.date) || 0)
      return orderTime >= resetTimestamp
    })
    .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0)

  const { t, dir } = useLanguage()

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    )
  }

  return (
    <div className="animate-fade-in transition-colors duration-500 relative min-h-screen" dir={dir}>
      {/* Content wrapper */}
      <div className="relative z-10">
        <h1 className="text-4xl font-black mb-10 text-[var(--heading-color)]">{t('nav.dashboard')}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Total Sales */}
          <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-md p-6 xl:p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-700 shadow-xl shadow-slate-200/20 dark:shadow-none flex items-center justify-between group hover:border-primary/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                <DollarSign size={28} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{t('admin.total_sales') || 'إجمالي المبيعات'}</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{totalSales.toLocaleString()} {t('common.currency')}</h3>
                {resetTimestamp > 0 && (
                  <p className="text-[10px] font-bold text-slate-400 mt-1">{t('admin.dashboard_sales_start')} {startDateFormatted}</p>
                )}
              </div>
            </div>
            <button 
              onClick={handleResetTotalSales}
              title={t('admin.dashboard_reset_title')}
              className="p-3 bg-slate-50 hover:bg-red-50 dark:bg-slate-700/50 dark:hover:bg-red-900/40 text-slate-400 hover:text-red-500 rounded-xl transition-all shadow-sm active:scale-90 relative z-20"
            >
              <RefreshCcw size={18} />
            </button>
          </div>

          {/* Active Products */}
          <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-md p-6 xl:p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-700 shadow-xl shadow-slate-200/20 dark:shadow-none flex items-center justify-between group hover:border-primary/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Package size={28} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{t('admin.active_products')}</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{activeProductsCount}</h3>
              </div>
            </div>
          </div>

          {/* Total Devices */}
          <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-md p-6 xl:p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-700 shadow-xl shadow-slate-200/20 dark:shadow-none flex items-center justify-between group hover:border-primary/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <Smartphone size={28} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{t('admin.total_devices') || 'عدد الأجهزة'}</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{totalDevices}</h3>
                {resetTimestamp > 0 && (
                  <p className="text-[10px] font-bold text-slate-400 mt-1">{t('admin.dashboard_sales_start')} {startDateFormatted}</p>
                )}
              </div>
            </div>
          </div>

          {/* Today's Orders */}
          <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-md p-6 xl:p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-700 shadow-xl shadow-slate-200/20 dark:shadow-none flex items-center justify-between group hover:border-primary/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/40 flex items-center justify-center text-orange-500 dark:text-orange-400 group-hover:scale-110 transition-transform">
                <Clock size={28} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{t('admin.today_orders')}</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{todayOrders}</h3>
              </div>
            </div>
          </div>

          {/* Returned Orders */}
          <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-md p-6 xl:p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-700 shadow-xl shadow-slate-200/20 dark:shadow-none flex items-center justify-between group hover:border-primary/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                <Undo2 size={28} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{t('admin.dashboard_returned_orders')}</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{returnedOrders}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
