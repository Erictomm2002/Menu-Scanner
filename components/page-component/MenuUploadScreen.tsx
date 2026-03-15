"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "../ui/Button";
import { Upload, Loader2, FileImage, X, Sparkles, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/Card";

interface MenuUploadScreenProps {
  onUpload: (files: File[], extractionOption: "default" | "base_price") => void;
  loading: boolean;
  onBack?: () => void;
}

export default function MenuUploadScreen({
  onUpload,
  loading,
  onBack,
}: MenuUploadScreenProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [extractionOption, setExtractionOption] = useState<"default" | "base_price">("default");

  const MAX_IMAGES = 10;

  const handleFileChange = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles);

    // Check if adding new files would exceed limit
    if (files.length + newFiles.length > MAX_IMAGES) {
      alert(`⚠️ Bạn chỉ có thể tải lên tối đa ${MAX_IMAGES} ảnh. Vui lòng bỏ bớt ảnh và thử lại.`);
      return;
    }

    const allFiles = [...files, ...newFiles].slice(0, MAX_IMAGES);

    // Filter and validate files
    const validatedFiles = allFiles.filter(file => {
      if (!file.type.startsWith("image/")) {
        alert(`⚠️ File '${file.name}' không phải là ảnh và sẽ bị bỏ qua.`);
        return false;
      }
      if (file.size > 20 * 1024 * 1024) {
        alert(`⚠️ Ảnh '${file.name}' quá lớn (> 20MB) và sẽ bị bỏ qua.`);
        return false;
      }
      return true;
    });

    setFiles(validatedFiles);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files);
    // Reset input để có thể chọn lại file giống nhau
    e.target.value = "";
  };

  const handleUploadClick = () => {
    if (files.length === 0) {
      alert("Vui lòng chọn ít nhất 1 ảnh để tải lên.");
      return;
    }
    onUpload(files, extractionOption);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 pt-6 neubrutal-theme">
      <div className="w-full max-w-2xl">
        {onBack && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Button
              variant="neubrutal"
              nbColor="outline"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="font-pixel text-4xl font-bold mb-3 text-[#FF6B9D] nb-shadow-sm nb-transition">
            Menu Digitizer - Số hóa thực đơn
          </h1>
          <p className="font-pixel-body text-lg text-[#2D3436]">
            Chuyển đổi ảnh thực đơn nhà hàng thành dữ liệu có cấu trúc bằng AI
          </p>
          <p className="mt-2 font-pixel text-sm text-[#4ECDC4] font-semibold">
            Sản phẩm của OSCAR TEAM. Chúc OSCAR TEAM về 100% số cuối tháng!
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="nb-bg-primary nb-border-2 nb-shadow-md nb-card-hover nb-transition rounded-2xl p-8 text-center"
        >
          <motion.div
            animate={{ y: loading ? [0, -10, 0] : 0 }}
            transition={{ duration: 2, repeat: loading ? Infinity : 0 }}
          >
            <Sparkles className="w-20 h-20 mx-auto mb-4 text-[#FFB347]" />
          </motion.div>
          <h2 className="font-pixel text-2xl font-semibold mb-2 text-[#2D3436]">
            {loading ? "Đang xử lý thực đơn của bạn..." : `Tải lên tối đa ${MAX_IMAGES} ảnh thực đơn`}
          </h2>
          <p className="font-pixel-body text-[#636E72] mb-6">
            {loading
              ? "AI đang phân tích thực đơn. Vui lòng chờ trong giây lát..."
              : "Bấm để chọn ảnh (JPG, PNG, WEBP...). Ảnh rõ nét sẽ cho kết quả tốt nhất."}
          </p>

          {loading ? (
            <div className="flex justify-center mb-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#4ECDC4]" />
            </div>
          ) : (
            <>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleInputChange}
                disabled={loading || files.length >= MAX_IMAGES}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input">
                <Button
                  type="button"
                  onClick={() => document.getElementById("file-input")?.click()}
                  disabled={loading || files.length >= MAX_IMAGES}
                  variant="neubrutal"
                  nbColor="primary"
                  className="mb-4 px-8 py-3"
                >
                  Chọn ảnh
                </Button>
              </label>
            </>
          )}
        </motion.div>

        {files.length > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="mt-4 text-left space-y-2"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-pixel font-semibold text-[#2D3436]">Ảnh đã chọn:</h3>
              <span className={`font-pixel text-sm ${files.length >= MAX_IMAGES ? "text-[#FF6B6B] font-semibold" : "text-[#636E72]"}`}>
                {files.length} / {MAX_IMAGES}
              </span>
            </div>
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between nb-bg-secondary nb-border-2 nb-shadow-sm nb-transition p-3 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#FFB347]/20 rounded-lg p-2">
                    <FileImage className="w-5 h-5 text-[#FFB347]" />
                  </div>
                  <span className="font-pixel-body text-sm font-medium text-[#2D3436]">{file.name}</span>
                </div>
                <Button
                  variant="neubrutal"
                  nbColor="outline"
                  size="sm"
                  onClick={() => handleRemoveFile(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-left nb-bg-primary nb-border-2 nb-shadow-md nb-transition p-4 rounded-2xl"
          >
            <h3 className="font-pixel font-semibold mb-3 text-[#2D3436]">Tùy chọn trích xuất:</h3>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer p-3 nb-bg-white nb-border-2 nb-shadow-sm nb-button-hover nb-transition rounded-xl">
                <input
                  type="radio"
                  name="extractionOption"
                  value="default"
                  checked={extractionOption === "default"}
                  onChange={() => setExtractionOption("default")}
                  className="mt-1 accent-[#4ECDC4]"
                />
                <div>
                  <span className="font-pixel font-medium text-[#2D3436]">Chi tiết (Mặc định)</span>
                  <p className="font-pixel-body text-sm text-[#636E72]">
                    Tách riêng từng biến thể giá/size (VD: Café S, Café L)
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer p-3 nb-bg-white nb-border-2 nb-shadow-sm nb-button-hover nb-transition rounded-xl">
                <input
                  type="radio"
                  name="extractionOption"
                  value="base_price"
                  checked={extractionOption === "base_price"}
                  onChange={() => setExtractionOption("base_price")}
                  className="mt-1 accent-[#4ECDC4]"
                />
                <div>
                  <span className="font-pixel font-medium text-[#2D3436]">Cơ bản</span>
                  <p className="font-pixel-body text-sm text-[#636E72]">
                    Chỉ lấy giá thấp nhất làm giá gốc, bỏ qua size
                  </p>
                </div>
              </label>
            </div>
          </motion.div>
        )}

        {files.length > 0 && (
          <Button
            type="button"
            onClick={handleUploadClick}
            disabled={loading}
            variant="neubrutal"
            nbColor="secondary"
            className="mt-6 w-full px-8 py-3 text-lg"
          >
            {loading ? "Đang xử lý..." : `Bắt đầu xử lý ${files.length} ảnh`}
          </Button>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { title: "Nhanh chóng", description: "Trích xuất dữ liệu thực đơn chỉ trong vài giây", icon: "zap" },
            { title: "Chính xác", description: "AI nhận diện và bóc tách dữ liệu chuẩn xác", icon: "check-circle" },
            { title: "Dễ dàng xuất file", description: "Tải về dưới dạng file Excel tiện lợi", icon: "download" },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="group"
            >
              <div className="nb-bg-white nb-border-2 nb-shadow-md nb-card-hover nb-transition p-6 rounded-2xl">
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-[#FFB347]/20 rounded-full p-2">
                        <Sparkles className="w-5 h-5 text-[#FFB347]" />
                      </div>
                      <h3 className="font-pixel font-semibold text-[#2D3436] text-lg">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="font-pixel-body text-sm text-[#636E72]">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
