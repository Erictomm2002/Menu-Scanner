"use client";

import { useState, useEffect, useRef } from "react";
import { Product, ProductCategory, ProductWithCount } from "@/types/quotation";
import { Search, Plus, Edit, Trash2, Package, Cpu, Settings, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ProductForm } from "./ProductForm";
import { DescriptionDisplay } from "./DescriptionDisplay";

interface ProductListProps {
  onProductsChange?: (products: Product[]) => void;
}

export function ProductList({ onProductsChange }: ProductListProps) {
  const [products, setProducts] = useState<ProductWithCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "all">("all");
  const [editingProduct, setEditingProduct] = useState<ProductWithCount | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, searchQuery]);

  // Modal accessibility: Focus trapping and escape key handling
  useEffect(() => {
    if (!showForm) {
      document.body.style.overflow = "auto";
      return;
    }

    document.body.style.overflow = "hidden";

    // Focus first input when modal opens
    const focusableElements = modalContentRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements && focusableElements.length > 0) {
      setTimeout(() => focusableElements[0]?.focus(), 100);
    }

    // Escape key handler
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowForm(false);
        setEditingProduct(null);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);

    // Focus trapping
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

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
  }, [showForm]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (categoryFilter !== "all") {
        params.append("category", categoryFilter);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products || []);
        onProductsChange?.(data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== id));
        setMessage({ type: "success", text: "Đã xóa sản phẩm" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const data = await response.json();
        setMessage({ type: "error", text: data.error || "Lỗi khi xóa" });
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      setMessage({ type: "error", text: "Lỗi khi xóa" });
    }
  };

  const handleSave = async (product: any) => {
    setIsSaving(true);
    try {
      let response;
      let body: any = product;
      let headers: HeadersInit = {};

      // Check if product is FormData (for image upload)
      if (product instanceof FormData) {
        // Don't set Content-Type header for FormData - browser will set it with boundary
        body = product;
      } else {
        headers = { "Content-Type": "application/json" };
        body = JSON.stringify(product);
      }

      if (editingProduct) {
        response = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers,
          body,
        });
      } else {
        response = await fetch("/api/products", {
          method: "POST",
          headers,
          body,
        });
      }

      const data = await response.json();

      if (response.ok) {
        await fetchProducts();
        setShowForm(false);
        setEditingProduct(null);
        setMessage({ type: "success", text: "Đã lưu sản phẩm" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: data.error || "Lỗi khi lưu" });
      }
    } catch (error) {
      console.error("Error saving product:", error);
      setMessage({ type: "error", text: "Lỗi khi lưu" });
    } finally {
      setIsSaving(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Danh sách sản phẩm</h1>
            <p className="text-slate-500 text-sm mt-1">Quản lý sản phẩm và subproducts</p>
          </div>
          <Button
            variant="primary"
            onClick={() => { setEditingProduct(null); setShowForm(true); }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`px-4 py-3 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={categoryFilter === "all" ? "primary" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter("all")}
            >
              Tất cả
            </Button>
            <Button
              variant={categoryFilter === ProductCategory.SOFTWARE ? "primary" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(ProductCategory.SOFTWARE)}
            >
              Phần mềm
            </Button>
            <Button
              variant={categoryFilter === ProductCategory.HARDWARE ? "primary" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(ProductCategory.HARDWARE)}
            >
              Phần cứng
            </Button>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Đang tải...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500">Không có sản phẩm nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-16">Hình ảnh</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tên sản phẩm</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Danh mục</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Đơn giá</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Số lượng subproduct</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{product.name}</div>
                      {product.description && (
                        <DescriptionDisplay markdown={product.description} className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-xs" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
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
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-900">{formatPrice(product.price)}</span>
                      <span className="text-xs text-slate-500 ml-1">đ</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-900">
                        {(product as any).subproducts_count || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            const response = await fetch(`/api/products/${product.id}?include_subproducts=true`);
                            const data = await response.json();
                            setEditingProduct(data.product);
                            setShowForm(true);
                          }}
                          className="text-slate-500 hover:text-[#2463eb]"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          className="text-slate-500 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={() => { setShowForm(false); setEditingProduct(null); }}
        >
          <div
            ref={modalContentRef}
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <ProductForm
                product={editingProduct || undefined}
                onSave={handleSave}
                onCancel={() => { setShowForm(false); setEditingProduct(null); }}
                isSaving={isSaving}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
