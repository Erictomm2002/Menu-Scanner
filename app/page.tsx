"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import MenuUploadScreen from "../components/page-component/MenuUploadScreen"
import MenuEditScreen from "../components/page-component/MenuEditScreen"
import MenuExportScreen from "../components/page-component/MenuExportScreen"
import { MenuData, MenuCategory } from "@/types/menu"
import { Button } from "@/components/ui/Button"
import { FileText, ShoppingCart, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

type AppStep = "upload" | "edit" | "export" | "home"

// Helper function to generate a URL-friendly slug from a string
const slugify = (text: string): string => {
  return text
    .toString()
    .normalize("NFD") // split an accented letter in the base letter and the acent
    .replace(/[\u0300-\u036f]/g, "") // remove all previously split accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // replace spaces with -
    .replace(/[^\w-]+/g, "") // remove all non-word chars
    .replace(/--+/g, "-") // replace multiple - with single -
}

export default function Home() {
  // Khôi phục state từ localStorage khi component mount
  const [currentStep, setCurrentStep] = useState<AppStep>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("menuApp_currentStep")
      // If the user reloads on the export page, reset to the home page.
      if (saved === "export") {
        return "home"
      }
      return (saved as AppStep) || "home"
    }
    return "home"
  })

  const [menuData, setMenuData] = useState<MenuData | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("menuApp_menuData")
      return saved ? JSON.parse(saved) : null
    }
    return null
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Lưu state vào localStorage mỗi khi thay đổi
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("menuApp_currentStep", currentStep)
    }
  }, [currentStep])

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (menuData) {
        localStorage.setItem("menuApp_menuData", JSON.stringify(menuData))
      } else {
        localStorage.removeItem("menuApp_menuData")
      }
    }
  }, [menuData])

  const handleExport = () => {
    setCurrentStep("export")
  }

  const handleImageUpload = async (
    files: File[],
    extractionOption: "default" | "base_price" = "default",
  ) => {
    setLoading(true)
    setError(null)
    let combinedMenuData: MenuData = {
      restaurantName: "",
      categories: [],
    }

    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append("image", file)
        formData.append("priceOption", extractionOption)

        const response = await fetch("/api/extract", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            `Lỗi xử lý ảnh ${file.name}: ${data.error || "Failed to extract menu"}`,
          )
        }

        console.log(`Extracted menu data from ${file.name}:`, data)

        // Gộp dữ liệu
        if (data.restaurantName && !combinedMenuData.restaurantName) {
          combinedMenuData.restaurantName = data.restaurantName
        }

        if (data.categories) {
          data.categories.forEach((newCategory: MenuCategory) => {
            const existingCategory = combinedMenuData.categories.find(
              (c) => c.categoryName === newCategory.categoryName,
            )
            if (existingCategory) {
              // Gộp items vào category đã có
              existingCategory.items.push(...newCategory.items)
            } else {
              // Thêm category mới và tạo ID
              const newId = slugify(newCategory.categoryName)
              // Check for duplicate slugs and append a number if needed
              let finalId = newId
              let counter = 1
              while (combinedMenuData.categories.some((c) => c.id === finalId)) {
                finalId = `${newId}-${counter}`
                counter++
              }
              newCategory.id = finalId
              combinedMenuData.categories.push(newCategory)
            }
          })
        }
      }

      // Final processing: Assign sequential IDs to all items within their categories
      combinedMenuData.categories.forEach((category) => {
        category.items.forEach((item, index) => {
          item.id = `item_${index + 1}`
        })
      })

      setMenuData(combinedMenuData)
      setCurrentStep("edit")
    } catch (err: any) {
      console.error("Error:", err)
      setError(err.message || "Lỗi phân tích menu. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  const handleItemUpdate = (updatedItems: MenuData) => {
    setMenuData(updatedItems)
  }

  const handleReset = () => {
    setMenuData(null)
    setCurrentStep("upload")
    localStorage.removeItem("menuApp_menuData")
    localStorage.removeItem("menuApp_currentStep")
  }

  return (
    <main className="min-h-screen bg-[#0F172A]">
      {/* Navigation Header */}
      <header className="relative z-20 border-b border-white/10 bg-transparent backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/">
                <Button variant="ghost" className="text-white font-medium hover:bg-white/5">
                  iPos Kit
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5">
                Đăng nhập
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10">
        {currentStep === "home" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="min-h-[calc(100vh-73px)] flex flex-col items-center justify-center px-6"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-4">
              Giải pháp Tự động hóa Thông minh
            </h1>
            <p className="text-white/60 text-lg md:text-xl text-center mb-16 max-w-2xl">
              Tối ưu quy trình làm việc, giảm chi phí và mở rộng quy mô nhanh chóng với các giải pháp AI
            </p>

            <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
              {/* Menu Extractor Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                className="group cursor-pointer"
                onClick={() => setCurrentStep("upload")}
              >
                <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-8 h-full transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                  <h3 className="text-2xl font-semibold text-white mb-3 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-500" />
                    Menu Extractor
                  </h3>
                  <p className="text-white/60 mb-6">
                    Tự động chuyển đổi menu nhà hàng sang định dạng số với độ chính xác cao bằng công nghệ AI OCR.
                  </p>
                  <div className="flex items-center text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
                    Bắt đầu ngay
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>

              {/* Quotation Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
                className="group"
              >
                <Link href="/quotation" className="block h-full">
                  <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-8 h-full transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                    <h3 className="text-2xl font-semibold text-white mb-3 flex items-center gap-3">
                      <ShoppingCart className="w-6 h-6 text-purple-500" />
                      Báo giá sản phẩm
                    </h3>
                    <p className="text-white/60 mb-6">
                      Tạo báo giá sản phẩm chuyên nghiệp trong vài giây. Tối ưu quy trình bán hàng của bạn.
                    </p>
                    <div className="flex items-center text-purple-400 font-medium group-hover:text-purple-300 transition-colors">
                      Bắt đầu ngay
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}

        {currentStep === "upload" && (
          <MenuUploadScreen onUpload={handleImageUpload} loading={loading} onBack={() => setCurrentStep("home")} />
        )}
        {currentStep === "edit" && menuData && (
          <MenuEditScreen
            data={menuData}
            onChange={handleItemUpdate}
            onExport={handleExport}
            onBack={() => setCurrentStep("home")}
          />
        )}
        {currentStep === "export" && menuData && (
          <MenuExportScreen
            restaurantName={menuData.restaurantName ?? ""}
            menuData={menuData}
            onBack={() => setCurrentStep("edit")}
          />
        )}
      </div>
    </main>
  )
}
