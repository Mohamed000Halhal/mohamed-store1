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
import { supabase } from '@/lib/supabase'

import { Plus, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLanguage } from '@/context/LanguageContext'

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
  const { t, dir } = useLanguage()
  
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
      toast.error(t('common.error'))
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
    if (!name || !price) {
      toast.error(t('admin.products_error_fields'))
      return
    }

    if (!confirm('هل أنت متأكد من إضافة هذا المنتج الجديد؟')) return

    setAdding(true)
    try {
      let imageUrl = ''
      
      // Only upload if image exists
      if (image) {
        const fileName = `${Date.now()}_${image.name}`
        const { data, error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, image)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(fileName)
        
        imageUrl = publicUrl
      }


      // 3. Save product to Firestore
      await addDoc(collection(db, 'products'), {
        name,
        price: parseFloat(price),
        imageUrl,
        createdAt: new Date(),
      })

      toast.success(t('admin.products_success_add'))
      setName('')
      setPrice('')
      setImage(null)
      setPreview(null)
      fetchProducts()
    } catch (error: any) {
      console.error('Error adding product:', error)
      toast.error('خطأ في إضافة المنتج: ' + error.message)
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return

    try {
      await deleteDoc(doc(db, 'products', id))
      toast.success(t('common.success'))
      setProducts(products.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('خطأ في حذف المنتج')
    }
  }

  return (
    <div className="max-w-6xl mx-auto transition-colors duration-500" dir={dir}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[var(--heading-color)]">{t('nav.products')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Product Form */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--card-color)] p-6 rounded-2xl shadow-sm border border-[var(--border-color)]">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Plus className="text-primary" size={20} />
              {t('admin.products_add_new')}
            </h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم المنتج</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="مثال: ساعة ذكية"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">السعر (ج.م)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">صورة المنتج</label>
                <div 
                  className="relative group cursor-pointer border-2 border-dashed border-[var(--border-color)] rounded-xl p-4 transition-colors hover:border-primary"
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
                {adding ? t('common.loading') : t('admin.products_add_action')}
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
            <div className="bg-[var(--card-color)] p-12 rounded-2xl text-center border border-[var(--border-color)] shadow-sm">
              <div className="text-slate-400 dark:text-slate-500 mb-2 font-bold">{t('admin.products_empty')}</div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('admin.products_empty_hint')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
              {products.map((product) => (
                <div key={product.id} className="bg-[var(--card-color)] p-4 rounded-2xl border border-[var(--border-color)] shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 border border-slate-100 dark:border-slate-700">
                      <ImageIcon size={32} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate text-[var(--heading-color)]">{product.name}</h3>
                    <p className="text-primary font-black">{product.price.toLocaleString(dir==='rtl'?'ar-EG':'en-US')} {t('common.currency')}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
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
