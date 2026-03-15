'use client'

import React, { useState } from 'react'
import { auth } from '@/lib/firebase'
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'
import { User, Mail, Lock, Save, Loader2, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState(auth.currentUser?.email || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Re-auth modal state
  const [showReauthModal, setShowReauthModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [reauthLoading, setReauthLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState<'email' | 'password' | null>(null)

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
      if (error.code === 'auth/requires-recent-login') {
        // Determine what failed to retry it later
        if (email !== auth.currentUser?.email && !password) setPendingAction('email')
        else setPendingAction('password')
        
        setShowReauthModal(true)
      } else {
        toast.error(error.message || 'حدث خطأ أثناء التحديث')
      }
    } finally {
      if (!showReauthModal) setLoading(false)
    }
  }

  const handleReauth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth.currentUser?.email || !currentPassword) return

    setReauthLoading(true)
    const user = auth.currentUser
    
    try {
      if (!user || !user.email) throw new Error('لم يتم العثور على البريد الإلكتروني للمستخدم')
      
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)
      
      // Retry the pending action
      if (pendingAction === 'email' || email !== user.email) {
        await updateEmail(user, email)
        toast.success('تم تحديث البريد الإلكتروني بنجاح')
      }
      if (pendingAction === 'password' && password) {
        await updatePassword(user, password)
        toast.success('تم تحديث كلمة المرور بنجاح')
        setPassword('')
        setConfirmPassword('')
      }
      
      setShowReauthModal(false)
      setCurrentPassword('')
      setPendingAction(null)
    } catch (error: any) {
      console.error('Re-auth error details:', error)
      let msg = 'حدث خطأ غير متوقع'
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        msg = 'كلمة المرور الحالية غير صحيحة'
      } else if (error.code === 'auth/too-many-requests') {
        msg = 'تم إرسال الكثير من الطلبات، يرجى المحاولة لاحقاً'
      } else {
        msg = `فشل تأكيد الهوية: ${error.message || 'خطأ غير معروف'}`
      }
      toast.error(msg)
    } finally {
      setReauthLoading(false)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto transition-colors duration-500">
      <h1 className="text-3xl font-black mb-8 text-[var(--heading-color)]">إعدادات الحساب</h1>

      <div className="bg-[var(--card-color)] p-8 rounded-[2.5rem] border border-[var(--border-color)] shadow-xl shadow-slate-200/40 dark:shadow-none">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User size={40} />
          </div>
          <div>
            <h2 className="text-xl font-black text-[var(--heading-color)]">{auth.currentUser?.displayName || 'مسؤول المتجر'}</h2>
            <p className="text-slate-500 font-medium">{auth.currentUser?.email}</p>
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
              className="w-full px-6 py-4 rounded-2xl border border-[var(--border-color)] bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
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
                className="w-full px-6 py-4 rounded-2xl border border-[var(--border-color)] bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                placeholder="..."
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
                className="w-full px-6 py-4 rounded-2xl border border-[var(--border-color)] bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
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

      {showReauthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-[var(--card-color)] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setShowReauthModal(false)
                setCurrentPassword('')
                setLoading(false)
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={24} />
            </button>
            
            <div className="mb-6">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4">
                <Lock size={24} />
              </div>
              <h3 className="text-xl font-bold text-[var(--heading-color)] mb-2">تأكيد الهوية</h3>
              <p className="text-slate-500 text-sm">
                لأسباب أمنية، يرجى إدخال كلمة المرور الحالية لتأكيد هذا التعديل.
              </p>
            </div>

            <form onSubmit={handleReauth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  كلمة المرور الحالية
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
                  required
                  autoFocus
                />
              </div>
              
              <button
                type="submit"
                disabled={reauthLoading || !currentPassword}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {reauthLoading ? <Loader2 className="animate-spin" size={20} /> : 'تأكيد وحفظ'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
