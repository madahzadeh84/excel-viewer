# مشاهده‌گر اکسل | Excel Viewer

یک اپلیکیشن وب مدرن برای آپلود و نمایش تعاملی فایل‌های اکسل، به صورت کاملاً سمت کاربر (Client-Side).

## Features / امکانات

- **آپلود فایل اکسل** — پشتیبانی از فرمت‌های `.xlsx`, `.xls`, `.csv` با قابلیت Drag & Drop
- **نمایش تعاملی جدول** — مرتب‌سازی ستون‌ها، صفحه‌بندی، و اندازه صفحه قابل تنظیم
- **فیلتر هوشمند** — جستجوی تاریخ (شمسی/میلادی) و فیلتر محدوده قیمت دلار
- **تشخیص خودکار ستون‌ها** — شناسایی خودکار ستون‌های تاریخ شمسی، میلادی و قیمت
- **حالت تاریک/روشن** — پشتیبانی از Dark Mode با قابلیت تغییر پوسته
- **رابط کاربری فارسی** — کاملاً به زبان فارسی با پشتیبانی RTL
- **طراحی واکنش‌گرا** — سازگار با تمام اندازه‌های صفحه نمایش
- **بدون نیاز به سرور** — تمام پردازش‌ها در مرورگر کاربر انجام می‌شود

## Tech Stack / فناوری‌ها

| فناوری | نسخه | توضیح |
|--------|------|-------|
| Next.js | 15.x | فریم‌ورک اصلی (App Router) |
| TypeScript | 5.x | زبان برنامه‌نویسی |
| Tailwind CSS | 3.x | فریم‌ورک CSS |
| shadcn/ui | - | کتابخانه کامپوننت |
| TanStack Table | 8.x | جدول تعاملی |
| react-dropzone | 14.x | آپلود فایل با Drag & Drop |
| SheetJS (xlsx) | 0.18.x | پارس فایل‌های اکسل |
| next-themes | 0.4.x | مدیریت Dark/Light Mode |
| Vazirmatn | - | فونت فارسی |
| Lucide React | - | آیکون‌ها |

## Installation / نصب

```bash
# کلون کردن پروژه
git clone <repo-url>
cd excel-viewer

# نصب وابستگی‌ها
npm install

# اجرای محیط توسعه
npm run dev
```

## Running Locally / اجرای محلی

```bash
# اجرای سرور توسعه
npm run dev

# اجرا در پورت دلخواه
npm run dev -- -p 3001
```

پس از اجرا، مرورگر را به آدرس `http://localhost:3000` باز کنید.

## Build / ساخت نسخه Production

```bash
# ساخت نسخه بهینه
npm run build

# اجرای نسخه Production
npm run start
```

## Project Structure / ساختار پروژه

```
excel-viewer/
├── app/
│   ├── globals.css          # متغیرهای CSS و تم‌ها
│   ├── layout.tsx           # لایوت اصلی با ThemeProvider
│   └── page.tsx             # صفحه اصلی اپلیکیشن
├── components/
│   ├── ui/                  # کامپوننت‌های shadcn/ui
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── table.tsx
│   ├── DataTable.tsx        # جدول تعاملی با TanStack Table
│   ├── Filters.tsx          # فیلترهای تاریخ و قیمت
│   ├── ThemeToggle.tsx       # دکمه تغییر پوسته
│   └── UploadArea.tsx       # ناحیه آپلود فایل
├── hooks/                   # هوک‌های سفارشی
├── lib/
│   ├── excel.ts             # منطق پارس فایل اکسل
│   └── utils.ts             # توابع کمکی
├── scripts/
│   └── create-sample.mjs    # اسکریپت ایجاد فایل نمونه
├── types/
│   └── excel.ts             # تعریف نوع‌های TypeScript
├── sample.xlsx              # فایل اکسل نمونه
├── tailwind.config.ts       # پیکربندی Tailwind
├── tsconfig.json            # پیکربندی TypeScript
└── package.json
```

## License / مجوز

MIT
