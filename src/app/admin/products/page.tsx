'use client'

import React, { useState, useEffect } from 'react'
import { db, storage } from '@/lib/firebase'
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { Plus, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  price: number
  imageUrl: string
  createdAt: any
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  
  // Form state
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[]
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('خطأ في تحميل المنتجات')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price || !image) {
      toast.error('يرجى إكمال جميع الحقول')
      return
    }

    setAdding(true)
    try {
      // 1. Upload image to Storage
      const storageRef = ref(storage, `products/${Date.now()}_${image.name}`)
      await uploadBytes(storageRef, image)
      const imageUrl = await getDownloadURL(storageRef)

      // 2. Save product to Firestore
      await addDoc(collection(db, 'products'), {
        name,
        price: parseFloat(price),
        imageUrl,
        createdAt: new Date(),
      })

      toast.success('تمت إضافة المنتج بنجاح')
      setName('')
      setPrice('')
      setImage(null)
      setPreview(null)
      fetchProducts()
    } catch (error: any) {
      console.error('Error adding product:', error)
      if (error.code === 'storage/unauthorized' || error.message?.includes('CORS')) {
        toast.error('فشل الرفع: يرجى تفعيل إعدادات CORS كما هو موضح في دليل الحلول (Walkthrough)')
      } else {
        toast.error('خطأ في إضافة المنتج: ' + error.message)
      }
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return

    try {
      await deleteDoc(doc(db, 'products', id))
      toast.success('تم حذف المنتج')
      setProducts(products.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('خطأ في حذف المنتج')
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">إدارة المنتجات</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Product Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Plus className="text-primary" size={20} />
              إضافة منتج جديد
            </h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم المنتج</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary outline-none"
                  placeholder="مثال: ساعة ذكية"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">السعر (ج.م)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary outline-none"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">صورة المنتج</label>
                <div 
                  className="relative group cursor-pointer border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 transition-colors hover:border-primary"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                  ) : (
                    <div className="h-40 flex flex-col items-center justify-center text-slate-400">
                      <ImageIcon size={40} className="mb-2" />
                      <span>اضغط لرفع صورة</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={adding}
                className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {adding ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                {adding ? 'جاري الإضافة...' : 'إضافة المنتج'}
              </button>
            </form>
          </div>
        </div>

        {/* Products List */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
              <div className="text-slate-400 mb-2">لا توجد منتجات حالياً</div>
              <p className="text-sm">ابدأ بإضافة أول منتج لمتجرك</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product) => (
                <div key={product.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-transform hover:scale-[1.02]">
                  <img src={product.imageUrl} alt={product.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate">{product.name}</h3>
                    <p className="text-primary font-semibold">{product.price.toLocaleString('ar-EG')} ج.م</p>
                  </div>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
