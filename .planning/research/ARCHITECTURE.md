# Architecture Patterns - PDF Export in Next.js

**Domain:** Quotation PDF Export Feature
**Researched:** 2026-03-20
**Overall confidence:** MEDIUM

## Executive Summary

PDF export features in Next.js applications typically follow a server-side rendering pattern via API routes, where the PDF generation happens on the server and is streamed back to the client as a downloadable file. The existing codebase already demonstrates this pattern with Excel export, which provides a solid architectural foundation for adding PDF export functionality.

The recommended approach for this project is to leverage `@react-pdf/renderer` for server-side PDF generation due to its React component-based architecture, which aligns well with the existing codebase, and its ability to produce print-ready A4 documents with proper Vietnamese language support.

## Recommended Architecture

```
[Client: QuotationPreview]
    | onExport(type: 'excel' | 'pdf')
    v
[API Route: /api/quotations/[id]/export?format=pdf]
    | 1. Fetch quotation data from Supabase
    | 2. Fetch items with product images
    | 3. Transform data for PDF renderer
    | 4. Generate PDF buffer using react-pdf
    v
[PDF Generator: libs/quotation-pdf-generator.tsx]
    | Document component structure
    | Page layout (A4)
    | Header, content, footer sections
    v
[Response: PDF buffer with Content-Type: application/pdf]
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **QuotationPreview** | Export UI button, format selection | API route via fetch |
| **QuotationFooter** | Export action triggers | Parent component (QuotationPreview) |
| **PDF Export API** | Data fetching, PDF generation, response | Supabase, PDF generator |
| **PDF Generator** | Document structure, A4 layout, styling | API route, quotation types |
| **Quotation Types** | Type definitions | All components |

## Data Flow

### Export Request Flow

1. **User Action**: User clicks "Export PDF" button in QuotationFooter
2. **Client Request**: Fetch request to `/api/quotations/[id]/export?format=pdf`
3. **API Processing**:
   - Fetch quotation metadata from Supabase
   - Fetch quotation items ordered by row_number
   - Fetch product images (optional, will be hidden in PDF)
   - Transform data structure for PDF rendering
4. **PDF Generation**:
   - Create document structure with A4 page size
   - Render header (company info, quote number, date)
   - Render items table (grouped by software/hardware categories)
   - Render summary section (totals, discounts)
   - Render footer (notes, signature area)
5. **Response**: Return PDF buffer with proper headers
6. **Client Download**: Browser handles file download

### Data Transformation Flow

```
[Quotation (Supabase)]
    { quote_number, customer_name, ... }
    v
[QuotationItem (Supabase)]
    { name, description, unit, quantity, unit_price, ... }
    v
[PDF-Ready Structure]
    { header: {...}, sections: [...], summary: {...} }
    v
[PDF Document Component]
    <Document><Page>...</Page></Document>
```

## Patterns to Follow

### Pattern 1: API Route with Format Parameter

**What:** Use a single export endpoint that handles both Excel and PDF formats via query parameter

**When:** Multiple export formats needed from same data source

**Example:**
```typescript
// app/api/quotations/[id]/export/route.ts
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'excel';

  // Fetch data
  const { quotation, items } = await fetchQuotationData(context);

  if (format === 'pdf') {
    const pdfBuffer = await generateQuotationPDF(quotation, items);
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="BaoGia_${quotation.quote_number}.pdf"`,
      },
    });
  }

  // Default to Excel
  const excelBuffer = await generateQuotationExcel(quotation, items);
  return new NextResponse(new Uint8Array(excelBuffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="BaoGia_${quotation.quote_number}.xlsx"`,
    },
  });
}
```

### Pattern 2: React-PDF Document Component Structure

**What:** Use React components to define PDF structure with proper A4 layout

**When:** Complex document structure with headers, tables, footers

**Example:**
```typescript
// libs/quotation-pdf-generator.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 10,
  },
  table: {
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 5,
  },
});

export function QuotationPDFDocument({ quotation, items }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>Báo Giá #{quotation.quote_number}</Text>
          <Text>Ngày: {new Date().toLocaleDateString('vi-VN')}</Text>
        </View>
        {/* Items table */}
        {/* Summary */}
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

### Pattern 3: Data Fetching with Image Handling

**What:** Fetch quotation data with optional image data, handle gracefully

**When:** Product images exist but not needed in PDF output

**Example:**
```typescript
async function fetchQuotationData(id: string) {
  const [
    { data: quotation, error: quotationError },
    { data: items, error: itemsError },
  ] = await Promise.all([
    supabase.from('quotations').select('*').eq('id', id).single(),
    supabase
      .from('quotation_items')
      .select('*')
      .eq('quotation_id', id)
      .order('row_number', { ascending: true }),
  ]);

  if (quotationError || itemsError) {
    throw new Error('Failed to fetch quotation');
  }

  return { quotation, items: items || [] };
}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Client-Side PDF Generation

**What:** Generating PDF entirely in the browser using jsPDF

**Why bad:**
- Limited styling capabilities
- Poor performance with large documents
- Inconsistent rendering across browsers
- No access to server-side fonts

**Instead:** Use server-side generation with react-pdf or puppeteer

### Anti-Pattern 2: Separate Endpoints for Each Format

**What:** Creating `/api/quotations/[id]/export/excel` and `/api/quotations/[id]/export/pdf`

**Why bad:**
- Code duplication for data fetching
- Maintenance burden
- Inconsistent error handling

**Instead:** Use single endpoint with format parameter

### Anti-Pattern 3: Hard-Coded Layout Dimensions

**What:** Hard-coding pixel values for A4 layout

**Why bad:**
- Breaks with different margins
- Difficult to adjust
- Not responsive to content length

**Instead:** Use react-pdf's percentage-based widths and Flexbox layout

## Integration with Existing Architecture

### API Route Structure

**Current:**
- `app/api/quotations/[id]/export/route.ts` - Excel only

**Proposed:**
- Same route, enhanced with format parameter
- Extract data fetching to shared function
- Format-specific generation functions

```
app/api/quotations/
  [id]/
    route.ts              # GET, PUT, DELETE
    export/
      route.ts           # GET (format=excel|pdf)
```

### Generator Library Pattern

**Current:**
- `libs/quotation-generator.ts` - Excel generation with ExcelJS

**Proposed:**
- Add `libs/quotation-pdf-generator.tsx` - PDF generation with react-pdf
- Keep Excel generator unchanged
- Shared data transformation utilities

```
libs/
  quotation-generator.ts          # Excel generation (existing)
  quotation-pdf-generator.tsx    # PDF generation (new)
  quotation-calculator.ts        # Calculations (existing)
```

### Component Updates

**Current:**
- `QuotationFooter` - Single export button (Excel)

**Proposed:**
- Add format dropdown or separate buttons
- Pass format to export handler
- Update loading states per format

```typescript
// components/quotation/QuotationFooter.tsx
export function QuotationFooter({ onExport, isExporting, ... }) {
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf'>('pdf');

  return (
    <div>
      <select onChange={(e) => setExportFormat(e.target.value as any)}>
        <option value="pdf">PDF</option>
        <option value="excel">Excel</option>
      </select>
      <button onClick={() => onExport(exportFormat)}>
        Export
      </button>
    </div>
  );
}
```

## State Management for Export Options

### Current State

The quotation module uses React useState in parent components:
- `isExporting` - Loading state for export button
- Export handler in `QuotationPreview` component

### Recommended Approach

1. **Add export format state** to `QuotationPreview`
2. **Persist format preference** in LocalStorage (like menu data)
3. **Loading state per format** for better UX

```typescript
// in QuotationPreview component
const [exportFormat, setExportFormat] = useState<'excel' | 'pdf'>(
  () => {
    // Load from LocalStorage with default
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quotation-export-format');
      return saved === 'excel' ? 'excel' : 'pdf';
    }
    return 'pdf';
  }
);

const handleExport = async (format: 'excel' | 'pdf') => {
  setExportFormat(format);
  localStorage.setItem('quotation-export-format', format);
  onExport(format);
};
```

## Error Handling Patterns

### API Route Error Handling

```typescript
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // Validate quotation exists
    const { quotation, items } = await fetchQuotationData(params.id);

    if (!quotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    // Validate items exist
    if (items.length === 0) {
      return NextResponse.json(
        { error: 'Quotation has no items' },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generateQuotationPDF(quotation, items);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="BaoGia_${quotation.quote_number}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
```

### Client-Side Error Handling

```typescript
// in QuotationPreview component
const handleExport = async (format: 'excel' | 'pdf') => {
  setIsExporting(true);
  try {
    const response = await fetch(`/api/quotations/${quotationId}/export?format=${format}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Export failed');
    }

    // Download file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = format === 'pdf'
      ? `BaoGia_${quotation.quote_number}.pdf`
      : `BaoGia_${quotation.quote_number}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export error:', error);
    alert('Xuất file không thành công. Vui lòng thử lại.');
  } finally {
    setIsExporting(false);
  }
};
```

## Scalability Considerations

| Concern | At 10 quotations | At 100 quotations | At 1000 quotations |
|---------|------------------|------------------|-------------------|
| **PDF generation time** | <1s per export | <2s per export | <3s per export |
| **Server memory** | Minimal (<50MB) | Moderate (<100MB) | May need caching |
| **API response time** | Fast | Fast | Consider queue for bulk |
| **A4 pages per quote** | 1-2 pages | 1-5 pages | 1-10 pages |

**Recommendations:**
- Set `maxDuration = 60` in export route to prevent timeouts
- Consider caching generated PDFs for re-exports of same quote
- Monitor generation time and add progress indicator if >2s

## Suggested Build Order

Based on component dependencies:

1. **Phase 1: PDF Generator Core**
   - Create `libs/quotation-pdf-generator.tsx`
   - Implement document structure (A4 pages)
   - Add basic header/content/footer layout
   - Test with sample data

2. **Phase 2: API Route Integration**
   - Modify `app/api/quotations/[id]/export/route.ts`
   - Add format parameter handling
   - Integrate PDF generator
   - Add error handling

3. **Phase 3: Frontend Integration**
   - Update `QuotationFooter` with format selection
   - Add format state to `QuotationPreview`
   - Update export handler for both formats
   - Add loading states

4. **Phase 4: Styling Polish**
   - Refine PDF styling to match Excel format
   - Test Vietnamese font rendering
   - Verify A4 layout and pagination
   - Hide image column properly

## Sources

- **@react-pdf/renderer documentation**: https://react-pdf.org/ (HIGH confidence)
- **Next.js API Routes**: Official documentation (HIGH confidence)
- **ExcelJS patterns from existing code**: `libs/quotation-generator.ts` (HIGH confidence)
- **Supabase integration**: Existing API route patterns (HIGH confidence)

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| PDF Generation Architecture | MEDIUM | Based on react-pdf documentation, limited validation in current codebase |
| API Route Patterns | HIGH | Validated against existing export route implementation |
| Data Flow | HIGH | Clear pattern from existing quotation API routes |
| Component Integration | HIGH | Matches existing React component structure |
| Error Handling | HIGH | Based on existing error patterns in codebase |
| State Management | HIGH | Existing useState + LocalStorage pattern validated |

## Gaps to Address

- **Vietnamese Font Support**: Need to verify @react-pdf/renderer supports Vietnamese characters properly
- **Performance Testing**: Need to test PDF generation with large quotations (50+ items)
- **A4 Layout Validation**: Need to test actual printed output to ensure margins and sizing are correct
- **Image Column Hiding**: Confirm that excluding images from PDF works as expected
- **Pagination Logic**: Handle cases where quotation spans multiple A4 pages
