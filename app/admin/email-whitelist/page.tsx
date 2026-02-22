import { createSupabaseServer } from '@/lib/supabase-server'
import WhitelistTable from './whitelist-table'

export default async function EmailWhitelistPage() {
  const supabase = await createSupabaseServer()

  const { data: emails } = await supabase
    .from('whitelist_email_addresses')
    .select('id, email_address, created_datetime_utc, modified_datetime_utc')
    .order('email_address')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Email Whitelist</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage whitelisted email addresses. {emails?.length ?? 0} total entries.
        </p>
      </div>
      <WhitelistTable emails={emails ?? []} />
    </div>
  )
}
