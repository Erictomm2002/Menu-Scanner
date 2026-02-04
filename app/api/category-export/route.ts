import { NextRequest, NextResponse } from "next/server";
import { generateCategoryExcel } from "../../../libs/excel-category-generator";

export async function POST(request: NextRequest) {
  try {
    const menuData = await request.json();

    // Validate data
    if (
      !menuData ||
      !menuData.categories ||
      !Array.isArray(menuData.categories)
    ) {
      return NextResponse.json(
        { error: "Dữ liệu menu không hợp lệ" },
        { status: 400 },
      );
    }

    if (menuData.categories.length === 0) {
      return NextResponse.json(
        { error: "Menu không có dữ liệu" },
        { status: 400 },
      );
    }

    // Generate Excel file
    const excelBuffer = generateCategoryExcel(menuData);

    // Create filename
    const timestamp = new Date().toISOString().split("T")[0];
    const restaurantName = menuData.restaurantName
      ? menuData.restaurantName.replace(/[^a-zA-Z0-9]/g, "_")
      : "menu";
    const filename = `${restaurantName}_${timestamp}.xlsx`;

    console.log("Exporting Excel:", filename);

    // Return file
    // TODO: Neu co loi, hay xem o day, minh vua sua code
    return new NextResponse(new Uint8Array(excelBuffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": excelBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error exporting Excel:", error);
    return NextResponse.json(
      { error: "Lỗi xuất file Excel. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}
