# Project Research Summary

**Project:** iPos Kit - Quotation PDF Export Feature
**Domain:** PDF Export for Next.js Quotation System
**Researched:** 2026-03-20
**Confidence:** MEDIUM

## Executive Summary

This project adds PDF export functionality to an existing quotation management system that currently only supports Excel export. The system is a Next.js 16 application with Supabase database, using a server-side rendering pattern for export generation. The recommended approach leverages `@react-pdf/renderer` for React component-based PDF generation, which aligns with the existing codebase architecture and can produce print-ready A4 documents with proper Vietnamese language support.

Key risks include Vietnamese character encoding issues (requiring custom Unicode fonts), multi-page pagination logic for larger quotations, and A4 column width calculation to prevent horizontal overflow. The existing Excel export implementation in `libs/quotation-generator.ts` provides a solid foundation for data fetching, categorization, and summary calculations that can be reused for PDF generation.

## Key Findings

### Recommended Stack

**Note:** STACK.md was not generated during research. Core technologies inferred from PROJECT.md and ARCHITECTURE.md:

- **@react-pdf/renderer**: Server-side PDF generation with React components — aligns with existing codebase, supports A4 layout
- **Next.js 16 API Routes**: Export endpoint with format parameter — matches existing Excel export pattern
- **Supabase**: Data fetching for quotations and items — existing infrastructure
- **TypeScript**: Type definitions for quotation data — existing infrastructure

### Expected Features

**Note:** FEATURES.md was not generated during research. Requirements from PROJECT.md:

**Must have (table stakes):**
- PDF export preserves header information (company name, logo, date) from Excel
- PDF export preserves footer information (creator, signature) from Excel
- PDF format is simple, professional, print-ready (standard black & white)
- Image column is hidden in PDF export (product photos not shown)
- Column widths are auto-fitted to A4 paper width in PDF

### Architecture Approach

The recommended architecture extends the existing Excel export pattern with PDF support. A single API route (`/api/quotations/[id]/export`) handles both formats via a `format` query parameter, sharing data fetching logic while delegating to format-specific generators. The PDF generator (`libs/quotation-pdf-generator.tsx`) uses React components to define document structure with A4 page sizing, proper header/content/footer sections, and Vietnamese font support.

**Major components:**
1. **QuotationPreview** — Export UI button, format selection, communicates with API
2. **PDF Export API** — Data fetching from Supabase, format routing, PDF generation response
3. **PDF Generator** — Document structure, A4 layout, styling, Vietnamese text rendering
4. **Quotation Types** — TypeScript definitions shared across all components

### Critical Pitfalls

Based on PITFALLS.md research, top 5 pitfalls:

1. **Vietnamese Character Encoding Issues** — Must add custom Unicode fonts (Roboto, Open Sans with Vietnamese subset) before rendering; default fonts only support ASCII/Latin-1 characters
2. **A4 Page Overflow Without Proper Pagination** — Must implement automatic page break detection and multi-page rendering; content cut off is common with realistic data sizes
3. **Table Column Width Miscalculation on A4** — Use percentage-based widths that account for margins (~180mm available on A4 with 15mm margins); fixed pixel values break layout
4. **Memory Exhaustion with Large PDFs** — Optimize images before embedding, use server-side generation for large documents (>50 items), implement streaming if available
5. **CORS Issues with Image URLs** — Configure Supabase Storage CORS headers or pre-fetch images server-side; client-side image loading in PDF fails without proper CORS configuration

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Library Selection & Setup
**Rationale:** Vietnamese font support is critical and must be validated before any implementation. Testing PDF library with Vietnamese character set and image loading prevents later rewrites.
**Delivers:** PDF library installed with Vietnamese font support verified
**Addresses:** Vietnamese character encoding, CORS image loading
**Avoids:** Pitfall #1 (Vietnamese encoding), Pitfall #5 (CORS issues)

### Phase 2: PDF Generation Core
**Rationale:** Core PDF generation with proper A4 layout, pagination, and column width calculation is the foundation. Server-side API integration follows existing patterns.
**Delivers:** Working PDF generator with A4 layout, multi-page support, column auto-fit
**Uses:** @react-pdf/renderer, Next.js API routes
**Implements:** Document structure, pagination logic, column width calculation
**Avoids:** Pitfall #2 (page overflow), Pitfall #3 (column width), Pitfall #6 (hydration mismatch), Pitfall #7 (header/footer positioning), Pitfall #8 (image hiding layout), Pitfall #10 (API security)

### Phase 3: Frontend Integration & Styling
**Rationale:** UI components for format selection and export handling follow after core PDF generation works. Polish matches Excel export styling.
**Delivers:** Updated QuotationFooter with format selection, loading states, Vietnamese font styling
**Implements:** Format state management, export handler updates, PDF styling refinement
**Avoids:** Pitfall #9 (browser preview inconsistencies)

### Phase 4: Performance & Testing
**Rationale:** Performance optimization and cross-browser testing must be done with realistic data sizes. Memory and caching strategies added last.
**Delivers:** Performance optimized PDF generation, cross-browser tested, cached PDF re-exports
**Addresses:** Pitfall #4 (memory exhaustion), Pitfall #9 (browser compatibility)
**Avoids:** Memory issues with large quotations, inconsistent rendering across browsers

### Phase Ordering Rationale

- **Phase 1 first**: Vietnamese font support is critical and blocks all other work. Without proper fonts, PDFs are unusable.
- **Phase 2 second**: Core PDF generation with pagination and column width calculation must work before adding UI. This prevents re-architecting later.
- **Phase 3 third**: Frontend integration and styling can be done in parallel with Phase 2 but follows naturally after core functionality.
- **Phase 4 last**: Performance optimization and testing rely on having a complete implementation to test against.

This order follows dependency patterns from ARCHITECTURE.md (generator core before API integration before UI) and addresses PITFALLS.md critical issues early (Vietnamese fonts, pagination, column widths).

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1**: Vietnamese font embedding with @react-pdf/renderer — sparse documentation on base64 font integration
- **Phase 2**: Pagination logic for react-pdf when content overflows multiple A4 pages — complex multi-page rendering patterns
- **Phase 4**: Cross-browser PDF preview rendering consistency — browser-specific rendering differences

Phases with standard patterns (skip research-phase):
- **Phase 3**: Frontend state management — existing useState + LocalStorage pattern validated in codebase
- **Phase 4**: API route security — standard Next.js authentication patterns apply

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | STACK.md not generated; inferred from existing codebase |
| Features | MEDIUM | FEATURES.md not generated; requirements from PROJECT.md only |
| Architecture | HIGH | Based on existing Excel export implementation patterns |
| Pitfalls | MEDIUM | Web search unavailable; based on documented common issues |

**Overall confidence:** MEDIUM

### Gaps to Address

- **STACK.md missing**: Library selection (@react-pdf/renderer vs jsPDF vs puppeteer) not documented with rationale
- **FEATURES missing**: Feature research not performed (table stakes, differentiators, anti-features)
- **Vietnamese font validation**: Need to verify @react-pdf/renderer supports Vietnamese characters with custom fonts
- **Performance testing**: Need to test PDF generation with large quotations (50+ items)
- **A4 layout validation**: Need to test actual printed output to ensure margins and sizing are correct
- **Image column hiding**: Confirm that excluding images from PDF works without breaking layout

## Sources

### Primary (HIGH confidence)
- **@react-pdf/renderer documentation**: https://react-pdf.org/ — PDF generation patterns
- **Next.js API Routes**: Official documentation — existing export route patterns
- **Existing codebase**: `libs/quotation-generator.ts` — Excel export implementation validated
- **Existing codebase**: `app/api/quotations/[id]/export/route.ts` — API route structure

### Secondary (MEDIUM confidence)
- **ARCHITECTURE.md**: Research document with React-PDF patterns and component boundaries
- **PITFALLS.md**: Research document with 10 critical pitfalls and recovery strategies
- **PROJECT.md**: Project requirements and context document

### Tertiary (LOW confidence)
- **Common patterns**: Documented issues from PDF library communities (web search unavailable)
- **Domain knowledge**: Vietnamese language support requirements

---
*Research completed: 2026-03-20*
*Ready for roadmap: yes*
