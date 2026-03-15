### Task 3: Add Neubrutal Variant to Card Component

**Files:**
- Modify: `components/ui/Card.tsx`

- [ ] **Step 1: Add neubrutal variant to CardProps interface**

After line 4, add neubrutal to variant options:

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'neubrutal'
}
```

- [ ] **Step 2: Add neubrutal variant styles**

After line 10 (after existing variantStyles), add:

```typescript
// Neubrutal variant styles
const neubrutalVariantStyles = {
  default: 'nb-bg-primary nb-border-2 nb-shadow-md nb-card-hover nb-transition',
  accent: 'nb-bg-accent nb-border-2 nb-shadow-md nb-card-hover nb-transition',
  white: 'nb-bg-white nb-border-2 nb-shadow-md nb-card-hover nb-transition',
}
```

- [ ] **Step 3: Update variant selection logic**

Modify the className logic (around line 15-16):

```typescript
const getVariantStyles = () => {
  if (variant === 'neubrutal') {
    return neubrutalVariantStyles.default
  }
  return variantStyles[variant] || variantStyles.default
}

return (
  <div
    className={`${getVariantStyles()} ${className}`}
    {...props}
  >
    {children}
  </div>
)
```

- [ ] **Step 4: Add neubrutalColor prop for more flexibility**

Update interface to accept color options:

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'neubrutal'
  nbColor?: 'default' | 'accent' | 'white'
}
```

Update getVariantStyles:

```typescript
const getVariantStyles = () => {
  if (variant === 'neubrutal') {
    const color = nbColor || 'default'
    return neubrutalVariantStyles[color] || neubrutalVariantStyles.default
  }
  return variantStyles[variant] || variantStyles.default
}
```

- [ ] **Step 5: Verify Card component**

Run: `npx tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 6: Commit**

```bash
git add components/ui/Card.tsx
git commit -m "feat: add neubrutal variant to Card component

- Add hard shadow utilities
- Add hover scale effect
- Support default, accent, white color variants
- Smooth transitions for interactive feel"
```
