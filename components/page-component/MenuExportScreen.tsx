"use client"

import { MenuData } from "@/types/menu"
import { Button } from "../ui/Button"
import { Download, Check, ArrowLeft, FileSpreadsheet, FolderOpen, Sparkles } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type ExportType = "menu" | "category" | null

interface ExportStatus {
  menu: boolean
  category: boolean
}

interface MenuExportScreenProps {
  restaurantName: string
  menuData: MenuData
  onBack: () => void
}

export default function MenuExportScreen({ restaurantName, menuData, onBack }: MenuExportScreenProps) {
  const [exporting, setExporting] = useState<ExportType>(null)
  const [exportedFiles, setExportedFiles] = useState<ExportStatus>({
    menu: false,
    category: false,
  })

  const handleExportMenu = async () => {
    setExporting("menu")
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(menuData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Xuất file thất bại")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url

      const timestamp = new Date().toISOString().split("T")[0]
      const safeName = menuData?.restaurantName
        ? menuData.restaurantName.replace(/[^a-zA-Z0-9]/g, "_")
        : "menu"
      a.download = `${safeName}_menu_${timestamp}.xlsx`

      document.body.appendChild(a)
      a.click()

      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setExportedFiles((prev) => ({ ...prev, menu: true }))
      alert("Xuất file Menu Excel thành công!")
    } catch (error) {
      console.error("Error exporting menu:", error)
      alert("Lỗi xuất file Menu Excel. Vui lòng thử lại.")
    } finally {
      setExporting(null)
    }
  }

  const handleExportCategory = async () => {
    setExporting("category")
    try {
      const response = await fetch("/api/category-export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(menuData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Xuất file thất bại")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url

      const timestamp = new Date().toISOString().split("T")[0]
      const safeName = menuData?.restaurantName
        ? menuData.restaurantName.replace(/[^a-zA-Z0-9]/g, "_")
        : "categories"
      a.download = `${safeName}_categories_${timestamp}.xlsx`

      document.body.appendChild(a)
      a.click()

      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setExportedFiles((prev) => ({ ...prev, category: true }))
      alert("Xuất file Nhóm món Excel thành công!")
    } catch (error) {
      console.error("Error exporting category:", error)
      alert("Lỗi xuất file Nhóm món. Vui lòng thử lại.")
    } finally {
      setExporting(null)
    }
  }

  const categories = [...new Set(menuData.categories.map((cat) => cat.categoryName))]
  const totalItems = menuData.categories.reduce((sum, cat) => sum + cat.items.length, 0)
  const hasExportedAny = exportedFiles.menu || exportedFiles.category
  const hasExportedBoth = exportedFiles.menu && exportedFiles.category

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-surface-container-lowest shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-on-surface">
                {hasExportedBoth
                  ? "Hoàn tất xuất file"
                  : hasExportedAny
                    ? "Xuất file thành công"
                    : "Sẵn sàng xuất file"}
              </h1>
              <p className="text-sm text-on-surface-variant">
                {hasExportedAny
                  ? "Tiếp tục xuất file còn lại hoặc quay về chỉnh sửa"
                  : "Chọn loại file bạn muốn xuất"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm mb-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-on-surface">{restaurantName}</h2>
              <p className="text-sm text-on-surface-variant">Thực đơn của bạn</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-primary/10 rounded-2xl p-5 text-center">
              <p className="text-3xl font-bold text-primary">{totalItems}</p>
              <p className="text-sm text-on-surface-variant mt-1">Tổng số món</p>
            </div>
            <div className="bg-primary/10 rounded-2xl p-5 text-center">
              <p className="text-3xl font-bold text-primary">{categories.length}</p>
              <p className="text-sm text-on-surface-variant mt-1">Số nhóm món</p>
            </div>
          </div>

          {categories.length > 0 && (
            <div>
              <label className="text-sm font-medium text-on-surface-variant block mb-3">
                Các nhóm món trong thực đơn
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="bg-surface-container-high text-on-surface px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Export Status */}
        <AnimatePresence>
          {hasExportedAny && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 space-y-3"
            >
              <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wide">
                Trạng thái xuất file
              </h3>

              {exportedFiles.menu && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-2xl p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileSpreadsheet className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold text-on-surface">File Menu Excel</h4>
                      </div>
                      <p className="text-sm text-on-surface-variant">
                        {restaurantName}_menu.xlsx • {totalItems} món
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {exportedFiles.category && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FolderOpen className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold text-on-surface">File Nhóm món Excel</h4>
                      </div>
                      <p className="text-sm text-on-surface-variant">
                        {restaurantName}_categories.xlsx • {categories.length} nhóm
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Export Buttons */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Menu Export Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className={`rounded-2xl p-6 transition-all ${
                exportedFiles.menu
                  ? "bg-green-50 dark:bg-green-950/20 border-2 border-green-200"
                  : "bg-surface-container-lowest border-2 border-transparent hover:border-primary/30"
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  exportedFiles.menu ? "bg-green-100" : "bg-primary/10"
                }`}>
                  <FileSpreadsheet className={`w-6 h-6 ${exportedFiles.menu ? "text-green-600" : "text-primary"}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-on-surface">File Menu</h4>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Xuất 22 cột đầy đủ thông tin món ăn
                  </p>
                </div>
                {exportedFiles.menu && (
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <Button
                onClick={handleExportMenu}
                disabled={exporting !== null}
                variant={exportedFiles.menu ? "outline" : "primary"}
                className="w-full"
                size="sm"
              >
                {exporting === "menu" ? (
                  "Đang xuất..."
                ) : exportedFiles.menu ? (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Tải lại Menu
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Xuất Menu
                  </>
                )}
              </Button>
            </motion.div>

            {/* Category Export Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className={`rounded-2xl p-6 transition-all ${
                exportedFiles.category
                  ? "bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200"
                  : "bg-surface-container-lowest border-2 border-transparent hover:border-primary/30"
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  exportedFiles.category ? "bg-blue-100" : "bg-primary/10"
                }`}>
                  <FolderOpen className={`w-6 h-6 ${exportedFiles.category ? "text-blue-600" : "text-primary"}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-on-surface">File Nhóm món</h4>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Xuất danh sách tên và mã nhóm món
                  </p>
                </div>
                {exportedFiles.category && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <Button
                onClick={handleExportCategory}
                disabled={exporting !== null}
                variant={exportedFiles.category ? "outline" : "primary"}
                className="w-full"
                size="sm"
              >
                {exporting === "category" ? (
                  "Đang xuất..."
                ) : exportedFiles.category ? (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Tải lại Nhóm món
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Xuất Nhóm món
                  </>
                )}
              </Button>
            </motion.div>
          </div>

          {/* Back Button */}
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full"
            disabled={exporting !== null}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại chỉnh sửa
          </Button>
        </div>

        {/* Footer Message */}
        <p className="text-center text-sm text-on-surface-variant mt-8">
          Sản phẩm của iPOS Team
        </p>
      </div>
    </div>
  )
}
