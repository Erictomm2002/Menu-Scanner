### Task 6: Redesign MenuEditScreen with Neubrutal Style

**Files:**
- Modify: `components/page-component/MenuEditScreen.tsx`

- [ ] **Step 1: Update main container styling**

Replace line 163 with:

```tsx
<div className="min-h-screen py-8 px-4 neubrutal-theme">
```

- [ ] **Step 2: Update header styling**

Replace lines 165-185 (header section) with:

```tsx
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  className="nb-bg-white nb-border-2 nb-shadow-md rounded-2xl px-6 py-4 mb-8 flex items-center gap-4"
>
  <Button variant="neubrutal" nbColor="outline" onClick={onBack} size="md">
    <ChevronLeft className="w-6 h-6" />
  </Button>
  <div>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="font-pixel text-2xl font-bold text-[#FF6B9D]"
    >
      {data.restaurantName}
    </motion.p>
    <p className="font-pixel-body text-lg text-[#636E72]">Chỉnh sửa menu của bạn</p>
  </div>
</motion.div>
```

- [ ] **Step 3: Update action buttons section**

Replace lines 188-213 (action buttons) with:

```tsx
<div className="mb-6 flex justify-end gap-2">
  <Button
    onClick={() => {
      setExpandedCategories(new Set(data.categories.map((cat) => cat.categoryCode || cat.id)))
    }}
    variant="neubrutal"
    nbColor="outline"
    size="sm"
  >
    Mở tất cả
  </Button>
  <Button
    onClick={() => {
      setExpandedCategories(new Set())
    }}
    variant="neubrutal"
    nbColor="outline"
    size="sm"
  >
    Thu gọn tất cả
  </Button>
  <Button onClick={handleAddCategory} variant="neubrutal" nbColor="primary">
    <Plus className="w-4 h-4 mr-2" />
    Thêm Nhóm Món
  </Button>
</div>
```

- [ ] **Step 4: Update category header styling**

Replace lines 228-272 (category header) with:

```tsx
<div
  className="nb-bg-secondary nb-border-2 nb-shadow-sm nb-transition rounded-t-2xl px-5 py-4 flex items-center justify-between cursor-pointer nb-card-hover gap-3"
  onClick={() => toggleCategoryExpand(categoryId)}
>
  <div className="flex items-center gap-3 flex-1">
    <motion.div
      animate={{ rotate: isExpanded ? 90 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <ChevronRight className="w-5 h-5 text-[#2D3436]" />
    </motion.div>
    <Input
      variant="neubrutal"
      value={category.categoryName}
      onChange={(e) => handleCategoryNameChange(categoryId, e.target.value)}
      onClick={(e) => e.stopPropagation()}
      className="font-pixel text-lg font-semibold flex-1 nb-bg-transparent nb-border-0 px-0 text-[#2D3436] !shadow-none"
    />
    <span className="font-pixel text-sm text-[#FFB347] bg-[#FFB347]/20 px-2 py-1 rounded-full nb-border-2">
      {category.categoryCode}
    </span>
    <span className="font-pixel text-sm text-[#2D3436] bg-[#4ECDC4]/20 px-3 py-1.5 rounded-full nb-border-2">
      {category.items.length} món
    </span>
  </div>
  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
    <Button
      onClick={() => handleAddItem(categoryId)}
      variant="neubrutal"
      nbColor="outline"
      size="sm"
    >
      <Plus className="w-4 h-4 mr-1" />
      Thêm
    </Button>
    <Button
      onClick={() => handleDeleteCategory(categoryId)}
      size="md"
      variant="neubrutal"
      nbColor="accent"
    >
      Xóa
    </Button>
  </div>
</div>
```

- [ ] **Step 5: Update expanded content styling**

Replace lines 274-343 (expanded items section) with:

```tsx
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="nb-border-2 nb-border-t-0 nb-shadow-md nb-transition rounded-b-2xl overflow-hidden"
    >
      <div className="space-y-0 nb-bg-primary">
        {category.items.map((item) => (
          <div
            key={item.id}
            className="nb-border-b-2 nb-border-t-0 nb-border-l-0 nb-border-r-0 hover:nb-bg-accent nb-transition"
          >
            <div className="p-4 flex gap-3 items-center">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Input
                    variant="neubrutal"
                    label="Tên món"
                    value={item.name}
                    onChange={(e) =>
                      handleItemChange(
                        categoryId,
                        item.id,
                        "name",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <Input
                    variant="neubrutal"
                    label="Giá"
                    value={item.price}
                    onChange={(e) =>
                      handleItemChange(
                        categoryId,
                        item.id,
                        "price",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              <Button
                variant="neubrutal"
                nbColor="accent"
                size="md"
                onClick={() => handleDeleteItem(categoryId, item.id)}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

- [ ] **Step 6: Update empty state styling**

Replace lines 349-361 (empty state) with:

```tsx
{data.categories.length === 0 && (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-16 nb-bg-primary nb-border-2 nb-border-dashed nb-shadow-md rounded-3xl"
  >
    <p className="font-pixel-body text-lg mb-4 text-[#636E72]">Chưa có nhóm món nào</p>
    <Button onClick={handleAddCategory} variant="neubrutal" nbColor="primary">
      <Plus className="w-4 h-4 mr-2" />
      Thêm Nhóm Món Đầu Tiên
    </Button>
  </motion.div>
)}
```

- [ ] **Step 7: Update footer actions styling**

Replace lines 364-382 (footer actions) with:

```tsx
<div className="flex gap-3 mt-8 pt-6 nb-border-t-2">
  <Button
    variant="neubrutal"
    nbColor="outline"
    onClick={onBack}
  >
    <ChevronLeft className="w-4 h-4 mr-2" />
    Quay Lại
  </Button>
  <Button
    onClick={onExport}
    variant="neubrutal"
    nbColor="secondary"
    className="flex-1 px-8 py-3 text-lg"
  >
    Tiếp Tục Xuất Menu
  </Button>
</div>
```

- [ ] **Step 8: Verify changes**

Run: `npx tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 9: Commit**

```bash
git add components/page-component/MenuEditScreen.tsx
git commit -m "feat: redesign MenuEditScreen with neubrutal style

- Apply vibrant pastel color scheme
- Add 2px borders and hard shadows
- Use pixel fonts throughout
- Style category headers with neubrutal cards
- Style item list with neubrutal styling
- Add hover/active effects for interactive elements"
```
