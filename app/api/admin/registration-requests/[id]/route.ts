import { NextResponse } from 'next/server'
import { supabaseServiceRole } from '@/libs/supabase-client'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, role = 'staff' } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Get the request
    const { data: regRequest } = await supabaseServiceRole
      .from('registration_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (!regRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (regRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 400 })
    }

    if (action === 'approve') {
      // Add to allowed_users
      const { error: insertError } = await supabaseServiceRole
        .from('allowed_users')
        .insert({
          email: regRequest.email,
          name: regRequest.name,
          role,
          is_active: true,
        })

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      // Update request status
      await supabaseServiceRole
        .from('registration_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)

      return NextResponse.json({ success: true, action: 'approved' })
    } else {
      // Reject
      await supabaseServiceRole
        .from('registration_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)

      return NextResponse.json({ success: true, action: 'rejected' })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
