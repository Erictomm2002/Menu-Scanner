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
      className={`grid grid-cols-12 gap-4 items-center hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0 ${
        isSubproduct ? "py-1" : "py-4"
      }`}
      style={{
        paddingLeft: `${16 + (item.indent_level || 0) * 16}px`,
      }}
    >
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
  );
}
