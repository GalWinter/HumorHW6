import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminShell from './admin-shell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin, first_name, last_name, email')
    .eq('id', user.id)
    .single()

  if (!profile?.is_superadmin) redirect('/login')

  return (
    <AdminShell
      user={{
        email: user.email ?? profile.email ?? '',
        name: [profile.first_name, profile.last_name].filter(Boolean).join(' ') || (user.email ?? 'Admin'),
      }}
    >
      {children}
    </AdminShell>
  )
}
