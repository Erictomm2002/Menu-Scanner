"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import MenuUploadScreen from "@/components/page-component/MenuUploadScreen"
import MenuEditScreen from "@/components/page-component/MenuEditScreen"
import MenuExportScreen from "@/components/page-component/MenuExportScreen"
import { MenuData, MenuCategory } from "@/types/menu"

type AppStep = "upload" | "edit" | "export"

const slugify = (text: string): string => {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
}

export default function MenuExtractorPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<AppStep>("upload")
  const [menuData, setMenuData] = useState<MenuData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

        if (data.restaurantName && !combinedMenuData.restaurantName) {
          combinedMenuData.restaurantName = data.restaurantName
        }

        if (data.categories) {
          data.categories.forEach((newCategory: MenuCategory) => {
            const existingCategory = combinedMenuData.categories.find(
              (c) => c.categoryName === newCategory.categoryName,
            )
            if (existingCategory) {
              existingCategory.items.push(...newCategory.items)
            } else {
              const newId = slugify(newCategory.categoryName)
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

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage)
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

  const handleBackToHome = () => {
    router.push("/")
  }

  return (
    <main className="min-h-screen bg-surface">
      <div className="relative z-10">
        {currentStep === "upload" && (
          <MenuUploadScreen
            onUpload={handleImageUpload}
            onUploadError={handleUploadError}
            loading={loading}
            onBack={handleBackToHome}
          />
        )}
        {currentStep === "edit" && menuData && (
          <MenuEditScreen
            data={menuData}
            onChange={handleItemUpdate}
            onExport={() => setCurrentStep("export")}
            onBack={handleBackToHome}
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
