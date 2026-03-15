'use client'

import React, { useState, useEffect } from 'react'
import { X, User, Phone, MapPin, Send, Loader2, CheckCircle2, ShoppingBag } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useCart } from '@/context/CartContext'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'

export default function CheckoutForm() {
  const [isOpen, setIsOpen] = useState(false)
  const { t, dir } = useLanguage()
  const { cart, cartTotal, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    address: ''
  })

  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('open-checkout', handleOpen)
    return () => window.removeEventListener('open-checkout', handleOpen)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Prepare Order Data
      const orderData = {
        customerName: formData.name,
        customerPhone: formData.phone,
        customerCity: formData.city,
        customerAddress: formData.address,
        items: cart,
        totalAmount: cartTotal,
        status: 'new', // Default status
        paymentStatus: 'pending',
        date: new Date().toISOString(),
        createdAt: serverTimestamp(),
      }

      // 2. Save to Firestore
      await addDoc(collection(db, 'orders'), orderData)
      
      // 3. Success State
      setSuccess(true)
      clearCart()
      toast.success(t('common.success'))
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => !loading && setIsOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
      >
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-12 text-center"
            >
              <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
                {dir === 'rtl' ? 'تم استلام طلبك بنجاح!' : 'Order Placed Successfully!'}
              </h2>
              <p className="text-slate-500 font-bold mb-10 leading-relaxed">
                {dir === 'rtl' 
                  ? 'شكراً لثقتك بنا. سيقوم فريقنا بمراجعة طلبك والتواصل معك لتأكيد الشحن في أقرب وقت ممكن.' 
                  : 'Thank you for your trust. Our team will review your order and contact you to confirm shipping as soon as possible.'}
              </p>
              <button 
                onClick={() => {
                  setIsOpen(false)
                  setSuccess(false)
                  setFormData({ name: '', phone: '', city: '', address: '' })
                }}
                className="w-full py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/30"
              >
                {dir === 'rtl' ? 'العودة للمتجر' : 'Back to Store'}
              </button>
            </motion.div>
          ) : (
            <motion.div key="form" className="p-10 md:p-14">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {dir === 'rtl' ? 'تأكيد الطلب' : 'Complete Order'}
                  </h2>
                  <p className="text-slate-400 font-bold mt-1 uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <ShoppingBag size={14} />
                    {cartTotal.toLocaleString(dir === 'rtl' ? 'ar-EG' : 'en-US')} {t('common.currency')}
                  </p>
                </div>
                <button 
                  onClick={() => !loading && setIsOpen(false)}
                  className="p-3 text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                      <User size={14} />
                      {dir === 'rtl' ? 'الاسم بالكامل' : 'Full Name'}
                    </label>
                    <input 
                      required
                      type="text"
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold outline-none focus:ring-4 ring-primary/10 transition-all"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                      <Phone size={14} />
                      {dir === 'rtl' ? 'رقم الهاتف' : 'Phone Number'}
                    </label>
                    <input 
                      required
                      type="tel"
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold outline-none focus:ring-4 ring-primary/10 transition-all"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                    <MapPin size={14} />
                    {dir === 'rtl' ? 'المدينة / المحافظة' : 'City / Area'}
                  </label>
                  <input 
                    required
                    type="text"
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold outline-none focus:ring-4 ring-primary/10 transition-all"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                    <MapPin size={14} />
                    {dir === 'rtl' ? 'العنوان بالتفصيل' : 'Full Address'}
                  </label>
                  <textarea 
                    required
                    rows={3}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold outline-none focus:ring-4 ring-primary/10 transition-all resize-none"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/95 text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-primary/30 mt-4 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                  {loading ? (dir === 'rtl' ? 'جاري الإرسال...' : 'Sending...') : (dir === 'rtl' ? 'أرسل الطلب الآن' : 'Place Order Now')}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
