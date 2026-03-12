# Dark Mode Implementation Guide - دليل تطبيق الوضع الليلي

## 🌓 نظرة عامة

تم تطبيق نظام Dark Mode كامل في لوحة الإدارة مع الحفاظ على جميع الوظائف الحالية.

---

## ✨ المميزات

- ✅ تبديل سهل بين Light/Dark Mode
- ✅ حفظ تلقائي للاختيار في localStorage
- ✅ انتقال سلس بين الثيمات (0.3s)
- ✅ تطبيق شامل على جميع العناصر
- ✅ دعم prefers-color-scheme
- ✅ تصميم احترافي ومريح للعين

---

## 🎯 كيفية الاستخدام

### للمستخدم:

1. **تبديل الثيم:**
   - اضغط على زر القمر 🌙 في الهيدر للتبديل إلى Dark Mode
   - اضغط على زر الشمس ☀️ للرجوع إلى Light Mode

2. **الحفظ التلقائي:**
   - اختيارك يتم حفظه تلقائياً
   - عند العودة للموقع، سيتم تطبيق الثيم المحفوظ

---

## 👨‍💻 للمطورين

### البنية الأساسية

#### 1. HTML Structure
```html
<!-- زر التبديل في الهيدر -->
<button class="theme-toggle-btn" id="themeToggle" onclick="toggleTheme()">
    <i class="fas fa-moon"></i>
</button>
```

#### 2. CSS Variables
```css
/* Light Mode (Default) */
:root {
    --bg-primary: #F7FAFC;
    --text-primary: #1A202C;
    /* ... */
}

/* Dark Mode */
[data-theme="dark"] {
    --bg-primary: #1A202C;
    --text-primary: #F7FAFC;
    /* ... */
}
```

#### 3. JavaScript Functions

**تبديل الثيم:**
```javascript
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // تحديث أيقونة الزر
    const icon = document.querySelector('#themeToggle i');
    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}
```

**تحميل الثيم المحفوظ:**
```javascript
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // تحديث أيقونة الزر
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// تطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', loadSavedTheme);
```

---

## 🎨 تخصيص الألوان

### تعديل ألوان Light Mode
عدّل القيم في `:root`:
```css
:root {
    --color-primary: #YOUR_COLOR;
    --bg-primary: #YOUR_COLOR;
    --text-primary: #YOUR_COLOR;
    /* ... */
}
```

### تعديل ألوان Dark Mode
عدّل القيم في `[data-theme="dark"]`:
```css
[data-theme="dark"] {
    --color-primary: #YOUR_COLOR;
    --bg-primary: #YOUR_COLOR;
    --text-primary: #YOUR_COLOR;
    /* ... */
}
```

---

## 🔧 إضافة عنصر جديد يدعم Dark Mode

### الطريقة الصحيحة:
```css
/* استخدم CSS Variables */
.my-new-element {
    background: var(--bg-surface);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}
```

### الطريقة الخاطئة:
```css
/* ❌ لا تستخدم قيم ثابتة */
.my-new-element {
    background: #FFFFFF;
    color: #1A202C;
    border: 1px solid #E2E8F0;
}
```

---

## 🎯 دعم تفضيلات النظام (System Preference)

### إضافة دعم prefers-color-scheme:

```javascript
function initTheme() {
    // التحقق من وجود ثيم محفوظ
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        // استخدام الثيم المحفوظ
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        // استخدام تفضيلات النظام
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = prefersDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
    }
    
    updateThemeIcon();
}

// الاستماع لتغييرات تفضيلات النظام
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        const theme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcon();
    }
});
```

---

## 🎨 تخصيص زر التبديل

### تصميم مختلف:
```css
/* زر مربع */
.theme-toggle-btn {
    border-radius: 8px;
}

/* زر مع نص */
.theme-toggle-btn::after {
    content: attr(data-theme-name);
    margin-right: 8px;
}
```

```html
<button class="theme-toggle-btn" onclick="toggleTheme()" data-theme-name="ليلي">
    <i class="fas fa-moon"></i>
</button>
```

### زر متحرك (Toggle Switch):
```html
<label class="theme-switch">
    <input type="checkbox" id="themeCheckbox" onchange="toggleTheme()">
    <span class="slider">
        <i class="fas fa-sun"></i>
        <i class="fas fa-moon"></i>
    </span>
</label>
```

```css
.theme-switch {
    position: relative;
    width: 60px;
    height: 30px;
}

.theme-switch input {
    display: none;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--bg-surface);
    border: 2px solid var(--border-color);
    border-radius: 30px;
    transition: 0.3s;
}

.slider::before {
    position: absolute;
    content: "";
    height: 22px;
    width: 22px;
    left: 3px;
    bottom: 2px;
    background: var(--color-primary);
    border-radius: 50%;
    transition: 0.3s;
}

input:checked + .slider::before {
    transform: translateX(30px);
}
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: الثيم لا يتغير
**الحل:**
```javascript
// تأكد من تطبيق الثيم على documentElement
document.documentElement.setAttribute('data-theme', 'dark');
// وليس على body
```

### المشكلة: بعض العناصر لا تتأثر بالثيم
**الحل:**
```css
/* تأكد من استخدام CSS Variables */
.element {
    background: var(--bg-surface); /* ✅ */
    /* وليس */
    background: #FFFFFF; /* ❌ */
}
```

### المشكلة: الانتقال بين الثيمات غير سلس
**الحل:**
```css
* {
    transition: background-color 0.3s ease,
                color 0.3s ease,
                border-color 0.3s ease;
}
```

### المشكلة: الثيم لا يُحفظ
**الحل:**
```javascript
// تأكد من الحفظ في localStorage
function toggleTheme() {
    const newTheme = /* ... */;
    localStorage.setItem('theme', newTheme); // ✅
}
```

---

## 📱 الاختبار

### قائمة التحقق:
- ✅ الزر يظهر في الهيدر
- ✅ الأيقونة تتغير عند التبديل
- ✅ جميع العناصر تتأثر بالثيم
- ✅ الثيم يُحفظ في localStorage
- ✅ الثيم يُطبق عند إعادة تحميل الصفحة
- ✅ التباين مناسب في كلا الثيمين
- ✅ الانتقال سلس وبدون تقطع
- ✅ يعمل على جميع المتصفحات
- ✅ يعمل على الموبايل والتابلت

### متصفحات مدعومة:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers

---

## 🎯 أفضل الممارسات

### 1. استخدم CSS Variables دائماً
```css
/* ✅ جيد */
color: var(--text-primary);

/* ❌ سيء */
color: #1A202C;
```

### 2. تأكد من التباين المناسب
استخدم أدوات مثل [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### 3. اختبر كلا الثيمين
تأكد من أن كل العناصر واضحة ومقروءة في Light و Dark Mode

### 4. احترم prefers-reduced-motion
```css
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}
```

---

## 📚 موارد إضافية

### مقالات
- [CSS Variables Guide - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Dark Mode Best Practices](https://web.dev/prefers-color-scheme/)

### أدوات
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Color Palette Generator](https://coolors.co/)
- [Dark Mode Simulator](https://chrome.google.com/webstore/detail/dark-mode/dmghijelimhndkbmpgbldicpogfkceaj)

---

## 🤝 المساهمة

إذا كان لديك اقتراحات لتحسين Dark Mode:
1. اختبر التغييرات في كلا الثيمين
2. تأكد من التباين المناسب
3. اتبع نمط الكود الحالي
4. وثّق التغييرات

---

**الإصدار:** 2.0.0  
**آخر تحديث:** 2026-02-08  
**المطور:** Verdent AI
