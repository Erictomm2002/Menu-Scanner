"use client"

import { useState, useEffect } from "react"
import MenuUploadScreen from "../components/page-component/MenuUploadScreen"
import MenuEditScreen from "../components/page-component/MenuEditScreen"
import MenuExportScreen from "../components/page-component/MenuExportScreen"
import { MenuData, MenuItem } from "@/types/menu"

type AppStep = "upload" | "edit" | "export"

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
          data.categories.forEach((newCategory: any) => {
            const existingCategory = combinedMenuData.categories.find(
              (c) => c.categoryName === newCategory.categoryName,
            )
            if (existingCategory) {
              // Gộp items vào category đã có
              existingCategory.items.push(...newCategory.items)
            } else {
              // Thêm category mới
              combinedMenuData.categories.push(newCategory)
            }
          })
        }
      }

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
