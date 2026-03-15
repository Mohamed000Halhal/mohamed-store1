'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, ShoppingCart, User, Menu, X } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useCart } from '@/context/CartContext'
import ThemeToggle from './ThemeToggle'
import LanguageToggle from './LanguageToggle'
import { motion, AnimatePresence } from 'framer-motion'

export default function PublicNavbar() {
  const { t, dir, language } = useLanguage()
  const { cartCount } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navLinks = [
    { name: language === 'ar' ? 'الرئيسية' : 'Home',     href: '/' },
    { name: language === 'ar' ? 'المنتجات' : 'Products',  href: '#products' },
    { name: language === 'ar' ? 'عن المتجر' : 'About',    href: '#about' },
  ]

  return (
    <nav
      className="fixed top-0 w-full z-50 transition-all duration-500"
      style={{
        backgroundColor:      'var(--navbar-color)',
        borderBottom:         '1px solid var(--border-color)',
        backdropFilter:       'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow:            'var(--shadow-sm)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 bg-primary rounded-[1rem] flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:rotate-6 transition-transform">
            <ShoppingBag size={22} />
          </div>
          <span
            className="font-black text-xl tracking-tight uppercase"
            style={{ color: 'var(--heading-color)' }}
          >
            Mohamed Store
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-black hover:text-primary transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <ThemeToggle />
            <LanguageToggle />
          </div>

          <button
            className="relative p-3 rounded-2xl transition-all hover:bg-primary hover:text-white group"
            style={{
              backgroundColor: 'var(--hover-color)',
              color:           'var(--text-color)',
              border:          '1px solid var(--border-color)',
            }}
            onClick={() => window.dispatchEvent(new CustomEvent('open-cart'))}
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg">
                {cartCount}
              </span>
            )}
          </button>

          <Link
            href="/login"
            className="p-3 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
            style={{
              backgroundColor: 'var(--heading-color)',
              color:           'var(--card-color)',
            }}
          >
            <User size={20} />
            <span className="hidden md:block text-xs font-black uppercase tracking-widest">
              {language === 'ar' ? 'دخول' : 'Login'}
            </span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-3 rounded-2xl transition-all"
            style={{
              backgroundColor: 'var(--hover-color)',
              color:           'var(--text-color)',
            }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden"
            style={{
              backgroundColor: 'var(--card-color)',
              borderBottom:    '1px solid var(--border-color)',
            }}
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-black hover:text-primary transition-colors"
                  style={{ color: 'var(--text-color)' }}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex items-center gap-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                <ThemeToggle />
                <LanguageToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
