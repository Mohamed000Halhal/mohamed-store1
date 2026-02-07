// cart-service.js
// خدمة سلة التسوق - نسخة مبسطة

(function createCartService(windowObj) {
    const CART_STORAGE_KEY = 'shopping_cart';
    let cart = [];

    // تحميل السلة من localStorage
    function loadCart() {
        try {
            const savedCart = localStorage.getItem(CART_STORAGE_KEY);
            if (savedCart) {
                cart = JSON.parse(savedCart);
            } else {
                cart = [];
            }
            updateCartUI();
        } catch (error) {
            console.error('Error loading cart:', error);
            cart = [];
        }
    }

    // حفظ السلة في localStorage
    function saveCart() {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
            updateCartUI();
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    // إضافة منتج للسلة
    function addToCart(productKey, productName, price, quantity = 1) {
        const existingItem = cart.find(item => item.productKey === productKey);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                productKey: productKey,
                productName: productName,
                price: price,
                quantity: quantity
            });
        }
        
        saveCart();
        return cart;
    }

    // إزالة منتج من السلة
    function removeFromCart(productKey) {
        cart = cart.filter(item => item.productKey !== productKey);
        saveCart();
        return cart;
    }

    // تحديث كمية منتج
    function updateQuantity(productKey, quantity) {
        const item = cart.find(item => item.productKey === productKey);
        if (item) {
            if (quantity <= 0) {
                removeFromCart(productKey);
            } else {
                item.quantity = quantity;
                saveCart();
            }
        }
        return cart;
    }

    // الحصول على السلة
    function getCart() {
        return cart;
    }

    // مسح السلة
    function clearCart() {
        cart = [];
        saveCart();
        return cart;
    }

    // حساب الإجمالي
    function getTotal() {
        return cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    // حساب عدد العناصر
    function getItemCount() {
        return cart.reduce((count, item) => {
            return count + item.quantity;
        }, 0);
    }

    // تحديث واجهة السلة
    function updateCartUI() {
        const cartBadge = document.getElementById('cartBadge');
        if (cartBadge) {
            const count = getItemCount();
            cartBadge.textContent = count;
            cartBadge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    // عرض نافذة السلة
    function showCartModal() {
        const modal = document.getElementById('cartModal');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            renderCartModal();
        }
    }

    // إغلاق نافذة السلة
    function closeCartModal() {
        const modal = document.getElementById('cartModal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
        }
    }

    // عرض محتوى السلة (للعرض البسيط فقط)
    function renderCartModal() {
        const cartItems = document.getElementById('cartItems');
        
        if (!cartItems) return;

        if (cart.length === 0) {
            cartItems.innerHTML = '<div style="text-align: center; padding: 40px;"><p style="font-size: 1.2em; color: #666; margin-bottom: 20px;">🛒 السلة فارغة</p><p style="color: #999;">أضف منتجات من صفحة الخدمات</p></div>';
            return;
        }

        let html = '';
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            html += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4 style="margin: 0 0 10px 0; color: #333; font-size: 1.2em;">${item.productName}</h4>
                        <p style="margin: 5px 0; color: #666;">السعر الوحدة: ${item.price.toLocaleString('ar-EG')} جنيه</p>
                        <p style="margin: 5px 0; color: #666;">الكمية: ${item.quantity}</p>
                        <p style="margin: 10px 0 0 0; color: #333; font-size: 1.1em; font-weight: bold;">الإجمالي: ${itemTotal.toLocaleString('ar-EG')} جنيه</p>
                    </div>
                    <div class="cart-item-actions">
                        <div class="quantity-controls">
                            <button class="qty-btn" onclick="cartService.updateQuantity('${item.productKey}', ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''} title="تقليل">-</button>
                            <span class="qty-value">${item.quantity}</span>
                            <button class="qty-btn" onclick="cartService.updateQuantity('${item.productKey}', ${item.quantity + 1})" title="زيادة">+</button>
                        </div>
                        <button class="remove-btn" onclick="if(confirm('هل أنت متأكد من حذف هذا المنتج؟')) cartService.removeFromCart('${item.productKey}')" title="حذف">حذف</button>
                    </div>
                </div>
            `;
        });

        cartItems.innerHTML = html;
    }

    // تحويل السلة إلى طلبات
    function convertCartToOrders() {
        return cart.map(item => ({
            productKey: item.productKey,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.price,
            totalAmount: item.price * item.quantity
        }));
    }

    // تهيئة عند تحميل الصفحة
    loadCart();

    // إضافة معالجات الأحداث
    document.addEventListener('DOMContentLoaded', function() {
        const cartLink = document.getElementById('cartLink');
        const cartClose = document.getElementById('cartClose');

        // توجيه إلى صفحة checkout
        if (cartLink) {
            cartLink.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'checkout.html';
            });
        }

        // إغلاق الـ cart modal
        if (cartClose) {
            cartClose.addEventListener('click', function() {
                closeCartModal();
            });
        }

        // إغلاق عند النقر خارج النافذة
        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            cartModal.addEventListener('click', function(e) {
                if (e.target === cartModal) {
                    closeCartModal();
                }
            });
        }
    });

    windowObj.cartService = {
        addToCart: addToCart,
        removeFromCart: removeFromCart,
        updateQuantity: updateQuantity,
        getCart: getCart,
        clearCart: clearCart,
        getTotal: getTotal,
        getItemCount: getItemCount,
        showCartModal: showCartModal,
        closeCartModal: closeCartModal,
        convertCartToOrders: convertCartToOrders,
        updateCartUI: updateCartUI
    };
})(window);
