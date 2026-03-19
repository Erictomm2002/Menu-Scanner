# Stack

**Analysis Date:** 2026-03-19

## Languages

**Primary Language:**
- TypeScript (strict mode enabled)
- React/Next.js components (TSX)

**Configuration:**
- Target: ES2017+
- Module: ESNext
- Lib: DOM, DOM.Iterable, ESNext

## Runtime

**Framework:** Next.js 16 (App Router)
- Server-Side Rendering (SSR)
- File-based routing
- API routes

**Platform:** Node.js
- Version: Compatible with Next.js 16 requirements

## Frameworks

**Frontend:**
- React 18 (via Next.js)
- Next.js 16 App Router

**State Management:**
- React hooks (useState, useEffect)
- LocalStorage for persistence

**Styling:**
- Tailwind CSS
- Multiple UI variants (retro, neubrutal, modern)

## Dependencies

**Core Runtime:**
- `next` - Framework
- `react` - UI library
- `react-dom` - DOM binding

**Type Safety:**
- `typescript` - Type checking
- `@types/*` packages

**Database:**
- `@supabase/supabase-js` - Database client

**AI Services:**
- `@google/generative-ai` - Gemini AI integration

**File Processing:**
- `xlsx` - Excel file generation
- `sharp` - Image processing (if present)

**Utilities:**
- `zod` - Schema validation

## Development Dependencies

**Linting:**
- `eslint` - Code quality
- `eslint-config-next` - Next.js rules
- `eslint-config-next/typescript` - TypeScript rules

**Testing:**
- `@playwright/test` - E2E testing framework
- `@playwright/mcp` - Playwright MCP integration

**Development Tools:**
- `typescript` - Type checking
- Tailwind CSS packages

## Configuration

**TypeScript:**
- `tsconfig.json` - Compiler options
- Strict mode: enabled
- Path aliases: `@/*` mapped to root

**ESLint:**
- `eslint.config.mjs` - Linting configuration
- Extends: Next.js recommended rules
- Ignores: `.next/**`, `out/**`, `build/**`

**Next.js:**
- `next.config.js` (if present)
- App Router configuration

**Environment:**
- `.env` - Environment variables
- Supabase credentials
- API keys for external services

## Package Manager

- `npm` (inferred from package.json)

## Build System

- Next.js built-in build system
- TypeScript compilation via `tsc`

---

*Stack analysis: 2026-03-19*
