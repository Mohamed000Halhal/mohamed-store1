import React from 'react'
import { Modal, Button, Badge } from 'react-bootstrap'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import './CartModal.css'

const CartModal = () => {
  const { cart, showCart, setShowCart, updateQuantity, removeFromCart, getTotal, getItemCount } = useCart()
  const navigate = useNavigate()

  const handleCheckout = () => {
    if (cart.length === 0) return
    setShowCart(false)
    navigate('/')
    // Dispatch event to show order form
    setTimeout(() => {
      window.dispatchEvent(new Event('cartCheckout'))
    }, 100)
  }

  return (
    <Modal 
      show={showCart} 
      onHide={() => setShowCart(false)}
      centered
      size="lg"
      className="cart-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>سلة التسوق</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {cart.length === 0 ? (
          <div className="empty-cart text-center py-5">
            <div className="empty-cart-icon mb-3">🛒</div>
            <p className="text-muted mb-2">السلة فارغة</p>
            <p className="text-muted small">أضف منتجات من صفحة الخدمات</p>
          </div>
        ) : (
          <div className="cart-items">
            {cart.map((item) => {
              const itemTotal = item.price * item.quantity
              return (
                <div key={item.productKey} className="cart-item mb-3 p-3">
                  <div className="cart-item-info">
                    <h5 className="mb-2">{item.productName}</h5>
                    <p className="text-muted mb-1 small">السعر الوحدة: {item.price.toLocaleString('ar-EG')} جنيه</p>
                    <p className="text-muted mb-2 small">الكمية: {item.quantity}</p>
                    <p className="fw-bold mb-0">الإجمالي: {itemTotal.toLocaleString('ar-EG')} جنيه</p>
                  </div>
                  <div className="cart-item-actions">
                    <div className="quantity-controls d-flex align-items-center gap-2 mb-2">
                      <Button
                        variant="outline-dark"
                        size="sm"
                        className="qty-btn"
                        onClick={() => updateQuantity(item.productKey, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="qty-value">{item.quantity}</span>
                      <Button
                        variant="outline-dark"
                        size="sm"
                        className="qty-btn"
                        onClick={() => updateQuantity(item.productKey, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="remove-btn"
                      onClick={() => removeFromCart(item.productKey)}
                    >
                      🗑️ حذف
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Modal.Body>
      {cart.length > 0 && (
        <Modal.Footer className="d-flex justify-content-between align-items-center">
          <div className="cart-total">
            <span className="text-muted">الإجمالي: </span>
            <span className="fw-bold fs-5">{getTotal().toLocaleString('ar-EG')} جنيه</span>
          </div>
          <Button variant="dark" onClick={handleCheckout} className="px-4">
            إتمام الطلب
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  )
}

export default CartModal
