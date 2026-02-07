import React from 'react'
import { Container, Card, Row, Col, Button } from 'react-bootstrap'
import { useCart } from '../context/CartContext'
import { PRODUCTS } from '../data/products'
import './Services.css'

const Services = () => {
  const { addToCart } = useCart()

  const handleAddToCart = (productKey, productName, price) => {
    addToCart(productKey, productName, price, 1)
    const message = document.createElement('div')
    message.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #28a745; color: white; padding: 15px 30px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); z-index: 10000; font-weight: bold;'
    message.textContent = `✓ تم إضافة ${productName} إلى السلة!`
    document.body.appendChild(message)
    setTimeout(() => {
      message.style.opacity = '0'
      message.style.transition = 'opacity 0.3s'
      setTimeout(() => message.remove(), 300)
    }, 2000)
  }

  const services = [
    { key: 'stove', name: 'الموقد المنزلي', price: 2600, image: 'oil-cooker.jpg', description: 'موقد منزلي عالي الجودة، مناسب للاستخدام اليومي في المطبخ. مصنوع من أفضل المواد الخام.' },
    { key: 'heater', name: 'دفايه', price: 2900, image: 'farm-heater.jpg', description: 'دفاية قوية وفعالة، تدفئ المكان بسرعة. آمنة وسهلة الاستخدام مع تصميم عصري.' },
    { key: 'gas-heater', name: 'دفاية غاز', price: 3400, image: 'gas_heater.jpg.jpg', description: 'دفاية غاز عالية الكفاءة، توفر تدفئة قوية مع استهلاك أقل للغاز. مزودة بنظام أمان متقدم.' },
    { key: 'oven', name: 'فرن بلدي', price: 2400, image: 'rural-oven.jpg', description: 'فرن بلدي تقليدي عالي الجودة، مثالي لخبز الخبز والمعجنات. يحافظ على الحرارة بشكل ممتاز.' }
  ]

  return (
    <div className="services-page">
      <Container className="container-custom">
        <Card className="mb-4">
          <Card.Body className="text-center py-4">
            <h1>خدماتنا</h1>
            <p className="text-muted">نقدم لكم أفضل المنتجات بأفضل الأسعار</p>
          </Card.Body>
        </Card>

        <div className="services-content">
          {services.map((service) => (
            <Card key={service.key} className="service-card mb-4">
              <Card.Body className="p-4">
                <Row className="align-items-center">
                  <Col md={3} className="text-center mb-3 mb-md-0">
                    <img
                      src={`/img/${service.image}`}
                      alt={service.name}
                      className="service-image"
                    />
                  </Col>
                  <Col md={6}>
                    <h2 className="mb-3">{service.name}</h2>
                    <p className="service-price mb-3">
                      السعر: <span className="fw-bold">{service.price.toLocaleString('ar-EG')} جنيه</span>
                    </p>
                    <p className="text-muted">{service.description}</p>
                  </Col>
                  <Col md={3} className="text-center">
                    <Button
                      variant="dark"
                      size="lg"
                      className="w-100"
                      onClick={() => handleAddToCart(service.key, service.name, service.price)}
                    >
                      🛒 أضف للسلة
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}

          <Card className="features-card mt-5">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">مميزات خدماتنا</h2>
              <Row>
                <Col md={6}>
                  <ul className="features-list">
                    <li>✓ منتجات عالية الجودة</li>
                    <li>✓ أسعار منافسة</li>
                    <li>✓ توصيل سريع لجميع المحافظات</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <ul className="features-list">
                    <li>✓ ضمان على جميع المنتجات</li>
                    <li>✓ خدمة عملاء ممتازة</li>
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  )
}

export default Services
