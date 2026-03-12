import React, { useState } from 'react'
import { Modal, Tabs, Tab, Button, Form, Alert } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'
import './AuthModal.css'

const AuthModal = () => {
  const { showAuth, setShowAuth, authTab, setAuthTab, login, signup, loginWithGoogle, loginWithFacebook } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Signup form
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(loginEmail, loginPassword)
      setShowAuth(false)
      setLoginEmail('')
      setLoginPassword('')
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await signup(signupEmail, signupPassword)
      setSuccess('تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب.')
      setSignupName('')
      setSignupEmail('')
      setSignupPassword('')
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء إنشاء الحساب')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle()
      setShowAuth(false)
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  const handleFacebookLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await loginWithFacebook()
      setShowAuth(false)
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal 
      show={showAuth} 
      onHide={() => {
        setShowAuth(false)
        setError('')
        setSuccess('')
      }}
      centered
      size="md"
      className="auth-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>تسجيل الدخول / إنشاء حساب</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs
          activeKey={authTab}
          onSelect={(k) => setAuthTab(k)}
          className="mb-3"
        >
          <Tab eventKey="login" title="تسجيل الدخول">
            {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
            
            <div className="social-login mb-3">
              <Button
                variant="danger"
                className="w-100 mb-2"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                🔍 تسجيل الدخول بـ Google
              </Button>
              <Button
                variant="primary"
                className="w-100"
                onClick={handleFacebookLogin}
                disabled={loading}
              >
                📘 تسجيل الدخول بـ Facebook
              </Button>
            </div>

            <div className="divider text-center my-3">
              <span className="text-muted">أو</span>
            </div>

            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="password"
                  placeholder="كلمة المرور"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </Form.Group>
              <Button variant="dark" type="submit" className="w-100" disabled={loading}>
                {loading ? 'جاري...' : 'تسجيل الدخول'}
              </Button>
            </Form>
          </Tab>

          <Tab eventKey="signup" title="إنشاء حساب">
            {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
            {success && <Alert variant="success" className="mb-3">{success}</Alert>}
            
            <div className="social-login mb-3">
              <Button
                variant="danger"
                className="w-100 mb-2"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                🔍 التسجيل بـ Google
              </Button>
              <Button
                variant="primary"
                className="w-100"
                onClick={handleFacebookLogin}
                disabled={loading}
              >
                📘 التسجيل بـ Facebook
              </Button>
            </div>

            <div className="divider text-center my-3">
              <span className="text-muted">أو</span>
            </div>

            <Form onSubmit={handleSignup}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="الاسم الكامل"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="password"
                  placeholder="كلمة المرور"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </Form.Group>
              <Button variant="dark" type="submit" className="w-100" disabled={loading}>
                {loading ? 'جاري...' : 'إنشاء حساب'}
              </Button>
            </Form>
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  )
}

export default AuthModal
