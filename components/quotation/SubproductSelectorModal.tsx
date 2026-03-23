"use client";

import { useState, useEffect, useRef } from "react";
import { ProductWithSubproducts, QuotationItem, ProductCategory } from "@/types/quotation";
import { Check, Package, Cpu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SubproductSelectorModalProps {
  product: ProductWithSubproducts;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (items: QuotationItem[]) => void;
}

interface SelectedSubproduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit?: string;
  sort_order: number;
}

export function SubproductSelectorModal({
  product,
  isOpen,
  onClose,
  onConfirm,
}: SubproductSelectorModalProps) {
  const [selectedSubproducts, setSelectedSubproducts] = useState<Set<string>>(new Set());
  const modalRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Reset selected subproducts when product changes
  useEffect(() => {
    setSelectedSubproducts(() => new Set());
  }, [product.id]);

  // Modal accessibility: Focus trapping and escape key handling
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "auto";
      return;
    }

    document.body.style.overflow = "hidden";

    // Focus confirm button when modal opens
    setTimeout(() => confirmButtonRef.current?.focus(), 100);

    // Escape key handler
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);

    // Focus trapping
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusableElements = modalContentRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleTabKey);

    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("keydown", handleEscapeKey);
      document.removeEventListener("keydown", handleTabKey);
    };
  }, [isOpen, onClose]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const toggleSubproduct = (subproductId: string) => {
    setSelectedSubproducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subproductId)) {
        newSet.delete(subproductId);
      } else {
        newSet.add(subproductId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    const allIds = new Set(product.subproducts.map((sp) => sp.id));
    setSelectedSubproducts(allIds);
  };

  const deselectAll = () => {
    setSelectedSubproducts(new Set());
  };

  const handleConfirm = () => {
    // Create subproduct items
    const subproductItems: QuotationItem[] = [];
    product.subproducts
      .filter((sp) => selectedSubproducts.has(sp.id))
      .forEach((sp) => {
        subproductItems.push({
          product_id: product.id,
          subproduct_id: sp.id,
          name: sp.name,
          unit: sp.unit || product.unit,
          quantity: 1,
          unit_price: sp.price,
          total_price: sp.price,
          is_free: sp.price === 0,
          is_subproduct: true,
          parent_item_id: product.id,
          indent_level: 1,
          product_category: product.category,
        });
      });

    // Create main product item (without ID for now, will be assigned by database)
    const mainProductItem: QuotationItem = {
      product_id: product.id,
      name: product.name,
      description: product.description || "",
      unit: product.unit,
      quantity: 1,
      unit_price: product.price,
      total_price: product.price,
      is_free: false,
      is_subproduct: false,
      indent_level: 0,
      product_category: product.category,
    };

    // Combine main product and subproducts
    const items: QuotationItem[] = [mainProductItem, ...subproductItems];

    onConfirm(items);
    onClose();
    setSelectedSubproducts(() => new Set());
  };

  const selectedSubproductsData = product.subproducts.filter((sp) =>
    selectedSubproducts.has(sp.id)
  );
  const selectedTotal = selectedSubproductsData.reduce(
    (sum, sp) => sum + sp.price,
    0
  );

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        ref={modalContentRef}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
                  Chọn Subproducts
                </h2>
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                  product.category === ProductCategory.SOFTWARE
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                }`}>
                  {product.category === ProductCategory.SOFTWARE ? (
                    <>
                      <Cpu className="w-3 h-3" />
                      Phần mềm
                    </>
                  ) : (
                    <>
                      <Package className="w-3 h-3" />
                      Phần cứng
                    </>
                  )}
                </div>
              </div>
              <p className="text-slate-600 text-sm">{product.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Subproducts List */}
        <div className="flex-1 overflow-y-auto p-6">
          {product.subproducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500">Không có subproduct nào</p>
            </div>
          ) : (
            <>
              {/* Select All / Deselect All */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                  disabled={selectedSubproducts.size === product.subproducts.length}
                >
                  Chọn tất cả
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deselectAll}
                  disabled={selectedSubproducts.size === 0}
                >
                  Bỏ chọn tất cả
                </Button>
              </div>

              {/* Subproduct List */}
              <div className="space-y-3">
                {product.subproducts
                  .map((subproduct) => {
                    const isSelected = selectedSubproducts.has(subproduct.id);
                    const isFree = subproduct.price === 0;

                    return (
                      <label
                        key={subproduct.id}
                        className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "bg-blue-50 border-blue-300"
                            : "bg-white border-slate-200 hover:border-blue-200"
                        }`}
                      >
                        <div className="pt-0.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSubproduct(subproduct.id)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-medium text-slate-900">{subproduct.name}</p>
                            </div>
                            <div className="text-right shrink-0">
                              {isFree ? (
                                <span className="text-[#ED7D31] font-semibold">
                                  Miễn phí
                                </span>
                              ) : (
                                <>
                                  <span className="font-semibold text-slate-900">
                                    {formatPrice(subproduct.price)}
                                  </span>
                                  <span className="text-xs text-slate-500 ml-1">đ</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-slate-600">
              Đã chọn <span className="font-semibold">{selectedSubproducts.size}</span> /{" "}
              {product.subproducts.length} subproducts
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">Tổng cộng:</div>
              <div className="text-lg font-bold text-slate-900">
                {formatPrice(selectedTotal)}
                <span className="text-sm font-normal text-slate-500 ml-1">đ</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                onClose();
                setSelectedSubproducts(() => new Set());
              }}
            >
              Hủy
            </Button>
            <Button
              ref={confirmButtonRef}
              variant="primary"
              className="flex-1"
              onClick={handleConfirm}
            >
              <Check className="w-4 h-4 mr-2" />
              Xác nhận
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
