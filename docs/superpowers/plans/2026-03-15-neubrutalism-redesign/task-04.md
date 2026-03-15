### Task 4: Add Neubrutal Variant to Input Component

**Files:**
- Modify: `components/ui/Input.tsx`

- [ ] **Step 1: Add neubrutal variant to InputProps interface**

After line 3, add neubrutal to variant options:

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'secondary' | 'glass' | 'neubrutal'
  label?: string
  error?: boolean
}
```

- [ ] **Step 2: Add neubrutal variant styles**

After line 19 (after oldVariantStyles), add:

```typescript
// Neubrutal variant styles
const neubrutalVariantStyles = 'nb-bg-white nb-border-2 nb-input-focus nb-transition px-4 py-3 text-[#2D3436] placeholder:text-[#636E72]'
```

- [ ] **Step 3: Update variant selection logic**

Modify the variantStyles logic (around line 22):

```typescript
const getVariantStyles = () => {
  if (variant === 'neubrutal') {
    return neubrutalVariantStyles
  }
  return variant === 'glass' ? oldVariantStyles : newVariantStyles
}
```

- [ ] **Step 4: Update className generation**

Modify the className prop (around line 38):

```typescript
className={`w-full text-sm ${getVariantStyles()} ${error && variant === 'neubrutal' ? 'border-[#FF6B6B] shadow-[2px_2px_0_#FF6B6B]' : error ? 'ring-red-500' : ''} ${className}`}
```

- [ ] **Step 5: Update label styles for neubrutal**

Add neubrutal label style to labelStyles (after line 28):

```typescript
const labelStyles: Record<string, string> = {
  default: 'text-slate-700',
  secondary: 'text-slate-600',
  glass: 'text-white/70',
  neubrutal: 'text-[#2D3436] font-bold',
}
```

- [ ] **Step 6: Verify Input component**

Run: `npx tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 7: Commit**

```bash
git add components/ui/Input.tsx
git commit -m "feat: add neubrutal variant to Input component

- Add bold border styling
- Add focus effect with primary color shadow
- Support error state with red border
- Bold label text for neubrutal variant"
```
