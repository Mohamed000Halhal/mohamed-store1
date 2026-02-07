// auth-service.js
// خدمة المصادقة والتسجيل

(function createAuthService(windowObj) {
    let auth = null;
    let currentUser = null;

    // تهيئة خدمة المصادقة
    function initializeAuth() {
        if (typeof firebase === 'undefined' || !firebase.auth) {
            console.warn('Firebase Auth not available');
            return false;
        }

        auth = firebase.auth();
        
        // تعديل إعدادات Auth للعمل على localhost
        try {
            auth.settings.appVerificationDisabledForTesting = true;
            console.log('Auth testing mode enabled for localhost');
        } catch (error) {
            console.warn('Could not enable auth testing mode:', error);
        }
        
        // الاستماع لتغييرات حالة المستخدم
        auth.onAuthStateChanged(function(user) {
            currentUser = user;
            updateUI(user);
            
            if (user) {
                console.log('User signed in:', user.email);
                // التحقق من البريد الإلكتروني
                if (!user.emailVerified && user.providerData[0].providerId === 'password') {
                    showEmailVerificationMessage();
                }
            } else {
                console.log('User signed out');
            }
        });

        return true;
    }

    // تحديث واجهة المستخدم
    function updateUI(user) {
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        const userName = document.getElementById('userName');

        if (user) {
            if (authButtons) authButtons.style.display = 'none';
            if (userMenu) userMenu.style.display = 'flex';
            // عرض رقم الهاتف أو البريد أو الاسم
            if (userName) {
                userName.textContent = user.displayName || user.phoneNumber || user.email || 'مستخدم';
            }
        } else {
            if (authButtons) authButtons.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
        }
    }

    // تسجيل الدخول بـ Google
    async function signInWithGoogle() {
        if (!auth) {
            alert('خدمة المصادقة غير متاحة');
            return;
        }

        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await auth.signInWithPopup(provider);
            console.log('Signed in with Google:', result.user);
            closeAuthModal();
            return result.user;
        } catch (error) {
            console.error('Google sign in error:', error);
            alert('حدث خطأ في تسجيل الدخول بـ Google: ' + error.message);
            throw error;
        }
    }

    // تسجيل الدخول بـ Facebook
    async function signInWithFacebook() {
        if (!auth) {
            alert('خدمة المصادقة غير متاحة');
            return;
        }

        try {
            const provider = new firebase.auth.FacebookAuthProvider();
            // إضافة صلاحيات إضافية
            provider.addScope('email');
            provider.addScope('public_profile');
            
            // محاولة تسجيل الدخول
            let result;
            try {
                // محاولة استخدام popup
                result = await auth.signInWithPopup(provider);
            } catch (popupError) {
                // إذا فشل popup (مثل في Safari)، استخدم redirect
                if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user') {
                    console.log('Popup blocked, using redirect...');
                    await auth.signInWithRedirect(provider);
                    return; // سيتم إعادة التوجيه
                }
                throw popupError;
            }
            
            console.log('Signed in with Facebook:', result.user);
            closeAuthModal();
            return result.user;
        } catch (error) {
            console.error('Facebook sign in error:', error);
            
            let errorMessage = 'حدث خطأ في تسجيل الدخول بـ Facebook';
            
            if (error.code === 'auth/account-exists-with-different-credential') {
                errorMessage = 'يوجد حساب آخر بنفس البريد الإلكتروني. يرجى تسجيل الدخول بالطريقة المستخدمة سابقاً.';
            } else if (error.code === 'auth/popup-blocked') {
                errorMessage = 'تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة من هذا الموقع.';
            } else if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = 'تم إغلاق نافذة تسجيل الدخول. يرجى المحاولة مرة أخرى.';
            } else if (error.message) {
                errorMessage += ': ' + error.message;
            }
            
            alert(errorMessage);
            throw error;
        }
    }

    // معالجة Facebook Redirect بعد العودة
    function handleFacebookRedirect() {
        if (!auth) return;
        
        // التحقق من البيئة الحالية
        const currentUrl = window.location.href;
        const isLocalhost = currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1');
        
        // إذا كان localhost، نسمح بـ redirect
        if (isLocalhost) {
            console.log('Facebook redirect allowed on localhost');
            auth.getRedirectResult().then(function(result) {
                if (result.credential) {
                    // تم تسجيل الدخول بنجاح
                    console.log('Facebook redirect sign in successful:', result.user);
                    closeAuthModal();
                }
            }).catch(function(error) {
                console.error('Facebook redirect error:', error);
            });
        } else {
            // إذا لم يكن localhost، نعرض رسالة خطأ
            console.error('Facebook redirect not supported in this environment. Location protocol must be http, https or chrome-extension and web storage must be enabled.');
            alert('لا يمكن استخدام تسجيل الدخول بـ Facebook في هذا البيئة. يرجى استخدام طريقة أخرى.');
        }
    }

    // تسجيل الدخول بالبريد الإلكتروني
    async function signInWithEmail(email, password) {
        if (!auth) {
            alert('خدمة المصادقة غير متاحة');
            return;
        }

        try {
            const result = await auth.signInWithEmailAndPassword(email, password);
            console.log('Signed in with email:', result.user);
            closeAuthModal();
            return result.user;
        } catch (error) {
            console.error('Email sign in error:', error);
            throw error;
        }
    }

    // إنشاء حساب جديد بالبريد الإلكتروني
    async function signUpWithEmail(email, password, displayName) {
        if (!auth) {
            alert('خدمة المصادقة غير متاحة');
            return;
        }

        try {
            const result = await auth.createUserWithEmailAndPassword(email, password);
            
            // تحديث اسم المستخدم
            if (displayName) {
                await result.user.updateProfile({
                    displayName: displayName
                });
            }

            // إرسال كود التأكيد
            await sendEmailVerification(result.user);
            
            console.log('Account created:', result.user);
            showVerificationCodeInput();
            return result.user;
        } catch (error) {
            console.error('Email sign up error:', error);
            throw error;
        }
    }

    // إرسال كود التأكيد للبريد الإلكتروني
    async function sendEmailVerification(user) {
        try {
            await user.sendEmailVerification();
            console.log('Verification email sent');
            return true;
        } catch (error) {
            console.error('Error sending verification email:', error);
            throw error;
        }
    }

    // التحقق من كود التأكيد
    async function verifyEmailCode(code) {
        if (!currentUser) {
            throw new Error('لا يوجد مستخدم مسجل');
        }

        // Firebase لا يدعم كود تأكيد مخصص، لكن يمكن التحقق من البريد
        // سنستخدم طريقة بسيطة: التحقق من أن البريد تم تأكيده
        await currentUser.reload();
        
        if (currentUser.emailVerified) {
            closeAuthModal();
            alert('تم تأكيد البريد الإلكتروني بنجاح!');
            return true;
        } else {
            throw new Error('لم يتم تأكيد البريد الإلكتروني بعد. يرجى التحقق من بريدك.');
        }
    }

    // إعادة إرسال كود التأكيد
    async function resendVerificationCode() {
        if (!currentUser) {
            throw new Error('لا يوجد مستخدم مسجل');
        }

        try {
            await sendEmailVerification(currentUser);
            alert('تم إرسال رابط التأكيد إلى بريدك الإلكتروني');
        } catch (error) {
            console.error('Error resending verification:', error);
            alert('حدث خطأ في إعادة الإرسال: ' + error.message);
        }
    }

    // تسجيل الدخول برقم الهاتف
    let phoneConfirmationResult = null;
    let recaptchaVerifier = null;

// معالجة Facebook Redirect بعد العودة
function handleFacebookRedirect() {
    if (!auth) return;
    
    // التحقق من البيئة الحالية
    const currentUrl = window.location.href;
    const isProperProtocol = currentUrl.startsWith('http://') || currentUrl.startsWith('https://') || currentUrl.startsWith('chrome-extension://');
    
    // تحقق من وجود web storage
    let hasWebStorage = false;
    try {
        const testKey = '__storage_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        hasWebStorage = true;
    } catch (e) {
        console.warn('Web storage not available:', e.message);
    }
    
    // فقط في حالة وجود الشروط الصحيحة
    if (isProperProtocol && hasWebStorage) {
        console.log('Processing Facebook redirect result...');
        auth.getRedirectResult().then(function(result) {
            if (result.credential) {
                // تم تسجيل الدخول بنجاح
                console.log('Facebook redirect sign in successful:', result.user);
                closeAuthModal();
            }
        }).catch(function(error) {
            // إذا كان الخطأ متعلقاً بعدم وجود نتيجة، تجاهله
            if (error.code === 'auth/no-auth-event') {
                console.log('No Facebook redirect detected');
            } else if (error.code === 'auth/operation-not-supported-in-this-environment') {
                console.warn('Facebook redirect not supported in this environment', error);
            } else {
                console.error('Facebook redirect error:', error);
            }
        });
    } else {
        if (!isProperProtocol) {
            console.log('Skipping Facebook redirect: Not running on http/https/chrome-extension');
        }
        if (!hasWebStorage) {
            console.log('Skipping Facebook redirect: Web storage not available');
        }
    }
}

// تهيئة reCAPTCHA
function initializeRecaptcha() {
    if (!auth) {
        console.error('Auth not available for reCAPTCHA');
        return null;
    }

    try {
        console.log('Initializing reCAPTCHA...');
        
        // إنشاء reCAPTCHA verifier مع إعدادات محسنة
        recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible', // استخدام invisible reCAPTCHA
            'callback': function(response) {
                console.log('reCAPTCHA verified successfully');
            },
            'expired-callback': function() {
                console.log('reCAPTCHA expired');
                // إعادة تهيئة reCAPTCHA عند انتهاء الصلاحية
                recaptchaVerifier = null;
            }
        }, auth);
        
        console.log('reCAPTCHA initialized successfully');
        return recaptchaVerifier;
    } catch (error) {
        console.error('Error initializing reCAPTCHA:', error);
        
        // محاولة بديلة مع normal reCAPTCHA
        try {
            console.log('Trying normal reCAPTCHA...');
            recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
                'size': 'normal',
                'callback': function(response) {
                    console.log('reCAPTCHA verified (normal mode)');
                },
                'expired-callback': function() {
                    console.log('reCAPTCHA expired (normal mode)');
                    recaptchaVerifier = null;
                }
            }, auth);
            
            console.log('reCAPTCHA initialized successfully (normal mode)');
            return recaptchaVerifier;
        } catch (fallbackError) {
            console.error('Fallback reCAPTCHA also failed:', fallbackError);
            return null;
        }
    }
}

async function signInWithPhoneNumber(phoneNumber) {
    if (!auth) {
        alert('خدمة المصادقة غير متاحة');
        return;
    }

    try {
        // تنسيق رقم الهاتف (إضافة +20 لمصر)
        let formattedPhone = phoneNumber.trim();
        if (!formattedPhone.startsWith('+')) {
            if (formattedPhone.startsWith('0')) {
                formattedPhone = '+20' + formattedPhone.substring(1);
            } else {
                formattedPhone = '+20' + formattedPhone;
            }
        }

        // تهيئة reCAPTCHA إذا لم يكن موجوداً
        if (!recaptchaVerifier) {
            recaptchaVerifier = initializeRecaptcha();
        }

        if (!recaptchaVerifier) {
            throw new Error('فشل تهيئة reCAPTCHA');
        }

        // إرسال كود التحقق
        phoneConfirmationResult = await auth.signInWithPhoneNumber(formattedPhone, recaptchaVerifier);
        console.log('Verification code sent to:', formattedPhone);
        
        // إظهار حقل كود التحقق
        showPhoneVerificationInput();
        
        return phoneConfirmationResult;
    } catch (error) {
        console.error('Phone sign in error:', error);
        alert('حدث خطأ في إرسال كود التحقق: ' + error.message);
        throw error;
    }
}

    // التحقق من كود الهاتف
    async function verifyPhoneCode(code) {
        if (!phoneConfirmationResult) {
            throw new Error('لم يتم إرسال كود التحقق بعد');
        }

        try {
            const result = await phoneConfirmationResult.confirm(code);
            console.log('Phone verified:', result.user);
            phoneConfirmationResult = null;
            closeAuthModal();
            return result.user;
        } catch (error) {
            console.error('Phone verification error:', error);
            alert('كود التحقق غير صحيح. يرجى المحاولة مرة أخرى.');
            throw error;
        }
    }

    // إعادة إرسال كود الهاتف
    async function resendPhoneCode(phoneNumber) {
        try {
            await signInWithPhoneNumber(phoneNumber);
            alert('تم إعادة إرسال كود التحقق');
        } catch (error) {
            console.error('Error resending phone code:', error);
            alert('حدث خطأ في إعادة الإرسال: ' + error.message);
        }
    }

    // تسجيل الخروج
    async function signOut() {
        if (!auth) {
            return;
        }

        try {
            await auth.signOut();
            phoneConfirmationResult = null; // مسح كود التحقق
            console.log('User signed out');
        } catch (error) {
            console.error('Sign out error:', error);
            alert('حدث خطأ في تسجيل الخروج: ' + error.message);
        }
    }

    // عرض رسالة تأكيد البريد
    function showEmailVerificationMessage() {
        // يمكن إضافة رسالة في الصفحة
        console.log('Email verification required');
    }

    // إظهار حقل كود التأكيد
    function showVerificationCodeInput() {
        const verificationCode = document.getElementById('verificationCode');
        if (verificationCode) {
            verificationCode.classList.add('active');
        }
    }

    // إظهار حقل كود التحقق للهاتف
    function showPhoneVerificationInput() {
        const phoneVerificationCode = document.getElementById('phoneVerificationCode');
        if (phoneVerificationCode) {
            phoneVerificationCode.classList.add('active');
        }
    }

    // إغلاق نافذة المصادقة
    function closeAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
        }
    }

    // الحصول على المستخدم الحالي
    function getCurrentUser() {
        return currentUser;
    }

    // تهيئة عند تحميل الصفحة
    if (typeof firebase !== 'undefined') {
        setTimeout(function() {
            initializeAuth();
            // معالجة Facebook redirect إذا كان موجوداً
            handleFacebookRedirect();
        }, 1000);
    }

    windowObj.authService = {
        initialize: initializeAuth,
        signInWithGoogle: signInWithGoogle,
        signInWithFacebook: signInWithFacebook,
        signInWithEmail: signInWithEmail,
        signUpWithEmail: signUpWithEmail,
        signInWithPhoneNumber: signInWithPhoneNumber,
        verifyPhoneCode: verifyPhoneCode,
        resendPhoneCode: resendPhoneCode,
        verifyEmailCode: verifyEmailCode,
        resendVerificationCode: resendVerificationCode,
        signOut: signOut,
        getCurrentUser: getCurrentUser
    };
})(window);
