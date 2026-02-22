import { createSupabaseServer } from '@/lib/supabase-server'
import UserTable from './user-table'

export default async function UsersPage() {
  const supabase = await createSupabaseServer()

  const { data: profiles } = await supabase
    .from('profiles')
    .select(`
      id,
      first_name,
      last_name,
      email,
      is_superadmin,
      is_in_study,
      is_matrix_admin,
      created_datetime_utc
    `)
    .order('created_datetime_utc', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Users &amp; Profiles</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Manage user profiles and permissions. {profiles?.length ?? 0} total users.
        </p>
      </div>
      <UserTable profiles={profiles ?? []} />
    </div>
  )
}
