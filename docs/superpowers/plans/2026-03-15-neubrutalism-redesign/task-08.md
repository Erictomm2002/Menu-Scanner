### Task 8: Redesign Home Page with Neubrutal Style

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Update main background styling**

Replace line 165 with:

```tsx
<main className="min-h-screen nb-bg-primary neubrutal-theme">
```

- [ ] **Step 2: Update navigation header styling**

Replace lines 167-184 (header section) with:

```tsx
<header className="relative z-20 nb-border-b-2 nb-bg-white">
  <div className="container mx-auto px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/">
          <Button variant="neubrutal" nbColor="outline" className="font-pixel">
            iPos Kit
          </Button>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="neubrutal" nbColor="outline">
          Đăng nhập
        </Button>
      </div>
    </div>
  </div>
</header>
```

- [ ] **Step 3: Update hero section styling**

Replace lines 188-252 (home content) with:

```tsx
<div className="relative z-10">
  {currentStep === "home" && (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-[calc(100vh-73px)] flex flex-col items-center justify-center px-6"
    >
      <h1 className="font-pixel text-4xl md:text-5xl lg:text-6xl font-bold text-[#FF6B9D] text-center mb-4">
        Giải pháp Tự động hóa Thông minh
      </h1>
      <p className="font-pixel-body text-lg md:text-xl text-center mb-16 text-[#636E72] max-w-2xl">
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
          <div className="nb-bg-white nb-border-2 nb-shadow-md nb-card-hover rounded-2xl p-8 h-full">
            <h3 className="font-pixel text-2xl font-semibold text-[#2D3436] mb-3 flex items-center gap-3">
              <FileText className="w-6 h-6 text-[#FFB347]" />
              Menu Extractor
            </h3>
            <p className="font-pixel-body text-[#636E72] mb-6">
              Tự động chuyển đổi menu nhà hàng sang định dạng số với độ chính xác cao bằng công nghệ AI OCR.
            </p>
            <div className="flex items-center font-pixel text-[#FFB347] font-medium group-hover:text-[#FFA327] nb-transition">
              Bắt đầu ngay
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 nb-transition" />
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
            <div className="nb-bg-white nb-border-2 nb-shadow-md nb-card-hover rounded-2xl p-8 h-full">
              <h3 className="font-pixel text-2xl font-semibold text-[#2D3436] mb-3 flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-[#FF6B9D]" />
                Báo giá sản phẩm
              </h3>
              <p className="font-pixel-body text-[#636E72] mb-6">
                Tạo báo giá sản phẩm chuyên nghiệp trong vài giây. Tối ưu quy trình bán hàng của bạn.
              </p>
              <div className="flex items-center font-pixel text-[#FF6B9D] font-medium group-hover:text-[#F45A8C] nb-transition">
                Bắt đầu ngay
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 nb-transition" />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )}
```

- [ ] **Step 4: Keep existing screen rendering logic**

The upload/edit/export screen rendering (lines 255-272) should remain as-is since they're already styled in their respective components.

- [ ] **Step 5: Verify changes**

Run: `npx tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx
git commit -m "feat: redesign home page with neubrutal style

- Apply vibrant pastel color scheme
- Add 2px borders and hard shadows
- Use pixel fonts for headings and body text
- Style hero section with neubrutal design
- Style feature cards with neubrutal style
- Add hover/active effects for interactive elements"
```
