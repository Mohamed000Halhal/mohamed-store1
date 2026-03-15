'use client'

import React from 'react'
import { ShoppingCart, Plus, Minus, Star, Heart } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useCart } from '@/context/CartContext'
import { motion } from 'framer-motion'

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    imageUrl: string
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const { t, dir } = useLanguage()
  const { addToCart, cart, updateQuantity } = useCart()
  
  const cartItem = cart.find(item => item.id === product.id)

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="group bg-white dark:bg-slate-800 rounded-[2.5rem] p-4 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all relative overflow-hidden"
    >
      {/* Favorite Button */}
      <button className="absolute top-6 right-6 z-10 p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-400 hover:text-red-500 transition-colors border border-white/20">
        <Heart size={18} />
      </button>

      {/* Image */}
      <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-slate-50 dark:bg-slate-900 mb-6 relative">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-200">
            <ShoppingCart size={64} />
          </div>
        )}
        
        {/* Quick Add Overlay (Desktop) */}
        {!cartItem && (
          <div className="absolute inset-x-4 bottom-4 translate-y-20 group-hover:translate-y-0 transition-transform duration-500 hidden md:block">
            <button 
              onClick={() => addToCart(product)}
              className="w-full py-4 bg-primary text-white rounded-[1.25rem] font-black text-sm shadow-xl shadow-primary/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Plus size={18} />
              {t('common.save') === 'Save' ? 'Add to Cart' : 'أضف للسلة'}
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-2">
        <div className="flex items-center gap-1 text-orange-400 mb-2">
          <Star size={12} fill="currentColor" />
          <Star size={12} fill="currentColor" />
          <Star size={12} fill="currentColor" />
          <Star size={12} fill="currentColor" />
          <Star size={12} fill="currentColor" />
          <span className="text-[10px] font-black ml-1 text-slate-400">(4.9)</span>
        </div>
        
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mt-4">
          <p className="text-xl font-black text-primary">
            {product.price.toLocaleString(dir === 'rtl' ? 'ar-EG' : 'en-US')} 
            <span className="text-xs font-bold mr-1 opacity-70">{t('common.currency')}</span>
          </p>
          
          {/* Cart Quantity Controls (Mobile & Active) */}
          {cartItem ? (
            <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 transition-all font-black"
              >
                <Minus size={14} />
              </button>
              <span className="text-sm font-black text-slate-900 dark:text-white w-4 text-center">
                {cartItem.quantity}
              </span>
              <button 
                onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-800 transition-all font-black"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => addToCart(product)}
              className="md:hidden w-10 h-10 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center active:scale-95 transition-all"
            >
              <ShoppingCart size={18} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
