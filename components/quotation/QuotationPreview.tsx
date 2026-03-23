"use client";

import { QuotationForm } from "./QuotationForm";
import { QuotationItemRow } from "./QuotationItemRow";
import { DiscountSection } from "./DiscountSection";
import { QuotationSummary, QuotationFooter } from "./QuotationSummary";
import {
  QuotationItem as QuotationItemType,
  QuotationDiscount,
  ProductCategory,
} from "@/types/quotation";
import { categorizeItemLegacy } from "@/libs/quotation-calculator";
import { FileText } from "lucide-react";

/**
 * Get item category using product_category field with fallback to keyword matching.
 * This ensures backward compatibility with items that don't have product_category set.
 */
function getItemCategory(item: QuotationItemType): ProductCategory {
  if (item.product_category) {
    return item.product_category;
  }
  return categorizeItemLegacy(item);
}

interface QuotationPreviewProps {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerModel: string;
  items: QuotationItemType[];
  discounts: QuotationDiscount[];
  onCustomerNameChange: (value: string) => void;
  onCustomerPhoneChange: (value: string) => void;
  onCustomerAddressChange: (value: string) => void;
  onCustomerModelChange: (value: string) => void;
  onItemUpdate: (index: number, item: QuotationItemType) => void;
  onItemRemove: (index: number | number[]) => void;
  onAddDiscount: () => void;
  onUpdateDiscount: (index: number, discount: QuotationDiscount) => void;
  onRemoveDiscount: (index: number) => void;
  onExport: () => void;
  onExportPdf: () => void;
  onSave: () => void;
  isSaving?: boolean;
  isExporting?: boolean;
  isExportingPdf?: boolean;
  onOpenMobileProductSheet?: () => void;
}

export function QuotationPreview({
  customerName,
  customerPhone,
  customerAddress,
  customerModel,
  items,
  discounts,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onCustomerAddressChange,
  onCustomerModelChange,
  onItemUpdate,
  onItemRemove,
  onAddDiscount,
  onUpdateDiscount,
  onRemoveDiscount,
  onExport,
  onExportPdf,
  onSave,
  isSaving = false,
  isExporting = false,
  isExportingPdf = false,
  onOpenMobileProductSheet,
}: QuotationPreviewProps) {
  // Handle parent-child deletion when removing an item
  const handleItemRemove = (index: number) => {
    const item = items[index];

    // If this is a main product (not a subproduct), also remove its subproducts
    if (!item.is_subproduct) {
      // Find all consecutive subproducts after this parent item
      const indicesToRemove = [index];

      let i = index + 1;
      while (
        i < items.length &&
        items[i].is_subproduct &&
        items[i].product_id === item.product_id
      ) {
        indicesToRemove.push(i);
        i++;
      }

      // Remove all related items in a single batch call
      onItemRemove(indicesToRemove);
    } else {
      // If it's a subproduct, just remove it
      onItemRemove(index);
    }
  };

  // Helper function to find all items (parent + subproducts) for a given parent item
  // Subproducts are items that come immediately after their parent with is_subproduct=true and same product_id
  const getItemWithSubproducts = (parentItem: QuotationItemType) => {
    const itemAndSubproducts = [parentItem];
    const parentIndex = items.indexOf(parentItem);

    // Find all consecutive subproducts after this parent item
    let i = parentIndex + 1;
    while (
      i < items.length &&
      items[i].is_subproduct &&
      items[i].product_id === parentItem.product_id
    ) {
      itemAndSubproducts.push(items[i]);
      i++;
    }

    return itemAndSubproducts;
  };

  // Only categorize parent products (not subproducts) - subproducts stay with their parents
  const parentItems = items.filter((item) => !item.is_subproduct);
  const softwareItems = parentItems.filter(
    (item) => getItemCategory(item) === ProductCategory.SOFTWARE,
  );
  const hardwareItems = parentItems.filter(
    (item) => getItemCategory(item) === ProductCategory.HARDWARE,
  );

  // Calculate totals including subproducts for each category
  const calculateCategoryTotal = (parentItems: QuotationItemType[]) => {
    return parentItems.reduce((sum, parentItem) => {
      const itemAndSubproducts = getItemWithSubproducts(parentItem);
      return (
        sum +
        itemAndSubproducts.reduce(
          (itemSum, item) => itemSum + (item.is_free ? 0 : item.total_price),
          0,
        )
      );
    }, 0);
  };

  const softwareTotal = calculateCategoryTotal(softwareItems);
  const hardwareTotal = calculateCategoryTotal(hardwareItems);

  // Calculate total discount
  const totalDiscount = discounts.reduce((sum, d) => sum + d.amount, 0);

  const total = softwareTotal + hardwareTotal + totalDiscount;

  return (
    <section
      className="flex-1 p-4 lg:p-8 bg-slate-50 overflow-y-auto"
      aria-label="Xem trước báo giá"
    >
      <div className="max-w-5xl mx-auto bg-white lg:shadow-xl lg:rounded-xl lg:border lg:border-slate-300 flex flex-col min-h-full">
        {/* Preview Header - Desktop Only */}
        <div className="hidden lg:block p-6 border-b border-slate-200 bg-slate-50/50 rounded-t-xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Xem trước báo giá
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Sản phẩm được phát triển bởi OSCAR TEAM, Chúc OSCAR TEAM đạt 100%
              KPI tháng này !!
            </p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase">
              Đang soạn thảo
            </span>
          </div>
        </div>

        <div className="p-4 lg:p-8 pb-32 lg:pb-4 space-y-6 lg:space-y-8 flex-1">
          {/* Customer Info Form */}
          <QuotationForm
            customerName={customerName}
            customerPhone={customerPhone}
            customerAddress={customerAddress}
            customerModel={customerModel}
            onCustomerNameChange={onCustomerNameChange}
            onCustomerPhoneChange={onCustomerPhoneChange}
            onCustomerAddressChange={onCustomerAddressChange}
            onCustomerModelChange={onCustomerModelChange}
          />

          {/* Items Section */}
          <div className="bg-white shadow-sm rounded-xl border border-slate-300 overflow-hidden">
            {/* Software Items */}
            {softwareItems.length > 0 && (
              <>
                <div className="bg-slate-100/50 py-2 px-4 text-xs lg:text-sm font-bold text-primary uppercase tracking-wider">
                  <span className="hidden lg:inline">A. PHẦN MỀM</span>
                  <span className="lg:hidden">Phần mềm</span>
                </div>
                <div className="divide-y divide-slate-200">
                  {softwareItems.map((parentItem) => {
                    const itemAndSubproducts =
                      getItemWithSubproducts(parentItem);
                    return itemAndSubproducts.map((item, idx) => {
                      const globalIndex = items.indexOf(item);
                      return (
                        <QuotationItemRow
                          key={`${parentItem.id}-${idx}`}
                          item={item}
                          index={globalIndex}
                          onUpdate={onItemUpdate}
                          onRemove={handleItemRemove}
                        />
                      );
                    });
                  })}
                </div>
              </>
            )}

            {/* Hardware Items */}
            {hardwareItems.length > 0 && (
              <>
                <div className="bg-slate-100/50 py-2 px-4 text-xs lg:text-sm font-bold text-primary uppercase tracking-wider">
                  <span className="hidden lg:inline">B. PHẦN CỨNG</span>
                  <span className="lg:hidden">Phần cứng</span>
                </div>
                <div className="divide-y divide-slate-200">
                  {hardwareItems.map((parentItem) => {
                    const itemAndSubproducts =
                      getItemWithSubproducts(parentItem);
                    return itemAndSubproducts.map((item, idx) => {
                      const globalIndex = items.indexOf(item);
                      return (
                        <QuotationItemRow
                          key={`${parentItem.id}-${idx}`}
                          item={item}
                          index={globalIndex}
                          onUpdate={onItemUpdate}
                          onRemove={handleItemRemove}
                        />
                      );
                    });
                  })}
                </div>
              </>
            )}

            {/* Empty State */}
            {items.length === 0 && (
              <div className="text-center py-12 px-4">
                {/* Mobile Empty State */}
                <div className="lg:hidden flex flex-col items-center justify-center min-h-[50vh]">
                  <div className="w-48 h-48 bg-primary/5 rounded-full blur-3xl opacity-50 mb-6" />
                  <div className="w-32 h-32 mb-6 flex items-center justify-center">
                    <FileText className="w-24 h-24 text-outline/50" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-on-surface mb-3">
                    Chưa có sản phẩm
                  </h3>
                  <p className="text-on-surface-variant leading-relaxed max-w-[280px] opacity-70 mb-8">
                    Bắt đầu bằng việc thêm các sản phẩm đầu tiên vào bảng báo giá của bạn.
                  </p>
                  {onOpenMobileProductSheet && (
                    <button
                      onClick={onOpenMobileProductSheet}
                      className="w-full max-w-xs h-14 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                      </svg>
                      Thêm sản phẩm
                    </button>
                  )}
                </div>

                {/* Desktop Empty State */}
                <div className="hidden lg:block">
                  <FileText
                    className="w-16 h-16 text-slate-400 mx-auto mb-4"
                    aria-hidden="true"
                  />
                  <p className="text-slate-700">Chưa có sản phẩm nào</p>
                  <p className="text-slate-500 text-sm mt-2">
                    Chọn sản phẩm từ sidebar bên trái để thêm vào báo giá
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Discounts Section */}
          <DiscountSection
            discounts={discounts}
            onAddDiscount={onAddDiscount}
            onUpdateDiscount={onUpdateDiscount}
            onRemoveDiscount={onRemoveDiscount}
          />
        </div>

        {/* Summary Section - Desktop Only (Mobile has sticky footer) */}
        <div className="hidden lg:flex justify-end p-4 pr-8 shadow-lg">
          <QuotationSummary
            softwareTotal={softwareTotal}
            hardwareTotal={hardwareTotal}
            discounts={discounts}
            total={total}
          />
        </div>

        {/* Footer Actions - Desktop Only (Mobile has sticky footer) */}
        <div className="hidden lg:block">
          <QuotationFooter
            onExport={onExport}
            onExportPdf={onExportPdf}
            onSave={onSave}
            isSaving={isSaving}
            isExporting={isExporting}
            isExportingPdf={isExportingPdf}
            itemCount={items.length}
          />
        </div>
      </div>
    </section>
  );
}
