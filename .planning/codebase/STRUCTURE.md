# Structure

**Analysis Date:** 2026-03-19

## Directory Layout

```
menu-extractor/
├── .planning/              # Planning and codebase analysis
├── .next/                 # Next.js build output (gitignored)
├── .worktrees/            # Git worktrees (gitignored)
├── app/                   # Next.js App Router
│   ├── api/              # API routes
│   │   ├── extract/      # Menu extraction endpoint
│   │   ├── export/       # Full menu export
│   │   ├── category-export/  # Category export
│   │   ├── products/     # Product CRUD
│   │   └── quotations/   # Quotation management
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   ├── globals.css       # Global styles
│   ├── products/         # Products page
│   └── quotation/        # Quotation pages
│       ├── page.tsx
│       └── history/
│           └── page.tsx
├── components/
│   ├── page-component/    # Page-level components
│   │   ├── MenuUploadScreen.tsx
│   │   ├── MenuEditScreen.tsx
│   │   └── MenuExportScreen.tsx
│   ├── quotation/        # Quotation components
│   │   ├── QuotationPreview.tsx
│   │   └── QuotationSidebar.tsx
│   ├── product/          # Product components
│   │   └── ProductList.tsx
│   └── ui/               # Reusable UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Input.tsx
├── libs/                  # Utility libraries
│   ├── gemini-client.ts   # AI integration
│   ├── supabase-client.ts # Database client
│   ├── image-storage.ts   # File handling
│   └── quotation-generator.ts # Excel generation
├── types/                 # TypeScript type definitions
│   ├── menu.ts
│   └── quotation.ts
├── .env                  # Environment variables (gitignored)
├── .gitignore            # Git ignore rules
├── .mcp.json             # MCP server configuration
├── eslint.config.mjs      # ESLint configuration
├── next.config.js         # Next.js configuration
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript configuration
└── README.md             # Project documentation
```

## Key Locations

**Entry Points:**
- `app/page.tsx` - Main application entry point
- `app/layout.tsx` - Root layout wrapper

**API Routes:**
- `app/api/` - All backend endpoints
- `app/api/extract/route.ts` - Image processing
- `app/api/products/route.ts` - Product operations

**Business Logic:**
- `libs/` - Utility functions and integrations
- `types/` - Shared type definitions

**UI Components:**
- `components/page-component/` - Major page components
- `components/ui/` - Reusable UI primitives
- `components/quotation/` - Quote-specific components

## Naming Conventions

**Files:**
- Components: PascalCase (e.g., `MenuUploadScreen.tsx`)
- API Routes: kebab-case directory, `route.ts` file
- Utilities: kebab-case (e.g., `gemini-client.ts`)
- Types: kebab-case (e.g., `menu.ts`)

**Directories:**
- kebab-case for all directories
- `api/` for server routes
- `components/` for React components
- `libs/` for utilities
- `types/` for TypeScript definitions

## Module Boundaries

**Client vs Server:**
- `app/api/` - Server-side only
- `components/` - Client-side (can use server components in Next.js 16)

**Feature Areas:**
- Menu Extraction: `MenuUploadScreen`, `MenuEditScreen`, `MenuExportScreen`, `/api/extract`
- Quotation: `quotation/` pages, `components/quotation/`, `/api/quotations`
- Products: `products/` page, `components/product/`, `/api/products`

## Configuration Files

- `tsconfig.json` - TypeScript compiler options
- `eslint.config.mjs` - Code linting rules
- `next.config.js` - Framework configuration
- `.mcp.json` - MCP server settings
- `.env` - Environment variables (not committed)

## Test Structure

- No dedicated test directory found
- Playwright configured but no tests present
- Tests would typically go in `__tests__/` or `tests/`

---

*Structure analysis: 2026-03-19*
