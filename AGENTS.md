# AGENTS.md

This guide helps agentic coding agents work effectively in this repository.

## Build/Lint/Test Commands

```bash
npm run dev       # Start development server on port 3000
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint on all files
```

**Running Tests:**
- Playwright is installed but no test suite is configured yet
- Tests can be added in `tests/` or `e2e/` directories when needed
- Create `playwright.config.ts` to configure test runners

## Project Overview

Next.js 16 App Router with TypeScript, Tailwind CSS v4, and Supabase backend.
Uses AI (Google Gemini) for menu extraction from images.

## Code Style Guidelines

### Imports

Use `@/*` path alias for internal imports. Order imports by grouping:
1. React/hooks and next imports
2. Third-party libraries
3. Local components
4. Utilities/libs
5. Types

```typescript
"use client"

import { useState, useEffect } from "react"
import { NextRequest, NextResponse } from "next/server"
import { Button } from "@/components/ui/Button"
import { extractMenuFromImage } from "@/libs/gemini-client"
import { MenuData } from "@/types/menu"
```

Use `import type` for type-only imports:
```typescript
import type { Metadata } from "next"
import type { ReactNode } from "react"
```

### TypeScript

- **Strict mode enabled** - all types must be explicit
- Use `export interface` for public types
- Use `export enum` for related constants
- Optional fields marked with `?`
- Union types with `|`

```typescript
export interface MenuItem {
  id: string
  name: string
  price: string
  description?: string
}

export enum ProductCategory {
  SOFTWARE = 'software',
  HARDWARE = 'hardware',
}
```

### Naming Conventions

- **Components:** PascalCase - `ProductForm`, `Button`, `MenuUploadScreen`
- **Functions:** camelCase - `calculateItemTotal`, `extractMenuFromImage`
- **Constants/Enums:** UPPER_SNAKE_CASE - `ProductCategory`, `QuotationStatus`
- **Files:** PascalCase for components, kebab-case for libs
- **Props interfaces:** `<ComponentName>Props` - `ProductFormProps`

### Component Patterns

Mark client components with `"use client"` at the top.
Use `React.forwardRef` for components needing ref forwarding.
Define props interfaces before the component.

```typescript
"use client"

import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}, ref) => {
  return (
    <button ref={ref} className={...} {...props}>
      {children}
    </button>
  )
})

Button.displayName = 'Button'
```

### Styling

- Use Tailwind CSS utility classes
- Glass/blur effects: `bg-white/10 backdrop-blur-md`
- Primary color: `#2463eb` (blue)
- Gradients: `bg-gradient-to-r from-purple-600 to-blue-600`
- Responsive: `md:`, `lg:` prefixes
- Animation: `motion.div` from framer-motion for complex animations
- Clean design variants for new components (primary, secondary, outline, ghost)

### API Routes

Place in `app/api/[route]/route.ts`. Use Next.js App Router conventions:

```typescript
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    // Handle logic
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Message' }, { status: 500 })
  }
}
```

### Error Handling

- Use try/catch for async operations
- Return appropriate HTTP status codes
- Validate user input before processing
- Use console.error for debugging

```typescript
try {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch')
  }
} catch (error) {
  console.error('Operation failed:', error)
  return NextResponse.json({ error: 'Internal error' }, { status: 500 })
}
```

### Database (Supabase)

Client initialization in `libs/supabase-client.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### State Management

- Use React hooks (`useState`, `useEffect`) for local state
- Use localStorage for persistence between reloads
- Lift state up when shared between components
- Consider context for deeply nested state

### File Organization

```
app/
  api/[route]/route.ts     # API routes
  layout.tsx               # Root layout
  page.tsx                 # Pages
components/
  ui/                      # Reusable UI components
  page-component/          # Page-specific components
  [feature]/               # Feature components
libs/                      # Utility functions
types/                     # TypeScript definitions
```

### Additional Guidelines

- Vietnamese language in UI strings is common
- Markdown support for rich text descriptions
- Use Zod for validation when needed
- Keep components focused and composable
- Use environment variables for secrets (NEVER commit .env)
