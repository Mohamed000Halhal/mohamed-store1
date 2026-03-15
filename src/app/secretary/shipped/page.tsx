'use client'

import React, { useState, useEffect } from 'react'
import { db, auth } from '@/lib/firebase'
import { 
  collection, 
  query, 
  onSnapshot,
  getDocs,
  where
} from 'firebase/firestore'
import { 
  ShoppingBag,
  Search,
  Calendar,
  Loader2,
  Truck,
  MapPin,
  Phone,
  User,
  Copy,
  AlertCircle,
  PackageSearch
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useLanguage } from '@/context/LanguageContext'

interface Order {
  id: string
  orderShortId: string
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
  secretaryId: string
  secretaryName: string
  secretaryEmail?: string
}

export default function ShippedOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [secretary, setSecretary] = useState<any>(null)
  const { t, dir } = useLanguage()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const q = query(collection(db, 'secretaries'), where('email', '==', user.email))
        const snapshot = await getDocs(q)
        if (!snapshot.empty) {
          const data = { 
            id: snapshot.docs[0].id, 
            ...snapshot.docs[0].data(),
            email: user.email
          } as any
          setSecretary(data)
        } else {
          setSecretary({ email: user.email, name: user.email?.split('@')[0] || 'User' })
          setLoading(false)
        }
      } else {
        setSecretary(null)
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!secretary) return

    const q = query(collection(db, 'orders'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[]

      // Filter: my orders that have been shipped or delivered
      const myShippedOrders = allOrders.filter(o => {
        const isMine = (secretary.id && o.secretaryId === secretary.id) || 
                       (secretary.email && o.secretaryEmail === secretary.email)
        return isMine && (o.deliveryStatus === 'pending' || o.deliveryStatus === 'shipped' || o.deliveryStatus === 'delivered')
      })

      const sortedData = [...myShippedOrders].sort((a, b) => {
        const dateA = a.date?.toMillis ? a.date.toMillis() : (Number(a.date) || 0)
        const dateB = b.date?.toMillis ? b.date.toMillis() : (Number(b.date) || 0)
        return dateB - dateA
      })
      
      setOrders(sortedData)
      setLoading(false)
    }, (error) => {
      console.error("Shipped orders listener error:", error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [secretary])

  const handleCopy = (text: string | undefined) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast.success(t('common.success'))
  }

  const filteredOrders = orders.filter(order => 
    order.orderShortId?.includes(searchTerm) || 
    order.name?.includes(searchTerm) || 
    order.mobile?.includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-[var(--heading-color)] dark:text-white flex items-center gap-3">
            <Truck className="text-blue-500" size={32} />
            {t('sec_shipped_title')}
          </h1>
          <p className="text-slate-500 mt-1 font-bold">{t('sec_shipped_subtitle')}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className={`absolute ${dir === 'rtl' ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-slate-400`} size={20} />
            <input 
              type="text" 
              placeholder={t('common.search')}
              className={`w-full md:w-80 ${dir === 'rtl' ? 'pr-14 pl-6' : 'pl-14 pr-6'} py-5 rounded-[1.5rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 font-bold focus:ring-4 ring-primary/10 outline-none shadow-lg dark:shadow-none transition-all`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-6 py-3 rounded-2xl font-black shadow-sm">
            {t('sec_shipped_count')} {filteredOrders.length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar">
        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-slate-800/50 p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
            <PackageSearch className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={64} />
            <p className="text-xl font-black text-slate-400">{t('sec_shipped_empty')}</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl p-6 md:p-8 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex gap-4 md:gap-6 w-full md:w-auto">
                  <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-2xl bg-blue-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/20">
                    <Truck size={24} className="md:w-7 md:h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h2 className="text-xl font-black text-slate-800 dark:text-white truncate">{order.name}</h2>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 bg-primary/5 dark:bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/10 w-fit">
                          <span className="text-primary font-black text-[11px] tracking-wider uppercase">ID: {order.orderShortId}</span>
                          <button 
                            onClick={() => handleCopy(order.orderShortId)}
                            className="text-slate-400 hover:text-primary transition-all p-0.5"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                        <div className={`px-3 py-1.5 rounded-xl border text-xs font-black w-fit ${
                          order.deliveryStatus === 'delivered'
                            ? 'bg-green-50 dark:bg-green-500/10 text-green-500 border-green-100 dark:border-green-500/20'
                            : 'bg-blue-50 dark:bg-blue-500/10 text-blue-500 border-blue-100 dark:border-blue-500/20'
                        }`}>
                          {order.deliveryStatus === 'delivered' ? t('order.status_delivered') : t('sec_shipped_waiting')}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs font-bold text-slate-400">
                      <div className="flex items-center gap-1 min-w-0">
                        <Calendar size={12} className="shrink-0" />
                        <span className="truncate">{new Date(order.date?.toMillis ? order.date.toMillis() : order.date).toLocaleDateString('ar-EG')}</span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <Phone size={14} className="text-primary shrink-0" />
                        <span dir="ltr" className="truncate">{order.mobile}</span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin size={14} className="text-primary shrink-0" />
                        <span className="truncate">{order.governorate} - {order.address}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col justify-between items-center md:items-end w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-700">
                  <div className="text-[10px] font-black text-slate-400 uppercase">{t('order.total_amount')}</div>
                  <div className="text-xl font-black text-blue-500">{order.totalAmount?.toLocaleString(dir === 'rtl' ? 'ar-EG' : 'en-US')} {t('common.currency')}</div>
                </div>
              </div>

              {order.notes && (
                <div className="mt-4 flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                  <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] font-bold text-slate-500 whitespace-pre-wrap">{order.notes}</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700/50 text-sm font-black text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl flex justify-between items-center">
                <span>{order.productName}</span>
                <span className="bg-white dark:bg-slate-800 px-3 py-1 rounded-lg text-primary shadow-sm border border-slate-100 dark:border-slate-700">{t('sec_shipped_qty')} {order.quantity}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
