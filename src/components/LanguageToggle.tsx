'use client'

import React from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { Languages } from 'lucide-react'

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <button
      onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
      className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 group"
      title={language === 'ar' ? 'Change to English' : 'تغيير للغة العربية'}
    >
      <Languages size={18} className="text-primary group-hover:rotate-12 transition-transform" />
      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-color)] mt-0.5">
        {language === 'ar' ? 'EN' : 'AR'}
      </span>
    </button>
  )
}
