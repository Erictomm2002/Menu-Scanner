# Phase 1: PDF Generation Core - Validation

**Created:** 2026-03-20
**Status:** Ready for execution
**Phase:** 01-pdf-generation-core

<test_framework>
## Test Framework

| Property | Value |
|----------|-------|
| Framework | Playwright (E2E) - existing in devDependencies |
| Config file | .planning/phases/01-pdf-generation-core/playwright.config.ts (to be created) |
| Quick run command | `npx playwright test --headed` |
| Full suite command | `npx playwright test` |

</test_framework>

<test_map>
## Phase Requirements -> Test Map

| Req ID | Description | Test Type | Automated Command | Test File |
|---------|-------------|-----------|------------------|------------|
| PDF-01 | User can export quotation as PDF file | E2E | `npx playwright test tests/pdf/export-pdf.spec.ts` | tests/pdf/export-pdf.spec.ts |
| PDF-02 | PDF export preserves header information (company name, logo, date) from Excel | E2E | `npx playwright test tests/pdf/pdf-header.spec.ts` | tests/pdf/pdf-header.spec.ts |
| PDF-03 | PDF export preserves footer information (creator, signature) from Excel | E2E | `npx playwright test tests/pdf/pdf-footer.spec.ts` | tests/pdf/pdf-footer.spec.ts |
| PDF-04 | PDF format is simple, professional, print-ready (standard black & white) | E2E | `npx playwright test tests/pdf/pdf-styling.spec.ts` | tests/pdf/pdf-styling.spec.ts |
| PDF-05 | Image column is hidden in PDF export (product photos not shown) | E2E | `npx playwright test tests/pdf/pdf-no-image.spec.ts` | tests/pdf/pdf-no-image.spec.ts |
| PDF-06 | Column widths are auto-fitted to A4 paper width in PDF | E2E | `npx playwright test tests/pdf/pdf-columns.spec.ts` | tests/pdf/pdf-columns.spec.ts |
| LANG-01 | Vietnamese characters with diacritics display correctly in PDF | E2E | `npx playwright test tests/pdf/pdf-vietnamese.spec.ts` | tests/pdf/pdf-vietnamese.spec.ts |

</test_map>

<verification_strategy>
## Verification Strategy

**Sampling Rate:**
- **Per task commit:** Manual verification - generate PDF from test quotation, visually inspect
- **Per wave merge:** `npx playwright test` - run full E2E test suite
- **Phase gate:** Full suite green before `/gsd:verify-work`

**Test File Structure:**
```
tests/
├── pdf/
│   ├── export-pdf.spec.ts       # PDF-01: Export functionality
│   ├── pdf-header.spec.ts        # PDF-02: Header information
│   ├── pdf-footer.spec.ts        # PDF-03: Footer information
│   ├── pdf-styling.spec.ts       # PDF-04: Simple professional format
│   ├── pdf-no-image.spec.ts      # PDF-05: No image column
│   ├── pdf-columns.spec.ts        # PDF-06: Auto-fitted columns
│   └── pdf-vietnamese.spec.ts     # LANG-01: Vietnamese characters
├── fixtures/
│   └── quotation-sample.json      # Sample quotation data for testing
└── helpers/
    └── pdf-assertions.ts       # Utilities for PDF content verification
```

**Helper Functions Needed:**
- `extractPDFText(pdfPath)` - Extract text from PDF using Playwright's PDF parsing
- `assertContainsText(extracted, expected)` - Check for expected Vietnamese text
- `countPDFPages(pdfPath)` - Verify multi-page behavior
- `getPDFFonts(pdfPath)` - Verify Roboto font usage

**Sample Test Data Structure:**
```json
{
  "quote_number": "BG-TEST-001",
  "customer_name": "Công ty ABC",
  "customer_phone": "090123456789",
  "customer_address": "123 Đường ABC, Quận 1, TP.HCM",
  "customer_model": "Mẫu máy X",
  "subtotal_software": 15000000,
  "subtotal_hardware": 20000000,
  "discount_amount": 0,
  "total_amount": 35000000,
  "notes": "Ghi chú kiểm thử PDF",
  "status": "draft",
  "items": [
    {
      "id": "1",
      "name": "Phần mềm quản lý",
      "description": "Mô tả đầy đủ cho phần mềm",
      "unit": "Cái",
      "quantity": 1,
      "unit_price": 10000000,
      "total_price": 10000000,
      "product_category": "software",
      "is_free": false
    },
    {
      "id": "2",
      "name": "Thiết bị POS",
      "description": "Máy POS dòng ABC",
      "unit": "Bộ",
      "quantity": 2,
      "unit_price": 10000000,
      "total_price": 20000000,
      "product_category": "hardware",
      "is_free": false
    }
  ]
}
```

</verification_strategy>

<wave_gaps>
## Wave 0 Gaps

- [ ] `tests/pdf/` - PDF export test directory with E2E tests for all requirements
- [ ] `tests/fixtures/quotation-sample.json` - Sample quotation data for testing
- [ ] `playwright.config.ts` - Playwright configuration for E2E tests
- [ ] Framework setup: Playwright is in devDependencies but config not detected - may need initialization
- [ ] Helper function: `tests/helpers/pdf-assertions.ts` - Utilities for PDF content verification (e.g., text extraction, Vietnamese character checks)
- [ ] Test data fixture: Sample quotation with Vietnamese text to test LANG-01

</wave_gaps>

---

*Phase: 01-pdf-generation-core*
*Validation created: 2026-03-20*
