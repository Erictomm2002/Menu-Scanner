"use client";

import { useState, useEffect } from "react";
import { Product, ProductCategory } from "@/types/quotation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

interface ProductFormProps {
  product?: Product;
  onSave: (product: Partial<Product>) => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ProductCategory>(ProductCategory.SOFTWARE);
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setDescription(product.description || "");
      setUnit(product.unit);
      setPrice(product.price.toString());
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !unit.trim() || !price) {
      return;
    }

    onSave({
      name: name.trim(),
      category,
      description: description.trim() || undefined,
      unit: unit.trim(),
      price: parseFloat(price),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">
          {product ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
        </h3>
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-white/70">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Input
        variant="glass"
        label="Tên sản phẩm *"
        placeholder="Nhập tên sản phẩm..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium mb-1.5 block text-white/70">
            Danh mục *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ProductCategory)}
            className="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value={ProductCategory.SOFTWARE}>Phần mềm</option>
            <option value={ProductCategory.HARDWARE}>Phần cứng</option>
          </select>
        </div>

        <Input
          variant="glass"
          label="Đơn vị *"
          placeholder="ví dụ: Chiếc, Năm, Gói..."
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          required
        />
      </div>

      <Input
        variant="glass"
        label="Đơn giá (VND) *"
        type="number"
        min="0"
        placeholder="Nhập đơn giá..."
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />

      <Input
        variant="glass"
        label="Diễn giải"
        placeholder="Mô tả ngắn về sản phẩm..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="glass"
          className="flex-1"
          onClick={onCancel}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          variant="default"
          gradient="blue-cyan"
          className="flex-1"
        >
          {product ? "Cập nhật" : "Thêm mới"}
        </Button>
      </div>
    </form>
  );
}
