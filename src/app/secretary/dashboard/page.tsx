'use client'

import React, { useState, useEffect } from 'react'
import { db, auth } from '@/lib/firebase'
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  doc,
  updateDoc,
  getDocs
} from 'firebase/firestore'
import { 
  Plus,
  Search,
  LogOut,
  Package,
  TrendingUp,
  AlertCircle,
  Clock,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  X,
  Menu,
  Languages,
  Sun,
  Moon,
  Smartphone,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  FileText,
  ShoppingBag,
  User,
  Phone,
  MapPin,
  Hash,
  Truck,
  XCircle,
  Copy,
  LayoutDashboard,
  PackageSearch,
  Loader2
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
  deliveryStatus: string // 'pending' | 'shipped' | 'cancelled'
  paymentStatus: string // 'unpaid' | 'deposit_paid' | 'paid'
  date: any
  notes?: string
  secretaryId: string
  secretaryName: string
  secretaryEmail?: string
}

export default function SecretaryDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState<{ id: string, name: string } | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [secretary, setSecretary] = useState<any>(null)
  const { t, dir } = useLanguage()
  
  // Stats
  const [deliveredCount, setDeliveredCount] = useState(0)
  const [returnedCount, setReturnedCount] = useState(0)
  const [monthlySalary, setMonthlySalary] = useState(0)

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    governorate: '',
    address: '',
    productName: '',
    quantity: 1,
    totalAmount: 0,
    pricePerUnit: 0,
    notes: ''
  })

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const q = query(collection(db, 'secretaries'), where('email', '==', user.email))
        const snapshot = await getDocs(q)
        if (!snapshot.empty) {
          const docData = snapshot.docs[0].data()
          const data = { 
            id: snapshot.docs[0].id, 
            ...docData,
            email: user.email // Force email from auth to be sure
          } as any
          setSecretary(data)
          setDeliveredCount(data.deliveredCount || 0)
          setReturnedCount(data.returnedCount || 0)
          setMonthlySalary(data.monthlySalary || (data.deliveredCount || 0) * 50)
        } else {
          console.warn("Secretary profile not found for email:", user.email)
          setSecretary({ email: user.email, name: user.email?.split('@')[0] || 'User' }) // Fallback profile so app doesn't break
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
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setProducts(data)
    }, (error) => {
      console.error("Products listener error:", error)
    })

    return () => unsub()
  }, [])

  // Refined useEffect for orders once secretary state is ready
  useEffect(() => {
    if (!secretary) return

    // Fetch ALL orders and filter client-side for maximum reliability
    // This avoids issues with Firestore security rules or index requirements
    const q = query(collection(db, 'orders'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[]

      // Filter by BOTH secretaryId AND secretaryEmail for robustness
      const myOrders = allOrders.filter(o => {
        if (secretary.id && o.secretaryId === secretary.id) return true
        if (secretary.email && o.secretaryEmail === secretary.email) return true
        return false
      })

      // Robust Sort: Handle both Timestamp and Number, fallback to 0
      const sortedData = [...myOrders].sort((a, b) => {
        const dateA = a.date?.toMillis ? a.date.toMillis() : (Number(a.date) || 0)
        const dateB = b.date?.toMillis ? b.date.toMillis() : (Number(b.date) || 0)
        return dateB - dateA
      })
      
      setOrders(sortedData)
      setLoading(false)
    }, (error) => {
      console.error("Orders listener error:", error)
      setLoading(false)
    })

    // Only listen to secretary doc updates if we have a real ID
    let secUnsub = () => {}
    if (secretary.id) {
      secUnsub = onSnapshot(doc(db, 'secretaries', secretary.id), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          setDeliveredCount(data.deliveredCount || 0)
          setReturnedCount(data.returnedCount || 0)
          setMonthlySalary(data.monthlySalary || (data.deliveredCount || 0) * 50)
        }
      }, (error) => {
        console.warn("Secretary profile listener error:", error)
      })
    }

    return () => {
      unsubscribe()
      secUnsub()
    }
  }, [secretary])

  const generateOrderShortId = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  const handleProductSelect = (productName: string) => {
    const product = products.find(p => p.name === productName)
    if (product) {
      setFormData(prev => ({
        ...prev,
        productName,
        pricePerUnit: product.price,
        totalAmount: product.price * prev.quantity
      }))
    }
  }

  const handleQuantityChange = (qty: number) => {
    setFormData(prev => ({
      ...prev,
      quantity: qty,
      totalAmount: prev.pricePerUnit * qty
    }))
  }

  const resetAddForm = () => {
    setShowAddForm(false)
    setOrderSuccess(null)
    setShowConfirmModal(false)
    setFormData({
      name: '',
      mobile: '',
      governorate: '',
      address: '',
      productName: '',
      quantity: 1,
      totalAmount: 0,
      pricePerUnit: 0,
      notes: ''
    })
  }

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!secretary) return
    
    if (!formData.productName) {
      toast.error(t('order.error_select_product'))
      return
    }

    setShowConfirmModal(true)
  }

  const confirmAddOrder = async () => {
    setLoading(true)
    setShowConfirmModal(false)
    try {
      const shortId = generateOrderShortId()
      
      const { pricePerUnit, ...orderData } = formData
      await addDoc(collection(db, 'orders'), {
        ...orderData,
        orderShortId: shortId,
        deliveryStatus: 'registered',
        paymentStatus: 'unpaid',
        date: Date.now(), // Fixed numeric date for immediate local sorting
        createdAt: serverTimestamp(),
        secretaryId: secretary.id || 'unknown',
        secretaryName: secretary.name || 'Unknown',
        secretaryEmail: secretary.email,
        notes: formData.notes || ''
      })

      const finalShortId = shortId
      const customerName = formData.name
      toast.success(t('order.success') + ` #${finalShortId}`)
      setOrderSuccess({ id: finalShortId, name: customerName })
      
      setFormData({
        name: '',
        mobile: '',
        governorate: '',
        address: '',
        productName: '',
        quantity: 1,
        totalAmount: 0,
        pricePerUnit: 0,
        notes: ''
      })
    } catch (error) {
      console.error(error)
      toast.error(t('order.error'))
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!confirm(t('common.confirm_action'))) return

    try {
      if (newStatus === 'shipped') {
        await updateDoc(doc(db, 'orders', orderId), {
          deliveryStatus: 'pending',
          shippedAt: Date.now()
        })
        toast.success(t('sec_dash_send_success'))
      } else {
        await updateDoc(doc(db, 'orders', orderId), {
          deliveryStatus: newStatus
        })
        toast.success(t('common.success'))
      }
    } catch (error) {
      toast.error(t('common.error'))
    }
  }

  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        paymentStatus: newStatus
      })
      toast.success(newStatus === 'deposit_paid' ? t('sec_dash_send_deposit') : t('common.success'))
    } catch (error) {
      toast.error(t('common.error'))
    }
  }

  const handleCopy = (text: string | undefined) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast.success(t('common.success'))
  }

  // Only show active orders (registered). Shipped/cancelled go to separate pages.
  const activeOrders = orders.filter(order => 
    order.deliveryStatus === 'registered'
  )

  const filteredOrders = activeOrders.filter(order => 
    order.orderShortId.includes(searchTerm) || 
    order.name.includes(searchTerm) || 
    order.mobile.includes(searchTerm)
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome & Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-l from-primary to-secondary p-8 rounded-[2.5rem] text-white flex flex-col justify-center relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="relative z-10">
            <h1 className="text-3xl font-black mb-2">{t('secretary.welcome')}, {secretary?.name} 👋</h1>
            <p className="opacity-90 font-bold">{t('secretary.pending_orders').replace('{count}', activeOrders.length.toString())}</p>
          </div>
          <ShoppingBag className="absolute -left-8 -bottom-8 opacity-10 w-64 h-64" />
        </div>

        <div className="bg-white dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center justify-between group hover:border-primary/50 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{t('secretary.delivered_stat')}</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{deliveredCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center justify-between group hover:border-primary/50 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <Package size={28} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{t('order.status_returned')}</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{returnedCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center justify-between group hover:border-primary/50 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <DollarSign size={28} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{t('sec_salary_expected')}</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{monthlySalary.toLocaleString()} {t('common.currency')}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Actions & Search Row */}
      <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4 xl:gap-6">
        <div className="flex bg-white dark:bg-slate-800 p-2 rounded-[2rem] shadow-lg border border-slate-100 dark:border-slate-700 w-full xl:w-auto">
          <button 
             onClick={() => {
               if (confirm(t('order.confirm_add_new_msg'))) {
                 setShowAddForm(true)
               }
             }}
             className="bg-primary hover:bg-primary/90 text-white w-full px-8 py-4 rounded-3xl xl:rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            <Plus size={24} />
            {t('order.add_new')}
          </button>
        </div>

        <div className="relative w-full xl:w-96">
          <Search className={`absolute ${dir === 'rtl' ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-slate-400`} size={20} />
          <input 
            type="text" 
            placeholder={t('common.search')}
            className={`w-full ${dir === 'rtl' ? 'pr-14 pl-6' : 'pl-14 pr-6'} py-5 rounded-[2rem] xl:rounded-[1.5rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 font-bold focus:ring-4 ring-primary/10 outline-none shadow-lg dark:shadow-none transition-all`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <LayoutDashboard className="text-primary" size={24} />
          <h2 className="text-xl font-black text-slate-800 dark:text-white">{t('secretary.recent_orders')}</h2>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-slate-800/50 p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
            <PackageSearch className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={64} />
            <p className="text-xl font-black text-slate-400">{t('order.no_orders')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-[var(--card-color)] rounded-[2.5rem] border border-[var(--border-color)] shadow-xl shadow-slate-200/30 dark:shadow-none overflow-hidden transition-all hover:border-primary/40 group">
                <div className="p-8">
                  <div className="flex flex-wrap justify-between items-start gap-6">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center font-black text-2xl text-primary border border-slate-100 dark:border-slate-800 shadow-inner">
                          {order.name[0]}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center ${
                          order.deliveryStatus === 'shipped' || order.deliveryStatus === 'pending' ? 'bg-blue-500' : 
                          order.deliveryStatus === 'cancelled' ? 'bg-red-500' : 'bg-amber-500'
                        }`}>
                          {order.deliveryStatus === 'shipped' || order.deliveryStatus === 'pending' ? <Truck size={10} className="text-white" /> : 
                           order.deliveryStatus === 'cancelled' ? <XCircle size={10} className="text-white" /> : <Clock size={10} className="text-white" />}
                        </div>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="text-2xl font-black text-slate-800 dark:text-white">{order.name}</h3>
                          <div className="flex items-center gap-2 bg-primary/5 dark:bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/10 group/id">
                            <span className="text-primary font-black text-[11px] tracking-wider uppercase">ID: {order.orderShortId}</span>
                            <button 
                              onClick={() => handleCopy(order.orderShortId)}
                              className="text-slate-400 hover:text-primary transition-all p-0.5"
                              title="Copy ID"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
                          <div className="flex items-center gap-2 group/copy">
                            <Phone size={14} className="text-primary" />
                            <span dir="ltr">{order.mobile}</span>
                            <button 
                              onClick={() => handleCopy(order.mobile)}
                              className="p-1 text-slate-300 hover:text-primary transition-colors opacity-0 group-hover/copy:opacity-100"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 group/copy">
                            <MapPin size={14} className="text-primary" />
                            <span>{order.governorate} - {order.address}</span>
                            <button 
                              onClick={() => handleCopy(`${order.governorate} - ${order.address}`)}
                              className="p-1 text-slate-300 hover:text-primary transition-colors opacity-0 group-hover/copy:opacity-100"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                          {order.notes && (
                            <div className="flex items-start gap-2 mt-3 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                              <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                              <p className="text-[11px] font-bold text-slate-500 whitespace-pre-wrap">{order.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-4">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('order.total_amount')}</p>
                        <p className="text-2xl font-black text-primary">{order.totalAmount.toLocaleString(dir==='rtl'?'ar-EG':'en-US')} {t('common.currency')}</p>
                      </div>
                      
                      {(order.deliveryStatus === 'pending' || order.deliveryStatus === 'registered') ? (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => updateOrderStatus(order.id, 'shipped')}
                              className="flex-1 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-black text-sm transition-all shadow-lg shadow-primary/20 active:scale-95"
                            >
                              {t('order.status_shipped')}
                            </button>
                            <button 
                              onClick={() => updateOrderStatus(order.id, 'cancelled')}
                              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-black text-sm transition-all shadow-lg shadow-red-500/20 active:scale-95"
                            >
                              {t('sec_dash_cancelled')}
                            </button>
                          </div>
                      ) : (
                        <div className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                          order.deliveryStatus === 'shipped' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500 border border-blue-100 dark:border-blue-500/20' : 
                          'bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-100 dark:border-red-500/20'
                        }`}>
                          {order.deliveryStatus === 'shipped' ? t('order.waiting_admin') : t('order.cancelled_label')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Order Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8 md:p-12 shadow-2xl border border-slate-100 dark:border-slate-700 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10" />
            
            {orderSuccess ? (
              <div className="text-center py-8 animate-in zoom-in-95 duration-300">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4">{t('order.success')}</h2>
                <p className="text-slate-500 font-bold mb-8 text-xl">
                  {t('order.customer_name')}: <span className="text-slate-800 dark:text-slate-200">{orderSuccess.name}</span>
                  <br />
                  ID: <span className="text-primary font-black">#{orderSuccess.id}</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => setOrderSuccess(null)}
                    className="flex-1 bg-primary text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Plus size={20} />
                    {t('sec_dash_add_another')}
                  </button>
                  <button 
                    onClick={resetAddForm}
                    className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-5 rounded-[1.5rem] font-black transition-all active:scale-95"
                  >
                    {t('common.cancel')} {t('nav.dashboard')}
                  </button>
                </div>
              </div>
            ) : showConfirmModal ? (
              <div className="text-center py-8 animate-in zoom-in-95 duration-300">
                <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <AlertTriangle size={48} />
                </div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4">{t('sec_dash_confirm_add_title')}</h2>
                <p className="text-slate-500 font-bold mb-8 text-lg">
                  {t('sec_dash_will_add')} <span className="text-primary font-black">{formData.name}</span>
                  <br />
                  {t('sec_dash_with_amount')} <span className="text-primary font-black">{formData.totalAmount} {t('common.currency')}</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={confirmAddOrder}
                    className="flex-1 bg-primary text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-primary/30 transition-all active:scale-95"
                  >
                    {t('sec_dash_confirm_save')}
                  </button>
                  <button 
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-5 rounded-[1.5rem] font-black transition-all active:scale-95"
                  >
                    {t('sec_dash_undo_edit')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-4">
                  <div className="p-3 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20">
                    <Plus size={24} />
                  </div>
                  {t('order.add_new')}
                </h2>

                <form onSubmit={handleAddOrder} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">{t('order.customer_name')}</label>
                    <div className="relative">
                      <User className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
                      <input 
                        type="text" required
                        className={`w-full ${dir === 'rtl' ? 'pr-12' : 'pl-12'} pl-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 font-bold focus:ring-4 ring-primary/10 transition-all outline-none`}
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">{t('order.mobile')}</label>
                    <div className="relative">
                      <Phone className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
                      <input 
                        type="tel" required
                        className={`w-full ${dir === 'rtl' ? 'pr-12' : 'pl-12'} pl-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 font-bold focus:ring-4 ring-primary/10 transition-all outline-none`}
                        value={formData.mobile}
                        onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">{t('order.governorate')}</label>
                    <div className="relative">
                      <MapPin className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
                      <input 
                        type="text" required
                        className={`w-full ${dir === 'rtl' ? 'pr-12' : 'pl-12'} pl-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 font-bold focus:ring-4 ring-primary/10 transition-all outline-none`}
                        value={formData.governorate}
                        onChange={(e) => setFormData({...formData, governorate: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">{t('order.address')}</label>
                    <div className="relative">
                      <AlertCircle className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
                      <input 
                        type="text" required
                        className={`w-full ${dir === 'rtl' ? 'pr-12' : 'pl-12'} pl-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 font-bold focus:ring-4 ring-primary/10 transition-all outline-none`}
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">{t('order.product_name')}</label>
                    <div className="relative">
                      <ShoppingBag className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
                      <select 
                        required
                        className={`w-full ${dir === 'rtl' ? 'pr-12' : 'pl-12'} pl-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 font-bold focus:ring-4 ring-primary/10 transition-all outline-none appearance-none`}
                        value={formData.productName}
                        onChange={(e) => handleProductSelect(e.target.value)}
                      >
                        <option value="">{t('order.select_product')}</option>
                        {products.map(p => (
                          <option key={p.id} value={p.name}>{p.name} - {p.price} {t('common.currency')}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">{t('order.quantity')}</label>
                    <div className="relative">
                      <Hash className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
                      <input 
                        type="number" required min="1"
                        className={`w-full ${dir === 'rtl' ? 'pr-12' : 'pl-12'} pl-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 font-bold focus:ring-4 ring-primary/10 transition-all outline-none`}
                        value={formData.quantity}
                        onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">{t('order.total_amount')}</label>
                    <div className="relative">
                      <Plus className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
                      <input 
                        type="number" required min="0"
                        className={`w-full ${dir === 'rtl' ? 'pr-12' : 'pl-12'} pl-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 font-black text-primary transition-all outline-none`}
                        value={formData.totalAmount}
                        onChange={(e) => setFormData({...formData, totalAmount: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">{t('order.notes')}</label>
                    <textarea 
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 font-bold focus:ring-4 ring-primary/10 transition-all outline-none resize-none"
                      rows={3}
                      placeholder={t('order.notes_placeholder')}
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>

                  <div className="flex gap-4 pt-4 md:col-span-2">
                    <button 
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-primary text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : t('order.submit')}
                    </button>
                    <button 
                      type="button"
                      onClick={resetAddForm}
                      className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-5 rounded-[1.5rem] font-black transition-all active:scale-95"
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
