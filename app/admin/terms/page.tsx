import { createSupabaseServer } from '@/lib/supabase-server'
import TermsTable from './terms-table'

export default async function TermsPage() {
  const supabase = await createSupabaseServer()

  const { data: terms } = await supabase
    .from('terms')
    .select('id, term, definition, example, priority, term_type_id, created_datetime_utc')
    .order('priority', { ascending: false })

  const { data: termTypes } = await supabase
    .from('term_types')
    .select('id, name')
    .order('name')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Terms</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage humor and rhetoric terms. {terms?.length ?? 0} total terms.
        </p>
      </div>
      <TermsTable terms={terms ?? []} termTypes={termTypes ?? []} />
    </div>
  )
}
