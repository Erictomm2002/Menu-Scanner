'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  if (loading) {
    return (
      <div className="w-8 h-8 animate-pulse bg-slate-200 rounded-full" />
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
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
