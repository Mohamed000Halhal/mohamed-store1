'use client'

import React, { useState, useEffect } from 'react'
import { db, storage } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { Save, Palette, Type, Layout, Loader2, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLanguage } from '@/context/LanguageContext'

export default function UISettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { t, dir } = useLanguage()
  
  const DEFAULT_SETTINGS = {
    siteTitle: 'Mohamed Store',
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    navbarColor: '#ffffff',
    cardColor: '#ffffff',
    footerColor: '#ffffff',
    accentColor: '#667eea',
    textColor: '#000000',
    logoUrl: '',
    darkMode: false
  }

  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const docRef = doc(db, 'settings', 'ui')
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setSettings(prev => ({ ...prev, ...docSnap.data() }))
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, 'settings', 'ui'), settings)
      toast.success(t('common.success'))
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error(t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    )
  }

  const ColorInput = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
    <div className="space-y-1">
      <label className="block text-sm font-black text-slate-400 mr-1">{label}</label>
      <div className="flex gap-2">
        <div className="relative w-12 h-12 rounded-xl border border-[var(--border-color)] overflow-hidden shadow-sm hover:scale-105 transition-transform cursor-pointer">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -inset-2 w-[150%] h-[150%] cursor-pointer border-none p-0 bg-transparent"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-slate-800 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
        />
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto pb-20" dir={dir}>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black text-[var(--heading-color)] mb-2">{t('nav.ui_settings')}</h1>
          <p className="text-slate-500 font-medium">{t('admin.ui_subtitle')}</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-[var(--card-color)] rounded-2xl border border-[var(--border-color)] shadow-sm">
           <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{t('admin.ui_default_dark')}</span>
           <button 
             onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
             className={`w-12 h-6 rounded-full transition-colors relative ${settings.darkMode ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
           >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.darkMode ? (dir === 'rtl' ? 'right-7' : 'left-7') : (dir === 'rtl' ? 'right-1' : 'left-1')}`} />
           </button>
        </div>
      </div>
      
      <div className="space-y-8">
        {/* Site Content */}
        <div className="bg-[var(--card-color)] p-8 rounded-[2rem] border border-[var(--border-color)] shadow-xl shadow-slate-200/40 dark:shadow-none">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-[var(--heading-color)]">
            <div className="p-2 bg-primary/10 rounded-xl text-primary"><Type size={20} /></div>
            {t('admin.ui_section_content')}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 mr-2">{t('admin.ui_site_title')}</label>
              <input
                type="text"
                value={settings.siteTitle}
                onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
              />
            </div>
          </div>
        </div>

        {/* Colors Layout */}
        <div className="bg-[var(--card-color)] p-8 rounded-[2rem] border border-[var(--border-color)] shadow-xl shadow-slate-200/40 dark:shadow-none">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black flex items-center gap-3 text-[var(--heading-color)]">
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><Palette size={20} /></div>
              {t('admin.ui_section_colors')}
            </h2>
            <button 
              onClick={() => {
                if (confirm(t('admin.ui_confirm_reset'))) {
                  setSettings({ ...settings, 
                    primaryColor: DEFAULT_SETTINGS.primaryColor,
                    navbarColor: DEFAULT_SETTINGS.navbarColor,
                    cardColor: DEFAULT_SETTINGS.cardColor,
                    footerColor: DEFAULT_SETTINGS.footerColor,
                    textColor: DEFAULT_SETTINGS.textColor
                  });
                  toast.success(t('admin.ui_reset_success'));
                }
              }}
              className="text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-xl transition-all"
            >
              {t('admin.ui_reset_action')}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ColorInput label={t('admin.ui_color_primary')} value={settings.primaryColor} onChange={(v) => setSettings({...settings, primaryColor: v})} />
            <ColorInput label={t('admin.ui_color_navbar')} value={settings.navbarColor} onChange={(v) => setSettings({...settings, navbarColor: v})} />
            <ColorInput label={t('admin.ui_color_card')} value={settings.cardColor} onChange={(v) => setSettings({...settings, cardColor: v})} />
            <ColorInput label={t('admin.ui_color_footer')} value={settings.footerColor} onChange={(v) => setSettings({...settings, footerColor: v})} />
            <ColorInput label={t('admin.ui_color_text')} value={settings.textColor} onChange={(v) => setSettings({...settings, textColor: v})} />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black text-xl shadow-2xl shadow-primary/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
          {saving ? t('admin.ui_saving') : t('admin.ui_save_action')}
        </button>
      </div>
    </div>
  )
}
