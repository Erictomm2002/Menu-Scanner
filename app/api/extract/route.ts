import { NextRequest, NextResponse } from "next/server";
import { extractMenuFromImage } from "../../../libs/gemini-client";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Không tìm thấy file ảnh" },
        { status: 400 },
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File không phải là ảnh" },
        { status: 400 },
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 10MB" },
        { status: 400 },
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    // Get mime type
    const mimeType = file.type || "image/jpeg";

    console.log("Processing image:", {
      name: file.name,
      type: mimeType,
      size: file.size,
    });

    // Extract menu using Gemini AI
    const menuData = await extractMenuFromImage(base64, mimeType);

    return NextResponse.json(menuData);
  } catch (error) {
    console.error("Error extracting menu:", error);

    return NextResponse.json(
      {
        error: error || "Lỗi xử lý ảnh menu. Vui lòng thử lại với ảnh rõ hơn.",
      },
      { status: 500 },
    );
  }
}
