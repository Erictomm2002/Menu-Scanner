import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer';
import { ROBOTO_FONT_FAMILY } from './fonts';
import { Quotation, QuotationItem, ProductCategory } from '@/types/quotation';

// Helper function to determine if an item is software
function isSoftwareItem(item: QuotationItem): boolean {
  return item.product_category === ProductCategory.SOFTWARE;
}

// Helper function to format Vietnamese currency
function formatCurrency(amount: number): string {
  return amount.toLocaleString('vi-VN');
}

// Helper function to format date in Vietnamese
function formatDate(date: Date): string {
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// Component styles
const styles = StyleSheet.create({
  page: {
    fontFamily: ROBOTO_FONT_FAMILY,
    fontSize: 10,
    padding: '15mm',
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerRow: {
    marginBottom: 3,
  },
  footer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#000',
    fontSize: 10,
  },
  footerRow: {
    marginBottom: 5,
  },
  footerLeft: {
    width: '50%',
  },
  footerRight: {
    width: '50%',
    textAlign: 'right',
  },
  categoryHeader: {
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 5,
  },
  table: {
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 4,
  },
  tableHeader: {
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
  },
  colName: {
    width: '35%',
    paddingRight: 5,
  },
  colDescription: {
    width: '35%',
    paddingRight: 5,
  },
  colUnit: {
    width: '10%',
    paddingRight: 5,
  },
  colQuantity: {
    width: '10%',
    paddingRight: 5,
  },
  colPrice: {
    width: '10%',
    paddingRight: 5,
  },
  colTotal: {
    width: '10%',
  },
  subproductRow: {
    paddingLeft: 10,
  },
});

// Header component with fixed positioning for multi-page repetition
function Header({ quotation }: { quotation: Quotation }) {
  return (
    <View style={styles.header} fixed>
      <Text style={styles.headerTitle}>
        BAO GIA #{quotation.quote_number}
      </Text>
      {quotation.customer_name && (
        <Text style={styles.headerRow}>
          Khach hang: {quotation.customer_name}
        </Text>
      )}
      {quotation.customer_phone && (
        <Text style={styles.headerRow}>SĐT: {quotation.customer_phone}</Text>
      )}
      <Text style={styles.headerRow}>
        Ngay: {formatDate(new Date())}
      </Text>
    </View>
  );
}

// Footer component with fixed positioning for multi-page repetition
function Footer() {
  return (
    <View style={styles.footer} fixed>
      <View style={styles.footerRow}>
        <View style={styles.footerLeft}>
          <Text>Nguoi tao: ___________________</Text>
        </View>
        <View style={styles.footerRight}>
          <Text>Chu ky: ___________________</Text>
        </View>
      </View>
      <Text
        style={styles.footerRight}
        render={({ pageNumber, totalPages }) =>
          `Trang ${pageNumber} / ${totalPages}`
        }
      />
    </View>
  );
}

// Table header row component
function TableHeader() {
  return (
    <View style={[styles.tableRow, styles.tableHeader]}>
      <Text style={styles.colName}>Ten san pham</Text>
      <Text style={styles.colDescription}>Mo ta</Text>
      <Text style={styles.colUnit}>Don vi</Text>
      <Text style={styles.colQuantity}>SL</Text>
      <Text style={styles.colPrice}>Don gia</Text>
      <Text style={styles.colTotal}>Thanh tien</Text>
    </View>
  );
}

// Product row component
function ProductRow({ item }: { item: QuotationItem }) {
  return (
    <View
      style={[
        styles.tableRow,
        item.is_subproduct ? styles.subproductRow : null,
      ]}
    >
      <Text style={styles.colName}>{item.name}</Text>
      <Text style={styles.colDescription}>{item.description || ''}</Text>
      <Text style={styles.colUnit}>{item.unit}</Text>
      <Text style={styles.colQuantity}>{formatCurrency(item.quantity)}</Text>
      <Text style={styles.colPrice}>
        {item.is_free || item.unit_price === 0
          ? 'Mien phi'
          : formatCurrency(item.unit_price)}
      </Text>
      <Text style={styles.colTotal}>
        {item.is_free || item.unit_price === 0
          ? 'Mien phi'
          : formatCurrency(item.total_price)}
      </Text>
    </View>
  );
}

// Category section component
function CategorySection({
  title,
  items,
}: {
  title: string;
  items: QuotationItem[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <Text style={styles.categoryHeader}>{title}</Text>
      <View style={styles.table}>
        <TableHeader />
        {items.map((item) => (
          <ProductRow key={item.id || item.name} item={item} />
        ))}
      </View>
    </>
  );
}

// Main PDF document component
export function QuotationPDFDocument({
  quotation,
  items,
}: {
  quotation: Quotation;
  items: QuotationItem[];
}) {
  // Filter out subproducts from parent arrays
  const parentItems = items.filter((item) => !item.is_subproduct);

  // Group by category
  const softwareItems = parentItems.filter(isSoftwareItem);
  const hardwareItems = parentItems.filter((item) => !isSoftwareItem(item));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header quotation={quotation} />

        <CategorySection title="A. PHẦN MỀM" items={softwareItems} />
        <CategorySection title="B. PHẦN CỨNG" items={hardwareItems} />

        <Footer />
      </Page>
    </Document>
  );
}

// Server-side PDF generation function
export async function generateQuotationPDF(
  quotation: Quotation,
  items: QuotationItem[]
): Promise<Buffer> {
  const pdf = await renderToBuffer(
    <QuotationPDFDocument quotation={quotation} items={items} />
  );
  return pdf;
}
