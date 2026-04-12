import { NextResponse } from 'next/server'
import { supabaseServiceRole } from '@/libs/supabase-client'

export async function GET() {
  try {
    const { data: users, error } = await supabaseServiceRole
      .from('allowed_users')
      .select('id, email, name, avatar_url, role, is_active, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, name, role = 'staff' } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if email already exists
    const { data: existing } = await supabaseServiceRole
      .from('allowed_users')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }

    const { data: user, error } = await supabaseServiceRole
      .from('allowed_users')
      .insert({ email, name, role })
      .select('id, email, name, avatar_url, role, is_active, created_at')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
