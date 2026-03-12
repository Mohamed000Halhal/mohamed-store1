'use client'

import React, { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { Save, Palette, Type, Layout, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function UISettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [settings, setSettings] = useState({
    siteTitle: 'Mohamed Store',
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    navbarColor: '#ffffff',
    cardColor: '#ffffff',
    footerColor: '#ffffff',
    accentColor: '#667eea',
    textColor: '#000000',
    darkMode: false
  })

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
      toast.success('تم حفظ الإعدادات بنجاح')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('خطأ في حفظ الإعدادات')
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
      <label className="block text-sm font-bold text-slate-500">{label}</label>
      <div className="flex gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-xl cursor-pointer border-2 border-slate-100 dark:border-slate-800 p-0 overflow-hidden"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm font-mono outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-2">تخصيص الواجهة</h1>
          <p className="text-slate-500 font-medium">تحكم في مظهر الموقع بالكامل من هنا</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
           <span className="text-sm font-bold text-slate-600 dark:text-slate-400">الوضع الليلي كوضع افتراضي</span>
           <button 
             onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
             className={`w-12 h-6 rounded-full transition-colors relative ${settings.darkMode ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
           >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.darkMode ? 'right-7' : 'right-1'}`} />
           </button>
        </div>
      </div>
      
      <div className="space-y-8">
        {/* Site Content */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-800 dark:text-white">
            <div className="p-2 bg-primary/10 rounded-xl text-primary"><Type size={20} /></div>
            محتوى الموقع الأساسي
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 mr-2">عنوان المتجر</label>
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
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-800 dark:text-white">
            <div className="p-2 bg-primary/10 rounded-xl text-primary"><Palette size={20} /></div>
            تخصيص الألوان المتقدم
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ColorInput label="اللون الرئيسي" value={settings.primaryColor} onChange={(v) => setSettings({...settings, primaryColor: v})} />
            <ColorInput label="لون الهيدر (Navbar)" value={settings.navbarColor} onChange={(v) => setSettings({...settings, navbarColor: v})} />
            <ColorInput label="لون المربعات (Cards)" value={settings.cardColor} onChange={(v) => setSettings({...settings, cardColor: v})} />
            <ColorInput label="لون الفوتر" value={settings.footerColor} onChange={(v) => setSettings({...settings, footerColor: v})} />
            <ColorInput label="لون النص الأساسي" value={settings.textColor} onChange={(v) => setSettings({...settings, textColor: v})} />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black text-xl shadow-2xl shadow-primary/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
          {saving ? 'جاري حفظ الإعدادات...' : 'حفظ كافة التغييرات'}
        </button>
      </div>
    </div>
  )
}
