import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "Menu Extractor - Trích xuất menu tự động với AI",
  description:
    "Chuyển đổi ảnh menu quán ăn sang file Excel tự động bằng Google Gemini AI",
  keywords: "menu extractor, AI, Gemini, Excel, restaurant menu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
