### Task 2: Add Neubrutal Variant to Button Component

**Files:**
- Modify: `components/ui/Button.tsx`

- [ ] **Step 1: Add neubrutal variant to ButtonProps interface**

After line 7, add `'neubrutal'` to variant options:

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'default' | 'glass' | 'neubrutal'
  // ... rest of interface
}
```

- [ ] **Step 2: Add neubrutal variant styles**

After line 28 (after gradientStyles object), add:

```typescript
// Neubrutal variant styles
const neubrutalVariantStyles: Record<string, string> = {
  primary: 'bg-[#FFB347] nb-border-2 nb-shadow-sm nb-button-hover nb-button-active nb-transition text-[#2D3436]',
  secondary: 'bg-[#4ECDC4] nb-border-2 nb-shadow-sm nb-button-hover nb-button-active nb-transition text-[#2D3436]',
  accent: 'bg-[#FF6B9D] nb-border-2 nb-shadow-sm nb-button-hover nb-button-active nb-transition text-[#2D3436]',
  outline: 'bg-[#FFF9E6] nb-border-2 nb-shadow-sm nb-button-hover nb-button-active nb-transition text-[#2D3436]',
}
```

- [ ] **Step 3: Update variant selection logic**

Modify the variantStyles mapping logic (around line 44-45) to handle neubrutal:

```typescript
const isNeubrutalVariant = variant === 'neubrutal'
const isNewVariant = ['primary', 'secondary', 'outline', 'ghost', 'neubrutal'].includes(variant)

// When neubrutal variant, use neubrutal styles directly
const getVariantStyles = () => {
  if (variant === 'neubrutal') {
    // For neubrutal, we need to know which color variant
    // We'll add a color prop or infer from gradient prop
    if (gradient === 'purple-blue' || !gradient) return neubrutalVariantStyles.primary
    if (gradient === 'blue-cyan') return neubrutalVariantStyles.secondary
    if (gradient === 'purple-cyan') return neubrutalVariantStyles.accent
    return neubrutalVariantStyles.primary
  }
  return isNewVariant ? newVariantStyles : oldVariantStyles
}
```

- [ ] **Step 4: Update className generation**

Modify the className prop (around line 56) to use the new logic:

```typescript
className={`${baseStyles} ${getVariantStyles()} ${sizeStyles[size]} ${glow ? 'shadow-lg shadow-purple-500/50' : ''} ${className}`}
```

- [ ] **Step 5: Add neubrutal color prop**

To make neubrutal button more flexible, add a `nbColor` prop:

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'default' | 'glass' | 'neubrutal'
  nbColor?: 'primary' | 'secondary' | 'accent' | 'outline'
  // ... rest of interface
}
```

Update getVariantStyles:

```typescript
const getVariantStyles = () => {
  if (variant === 'neubrutal') {
    const color = nbColor || 'primary'
    return neubrutalVariantStyles[color]
  }
  return isNewVariant ? newVariantStyles : oldVariantStyles
}
```

- [ ] **Step 6: Verify Button component**

Run: `npx tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 7: Commit**

```bash
git add components/ui/Button.tsx
git commit -m "feat: add neubrutal variant to Button component

- Add nbColor prop for color selection
- Add hard shadow utilities
- Add hover/active effects with translate
- Support primary (orange), secondary (teal), accent (pink), outline variants"
```
