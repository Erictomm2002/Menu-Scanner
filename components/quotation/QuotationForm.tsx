"use client";

import { Input } from "@/components/ui/Input";
import { User } from "lucide-react";

interface QuotationFormProps {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerModel: string;
  onCustomerNameChange: (value: string) => void;
  onCustomerPhoneChange: (value: string) => void;
  onCustomerAddressChange: (value: string) => void;
  onCustomerModelChange: (value: string) => void;
}

export function QuotationForm({
  customerName,
  customerPhone,
  customerAddress,
  customerModel,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onCustomerAddressChange,
  onCustomerModelChange,
}: QuotationFormProps) {
  return (
    <div className="bg-white shadow-sm rounded-xl p-4 md:p-6 border border-slate-300">
      {/* Mobile Header */}
      <div className="flex items-center gap-2 mb-4 lg:hidden">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-base font-bold text-slate-900">
          Thông tin khách hàng
        </h2>
      </div>

      {/* Desktop Header */}
      <h2 className="text-xl font-bold text-slate-900 mb-4 hidden lg:flex items-center gap-2">
        <User className="w-5 h-5 text-[#2463eb]" aria-hidden="true" />
        Thông tin khách hàng
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="flex flex-col items-start gap-2">
          <label htmlFor="customer-name" className="text-sm font-medium text-slate-700 whitespace-nowrap">
            Người nhận
          </label>
          <Input
            variant="default"
            id="customer-name"
            placeholder="Nguyễn Văn A"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            className="flex-1 w-full"
          />
        </div>

        <div className="flex flex-col items-start gap-2">
          <label htmlFor="customer-phone" className="text-sm font-medium text-slate-700 whitespace-nowrap">
            Số điện thoại
          </label>
          <Input
            variant="default"
            id="customer-phone"
            placeholder="0901 234 567"
            type="tel"
            value={customerPhone}
            onChange={(e) => onCustomerPhoneChange(e.target.value)}
            className="flex-1 w-full"
          />
        </div>

        <div className="flex flex-col items-start gap-2">
          <label htmlFor="customer-model" className="text-sm font-medium text-slate-700 whitespace-nowrap">
            Tên mô hình
          </label>
          <Input
            variant="default"
            id="customer-model"
            placeholder="Toyota Camry 2022"
            value={customerModel}
            onChange={(e) => onCustomerModelChange(e.target.value)}
            className="flex-1 w-full"
          />
        </div>

        <div className="flex flex-col items-start gap-2">
          <label htmlFor="customer-address" className="text-sm font-medium text-slate-700 whitespace-nowrap">
            Địa chỉ
          </label>
          <Input
            variant="default"
            id="customer-address"
            placeholder="Quận 1, TP. Hồ Chí Minh"
            value={customerAddress}
            onChange={(e) => onCustomerAddressChange(e.target.value)}
            className="flex-1 w-full"
          />
        </div>
      </div>
    </div>
  );
}
