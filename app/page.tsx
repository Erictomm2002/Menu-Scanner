"use client"

import { useState, useEffect } from "react"
import MenuUploadScreen from "../components/page-component/MenuUploadScreen"
import MenuEditScreen from "../components/page-component/MenuEditScreen"
import MenuExportScreen from "../components/page-component/MenuExportScreen"
import { MenuData, MenuCategory } from "@/types/menu"

type AppStep = "upload" | "edit" | "export"

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
      return (saved as AppStep) || "upload"
    }
    return "upload"
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

  const handleImageUpload = async (files: File[]) => {
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
    <main className="min-h-screen bg-background">
      {currentStep === "upload" && (
        <MenuUploadScreen onUpload={handleImageUpload} loading={loading} />
      )}
      {currentStep === "edit" && menuData && (
        <MenuEditScreen
          data={menuData}
          onChange={handleItemUpdate}
          onExport={handleExport}
          onBack={handleReset}
        />
      )}
      {currentStep === "export" && menuData && (
        <MenuExportScreen
          restaurantName={menuData.restaurantName ?? ""}
          menuData={menuData}
          onBack={() => setCurrentStep("edit")}
        />
      )}
    </main>
  )
}
