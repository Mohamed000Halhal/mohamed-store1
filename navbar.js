// New Modern Navbar Functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Navbar.js loaded');

    // ===== Mobile Menu Toggle =====
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navbarMenu = document.getElementById('navbarMenu');
    
    if (mobileMenuToggle && navbarMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenuToggle.classList.toggle('active');
            navbarMenu.classList.toggle('active');
        });

        // Close menu when a link is clicked
        const navLinks = navbarMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuToggle.classList.remove('active');
                navbarMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navbarMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                mobileMenuToggle.classList.remove('active');
                navbarMenu.classList.remove('active');
            }
        });
    }

    // ===== Mobile Dropdown Toggle =====
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        if (link) {
            link.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            });
        }
    });

    // ===== Profile Button =====
    // Removed - now a link to dashboard.html

    // ===== Cart Button =====
    // Removed - now a link to cart.html

    // ===== Auth Modal Functionality =====
    const authTabs = document.querySelectorAll('.auth-tab');
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');

    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            authTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            if (tabName === 'login') {
                loginTab.style.display = 'block';
                signupTab.style.display = 'none';
            } else {
                loginTab.style.display = 'none';
                signupTab.style.display = 'block';
            }
        });
    });

    // Auth Modal Close
    const authModal = document.getElementById('authModal');
    const authClose = document.getElementById('authClose');

    if (authClose) {
        authClose.addEventListener('click', function() {
            if (authModal) {
                authModal.style.display = 'none';
                authModal.classList.remove('active');
                authModal.setAttribute('aria-hidden', 'true');
            }
        });
    }

    if (authModal) {
        authModal.addEventListener('click', function(e) {
            if (e.target === authModal) {
                authModal.style.display = 'none';
                authModal.classList.remove('active');
                authModal.setAttribute('aria-hidden', 'true');
            }
        });
    }

    // ===== Cart Modal Functionality =====
    const cartModal = document.getElementById('cartModal');
    
    if (cartModal) {
        window.cartModal = cartModal;
    }

    // ===== Google Login =====
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const googleSignupBtn = document.getElementById('googleSignupBtn');

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async function() {
            try {
                if (window.authService && window.authService.signInWithGoogle) {
                    await window.authService.signInWithGoogle();
                }
            } catch (error) {
                console.error('Google login error:', error);
            }
        });
    }

    if (googleSignupBtn) {
        googleSignupBtn.addEventListener('click', async function() {
            try {
                if (window.authService && window.authService.signInWithGoogle) {
                    await window.authService.signInWithGoogle();
                }
            } catch (error) {
                console.error('Google signup error:', error);
            }
        });
    }

    // ===== Facebook Login =====
    const facebookLoginBtn = document.getElementById('facebookLoginBtn');
    const facebookSignupBtn = document.getElementById('facebookSignupBtn');

    if (facebookLoginBtn) {
        facebookLoginBtn.addEventListener('click', async function() {
            try {
                if (window.authService && window.authService.signInWithFacebook) {
                    await window.authService.signInWithFacebook();
                }
            } catch (error) {
                console.error('Facebook login error:', error);
            }
        });
    }

    if (facebookSignupBtn) {
        facebookSignupBtn.addEventListener('click', async function() {
            try {
                if (window.authService && window.authService.signInWithFacebook) {
                    await window.authService.signInWithFacebook();
                }
            } catch (error) {
                console.error('Facebook signup error:', error);
            }
        });
    }

    // ===== Email Login =====
    const emailLoginBtn = document.getElementById('emailLoginBtn');
    if (emailLoginBtn) {
        emailLoginBtn.addEventListener('click', async function() {
            const email = document.getElementById('loginEmail')?.value;
            const password = document.getElementById('loginPassword')?.value;
            
            if (!email || !password) {
                alert('يرجى إدخال البريد الإلكتروني وكلمة المرور');
                return;
            }

            try {
                if (window.authService && window.authService.signInWithEmail) {
                    await window.authService.signInWithEmail(email, password);
                }
            } catch (error) {
                console.error('Email login error:', error);
                alert('خطأ في تسجيل الدخول: ' + error.message);
            }
        });
    }

    // ===== Email Signup =====
    const emailSignupBtn = document.getElementById('emailSignupBtn');
    if (emailSignupBtn) {
        emailSignupBtn.addEventListener('click', async function() {
            const name = document.getElementById('signupName')?.value;
            const email = document.getElementById('signupEmail')?.value;
            const password = document.getElementById('signupPassword')?.value;
            
            if (!name || !email || !password) {
                alert('يرجى ملء جميع الحقول');
                return;
            }

            try {
                if (window.authService && window.authService.signUpWithEmail) {
                    await window.authService.signUpWithEmail(email, password, name);
                }
            } catch (error) {
                console.error('Signup error:', error);
                alert('خطأ في إنشاء الحساب: ' + error.message);
            }
        });
    }

    // ===== Phone Login =====
    const phoneLoginBtn = document.getElementById('phoneLoginBtn');
    if (phoneLoginBtn) {
        phoneLoginBtn.addEventListener('click', async function() {
            const phone = document.getElementById('loginPhone')?.value;
            
            if (!phone) {
                alert('يرجى إدخال رقم الهاتف');
                return;
            }

            try {
                if (window.authService && window.authService.signInWithPhoneNumber) {
                    await window.authService.signInWithPhoneNumber(phone);
                    const phoneVerification = document.getElementById('phoneVerificationCode');
                    if (phoneVerification) {
                        phoneVerification.style.display = 'block';
                    }
                }
            } catch (error) {
                console.error('Phone login error:', error);
                alert('خطأ في إرسال الكود: ' + error.message);
            }
        });
    }

    // ===== Verify Phone Code =====
    const verifyPhoneBtn = document.getElementById('verifyPhoneBtn');
    if (verifyPhoneBtn) {
        verifyPhoneBtn.addEventListener('click', async function() {
            const code = document.getElementById('phoneCode')?.value;
            
            if (!code || code.length !== 6) {
                alert('يرجى إدخال كود صحيح');
                return;
            }

            try {
                if (window.authService && window.authService.verifyPhoneCode) {
                    await window.authService.verifyPhoneCode(code);
                }
            } catch (error) {
                console.error('Verification error:', error);
                alert('خطأ في التحقق: ' + error.message);
            }
        });
    }

    // ===== Resend Phone Code =====
    const resendPhoneBtn = document.getElementById('resendPhoneBtn');
    let currentPhoneNumber = '';
    
    if (resendPhoneBtn) {
        resendPhoneBtn.addEventListener('click', async function() {
            const phone = document.getElementById('loginPhone')?.value || currentPhoneNumber;
            currentPhoneNumber = phone;
            
            try {
                if (window.authService && window.authService.resendPhoneCode) {
                    await window.authService.resendPhoneCode(phone);
                    alert('تم إعادة إرسال الكود');
                }
            } catch (error) {
                console.error('Resend error:', error);
                alert('خطأ في إعادة الإرسال: ' + error.message);
            }
        });
    }

    // ===== Resend Verification Email =====
    const resendVerificationBtn = document.getElementById('resendVerificationBtn');
    if (resendVerificationBtn) {
        resendVerificationBtn.addEventListener('click', async function() {
            try {
                if (window.authService && window.authService.resendVerificationCode) {
                    await window.authService.resendVerificationCode();
                    alert('تم إعادة إرسال رابط التأكيد');
                }
            } catch (error) {
                console.error('Resend verification error:', error);
                alert('خطأ: ' + error.message);
            }
        });
    }

    // ===== Logout =====
    const logoutBtnNav = document.getElementById('logoutBtnNav');
    if (logoutBtnNav) {
        logoutBtnNav.addEventListener('click', async function() {
            try {
                if (window.authService && window.authService.signOut) {
                    await window.authService.signOut();
                }
            } catch (error) {
                console.error('Logout error:', error);
            }
        });
    }

    // ===== Update Cart Badge =====
    function updateCartBadge() {
        const cartBadge = document.getElementById('cartBadgeNav');
        if (cartBadge && window.cartService) {
            const cart = window.cartService.getCart ? window.cartService.getCart() : [];
            cartBadge.textContent = cart.length || 0;
        }
    }

    // Update badge on page load
    updateCartBadge();
    
    // Listen for cart updates
    setInterval(updateCartBadge, 500);
});
