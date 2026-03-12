'use client'

import React, { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { 
  ShoppingBag, 
  Users, 
  CreditCard, 
  TrendingUp,
  Package,
  Clock,
  Loader2
} from 'lucide-react'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    activeProducts: 0,
    todayOrders: 0
  })

  useEffect(() => {
    // 1. Listen to all orders
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
      const orders = snap.docs.map(doc => doc.data())
      const totalSales = orders.reduce((sum, o: any) => sum + (o.totalAmount || 0), 0)
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayOrders = orders.filter((o: any) => new Date(o.date) >= today).length

      setStats(prev => ({
        ...prev,
        totalOrders: snap.size,
        totalSales,
        todayOrders
      }))
    })

    // 2. Listen to products
    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      setStats(prev => ({
        ...prev,
        activeProducts: snap.size
      }))
      setLoading(false)
    })

    return () => {
      unsubOrders()
      unsubProducts()
    }
  }, [])

  const statConfig = [
    { name: 'إجمالي الطلبات', value: stats.totalOrders.toString(), icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50' },
    { name: 'إجمالي المبيعات', value: `${stats.totalSales.toLocaleString('ar-EG')} ج.م`, icon: CreditCard, color: 'text-green-500', bg: 'bg-green-50' },
    { name: 'المنتجات النشطة', value: stats.activeProducts.toString(), icon: Package, color: 'text-purple-500', bg: 'bg-purple-50' },
    { name: 'طلبات اليوم', value: stats.todayOrders.toString(), icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
  ]

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-black mb-10 text-slate-800 dark:text-white">نظرة عامة</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {statConfig.map((stat) => (
          <div key={stat.name} className="relative group bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 rounded-3xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={28} />
              </div>
            </div>
            <h3 className="text-slate-400 dark:text-slate-500 text-sm font-black uppercase tracking-widest mb-2">{stat.name}</h3>
            <p className="text-3xl font-black text-slate-800 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black">أحدث التنبيهات</h2>
            <div className="px-4 py-1 bg-primary/10 text-primary text-xs font-black rounded-full">LIVE</div>
          </div>
          <div className="space-y-4">
            {stats.totalOrders > 0 ? (
              <p className="text-slate-500 text-sm">يتم تحديث البيانات لحظياً من قاعدة البيانات.</p>
            ) : (
              <div className="p-12 text-center text-slate-300">
                <Clock size={48} className="mx-auto mb-4 opacity-20" />
                <p>لا توجد بيانات حالياً</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary to-secondary p-8 rounded-[2.5rem] text-white shadow-2xl shadow-primary/20">
          <h2 className="text-2xl font-black mb-4">أداء المتجر</h2>
          <p className="text-white/80 leading-relaxed mb-6 font-medium">
            متجرك يعمل الآن بتقنيات Next.js الحديثة. البيانات تظهر هنا لحظياً بمجرد قيام أي عميل بطلب جديد.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur p-4 rounded-2xl">
              <div className="text-xs font-black opacity-60 mb-1 tracking-tighter">الحالة</div>
              <div className="font-black">متصل ✓</div>
            </div>
            <div className="bg-white/10 backdrop-blur p-4 rounded-2xl">
              <div className="text-xs font-black opacity-60 mb-1 tracking-tighter">السرعة</div>
              <div className="font-black">ممتازة</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
