"use client";

import { useCallback } from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FilterState, DetectedColumns } from "@/types/excel";
import { EMPTY_FILTERS } from "@/types/excel";

interface FiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  detectedColumns: DetectedColumns;
}

export function Filters({
  filters,
  onFiltersChange,
  detectedColumns,
}: FiltersProps) {
  const hasPriceColumn = detectedColumns.priceKey !== null;
  const hasDateColumn =
    detectedColumns.persianDateKey !== null ||
    detectedColumns.gregorianDateKey !== null;

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      onFiltersChange({ ...filters, [key]: value });
    },
    [filters, onFiltersChange],
  );

  const resetFilters = useCallback(() => {
    onFiltersChange(EMPTY_FILTERS);
  }, [onFiltersChange]);

  const hasActiveFilters =
    filters.dateQuery !== "" || filters.minPrice !== "" || filters.maxPrice !== "";

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">فیلترها</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              aria-label="پاک کردن فیلترها"
              className="gap-1.5"
            >
              <X className="h-4 w-4" />
              پاک کردن فیلترها
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hasDateColumn && (
            <div className="space-y-2">
              <Label htmlFor="date-search">جستجوی تاریخ</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="date-search"
                  placeholder="1405/04/12 یا 2026-07-03"
                  value={filters.dateQuery}
                  onChange={(e) => updateFilter("dateQuery", e.target.value)}
                  className="pl-9"
                  aria-label="جستجو بر اساس تاریخ شمسی یا میلادی"
                />
              </div>
            </div>
          )}

          {hasPriceColumn && (
            <>
              <div className="space-y-2">
                <Label htmlFor="min-price">حداقل قیمت</Label>
                <Input
                  id="min-price"
                  type="number"
                  placeholder="90000"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter("minPrice", e.target.value)}
                  aria-label="حداقل قیمت دلار"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-price">حداکثر قیمت</Label>
                <Input
                  id="max-price"
                  type="number"
                  placeholder="95000"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter("maxPrice", e.target.value)}
                  aria-label="حداکثر قیمت دلار"
                />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
