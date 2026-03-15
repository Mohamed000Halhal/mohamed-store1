'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Flame,
  Zap,
  Activity, 
  ShieldCheck, 
  Clock, 
  Star,
  ChevronRight,
  ArrowLeft,
  Home,
  Layers,
  MessageSquare,
  ShoppingBag,
  User,
  ShoppingCart
} from 'lucide-react'
import Link from 'next/link'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageToggle from '@/components/LanguageToggle'
import { useLanguage } from '@/context/LanguageContext'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

export default function ServicesPage() {
  const { settings } = useTheme()
  const { currentUser } = useAuth()
  const { t } = useLanguage()

  const services = [
    {
      title: t('services.s1.title'),
      description: t('services.s1.desc'),
      icon: Flame,
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: t('services.s2.title'),
      description: t('services.s2.desc'),
      icon: Activity,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: t('services.s3.title'),
      description: t('services.s3.desc'),
      icon: Zap,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: t('services.s4.title'),
      description: t('services.s4.desc'),
      icon: ShieldCheck,
      color: 'from-slate-700 to-slate-800'
    }
  ]

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] transition-colors duration-500 font-sans">
      
      {/* --- Navbar (Consistent with Home) --- */}
      <nav className="fixed top-0 w-full z-40 bg-[var(--navbar-color)] backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <ShoppingBag size={20} />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-color)] to-[var(--text-color)]/70">
              {settings.siteTitle || t('nav.store')}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 font-bold text-slate-600 dark:text-slate-400">
             <Link href="/" className="hover:text-primary transition-colors flex items-center gap-2">
                <Home size={18} /> {t('nav.home')}
             </Link>
             <Link href="/services" className="text-primary transition-colors flex items-center gap-2">
                <Layers size={18} /> {t('nav.services')}
             </Link>
             <Link href="/contact" className="hover:text-primary transition-colors flex items-center gap-2">
                <MessageSquare size={18} /> {t('nav.contact')}
             </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <LanguageToggle />
            <Link href="/" className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-primary">
              <ArrowLeft size={22} />
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Header Section --- */}
      <header className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-[var(--bg-color)] to-[var(--bg-color)]"></div>
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm">
            <Flame size={16} />
            <span>{t('services.badge')}</span>
          </motion.div>
          <motion.h1 
            variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl font-black tracking-tight"
          >
            {t('services.title')}
          </motion.h1>
          <motion.p 
            variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            {t('services.desc')}
          </motion.p>
        </div>
      </header>

      {/* --- Services Grid --- */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {services.map((service, idx) => (
            <motion.div 
              variants={fadeUp}
              key={idx}
              className="group bg-[var(--card-color)] rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col items-center text-center space-y-6"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                <service.icon size={32} />
              </div>
              <h3 className="text-2xl font-black">{service.title}</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                {service.description}
              </p>
              <button className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                {t('services.read_more') || (t('common.language') === 'ar' ? 'اقرأ المزيد' : 'Read More')} <ChevronRight size={18} />
              </button>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 text-center relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-slate-500 font-medium">
            © {new Date().getFullYear()} <span className="font-black text-primary">{settings.siteTitle}</span>. {t('footer.copyright')}
          </p>
        </div>
      </footer>
    </div>
  )
}
