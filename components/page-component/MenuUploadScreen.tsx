"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "../ui/Button";
import { Upload, Loader2, FileImage, X, ArrowLeft, Sparkles, Zap, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MenuUploadScreenProps {
  onUpload: (files: File[], extractionOption: "default" | "base_price") => void;
  onUploadError?: (error: string) => void;
  loading: boolean;
  onBack?: () => void;
}

export default function MenuUploadScreen({
  onUpload,
  onUploadError,
  loading,
  onBack,
}: MenuUploadScreenProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [extractionOption, setExtractionOption] = useState<"default" | "base_price">("default");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 10;

  const handleFileChange = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles);

    if (files.length + newFiles.length > MAX_IMAGES) {
      alert(`Tối đa ${MAX_IMAGES} ảnh. Vui lòng bỏ bớt.`);
      return;
    }

    const allFiles = [...files, ...newFiles].slice(0, MAX_IMAGES);

    const validatedFiles = allFiles.filter(file => {
      if (!file.type.startsWith("image/")) {
        alert(`File '${file.name}' không phải ảnh.`);
        return false;
      }
      if (file.size > 20 * 1024 * 1024) {
        alert(`Ảnh '${file.name}' quá lớn (> 20MB).`);
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
    e.target.value = "";
  };

  const handleSelectFiles = () => {
    fileInputRef.current?.click();
  };

  const handleUploadClick = () => {
    if (files.length === 0) {
      const errorMsg = "Vui lòng chọn ít nhất 1 ảnh.";
      setUploadError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }
    setUploadError(null);
    onUpload(files, extractionOption);
  };

  const features = [
    { icon: Zap, title: "Nhanh chóng", desc: "Xử lý trong vài giây" },
    { icon: Sparkles, title: "Chính xác", desc: "AI nhận diện chuẩn xác" },
    { icon: CheckCircle, title: "Xuất Excel", desc: "Tải file dễ dàng" },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-surface-container-lowest shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-6">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Quay lại</span>
            </button>
          )}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-on-surface">Menu Extractor</h1>
              <p className="text-on-surface-variant">Trích xuất dữ liệu menu bằng AI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm mb-6"
        >
          {loading ? (
            <div className="flex flex-col items-center py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-on-surface mb-2">Đang xử lý...</h3>
              <p className="text-on-surface-variant text-sm">AI đang phân tích thực đơn của bạn</p>
            </div>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleInputChange}
                disabled={loading || files.length >= MAX_IMAGES}
                className="hidden"
              />

              <div
                onClick={handleSelectFiles}
                className="border-2 border-dashed border-outline-variant rounded-2xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <FileImage className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-on-surface mb-2">
                  Tải lên tối đa {MAX_IMAGES} ảnh
                </h3>
                <p className="text-on-surface-variant text-sm mb-4">
                  JPG, PNG, WEBP. Ảnh rõ nét cho kết quả tốt nhất.
                </p>
                <Button
                  type="button"
                  variant="primary"
                  className="mx-auto"
                >
                  <FileImage className="w-4 h-4 mr-2" />
                  Chọn ảnh
                </Button>
              </div>
            </>
          )}
        </motion.div>

        {/* Selected Files */}
        {files.length > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-on-surface">Ảnh đã chọn</span>
                <span className="text-sm text-on-surface-variant">
                  {files.length} / {MAX_IMAGES}
                </span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between bg-surface-container-low rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileImage className="w-5 h-5 text-on-surface-variant flex-shrink-0" />
                      <span className="text-sm text-on-surface truncate">{file.name}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="ml-2 p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Extraction Options */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm mb-6"
          >
            <h3 className="font-semibold text-on-surface mb-4">Tùy chọn trích xuất</h3>
            <div className="space-y-3">
              <label className="flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-colors bg-surface-container-low hover:bg-surface-container-high">
                <input
                  type="radio"
                  name="extractionOption"
                  value="default"
                  checked={extractionOption === "default"}
                  onChange={() => setExtractionOption("default")}
                  className="mt-0.5 accent-primary"
                />
                <div>
                  <span className="font-medium text-on-surface">Chi tiết (Mặc định)</span>
                  <p className="text-sm text-on-surface-variant mt-0.5">
                    Tách riêng từng biến thể giá/size
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-colors bg-surface-container-low hover:bg-surface-container-high">
                <input
                  type="radio"
                  name="extractionOption"
                  value="base_price"
                  checked={extractionOption === "base_price"}
                  onChange={() => setExtractionOption("base_price")}
                  className="mt-0.5 accent-primary"
                />
                <div>
                  <span className="font-medium text-on-surface">Cơ bản</span>
                  <p className="text-sm text-on-surface-variant mt-0.5">
                    Chỉ lấy giá thấp nhất, bỏ qua size
                  </p>
                </div>
              </label>
            </div>
          </motion.div>
        )}

        {/* Error Notification */}
        <AnimatePresence>
          {uploadError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mb-6 p-4 bg-error/10 border border-error/20 rounded-2xl flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-error" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-error">{uploadError}</p>
              </div>
              <button
                onClick={() => setUploadError(null)}
                className="p-1 text-error/60 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Button */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Button
              type="button"
              onClick={handleUploadClick}
              disabled={loading}
              variant="primary"
              className="w-full py-4 text-base"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Bắt đầu xử lý {files.length} ảnh
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-12 grid grid-cols-3 gap-4"
        >
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="text-center p-6 bg-surface-container-lowest rounded-2xl"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-on-surface mb-1">{feature.title}</h3>
              <p className="text-sm text-on-surface-variant">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
