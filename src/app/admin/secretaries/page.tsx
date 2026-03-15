'use client'

import React, { useState, useEffect } from 'react'
import { db, auth } from '@/lib/firebase'
import { 
  collection, 
  onSnapshot, 
  doc, 
  deleteDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where,
  serverTimestamp,
  writeBatch,
  setDoc
} from 'firebase/firestore'
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Circle, 
  Calculator, 
  RefreshCcw, 
  Search,
  Mail,
  Lock,
  User,
  DollarSign,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  updateProfile, 
  getAuth as getFirebaseAuth,
  signInWithEmailAndPassword as signInWithEmailSecondary,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth'
import { initializeApp, deleteApp, getApps } from 'firebase/app'
import { useLanguage } from '@/context/LanguageContext'
import { Edit2, Eye, EyeOff } from 'lucide-react'

interface Secretary {
  id: string
  name: string
  email: string
  deliveredCount: number
  returnedCount: number
  onlineStatus: boolean
  lastSeen: any
  profileImage?: string
  password?: string
}

export default function SecretariesPage() {
  const [secretaries, setSecretaries] = useState<Secretary[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showEditPassword, setShowEditPassword] = useState(false)
  const [showAdminConfirmModal, setShowAdminConfirmModal] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [confirmCallback, setConfirmCallback] = useState<{ type: 'update' | 'view', secId?: string } | null>(null)
  const [visibleCredentials, setVisibleCredentials] = useState<Record<string, boolean>>({})
  const [newSec, setNewSec] = useState({ name: '', email: '', password: '' })
  const [editSec, setEditSec] = useState<Secretary | null>(null)
  const [originalSec, setOriginalSec] = useState<Secretary | null>(null)
  const [piecePrice, setPiecePrice] = useState(300)
  const [isCalculating, setIsCalculating] = useState(false)
  const { t, dir } = useLanguage()

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'secretaries'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Secretary[]
      setSecretaries(data)
      setLoading(false)
    }, (error) => {
      console.warn("Secretaries listener permission error:", error)
      setLoading(false)
    })

    const unsubSalary = onSnapshot(doc(db, 'system_settings', 'salary'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().piecePrice !== undefined) {
        setPiecePrice(docSnap.data().piecePrice)
      }
    })

    return () => {
      unsub()
      unsubSalary()
    }
  }, [])

  const handleAddSecretary = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    let secondaryApp;
    
    try {
      const normalizedEmail = newSec.email.toLowerCase().trim()
      
      // 1. Create the user in Firebase Authentication using a secondary app instance
      // This prevents the current admin session from being signed out
      const secondaryAppName = `secondary-app-${Date.now()}`;
      const firebaseConfig = {
        apiKey: "AIzaSyC0BjvQRGMxQMwksldcawRwQa54Q_h2XMc",
        authDomain: "mohamedemara-79f1a.firebaseapp.com",
        projectId: "mohamedemara-79f1a",
        storageBucket: "mohamedemara-79f1a.firebasestorage.app",
        messagingSenderId: "271024419210",
        appId: "1:271024419210:web:3e43ddec7c8aaeb8c85873"
      };

      console.log('Creating secondary app for ADD:', secondaryAppName);
      secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
      const secondaryAuth = getFirebaseAuth(secondaryApp);
      
      console.log('Attempting to create Auth user:', normalizedEmail);
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth, 
        normalizedEmail, 
        newSec.password.trim()
      );
      console.log('Auth user created successfully:', userCredential.user.uid);

      // Update the name in Auth
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: newSec.name
        });
      }

      // 2. Clear the secondary app
      await deleteApp(secondaryApp);

      // 3. Save the data in Firestore
      await addDoc(collection(db, 'secretaries'), {
        name: newSec.name,
        email: normalizedEmail,
        password: newSec.password, // Storing for reference as requested
        deliveredCount: 0,
        returnedCount: 0,
        onlineStatus: false,
        lastSeen: serverTimestamp()
      })

      toast.success(t('admin.sec_success_add'))
      setShowAddModal(false)
      setNewSec({ name: '', email: '', password: '' })
    } catch (error: any) {
      console.error(error)
      if (secondaryApp) await deleteApp(secondaryApp).catch(() => {});
      
      let msg = t('common.error');
      if (error.code === 'auth/email-already-in-use') {
        msg = 'هذا البريد الإلكتروني مستخدم بالفعل';
      } else if (error.code === 'auth/weak-password') {
        msg = 'كلمة المرور ضعيفة جداً';
      }
      
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSecretary = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editSec || !originalSec) return

    const normalizedEmail = editSec.email.toLowerCase().trim()
    const originalEmail = originalSec.email.toLowerCase().trim()
    const originalPassword = (originalSec.password || '').trim()
    const newPassword = ((editSec as any).password || '').trim()

    const emailChanged = normalizedEmail !== originalEmail
    const passwordChanged = newPassword !== originalPassword && newPassword !== ''

    // If sensitive data changed, we need admin confirmation first
    if (emailChanged || passwordChanged) {
      setConfirmCallback({ type: 'update' })
      setShowAdminConfirmModal(true)
      return
    }

    // If only name or nothing changed, update normally
    executeSecretaryUpdate()
  }

  const handleShowCredentials = (secId: string) => {
    if (visibleCredentials[secId]) {
      setVisibleCredentials(prev => ({ ...prev, [secId]: false }))
      return
    }
    setConfirmCallback({ type: 'view', secId })
    setShowAdminConfirmModal(true)
  }

  const handleConfirmAdminUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth.currentUser) return
    
    setLoading(true)
    try {
      // 1. Re-authenticate Admin
      const credential = EmailAuthProvider.credential(auth.currentUser.email!, adminPassword)
      await reauthenticateWithCredential(auth.currentUser, credential)
      
      if (confirmCallback?.type === 'update') {
        await executeSecretaryUpdate()
      } else if (confirmCallback?.type === 'view' && confirmCallback.secId) {
        setVisibleCredentials(prev => ({ ...prev, [confirmCallback.secId!]: true }))
        toast.success('تم التحقق، تظهر البيانات الآن')
      }
      
      setShowAdminConfirmModal(false)
      setAdminPassword('')
      setConfirmCallback(null)
    } catch (error: any) {
      console.error('Admin Re-auth failed:', error)
      toast.error('كلمة مرور الأدمن غير صحيحة')
    } finally {
      setLoading(false)
    }
  }

  const executeSecretaryUpdate = async () => {
    if (!editSec || !originalSec) return
    setLoading(true)
    let secondaryApp;
    
    try {
      const normalizedEmail = editSec.email.toLowerCase().trim()
      const originalEmail = originalSec.email.toLowerCase().trim()
      const originalPassword = (originalSec.password || '').trim()
      const newPassword = ((editSec as any).password || '').trim()

      const emailChanged = normalizedEmail !== originalEmail
      const passwordChanged = newPassword !== originalPassword && newPassword !== ''

    // If sensitive data changed, we need to update via Admin SDK API
    if (emailChanged || passwordChanged) {
      const idToken = await auth.currentUser?.getIdToken();
      
      const response = await fetch('/api/admin/update-secretary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          originalEmail,
          email: normalizedEmail,
          password: newPassword,
          name: editSec.name
        })
      });

      const result = await response.json().catch(() => null);
      if (!result || !result.success) {
        throw { 
          message: result?.error || `Server Error (${response.status})`,
          code: result?.code 
        };
      }
      console.log('Admin SDK update successful');
    }

      const updateData: any = {
        name: editSec.name,
        email: normalizedEmail
      }
      
      if (newPassword) {
        updateData.password = newPassword
      }
      
      await updateDoc(doc(db, 'secretaries', editSec.id), updateData)
      toast.success(t('admin.sec_update_success'))
      setShowEditModal(false)
      setEditSec(null)
      setOriginalSec(null)
    } catch (error: any) {
      console.error('Error updating secretary details:', error.code, error.message)
      if (secondaryApp) await deleteApp(secondaryApp).catch(() => {});
      
      let msg = t('common.error');
      if (error.code === 'auth/requires-recent-login') {
        msg = 'يجب على السكرتير تسجيل الدخول مؤخراً لتغيير هذه البيانات، أو يفضل حذفه وإنشاؤه من جديد';
      } else if (error.code === 'auth/email-already-in-use') {
        msg = 'البريد الإلكتروني الجديد مستخدم بالفعل';
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        msg = 'كلمة السر القديمة المخزنة في النظام غير صحيحة، لا يمكن تحديث بيانات الدخول';
      } else if (error.code === 'auth/user-not-found') {
        msg = 'هذا السكرتير ليس له حساب في نظام الدخول الحالي، سأقوم بتحديث البيانات في قاعدة البيانات فقط';
        try {
           const updateData: any = { name: editSec.name, email: editSec.email.toLowerCase().trim(), password: (editSec as any).password };
           await updateDoc(doc(db, 'secretaries', editSec.id), updateData);
           toast.success('تم تحديث البيانات في قاعدة البيانات (حساب الدخول غير موجود)');
           setShowEditModal(false);
           return;
        } catch (e) {
           console.error('Fallback update failed:', e);
        }
      }
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleSendResetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      toast.success(t('admin.sec_reset_password_success'))
    } catch (error) {
      console.error(error)
      toast.error(t('common.error'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirm_action'))) return
    try {
      await deleteDoc(doc(db, 'secretaries', id))
      toast.success(t('common.success'))
    } catch (error) {
      toast.error(t('common.error'))
    }
  }

  const handleResetCounters = async (id?: string) => {
    if (!confirm(t('admin.sec_confirm_reset'))) return
    try {
      if (id) {
        await updateDoc(doc(db, 'secretaries', id), {
          deliveredCount: 0,
          returnedCount: 0
        })
      } else {
        const batch = writeBatch(db)
        secretaries.forEach(sec => {
          batch.update(doc(db, 'secretaries', sec.id), {
            deliveredCount: 0,
            returnedCount: 0
          })
        })
        await batch.commit()
      }
      toast.success(t('common.success'))
    } catch (error) {
      toast.error(t('common.error'))
    }
  }

  const handleCalculateSalaries = async () => {
    if (!confirm(t('admin.sec_calc_confirm'))) return
    setIsCalculating(true)
    try {
      await setDoc(doc(db, 'system_settings', 'salary'), { piecePrice }, { merge: true })
      
      const batch = writeBatch(db)
      secretaries.forEach(sec => {
        const calculatedSalary = (sec.deliveredCount || 0) * piecePrice
        batch.update(doc(db, 'secretaries', sec.id), {
          monthlySalary: calculatedSalary
        })
      })
      await batch.commit()
      
      toast.success(t('admin.sec_calc_success'))
    } catch (error) {
      console.error(error)
      toast.error(t('common.error'))
    } finally {
      setIsCalculating(false)
    }
  }

  const handleResetPiecePrice = async () => {
    try {
      await setDoc(doc(db, 'system_settings', 'salary'), { piecePrice: 300 }, { merge: true })
      toast.success(t('admin.sec_piece_reset_success'))
    } catch (error) {
      console.error(error)
      toast.error(t('common.error'))
    }
  }

  // Helper to determine if secretary is strictly online (within last 2.5 minutes)
  const isSecretaryOnline = (sec: Secretary) => {
    if (sec.onlineStatus === false) return false;
    if (!sec.lastSeen) return false;
    
    try {
      const lastSeenDate = sec.lastSeen?.toDate ? sec.lastSeen.toDate() : new Date(sec.lastSeen);
      const now = new Date();
      const diffMinutes = (now.getTime() - lastSeenDate.getTime()) / 60000;
      return diffMinutes <= 2.5; // Valid if pinged in the last 2.5 minutes
    } catch (e) {
      return false;
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8" dir={dir}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <Users className="text-primary" size={32} />
            {t('nav.secretaries')}
          </h1>
          <p className="text-slate-500 mt-1 font-bold">{t('admin.sec_subtitle')}</p>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <UserPlus size={20} />
          {t('admin.sec_add_new')}
        </button>
      </div>

      {/* Salary Calculator Card */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 p-6 rounded-3xl mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-primary">
            <Calculator size={28} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white">{t('admin.sec_calc_title')}</h2>
            <p className="text-sm font-bold text-slate-500">{t('admin.sec_calc_desc')}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full lg:w-48">
            <DollarSign className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
            <input 
              type="number" 
              placeholder={t('admin.sec_piece_price')}
              className={`w-full ${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-black focus:ring-2 ring-primary/20 transition-all outline-none text-primary`}
              value={piecePrice}
              onChange={(e) => setPiecePrice(Number(e.target.value))}
            />
          </div>
          <button 
            onClick={handleCalculateSalaries}
            disabled={isCalculating}
            className="flex-1 lg:flex-none bg-primary hover:bg-primary/90 text-white px-6 py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isCalculating ? <Loader2 size={18} className="animate-spin" /> : <Calculator size={18} />}
            {t('admin.sec_calc_action_all')}
          </button>
          <button 
            onClick={handleResetPiecePrice}
            title={t('admin.sec_piece_reset_title')}
            className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 p-3.5 rounded-2xl transition-all active:scale-95"
          >
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
        {secretaries.map((sec) => (
          <div key={sec.id} className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all hover:border-primary/50 group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-black text-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors overflow-hidden">
                    {sec.profileImage ? (
                      <img src={sec.profileImage} alt={sec.name} className="w-full h-full object-cover" />
                    ) : (
                      sec.name[0]
                    )}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white dark:border-slate-800 ${isSecretaryOnline(sec) ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 dark:text-white group-hover:text-primary transition-colors">{sec.name}</h3>
                  <p className={`text-xs font-bold ${isSecretaryOnline(sec) ? 'text-green-500' : 'text-slate-400'}`}>
                    {isSecretaryOnline(sec) ? t('admin.sec_online') : t('admin.sec_offline')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => {
                    const secToEdit = {...sec, password: (sec as any).password || ''}
                    setEditSec(secToEdit)
                    setOriginalSec(secToEdit)
                    setShowEditModal(true)
                  }}
                  className="p-3 text-secondary hover:bg-secondary/10 rounded-xl transition-all"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(sec.id)}
                  className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                <span className="text-sm font-bold text-slate-500">{t('order.status_delivered')}</span>
                <span className="text-lg font-black text-green-600">{sec.deliveredCount}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                <span className="text-sm font-bold text-slate-500">{t('order.status_returned')}</span>
                <span className="text-lg font-black text-red-600">{sec.returnedCount}</span>
              </div>
              


              <div className="flex justify-between items-center bg-primary/5 p-4 rounded-2xl border border-primary/10">
                <span className="text-sm font-black text-primary">{t('admin.sec_due_by_piece')}</span>
                <span className="text-lg font-black text-primary">{(sec.deliveredCount * piecePrice).toLocaleString(dir==='rtl'?'ar-EG':'en-US')} {t('common.currency')}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => handleResetCounters(sec.id)}
                className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 p-3 rounded-xl text-xs font-black text-slate-600 dark:text-slate-300 transition-colors"
              >
                {t('admin.sec_reset_one')}
              </button>
              
              <div className="flex-[2] flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] font-bold text-slate-400 truncate">
                    {visibleCredentials[sec.id] ? sec.email : '••••••••@••••.•••'}
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 truncate mt-0.5">
                    {visibleCredentials[sec.id] ? (sec.password || 'N/A') : '••••••••'}
                  </div>
                </div>
                <button 
                  onClick={() => handleShowCredentials(sec.id)}
                  className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-all"
                  title={visibleCredentials[sec.id] ? "إخفاء" : "عرض البيانات"}
                >
                  {visibleCredentials[sec.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6 text-center">{t('admin.sec_add_new')}</h2>
            <form onSubmit={handleAddSecretary} className="space-y-4">
              <div className="space-y-2">
                <label className={`text-sm font-black text-slate-500 ${dir === 'rtl' ? 'mr-2' : 'ml-2'}`}>{t('login.name')}</label>
                <div className="relative">
                  <User className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
                  <input 
                    type="text" 
                    required
                    className={`w-full ${dir === 'rtl' ? 'pr-12' : 'pl-12'} py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold focus:ring-2 ring-primary/20 outline-none`}
                    value={newSec.name}
                    onChange={(e) => setNewSec({...newSec, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className={`text-sm font-black text-slate-500 ${dir === 'rtl' ? 'mr-2' : 'ml-2'}`}>{t('login.email')}</label>
                <div className="relative">
                  <Mail className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
                  <input 
                    type="email" 
                    required
                    className={`w-full ${dir === 'rtl' ? 'pr-12' : 'pl-12'} py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold focus:ring-2 ring-primary/20 outline-none`}
                    value={newSec.email}
                    onChange={(e) => setNewSec({...newSec, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className={`text-sm font-black text-slate-500 ${dir === 'rtl' ? 'mr-2' : 'ml-2'}`}>{t('login.password')}</label>
                <div className="relative">
                  <Lock className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
                  <input 
                    type="text" 
                    required
                    className={`w-full ${dir === 'rtl' ? 'pr-12' : 'pl-12'} py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold focus:ring-2 ring-primary/20 outline-none`}
                    value={newSec.password}
                    onChange={(e) => setNewSec({...newSec, password: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit"
                  className="flex-1 bg-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-primary/30 transition-all active:scale-95"
                >
                  {t('common.save')}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-4 rounded-2xl font-black transition-all"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editSec && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6 text-center">{t('admin.sec_edit_title')}</h2>
            <form onSubmit={handleUpdateSecretary} className="space-y-4">
              <div className="space-y-2">
                <label className={`text-sm font-black text-slate-500 ${dir === 'rtl' ? 'mr-2' : 'ml-2'}`}>{t('login.name')}</label>
                <div className="relative">
                  <User className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
                  <input 
                    type="text" 
                    required
                    className={`w-full ${dir === 'rtl' ? 'pr-12' : 'pl-12'} py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold focus:ring-2 ring-primary/20 outline-none`}
                    value={editSec.name}
                    onChange={(e) => setEditSec({...editSec, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className={`text-sm font-black text-slate-500 ${dir === 'rtl' ? 'mr-2' : 'ml-2'}`}>{t('login.email')}</label>
                <div className="relative">
                  <Mail className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
                  <input 
                    type="email" 
                    required
                    className={`w-full ${dir === 'rtl' ? 'pr-12' : 'pl-12'} py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold focus:ring-2 ring-primary/20 outline-none`}
                    value={editSec.email}
                    onChange={(e) => setEditSec({...editSec, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className={`text-sm font-black text-slate-500 ${dir === 'rtl' ? 'mr-2' : 'ml-2'}`}>{t('login.password')}</label>
                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <Lock className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
                    <input 
                      type={showEditPassword ? 'text' : 'password'} 
                      className={`w-full ${dir === 'rtl' ? 'pr-12 pl-12' : 'pl-12 pr-12'} py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold focus:ring-2 ring-primary/20 outline-none`}
                      value={(editSec as any).password || ''}
                      onChange={(e) => setEditSec({...editSec, password: e.target.value})}
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className={`absolute ${dir === 'rtl' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors`}
                    >
                      {showEditPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSendResetPassword(editSec.email)}
                  className="w-full mt-2 py-3 border border-secondary text-secondary rounded-xl font-bold hover:bg-secondary hover:text-white transition-colors"
                >
                  {t('admin.sec_reset_password')}
                </button>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit"
                  className="flex-1 bg-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-primary/30 transition-all active:scale-95"
                >
                  {t('common.save')}
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditSec(null)
                  }}
                  className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-4 rounded-2xl font-black transition-all"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Verification Modal */}
      {showAdminConfirmModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center mb-4">
                <Lock size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">تأكيد هوية المسؤول</h2>
              <p className="text-sm font-bold text-slate-500 mt-2">يرجى إدخال كلمة مرورك كأدمن لتأكيد إجراء تغييرات حساسة</p>
            </div>

            <form onSubmit={handleConfirmAdminUpdate} className="space-y-4">
              <div className="relative">
                <Lock className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
                <input 
                  type="password" 
                  required
                  autoFocus
                  placeholder="كلمة مرورك كأدمن"
                  className={`w-full ${dir === 'rtl' ? 'pr-12' : 'pl-12'} py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold focus:ring-2 ring-primary/20 outline-none`}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  تأكيد وحفظ
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setShowAdminConfirmModal(false)
                    setAdminPassword('')
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
