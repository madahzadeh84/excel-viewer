import * as XLSX from "xlsx";

import type {
  CellValue,
  DetectedColumns,
  ExcelRow,
  ParsedExcel,
} from "@/types/excel";
import { parseNumeric, toLatinDigits } from "@/lib/utils";

/** پسوندهای مجاز فایل برای آپلود. */
const ALLOWED_EXTENSIONS = [".xlsx", ".xls", ".csv"];

/** خطای اختصاصی پارس فایل با پیام فارسی قابل نمایش به کاربر. */
export class ExcelParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExcelParseError";
  }
}

/** بررسی مجاز بودن پسوند فایل انتخاب‌شده. */
export function hasValidExtension(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/** تبدیل یک مقدار خام سلول به نوع امن CellValue. */
function normalizeCell(value: unknown): CellValue {
  if (value === null || value === undefined) return null;
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

/**
 * پارس فایل اکسل از روی ArrayBuffer.
 * هدرها به صورت خودکار از ردیف اول شیت اول تشخیص داده می‌شوند.
 * در صورت بروز هر خطا، ExcelParseError با پیام فارسی پرتاب می‌شود.
 */
export function parseExcelBuffer(
  buffer: ArrayBuffer,
  meta: { name: string; size: number },
): ParsedExcel {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  } catch {
    throw new ExcelParseError("فرمت فایل معتبر نیست.");
  }

  const firstSheetName = workbook.SheetNames[0];
  const sheet = firstSheetName ? workbook.Sheets[firstSheetName] : undefined;
  if (!sheet) {
    throw new ExcelParseError("فرمت فایل معتبر نیست.");
  }

  const rawMatrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: false,
    defval: null,
  });

  if (rawMatrix.length === 0) {
    throw new ExcelParseError("هیچ داده‌ای پیدا نشد.");
  }

  // ✅ محدوده‌ی واقعی ستون‌ها رو از روی هدر پیدا می‌کنیم:
  // آخرین ستونی که توی ردیف هدر واقعاً مقدار غیرخالی داره.
  const rawHeaderRow = rawMatrix[0] ?? [];
  let lastMeaningfulCol = -1;
  rawHeaderRow.forEach((value, index) => {
    if (value !== null && value !== undefined && String(value).trim() !== "") {
      lastMeaningfulCol = index;
    }
  });

  // اگه اصلاً هدر معتبری پیدا نشد، یعنی فایل خرابه.
  if (lastMeaningfulCol === -1) {
    throw new ExcelParseError("هیچ داده‌ای پیدا نشد.");
  }

  // ✅ همه‌ی ردیف‌ها رو به همون تعداد ستون واقعی برش می‌زنیم
  // (ستون‌های خالی/فانتوم رو کاملاً حذف می‌کنیم)
  const matrix = rawMatrix.map((row) => row.slice(0, lastMeaningfulCol + 1));

  const headerRow = matrix[0] ?? [];
  const headers = buildHeaders(headerRow);

  const rows: ExcelRow[] = matrix.slice(1).reduce<ExcelRow[]>((acc, raw) => {
    const row: ExcelRow = {};
    let hasValue = false;
    headers.forEach((header, index) => {
      const cell = normalizeCell(raw[index]);
      row[header] = cell;
      if (cell !== null && String(cell).trim() !== "") hasValue = true;
    });
    if (hasValue) acc.push(row);
    return acc;
  }, []);

  if (rows.length === 0) {
    throw new ExcelParseError("هیچ داده‌ای پیدا نشد.");
  }

  return {
    headers,
    rows,
    meta: { name: meta.name, size: meta.size, rowCount: rows.length },
  };
}

/** ساخت لیست هدر یکتا و بدون مقدار خالی از ردیف اول شیت. */
function buildHeaders(headerRow: unknown[]): string[] {
  const seen = new Map<string, number>();
  return headerRow.map((value, index) => {
    const base =
      value === null || value === undefined || String(value).trim() === ""
        ? `ستون ${index + 1}`
        : String(value).trim();
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base} (${count + 1})`;
  });
}

/**
 * تشخیص خودکار نقش ستون‌ها بر اساس نام هدر و نمونه‌ی داده‌ها.
 * برای شناسایی ستون‌های تاریخ شمسی/میلادی و قیمت دلار استفاده می‌شود.
 */
export function detectColumns(parsed: ParsedExcel): DetectedColumns {
  const { headers, rows } = parsed;
  const sample = rows.slice(0, 25);

  const persianDateKey =
    findByKeyword(headers, ["شمسی", "جلالی", "خورشیدی", "persian", "jalali"]) ??
    findByPredicate(headers, sample, isPersianDateValue);

  const gregorianDateKey =
    findByKeyword(headers, [
      "میلادی",
      "gregorian",
      "date",
      "تاریخ میلادی",
    ]) ?? findByPredicate(headers, sample, isGregorianDateValue);

  const priceKey =
    findByKeyword(headers, [
      "قیمت",
      "دلار",
      "price",
      "usd",
      "نرخ",
      "value",
    ]) ?? findNumericColumn(headers, sample, [persianDateKey, gregorianDateKey]);

  return { persianDateKey, gregorianDateKey, priceKey };
}

/** یافتن اولین هدری که شامل یکی از کلیدواژه‌هاست. */
function findByKeyword(headers: string[], keywords: string[]): string | null {
  const lowerKeywords = keywords.map((keyword) => keyword.toLowerCase());
  return (
    headers.find((header) =>
      lowerKeywords.some((keyword) => header.toLowerCase().includes(keyword)),
    ) ?? null
  );
}

/** یافتن اولین ستونی که اکثر مقادیر نمونه‌اش شرط داده‌شده را برآورده می‌کنند. */
function findByPredicate(
  headers: string[],
  sample: ExcelRow[],
  predicate: (value: string) => boolean,
): string | null {
  if (sample.length === 0) return null;
  return (
    headers.find((header) => {
      const matches = sample.filter((row) => {
        const cell = row[header];
        return typeof cell === "string" && predicate(cell);
      }).length;
      return matches >= Math.ceil(sample.length * 0.6);
    }) ?? null
  );
}

/** یافتن اولین ستون عددی که جزو ستون‌های تاریخ نباشد. */
function findNumericColumn(
  headers: string[],
  sample: ExcelRow[],
  exclude: (string | null)[],
): string | null {
  if (sample.length === 0) return null;
  return (
    headers.find((header) => {
      if (exclude.includes(header)) return false;
      const numeric = sample.filter(
        (row) => parseNumeric(row[header]) !== null,
      ).length;
      return numeric >= Math.ceil(sample.length * 0.6);
    }) ?? null
  );
}

/** تشخیص مقدار تاریخ شمسی مانند 1405/04/12 یا 1405-04-12. */
export function isPersianDateValue(value: string): boolean {
  const normalized = toLatinDigits(value).trim();
  return /^1[34]\d{2}[\/\-.]\d{1,2}[\/\-.]\d{1,2}$/.test(normalized);
}

/** تشخیص مقدار تاریخ میلادی مانند 2026-07-03 یا 2026/07/03. */
export function isGregorianDateValue(value: string): boolean {
  const normalized = toLatinDigits(value).trim();
  return /^(19|20)\d{2}[\/\-.]\d{1,2}[\/\-.]\d{1,2}$/.test(normalized);
}

/** ساخت ParsedExcel از matrix خامی که از worker برگشته. */
export function buildParsedExcelFromMatrix(
  matrix: unknown[][],
  meta: { name: string; size: number },
): ParsedExcel {
  const headerRow = matrix[0] ?? [];
  const headers = buildHeaders(headerRow);

  const rows: ExcelRow[] = matrix.slice(1).reduce<ExcelRow[]>((acc, raw) => {
    const row: ExcelRow = {};
    let hasValue = false;
    headers.forEach((header, index) => {
      const cell = normalizeCell(raw[index]);
      row[header] = cell;
      if (cell !== null && String(cell).trim() !== "") hasValue = true;
    });
    if (hasValue) acc.push(row);
    return acc;
  }, []);

  if (rows.length === 0) {
    throw new ExcelParseError("هیچ داده‌ای پیدا نشد.");
  }

  return {
    headers,
    rows,
    meta: { name: meta.name, size: meta.size, rowCount: rows.length },
  };
}