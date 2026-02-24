"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onImageChange: (file: File | null) => void;
  onImageDelete: () => void;
  isUploading?: boolean;
  maxSizeMB?: number;
  accept?: string;
  disabled?: boolean;
}

export function ImageUpload({
  currentImageUrl,
  onImageChange,
  onImageDelete,
  isUploading = false,
  maxSizeMB = 5,
  accept = "image/png,image/jpeg,image/jpg,image/webp,image/gif",
  disabled = false,
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled || isUploading) return;

      const files = e.dataTransfer.files;
      if (files && files[0]) {
        validateAndSetFile(files[0]);
      }
    },
    [disabled, isUploading]
  );

  const validateAndSetFile = (file: File) => {
    setError(null);

    // Check file type
    const validTypes = accept.split(",");
    if (!validTypes.includes(file.type)) {
      setError(`Invalid file type. Accepted: ${validTypes.join(", ")}`);
      return;
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Pass file to parent
    onImageChange(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || isUploading) return;

    const files = e.target.files;
    if (files && files[0]) {
      validateAndSetFile(files[0]);
    }
  };

  const handleDelete = () => {
    setPreviewUrl(null);
    onImageDelete();
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (disabled || isUploading || previewUrl) return;
    inputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-slate-700">Hình ảnh sản phẩm</div>

      <div
        className={`
          relative w-full h-48 rounded-lg border-2 border-dashed transition-all duration-200
          ${dragActive ? "border-[#2463eb] bg-blue-50" : "border-slate-300 bg-slate-50"}
          ${previewUrl ? "border-solid border-slate-200" : ""}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${isUploading ? "pointer-events-none" : ""}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={disabled ? undefined : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label={previewUrl ? "Product image preview" : "Upload product image"}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || isUploading}
          aria-label="Choose image file"
        />

        {isUploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 text-[#2463eb] animate-spin" />
            <span className="text-sm text-slate-600">Đang tải lên...</span>
          </div>
        ) : previewUrl ? (
          <div className="relative w-full h-full">
            <img
              src={previewUrl}
              alt="Product preview"
              className="w-full h-full object-contain rounded-lg"
              onLoad={() => {
                // Clean up object URL when image loads
                if (!previewUrl?.startsWith("blob:")) {
                  URL.revokeObjectURL(previewUrl);
                }
              }}
            />
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                aria-label="Delete image"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500">
            <Upload className="w-10 h-10" />
            <div className="text-center">
              <p className="text-sm font-medium">
                Kéo thả hình ảnh vào đây hoặc nhấp để chọn
              </p>
              <p className="text-xs mt-1">
                PNG, JPG, WebP (tối đa {maxSizeMB}MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600" role="alert">
          <X className="w-3 h-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {currentImageUrl && !previewUrl && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ImageIcon className="w-3 h-3" />
          <span>Đang sử dụng hình ảnh hiện có</span>
        </div>
      )}
    </div>
  );
}
