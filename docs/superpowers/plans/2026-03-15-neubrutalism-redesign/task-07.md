### Task 7: Redesign MenuExportScreen with Neubrutal Style

**Files:**
- Modify: `components/page-component/MenuExportScreen.tsx`

- [ ] **Step 1: Update main container styling**

Replace line 122 with:

```tsx
<div className="min-h-screen py-8 px-4 neubrutal-theme">
```

- [ ] **Step 2: Update header section**

Replace lines 124-147 (header section) with:

```tsx
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  className="mb-8"
>
  <h1 className="font-pixel text-3xl font-bold text-[#FF6B9D] mb-2">
    {hasExportedBoth
      ? "Hoàn tất xuất file"
      : hasExportedAny
        ? "Xuất file thành công"
        : "Sẵn sàng xuất file"}
  </h1>
  <p className="font-pixel-body text-[#636E72]">
    {hasExportedBoth
      ? "Tất cả file đã được xuất thành công. Bạn có thể tải lại hoặc quay về chỉnh sửa."
      : hasExportedAny
        ? "Tiếp tục xuất file còn lại hoặc tải lại file đã xuất"
        : "Chọn loại file bạn muốn xuất"}
  </p>
  <p className="mt-2 font-pixel text-sm text-[#4ECDC4] font-semibold">
    Sản phẩm của OSCAR TEAM. Chúc anh em OSCAR TEAM về 100% số cuối tháng!
  </p>
</motion.div>
```

- [ ] **Step 3: Update summary card styling**

Replace lines 150-195 (summary card) with:

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5, delay: 0.1 }}
>
  <Card variant="neubrutal" nbColor="white" className="mb-6">
    <CardContent className="p-6">
      <div className="space-y-4">
        <div>
          <label className="font-pixel text-sm font-medium text-[#636E72]">Tên nhà hàng</label>
          <p className="font-pixel-body text-xl font-semibold text-[#2D3436] mt-1">{restaurantName}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#FFB347]/20 nb-border-2 nb-shadow-sm rounded-2xl p-5">
            <p className="font-pixel text-3xl font-bold text-[#FFB347]">{totalItems}</p>
            <p className="font-pixel-body text-sm text-[#636E72]">Tổng số món</p>
          </div>
          <div className="bg-[#4ECDC4]/20 nb-border-2 nb-shadow-sm rounded-2xl p-5">
            <p className="font-pixel text-3xl font-bold text-[#4ECDC4]">{categories.length}</p>
            <p className="font-pixel-body text-sm text-[#636E72]">Số nhóm món</p>
          </div>
        </div>

        <div>
          <label className="font-pixel text-sm font-medium text-[#636E72] block mb-3">
            Các nhóm món trong thực đơn
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <motion.span
                key={cat}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="font-pixel bg-[#FFB347]/20 text-[#FFB347] px-4 py-2 rounded-xl text-sm font-medium nb-border-2 nb-shadow-sm nb-transition nb-button-hover"
              >
                {cat}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</motion.div>
```

- [ ] **Step 4: Update export status section**

Replace lines 198-260 (export status) with:

```tsx
<AnimatePresence>
  {hasExportedAny && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6 space-y-3"
    >
      <h3 className="font-pixel text-sm font-semibold text-[#636E72] uppercase tracking-wide">
        Trạng thái xuất file
      </h3>

      {/* Menu Export Status */}
      {exportedFiles.menu && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#4ECDC4]/10 nb-border-2 nb-shadow-md rounded-2xl"
        >
          <div className="p-4 flex items-center gap-4">
            <div className="bg-[#4ECDC4] rounded-full p-3">
              <Check className="w-5 h-5 text-[#FFF9E6]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <FileSpreadsheet className="w-5 h-5 text-[#4ECDC4]" />
                <h4 className="font-pixel font-semibold text-[#2D3436]">File Menu Excel</h4>
              </div>
              <p className="font-pixel-body text-sm text-[#636E72]">
                {restaurantName}_menu.xlsx • {totalItems} món
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Category Export Status */}
      {exportedFiles.category && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#FFB347]/10 nb-border-2 nb-shadow-md rounded-2xl"
        >
          <div className="p-4 flex items-center gap-4">
            <div className="bg-[#FFB347] rounded-full p-3">
              <Check className="w-5 h-5 text-[#FFF9E6]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <FolderOpen className="w-5 h-5 text-[#FFB347]" />
                <h4 className="font-pixel font-semibold text-[#2D3436]">File Nhóm món Excel</h4>
              </div>
              <p className="font-pixel-body text-sm text-[#636E72]">
                {restaurantName}_categories.xlsx • {categories.length} nhóm
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )}
</AnimatePresence>
```

- [ ] **Step 5: Update export cards styling**

Replace lines 264-375 (export cards) with:

```tsx
<div className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Menu Export Button */}
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        variant="neubrutal"
        nbColor={exportedFiles.menu ? "accent" : "white"}
        className="nb-shadow-md nb-card-hover"
      >
        <CardContent className="p-5">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-[#FFB347]/20 rounded-xl p-3">
                <FileSpreadsheet className="w-6 h-6 text-[#FFB347]" />
              </div>
              <div className="flex-1">
                <h4 className="font-pixel font-semibold text-[#2D3436] text-lg">File Menu</h4>
                <p className="font-pixel-body text-sm text-[#636E72] mt-1">
                  Xuất 22 cột đầy đủ thông tin món ăn
                </p>
              </div>
              {exportedFiles.menu && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-[#4ECDC4] rounded-full p-2"
                >
                  <Check className="w-5 h-5 text-[#FFF9E6]" />
                </motion.div>
              )}
            </div>
            <Button
              onClick={handleExportMenu}
              disabled={exporting !== null}
              variant="neubrutal"
              nbColor="primary"
              className="w-full"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              {exporting === "menu"
                ? "Đang xuất..."
                : exportedFiles.menu
                  ? "Tải lại Menu"
                  : "Xuất Menu"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>

    {/* Category Export Button */}
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        variant="neubrutal"
        nbColor={exportedFiles.category ? "accent" : "white"}
        className="nb-shadow-md nb-card-hover"
      >
        <CardContent className="p-5">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-[#4ECDC4]/20 rounded-xl p-3">
                <FolderOpen className="w-6 h-6 text-[#4ECDC4]" />
              </div>
              <div className="flex-1">
                <h4 className="font-pixel font-semibold text-[#2D3436] text-lg">File Nhóm món</h4>
                <p className="font-pixel-body text-sm text-[#636E72] mt-1">
                  Xuất danh sách tên và mã nhóm món
                </p>
              </div>
              {exportedFiles.category && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-[#4ECDC4] rounded-full p-2"
                >
                  <Check className="w-5 h-5 text-[#FFF9E6]" />
                </motion.div>
              )}
            </div>
            <Button
              onClick={handleExportCategory}
              disabled={exporting !== null}
              variant="neubrutal"
              nbColor="secondary"
              className="w-full"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              {exporting === "category"
                ? "Đang xuất..."
                : exportedFiles.category
                  ? "Tải lại Nhóm món"
                  : "Xuất Nhóm món"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  </div>
```

- [ ] **Step 6: Update back button styling**

Replace lines 378-387 (back button) with:

```tsx
<Button
  variant="neubrutal"
  nbColor="outline"
  onClick={onBack}
  className="w-full"
  disabled={exporting !== null}
>
  <ArrowLeft className="w-4 h-4 mr-2" />
  Quay lại chỉnh sửa
</Button>
```

- [ ] **Step 7: Verify changes**

Run: `npx tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 8: Commit**

```bash
git add components/page-component/MenuExportScreen.tsx
git commit -m "feat: redesign MenuExportScreen with neubrutal style

- Apply vibrant pastel color scheme
- Add 2px borders and hard shadows
- Use pixel fonts throughout
- Style summary cards with neubrutal design
- Style export status cards with neubrutal style
- Add hover/active effects for buttons"
```
