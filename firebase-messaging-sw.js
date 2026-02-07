// firebase-messaging-sw.js
// Service Worker للإشعارات

importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js');

// إعدادات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC0BjvQRGMxQMwksldcawRwQa54Q_h2XMc",
  authDomain: "mohamedemara-79f1a.firebaseapp.com",
  projectId: "mohamedemara-79f1a",
  storageBucket: "mohamedemara-79f1a.firebasestorage.app",
  messagingSenderId: "271024419210",
  appId: "1:271024419210:web:3e43ddec7c8aaeb8c85873",
  measurementId: "G-9ECM4W877L"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);

// الحصول على Messaging
const messaging = firebase.messaging();

// معالجة الإشعارات في الخلفية
messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'طلب جديد';
  const notificationOptions = {
    body: payload.notification?.body || 'لديك طلب جديد',
    icon: '/img/logo.svg',
    badge: '/img/logo.svg',
    tag: 'new-order',
    requireInteraction: true,
    data: payload.data
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// معالجة النقر على الإشعار
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event.notification);
  event.notification.close();
  
  // محاولة فتح/تركيز نافذة موجودة أولاً
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // البحث عن نافذة مفتوحة لصفحة الإدارة
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes('admin.html') && 'focus' in client) {
          return client.focus();
        }
      }
      // إذا لم توجد نافذة مفتوحة، افتح واحدة جديدة
      if (clients.openWindow) {
        return clients.openWindow('/admin.html');
      }
    })
  );
});

