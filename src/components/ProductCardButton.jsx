import React from 'react'
import { Button } from 'react-bootstrap'
import { useCart } from '../context/CartContext'

const ProductCardButton = ({ productKey, product }) => {
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart(productKey, product.name, product.price, 1)
    // Show success message
    const message = document.createElement('div')
    message.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #28a745; color: white; padding: 15px 30px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); z-index: 10000; font-weight: bold;'
    message.textContent = `✓ تم إضافة ${product.name} إلى السلة!`
    document.body.appendChild(message)
    setTimeout(() => {
      message.style.opacity = '0'
      message.style.transition = 'opacity 0.3s'
      setTimeout(() => message.remove(), 300)
    }, 2000)
  }

  return (
    <Button
      variant="dark"
      className="mt-auto"
      onClick={handleAddToCart}
    >
      🛒 أضف للسلة
    </Button>
  )
}

export default ProductCardButton
