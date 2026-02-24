"use client";

import { useState, useEffect } from "react";
import {
  Product,
  ProductCategory,
  QuotationItem,
  ProductWithSubproducts,
} from "@/types/quotation";
import { Search, Plus, Check, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface QuotationSidebarProps {
  onAddItem: (item: QuotationItem | QuotationItem[]) => void;
  selectedItems: QuotationItem[];
  onOpenSubproductModal?: (product: ProductWithSubproducts) => void;
}

export function QuotationSidebar({
  onAddItem,
  selectedItems,
  onOpenSubproductModal,
}: QuotationSidebarProps) {
  const [products, setProducts] = useState<
    (Product | ProductWithSubproducts)[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory>(
    ProductCategory.SOFTWARE,
  );
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
      const response = await fetch(
        `/api/products?${params}&include_subproducts=true`,
      );
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
    // Check if product has subproducts
    if (
      "subproducts" in product &&
      product.subproducts &&
      product.subproducts.length > 0
    ) {
      // Open subproduct selection modal
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
    // Direct add for products without subproducts
    onAddItem(itemToAdd);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const isProductSelected = (productId: string) => {
    return selectedItems.some((item) => item.product_id === productId);
  };

  return (
    <div className="w-[450px] bg-white border-r border-slate-300 flex flex-col h-full sticky top-[57px]">
      {/* Header */}
      <div className="p-4 border-b border-slate-300">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Danh sách sản phẩm
        </h2>

        {/* Category Filter */}
        <div className="flex bg-slate-100 p-1 rounded-lg mb-4">
          <Button
            variant={
              categoryFilter === ProductCategory.SOFTWARE ? "primary" : "ghost"
            }
            size="md"
            className="flex-1"
            onClick={() => setCategoryFilter(ProductCategory.SOFTWARE)}
          >
            Phần mềm
          </Button>
          <Button
            variant={
              categoryFilter === ProductCategory.HARDWARE ? "primary" : "ghost"
            }
            size="md"
            className="flex-1"
            onClick={() => setCategoryFilter(ProductCategory.HARDWARE)}
          >
            Phần cứng
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            variant="secondary"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {loading ? (
          <div className="text-center text-slate-600 py-8">Đang tải...</div>
        ) : products.length === 0 ? (
          <div className="text-center text-slate-600 py-8">
            Không tìm thấy sản phẩm
          </div>
        ) : (
          products.map((product) => {
            const isSelected = isProductSelected(product.id);
            return (
              <div
                key={product.id}
                className={`group flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? "bg-blue-50 border-[#2463eb]"
                    : "bg-white border-slate-200 hover:border-[#2463eb]/50 hover:shadow-sm"
                }`}
              >
                {/* Product Image Thumbnail */}
                {product.image_url ? (
                  <div className="shrink-0 w-20 h-20 rounded-lg border-2 border-slate-200 overflow-hidden bg-white">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="shrink-0 w-20 h-20 rounded-lg border-2 border-slate-200 bg-slate-100 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-slate-400" />
                  </div>
                )}

                {/* Product Info */}
                <div className="flex flex-col flex-1 min-w-0 gap-y-1">
                  <h3 className={`text-sm font-semibold truncate ${
                    isSelected ? "text-slate-900" : "text-slate-900"
                  }`}>
                    {product.name}
                  </h3>
                  <p className="text-green-700 text-sm font-semibold">
                    Giá: {formatPrice(product.price)}
                  </p>
                </div>

                {/* Add Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddProduct(product);
                  }}
                  disabled={isSelected}
                  className={`
                    shrink-0 w-10 h-10 flex items-center justify-center rounded-full
                    transition-all duration-200
                    ${
                      isSelected
                        ? "bg-[#2463eb] text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-[#2463eb] group-hover:text-white"
                    }
                    disabled:cursor-not-allowed disabled:opacity-60
                  `}
                  aria-label={isSelected ? "Đã thêm" : "Thêm sản phẩm"}
                >
                  {isSelected ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Plus className="w-5 h-5 transition-transform group-hover:scale-110" />
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
