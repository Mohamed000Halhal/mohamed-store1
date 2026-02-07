// firebase-config.js

// إعدادات Firebase لمشروعك
const firebaseConfig = {
  apiKey: "AIzaSyC0BjvQRGMxQMwksldcawRwQa54Q_h2XMc",
  authDomain: "mohamedemara-79f1a.firebaseapp.com",
  projectId: "mohamedemara-79f1a",
  storageBucket: "mohamedemara-79f1a.firebasestorage.app",
  messagingSenderId: "271024419210",
  appId: "1:271024419210:web:3e43ddec7c8aaeb8c85873",
  measurementId: "G-9ECM4W877L"
};

// تهيئة Firebase مرة واحدة فقط
(function initializeFirebase() {
  function init() {
    if (!window.firebase) {
      console.warn('Firebase SDK not loaded yet');
      return false;
    }

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
      console.log("Firebase initialized (Compat Mode) ✔");
      
      // تعديل إعدادات Auth للعمل على localhost
      if (firebase.auth) {
        try {
          firebase.auth().settings.appVerificationDisabledForTesting = true;
          console.log("Auth testing mode enabled for localhost");
        } catch (error) {
          console.warn('Could not enable auth testing mode:', error);
        }
      }
    }

    // التأكد من الوصول لـ Firestore
    if (!window.db) {
      window.db = firebase.firestore();
      window.firestoreDB = window.db;
      
      // إعادة تهيئة orders-service إذا كان موجوداً
      if (window.ordersService && typeof window.ordersService.refresh === 'function') {
        window.ordersService.refresh();
      }
    }

    // تهيئة Messaging إذا كان متاحاً
    if (firebase.messaging && !window.messaging) {
      try {
        window.messaging = firebase.messaging();
      } catch (error) {
        console.warn('Messaging initialization error:', error);
      }
    }

    // تهيئة Authentication إذا كان متاحاً
    if (firebase.auth && !window.auth) {
      try {
        window.auth = firebase.auth();
        console.log("Firebase Auth initialized ✔");
      } catch (error) {
        console.warn('Auth initialization error:', error);
      }
    }
    
    return true;
  }

  // محاولة التهيئة فوراً
  if (init()) {
    return;
  }

  // انتظار تحميل Firebase SDK
  const checkFirebase = setInterval(function() {
    if (init()) {
      clearInterval(checkFirebase);
    }
  }, 100);

  // إلغاء المحاولة بعد 5 ثوان
  setTimeout(function() {
    clearInterval(checkFirebase);
    init();
  }, 5000);
})();
