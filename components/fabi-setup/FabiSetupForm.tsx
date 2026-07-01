"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/Button"
import { motion, AnimatePresence } from "framer-motion"
import {
  Store,
  FileText,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ImageUp,
  FileImage,
  X,
} from "lucide-react"

interface ZoneConfig {
  id: string
  name: string
  tableCount: number
}

interface FormData {
  restaurantName: string
  phone: string
  address: string
  contactPerson: string
  token: string
  zones: ZoneConfig[]
  menuFiles: File[]
  notes: string
}

interface FormErrors {
  restaurantName?: string
  zones?: string
}

type Step = 1 | 2 | 3 | 4

const STEPS = [
  { id: 1, label: "Thông tin quán", icon: Store },
  { id: 2, label: "Menu", icon: ImageUp },
  { id: 3, label: "Khu vực & Bàn", icon: Building2 },
  { id: 4, label: "Hoàn tất", icon: FileText },
] as const

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

function createDefaultZones(count: number): ZoneConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    id: generateId(),
    name: `Khu vực ${i + 1}`,
    tableCount: 5,
  }))
}

function syncZones(zones: ZoneConfig[], targetCount: number): ZoneConfig[] {
  if (zones.length === targetCount) return zones
  if (targetCount > zones.length) {
    const added = targetCount - zones.length
    const newZones = Array.from({ length: added }, (_, i) => ({
      id: generateId(),
      name: `Khu vực ${zones.length + i + 1}`,
      tableCount: 5,
    }))
    return [...zones, ...newZones]
  }
  return zones.slice(0, targetCount)
}

export function FabiSetupForm() {
  const [step, setStep] = useState<Step>(1)
  const [formData, setFormData] = useState<FormData>({
    restaurantName: "",
    phone: "",
    address: "",
    contactPerson: "",
    token: "",
    zones: createDefaultZones(1),
    menuFiles: [],
    notes: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MAX_IMAGES = 10

  const handleFileChange = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return
    const newFiles = Array.from(selectedFiles)
    if (formData.menuFiles.length + newFiles.length > MAX_IMAGES) {
      alert(`Tối đa ${MAX_IMAGES} ảnh. Vui lòng bỏ bớt.`)
      return
    }
    const allFiles = [...formData.menuFiles, ...newFiles].slice(0, MAX_IMAGES)
    const validatedFiles = allFiles.filter(file => {
      if (!file.type.startsWith("image/")) {
        alert(`File '${file.name}' không phải ảnh.`)
        return false
      }
      if (file.size > 20 * 1024 * 1024) {
        alert(`Ảnh '${file.name}' quá lớn (> 20MB).`)
        return false
      }
      return true
    })
    setFormData((prev) => ({ ...prev, menuFiles: validatedFiles }))
  }

  const handleRemoveFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      menuFiles: prev.menuFiles.filter((_, i) => i !== index),
    }))
  }

  const updateZone = (id: string, field: keyof ZoneConfig, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      zones: prev.zones.map((z) => (z.id === id ? { ...z, [field]: value } : z)),
    }))
  }

  const setZoneCount = (count: number) => {
    const clamped = Math.max(1, Math.min(20, count))
    setFormData((prev) => ({
      ...prev,
      zones: syncZones(prev.zones, clamped),
    }))
  }

  const addZone = () => {
    setFormData((prev) => ({
      ...prev,
      zones: [...prev.zones, { id: generateId(), name: `Khu vực ${prev.zones.length + 1}`, tableCount: 5 }],
    }))
  }

  const removeZone = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      zones: prev.zones.filter((z) => z.id !== id),
    }))
  }

  const validateStep = (s: Step): boolean => {
    const newErrors: FormErrors = {}
    if (s === 1 && !formData.restaurantName.trim()) {
      newErrors.restaurantName = "Vui lòng nhập tên quán"
    }
    if (s === 3) {
      const totalTables = formData.zones.reduce((sum, z) => sum + (z.tableCount || 0), 0)
      if (totalTables === 0) {
        newErrors.zones = "Tổng số bàn phải lớn hơn 0"
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (!validateStep(step)) return
    if (step < 4) setStep((step + 1) as Step)
  }

  const prevStep = () => {
    if (step > 1) setStep((step - 1) as Step)
  }

  const handleSubmit = () => {
    if (!validateStep(step)) return
    setSuccess(true)
    console.log("Form data submitted:", formData)
  }

  const totalTables = formData.zones.reduce((sum, z) => sum + (z.tableCount || 0), 0)

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-200"
        >
          <CheckCircle2 className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Dữ liệu đã được ghi nhận!</h2>
        <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto">
          Hệ thống sẽ tiến hành khởi tạo dữ liệu cho quán <strong>{formData.restaurantName}</strong>
          <br />với <strong>{formData.zones.length} khu vực</strong>, <strong>{totalTables} bàn</strong>
          {formData.menuFiles.length > 0 && (
            <> và <strong>{formData.menuFiles.length} ảnh menu</strong></>
          )}.
        </p>
        <Button variant="outline" onClick={() => {
          setSuccess(false)
          setStep(1)
          setFormData({
            restaurantName: "",
            phone: "",
            address: "",
            contactPerson: "",
            token: "",
            zones: createDefaultZones(1),
            menuFiles: [],
            notes: "",
          })
          setErrors({})
        }}>
          Tạo mới
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Step Progress */}
      <div className="flex items-center justify-start gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const isActive = step === s.id
          const isPast = step > s.id
          return (
            <div key={s.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (isPast || s.id <= step) setStep(s.id as Step)
                }}
                disabled={!isPast && !isActive}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : isPast
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="font-semibold hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <ChevronRight className={`w-3.5 h-3.5 ${isPast ? "text-emerald-400" : "text-slate-300"}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="rounded-2xl bg-gradient-to-br from-teal-50 via-white to-cyan-50 border border-teal-100 shadow-md overflow-hidden"
          >
            <div className="px-6 pt-6 pb-4 border-b border-teal-100">
              <h2 className="text-base font-bold text-slate-800">Thông tin quán</h2>
              <p className="text-xs text-slate-500 mt-0.5">Nhập thông tin cơ bản của quán</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  Tên quán <span className="text-red-500">*</span>
                </label>
                <input
                  value={formData.restaurantName}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, restaurantName: e.target.value }))
                    if (errors.restaurantName) setErrors((prev) => ({ ...prev, restaurantName: undefined }))
                  }}
                  placeholder="Nhập tên quán..."
                  className="w-full px-4 py-2.5 text-sm bg-white border border-teal-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-3 focus:ring-teal-100 transition-all"
                />
                {errors.restaurantName && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.restaurantName}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Số điện thoại</label>
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="090 123 4567"
                    className="w-full px-4 py-2.5 text-sm bg-white border border-teal-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-3 focus:ring-teal-100 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Người liên hệ</label>
                  <input
                    value={formData.contactPerson}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contactPerson: e.target.value }))}
                    placeholder="Nhập tên người liên hệ..."
                    className="w-full px-4 py-2.5 text-sm bg-white border border-teal-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-3 focus:ring-teal-100 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Địa chỉ</label>
                <input
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                  className="w-full px-4 py-2.5 text-sm bg-white border border-teal-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-3 focus:ring-teal-100 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Mã token truy cập</label>
                <input
                  value={formData.token}
                  onChange={(e) => setFormData((prev) => ({ ...prev, token: e.target.value }))}
                  placeholder="Nhập mã token..."
                  className="w-full px-4 py-2.5 text-sm bg-white border border-teal-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-3 focus:ring-teal-100 transition-all font-mono"
                  autoComplete="off"
                />
                <p className="mt-1 text-xs text-slate-400">Token dùng để truy cập tài khoản khách trên Fabi iPOS</p>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="rounded-2xl bg-gradient-to-br from-teal-50 via-white to-cyan-50 border border-teal-100 shadow-md overflow-hidden"
          >
            <div className="px-6 pt-6 pb-4 border-b border-teal-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Ảnh menu</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Tải lên ảnh thực đơn của quán</p>
                </div>
                {formData.menuFiles.length > 0 && (
                  <div className="bg-teal-100 px-3 py-1.5 rounded-lg">
                    <span className="text-sm font-semibold text-teal-700">{formData.menuFiles.length} ảnh</span>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  handleFileChange(e.target.files)
                  e.target.value = ""
                }}
                disabled={formData.menuFiles.length >= MAX_IMAGES}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-teal-200 rounded-xl p-6 text-center hover:border-teal-400 hover:bg-teal-50/50 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <FileImage className="w-6 h-6 text-teal-600" />
                </div>
                <p className="text-sm font-semibold text-slate-700 mb-1">Tải lên tối đa {MAX_IMAGES} ảnh</p>
                <p className="text-xs text-slate-400">JPG, PNG, WEBP. Ảnh rõ nét cho kết quả tốt nhất.</p>
              </button>

              {formData.menuFiles.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <AnimatePresence initial={false}>
                    {formData.menuFiles.map((file, index) => (
                      <motion.div
                        key={`${file.name}-${index}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center justify-between bg-white border border-teal-100 rounded-lg px-4 py-2.5"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileImage className="w-4 h-4 text-teal-500 shrink-0" />
                          <span className="text-sm text-slate-700 truncate">{file.name}</span>
                          <span className="text-xs text-slate-400 shrink-0">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="rounded-2xl bg-gradient-to-br from-teal-50 via-white to-cyan-50 border border-teal-100 shadow-md overflow-hidden"
          >
            <div className="px-6 pt-6 pb-4 border-b border-teal-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Cấu hình khu vực</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Thiết lập số khu vực và số bàn tương ứng</p>
                </div>
                <div className="flex items-center gap-1.5 bg-teal-100 px-3 py-1.5 rounded-lg">
                  <span className="text-sm font-semibold text-teal-700">{totalTables} bàn</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Số khu vực</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setZoneCount(formData.zones.length - 1)}
                    className="w-9 h-9 rounded-lg border border-teal-200 flex items-center justify-center hover:bg-teal-50 transition-colors text-teal-600"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-xl font-bold text-teal-700">
                    {formData.zones.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoneCount(formData.zones.length + 1)}
                    className="w-9 h-9 rounded-lg border border-teal-200 flex items-center justify-center hover:bg-teal-50 transition-colors text-teal-600"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <AnimatePresence mode="popLayout">
                {formData.zones.map((zone, index) => (
                  <motion.div
                    key={zone.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-white border border-teal-100"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shrink-0 shadow-sm">
                      <span className="text-sm font-bold text-white">{index + 1}</span>
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 mb-1 block uppercase tracking-wider">Tên khu vực</label>
                        <input
                          value={zone.name}
                          onChange={(e) => updateZone(zone.id, "name", e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-teal-400 focus:ring-3 focus:ring-teal-50 transition-all"
                          placeholder={`Khu vực ${index + 1}`}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 mb-1 block uppercase tracking-wider">Số bàn</label>
                        <input
                          type="number"
                          min={0}
                          max={200}
                          value={zone.tableCount}
                          onChange={(e) =>
                            updateZone(zone.id, "tableCount", Math.max(0, parseInt(e.target.value) || 0))
                          }
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-teal-400 focus:ring-3 focus:ring-teal-50 transition-all"
                        />
                      </div>
                    </div>
                    {formData.zones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeZone(zone.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {formData.zones.length < 20 && (
                <button
                  type="button"
                  onClick={addZone}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-teal-200 rounded-xl text-sm font-semibold text-teal-600 hover:border-teal-400 hover:bg-teal-50 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Thêm khu vực
                </button>
              )}

              {errors.zones && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.zones}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="rounded-2xl bg-gradient-to-br from-teal-50 via-white to-cyan-50 border border-teal-100 shadow-md overflow-hidden"
          >
            <div className="px-6 pt-6 pb-4 border-b border-teal-100">
              <h2 className="text-base font-bold text-slate-800">Ghi chú & Xác nhận</h2>
              <p className="text-xs text-slate-500 mt-0.5">Thông tin bổ sung và kiểm tra lại trước khi khởi tạo</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Ghi chú</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Nhập ghi chú về quán, yêu cầu đặc biệt, hoặc thông tin thêm..."
                  className="w-full px-4 py-2.5 text-sm bg-white border border-teal-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-3 focus:ring-teal-100 transition-all min-h-[100px] resize-y"
                />
              </div>

              <div className="rounded-xl bg-teal-50 border border-teal-200 p-5 space-y-3">
                <h3 className="text-sm font-bold text-teal-800">Tóm tắt thông tin</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-500">Quán:</span>{" "}
                    <span className="font-semibold text-slate-800">{formData.restaurantName || "(chưa nhập)"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Khu vực:</span>{" "}
                    <span className="font-semibold text-slate-800">{formData.zones.length}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Tổng bàn:</span>{" "}
                    <span className="font-semibold text-slate-800">{totalTables}</span>
                  </div>
                  {formData.menuFiles.length > 0 && (
                    <div>
                      <span className="text-slate-500">Ảnh menu:</span>{" "}
                      <span className="font-semibold text-slate-800">{formData.menuFiles.length} ảnh</span>
                    </div>
                  )}
                  {formData.token && (
                    <div>
                      <span className="text-slate-500">Token:</span>{" "}
                      <span className="font-semibold text-slate-800 font-mono text-xs">{formData.token.slice(0, 20)}{formData.token.length > 20 ? "..." : ""}</span>
                    </div>
                  )}
                  {formData.phone && (
                    <div>
                      <span className="text-slate-500">SĐT:</span>{" "}
                      <span className="font-semibold text-slate-800">{formData.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <div>
          {step > 1 && (
            <Button type="button" variant="outline" onClick={prevStep}>
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {step < 4 ? (
            <Button type="button" variant="primary" onClick={nextStep} className="shadow-md shadow-primary/20">
              Tiếp theo
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button type="button" variant="primary" onClick={handleSubmit} className="shadow-md shadow-emerald-300 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500">
              <CheckCircle2 className="w-4 h-4" />
              Xác nhận khởi tạo
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
