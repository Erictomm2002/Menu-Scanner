"use client";

import { useState, useEffect } from "react";
import { Product, ProductCategory } from "@/types/quotation";
import { Search, Plus, Edit, Trash2, Package, Cpu } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ProductForm } from "./ProductForm";

interface ProductListProps {
  onProductsChange?: (products: Product[]) => void;
}

export function ProductList({ onProductsChange }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "all">("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, searchQuery]);

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

  const handleSave = async (product: Partial<Product>) => {
    try {
      let response;
      if (editingProduct) {
        response = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(product),
        });
      } else {
        response = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(product),
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
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Quản lý sản phẩm</h2>
        <Button variant="default" gradient="blue-cyan" onClick={() => { setEditingProduct(null); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm sản phẩm
        </Button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg ${
            message.type === "success" ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4" />
          <Input
            variant="glass"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={categoryFilter === "all" ? "default" : "glass"}
            size="sm"
            onClick={() => setCategoryFilter("all")}
          >
            Tất cả
          </Button>
          <Button
            variant={categoryFilter === ProductCategory.SOFTWARE ? "default" : "glass"}
            size="sm"
            onClick={() => setCategoryFilter(ProductCategory.SOFTWARE)}
          >
            Phần mềm
          </Button>
          <Button
            variant={categoryFilter === ProductCategory.HARDWARE ? "default" : "glass"}
            size="sm"
            onClick={() => setCategoryFilter(ProductCategory.HARDWARE)}
          >
            Phần cứng
          </Button>
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900/95 rounded-xl p-6 border border-white/20 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <ProductForm
              product={editingProduct || undefined}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingProduct(null); }}
            />
          </div>
        </div>
      )}

      {/* Product List */}
      {loading ? (
        <div className="text-center text-white/50 py-12">Đang tải...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/50">Không có sản phẩm nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
            >
              {/* Category Icon */}
              <div className={`p-2 rounded-lg ${product.category === ProductCategory.SOFTWARE ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {product.category === ProductCategory.SOFTWARE ? <Cpu className="w-5 h-5" /> : <Package className="w-5 h-5" />}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">{product.name}</h3>
                {product.description && (
                  <p className="text-white/60 text-sm truncate">{product.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-white/50 text-xs">{product.unit}</span>
                  <span className="text-cyan-400 font-bold text-sm font-mono">{formatPrice(product.price)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setEditingProduct(product); setShowForm(true); }}
                  className="text-white/70 hover:text-white"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
