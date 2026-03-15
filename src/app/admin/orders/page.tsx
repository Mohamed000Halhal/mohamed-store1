'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { db } from '@/lib/firebase'
import { 
  collection, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  orderBy,
  onSnapshot,
  increment,
  getDoc,
  addDoc,
  serverTimestamp,
  getDocs
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
  ShoppingBag,
  Search,
  User,
  AlertCircle,
  PackageCheck,
  Undo2,
  Plus,
  Hash,
  Copy,
  ChevronDown
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
  paymentStatus: string
  deliveryStatus: string
  date: any
  notes?: string
  depositScreenshot?: string
  secretaryId?: string
  secretaryName?: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', price: '' })
  const [productLoading, setProductLoading] = useState(false)
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
  const [selectedMonth, setSelectedMonth] = useState('all')
  const { t, dir } = useLanguage()


  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('date', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[]
      
      const visibleOrders = data.filter(o => 
        o.deliveryStatus !== 'registered' && 
        o.deliveryStatus !== 'delivered' && 
        o.deliveryStatus !== 'returned'
      )
      setOrders(visibleOrders)
      setLoading(false)
    }, (error) => {
      console.error("Error fetching orders:", error)
      toast.error(t('common.error'))
      setLoading(false)
    })

    const fetchProductsData = async () => {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setProducts(data)
    }
    fetchProductsData()

    return () => unsubscribe()
  }, [])

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProduct.name || !newProduct.price) return
    
    setProductLoading(true)
    try {
      await addDoc(collection(db, 'products'), {
        name: newProduct.name,
        price: Number(newProduct.price),
        createdAt: serverTimestamp(),
        imageUrl: '' // Default empty
      })
      toast.success(t('admin.products_success_add'))
      setNewProduct({ name: '', price: '' })
      setShowQuickAdd(false)
      
      // Refresh products list
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    } catch (error) {
      console.error(error)
      toast.error(t('common.error'))
    } finally {
      setProductLoading(false)
    }
  }

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(t('admin.products_delete_confirm').replace('{name}', name))) return
    try {
      await deleteDoc(doc(db, 'products', id))
      toast.success(t('admin.products_delete_success'))
      setProducts(products.filter(p => p.id !== id))
    } catch (error) {
      toast.error(t('admin.products_delete_error'))
    }
  }

  const updateDeliveryStatus = async (order: Order, newStatus: string) => {
    const statusLabels: Record<string, string> = {
      delivered: t('order.status_delivered'),
      returned: t('order.status_returned'),
      not_delivered: t('order.status_not_delivered')
    }
    if (!confirm(t('admin.orders_status_update_confirm').replace('{status}', statusLabels[newStatus] || newStatus))) return

    try {
      const orderRef = doc(db, 'orders', order.id)
      const oldStatus = order.deliveryStatus
      
      await updateDoc(orderRef, { deliveryStatus: newStatus })

      // Update secretary counters if secretary is associated
      if (order.secretaryId) {
        const secRef = doc(db, 'secretaries', order.secretaryId)
        const qty = order.quantity || 1
        
        // Handle incrementing/decrementing counters based on transitions using item quantity
        if (newStatus === 'delivered' && oldStatus !== 'delivered') {
          await updateDoc(secRef, { deliveredCount: increment(qty) })
        } else if (newStatus === 'returned' && oldStatus !== 'returned') {
          await updateDoc(secRef, { returnedCount: increment(qty) })
        }
        
        // Logic for reverting stats if accidentally clicked
        if (oldStatus === 'delivered' && newStatus !== 'delivered') {
          await updateDoc(secRef, { deliveredCount: increment(-qty) })
        } else if (oldStatus === 'returned' && newStatus !== 'returned') {
          await updateDoc(secRef, { returnedCount: increment(-qty) })
        }
      }

      toast.success(t('admin.orders_status_update_success'))
    } catch (error) {
      console.error("Error updating order:", error)
      toast.error(t('admin.orders_status_update_error'))
    }
  }

  const updatePaymentStatus = async (id: string, value: string) => {
    try {
      await updateDoc(doc(db, 'orders', id), { paymentStatus: value })
      toast.success(t('admin.orders_payment_update_success'))
    } catch (error) {
      toast.error(t('admin.orders_status_update_error'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.orders_delete_confirm'))) return
    try {
      await deleteDoc(doc(db, 'orders', id))
      toast.success(t('admin.orders_delete_success'))
    } catch (error) {
      toast.error(t('admin.orders_status_update_error'))
    }
  }

  const handleCopy = (text: string | undefined) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast.success(t('admin.orders_copy_success'))
  }

  const availableMonths = useMemo(() => {
    const months = new Set<string>()
    orders.forEach(o => {
      if (o.date) {
        let d;
        if (o.date?.toDate) d = o.date.toDate()
        else d = new Date(o.date)
        if (!isNaN(d.getTime())) {
          const yrMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
          months.add(yrMonth)
        }
      }
    })
    return Array.from(months).sort((a,b) => b.localeCompare(a))
  }, [orders])

  const getMonthName = (yrMonth: string) => {
    const [y, m] = yrMonth.split('-')
    const date = new Date(Number(y), Number(m) - 1, 1)
    return date.toLocaleString('ar-EG', { month: 'long', year: 'numeric' })
  }

  const monthFilteredOrders = useMemo(() => {
    if (selectedMonth === 'all') return orders
    return orders.filter(o => {
      if (!o.date) return false
      let d;
      if (o.date?.toDate) d = o.date.toDate()
      else d = new Date(o.date)
      if (isNaN(d.getTime())) return false
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === selectedMonth
    })
  }, [orders, selectedMonth])

  const filteredOrders = monthFilteredOrders.filter(order => 
    order.orderShortId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.mobile.includes(searchTerm)
  )

  const ordersValue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)

  const toggleExpand = (id: string) => {
    setExpandedOrders(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

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
          <h1 className="text-3xl font-black text-[var(--heading-color)] dark:text-white">{t('nav.orders')}</h1>
          <p className="text-slate-500 mt-1 font-bold">{t('admin.orders_subtitle')}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="bg-secondary hover:bg-secondary/90 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-3 transition-all active:scale-95 shadow-lg shadow-secondary/20"
          >
            <Plus size={20} />
            {t('admin.products_add_new')}
          </button>
          
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
          
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold focus:ring-2 ring-primary/20 outline-none w-full md:w-auto"
          >
            <option value="all">{t('admin.orders_all_months')}</option>
            {availableMonths.map(m => (
              <option key={m} value={m}>{getMonthName(m)}</option>
            ))}
          </select>

          <div className="flex flex-col gap-2 w-full md:w-auto">
            <div className="bg-primary/10 text-primary px-6 py-2 rounded-2xl font-black shadow-sm text-sm flex justify-between gap-4">
              <span>{t('common.total')} {t('nav.orders')}:</span>
              <span>{filteredOrders.length}</span>
            </div>
            <div className="bg-secondary/10 text-secondary px-6 py-2 rounded-2xl font-black shadow-sm text-sm flex justify-between gap-4">
              <span>{t('admin.orders_value')}</span>
              <span dir="ltr">{ordersValue.toLocaleString(dir === 'rtl' ? 'ar-EG' : 'en-US')} {t('common.currency')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Product Bar */}
      {showQuickAdd && (
        <div className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-3xl border border-secondary/20 shadow-xl shadow-secondary/5 animate-in slide-in-from-top duration-300">
          <form onSubmit={handleAddProduct} className="flex flex-wrap items-end gap-6">
            <div className="flex-1 min-w-[200px] space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('order.product_name')}</label>
              <input 
                required
                type="text"
                placeholder={t('admin.products_new_placeholder')}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold focus:ring-4 ring-secondary/10 transition-all outline-none"
                value={newProduct.name}
                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
              />
            </div>
            <div className="w-40 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('admin.sec_piece_price')} ({t('common.currency')})</label>
              <input 
                required
                type="number"
                placeholder="0.00"
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl font-black text-secondary focus:ring-4 ring-secondary/10 transition-all outline-none"
                value={newProduct.price}
                onChange={e => setNewProduct({...newProduct, price: e.target.value})}
              />
            </div>
            <button 
              type="submit"
              disabled={productLoading}
              className="px-10 py-4 bg-secondary text-white rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-secondary/20 disabled:opacity-50 flex items-center gap-2"
            >
              {productLoading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
              {t('admin.products_save_action')}
            </button>
          </form>
          {products.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
              <h3 className="text-xs font-black text-slate-400 mb-4 px-1">{t('admin.products_added_title')}</h3>
              <div className="flex flex-wrap gap-3">
                {products.map(p => (
                  <div key={p.id} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 group/prod">
                     <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{p.name}</span>
                     <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md">{p.price} {t('common.currency')}</span>
                     <button onClick={() => handleDeleteProduct(p.id, p.name)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 p-1.5 rounded-lg transition-all" title={t('common.delete')}>
                        <Trash2 size={14} />
                     </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 max-h-[800px] overflow-y-auto pr-4 custom-scrollbar">
        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-slate-800/50 p-16 rounded-[3rem] text-center border border-dashed border-slate-200 dark:border-slate-700">
            <ShoppingBag className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={64} />
            <p className="text-xl font-black text-slate-400">{t('admin.orders_search_empty')}</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedOrders.has(order.id)
            return (
            <div key={order.id} className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl md:rounded-[2.5rem] border border-slate-200/50 dark:border-slate-700 shadow-xl shadow-slate-200/20 dark:shadow-none overflow-hidden transition-all hover:border-primary/30 group">
              <div className="p-4 md:p-8">
                {/* MOBILE HEADER (Visible only on md<) */}
                <div className="md:hidden flex flex-col gap-4">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-black text-white shrink-0">
                        {order.name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-black text-slate-800 dark:text-white" title={order.name}>{order.name}</h2>
                          <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-md shrink-0">
                            <span className="text-[11px] font-black text-primary">#{order.orderShortId}</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(order.orderShortId);
                              }}
                              className="text-primary/70 hover:text-primary p-0.5"
                            >
                              <Copy size={10} />
                            </button>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full inline-block mt-0.5">{t('order.quantity')}: {order.quantity}</span>
                      </div>
                    </div>
                    <button onClick={() => toggleExpand(order.id)} className="p-2 text-slate-400 hover:text-primary bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                      <ChevronDown size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  {/* Mobile Quick Action Buttons */}
                  <div className="flex gap-2 w-full">
                    <button 
                      onClick={() => updateDeliveryStatus(order, 'delivered')}
                      className={`flex-1 py-3 rounded-[1rem] flex items-center justify-center gap-2 text-sm font-black transition-all shadow-sm ${
                        order.deliveryStatus === 'delivered' 
                        ? 'bg-green-500 text-white shadow-green-500/30' 
                        : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800/50'
                      }`}
                    >
                      <PackageCheck size={16} />
                      {t('order.status_delivered')}
                    </button>
                    <button 
                      onClick={() => updateDeliveryStatus(order, 'not_delivered')}
                      className={`flex-1 py-3 rounded-[1rem] flex items-center justify-center gap-2 text-sm font-black transition-all shadow-sm ${
                        order.deliveryStatus === 'not_delivered' 
                        ? 'bg-orange-500 text-white shadow-orange-500/30' 
                        : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50'
                      }`}
                    >
                      <XCircle size={16} />
                      {t('order.status_not_delivered')}
                    </button>
                  </div>
                </div>

                {/* DESKTOP HEADER */}
                <div className="hidden md:flex flex-wrap justify-between items-start gap-6 mb-8 pb-8 border-b border-slate-50 dark:border-slate-700/50">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-primary/20 shrink-0">
                      {order.name[0]}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">{order.name}</h2>
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
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg">
                          <Calendar size={14} className="text-primary" />
                          {new Date(order.date).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                        {order.secretaryName && (
                          <div className="flex items-center gap-2 text-xs font-black text-primary bg-primary/5 px-3 py-1.5 rounded-lg">
                            <User size={14} />
                            بواسطة: {order.secretaryName}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => updateDeliveryStatus(order, 'delivered')}
                      className={`px-5 py-3 rounded-2xl flex items-center gap-2 text-sm font-black transition-all shadow-lg active:scale-95 ${
                        order.deliveryStatus === 'delivered' 
                        ? 'bg-green-500 text-white shadow-green-500/30' 
                        : 'bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 hover:bg-green-500 hover:text-white text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <PackageCheck size={18} />
                      {order.deliveryStatus === 'delivered' ? t('order.status_delivered') : t('order.confirm_delivery')}
                    </button>
                    <button 
                      onClick={() => updateDeliveryStatus(order, 'returned')}
                      className={`px-5 py-3 rounded-2xl flex items-center gap-2 text-sm font-black transition-all shadow-lg active:scale-95 ${
                        order.deliveryStatus === 'returned' 
                        ? 'bg-red-500 text-white shadow-red-500/30' 
                        : 'bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 hover:bg-red-500 hover:text-white text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Undo2 size={18} />
                      {order.deliveryStatus === 'returned' ? t('order.status_returned') + ' !!' : t('order.mark_returned')}
                    </button>
                    <button 
                      onClick={() => updateDeliveryStatus(order, 'not_delivered')}
                      className={`px-5 py-3 rounded-2xl flex items-center gap-2 text-sm font-black transition-all ${
                        order.deliveryStatus === 'not_delivered' 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-500'
                      }`}
                    >
                      {t('order.status_not_delivered')}
                    </button>
                    <button 
                      onClick={() => handleDelete(order.id)}
                      className="p-3 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* EXPANDABLE CONTENT */}
                <div className={`transition-all duration-300 ${isExpanded ? 'block mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 md:mt-0 md:pt-0 md:border-t-0' : 'hidden'} md:block`}>
                  
                  {/* Only on Mobile: Returned & Delete buttons inside expanded */}
                  <div className="md:hidden flex gap-3 mb-8">
                     <button 
                       onClick={() => updateDeliveryStatus(order, 'returned')}
                       className="flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-black text-red-600 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400 shadow-sm"
                     >
                       <Undo2 size={16} /> {order.deliveryStatus === 'returned' ? t('order.status_returned') + ' !!' : t('order.mark_returned')}
                     </button>
                     <button 
                       onClick={() => handleDelete(order.id)}
                       className="p-3 text-red-500 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-900/50 rounded-2xl shadow-sm"
                     >
                       <Trash2 size={20} />
                     </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                  {/* Contact Info */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       {t('admin.orders_shipping_data')}
                    </h3>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl space-y-5 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between group/copy">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                            <Phone size={16} className="text-primary" />
                          </div>
                          <span dir="ltr" className="text-slate-900 dark:text-slate-300 font-black text-lg">{order.mobile}</span>
                        </div>
                        <button 
                          onClick={() => handleCopy(order.mobile)}
                          className="p-2 text-slate-400 hover:text-primary transition-colors"
                          title="نسخ رقم الهاتف"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                      <div className="flex items-start justify-between group/copy">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm shrink-0">
                            <MapPin size={16} className="text-primary" />
                          </div>
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-400 leading-relaxed pt-1">
                            {order.governorate} - {order.address}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleCopy(`${order.governorate} - ${order.address}`)}
                          className="p-2 text-slate-400 hover:text-primary transition-colors"
                          title="نسخ العنوان"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                      {order.notes && (
                        <div className="flex items-start gap-2 mt-2 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                           <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                           <p className="text-[11px] font-bold text-slate-500 whitespace-pre-wrap">{order.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('order.contents')}</h3>
                    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 p-6 rounded-3xl border border-primary/10">
                      <div className="font-black text-xl text-slate-900 dark:text-white mb-2">{order.productName}</div>
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-xs font-black bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500 border border-slate-100 dark:border-slate-700">
                          {t('order.quantity')}: {order.quantity}
                        </span>
                      </div>
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-end">
                        <span className="text-[10px] text-slate-400 font-black uppercase">{t('order.total_amount')}</span>
                        <div className="text-2xl font-black text-primary">{order.totalAmount.toLocaleString(dir === 'rtl' ? 'ar-EG' : 'en-US')} {t('common.currency')}</div>
                      </div>
                    </div>
                  </div>

                  {/* Status Info */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('admin.orders_deposit_receipt')}</h3>
                    {order.depositScreenshot ? (
                      <button className="flex items-center justify-center gap-2 w-full py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black text-xs hover:bg-primary hover:text-white hover:shadow-lg transition-all">
                        <ImageIcon size={16} />
                        {t('admin.orders_view_receipt')}
                      </button>
                    ) : (
                      <div className="flex items-center justify-center gap-2 w-full py-4 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-xs text-slate-400">
                        {t('admin.orders_no_receipt')}
                      </div>
                    )}
                  </div>
                  </div>
                </div>
              </div>
            </div>
          )}))}
      </div>
    </div>
  )
}
