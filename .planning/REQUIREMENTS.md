# Requirements: iPos Kit - Quotation PDF Export

**Defined:** 2026-03-20
**Core Value:** Users must be able to export quotations to PDF format for printing and sharing, preserving the professional document structure from Excel while optimizing for A4 paper.

## v1 Requirements

### PDF Export
- [ ] **PDF-01**: User can export quotation as PDF file
- [ ] **PDF-02**: PDF export preserves header information (company name, logo, date) from Excel
- [ ] **PDF-03**: PDF export preserves footer information (creator, signature) from Excel
- [ ] **PDF-04**: PDF format is simple, professional, print-ready (standard black & white)
- [ ] **PDF-05**: Image column is hidden in PDF export (product photos not shown)
- [ ] **PDF-06**: Column widths are auto-fitted to A4 paper width in PDF

### Vietnamese Language Support
- [ ] **LANG-01**: Vietnamese characters with diacritics (á, à, ả, ẹ, ể, ự, ư, ừ, ự, etc.) display correctly in PDF

### UI Integration
- [ ] **UI-01**: User can select PDF format for export (from format dropdown or buttons)
- [ ] **UI-02**: Loading indicator shown during PDF generation
- [ ] **UI-03**: Error message displayed when PDF export fails

### Performance & Reliability
- [ ] **PERF-01**: PDF generation completes within 5 seconds for typical quotations (up to 50 items)
- [ ] **PERF-02**: PDF generation handles quotations spanning multiple A4 pages correctly
- [ ] **PERF-03**: No memory leaks or crashes during PDF generation

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

None identified at this time.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Modifying existing Excel export | User only needs PDF export, Excel format should remain unchanged |
| Custom PDF templates/themes | Requirement is simple, standard format - not customization needed |
| Company logo/header configuration | Information already exists in Excel file, just preserve it |
| Watermark or branding in PDF | Simple, standard format without custom branding |
| Real-time PDF preview | Download-only workflow, no preview requirement specified |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PDF-01 | Phase 1 | Pending |
| PDF-02 | Phase 1 | Pending |
| PDF-03 | Phase 1 | Pending |
| PDF-04 | Phase 1 | Pending |
| PDF-05 | Phase 1 | Pending |
| PDF-06 | Phase 1 | Pending |
| LANG-01 | Phase 1 | Pending |
| UI-01 | Phase 2 | Pending |
| UI-02 | Phase 2 | Pending |
| UI-03 | Phase 2 | Pending |
| PERF-01 | Phase 3 | Pending |
| PERF-02 | Phase 3 | Pending |
| PERF-03 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 12 total
- Mapped to phases: 0 (pending roadmap)
- Unmapped: 12 ⚠️

---
*Requirements defined: 2026-03-20*
*Last updated: 2026-03-20 after initial definition*
