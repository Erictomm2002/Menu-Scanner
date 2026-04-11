"use client";

import { Download, FileText, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { QuotationDiscount } from "@/types/quotation";

interface QuotationSummaryProps {
  softwareTotal: number;
  hardwareTotal: number;
  discounts?: QuotationDiscount[];
  total: number;
}

export function QuotationSummary({
  softwareTotal,
  hardwareTotal,
  discounts = [],
  total,
}: QuotationSummaryProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate total discount amount
  const totalDiscount = discounts.reduce((sum, d) => sum + d.amount, 0);
  const hasDiscounts = discounts.some((d) => d.amount !== 0);

  return (
    <div className="w-full max-w-md bg-slate-50 p-6 rounded-xl border border-slate-300 space-y-4">
      <div className="flex justify-between items-center text-sm">
        <span className="text-slate-600">Tổng tiền phần mềm:</span>
        <span className="font-semibold text-slate-900">{formatPrice(softwareTotal)}</span>
      </div>

      <div className="flex justify-between items-center text-sm">
        <span className="text-slate-600">Tổng tiền phần cứng:</span>
        <span className="font-semibold text-slate-900">{formatPrice(hardwareTotal)}</span>
      </div>

      {/* Discount Section */}
      {hasDiscounts && (
        <>
          <div className="border-t border-slate-200 pt-2 space-y-2">
            {discounts
              .filter((d) => d.amount !== 0)
              .map((discount, index) => (
                <div key={discount.id || index} className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 truncate max-w-[200px]" title={discount.label}>
                    {discount.label || "Chiết khấu"}:
                  </span>
                  <span className="font-semibold text-rose-600">
                    -{formatPrice(Math.abs(discount.amount))}
                  </span>
                </div>
              ))}
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Tổng chiết khấu:</span>
            <span className="font-semibold text-rose-600">
              -{formatPrice(Math.abs(totalDiscount))}
            </span>
          </div>
        </>
      )}

      <div className="border-t border-slate-300 pt-4 flex justify-between items-center">
        <span className="text-lg font-bold text-slate-900 uppercase">Tổng cộng:</span>
        <span className="text-2xl font-black text-[#2463eb]">{formatPrice(total)}</span>
      </div>
    </div>
  );
}

interface QuotationFooterProps {
  onExport: () => void;
  onExportPdf: () => void;
  onSave: () => void;
  isSaving?: boolean;
  isExporting?: boolean;
  isExportingPdf?: boolean;
  itemCount: number;
}

export function QuotationFooter({
  onExport,
  onExportPdf,
  onSave,
  isSaving = false,
  isExporting = false,
  isExportingPdf = false,
  itemCount = 0,
}: QuotationFooterProps) {
  return (
    <div className="p-6 bg-white border-t border-slate-200 rounded-b-xl flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <Button
        variant="outline"
        onClick={onSave}
        disabled={itemCount === 0 || isSaving}
      >
        <Save className="w-5 h-5" />
        Lưu báo giá
      </Button>

      <Button
        variant="primary"
        onClick={onExport}
        disabled={itemCount === 0 || isExporting}
      >
        <Download className="w-5 h-5" />
        {isExporting ? "Đang xuất..." : "Xuất Excel"}
      </Button>

      {/* <Button
        variant="primary"
        onClick={onExportPdf}
        disabled={itemCount === 0 || isExportingPdf}
      >
        <FileText className="w-5 h-5" />
        {isExportingPdf ? "Đang xuất..." : "Xuất PDF"}
      </Button> */}
    </div>
  );
}
