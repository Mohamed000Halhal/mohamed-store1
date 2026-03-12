# CSS Variables Reference - مرجع متغيرات CSS

## نظام الألوان الكامل

### Light Mode (الوضع النهاري)

#### الألوان الأساسية
```css
--color-primary: #4A5568;        /* رمادي أزرق هادئ - للعناوين والعناصر الرئيسية */
--color-secondary: #5A67D8;      /* بنفسجي هادئ - للأزرار والروابط */
--color-accent: #667EEA;         /* بنفسجي فاتح - للتأكيدات */
```

#### ألوان الحالات
```css
--color-success: #48BB78;        /* أخضر - للنجاح والتأكيد */
--color-warning: #ECC94B;        /* أصفر - للتحذيرات */
--color-error: #F56565;          /* أحمر - للأخطاء */
--color-info: #4299E1;           /* أزرق - للمعلومات */
```

#### الخلفيات
```css
--bg-primary: #F7FAFC;           /* خلفية رئيسية فاتحة جداً */
--bg-secondary: #FFFFFF;         /* خلفية ثانوية بيضاء */
--bg-surface: #FFFFFF;           /* سطح العناصر (cards, modals) */
--bg-elevated: #FFFFFF;          /* عناصر مرفوعة (dropdowns, tooltips) */
--bg-hover: #EDF2F7;             /* خلفية عند التمرير */
```

#### النصوص
```css
--text-primary: #1A202C;         /* نص أساسي داكن */
--text-secondary: #4A5568;       /* نص ثانوي رمادي */
--text-tertiary: #718096;        /* نص ثالثي فاتح */
--text-inverse: #FFFFFF;         /* نص عكسي (على خلفيات داكنة) */
```

#### الحدود
```css
--border-color: #E2E8F0;         /* لون الحدود الفاتح */
--border-color-dark: #CBD5E0;    /* لون الحدود الداكن */
```

#### الظلال
```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);           /* ظل صغير */
--shadow-md: 0 4px 15px rgba(0, 0, 0, 0.1);          /* ظل متوسط */
--shadow-lg: 0 10px 40px rgba(0, 0, 0, 0.15);        /* ظل كبير */
--shadow-xl: 0 20px 60px rgba(0, 0, 0, 0.2);         /* ظل كبير جداً */
```

---

### Dark Mode (الوضع الليلي)

#### الألوان الأساسية
```css
--color-primary: #667EEA;        /* بنفسجي فاتح */
--color-secondary: #7C3AED;      /* بنفسجي داكن */
--color-accent: #9F7AEA;         /* بنفسجي فاتح جداً */
```

#### الخلفيات
```css
--bg-primary: #1A202C;           /* خلفية رئيسية داكنة جداً */
--bg-secondary: #2D3748;         /* خلفية ثانوية رمادية داكنة */
--bg-surface: #2D3748;           /* سطح العناصر */
--bg-elevated: #374151;          /* عناصر مرفوعة */
--bg-hover: #374151;             /* خلفية عند التمرير */
```

#### النصوص
```css
--text-primary: #F7FAFC;         /* نص أساسي فاتح */
--text-secondary: #E2E8F0;       /* نص ثانوي رمادي فاتح */
--text-tertiary: #CBD5E0;        /* نص ثالثي */
--text-inverse: #1A202C;         /* نص عكسي (على خلفيات فاتحة) */
```

#### الحدود
```css
--border-color: #4A5568;         /* لون الحدود */
--border-color-dark: #374151;    /* لون الحدود الداكن */
```

#### الظلال
```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);           /* ظل صغير */
--shadow-md: 0 4px 15px rgba(0, 0, 0, 0.4);          /* ظل متوسط */
--shadow-lg: 0 10px 40px rgba(0, 0, 0, 0.5);         /* ظل كبير */
--shadow-xl: 0 20px 60px rgba(0, 0, 0, 0.6);         /* ظل كبير جداً */
```

---

## متغيرات التوقيت (Transitions)

```css
--transition-fast: 0.15s ease;     /* انتقال سريع للتفاعلات الفورية */
--transition-normal: 0.3s ease;    /* انتقال عادي للتحولات القياسية */
--transition-slow: 0.5s ease;      /* انتقال بطيء للتحولات الملحوظة */
```

---

## كيفية الاستخدام

### في CSS:
```css
.my-element {
    background: var(--bg-surface);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-md);
    transition: all var(--transition-normal);
}

.my-element:hover {
    background: var(--bg-hover);
    box-shadow: var(--shadow-lg);
}
```

### تبديل الثيم (في JavaScript):
```javascript
// تعيين Dark Mode
document.documentElement.setAttribute('data-theme', 'dark');

// تعيين Light Mode
document.documentElement.setAttribute('data-theme', 'light');

// الحصول على الثيم الحالي
const currentTheme = document.documentElement.getAttribute('data-theme');
```

### حفظ الاختيار:
```javascript
// حفظ في localStorage
localStorage.setItem('theme', 'dark');

// قراءة من localStorage
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
```

---

## أمثلة عملية

### 1. زر بسيط
```css
.btn {
    background: var(--color-primary);
    color: var(--text-inverse);
    border: 2px solid var(--border-color);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-normal);
}

.btn:hover {
    background: var(--color-secondary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}
```

### 2. بطاقة (Card)
```css
.card {
    background: var(--bg-surface);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: var(--shadow-md);
}

.card:hover {
    box-shadow: var(--shadow-lg);
}
```

### 3. مدخل نص (Input)
```css
.input {
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 2px solid var(--border-color);
    transition: all var(--transition-fast);
}

.input:focus {
    background: var(--bg-surface);
    border-color: var(--color-secondary);
    box-shadow: 0 0 0 3px rgba(90, 103, 216, 0.1);
}
```

### 4. رسالة نجاح
```css
.success-message {
    background: rgba(72, 187, 120, 0.1);
    color: var(--color-success);
    border: 2px solid var(--color-success);
    border-radius: 6px;
}
```

### 5. رسالة خطأ
```css
.error-message {
    background: rgba(245, 101, 101, 0.1);
    color: var(--color-error);
    border: 2px solid var(--color-error);
    border-radius: 6px;
}
```

---

## نصائح مهمة

### 1. الاتساق
استخدم دائماً CSS Variables بدلاً من القيم المباشرة لضمان الاتساق عبر الثيمات.

❌ **خطأ:**
```css
.element {
    background: #FFFFFF;
    color: #1A202C;
}
```

✅ **صحيح:**
```css
.element {
    background: var(--bg-surface);
    color: var(--text-primary);
}
```

### 2. التباين
تأكد من وجود تباين كافٍ بين النص والخلفية (WCAG AA: 4.5:1 للنص العادي).

### 3. الانتقالات
استخدم متغيرات التوقيت لضمان حركات موحدة:

```css
.element {
    transition: background-color var(--transition-normal),
                transform var(--transition-fast),
                box-shadow var(--transition-normal);
}
```

### 4. الظلال
استخدم الظلال المناسبة حسب مستوى الارتفاع:
- `--shadow-sm`: أزرار، inputs
- `--shadow-md`: cards، modals
- `--shadow-lg`: popovers، tooltips
- `--shadow-xl`: dialogs، overlays

---

## تخصيص الألوان

لتغيير نظام الألوان بالكامل، عدل القيم في `:root` و `[data-theme="dark"]`:

```css
:root {
    /* غيّر هذه القيم لتخصيص الثيم الفاتح */
    --color-primary: #YOUR_COLOR;
    --color-secondary: #YOUR_COLOR;
    /* ... */
}

[data-theme="dark"] {
    /* غيّر هذه القيم لتخصيص الثيم الداكن */
    --color-primary: #YOUR_COLOR;
    --color-secondary: #YOUR_COLOR;
    /* ... */
}
```

---

## أدوات مفيدة

### 1. مولد الألوان
- [Coolors.co](https://coolors.co/) - لتوليد لوحات ألوان متناسقة
- [Paletton](https://paletton.com/) - لإنشاء أنظمة ألوان كاملة

### 2. اختبار التباين
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Contrast Ratio Calculator](https://contrast-ratio.com/)

### 3. مولد الظلال
- [Box Shadow Generator](https://cssgenerator.org/box-shadow-css-generator.html)

---

**آخر تحديث:** 2026-02-08  
**الإصدار:** 2.0.0
