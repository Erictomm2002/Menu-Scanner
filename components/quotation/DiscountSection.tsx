"use client";

import { Plus, Percent } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DiscountRow } from "./DiscountRow";
import { QuotationDiscount } from "@/types/quotation";

interface DiscountSectionProps {
  discounts: QuotationDiscount[];
  onAddDiscount: () => void;
  onUpdateDiscount: (index: number, discount: QuotationDiscount) => void;
  onRemoveDiscount: (index: number) => void;
}

export function DiscountSection({
  discounts,
  onAddDiscount,
  onUpdateDiscount,
  onRemoveDiscount,
}: DiscountSectionProps) {
  const generateId = (): string => {
    return `discount_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleAddDiscount = () => {
    const newDiscount: QuotationDiscount = {
      id: generateId(),
      label: "",
      amount: 0,
    };
    onAddDiscount();
  };

  // Calculate total discount for display
  const totalDiscount = discounts.reduce((sum, d) => sum + d.amount, 0);
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(Math.abs(price));
  };

  if (discounts.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-xl border border-slate-300 overflow-hidden mt-6">
        {/* Section Header with icon */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-slate-50 to-slate-100/80 py-2.5 px-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center">
              <Percent className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />
            </div>
            <span className="text-xs lg:text-sm font-bold text-primary uppercase tracking-wider">
              <span className="hidden lg:inline">C. CHIẾT KHẤU</span>
              <span className="lg:hidden">Chiết khấu</span>
            </span>
          </div>
        </div>
        <div className="p-4 lg:p-6">
          <Button
            variant="outline"
            onClick={handleAddDiscount}
            className="w-full border-dashed border-2 border-slate-300 text-slate-600 hover:text-primary hover:border-primary hover:bg-blue-50/30 py-2 lg:py-3"
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            Thêm chiết khấu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-xl border border-slate-300 overflow-hidden mt-6">
      {/* Section Header with icon */}
      <div className="flex items-center gap-2 bg-gradient-to-r from-slate-50 to-slate-100/80 py-2.5 px-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center">
            <Percent className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />
          </div>
          <span className="text-xs lg:text-sm font-bold text-primary uppercase tracking-wider">
            <span className="hidden lg:inline">C. CHIẾT KHẤU</span>
            <span className="lg:hidden">Chiết khấu</span>
          </span>
        </div>
      </div>

      {/* Discount Rows */}
      <div className="divide-y divide-slate-100">
        {discounts.map((discount, index) => (
          <DiscountRow
            key={discount.id}
            discount={discount}
            index={index}
            onUpdate={onUpdateDiscount}
            onRemove={onRemoveDiscount}
          />
        ))}
      </div>

      {/* Add Discount Button */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/30">
        <Button
          variant="outline"
          onClick={handleAddDiscount}
          className="w-full border-dashed border-2 border-slate-300 text-slate-600 hover:text-primary hover:border-primary hover:bg-blue-50/30 py-2.5"
        >
          <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
          Thêm chiết khấu
        </Button>
      </div>

      {/* Total Discount Summary */}
      {discounts.length > 0 && (
        <div className="px-4 pb-4 bg-slate-50/30">
          <div className="flex justify-between items-center py-2 border-t border-slate-200">
            <span className="text-xs text-slate-500">
              Tổng chiết khấu cho báo giá
            </span>
            <span className="text-sm font-semibold text-rose-600">
              -{formatPrice(totalDiscount)} VND
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
