'use client'

import React, { useState } from 'react'
import { auth } from '@/lib/firebase'
import { updateEmail, updatePassword } from 'firebase/auth'
import { User, Mail, Lock, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState(auth.currentUser?.email || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth.currentUser) return

    setLoading(true)
    try {
      if (email !== auth.currentUser.email) {
        await updateEmail(auth.currentUser, email)
        toast.success('تم تحديث البريد الإلكتروني')
      }

      if (password) {
        if (password !== confirmPassword) {
          toast.error('كلمات المرور غير متطابقة')
          return
        }
        await updatePassword(auth.currentUser, password)
        toast.success('تم تحديث كلمة المرور')
        setPassword('')
        setConfirmPassword('')
      }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'حدث خطأ أثناء التحديث')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">إعدادات الحساب</h1>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User size={40} />
          </div>
          <div>
            <h2 className="text-xl font-bold">{auth.currentUser?.displayName || 'مسؤول المتجر'}</h2>
            <p className="text-slate-500">{auth.currentUser?.email}</p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2">
              <Mail size={16} className="text-slate-400" />
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <Lock size={16} className="text-slate-400" />
                كلمة المرور الجديدة
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary outline-none"
                placeholder="اتركها فارغة إذا لم ترد التغيير"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <Lock size={16} className="text-slate-400" />
                تأكيد كلمة المرور
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            {loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </button>
        </form>
      </div>
    </div>
  )
}
