import React, { useState } from 'react'
import { Container, Card, Row, Col, Button, Form, Alert } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'
import { db } from '../config/firebase'
import { collection, addDoc } from 'firebase/firestore'
import './Contact.css'

const Contact = () => {
  const { currentUser, setShowAuth } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [message, setMessage] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!currentUser) {
      setShowAuth(true)
      return
    }

    setMessage({ text: '', type: '' })
    setLoading(true)

    try {
      await addDoc(collection(db, 'contacts'), {
        ...formData,
        userId: currentUser.uid,
        createdAt: new Date().toISOString()
      })
      
      setMessage({ text: 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.', type: 'success' })
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    } catch (error) {
      console.error('Error sending message:', error)
      setMessage({ text: 'حدث خطأ في إرسال الرسالة. يرجى المحاولة مرة أخرى.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="contact-page">
      <Container className="container-custom">
        <Card className="mb-4">
          <Card.Body className="text-center py-4">
            <h1>اتصل بنا</h1>
            <p className="text-muted">نحن هنا لمساعدتك في أي وقت</p>
          </Card.Body>
        </Card>

        <Row className="g-4 mb-4">
          <Col md={4}>
            <Card className="contact-card h-100 text-center">
              <Card.Body className="p-4">
                <div className="contact-icon mb-3">📞</div>
                <h3>الهاتف</h3>
                <p className="contact-info">01090985754</p>
                <p className="text-muted small">متاح من 9 صباحاً حتى 10 مساءً</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="contact-card h-100 text-center">
              <Card.Body className="p-4">
                <div className="contact-icon mb-3">💬</div>
                <h3>واتساب</h3>
                <p className="contact-info">01090985754</p>
                <Button
                  variant="success"
                  href="https://wa.me/201090985754"
                  target="_blank"
                  className="mt-2"
                >
                  تواصل عبر واتساب
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="contact-card h-100 text-center">
              <Card.Body className="p-4">
                <div className="contact-icon mb-3">💳</div>
                <h3>فودافون كاش</h3>
                <p className="contact-info">01090985754</p>
                <p className="text-muted small">نفس رقم الواتساب</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card>
          <Card.Body className="p-4">
            {!currentUser ? (
              <Alert variant="warning" className="text-center">
                <p className="mb-3">⚠️ يجب تسجيل الدخول لإرسال رسالة أو شكوى</p>
                <Button variant="dark" onClick={() => setShowAuth(true)}>
                  تسجيل الدخول
                </Button>
              </Alert>
            ) : (
              <>
                <h2 className="text-center mb-4">أرسل لنا رسالة</h2>
                {message.text && (
                  <Alert variant={message.type === 'error' ? 'danger' : 'success'} className="mb-3">
                    {message.text}
                  </Alert>
                )}
                <Form onSubmit={handleSubmit}>
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
                        <Form.Label>البريد الإلكتروني *</Form.Label>
                        <Form.Control
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          required
                          placeholder="example@email.com"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>رقم الهاتف *</Form.Label>
                        <Form.Control
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          required
                          placeholder="01XXXXXXXXX"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>الموضوع *</Form.Label>
                        <Form.Select
                          value={formData.subject}
                          onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                          required
                        >
                          <option value="">-- اختر الموضوع --</option>
                          <option value="استفسار">استفسار</option>
                          <option value="شكوى">شكوى</option>
                          <option value="اقتراح">اقتراح</option>
                          <option value="طلب">طلب</option>
                          <option value="أخرى">أخرى</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>الرسالة *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      required
                      placeholder="اكتب رسالتك هنا..."
                    />
                  </Form.Group>
                  <Button variant="dark" type="submit" size="lg" className="w-100" disabled={loading}>
                    {loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                  </Button>
                </Form>
              </>
            )}
          </Card.Body>
        </Card>

        <Card className="mt-4">
          <Card.Body className="p-4">
            <h2 className="text-center mb-4">معلومات إضافية</h2>
            <Row>
              <Col md={4}>
                <h5 className="mb-3">ساعات العمل</h5>
                <p>من الساعة 9:00 صباحاً</p>
                <p>حتى الساعة 10:00 مساءً</p>
                <p>جميع أيام الأسبوع</p>
              </Col>
              <Col md={4}>
                <h5 className="mb-3">طرق الدفع</h5>
                <p>فودافون كاش فقط</p>
                <p>يتم دفع 200 جنيه عربون</p>
                <p>قبل عملية الشراء والاستلام</p>
              </Col>
              <Col md={4}>
                <h5 className="mb-3">التوصيل</h5>
                <p>توصيل لجميع المحافظات</p>
                <p>توصيل سريع وآمن</p>
                <p>تتبع الطلب متاح</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}

export default Contact
