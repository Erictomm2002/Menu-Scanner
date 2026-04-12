import { NextResponse } from 'next/server'
import { supabaseServiceRole } from '@/libs/supabase-client'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { email, name, role, is_active } = body

    const updates: Record<string, unknown> = {}
    if (email !== undefined) updates.email = email
    if (name !== undefined) updates.name = name
    if (role !== undefined) updates.role = role
    if (is_active !== undefined) updates.is_active = is_active

    const { data: user, error } = await supabaseServiceRole
      .from('allowed_users')
      .update(updates)
      .eq('id', id)
      .select('id, email, name, avatar_url, role, is_active, created_at')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabaseServiceRole
      .from('allowed_users')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
