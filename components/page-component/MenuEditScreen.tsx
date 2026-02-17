"use client"

import { useState } from "react"
import { Button } from "../ui/Button"
import { Card, CardContent } from "../ui/Card"
import { Input } from "../ui/Input"
import { Trash2, ArrowLeft, Plus, ChevronRight, ChevronLeft } from "lucide-react"
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

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 mb-8 flex items-center gap-4"
        >
          <Button variant="ghost" size="md" onClick={onBack} className="text-white/70 hover:text-white hover:bg-white/10">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-semibold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400"
            >
              {data.restaurantName}
            </motion.p>
            <p className="text-white/70 text-lg">Chỉnh sửa menu của bạn</p>
          </div>
        </motion.div>

        {/* Add Category Button */}
        <div className="mb-6 flex justify-end gap-2">
          <Button
            onClick={() => {
              setExpandedCategories(new Set(data.categories.map((cat) => cat.id)))
            }}
            variant="glass"
            size="sm"
            className="text-white/80 hover:text-white"
          >
            Mở tất cả
          </Button>
          <Button
            onClick={() => {
              setExpandedCategories(new Set())
            }}
            variant="glass"
            size="sm"
            className="text-white/80 hover:text-white"
          >
            Thu gọn tất cả
          </Button>
          <Button onClick={handleAddCategory} variant="default" gradient="purple-blue" glow>
            <Plus className="w-4 h-4 mr-2" />
            Thêm Nhóm Món
          </Button>
        </div>

        {/* Categories with Collapsible */}
        {data.categories.map((category) => {
          const isExpanded = expandedCategories.has(category.id)
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-4"
            >
              {/* Category Header - Always visible */}
              <div
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-t-2xl px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-white/15 transition-colors gap-3"
                onClick={() => toggleCategoryExpand(category.id)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-5 h-5 text-white/80" />
                  </motion.div>
                  <Input
                    variant="glass"
                    value={category.categoryName}
                    onChange={(e) => handleCategoryNameChange(category.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="text-lg font-semibold flex-1 bg-transparent border-0 h-auto p-0 text-white"
                  />
                  <span className="text-sm text-white/70 bg-purple-500/20 px-3 py-1.5 rounded-full">
                    {category.items.length} món
                  </span>
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    onClick={() => handleAddItem(category.id)}
                    variant="glass"
                    size="sm"
                    className="text-white hover:text-white"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Thêm
                  </Button>
                  <Button
                    onClick={() => handleDeleteCategory(category.id)}
                    size="md"
                    variant="default"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Xóa
                  </Button>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border border-t-0 border-white/20 rounded-b-2xl overflow-hidden"
                  >
                    <div className="space-y-0 divide-y divide-white/10">
                      {category.items.map((item) => (
                        <Card
                          key={item.id}
                          variant="glass"
                          className="rounded-none border-0 border-b border-white/10 hover:bg-white/5"
                        >
                          <CardContent className="p-4">
                            <div className="flex gap-3 items-center">
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Input
                                    variant="glass"
                                    label="Tên món"
                                    value={item.name}
                                    onChange={(e) =>
                                      handleItemChange(
                                        category.id,
                                        item.id,
                                        "name",
                                        e.target.value
                                      )
                                    }
                                    className="text-white"
                                  />
                                </div>
                                <div>
                                  <Input
                                    variant="glass"
                                    label="Giá"
                                    value={item.price}
                                    onChange={(e) =>
                                      handleItemChange(
                                        category.id,
                                        item.id,
                                        "price",
                                        e.target.value
                                      )
                                    }
                                    className="text-white"
                                  />
                                </div>
                              </div>

                              <Button
                                variant="ghost"
                                size="md"
                                onClick={() => handleDeleteItem(category.id, item.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}

        {/* Empty State */}
        {data.categories.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white/5 backdrop-blur-md border-2 border-dashed border-white/20 rounded-3xl"
          >
            <p className="text-white/70 text-lg mb-4">Chưa có nhóm món nào</p>
            <Button onClick={handleAddCategory} variant="default" gradient="purple-blue" glow>
              <Plus className="w-4 h-4 mr-2" />
              Thêm Nhóm Món Đầu Tiên
            </Button>
          </motion.div>
        )}

        {/* Footer Actions */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
          <Button
            variant="glass"
            onClick={onBack}
            className="text-white/80 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Quay Lại
          </Button>
          <Button
            onClick={onExport}
            variant="default"
            gradient="blue-cyan"
            glow
            className="flex-1 px-8 py-3 text-lg"
          >
            Tiếp Tục Xuất Menu
          </Button>
        </div>
      </div>
    </div >
  )
}