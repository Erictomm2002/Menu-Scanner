"use client";

import { useState } from "react";
import { QuotationSidebar } from "@/components/quotation/QuotationSidebar";
import { QuotationPreview } from "@/components/quotation/QuotationPreview";
import { MobileProductSheet } from "@/components/quotation/MobileProductSheet";
import { MobileFooterSummary } from "@/components/quotation/MobileFooterSummary";
import { SubproductSelectorModal } from "@/components/quotation/SubproductSelectorModal";
import { QuotationItem, Quotation, ProductWithSubproducts, QuotationDiscount } from "@/types/quotation";
import { calculateQuotationSummary } from "@/libs/quotation-calculator";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function QuotationPage() {
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [discounts, setDiscounts] = useState<QuotationDiscount[]>([]);
  const [showSubproductModal, setShowSubproductModal] = useState(false);
  const [selectedProductForSubproducts, setSelectedProductForSubproducts] = useState<ProductWithSubproducts | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerModel, setCustomerModel] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [savedQuotationId, setSavedQuotationId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleAddItem = (item: QuotationItem | QuotationItem[]) => {
    console.log('=== handleAddItem START ===');
    console.log('Current items count:', items.length);
    console.log('Items being added:', JSON.stringify(item, null, 2));
    if (Array.isArray(item)) {
      // Handle adding multiple items (product with subproducts)
      setItems((prev) => {
        const newItems = [...prev, ...item];
        console.log('After adding (array):', newItems.length, 'items');
        console.log('New items:', JSON.stringify(newItems, null, 2));
        return newItems;
      });
    } else {
      // Handle adding single item
      setItems((prev) => {
        const newItems = [...prev, item];
        console.log('After adding (single):', newItems.length, 'items');
        console.log('New items:', JSON.stringify(newItems, null, 2));
        return newItems;
      });
    }
    setMessage(null);
    console.log('=== handleAddItem END ===');
  };

  const handleOpenSubproductModal = (product: ProductWithSubproducts) => {
    setSelectedProductForSubproducts(product);
    setShowSubproductModal(true);
  };

  const handleSubproductModalClose = () => {
    setShowSubproductModal(false);
    setSelectedProductForSubproducts(null);
  };

  const handleSubproductsConfirm = (subproductItems: QuotationItem[]) => {
    setItems([...items, ...subproductItems]);
    setMessage(null);
  };

  const handleRemoveItem = (index: number | number[]) => {
    if (Array.isArray(index)) {
      // Handle batch removal (parent + subproducts)
      setItems((prevItems) => {
        const indicesSet = new Set(index);
        return prevItems.filter((_, i) => !indicesSet.has(i));
      });
    } else {
      // Handle single removal
      setItems((prevItems) => prevItems.filter((_, i) => i !== index));
    }
  };

  const handleItemUpdate = (index: number, updatedItem: QuotationItem) => {
    const newItems = [...items];
    newItems[index] = updatedItem;
    setItems(newItems);
  };

  // Discount handlers
  const handleAddDiscount = () => {
    const generateId = (): string => {
      return `discount_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };
    const newDiscount: QuotationDiscount = {
      id: generateId(),
      label: "",
      amount: 0,
    };
    setDiscounts([...discounts, newDiscount]);
    setMessage(null);
  };

  const handleUpdateDiscount = (index: number, discount: QuotationDiscount) => {
    const newDiscounts = [...discounts];
    newDiscounts[index] = discount;
    setDiscounts(newDiscounts);
  };

  const handleRemoveDiscount = (index: number) => {
    setDiscounts(discounts.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (items.length === 0) {
      setMessage({ type: "error", text: "Vui lòng chọn ít nhất một sản phẩm" });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const quotationData = {
        items,
        discounts,
        customer_name: customerName || undefined,
        customer_phone: customerPhone || undefined,
        customer_address: customerAddress || undefined,
        customer_model: customerModel || undefined,
      };

      let response;
      let newQuotationId = savedQuotationId;

      if (savedQuotationId) {
        // Update existing quotation
        response = await fetch(`/api/quotations/${savedQuotationId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(quotationData),
        });
      } else {
        // Create new quotation
        response = await fetch("/api/quotations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(quotationData),
        });
      }

      const data = await response.json();

      if (response.ok) {
        newQuotationId = data.quotation?.id;
        setSavedQuotationId(newQuotationId);
        setMessage({
          type: "success",
          text: savedQuotationId
            ? "Đã cập nhật báo giá thành công"
            : "Đã lưu báo giá thành công",
        });

        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);

        return newQuotationId;
      } else {
        setMessage({ type: "error", text: data.error || "Lỗi khi lưu báo giá" });
        return null;
      }
    } catch (error) {
      console.error("Error saving quotation:", error);
      setMessage({ type: "error", text: "Lỗi khi lưu báo giá" });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    if (items.length === 0) {
      setMessage({ type: "error", text: "Vui lòng chọn ít nhất một sản phẩm" });
      return;
    }

    setIsExporting(true);
    setMessage(null);

    try {
      // If not saved, save first and get the returned ID
      let quotationId: string | null = savedQuotationId || null;
      if (!quotationId) {
        const savedId = await handleSave();
        if (!savedId) {
          setMessage({ type: "error", text: "Lỗi khi lưu báo giá trước khi export" });
          return;
        }
        quotationId = savedId;
      }

      // Export
      const response = await fetch(`/api/quotations/${quotationId}/export`, {
        method: "POST",
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const quoteNumber = `BG${new Date().toISOString().slice(0, 10).replace(/-/g, "")}${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
        a.download = `BaoGia_${quoteNumber}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setMessage({ type: "success", text: "Export thành công" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const data = await response.json();
        setMessage({ type: "error", text: data.error || "Lỗi khi export" });
      }
    } catch (error) {
      console.error("Error exporting:", error);
      setMessage({ type: "error", text: "Lỗi khi export" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    if (items.length === 0) {
      setMessage({ type: "error", text: "Vui lòng chọn ít nhất một sản phẩm" });
      return;
    }

    setIsExportingPdf(true);
    setMessage(null);

    try {
      // If not saved, save first and get returned ID
      let quotationId: string | null = savedQuotationId || null;
      if (!quotationId) {
        const savedId = await handleSave();
        if (!savedId) {
          setMessage({ type: "error", text: "Lỗi khi lưu báo giá trước khi export PDF" });
          return;
        }
        quotationId = savedId;
      }

      // Export PDF
      const response = await fetch(`/api/quotations/${quotationId}/export-pdf`, {
        method: "POST",
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const quoteNumber = `BG${new Date().toISOString().slice(0, 10).replace(/-/g, "")}${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
        a.download = `BaoGia_${quoteNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setMessage({ type: "success", text: "Export PDF thành công" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const data = await response.json();
        setMessage({ type: "error", text: data.error || "Lỗi khi export PDF" });
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
      setMessage({ type: "error", text: "Lỗi khi export PDF" });
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Mobile state for bottom sheet
  const [showMobileProductSheet, setShowMobileProductSheet] = useState(false);

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {/* Mobile Header - Fixed Top */}
      <header className="lg:sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 lg:border-b lg:border-slate-300 hidden lg:block">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-5 h-5" />
                <p className="text-base hover:text-blue-600 text-slate-900">
                  Về trang chủ
                </p>
              </Button>
            </Link>

            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#2463eb]" />
              <h1 className="text-xl font-bold text-slate-900">Xuất Báo Giá</h1>
            </div>

            <Link href="/quotation/history">
              <Button variant="ghost" size="md">
                <p className="text-base hover:text-blue-600 text-slate-900">
                  Lịch sử báo giá
                </p>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Top Bar - Always Visible on Mobile */}
      <header className="lg:hidden fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm shadow-teal-900/5 flex items-center justify-between px-4 h-14">
        <Link href="/" className="p-2 hover:bg-zinc-100 transition-colors active:scale-95 duration-200 rounded-full">
          <ArrowLeft className="w-5 h-5 text-teal-700" />
        </Link>
        <h1 className="font-bold text-lg text-teal-800">Xuất Báo Giá</h1>
        <Link href="/quotation/history" className="p-2 hover:bg-zinc-100 transition-colors active:scale-95 duration-200 rounded-full">
          <FileText className="w-5 h-5 text-teal-700" />
        </Link>
      </header>

      {/* Message */}
      {message && (
        <div
          className={`fixed top-20 right-6 z-50 px-6 py-4 rounded-xl shadow-lg transition-all ${
            message.type === "success"
              ? "bg-[#10b981] text-white"
              : "bg-[#ef4444] text-white"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Desktop Sidebar - Hidden on Mobile */}
        <div className="hidden lg:block">
          <QuotationSidebar
            onAddItem={handleAddItem}
            selectedItems={items}
            onOpenSubproductModal={handleOpenSubproductModal}
          />
        </div>

        {/* Mobile Product Sheet Overlay */}
        {showMobileProductSheet && (
          <>
            {/* Backdrop */}
            <div
              className="lg:hidden fixed inset-0 bg-on-surface/40 z-[60] backdrop-blur-[2px]"
              onClick={() => setShowMobileProductSheet(false)}
            />
            {/* Bottom Sheet */}
            <div className="lg:hidden fixed inset-x-0 bottom-0 z-[70] bg-surface-container-lowest rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col max-h-[85vh]">
              {/* Handle */}
              <div className="flex flex-col items-center pt-3 pb-2">
                <div className="w-8 h-1 bg-outline-variant/30 rounded-full mb-4" />
              </div>
              <div className="px-4 pb-4">
                <MobileProductSheet
                  onAddItem={handleAddItem}
                  selectedItems={items}
                  onOpenSubproductModal={handleOpenSubproductModal}
                  onClose={() => setShowMobileProductSheet(false)}
                />
              </div>
            </div>
          </>
        )}

        {/* Main Preview Area */}
        <div className="flex-1 pt-14 lg:pt-0 pb-32 lg:pb-0">
          <QuotationPreview
            customerName={customerName}
            customerPhone={customerPhone}
            customerAddress={customerAddress}
            customerModel={customerModel}
            items={items}
            discounts={discounts}
            onCustomerNameChange={setCustomerName}
            onCustomerPhoneChange={setCustomerPhone}
            onCustomerAddressChange={setCustomerAddress}
            onCustomerModelChange={setCustomerModel}
            onItemUpdate={handleItemUpdate}
            onItemRemove={handleRemoveItem}
            onAddDiscount={handleAddDiscount}
            onUpdateDiscount={handleUpdateDiscount}
            onRemoveDiscount={handleRemoveDiscount}
            onExport={handleExport}
            onExportPdf={handleExportPdf}
            onSave={handleSave}
            isSaving={isSaving}
            isExporting={isExporting}
            isExportingPdf={isExportingPdf}
            onOpenMobileProductSheet={() => setShowMobileProductSheet(true)}
          />
        </div>
      </div>

      {/* Mobile Sticky Footer with Actions */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-2xl rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.08)] border-t border-outline-variant/10">
        <MobileFooterSummary
          items={items}
          discounts={discounts}
          onExport={handleExport}
          onExportPdf={handleExportPdf}
          onSave={handleSave}
          onOpenProductSheet={() => setShowMobileProductSheet(true)}
          isSaving={isSaving}
          isExporting={isExporting}
          isExportingPdf={isExportingPdf}
        />
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 w-full z-40 bg-white/80 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.06)] rounded-t-3xl flex justify-around items-center h-20 px-6 pb-safe">
        <a className="flex flex-col items-center justify-center text-zinc-400 hover:text-teal-600 active:scale-90 transition-transform" href="/">
          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span className="text-[11px] font-medium">Sản phẩm</span>
        </a>
        <a className="flex flex-col items-center justify-center bg-teal-50 text-teal-700 rounded-2xl px-6 py-1 active:scale-90 transition-transform" href="/quotation">
          <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
            <path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/>
          </svg>
          <span className="text-[11px] font-bold">Báo giá</span>
        </a>
        <a className="flex flex-col items-center justify-center text-zinc-400 hover:text-teal-600 active:scale-90 transition-transform" href="/settings">
          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-[11px] font-medium">Cài đặt</span>
        </a>
      </nav>

      {/* Subproduct Selector Modal */}
      {selectedProductForSubproducts && (
        <SubproductSelectorModal
          product={selectedProductForSubproducts}
          isOpen={showSubproductModal}
          onClose={handleSubproductModalClose}
          onConfirm={handleSubproductsConfirm}
        />
      )}
    </main>
  );
}
