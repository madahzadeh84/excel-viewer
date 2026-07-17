"use client";

import { useMemo, useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ExcelRow, DetectedColumns } from "@/types/excel";
import { formatNumber, toPersianDigits } from "@/lib/utils";

interface DataTableProps {
  data: ExcelRow[];
  headers: string[];
  detectedColumns: DetectedColumns;
}

const PAGE_SIZES = [10, 25, 50, 100];

export function DataTable({ data, headers, detectedColumns }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageSize, setPageSize] = useState(25);

  const columns = useMemo<ColumnDef<ExcelRow, unknown>[]>(() => {
    return headers.map((header) => ({
      id: header,
      accessorKey: header,
      header: () => header,
      cell: (info) => {
        const value = info.getValue();
        if (value === null || value === undefined) return "-";

        if (header === detectedColumns.priceKey) {
          const num = typeof value === "number" ? value : Number(value);
          if (!isNaN(num)) {
            return (
              <span className="font-mono tabular-nums" dir="ltr">
                {formatNumber(num)}
              </span>
            );
          }
        }

        return String(value);
      },
    }));
  }, [headers, detectedColumns.priceKey]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  // Keep page size in sync
  useEffect(() => {
    table.setPageSize(pageSize);
  }, [pageSize, table]);
  useEffect(() => {
    table.setPageIndex(0)
  }, [data, table])

  const totalPages = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">
            داده‌ها ({toPersianDigits(data.length)} ردیف)
          </CardTitle>
          <div className="flex items-center gap-2">
            <label
              htmlFor="page-size"
              className="text-sm text-muted-foreground whitespace-nowrap"
            >
              ردیف در هر صفحه:
            </label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {toPersianDigits(size)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm whitespace-nowrap select-none"
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          className="flex items-center gap-1.5 font-semibold"
                          onClick={header.column.getToggleSortingHandler()}
                          aria-label={`مرتب‌سازی بر اساس ${String(header.column.columnDef.header)}`}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {header.column.getIsSorted() === "asc" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ArrowDown className="h-4 w-4" />
                          ) : (
                            <ArrowUpDown className="h-4 w-4 opacity-40" />
                          )}
                        </button>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    هیچ داده‌ای پیدا نشد.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className={`zebra-row ${index % 2 === 0 ? "" : "bg-muted/30"}`}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="whitespace-nowrap">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              صفحه {toPersianDigits(currentPage + 1)} از{" "}
              {toPersianDigits(totalPages)}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                aria-label="صفحه اول"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="صفحه قبل"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label="صفحه بعد"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.setPageIndex(totalPages - 1)}
                disabled={!table.getCanNextPage()}
                aria-label="صفحه آخر"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
