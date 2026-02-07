// notification-service.js
// خدمة الإشعارات للأدمن

(function createNotificationService(windowObj) {
    let messaging = null;
    let adminToken = null;

    // تسجيل Service Worker
    async function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                console.log('Service Worker registered:', registration);
                return registration;
            } catch (error) {
                console.error('Service Worker registration failed:', error);
                return null;
            }
        }
        return null;
    }

    // تهيئة خدمة الإشعارات
    async function initializeMessaging() {
        try {
            if (typeof firebase === 'undefined' || !firebase.messaging) {
                console.warn('Firebase Messaging not available');
                return false;
            }

            // تسجيل Service Worker أولاً
            const registration = await registerServiceWorker();
            if (!registration) {
                console.error('Service Worker registration failed');
                alert('فشل تسجيل Service Worker. تأكد من أنك تستخدم HTTPS أو localhost.');
                return false;
            }

            messaging = firebase.messaging();

            // طلب الإذن للإشعارات
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('Notification permission granted');
                await getToken();
            } else {
                console.log('Notification permission denied');
                alert('تم رفض الإذن للإشعارات. يرجى السماح بالإشعارات من إعدادات المتصفح.');
            }

            // معالجة الإشعارات في المقدمة (عندما تكون الصفحة مفتوحة)
            messaging.onMessage(function(payload) {
                console.log('Message received in foreground:', payload);
                
                // عرض إشعار محلي
                if (payload.notification) {
                    showNotification(payload.notification);
                }
                
                // إذا كانت الصفحة هي صفحة الإدارة، قم بتحديث الطلبات
                if (window.location.pathname.includes('admin') && typeof loadOrders === 'function') {
                    setTimeout(() => {
                        loadOrders();
                    }, 1000);
                }
            });

            return true;
        } catch (error) {
            console.error('Error initializing messaging:', error);
            return false;
        }
    }

    // الحصول على Token
    async function getToken() {
        if (!messaging) {
            console.error('Messaging not initialized');
            return;
        }

        try {
            // التحقق من Service Worker
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                if (!registration) {
                    throw new Error('Service Worker not ready');
                }
                
                // التحقق من Push Manager
                if (!registration.pushManager) {
                    throw new Error('Push Manager not available');
                }
            }

            // الحصول على Token مع VAPID key
            const VAPID_KEY = 'BES2vhnz8hLVab7jWur2h0kf15eYqDvTie4sxNap7JtNQAxEnE1Fp8nEMDmqAQpWNdKqRxo7Mz-JRXoS1rWyIz4';
            let currentToken;
            
            try {
                // محاولة مع VAPID key
                currentToken = await messaging.getToken({ vapidKey: VAPID_KEY });
            } catch (vapidError) {
                console.warn('Error getting token with VAPID key:', vapidError);
                // محاولة بدون VAPID key كبديل
                try {
                    currentToken = await messaging.getToken();
                } catch (fallbackError) {
                    console.error('Error getting token without VAPID key:', fallbackError);
                    throw vapidError; // رمي الخطأ الأصلي
                }
            }
            
            if (currentToken) {
                adminToken = currentToken;
                saveAdminToken(currentToken);
                console.log('FCM Token:', currentToken);
                alert('تم تفعيل الإشعارات بنجاح!');
            } else {
                console.log('No registration token available');
                alert('لم يتم الحصول على token. تأكد من تفعيل الإشعارات في المتصفح.');
            }
        } catch (err) {
            console.error('An error occurred while retrieving token:', err);
            
            let errorMessage = 'حدث خطأ في تفعيل الإشعارات.';
            
            if (err.message.includes('Service Worker')) {
                errorMessage = 'خطأ: Service Worker غير نشط. تأكد من أنك تستخدم HTTPS أو localhost.';
            } else if (err.message.includes('push service')) {
                errorMessage = 'خطأ: Push Service غير متاح. قد تحتاج إلى:\n1. تفعيل Cloud Messaging في Firebase Console\n2. إضافة VAPID key\n3. التأكد من أن المتصفح يدعم Push Notifications';
            } else if (err.message.includes('Registration failed')) {
                errorMessage = 'خطأ: فشل التسجيل. تأكد من:\n1. تفعيل Cloud Messaging في Firebase Console\n2. استخدام HTTPS أو localhost\n3. السماح بالإشعارات في المتصفح';
            }
            
            alert(errorMessage);
        }
    }

    // حفظ Token في Firestore
    function saveAdminToken(token) {
        if (!windowObj.db) {
            console.warn('Firestore not available');
            return;
        }

        try {
            windowObj.db.collection('adminTokens').doc('admin').set({
                token: token,
                updatedAt: new Date().toISOString()
            }).then(function() {
                console.log('Admin token saved');
            }).catch(function(error) {
                console.error('Error saving token:', error);
            });
        } catch (error) {
            console.error('Error saving token:', error);
        }
    }

    // عرض إشعار محلي
    function showNotification(notification) {
        if (Notification.permission === 'granted') {
            new Notification(notification.title || 'طلب جديد', {
                body: notification.body || 'لديك طلب جديد',
                icon: '/img/logo.svg',
                badge: '/img/logo.svg',
                tag: 'new-order',
                requireInteraction: true
            });
        }
    }

    // إرسال إشعار عند إنشاء طلب جديد
    async function sendNewOrderNotification(order) {
        if (!windowObj.db) {
            console.warn('Firestore not available for sending notification');
            return;
        }

        try {
            // الحصول على token الأدمن
            const tokenDoc = await windowObj.db.collection('adminTokens').doc('admin').get();
            
            if (!tokenDoc.exists) {
                console.warn('Admin token not found - الأدمن لم يفعل الإشعارات بعد');
                return;
            }

            const adminTokenData = tokenDoc.data();
            const token = adminTokenData.token;

            if (!token) {
                console.warn('Admin token is empty');
                return;
            }

            // حفظ الإشعار في Firestore
            const notificationData = {
                token: token,
                notification: {
                    title: 'طلب جديد 📦',
                    body: `طلب جديد من ${order.name} - ${order.productName} (${order.quantity} قطعة)`
                },
                data: {
                    orderId: order.id,
                    type: 'new_order',
                    orderName: order.name,
                    orderProduct: order.productName,
                    orderQuantity: order.quantity.toString()
                },
                createdAt: new Date().toISOString(),
                read: false
            };

            await windowObj.db.collection('notifications').add(notificationData);

            // إرسال الإشعار الفعلي عبر Firebase Cloud Messaging
            // يمكن استخدام Cloud Function لإرسال الإشعارات الفعلية
            // أو استخدام HTTP request مباشر (يتطلب Server Key)
            
            console.log('Notification saved for order:', order.id);
            
            // ملاحظة: لإرسال الإشعارات الفعلية، تحتاج إلى:
            // 1. Cloud Function تستمع لتغييرات في notifications collection
            // 2. أو استخدام HTTP request مع Server Key من Firebase Console
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }

    // دالة لتفعيل الإشعارات يدوياً
    async function enableNotifications() {
        try {
            if (typeof firebase === 'undefined' || !firebase.messaging) {
                alert('Firebase Messaging غير متاح. تأكد من تحميل Firebase SDK.');
                return;
            }

            // تسجيل Service Worker أولاً
            const registration = await registerServiceWorker();
            if (!registration) {
                alert('فشل تسجيل Service Worker. تأكد من أنك تستخدم HTTPS أو localhost.');
                return;
            }

            if (!messaging) {
                messaging = firebase.messaging();
            }

            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('Notification permission granted');
                await getToken();
            } else {
                alert('تم رفض الإذن للإشعارات. يرجى السماح بالإشعارات من إعدادات المتصفح.');
            }
        } catch (error) {
            console.error('Error enabling notifications:', error);
            alert('حدث خطأ: ' + error.message);
        }
    }

    // تهيئة عند تحميل الصفحة (فقط في صفحة الإدارة)
    if (window.location.pathname.includes('admin')) {
        if (typeof firebase !== 'undefined' && firebase.messaging) {
            setTimeout(function() {
                // لا نطلب الإذن تلقائياً، فقط عند الضغط على الزر
            }, 1000);
        }
    }

    windowObj.notificationService = {
        initialize: initializeMessaging,
        sendNewOrderNotification: sendNewOrderNotification,
        getToken: getToken,
        enableNotifications: enableNotifications
    };
})(window);

