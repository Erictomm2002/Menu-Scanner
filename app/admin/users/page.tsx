import { AdminUsersClient } from '@/components/admin/users/admin-users-client'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  // Check if current user is owner
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: allowedUser } = await supabase
      .from('allowed_users')
      .select('role')
      .eq('email', user.email)
      .eq('is_active', true)
      .single()

    if (!allowedUser || allowedUser.role !== 'owner') {
      redirect('/access-denied')
    }
  } else {
    redirect('/login')
  }

  // Fetch all users server-side
  const { data: users } = await supabase
    .from('allowed_users')
    .select('id, email, name, role, is_active, created_at')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <AdminUsersClient initialUsers={users || []} />
    </main>
  )
}
