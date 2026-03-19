# Codebase Concerns

**Analysis Date:** 2026-03-19

## Security Considerations

**API Keys in Client Code:**
- `check-db.js` contains hardcoded Supabase credentials
- Risk: Database exposure if committed
- Files: `check-db.js`
- Current mitigation: File exists but is not committed (git status shows -rw-------)
- Recommendations: Move to environment variables or remove entirely

**Missing Input Validation:**
- Several API endpoints lack comprehensive validation
- Files: `app/api/products/route.ts`, `app/api/extract/route.ts`
- Risk: Malicious input could cause database errors
- Recommendations: Implement schema validation using Zod or similar

**Environment Variables:**
- `.env` file present - contains environment configuration
- Risk: Potential exposure if accidentally committed
- Recommendations: Add to .gitignore and ensure proper CI/CD secrets management

## Performance Bottlenecks

**Large API Response:**
- `libs/quotation-generator.ts` (958 lines) handles complex Excel generation
- Issue: Large file size and complex template processing
- Impact: Potential memory usage and slow exports
- Improvement path: Split into smaller modules, implement caching

**Database Query Optimization:**
- `app/api/products/route.ts` performs multiple round trips for subproduct counts
- Issue: N+1 query problem when fetching products with counts
- Impact: Slow performance with large datasets
- Improvement path: Use JOIN queries or batch operations

**Image Processing:**
- No image optimization or resizing before upload
- Files: `libs/image-storage.ts`
- Impact: Large storage consumption and slow load times
- Improvement path: Implement automatic image compression

## Tech Debt

**TODO Comments in Production Code:**
- Vietnamese TODO comments in export endpoints
- Files: `app/api/category-export/route.ts`, `app/api/export/route.ts`
- Issue: Line 43: "TODO: Neu co loi, hay xem o day, minh vua sua code"
- Impact: Incomplete documentation and maintenance confusion
- Fix approach: Replace with proper comments or issue tickets

**Duplicate Export Logic:**
- Two nearly identical export routes with same validation and response structure
- Files: `app/api/category-export/route.ts`, `app/api/export/route.ts`
- Impact: Code duplication, maintenance overhead
- Fix approach: Create shared export utility function

**Missing TypeScript Types:**
- Incomplete type definitions in some components
- Files: `libs/quotation-generator.ts` uses any types (line 94, 194, 211)
- Impact: Type safety lost, potential runtime errors
- Fix approach: Create proper interfaces and refactor to use generics

**Large Component Files:**
- Several components over 300 lines
- Files: `components/product/ProductList.tsx` (392 lines), `components/page-component/MenuEditScreen.tsx` (360 lines)
- Impact: Difficult to maintain and test
- Fix approach: Split into smaller, focused components

## Fragile Areas

**Database Schema Dependencies:**
- Code assumes table existence with runtime checks
- Files: `app/api/products/route.ts` (lines 23-31, 212-221)
- Why fragile: Will fail if tables don't exist
- Safe modification: Add proper database schema migrations and factories

**File Path Dependencies:**
- Hardcoded template path in Excel generation
- Files: `libs/quotation-generator.ts` (line 84-89)
- Why fragile: Will break if template file is moved or deleted
- Safe modification: Use configuration for template paths

**Gemini API Integration:**
- Direct API dependency without retry logic
- Files: `libs/gemini-client.ts`
- Why fragile: Single point of failure
- Safe modification: Add retry mechanism and fallback options

## Scaling Limits

**Memory Usage:**
- Excel generation loads entire template into memory
- Files: `libs/quotation-generator.ts`
- Current capacity: Limited by available memory
- Scaling path: Implement streaming or chunk-based processing

**File Upload Size:**
- 5MB limit on image uploads (reasonable but may need adjustment)
- Files: `libs/image-storage.ts`
- Limit: 5MB per file
- Scaling path: Implement chunked uploads for larger files

**Concurrent Requests:**
- No rate limiting on API endpoints
- Files: All API routes
- Impact: Potential abuse or resource exhaustion
- Scaling path: Implement rate limiting and queuing

## Error Handling Gaps

**Inconsistent Error Responses:**
- Different error formats across endpoints
- Files: Multiple API routes
- Risk: Client applications break with inconsistent responses
- Fix approach: Standardize error response format

**Missing Error Logging:**
- Console.log statements in production code
- Files: Multiple files contain console.log statements
- Risk: Performance impact and sensitive data exposure
- Fix approach: Implement proper logging library with levels

**Unhandled Promise Rejections:**
- Some async operations lack proper error handling
- Files: `libs/image-storage.ts`, `libs/gemini-client.ts`
- Risk: Silent failures and memory leaks
- Fix approach: Add comprehensive error handling and monitoring

## Testing Coverage Gaps

**Unit Tests:**
- No test files found in codebase
- What's not tested: Business logic, validation, API endpoints
- Files: All core modules
- Risk: Breaking changes undetected
- Priority: High - Critical business logic needs testing

**Integration Tests:**
- No integration tests for database operations
- What's not tested: API endpoints, database interactions
- Files: API routes, database utilities
- Risk: Database schema changes break functionality
- Priority: Medium - Important for data integrity

**E2E Tests:**
- Playwright configured but no tests present
- Framework: Playwright
- What's not tested: User workflows, export functionality
- Risk: UI changes break user experience
- Priority: Medium - User-facing features

---

*Concerns audit: 2026-03-19*
