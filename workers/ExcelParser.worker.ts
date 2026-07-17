import * as XLSX from "xlsx";

interface ParseMessage {
  buffer: ArrayBuffer;
  name: string;
  size: number;
}

self.onmessage = (e: MessageEvent<ParseMessage>) => {
  const { buffer, name, size } = e.data;

  try {
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = firstSheetName ? workbook.Sheets[firstSheetName] : undefined;

    if (!sheet) {
      self.postMessage({ ok: false, error: "فرمت فایل معتبر نیست." });
      return;
    }

    const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      blankrows: false,
      defval: null,
    });

    if (matrix.length === 0) {
      self.postMessage({ ok: false, error: "هیچ داده‌ای پیدا نشد." });
      return;
    }

    // نتیجه‌ی خام رو برمی‌گردونیم، منطق normalize/headers توی lib/excel.ts روی همین matrix اجرا می‌شه
    self.postMessage({ ok: true, matrix, name, size });
  } catch (err) {
    // پیام خطای واقعی رو برمی‌گردونیم تا قابل دیباگ باشه
    self.postMessage({
      ok: false,
      error: "پارس فایل با خطا مواجه شد.",
      debug: err instanceof Error ? err.message : String(err),
    });
  }
};