# iPos Kit - Quotation PDF Export Feature

## What This Is

iPos Kit is a business automation solution with two main modules: Menu Extractor (AI OCR for restaurant menus) and Quotation Tool (product quotation management). This project is adding PDF export functionality to the Quotation Tool, which currently only supports Excel export. Users can create product quotations from the database and now will be able to export them as PDF files.

## Core Value

Users must be able to export quotations to PDF format for printing and sharing, preserving the professional document structure from Excel while optimizing for A4 paper.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

- [ ] User can export quotation as PDF file
- [ ] PDF export preserves header information (company name, logo, date) from Excel
- [ ] PDF export preserves footer information (creator, signature) from Excel
- [ ] PDF format is simple, professional, print-ready (standard black & white)
- [ ] Image column is hidden in PDF export (product photos not shown)
- [ ] Column widths are auto-fitted to A4 paper width in PDF

### Out of Scope

- Modifying existing Excel export functionality
- Adding company logo/header configuration settings
- Changing Excel export format or structure
- PDF styling options/themes beyond standard format
- Watermark or custom branding in PDF

## Context

**Existing System:**
- Next.js 16 application with App Router
- Quotation module uses Supabase for database storage
- Current export: Excel format via `quotation-generator.ts` and `/api/quotations/[id]/export`
- Existing Excel export includes full header/footer structure

**Current Flow:**
1. User creates quotation from product selection
2. System calculates totals and discounts
3. Quotation saved to Supabase database
4. User can export as Excel

**Codebase Notes:**
- Excel generation uses `xlsx` package
- API route: `app/api/quotations/[id]/export/route.ts`
- Quotation types defined in `types/quotation.ts`
- Frontend components: `QuotationPreview.tsx`, `QuotationSidebar.tsx`

## Constraints

- **Technology**: Must use existing tech stack (Next.js, TypeScript, Supabase)
- **Dependencies**: Can add PDF generation library (e.g., jsPDF, react-pdf, puppeteer)
- **Performance**: PDF generation should complete within reasonable time for typical quotations
- **Format**: PDF must match A4 paper dimensions (210mm × 297mm)
- **Language**: Vietnamese language support in PDF output

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Preserve existing Excel export | Users may still need Excel format | — Pending |
| Hide images only in PDF | Keep Excel export functional with images | — Pending |
| Auto-fit columns to A4 | Manual column width would be tedious for users | — Pending |

---
*Last updated: 2026-03-20 after initialization*
