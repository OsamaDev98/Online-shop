# 🛒 Online Shop — متجر إلكتروني

متجر إلكتروني احترافي مبني بـ **Next.js 16** يدعم اللغة العربية (RTL) مع لوحة تحكم إدارية متكاملة وبوابة دفع Paymob.

---

## ✨ المميزات

- 🛍️ **واجهة متجر** — صفحات المنتجات، الفئات، سلة التسوق، والدفع
- 🔐 **لوحة تحكم الإدارة** — إدارة المنتجات، الفئات، الطلبات، الكوبونات، والشحن
- 💳 **بوابة دفع Paymob** — دعم البطاقات البنكية ومحافظ الهاتف (فودافون كاش)
- 📦 **تتبع الطلبات** — تتبع حالة الطلب برقم الهاتف أو رقم الطلب
- 🌐 **SEO** — بيانات OpenGraph، خريطة الموقع الديناميكية، وملف robots.txt
- 📱 **تصميم متجاوب** — يعمل بسلاسة على الجوال والتابلت والكمبيوتر
- 🌙 **وضع RTL** — دعم كامل للعربية بخط Cairo

---

## 🚀 التشغيل المحلي

### المتطلبات
- Node.js 20+
- npm أو yarn

### خطوات التشغيل

```bash
# 1. تثبيت الاعتماديات
npm install

# 2. إعداد متغيرات البيئة
cp .env.example .env
# ثم عدّل .env بياناتك الفعلية

# 3. إعداد قاعدة البيانات
npx prisma migrate dev
npx prisma db seed

# 4. تشغيل السيرفر المحلي
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

لوحة التحكم: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🗂️ هيكل المشروع

```
src/
├── app/
│   ├── admin/          # لوحة تحكم الإدارة
│   ├── api/            # API Routes
│   ├── cart/           # سلة التسوق
│   ├── checkout/       # صفحة الدفع
│   ├── product/        # صفحة المنتج
│   ├── shop/           # متجر المنتجات
│   └── ...
├── components/         # المكوّنات المشتركة (Navbar, Footer, ...)
├── context/            # React Context (Cart)
└── lib/                # مكتبات مساعدة (Prisma, Auth)
prisma/
├── schema.prisma       # مخطط قاعدة البيانات
├── seed.js             # بيانات تجريبية أولية
└── migrations/         # ترحيلات قاعدة البيانات
public/
├── logo.svg            # الشعار (للخلفيات الفاتحة)
└── logo-white.svg      # الشعار (للخلفيات الداكنة)
```

---

## ⚙️ متغيرات البيئة

انسخ `.env.example` إلى `.env` وأضف بياناتك:

| المتغير | الوصف |
|---|---|
| `DATABASE_URL` | رابط قاعدة البيانات (SQLite أو PostgreSQL) |
| `ADMIN_PASSWORD` | كلمة مرور لوحة التحكم |
| `PAYMOB_API_KEY` | مفتاح API لبوابة Paymob |
| `PAYMOB_INTEGRATION_ID` | معرف تكامل البطاقات |
| `PAYMOB_WALLET_INTEGRATION_ID` | معرف تكامل المحافظ |
| `PAYMOB_IFRAME_ID` | معرف الـ Iframe لنموذج الدفع |
| `PAYMOB_HMAC_SECRET` | سر التحقق من webhook |

---

## 🛠️ التقنيات المستخدمة

| التقنية | الاستخدام |
|---|---|
| [Next.js 16](https://nextjs.org) | إطار العمل الرئيسي |
| [Prisma](https://prisma.io) | ORM لقاعدة البيانات |
| [SQLite](https://sqlite.org) | قاعدة البيانات (للتطوير) |
| [Tailwind CSS](https://tailwindcss.com) | التنسيق |
| [Paymob](https://paymob.com) | بوابة الدفع |

---

## 📄 الترخيص

MIT License
