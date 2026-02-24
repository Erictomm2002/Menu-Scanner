"use client";

import { ProductList } from "@/components/product/ProductList";
import { FileText, ArrowLeft, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Về trang chủ
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#2463eb]" />
                <h1 className="text-lg font-semibold text-slate-900">Quản lý sản phẩm</h1>
              </div>
            </div>
            <Link href="/quotation">
              <Button variant="primary">
                Tạo báo giá
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <ProductList />
      </div>
    </main>
  );
}
