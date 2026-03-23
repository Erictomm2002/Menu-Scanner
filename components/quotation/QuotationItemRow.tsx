"use client";

import { Trash2, Plus, Minus } from "lucide-react";
import { QuotationItem } from "@/types/quotation";

interface QuotationItemRowProps {
  item: QuotationItem;
  index: number;
  onUpdate: (index: number, item: QuotationItem) => void;
  onRemove: (index: number) => void;
}

export function QuotationItemRow({
  item,
  index,
  onUpdate,
  onRemove,
}: QuotationItemRowProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, item.quantity + delta);
    const newTotalPrice = newQuantity * item.unit_price;
    onUpdate(index, {
      ...item,
      quantity: newQuantity,
      total_price: newTotalPrice,
    });
  };

  const handleToggleFree = () => {
    onUpdate(index, { ...item, is_free: !item.is_free });
  };

  const isSubproduct = item.is_subproduct || (item.indent_level || 0) > 0;

  return (
    <div
      className={`flex flex-col sm:grid sm:grid-cols-12 sm:gap-4 sm:items-center hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0 ${
        isSubproduct ? "py-2 px-2" : "py-3 px-2"
      }`}
      style={{
        paddingLeft: `${16 + (item.indent_level || 0) * 16}px`,
      }}
    >
      {/* Mobile Layout - Stacked */}
      <div className="sm:hidden flex flex-col gap-2 w-full">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div
              className={
                isSubproduct
                  ? "font-normal italic text-slate-600 text-sm"
                  : "font-semibold text-slate-900 text-sm"
              }
            >
              {item.name}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {formatPrice(item.unit_price)} x {item.quantity}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label={`Xóa ${item.name}`}
              className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-rose-600 transition-colors"
              onClick={() => onRemove(index)}
              type="button"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Quantity controls */}
          <div className="flex items-center gap-2" role="group" aria-label="Kiểm soát số lượng">
            <button
              aria-label="Giảm số lượng"
              className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 disabled:opacity-50"
              onClick={() => handleQuantityChange(-1)}
              disabled={item.quantity <= 1}
              type="button"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
            <button
              aria-label="Tăng số lượng"
              className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700"
              onClick={() => handleQuantityChange(1)}
              type="button"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="text-right">
            {item.is_free ? (
              <span className="text-sm text-slate-500 line-through">Miễn phí</span>
            ) : (
              <span className="text-sm font-bold text-slate-900">{formatPrice(item.total_price)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout - Grid */}
      <div className="hidden sm:contents">
        {/* Product Name & Description - Col Span 5 */}
        <div className="col-span-4">
          <div
            className={
              isSubproduct
                ? "font-normal italic text-slate-600 text-sm"
                : "font-semibold text-slate-900 text-sm"
            }
          >
            {item.name}
          </div>
        </div>

        {/* Unit Price - Col Span 2 */}
        <div className="col-span-2 text-center text-sm font-medium text-slate-900">
          {formatPrice(item.unit_price)}
        </div>

        {/* Quantity - Col Span 2 */}
        <div className="col-span-2 flex justify-center">
          <div className="flex items-center justify-center gap-2" role="group" aria-label="Kiểm soát số lượng">
            <button
              aria-label="Giảm số lượng"
              aria-controls={`quantity-${index}`}
              className="w-7 h-7 flex items-center justify-center border border-slate-300 rounded-md hover:bg-slate-100 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              onClick={() => handleQuantityChange(-1)}
              disabled={item.quantity <= 1}
              type="button"
            >
              <Minus className="w-3 h-3" aria-hidden="true" />
            </button>
            <span
              id={`quantity-${index}`}
              role="status"
              aria-live="polite"
              className="text-sm font-medium w-8 text-center text-slate-900"
            >
              {item.quantity}
            </span>
            <button
              aria-label="Tăng số lượng"
              aria-controls={`quantity-${index}`}
              className="w-7 h-7 flex items-center justify-center border border-slate-300 rounded-md hover:bg-slate-100 text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              onClick={() => handleQuantityChange(1)}
              type="button"
            >
              <Plus className="w-3 h-3" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="col-span-1 flex justify-center">
          <label className="flex items-center gap-1 cursor-pointer group">
            <input
              type="checkbox"
              checked={item.is_free || false}
              onChange={handleToggleFree}
              className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
            />
            <span className="text-xs text-slate-600 group-hover:text-slate-800 whitespace-nowrap">
              Free?
            </span>
          </label>
        </div>

        {/* Total - Col Span 2 */}
        <div className="col-span-2 text-center text-sm font-bold text-slate-900">
          {item.is_free ? (
            <span className="text-slate-500 line-through">Miễn phí</span>
          ) : (
            formatPrice(item.total_price)
          )}
        </div>

        {/* Actions - Col Span 1 */}
        <div className="col-span-1 flex items-center ">
          <button
            aria-label={`Xóa ${item.name}`}
            className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-rose-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
            onClick={() => onRemove(index)}
            type="button"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
