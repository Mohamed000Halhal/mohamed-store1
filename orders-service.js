/**
 * ============================================
 * خدمة الطلبات - orders-service.js
 * ============================================
 * يدير الطلبات: حفظ، قراءة، تحديث، حذف، استرجاع
 * الطلبات تُخزّن في Firestore فقط (كل طلب كمستند تحت التاني) - لا تُستخدم localStorage للطلبات عند توفر Firebase
 * العدادات (adminStats, adminPresence) منفصلة ولا تتأثر بعمليات الطلبات
 */
(function createOrdersService(windowObj) {
    const LOCAL_ORDERS_KEY = 'orders';      // مفتاح الطلبات في localStorage
    const LOCAL_DELETED_KEY = 'deletedOrders';  // مفتاح المحذوفة

    // دالة للحصول على Firestore بأمان
    function getFirestore() {
        try {
            // التحقق من firestoreDB أولاً
            if (windowObj.firestoreDB) {
                return windowObj.firestoreDB;
            }
            
            // التحقق من window.db
            if (windowObj.db) {
                return windowObj.db;
            }
            
            // التحقق من Firebase قبل محاولة الوصول إليه
            if (typeof firebase === 'undefined') {
                return null;
            }
            
            // التأكد من أن Firebase تم تهيئته
            if (!firebase.apps || firebase.apps.length === 0) {
                return null;
            }
            
            // الآن يمكن الوصول إلى firestore بأمان
            return firebase.firestore();
        } catch (error) {
            return null;
        }
    }

    // تهيئة Collections بشكل آمن - لا نحاول الوصول إلى Firebase عند التحميل
    let db = null;
    let ordersCollection = null;
    let deletedCollection = null;

    // دالة لإعادة تهيئة Collections عند تهيئة Firebase
    function refreshCollections() {
        db = getFirestore();
        ordersCollection = db ? db.collection('orders') : null;
        deletedCollection = db ? db.collection('deletedOrders') : null;
    }

    /**
     * إذا كان الطلب يحتوي على صورة إيداع كبيرة (data URL أو نص base64 كبير)
     * نقوم برفعها إلى Firebase Storage وتخزين رابطها كـ `depositScreenshotUrl`
     * ونحذف الحقل الكبير `depositScreenshot` قبل حفظ المستند في Firestore.
     */
    async function maybeUploadDepositScreenshot(order) {
        if (!order || !order.depositScreenshot) return;
        try {
            if (typeof firebase === 'undefined' || !firebase.storage) return;
            var storage = firebase.storage();
            var data = order.depositScreenshot;
            if (typeof data !== 'string') return;

            // إذا كان هذا بالفعل رابطًا، لا نفعل شيئًا
            if (data.indexOf('http://') === 0 || data.indexOf('https://') === 0 || data.indexOf('gs://') === 0) return;

            // قرارات الشروط: نرفع إذا كانت data URL أو إذا كانت السلسلة كبيرة (>500KB)
            var shouldUpload = data.indexOf('data:') === 0 || data.length > 500000;
            if (!shouldUpload) return;

            var idPart = order.id || ('order_' + Date.now());
            var ext = 'png';
            if (data.indexOf('data:image/jpeg') === 0 || data.indexOf('data:image/jpg') === 0) ext = 'jpg';
            var path = 'order_screenshots/' + idPart + '/deposit.' + ext;
            var ref = storage.ref().child(path);
            var putTask;
            if (data.indexOf('data:') === 0) {
                putTask = ref.putString(data, 'data_url');
            } else {
                putTask = ref.putString(data, 'base64');
            }
            var snap = await putTask;
            var url = await snap.ref.getDownloadURL();
            order.depositScreenshotUrl = url;
            try { delete order.depositScreenshot; } catch (e) {}
        } catch (e) {
            console.error('maybeUploadDepositScreenshot', e);
        }
    }

    /** قراءة مصفوفة من localStorage */
    function readLocal(key) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : [];
        } catch (error) {
            console.error('Failed to read from localStorage', error);
            return [];
        }
    }

    function writeLocal(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to write to localStorage', error);
        }
    }

    function usingFirestore() {
        refreshCollections();
        return Boolean(ordersCollection);
    }

    /** نقل الطلبات من localStorage إلى Firestore مرة واحدة فقط (لا يمس العدادات) */
    var migratedToFirestore = false;
    async function migrateLocalOrdersToFirestore() {
        if (migratedToFirestore || !ordersCollection) return;
        const localOrders = readLocal(LOCAL_ORDERS_KEY);
        if (!localOrders.length) return;
        try {
            for (var i = 0; i < localOrders.length; i++) {
                var o = localOrders[i];
                if (o && o.id) {
                    try {
                        await maybeUploadDepositScreenshot(o);
                    } catch (e) {
                        console.error('upload screenshot during migrate', e);
                    }
                    await ordersCollection.doc(o.id).set(o);
                }
            }
            migratedToFirestore = true;
            writeLocal(LOCAL_ORDERS_KEY, []);
        } catch (e) {
            console.error('migrateLocalOrdersToFirestore', e);
        }
    }

    /** دمج طلب في localStorage (يُستخدم فقط عند فشل Firestore) */
    function mergeOrderIntoLocal(order) {
        const current = readLocal(LOCAL_ORDERS_KEY);
        const byId = new Map(current.map(function (o) { return [o.id, o]; }));
        byId.set(order.id, order);
        writeLocal(LOCAL_ORDERS_KEY, Array.from(byId.values()));
    }

    /** حفظ طلب جديد في Firestore فقط (كل طلب كمستند تحت التاني) - لا يمس العدادات */
    async function saveOrder(order) {
        if (!order.deliveryStatus) order.deliveryStatus = 'pending';
        if (!ordersCollection) refreshCollections();

        if (ordersCollection) {
            try {
                await migrateLocalOrdersToFirestore();
                try {
                    await maybeUploadDepositScreenshot(order);
                } catch (e) {
                    console.error('upload screenshot during saveOrder', e);
                }
                await ordersCollection.doc(order.id).set(order);
                return order;
            } catch (error) {
                mergeOrderIntoLocal(order);
                return order;
            }
        }
        mergeOrderIntoLocal(order);
        return order;
    }

    /** تحديث حقول طلب موجود */
    async function updateOrder(orderId, updates) {
        if (!ordersCollection) refreshCollections();
        if (ordersCollection) {
            try {
                const ref = ordersCollection.doc(orderId);
                await ref.update(updates);
                return;
            } catch (e) {
                // fallback
            }
        }
        const orders = readLocal(LOCAL_ORDERS_KEY);
        const idx = orders.findIndex(o => o.id === orderId);
        if (idx !== -1) {
            orders[idx] = { ...orders[idx], ...updates };
            writeLocal(LOCAL_ORDERS_KEY, orders);
        }
    }

    /** الاشتراك في تحديثات الطلبات (real-time) */
    function listenOrders(callback) {
        if (!ordersCollection) refreshCollections();
        if (!ordersCollection || typeof callback !== 'function') return function () {};
        const unsub = ordersCollection.orderBy('date', 'desc').onSnapshot(function (snapshot) {
            const orders = snapshot.docs.map(doc => doc.data());
            callback(orders);
        });
        return unsub;
    }

    /** زيادة عداد زوار صفحة الطلبات (index.html فقط) - أرقام حقيقية */
    async function incrementSiteVisitor() {
        const db = getFirestore();
        if (!db) {
            try {
                const n = parseInt(localStorage.getItem('siteVisitorCount') || '0', 10) + 1;
                localStorage.setItem('siteVisitorCount', String(n));
            } catch (e) {}
            return;
        }
        try {
            const ref = db.collection('adminStats').doc('stats');
            var FieldValue = typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore.FieldValue
                ? firebase.firestore.FieldValue : null;
            if (FieldValue && typeof FieldValue.increment === 'function') {
                await ref.set({ siteVisitorCount: FieldValue.increment(1), lastUpdated: new Date().toISOString() }, { merge: true });
            } else {
                var snap = await ref.get();
                var data = snap.exists ? snap.data() : {};
                var count = (data.siteVisitorCount || 0) + 1;
                await ref.set({ siteVisitorCount: count, lastUpdated: new Date().toISOString() }, { merge: true });
            }
        } catch (e) { console.error('incrementSiteVisitor', e); }
    }

    /** إضافة الجهاز عند فتح رابط الأدمن - العداد يزيد +1 فوراً */
    function addAdminPresence() {
        const db = getFirestore();
        if (!db) return Promise.resolve(null);
        const sessionId = 'adm_' + Date.now() + '_' + Math.random().toString(36).slice(2);
        const presenceRef = db.collection('adminPresence').doc(sessionId);
        const data = { lastHeartbeat: new Date().toISOString(), joinedAt: new Date().toISOString() };
        return presenceRef.set(data).then(function () {
            return { sessionId: sessionId, presenceRef: presenceRef };
        }).catch(function (e) {
            console.error('addAdminPresence', e);
            return null;
        });
    }

    /** إزالة الجهاز عند إغلاق صفحة الأدمن - العداد ينقص + تحديث سجل الجلسة (خروج، مدة) */
    function removeAdminPresence(sessionId) {
        var db = getFirestore();
        if (!db || !sessionId) return Promise.resolve();
        return endSessionLog(sessionId).then(function () {
            try {
                db.collection('adminPresence').doc(sessionId).delete();
            } catch (e) { console.error('removeAdminPresence', e); }
        }).catch(function (e) {
            console.error('removeAdminPresence', e);
            try { db.collection('adminPresence').doc(sessionId).delete(); } catch (e2) {}
        });
    }

    /** سجل دخول الأدمن: بدء جلسة (اسم الجهاز، اسم المستخدم، وقت الدخول) */
    var sessionLogCol = null;
    function getSessionLogCol() {
        if (!sessionLogCol) {
            var d = getFirestore();
            sessionLogCol = d ? d.collection('adminSessionLog') : null;
        }
        return sessionLogCol;
    }
    function startSessionLog(sessionId, userName, deviceName) {
        var col = getSessionLogCol();
        if (!col || !sessionId) return Promise.resolve();
        var loginTime = new Date().toISOString();
        return col.doc(sessionId).set({
            sessionId: sessionId,
            deviceName: deviceName || 'جهاز',
            userName: userName || '—',
            loginTime: loginTime,
            exitTime: null,
            durationHours: null,
            lastSeenAt: loginTime,
            durationSoFar: 0,
            actions: []
        }).catch(function (e) { console.error('startSessionLog', e); });
    }
    /** تحديث آخر ظهور ومدة الجلسة مع كل heartbeat - حتى لو خرج من المتصفح بدون تسجيل خروج */
    function updateSessionLogHeartbeat(sessionId) {
        var col = getSessionLogCol();
        if (!col || !sessionId) return Promise.resolve();
        return col.doc(sessionId).get().then(function (snap) {
            if (!snap.exists) return;
            var d = snap.data();
            if (d.exitTime) return;
            var loginMs = d.loginTime ? new Date(d.loginTime).getTime() : 0;
            var now = Date.now();
            var lastSeenAt = new Date().toISOString();
            var durationSoFar = Math.round((now - loginMs) / 3600000 * 100) / 100;
            return col.doc(sessionId).update({ lastSeenAt: lastSeenAt, durationSoFar: durationSoFar });
        }).catch(function (e) { console.error('updateSessionLogHeartbeat', e); });
    }
    function endSessionLog(sessionId) {
        var col = getSessionLogCol();
        if (!col || !sessionId) return Promise.resolve();
        return col.doc(sessionId).get().then(function (snap) {
            if (!snap.exists) return;
            var d = snap.data();
            var loginMs = d.loginTime ? new Date(d.loginTime).getTime() : 0;
            var exitTime = new Date().toISOString();
            var durationMs = Date.now() - loginMs;
            var durationHours = Math.round((durationMs / 3600000) * 100) / 100;
            return col.doc(sessionId).update({
                exitTime: exitTime,
                durationHours: durationHours
            });
        }).catch(function (e) {
            console.error('endSessionLog', e);
        });
    }
    function logSessionAction(sessionId, actionText) {
        var col = getSessionLogCol();
        if (!col || !sessionId || !actionText) return Promise.resolve();
        var entry = { time: new Date().toISOString(), text: actionText };
        return col.doc(sessionId).get().then(function (snap) {
            if (!snap.exists) return;
            var actions = (snap.data().actions || []).slice();
            actions.push(entry);
            return col.doc(sessionId).update({ actions: actions });
        }).catch(function (e) { console.error('logSessionAction', e); });
    }
    function getSessionLogs() {
        var col = getSessionLogCol();
        if (!col) return Promise.resolve([]);
        return col.orderBy('loginTime', 'desc').limit(200).get()
            .then(function (snap) { return snap.docs.map(function (d) { return d.data(); }); })
            .catch(function (e) { console.error('getSessionLogs', e); return []; });
    }
    function listenSessionLogs(callback) {
        var col = getSessionLogCol();
        if (!col || typeof callback !== 'function') return function () {};
        return col.orderBy('loginTime', 'desc').limit(200).onSnapshot(
            function (snap) {
                var list = snap.docs.map(function (d) { return d.data(); });
                callback(list);
            },
            function (e) { console.error('listenSessionLogs', e); }
        );
    }

    /** الاستماع لعدد الأجهزة على رابط الأدمن - يزيد مع كل جهاز دخل وينقص مع كل جهاز خرج (فوري) */
    function listenAdminPresence(callback) {
        const db = getFirestore();
        if (!db || typeof callback !== 'function') return function () {};
        const presenceCol = db.collection('adminPresence');
        var HEARTBEAT_MAX_AGE_MS = 55000; // ~55 ثانية بدون heartbeat = الجهاز خرج
        const unsub = presenceCol.onSnapshot(function (snap) {
            var now = Date.now();
            var count = 0;
            snap.docs.forEach(function (doc) {
                var data = doc.data();
                var hb = data.lastHeartbeat ? new Date(data.lastHeartbeat).getTime() : 0;
                if (now - hb < HEARTBEAT_MAX_AGE_MS) count++;
            });
            callback(count);
        });
        return unsub;
    }

    /** الاشتراك في إحصائيات الأدمن (عدد زوار الموقع، زوار الأدمن) - أرقام حقيقية من Firebase */
    function listenAdminStats(callback) {
        const db = getFirestore();
        if (!db || typeof callback !== 'function') return function () {};
        const ref = db.collection('adminStats').doc('stats');
        const unsub = ref.onSnapshot(function (snap) {
            const data = snap.exists ? snap.data() : {};
            callback({
                visitorCount: data.visitorCount || 0,
                siteVisitorCount: data.siteVisitorCount || 0
            });
        });
        return unsub;
    }

    /** جلب جميع الطلبات النشطة من Firestore فقط (كل طلب تحت التاني) - لا يمس العدادات */
    async function getOrders() {
        if (!ordersCollection) refreshCollections();

        if (ordersCollection) {
            try {
                await migrateLocalOrdersToFirestore();
                const snapshot = await ordersCollection.orderBy('date', 'desc').get();
                return snapshot.docs.map(function (doc) { return doc.data(); });
            } catch (error) {
                return readLocal(LOCAL_ORDERS_KEY);
            }
        }
        return readLocal(LOCAL_ORDERS_KEY);
    }

    async function getDeletedOrders() {
        // محاولة تحديث Collections قبل الاستخدام
        if (!deletedCollection) {
            refreshCollections();
        }

        if (deletedCollection) {
            try {
                const snapshot = await deletedCollection.orderBy('deletedAt', 'desc').get();
                return snapshot.docs.map(doc => doc.data());
            } catch (error) {
                const deletedOrders = readLocal(LOCAL_DELETED_KEY);
                return deletedOrders.sort((a, b) => new Date(b.deletedAt || b.date) - new Date(a.deletedAt || a.date));
            }
        }

        const deletedOrders = readLocal(LOCAL_DELETED_KEY);
        return deletedOrders.sort((a, b) => new Date(b.deletedAt || b.date) - new Date(a.deletedAt || a.date));
    }

    /** حذف طلب (نقله إلى المحذوفة) */
    async function deleteOrder(orderId) {
        // محاولة تحديث Collections قبل الاستخدام
        if (!ordersCollection || !deletedCollection) {
            refreshCollections();
        }

        if (ordersCollection && deletedCollection) {
            const docRef = ordersCollection.doc(orderId);
            const docSnapshot = await docRef.get();

            if (!docSnapshot.exists) {
                return;
            }

            const orderData = {
                ...docSnapshot.data(),
                deletedAt: new Date().toISOString()
            };

            await deletedCollection.doc(orderId).set(orderData);
            await docRef.delete();
            return;
        }

        const orders = readLocal(LOCAL_ORDERS_KEY);
        const orderToDelete = orders.find(order => order.id === orderId);

        if (!orderToDelete) {
            return;
        }

        const deletedOrders = readLocal(LOCAL_DELETED_KEY);
        deletedOrders.push({
            ...orderToDelete,
            deletedAt: new Date().toISOString()
        });
        writeLocal(LOCAL_DELETED_KEY, deletedOrders);

        const updatedOrders = orders.filter(order => order.id !== orderId);
        writeLocal(LOCAL_ORDERS_KEY, updatedOrders);
    }

    /** استرجاع طلب من المحذوفة */
    async function restoreOrder(orderId) {
        // محاولة تحديث Collections قبل الاستخدام
        if (!ordersCollection || !deletedCollection) {
            refreshCollections();
        }

        if (ordersCollection && deletedCollection) {
            const deletedDocRef = deletedCollection.doc(orderId);
            const deletedDocSnapshot = await deletedDocRef.get();

            if (!deletedDocSnapshot.exists) {
                return;
            }

            const { deletedAt, ...orderData } = deletedDocSnapshot.data();
            await ordersCollection.doc(orderId).set(orderData);
            await deletedDocRef.delete();
            return;
        }

        const deletedOrders = readLocal(LOCAL_DELETED_KEY);
        const orderToRestore = deletedOrders.find(order => order.id === orderId);

        if (!orderToRestore) {
            return;
        }

        const { deletedAt, ...orderData } = orderToRestore;
        const orders = readLocal(LOCAL_ORDERS_KEY);
        orders.push(orderData);
        writeLocal(LOCAL_ORDERS_KEY, orders);

        const updatedDeleted = deletedOrders.filter(order => order.id !== orderId);
        writeLocal(LOCAL_DELETED_KEY, updatedDeleted);
    }

    /** حذف نهائي من المحذوفة - لا يمكن استرجاعه */
    async function permanentlyDeleteOrder(orderId) {
        // محاولة تحديث Collections قبل الاستخدام
        if (!deletedCollection) {
            refreshCollections();
        }

        if (deletedCollection) {
            try {
                await deletedCollection.doc(orderId).delete();
                return;
            } catch (error) {
                // Fallback to localStorage
            }
        }

        const deletedOrders = readLocal(LOCAL_DELETED_KEY);
        const updatedDeleted = deletedOrders.filter(order => order.id !== orderId);
        writeLocal(LOCAL_DELETED_KEY, updatedDeleted);
    }

    /* تصدير واجهة الخدمة إلى window */
    windowObj.ordersService = {
        saveOrder,
        getOrders,
        updateOrder,
        deleteOrder,
        restoreOrder,
        getDeletedOrders,
        permanentlyDeleteOrder,
        listenOrders,
        addAdminPresence,
        removeAdminPresence,
        listenAdminPresence,
        startSessionLog,
        updateSessionLogHeartbeat,
        logSessionAction,
        getSessionLogs,
        listenSessionLogs,
        incrementSiteVisitor,
        listenAdminStats,
        isUsingFirestore: usingFirestore,
        refresh: refreshCollections
    };
})(window);

