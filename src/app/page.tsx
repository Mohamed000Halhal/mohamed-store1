'use client'

import React, { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingCart, 
  ShoppingBag, 
  ChevronDown, 
  Star, 
  ShieldCheck, 
  Truck, 
  HeartHandshake,
  ArrowLeft,
  Package,
  User,
  LogOut,
  Mail,
  Home,
  MessageSquare,
  Layers,
  Settings,
  X
} from 'lucide-react'
import AuthModal from '@/components/AuthModal'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

// --- Interfaces ---
interface Product {
  id: string
  name: string
  price: number
  imageUrl: string
  description?: string
}

const featuresIcons = [Truck, ShieldCheck, HeartHandshake]

// --- Animation Variants ---
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

export default function PremiumHomePage() {
  const { settings } = useTheme()
  const { currentUser, setShowAuth, logout } = useAuth()
  
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<Product[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // --- Data Fetching ---
  useEffect(() => {
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const fetchedProducts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Product[]
          setProducts(fetchedProducts)
          setLoading(false)
          setError(null)
        },
        (err) => {
          console.error("Firestore Error:", err)
          if(err.code === 'permission-denied') {
             setError("There are currently no public read permissions set for the database. Please inform the administrator to update Firestore rules.")
          } else {
             setError("حدث خطأ أثناء تحميل المنتجات.")
          }
          setLoading(false)
        }
      )
      return () => unsubscribe()
    } catch (e) {
      console.error(e)
      setLoading(false)
      setError("حدث خطأ غير متوقع.")
    }
  }, [])

  // --- Handlers ---
  const addToCart = (product: Product) => {
    setCart(prev => [...prev, product])
  }

  const removeFromCart = (indexToRemove: number) => {
    setCart(prev => prev.filter((_, index) => index !== indexToRemove))
  }

  const scrollToProducts = () => {
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCheckout = () => {
    if (!currentUser) {
      setCartOpen(false)
      setShowAuth(true)
    } else {
      // Proceed to checkout logic 
      alert('سيتم تحويلك لصفحة الدفع قريباً...')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-500 font-sans">
      
      {/* Auth Modal */}
      <AuthModal />

      {/* --- Navbar --- */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <ShoppingBag size={20} />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              {settings.siteTitle || 'المتجر'}
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6 font-bold text-slate-600">
             <Link href="/" className="hover:text-primary transition-colors flex items-center gap-2">
                <Home size={18} /> الرئيسية
             </Link>
             <Link href="/services" className="hover:text-primary transition-colors flex items-center gap-2">
                <Layers size={18} /> الخدمات
             </Link>
             <Link href="/contact" className="hover:text-primary transition-colors flex items-center gap-2">
                <MessageSquare size={18} /> اتصل بنا
             </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/admin" className="p-3 rounded-full hover:bg-slate-100 transition-colors">
              <Settings size={22} className="text-slate-600" />
            </Link>
            <ThemeToggle />
            
            {/* User Menu */}
            <div className="relative">
              {!currentUser ? (
                <button 
                  onClick={() => setShowAuth(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors text-sm font-bold"
                >
                  <User size={18} />
                  <span className="hidden sm:inline">تسجيل الدخول</span>
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-full transition-colors text-sm font-bold border border-primary/20"
                  >
                    <User size={18} />
                    <span className="hidden sm:inline max-w-[100px] truncate">{currentUser.displayName || 'حسابي'}</span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-2 border-b border-slate-50 mb-1">
                           <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">مرحباً</p>
                           <p className="text-sm font-bold text-slate-700 truncate">{currentUser.email}</p>
                        </div>
                        <Link 
                          href="/profile" 
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-primary font-bold transition-colors w-full text-right"
                        >
                          <User size={16} /> الصفحة الشخصية
                        </Link>
                        <button 
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 font-bold transition-colors w-full text-right"
                        >
                          <LogOut size={16} /> تسجيل الخروج
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>

            <button 
              onClick={() => setCartOpen(true)}
              className="relative p-3 rounded-full hover:bg-slate-100 transition-colors"
            >
              <ShoppingCart size={22} className="text-primary" />
              <AnimatePresence>
                {cart.length > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    exit={{ scale: 0 }}
                    className="absolute top-1 right-1 bg-red-500 text-white text-[11px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-md"
                  >
                    {cart.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

        </div>
      </motion.nav>

      {/* --- Cart Sidebar --- */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h2 className="text-2xl font-black">سلة المشتريات ({cart.length})</h2>
                <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <ArrowLeft size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <ShoppingCart size={64} className="mb-4 opacity-50" />
                    <p className="text-lg font-bold">سلة المشتريات فارغة</p>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      key={`${item.id}-${index}`} 
                      className="flex gap-4 p-4 bg-slate-50 rounded-2xl group border border-slate-100"
                    >
                      <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-xl object-cover bg-slate-200" />
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold line-clamp-2 pr-4 text-slate-800">{item.name}</h4>
                          <button onClick={() => removeFromCart(index)} className="text-red-500 hover:text-red-600 p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-red-50 rounded-lg">
                            <X size={16} />
                          </button>
                        </div>
                        <p className="text-primary font-black">{item.price.toLocaleString('ar-EG')} ج.م</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-slate-100 bg-slate-50">
                  <div className="flex justify-between items-center mb-6 text-xl">
                    <span className="font-bold text-slate-600">الإجمالي:</span>
                    <span className="font-black text-primary text-3xl">
                      {cart.reduce((sum, item) => sum + item.price, 0).toLocaleString('ar-EG')} ج.م
                    </span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-primary/30 transition-all active:scale-[0.98]"
                  >
                    {!currentUser ? 'تسجيل الدخول لإتمام الطلب' : 'إتمام الطلب'}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- Hero Section --- */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden isolate">
        {/* Background Gradients */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-slate-50 to-slate-50"></div>
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 45, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -right-[10%] -z-10 w-[60vw] h-[60vw] rounded-full bg-primary/5 blur-3xl"
        />
        
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm">
            <Star size={16} className="fill-current" />
            <span>حلول التدفئة المبتكرة بالزيت المستعمل</span>
          </motion.div>
          
          <motion.h1 
            variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}
            className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight"
          >
            {settings.siteTitle} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              قوة التدفئة.
            </span>
          </motion.h1>

          <motion.p 
            variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}
            className="text-xl sm:text-2xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            نوفر لك أجود أنواع الدفايات وشعل المطاعم التي تعمل بالزيت التالف. كفاءة عالية وتوفير لا يضاهى.
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={scrollToProducts}
              className="px-10 py-5 bg-slate-900 border-2 border-slate-900 text-white rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-3 group"
            >
              استكشف التشكيلة
              <ChevronDown className="group-hover:translate-y-1 transition-transform" />
            </button>
            <Link 
              href="/services"
              className="px-10 py-5 bg-white border-2 border-slate-200 text-slate-900 rounded-full font-black text-xl hover:bg-slate-50 hover:border-slate-300 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              خدماتنا
            </Link>
          </motion.div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section className="py-16 bg-white border-y border-slate-100 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-slate-100">
            {['توفير 100% في الوقود', 'إشعال ذاتي متطور', 'ضمان صيانة حقيقي'].map((feature, idx) => {
              const Icon = featuresIcons[idx]
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx} 
                  className="flex flex-col items-center text-center p-6 space-y-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Icon size={32} />
                  </div>
                  <h3 className="text-xl font-bold">{feature}</h3>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* --- Products Section --- */}
      <section id="products-section" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-black mb-4 text-slate-800">أحدث التشكيلات</h2>
          <div className="w-24 h-1.5 bg-primary mx-auto rounded-full"></div>
        </div>

        {error ? (
           <div className="bg-red-50 text-red-600 p-8 rounded-3xl text-center border border-red-100 shadow-sm max-w-2xl mx-auto">
              <ShieldCheck size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-black mb-2">تعذر الوصول للبيانات</h3>
              <p className="font-medium">{error}</p>
           </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
                <div className="w-full aspect-[4/5] bg-slate-100 rounded-2xl animate-pulse mb-4"></div>
                <div className="h-6 bg-slate-100 rounded-md animate-pulse mb-2 w-3/4"></div>
                <div className="h-5 bg-slate-100 rounded-md animate-pulse mb-4 w-1/4"></div>
                <div className="h-12 bg-slate-100 rounded-xl animate-pulse w-full"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-slate-100/50 rounded-3xl border border-slate-200 border-dashed">
            <Package size={64} className="mx-auto mb-4 text-slate-300" />
            <p className="text-2xl font-bold text-slate-500">لا توجد منتجات حالياً. تفقدنا لاحقاً!</p>
          </div>
        ) : (
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {products.map((product) => (
              <motion.div 
                variants={fadeUp}
                key={product.id} 
                className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 p-4">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700 ease-out" 
                    loading="lazy"
                  />
                  <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full font-black text-sm shadow-xl text-slate-800">
                    {product.price.toLocaleString('ar-EG')} ج.م
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-4 line-clamp-2 leading-snug flex-1 text-slate-800">{product.name}</h3>
                  <button 
                    onClick={() => addToCart(product)}
                    className="w-full py-4 bg-slate-50 border border-slate-100 hover:border-primary/0 hover:bg-primary text-slate-700 hover:text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    <ShoppingCart size={18} className="group-hover/btn:scale-110 transition-transform" />
                    أضف إلى السلة
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* --- Footer --- */}
      <footer className="bg-white py-12 border-t border-slate-200 text-center relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-slate-500 font-medium">
            © {new Date().getFullYear()} <span className="font-black text-primary">{settings.siteTitle}</span>. جميع الحقوق محفوظة.
          </p>
          <p className="mt-4 text-xs tracking-widest text-slate-400 uppercase font-black">Powered by Mohamed Reda Halhal</p>
        </div>
      </footer>
    </div>
  )
}
