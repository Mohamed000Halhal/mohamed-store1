'use client'

import React, { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { 
  collection, 
  query, 
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore'
import { 
  ShoppingBag,
  Search,
  Calendar,
  Loader2,
  PackageCheck,
  MapPin,
  Phone,
  User,
  Copy,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useLanguage } from '@/context/LanguageContext'

interface Order {
  id: string
  orderShortId?: string
  name: string
  mobile: string
  address: string
  governorate: string
  productName: string
  quantity: number
  totalAmount: number
  deliveryStatus: string
  date: any
  notes?: string
  secretaryName?: string
}

export default function DeliveredOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { t, dir } = useLanguage()

  useEffect(() => {
    const q = query(
      collection(db, 'orders'), 
      orderBy('date', 'desc')
    )
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[]
      
      const filtered = allData.filter(o => o.deliveryStatus === 'delivered')
      setOrders(filtered)
      setLoading(false)
    }, (error) => {
      console.error("Error fetching delivered orders:", error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleCopy = (text: string | undefined) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast.success('تم النسخ للحافظة')
  }

  const filteredOrders = orders.filter(order => 
    order.orderShortId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.mobile.includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8" dir={dir}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-[var(--heading-color)] dark:text-white flex items-center gap-3">
            <PackageCheck className="text-green-500" size={32} />
            {t('secretary.delivered_stat') || 'طلبات تم تسليمها'}
          </h1>
          <p className="text-slate-500 mt-1 font-bold">{t('admin.delivered_orders_desc') || 'عرض الطلبات التي تم تسليمها للعملاء بنجاح (قراءة فقط)'}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
            <input 
              type="text" 
              placeholder={t('common.search')}
              className={`${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 w-64 md:w-80 font-bold focus:ring-2 ring-primary/20 outline-none`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 px-6 py-3 rounded-2xl font-black shadow-sm">
            {t('common.total')}: {filteredOrders.length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 max-h-[800px] overflow-y-auto pr-4 custom-scrollbar">
        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-slate-800/50 p-16 rounded-[3rem] text-center border border-dashed border-slate-200 dark:border-slate-700">
            <ShoppingBag className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={64} />
            <p className="text-xl font-black text-slate-400">{t('order.no_orders')}</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl p-8 opacity-90 grayscale-[0.3] hover:grayscale-0 hover:opacity-100 transition-all">
              <div className="flex flex-wrap justify-between items-start gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-green-500/20">
                    <PackageCheck size={28} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h2 className="text-xl font-black text-slate-800 dark:text-white">{order.name}</h2>
                      <span className="text-primary font-black text-xs bg-primary/5 px-2 py-1 rounded-lg">ID: {order.orderShortId}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(order.date).toLocaleDateString('ar-EG')}
                      </div>
                      {order.secretaryName && (
                        <div className="flex items-center gap-1 text-primary">
                          <User size={12} />
                          {order.secretaryName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="text-[10px] font-black text-slate-400 uppercase">{t('order.total_amount')}</div>
                  <div className="text-xl font-black text-green-500">{order.totalAmount.toLocaleString('ar-EG')} {t('common.currency')}</div>
                </div>
              </div>

              {order.notes && (
                <div className="mt-4 flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                  <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] font-bold text-slate-500 whitespace-pre-wrap">{order.notes}</p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-700/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <Phone size={14} className="text-primary" />
                  <span dir="ltr">{order.mobile}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <MapPin size={14} className="text-primary" />
                  <span>{order.governorate} - {order.address}</span>
                </div>
                <div className="md:col-span-2 text-sm font-black text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl flex justify-between items-center">
                  <span>{order.productName}</span>
                  <span className="bg-white dark:bg-slate-800 px-3 py-1 rounded-lg text-primary shadow-sm border border-slate-100 dark:border-slate-700">{t('order.quantity')}: {order.quantity}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
