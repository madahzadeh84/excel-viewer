"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { parseExcelBuffer, hasValidExtension, ExcelParseError } from "@/lib/excel";
import type { ParsedExcel, DetectedColumns } from "@/types/excel";
import { detectColumns } from "@/lib/excel";

interface UploadAreaProps {
  onDataParsed: (data: ParsedExcel, columns: DetectedColumns) => void;
}

export function UploadArea({ onDataParsed }: UploadAreaProps) {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setError(null);
      setIsProcessing(true);

      if (!hasValidExtension(file.name)) {
        setError("فرمت فایل معتبر نیست.");
        setIsProcessing(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const buffer = event.target?.result;
          if (!(buffer instanceof ArrayBuffer)) {
            setError("خواندن فایل با خطا مواجه شد.");
            setIsProcessing(false);
            return;
          }

          const parsed = parseExcelBuffer(buffer, {
            name: file.name,
            size: file.size,
          });

          const columns = detectColumns(parsed);
          onDataParsed(parsed, columns);
        } catch (err) {
          if (err instanceof ExcelParseError) {
            setError(err.message);
          } else {
            setError("پارس فایل با خطا مواجه شد. لطفاً فایل دیگری امتحان کنید.");
          }
        } finally {
          setIsProcessing(false);
        }
      };

      reader.onerror = () => {
        setError("خواندن فایل با خطا مواجه شد.");
        setIsProcessing(false);
      };

      reader.readAsArrayBuffer(file);
    },
    [onDataParsed],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">آپلود فایل اکسل</CardTitle>
        <CardDescription>
          فایل اکسل خود را برای مشاهده و تحلیل داده‌ها آپلود کنید
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          role="button"
          tabIndex={0}
          aria-label="ناحیه آپلود فایل اکسل"
          className={cn(
            "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all duration-200 cursor-pointer",
            "hover:border-primary/50 hover:bg-muted/50",
            isDragActive
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-muted-foreground/25",
            isProcessing && "pointer-events-none opacity-60",
          )}
        >
          <input {...getInputProps()} aria-label="انتخاب فایل اکسل" />

          <div
            className={cn(
              "mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-colors",
              isDragActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
            )}
          >
            {isDragActive ? (
              <FileSpreadsheet className="h-8 w-8" />
            ) : (
              <Upload className="h-8 w-8" />
            )}
          </div>

          <p className="mb-2 text-base font-medium text-foreground">
            فایل اکسل را اینجا رها کنید یا برای انتخاب کلیک کنید.
          </p>
          <p className="text-sm text-muted-foreground">
            فرمت‌های پشتیبانی‌شده: .xlsx, .xls, .csv
          </p>

          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/80">
              <div className="flex items-center gap-2 text-primary">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-sm font-medium">در حال پردازش...</span>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
