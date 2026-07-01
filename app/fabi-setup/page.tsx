"use client"

import Link from "next/link"
import { ArrowLeft, Rocket } from "lucide-react"
import { FabiSetupForm } from "@/components/fabi-setup/FabiSetupForm"

export default function FabiSetupPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <nav className="container mx-auto px-6 py-4 max-w-4xl">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-1">
              <span className="text-2xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#008080] to-[#20B2AA]">
                iPOS
              </span>
              <span className="text-xl font-light text-slate-400">Kit</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* Content */}
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center shadow-lg shadow-primary/20">
              <Rocket className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                Khởi tạo dữ liệu quán
              </h1>
              <p className="text-base text-slate-500 mt-1">
                Nhập thông tin để hệ thống tự động thiết lập dữ liệu trên Fabi iPOS
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <FabiSetupForm />

        {/* Footer info */}
        <p className="text-center text-sm text-slate-400 mt-8 mb-6">
          Vui lòng kiểm tra kỹ thông tin trước khi khởi tạo
        </p>
      </div>
    </main>
  )
}
