# UI Review - Menu Extractor

**Audited:** 2026-04-12
**Pages:** 4 pages audited (Admin Users, Admin Registrations, Access Denied, Login)
**Baseline:** Design system in `/components/ui/` (Button, Card, Input, LiquidGlass components)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Visual Consistency | 2/4 | Components inconsistently used; native `<input>` and `<select>` used instead of design system Input/Select |
| 2. Layout & Hierarchy | 2/4 | Header content not centered to match content container width; inconsistent full-width vs constrained layouts |
| 3. Interactivity & Feedback | 2/4 | Missing loading states on action buttons (Edit, Toggle, Delete); custom "..." text used instead of spinners |
| 4. Responsive Design | 3/4 | Mobile layouts functional but filter controls stack awkwardly; no overflow handling for long content |
| 5. Accessibility | 2/4 | Missing focus-visible outlines on custom buttons; form labels present but not consistently associated |
| 6. Polish | 2/4 | Toast positioning may overlap sticky header; border-radius inconsistency (some use rounded-lg, some rounded-xl) |

**Overall: 13/24**

---

## Top 3 Priority Fixes

1. **[CRITICAL] Action buttons missing loading/disabled states** — Users see no feedback during API operations on Edit, Toggle, Delete actions. Add `disabled={isProcessing}` state and show spinner icon during fetch calls.
2. **[CRITICAL] Inconsistent component usage** — Native `<input>` and `<select>` used throughout instead of design system `Input` and `Button` components. Replace with `Input` variant="secondary" for form fields.
3. **[MEDIUM] Header content not centered** — Header uses `w-full px-6` while main content uses `px-6 max-w-5xl mx-auto`. Header should also be constrained to `max-w-5xl mx-auto` for consistent alignment.

---

## Detailed Findings

### Pillar 1: Visual Consistency (2/4)

#### Admin Users Page

| Issue | Location | Severity | Fix |
|-------|----------|----------|-----|
| Using native `<input>` instead of `Input` component | `admin-users-client.tsx:275-296` | Critical | Replace with `<Input variant="secondary" label="..." />` |
| Using native `<select>` instead of design system | `admin-users-client.tsx:302-309` | Critical | Create Select component or use native with consistent styling |
| Custom button styles for filters instead of `Button` component | `admin-users-client.tsx:233-250` | Medium | Use `<Button variant="ghost" size="sm">` with active state styling |

#### Admin Registrations Page

| Issue | Location | Severity | Fix |
|-------|----------|----------|-----|
| Custom styled filter buttons instead of `Button` | `admin-registrations-client.tsx:151-163` | Medium | Use `<Button variant={filter===f ? "primary" : "ghost"}>` |
| Role selector uses custom `<button>` styling | `admin-registrations-client.tsx:174-193` | Medium | Use `Button` component with active class toggling |
| Native `<input>` used in registration form | `access-denied-form.tsx:101-137` | Medium | Replace with `Input` component |

#### Login Page

| Issue | Location | Severity | Fix |
|-------|----------|----------|-----|
| Custom Google login button instead of `Button` | `login/page.tsx:82-100` | Medium | Create consistent button using `Button` variant with Google icon |
| Custom spinner vs design system | `login/page.tsx:88` | Minor | Use consistent `<Loader2 className="animate-spin" />` pattern |

---

### Pillar 2: Layout & Hierarchy (2/4)

#### Header Alignment Issue (Known Issue - Confirmed)

| Issue | Location | Severity | Fix |
|-------|----------|----------|-----|
| Header uses `w-full px-6` but content uses `px-6 max-w-5xl mx-auto` | `admin-users-client.tsx:180`, `admin-registrations-client.tsx:118` | Medium | Wrap header content in `<div className="max-w-5xl mx-auto px-6">` |
| Stats summary not visually separated | `admin-users-client.tsx:459-469` | Minor | Add Card wrapper or more top spacing |

#### Content Width Inconsistency

The admin pages have inconsistent width handling:
- **Header:** Full width with just padding
- **Main content:** Constrained to `max-w-5xl mx-auto`

This causes the navbar content to not be centered relative to the main content below it.

---

### Pillar 3: Interactivity & Feedback (2/4)

#### Missing Loading States on Action Buttons

| Issue | Location | Severity | Fix |
|-------|----------|----------|-----|
| Edit button - no loading state | `admin-users-client.tsx:424-430` | Critical | Disable button and show spinner during editing modal open |
| Toggle Active - no disabled/loading state | `admin-users-client.tsx:431-443` | Critical | Add `disabled={processingId === user.id}` and spinner |
| Delete button - no loading state | `admin-users-client.tsx:444-450` | Critical | Add `disabled={processingId === user.id}` and spinner |
| Approve/Reject - shows "..." text | `admin-registrations-client.tsx:270,279` | Medium | Replace "..." with `<Loader2 className="w-4 h-4 animate-spin" />` |

#### Toast Message Positioning

Toast appears at `top-20 right-6` which is close to the sticky header at `top-0`. The toast may need adjustment to not overlap header shadow.

---

### Pillar 4: Responsive Design (3/4)

#### Admin Users Page

| Issue | Location | Severity | Fix |
|-------|----------|----------|-----|
| Filters stack but justify-between causes awkward gap on mobile | `admin-users-client.tsx:221` | Minor | Use `items-start sm:items-center` with proper flex wrapping |
| Stats summary wraps weirdly | `admin-users-client.tsx:459` | Minor | Use flex-wrap or stack on mobile |
| Table columns hide on mobile but no mobile card view | `admin-users-client.tsx:354` | Medium | Consider mobile card view or scrollable table |

#### Admin Registrations Page

| Issue | Location | Severity | Fix |
|-------|----------|----------|-----|
| Registration cards may overflow on small screens | `admin-registrations-client.tsx:217` | Minor | Add `overflow-hidden` to card or adjust padding |
| Role selector buttons may wrap awkwardly | `admin-registrations-client.tsx:174-193` | Minor | Wrap in flex container with proper gap |

---

### Pillar 5: Accessibility (2/4)

#### Focus States Missing

| Issue | Location | Severity | Fix |
|-------|----------|----------|-----|
| Custom filter buttons missing focus-visible ring | `admin-registrations-client.tsx:151-163` | Medium | Add `focus-visible:ring-2 focus-visible:ring-[#2463eb] focus-visible:ring-offset-2` |
| Role selector buttons missing focus ring | `admin-registrations-client.tsx:174-193` | Medium | Add same focus-visible classes |
| Custom action buttons (Edit, Toggle, Delete) | `admin-users-client.tsx:424-450` | Medium | Add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2463eb]` |
| Google login button missing focus ring | `login/page.tsx:82-100` | Medium | Add focus-visible styling |

#### Form Accessibility

| Issue | Location | Severity | Fix |
|-------|----------|----------|-----|
| Native inputs in forms lack proper id association | `admin-users-client.tsx:275-296` | Low | Use `Input` component which handles labels properly |
| Form labels are present but using `htmlFor` | `access-denied-form.tsx:98-113` | Low | Labels properly associated with inputs via `htmlFor` |

---

### Pillar 6: Polish (2/4)

#### Border Radius Inconsistency

| Issue | Location | Severity | Fix |
|-------|----------|----------|-----|
| Form inputs use `rounded-xl` | `access-denied-form.tsx:106,120,136` | Minor | Use consistent `rounded-lg` to match other components |
| Toast uses `rounded-xl` | `admin-users-client.tsx:210` | Minor | Use `rounded-lg` to match Button variant |
| Cards consistently use `rounded-lg` or `rounded-2xl` | Mixed | Low | Pick one: `rounded-xl` seems to be the standard |

#### Loading States

| Issue | Location | Severity | Fix |
|-------|----------|----------|-----|
| "..." text used instead of spinner icons | `admin-registrations-client.tsx:270,279` | Medium | Use `<Loader2 className="w-4 h-4 animate-spin" />` |
| Loading text "Đang tải..." not centered properly | `admin-users-client.tsx:338`, `admin-registrations-client.tsx:202` | Minor | Add `flex items-center justify-center` wrapper |

---

## Page-by-Page Summary

### 1. Admin Users Page (`/app/admin/users/page.tsx` + `admin-users-client.tsx`)

**Score: 12/24 (2 per pillar average)**

**Critical Issues:**
- Action buttons (Edit, Toggle, Delete) have no loading/disabled states
- Native `<input>` and `<select>` used instead of design system components
- Header content not centered (known issue confirmed)

**Good Practices:**
- Toast notifications for success/error feedback
- Empty state handling
- Search and filter functionality
- Loading skeleton text

---

### 2. Admin Registrations Page (`/app/admin/registrations/page.tsx` + `admin-registrations-client.tsx`)

**Score: 13/24 (slightly better than Users page)**

**Critical Issues:**
- Role selector uses custom button styling instead of `Button` component
- Filter buttons use custom styling instead of `Button` component
- Approve/Reject buttons show "..." text during loading instead of spinner

**Good Practices:**
- Filter tabs with active state styling
- Role preview selector before approval
- Good empty state messaging
- Stats summary

---

### 3. Access Denied Page (`/app/access-denied/page.tsx` + `access-denied-form.tsx`)

**Score: 14/24 (best of the four pages)**

**Issues Found:**
- Native `<input>` elements used instead of `Input` component
- Border-radius inconsistency (uses `rounded-xl` while other pages use `rounded-lg`)

**Good Practices:**
- Clean visual hierarchy
- Proper gradient header
- Success state after submission
- Contact info displayed
- Good empty state handling

---

### 4. Login Page (`/app/login/page.tsx`)

**Score: 12/24**

**Issues Found:**
- Google login button is fully custom instead of using `Button` component
- No focus-visible ring on the Google button
- Custom spinner vs design system approach
- Registration link section uses inline custom styling

**Good Practices:**
- Clean centered layout
- Good gradient background
- Loading state for OAuth flow
- Registration fallback UI

---

## Files Audited

1. `/home/tuong/Personal_project/menu-extractor/app/admin/users/page.tsx`
2. `/home/tuong/Personal_project/menu-extractor/components/admin/users/admin-users-client.tsx`
3. `/home/tuong/Personal_project/menu-extractor/app/admin/registrations/page.tsx`
4. `/home/tuong/Personal_project/menu-extractor/components/admin/registrations/admin-registrations-client.tsx`
5. `/home/tuong/Personal_project/menu-extractor/app/access-denied/page.tsx`
6. `/home/tuong/Personal_project/menu-extractor/components/access-denied/access-denied-form.tsx`
7. `/home/tuong/Personal_project/menu-extractor/app/login/page.tsx`

## Design System Components Referenced

- `/home/tuong/Personal_project/menu-extractor/components/ui/Button.tsx`
- `/home/tuong/Personal_project/menu-extractor/components/ui/Card.tsx`
- `/home/tuong/Personal_project/menu-extractor/components/ui/Input.tsx`
- `/home/tuong/Personal_project/menu-extractor/components/ui/liquid-glass/LiquidGlassButton.tsx`
- `/home/tuong/Personal_project/menu-extractor/components/ui/liquid-glass/LiquidGlassCard.tsx`
- `/home/tuong/Personal_project/menu-extractor/components/ui/liquid-glass/LiquidGlassInput.tsx`

---

## Registry Audit

Registry audit: No shadcn components.json found, no third-party registries to audit.
