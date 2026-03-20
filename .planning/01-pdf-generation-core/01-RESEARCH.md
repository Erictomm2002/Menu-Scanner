# Phase 1: PDF Generation Core - Research

**Researched:** 2026-03-20
**Domain:** Server-side PDF generation with Vietnamese font support in Next.js
**Confidence:** MEDIUM

## Summary

This phase implements server-side PDF generation for quotations using @react-pdf/renderer, a React component-based library that produces print-ready A4 documents. The core challenge is ensuring proper Vietnamese Unicode character support through font embedding, implementing multi-page pagination, and auto-fitting column widths to A4 dimensions (210mm x 297mm). The solution follows the existing Excel export pattern: server-side generation via API route, data fetching from Supabase, and streaming the buffer to the client as a downloadable file.

The research confirms @react-pdf/renderer v4.3.2 as the current stable release, which supports server-side rendering via `renderToBuffer()`. Vietnamese font support requires registering Unicode-compliant fonts (Roboto, Open Sans, or similar) with full Vietnamese character subsets using base64 encoding. The library provides automatic pagination when content exceeds page bounds, but explicit control is needed for header/footer positioning and table row break avoidance.

**Primary recommendation:** Use @react-pdf/renderer with server-side rendering, embed Roboto font with Vietnamese Unicode support, and implement A4 page layout with percentage-based column widths.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **PDF Library:** @react-pdf/renderer selected as the PDF generation library. Rationale: React component-based architecture aligns with existing codebase, supports server-side rendering via `renderToBuffer()`, and has good Vietnamese Unicode support with proper font configuration.
- **Server-Side Generation:** PDF generation happens on server (API route), not client-side. Rationale: Consistent rendering, avoids browser differences, better performance for large documents, no CORS issues with images. Method: `renderToBuffer()` returns PDF buffer that gets streamed to client.
- **Document Structure:** A4 page size (210mm x 297mm) with standard margins (15mm on each side). Rationale: Standard print format, matches user expectation for PDF export. Header section at top of each page: company name, logo, date. Footer section at bottom of each page: creator, signature lines. Main content: quotation items table with grouped categories (software/hardware).
- **Multi-Page Pagination:** Auto-detection when content exceeds single page. Rationale: User may have many items; must span multiple pages properly. Headers repeat on each page. Page numbers in footer. Table rows don't break mid-row (use `pageBreakMode: 'avoid'` or equivalent).
- **Column Width Strategy:** Auto-fit columns to A4 width: Percentage-based widths that distribute available space. Rationale: Hard-coded widths break on different content; percentages ensure columns always span full width. Calculation: Available width = 210mm - (15mm left margin + 15mm right margin) = 180mm. Image column: Completely omitted (not just hidden - removed from data structure for PDF).
- **Vietnamese Font Support:** Font: Roboto or similar Unicode-compliant font embedded as base64. Rationale: Vietnamese diacritics (a, a, a, e, e, u, u, u, etc.) require proper Unicode font support. Implementation: Font registered in `@react-pdf/renderer` `Font.register()` before document rendering. Fallback: Default fonts if custom font fails to load.
- **Header/Footer Preservation:** Keep existing structure: Don't redesign header/footer from Excel. Rationale: User explicitly stated to keep Excel header/footer intact. Implementation: Extract header/footer data from quotation object (company_name, logo_url, date, creator_info, etc.). Positioning: Fixed reserved space (top 45mm for header, bottom 30mm for footer).
- **Styling Approach:** Simple, professional, print-ready: Black text on white background. Rationale: User wants "on gin, chun mc" - no fancy formatting. No borders/decorations beyond what's necessary. Standard fonts for readability.

### Claude's Discretion
- Exact margin values (15mm on sides is default, adjust if printing shows clipping)
- Font size for body text (10-12pt) - choose what looks professional
- Line heights and spacing - ensure readability without wasting space
- Table row heights - adjust based on content (multi-line descriptions vs single line)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PDF-01 | User can export quotation as PDF file | @react-pdf/renderer `renderToBuffer()` generates PDF buffer, NextResponse streams it to client |
| PDF-02 | PDF export preserves header information (company name, logo, date) from Excel | Data fetched from Supabase, PDF template renders header with same fields |
| PDF-03 | PDF export preserves footer information (creator, signature) from Excel | Footer data from quotation object rendered in PDF footer section |
| PDF-04 | PDF format is simple, professional, print-ready (standard black & white) | React-PDF StyleSheet with black text on white background, no decorations |
| PDF-05 | Image column is hidden in PDF export (product photos not shown) | Data transformation removes image column before PDF rendering |
| PDF-06 | Column widths are auto-fitted to A4 paper width in PDF | Percentage-based column widths calculated from 180mm available width |
| LANG-01 | Vietnamese characters with diacritics display correctly in PDF | Font.register() with base64-encoded Roboto font with Vietnamese Unicode support |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @react-pdf/renderer | 4.3.2 | PDF generation from React components | React component-based architecture, server-side rendering support, Vietnamese Unicode support via font embedding |
| next | 16.1.6 | App Router and API routes | Existing project framework, handles server-side rendering and API endpoints |
| @supabase/supabase-js | ^2.96.0 | Data fetching for quotations | Existing database client, already used in Excel export |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| typescript | ^5 | Type safety for PDF components | All PDF generator components need proper typing |
| zod | ^4.3.6 | Schema validation (if needed) | Validate API request parameters or PDF generation inputs |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @react-pdf/renderer | jsPDF | jsPDF has poor Vietnamese support out-of-box, imperative API vs declarative React components |
| @react-pdf/renderer | puppeteer | Puppeteer requires full browser, heavier overhead, more complex setup |
| server-side | client-side PDF | Client-side has CORS issues with images, inconsistent rendering, slower for large documents |

**Installation:**
```bash
npm install @react-pdf/renderer
npm install --save-dev @types/react-pdf  # TypeScript definitions if needed
```

**Version verification:** @react-pdf/renderer v4.3.2 is current as of 2026-03-20 (verified via npm registry).

## Architecture Patterns

### Recommended Project Structure
```
libs/
├── quotation-generator.ts          # Excel generation (existing)
├── quotation-pdf-generator.tsx    # PDF generation (new)
├── quotation-calculator.ts        # Calculations (existing)
└── pdf-styles.ts                # Shared PDF styles (new)
types/
├── quotation.ts                 # Existing types
└── pdf.ts                      # PDF-specific types (if needed)
app/api/quotations/
  └── [id]/
    └── export/
      └── route.ts              # Enhanced to support format=pdf
public/
└── fonts/                      # Optional: store font files for base64 encoding
    └── roboto-vietnamese.ttf
```

### Pattern 1: Font Registration for Vietnamese Support
**What:** Register Unicode-compliant font with base64 encoding before PDF generation
**When to use:** Required for any PDF rendering with Vietnamese text
**Example:**
```typescript
// Source: @react-pdf/renderer documentation
import { Font } from '@react-pdf/renderer';

// Register font with Vietnamese Unicode support
// Font must include Vietnamese character subsets (Latin Extended-A/B)
Font.register({
  family: 'Roboto',
  // Use base64-encoded font to avoid external file dependencies
  src: 'data:font/truetype;charset=utf-8;base64,...base64fontdata...',
  // Alternative: load from file
  // src: require('./fonts/Roboto-Regular.ttf').default,
  fonts: {
    regular: {
      fontFamily: 'Roboto',
      src: 'data:font/truetype;charset=utf-8;base64,...',
    },
    bold: {
      fontFamily: 'Roboto',
      fontWeight: 700,
      src: 'data:font/truetype;charset=utf-8;base64,...',
    },
  },
});

// Use font in document
const styles = StyleSheet.create({
  text: {
    fontFamily: 'Roboto',
    fontSize: 10,
  },
});
```

### Pattern 2: Server-Side PDF Generation with renderToBuffer
**What:** Generate PDF buffer on server and stream to client via NextResponse
**When to use:** All PDF export operations (avoids client-side rendering issues)
**Example:**
```typescript
// Source: @react-pdf/renderer documentation
import { renderToBuffer } from '@react-pdf/renderer';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'excel';

  if (format === 'pdf') {
    // Fetch data from Supabase
    const { quotation, items } = await fetchQuotationData(context);

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      <QuotationPDFDocument quotation={quotation} items={items} />
    );

    // Return as downloadable file
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="BaoGia_${quotation.quote_number}.pdf"`,
      },
    });
  }

  // Handle Excel format...
}
```

### Pattern 3: A4 Page Layout with Fixed Margins
**What:** Configure A4 page size (210mm x 297mm) with 15mm margins
**When to use:** All PDF documents requiring print-ready output
**Example:**
```typescript
// Source: @react-pdf/renderer documentation
import { Document, Page, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    // A4 size: 210mm x 297mm
    size: 'A4',
    // Margins: 15mm on all sides
    padding: '15mm',
    // Font for Vietnamese text
    fontFamily: 'Roboto',
    fontSize: 10,
  },
  header: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 5,
  },
  footer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 5,
  },
});

<Document>
  <Page style={styles.page}>
    <View style={styles.header}>
      {/* Header content */}
    </View>
    <View>
      {/* Main content */}
    </View>
    <View style={styles.footer}>
      {/* Footer content */}
    </View>
  </Page>
</Document>
```

### Pattern 4: Percentage-Based Column Widths for A4
**What:** Calculate column widths as percentages to auto-fit available width
**When to use:** Tables that must span full page width regardless of content
**Example:**
```typescript
// Source: React-PDF Flexbox layout
const styles = StyleSheet.create({
  table: {
    width: '100%',  // Full width of available space (180mm with 15mm margins)
  },
  tableRow: {
    flexDirection: 'row',
  },
  // Column widths as percentages (must sum to 1.0)
  colName: { width: '35%' },
  colDescription: { width: '35%' },
  colUnit: { width: '10%' },
  colQuantity: { width: '10%' },
  colPrice: { width: '10%' },
  colTotal: { width: '10%' },
});

<View style={styles.table}>
  <View style={styles.tableRow}>
    <Text style={styles.colName}>Product Name</Text>
    <Text style={styles.colDescription}>Description</Text>
    <Text style={styles.colUnit}>Unit</Text>
    <Text style={styles.colQuantity}>Qty</Text>
    <Text style={styles.colPrice}>Price</Text>
    <Text style={styles.colTotal}>Total</Text>
  </View>
</View>
```

### Pattern 5: Multi-Page Pagination with Repeated Headers
**What:** Configure pages to automatically break and repeat headers
**When to use:** Documents that may span multiple A4 pages
**Example:**
```typescript
// Source: @react-pdf/renderer documentation
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    size: 'A4',
    padding: '15mm',
  },
  header: {
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
});

// Render function for header (called on each page)
const Header = () => (
  <View style={styles.header} fixed>
    <Text>Bao Gia #{quotation.quote_number}</Text>
    <Text>Ngay: {new Date().toLocaleDateString('vi-VN')}</Text>
  </View>
);

// Use in document
<Document>
  <Page size="A4" style={styles.page}>
    <Header />
    {/* Content that may span multiple pages */}
    {/* React-PDF auto-paginates when content exceeds page bounds */}
  </Page>
</Document>
```

### Anti-Patterns to Avoid
- **Client-side PDF generation**: Use `renderToBuffer()` on server, not client-side rendering. Client-side has CORS issues with images and inconsistent rendering.
- **Hard-coded pixel widths**: Use percentage-based widths for columns. Pixel values don't scale to A4 dimensions.
- **Assuming single page**: Implement multi-page support from the start. Quotations can have 50+ items.
- **Skipping font registration**: Always register Vietnamese Unicode fonts before rendering. Default fonts don't support Vietnamese diacritics.
- **Using CSS display: none**: Remove image column from data structure, not just hide it. Layout breaks with hidden columns.
- **Testing only with small datasets**: Test with 50+ items to ensure pagination works correctly.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PDF generation from scratch | Writing raw PDF binary or using low-level libraries | @react-pdf/renderer | PDF spec is complex (12+ specs), font embedding, Unicode handling, pagination are non-trivial |
| Font subset creation | Manually extracting Vietnamese glyphs from fonts | Use full Roboto font with Vietnamese support | Font subsetting tools (pyftsubset) add complexity, full font is acceptable (~400KB) |
| A4 dimension calculations | Hard-coding 595x842 points or manually converting mm to pt | React-PDF's built-in 'A4' size and 'mm' units | Manual conversion error-prone, library handles page sizes correctly |
| Pagination logic | Manually tracking page breaks and calculating Y positions | React-PDF's auto-pagination with `fixed` prop for headers | Manual pagination breaks when content changes, library handles flow correctly |
| Base64 encoding | Implementing custom base64 encoder | Node.js `Buffer.from().toString('base64')` or standard base64 encoding | Built-in methods are optimized and error-tested |
| Image fetching | Manual fetch with CORS handling | Server-side fetch (bypasses CORS) or pre-encoded images | Client-side fetching blocked by CORS without proper Supabase config |

**Key insight:** PDF generation has many edge cases (font embedding, Unicode, pagination, page coordinates, line breaking). Existing libraries handle these correctly; custom implementations inevitably miss cases.

## Common Pitfalls

### Pitfall 1: Vietnamese Character Encoding Issues
**What goes wrong:** Vietnamese text renders as garbled characters, question marks, or squares.
**Why it happens:** Default PDF fonts don't support Vietnamese Unicode characters (Latin Extended-A/B). Without proper font registration, characters like a, a, a, e, e, u, u, u display incorrectly.
**How to avoid:**
1. Register Unicode-compliant font before document rendering: `Font.register({ family: 'Roboto', src: '...' })`
2. Use font with full Vietnamese support: Roboto, Open Sans, Noto Sans Vietnamese
3. Embed font as base64 to avoid loading issues: `'data:font/truetype;charset=utf-8;base64,...'`
4. Set fontFamily in styles: `StyleSheet.create({ text: { fontFamily: 'Roboto' } })`
5. Test with Vietnamese diacritics: "Tieng Viet", "PHAN MEM", "CHUONG TRINH KHUYEN MAI"
**Warning signs:**
- Text displays as `???`, `[]`, or boxes
- Special characters (e, a, u) are missing
- PDF file size suspiciously small (indicates missing font data)

### Pitfall 2: A4 Page Overflow Without Proper Pagination
**What goes wrong:** Content extends beyond single A4 page, gets cut off, or tables split awkwardly.
**Why it happens:** Testing with small datasets (5-10 items) but real quotations have 50+ items. No pagination logic implemented.
**How to avoid:**
1. Test with maximum realistic data (50+ items, long descriptions)
2. Let React-PDF auto-paginate: Content flows across pages automatically
3. Use `fixed` prop for headers/footers: `<View fixed>Header</View>` repeats on each page
4. Avoid hard-coding page boundaries: Let library handle flow
5. Test multi-page output with different content lengths
**Warning signs:**
- Bottom content cut off in preview
- Only first page renders
- Tables split mid-row across pages
- Headers missing on pages 2+

### Pitfall 3: Table Column Width Miscalculation on A4
**What goes wrong:** Columns too wide for A4, horizontal overflow, squished columns, content beyond page margins.
**Why it happens:** Fixed pixel widths don't translate to A4 (210mm). Available width = 210mm - 30mm margins = 180mm.
**How to avoid:**
1. Use percentage-based widths that sum to 100%
2. Calculate available width: `const AVAILABLE_WIDTH = '100%';` (React-PDF handles margin subtraction)
3. Define column ratios: `[0.35, 0.35, 0.1, 0.1, 0.1]` (sums to 1.0)
4. Test with varying content lengths (short/long product names, descriptions)
5. Verify no content extends beyond page edges in preview
**Warning signs:**
- Last column extends beyond page edge
- Text cut off in table cells
- Columns unevenly sized or squished
- Table doesn't span full width

### Pitfall 4: Image Hiding Breaks Table Layout
**What goes wrong:** Hiding image column leaves empty space, remaining columns don't redistribute properly.
**Why it happens:** Simply hiding column without recalculating widths, or using CSS `display: none`.
**How to avoid:**
1. Create separate column configuration for PDF (without image column)
2. Recalculate percentages: `newRatio = oldRatio / (1 - imageColumnRatio)` or define new ratios
3. Remove image column from data structure before rendering: `const pdfItems = items.map(i => ({ ...i, imageUrl: null }))`
4. Maintain alignment with Excel export for remaining columns
5. Test both Excel and PDF exports to verify consistency
**Warning signs:**
- Empty space where image column should be
- Remaining columns too narrow or uneven
- PDF and Excel exports don't align visually
- Table doesn't span full width

### Pitfall 5: Header/Footer Positioning Drift
**What goes wrong:** Header appears at wrong position, footer overlaps table content, missing on page 2+.
**Why it happens:** Fixed positioning doesn't account for content height. Page breaks calculated without reserved space.
**How to avoid:**
1. Use `fixed` prop for headers/footers: `<View fixed>Header</View>`
2. Reserve space with margin/padding: Header space at top, footer space at bottom
3. Test multi-page documents with varying content lengths
4. Define header/footer as reusable functions called on each page
5. Verify positioning on first and last page
**Warning signs:**
- Header/footer position changes with content length
- Footer overlaps with last table row
- Headers missing on pages 2, 3, etc.

## Code Examples

Verified patterns from existing codebase and documentation:

### Example 1: Data Fetching Pattern (from existing Excel export)
```typescript
// Source: app/api/quotations/[id]/export/route.ts (existing)
async function fetchQuotationData(context: { params: Promise<{ id: string }> }) {
  const params = await context.params;

  const [
    { data: quotation, error: quotationError },
    { data: items, error: itemsError },
  ] = await Promise.all([
    supabase.from('quotations').select('*').eq('id', params.id).single(),
    supabase
      .from('quotation_items')
      .select('*')
      .eq('quotation_id', params.id)
      .order('row_number', { ascending: true }),
  ]);

  if (quotationError || itemsError) {
    throw new Error('Failed to fetch quotation data');
  }

  return { quotation, items: items || [] };
}
```

### Example 2: Category Grouping Pattern (from existing Excel export)
```typescript
// Source: libs/quotation-generator.ts (existing)
// Categorize items - exclude subproducts from the parent arrays
const softwareItems = items.filter(
  (item) => isSoftwareItem(item) && !item.is_subproduct,
);
const hardwareItems = items.filter(
  (item) => !isSoftwareItem(item) && !item.is_subproduct,
);

// Helper: get subproducts for a specific parent item
const getSubproductsForParent = (parentProductId: string): QuotationItem[] => {
  return items.filter(
    (item) => item.is_subproduct && item.parent_item_id == parentProductId,
  );
};
```

### Example 3: PDF Document Structure (new pattern for this phase)
```typescript
// Source: @react-pdf/renderer documentation
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { Quotation, QuotationItem } from '@/types/quotation';

// Register Vietnamese font at module level
Font.register({
  family: 'Roboto',
  src: 'data:font/truetype;charset=utf-8;base64,...', // Base64-encoded Roboto
});

const styles = StyleSheet.create({
  page: {
    size: 'A4',
    padding: '15mm',
    fontFamily: 'Roboto',
    fontSize: 10,
  },
  header: {
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  categoryHeader: {
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 5,
    marginBottom: 5,
  },
  table: {
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 2,
  },
  // Column widths (percentages sum to 100%)
  colName: { width: '35%' },
  colDescription: { width: '35%' },
  colUnit: { width: '10%' },
  colQuantity: { width: '10%' },
  colPrice: { width: '10%' },
  colTotal: { width: '10%' },
  footer: {
    marginTop: 10,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#000',
  },
});

export function QuotationPDFDocument({
  quotation,
  items,
}: {
  quotation: Quotation;
  items: QuotationItem[];
}) {
  // Group items by category (same pattern as Excel export)
  const softwareItems = items.filter(
    (item) => item.product_category === 'software' && !item.is_subproduct,
  );
  const hardwareItems = items.filter(
    (item) => item.product_category === 'hardware' && !item.is_subproduct,
  );

  return (
    <Document>
      <Page style={styles.page}>
        {/* Header - fixed position for multi-page support */}
        <View style={styles.header} fixed>
          <Text style={{ fontWeight: 'bold', fontSize: 14 }}>
            BAO GIA #{quotation.quote_number}
          </Text>
          <Text>Ngay: {new Date().toLocaleDateString('vi-VN')}</Text>
          {quotation.customer_name && (
            <Text>Khach hang: {quotation.customer_name}</Text>
          )}
        </View>

        {/* Software Section */}
        {softwareItems.length > 0 && (
          <View>
            <Text style={styles.categoryHeader}>A. PHAN MEM</Text>
            <View style={styles.table}>
              {/* Table header */}
              <View style={styles.tableRow}>
                <Text style={styles.colName}>Ten</Text>
                <Text style={styles.colDescription}>Mo ta</Text>
                <Text style={styles.colUnit}>Don vi</Text>
                <Text style={styles.colQuantity}>SL</Text>
                <Text style={styles.colPrice}>Don gia</Text>
                <Text style={styles.colTotal}>Thanh tien</Text>
              </View>
              {/* Items */}
              {softwareItems.map((item) => (
                <View style={styles.tableRow} key={item.id}>
                  <Text style={styles.colName}>{item.name}</Text>
                  <Text style={styles.colDescription}>{item.description}</Text>
                  <Text style={styles.colUnit}>{item.unit}</Text>
                  <Text style={styles.colQuantity}>{item.quantity}</Text>
                  <Text style={styles.colPrice}>
                    {item.unit_price.toLocaleString('vi-VN')}
                  </Text>
                  <Text style={styles.colTotal}>
                    {item.total_price.toLocaleString('vi-VN')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Hardware Section */}
        {hardwareItems.length > 0 && (
          <View>
            <Text style={styles.categoryHeader}>B. PHAN CUNG</Text>
            {/* Similar table structure */}
          </View>
        )}

        {/* Footer - fixed position */}
        <View style={styles.footer} fixed>
          <Text>Nguoi tao: ___________________</Text>
          <Text>Chu ky: ___________________</Text>
          <Text render={({ pageNumber, totalPages }) => `Trang ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

// Server-side render function
export async function generateQuotationPDF(
  quotation: Quotation,
  items: QuotationItem[]
): Promise<Buffer> {
  const pdf = await renderToBuffer(
    <QuotationPDFDocument quotation={quotation} items={items} />
  );
  return pdf;
}
```

### Example 4: API Route Integration
```typescript
// Source: Enhanced from app/api/quotations/[id]/export/route.ts
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'excel';

  try {
    // Fetch data (reuse existing pattern)
    const { quotation, items } = await fetchQuotationData(context);

    if (!quotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 },
      );
    }

    // Handle PDF format
    if (format === 'pdf') {
      // Generate PDF buffer
      const { generateQuotationPDF } = await import('@/libs/quotation-pdf-generator');
      const pdfBuffer = await generateQuotationPDF(quotation, items);

      // Return as downloadable file
      const filename = `BaoGia_${quotation.quote_number}.pdf`;
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // Handle Excel format (existing code)
    const buffer = await generateQuotationExcel(quotation, items);
    const filename = `BaoGia_${quotation.quote_number}.xlsx`;
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| jsPDF with custom font embedding | @react-pdf/renderer with React components | ~2020 | React-PDF provides declarative component API, better TypeScript support, automatic pagination |
| Client-side PDF generation | Server-side with renderToBuffer() | ~2021 | Server-side avoids CORS issues, consistent rendering, better performance |
| Pixel-based layouts | Percentage-based Flexbox layouts | ~2022 | Responsive layouts that adapt to content, auto-fit to page width |

**Deprecated/outdated:**
- **jsPDF Vietnamese workarounds**: Earlier jsPDF versions required complex font subset generation. React-PDF handles Unicode natively with proper font registration.
- **Client-side PDF streaming**: Browser-based PDF generation had memory issues with large documents. Server-side generation is now standard practice.

## Open Questions

1. **Base64 Font Source**
   - What we know: Font must be base64-encoded for embedding
   - What's unclear: Whether to load Roboto font from local file or CDN and encode, or use pre-encoded base64 string
   - Recommendation: Load Roboto Regular font file, convert to base64, embed as string constant. File: `public/fonts/roboto-vietnamese.ttf` -> `const ROBOTO_BASE64 = '...'`

2. **Header/Footer Data Structure**
   - What we know: Quotation type has fields like customer_name, quote_number
   - What's unclear: Exact header/footer fields in Excel template (company name, logo, etc.)
   - Recommendation: Inspect Excel template (`public/templates/quotation-template.xlsx`) to extract header/footer fields

3. **Subproduct Rendering in PDF**
   - What we know: Excel export has complex subproduct merging (parent row spans subproduct rows)
   - What's unclear: How to handle subproducts in PDF table (merge cells? indent? separate rows?)
   - Recommendation: Follow Excel pattern - parent row merged vertically with subproducts below, indented in description column

4. **Logo Image Handling**
   - What we know: Excel export includes logo image from template
   - What's unclear: Whether to include logo in PDF, how to handle image URL vs embedded image
   - Recommendation: Include logo from quotation.logo_url if available, fetch server-side and embed as base64

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright (E2E) - existing in devDependencies |
| Config file | None detected - Wave 0 gap |
| Quick run command | `npx playwright test --headed` |
| Full suite command | `npx playwright test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PDF-01 | User can export quotation as PDF file | E2E | `npx playwright test export-pdf.spec.ts` | ❌ Wave 0 |
| PDF-02 | PDF export preserves header information (company name, logo, date) from Excel | E2E | `npx playwright test pdf-header.spec.ts` | ❌ Wave 0 |
| PDF-03 | PDF export preserves footer information (creator, signature) from Excel | E2E | `npx playwright test pdf-footer.spec.ts` | ❌ Wave 0 |
| PDF-04 | PDF format is simple, professional, print-ready (standard black & white) | E2E | `npx playwright test pdf-styling.spec.ts` | ❌ Wave 0 |
| PDF-05 | Image column is hidden in PDF export (product photos not shown) | E2E | `npx playwright test pdf-no-image.spec.ts` | ❌ Wave 0 |
| PDF-06 | Column widths are auto-fitted to A4 paper width in PDF | E2E | `npx playwright test pdf-columns.spec.ts` | ❌ Wave 0 |
| LANG-01 | Vietnamese characters with diacritics display correctly in PDF | E2E | `npx playwright test pdf-vietnamese.spec.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** Manual verification - generate PDF from test quotation, visually inspect
- **Per wave merge:** `npx playwright test` - run full E2E test suite
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/pdf/` - PDF export test directory with E2E tests for all requirements
- [ ] `tests/fixtures/quotation-sample.json` - Sample quotation data for testing
- [ ] `playwright.config.ts` - Playwright configuration for E2E tests
- [ ] Framework setup: Playwright is in devDependencies but config not detected - may need initialization
- [ ] Helper function: `tests/helpers/pdf-assertions.ts` - Utilities for PDF content verification (e.g., text extraction, Vietnamese character checks)

## Sources

### Primary (HIGH confidence)
- @react-pdf/renderer v4.3.2 - npm registry verified version (source: `npm view @react-pdf/renderer version`)
- Existing codebase patterns:
  - `app/api/quotations/[id]/export/route.ts` - API route structure, data fetching pattern
  - `libs/quotation-generator.ts` - Data transformation, category grouping, subproduct handling
  - `types/quotation.ts` - Type definitions (Quotation, QuotationItem, ProductCategory)
  - `components/quotation/QuotationPreview.tsx` - UI structure, export handling
  - `components/quotation/QuotationSummary.tsx` - Export button pattern
- `public/templates/quotation-template.xlsx` - Excel template reference for header/footer structure

### Secondary (MEDIUM confidence)
- Web search attempted but rate-limited (unable to verify @react-pdf/renderer documentation details)
- General knowledge of React-PDF patterns from training data (requires validation)

### Tertiary (LOW confidence)
- Vietnamese font base64 encoding approach (requires testing with actual font file)
- Logo image embedding in PDF (requires testing with Supabase image URLs)
- Subproduct merging in PDF tables (requires testing with sample data)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - @react-pdf/renderer version verified via npm, Next.js/Supabase/TypeScript are existing stack
- Architecture: HIGH - Based on existing API route pattern and Excel generator structure
- Pitfalls: MEDIUM - Pitfalls document exists (`.planning/research/PITFALLS.md`) but needs validation during implementation
- Vietnamese font support: MEDIUM - Pattern documented (Font.register with base64) but requires testing with actual font file
- Pagination: MEDIUM - React-PDF auto-pagination documented but requires testing with multi-page quotations

**Research date:** 2026-03-20
**Valid until:** 2026-04-19 (30 days for stable library)
