import { createSupabaseServer } from '@/lib/supabase-server'
import ProvidersTable from './providers-table'

export default async function LLMProvidersPage() {
  const supabase = await createSupabaseServer()

  const { data: providers } = await supabase
    .from('llm_providers')
    .select('id, name, created_datetime_utc')
    .order('name')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">LLM Providers</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage LLM provider services. {providers?.length ?? 0} total providers.
        </p>
      </div>
      <ProvidersTable providers={providers ?? []} />
    </div>
  )
}
