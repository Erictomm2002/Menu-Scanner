"use client"

import { useState } from "react"
import { Button } from "../ui/Button"
import { Card, CardContent } from "../ui/Card"
import { Input } from "../ui/Input"
import { Trash2, ArrowLeft, Plus, ChevronRight, ChevronUp, ChevronDown, ChevronLeft } from "lucide-react"
import { MenuCategory, MenuData, MenuItem } from "@/types/menu"

interface MenuEditScreenOption2Props {
  data: MenuData
  onChange: (data: MenuData) => void
  onExport: () => void
  onBack: () => void
}

export default function MenuEditScreenOption2({
  data,
  onChange,
  onExport,
  onBack,
}: MenuEditScreenOption2Props) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(data.categories.map((cat) => cat.id))
  )
  const [editingId, setEditingId] = useState<string | null>(null)

  // Toggle category expansion
  const toggleCategoryExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  // Update restaurant name
  const handleRestaurantNameChange = (name: string) => {
    onChange({ ...data, restaurantName: name })
  }

  // Update category name
  const handleCategoryNameChange = (categoryId: string, newName: string) => {
    const updatedCategories = data.categories.map((cat) =>
      cat.id === categoryId ? { ...cat, categoryName: newName } : cat
    )
    onChange({ ...data, categories: updatedCategories })
  }

  // Update item field
  const handleItemChange = (
    categoryId: string,
    itemId: string,
    field: keyof MenuItem,
    value: string
  ) => {
    const updatedCategories = data.categories.map((cat) => {
      if (cat.id === categoryId) {
        const updatedItems = cat.items.map((item) =>
          item.id === itemId ? { ...item, [field]: value } : item
        )
        return { ...cat, items: updatedItems }
      }
      return cat
    })
    onChange({ ...data, categories: updatedCategories })
  }

  // Delete item
  const handleDeleteItem = (categoryId: string, itemId: string) => {
    const updatedCategories = data.categories
      .map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            items: cat.items.filter((item) => item.id !== itemId),
          }
        }
        return cat
      })
      .filter((cat) => cat.items.length > 0)

    onChange({ ...data, categories: updatedCategories })
  }

  // Delete category
  const handleDeleteCategory = (categoryId: string) => {
    if (!confirm("Bạn có chắc muốn xóa nhóm món này?")) return

    const updatedCategories = data.categories.filter(
      (cat) => cat.id !== categoryId
    )
    onChange({ ...data, categories: updatedCategories })
  }

  // Add new item to category
  const handleAddItem = (categoryId: string) => {
    const updatedCategories = data.categories.map((cat) => {
      if (cat.id === categoryId) {
        const newItem: MenuItem = {
          id: `item_${Date.now()}`,
          name: "Món mới",
          price: "0đ",
          description: "",
        }
        return { ...cat, items: [...cat.items, newItem] }
      }
      return cat
    })
    onChange({ ...data, categories: updatedCategories })
  }

  // Add new category
  const handleAddCategory = () => {
    const newCategory: MenuCategory = {
      id: `cat_${Date.now()}`,
      categoryName: "Nhóm món mới",
      items: [
        {
          id: `item_${Date.now()}`,
          name: "Món mẫu",
          price: "0đ",
          description: "",
        },
      ],
    }
    const newCategoryId = newCategory.id
    onChange({ ...data, categories: [...data.categories, newCategory] })
    // Expand newly created category
    setTimeout(() => {
      setExpandedCategories((prev) => new Set([...prev, newCategoryId]))
    }, 0)
  }

  // Move item within category
  const moveItem = (categoryId: string, itemId: string, direction: "up" | "down") => {
    const updatedCategories = data.categories.map((cat) => {
      if (cat.id === categoryId) {
        const itemIndex = cat.items.findIndex((item) => item.id === itemId)
        if (itemIndex === -1) return cat

        const items = [...cat.items]
        const newIndex = direction === "up" ? itemIndex - 1 : itemIndex + 1
        if (newIndex < 0 || newIndex >= items.length) return cat

        const [item] = items.splice(itemIndex, 1)
        items.splice(newIndex, 0, item)
        return { ...cat, items }
      }
      return cat
    })
    onChange({ ...data, categories: updatedCategories })
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-muted">
            <ChevronLeft className="w-8 h-8" />
          </Button>
          <div>
            <p className="font-semibold text-2xl">{data.restaurantName}</p>
            <p className="text-muted-foreground text-lg">Chỉnh sửa menu của bạn</p>
          </div>
        </div>

        {/* Add Category Button */}
        <div className="mb-6 flex justify-end gap-2">
          <Button
            onClick={() => {
              setExpandedCategories(new Set(data.categories.map((cat) => cat.id)))
            }}
            variant="outline"
            size="sm"
            className="border-border hover:bg-muted"
          >
            Mở tất cả
          </Button>
          <Button
            onClick={() => {
              setExpandedCategories(new Set())
            }}
            variant="outline"
            size="sm"
            className="border-border hover:bg-muted"
          >
            Thu gọn tất cả
          </Button>
          <Button onClick={handleAddCategory} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Thêm Nhóm Món
          </Button>
        </div>

        {/* Categories with Collapsible */}
        {data.categories.map((category) => {
          const isExpanded = expandedCategories.has(category.id)
          return (
            <div key={category.id} className="mb-4">
              {/* Category Header - Always visible */}
              <div
                className="border border-border rounded-t-lg bg-muted/30 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors gap-2"
                onClick={() => toggleCategoryExpand(category.id)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <ChevronRight
                    className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""
                      }`}
                  />
                  <Input
                    value={category.categoryName}
                    onChange={(e) => handleCategoryNameChange(category.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="text-lg font-semibold flex-1 bg-transparent border-0 h-auto p-0"
                  />
                  <span className="text-sm text-muted-foreground bg-muted p-2 rounded">
                    {category.items.length} món
                  </span>
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    onClick={() => handleAddItem(category.id)}
                    variant="outline"
                    size="sm"
                    className="border-border"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Thêm
                  </Button>
                  <Button
                    onClick={() => handleDeleteCategory(category.id)}
                    size="md"
                    className="text-destructive bg-red-600 text-white"
                  >
                    Xóa
                  </Button>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border border-t-0 border-border rounded-b-lg overflow-hidden">
                  <div className="space-y-0 divide-y divide-border">
                    {category.items.map((item, itemIndex) => (
                      <Card
                        key={item.id}
                        className="rounded-none border-1 hover:bg-muted/20 shadow-none "
                      >
                        <CardContent className="p-3">
                          <div className="flex gap-2 items-end">
                            <div className="flex-1">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <div>
                                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                    Tên món
                                  </label>
                                  <Input
                                    value={item.name}
                                    onChange={(e) =>
                                      handleItemChange(
                                        category.id,
                                        item.id,
                                        "name",
                                        e.target.value
                                      )
                                    }
                                    className="text-sm h-8"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                    Giá
                                  </label>
                                  <Input
                                    type="text"
                                    value={item.price}
                                    onChange={(e) =>
                                      handleItemChange(
                                        category.id,
                                        item.id,
                                        "price",
                                        e.target.value
                                      )
                                    }
                                    className="text-sm h-8"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                    Mô tả
                                  </label>
                                  <Input
                                    value={item.description || ""}
                                    onChange={(e) =>
                                      handleItemChange(
                                        category.id,
                                        item.id,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                    className="text-sm h-8"
                                    placeholder="Mô tả..."
                                  />
                                </div>
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="md"
                              onClick={() => handleDeleteItem(category.id, item.id)}
                              className="text-destructive "
                            >
                              <Trash2 className="w-5 h-5 text-red-600" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
              }
            </div>
          )
        })}

        {/* Empty State */}
        {data.categories.length === 0 && (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground text-lg mb-4">Chưa có nhóm món nào</p>
            <Button onClick={handleAddCategory} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Thêm Nhóm Món Đầu Tiên
            </Button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex gap-3 mt-8 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onBack}
            className="border-border"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Quay Lại
          </Button>
          <Button
            onClick={onExport}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Tiếp Tục Xuất Menu
          </Button>
        </div>
      </div>
    </div >
  )
}