import React, { useState, useEffect, useCallback } from 'react'
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap'
import { useCart } from '../context/CartContext'
import { db } from '../config/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { PRODUCTS, DEPOSIT, CENTERS_BY_GOVERNORATE } from '../data/products'
import ProductCardButton from '../components/ProductCardButton'
import './Home.css'

const Home = () => {
  const { cart, clearCart } = useCart()
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    governorate: '',
    center: '',
    product: '',
    quantity: '',
    address: ''
  })
  const [centers, setCenters] = useState([])
  const [priceSummary, setPriceSummary] = useState(null)

  // Listen for cart checkout event from CartModal
  useEffect(() => {
    const handleCartCheckout = () => {
      if (cart.length > 0) {
        setShowForm(true)
        fillFormFromCart()
        // Scroll to form
        setTimeout(() => {
          const orderHeader = document.getElementById('orderHeader')
          if (orderHeader) {
            orderHeader.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 300)
      }
    }
    
    window.addEventListener('cartCheckout', handleCartCheckout)
    return () => window.removeEventListener('cartCheckout', handleCartCheckout)
  }, [cart.length, fillFormFromCart])

  const fillFormFromCart = useCallback(() => {
    if (cart.length === 0) return
    
    let totalQuantity = 0
    let productKey = null
    
    if (cart.length === 1) {
      const item = cart[0]
      productKey = item.productKey
      totalQuantity = item.quantity
    } else {
      const firstItem = cart[0]
      productKey = firstItem.productKey
      totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0)
    }
    
    setFormData(prev => ({
      ...prev,
      product: productKey,
      quantity: totalQuantity.toString()
    }))
    
    updatePriceSummary(productKey, totalQuantity)
  }, [cart, updatePriceSummary])

  const handleGovernorateChange = (e) => {
    const selected = e.target.value
    setFormData(prev => ({ ...prev, governorate: selected, center: '' }))
    
    if (selected && CENTERS_BY_GOVERNORATE[selected]) {
      setCenters(CENTERS_BY_GOVERNORATE[selected])
    } else {
      setCenters([])
    }
  }

  const updatePriceSummary = useCallback((productKey, quantity) => {
    if (!productKey || !quantity) {
      setPriceSummary(null)
      return
    }
    
    const product = PRODUCTS[productKey]
    if (!product) return
    
    const unitPrice = product.price
    const totalAmount = quantity * unitPrice
    const depositAmount = quantity * DEPOSIT
    
    setPriceSummary({
      unitPrice,
      quantity,
      totalAmount,
      depositAmount,
      totalWithDeposit: totalAmount
    })
  }, [])

  const handleProductChange = (e) => {
    const productKey = e.target.value
    setFormData(prev => {
      const quantity = parseInt(prev.quantity) || 0
      updatePriceSummary(productKey, quantity)
      return { ...prev, product: productKey }
    })
  }

  const handleQuantityChange = (e) => {
    const quantity = parseInt(e.target.value) || 0
    setFormData(prev => {
      updatePriceSummary(prev.product, quantity)
      return { ...prev, quantity: e.target.value }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ text: '', type: '' })
    
    if (!formData.name || !formData.mobile || !formData.governorate || 
        !formData.center || !formData.product || !formData.quantity || !formData.address) {
      setMessage({ text: 'يرجى ملء جميع الحقول', type: 'error' })
      return
    }
    
    const productInfo = PRODUCTS[formData.product]
    if (!productInfo) {
      setMessage({ text: 'المنتج غير صحيح', type: 'error' })
      return
    }
    
    const quantityNum = parseInt(formData.quantity)
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setMessage({ text: 'عدد القطع غير صحيح', type: 'error' })
      return
    }
    
    const order = {
      name: formData.name.trim(),
      mobile: formData.mobile.trim(),
      governorate: formData.governorate,
      center: formData.center,
      productName: productInfo.name,
      productKey: formData.product,
      quantity: quantityNum,
      address: formData.address.trim(),
      unitPrice: productInfo.price,
      totalAmount: quantityNum * productInfo.price,
      depositAmount: quantityNum * DEPOSIT,
      priceAfterDeposit: (quantityNum * productInfo.price) - (quantityNum * DEPOSIT),
      totalWithDeposit: quantityNum * productInfo.price,
      date: new Date().toISOString(),
      status: 'pending'
    }
    
    try {
      await addDoc(collection(db, 'orders'), order)
      setMessage({ text: 'تم إرسال الطلب بنجاح! شكراً لك', type: 'success' })
      
      // Reset form
      setFormData({
        name: '',
        mobile: '',
        governorate: '',
        center: '',
        product: '',
        quantity: '',
        address: ''
      })
      setPriceSummary(null)
      setShowForm(false)
      clearCart() // Clear cart after successful order
    } catch (error) {
      console.error('Error saving order:', error)
      setMessage({ text: 'حدث خطأ أثناء حفظ الطلب. يرجى المحاولة مرة أخرى.', type: 'error' })
    }
  }

  return (
    <div className="home-page">
      <Container className="container-custom">
        {/* Products Section */}
        <section className="products-section mb-5">
          <h2 className="text-center mb-4">منتجاتنا</h2>
          <Row className="g-4">
            {Object.entries(PRODUCTS).map(([key, product]) => (
              <Col key={key} xs={12} sm={6} md={4} lg={3}>
                <Card className="product-card h-100">
                  <Card.Img 
                    variant="top" 
                    src={`/img/${product.image}`} 
                    className="product-image"
                  />
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>{product.name}</Card.Title>
                    <Card.Text className="product-price">
                      {product.price.toLocaleString('ar-EG')} جنيه
                    </Card.Text>
                    <ProductCardButton productKey={key} product={product} />
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {/* Order Form Section */}
        {showForm && (
          <>
            <div id="orderHeader">
              <Card className="mb-4">
                <Card.Body className="text-center py-4">
                  <h1>اطلب الآن</h1>
                  <p className="text-muted">املأ النموذج أدناه لإتمام طلبك</p>
                </Card.Body>
              </Card>
            </div>

            <Form id="orderForm" onSubmit={handleSubmit} className="order-form">
          <Card>
            <Card.Body className="p-4">
              {message.text && (
                <Alert variant={message.type === 'error' ? 'danger' : 'success'} className="mb-3">
                  {message.text}
                </Alert>
              )}

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>الاسم الكامل *</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      placeholder="أدخل اسمك الكامل"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>رقم الموبايل *</Form.Label>
                    <Form.Control
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                      required
                      placeholder="01XXXXXXXXX"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>المحافظة *</Form.Label>
                    <Form.Select
                      value={formData.governorate}
                      onChange={handleGovernorateChange}
                      required
                    >
                      <option value="">-- اختر المحافظة --</option>
                      {Object.keys(CENTERS_BY_GOVERNORATE).map(gov => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>المركز *</Form.Label>
                    <Form.Select
                      value={formData.center}
                      onChange={(e) => setFormData(prev => ({ ...prev, center: e.target.value }))}
                      required
                      disabled={!formData.governorate}
                    >
                      <option value="">-- اختر المركز --</option>
                      {centers.map(center => (
                        <option key={center} value={center}>{center}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>اختر المنتج *</Form.Label>
                    <Form.Select
                      value={formData.product}
                      onChange={handleProductChange}
                      required
                      disabled={cart.length > 0 && cart.length === 1}
                      style={cart.length > 0 && cart.length === 1 ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                    >
                      <option value="">-- اختر منتج --</option>
                      {Object.entries(PRODUCTS).map(([key, product]) => (
                        <option key={key} value={key}>
                          {product.name} - {product.price.toLocaleString('ar-EG')} جنيه
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>عدد القطع *</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.quantity}
                      onChange={handleQuantityChange}
                      required
                      min="1"
                      readOnly
                      style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                      placeholder="سيتم ملؤه تلقائياً من السلة"
                    />
                  </Form.Group>
                </Col>
              </Row>

              {formData.product && (
                <div className="mb-3 text-center">
                  <img
                    src={`/img/${PRODUCTS[formData.product].image}`}
                    alt={PRODUCTS[formData.product].name}
                    className="product-preview-img"
                  />
                </div>
              )}

              <Form.Group className="mb-3">
                <Form.Label>العنوان التفصيلي *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  required
                  placeholder="أدخل العنوان الكامل"
                />
              </Form.Group>

              {priceSummary && (
                <Card className="mb-3 bg-light">
                  <Card.Body>
                    <h5 className="mb-3">ملخص السعر</h5>
                    <div className="d-flex justify-content-between mb-2">
                      <span>سعر القطعة الواحدة:</span>
                      <span>{priceSummary.unitPrice.toLocaleString('ar-EG')} جنيه</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>عدد القطع:</span>
                      <span>{priceSummary.quantity}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>المبلغ الكلي:</span>
                      <span>{priceSummary.totalAmount.toLocaleString('ar-EG')} جنيه</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>العربون (200ج × عدد القطع):</span>
                      <span>{priceSummary.depositAmount.toLocaleString('ar-EG')} جنيه</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between fw-bold fs-5">
                      <span>المبلغ الإجمالي:</span>
                      <span>{priceSummary.totalWithDeposit.toLocaleString('ar-EG')} جنيه</span>
                    </div>
                  </Card.Body>
                </Card>
              )}

              <Card className="mb-3 bg-light">
                <Card.Body>
                  <h5 className="mb-3">معلومات الدفع</h5>
                  <p><strong>طريقة الدفع:</strong> فودافون كاش فقط</p>
                  <p><strong>يرجى تحويل المبلغ على رقم فودافون كاش:</strong> <span className="text-danger fw-bold">01090985754</span> (نفس رقم الواتساب)</p>
                  <p><strong>بعد الدفع يرجى إرسال صورة (اسكرين شوت) لعملية التحويل على نفس رقم الواتساب.</strong></p>
                  <p className="text-danger fw-bold mb-0">⚠️ ملاحظة مهمة: يتم دفع مبلغ 200ج عربون قبل عملية الشراء والاستلام</p>
                </Card.Body>
              </Card>

              <Button variant="dark" type="submit" size="lg" className="w-100">
                إرسال الطلب
              </Button>
            </Card.Body>
          </Card>
        </Form>
          </>
        )}
      </Container>
    </div>
  )
}

export default Home
