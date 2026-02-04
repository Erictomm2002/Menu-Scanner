import * as XLSX from "xlsx";
import { MenuData } from "@/types/menu";

export function generateExcel(menuData: MenuData): Buffer {
  const workbook = XLSX.utils.book_new();

  // Định nghĩa headers theo đúng format template
  const headers = [
    "Tên",                                    // A - Tên món
    "Giá",                                    // B - Giá món
    "Mã món",                                 // C - để trống
    "Mã barcode",                             // D - để trống
    "Món ăn kèm",                             // E - để trống
    "Không cập nhật số lượng món ăn kèm",     // F - để trống
    "Nhóm",                                   // G - Tên nhóm món
    "Loại món",                               // H - để trống
    "Mô tả",                                  // I - Mô tả món
    "SKU",                                    // J - để trống
    "Đơn vị",                                 // K - để trống
    "Đơn vị tính thứ 2",                      // L - để trống
    "VAT (%)",                                // M - để trống
    "Thời gian chế biến (phút)",              // N - để trống
    "Cho phép sửa giá khi bán",               // O - để trống
    "Cấu hình món ảo",                        // P - để trống
    "Cấu hình món dịch vụ",                   // Q - để trống
    "Cấu hình món ăn là vé buffet",           // R - để trống
    "Ngày",                                   // S - để trống
    "Giờ",                                    // T - để trống
    "Hình ảnh",                               // U - để trống
    "Công thức inQR cho máy pha trà",         // V - để trống
  ];

  // Tạo data array cho Excel - bắt đầu với header row
  const excelData: any[] = [];

  // // Thêm header row
  // const headerRow: any = {};
  // headers.forEach((header, index) => {
  //   const columnLetter = String.fromCharCode(65 + index); // A, B, C, ...
  //   headerRow[header] = header;
  // });
  // excelData.push(headerRow);

  // Tạo map để lưu categoryId -> categoryName
  const categoryMap = new Map<string, string>();
  menuData.categories.forEach((cat) => {
    categoryMap.set(cat.id, cat.categoryName);
  });

  // Thêm từng món ăn
  menuData.categories.forEach((category) => {
    category.items.forEach((item) => {
      const row: any = {
        "Tên": item.name || "",
        "Giá": item.price || "",
        "Mã món": "",
        "Mã barcode": "",
        "Món ăn kèm": "",
        "Không cập nhật số lượng món ăn kèm": "",
        "Nhóm": category.id.toUpperCase() || "",
        "Loại món": "",
        "Mô tả": item.description || "",
        "SKU": "",
        "Đơn vị": "",
        "Đơn vị tính thứ 2": "",
        "VAT (%)": "",
        "Thời gian chế biến (phút)": "",
        "Cho phép sửa giá khi bán": "",
        "Cấu hình món ảo": "",
        "Cấu hình món dịch vụ": "",
        "Cấu hình món ăn là vé buffet": "",
        "Ngày": "",
        "Giờ": "",
        "Hình ảnh": "",
        "Công thức inQR cho máy pha trà": "",
      };
      excelData.push(row);
    });
  });

  // Tạo worksheet từ JSON
  const worksheet = XLSX.utils.json_to_sheet(excelData, {
    header: headers,
    skipHeader: false,
  });

  // Thiết lập độ rộng cột
  worksheet["!cols"] = [
    { wch: 30 },  // A - Tên
    { wch: 15 },  // B - Giá
    { wch: 15 },  // C - Mã món
    { wch: 15 },  // D - Mã barcode
    { wch: 20 },  // E - Món ăn kèm
    { wch: 35 },  // F - Không cập nhật số lượng món ăn kèm
    { wch: 25 },  // G - Nhóm
    { wch: 15 },  // H - Loại món
    { wch: 40 },  // I - Mô tả
    { wch: 15 },  // J - SKU
    { wch: 15 },  // K - Đơn vị
    { wch: 20 },  // L - Đơn vị tính thứ 2
    { wch: 12 },  // M - VAT (%)
    { wch: 25 },  // N - Thời gian chế biến (phút)
    { wch: 25 },  // O - Cho phép sửa giá khi bán
    { wch: 20 },  // P - Cấu hình món ảo
    { wch: 25 },  // Q - Cấu hình món dịch vụ
    { wch: 30 },  // R - Cấu hình món ăn là vé buffet
    { wch: 12 },  // S - Ngày
    { wch: 12 },  // T - Giờ
    { wch: 20 },  // U - Hình ảnh
    { wch: 35 },  // V - Công thức inQR cho máy pha trà
  ];

  // Styling cho header row (row 1)
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

  // Thêm worksheet vào workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Menu");

  // Tạo sheet Template với hướng dẫn
  const templateData = [
    {
      "Cột": "Tên",
      "Bắt buộc": "Có",
      "Mô tả": "Tên món ăn",
      "Ví dụ": "Phở bò tái",
    },
    {
      "Cột": "Giá",
      "Bắt buộc": "Có",
      "Mô tả": "Giá bán của món",
      "Ví dụ": "50000",
    },
    {
      "Cột": "Nhóm",
      "Bắt buộc": "Có",
      "Mô tả": "Mã nhóm món (category)",
      "Ví dụ": "cat_1",
    },
    {
      "Cột": "Mô tả",
      "Bắt buộc": "Không",
      "Mô tả": "Mô tả chi tiết về món ăn",
      "Ví dụ": "Phở bò tái với nước dùng đậm đà",
    },
    {
      "Cột": "Mã món",
      "Bắt buộc": "Không",
      "Mô tả": "Mã định danh món ăn",
      "Ví dụ": "PHO001",
    },
    {
      "Cột": "Mã barcode",
      "Bắt buộc": "Không",
      "Mô tả": "Mã vạch của món",
      "Ví dụ": "1234567890",
    },
  ];

  const templateWorksheet = XLSX.utils.json_to_sheet(templateData);
  templateWorksheet["!cols"] = [
    { wch: 20 },  // Cột
    { wch: 12 },  // Bắt buộc
    { wch: 50 },  // Mô tả
    { wch: 35 },  // Ví dụ
  ];

  XLSX.utils.book_append_sheet(workbook, templateWorksheet, "Template");

  // Convert to buffer
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
