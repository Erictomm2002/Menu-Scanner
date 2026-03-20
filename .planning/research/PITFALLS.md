# Pitfalls Research

**Domain:** PDF Export for Next.js Quotation System
**Researched:** 2026-03-20
**Confidence:** MEDIUM (web search unavailable, based on codebase analysis and documented patterns)

## Critical Pitfalls

### Pitfall 1: Vietnamese Character Encoding Issues

**What goes wrong:**
Vietnamese text (e.g., "Tiếng Việt", "PHẦN MỀM", "CHƯƠNG TRÌNH KHUYẾN MÃI") renders as garbled characters, question marks, or squares in the generated PDF. The PDF becomes unusable for Vietnamese-speaking users.

**Why it happens:**
Most PDF libraries (jsPDF, react-pdf) use default fonts that only support ASCII/Latin-1 character sets. Vietnamese requires Unicode support for characters with diacritical marks (á, à, ả, ã, ạ, etc.). Developers often assume UTF-8 encoding works automatically without specifying custom fonts.

**How to avoid:**
1. Always add custom fonts that support Vietnamese Unicode characters (e.g., Roboto, Open Sans with Vietnamese subset)
2. Use base64-encoded font files embedded in the code or properly loaded fonts
3. Set the font explicitly before rendering Vietnamese text: `doc.setFont('vietnamese_font')`
4. Test with full Vietnamese character set during development

```typescript
// Correct approach for jsPDF
const doc = new jsPDF();
doc.addFileToVFS('vietnamese_font.ttf', fontBase64);
doc.addFont('vietnamese_font.ttf', 'Vietnamese', 'normal');
doc.setFont('Vietnamese');
doc.text('Tiếng Việt', 10, 10);
```

**Warning signs:**
- Text displays as `???`, `[]`, or boxes in PDF
- Special characters (é, à, ã) are missing
- Vietnamese text is partially rendered (some characters work, others don't)
- PDF file size suspiciously small (indicates missing font data)

**Phase to address:**
Phase 1: Library Selection & Setup - Must verify Vietnamese font support before choosing PDF library

---

### Pitfall 2: A4 Page Overflow Without Proper Pagination

**What goes wrong:**
Quotation data extends beyond a single A4 page (210mm × 297mm). Content gets cut off, headers repeat incorrectly, or tables split awkwardly across pages. Users get incomplete quotations.

**Why it happens:**
Developers test with small datasets and assume the content always fits on one page. They don't implement pagination logic, page breaks, or multi-page rendering. PDF libraries often don't auto-wrap content across pages.

**How to avoid:**
1. Calculate content height before rendering and check against page height
2. Implement automatic page break detection: `doc.internal.pageSize.height - currentY < minSpace`
3. Add page headers on each new page with `doc.addPage()` + header rendering
4. Use page break prevention for table rows: `doc.setPageBreakMode('avoid')`
5. Test with maximum realistic data (50+ items, long descriptions)

**Warning signs:**
- Bottom content is cut off in preview
- Only first page renders in multi-page documents
- Tables split mid-row across pages
- Page numbers or headers are missing on pages 2+
- PDF export fails silently with large datasets

**Phase to address:**
Phase 2: PDF Generation Core - Pagination must be built-in, not added as an afterthought

---

### Pitfall 3: Table Column Width Miscalculation on A4

**What goes wrong:**
Table columns are too wide for A4 paper, causing horizontal overflow. Columns get squished, text wraps awkwardly, or content extends beyond page margins. The PDF looks unprofessional and may be unreadable.

**Why it happens:**
Fixed pixel widths don't translate correctly to A4 dimensions (210mm). Developers use screen-based sizing instead of print dimensions. They forget about margins (typically 10-15mm per side). Total available width on A4 with 15mm margins is only ~180mm.

**How to avoid:**
1. Use percentage-based widths that sum to 100%
2. Subtract margins from total width before calculating column proportions
3. Set maximum width constraint: `maxWidth = 210mm - (leftMargin + rightMargin)`
4. Implement auto-fit algorithm that distributes remaining space proportionally
5. Test with varying content lengths (short/long product names, descriptions)

```typescript
// Correct approach for column width calculation
const PAGE_WIDTH = 210; // A4 width in mm
const MARGIN = 15; // mm
const AVAILABLE_WIDTH = PAGE_WIDTH - (MARGIN * 2); // 180mm

const columnRatios = [0.35, 0.25, 0.1, 0.1, 0.1, 0.1]; // Sum to 1.0
const columnWidths = columnRatios.map(r => r * AVAILABLE_WIDTH);
```

**Warning signs:**
- Last column extends beyond page edge in preview
- Text is cut off in table cells
- Horizontal scrollbar appears in PDF viewer
- Print preview shows "content clipped" warnings
- Columns are unevenly sized or squished

**Phase to address:**
Phase 2: PDF Generation Core - Column width calculation must be validated with real data

---

### Pitfall 4: Memory Exhaustion with Large PDFs

**What goes wrong:**
Browser tab crashes or freezes when generating PDFs with many items (50+ products, multiple images). Server-side generation times out or runs out of memory. Users get "Out of Memory" errors.

**Why it happens:**
PDF libraries accumulate document objects in memory without cleanup. Large images are stored as base64 strings, consuming excessive RAM. Client-side generation buffers entire PDF before download. No pagination or streaming is implemented.

**How to avoid:**
1. Optimize images before embedding (resize, compress, reduce quality)
2. Use streaming PDF generation if available (server-side)
3. Clean up temporary objects after each page generation
4. Implement lazy loading for images in client-side generation
5. Add progress indicators and timeout warnings
6. Consider server-side generation for large documents (> 50 items)

**Warning signs:**
- Browser tab freezes during export
- Chrome shows "Aw, Snap!" or kills the tab
- Memory usage spikes to > 1GB in DevTools
- Export times increase exponentially with item count
- Server logs show "JavaScript heap out of memory"

**Phase to address:**
Phase 3: Performance & Optimization - Test with max expected data size before shipping

---

### Pitfall 5: CORS Issues with Image URLs

**What goes wrong:**
Product images from Supabase Storage fail to load in PDF generation, resulting in broken images or missing images. PDF generation fails entirely with CORS errors. The existing Excel export handles images, but PDF export doesn't.

**Why it happens:**
PDF libraries fetch images via canvas or fetch() which enforces CORS. Supabase Storage URLs may not have proper CORS headers configured. Images loaded in browser context can't be drawn to canvas without CORS permission.

**How to avoid:**
1. Configure Supabase Storage bucket CORS headers to allow your domain
2. Pre-fetch and convert images to base64 before PDF generation
3. Handle failed image loads gracefully with fallback
4. Use server-side image fetching (bypasses CORS) when possible
5. Verify image loading works in development before deployment

```typescript
// Correct approach: Pre-fetch with CORS handling
async function fetchImageWithFallback(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Image fetch failed');
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
  } catch (error) {
    console.warn('Image fetch failed, skipping:', error);
    return null; // Fall back to no image
  }
}
```

**Warning signs:**
- Images appear as broken/missing icons in PDF
- Console shows CORS errors: "Access to fetch has been blocked"
- Export works in localhost but fails in production
- Image URLs return 403 or CORS errors in Network tab
- PDF generation fails at different points (random image URLs)

**Phase to address:**
Phase 1: Library Selection & Setup - Test image loading with Supabase URLs early

---

### Pitfall 6: Client vs Server Rendering Hydration Mismatch

**What goes wrong:**
PDF preview displays correctly but generated PDF is different. Server-side generated PDFs have missing content or different formatting. Browser shows hydration warnings in console. The PDF content doesn't match the screen preview.

**Why it happens:**
React components render differently on server vs client (browser APIs unavailable). Timestamps differ between renders (server vs client time zones). Random IDs or generated values differ. PDF library may only work client-side but code runs on server too.

**How to avoid:**
1. Use `'use client'` directive for PDF components that need browser APIs
2. Wrap PDF generation in `useEffect` to ensure client-side only execution
3. Use deterministic IDs instead of random values
4. Test PDF generation in both dev and production environments
5. Disable server-side rendering for PDF preview components: `{ ssr: false }`

```typescript
// Correct approach: Client-side only PDF generation
'use client';
import { useEffect, useState } from 'react';

export function PDFGenerator() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Only true on client
  }, []);

  if (!mounted) return <div>Loading...</div>;

  // PDF generation code here (client-side only)
  return <div>...</div>;
}
```

**Warning signs:**
- "Hydration failed" errors in console
- PDF preview differs from generated PDF
- Content appears/disappears on page load
- Different formatting between localhost and production
- React warnings about mismatched HTML

**Phase to address:**
Phase 2: PDF Generation Core - Must handle client/server rendering differences explicitly

---

### Pitfall 7: Header/Footer Positioning Drift

**What goes wrong:**
Company header (logo, name, date) appears at wrong position on page. Footer (creator, signature) overlaps with table content or appears off-page. Headers are missing on page 2+. Positioning varies between browsers.

**Why it happens:**
Fixed positioning (absolute coordinates) doesn't account for content height. Page breaks are calculated without considering header/footer reserved space. PDF libraries use different coordinate systems (top-left vs bottom-left origin). Margins are inconsistent.

**How to avoid:**
1. Reserve fixed space at top for headers (e.g., 40-50mm)
2. Reserve fixed space at bottom for footers (e.g., 30mm)
3. Recalculate header/footer position on each new page
4. Use relative positioning where library supports it
5. Test multi-page documents with varying content lengths
6. Define header/footer as reusable functions called on each page

```typescript
// Correct approach: Consistent header/footer positioning
const HEADER_HEIGHT = 45; // mm
const FOOTER_HEIGHT = 30; // mm

function addHeader(doc: jsPDF, pageNumber: number, totalPages: number) {
  doc.setFontSize(12);
  doc.text('iPOS.vn', MARGIN, 20);
  doc.text(`Trang ${pageNumber} / ${totalPages}`, AVAILABLE_WIDTH - MARGIN, 20);
}

function addFooter(doc: jsPDF) {
  const footerY = 297 - FOOTER_HEIGHT;
  doc.setFontSize(10);
  doc.text('Người tạo: ____________________', MARGIN, footerY);
  doc.text('Chữ ký: ____________________', AVAILABLE_WIDTH - MARGIN, footerY);
}
```

**Warning signs:**
- Header/footer position changes with content length
- Footer overlaps with last row of table
- Headers are missing on pages 2, 3, etc.
- Different appearance in different browsers
- Content extends beyond page edges

**Phase to address:**
Phase 2: PDF Generation Core - Header/footer logic must handle multi-page correctly

---

### Pitfall 8: Image Hiding Implementation Breaks Table Layout

**What goes wrong:**
When hiding the "Image" column for PDF export (as required by the project), the table layout breaks. Column widths don't redistribute properly. Spacing becomes uneven. The remaining columns don't align with the Excel export's column arrangement.

**Why it happens:**
Developers simply hide the column without recalculating widths for remaining columns. The hidden column's space is left empty instead of being redistributed. Excel template has fixed column widths that don't translate to PDF. Conditional rendering removes column but not its layout space.

**How to avoid:**
1. Create separate column width configuration for PDF (without image column)
2. Recalculate percentages: `newRatio = oldRatio / (1 - imageColumnRatio)`
3. Remove image column entirely from data structure before PDF rendering
4. Maintain column alignment between Excel and PDF for remaining columns
5. Test PDF with both Excel and PDF exports to verify consistency

```typescript
// Correct approach: Separate PDF column configuration
const EXCEL_COLUMNS = [
  { key: 'image', width: 40 },
  { key: 'name', width: 50 },
  { key: 'description', width: 50 },
  { key: 'unit', width: 12 },
  { key: 'quantity', width: 10 },
  { key: 'price', width: 15 },
  { key: 'total', width: 15 },
];

const PDF_COLUMNS = EXCEL_COLUMNS.filter(c => c.key !== 'image');
// Recalculate widths to fill A4 width
const totalWidth = PDF_COLUMNS.reduce((sum, c) => sum + c.width, 0);
const scaledColumns = PDF_COLUMNS.map(c => ({
  ...c,
  width: (c.width / totalWidth) * AVAILABLE_WIDTH
}));
```

**Warning signs:**
- Empty space where image column should be
- Remaining columns are too narrow or uneven
- PDF and Excel exports don't align visually
- Table doesn't span full width of page
- Column headers and data are misaligned

**Phase to address:**
Phase 2: PDF Generation Core - Column layout must be independently configurable

---

### Pitfall 9: Browser PDF Preview Inconsistencies

**What goes wrong:**
PDF preview looks correct in Chrome but wrong in Firefox/Safari. Some browsers show PDF inline, others force download. PDF rendering quality varies. Users report issues with specific browsers.

**Why it happens:**
Different browsers use different PDF rendering engines. Some browsers (Safari on iOS) have limited PDF.js support. PDF viewer implementations vary. Preview components may rely on browser-specific APIs.

**How to avoid:**
1. Test PDF preview in all target browsers (Chrome, Firefox, Safari, Edge)
2. Consider using pdfjs-dist for consistent cross-browser preview
3. Provide "Download" button as fallback for browsers with poor inline preview
4. Detect browser and adjust preview strategy accordingly
5. Document supported browsers and known limitations
6. Use PDF viewer libraries for consistent rendering (e.g., React-PDF)

**Warning signs:**
- PDF preview works in Chrome but not Firefox
- Different visual appearance between browsers
- "Download PDF" is forced in some browsers instead of preview
- Preview shows errors or fails to load
- Different page numbers or rendering quality

**Phase to address:**
Phase 3: Testing & Validation - Must test on multiple browsers before shipping

---

### Pitfall 10: API Route Security Vulnerabilities

**What goes wrong:**
PDF export API route allows unauthorized access. Anyone with the quotation ID can download PDFs without authentication. CORS headers are too permissive. Rate limiting is absent, enabling abuse.

**Why it happens:**
Developers focus on functionality and neglect security. API route lacks authentication middleware. No validation that user owns the quotation. Missing authorization checks allow data leakage.

**How to avoid:**
1. Require authentication token in API request headers
2. Validate user permissions against quotation ownership
3. Implement rate limiting to prevent abuse
4. Use strict CORS headers (whitelist allowed origins)
5. Validate request parameters (ID format, type checking)
6. Log PDF generation attempts for audit trail

```typescript
// Correct approach: Secure PDF export API route
export async function POST(request: NextRequest) {
  // 1. Authenticate
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await verifyToken(token);

  // 2. Validate ownership
  const quotation = await getQuotation(id);
  if (quotation.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 3. Rate limit
  const rateLimitKey = `pdf:${user.id}:${quotation.id}`;
  if (await isRateLimited(rateLimitKey)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // Generate PDF...
}
```

**Warning signs:**
- API endpoint works without authentication
- Any quotation ID returns a PDF
- CORS headers allow wildcard origins (`*`)
- No rate limiting (can spam API)
- Console warnings about missing security headers

**Phase to address:**
Phase 2: PDF Generation Core - Security must be implemented alongside functionality

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip font customization and use default fonts | Works for English text | Vietnamese text breaks completely, requires major rewrite | NEVER - Vietnamese is core requirement |
| Test only with small datasets (1-5 items) | Faster development | Fails in production with real data (50+ items) | Only for quick prototypes, not production |
| Hide image column by CSS `display: none` | Simple implementation | Layout breaks, column widths don't redistribute | NEVER - breaks print layout |
| Use inline PDF generation on client-side | No API route needed | Slower, hits CORS issues, browser-dependent | Only for small PDFs, single-user apps |
| Skip pagination and assume single-page PDF | Simpler code | Fails with realistic quotation sizes | Only during early exploration |
| Hardcode A4 dimensions as pixels | Quick implementation | Inconsistent across printers/viewers | NEVER - A4 must use mm units |
| Ignore browser compatibility | Works in Chrome | Fails for Safari/Firefox users | Only if targeting Chrome-only environments |
| Skip API authentication | Easier testing | Security vulnerability, unauthorized access | NEVER - even in development |
| Use browser's native PDF viewer | No additional library | Inconsistent rendering across browsers | Only if consistent cross-browser rendering verified |
| Load full image data for every export | Simple implementation | Memory issues with many images | Only for single-image exports |

---

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| **Supabase Storage Images** | Fetching images client-side without CORS config, causing broken images in PDF | Pre-fetch images server-side or configure Supabase CORS headers; handle failed loads with graceful fallback |
| **jsPDF Custom Fonts** | Using external font URLs that may fail to load; not embedding base64 font data | Embed fonts as base64 strings directly in code; use font subset to reduce size |
| **Next.js API Routes** | Not handling GET/POST methods correctly for browser compatibility; missing CORS headers | Support both GET and POST; implement proper OPTIONS handler for preflight |
| **Excel Template Loading** | Hardcoding template path that fails in production; not validating template exists | Use environment-relative paths; validate template loads on startup; provide fallback |
| **PDF Preview Components** | Server-side rendering components that use browser-only APIs | Use `'use client'` directive; wrap in useEffect; disable SSR for preview components |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| **Client-side PDF generation with images** | Browser tab freezes; memory spikes; exports take 30+ seconds | Move generation to server-side for large PDFs; optimize images; implement streaming | > 10 items with images or > 20 items total |
| **In-memory PDF buffering** | Server memory exhaustion; timeout errors; OOM crashes | Use streaming PDF generation; clean up objects; implement pagination | Quotations > 50 items or > 5MB PDF size |
| **Unoptimized image storage** | Slow fetch times; high bandwidth usage; failed PDF generation | Resize images to max 200px for PDF; use WebP format; cache fetched images | > 5 product images per quotation |
| **Synchronous image loading** | UI freezes; poor UX; export appears stalled | Use parallel fetch with Promise.all; show progress indicators; implement timeouts | > 3 images or slow network connections |
| **Repeated font loading** | Slower initial load; unnecessary network requests | Load fonts once at module level; cache base64 font strings | Every export operation |
| **No caching of generated PDFs** | Re-generation for same quotation; wasted compute; slower UX | Cache generated PDFs with TTL; reuse for re-downloads | Users downloading same quotation multiple times |

---

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| **Missing authentication on PDF export API** | Anyone can download any quotation (data leak) | Require JWT token; validate user ownership of quotation |
| **Permissive CORS headers (`*`)** | Cross-site scripting attacks; unauthorized API access | Whitelist allowed origins; validate origin header |
| **No rate limiting on PDF generation** | DoS attacks; resource exhaustion; cost spikes | Implement rate limiting per user; use Redis/in-memory cache |
| **Trusting user-provided quotation IDs** | IDor (Insecure Direct Object Reference) attacks | Validate ID format; check ownership before generating |
| **Exposing Supabase URLs in PDF** | Storage URLs may contain sensitive metadata | Use signed URLs with expiration; validate image URLs |
| **No logging of PDF exports** | Cannot detect abuse; audit trail missing | Log export attempts with user ID, timestamp, quotation ID |
| **Missing input validation** | PDF injection attacks; malformed PDF generation | Validate all input data; sanitize text content; validate numeric ranges |

---

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| **No progress indicator during export** | User doesn't know if export is working; clicks multiple times | Show loading spinner with "Generating PDF..." message; disable button during generation |
| **PDF filename not descriptive** | Hard to find downloaded file; confusing when multiple exports | Use format: `BaoGia_{quote_number}_{date}.pdf` |
| **No preview before download** | User exports wrong document; wasted time | Show preview modal with "Confirm and Download" button |
| **Silent failure of image loading** | User exports PDF with missing images; looks unprofessional | Warn user about failed images; allow retry or export without images |
| **No error handling for large PDFs** | Export fails without explanation; user frustration | Detect large datasets; warn user about expected time; provide alternative (server-side) |
| **Different layouts for Excel vs PDF** | User expects consistency; confusion about format | Align column structure and content between Excel and PDF; document differences |
| **No indication of multi-page PDF** | User doesn't know content continues; may miss information | Add page numbers; show "Page X of Y" in footer |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Vietnamese font support**: Often tested only with ASCII characters — verify full Vietnamese character set works
- [ ] **Multi-page PDF**: Often tested with 1-5 items — verify pagination works with 50+ items
- [ ] **Image hiding**: Often hidden via CSS but layout breaks — verify column widths redistribute correctly
- [ ] **Header/footer consistency**: Often works on page 1 only — verify headers/footers on all pages
- [ ] **Cross-browser preview**: Often tested only in Chrome — verify works in Firefox, Safari, Edge
- [ ] **API authentication**: Often works with logged-in user — verify fails without auth
- [ ] **CORS image loading**: Often works locally with Supabase — verify fails in production without proper CORS config
- [ ] **Memory usage**: Often tested with small datasets — verify doesn't crash with realistic data
- [ ] **Column width calculation**: Often tested with short text — verify doesn't break with long product names/descriptions
- [ ] **Error handling**: Often tested with happy path only — verify graceful degradation on failures
- [ ] **Rate limiting**: Often not implemented — verify API can't be abused
- [ ] **Download filename**: Often uses generic name — verify includes quote number and date

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| **Vietnamese encoding broken** | HIGH | 1. Embed proper Unicode font with base64; 2. Update all text rendering code to use custom font; 3. Regenerate all affected PDFs; 4. Add font loading tests |
| **Multi-page content cut off** | MEDIUM | 1. Implement page break detection; 2. Add header/footer on each page; 3. Redistribute content across pages; 4. Add pagination tests |
| **Column width overflow** | MEDIUM | 1. Calculate total width and adjust column ratios; 2. Implement auto-fit algorithm; 3. Add margin calculations; 4. Test with max content length |
| **Memory exhaustion** | HIGH | 1. Move generation to server-side; 2. Implement image optimization; 3. Add streaming/chunking; 4. Add memory monitoring |
| **CORS image failures** | MEDIUM | 1. Configure Supabase CORS headers; 2. Pre-fetch images server-side; 3. Add fallback for failed images; 4. Test with production URLs |
| **Hydration mismatch** | LOW | 1. Add `'use client'` directive; 2. Wrap in useEffect; 3. Disable SSR for preview; 4. Test in both dev and prod |
| **Header/footer positioning** | LOW | 1. Define fixed header/footer heights; 2. Recalculate on each page; 3. Add spacing calculations; 4. Test multi-page docs |
| **Image hiding breaks layout** | LOW | 1. Create separate PDF column config; 2. Recalculate widths; 3. Remove image data before rendering; 4. Test layout alignment |
| **Browser preview issues** | MEDIUM | 1. Implement pdfjs-dist for consistent preview; 2. Add download fallback; 3. Test all target browsers; 4. Document limitations |
| **API security holes** | HIGH | 1. Add authentication middleware; 2. Validate ownership; 3. Implement rate limiting; 4. Add logging; 5. Audit all API routes |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Vietnamese character encoding issues | Phase 1: Library Selection & Setup | Test full Vietnamese character set works; verify fonts load correctly |
| A4 page overflow | Phase 2: PDF Generation Core | Test with 50+ items; verify pagination; check all content renders |
| Table column width miscalculation | Phase 2: PDF Generation Core | Test with max text length; verify no overflow; check alignment |
| Memory exhaustion | Phase 3: Performance & Optimization | Test with large datasets; monitor memory usage; implement timeouts |
| CORS issues with image URLs | Phase 1: Library Selection & Setup | Test with Supabase URLs; verify production CORS config; handle failures |
| Client vs server rendering mismatch | Phase 2: PDF Generation Core | Test both dev and production; verify hydration; disable SSR where needed |
| Header/footer positioning drift | Phase 2: PDF Generation Core | Test multi-page documents; verify consistency; check positioning |
| Image hiding breaks table layout | Phase 2: PDF Generation Core | Test with and without images; verify column widths; check alignment |
| Browser PDF preview inconsistencies | Phase 3: Testing & Validation | Test Chrome, Firefox, Safari, Edge; verify consistent rendering |
| API route security vulnerabilities | Phase 2: PDF Generation Core | Test unauthorized access; verify auth; check rate limiting |

---

## Sources

**Sources Note:** Web search services experienced rate limiting during research. Findings are based on:
1. **Codebase Analysis** - Existing Excel export implementation in `/home/tuong/Personal_project/menu-extractor/libs/quotation-generator.ts`
2. **Known Issues** - Documented patterns from PDF library communities (jsPDF, react-pdf)
3. **Common Patterns** - Standard issues reported in Next.js + PDF generation scenarios
4. **Domain Knowledge** - Vietnamese language support requirements specific to this project

**Recommended Additional Research (when web search available):**
- jsPDF GitHub issues for Unicode/Vietnamese font support
- react-pdf documentation on custom fonts and Unicode
- Next.js API route security best practices
- Supabase Storage CORS configuration
- Cross-browser PDF rendering compatibility studies

---
*Pitfalls research for: PDF Export for Next.js Quotation System*
*Researched: 2026-03-20*
