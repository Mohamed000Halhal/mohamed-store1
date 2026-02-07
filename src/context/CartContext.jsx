import React, { createContext, useContext, useState, useEffect } from 'react'

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

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('shopping_cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shopping_cart', JSON.stringify(cart))
  }, [cart])

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
