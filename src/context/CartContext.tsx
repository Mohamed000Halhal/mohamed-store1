'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { db, auth } from '@/lib/firebase'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { onAuthStateChanged, User } from 'firebase/auth'

export interface CartItem {
  id: string
  name: string
  price: number
  imageUrl: string
  quantity: number
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  cartTotal: number
  cartCount: number
  showCart: boolean
  setShowCart: (show: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  // Track auth state
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
    })
  }, [])

  // Sync cart FROM Firestore when user logs in
  useEffect(() => {
    if (!user) {
      setCart([]) // Clear cart on logout
      return
    }

    const unsub = onSnapshot(doc(db, 'carts', user.uid), (docSnippet) => {
      if (docSnippet.exists()) {
        setCart(docSnippet.data().items || [])
      }
    }, (error) => {
      console.warn('Cart sync permission error (likely logged out):', error)
    })

    return () => unsub()
  }, [user])

  // Sync cart TO Firestore whenever it changes
  useEffect(() => {
    if (user && cart.length >= 0) {
      const saveCart = async () => {
        try {
          await setDoc(doc(db, 'carts', user.uid), { items: cart })
        } catch (error) {
          console.error('Error saving cart to Firebase:', error)
        }
      }
      saveCart()
    }
  }, [cart, user])

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.id === item.id)
      const quantityToAdd = item.quantity || 1
      
      if (existingItem) {
        return prevCart.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + quantityToAdd }
            : i
        )
      } else {
        return [...prevCart, { ...item, quantity: quantityToAdd }]
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      )
    }
  }

  const clearCart = () => {
    setCart([])
  }

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0)

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
    showCart,
    setShowCart
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
