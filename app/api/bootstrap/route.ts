import { createSupabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createSupabaseServer()

  // 1. Check who is calling
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'You must be logged in to bootstrap.' },
      { status: 401 }
    )
  }

  // 2. Check if any superadmin already exists
  const { data: existingAdmins, error: queryError } = await supabase
    .from('profiles')
    .select('id')
    .eq('is_superadmin', true)
    .limit(1)

  if (queryError) {
    return NextResponse.json(
      { error: 'Could not check for existing admins: ' + queryError.message },
      { status: 500 }
    )
  }

  if (existingAdmins && existingAdmins.length > 0) {
    return NextResponse.json(
      { error: 'A superadmin already exists. Bootstrap is disabled.' },
      { status: 403 }
    )
  }

  // 3. Promote the current user to superadmin
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ is_superadmin: true })
    .eq('id', user.id)

  if (updateError) {
    return NextResponse.json(
      { error: 'Failed to promote user: ' + updateError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    message: `User ${user.email} has been promoted to superadmin.`,
  })
}
