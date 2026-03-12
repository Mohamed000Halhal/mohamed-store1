# Font Awesome Icons Reference - مرجع الأيقونات

## الأيقونات المستخدمة في لوحة الإدارة

---

## 🎯 الهيدر (Header)

### زر تبديل الثيم
```html
<!-- Light Mode -->
<i class="fas fa-moon"></i>

<!-- Dark Mode -->
<i class="fas fa-sun"></i>
```

### أزرار الإجراءات
```html
<!-- تفعيل الإشعارات -->
<i class="fas fa-bell"></i>

<!-- الطلبات المحذوفة -->
<i class="fas fa-trash-restore"></i>

<!-- حفظ PDF -->
<i class="fas fa-file-pdf"></i>

<!-- تصدير البيانات -->
<i class="fas fa-file-export"></i>

<!-- تسجيل الخروج -->
<i class="fas fa-sign-out-alt"></i>
```

---

## 📑 التبويبات (Tabs)

```html
<!-- الطلبات -->
<i class="fas fa-box"></i>

<!-- رسائل الاتصال -->
<i class="fas fa-envelope"></i>

<!-- الطلبات المنجزة -->
<i class="fas fa-check-circle"></i>
```

---

## 🎬 أزرار الإجراءات (Action Buttons)

### حالة التسليم
```html
<!-- تم التسليم -->
<i class="fas fa-truck"></i>

<!-- لم يتم التسليم -->
<i class="fas fa-times-circle"></i>
```

### عمليات الحذف والاسترجاع
```html
<!-- حذف -->
<i class="fas fa-trash"></i>

<!-- حذف نهائي -->
<i class="fas fa-trash-alt"></i>

<!-- استرجاع -->
<i class="fas fa-undo"></i>
```

### عرض المحتوى
```html
<!-- عرض الصورة -->
<i class="fas fa-image"></i>
```

---

## 💳 أزرار حالة الدفع (Payment Status)

```html
<!-- تم دفع العربون -->
<i class="fas fa-check-circle"></i>

<!-- لم يتم دفع العربون -->
<i class="fas fa-times-circle"></i>

<!-- مدفوع بالكامل -->
<i class="fas fa-check-double"></i>
```

---

## 📊 العدادات الإحصائية (Statistics)

```html
<!-- عدد الزوار -->
<i class="fas fa-users"></i>

<!-- عدد الأجهزة -->
<i class="fas fa-desktop"></i>

<!-- طلبات اليوم -->
<i class="fas fa-calendar-day"></i>

<!-- طلبات الشهر -->
<i class="fas fa-calendar-alt"></i>

<!-- طلبات السنة -->
<i class="fas fa-calendar"></i>

<!-- إجمالي تم تسليمها -->
<i class="fas fa-check-circle"></i>
```

---

## 🔐 نموذج تسجيل الدخول (Login Form)

```html
<!-- أيقونة الأمان الرئيسية -->
<i class="fas fa-user-shield"></i>

<!-- حقل اسم المستخدم -->
<i class="fas fa-user"></i>

<!-- حقل كلمة المرور -->
<i class="fas fa-lock"></i>

<!-- زر تسجيل الدخول -->
<i class="fas fa-sign-in-alt"></i>
```

---

## ✅ شاشة الترحيب (Welcome Screen)

```html
<!-- أيقونة النجاح -->
<i class="fas fa-check-circle"></i>
```

---

## 🎨 أمثلة الاستخدام

### 1. زر بسيط مع أيقونة
```html
<button class="btn">
    <i class="fas fa-save"></i> حفظ
</button>
```

### 2. أيقونة فقط
```html
<button class="icon-btn" title="حذف">
    <i class="fas fa-trash"></i>
</button>
```

### 3. أيقونة مع نص جانبي
```html
<div class="info-item">
    <i class="fas fa-user"></i>
    <span>محمد أحمد</span>
</div>
```

### 4. أيقونة في card
```html
<div class="stat-card">
    <i class="fas fa-box stat-icon"></i>
    <span class="stat-value">150</span>
    <span class="stat-label">طلب جديد</span>
</div>
```

---

## 🔧 التخصيص

### تغيير حجم الأيقونة
```html
<!-- صغير -->
<i class="fas fa-user fa-xs"></i>

<!-- متوسط صغير -->
<i class="fas fa-user fa-sm"></i>

<!-- عادي -->
<i class="fas fa-user"></i>

<!-- كبير -->
<i class="fas fa-user fa-lg"></i>

<!-- أكبر -->
<i class="fas fa-user fa-2x"></i>
<i class="fas fa-user fa-3x"></i>
<i class="fas fa-user fa-5x"></i>
<i class="fas fa-user fa-7x"></i>
<i class="fas fa-user fa-10x"></i>
```

### تغيير اللون
```css
.icon-red {
    color: #F56565;
}

.icon-green {
    color: #48BB78;
}

.icon-blue {
    color: #4299E1;
}
```

```html
<i class="fas fa-check icon-green"></i>
<i class="fas fa-times icon-red"></i>
<i class="fas fa-info icon-blue"></i>
```

### دوران الأيقونة
```html
<!-- دوران 90 درجة -->
<i class="fas fa-shield fa-rotate-90"></i>

<!-- دوران 180 درجة -->
<i class="fas fa-shield fa-rotate-180"></i>

<!-- دوران 270 درجة -->
<i class="fas fa-shield fa-rotate-270"></i>

<!-- قلب أفقي -->
<i class="fas fa-shield fa-flip-horizontal"></i>

<!-- قلب عمودي -->
<i class="fas fa-shield fa-flip-vertical"></i>
```

### أيقونة متحركة (Spinning)
```html
<!-- دوران مستمر -->
<i class="fas fa-spinner fa-spin"></i>

<!-- نبض -->
<i class="fas fa-heart fa-pulse"></i>
```

---

## 📚 أيقونات إضافية مقترحة

### للمستقبل
```html
<!-- الإعدادات -->
<i class="fas fa-cog"></i>
<i class="fas fa-sliders-h"></i>

<!-- البحث -->
<i class="fas fa-search"></i>

<!-- الفلتر -->
<i class="fas fa-filter"></i>

<!-- الترتيب -->
<i class="fas fa-sort"></i>
<i class="fas fa-sort-up"></i>
<i class="fas fa-sort-down"></i>

<!-- الطباعة -->
<i class="fas fa-print"></i>

<!-- المشاركة -->
<i class="fas fa-share-alt"></i>

<!-- التحميل -->
<i class="fas fa-download"></i>

<!-- الرفع -->
<i class="fas fa-upload"></i>

<!-- التحديث -->
<i class="fas fa-sync"></i>

<!-- التحرير -->
<i class="fas fa-edit"></i>
<i class="fas fa-pen"></i>

<!-- العين (إظهار/إخفاء) -->
<i class="fas fa-eye"></i>
<i class="fas fa-eye-slash"></i>

<!-- القفل -->
<i class="fas fa-lock"></i>
<i class="fas fa-unlock"></i>

<!-- النجوم -->
<i class="fas fa-star"></i>
<i class="far fa-star"></i>

<!-- القلب -->
<i class="fas fa-heart"></i>
<i class="far fa-heart"></i>

<!-- العلامة المرجعية -->
<i class="fas fa-bookmark"></i>
<i class="far fa-bookmark"></i>

<!-- السؤال/المساعدة -->
<i class="fas fa-question-circle"></i>
<i class="fas fa-info-circle"></i>

<!-- التنبيه -->
<i class="fas fa-exclamation-triangle"></i>
<i class="fas fa-exclamation-circle"></i>

<!-- الإضافة/الحذف -->
<i class="fas fa-plus"></i>
<i class="fas fa-minus"></i>
<i class="fas fa-plus-circle"></i>
<i class="fas fa-minus-circle"></i>

<!-- السهام -->
<i class="fas fa-arrow-left"></i>
<i class="fas fa-arrow-right"></i>
<i class="fas fa-arrow-up"></i>
<i class="fas fa-arrow-down"></i>

<!-- الشيفرون -->
<i class="fas fa-chevron-left"></i>
<i class="fas fa-chevron-right"></i>
<i class="fas fa-chevron-up"></i>
<i class="fas fa-chevron-down"></i>

<!-- القائمة -->
<i class="fas fa-bars"></i>
<i class="fas fa-ellipsis-v"></i>
<i class="fas fa-ellipsis-h"></i>

<!-- المستخدم -->
<i class="fas fa-user"></i>
<i class="fas fa-user-circle"></i>
<i class="fas fa-users"></i>

<!-- المنزل -->
<i class="fas fa-home"></i>

<!-- الرسالة -->
<i class="fas fa-envelope"></i>
<i class="far fa-envelope"></i>
<i class="fas fa-comment"></i>
<i class="far fa-comment"></i>

<!-- الهاتف -->
<i class="fas fa-phone"></i>
<i class="fas fa-mobile-alt"></i>

<!-- الموقع -->
<i class="fas fa-map-marker-alt"></i>

<!-- الوقت -->
<i class="fas fa-clock"></i>
<i class="far fa-clock"></i>

<!-- المال -->
<i class="fas fa-dollar-sign"></i>
<i class="fas fa-money-bill-wave"></i>
<i class="fas fa-credit-card"></i>

<!-- التسوق -->
<i class="fas fa-shopping-cart"></i>
<i class="fas fa-shopping-bag"></i>

<!-- المتجر -->
<i class="fas fa-store"></i>

<!-- السحابة -->
<i class="fas fa-cloud"></i>
<i class="fas fa-cloud-upload-alt"></i>
<i class="fas fa-cloud-download-alt"></i>
```

---

## 🔗 روابط مفيدة

### المصادر الرسمية
- [Font Awesome Official](https://fontawesome.com/)
- [Font Awesome Icons Gallery](https://fontawesome.com/icons)
- [Font Awesome Cheatsheet](https://fontawesome.com/cheatsheet)

### أدوات البحث
- [Font Awesome Icon Search](https://fontawesome.com/search)
- يمكن البحث بالكلمات المفتاحية بالإنجليزية

### التوثيق
- [Font Awesome Docs](https://fontawesome.com/docs)
- [Font Awesome Styling](https://fontawesome.com/docs/web/style/styling)
- [Font Awesome Animations](https://fontawesome.com/docs/web/style/animate)

---

## 💡 نصائح

### 1. الوصول (Accessibility)
عند استخدام أيقونات بدون نص، أضف `aria-label` أو `title`:
```html
<button aria-label="حذف" title="حذف">
    <i class="fas fa-trash"></i>
</button>
```

### 2. الأيقونات الديكورية
إذا كانت الأيقونة ديكورية فقط (يوجد نص بجانبها)، أضف `aria-hidden`:
```html
<button>
    <i class="fas fa-save" aria-hidden="true"></i>
    حفظ
</button>
```

### 3. الحجم المناسب
- الأزرار الصغيرة: 0.9rem - 1rem
- الأزرار العادية: 1rem - 1.2rem
- العدادات: 1.2rem - 1.5rem
- الشعارات: 2rem - 5rem

### 4. التباين
تأكد من وجود تباين كافٍ بين لون الأيقونة والخلفية.

---

**CDN المستخدم:**
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
```

**الإصدار:** Font Awesome 6.5.1  
**آخر تحديث:** 2026-02-08
