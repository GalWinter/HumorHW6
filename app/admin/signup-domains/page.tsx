import { createSupabaseServer } from '@/lib/supabase-server'
import DomainsTable from './domains-table'

export default async function SignupDomainsPage() {
  const supabase = await createSupabaseServer()

  const { data: domains } = await supabase
    .from('allowed_signup_domains')
    .select('id, apex_domain, created_datetime_utc')
    .order('apex_domain')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Allowed Signup Domains</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage domains that are allowed to sign up. {domains?.length ?? 0} total domains.
        </p>
      </div>
      <DomainsTable domains={domains ?? []} />
    </div>
  )
}
