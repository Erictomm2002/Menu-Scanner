"use client";

import { useState, useEffect } from "react";
import {
  Product,
  ProductCategory,
  QuotationItem,
  ProductWithSubproducts,
} from "@/types/quotation";
import { Search, Plus, Check, Image as ImageIcon, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import clsx from "clsx";

interface MobileProductSheetProps {
  onAddItem: (item: QuotationItem | QuotationItem[]) => void;
  selectedItems: QuotationItem[];
  onOpenSubproductModal?: (product: ProductWithSubproducts) => void;
  onClose: () => void;
}

export function MobileProductSheet({
  onAddItem,
  selectedItems,
  onOpenSubproductModal,
  onClose,
}: MobileProductSheetProps) {
  const [products, setProducts] = useState<(Product | ProductWithSubproducts)[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory>(ProductCategory.SOFTWARE);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category: categoryFilter,
        limit: "50",
      });
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      const response = await fetch(`/api/products?${params}&include_subproducts=true`);
      const data = await response.json();
      if (response.ok) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = (product: Product | ProductWithSubproducts) => {
    if (
      "subproducts" in product &&
      product.subproducts &&
      product.subproducts.length > 0
    ) {
      onOpenSubproductModal?.(product as ProductWithSubproducts);
      return;
    }

    const itemToAdd = {
      product_id: product.id,
      name: product.name,
      description: product.description || "",
      unit: product.unit,
      quantity: 1,
      unit_price: product.price,
      total_price: product.price,
      is_free: false,
      product_category: product.category,
    };
    onAddItem(itemToAdd);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const isProductSelected = (productId: string) => {
    return selectedItems.some((item) => item.product_id === productId);
  };

  return (
    <div className="flex flex-col max-h-[70vh]">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-headline text-xl font-extrabold text-on-surface">Chọn sản phẩm</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
        >
          <X className="w-5 h-5 text-on-surface-variant" />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
        <Input
          variant="secondary"
          placeholder="Tìm tên sản phẩm, mã SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex bg-surface-container-high p-1.5 rounded-2xl mb-4">
        <button
          onClick={() => setCategoryFilter(ProductCategory.SOFTWARE)}
          className={clsx("flex-1 py-2.5 rounded-xl text-sm font-medium transition-all", {
            "bg-surface-container-lowest text-primary shadow-sm font-bold": categoryFilter === ProductCategory.SOFTWARE,
            "text-on-surface-variant hover:text-primary": categoryFilter !== ProductCategory.SOFTWARE,
          })}
        >
          Phần mềm
        </button>
        <button
          onClick={() => setCategoryFilter(ProductCategory.HARDWARE)}
          className={clsx("flex-1 py-2.5 rounded-xl text-sm font-medium transition-all", {
            "bg-surface-container-lowest text-primary shadow-sm font-bold": categoryFilter === ProductCategory.HARDWARE,
            "text-on-surface-variant hover:text-primary": categoryFilter !== ProductCategory.HARDWARE,
          })}
        >
          Phần cứng
        </button>
      </div>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto px-1 pb-4 space-y-3 max-h-[50vh]">
        {loading ? (
          <div className="text-center text-slate-600 py-8">Đang tải...</div>
        ) : products.length === 0 ? (
          <div className="text-center text-slate-600 py-8">Không tìm thấy sản phẩm</div>
        ) : (
          products.map((product) => {
            const isSelected = isProductSelected(product.id);
            return (
              <div
                key={product.id}
                className={clsx(
                  "flex items-center gap-3 p-3 rounded-2xl transition-all",
                  isSelected
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-surface-container-low hover:bg-surface-container-high border-2 border-transparent"
                )}
              >
                {/* Product Image */}
                {product.image_url ? (
                  <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-white">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="shrink-0 w-16 h-16 rounded-xl bg-surface-container-high flex items-center justify-center">
                    <ImageIcon className="w-7 h-7 text-outline" />
                  </div>
                )}

                {/* Product Info */}
                <div className="flex flex-col flex-1 min-w-0">
                  <h3 className="font-headline font-bold text-on-surface truncate text-sm">
                    {product.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-1 truncate">
                    {product.description?.slice(0, 30) || ""}
                  </p>
                  <span className="font-bold text-primary text-sm">
                    {formatPrice(product.price)}đ
                  </span>
                </div>

                {/* Add Button */}
                <button
                  onClick={() => handleAddProduct(product)}
                  disabled={isSelected}
                  className={clsx(
                    "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90",
                    isSelected
                      ? "bg-primary text-white"
                      : "bg-gradient-to-br from-primary to-primary-container text-white shadow-md shadow-primary/20 hover:opacity-90"
                  )}
                >
                  {isSelected ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
