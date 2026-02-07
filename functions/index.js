// ================================
// Firebase Cloud Function
// إرسال إشعار للأدمن عند إنشاء Order جديد
// ================================

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// تهيئة Firebase Admin
admin.initializeApp();

// ===================================
// Trigger: عند إضافة document جديد في orders
// ===================================
exports.sendOrderNotification = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {

    // بيانات الطلب الجديد
    const order = snap.data();

    try {
      // ==========================
      // جلب FCM Token الخاص بالأدمن
      // ==========================
      const adminTokenDoc = await admin
        .firestore()
        .collection('adminTokens')
        .doc('admin')
        .get();

      // لو الأدمن مفعلش الإشعارات
      if (!adminTokenDoc.exists) {
        console.log('Admin token not found');
        return null;
      }

      const adminToken = adminTokenDoc.data().token;

      if (!adminToken) {
        console.log('Admin token is empty');
        return null;
      }

      // ==========================
      // تجهيز رسالة الإشعار
      // ==========================
      const message = {
        notification: {
          title: 'طلب جديد 📦',
          body: `طلب جديد من ${order.name} - ${order.productName} (${order.quantity} قطعة)`
        },

        // بيانات إضافية للفرونت
        data: {
          orderId: context.params.orderId,
          type: 'new_order',
          orderName: order.name || '',
          orderProduct: order.productName || '',
          orderQuantity: String(order.quantity || 0)
        },

        // توكن جهاز الأدمن
        token: adminToken,

        // إعدادات Web Push
        webpush: {
          notification: {
            icon: '/img/logo.svg',
            badge: '/img/logo.svg',
            requireInteraction: true
          }
        }
      };

      // ==========================
      // إرسال الإشعار
      // ==========================
      const response = await admin.messaging().send(message);
      console.log('Notification sent successfully:', response);

      return null;

    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  });
