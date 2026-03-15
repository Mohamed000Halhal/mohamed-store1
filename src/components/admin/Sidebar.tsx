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
  Users,
  Store,
  Menu,
  X
} from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageToggle from '@/components/LanguageToggle'
import ThemePalette from '@/components/ThemePalette'
import { useLanguage } from '@/context/LanguageContext'

export default function AdminSidebar() {
  const { t, dir } = useLanguage()
  const [open, setOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname  = usePathname()
  const router    = useRouter()

  const navItems = [
    { label: t('nav.dashboard'),   icon: LayoutDashboard, href: '/admin/dashboard' },
    { label: t('nav.orders'),      icon: ShoppingBag,      href: '/admin/orders' },
    { label: 'طلبات تم تسليمها',   icon: Package,          href: '/admin/delivered' },
    { label: 'الطلبات المرتجعة',   icon: Package,          href: '/admin/returned' },
    { label: t('nav.secretaries'), icon: Users,            href: '/admin/secretaries' },
    { label: t('nav.ui_settings'), icon: Palette,          href: '/admin/ui-settings' },
    { label: t('nav.profile'),     icon: UserCog,          href: '/admin/profile' },
  ]

  const handleLogout = async () => {
    if (window.confirm(t('common.confirm_logout'))) {
      await signOut(auth)
      router.push('/admin/login')
    }
  }

  /* ─── Nav List ─────────────────────────────────────────────── */
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
              'flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 group',
              active
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'hover:text-primary'
            ].join(' ')}
            style={!active ? {
              color: 'var(--text-muted)',
              backgroundColor: 'transparent',
            } : {}}
            onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--hover-color)' }}
            onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
          >
            <Icon size={20} className={`shrink-0 transition-transform ${active ? '' : 'group-hover:scale-110'}`} />
            {(!closeMobile ? open : true) && (
              <span className="truncate">{label}</span>
            )}
          </Link>
        )
      })}
    </nav>
  )

  /* ─── Footer ─────────────────────────────────────────────────── */
  const Footer = ({ closeMobile }: { closeMobile?: boolean }) => (
    <div className="p-4 space-y-2" style={{ borderTop: '1px solid var(--border-color)' }}>
      {(!closeMobile ? open : true) && (
        <div className="flex flex-col gap-2 mb-4 p-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-slate-500">الإعدادات</span>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>
          <ThemePalette />
        </div>
      )}

      {open && (
        <div className="flex items-center gap-3 px-2 mb-3 mt-4">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <UserCog size={18} />
          </div>
          <div>
            <p className="text-sm font-bold truncate max-w-[120px]" style={{ color: 'var(--text-color)' }}>
              {auth.currentUser?.email?.split('@')[0] ?? 'Admin'}
            </p>
            <p className="text-[10px] uppercase tracking-widest font-black" style={{ color: 'var(--text-muted)' }}>Admin Panel</p>
          </div>
        </div>
      )}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 font-bold transition-all hover:bg-red-50"
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239,68,68,0.08)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
      >
        <LogOut size={20} className={`shrink-0 ${dir === 'rtl' ? '' : 'rotate-180'}`} />
        {(!closeMobile ? open : true) && <span>{t('common.logout')}</span>}
      </button>
    </div>
  )

  /* ─── Sidebar Header ─────────────────────────────────────────── */
  const Header = () => (
    <div className="flex items-center justify-between h-20 px-4 shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
      <div className="flex items-center gap-2">
        {open && (
          <>
            <div className="p-2 rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
              <Store size={20} />
            </div>
            <span className="font-extrabold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Admin Panel</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setOpen(p => !p)}
          className="hidden lg:flex p-2 rounded-xl transition-all"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--hover-color)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
        >
          {open
            ? (dir === 'rtl' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />)
            : (dir === 'rtl' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />)
          }
        </button>
      </div>
    </div>
  )

  /* ─── Sidebar base styles ────────────────────────────────────── */
  const sidebarStyle: React.CSSProperties = {
    backgroundColor: 'var(--sidebar-color)',
    borderColor:     'var(--border-color)',
  }

  return (
    <>
      {/* Mobile Top Bar */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 h-16 z-[50] px-4 flex items-center justify-between"
        style={{
          backgroundColor: 'var(--navbar-color)',
          borderBottom:    '1px solid var(--border-color)',
          backdropFilter:  'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow:       'var(--shadow-sm)',
        }}
        dir={dir}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary shadow-md shadow-primary/20">
            <Store size={18} className="text-white" />
          </div>
          <span className="font-black text-primary tracking-wide">Admin Panel</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={[
          `lg:hidden fixed top-0 ${dir === 'rtl' ? 'right-0' : 'left-0'} h-full z-[80] w-72`,
          `border-${dir === 'rtl' ? 'l' : 'r'} flex flex-col transition-transform duration-300`,
          mobileOpen ? 'translate-x-0' : (dir === 'rtl' ? 'translate-x-full' : '-translate-x-full')
        ].join(' ')}
        style={{
          ...sidebarStyle,
          boxShadow: '0 0 40px rgba(0,0,0,0.18)',
          backdropFilter: 'blur(12px)',
        }}
        dir={dir}
      >
        <div className="flex items-center justify-between h-20 px-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary shadow-lg shadow-primary/20">
              <Store size={20} className="text-white" />
            </div>
            <span className="font-black text-lg text-primary">Admin Panel</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-xl transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--hover-color)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>
        <NavList closeMobile />
        <Footer closeMobile />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={[
          `hidden lg:flex flex-col fixed top-0 ${dir === 'rtl' ? 'right-0' : 'left-0'} h-full z-40`,
          `border-${dir === 'rtl' ? 'l' : 'r'}`,
          'transition-all duration-300',
          open ? 'w-64' : 'w-20'
        ].join(' ')}
        style={{
          ...sidebarStyle,
          boxShadow: 'var(--shadow-xl)',
        }}
        dir={dir}
      >
        <Header />
        <NavList />
        <Footer />
      </aside>
    </>
  )
}
