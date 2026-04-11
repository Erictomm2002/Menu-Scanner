# QWEN.md - Menu Extractor Project Context

## Project Overview

**Menu Extractor** is a full-stack web application built for iPOS Vietnam to empower their sales team (iPOS Salesmen) with AI-powered tools for F&B solution deployment. The application provides two main features:

1. **Menu Extraction** - Upload food menu images and automatically extract structured menu data using Google Gemini AI
2. **Quotation Generation** - Create, manage, and export professional quotation documents for iPOS software/hardware products

The app is branded as **iPOS Kit** and serves as an internal tool for the iPOS sales team in Vietnam.

### Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS v4 + Framer Motion
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth with SSR cookies
- **AI:** Google Gemini 2.5 Flash API
- **Forms:** React Hook Form + Zod validation
- **PDF Generation:** @react-pdf/renderer
- **Excel Export:** ExcelJS, XLSX
- **UI Icons:** Lucide React
- **Markdown:** Marked, React Markdown + GFM

### Key Statistics

- 500+ Salesmen
- 10k+ Quotations generated
- 15k+ Menus extracted
- 30% Productivity improvement

## Project Structure

```
menu-extractor/
├── app/                          # Next.js App Router pages & API routes
│   ├── access-denied/            # Access denied page
│   ├── api/                      # API routes
│   │   ├── category-export/      # Excel export by category
│   │   ├── export/               # General export endpoints
│   │   ├── extract/              # Menu extraction endpoint
│   │   ├── products/             # Product CRUD operations
│   │   └── quotations/           # Quotation CRUD operations
│   ├── auth/                     # Auth-related pages
│   ├── login/                    # Login page
│   ├── maintenance/              # Maintenance page
│   ├── menu-extractor/           # Main menu extraction page
│   ├── products/                 # Product management page
│   ├── quotation/                # Quotation management page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page (iPOS Kit)
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── page-component/           # Page-specific components
│   │   ├── MenuEditScreen.tsx
│   │   ├── MenuExportScreen.tsx
│   │   └── MenuUploadScreen.tsx
│   ├── pixel/                    # Pixel/design system components
│   ├── product/                  # Product-related components
│   ├── quotation/                # Quotation-related components
│   ├── ui/                       # Reusable UI components
│   │   ├── liquid-glass/         # Glass morphism UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   └── UserMenu.tsx              # User menu component
├── libs/                         # Core utility libraries
│   ├── excel-category-generator.ts
│   ├── excel-generator.ts
│   ├── excel-to-pdf-direct.ts
│   ├── fonts.ts
│   ├── gemini-client.ts          # Google Gemini AI integration
│   ├── image-storage.ts          # Supabase image storage utilities
│   ├── markdown-to-excel.ts
│   ├── quotation-calculator.ts   # Quotation calculation logic
│   ├── quotation-generator.ts
│   ├── quotation-pdf-generator.tsx
│   └── supabase-client.ts        # Supabase client initialization
├── types/                        # TypeScript type definitions
│   ├── menu.ts                   # Menu data types
│   └── quotation.ts              # Product & quotation types
├── utils/                        # Helper functions
├── docs/                         # Documentation
├── public/                       # Static assets
├── tests/                        # Test files (Playwright)
├── stitch-designs/               # Design files/assets
├── *.sql                         # Database migration scripts
├── middleware.ts                 # Next.js middleware (auth protection)
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies & scripts
└── AGENTS.md                     # Coding agent guidelines
```

## Building and Running

### Prerequisites

- Node.js 20+
- npm
- Supabase project with configured tables and auth
- Google Gemini API key

### Environment Variables

Create a `.env` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

### Commands

```bash
# Development
npm run dev          # Start dev server on http://localhost:3000

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint on all files
```

### Database Setup

The project includes several SQL migration scripts that should be run in order:

1. `CREATE_ALLOWED_USERS_TABLE.sql` - Creates whitelist users table
2. `CREATE_SUBPRODUCTS_TABLE.sql` - Creates subproducts table
3. `CREATE_PRODUCT_IMAGES_BUCKET.sql` - Creates Supabase storage bucket
4. `ADD_ALLOWED_USERS.sql` - Inserts initial allowed users
5. `ADD_DISCOUNTS_TO_QUOTATIONS.sql` - Adds discount support
6. `ADD_IMAGE_COLUMNS_TO_PRODUCTS.sql` - Adds image fields to products
7. `ADD_PRODUCT_CATEGORY_TO_QUOTATION_ITEMS.sql` - Adds category field
8. `ADD_SUBPRODUCT_COLUMNS_TO_QUOTATION_ITEMS.sql` - Adds subproduct references
9. `FIX_PRODUCT_IMAGES_RLS.sql` - Fixes RLS policies
10. `INSERT_PRODUCTS_TO_SUPABASE.sql` - Seeds initial product data

## Architecture & Key Components

### Authentication & Authorization

- **Middleware** (`middleware.ts`) protects routes: `/menu-extractor`, `/quotation`, `/products`
- Uses Supabase SSR cookies for session management
- Whitelist-based access control via `allowed_users` table
- Auth routes (`/login`, `/access-denied`) redirect to home if already logged in

### Menu Extraction Flow

1. User uploads menu image via `MenuUploadScreen`
2. Image sent to `/api/extract` endpoint
3. API converts image to base64 and calls Google Gemini 2.5 Flash
4. Gemini returns structured JSON with restaurant name, categories, and menu items
5. Data displayed in `MenuEditScreen` for review and editing
6. Export options available via `MenuExportScreen` (Excel, PDF)

### Quotation System

- **Products** have categories (SOFTWARE/HARDWARE) and can have subproducts
- **QuotationItems** support hierarchical structure (parent/child via `indent_level`)
- **Discounts** stored as array with labels and amounts
- **PDF Generation** using @react-pdf/renderer with professional formatting
- **Excel Export** for data analysis and sharing

### Key Libraries

| File | Purpose |
|------|---------|
| `libs/gemini-client.ts` | AI-powered menu extraction from images |
| `libs/supabase-client.ts` | Supabase client (anon + service role) |
| `libs/quotation-calculator.ts` | Calculate totals, discounts, categorization |
| `libs/quotation-pdf-generator.tsx` | Generate professional PDF quotations |
| `libs/excel-generator.ts` | Excel export functionality |

## Development Conventions

### TypeScript

- **Strict mode enabled** - all types must be explicit
- Use `export interface` for public types
- Use `export enum` for related constants
- Optional fields marked with `?`
- Union types with `|`

### Imports

Use `@/*` path alias for internal imports. Order by grouping:
1. React/hooks and Next.js imports
2. Third-party libraries
3. Local components
4. Utilities/libs
5. Types

Use `import type` for type-only imports.

### Naming Conventions

- **Components:** PascalCase (`ProductForm`, `Button`)
- **Functions:** camelCase (`calculateItemTotal`, `extractMenuFromImage`)
- **Constants/Enums:** UPPER_SNAKE_CASE (`ProductCategory`, `QuotationStatus`)
- **Files:** PascalCase for components, kebab-case for libs
- **Props interfaces:** `<ComponentName>Props`

### Component Patterns

- Mark client components with `"use client"` at the top
- Use `React.forwardRef` for components needing ref forwarding
- Define props interfaces before the component

### Styling

- Use Tailwind CSS utility classes
- Glass/blur effects: `bg-white/10 backdrop-blur-md`
- Primary color: `#008080` (teal) - iPOS brand color
- Gradients: `bg-gradient-to-r from-teal-600 to-cyan-500`
- Responsive: `md:`, `lg:` prefixes
- Animation: `motion.div` from Framer Motion
- Vietnamese language in UI strings is standard

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

### State Management

- Use React hooks (`useState`, `useEffect`) for local state
- Use localStorage for persistence between reloads
- Lift state up when shared between components
- Consider context for deeply nested state

## Testing

- Playwright is installed for E2E testing
- No test suite configured yet
- Tests can be added in `tests/` or `e2e/` directories
- Create `playwright.config.ts` to configure test runners

## Important Notes

- **Vietnamese UI text** is standard throughout the application
- **Never commit `.env` file** - use environment variables for secrets
- **Markdown support** for rich text descriptions in products
- **Zod validation** for form inputs and API endpoints
- **Service role client** should ONLY be used in API routes/server components, never on client
- **Row Level Security (RLS)** is enabled on all database tables
- **Next.js 16** requires `output: 'standalone'` for Docker deployments
