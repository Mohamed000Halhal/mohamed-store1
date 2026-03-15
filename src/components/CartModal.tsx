'use client'

import React, { useEffect, useState } from 'react'
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Loader2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useCart } from '@/context/CartContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function CartModal() {
  const [isOpen, setIsOpen] = useState(false)
  const { t, dir } = useLanguage()
  const { cart, cartTotal, removeFromCart, updateQuantity, cartCount } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  // Custom event listener to open cart from anywhere
  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('open-cart', handleOpen)
    return () => window.removeEventListener('open-cart', handleOpen)
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Cart Drawer */}
      <motion.div 
        initial={{ x: dir === 'rtl' ? '-100%' : '100%' }}
        animate={{ x: 0 }}
        exit={{ x: dir === 'rtl' ? '-100%' : '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col"
      >
        {/* Header */}
        <div className="h-24 px-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <ShoppingBag size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {t('nav.cart') === 'Cart' ? 'Shopping Cart' : 'سلة التسوق'}
              </h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                {cartCount} {t('nav.cart') === 'Cart' ? 'Items' : 'منتجات'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <ShoppingBag size={80} className="mb-6" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {t('nav.cart') === 'Cart' ? 'Your cart is empty' : 'سلة التسوق فارغة'}
              </h3>
              <p className="text-sm font-bold text-slate-500 mt-2">
                {t('nav.cart') === 'Cart' ? 'Start adding some amazing products' : 'ابدأ بإضافة بعض المنتجات الرائعة'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => (
                <motion.div 
                  layout
                  key={item.id}
                  className="flex gap-4 group"
                >
                  <div className="w-24 h-24 rounded-2xl bg-slate-50 dark:bg-slate-800 overflow-hidden border border-slate-100 dark:border-slate-700 shrink-0">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-black text-slate-800 dark:text-white truncate pr-2">
                          {item.name}
                        </h4>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-primary font-black text-sm mt-1">
                        {item.price.toLocaleString(dir === 'rtl' ? 'ar-EG' : 'en-US')} {t('common.currency')}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 w-fit p-1 rounded-xl border border-slate-100 dark:border-slate-700">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-black text-slate-900 dark:text-white w-4 text-center">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                <span>{t('nav.cart') === 'Cart' ? 'Subtotal' : 'المجموع الفرعي'}</span>
                <span>{cartTotal.toLocaleString(dir === 'rtl' ? 'ar-EG' : 'en-US')} {t('common.currency')}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                <span>{t('nav.cart') === 'Cart' ? 'Shipping' : 'الشحن'}</span>
                <span className="text-green-500">{t('nav.cart') === 'Cart' ? 'Calculated at checkout' : 'يُحسب عند الدفع'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-900 dark:text-white">
                <span className="text-lg font-black uppercase tracking-tight">{t('nav.cart') === 'Cart' ? 'Total' : 'الإجمالي'}</span>
                <span className="text-2xl font-black text-primary">
                  {cartTotal.toLocaleString(dir === 'rtl' ? 'ar-EG' : 'en-US')} {t('common.currency')}
                </span>
              </div>
            </div>

            <button 
              onClick={() => {
                setIsOpen(false)
                window.dispatchEvent(new CustomEvent('open-checkout'))
              }}
              className="w-full bg-primary hover:bg-primary/95 text-white py-6 rounded-[1.5rem] font-black text-lg shadow-2xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3 group"
            >
              {t('nav.cart') === 'Cart' ? 'Checkout' : 'إتمام الطلب'}
              <ArrowRight size={22} className={`${dir === 'rtl' ? 'rotate-180' : ''} group-hover:translate-x-1 transition-transform`} />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
