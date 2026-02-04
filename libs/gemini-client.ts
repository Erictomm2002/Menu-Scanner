import { GoogleGenerativeAI } from "@google/generative-ai";
import { MenuData } from "../types/menu";

const prompt: string = `
Phân tích ảnh menu quán ăn này và trích xuất thông tin theo định dạng JSON sau:

{
  "restaurantName": "tên quán (nếu có)",
  "categories": [
    {
      "id": "ký tự viết tắt (VD: Trà sữa->TS, Món chính->MC, Coffee->CF)",
      "categoryName": "tên nhóm",
      "items": [
        {
          "id": "item_1",
          "name": "tên món",
          "price": "số nguyên (VD: 50000), nếu không có để 0đ",
          "description": "mô tả (optional)"
        }
      ]
    }
  ]
}

YÊU CẦU:
1 Category id: Viết tắt chữ cái đầu mỗi từ, viết hoa, unique
2. Item id: Tăng dần item_1, item_2...
3. Trả về CHỈ JSON thuần túy, KHÔNG có markdown (\`\`\`json), KHÔNG có text giải thích
4. Nếu không thấy giá tiền, để giá về 0
5. Nếu không có mô tả, bỏ qua field "description"
6. Giữ nguyên ngôn ngữ trong menu, nếu menu có cả tiếng việt và tiếng anh cho mỗi món thì ưu tiên tiếng anh
7. Đọc kỹ toàn bộ menu, không bỏ sót món nào
8. Nếu một món có 2 giá, hãy tạo ra 2 món mới với tên theo format "tên món (size 1)" và "tên món (size 2), nếu không có thông tin về size, hãy dùng cấu trúc tên món = "tên món + giá món". Vd: Trà sữa 15
9. Gía để dạng số nguyên như 50000, ...
Hãy phân tích ảnh và trả về JSON
`;

export async function extractMenuFromImage(
  imageBase64: string,
  mimeType: string = "image/jpeg",
): Promise<MenuData> {
  // Khởi tạo Gemini AI
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  // Sử dụng model Gemini 1.5 Flash (miễn phí, nhanh)
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.4,
      topK: 32,
      topP: 1,
      maxOutputTokens: 65536,
    },
  });

  try {
    // Chuẩn bị image data
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    };

    // Gọi Gemini API
    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text();

    console.log("Gemini Raw Response:", text);

    // Xử lý response - loại bỏ markdown nếu có
    let jsonText = text.trim();

    // Remove markdown code blocks
    jsonText = jsonText.replace(/```json\n?/g, "");
    jsonText = jsonText.replace(/```\n?/g, "");
    jsonText = jsonText.trim();

    // Parse JSON
    const menuData: MenuData = JSON.parse(jsonText);

    return menuData;
  } catch (error) {
    console.error("Gemini API Error:", error);

    throw new Error(
      "Không thể phân tích menu. Vui lòng thử lại với ảnh rõ hơn.",
    );
  }
}
