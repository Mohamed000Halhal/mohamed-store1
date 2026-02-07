// أسعار المنتجات
const PRODUCTS = {
    'stove': { name: 'الموقد المنزلي', price: 2600, image: 'img/oil-cooker.jpg' },
    'heater': { name: 'دفايه', price: 2900, image: 'img/farm-heater.jpg' },
    'gas-heater': { name: 'دفاية غاز', price: 3400, image: 'img/gas_heater.jpg.jpg' },
    'oven': { name: 'فرن بلدي', price: 2400, image: 'img/rural-oven.jpg' }
};

const DEPOSIT = 200;

// المراكز لكل محافظة
const CENTERS_BY_GOVERNORATE = {
    'القاهرة': ['وسط القاهرة', 'شرق القاهرة', 'غرب القاهرة', 'شمال القاهرة', 'جنوب القاهرة', 'المعادي', 'المقطم', 'مدينة نصر', 'الزيتون', 'شبرا', 'حدائق القبة', 'العباسية', 'الزاوية الحمراء', 'الساحل', 'الوايلي'],
    'الجيزة': ['الجيزة', 'السادس من أكتوبر', 'الشيخ زايد', 'البدرشين', 'الصف', 'أطفيح', 'العياط', 'الباويطي', 'منشأة القناطر', 'أوسيم', 'كرداسة', 'أبو النمرس'],
    'الإسكندرية': ['الإسكندرية', 'برج العرب', 'برج العرب الجديدة', 'العجمي', 'المعمورة', 'المنتزه', 'سيدي بشر', 'سيدي جابر', 'الرمل', 'الجمرك', 'الأنفوشي', 'المكس', 'الدخيلة'],
    'الدقهلية': ['المنصورة', 'طلخا', 'ميت غمر', 'دكرنس', 'أجا', 'منية النصر', 'السنبلاوين', 'بلقاس', 'شربين', 'المطرية', 'الجمالية', 'المنزلة', 'تمي الأمديد', 'نبروه', 'قرى المنصورة'],
    'البحيرة': ['دمنهور', 'كفر الدوار', 'رشيد', 'إدكو', 'أبو المطامير', 'أبو حمص', 'الدلنجات', 'المحمودية', 'الرحمانية', 'شبراخيت', 'وادي النطرون', 'النوبارية', 'حوش عيسى', 'كوم حمادة'],
    'الفيوم': ['الفيوم', 'طامية', 'سنورس', 'إطسا', 'يوسف الصديق', 'أبشواي', 'قحافة', 'الحادقة', 'السيالة'],
    'الغربية': ['طنطا', 'المحلة الكبرى', 'كفر الزيات', 'زفتى', 'سمنود', 'بسيون', 'قطور', 'بركة السبع', 'شبرا الخيمة'],
    'المنيا': ['المنيا', 'ملوي', 'أبو قرقاص', 'مغاغة', 'بني مزار', 'مطاي', 'سمالوط', 'دير مواس', 'العدوة', 'مطروح'],
    'القليوبية': ['بنها', 'قليوب', 'شبرا الخيمة', 'الخانكة', 'كفر شكر', 'طوخ', 'قها', 'العبور', 'شبين القناطر'],
    'أسيوط': ['أسيوط', 'أبو تيج', 'الغنايم', 'ساحل سليم', 'البداري', 'صدفا', 'ديروط', 'القوصية', 'منفلوط', 'أبنوب'],
    'سوهاج': ['سوهاج', 'أخميم', 'البلينا', 'المراغة', 'المنشأة', 'طهطا', 'طما', 'جرجا', 'دار السلام', 'جهينة'],
    'الشرقية': ['الزقازيق', 'أبو كبير', 'فاقوس', 'منيا القمح', 'بلبيس', 'مشتول السوق', 'كفر صقر', 'أولاد صقر', 'الحسينية', 'صان الحجر', 'ههيا', 'أبو حماد', 'الإبراهيمية', 'ديرب نجم'],
    'كفر الشيخ': ['كفر الشيخ', 'دسوق', 'فوه', 'مطوبس', 'البرلس', 'بيلا', 'الحامول', 'سيدي سالم', 'قلين', 'الرياض'],
    'المنوفية': ['شبين الكوم', 'منوف', 'أشمون', 'الباجور', 'قويسنا', 'بركة السبع', 'تلا', 'الشهداء', 'السادات'],
    'قنا': ['قنا', 'قوص', 'نجع حمادي', 'دشنا', 'فرشوط', 'أبو تشت', 'الوقف', 'نقادة', 'قفط'],
    'بني سويف': ['بني سويف', 'الواسطي', 'ناصر', 'إهناسيا', 'ببا', 'سمسطا', 'الفشن', 'مطوبس'],
    'أسوان': ['أسوان', 'كوم أمبو', 'دراو', 'إدفو', 'نصر النوبة', 'كلابشة', 'الرديسية'],
    'الأقصر': ['الأقصر', 'إسنا', 'الطود', 'الزينية', 'أرمنت', 'بياضة العرب'],
    'الإسماعيلية': ['الإسماعيلية', 'فايد', 'القنطرة شرق', 'القنطرة غرب', 'أبو صوير', 'التل الكبير'],
    'السويس': ['السويس', 'الأربعين', 'فيصل', 'عتاقة'],
    'بورسعيد': ['بورسعيد', 'بورفؤاد', 'الضاحية', 'المناخ'],
    'دمياط': ['دمياط', 'فارسكور', 'الزرقا', 'كفر البطيخ', 'روض البر', 'السرو'],
    'شمال سيناء': ['العريش', 'الشيخ زويد', 'رفح', 'بئر العبد', 'الحسنة', 'نخل'],
    'جنوب سيناء': ['الطور', 'شرم الشيخ', 'دهب', 'نويبع', 'طابا', 'رأس سدر', 'أبو رديس', 'أبو زنيمة', 'سانت كاترين'],
    'البحر الأحمر': ['الغردقة', 'رأس غارب', 'سفاجا', 'القصير', 'مرسى علم', 'شلاتين', 'حلايب'],
    'الوادي الجديد': ['الخارجة', 'الداخلة', 'الفرافرة', 'باريس', 'بلاط'],
    'مطروح': ['مرسى مطروح', 'الحمام', 'العلمين', 'الضبعة', 'سيدي براني', 'السلوم', 'سيوة']
};

// تحديث المراكز بناءً على المحافظة المختارة
function updateCenters() {
    const governorateSelect = document.getElementById('governorate');
    const centerSelect = document.getElementById('center');
    const selectedGovernorate = governorateSelect.value;

    // مسح المراكز الحالية
    centerSelect.innerHTML = '';

    if (selectedGovernorate && CENTERS_BY_GOVERNORATE[selectedGovernorate]) {
        // تفعيل القائمة وإضافة المراكز
        centerSelect.disabled = false;
        centerSelect.innerHTML = '<option value="">-- اختر المركز --</option>';
        
        CENTERS_BY_GOVERNORATE[selectedGovernorate].forEach(center => {
            const option = document.createElement('option');
            option.value = center;
            option.textContent = center;
            centerSelect.appendChild(option);
        });
    } else {
        // تعطيل القائمة إذا لم يتم اختيار محافظة
        centerSelect.disabled = true;
        centerSelect.innerHTML = '<option value="">-- اختر المحافظة أولاً --</option>';
    }
}

// تحويل الصورة إلى base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// تحديث ملخص السعر وعرض الصورة
function updatePriceSummary() {
    const productSelect = document.getElementById('product');
    const quantityInput = document.getElementById('quantity');
    const priceSummary = document.getElementById('priceSummary');
    const productImageContainer = document.getElementById('productImageContainer');
    const productImage = document.getElementById('productImage');

    const productKey = productSelect.value;
    const quantity = parseInt(quantityInput.value) || 0;

    // عرض صورة المنتج
    if (productKey) {
        const product = PRODUCTS[productKey];
        if (product && product.image) {
            productImage.src = product.image;
            productImage.alt = product.name;
            productImageContainer.style.display = 'block';
        } else {
            productImageContainer.style.display = 'none';
        }
    } else {
        productImageContainer.style.display = 'none';
    }

    if (productKey && quantity > 0) {
        const product = PRODUCTS[productKey];
        const unitPrice = product.price;
        const totalAmount = quantity * unitPrice;
        const depositAmount = quantity * DEPOSIT; // العربون على كل قطعة
        const totalWithDeposit = totalAmount + depositAmount; // المبلغ الإجمالي = المبلغ الكلي + العربون

        document.getElementById('unitPrice').textContent = unitPrice.toLocaleString('ar-EG');
        document.getElementById('summaryQuantity').textContent = quantity;
        document.getElementById('totalAmount').textContent = totalAmount.toLocaleString('ar-EG');
        document.getElementById('depositAmount').textContent = depositAmount.toLocaleString('ar-EG');
        document.getElementById('totalWithDeposit').textContent = totalWithDeposit.toLocaleString('ar-EG');

        priceSummary.style.display = 'block';
    } else {
        priceSummary.style.display = 'none';
    }
}

// إضافة مستمعي الأحداث
document.addEventListener('DOMContentLoaded', () => {
    // الانتظار حتى يتم تحميل Firebase
    const checkFirebase = setInterval(() => {
        if (window.db || window.ordersService) {
            clearInterval(checkFirebase);
            initializeForm();
        }
    }, 100);

    // إلغاء الانتظار بعد 5 ثوان
    setTimeout(() => {
        clearInterval(checkFirebase);
        if (!window.db && !window.ordersService) {
            console.warn('Firebase may not be loaded, using localStorage fallback');
        }
        initializeForm();
    }, 5000);
});

let formInitialized = false;

function initializeForm() {
    if (formInitialized) {
        return; // تم التهيئة بالفعل
    }

    const productSelect = document.getElementById('product');
    const quantityInput = document.getElementById('quantity');
    const orderForm = document.getElementById('orderForm');
    const governorateSelect = document.getElementById('governorate');

    // إذا كانت العناصر غير موجودة (مثل في صفحة checkout)، خروج بدون خطأ
    if (!productSelect || !quantityInput || !orderForm || !governorateSelect) {
        // هذا طبيعي على صفحات أخرى مثل checkout.html
        return;
    }

    productSelect.addEventListener('change', updatePriceSummary);
    quantityInput.addEventListener('input', updatePriceSummary);
    governorateSelect.addEventListener('change', updateCenters);
    
    formInitialized = true;

    // معالجة إرسال النموذج
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value.trim(),
            mobile: document.getElementById('mobile').value.trim(),
            governorate: document.getElementById('governorate').value,
            center: document.getElementById('center').value,
            product: document.getElementById('product').value,
            quantity: document.getElementById('quantity').value,
            address: document.getElementById('address').value.trim(),
            paymentPhone: document.getElementById('paymentPhone').value.trim(),
            depositScreenshot: null // سيتم ملؤها لاحقاً
        };

        const fromCartMulti = orderForm.dataset.fromCart === 'multi';
        const cart = window.cartService ? window.cartService.getCart() : [];

        // التحقق من البيانات (بيانات العميل مطلوبة دائماً)
        if (!formData.name || !formData.mobile || !formData.governorate || !formData.center || !formData.address || !formData.paymentPhone) {
            showMessage('يرجى ملء جميع الحقول', 'error');
            return;
        }

        // التحقق من الصورة
        const depositScreenshotInput = document.getElementById('depositScreenshot');
        if (!depositScreenshotInput || !depositScreenshotInput.files || depositScreenshotInput.files.length === 0) {
            showMessage('يرجى اختيار صورة العربون', 'error');
            return;
        }

        const depositFile = depositScreenshotInput.files[0];
        if (!depositFile.type.startsWith('image/')) {
            showMessage('يجب أن يكون الملف صورة', 'error');
            return;
        }

        if (depositFile.size > 5 * 1024 * 1024) { // 5MB max
            showMessage('حجم الصورة كبير جداً (الحد الأقصى: 5MB)', 'error');
            return;
        }

        // طلب من السلة (عدة منتجات): نستخدم محتويات السلة
        if (fromCartMulti && cart.length > 0) {
            // تحويل الصورة إلى base64
            try {
                formData.depositScreenshot = await fileToBase64(depositFile);
            } catch (error) {
                showMessage('حدث خطأ في قراءة الصورة. يرجى المحاولة مرة أخرى.', 'error');
                return;
            }

            let ordersService = window.ordersService;
            if (!ordersService && typeof createOrdersService === 'function') {
                createOrdersService(window);
                ordersService = window.ordersService;
            }
            if (!ordersService) {
                showMessage('خدمة الطلبات غير متاحة حالياً. يرجى المحاولة لاحقاً.', 'error');
                return;
            }

            const generateId = () => (window.crypto?.randomUUID ? window.crypto.randomUUID() : Date.now().toString());

            const submitBtn = orderForm.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'جاري الإرسال...';
            submitBtn.disabled = true;

            try {
                for (const item of cart) {
                    const quantityNum = item.quantity;
                    const unitPrice = item.price;
                    const totalAmount = item.price * item.quantity;
                    const depositAmount = quantityNum * DEPOSIT;
                    const priceAfterDeposit = totalAmount - depositAmount;
                    const totalWithDeposit = totalAmount + depositAmount;

                    const order = {
                        id: generateId(),
                        name: formData.name,
                        mobile: formData.mobile,
                        governorate: formData.governorate,
                        center: formData.center,
                        productName: item.productName,
                        productKey: item.productKey,
                        quantity: quantityNum,
                        address: formData.address,
                        paymentPhone: formData.paymentPhone,
                        depositScreenshot: formData.depositScreenshot,
                        unitPrice: unitPrice,
                        totalAmount: totalAmount,
                        depositAmount: depositAmount,
                        priceAfterDeposit: priceAfterDeposit,
                        totalWithDeposit: totalWithDeposit,
                        date: new Date().toISOString(),
                        status: 'pending',
                        deliveryStatus: 'pending',
                        paymentStatus: 'pending'
                    };
                    await ordersService.saveOrder(order);
                    if (window.notificationService && typeof window.notificationService.sendNewOrderNotification === 'function') {
                        try { await window.notificationService.sendNewOrderNotification(order); } catch (err) { console.error(err); }
                    }
                }

                showMessage('تم إرسال الطلب بنجاح! شكراً لك', 'success');
                if (window.cartService) window.cartService.clearCart();
                resetOrderFormAndHide(orderForm);
            } catch (error) {
                console.error('Failed to save orders:', error);
                showMessage(error.message || 'حدث خطأ أثناء حفظ الطلب. يرجى المحاولة مرة أخرى.', 'error');
            }
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
        }

        // طلب منتج واحد (من النموذج أو سلة فيها منتج واحد)
        if (!formData.product || !formData.quantity) {
            showMessage('يرجى ملء جميع الحقول', 'error');
            return;
        }

        const productInfo = PRODUCTS[formData.product];
        if (!productInfo) {
            showMessage('المنتج غير صحيح', 'error');
            return;
        }

        const quantityNum = parseInt(formData.quantity);
        if (isNaN(quantityNum) || quantityNum <= 0) {
            showMessage('عدد القطع غير صحيح', 'error');
            return;
        }

        // تحويل الصورة إلى base64
        try {
            formData.depositScreenshot = await fileToBase64(depositFile);
        } catch (error) {
            showMessage('حدث خطأ في قراءة الصورة. يرجى المحاولة مرة أخرى.', 'error');
            return;
        }

        const unitPrice = productInfo.price;
        const totalAmount = quantityNum * unitPrice;
        const depositAmount = quantityNum * DEPOSIT;
        const priceAfterDeposit = totalAmount - depositAmount;
        const totalWithDeposit = totalAmount + depositAmount;

        let ordersService = window.ordersService;
        if (!ordersService && typeof createOrdersService === 'function') {
            createOrdersService(window);
            ordersService = window.ordersService;
        }
        if (!ordersService) {
            showMessage('خدمة الطلبات غير متاحة حالياً. يرجى المحاولة لاحقاً.', 'error');
            return;
        }

        const generateId = () => (window.crypto?.randomUUID ? window.crypto.randomUUID() : Date.now().toString());
        const order = {
            id: generateId(),
            name: formData.name,
            mobile: formData.mobile,
            governorate: formData.governorate,
            center: formData.center,
            productName: productInfo.name,
            productKey: formData.product,
            quantity: quantityNum,
            address: formData.address,
            paymentPhone: formData.paymentPhone,
            depositScreenshot: formData.depositScreenshot,
            unitPrice: unitPrice,
            totalAmount: totalAmount,
            depositAmount: depositAmount,
            priceAfterDeposit: priceAfterDeposit,
            totalWithDeposit: totalWithDeposit,
            date: new Date().toISOString(),
            status: 'pending',
            deliveryStatus: 'pending',
            paymentStatus: 'pending'
        };

        try {
            const submitBtn = orderForm.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'جاري الإرسال...';
            submitBtn.disabled = true;

            await ordersService.saveOrder(order);
            if (window.notificationService && typeof window.notificationService.sendNewOrderNotification === 'function') {
                try { await window.notificationService.sendNewOrderNotification(order); } catch (err) { console.error(err); }
            }
            showMessage('تم إرسال الطلب بنجاح! شكراً لك', 'success');
            if (window.cartService) window.cartService.clearCart();
            resetOrderFormAndHide(orderForm);

            const productSelect = document.getElementById('product');
            const quantityInput = document.getElementById('quantity');
            if (productSelect) { productSelect.disabled = false; productSelect.style.backgroundColor = ''; productSelect.style.cursor = ''; }
            if (quantityInput) { quantityInput.readOnly = false; quantityInput.style.backgroundColor = ''; quantityInput.style.cursor = ''; }

            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        } catch (error) {
            console.error('Failed to save order:', error);
            showMessage(error.message || 'حدث خطأ أثناء حفظ الطلب. يرجى المحاولة مرة أخرى.', 'error');
            const submitBtn = orderForm.querySelector('.submit-btn');
            submitBtn.disabled = false;
            submitBtn.textContent = 'إرسال الطلب';
        }
    });
}

function resetOrderFormAndHide(orderForm) {
    if (!orderForm) return;
    orderForm.reset();
    delete orderForm.dataset.fromCart;
    const priceSummary = document.getElementById('priceSummary');
    if (priceSummary) priceSummary.style.display = 'none';
    const singleProductGroup = document.getElementById('singleProductGroup');
    const cartOrderSummary = document.getElementById('cartOrderSummary');
    if (singleProductGroup) singleProductGroup.style.display = 'block';
    if (cartOrderSummary) cartOrderSummary.style.display = 'none';
    const productSelect = document.getElementById('product');
    if (productSelect) productSelect.setAttribute('required', 'required');
    const orderHeader = document.getElementById('orderHeader');
    if (orderHeader) orderHeader.style.display = 'none';
    orderForm.style.display = 'none';
}

// عرض الرسالة
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    // إخفاء الرسالة بعد 5 ثوان
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// إضافة المنتج للسلة
function addToCartFromForm() {
    const productSelect = document.getElementById('product');
    const quantityInput = document.getElementById('quantity');

    if (!productSelect || !quantityInput) {
        showMessage('يرجى ملء جميع الحقول', 'error');
        return;
    }

    const productKey = productSelect.value;
    const quantity = parseInt(quantityInput.value);

    if (!productKey) {
        showMessage('يرجى اختيار منتج', 'error');
        return;
    }

    if (!quantity || quantity < 1) {
        showMessage('يرجى إدخال عدد صحيح', 'error');
        return;
    }

    const productInfo = PRODUCTS[productKey];
    if (!productInfo) {
        showMessage('المنتج غير صحيح', 'error');
        return;
    }

    if (window.cartService) {
        window.cartService.addToCart(productKey, productInfo.name, productInfo.price, quantity);
        showMessage(`تم إضافة ${quantity} من ${productInfo.name} إلى السلة!`, 'success');
        
        // مسح الكمية
        quantityInput.value = '';
    } else {
        showMessage('خدمة السلة غير متاحة', 'error');
    }
}

// عرض المنتجات في الصفحة الرئيسية
function renderProducts() {
    try {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;

        let html = '';
        for (const [key, product] of Object.entries(PRODUCTS)) {
            const nameEsc = (product.name || '').replace(/'/g, "\\'");
            html += `
            <div class="product-card">
                <div class="product-image-wrapper">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.price.toLocaleString('ar-EG')} جنيه</p>
                    <button class="add-to-cart-product-btn" onclick="addProductToCart('${key}', '${nameEsc}', ${product.price})">
                        🛒 أضف للسلة
                    </button>
                </div>
            </div>
            `;
        }
        productsGrid.innerHTML = html;
    } catch (e) {
        console.error('renderProducts error:', e);
        const grid = document.getElementById('productsGrid');
        if (grid) grid.innerHTML = '<p class="text-center text-muted py-5">عذراً، حدث خطأ في تحميل المنتجات. <a href="index.html">حدّث الصفحة</a>.</p>';
    }
}

// إضافة منتج للسلة من بطاقة المنتج
function addProductToCart(productKey, productName, price) {
    const name = (productName || '').replace(/\\'/g, "'");
    if (window.cartService) {
        window.cartService.addToCart(productKey, name, price, 1);
        showMessage(`تم إضافة ${name} إلى السلة!`, 'success');
    } else {
        showMessage('خدمة السلة غير متاحة', 'error');
    }
}

// ملء قائمة المحافظات
function populateGovernorates() {
    const governorateSelect = document.getElementById('governorate');
    if (!governorateSelect) return;
    Object.keys(CENTERS_BY_GOVERNORATE).forEach(gov => {
        const option = document.createElement('option');
        option.value = gov;
        option.textContent = gov;
        governorateSelect.appendChild(option);
    });
}

// تهيئة الصفحة الرئيسية: المنتجات + المحافظات + أزرار السلة
document.addEventListener('DOMContentLoaded', function() {
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) addToCartBtn.addEventListener('click', addToCartFromForm);

    renderProducts();
    populateGovernorates();
});
