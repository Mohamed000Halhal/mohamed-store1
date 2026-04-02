'use client'

import React, { useState, useEffect, useRef } from 'react'
import { db, auth } from '@/lib/firebase'
import { supabase, getProfileImageUrl } from '@/lib/supabase'
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  doc,
  updateDoc
} from 'firebase/firestore'
import { 
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Loader2,
  Save,
  Shield,
  Calendar,
  TrendingUp,
  Package,
  DollarSign,
  CheckCircle2,
  ImagePlus,
  Key
} from 'lucide-react'
import { 
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  updateEmail, 
  updatePassword 
} from 'firebase/auth'
import toast from 'react-hot-toast'
import { useLanguage } from '@/context/LanguageContext'

export default function SecretaryProfilePage() {
  const [secretary, setSecretary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profileImage, setProfileImage] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    newPassword: '',
  })
  const [showReauthModal, setShowReauthModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t, dir } = useLanguage()

  useEffect(() => {
    let unsubDoc: (() => void) | null = null;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const q = query(collection(db, 'secretaries'), where('email', '==', user.email))
        unsubDoc = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const docData = snapshot.docs[0].data()
            const data = { 
              id: snapshot.docs[0].id, 
              ...docData,
              email: user.email
            } as any
            setSecretary(data)
            setProfileImage(data.profileImage || '')
            // Only explicitly set form data if it hasn't been typed in yet, or let it load
            setFormData(prev => ({
              name: prev.name || data.name || '',
              phone: prev.phone || data.phone || '',
              email: prev.email || data.email || user.email || '',
              newPassword: '',
            }))
          }
          setLoading(false)
        })
      } else {
        setLoading(false)
        if (unsubDoc) unsubDoc()
      }
    })

    return () => {
      unsubscribeAuth()
      if (unsubDoc) unsubDoc()
    }
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('sec_profile_image_only'))
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('sec_profile_image_size'))
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `secretary-${secretary.id}-${Date.now()}.${fileExt}`
      const filePath = `profile-images/${fileName}`

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) throw error

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl

      // Save URL to Firestore
      await updateDoc(doc(db, 'secretaries', secretary.id), {
        profileImage: publicUrl
      })

      setProfileImage(publicUrl)
      toast.success(t('sec_profile_image_success'))
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || t('sec_profile_image_error'))
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!secretary?.id || !auth.currentUser) return

    const emailChanged = formData.email !== auth.currentUser.email
    const passwordChanged = formData.newPassword.length > 0

    if (emailChanged || passwordChanged) {
      setShowReauthModal(true)
      return
    }

    executeContentUpdate()
  }

  const handleConfirmReauth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth.currentUser) return
    
    setSaving(true)
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword)
      await reauthenticateWithCredential(auth.currentUser, credential)
      
      // Update Auth Email if changed
      if (formData.email !== auth.currentUser.email) {
        await updateEmail(auth.currentUser, formData.email)
      }

      // Update Auth Password if changed
      if (formData.newPassword) {
        await updatePassword(auth.currentUser, formData.newPassword)
      }

      await executeContentUpdate()
      setShowReauthModal(false)
      setCurrentPassword('')
    } catch (error: any) {
      console.error('Re-auth error:', error)
      let msg = t('common.error')
      if (error.code === 'auth/wrong-password') {
        msg = 'كلمة المرور الحالية غير صحيحة'
      }
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const executeContentUpdate = async () => {
    if (!secretary?.id) return
    setSaving(true)
    try {
      const updateData: any = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
      }
      if (formData.newPassword) {
        updateData.password = formData.newPassword
      }

      await updateDoc(doc(db, 'secretaries', secretary.id), updateData)
      setSecretary({ ...secretary, ...updateData })
      toast.success(t('sec_profile_save_success'))
      setFormData(prev => ({ ...prev, newPassword: '' }))
    } catch (error) {
      console.error(error)
      toast.error(t('sec_profile_save_error'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-4xl mx-auto">
      {/* Profile Header Card */}
      <div className="relative bg-gradient-to-l from-primary to-secondary p-10 rounded-[2.5rem] text-white overflow-hidden shadow-2xl shadow-primary/20">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          {/* Avatar Section */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2rem] bg-white/20 backdrop-blur-md border-4 border-white/30 overflow-hidden shadow-2xl flex items-center justify-center">
              {profileImage ? (
                <img 
                  src={getProfileImageUrl(profileImage) || undefined} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={56} className="text-white/70" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-white text-primary shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Camera size={20} />
              )}
            </button>
            <input 
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {/* Info Section */}
          <div className="text-center md:text-right flex-1">
            <h1 className="text-3xl font-black mb-2">{secretary?.name || t('sec_role')}</h1>
            <p className="opacity-90 font-bold text-lg">{secretary?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
              <div className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-sm font-bold flex items-center gap-2">
                <Shield size={14} />
                {t('sec_role')}
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-sm font-bold flex items-center gap-2">
                <CheckCircle2 size={14} />
                {secretary?.onlineStatus ? t('admin.sec_online') : t('admin.sec_offline')}
              </div>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <User className="absolute -left-8 -bottom-8 opacity-10 w-64 h-64" />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--card-color)] p-6 rounded-[2rem] border border-[var(--border-color)] shadow-xl shadow-slate-200/30 dark:shadow-none flex items-center gap-4 hover:border-green-400/50 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('secretary.delivered_stat')}</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">{secretary?.deliveredCount || 0}</h3>
          </div>
        </div>

        <div className="bg-[var(--card-color)] p-6 rounded-[2rem] border border-[var(--border-color)] shadow-xl shadow-slate-200/30 dark:shadow-none flex items-center gap-4 hover:border-indigo-400/50 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('order.status_returned')}</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">{secretary?.returnedCount || 0}</h3>
          </div>
        </div>

        <div className="bg-[var(--card-color)] p-6 rounded-[2rem] border border-[var(--border-color)] shadow-xl shadow-slate-200/30 dark:shadow-none flex items-center gap-4 hover:border-rose-400/50 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('sec_salary_expected')}</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">{(secretary?.monthlySalary || (secretary?.deliveredCount || 0) * 50).toLocaleString()} {t('common.currency')}</h3>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-[var(--card-color)] rounded-[2.5rem] border border-[var(--border-color)] shadow-xl shadow-slate-200/30 dark:shadow-none p-8 md:p-10">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <User size={24} />
          </div>
          {t('sec_profile_title')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Name */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <User size={14} />
              {t('sec_profile_name')}
            </label>
            <input 
              type="text"
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 font-bold focus:ring-4 ring-primary/10 transition-all outline-none text-slate-800 dark:text-white"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder={t('sec_profile_name')}
            />
          </div>

          {/* Email */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Mail size={14} />
              {t('sec_profile_email')}
            </label>
            <input 
              type="email"
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 font-bold focus:ring-4 ring-primary/10 transition-all outline-none text-slate-800 dark:text-white"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder={t('sec_profile_email')}
            />
          </div>

          {/* New Password */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Lock size={14} />
              كلمة مرور جديدة (اختياري)
            </label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                className={`w-full ${dir === 'rtl' ? 'pl-14 pr-6' : 'pr-14 pl-6'} py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 font-bold focus:ring-4 ring-primary/10 transition-all outline-none text-slate-800 dark:text-white`}
                value={formData.newPassword}
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                placeholder="********"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute ${dir === 'rtl' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors`}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Phone size={14} />
              {t('sec_profile_phone')}
            </label>
            <input 
              type="tel"
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 font-bold focus:ring-4 ring-primary/10 transition-all outline-none text-slate-800 dark:text-white"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="01XXXXXXXXX"
              dir="ltr"
            />
          </div>

          {/* Profile Image Upload */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Camera size={14} />
              {t('sec_profile_image')}
            </label>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 font-bold text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {t('sec_profile_uploading')}
                </>
              ) : (
                <>
                  <ImagePlus size={20} />
                  {profileImage ? t('sec_profile_change_image') : t('sec_profile_upload_image')}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-10 flex justify-end">
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={22} />
            ) : (
              <Save size={22} />
            )}
            {t('sec_profile_save_changes')}
          </button>
        </div>
      </div>
      {/* Re-authentication Modal */}
      {showReauthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white">تأكيد الهوية</h2>
              <p className="text-sm font-bold text-slate-500 mt-2">يرجى إدخال كلمة مرورك الحالية لتأكيد تغيير ملفك الشخصي</p>
            </div>

            <form onSubmit={handleConfirmReauth} className="space-y-4">
              <div className="relative">
                <Lock className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
                <input 
                  type="password" 
                  required
                  autoFocus
                  placeholder="كلمة المرور الحالية"
                  className={`w-full ${dir === 'rtl' ? 'pr-12' : 'pl-12'} py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold focus:ring-2 ring-primary/20 outline-none`}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={18} className="animate-spin" />}
                  تأكيد وحفظ
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setShowReauthModal(false)
                    setCurrentPassword('')
                  }}
                  className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-4 rounded-2xl font-black transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
