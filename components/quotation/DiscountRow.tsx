"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { QuotationDiscount } from "@/types/quotation";

interface DiscountRowProps {
  discount: QuotationDiscount;
  index: number;
  onUpdate: (index: number, discount: QuotationDiscount) => void;
  onRemove: (index: number) => void;
}

export function DiscountRow({
  discount,
  index,
  onUpdate,
  onRemove,
}: DiscountRowProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [editingValue, setEditingValue] = useState("");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(Math.abs(price));
  };

  const handleLabelChange = (value: string) => {
    onUpdate(index, { ...discount, label: value });
  };

  const handleAmountChange = (value: string) => {
    setEditingValue(value);
    const parsedValue = parseFloat(value.replace(/[^\d.-]/g, "")) || 0;
    // Store as negative for discounts
    onUpdate(index, { ...discount, amount: -Math.abs(parsedValue) });
  };

  const handleAmountFocus = () => {
    setIsFocused(true);
    // Show raw number without formatting when focused
    setEditingValue(Math.abs(discount.amount).toString());
  };

  const handleAmountBlur = () => {
    setIsFocused(false);
    setEditingValue("");
  };

  return (
    <div className="grid grid-cols-12 gap-4 items-center py-3.5 px-4 hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0">
      {/* Description Label - Col Span 5 */}
      <div className="col-span-5">
        <label htmlFor={`discount-description-${index}`} className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
          Mô tả
        </label>
        <input
          id={`discount-description-${index}`}
          type="text"
          placeholder="Chiết khấu khi mua 2 thiết bị trở lên"
          value={discount.label}
          onChange={(e) => handleLabelChange(e.target.value)}
          aria-label="Mô tả chiết khấu"
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        />
      </div>

      {/* Discount Amount - Col Span 5 */}
      <div className="col-span-5">
        <label htmlFor={`discount-amount-${index}`} className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
          Số tiền giảm
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500 font-semibold text-sm" aria-hidden="true">
            -
          </span>
          <input
            id={`discount-amount-${index}`}
            type="text"
            value={isFocused ? editingValue : formatPrice(discount.amount)}
            onChange={(e) => handleAmountChange(e.target.value)}
            onFocus={handleAmountFocus}
            onBlur={handleAmountBlur}
            placeholder="0"
            aria-label="Số tiền chiết khấu"
            className="w-full pl-8 pr-3 py-2 text-sm font-medium border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium" aria-hidden="true">
            VND
          </span>
        </div>
      </div>

      {/* Actions - Col Span 2 */}
      <div className="col-span-2 flex justify-end items-start">
        <button
          className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all duration-200 border border-transparent hover:border-rose-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
          onClick={() => onRemove(index)}
          aria-label="Xóa chiết khấu"
          type="button"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
