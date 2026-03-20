# Phase 1: PDF Generation Core - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Server-side PDF generator produces print-ready A4 documents with Vietnamese character support and proper multi-page layout. This phase creates the core PDF generation functionality that will be integrated into API routes in Phase 2.

</domain>

<decisions>
## Implementation Decisions

### PDF Library
- **@react-pdf/renderer** selected as the PDF generation library
- Rationale: React component-based architecture aligns with existing codebase, supports server-side rendering via `renderToBuffer()`, and has good Vietnamese Unicode support with proper font configuration
- Alternative considered: jsPDF (rejected due to poor Vietnamese support out-of-box), puppeteer (rejected due to complexity)

### Server-Side Generation
- PDF generation happens on server (API route), not client-side
- Rationale: Consistent rendering, avoids browser differences, better performance for large documents, no CORS issues with images
- Method: `renderToBuffer()` returns PDF buffer that gets streamed to client

### Document Structure
- A4 page size (210mm x 297mm) with standard margins (15mm on each side)
- Rationale: Standard print format, matches user expectation for PDF export
- Header section at top of each page: company name, logo, date
- Footer section at bottom of each page: creator, signature lines
- Main content: quotation items table with grouped categories (software/hardware)

### Multi-Page Pagination
- Auto-detection when content exceeds single page
- Rationale: User may have many items; must span multiple pages properly
- Headers repeat on each page
- Page numbers in footer
- Table rows don't break mid-row (use `pageBreakMode: 'avoid'` or equivalent)

### Column Width Strategy
- **Auto-fit columns to A4 width**: Percentage-based widths that distribute available space
- Rationale: Hard-coded widths break on different content; percentages ensure columns always span full width
- Calculation: Available width = 210mm - (15mm left margin + 15mm right margin) = 180mm
- Image column: Completely omitted (not just hidden - removed from data structure for PDF)

### Vietnamese Font Support
- **Font**: Roboto or similar Unicode-compliant font embedded as base64
- Rationale: Vietnamese diacritics (á, à, ả, ẹ, ể, ự, ư, ừ, ự) require proper Unicode font support
- Implementation: Font registered in `@react-pdf/renderer` `Font.register()` before document rendering
- Fallback: Default fonts if custom font fails to load

### Header/Footer Preservation
- **Keep existing structure**: Don't redesign header/footer from Excel
- Rationale: User explicitly stated to keep Excel header/footer intact
- Implementation: Extract header/footer data from quotation object (company_name, logo_url, date, creator_info, etc.)
- Positioning: Fixed reserved space (top 45mm for header, bottom 30mm for footer)

### Styling Approach
- **Simple, professional, print-ready**: Black text on white background
- Rationale: User wants "đơn giản, chuẩn mực" - no fancy formatting
- No borders/decorations beyond what's necessary
- Standard fonts for readability

### Claude's Discretion
- Exact margin values (15mm on sides is default, adjust if printing shows clipping)
- Font size for body text (10-12pt) - choose what looks professional
- Line heights and spacing - ensure readability without wasting space
- Table row heights - adjust based on content (multi-line descriptions vs single line)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### PDF Generation
- `.planning/research/ARCHITECTURE.md` — Architecture patterns for PDF export, recommended React-PDF implementation patterns
- `.planning/research/PITFALLS.md` — Critical pitfalls: Vietnamese encoding, pagination, column width, memory issues, CORS

### Existing Codebase
- `libs/quotation-generator.ts` — Current Excel export implementation for reference on data structure
- `types/quotation.ts` — Quotation data types for understanding data models
- `app/api/quotations/[id]/export/route.ts` — Existing export API route pattern

### Codebase Conventions
- `.planning/codebase/CONVENTIONS.md` — Naming patterns, error handling, logging conventions

No external specs — requirements fully captured in decisions above

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Excel generator pattern**: `libs/quotation-generator.ts` shows how to fetch and structure quotation data from Supabase
- **Supabase client**: `libs/supabase-client.ts` provides database access with dual client setup
- **Quotation types**: `types/quotation.ts` defines data structures (Quotation, QuotationItem, etc.)
- **Error handling pattern**: Try-catch blocks with Vietnamese error messages from existing code

### Established Patterns
- **API route structure**: File-based routing (`app/api/quotations/[id]/export/route.ts`) with NextRequest/NextResponse
- **Data fetching**: Supabase queries using `.select('*').eq()` pattern
- **Response handling**: NextResponse with proper headers (Content-Type, Content-Disposition)
- **Validation**: Zod schemas in other parts of codebase - can follow same pattern

### Integration Points
- **API route**: Modify `app/api/quotations/[id]/export/route.ts` to add PDF format support
- **New library location**: `libs/quotation-pdf-generator.tsx` (new file for PDF generation)
- **Type definitions**: Extend `types/quotation.ts` if needed for PDF-specific properties

### Creative Options
- Existing codebase uses `xlsx` package for Excel — can use `@react-pdf/renderer` alongside it
- TypeScript strict mode enabled — need proper typing for PDF components
- Tailwind CSS available for any additional styling if needed for PDF-related UI elements

</code_context>

<specifics>
## Specific Ideas

- "Xuất file PDF với định dạng PDF, format đơn giản, chuẩn mực in" — Simple, professional, print-ready format
- "Giữ nguyên header và footer từ file Excel" — Preserve existing Excel header/footer structure exactly
- "Bỏ ảnh khi xuất PDF file thôi, không bỏ ảnh khi xuất excel file" — Hide image column only for PDF export, keep Excel export unchanged
- "Bạn để auto fit cho tôi nhé" — Auto-fit column widths to A4 paper width

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-pdf-generation-core*
*Context gathered: 2026-03-20*
