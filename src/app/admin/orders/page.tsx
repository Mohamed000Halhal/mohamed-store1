'use client'

import React, { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { 
  collection, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  onSnapshot
} from 'firebase/firestore'
import { 
  CheckCircle2, 
  XCircle, 
  Truck, 
  Trash2, 
  Image as ImageIcon,
  Phone,
  MapPin,
  Calendar,
  Loader2,
  ShoppingBag
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Order {
  id: string
  name: string
  mobile: string
  address: string
  governorate: string
  productName: string
  quantity: number
  totalAmount: number
  paymentStatus: string
  deliveryStatus: string
  date: any
  depositScreenshot?: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('date', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[]
      setOrders(data)
      setLoading(false)
    }, (error) => {
      console.error("Error fetching orders:", error)
      toast.error("خطأ في تحميل الطلبات")
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const updateStatus = async (id: string, field: string, value: string) => {
    try {
      await updateDoc(doc(db, 'orders', id), { [field]: value })
      toast.success('تم تحديث الحالة')
    } catch (error) {
      console.error("Error updating order:", error)
      toast.error("خطأ في التحديث")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return
    try {
      await deleteDoc(doc(db, 'orders', id))
      toast.success('تم حذف الطلب')
    } catch (error) {
      console.error("Error deleting order:", error)
      toast.error("خطأ في الحذف")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">إدارة الطلبات</h1>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold">
          إجمالي الطلبات: {orders.length}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {orders.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
            <ShoppingBag className="mx-auto mb-4 text-slate-300" size={48} />
            <p className="text-slate-500">لا توجد طلبات حالياً</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all hover:border-primary/30">
              <div className="p-8">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-primary/30">
                      {order.name[0]}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-1">{order.name}</h2>
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <Calendar size={14} className="text-primary" />
                        {new Date(order.date).toLocaleString('ar-EG', { dateStyle: 'long', timeStyle: 'short' })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => updateStatus(order.id, 'deliveryStatus', 'sent')}
                      className={`px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold transition-all shadow-lg active:scale-95 ${
                        order.deliveryStatus === 'sent' 
                        ? 'bg-green-500 text-white shadow-green-500/30' 
                        : 'bg-slate-50 dark:bg-slate-800 hover:bg-green-500 hover:text-white text-slate-600 dark:text-slate-400 hover:shadow-green-500/30'
                      }`}
                    >
                      <Truck size={18} />
                      {order.deliveryStatus === 'sent' ? 'تم التسليم ✓' : 'تأكيد التسليم'}
                    </button>
                    <button 
                      onClick={() => handleDelete(order.id)}
                      className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all hover:scale-110"
                    >
                      <Trash2 size={22} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {/* Contact Info */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">بيانات التواصل</h3>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-3">
                      <div className="flex items-center gap-3 text-sm font-bold">
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                          <Phone size={16} className="text-primary" />
                        </div>
                        <span dir="ltr" className="text-slate-700 dark:text-slate-300">{order.mobile}</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm font-bold">
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm shrink-0">
                          <MapPin size={16} className="text-primary" />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{order.governorate} - {order.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">محتويات السلة</h3>
                    <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-2xl">
                      <div className="font-black text-lg text-slate-800 dark:text-white mb-1">{order.productName}</div>
                      <div className="text-sm font-bold text-primary flex justify-between items-center">
                        <span>الكمية: {order.quantity}</span>
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      </div>
                      <div className="mt-4 pt-4 border-t border-primary/10 flex justify-between items-end">
                        <span className="text-xs text-slate-500 font-bold">إجمالي المبلغ</span>
                        <div className="text-2xl font-black text-primary">{order.totalAmount.toLocaleString('ar-EG')} ج.م</div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">التحقق من الدفع</h3>
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => updateStatus(order.id, 'paymentStatus', 'paid')}
                        className={`px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                          order.paymentStatus === 'paid' 
                          ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/30' 
                          : 'border-slate-100 dark:border-slate-800 hover:border-blue-500 text-slate-500 hover:text-blue-500'
                        }`}
                      >
                        دفع كامل المبلغ
                      </button>
                      <button 
                        onClick={() => updateStatus(order.id, 'paymentStatus', 'deposit_paid')}
                        className={`px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                          order.paymentStatus === 'deposit_paid' 
                          ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/30' 
                          : 'border-slate-100 dark:border-slate-800 hover:border-orange-500 text-slate-500 hover:text-orange-500'
                        }`}
                      >
                        دفع العربون فقط
                      </button>
                    </div>
                    {order.depositScreenshot && (
                      <button className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-all">
                        <ImageIcon size={18} />
                        عرض إيصال التحويل
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
