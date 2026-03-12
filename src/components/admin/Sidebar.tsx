'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShoppingBag,
  Palette,
  UserCog,
  Store,
  Menu,
  X
} from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import ThemeToggle from '@/components/ThemeToggle'

const navItems = [
  { label: 'لوحة البيانات',   icon: LayoutDashboard, href: '/admin/dashboard' },
  { label: 'المتجر',           icon: Store,            href: '/' },
  { label: 'الطلبات',          icon: ShoppingBag,      href: '/admin/orders' },
  { label: 'المنتجات',         icon: Package,          href: '/admin/products' },
  { label: 'تخصيص الواجهة',   icon: Palette,          href: '/admin/ui-settings' },
  { label: 'إعدادات الحساب',  icon: UserCog,          href: '/admin/profile' },
]

export default function AdminSidebar() {
  const [open, setOpen] = useState(true)        // desktop expanded/collapsed
  const [mobileOpen, setMobileOpen] = useState(false)  // mobile overlay
  const pathname  = usePathname()
  const router    = useRouter()

  const handleLogout = async () => {
    if (window.confirm('هل تريد تسجيل الخروج؟')) {
      await signOut(auth)
      router.push('/admin/login')
    }
  }

  /* ─── shared nav list ──────────────────────────────────────── */
  const NavList = ({ closeMobile }: { closeMobile?: boolean }) => (
    <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
      {navItems.map(({ label, icon: Icon, href }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            onClick={() => closeMobile && setMobileOpen(false)}
            className={[
              'flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all',
              active
                ? 'bg-[var(--primary-color)] text-white shadow-lg'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white'
            ].join(' ')}
          >
            <Icon size={20} className="shrink-0" />
            {(!closeMobile ? open : true) && (
              <span className="truncate">{label}</span>
            )}
          </Link>
        )
      })}
    </nav>
  )

  /* ─── user strip + logout ──────────────────────────────────── */
  const Footer = ({ closeMobile }: { closeMobile?: boolean }) => (
    <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
      {open && (
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-[var(--primary-color)]/10 flex items-center justify-center text-[var(--primary-color)]">
            <UserCog size={18} />
          </div>
          <div>
            <p className="text-sm font-bold truncate max-w-[120px]">
              {auth.currentUser?.email?.split('@')[0] ?? 'Admin'}
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Admin</p>
          </div>
        </div>
      )}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold transition-all"
      >
        <LogOut size={20} className="shrink-0" />
        {(!closeMobile ? open : true) && <span>خروج</span>}
      </button>
    </div>
  )

  /* ─── header strip ─────────────────────────────────────────── */
  const Header = () => (
    <div className="flex items-center justify-between h-20 px-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
      <div className="flex items-center gap-2">
        {open && (
          <>
            <div className="p-2 rounded-xl bg-[var(--primary-color)]">
              <Store size={20} className="text-white" />
            </div>
            <span className="font-black text-lg text-[var(--primary-color)]">Admin Panel</span>
          </>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {/* Desktop collapse toggle */}
        <button
          onClick={() => setOpen(p => !p)}
          className="hidden lg:flex p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all"
        >
          {open ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* ─── Mobile Hamburger ─────────────────────────────── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-[60] p-3 bg-[var(--primary-color)] text-white rounded-xl shadow-lg shadow-[var(--primary-color)]/30"
      >
        <Menu size={22} />
      </button>

      {/* ─── Mobile Overlay ───────────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── Mobile Drawer ────────────────────────────────── */}
      <aside className={[
        'lg:hidden fixed top-0 right-0 h-full z-[80] w-72 bg-white dark:bg-slate-900 shadow-2xl',
        'flex flex-col transition-transform duration-300',
        mobileOpen ? 'translate-x-0' : 'translate-x-full'
      ].join(' ')}>
        <div className="flex items-center justify-between h-20 px-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[var(--primary-color)]">
              <Store size={20} className="text-white" />
            </div>
            <span className="font-black text-lg text-[var(--primary-color)]">Admin Panel</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
            <X size={20} />
          </button>
        </div>
        <NavList closeMobile />
        <Footer closeMobile />
      </aside>

      {/* ─── Desktop Sidebar ──────────────────────────────── */}
      <aside className={[
        'hidden lg:flex flex-col fixed top-0 right-0 h-full z-40',
        'bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl',
        'transition-all duration-300',
        open ? 'w-64' : 'w-20'
      ].join(' ')}>
        <Header />
        <NavList />
        <Footer />
      </aside>
    </>
  )
}
