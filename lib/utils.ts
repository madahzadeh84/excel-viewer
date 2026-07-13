import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** ادغام کلاس‌های Tailwind با مدیریت تداخل‌ها (الگوی استاندارد shadcn/ui). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** تبدیل حجم فایل از بایت به رشته‌ی خوانا (بایت/کیلوبایت/مگابایت). */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return "۰ بایت";
  const units = ["بایت", "کیلوبایت", "مگابایت", "گیگابایت"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, exponent);
  const rounded = exponent === 0 ? value : Math.round(value * 10) / 10;
  return `${toPersianDigits(rounded)} ${units[exponent]}`;
}

/** قالب‌بندی عدد با جداکننده هزارگان به شکل فارسی. */
export function formatNumber(value: number): string {
  return toPersianDigits(new Intl.NumberFormat("en-US").format(value));
}

/** تبدیل ارقام لاتین یک رشته/عدد به ارقام فارسی برای خوانایی بهتر. */
export function toPersianDigits(input: string | number): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(input).replace(/\d/g, (digit) => persianDigits[Number(digit)] ?? digit);
}

/** تبدیل ارقام فارسی/عربی یک رشته به ارقام لاتین برای پردازش عددی. */
export function toLatinDigits(input: string): string {
  const map: Record<string, string> = {
    "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
    "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
    "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
  };
  return input.replace(/[۰-۹٠-٩]/g, (char) => map[char] ?? char);
}

/**
 * تبدیل ایمن یک مقدار سلول به عدد.
 * ارقام فارسی، جداکننده‌های هزارگان و فاصله‌ها را نادیده می‌گیرد.
 * در صورت نامعتبر بودن، null برمی‌گرداند.
 */
export function parseNumeric(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value !== "string") return null;
  const normalized = toLatinDigits(value)
    .replace(/[,٬\s]/g, "")
    .trim();
  if (normalized === "") return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}
