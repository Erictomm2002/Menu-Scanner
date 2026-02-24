"use client";

import { useState } from "react";
import { QuotationSidebar } from "@/components/quotation/QuotationSidebar";
import { QuotationPreview } from "@/components/quotation/QuotationPreview";
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
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-300">
        <div className=" w-full px-6 py-4">
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

      {/* Main Content - Split View */}
      <div className="flex h-[calc(100vh-57px)]">
        <QuotationSidebar
          onAddItem={handleAddItem}
          selectedItems={items}
          onOpenSubproductModal={handleOpenSubproductModal}
        />
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
          onSave={handleSave}
          isSaving={isSaving}
        />
      </div>

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
