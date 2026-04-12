'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Plus, Search, Edit2, ToggleLeft, ToggleRight, Trash2, X, UserCheck, UserX, Users, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type User = {
  id: string
  email: string
  name: string | null
  role: 'owner' | 'staff'
  is_active: boolean
  created_at: string
}

interface AdminUsersClientProps {
  initialUsers: User[]
}

export function AdminUsersClient({ initialUsers }: AdminUsersClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | 'owner' | 'staff'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  // Form state
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'owner' | 'staff'>('staff')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && user.is_active) ||
      (filterStatus === 'inactive' && !user.is_active)
    return matchesSearch && matchesRole && matchesStatus
  })

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSaving(true)

    if (!email) {
      setFormError('Email là bắt buộc')
      setSaving(false)
      return
    }

    if (!email.includes('@')) {
      setFormError('Email không hợp lệ')
      setSaving(false)
      return
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role }),
      })
      const data = await res.json()

      if (!res.ok) {
        setFormError(data.error || 'Có lỗi xảy ra')
        setSaving(false)
        return
      }

      setUsers([data, ...users])
      resetForm()
      showMessage('success', 'Đã thêm người dùng thành công')
    } catch (error) {
      setFormError('Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setFormError('')
    setSaving(true)

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role }),
      })
      const data = await res.json()

      if (!res.ok) {
        setFormError(data.error || 'Có lỗi xảy ra')
        setSaving(false)
        return
      }

      setUsers(users.map(u => u.id === data.id ? data : u))
      resetForm()
      showMessage('success', 'Đã cập nhật người dùng thành công')
    } catch (error) {
      setFormError('Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (user: User) => {
    setProcessingId(user.id)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !user.is_active }),
      })

      if (res.ok) {
        setUsers(users.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u))
        showMessage('success', `${user.is_active ? 'Đã vô hiệu hóa' : 'Đã kích hoạt'} ${user.email}`)
      }
    } catch (error) {
      showMessage('error', 'Có lỗi xảy ra')
    } finally {
      setProcessingId(null)
    }
  }

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Xóa người dùng ${user.email}? Hành động này không thể hoàn tác.`)) return

    setProcessingId(user.id)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setUsers(users.filter(u => u.id !== user.id))
        showMessage('success', 'Đã xóa người dùng')
      }
    } catch (error) {
      showMessage('error', 'Có lỗi xảy ra')
    } finally {
      setProcessingId(null)
    }
  }

  const startEdit = (user: User) => {
    setEditingUser(user)
    setEmail(user.email)
    setName(user.name || '')
    setRole(user.role)
    setShowForm(false)
  }

  const resetForm = () => {
    setEmail('')
    setName('')
    setRole('staff')
    setFormError('')
    setEditingUser(null)
    setShowForm(false)
  }

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
                <h1 className="text-lg font-semibold text-slate-900">Quản lý người dùng</h1>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingUser(null)
                setEmail('')
                setName('')
                setRole('staff')
                setFormError('')
                setShowForm(true)
              }}
              variant="primary"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              Thêm người dùng
            </Button>
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
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm email hoặc tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as typeof filterRole)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#008080]"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="owner">Owner</option>
              <option value="staff">Staff</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#008080]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
        </div>

        {/* Add/Edit Form */}
        {(showForm || editingUser) && (
          <Card variant="default" className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-slate-900">
                  {editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block text-slate-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      disabled={!!editingUser}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] ${
                        editingUser ? 'bg-slate-50 text-slate-500' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block text-slate-700">
                      Tên hiển thị
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tên người dùng"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block text-slate-700">
                      Vai trò
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as 'owner' | 'staff')}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#008080] bg-white"
                    >
                      <option value="staff">Staff</option>
                      <option value="owner">Owner</option>
                    </select>
                  </div>
                </div>
                {formError && <p className="text-sm text-red-500">{formError}</p>}
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={saving}
                    size="sm"
                  >
                    {saving ? 'Đang lưu...' : editingUser ? 'Cập nhật' : 'Thêm mới'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={resetForm}
                    size="sm"
                  >
                    Hủy
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Users List */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">Đang tải...</div>
        ) : filteredUsers.length === 0 ? (
          <Card variant="default">
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                {searchQuery || filterRole !== 'all' || filterStatus !== 'all'
                  ? 'Không tìm thấy người dùng phù hợp'
                  : 'Chưa có người dùng nào'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card variant="default" className="overflow-hidden">
            <div className="divide-y divide-slate-100">
              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <div className="col-span-5">Người dùng</div>
                <div className="col-span-3">Vai trò</div>
                <div className="col-span-2">Trạng thái</div>
                <div className="col-span-2 text-right">Thao tác</div>
              </div>
              {/* Table Rows */}
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors items-center"
                >
                  {/* User Info */}
                  <div className="col-span-1 md:col-span-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#008080] to-[#20B2AA] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{user.email}</p>
                      {user.name && (
                        <p className="text-sm text-slate-500 truncate">{user.name}</p>
                      )}
                    </div>
                  </div>
                  {/* Role */}
                  <div className="col-span-1 md:col-span-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === 'owner'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {user.role === 'owner' ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5"></span>
                          Owner
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
                          Staff
                        </>
                      )}
                    </span>
                  </div>
                  {/* Status */}
                  <div className="col-span-1 md:col-span-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.is_active
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {user.is_active ? (
                        <>
                          <UserCheck className="w-3 h-3 mr-1" />
                          Hoạt động
                        </>
                      ) : (
                        <>
                          <UserX className="w-3 h-3 mr-1" />
                          Bị khóa
                        </>
                      )}
                    </span>
                  </div>
                  {/* Actions */}
                  <div className="col-span-1 md:col-span-2 flex justify-end gap-1">
                    <button
                      onClick={() => startEdit(user)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-[#008080] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008080] focus-visible:ring-offset-2"
                      title="Chỉnh sửa"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(user)}
                      disabled={processingId === user.id}
                      className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        user.is_active ? 'text-slate-500 hover:text-amber-600' : 'text-slate-500 hover:text-emerald-600'
                      }`}
                      title={user.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                    >
                      {processingId === user.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : user.is_active ? (
                        <ToggleRight className="w-4 h-4" />
                      ) : (
                        <ToggleLeft className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      disabled={processingId === user.id}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Stats Summary */}
        <div className="mt-6 flex gap-6 text-sm text-slate-500">
          <span>
            Tổng cộng: <strong className="text-slate-700">{users.length}</strong> người dùng
          </span>
          <span>
            Hoạt động: <strong className="text-emerald-600">{users.filter(u => u.is_active).length}</strong>
          </span>
          <span>
            Bị khóa: <strong className="text-red-600">{users.filter(u => !u.is_active).length}</strong>
          </span>
        </div>
      </div>
    </div>
  )
}
