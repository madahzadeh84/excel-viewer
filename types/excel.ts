/**
 * انواع مشترک برای داده‌های استخراج‌شده از فایل اکسل.
 * ساختار جدول کاملاً پویاست و ستون‌ها از روی هدر فایل تشخیص داده می‌شوند.
 */

/** مقدار مجاز هر سلول پس از پارس شدن فایل اکسل. */
export type CellValue = string | number | boolean | null;

/** یک ردیف داده به صورت نگاشت نام ستون به مقدار سلول. */
export type ExcelRow = Record<string, CellValue>;

/** خروجی موفق پارس فایل اکسل. */
export interface ParsedExcel {
  /** نام ستون‌ها به همان ترتیب موجود در فایل. */
  headers: string[];
  /** ردیف‌های داده. */
  rows: ExcelRow[];
  /** متادیتای فایل آپلودشده. */
  meta: FileMeta;
}

/** متادیتای فایل آپلودشده برای نمایش در بخش وضعیت آپلود. */
export interface FileMeta {
  /** نام فایل. */
  name: string;
  /** حجم فایل بر حسب بایت. */
  size: number;
  /** تعداد ردیف‌های داده. */
  rowCount: number;
}

/** انواع نقش ستون برای تشخیص خودکار ستون تاریخ و قیمت. */
export type ColumnRole = "persianDate" | "gregorianDate" | "price" | "generic";

/** نگاشت نقش ستون‌های شناسایی‌شده به کلید واقعی ستون در داده. */
export interface DetectedColumns {
  persianDateKey: string | null;
  gregorianDateKey: string | null;
  priceKey: string | null;
}

/** وضعیت فیلترهای اعمال‌شده روی جدول. */
export interface FilterState {
  /** عبارت جست‌وجوی تاریخ (شمسی یا میلادی). */
  dateQuery: string;
  /** حداقل قیمت (به صورت رشته برای کنترل ورودی). */
  minPrice: string;
  /** حداکثر قیمت (به صورت رشته برای کنترل ورودی). */
  maxPrice: string;
}

/** وضعیت اولیه و خالی فیلترها. */
export const EMPTY_FILTERS: FilterState = {
  dateQuery: "",
  minPrice: "",
  maxPrice: "",
};
