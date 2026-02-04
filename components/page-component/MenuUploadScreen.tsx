"use client";

import type React from "react";

import { Button } from "../ui/Button";
import { Upload, Loader2 } from "lucide-react";

interface MenuUploadScreenProps {
  onUpload: (file: File) => void;
  loading: boolean;
}

export default function MenuUploadScreen({
  onUpload,
  loading,
}: MenuUploadScreenProps) {
  const handleFileChange = (file: File | null) => {
    if (!file) return;

    // Kiểm tra định dạng file
    if (!file.type.startsWith("image/")) {
      alert("⚠️ Vui lòng chọn file ảnh (JPG, PNG, WEBP...)");
      return;
    }

    // Kiểm tra dung lượng file (tối đa 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("⚠️ Ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn 10MB");
      return;
    }

    // Tạo preview (nếu cần)
    const reader = new FileReader();
    reader.readAsDataURL(file);

    // Upload
    onUpload(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFileChange(file || null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 text-foreground">
            Menu Digitizer - Số hóa thực đơn
          </h1>
          <p className="text-lg text-muted-foreground">
            Chuyển đổi ảnh thực đơn nhà hàng thành dữ liệu có cấu trúc bằng AI
          </p>
          <p className="mt-2 text-sm text-primary font-semibold">
            Sản phẩm của OSCAR TEAM. Chúc OSCAR TEAM về 100% số cuối tháng!
          </p>
        </div>

        <div
          className="border-2 border-dashed rounded-xl p-12 text-center transition-colors border-border bg-muted/30"
        >
          <Upload className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2 text-foreground">
            {loading ? "Đang xử lý thực đơn của bạn..." : "Tải ảnh thực đơn lên"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {loading
              ? "AI đang phân tích thực đơn. Vui lòng chờ trong giây lát..."
              : "Bấm để chọn ảnh thực đơn (JPG, PNG, WEBP...). Ảnh rõ nét sẽ cho kết quả tốt nhất"}
          </p>

          {loading && (
            <div className="flex justify-center mb-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            disabled={loading}
            className="hidden"
            id="file-input"
          />
          <label htmlFor="file-input">
            <Button
              type="button"
              onClick={() => document.getElementById("file-input")?.click()}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? "Đang xử lý..." : "Chọn ảnh"}
            </Button>
          </label>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Nhanh chóng", description: "Trích xuất dữ liệu thực đơn chỉ trong vài giây" },
            { title: "Chính xác", description: "AI nhận diện và bóc tách dữ liệu chuẩn xác" },
            { title: "Dễ dàng xuất file", description: "Tải về dưới dạng file Excel tiện lợi" },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="bg-card rounded-lg p-6 border border-border"
            >
              <h3 className="font-semibold mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
