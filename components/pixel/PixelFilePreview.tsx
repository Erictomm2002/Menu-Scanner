"use client"

import { useCallback, useEffect, useState } from "react"
import { FileImage, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface PixelFilePreviewProps {
  file: File
  index: number
  onRemove: (index: number) => void
}

export default function PixelFilePreview({
  file,
  index,
  onRemove
}: PixelFilePreviewProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)

  const handleRemove = useCallback(() => {
    onRemove(index)
    // Cleanup URL when file is removed
    if (thumbnailUrl && thumbnailUrl.startsWith('data:')) {
      URL.revokeObjectURL(thumbnailUrl)
    }
  }, [onRemove, thumbnailUrl])

  useEffect(() => {
    // Generate thumbnail for image files only
    if (file.type.startsWith("image/") && !thumbnailUrl) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
    // Cleanup on unmount
    return () => {
      if (thumbnailUrl && thumbnailUrl.startsWith('data:')) {
        URL.revokeObjectURL(thumbnailUrl)
      }
    }
  }, [file])

  return (
    <>
      <div className="px-file-preview">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={file.name}
            className="px-file-thumbnail"
          />
        ) : (
          <FileImage className="px-file-icon" />
        )}
        <span className="px-file-name" title={file.name}>{file.name}</span>
        <button
          onClick={handleRemove}
          className="px-file-remove"
          type="button"
          title="Remove file"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <style>{`
        .px-file-preview {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
          border: 2px solid var(--px-border);
          background: var(--px-bg-secondary);
        }

        .px-file-thumbnail {
          width: 64px;
          height: 64px;
          object-fit: cover;
          border: 1px solid var(--px-border);
        }

        /* Real menu photos should NOT be pixelated */
        .px-file-thumbnail,
        .px-file-icon {
          image-rendering: auto;
        }

        .px-file-icon {
          width: 64px;
          height: 64px;
          padding: 12px;
          border: 1px solid var(--px-border);
          color: var(--px-text-primary);
        }

        .px-file-name {
          flex: 1;
          font-family: var(--font-pixel-body);
          font-size: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--px-text-primary);
        }

        .px-file-remove {
          padding: 4px 8px;
          background: var(--px-warning);
          border: 2px solid var(--px-border);
          color: white;
          font-family: var(--font-pixel);
          font-size: 10px;
          min-width: 44px;
          min-height: 44px;
          cursor: pointer;
        }

        .px-file-remove:hover {
          background: #FF5252;
        }

        .px-file-remove:active {
          transform: translate(2px, 2px);
          box-shadow: inset 2px 2px 0 var(--px-border);
        }
      `}</style>
    </>
  )
}
