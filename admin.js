/**
 * ============================================
 * لوحة إدارة الطلبات - admin.js
 * ============================================
 * تحتوي على: تسجيل الدخول، عرض الطلبات، إدارة التسليم، التصدير، رسائل الاتصال
 */

const ADMIN_PASSWORD = 'Mido500@#$'; // كلمة مرور الأدمن - يمكن تغييرها

/** الحصول على خدمة الطلبات (Firebase أو localStorage) */
function getOrdersService() {
    return window.ordersService;
}

// قراءة الطلبات (من Firebase أو localStorage)
async function getOrders() {
    const ordersService = getOrdersService();
    if (ordersService) {
        try {
            return await ordersService.getOrders();
        } catch (error) {
            console.error('Error getting orders from service:', error);
            return [];
        }
    }
    // Fallback إلى localStorage
    try {
        const orders = localStorage.getItem('orders');
        return orders ? JSON.parse(orders) : [];
    } catch (error) {
        return [];
    }
}

// التحقق من حالة تسجيل الدخول
function checkAuth() {
    try {
        const token = localStorage.getItem('adminToken');
        if (token === 'admin-token') {
            showAdminPanel();
        } else {
            showLoginForm();
        }
    } catch (error) {
        console.error('Error in checkAuth:', error);
        showLoginForm(); // في حالة الخطأ، اعرض نموذج تسجيل الدخول
    }
}

// عرض نموذج تسجيل الدخول
function showLoginForm() {
    const loginContainer = document.getElementById('loginContainer');
    const adminContainer = document.getElementById('adminContainer');
    if (loginContainer) loginContainer.style.display = 'block';
    if (adminContainer) adminContainer.style.display = 'none';
}

// عرض لوحة الإدارة
function showAdminPanel() {
    const loginContainer = document.getElementById('loginContainer');
    const adminContainer = document.getElementById('adminContainer');
    const welcomeScreen = document.getElementById('adminWelcomeScreen');
    const welcomeScreenText = document.getElementById('adminWelcomeScreenText');
    const welcomeEl = document.getElementById('adminWelcomeMsg');
    const savedName = localStorage.getItem('adminUserName') || '';

    if (loginContainer) loginContainer.style.display = 'none';
    if (adminContainer) adminContainer.style.display = 'block';

    // رسالة الترحيب في الهيدر
    if (welcomeEl) welcomeEl.textContent = savedName ? 'Welcome  ' + savedName : '';

    // شاشة الترحيب البيضاء: الشعار + Welcome، الاسم لمدة 10 ثواني
    if (welcomeScreen && welcomeScreenText) {
        welcomeScreen.style.display = 'flex';
        welcomeScreen.classList.remove('hiding');
        welcomeScreenText.textContent = savedName ? 'Welcome، ' + savedName : 'Welcome';
        setTimeout(function() {
            welcomeScreen.classList.add('hiding');
            setTimeout(function() {
                welcomeScreen.style.display = 'none';
                welcomeScreen.classList.remove('hiding');
            }, 500);
        }, 1000);
    }

    loadOrders();
    var os = getOrdersService();
    if (os) {
        /* عدد زوار صفحة الطلبات - تحديث فوري بدون ريفريش */
        if (os.listenAdminStats) {
            os.listenAdminStats(function(data) {
                updateVisitorCount(data.siteVisitorCount ?? 0);
            });
        } else {
            var n = parseInt(localStorage.getItem('siteVisitorCount') || '0', 10);
            updateVisitorCount(n);
        }
        /* عداد الأجهزة + سجل الدخول: يزيد +1 مع كل جهاز فتح اللينك، وينقص -1 مع كل جهاز خرج */
        (function setupPresence() {
            if (!os.addAdminPresence) return;
            os.addAdminPresence().then(function(presence) {
                if (!presence || !presence.sessionId) return;
                adminPresenceSessionId = presence.sessionId;
                var startLogPromise = (os.startSessionLog) ? os.startSessionLog(presence.sessionId, savedName, getDeviceName()) : Promise.resolve();
                return startLogPromise.then(function() { return presence; });
            }).then(function(presence) {
                if (!presence) return;
                var heartbeatInterval = setInterval(function() {
                    if (presence.presenceRef && typeof presence.presenceRef.set === 'function') {
                        presence.presenceRef.set({ lastHeartbeat: new Date().toISOString() }).catch(function(){});
                    }
                    if (os.updateSessionLogHeartbeat && presence.sessionId) {
                        os.updateSessionLogHeartbeat(presence.sessionId);
                    }
                }, 20000);
                var removePresence = function() {
                    console.log('=== بدء عملية الخروج التلقائي من لوحة الإدارة (إغلاق المتصفح) ===');
                    console.log('وقت الإغلاق:', new Date().toLocaleString('ar-EG'));
                    console.log('السبب: إغلاق المتصفح أو مغادرة الصفحة');
                    
                    // تسجيل بيانات الأدمن قبل الخروج التلقائي
                    const adminName = localStorage.getItem('adminUserName') || 'غير محدد';
                    const deviceName = getDeviceName();
                    console.log('بيانات الأدمن:');
                    console.log('- اسم الأدمن:', adminName);
                    console.log('- اسم الجهاز:', deviceName);
                    console.log('- معرف الجلسة:', presence.sessionId || 'غير محدد');
                    
                    // تسجيل البيانات التي سيتم حذفها
                    console.log('البيانات التي سيتم حذفها عند الإغلاق التلقائي:');
                    console.log('- جلسة الأدمن الحالية');
                    console.log('- بيانات الحضور (presence)');
                    console.log('- اشتراكات الاستماع الفوري');
                    console.log('- عداد heartbeat');
                    
                    clearInterval(heartbeatInterval);
                    console.log('- تم إيقاف عداد heartbeat');
                    
                    var sid = presence.sessionId;
                    if (sid && os.removeAdminPresence) {
                        console.log('- إزالة بيانات الحضور من Firebase (إغلاق تلقائي)');
                        os.removeAdminPresence(sid);
                    }
                    adminPresenceSessionId = null;
                    console.log('=== تم الخروج التلقائي بنجاح ===');
                };
                window.addEventListener('beforeunload', removePresence);
                window.addEventListener('pagehide', removePresence);
                window.addEventListener('unload', removePresence);
            }).catch(function() {});
        })();
        var lastDevicesCount = -1;
        if (os.listenAdminPresence) {
            adminPresenceUnsub = os.listenAdminPresence(function(count) {
                if (count === lastDevicesCount) return;
                lastDevicesCount = count;
                var el = document.getElementById('adminDevicesCount');
                if (el) el.textContent = count;
            });
        }
        /* الطلبات - تحديث فوري بدون ريفريش */
        if (os.listenOrders) {
            os.listenOrders(function(orders) { loadOrdersWithData(orders); });
        }
        if (os.listenSessionLogs) {
            os.listenSessionLogs(renderSessionLogTable);
        }
    }
    setTimeout(function() {
        initializeNotificationsListener();
    }, 1000);
}

/** تنسيق وقت ISO إلى ساعة:دقيقة (أو تاريخ + وقت) */
function formatSessionTime(isoStr) {
    if (!isoStr) return '—';
    try {
        var d = new Date(isoStr);
        var h = d.getHours();
        var m = d.getMinutes();
        var day = d.getDate();
        var month = d.getMonth() + 1;
        var year = d.getFullYear();
        return year + '/' + (month < 10 ? '0' : '') + month + '/' + (day < 10 ? '0' : '') + day + ' ' + (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
    } catch (e) { return isoStr; }
}

/** تنسيق مدة الجلسة (ساعات أو دقائق) */
function formatDurationHours(hours) {
    if (hours == null || hours === undefined) return '—';
    if (hours < 1) {
        var mins = Math.round(hours * 60);
        return mins + ' دقيقة';
    }
    return (Math.round(hours * 100) / 100) + ' ساعة';
}

/** عرض جدول سجل الدخول */
function renderSessionLogTable(logs) {
    var tbody = document.getElementById('sessionLogTableBody');
    if (!tbody) return;
    if (!logs || logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="session-log-empty">لا توجد جلسات مسجلة</td></tr>';
        return;
    }
    var html = '';
    for (var i = 0; i < logs.length; i++) {
        var row = logs[i];
        var deviceName = row.deviceName || '—';
        var userName = row.userName || '—';
        var loginTime = formatSessionTime(row.loginTime);
        var durationVal = row.exitTime != null ? row.durationHours : row.durationSoFar;
        var duration = formatDurationHours(durationVal);
        var exitTimeStr = row.exitTime ? formatSessionTime(row.exitTime) : (row.lastSeenAt ? formatSessionTime(row.lastSeenAt) + ' (تقريبي)' : '—');
        var actions = row.actions || [];
        var actionsText = actions.length ? actions.map(function(a) { return (a.text || '') + ' (' + formatSessionTime(a.time) + ')'; }).join('، ') : '—';
        html += '<tr>' +
            '<td>' + escapeHtml(deviceName) + '</td>' +
            '<td>' + escapeHtml(userName) + '</td>' +
            '<td>' + loginTime + '</td>' +
            '<td class="session-log-duration">' + duration + '</td>' +
            '<td>' + exitTimeStr + '</td>' +
            '<td class="session-log-actions-cell">' + escapeHtml(actionsText) + '</td>' +
            '</tr>';
    }
    tbody.innerHTML = html;
}
function escapeHtml(s) {
    if (!s) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
}

// تسجيل الدخول
function login() {
    const usernameInput = document.getElementById('adminUsername');
    const passwordInput = document.getElementById('adminPassword');
    const messageDiv = document.getElementById('loginMessage');

    if (!passwordInput) {
        console.error('Password input not found');
        return;
    }

    const username = usernameInput ? usernameInput.value.trim() : '';
    const password = passwordInput.value.trim();

    if (!username) {
        if (messageDiv) {
            messageDiv.textContent = 'يرجى إدخال اسم المستخدم';
            messageDiv.className = 'message error';
            messageDiv.style.display = 'block';
        }
        if (usernameInput) usernameInput.focus();
        return;
    }

    if (!password) {
        if (messageDiv) {
            messageDiv.textContent = 'يرجى إدخال كلمة المرور';
            messageDiv.className = 'message error';
            messageDiv.style.display = 'block';
        }
        passwordInput.focus();
        return;
    }

    // المقارنة مع كلمة المرور
    if (password === ADMIN_PASSWORD) {
        localStorage.setItem('adminToken', 'admin-token');
        localStorage.setItem('adminUserName', username);
        if (messageDiv) messageDiv.style.display = 'none';
        if (usernameInput) usernameInput.value = '';
        passwordInput.value = '';
        showAdminPanel();
    } else {
        if (messageDiv) {
            messageDiv.textContent = 'كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.';
            messageDiv.className = 'message error';
            messageDiv.style.display = 'block';
        }
        passwordInput.value = '';
        passwordInput.focus();
        setTimeout(() => {
            if (messageDiv) messageDiv.style.display = 'none';
        }, 5000);
    }
}

// متغير لحفظ معرف الجلسة وإلغاء الاشتراك في عداد الأجهزة
var adminPresenceSessionId = null;
var adminPresenceUnsub = null;

/** اسم الجهاز من المتصفح (مختصر) */
function getDeviceName() {
    try {
        var ua = navigator.userAgent || '';
        if (/Mobile|Android|iPhone|iPad/i.test(ua)) return 'موبايل';
        return 'كمبيوتر';
    } catch (e) { return 'جهاز'; }
}

// تسجيل الخروج
function logout() {
    console.log('=== بدء عملية تسجيل الخروج من لوحة الإدارة ===');
    console.log('وقت الخروج:', new Date().toLocaleString('ar-EG'));
    
    // تسجيل بيانات الأدمن قبل الخروج
    const adminName = localStorage.getItem('adminUserName') || 'غير محدد';
    const deviceName = getDeviceName();
    console.log('بيانات الأدمن:');
    console.log('- اسم الأدمن:', adminName);
    console.log('- اسم الجهاز:', deviceName);
    console.log('- معرف الجلسة:', adminPresenceSessionId || 'غير محدد');
    
    // تسجيل البيانات التي سيتم حذفها
    console.log('البيانات التي سيتم حذفها عند الخروج من لوحة الإدارة:');
    console.log('- توكن الأدمن (adminToken)');
    console.log('- اسم الأدمن (adminUserName)');
    console.log('- جلسة الأدمن الحالية');
    console.log('- بيانات الحضور (presence)');
    console.log('- اشتراكات الاستماع الفوري (listeners)');
    
    // تسجيل أي بيانات إضافية في localStorage
    const localStorageKeys = Object.keys(localStorage);
    const adminRelatedKeys = localStorageKeys.filter(key => 
        key.includes('admin') || key.includes('token') || key.includes('session')
    );
    if (adminRelatedKeys.length > 0) {
        console.log('- بيانات localStorage المتعلقة بالأدمن:', adminRelatedKeys);
    }
    
    var sid = adminPresenceSessionId;
    adminPresenceSessionId = null;
    if (adminPresenceUnsub && typeof adminPresenceUnsub === 'function') {
        try { 
            console.log('- إلغاء اشتراك الاستماع الفوري للأجهزة');
            adminPresenceUnsub(); 
        } catch (e) { 
            console.error('خطأ في إلغاء الاشتراك:', e);
        }
        adminPresenceUnsub = null;
    }
    if (sid && window.ordersService && window.ordersService.removeAdminPresence) {
        console.log('- إزالة بيانات الحضور من Firebase');
        window.ordersService.removeAdminPresence(sid).then(function() {
            console.log('تم إزالة بيانات الحضور بنجاح');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUserName');
            console.log('تم حذف بيانات الأدمن من localStorage');
            showLoginForm();
            console.log('=== تم تسجيل الخروج بنجاح ===');
        }).catch(function(error) {
            console.error('خطأ في إزالة بيانات الحضور:', error);
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUserName');
            console.log('تم حذف بيانات الأدمن من localStorage (مع معالجة الخطأ)');
            showLoginForm();
            console.log('=== تم تسجيل الخروج بنجاح (مع معالجة الخطأ) ===');
        });
        return;
    }
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUserName');
    console.log('تم حذف بيانات الأدمن من localStorage (بدون Firebase)');
    showLoginForm();
    console.log('=== تم تسجيل الخروج بنجاح ===');
    const usernameInput = document.getElementById('adminUsername');
    const passwordInput = document.getElementById('adminPassword');
    if (usernameInput) usernameInput.value = '';
    if (passwordInput) passwordInput.value = '';
}

// تفعيل الإشعارات
function enableNotifications() {
    if (window.notificationService && typeof window.notificationService.enableNotifications === 'function') {
        window.notificationService.enableNotifications();
    } else {
        alert('خدمة الإشعارات غير متاحة. تأكد من تحميل Firebase Messaging SDK.');
    }
}

// قراءة الطلبات المحذوفة (من Firebase أو localStorage)
async function getDeletedOrders() {
    const ordersService = getOrdersService();
    if (ordersService && ordersService.getDeletedOrders) {
        try {
            return await ordersService.getDeletedOrders();
        } catch (error) {
            console.error('Error getting deleted orders from service:', error);
            return [];
        }
    }
    // Fallback إلى localStorage
    try {
        const deletedOrders = localStorage.getItem('deletedOrders');
        return deletedOrders ? JSON.parse(deletedOrders) : [];
    } catch (error) {
        return [];
    }
}

// حذف مجموعة طلبات (نفس الاسم والموبايل)
async function deleteGroup(orderIds) {
    if (!orderIds || orderIds.length === 0) return;
    if (!confirm('حذف كل طلبات هذا العميل؟ (' + orderIds.length + ' طلب)')) return;
    const os = getOrdersService();
    if (!os || !os.deleteOrder) return;
    for (const id of orderIds) {
        try { await os.deleteOrder(id); } catch (e) { console.error(e); }
    }
    if (adminPresenceSessionId && os.logSessionAction) os.logSessionAction(adminPresenceSessionId, 'حذف مجموعة طلبات (' + orderIds.length + ')');
    await loadOrders();
    await refreshStats();
}

// حذف كل الطلبات لمستخدم (نفس الاسم والموبايل) عبر كل الأيام
async function deleteCustomerAll(name, mobile) {
    if (!name || !mobile) return;
    if (!confirm('حذف كل طلبات هذا العميل عبر كل الأيام؟')) return;
    try {
        const orders = await getOrders();
        const matching = (orders || []).filter(o => ((o.name||'').trim() === (name||'').trim()) && ((o.mobile||'').trim() === (mobile||'').trim()));
        const ids = matching.map(o => o.id).filter(Boolean);
        if (!ids.length) { alert('لا توجد طلبات لهذا العميل'); return; }
        const os = getOrdersService();
        if (!os || !os.deleteOrder) return;
        for (const id of ids) {
            try { await os.deleteOrder(id); } catch (e) { console.error(e); }
        }
        if (adminPresenceSessionId && os.logSessionAction) os.logSessionAction(adminPresenceSessionId, 'حذف كل طلبات عميل (' + (ids.length) + ')');
        await loadOrders();
        await refreshStats();
    } catch (e) {
        console.error('deleteCustomerAll', e);
        alert('حدث خطأ أثناء حذف طلبات العميل');
    }
}

// حذف طلب
async function deleteOrder(orderId) {
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
        const ordersService = getOrdersService();
        
        if (ordersService && ordersService.deleteOrder) {
            try {
                await ordersService.deleteOrder(orderId);
                if (adminPresenceSessionId && ordersService.logSessionAction) ordersService.logSessionAction(adminPresenceSessionId, 'حذف طلب');
                await loadOrders();
                await refreshStats();
                return;
            } catch (error) {
                console.error('Error deleting order:', error);
                alert('حدث خطأ أثناء حذف الطلب. يرجى المحاولة مرة أخرى.');
                return;
            }
        }
        
        // Fallback إلى localStorage
        try {
            const orders = await getOrders();
            const orderToDelete = orders.find(order => order.id === orderId);
            
            if (orderToDelete) {
                // نقل الطلب إلى قائمة المحذوفة
                const deletedOrders = await getDeletedOrders();
                deletedOrders.push({
                    ...orderToDelete,
                    deletedAt: new Date().toISOString()
                });
                localStorage.setItem('deletedOrders', JSON.stringify(deletedOrders));
                
                // حذف الطلب من القائمة الرئيسية
                const filteredOrders = orders.filter(order => order.id !== orderId);
                localStorage.setItem('orders', JSON.stringify(filteredOrders));
                await loadOrders();
                await refreshStats();
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('حدث خطأ أثناء حذف الطلب.');
        }
    }
}

// استرجاع طلب محذوف
async function restoreOrder(orderId) {
    if (confirm('هل تريد استرجاع هذا الطلب؟')) {
        const ordersService = getOrdersService();
        
        if (ordersService && ordersService.restoreOrder) {
            try {
                await ordersService.restoreOrder(orderId);
                if (adminPresenceSessionId && ordersService.logSessionAction) ordersService.logSessionAction(adminPresenceSessionId, 'استرجاع طلب');
                await loadOrders();
                await refreshStats();
                return;
            } catch (error) {
                console.error('Error restoring order:', error);
                alert('حدث خطأ أثناء استرجاع الطلب. يرجى المحاولة مرة أخرى.');
                return;
            }
        }
        
        // Fallback إلى localStorage
        try {
            const deletedOrders = await getDeletedOrders();
            const orderToRestore = deletedOrders.find(order => order.id === orderId);
            
            if (orderToRestore) {
                // إزالة deletedAt من الطلب
                const { deletedAt, ...orderData } = orderToRestore;
                
                // إضافة الطلب إلى القائمة الرئيسية
                const orders = await getOrders();
                orders.push(orderData);
                localStorage.setItem('orders', JSON.stringify(orders));
                
                // حذف الطلب من قائمة المحذوفة
                const filteredDeleted = deletedOrders.filter(order => order.id !== orderId);
                localStorage.setItem('deletedOrders', JSON.stringify(filteredDeleted));
                
                await loadOrders();
                await refreshStats();
            }
        } catch (error) {
            console.error('Error restoring order:', error);
            alert('حدث خطأ أثناء استرجاع الطلب.');
        }
    }
}

// الحصول على اسم اليوم بالعربية
function getDayName(date) {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()];
}

// تحديث إحصائيات الشريط (طلبات اليوم، الشهر، السنة، تم تسليمها، زوار الموقع)
async function updateStats(orders, deletedOrders) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    let ordersToday = 0, ordersTodaySent = 0;
    let monthDelivered = 0, monthNotDelivered = 0;
    let yearDelivered = 0, yearNotDelivered = 0;
    let totalSent = 0;

    const allOrders = orders || [];
    let deleted = deletedOrders;
    if (!deleted) {
        try {
            deleted = await getDeletedOrders();
        } catch (e) {
            deleted = [];
        }
    }
    const toCount = [...allOrders];
    (deleted || []).forEach(o => {
        if ((o.deliveryStatus || '') === 'sent') toCount.push(o);
    });

    toCount.forEach(o => {
        const d = new Date(o.date);
        const sent = (o.deliveryStatus || 'pending') === 'sent';
        if (d >= todayStart) {
            ordersToday++;
            if (sent) ordersTodaySent++;
        }
        if (d >= monthStart) {
            if (sent) monthDelivered++; else monthNotDelivered++;
        }
        if (d >= yearStart) {
            if (sent) yearDelivered++; else yearNotDelivered++;
        }
        if (sent) totalSent++;
    });

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('ordersTodayCount', ordersToday);
    const todaySentEl = document.getElementById('ordersTodaySent');
    if (todaySentEl) todaySentEl.textContent = '(' + ordersTodaySent + ' تم تسليمها)';
    set('ordersMonthDelivered', monthDelivered);
    set('ordersMonthNotDelivered', monthNotDelivered);
    set('ordersYearDelivered', yearDelivered);
    set('ordersYearNotDelivered', yearNotDelivered);
    set('ordersTotalSent', totalSent);
}

/** إعادة تحميل الطلبات المحذوفة والنشطة ثم تحديث العدادات */
async function refreshStats() {
    try {
        const orders = await getOrders();
        const deleted = await getDeletedOrders();
        await updateStats(orders, deleted);
    } catch (e) {
        console.error('refreshStats', e);
    }
}

/** تحديث عدد الزوار في الواجهة */
function updateVisitorCount(count) {
    const el = document.getElementById('adminVisitorCount');
    if (el) el.textContent = count;
}

/** تم إرسال المنتج - تحديث حالة الطلب لـ sent */
async function markOrderSent(orderId) {
    if (!confirm('تأكيد: تم إرسال المنتج لهذا الطلب؟')) return;
    const os = getOrdersService();
    if (os && os.updateOrder) {
        try {
            await os.updateOrder(orderId, { deliveryStatus: 'sent', sentAt: new Date().toISOString() });
            if (typeof loadOrders === 'function') {
                await loadOrders();
                await refreshStats();
            }
        } catch (e) { console.error(e); alert('حدث خطأ'); }
    }
}

/** تحديث الحالة: لم يتم تسليم الطلب */
async function markOrderNotDelivered(orderId) {
    if (!confirm('تأكيد: لم يتم تسليم هذا الطلب؟')) return;
    const os = getOrdersService();
    if (os && os.updateOrder) {
        try {
            await os.updateOrder(orderId, { deliveryStatus: 'not_delivered' });
            if (typeof loadOrders === 'function') {
                await loadOrders();
                await refreshStats();
            }
        } catch (e) { console.error(e); alert('حدث خطأ'); }
    }
}

// تجميع الطلبات حسب (الاسم + الموبايل) وعرضها في مربع واحد لكل عميل
async function loadOrdersWithData(orders) {
    const wrapper = document.getElementById('ordersTableWrapper');
    if (!wrapper) return;
    
    // استبعاد الطلبات المسلمة فقط - باقي الطلبات تبقى مرئية
    const pendingOrders = orders.filter(o => (o.deliveryStatus || 'pending') !== 'sent');
    
    if (!pendingOrders || pendingOrders.length === 0) {
        wrapper.innerHTML = '<div class="no-orders">لا توجد طلبات قيد الانتظار حتى الآن</div>';
        await updateStats(orders);
        return;
    }
    pendingOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

    // تجميع الطلبات حسب اليوم
    const ordersByDay = {};
    pendingOrders.forEach(order => {
        const orderDate = new Date(order.date);
        const dayKey = orderDate.toDateString();
        if (!ordersByDay[dayKey]) ordersByDay[dayKey] = { date: orderDate, orders: [] };
        ordersByDay[dayKey].orders.push(order);
    });

    let html = '';
    Object.keys(ordersByDay).sort((a, b) => new Date(b) - new Date(a)).forEach(dayKey => {
        const dayData = ordersByDay[dayKey];
        const dayName = getDayName(dayData.date);
        const dateStr = dayData.date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
        const dayOrders = dayData.orders;
        // تجميع طلبات نفس العميل (نفس الاسم والموبايل) في مجموعة واحدة
        const groups = {};
        dayOrders.forEach(order => {
            const key = (order.name || '') + '|' + (order.mobile || '');
            if (!groups[key]) groups[key] = { name: order.name, mobile: order.mobile, governorate: order.governorate, center: order.center, address: order.address, orders: [] };
            groups[key].orders.push(order);
        });
        const groupList = Object.values(groups);

        html += `<div class="day-section">
            <h2 class="day-title">يوم ${dayName}</h2>
            <p class="day-subtitle">${dateStr}</p>
            <div class="orders-table-wrapper">
            <table class="orders-table">
            <thead><tr>
                <th>التاريخ</th><th>الاسم</th><th>رقم الموبايل</th><th>رقم الدفع</th><th>المحافظة</th><th>المركز</th><th>العنوان</th>
                <th>المنتجات (مربع واحد)</th><th>عدد القطع</th><th>المبلغ الكلي</th><th>العربون</th><th>الإجمالي</th>
                <th>حالة الدفع</th><th>الصورة</th><th>حالة التسليم</th><th>حذف</th>
            </tr></thead><tbody>`;

        groupList.forEach(g => {
            const firstOrder = g.orders[0];
            const escapedNameForOnclick = (firstOrder.name || '').replace(/'/g, "\\'").replace(/\n/g, ' ').trim();
            const escapedMobileForOnclick = (firstOrder.mobile || '').replace(/'/g, "\\'").replace(/\n/g, ' ').trim();
            const lastDate = g.orders.reduce((acc, o) => new Date(o.date) > new Date(acc) ? o.date : acc, g.orders[0].date);
            const dateStr2 = new Date(lastDate).toLocaleString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
            const productsHtml = g.orders.map(o => `عدد ${o.quantity || 1} ${o.productName}`).join('، ');
            const totalQty = g.orders.reduce((s, o) => s + (o.quantity || 0), 0);
            const totalAmount = g.orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
            const totalDeposit = g.orders.reduce((s, o) => s + (o.depositAmount || 0), 0);
            const totalWithDeposit = g.orders.reduce((s, o) => s + (o.totalWithDeposit || o.totalAmount || 0), 0);
            const allSent = g.orders.every(o => (o.deliveryStatus || 'pending') === 'sent');
            const anyNotDelivered = g.orders.some(o => (o.deliveryStatus || 'pending') === 'not_delivered');
            const orderIds = g.orders.map(o => o.id);
            
            // حساب حالة الدفع - استخدام paymentStatus من أول طلب أو payment_status
            const paymentStatus = (firstOrder.paymentStatus || firstOrder.payment_status || 'pending');
            
            // تحديد اللون والفئة بناءً على حالة الدفع
            let rowClass = 'payment-pending'; // الافتراضي: رمادي
            let statusText = 'لم يدفع المبلغ';
            if (paymentStatus === 'deposit_paid') {
                rowClass = 'payment-deposit-paid'; // أصفر: تم دفع العربون
                statusText = 'تم دفع العربون';
            } else if (paymentStatus === 'deposit_not_paid') {
                rowClass = 'payment-deposit-not-paid'; // أحمر: لم يتم دفع العربون
                statusText = 'لم يتم دفع العربون';
            } else if (paymentStatus === 'paid') {
                rowClass = 'payment-paid'; // أزرق: تم دفع المبلغ كاملاً
                statusText = 'تم دفع المبلغ كاملاً';
            }

            html += `<tr class="${rowClass}">
                <td>${dateStr2}</td>
                <td>${firstOrder.name}</td>
                <td>${firstOrder.mobile}</td>
                <td>${firstOrder.paymentPhone || '-'}</td>
                <td>${firstOrder.governorate}</td>
                <td>${firstOrder.center || '-'}</td>
                <td style="max-width:180px;word-wrap:break-word;">${firstOrder.address}</td>
                <td class="products-cell"><div class="products-box">${productsHtml}</div></td>
                <td>${totalQty}</td>
                <td>${totalAmount.toLocaleString('ar-EG')} ج</td>
                <td>${totalDeposit.toLocaleString('ar-EG')} ج</td>
                <td>${totalWithDeposit.toLocaleString('ar-EG')} ج</td>
                <td>
                    <div class="action-buttons payment-status-buttons">
                        <button class="payment-btn-deposit" onclick="updatePaymentStatus([${orderIds.map(id => "'" + id + "'").join(',')}], 'deposit_paid')" title="تم دفع العربون">العربون ✓</button>
                        <button class="payment-btn-not-deposit" onclick="updatePaymentStatus([${orderIds.map(id => "'" + id + "'").join(',')}], 'deposit_not_paid')" title="لم يتم دفع العربون">بدون عربون ✕</button>
                        <button class="payment-btn-paid" onclick="updatePaymentStatus([${orderIds.map(id => "'" + id + "'").join(',')}], 'paid')" title="تم دفع المبلغ كاملاً">مدفوع ✓</button>
                    </div>
                </td>
                <td>
                    ${firstOrder.depositScreenshot ? `<button class="view-screenshot-btn" onclick="showDepositScreenshot('${firstOrder.depositScreenshot}', '${firstOrder.name}')">عرض الصورة</button>` : '<span style="color: #999;">بدون صورة</span>'}
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="admin-stat-sent-btn" onclick="markGroupSent([${orderIds.map(id => "'" + id + "'").join(',')}])" title="تم التسليم">تم التسليم</button>
                        <button class="admin-stat-not-sent-btn" onclick="markGroupNotDelivered([${orderIds.map(id => "'" + id + "'").join(',')}])" title="لم يتم التسليم">لم يتم التسليم</button>
                        ${allSent ? ' <span style="color:#28a745;">✓ تم التسليم</span>' : ''}
                        ${anyNotDelivered ? ' <span style="color:#dc3545;">لم يُسلّم</span>' : ''}
                    </div>
                </td>
                <td><div class="action-buttons"><button class="delete-btn" onclick="deleteCustomerAll('${escapedNameForOnclick}','${escapedMobileForOnclick}')" title="حذف كل طلبات هذا العميل">حذف</button></div></td>
            </tr>`;
        });

        html += '</tbody></table></div></div>';
    });

    wrapper.innerHTML = html || '<div class="no-orders">لا توجد طلبات قيد الانتظار</div>';
    await updateStats(orders);
}

/** تم التسليم لمجموعة طلبات - ينقلها إلى الطلبات المنجزة */
async function markGroupSent(orderIds) {
    if (!confirm('تأكيد: تم تسليم هذه الطلبات؟ سيتم نقلها إلى الطلبات المنجزة.')) return;
    const os = getOrdersService();
    if (!os || !os.updateOrder) return;
    for (const id of orderIds) {
        try {
            // تحديث حالة التسليم والدفع معاً
            await os.updateOrder(id, { 
                deliveryStatus: 'sent', 
                paymentStatus: 'paid',
                sentAt: new Date().toISOString() 
            });
        } catch (e) { console.error(e); }
    }
    if (adminPresenceSessionId && os.logSessionAction) os.logSessionAction(adminPresenceSessionId, 'تم التسليم لمجموعة (' + (orderIds ? orderIds.length : 0) + ')');
    await loadOrders();
    await refreshStats();
}

/** تحديث حالة الدفع لمجموعة طلبات */
async function updatePaymentStatus(orderIds, status) {
    if (!orderIds || orderIds.length === 0) return;
    
    const statusText = {
        'deposit_paid': 'تم دفع العربون',
        'deposit_not_paid': 'لم يتم دفع العربون',
        'paid': 'تم دفع المبلغ كاملاً'
    };
    
    if (!confirm(`تأكيد: ${statusText[status]}؟`)) return;
    
    const os = getOrdersService();
    if (!os || !os.updateOrder) return;
    
    
    if (adminPresenceSessionId && os.logSessionAction) {
        os.logSessionAction(adminPresenceSessionId, `تحديث حالة الدفع: ${statusText[status]} (${orderIds.length} طلب)`);
    }
    for (const id of orderIds) {
        try { 
            await os.updateOrder(id, { paymentStatus: status }); 
        } catch (e) { console.error(e); }
    }
    await loadOrders();
    await refreshStats();
}

/** عرض صورة العربون في مودال */
function showDepositScreenshot(screenshotData, customerName) {
    if (!screenshotData) {
        alert('لا توجد صورة لهذا الطلب');
        return;
    }
    
    const modal = document.createElement('div');
    modal.id = 'screenshotModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        direction: rtl;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        border-radius: 15px;
        padding: 20px;
        max-width: 90%;
        max-height: 90%;
        overflow: auto;
        position: relative;
    `;
    
    const header = document.createElement('div');
    header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    `;
    
    const title = document.createElement('h3');
    title.textContent = `صورة العربون - ${customerName}`;
    title.style.margin = '0';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
    `;
    closeBtn.onclick = () => modal.remove();
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    
    const img = document.createElement('img');
    img.src = screenshotData;
    img.style.cssText = `
        max-width: 100%;
        height: auto;
        border-radius: 10px;
        border: 2px solid #e0e0e0;
    `;
    
    content.appendChild(header);
    content.appendChild(img);
    modal.appendChild(content);
    
    // إغلاق عند الضغط خارج الصورة
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
    
    // إغلاق عند الضغط على Escape
    const escClose = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', escClose);
        }
    };
    document.addEventListener('keydown', escClose);
    
    document.body.appendChild(modal);
}

/** لم يتم التسليم لمجموعة طلبات */
async function markGroupNotDelivered(orderIds) {
    if (!confirm('تأكيد: لم يتم تسليم هذه الطلبات؟')) return;
    const os = getOrdersService();
    if (!os || !os.updateOrder) return;
    for (const id of orderIds) {
        try { await os.updateOrder(id, { deliveryStatus: 'not_delivered' }); } catch (e) {}
    }
    if (adminPresenceSessionId && os.logSessionAction) os.logSessionAction(adminPresenceSessionId, 'لم يتم التسليم لمجموعة (' + (orderIds ? orderIds.length : 0) + ')');
    await loadOrders();
    await refreshStats();
}

/** جلب الطلبات وعرضها */
async function loadOrders() {
    try {
        const orders = await getOrders();
        loadOrdersWithData(orders);
    } catch (e) {
        const wrapper = document.getElementById('ordersTableWrapper');
        if (wrapper) wrapper.innerHTML = '<div class="no-orders">حدث خطأ أثناء تحميل الطلبات</div>';
    }
}

/** عرض نافذة الطلبات المحذوفة (مودال) */
async function showDeletedOrders() {
    const deletedOrders = await getDeletedOrders();
    
    if (deletedOrders.length === 0) {
        alert('لا توجد طلبات محذوفة');
        return;
    }
    
    // ترتيب الطلبات حسب تاريخ الحذف (الأحدث أولاً)
    deletedOrders.sort((a, b) => new Date(b.deletedAt || b.date) - new Date(a.deletedAt || a.date));
    
    let html = '<div class="deleted-orders-modal" id="deletedOrdersModal">';
    html += '<div class="modal-content">';
    html += '<div class="modal-header">';
    html += '<h2>الطلبات المحذوفة</h2>';
    html += '<button class="close-modal" onclick="closeDeletedOrders()">✕</button>';
    html += '</div>';
    html += '<div class="modal-body">';
    html += '<div class="orders-table-wrapper">';
    html += '<table class="orders-table">';
    html += '<thead><tr>';
    html += '<th>تاريخ الحذف</th>';
    html += '<th>الاسم</th>';
    html += '<th>رقم الموبايل</th>';
    html += '<th>المحافظة</th>';
    html += '<th>المركز</th>';
    html += '<th>اسم القطعة</th>';
    html += '<th>عدد القطع</th>';
    html += '<th>المبلغ الكلي</th>';
    html += '<th>استرجاع</th>';
    html += '<th>حذف نهائي</th>';
    html += '</tr></thead><tbody>';
    
    deletedOrders.forEach(order => {
        const deletedDate = order.deletedAt ? new Date(order.deletedAt).toLocaleString('ar-EG') : '-';
        html += `<tr>
            <td>${deletedDate}</td>
            <td>${order.name}</td>
            <td>${order.mobile}</td>
            <td>${order.governorate}</td>
            <td>${order.center || '-'}</td>
            <td>${order.productName}</td>
            <td>${order.quantity}</td>
            <td>${order.totalAmount ? order.totalAmount.toLocaleString('ar-EG') : '-'} جنيه</td>
            <td>
                <div class="action-buttons">
                    <button class="restore-btn" onclick="restoreOrder('${order.id}'); closeDeletedOrders();" title="استرجاع الطلب">استرجاع</button>
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="permanent-delete-btn" onclick="permanentDeleteOrderAndRefresh('${order.id}')" title="حذف نهائي لا يمكن استرجاعه">حذف نهائي</button>
                </div>
            </td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    html += '</div>';
    html += '</div></div></div>';
    
    document.body.insertAdjacentHTML('beforeend', html);
}

/** حذف نهائي - لا يمكن استرجاع الطلب بعدها */
async function permanentDeleteOrderAndRefresh(orderId) {
    if (!confirm('حذف نهائي؟ لا يمكن استرجاع الطلب بعدها.')) return;
    const os = getOrdersService();
    if (os && os.permanentlyDeleteOrder) {
        try {
            await os.permanentlyDeleteOrder(orderId);
            closeDeletedOrders();
            await showDeletedOrders();
            await refreshStats();
        } catch (e) {
            console.error(e);
            alert('حدث خطأ أثناء الحذف النهائي');
        }
    }
}

/** إغلاق نافذة الطلبات المحذوفة وإزالة المودال */
function closeDeletedOrders() {
    const modal = document.getElementById('deletedOrdersModal');
    if (modal) {
        modal.remove();
    }
}

/* إغلاق النافذة عند الضغط خارج المودال */
document.addEventListener('click', (e) => {
    const modal = document.getElementById('deletedOrdersModal');
    if (modal && e.target === modal) {
        closeDeletedOrders();
    }
});

/* إغلاق النافذة عند الضغط على مفتاح Escape */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeDeletedOrders();
    }
});

/** تصدير جميع الطلبات كملف JSON للتحميل */
async function exportOrders() {
    const orders = await getOrders();
    const dataStr = JSON.stringify(orders, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

/** تصدير جدول الطلبات كملف PDF باستخدام html2canvas و jsPDF */
async function exportToPDF() {
    try {
        const wrapper = document.getElementById('ordersTableWrapper');
        
        if (!wrapper || wrapper.innerHTML.trim() === '' || wrapper.innerHTML.includes('لا توجد طلبات')) {
            alert('لا توجد طلبات لتصديرها');
            return;
        }

        // إظهار رسالة تحميل
        const loadingMsg = document.createElement('div');
        loadingMsg.id = 'pdfLoading';
        loadingMsg.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 20px 40px; border-radius: 10px; z-index: 10000; font-size: 1.2em;';
        loadingMsg.textContent = 'جاري إنشاء ملف PDF...';
        document.body.appendChild(loadingMsg);

        // إنشاء نسخة من الجدول للتصدير
        const printContainer = document.createElement('div');
        printContainer.style.cssText = 'position: absolute; left: -9999px; width: 1400px; background: white; padding: 20px; direction: rtl; font-family: Arial, sans-serif;';
        
        // نسخ المحتوى مع تحسينات للطباعة
        const clonedContent = wrapper.cloneNode(true);
        clonedContent.style.width = '100%';
        clonedContent.style.overflow = 'visible';
        
        // تحسين الجداول للطباعة
        const tables = clonedContent.querySelectorAll('.orders-table');
        tables.forEach(table => {
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.fontSize = '10px';
        });
        
        printContainer.appendChild(clonedContent);
        document.body.appendChild(printContainer);

        // انتظار قليل لضمان تحميل المحتوى
        await new Promise(resolve => setTimeout(resolve, 100));

        // تحويل إلى canvas ثم PDF
        const canvas = await html2canvas(printContainer, {
            scale: 1.5,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: printContainer.scrollWidth,
            height: printContainer.scrollHeight,
            windowWidth: printContainer.scrollWidth,
            windowHeight: printContainer.scrollHeight
        });

        // إزالة العنصر المؤقت
        document.body.removeChild(printContainer);
        document.body.removeChild(loadingMsg);

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('l', 'mm', 'a4'); // landscape orientation

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgScaledWidth = imgWidth * ratio;
        const imgScaledHeight = imgHeight * ratio;

        // حساب عدد الصفحات المطلوبة
        const pageHeight = pdfHeight;
        let heightLeft = imgScaledHeight;
        let position = 0;

        // إضافة الصفحة الأولى
        pdf.addImage(imgData, 'PNG', 0, position, imgScaledWidth, imgScaledHeight);
        heightLeft -= pageHeight;

        // إضافة صفحات إضافية إذا لزم الأمر
        while (heightLeft > 0) {
            position = heightLeft - imgScaledHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgScaledWidth, imgScaledHeight);
            heightLeft -= pageHeight;
        }

        // حفظ الملف
        const dateStr = new Date().toLocaleDateString('ar-EG').replace(/\//g, '-');
        pdf.save(`طلبات_${dateStr}.pdf`);

    } catch (error) {
        console.error('خطأ في تصدير PDF:', error);
        alert('حدث خطأ أثناء إنشاء ملف PDF. يرجى المحاولة مرة أخرى.');
        const loadingMsg = document.getElementById('pdfLoading');
        if (loadingMsg) {
            loadingMsg.remove();
        }
    }
}

/* ========== تهيئة الصفحة عند التحميل ========== */
document.addEventListener('DOMContentLoaded', () => {
    // التأكد من أن الصفحة محملة بالكامل قبل التحقق من المصادقة
    setTimeout(() => {
        checkAuth();
    }, 100);
    
    const passwordInput = document.getElementById('adminPassword');
    const loginBtn = document.getElementById('loginBtn');
    
    if (passwordInput) {
        // السماح بالدخول عند الضغط على Enter
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.keyCode === 13) {
                e.preventDefault();
                login();
            }
        });
        
        // تنظيف الرسالة عند البدء بالكتابة
        passwordInput.addEventListener('input', () => {
            const messageDiv = document.getElementById('loginMessage');
            if (messageDiv && messageDiv.style.display === 'block') {
                messageDiv.style.display = 'none';
            }
        });
    }
    
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            login();
        });
    }

    // الانتظار حتى يتم تحميل Firebase و orders-service
    const checkServices = setInterval(() => {
        if (window.ordersService || window.db) {
            clearInterval(checkServices);
            if (localStorage.getItem('adminToken') === 'admin-token') {
                loadOrders();
                initializeNotificationsListener();
            }
        }
    }, 100);

    // إلغاء الانتظار بعد 5 ثوان
    setTimeout(() => {
        clearInterval(checkServices);
        if (localStorage.getItem('adminToken') === 'admin-token') {
            loadOrders();
            initializeNotificationsListener();
        }
    }, 5000);

    // تحديث الطلبات كل 30 ثانية
    setInterval(() => {
        if (localStorage.getItem('adminToken') === 'admin-token') {
            loadOrders();
        }
    }, 30000);
});

/** تهيئة استماع إشعارات Firebase عند وصول طلب جديد */
function initializeNotificationsListener() {
    // التحقق من أن Firebase Messaging متاح
    if (typeof firebase !== 'undefined' && firebase.messaging) {
        try {
            const messaging = firebase.messaging();
            
            // استماع للإشعارات في المقدمة
            messaging.onMessage(function(payload) {
                console.log('Notification received in admin page:', payload);
                
                // عرض إشعار محلي
                if (Notification.permission === 'granted' && payload.notification) {
                    new Notification(payload.notification.title || 'طلب جديد', {
                        body: payload.notification.body || 'لديك طلب جديد',
                        icon: '/img/logo.svg',
                        badge: '/img/logo.svg',
                        tag: 'new-order',
                        requireInteraction: true
                    });
                }
                
                // تحديث قائمة الطلبات
                setTimeout(() => {
                    loadOrders();
                }, 1000);
            });
            
            console.log('Notifications listener initialized for admin');
        } catch (error) {
            console.error('Error initializing notifications listener:', error);
        }
    }
}

/** التبديل بين تبويبي الطلبات ورسائل الاتصال والطلبات المنجزة */
function showTab(tabName) {
    console.log('🔀 التبديل إلى التبويب:', tabName);
    const ordersTab = document.getElementById('ordersTab');
    const contactsTab = document.getElementById('contactsTab');
    const completedTab = document.getElementById('completedTab');
    const ordersContent = document.getElementById('ordersTabContent');
    const contactsContent = document.getElementById('contactsTabContent');
    const completedContent = document.getElementById('completedTabContent');

    if (tabName === 'orders') {
        console.log('📦 عرض جميع الطلبات');
        ordersTab.classList.add('active');
        contactsTab.classList.remove('active');
        completedTab.classList.remove('active');
        ordersContent.style.display = 'block';
        contactsContent.style.display = 'none';
        completedContent.style.display = 'none';
    } else if (tabName === 'contacts') {
        console.log('📧 عرض رسائل الاتصال');
        contactsTab.classList.add('active');
        ordersTab.classList.remove('active');
        completedTab.classList.remove('active');
        contactsContent.style.display = 'block';
        ordersContent.style.display = 'none';
        completedContent.style.display = 'none';
        loadContacts();
    } else if (tabName === 'completed') {
        console.log('✅ عرض الطلبات المنجزة والمدفوعة');
        completedTab.classList.add('active');
        ordersTab.classList.remove('active');
        contactsTab.classList.remove('active');
        completedContent.style.display = 'block';
        ordersContent.style.display = 'none';
        contactsContent.style.display = 'none';
        loadCompletedOrders();
    }
}

/** جلب الطلبات المنجزة والمدفوعة وعرضها */
async function loadCompletedOrders() {
    const orders = await getOrders();
    console.log('📋 LoadCompletedOrders - جميع الطلبات:', orders);
    // عرض الطلبات المسلمة فقط (التي تم تسليمها)
    const completedOrders = orders.filter(o => (o.deliveryStatus || 'pending') === 'sent');
    console.log('✅ الطلبات المسلمة:', completedOrders);
    
    const wrapper = document.getElementById('completedTableWrapper');
    if (!wrapper) {
        console.error('❌ completedTableWrapper element not found');
        return;
    }
    
    if (!completedOrders || completedOrders.length === 0) {
        wrapper.innerHTML = '<div class="no-orders">لم تتم أي طلبات بعد - تأكد من وجود طلبات بحالة الدفع = paid</div>';
        console.warn('⚠️ لا توجد طلبات مكتملة - تحقق من حالة الدفع في قاعدة البيانات');
        return;
    }

    completedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

    // تجميع الطلبات حسب اليوم
    const ordersByDay = {};
    completedOrders.forEach(order => {
        const orderDate = new Date(order.date);
        const dayKey = orderDate.toDateString();
        if (!ordersByDay[dayKey]) ordersByDay[dayKey] = { date: orderDate, orders: [] };
        ordersByDay[dayKey].orders.push(order);
    });

    let html = '';
    Object.keys(ordersByDay).sort((a, b) => new Date(b) - new Date(a)).forEach(dayKey => {
        const dayData = ordersByDay[dayKey];
        const dayName = getDayName(dayData.date);
        const dateStr = dayData.date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
        const dayOrders = dayData.orders;
        
        // تجميع طلبات نفس العميل
        const groups = {};
        dayOrders.forEach(order => {
            const key = (order.name || '') + '|' + (order.mobile || '');
            if (!groups[key]) groups[key] = { name: order.name, mobile: order.mobile, governorate: order.governorate, center: order.center, address: order.address, orders: [] };
            groups[key].orders.push(order);
        });
        const groupList = Object.values(groups);

        html += `<div class="day-section">
            <h2 class="day-title">يوم ${dayName}</h2>
            <p class="day-subtitle">${dateStr}</p>
            <div class="orders-table-wrapper">
            <table class="orders-table">
            <thead><tr>
                <th>التاريخ</th><th>الاسم</th><th>رقم الموبايل</th><th>رقم الدفع</th><th>المحافظة</th><th>المركز</th><th>العنوان</th>
                <th>المنتجات</th><th>عدد القطع</th><th>المبلغ الكلي</th><th>العربون</th><th>الإجمالي</th>
            </tr></thead><tbody>`;

        groupList.forEach(g => {
            const firstOrder = g.orders[0];
            const lastDate = g.orders.reduce((acc, o) => new Date(o.date) > new Date(acc) ? o.date : acc, g.orders[0].date);
            const dateStr2 = new Date(lastDate).toLocaleString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
            const productsHtml = g.orders.map(o => `عدد ${o.quantity || 1} ${o.productName}`).join('، ');
            const totalQty = g.orders.reduce((s, o) => s + (o.quantity || 0), 0);
            const totalAmount = g.orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
            const totalDeposit = g.orders.reduce((s, o) => s + (o.depositAmount || 0), 0);
            const totalWithDeposit = g.orders.reduce((s, o) => s + (o.totalWithDeposit || o.totalAmount || 0), 0);

            html += `<tr class="payment-paid">
                <td>${dateStr2}</td>
                <td>${firstOrder.name}</td>
                <td>${firstOrder.mobile}</td>
                <td>${firstOrder.paymentPhone || '-'}</td>
                <td>${firstOrder.governorate}</td>
                <td>${firstOrder.center || '-'}</td>
                <td style="max-width:180px;word-wrap:break-word;">${firstOrder.address}</td>
                <td class="products-cell"><div class="products-box">${productsHtml}</div></td>
                <td>${totalQty}</td>
                <td>${totalAmount.toLocaleString('ar-EG')} ج</td>
                <td>${totalDeposit.toLocaleString('ar-EG')} ج</td>
                <td>${totalWithDeposit.toLocaleString('ar-EG')} ج</td>
            </tr>`;
        });

        html += '</tbody></table></div></div>';
    });

    wrapper.innerHTML = html || '<div class="no-orders">لم تتم أي طلبات بعد</div>';
}

/** جلب رسائل الاتصال من Firestore أو localStorage وعرضها */
async function loadContacts() {
    const wrapper = document.getElementById('contactsTableWrapper');
    
    if (!wrapper) {
        console.error('contactsTableWrapper not found');
        return;
    }
    
    wrapper.innerHTML = '<div class="no-orders" style="text-align: center; padding: 40px;">جاري تحميل رسائل الاتصال...</div>';
    
    try {
        let contacts = [];
        
        // محاولة جلب من Firestore
        if (window.db) {
            try {
                console.log('📧 جاري جلب الرسائل من Firestore...');
                const snapshot = await window.db.collection('contacts').orderBy('createdAt', 'desc').get();
                contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log('✅ تم جلب', contacts.length, 'رسالة من Firestore');
            } catch (error) {
                console.error('❌ Error loading contacts from Firestore:', error);
                console.warn('⚠️ سيتم الرجوع إلى localStorage');
                // Fallback إلى localStorage
                const savedContacts = localStorage.getItem('contacts');
                if (savedContacts) {
                    contacts = JSON.parse(savedContacts);
                    console.log('✅ تم جلب', contacts.length, 'رسالة من localStorage');
                }
            }
        } else {
            console.warn('⚠️ Firestore غير متاح - جاري البحث في localStorage');
            // Fallback إلى localStorage
            const savedContacts = localStorage.getItem('contacts');
            if (savedContacts) {
                contacts = JSON.parse(savedContacts);
                console.log('✅ تم جلب', contacts.length, 'رسالة من localStorage');
            }
        }

        if (contacts.length === 0) {
            wrapper.innerHTML = '<div class="no-orders">لا توجد رسائل اتصال حتى الآن - يرجى التأكد من حفظ الرسائل بشكل صحيح</div>';
            console.warn('⚠️ لا توجد رسائل اتصال في Firestore ولا في localStorage');
            return;
        }

        // ترتيب حسب التاريخ (الأحدث أولاً)
        contacts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        let html = '<div class="orders-table-wrapper">';
        html += '<table class="orders-table">';
        html += '<thead><tr>';
        html += '<th>التاريخ</th>';
        html += '<th>الاسم</th>';
        html += '<th>البريد الإلكتروني</th>';
        html += '<th>رقم الهاتف</th>';
        html += '<th>الموضوع</th>';
        html += '<th>الرسالة</th>';
        html += '<th>حذف</th>';
        html += '</tr></thead><tbody>';

        contacts.forEach(contact => {
            const date = contact.createdAt ? new Date(contact.createdAt).toLocaleString('ar-EG', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }) : '-';

            html += `<tr>
                <td>${date}</td>
                <td>${contact.name || '-'}</td>
                <td>${contact.email || '-'}</td>
                <td>${contact.phone || '-'}</td>
                <td>${contact.subject || '-'}</td>
                <td style="max-width: 300px; word-wrap: break-word;">${contact.message || '-'}</td>
                <td>
                    <button class="delete-btn" onclick="deleteContact('${contact.id || contact.name}')" title="حذف الرسالة">
                        حذف
                    </button>
                </td>
            </tr>`;
        });

        html += '</tbody></table></div>';
        wrapper.innerHTML = html;
    } catch (error) {
        wrapper.innerHTML = '<div class="no-orders">حدث خطأ أثناء تحميل رسائل الاتصال</div>';
        console.error('Error loading contacts:', error);
    }
}

/** حذف رسالة اتصال من Firestore أو localStorage */
async function deleteContact(contactId) {
    if (confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
        try {
            // حذف من Firestore
            if (window.db) {
                try {
                    await window.db.collection('contacts').doc(contactId).delete();
                } catch (error) {
                    console.error('Error deleting contact from Firestore:', error);
                    // Fallback إلى localStorage
                    const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
                    const filtered = contacts.filter(c => c.id !== contactId && c.name !== contactId);
                    localStorage.setItem('contacts', JSON.stringify(filtered));
                }
            } else {
                // Fallback إلى localStorage
                const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
                const filtered = contacts.filter(c => c.id !== contactId && c.name !== contactId);
                localStorage.setItem('contacts', JSON.stringify(filtered));
            }
            
            await loadContacts();
        } catch (error) {
            console.error('Error deleting contact:', error);
            alert('حدث خطأ أثناء حذف الرسالة.');
        }
    }
}
