'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import { Users, Settings } from 'lucide-react'

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user)
      if (user) {
        const { data: allowedUser } = await supabase
          .from('allowed_users')
          .select('role')
          .eq('email', user.email)
          .eq('is_active', true)
          .single()
        setIsOwner(allowedUser?.role === 'owner')

        // Fetch pending registration count
        if (allowedUser?.role === 'owner') {
          const { data: requests } = await supabase
            .from('registration_requests')
            .select('id', { count: 'exact' })
            .eq('status', 'pending')
          setPendingCount(requests?.length || 0)
        }
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsOwner(false)
      setPendingCount(0)
      setShowDropdown(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  if (loading) {
    return <div className="w-8 h-8 animate-pulse bg-slate-200 rounded-full" />
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-teal-600 border border-slate-200 hover:border-teal-300 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">Admin</span>
              {pendingCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                <Link
                  href="/admin/users"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setShowDropdown(false)}
                >
                  <Users className="w-4 h-4" />
                  Quản lý người dùng
                </Link>
                <Link
                  href="/admin/registrations"
                  className="flex items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setShowDropdown(false)}
                >
                  <span className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Phê duyệt đăng ký
                  </span>
                  {pendingCount > 0 && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              </div>
            )}
          </div>
        )}
        <img
          src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || 'U')}`}
          alt=""
          className="w-8 h-8 rounded-full border-2 border-teal-200"
        />
        <button
          onClick={handleLogout}
          className="text-sm text-slate-500 hover:text-red-500 transition-colors font-medium"
        >
          Đăng xuất
        </button>
      </div>
    )
  }

  return (
    <Link
      href="/login"
      className="px-4 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-colors"
    >
      Đăng nhập
    </Link>
  )
}
