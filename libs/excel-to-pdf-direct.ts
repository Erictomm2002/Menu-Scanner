import * as libre from 'libreoffice-convert';
import { promisify } from 'util';

// Promisify the convert function for async/await
const convertAsync = promisify(libre.convert);

/**
 * Convert Excel buffer to PDF buffer using LibreOffice.
 * This provides direct Excel-to-PDF conversion that preserves exact
 * formatting, borders, colors, fonts, merged cells, and images.
 *
 * @param excelBuffer - The Excel file buffer (XLSX format)
 * @returns Promise<Buffer> - The converted PDF buffer
 * @throws Error if LibreOffice is not installed or conversion fails
 */
export async function excelBufferToPdfDirect(
  excelBuffer: Buffer | Uint8Array
): Promise<Buffer> {
  try {
    // Convert to Buffer if it's a Uint8Array
    const buffer = Buffer.isBuffer(excelBuffer)
      ? excelBuffer
      : Buffer.from(excelBuffer);

    // Convert Excel to PDF using LibreOffice
    // The third parameter is the filter (undefined = default)
    const pdfBuffer = await convertAsync(buffer, 'pdf', undefined);

    return pdfBuffer;
  } catch (error) {
    const err = error as Error;

    // Check if LibreOffice is not found
    if (err.message?.includes('spawn') || err.message?.includes('soffice') || err.message?.includes('ENONENT')) {
      throw new Error('LibreOffice not installed. Please install LibreOffice on the server using: sudo apt-get install libreoffice');
    }

    throw new Error(`Failed to convert Excel to PDF: ${err.message}`);
  }
}

/**
 * Check if LibreOffice is available on the system.
 *
 * @returns Promise<boolean> - True if LibreOffice is available, false otherwise
 */
export async function checkLibreOfficeAvailable(): Promise<boolean> {
  try {
    // Try to convert an empty buffer
    await convertAsync(Buffer.alloc(0), 'pdf', undefined);
    return true;
  } catch (error) {
    const err = error as Error;
    // If error mentions soffice or spawn, LibreOffice is not installed
    if (err.message?.includes('spawn') || err.message?.includes('soffice') || err.message?.includes('ENONENT')) {
      return false;
    }
    // Other errors might still mean LibreOffice is available but failed for some other reason
    return true;
  }
}

/**
 * Convert Excel buffer to PDF with custom options.
 *
 * @param excelBuffer - The Excel file buffer (XLSX format)
 * @param options - Optional conversion options
 * @returns Promise<Buffer> - The converted PDF buffer
 */
export interface ConversionOptions {
  /** Temporary directory for conversion files */
  tmpDir?: string;
  /** Timeout in milliseconds for conversion */
  timeout?: number;
  /** Custom LibreOffice binary path */
  sofficeBinaryPaths?: string[];
}

export async function excelBufferToPdfWithOptions(
  excelBuffer: Buffer | Uint8Array,
  options?: ConversionOptions
): Promise<Buffer> {
  try {
    const buffer = Buffer.isBuffer(excelBuffer)
      ? excelBuffer
      : Buffer.from(excelBuffer);

    const convertOptions = options ? {
      tmpDir: options.tmpDir,
      asyncOptions: options.timeout ? {
        times: 1,
        timeout: options.timeout,
      } : undefined,
      sofficeBinaryPaths: options.sofficeBinaryPaths,
    } : undefined;

    // Convert using the promisified version
    const pdfBuffer = await convertAsync(buffer, 'pdf', undefined);
    return pdfBuffer;
  } catch (error) {
    const err = error as Error;

    if (err.message?.includes('spawn') || err.message?.includes('soffice')) {
      throw new Error('LibreOffice not installed. Please install LibreOffice on the server.');
    }

    throw new Error(`Failed to convert Excel to PDF: ${err.message}`);
  }
}
