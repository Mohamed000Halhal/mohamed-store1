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

const services = [
  {
    title: 'دفيات مزارع الدواجن',
    description: 'دفيات متطورة مصممة خصيصاً لمزارع الفراخ، تعمل بكفاءة عالية باستخدام الزيت التالف لزيادة الإنتاج وتوفير التكاليف.',
    icon: Flame,
    color: 'from-orange-500 to-orange-600'
  },
  {
    title: 'شعل المطاعم الكبرى',
    description: 'شعل احترافية للمطاعم توفر حرارة قوية ومستمرة، مثالية للاستخدام الشاق وموفرة للطاقة.',
    icon: Activity,
    color: 'from-blue-500 to-blue-600'
  },
  {
    title: 'دفايات الإشعال الذاتي',
    description: 'أحدث تكنولوجيا الدفايات بإشعال ذاتي آمن وسهل الاستخدام، توفر الراحة والأمان التام.',
    icon: Zap,
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    title: 'صيانة ودعم فني',
    description: 'فريق متخصص لتركيب وصيانة جميع أنواع الدفايات والشعل لضمان استمرارية عمل مشروعك.',
    icon: ShieldCheck,
    color: 'from-slate-700 to-slate-800'
  }
]

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* --- Navbar (Consistent with Home) --- */}
      <nav className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <ShoppingBag size={20} />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              {settings.siteTitle || 'المتجر'}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 font-bold text-slate-600">
             <Link href="/" className="hover:text-primary transition-colors flex items-center gap-2">
                <Home size={18} /> الرئيسية
             </Link>
             <Link href="/services" className="text-primary transition-colors flex items-center gap-2">
                <Layers size={18} /> الخدمات
             </Link>
             <Link href="/contact" className="hover:text-primary transition-colors flex items-center gap-2">
                <MessageSquare size={18} /> اتصل بنا
             </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/" className="p-3 rounded-full hover:bg-slate-100 transition-colors text-primary">
              <ArrowLeft size={22} />
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Header Section --- */}
      <header className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-slate-50 to-slate-50"></div>
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm">
            <Flame size={16} />
            <span>تكنولوجيا تدفئة رائدة عالمياً</span>
          </motion.div>
          <motion.h1 
            variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900"
          >
            حلول <span className="text-primary">التدفئة</span> الصناعية
          </motion.h1>
          <motion.p 
            variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            نوفر أحدث الدفايات والشعل التي تعمل بالزيت المستعمل، مصممة لتحقيق أقصى كفاءة بأقل تكلفة تشغيل.
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
              className="group bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col items-center text-center space-y-6"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                <service.icon size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800">{service.title}</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                {service.description}
              </p>
              <button className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                اقرأ المزيد <ChevronRight size={18} />
              </button>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* --- Why Choose Us --- */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl sm:text-5xl font-black leading-tight">
              لماذا تختار <span className="text-primary">خدماتنا؟</span>
            </h2>
            <p className="text-xl text-slate-400 leading-relaxed">
              نحن الرواد في تصنيع وصيانة أنظمة التدفئة الموفرة، حيث نجمع بين قوة الأداء والاستدامة الاقتصادية.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                'توفير هائل في الوقود',
                'خامات تصنيع عالية الجودة',
                'أنظمة أمان متطورة',
                'دعم فني متاح دائماً'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 font-bold text-lg">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Star size={14} className="fill-current" />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
             <div className="aspect-square rounded-3xl bg-primary/5 border border-white/10 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
                <Activity size={200} className="text-primary/20 group-hover:scale-110 transition-transform duration-1000" />
             </div>
          </motion.div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-[3rem] p-12 sm:p-20 shadow-2xl border border-slate-100 space-y-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <h2 className="text-4xl font-black text-slate-800">جاهز لتطوير مشروعك؟</h2>
          <p className="text-xl text-slate-500 font-medium">ابدأ الآن في توفير تكاليف التدفئة مع حلولنا المبتكرة والذكية.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="px-10 py-5 bg-primary text-white rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20">
              تواصل معنا الآن
            </Link>
          </div>
        </motion.div>
      </section>

      {/* --- Footer (Consistent with Home) --- */}
      <footer className="bg-white py-12 border-t border-slate-200 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-slate-500 font-medium">
            © {new Date().getFullYear()} <span className="font-black text-primary">{settings.siteTitle}</span>. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  )
}
