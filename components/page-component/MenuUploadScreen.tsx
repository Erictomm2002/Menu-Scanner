"use client";

import type React from "react";
import { useState } from "react";

import { Button } from "../ui/Button";
import { Upload, Loader2, FileImage, X, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/Card";

interface MenuUploadScreenProps {
  onUpload: (files: File[], extractionOption: "default" | "base_price") => void;
  loading: boolean;
}

export default function MenuUploadScreen({
  onUpload,
  loading,
}: MenuUploadScreenProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [extractionOption, setExtractionOption] = useState<"default" | "base_price">("default");

  const handleFileChange = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles);
    const allFiles = [...files, ...newFiles].slice(0, 5); // Giới hạn 5 files

    // Lọc và kiểm tra file
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
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
            Menu Digitizer - Số hóa thực đơn
          </h1>
          <p className="text-lg text-white/80">
            Chuyển đổi ảnh thực đơn nhà hàng thành dữ liệu có cấu trúc bằng AI
          </p>
          <p className="mt-2 text-sm text-cyan-300 font-semibold">
            Sản phẩm của OSCAR TEAM. Chúc OSCAR TEAM về 100% số cuối tháng!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl border-2 border-dashed border-purple-400/30 rounded-3xl p-8 text-center hover:border-purple-400/50 transition-all duration-300"
        >
          <motion.div
            animate={{ y: loading ? [0, -10, 0] : 0 }}
            transition={{ duration: 2, repeat: loading ? Infinity : 0 }}
          >
            <Sparkles className="w-20 h-20 mx-auto mb-4 text-purple-400" />
          </motion.div>
          <h2 className="text-2xl font-semibold mb-2 text-white">
            {loading ? "Đang xử lý thực đơn của bạn..." : "Tải lên tối đa 5 ảnh thực đơn"}
          </h2>
          <p className="text-white/70 mb-6">
            {loading
              ? "AI đang phân tích thực đơn. Vui lòng chờ trong giây lát..."
              : "Bấm để chọn ảnh (JPG, PNG, WEBP...). Ảnh rõ nét sẽ cho kết quả tốt nhất."}
          </p>

          {loading ? (
            <div className="flex justify-center mb-4">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
          ) : (
            <>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleInputChange}
                disabled={loading || files.length >= 5}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input">
                <Button
                  type="button"
                  onClick={() => document.getElementById("file-input")?.click()}
                  disabled={loading || files.length >= 5}
                  variant="default"
                  gradient="purple-cyan"
                  glow
                  className="mb-4 px-8 py-3"
                >
                  Chọn ảnh
                </Button>
              </label>
            </>
          )}

          {files.length > 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 text-left space-y-2"
            >
              <h3 className="font-semibold mb-2 text-white">Ảnh đã chọn:</h3>
              {files.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-500/20 rounded-lg p-2">
                      <FileImage className="w-5 h-5 text-purple-300" />
                    </div>
                    <span className="text-sm font-medium text-white">{file.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(index)}
                    className="text-white/70 hover:text-white hover:bg-white/10"
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
              className="mt-4 text-left p-4 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl"
            >
              <h3 className="font-semibold mb-3 text-white">Tùy chọn trích xuất:</h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-white/10 transition-colors">
                  <input
                    type="radio"
                    name="extractionOption"
                    value="default"
                    checked={extractionOption === "default"}
                    onChange={() => setExtractionOption("default")}
                    className="mt-1 accent-purple-500"
                  />
                  <div>
                    <span className="font-medium text-white">Chi tiết (Mặc định)</span>
                    <p className="text-sm text-white/60">
                      Tách riêng từng biến thể giá/size (VD: Café S, Café L)
                    </p>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-white/10 transition-colors">
                  <input
                    type="radio"
                    name="extractionOption"
                    value="base_price"
                    checked={extractionOption === "base_price"}
                    onChange={() => setExtractionOption("base_price")}
                    className="mt-1 accent-purple-500"
                  />
                  <div>
                    <span className="font-medium text-white">Cơ bản</span>
                    <p className="text-sm text-white/60">
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
              variant="default"
              gradient="blue-cyan"
              glow
              className="mt-6 w-full px-8 py-3 text-lg"
            >
              {loading ? "Đang xử lý..." : `Bắt đầu xử lý ${files.length} ảnh`}
            </Button>
          )}
        </motion.div>

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
            <Card key={idx} variant="glass" className="p-6 hover:scale-105 transition-transform duration-300">
              <CardContent>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-purple-500/20 rounded-full p-2">
                    <Sparkles className="w-5 h-5 text-purple-300" />
                  </div>
                  <h3 className="font-semibold text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-sm text-white/60">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
