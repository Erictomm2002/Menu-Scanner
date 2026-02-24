"use client";

import { useState, useEffect } from "react";
import { QuotationWithItems, QuotationStatus } from "@/types/quotation";
import { Search, Download, Trash2, Eye, Copy, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function QuotationHistoryPage() {
  const [quotations, setQuotations] = useState<QuotationWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | "all">("all");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchQuotations();
  }, [statusFilter, searchQuery]);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(`/api/quotations?${params}`);
      const data = await response.json();

      if (response.ok) {
        setQuotations(
          data.quotations.map((q: any) => ({ ...q, items: [] })) // Items loaded separately
        );
      }
    } catch (error) {
      console.error("Error fetching quotations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (id: string, quoteNumber: string) => {
    try {
      const response = await fetch(`/api/quotations/${id}/export`, {
        method: "POST",
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `BaoGia_${quoteNumber}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setMessage({ type: "error", text: "Lỗi khi export" });
      }
    } catch (error) {
      console.error("Error exporting:", error);
      setMessage({ type: "error", text: "Lỗi khi export" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa báo giá này?")) {
      return;
    }

    try {
      const response = await fetch(`/api/quotations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setQuotations(quotations.filter((q) => q.id !== id));
        setMessage({ type: "success", text: "Đã xóa báo giá" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: "Lỗi khi xóa báo giá" });
      }
    } catch (error) {
      console.error("Error deleting quotation:", error);
      setMessage({ type: "error", text: "Lỗi khi xóa báo giá" });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const getStatusColor = (status: QuotationStatus) => {
    switch (status) {
      case QuotationStatus.DRAFT:
        return "bg-gray-500/20 text-gray-300";
      case QuotationStatus.SENT:
        return "bg-blue-500/20 text-blue-300";
      case QuotationStatus.ACCEPTED:
        return "bg-green-500/20 text-green-300";
      case QuotationStatus.REJECTED:
        return "bg-red-500/20 text-red-300";
    }
  };

  const getStatusLabel = (status: QuotationStatus) => {
    switch (status) {
      case QuotationStatus.DRAFT:
        return "Nháp";
      case QuotationStatus.SENT:
        return "Đã gửi";
      case QuotationStatus.ACCEPTED:
        return "Đồng ý";
      case QuotationStatus.REJECTED:
        return "Từ chối";
    }
  };

  return (
    <main className="min-h-screen">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-20 right-10 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '9s' }} />
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/20 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="text-white/70 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Về trang chủ
              </Button>
            </Link>

            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-cyan-400" />
              <h1 className="text-xl font-bold text-white">Lịch sử Báo Giá</h1>
            </div>

            <Link href="/quotation">
              <Button variant="default" gradient="blue-cyan">
                Tạo báo giá mới
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Message */}
      {message && (
        <div
          className={`fixed top-24 right-6 z-50 px-6 py-4 rounded-xl shadow-lg transition-all ${
            message.type === "success"
              ? "bg-green-500/90 text-white"
              : "bg-red-500/90 text-white"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Filters */}
        <div className="mb-6 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4" />
                <Input
                  variant="glass"
                  placeholder="Tìm theo tên khách hàng, SĐT, số báo giá..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "glass"}
                onClick={() => setStatusFilter("all")}
              >
                Tất cả
              </Button>
              <Button
                variant={statusFilter === QuotationStatus.DRAFT ? "default" : "glass"}
                onClick={() => setStatusFilter(QuotationStatus.DRAFT)}
              >
                Nháp
              </Button>
              <Button
                variant={statusFilter === QuotationStatus.SENT ? "default" : "glass"}
                onClick={() => setStatusFilter(QuotationStatus.SENT)}
              >
                Đã gửi
              </Button>
              <Button
                variant={statusFilter === QuotationStatus.ACCEPTED ? "default" : "glass"}
                onClick={() => setStatusFilter(QuotationStatus.ACCEPTED)}
              >
                Đồng ý
              </Button>
            </div>
          </div>
        </div>

        {/* Quotations List */}
        {loading ? (
          <div className="text-center text-white/50 py-12">Đang tải...</div>
        ) : quotations.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/50 text-lg">Không có báo giá nào</p>
            <p className="text-white/40 text-sm mt-2">
              {statusFilter !== "all" || searchQuery
                ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                : "Tạo báo giá đầu tiên của bạn ngay bây giờ"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {quotations.map((quotation) => (
              <div
                key={quotation.id}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-bold text-lg">{quotation.quote_number}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          quotation.status
                        )}`}
                      >
                        {getStatusLabel(quotation.status)}
                      </span>
                    </div>

                    {quotation.customer_name && (
                      <p className="text-white/90 mb-1">
                        <span className="text-white/60">Khách hàng:</span> {quotation.customer_name}
                      </p>
                    )}
                    {quotation.customer_phone && (
                      <p className="text-white/90 mb-1">
                        <span className="text-white/60">SĐT:</span> {quotation.customer_phone}
                      </p>
                    )}
                    {quotation.customer_address && (
                      <p className="text-white/90 mb-3">
                        <span className="text-white/60">Địa chỉ:</span> {quotation.customer_address}
                      </p>
                    )}

                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-white/60">
                        Ngày tạo: {formatDate(quotation.created_at || "")}
                      </span>
                      <span className="text-cyan-400 font-bold font-mono">
                        Tổng: {formatPrice(quotation.total_amount)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => handleExport(quotation.id!, quotation.quote_number)}
                      title="Export Excel"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => handleDelete(quotation.id!)}
                      title="Xóa"
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
