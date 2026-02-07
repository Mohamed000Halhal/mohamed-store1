import React, { useState } from 'react'
import { Navbar as BootstrapNavbar, Nav, Container, Badge } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const location = useLocation()
  const { getItemCount, setShowCart } = useCart()
  const { currentUser, setShowAuth, logout } = useAuth()
  const [expanded, setExpanded] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      setExpanded(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <BootstrapNavbar bg="white" expand="lg" className="custom-navbar" sticky="top">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="navbar-brand-custom">
          <img src="/img/logo.svg" alt="شعار" className="navbar-logo-img" onError={(e) => { e.target.style.display = 'none' }} />
          <span>Mohamed Store</span>
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle 
          aria-controls="basic-navbar-nav" 
          onClick={() => setExpanded(!expanded)}
        />
        
        <BootstrapNavbar.Collapse id="basic-navbar-nav" in={expanded}>
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              active={location.pathname === '/'}
              onClick={() => setExpanded(false)}
            >
              الرئيسية
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/services"
              active={location.pathname === '/services'}
              onClick={() => setExpanded(false)}
            >
              الخدمات
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/contact"
              active={location.pathname === '/contact'}
              onClick={() => setExpanded(false)}
            >
              اتصل بنا
            </Nav.Link>
          </Nav>
          
          <Nav className="ms-auto">
            <Nav.Link 
              onClick={() => {
                setShowCart(true)
                setExpanded(false)
              }}
              className="cart-link"
            >
              🛒
              {getItemCount() > 0 && (
                <Badge bg="danger" className="cart-badge">
                  {getItemCount()}
                </Badge>
              )}
            </Nav.Link>
            
            {currentUser ? (
              <Nav className="user-menu">
                <Nav.Link className="user-name">
                  {currentUser.displayName || currentUser.email || 'مستخدم'}
                </Nav.Link>
                <Nav.Link onClick={handleLogout} className="logout-link">
                  تسجيل الخروج
                </Nav.Link>
              </Nav>
            ) : (
              <Nav.Link 
                onClick={() => {
                  setShowAuth(true)
                  setExpanded(false)
                }}
              >
                تسجيل الدخول
              </Nav.Link>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  )
}

export default Navbar
