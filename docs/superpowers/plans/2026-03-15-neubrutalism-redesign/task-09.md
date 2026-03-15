### Task 9: Update Layout to Include Neubrutal CSS

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update body className to include neubrutal theme**

Replace line 27 with:

```tsx
<body className={`${inter.className} neubrutal-theme`}>{children}</body>
```

- [ ] **Step 2: Verify the layout compiles correctly**

Run: `npx tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 3: Verify the app renders correctly**

Run: `npm run dev`
Expected: Dev server starts, pages load with neubrutal styling applied

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: apply neubrutal theme to layout

- Add neubrutal-theme class to body
- Ensures neubrutal CSS variables are available globally"
```
