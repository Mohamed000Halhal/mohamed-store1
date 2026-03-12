import React, { createContext, useContext, useState, useEffect } from 'react'
import { db, auth } from '@/lib/firebase'
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [user, setUser] = useState(null)

  // Track auth state
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
    })
  }, [])

  // Sync cart FROM Firestore when user logs in
  useEffect(() => {
    if (!user) {
      // If user logs out, clear cart or keep it local? 
      // User said "not local storage", so maybe clear it.
      return
    }

    const unsub = onSnapshot(doc(db, 'carts', user.uid), (doc) => {
      if (doc.exists()) {
        setCart(doc.data().items || [])
      }
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

  const addToCart = (productKey, productName, price, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productKey === productKey)
      
      if (existingItem) {
        return prevCart.map(item =>
          item.productKey === productKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        return [...prevCart, { productKey, productName, price, quantity }]
      }
    })
  }

  const removeFromCart = (productKey) => {
    setCart(prevCart => prevCart.filter(item => item.productKey !== productKey))
  }

  const updateQuantity = (productKey, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productKey)
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.productKey === productKey ? { ...item, quantity } : item
        )
      )
    }
  }

  const clearCart = () => {
    setCart([])
  }

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0)
  }

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
    showCart,
    setShowCart
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
