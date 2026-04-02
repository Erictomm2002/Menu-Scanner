import ExcelJS from "exceljs";
import type { Quotation, QuotationItem } from "@/types/quotation";
import { readFileSync } from "fs";
import { join } from "path";
import { parseDescriptionForExcel } from "./markdown-to-excel";

const TEMPLATE_MAPPING = {
  customerName: "B13",
  customerPhone: "B14",
  customerModel: "B15",
  customerAddress: "B16",
  tableStart: 20,
  dataStartRow: 20,
};

const FONT_STYLES = {
  HEADER: { name: "Arial", size: 14, bold: true },
  SUBHEADER: { name: "Arial", size: 12, bold: true },
  BODY: { name: "Arial", size: 12 },
  DESCRIPTION: { name: "Arial", size: 11 },
  NUMBER: { name: "Arial", size: 11 },
  SMALL: { name: "Arial", size: 10 },
  SUBPRODUCT: { name: "Arial", size: 11 },
  FREE: { name: "Arial", size: 11, color: { argb: "FFED7D31" } },
  DISCOUNT: { name: "Arial", size: 11, color: { argb: "FFEF4444" } },
  PRODUCT_NAME: { name: "Arial", size: 12, bold: true },
  CATEGORY_HEADER: { name: "Arial", size: 12, bold: true },
  SUMMARY_LABEL: { name: "Arial", size: 12, bold: true },
  SUMMARY_SW_VALUE: {
    name: "Arial",
    size: 12,
    bold: true,
    color: { argb: "FFFF6600" },
  },
  SUMMARY_HW_VALUE: {
    name: "Arial",
    size: 11,
    bold: true,
    color: { argb: "FF0070C0" },
  },
  TOTAL_LABEL: { name: "Arial", size: 11, bold: true },
  TOTAL_VALUE: {
    name: "Arial",
    size: 11,
    bold: true,
    color: { argb: "FF0070C0" },
  },
} as const;

// Template category fill: theme blue tint ~0.8 approximation
const CATEGORY_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFB4C6E7" },
};

// Column widths adjusted for A4 format
// A4 width: 210mm, usable: ~190mm after margins
// Using character widths that fit within A4 (approx 7.2px per char in Arial 11pt)
const COLUMN_WIDTHS = [
  { width: 25 }, // Product name (image) - reduced from 40
  { width: 35 }, // Description - reduced from 50
  { width: 15 }, // Unit - increased from 12
  { width: 10 }, // Quantity
  { width: 12 }, // Unit price
  { width: 12 }, // Total
];

// PDF-specific column widths (narrower for A4)
const PDF_COLUMN_WIDTHS = [
  { width: 22 }, // Product name - compact for PDF
  { width: 45 }, // Description - compact for PDF
  { width: 15 }, // Unit - increased from 12
  { width: 10 }, // Quantity
  { width: 15 }, // Unit price
  { width: 15 }, // Total
];

const IMAGE_PATTERN = /\[Image\s*#\d+\]/gi;

function cleanDescription(text: string | null | undefined): string {
  if (!text) return "";
  return text.replace(IMAGE_PATTERN, "").trim();
}

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin" },
  left: { style: "thin" },
  bottom: { style: "thin" },
  right: { style: "thin" },
};

export async function generateQuotationExcel(
  quotation: Quotation,
  items: QuotationItem[],
): Promise<Uint8Array> {
  const templatePath = join(
    process.cwd(),
    "public",
    "templates",
    "quotation-template.xlsx",
  );
  const fileBuffer = Buffer.from(readFileSync(templatePath)) as Buffer;

  const workbook = new ExcelJS.Workbook();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await workbook.xlsx.load(fileBuffer as any);

  const sheetName = "Gói 01 năm Fabi + full thiết bị";
  const worksheet = workbook.getWorksheet(sheetName) || workbook.worksheets[0];

  if (!worksheet) {
    throw new Error("Worksheet not found in template");
  }

  // Remove all sheets except the first one (the one being modified)
  while (workbook.worksheets.length > 1) {
    const lastSheet = workbook.worksheets[workbook.worksheets.length - 1];
    workbook.removeWorksheet(lastSheet.id);
  }

  worksheet.columns = COLUMN_WIDTHS;

  // Force all cells to use Arial font to ensure consistency
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      if (cell.font) {
        cell.font = { ...cell.font, name: "Arial" };
      }
    });
  });

  // Remove product images from template but KEEP the logo (first image)
  removeTemplateProductImages(worksheet);

  // Clear ALL template data from dataStartRow to the end of the sheet
  clearAllTemplateData(worksheet, TEMPLATE_MAPPING.dataStartRow);

  // Fill customer info
  if (quotation.customer_name) {
    const cell = worksheet.getCell(TEMPLATE_MAPPING.customerName);
    cell.value = quotation.customer_name;
    cell.font = { ...FONT_STYLES.BODY };
  }
  if (quotation.customer_phone) {
    const cell = worksheet.getCell(TEMPLATE_MAPPING.customerPhone);
    cell.value = quotation.customer_phone;
    cell.font = { ...FONT_STYLES.BODY };
  }
  if (quotation.customer_model) {
    const cell = worksheet.getCell(TEMPLATE_MAPPING.customerModel);
    cell.value = quotation.customer_model;
    cell.font = { ...FONT_STYLES.BODY };
  }
  if (quotation.customer_address) {
    const cell = worksheet.getCell(TEMPLATE_MAPPING.customerAddress);
    cell.value = quotation.customer_address;
    cell.font = { ...FONT_STYLES.BODY };
  }

  // Helper: get subproducts for a specific parent item from the original items array
  const getSubproductsForParent = (
    parentProductId: string,
  ): QuotationItem[] => {
    const subproduct = items.filter(
      (item) => item.is_subproduct && item.parent_item_id == parentProductId,
    );
    return subproduct;
  };

  // Helper: get all items (parent + subproducts) for a parent
  const getItemWithSubproducts = (
    parentItem: QuotationItem,
  ): QuotationItem[] => {
    const subproducts = getSubproductsForParent(parentItem.product_id ?? "");
    return [parentItem, ...subproducts];
  };

  // Categorize items - exclude subproducts from the parent arrays
  const softwareItems = items.filter(
    (item) => isSoftwareItem(item) && !item.is_subproduct,
  );
  const hardwareItems = items.filter(
    (item) => !isSoftwareItem(item) && !item.is_subproduct,
  );

  let currentRow = TEMPLATE_MAPPING.dataStartRow;

  // Calculate category totals
  const calculateCategoryTotal = (parentItems: QuotationItem[]) =>
    parentItems.reduce((sum, parentItem) => {
      const group = getItemWithSubproducts(parentItem);
      return (
        sum +
        group.reduce(
          (itemSum, item) => itemSum + (item.is_free ? 0 : item.total_price),
          0,
        )
      );
    }, 0);

  const softwareTotal = calculateCategoryTotal(softwareItems);
  const hardwareTotal = calculateCategoryTotal(hardwareItems);

  // ---------- A. PHẦN MỀM ----------
  if (softwareItems.length > 0) {
    currentRow = addCategoryHeader(worksheet, currentRow, "A. PHẦN MỀM");
    for (const item of softwareItems) {
      const originalIndex = items.indexOf(item);
      currentRow = await fillProductRowWithSubproducts(
        worksheet,
        currentRow,
        item,
        items,
        originalIndex,
        workbook,
        getSubproductsForParent,
      );
    }
    // Add software total row immediately after software items (before hardware category)
    if (softwareTotal > 0) {
      currentRow = addSoftwareTotalRow(worksheet, currentRow, softwareTotal);
    }
  }

  // ---------- B. PHẦN CỨNG ----------
  if (hardwareItems.length > 0) {
    currentRow = addCategoryHeader(worksheet, currentRow, "B. PHẦN CỨNG");
    for (const item of hardwareItems) {
      const originalIndex = items.indexOf(item);
      currentRow = await fillProductRowWithSubproducts(
        worksheet,
        currentRow,
        item,
        items,
        originalIndex,
        workbook,
        getSubproductsForParent,
      );
    }
    // Add hardware total row immediately after hardware items
    if (hardwareTotal > 0) {
      currentRow = addHardwareTotalRow(worksheet, currentRow, hardwareTotal);
    }
  }

  // ---------- Summary rows ----------
  currentRow = addSummarySection(
    worksheet,
    currentRow,
    items,
    softwareItems,
    hardwareItems,
    quotation,
    softwareTotal,
    hardwareTotal,
  );

  // ---------- Footer Notes ----------
  currentRow = addFooterNotes(worksheet, currentRow);

  // ---------- Custom Notes (if provided) ----------
  if (quotation.notes && quotation.notes.trim()) {
    currentRow++;
    const notesCell = worksheet.getCell(`A${currentRow}`);
    notesCell.value = `Ghi chú bổ sung: ${quotation.notes}`;
    notesCell.font = { ...FONT_STYLES.BODY, italic: true };
    notesCell.alignment = {
      horizontal: "left",
      vertical: "top",
      wrapText: true,
    };
    notesCell.border = THIN_BORDER;

    // Clear cells B-F and add borders
    for (let col = 2; col <= 6; col++) {
      const cell = worksheet.getCell(currentRow, col);
      cell.value = null;
      cell.border = THIN_BORDER;
    }
    const notesRow = worksheet.getRow(currentRow);
    notesRow.height = 40;
  }

  return new Uint8Array(await workbook.xlsx.writeBuffer());
}

/**
 * Generate quotation Excel specifically for PDF export.
 * This version excludes product images and uses narrower column widths for A4 format.
 */
export async function generateQuotationExcelPdf(
  quotation: Quotation,
  items: QuotationItem[],
): Promise<Uint8Array> {
  const templatePath = join(
    process.cwd(),
    "public",
    "templates",
    "quotation-template.xlsx",
  );
  const fileBuffer = Buffer.from(readFileSync(templatePath)) as Buffer;

  const workbook = new ExcelJS.Workbook();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await workbook.xlsx.load(fileBuffer as any);

  const sheetName = "Gói 01 năm Fabi + full thiết bị";
  const worksheet = workbook.getWorksheet(sheetName) || workbook.worksheets[0];

  if (!worksheet) {
    throw new Error("Worksheet not found in template");
  }

  // Remove all sheets except the first one (the one being modified)
  while (workbook.worksheets.length > 1) {
    const lastSheet = workbook.worksheets[workbook.worksheets.length - 1];
    workbook.removeWorksheet(lastSheet.id);
  }

  // Use PDF-specific (narrower) column widths for A4 format
  worksheet.columns = PDF_COLUMN_WIDTHS;

  // Force all cells to use Arial font to ensure consistency
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      if (cell.font) {
        cell.font = { ...cell.font, name: "Arial" };
      }
    });
  });

  // Explicit page setup to ensure PDF renders full width regardless of LibreOffice version
  // This fixes the dev vs production difference where Railway's LibreOffice renders differently
  worksheet.pageSetup = {
    paperSize: 9, // A4 = 9 in ExcelJS
    orientation: 'portrait',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: {
      left: 0.75,
      right: 0.75,
      top: 0.5,
      bottom: 0.5,
      header: 0.3,
      footer: 0.3,
    },
  };

  // Remove product images from template but KEEP the logo (first image)
  removeTemplateProductImages(worksheet);

  // Clear ALL template data from dataStartRow to the end of the sheet
  clearAllTemplateData(worksheet, TEMPLATE_MAPPING.dataStartRow);

  // Fill customer info
  if (quotation.customer_name) {
    const cell = worksheet.getCell(TEMPLATE_MAPPING.customerName);
    cell.value = quotation.customer_name;
    cell.font = { ...FONT_STYLES.BODY };
  }
  if (quotation.customer_phone) {
    const cell = worksheet.getCell(TEMPLATE_MAPPING.customerPhone);
    cell.value = quotation.customer_phone;
    cell.font = { ...FONT_STYLES.BODY };
  }
  if (quotation.customer_model) {
    const cell = worksheet.getCell(TEMPLATE_MAPPING.customerModel);
    cell.value = quotation.customer_model;
    cell.font = { ...FONT_STYLES.BODY };
  }
  if (quotation.customer_address) {
    const cell = worksheet.getCell(TEMPLATE_MAPPING.customerAddress);
    cell.value = quotation.customer_address;
    cell.font = { ...FONT_STYLES.BODY };
  }

  // Helper: get subproducts for a specific parent item from the original items array
  const getSubproductsForParent = (
    parentProductId: string,
  ): QuotationItem[] => {
    const subproduct = items.filter(
      (item) => item.is_subproduct && item.parent_item_id == parentProductId,
    );
    return subproduct;
  };

  // Helper: get all items (parent + subproducts) for a parent
  const getItemWithSubproducts = (
    parentItem: QuotationItem,
  ): QuotationItem[] => {
    const subproducts = getSubproductsForParent(parentItem.product_id ?? "");
    return [parentItem, ...subproducts];
  };

  // Categorize items - exclude subproducts from the parent arrays
  const softwareItems = items.filter(
    (item) => isSoftwareItem(item) && !item.is_subproduct,
  );
  const hardwareItems = items.filter(
    (item) => !isSoftwareItem(item) && !item.is_subproduct,
  );

  let currentRow = TEMPLATE_MAPPING.dataStartRow;

  // Calculate category totals
  const calculateCategoryTotal = (parentItems: QuotationItem[]) =>
    parentItems.reduce((sum, parentItem) => {
      const group = getItemWithSubproducts(parentItem);
      return (
        sum +
        group.reduce(
          (itemSum, item) => itemSum + (item.is_free ? 0 : item.total_price),
          0,
        )
      );
    }, 0);

  const softwareTotal = calculateCategoryTotal(softwareItems);
  const hardwareTotal = calculateCategoryTotal(hardwareItems);

  // ---------- A. PHẦN MỀM ----------
  if (softwareItems.length > 0) {
    currentRow = addCategoryHeader(worksheet, currentRow, "A. PHẦN MỀM");
    for (const item of softwareItems) {
      const originalIndex = items.indexOf(item);
      currentRow = await fillProductRowWithSubproductsForPdf(
        worksheet,
        currentRow,
        item,
        items,
        originalIndex,
        workbook,
        getSubproductsForParent,
      );
    }
    // Add software total row immediately after software items (before hardware category)
    if (softwareTotal > 0) {
      currentRow = addSoftwareTotalRow(worksheet, currentRow, softwareTotal);
    }
  }

  // ---------- B. PHẦN CỨNG ----------
  if (hardwareItems.length > 0) {
    currentRow = addCategoryHeader(worksheet, currentRow, "B. PHẦN CỨNG");
    for (const item of hardwareItems) {
      const originalIndex = items.indexOf(item);
      currentRow = await fillProductRowWithSubproductsForPdf(
        worksheet,
        currentRow,
        item,
        items,
        originalIndex,
        workbook,
        getSubproductsForParent,
      );
    }
    // Add hardware total row immediately after hardware items
    if (hardwareTotal > 0) {
      currentRow = addHardwareTotalRow(worksheet, currentRow, hardwareTotal);
    }
  }

  // ---------- Summary rows ----------
  currentRow = addSummarySection(
    worksheet,
    currentRow,
    items,
    softwareItems,
    hardwareItems,
    quotation,
    softwareTotal,
    hardwareTotal,
  );

  // ---------- Footer Notes ----------
  currentRow = addFooterNotes(worksheet, currentRow);

  // ---------- Custom Notes (if provided) ----------
  if (quotation.notes && quotation.notes.trim()) {
    currentRow++;
    const notesCell = worksheet.getCell(`A${currentRow}`);
    notesCell.value = `Ghi chú bổ sung: ${quotation.notes}`;
    notesCell.font = { ...FONT_STYLES.BODY, italic: true };
    notesCell.alignment = {
      horizontal: "left",
      vertical: "top",
      wrapText: true,
    };
    notesCell.border = THIN_BORDER;

    // Clear cells B-F and add borders
    for (let col = 2; col <= 6; col++) {
      const cell = worksheet.getCell(currentRow, col);
      cell.value = null;
      cell.border = THIN_BORDER;
    }
    const notesRow = worksheet.getRow(currentRow);
    notesRow.height = 40;
  }

  return new Uint8Array(await workbook.xlsx.writeBuffer());
}

// ---------------------------------------------------------------------------
// Category header
// ---------------------------------------------------------------------------

function addCategoryHeader(
  worksheet: ExcelJS.Worksheet,
  row: number,
  text: string,
): number {
  const headerCell = worksheet.getCell(`A${row}`);
  headerCell.value = "  " + text;
  headerCell.font = { ...FONT_STYLES.CATEGORY_HEADER };
  headerCell.alignment = { horizontal: "left", vertical: "middle" };
  headerCell.fill = CATEGORY_FILL;
  headerCell.border = THIN_BORDER;
  worksheet.mergeCells(`A${row}:F${row}`);

  // Apply fill and border to all cells in the merged range
  for (let c = 2; c <= 6; c++) {
    const cell = worksheet.getCell(row, c);
    cell.fill = CATEGORY_FILL;
    cell.border = THIN_BORDER;
  }

  const row_obj = worksheet.getRow(row);
  row_obj.height = 26;

  return row + 1;
}

// ---------------------------------------------------------------------------
// Software total row (appears after software items, before hardware category)
// ---------------------------------------------------------------------------

function addSoftwareTotalRow(
  worksheet: ExcelJS.Worksheet,
  row: number,
  softwareTotal: number,
): number {
  const labelCell = worksheet.getCell(`A${row}`);
  labelCell.value = "Tổng cộng phần mềm (VNĐ)";
  labelCell.font = { ...FONT_STYLES.SUMMARY_LABEL };
  labelCell.alignment = { horizontal: "center", vertical: "middle" };
  labelCell.border = THIN_BORDER;
  worksheet.mergeCells(`A${row}:E${row}`);

  // Apply borders to merged cells
  for (let c = 2; c <= 5; c++) {
    const cell = worksheet.getCell(row, c);
    cell.font = { ...FONT_STYLES.SUMMARY_LABEL };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = THIN_BORDER;
  }

  const valueCell = worksheet.getCell(`F${row}`);
  valueCell.value = softwareTotal;
  valueCell.font = { ...FONT_STYLES.SUMMARY_SW_VALUE };
  valueCell.numFmt = "#,##0";
  valueCell.alignment = { horizontal: "center", vertical: "middle" };
  valueCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFFFFF" },
  };
  valueCell.border = THIN_BORDER;

  worksheet.getRow(row).height = 27;
  return row + 1;
}

// ---------------------------------------------------------------------------
// Hardware total row (appears after hardware items, before summary section)
// ---------------------------------------------------------------------------

function addHardwareTotalRow(
  worksheet: ExcelJS.Worksheet,
  row: number,
  hardwareTotal: number,
): number {
  const labelCell = worksheet.getCell(`A${row}`);
  labelCell.value = "Tổng cộng phần cứng (VNĐ)";
  labelCell.font = { ...FONT_STYLES.SUMMARY_LABEL };
  labelCell.alignment = { horizontal: "center", vertical: "middle" };
  labelCell.border = THIN_BORDER;
  worksheet.mergeCells(`A${row}:E${row}`);

  // Apply borders to merged cells
  for (let c = 2; c <= 5; c++) {
    const cell = worksheet.getCell(row, c);
    cell.font = { ...FONT_STYLES.SUMMARY_LABEL };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = THIN_BORDER;
  }

  const valueCell = worksheet.getCell(`F${row}`);
  valueCell.value = hardwareTotal;
  valueCell.font = { ...FONT_STYLES.SUMMARY_HW_VALUE };
  valueCell.numFmt = "#,##0";
  valueCell.alignment = { horizontal: "center", vertical: "middle" };
  valueCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFFFFF" },
  };
  valueCell.border = THIN_BORDER;

  worksheet.getRow(row).height = 27;
  return row + 1;
}

// Utility function tính offset căn giữa ảnh trong ô
function calcImageCenterOffset(params: {
  colWidthChars: number; // width của column (đơn vị chars)
  rowHeightPt: number; // height của row (đơn vị pt)
  imgWidth: number; // px
  imgHeight: number; // px
}) {
  const { colWidthChars, rowHeightPt, imgWidth, imgHeight } = params;

  const COL_CHAR_TO_PX = 7.1; // Arial: ~7.1px per char
  const ROW_PT_TO_PX = 1.333; // 1pt ≈ 1.333px
  const PX_TO_EMU = 9525; // 1px = 9525 EMU

  const colWidthPx = colWidthChars * COL_CHAR_TO_PX;
  const rowHeightPx = rowHeightPt * ROW_PT_TO_PX;

  const colOff = Math.max(0, (colWidthPx - imgWidth) / 2) * PX_TO_EMU;
  const rowOff = Math.max(0, (rowHeightPx - imgHeight) / 2) * PX_TO_EMU;

  return { colOff, rowOff };
}

// ---------------------------------------------------------------------------
// Product row with subproducts
// ---------------------------------------------------------------------------

async function fillProductRowWithSubproducts(
  worksheet: ExcelJS.Worksheet,
  row: number,
  item: QuotationItem,
  allItems: QuotationItem[],
  currentItemIndex: number,
  workbook: ExcelJS.Workbook,
  getSubproductsForParent: (parentProductId: string) => QuotationItem[],
): Promise<number> {
  const hasImage = !!item.image_url;
  const descLength = cleanDescription(item.description).length;
  const baseRowHeight = hasImage ? 120 : 30;
  const contentRowHeight = estimateRowHeight(descLength, 50);
  const productRow = worksheet.getRow(row);
  productRow.height = Math.max(baseRowHeight, contentRowHeight);

  // --- Column A: Image + Name ---
  if (hasImage) {
    try {
      const response = await fetch(item.image_url!);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const rawExt = item.image_mime_type
          ? item.image_mime_type.split("/")[1] || "png"
          : "png";

        // Excel only supports png, jpeg, gif — skip unsupported formats
        const supportedExts = ["png", "jpeg", "jpg", "gif"];
        const extension = supportedExts.includes(rawExt) ? rawExt : "png";

        const imageId = workbook.addImage({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          buffer: buffer as any,
          extension: extension as "png" | "jpeg" | "gif",
        });

        const COL_A_WIDTH = 40; // chars — phải khớp với chỗ bạn set column width
        const IMG_SIZE = 100; // px

        const { colOff, rowOff } = calcImageCenterOffset({
          colWidthChars: COL_A_WIDTH,
          rowHeightPt: productRow.height, // lấy trực tiếp từ row đã set ở trên
          imgWidth: IMG_SIZE,
          imgHeight: IMG_SIZE,
        });

        // Center image horizontally in column A
        // Column A width is 40 chars ≈ 284px (at ~7.1px per char in Arial)
        // Image width is 100px
        // Center offset = (284 - 100) / 2 ≈ 92px from left edge
        // ExcelJS uses EMU (English Metric Units): 1px ≈ 952.5 EMUs
        // So offset ≈ 92px * 952.5 ≈ 87,630 EMUs
        // tl.col is 0 for column A, tl.row is 0-based so use row - 1
        // editAs: "absolute" allows precise positioning with colOff/rowOff
        worksheet.addImage(imageId, {
          tl: {
            col: 0,
            row: row - 1,
            nativeColOff: colOff,
            nativeRowOff: rowOff,
          } as any,
          ext: { width: IMG_SIZE, height: IMG_SIZE },
          editAs: "absolute",
        });
      }
    } catch (error) {
      console.warn(`Failed to load product image for ${item.name}:`, error);
    }
  }

  // Name cell — bold, centered horizontally, bottom-aligned (below image)
  const nameCell = worksheet.getCell(`A${row}`);
  nameCell.value = item.name;
  nameCell.font = { ...FONT_STYLES.PRODUCT_NAME };
  nameCell.alignment = {
    horizontal: "center",
    vertical: "middle",
    wrapText: true,
  };
  nameCell.border = THIN_BORDER;

  // --- Column B: Description (centered vertical - left aligned) ---
  const descCell = worksheet.getCell(`B${row}`);
  const cleanedDescription = cleanDescription(item.description);
  const descriptionValue = parseDescriptionForExcel(cleanedDescription);
  descCell.value = descriptionValue;
  descCell.font = { ...FONT_STYLES.DESCRIPTION };
  descCell.alignment = { horizontal: "left", vertical: "top", wrapText: true };
  descCell.border = THIN_BORDER;

  // --- Column C: Unit (center) ---
  const unitCell = worksheet.getCell(`C${row}`);
  unitCell.value = item.unit;
  unitCell.font = { ...FONT_STYLES.NUMBER };
  unitCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  unitCell.border = THIN_BORDER;

  // --- Column D: Quantity (center) ---
  const qtyCell = worksheet.getCell(`D${row}`);
  qtyCell.value = item.quantity;
  qtyCell.font = { ...FONT_STYLES.NUMBER };
  qtyCell.numFmt = "#,##0";
  qtyCell.alignment = { horizontal: "center", vertical: "middle" };
  qtyCell.border = THIN_BORDER;

  // --- Column E: Unit Price (center) ---
  const priceCell = worksheet.getCell(`E${row}`);
  if (item.is_free || item.unit_price === 0) {
    priceCell.value = "Miễn phí";
    priceCell.font = { ...FONT_STYLES.FREE };
    priceCell.alignment = { horizontal: "center", vertical: "middle" };
  } else {
    priceCell.value = item.unit_price;
    priceCell.font = { ...FONT_STYLES.NUMBER };
    priceCell.numFmt = "#,##0";
    priceCell.alignment = { horizontal: "center", vertical: "middle" };
  }
  priceCell.border = THIN_BORDER;

  // --- Column F: Total (center) ---
  const totalCell = worksheet.getCell(`F${row}`);
  if (item.is_free || item.unit_price === 0) {
    totalCell.value = "Miễn phí";
    totalCell.font = { ...FONT_STYLES.FREE, bold: true };
    totalCell.alignment = { horizontal: "center", vertical: "middle" };
  } else {
    totalCell.value = item.total_price;
    totalCell.font = { ...FONT_STYLES.NUMBER, bold: true };
    totalCell.numFmt = "#,##0";
    totalCell.alignment = { horizontal: "center", vertical: "middle" };
  }
  totalCell.border = THIN_BORDER;

  let nextRow = row + 1;

  // Add subproducts - use the helper function to get all subproducts for this parent
  if (!item.is_subproduct) {
    const subproducts = getSubproductsForParent(item.product_id ?? "");
    const firstSubproductRow = nextRow;
    for (const subproduct of subproducts) {
      nextRow = fillSubproductRow(worksheet, nextRow, subproduct);
    }
    const lastSubproductRow = nextRow - 1;

    // Merge parent row's column A with all subproduct rows' column A
    if (subproducts.length > 0) {
      worksheet.mergeCells(`A${row}:A${lastSubproductRow}`);
    }
  }

  return nextRow;
}

// ---------------------------------------------------------------------------
// Product row with subproducts for PDF (WITHOUT images)
// ---------------------------------------------------------------------------
async function fillProductRowWithSubproductsForPdf(
  worksheet: ExcelJS.Worksheet,
  row: number,
  item: QuotationItem,
  allItems: QuotationItem[],
  currentItemIndex: number,
  workbook: ExcelJS.Workbook,
  getSubproductsForParent: (parentProductId: string) => QuotationItem[],
): Promise<number> {
  // Calculate row height based on description length only (no images)
  const descLength = cleanDescription(item.description).length;
  const baseRowHeight = 30; // Fixed height for PDF (no images)
  const contentRowHeight = estimateRowHeight(descLength, 50);
  const productRow = worksheet.getRow(row);
  productRow.height = Math.max(baseRowHeight, contentRowHeight);

  // Name cell — bold, centered both horizontally and vertically
  const nameCell = worksheet.getCell(`A${row}`);
  nameCell.value = item.name;
  nameCell.font = { ...FONT_STYLES.PRODUCT_NAME };
  nameCell.alignment = {
    horizontal: "center",
    vertical: "middle",
    wrapText: true,
  };
  nameCell.border = THIN_BORDER;

  // Description cell
  const descCell = worksheet.getCell(`B${row}`);
  const cleanedDescription = cleanDescription(item.description);
  const descriptionValue = parseDescriptionForExcel(cleanedDescription);
  descCell.value = descriptionValue;
  descCell.font = { ...FONT_STYLES.DESCRIPTION };
  descCell.alignment = { horizontal: "left", vertical: "top", wrapText: true };
  descCell.border = THIN_BORDER;

  // Unit cell
  const unitCell = worksheet.getCell(`C${row}`);
  unitCell.value = item.unit;
  unitCell.font = { ...FONT_STYLES.NUMBER };
  unitCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  unitCell.border = THIN_BORDER;

  // Quantity cell
  const qtyCell = worksheet.getCell(`D${row}`);
  qtyCell.value = item.quantity;
  qtyCell.font = { ...FONT_STYLES.NUMBER };
  qtyCell.numFmt = "#,##0";
  qtyCell.alignment = { horizontal: "center", vertical: "middle" };
  qtyCell.border = THIN_BORDER;

  // Unit Price cell
  const priceCell = worksheet.getCell(`E${row}`);
  if (item.is_free || item.unit_price === 0) {
    priceCell.value = "Miễn phí";
    priceCell.font = { ...FONT_STYLES.FREE };
    priceCell.alignment = { horizontal: "center", vertical: "middle" };
  } else {
    priceCell.value = item.unit_price;
    priceCell.font = { ...FONT_STYLES.NUMBER };
    priceCell.numFmt = "#,##0";
    priceCell.alignment = { horizontal: "center", vertical: "middle" };
  }
  priceCell.border = THIN_BORDER;

  // Total cell
  const totalCell = worksheet.getCell(`F${row}`);
  if (item.is_free || item.unit_price === 0) {
    totalCell.value = "Miễn phí";
    totalCell.font = { ...FONT_STYLES.FREE, bold: true };
    totalCell.alignment = { horizontal: "center", vertical: "middle" };
  } else {
    totalCell.value = item.total_price;
    totalCell.font = { ...FONT_STYLES.NUMBER, bold: true };
    totalCell.numFmt = "#,##0";
    totalCell.alignment = { horizontal: "center", vertical: "middle" };
  }
  totalCell.border = THIN_BORDER;

  let nextRow = row + 1;

  // Add subproducts - use the helper function to get all subproducts for this parent
  if (!item.is_subproduct) {
    const subproducts = getSubproductsForParent(item.product_id ?? "");
    const firstSubproductRow = nextRow;
    for (const subproduct of subproducts) {
      nextRow = fillSubproductRow(worksheet, nextRow, subproduct);
    }
    const lastSubproductRow = nextRow - 1;

    // Merge parent row's column A with all subproduct rows' column A
    if (subproducts.length > 0) {
      worksheet.mergeCells(`A${row}:A${lastSubproductRow}`);
    }
  }

  return nextRow;
}

// ---------------------------------------------------------------------------
// Subproduct row
// ---------------------------------------------------------------------------

function fillSubproductRow(
  worksheet: ExcelJS.Worksheet,
  row: number,
  item: QuotationItem,
): number {
  const descLength = cleanDescription(item.description).length;
  const subRow = worksheet.getRow(row);
  subRow.height = Math.max(30, estimateRowHeight(descLength, 50));

  // Column A: Empty (subproduct info goes in column B)
  // The merge will be handled by the parent function after all subproducts are added
  const nameCell = worksheet.getCell(`A${row}`);
  nameCell.value = null;
  nameCell.border = THIN_BORDER;

  // Column B: Subproduct name + description (bold for visibility)
  const descCell = worksheet.getCell(`B${row}`);
  const cleanedDescription = cleanDescription(item.description);
  const descriptionValue = parseDescriptionForExcel(cleanedDescription);
  // Combine name and description with line break
  descCell.value =
    item.name + (cleanedDescription ? "\n" + descriptionValue : "");
  descCell.font = { ...FONT_STYLES.SUBPRODUCT, bold: true };
  descCell.alignment = {
    horizontal: "left",
    vertical: "middle",
    wrapText: true,
  };
  descCell.border = THIN_BORDER;

  const unitCell = worksheet.getCell(`C${row}`);
  unitCell.value = item.unit;
  unitCell.font = { ...FONT_STYLES.NUMBER };
  unitCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  unitCell.border = THIN_BORDER;

  const qtyCell = worksheet.getCell(`D${row}`);
  qtyCell.value = item.quantity;
  qtyCell.font = { ...FONT_STYLES.NUMBER };
  qtyCell.numFmt = "#,##0";
  qtyCell.alignment = { horizontal: "center", vertical: "middle" };
  qtyCell.border = THIN_BORDER;

  const priceCell = worksheet.getCell(`E${row}`);
  priceCell.value = item.unit_price === 0 ? "Miễn phí" : item.unit_price;
  priceCell.font = { ...FONT_STYLES.NUMBER };
  priceCell.numFmt = "#,##0";
  priceCell.alignment = { horizontal: "center", vertical: "middle" };
  priceCell.border = THIN_BORDER;

  const totalCell = worksheet.getCell(`F${row}`);
  if (item.unit_price === 0 || item.is_free) {
    totalCell.value = "Miễn phí";
    totalCell.font = { ...FONT_STYLES.FREE, bold: true };
    totalCell.alignment = { horizontal: "center", vertical: "middle" };
  } else {
    totalCell.value = item.total_price;
    totalCell.font = { ...FONT_STYLES.NUMBER, bold: true };
    totalCell.numFmt = "#,##0";
    totalCell.alignment = { horizontal: "center", vertical: "middle" };
  }
  totalCell.border = THIN_BORDER;

  return row + 1;
}

// ---------------------------------------------------------------------------
// Summary section (totals + discounts + grand total)
// ---------------------------------------------------------------------------

function addSummarySection(
  worksheet: ExcelJS.Worksheet,
  currentRow: number,
  allItems: QuotationItem[],
  softwareParents: QuotationItem[],
  hardwareParents: QuotationItem[],
  quotation: Quotation,
  softwareTotal: number,
  hardwareTotal: number,
): number {
  let row = currentRow;

  // Template-matching border for merged label cells
  const labelBorderLeft: Partial<ExcelJS.Borders> = {
    left: { style: "thin" },
    top: { style: "thin" },
    bottom: { style: "thin" },
  };
  const labelBorderMid: Partial<ExcelJS.Borders> = {
    top: { style: "thin" },
    bottom: { style: "thin" },
  };
  const labelBorderRight: Partial<ExcelJS.Borders> = {
    right: { style: "thin" },
    top: { style: "thin" },
    bottom: { style: "thin" },
  };

  const summaryAlignment: Partial<ExcelJS.Alignment> = {
    horizontal: "center",
    vertical: "middle",
    wrapText: true,
  };

  // Helper to write a summary total row matching the template style
  const writeSummaryRow = (
    rowNum: number,
    label: string,
    value: number,
    valueFont: Partial<ExcelJS.Font>,
  ) => {
    // Merged label cells A:E with matching borders
    const labelCell = worksheet.getCell(`A${rowNum}`);
    labelCell.value = label;
    labelCell.font = { ...FONT_STYLES.SUMMARY_LABEL };
    labelCell.alignment = summaryAlignment;
    labelCell.border = labelBorderLeft;

    worksheet.mergeCells(`A${rowNum}:E${rowNum}`);

    // Apply borders to inner merged cells (B-D use mid, E uses right)
    for (let c = 2; c <= 4; c++) {
      const cell = worksheet.getCell(rowNum, c);
      cell.font = { ...FONT_STYLES.SUMMARY_LABEL };
      cell.alignment = summaryAlignment;
      cell.border = labelBorderMid;
    }
    const cellE = worksheet.getCell(rowNum, 5);
    cellE.font = { ...FONT_STYLES.SUMMARY_LABEL };
    cellE.alignment = summaryAlignment;
    cellE.border = labelBorderRight;

    // Value cell F
    const valueCell = worksheet.getCell(`F${rowNum}`);
    valueCell.value = value;
    valueCell.font = valueFont;
    valueCell.numFmt = "#,##0";
    valueCell.alignment = { horizontal: "center", vertical: "middle" };
    valueCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFFFFF" },
    };
    valueCell.border = THIN_BORDER;

    worksheet.getRow(rowNum).height = 27;
  };

  // --- Discounts (no category header) ---
  const discounts = quotation.discounts || [];
  const activeDiscounts = discounts.filter((d) => d.amount !== 0);

  for (const discount of activeDiscounts) {
    const labelCell = worksheet.getCell(`A${row}`);
    labelCell.value = discount.label || "Chiết khấu";
    labelCell.font = { ...FONT_STYLES.SUMMARY_LABEL };
    labelCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.mergeCells(`A${row}:E${row}`);

    const amountCell = worksheet.getCell(`F${row}`);
    amountCell.value = discount.amount;
    amountCell.font = { ...FONT_STYLES.DISCOUNT, bold: true };
    amountCell.numFmt = "#,##0";
    amountCell.alignment = { horizontal: "center", vertical: "middle" };
    amountCell.border = THIN_BORDER;

    worksheet.getRow(row).height = 27;
    row++;
  }

  // --- Grand total (matching R46 template style) ---
  const totalDiscount = discounts.reduce((sum, d) => sum + d.amount, 0);
  const grandTotal = softwareTotal + hardwareTotal + totalDiscount;

  writeSummaryRow(row, "Tổng cộng (VNĐ)", grandTotal, {
    ...FONT_STYLES.TOTAL_VALUE,
  });
  row++;

  return row;
}

// ---------------------------------------------------------------------------
// Footer notes section (appears at the end of the sheet)
// ---------------------------------------------------------------------------

function addFooterNotes(
  worksheet: ExcelJS.Worksheet,
  currentRow: number,
): number {
  const footerNotes = [
    "Ghi chú:",
    "Chương trình khuyến mại có thể thay đổi tùy vào từng thời điểm",
    "Sản phẩm phần mềm được bảo hành 01 năm theo quy định của iPOS.vn",
    "Sản phẩm Phần mềm và Dịch vụ phần mềm không chịu thuế GTGT.",
    "Thiết bị phần cứng đã bao gồm 10% VAT và được bảo hành tại Văn phòng iPOS.vn.",
    "Khách hàng tại Hà Nội, HCM, Đà Nẵng, Nha Trang, Huế, Hải Phòng, Cần Thơ được miễn phí chi phí triển khai.",
    "Hỗ trợ, tư vấn, xử lý qua điện thoại, trực tuyến thông qua Internet 24/7 qua hotline 1900 4766 kể cả những ngày Lễ, Tết (hoàn toàn miễn phí).",
    "Được nâng cấp miễn phí lên các phiên bản mới trong thời gian bảo hành.",
  ];

  let row = currentRow;

  // Add spacer row for visual separation from summary section
  row++;

  // Combine all notes into a single string with proper line breaks
  // Make "Ghi chú:" bold only, then list other notes with bullet-style format (not bold)
  const combinedNotes = [
    { text: "Ghi chú:", bold: true },
    { text: "\n" },
    {
      text: "- Chương trình khuyến mại có thể thay đổi tùy vào từng thời điểm\n",
    },
    {
      text: "- Sản phẩm phần mềm được bảo hành 01 năm theo quy định của iPOS.vn\n",
    },
    { text: "- Sản phẩm Phần mềm và Dịch vụ phần mềm không chịu thuế GTGT.\n" },
    {
      text: "- Thiết bị phần cứng đã bao gồm 10% VAT và được bảo hành tại Văn phòng iPOS.vn.\n",
    },
    {
      text: "- Khách hàng tại Hà Nội, HCM, Đà Nẵng, Nha Trang, Huế, Hải Phòng, Cần Thơ được miễn phí chi phí triển khai.\n",
    },
    {
      text: "- Hỗ trợ, tư vấn, xử lý qua điện thoại, trực tuyến thông qua Internet 24/7 qua hotline 1900 4766 kể cả những ngày Lễ, Tết (hoàn toàn miễn phí).\n",
    },
    {
      text: "- Được nâng cấp miễn phí lên các phiên bản mới trong thời gian bảo hành.",
    },
  ];

  // Create a rich text object for the notes
  const richText: ExcelJS.CellRichTextValue = {
    richText: combinedNotes.map((note) => ({
      font: {
        name: "Arial",
        size: 11,
        bold: note.bold || false,
      },
      text: note.text,
    })),
  };

  // Set the value to the notes cell
  const notesCell = worksheet.getCell(`A${row}`);
  notesCell.value = richText;
  notesCell.alignment = { horizontal: "left", vertical: "top", wrapText: true };

  // Clear cells B-F and add borders
  for (let col = 2; col <= 6; col++) {
    const cell = worksheet.getCell(row, col);
    cell.value = null;
    cell.border = THIN_BORDER;
  }

  // Merge cells A:F for the single footer notes row
  worksheet.mergeCells(`A${row}:F${row}`);

  // Set appropriate row height based on content
  // 8 notes + 1 empty line = ~9 lines, ~18px per line + padding
  worksheet.getRow(row).height = 200;

  return row;
}

// ---------------------------------------------------------------------------
// Remove template product images but keep the logo (first image)
// ---------------------------------------------------------------------------

function removeTemplateProductImages(worksheet: ExcelJS.Worksheet): void {
  // ExcelJS stores image references in the internal _media array
  // Keep the first image (logo) and remove all others
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ws = worksheet as any;
  if (ws._media && Array.isArray(ws._media)) {
    // Keep only the first image (logo at top)
    if (ws._media.length > 1) {
      ws._media = [ws._media[0]];
    }
  }
}

// ---------------------------------------------------------------------------
// Clear ALL template data from startRow to the last used row
// For PDF export: clear all extra pages, keep only page 1
// ---------------------------------------------------------------------------

function clearAllTemplateData(
  worksheet: ExcelJS.Worksheet,
  startRow: number,
  keepOnlyFirstPage: boolean = false,
): void {
  // Determine the last row that has data
  const lastRow = worksheet.rowCount;
  if (lastRow < startRow) return;

  // First unmerge all cells in the area
  const merges = worksheet.model.merges || [];
  for (let i = merges.length - 1; i >= 0; i--) {
    const range = merges[i];
    if (!range || typeof range !== "string") continue;

    const parsedRange = parseExcelRange(range);
    // Clear all pages except page 1 when in PDF mode
    const shouldRemove = keepOnlyFirstPage
      ? // Remove all pages except page 1 (rows 1-19 are page 1)
        parsedRange && parsedRange.bottom > 19
      : // Original behavior
        parsedRange && parsedRange.top >= startRow;

    if (shouldRemove) {
      try {
        worksheet.unMergeCells(range);
      } catch (e) {
        console.warn(`Failed to unmerge cells at ${range}:`, e);
      }
    }
  }

  // Clear all cells in every row from startRow to lastRow
  for (let r = startRow; r <= lastRow; r++) {
    const row = worksheet.getRow(r);
    for (let c = 1; c <= 6; c++) {
      const cell = row.getCell(c);
      cell.value = null;
      cell.style = {};
    }
    row.height = 15;
  }
}

// ---------------------------------------------------------------------------
// Estimate row height based on text content length
// ---------------------------------------------------------------------------

function estimateRowHeight(textLength: number, colWidthChars: number): number {
  if (textLength === 0) return 30;
  // Approximate number of lines the text will wrap to
  const estimatedLines = Math.ceil(textLength / colWidthChars);
  // ~18px per line of text (Times New Roman 11-12pt)
  // Add padding: 10px top + 10px bottom for better readability
  const contentHeight = estimatedLines * 18;
  const padding = 20; // 10px top + 10px bottom
  const height = Math.max(30, contentHeight + padding);
  // Cap at a reasonable max
  return Math.min(height, 400);
}

// ---------------------------------------------------------------------------
// Utility: parse Excel range string
// ---------------------------------------------------------------------------

function parseExcelRange(
  range: string,
): { top: number; bottom: number; left: number; right: number } | null {
  try {
    const parts = range.split(":");
    const startCell = parts[0];
    const endCell = parts.length > 1 ? parts[1] : startCell;

    const parseCell = (cell: string) => {
      const match = cell.match(/^([A-Z]+)(\d+)$/);
      if (!match) return null;

      const colStr = match[1];
      const rowStr = match[2];

      let col = 0;
      for (let i = 0; i < colStr.length; i++) {
        col = col * 26 + (colStr.charCodeAt(i) - "A".charCodeAt(0) + 1);
      }

      return {
        col,
        row: parseInt(rowStr, 10),
      };
    };

    const start = parseCell(startCell);
    const end = parseCell(endCell);

    if (!start || !end) return null;

    return {
      top: Math.min(start.row, end.row),
      bottom: Math.max(start.row, end.row),
      left: Math.min(start.col, end.col),
      right: Math.max(start.col, end.col),
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Utility: determine if item is software
// ---------------------------------------------------------------------------

function isSoftwareItem(item: QuotationItem): boolean {
  if (item.product_category) {
    return item.product_category === "software";
  }

  const softwareKeywords = [
    "phần mềm",
    "software",
    "app",
    "gói",
    "hóa đơn",
    "server",
    "bảo trì",
    "cài",
    "phiên bản",
  ];

  const lowerName = item.name.toLowerCase();
  const lowerDesc = (item.description || "").toLowerCase();

  return softwareKeywords.some(
    (keyword) => lowerName.includes(keyword) || lowerDesc.includes(keyword),
  );
}
