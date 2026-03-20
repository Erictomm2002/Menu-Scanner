import { writeFileSync } from 'fs';
import { join } from 'path';
import { generateQuotationPDF } from '../libs/quotation-pdf-generator';
import largeSample from './fixtures/quotation-large-sample.json';

// Types for the JSON import
interface QuotationData {
  quote_number: string;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_model?: string;
  notes?: string;
  subtotal_software: number;
  subtotal_hardware: number;
  discount_amount: number;
  total_amount: number;
  status: string;
  items: any[];
}

async function testMultipagePDF() {
  console.log('Starting multi-page PDF generation test...');
  console.log(`Sample data: ${largeSample.items.length} items`);

  try {
    const pdf = await generateQuotationPDF(
      largeSample as any,
      largeSample.items
    );

    const outputPath = join(process.cwd(), 'test-output.pdf');
    writeFileSync(outputPath, pdf);

    const sizeKB = Math.round(pdf.length / 1024);
    console.log(`PDF generated successfully: ${outputPath}`);
    console.log(`File size: ${sizeKB} KB`);
    console.log(`Expected pages: ~${Math.ceil(largeSample.items.length / 15)} pages`);
    console.log('\nOpen test-output.pdf to verify:');
    console.log('- Header appears on every page');
    console.log('- Footer appears on every page with correct page numbers');
    console.log('- Column widths are consistent across pages');
    console.log('- No table rows are broken mid-row');
  } catch (error) {
    console.error('Error generating PDF:', error);
    process.exit(1);
  }
}

testMultipagePDF();
