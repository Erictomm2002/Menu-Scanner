# Architecture

**Analysis Date:** 2026-03-19

## Pattern Overview

**Overall:** Next.js Full-Stack Application with Client-Side State Management

**Key Characteristics:**
- Server-Side Rendering (SSR) with Next.js 16
- Client-side SPA-like workflow within page components
- Multi-feature application: Menu Extraction + Quotation Management
- External AI integration via Google Gemini API
- Database integration with Supabase
- File-based API routes for backend logic
- LocalStorage for persistent state between sessions

## Layers

**Presentation Layer:**
- Purpose: User interface components and page layouts
- Location: `app/` (Next.js App Router), `components/`
- Contains: React components, page layouts, UI elements
- Depends on: API layer, shared utilities
- Used by: End users through browser

**API Layer:**
- Purpose: Backend logic and data access
- Location: `app/api/`
- Contains: Next.js API routes for external service integration
- Depends on: Database client, AI services, utility functions
- Used by: Presentation layer components

**Data Access Layer:**
- Purpose: Database operations and external service integration
- Location: `libs/supabase-client.ts`, `libs/gemini-client.ts`
- Contains: Database connection, AI service wrappers, data processing
- Depends on: External services (Supabase, Gemini)
- Used by: API layer

**Business Logic Layer:**
- Purpose: Core application logic and data processing
- Location: `libs/`, `types/`
- Contains: Data transformation, calculation utilities, generators
- Depends on: Type definitions, external services
- Used by: API layer, presentation layer

**State Management:**
- Purpose: Client-side state persistence
- Implementation: React useState + LocalStorage
- Persistence: Key-value pairs in browser storage
- Scope: Application state, menu data, user preferences

## Data Flow

**Menu Extraction Flow:**

1. Image Upload: User selects menu images in `MenuUploadScreen`
2. API Call: Images sent to `/api/extract` endpoint
3. AI Processing: Gemini AI extracts menu structure and items
4. Data Processing: Response validated and merged from multiple images
5. Local Storage: Menu data saved for persistence
6. Edit Interface: User modifies extracted data in `MenuEditScreen`
7. Export: Processed menu exported via `/api/export` or `/api/category-export`

**Quotation Flow:**

1. Product Selection: User selects products from database
2. Quote Generation: System calculates totals and discounts
3. Database Storage: Quotation saved to Supabase
4. Export Options: Excel export functionality via `/api/quotations/[id]/export`

**State Management Flow:**

1. Initial Load: State restored from LocalStorage
2. User Actions: Updates trigger state changes
3. Persistence: State saved to LocalStorage on changes
4. Navigation: State preserved between page transitions

## Key Abstractions

**MenuData:**
- Purpose: Core data structure for menu extraction
- Examples: `types/menu.ts`
- Pattern: Nested structure with categories and items

**Quotation:**
- Purpose: Business entity for product quotations
- Examples: `types/quotation.ts`
- Pattern: Related data structure with items, totals, and metadata

**Supabase Client:**
- Purpose: Database access abstraction
- Examples: `libs/supabase-client.ts`
- Pattern: Dual client setup (public + service role)

**Gemini Client:**
- Purpose: AI service integration
- Examples: `libs/gemini-client.ts`
- Pattern: Prompt engineering + response processing

## Entry Points

**Main Application:**
- Location: `app/page.tsx`
- Triggers: Application initialization, navigation
- Responsibilities: State management, routing, component rendering

**API Routes:**
- `/api/extract` - Image processing and AI extraction
- `/api/export` - Menu data export
- `/api/category-export` - Category-specific export
- `/api/products` - Product CRUD operations
- `/api/quotations` - Quotation management

**Components:**
- `MenuUploadScreen` - Image upload interface
- `MenuEditScreen` - Menu editing interface
- `MenuExportScreen` - Export options interface
- `QuotationPreview` - Quote display
- `QuotationSidebar` - Quote management sidebar

## Error Handling

**Strategy:** Client-side validation with server-side fallbacks

**Patterns:**
- Try-catch blocks in API calls
- Validation with Zod schemas
- User-friendly error messages in Vietnamese
- File type and size validation on upload
- Graceful degradation for AI service failures

## Cross-Cutting Concerns

**Logging:** Console logging for debugging and monitoring
**Validation:** Zod schemas for data validation
**Authentication:** Basic setup with Supabase auth (minimal implementation)
**Internationalization:** Vietnamese language support throughout
**Styling:** Multiple design variants (retro, neubrutal, modern)

---

*Architecture analysis: 2026-03-19*
