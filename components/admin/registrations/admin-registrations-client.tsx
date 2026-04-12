'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { CheckCircle, XCircle, Clock, Users, Mail, User, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function formatRelativeTime(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'vừa xong'
  if (diffMins < 60) return `${diffMins} phút trước`
  if (diffHours < 24) return `${diffHours} giờ trước`
  if (diffDays < 7) return `${diffDays} ngày trước`
  return then.toLocaleDateString('vi-VN')
}

type RegistrationRequest = {
  id: string
  email: string
  name: string | null
  team_sale: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export function AdminRegistrationsClient() {
  const [requests, setRequests] = useState<RegistrationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [approvalRole, setApprovalRole] = useState<'owner' | 'staff'>('staff')

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/admin/registration-requests')
      if (res.ok) {
        const data = await res.json()
        setRequests(data)
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleApprove = async (id: string) => {
    setProcessingId(id)
    try {
      const res = await fetch(`/api/admin/registration-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', role: approvalRole }),
      })

      if (res.ok) {
        setRequests(requests.map(r => r.id === id ? { ...r, status: 'approved' as const } : r))
        showMessage('success', 'Đã phê duyệt yêu cầu')
      } else {
        const data = await res.json()
        showMessage('error', data.error || 'Có lỗi xảy ra')
      }
    } catch (error) {
      showMessage('error', 'Có lỗi xảy ra')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id: string) => {
    if (!confirm('Bạn có chắc muốn từ chối yêu cầu này?')) return

    setProcessingId(id)
    try {
      const res = await fetch(`/api/admin/registration-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      })

      if (res.ok) {
        setRequests(requests.map(r => r.id === id ? { ...r, status: 'rejected' as const } : r))
        showMessage('success', 'Đã từ chối yêu cầu')
      } else {
        const data = await res.json()
        showMessage('error', data.error || 'Có lỗi xảy ra')
      }
    } catch (error) {
      showMessage('error', 'Có lỗi xảy ra')
    } finally {
      setProcessingId(null)
    }
  }

  const filteredRequests = requests.filter(r => filter === 'all' || r.status === filter)
  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-[0_12px_32px_rgba(0,105,119,0.08)] sticky top-0 z-20">
        <div className="w-full px-6 py-4 max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#008080]" />
                <h1 className="text-lg font-semibold text-slate-900">Phê duyệt đăng ký</h1>
              </div>
              {pendingCount > 0 && (
                <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                  {pendingCount} chờ duyệt
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Message Toast */}
      {message && (
        <div
          className={`fixed top-20 right-6 z-50 px-6 py-4 rounded-xl shadow-lg transition-all ${
            message.type === 'success' ? 'bg-[#10b981] text-white' : 'bg-[#ef4444] text-white'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Main Content */}
      <div className="w-full px-6 py-6 max-w-5xl mx-auto">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2">
            {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008080] focus-visible:ring-offset-2 ${
                  filter === f
                    ? 'bg-[#008080] text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {f === 'all' ? 'Tất cả' : f === 'pending' ? 'Chờ duyệt' : f === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
              </button>
            ))}
          </div>
        </div>

        {/* Role Selection for Approval */}
        {pendingCount > 0 && (
          <Card variant="default" className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">Phê duyệt với vai trò:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setApprovalRole('staff')}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008080] focus-visible:ring-offset-2 ${
                      approvalRole === 'staff'
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Staff
                  </button>
                  <button
                    onClick={() => setApprovalRole('owner')}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 ${
                      approvalRole === 'owner'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Owner
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Requests List */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">Đang tải...</div>
        ) : filteredRequests.length === 0 ? (
          <Card variant="default">
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                {filter === 'pending' ? 'Không có yêu cầu nào đang chờ duyệt' : 'Không có yêu cầu nào'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((req) => (
              <Card key={req.id} variant="default">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#008080] to-[#20B2AA] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {req.email.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <p className="font-medium text-slate-900">{req.email}</p>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            req.status === 'pending'
                              ? 'bg-amber-100 text-amber-700'
                              : req.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {req.status === 'pending' ? 'Chờ duyệt' : req.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        {req.name && (
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {req.name}
                          </div>
                        )}
                        {req.team_sale && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {req.team_sale}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatRelativeTime(req.created_at)}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {req.status === 'pending' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApprove(req.id)}
                          disabled={processingId === req.id}
                        >
                          {processingId === req.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          {processingId === req.id ? '' : 'Duyệt'}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleReject(req.id)}
                          disabled={processingId === req.id}
                        >
                          {processingId === req.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          {processingId === req.id ? '' : 'Từ chối'}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 flex gap-6 text-sm text-slate-500">
          <span>Tổng cộng: <strong className="text-slate-700">{requests.length}</strong></span>
          <span>Chờ duyệt: <strong className="text-amber-600">{pendingCount}</strong></span>
          <span>Đã duyệt: <strong className="text-emerald-600">{requests.filter(r => r.status === 'approved').length}</strong></span>
          <span>Đã từ chối: <strong className="text-red-600">{requests.filter(r => r.status === 'rejected').length}</strong></span>
        </div>
      </div>
    </div>
  )
}
