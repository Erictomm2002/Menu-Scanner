"use client"

import { useState } from "react"
import { Button } from "../ui/Button"
import { Card, CardContent } from "../ui/Card"
import { Input } from "../ui/Input"
import { Trash2, ArrowLeft, Plus, ChevronRight, ChevronLeft, ChevronDown, Search } from "lucide-react"
import { MenuCategory, MenuData, MenuItem } from "@/types/menu"
import { motion, AnimatePresence } from "framer-motion"

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

  const totalItems = data.categories.reduce((sum, cat) => sum + cat.items.length, 0)

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-surface-container-lowest shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={data.restaurantName}
                onChange={(e) => handleRestaurantNameChange(e.target.value)}
                className="text-xl font-bold text-on-surface bg-transparent border-0 outline-none w-full"
                placeholder="Tên nhà hàng"
              />
              <p className="text-sm text-on-surface-variant">{totalItems} món trong menu</p>
            </div>
            <Button onClick={onExport} variant="primary" size="sm">
              Xuất Menu
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Action Buttons - Row 1: Back button and expand/collapse */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-xl transition-colors border border-outline-variant/50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Quay lại</span>
          </button>
          <div className="flex-1" />
          <button
            onClick={() => {
              setExpandedCategories(new Set(data.categories.map((cat) => cat.id)))
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-on-surface-variant bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/50 rounded-xl transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            Mở tất cả
          </button>
          <button
            onClick={() => {
              setExpandedCategories(new Set())
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-on-surface-variant bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/50 rounded-xl transition-colors"
          >
            <ChevronRight className="w-4 h-4 -rotate-90" />
            Thu gọn
          </button>
          <Button onClick={handleAddCategory} variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Thêm Nhóm Món
          </Button>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {data.categories.map((category) => {
            const isExpanded = expandedCategories.has(category.id)
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Category Header */}
                <div
                  className="px-5 py-4 flex items-center gap-3 cursor-pointer hover:bg-surface-container-low transition-colors"
                  onClick={() => toggleCategoryExpand(category.id)}
                >
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.div>
                  <input
                    type="text"
                    value={category.categoryName}
                    onChange={(e) => handleCategoryNameChange(category.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 text-lg font-semibold text-on-surface bg-transparent border-0 outline-none"
                  />
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleAddItem(category.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors border border-outline-variant/30"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors border border-outline-variant/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-outline-variant/20"
                    >
                      <div className="divide-y divide-outline-variant/10">
                        {category.items.map((item) => (
                          <div
                            key={item.id}
                            className="px-5 py-4 flex items-center gap-4 hover:bg-surface-container-low transition-colors"
                          >
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) =>
                                  handleItemChange(category.id, item.id, "name", e.target.value)
                                }
                                className="text-on-surface bg-transparent border-0 outline-none text-base"
                                placeholder="Tên món"
                              />
                              <input
                                type="text"
                                value={item.price}
                                onChange={(e) =>
                                  handleItemChange(category.id, item.id, "price", e.target.value)
                                }
                                className="text-on-surface bg-transparent border-0 outline-none text-base"
                                placeholder="Giá"
                              />
                            </div>
                            <button
                              onClick={() => handleDeleteItem(category.id, item.id)}
                              className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* Empty State */}
        {data.categories.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-surface-container-lowest rounded-3xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <p className="text-on-surface-variant text-lg mb-4">Chưa có nhóm món nào</p>
            <Button onClick={handleAddCategory} variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Thêm Nhóm Món Đầu Tiên
            </Button>
          </motion.div>
        )}

        {/* Footer Action */}
        <div className="mt-8 pt-6 border-t border-outline-variant/20">
          <Button
            onClick={onExport}
            variant="primary"
            className="w-full py-4 text-base"
            size="lg"
          >
            Tiếp Tục Xuất Menu
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
