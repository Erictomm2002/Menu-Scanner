"use client";

import { QuotationItem, QuotationDiscount, ProductCategory } from "@/types/quotation";
import { Save, Download, FileText, Plus } from "lucide-react";
import clsx from "clsx";

interface MobileFooterSummaryProps {
  items: QuotationItem[];
  discounts: QuotationDiscount[];
  onExport: () => void;
  onExportPdf: () => void;
  onSave: () => void;
  onOpenProductSheet: () => void;
  isSaving?: boolean;
  isExporting?: boolean;
  isExportingPdf?: boolean;
}

function getItemCategory(item: QuotationItem): string {
  if (item.product_category === ProductCategory.SOFTWARE) return "SOFTWARE";
  if (item.product_category === ProductCategory.HARDWARE) return "HARDWARE";
  if (item.name?.toLowerCase().includes("phần mềm") || item.name?.toLowerCase().includes("software")) return "SOFTWARE";
  return "HARDWARE";
}

export function MobileFooterSummary({
  items,
  discounts,
  onExport,
  onExportPdf,
  onSave,
  onOpenProductSheet,
  isSaving = false,
  isExporting = false,
  isExportingPdf = false,
}: MobileFooterSummaryProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate totals
  const softwareTotal = items
    .filter((item) => !item.is_subproduct && getItemCategory(item) === "SOFTWARE")
    .reduce((sum, item) => sum + (item.is_free ? 0 : item.total_price), 0);

  const hardwareTotal = items
    .filter((item) => !item.is_subproduct && getItemCategory(item) === "HARDWARE")
    .reduce((sum, item) => sum + (item.is_free ? 0 : item.total_price), 0);

  const totalDiscount = discounts.reduce((sum, d) => sum + d.amount, 0);
  const grandTotal = softwareTotal + hardwareTotal + totalDiscount;

  const hasItems = items.length > 0;

  return (
    <div className="p-4 space-y-4 pb-[calc(5rem+env(safe-area-inset-bottom))]">
      {/* Summary Row */}
      {hasItems && (
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <span className="text-on-surface-variant">Tổng phần mềm:</span>
          <span className="text-right font-bold text-on-surface">{formatPrice(softwareTotal)}</span>

          <span className="text-on-surface-variant">Tổng phần cứng:</span>
          <span className="text-right font-bold text-on-surface">{formatPrice(hardwareTotal)}</span>

          {totalDiscount !== 0 && (
            <>
              <span className="text-on-surface-variant">Chiết khấu:</span>
              <span className="text-right font-bold text-error">-{formatPrice(Math.abs(totalDiscount))}</span>
            </>
          )}

          <div className="col-span-2 pt-2 mt-2 border-t border-outline-variant/20 flex justify-between items-baseline">
            <span className="text-base font-extrabold text-on-surface">Tổng cộng:</span>
            <span className="text-2xl font-extrabold text-primary">{formatPrice(grandTotal)}</span>
          </div>
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="grid grid-cols-4 gap-3">
        {/* Add Product Button */}
        <button
          onClick={onOpenProductSheet}
          className="flex flex-col items-center justify-center gap-1 p-3 rounded-2xl bg-surface-container-low text-secondary hover:bg-surface-container-high transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span className="text-[11px] font-bold uppercase tracking-tight">Thêm</span>
        </button>

        {/* Save Button */}
        <button
          onClick={onSave}
          disabled={!hasItems || isSaving}
          className={clsx(
            "flex flex-col items-center justify-center gap-1 p-3 rounded-2xl transition-all active:scale-95",
            hasItems
              ? "bg-surface-container-low text-secondary hover:bg-surface-container-high"
              : "bg-surface-container-low/50 text-outline cursor-not-allowed"
          )}
        >
          <Save className="w-5 h-5" />
          <span className="text-[11px] font-bold uppercase tracking-tight">
            {isSaving ? "..." : "Lưu"}
          </span>
        </button>

        {/* Excel Button */}
        <button
          onClick={onExport}
          disabled={!hasItems || isExporting}
          className={clsx(
            "flex flex-col items-center justify-center gap-1 p-3 rounded-2xl transition-all active:scale-95",
            hasItems
              ? "bg-surface-container-low text-secondary hover:bg-surface-container-high"
              : "bg-surface-container-low/50 text-outline cursor-not-allowed"
          )}
        >
          <Download className="w-5 h-5" />
          <span className="text-[11px] font-bold uppercase tracking-tight">
            {isExporting ? "..." : "Excel"}
          </span>
        </button>

        {/* PDF Button - Primary - Hidden temporarily */}
        {/* <button
          onClick={onExportPdf}
          disabled={!hasItems || isExportingPdf}
          className={clsx(
            "flex flex-col items-center justify-center gap-1 p-3 rounded-2xl transition-all active:scale-95 shadow-lg",
            hasItems
              ? "bg-gradient-to-br from-primary to-primary-container text-white shadow-primary/20 hover:opacity-90"
              : "bg-surface-container-low text-outline cursor-not-allowed shadow-none"
          )}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[11px] font-bold uppercase tracking-tight">
            {isExportingPdf ? "..." : "PDF"}
          </span>
        </button> */}
      </div>
    </div>
  );
}
