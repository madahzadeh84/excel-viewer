"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { FileSpreadsheet, Info } from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { UploadArea } from "@/components/UploadArea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatFileSize, toPersianDigits, parseNumeric, toLatinDigits } from "@/lib/utils";
import type { ParsedExcel, DetectedColumns, FilterState } from "@/types/excel";
import { EMPTY_FILTERS } from "@/types/excel";

// Lazy-load heavy components for code splitting
const Filters = dynamic(
  () => import("@/components/Filters").then((m) => ({ default: m.Filters })),
  { ssr: false },
);

const DataTable = dynamic(
  () => import("@/components/DataTable").then((m) => ({ default: m.DataTable })),
  { ssr: false },
);

export default function Home() {
  const [parsedData, setParsedData] = useState<ParsedExcel | null>(null);
  const [detectedColumns, setDetectedColumns] = useState<DetectedColumns>({
    persianDateKey: null,
    gregorianDateKey: null,
    priceKey: null,
  });
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  const handleDataParsed = useCallback(
    (data: ParsedExcel, columns: DetectedColumns) => {
      setParsedData(data);
      setDetectedColumns(columns);
      setFilters(EMPTY_FILTERS);
    },
    [],
  );

  const filteredData = useMemo(() => {
    if (!parsedData) return [];

    const { dateQuery, minPrice, maxPrice } = filters;
    let rows = parsedData.rows;

    // Date filter: match against detected persian or gregorian date columns
    if (dateQuery.trim() !== "") {
      const query = toLatinDigits(dateQuery.trim());
      const dateKeys: string[] = [];
      if (detectedColumns.persianDateKey) dateKeys.push(detectedColumns.persianDateKey);
      if (detectedColumns.gregorianDateKey) dateKeys.push(detectedColumns.gregorianDateKey);

      if (dateKeys.length > 0) {
        rows = rows.filter((row) =>
          dateKeys.some((key) => {
            const cellValue = row[key];
            if (cellValue === null || cellValue === undefined) return false;
            const cellStr = toLatinDigits(String(cellValue));
            return cellStr.includes(query);
          }),
        );
      }
    }

    // Price range filter
    if (detectedColumns.priceKey) {
      const min = minPrice.trim() !== "" ? parseNumeric(minPrice) : null;
      const max = maxPrice.trim() !== "" ? parseNumeric(maxPrice) : null;

      if (min !== null || max !== null) {
        rows = rows.filter((row) => {
          const priceValue = parseNumeric(row[detectedColumns.priceKey!]);
          if (priceValue === null) return false;
          if (min !== null && priceValue < min) return false;
          if (max !== null && priceValue > max) return false;
          return true;
        });
      }
    }

    return rows;
  }, [parsedData, filters, detectedColumns]);

  const hasData = parsedData !== null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold">مشاهده‌گر اکسل</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!hasData ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <UploadArea onDataParsed={handleDataParsed} />
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* File Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">اطلاعات فایل</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4">
                  <Badge variant="secondary" className="gap-1.5">
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    {parsedData.meta.name}
                  </Badge>
                  <Badge variant="outline">
                    حجم: {formatFileSize(parsedData.meta.size)}
                  </Badge>
                  <Badge variant="outline">
                    تعداد ردیف: {toPersianDigits(parsedData.meta.rowCount)}
                  </Badge>
                  {detectedColumns.persianDateKey && (
                    <Badge variant="outline" className="gap-1">
                      <Info className="h-3 w-3" />
                      ستون تاریخ شمسی: {detectedColumns.persianDateKey}
                    </Badge>
                  )}
                  {detectedColumns.gregorianDateKey && (
                    <Badge variant="outline" className="gap-1">
                      <Info className="h-3 w-3" />
                      ستون تاریخ میلادی: {detectedColumns.gregorianDateKey}
                    </Badge>
                  )}
                  {detectedColumns.priceKey && (
                    <Badge variant="outline" className="gap-1">
                      <Info className="h-3 w-3" />
                      ستون قیمت: {detectedColumns.priceKey}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Filters
              filters={filters}
              onFiltersChange={setFilters}
              detectedColumns={detectedColumns}
            />

            {/* Data Table */}
            <DataTable
              data={filteredData}
              headers={parsedData.headers}
              detectedColumns={detectedColumns}
            />
          </div>
        )}
      </main>
    </div>
  );
}
