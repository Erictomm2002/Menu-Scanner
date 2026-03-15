# Neubrutalism Redesign Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement.

**Goal:** Redesign entire app with Neubrutalism style featuring vibrant pastels, 2px bold borders, hard shadows, pixel typography, and interactive elements.

**Architecture:**
1. Add Neubrutal CSS variables and utility classes to globals.css for the design system
2. Create new neubrutal variants for existing UI components (Button, Card, Input) while maintaining backward compatibility
3. Redesign all page components (MenuUploadScreen, MenuEditScreen, MenuExportScreen, home page) to use neubrutal styling
4. Keep pixel components as-is since they already have brutalist characteristics

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, Framer Motion, TypeScript

---

See `task-01.md`, `task-02.md`, etc. for individual tasks.

## Design System

### Color Palette (Vibrant Pastels)
- `--nb-bg-primary`: `#FFF9E6` (Cream/beige)
- `--nb-bg-secondary`: `#FFE5D4` (Light peach)
- `--nb-bg-accent`: `#E8F8F5` (Mint green)
- `--nb-primary`: `#FFB347` (Orange/peach)
- `--nb-secondary`: `#4ECDC4` (Teal/turquoise)
- `--nb-accent`: `#FF6B9D` (Pink)
- `--nb-border`: `#2D3436` (Dark gray/black)
- `--nb-text`: `#2D3436` (Dark text)

### Typography
- Headings: Press Start 2P (pixel font)
- Body: VT323 (pixel font)

### Visual Style
- Borders: 2px solid `--nb-border`
- Shadows: `box-shadow: 2px 2px 0 var(--nb-border)` (hard shadows, no blur)
- Hover: `translate(-1px, -1px)` with larger shadow
- Active/Pressed: `translate(2px, 2px)` with no shadow (pressed in effect)
- Transitions: `transition-all duration-150 ease-out`

### Component Variants

#### Neubrutal Button
- `primary`: Orange background, dark border
- `secondary`: Teal background, dark border
- `accent`: Pink background, dark border
- `outline`: Transparent background, dark border
- Disabled: Opacity 0.5, no hover effects

#### Neubrutal Card
- `default`: Cream background, 2px border, 3px offset shadow
- `accent`: Mint green background
- `hover`: Slight scale (1.02)

#### Neubrutal Input
- Border: 2px solid dark
- Focus: Accent color border with shadow
- Background: Light cream

### Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `app/globals.css` | Modify | Add Neubrutal CSS variables and utility classes |
| `components/ui/Button.tsx` | Modify | Add neubrutal variants |
| `components/ui/Card.tsx` | Modify | Add neubrutal variant |
| `components/ui/Input.tsx` | Modify | Add neubrutal variant |
| `components/page-component/MenuUploadScreen.tsx` | Modify | Apply neubrutal styling |
| `components/page-component/MenuEditScreen.tsx` | Modify | Apply neubrutal styling |
| `components/page-component/MenuExportScreen.tsx` | Modify | Apply neubrutal styling |
| `app/page.tsx` | Modify | Apply neubrutal styling to home page |
| `app/layout.tsx` | Modify | Add neubrutal CSS import |

### Task Breakdown

1. **task-01**: Add Neubrutal CSS variables and utilities to globals.css
2. **task-02**: Add neubrutal variant to Button component
3. **task-03**: Add neubrutal variant to Card component
4. **task-04**: Add neubrutal variant to Input component
5. **task-05**: Redesign MenuUploadScreen with neubrutal style
6. **task-06**: Redesign MenuEditScreen with neubrutal style
7. **task-07**: Redesign MenuExportScreen with neubrutal style
8. **task-08**: Redesign home page with neubrutal style
9. **task-09**: Update layout to include neubrutal CSS
10. **task-10**: Final testing and verification
