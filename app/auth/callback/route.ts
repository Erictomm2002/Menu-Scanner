import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()

    // 1. Exchange authorization code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // 2. Get user information
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // 3. Check if email is in whitelist and is active
        const { data: allowed } = await supabase
          .from('allowed_users')
          .select('*')
          .eq('email', user.email)
          .eq('is_active', true)
          .single()

        if (!allowed) {
          // Email not in whitelist - sign out and redirect to access denied
          await supabase.auth.signOut()
          const email = encodeURIComponent(user.email || '')
          return NextResponse.redirect(`${origin}/access-denied?email=${email}`)
        }

        // 4. Update user profile in whitelist if needed
        await supabase
          .from('allowed_users')
          .update({
            name: user.user_metadata?.full_name || user.user_metadata?.name,
            avatar_url: user.user_metadata?.avatar_url,
          })
          .eq('email', user.email)
      }

      // 5. Login successful - redirect to home
      return NextResponse.redirect(`${origin}/`)
    }
  }

  // Error occurred - redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
