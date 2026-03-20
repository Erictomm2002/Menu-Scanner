# Roadmap: iPos Kit - Quotation PDF Export

## Overview

This roadmap delivers PDF export functionality for the Quotation Tool, enabling users to export quotations as print-ready A4 PDF documents. The work builds on the existing Excel export infrastructure, adding server-side PDF generation with Vietnamese language support, proper A4 layout with auto-fitted columns, and multi-page pagination. The project follows a dependency-driven approach: core PDF generation first, then API integration, followed by UI enhancements, and finally performance validation.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: PDF Generation Core** - Server-side PDF generator with A4 layout, Vietnamese fonts, and multi-page pagination
- [ ] **Phase 2: API Integration** - Export API route integration with format routing and security
- [ ] **Phase 3: UI Integration & Styling** - Frontend format selection, loading states, and error handling
- [ ] **Phase 4: Performance & Validation** - Performance optimization and cross-browser testing

## Phase Details

### Phase 1: PDF Generation Core
**Goal**: Server-side PDF generator produces print-ready A4 documents with Vietnamese character support and proper multi-page layout
**Depends on**: Nothing (first phase)
**Requirements**: PDF-01, PDF-02, PDF-03, PDF-04, PDF-05, PDF-06, LANG-01
**Success Criteria** (what must be TRUE):
  1. PDF generator creates documents with proper A4 dimensions (210mm x 297mm) including margins
  2. Vietnamese characters with diacritics (a, a, a, e, e, u, u, u, etc.) display correctly in all text fields
  3. Header section displays company name, logo, and date in the correct position on each page
  4. Footer section displays creator and signature areas without overlapping content
  5. Product table displays all columns except the image column, with auto-fitted widths that span A4 page width
  6. Content that exceeds a single A4 page continues correctly on subsequent pages with proper headers
**Plans**: 3 plans

Plans:
- [ ] 01-01: Install and configure @react-pdf/renderer with Vietnamese font support
- [ ] 01-02: Implement PDF document structure with A4 page layout and styling
- [ ] 01-03: Implement multi-page pagination logic and column auto-fitting

### Phase 2: API Integration
**Goal**: Export API route handles both Excel and PDF formats via format parameter with proper authentication
**Depends on**: Phase 1
**Requirements**: PERF-01, PERF-02, PERF-03
**Success Criteria** (what must be TRUE):
  1. API route at `/api/quotations/[id]/export?format=pdf` returns a downloadable PDF file
  2. PDF generation completes within 5 seconds for quotations with up to 50 items
  3. API returns appropriate error messages when quotation ID is invalid or user is unauthorized
  4. API prevents memory leaks or crashes during PDF generation of large quotations
**Plans**: 2 plans

Plans:
- [ ] 02-01: Modify export API route to handle format parameter and integrate PDF generator
- [ ] 02-02: Add error handling, authentication, and timeout protection to export API

### Phase 3: UI Integration & Styling
**Goal**: Users can select PDF export format from the quotation interface with proper loading and error feedback
**Depends on**: Phase 2
**Requirements**: UI-01, UI-02, UI-03
**Success Criteria** (what must be TRUE):
  1. User can select PDF format from export format dropdown or button in QuotationFooter
  2. Loading indicator displays while PDF is being generated
  3. Error message displays in Vietnamese when PDF export fails
  4. PDF download filename includes quote number (e.g., `BaoGia_[number].pdf`)
**Plans**: 2 plans

Plans:
- [ ] 03-01: Add format selection UI and state management to QuotationFooter component
- [ ] 03-02: Update export handler with loading states and error messages

### Phase 4: Performance & Validation
**Goal**: PDF export performs reliably across browsers and realistic data sizes
**Depends on**: Phase 3
**Requirements**: None (validation and optimization)
**Success Criteria** (what must be TRUE):
  1. PDF generation handles quotations spanning multiple A4 pages correctly in Chrome, Firefox, Safari
  2. Performance tested with realistic data sizes including maximum expected (50+ items)
  3. No memory leaks detected during repeated PDF exports
**Plans**: 2 plans

Plans:
- [ ] 04-01: Test PDF export across multiple browsers with realistic quotation data
- [ ] 04-02: Performance profiling and optimization for large quotations

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. PDF Generation Core | 0/3 | Not started | - |
| 2. API Integration | 0/2 | Not started | - |
| 3. UI Integration & Styling | 0/2 | Not started | - |
| 4. Performance & Validation | 0/2 | Not started | - |
