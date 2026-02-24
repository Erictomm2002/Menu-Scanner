"use client";

import { useState, useEffect, useRef } from "react";
import { Product, ProductCategory, Subproduct, ProductWithSubproducts } from "@/types/quotation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { X, Image as ImageIcon, Upload } from "lucide-react";
import { SubproductManager } from "./SubproductManager";
import { MarkdownInput } from "./MarkdownInput";
import { productToFormData } from "@/libs/image-storage";

interface ProductFormProps {
  product?: ProductWithSubproducts | Product;
  onSave: (product: Partial<ProductWithSubproducts> | FormData) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function ProductForm({ product, onSave, onCancel, isSaving }: ProductFormProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "subproducts">("basic");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ProductCategory>(ProductCategory.SOFTWARE);
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");
  const [subproducts, setSubproducts] = useState<Subproduct[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [deleteImage, setDeleteImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Sync preview URL when image file changes
  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [imageFile]);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setDescription(product.description || "");
      setUnit(product.unit);
      setPrice(product.price.toString());
      // Check if subproducts exist
      if ("subproducts" in product && product.subproducts) {
        setSubproducts(product.subproducts);
      }
      // Set preview URL from existing image
      if (product.image_url) {
        setPreviewUrl(product.image_url);
      }
    } else {
      // Reset form for new product
      setName("");
      setCategory(ProductCategory.SOFTWARE);
      setDescription("");
      setUnit("");
      setPrice("");
      setSubproducts([]);
      setImageFile(null);
      setDeleteImage(false);
      setPreviewUrl(null);
      setActiveTab("basic");
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = "Vui lòng nhập tên sản phẩm";
    }
    if (!unit.trim()) {
      newErrors.unit = "Vui lòng nhập đơn vị";
    }
    if (!price || parseFloat(price) < 0) {
      newErrors.price = "Vui lòng nhập đơn giá hợp lệ";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const productData: Partial<ProductWithSubproducts> = {
      name: name.trim(),
      category,
      description: description.trim() || " ",
      unit: unit.trim(),
      price: parseFloat(price),
      subproducts: subproducts,
    };

    // If image file or delete flag is set, use FormData for multipart upload
    if (imageFile || deleteImage) {
      const formData = productToFormData(productData, imageFile || undefined);
      if (deleteImage) {
        formData.append('deleteImage', 'true');
      }
      onSave(formData);
    } else {
      // No image changes, send regular data
      onSave(productData);
    }
  };

  const handleImageSelect = (file: File | null) => {
    if (file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert('Chỉ chấp nhận file ảnh (PNG, JPG, WebP, GIF)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không quá 5MB');
        return;
      }
      setImageFile(file);
      setDeleteImage(false);
    }
  };

  const handleDeleteImage = () => {
    setPreviewUrl(null);
    setImageFile(null);
    setDeleteImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 id="modal-title" className="text-lg font-semibold text-slate-800">
          {product ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
        </h3>
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-slate-500">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("basic")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "basic"
              ? "border-[#2463eb] text-[#2463eb]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Thông tin cơ bản
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("subproducts")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "subproducts"
              ? "border-[#2463eb] text-[#2463eb]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Subproducts ({subproducts.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "basic" ? (
        <div className="space-y-4">
          {/* Product Image */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-700">Hình ảnh sản phẩm</div>
            {previewUrl ? (
              <div className="relative group">
                <img
                  src={previewUrl}
                  alt={product?.name || "Product image"}
                  className="w-full max-h-64 object-contain rounded-lg border border-slate-200 bg-slate-50"
                />
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  disabled={isSaving}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Delete image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-slate-300 rounded-lg hover:border-[#2463eb] hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-8 h-8 text-slate-400" />
                  <span className="text-sm text-slate-600">Chọn ảnh</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageSelect(file);
                  }}
                  className="hidden"
                  disabled={isSaving}
                />
              </div>
            )}
          </div>

          <div>
            <Input
              label="Tên sản phẩm *"
              placeholder="Nhập tên sản phẩm..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              required
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold mb-1.5 block text-slate-700">
                Danh mục *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2463eb] focus:border-[#2463eb] transition-colors"
              >
                <option value={ProductCategory.SOFTWARE}>Phần mềm</option>
                <option value={ProductCategory.HARDWARE}>Phần cứng</option>
              </select>
            </div>

            <div>
              <Input
                label="Đơn vị *"
                placeholder="ví dụ: Chiếc, Năm, Gói..."
                value={unit}
                onChange={(e) => {
                  setUnit(e.target.value);
                  if (errors.unit) setErrors({ ...errors, unit: "" });
                }}
                required
              />
              {errors.unit && (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  {errors.unit}
                </p>
              )}
            </div>
          </div>

          <div>
            <Input
              label="Đơn giá (VND) *"
              type="number"
              min="0"
              placeholder="Nhập đơn giá..."
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                if (errors.price) setErrors({ ...errors, price: "" });
              }}
              required
            />
            {errors.price && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.price}
              </p>
            )}
          </div>

          <MarkdownInput
            label="Diễn giải (Markdown)"
            placeholder="Mô tả ngắn về sản phẩm với Markdown...&#10;- **In đậm** với **text**&#10;- *In nghiêng* với *text*&#10;- Tiêu đề với ## Text&#10;- Bullet list với - item"
            value={description}
            onChange={setDescription}
            helperText="Hỗ trợ định dạng Markdown để xuất Excel với in đậm, in nghiêng, xuống dòng"
          />
        </div>
      ) : (
        <SubproductManager subproducts={subproducts} onChange={setSubproducts} />
      )}

      {/* Footer */}
      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isSaving}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          disabled={isSaving}
        >
          {isSaving ? "Đang lưu..." : (product ? "Cập nhật" : "Thêm mới")}
        </Button>
      </div>
    </form>
  );
}
