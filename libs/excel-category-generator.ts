import * as XLSX from "xlsx";
import { MenuData } from "@/types/menu";

/**
 * Generate Excel file for menu categories (Nhóm món)
 * Contains 2 fields: name (Tên nhóm món) and id (Mã nhóm món)
 */
export function generateCategoryExcel(menuData: MenuData): Buffer {
  const workbook = XLSX.utils.book_new();

  // Define headers
  const headers = ["name", "id"];

  // Create data array for Excel
  const excelData: any[] = [];

  // Add categories data
  menuData.categories.forEach((category) => {
    excelData.push({
      "name": category.categoryName || "",
      "id": category.id || "",
    });
  });

  // Create worksheet from JSON
  const worksheet = XLSX.utils.json_to_sheet(excelData, {
    header: headers,
  });

  // Set column widths
  worksheet["!cols"] = [
    { wch: 35 }, // Tên nhóm món
    { wch: 25 }, // Mã nhóm món
  ];

  // Styling for header row (row 1)
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;

    worksheet[cellAddress].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "0560a6" } },
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Nhóm món");

  // Add Template sheet with instructions
  const templateData = [
    {
      "Trường": "Tên nhóm món",
      "Bắt buộc": "Có",
      "Mô tả": "Tên hiển thị của nhóm món",
      "Ví dụ": "Món chính, Món phụ, Đồ uống",
    },
    {
      "Trường": "Mã nhóm món",
      "Bắt buộc": "Có",
      "Mô tả": "Mã định danh duy nhất cho nhóm món",
      "Ví dụ": "cat_1234567890, MAIN_DISH",
    },
  ];

  const templateWorksheet = XLSX.utils.json_to_sheet(templateData);
  templateWorksheet["!cols"] = [
    { wch: 20 }, // Trường
    { wch: 12 }, // Bắt buộc
    { wch: 50 }, // Mô tả
    { wch: 35 }, // Ví dụ
  ];

  // Styling for template header
  const templateRange = XLSX.utils.decode_range(templateWorksheet["!ref"] || "A1");
  for (let col = templateRange.s.c; col <= templateRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!templateWorksheet[cellAddress]) continue;

    templateWorksheet[cellAddress].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "0560a6" } },
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  XLSX.utils.book_append_sheet(workbook, templateWorksheet, "Hướng dẫn");

  // Convert to buffer
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}