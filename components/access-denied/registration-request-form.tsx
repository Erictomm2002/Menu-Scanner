'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Phone, Clock, Users, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface RegistrationRequestFormProps {
  email?: string
  onBack?: () => void
}

export function RegistrationRequestForm({ email: prefillEmail, onBack }: RegistrationRequestFormProps) {
  const [email, setEmail] = useState(prefillEmail || '')
  const [fullName, setFullName] = useState('')
  const [teamSale, setTeamSale] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Vui lòng nhập email của bạn')
      return
    }

    if (!email.includes('@')) {
      setError('Email không hợp lệ')
      return
    }

    if (!fullName.trim()) {
      setError('Vui lòng nhập họ và tên của bạn')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/admin/registration-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: fullName, team_sale: teamSale }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Có lỗi xảy ra')
        setLoading(false)
        return
      }

      setSubmitted(true)
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">
          Đăng ký thành công!
        </h3>
        <p className="text-sm text-slate-600 mb-6">
          Chúng tôi đã nhận được thông tin của bạn. Bạn sẽ được cấp quyền trong <strong>2-3 ngày làm việc</strong>.
        </p>

        {/* Contact Info */}
        <div className="bg-slate-50 rounded-xl p-4 text-left">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">
            Liên hệ hỗ trợ
          </p>
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-slate-800">Phạm Trọng Tường OSCAR</p>
              <a href="tel:0981037330" className="text-teal-600 hover:text-teal-700 font-medium">
                0981037330
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>
      )}

      {/* Email */}
      <div>
        <label className="text-xs font-semibold mb-1.5 block text-slate-700">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email của bạn"
          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Full Name */}
      <div>
        <label className="text-xs font-semibold mb-1.5 block text-slate-700">
          Họ và tên <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nhập họ và tên của bạn"
          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Team Sale */}
      <div>
        <label className="text-xs font-semibold mb-1.5 block text-slate-700">
          Team Sale (nếu làm trong iPOS)
        </label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={teamSale}
            onChange={(e) => setTeamSale(e.target.value)}
            placeholder="Nhập tên team sale của bạn"
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Đang gửi...' : 'Đăng ký sử dụng'}
      </Button>

      {/* Info Box */}
      <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Clock className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-teal-800 mb-1">
              Thời gian xử lý
            </p>
            <p className="text-teal-700">
              Bạn sẽ được cấp quyền trong <strong>2-3 ngày làm việc</strong> sau khi đăng ký.
            </p>
          </div>
        </div>
      </div>

      {/* Hotline */}
      <div className="border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-500 text-center mb-2">
          Cần hỗ trợ gấp?
        </p>
        <a
          href="tel:0981037330"
          className="flex items-center justify-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
        >
          <Phone className="w-4 h-4" />
          Phạm Trọng Tường OSCAR - 0981037330
        </a>
      </div>
    </form>
  )
}
