import { AdminRegistrationsClient } from '@/components/admin/registrations/admin-registrations-client'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminRegistrationsPage() {
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

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <AdminRegistrationsClient />
    </main>
  )
}
