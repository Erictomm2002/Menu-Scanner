import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "iPos Kit - Giải pháp Tự động hóa Thông minh",
  description:
    "Tối ưu quy trình làm việc với các giải pháp AI: Menu Extractor và Báo giá sản phẩm",
  keywords: "iPos Kit, Menu Extractor, báo giá, AI, tự động hóa, nhà hàng, doanh nghiệp",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
