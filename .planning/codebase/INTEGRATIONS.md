# Integrations

**Analysis Date:** 2026-03-19

## External APIs

### Google Gemini AI

**Purpose:** Menu content extraction from images

**Implementation:**
- Library: `@google/generative-ai`
- Location: `libs/gemini-client.ts`
- API Routes: `/api/extract`

**Usage:**
- Image-to-text conversion for menu parsing
- Structured data extraction (categories, items, prices)
- Prompt engineering for specific output format

**Configuration:**
- API Key: `GEMINI_API_KEY` (environment variable)
- Model: Gemini Pro/Vision (configured in client)

**Error Handling:**
- Retry logic (limited)
- Fallback to default structure on failure

## Databases

### Supabase

**Purpose:** Primary database for products and quotations

**Implementation:**
- Library: `@supabase/supabase-js`
- Location: `libs/supabase-client.ts`
- Client Types: Public + Service Role

**Tables:**
- `products` - Product catalog
- `subproducts` - Product variants
- `quotations` - Business quotations
- `quotation_items` - Line items in quotations

**API Routes:**
- `/api/products` - Product CRUD
- `/api/quotations` - Quotation management
- `/api/quotations/[id]/export` - Quotation export

**Configuration:**
- URL: `NEXT_PUBLIC_SUPABASE_URL` (public)
- Anon Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public)
- Service Role Key: `SUPABASE_SERVICE_ROLE_KEY` (server-only)

**Authentication:**
- Supabase Auth (minimal implementation)
- Row Level Security (RLS) configured

## Webhooks

**None identified** - The codebase does not currently implement webhook endpoints.

## Third-Party Services

### MCP (Model Context Protocol)

**Purpose:** Enhanced capabilities integration

**Implementation:**
- Package: `@playwright/mcp`
- Configuration: `.mcp.json`

**Usage:**
- Playwright browser automation via MCP
- Context-aware tool access

## File Storage

### Image Storage

**Purpose:** Menu image uploads

**Implementation:**
- Location: `libs/image-storage.ts`
- Storage: Supabase Storage (inferred)

**Constraints:**
- File types: `image/*`
- Max size: 5MB per file (20MB total)
- Formats: JPG, PNG, etc.

### Excel Export

**Purpose:** Quotation export functionality

**Implementation:**
- Library: `xlsx`
- Location: `libs/quotation-generator.ts`
- Template-based generation

**Features:**
- Pre-formatted Excel templates
- Dynamic data insertion
- Multi-sheet support

## Authentication Providers

### Supabase Auth

**Status:** Minimal implementation

**Features:**
- User authentication (basic setup)
- Session management

**Current State:**
- Not fully utilized in current codebase
- Infrastructure in place for future expansion

---

*Integrations analysis: 2026-03-19*
