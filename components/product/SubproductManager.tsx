"use client";

import { useState } from "react";
import { Subproduct } from "@/types/quotation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface SubproductManagerProps {
  subproducts: Subproduct[];
  onChange: (subproducts: Subproduct[]) => void;
}

export function SubproductManager({ subproducts, onChange }: SubproductManagerProps) {
  const [newSubproduct, setNewSubproduct] = useState<Partial<Subproduct>>({
    name: "",
    price: 0,
    unit: "",
  });

  const addSubproduct = () => {
    if (!newSubproduct.name?.trim()) return;

    const subproduct: Subproduct = {
      id: crypto.randomUUID(),
      product_id: "",
      name: newSubproduct.name.trim(),
      price: Number(newSubproduct.price) || 0,
      unit: newSubproduct.unit?.trim() || "",
    };

    onChange([...subproducts, subproduct]);
    setNewSubproduct({ name: "", price: 0, unit: "" });
  };

  const deleteSubproduct = (id: string) => {
    onChange(subproducts.filter((s) => s.id !== id));
  };

  const updateSubproduct = (id: string, field: keyof Subproduct, value: any) => {
    onChange(
      subproducts.map((s) =>
        s.id === id ? { ...s, [field]: field === "price" ? Number(value) || 0 : value } : s
      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Subproducts List */}
      {subproducts.length === 0 ? (
        <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg">
          <p>Chưa có subproduct nào</p>
        </div>
      ) : (
        <div className="space-y-2">
          {subproducts.map((subproduct, index) => (
            <div
              key={subproduct.id}
              className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg"
            >
              {/* Subproduct Fields */}
              {/* Grid layout: 3 columns (name, price, unit) on large screens */}
              {/* Responsive: stacks to 2 columns on medium screens, 1 column on mobile */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-5 lg:grid-cols-10 gap-2">
                <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                  <Input
                    variant="secondary"
                    placeholder="Tên subproduct"
                    value={subproduct.name}
                    onChange={(e) => updateSubproduct(subproduct.id, "name", e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="col-span-1 sm:col-span-1 lg:col-span-2">
                  {subproduct.price === 0 ? (
                    <div className="flex items-center h-[42px] px-4 bg-slate-100 border border-slate-200 rounded-lg text-orange-600 font-semibold text-sm">
                      Miễn phí
                    </div>
                  ) : (
                    <Input
                      variant="secondary"
                      type="number"
                      min="0"
                      placeholder="Giá"
                      value={subproduct.price || ""}
                      onChange={(e) => updateSubproduct(subproduct.id, "price", e.target.value)}
                      className="text-sm"
                    />
                  )}
                </div>
                <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                  <Input
                    variant="secondary"
                    placeholder="Đơn vị"
                    value={subproduct.unit || ""}
                    onChange={(e) => updateSubproduct(subproduct.id, "unit", e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => deleteSubproduct(subproduct.id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors mt-1"
                aria-label="Xóa subproduct"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Subproduct */}
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 bg-slate-50/50">
        <h4 className="text-sm font-medium text-slate-600 mb-3">Thêm subproduct mới</h4>
        {/* Grid layout: 3 columns (name, price, unit) on large screens */}
        {/* Responsive: stacks to 2 columns on medium screens, 1 column on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <div className="col-span-2">
            <Input
              variant="secondary"
              placeholder="Tên subproduct"
              value={newSubproduct.name || ""}
              onChange={(e) => setNewSubproduct({ ...newSubproduct, name: e.target.value })}
              className="text-sm"
            />
          </div>
          <div className="col-span-1">
            <Input
              variant="secondary"
              type="number"
              min="0"
              placeholder="Giá"
              value={newSubproduct.price || ""}
              onChange={(e) => setNewSubproduct({ ...newSubproduct, price: Number(e.target.value) })}
              className="text-sm"
            />
          </div>
          <div className="col-span-1">
            <div className="flex gap-2">
              <Input
                variant="secondary"
                placeholder="Đơn vị"
                value={newSubproduct.unit || ""}
                onChange={(e) => setNewSubproduct({ ...newSubproduct, unit: e.target.value })}
                className="text-sm flex-1"
              />
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={addSubproduct}
                className="px-3"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
