# Coding Conventions

**Analysis Date:** 2026-03-19

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `MenuUploadScreen.tsx`, `Button.tsx`)
- API Routes: kebab-case (e.g., `api/products/route.ts`, `api/extract/route.ts`)
- Type definitions: kebab-case (e.g., `menu.ts`, `quotation.ts`)
- Utilities: kebab-case (e.g., `image-storage.ts`)

**Functions:**
- React components: PascalCase
- Helper functions: camelCase (e.g., `handleImageUpload`, `slugify`)
- Event handlers: `handle` prefix (e.g., `handleFileChange`)
- API routes: HTTP method (e.g., `GET`, `POST`)

**Variables:**
- State variables: camelCase (e.g., `currentStep`, `menuData`)
- Constants: UPPER_SNAKE_CASE for configuration (e.g., `MAX_IMAGES`)
- DOM references: `ref` postfix (e.g., `fileInputRef`)

**Types:**
- Interfaces: PascalCase (e.g., `MenuData`, `ButtonProps`)
- Optional properties: Use `?` suffix (e.g., `restaurantName?: string`)

## Code Style

**Formatting:**
- Tool: ESLint with Next.js config
- Format: Prettier (implied by Next.js default setup)
- Target: TypeScript with React
- Strict mode: Enabled in `tsconfig.json`

**Linting:**
- Rules: `eslint-config-next` and `eslint-config-next/typescript`
- Ignore patterns: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`
- Command: `npm run lint`

## Import Organization

**Order:**
1. React/Next.js imports (e.g., `import React`, `import NextRequest`)
2. External library imports (e.g., `import { Button }`, `import { useState }`)
3. Internal absolute imports (e.g., `import { MenuData } from "@/types/menu"`)
4. Internal relative imports (e.g., `import MenuUploadScreen from "../components/page-component/MenuUploadScreen"`)

**Path Aliases:**
- `@/*` → `./` (root directory)

**Import Patterns:**
```typescript
// React hooks import
import { useState, useEffect } from "react";

// Named imports
import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";

// Default imports
import MenuUploadScreen from "../components/page-component/MenuUploadScreen";
```

## Error Handling

**Patterns:**
```typescript
// API route error handling
try {
  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
} catch (error) {
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

// Component error handling
const handleImageUpload = async (files: File[], extractionOption: string) => {
  setLoading(true);
  setError(null);

  try {
    // Upload logic
  } catch (err: any) {
    console.error("Error:", err);
    setError(err.message || "Lỗi phân tích menu. Vui lòng thử lại.");
  } finally {
    setLoading(false);
  }
};
```

**Validation:**
- Form fields: Required field checking (e.g., `requiredFields = ['name', 'category', 'unit', 'price']`)
- File validation: Type and size checking (e.g., `file.type.startsWith("image/")`, `file.size > 20 * 1024 * 1024`)
- API responses: Error codes and messages

## Logging

**Framework:** Console logging for development
**Patterns:**
```typescript
console.log(`Extracted menu data from ${file.name}:`, data);
console.error("Error:", err);
console.error('Failed to update product with image info:', updateError);
```

**When to Log:**
- API responses for debugging
- File upload operations
- Error states
- Data transformation steps

## Comments

**When to Comment:**
- Complex business logic
- API endpoint documentation
- Technical debt explanations
- Vietnamese descriptions for UI elements

**JSDoc/TSDoc:**
- Limited usage - mostly for interfaces
- API routes have inline comments explaining methods

## Function Design

**Size:**
- Event handlers: Small and focused (e.g., `handleFileChange`)
- API routes: Handle one responsibility per method
- Components: Keep focused on UI logic

**Parameters:**
- Prefer object destructuring for component props
- Use interfaces for complex parameter objects
- Optional parameters with default values

**Return Values:**
- Async functions: Promise<any> or typed Promise
- Event handlers: Usually void
- API routes: NextResponse

## Module Design

**Exports:**
- Components: Default export
- Types: Named exports
- Utilities: Named exports for functions
- API routes: Named function exports (GET, POST, etc.)

**Barrel Files:**
- Not used - direct imports from files

---

*Convention analysis: 2026-03-19*
