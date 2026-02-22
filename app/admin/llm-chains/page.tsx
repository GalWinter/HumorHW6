import { createSupabaseServer } from '@/lib/supabase-server'

export default async function LLMChainsPage() {
  const supabase = await createSupabaseServer()

  const { data: chains, count } = await supabase
    .from('llm_prompt_chains')
    .select('id, caption_request_id, created_datetime_utc', { count: 'exact' })
    .order('created_datetime_utc', { ascending: false })
    .limit(200)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">LLM Prompt Chains</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          View LLM prompt chains. Showing latest 200 of {(count ?? 0).toLocaleString()} total.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">ID</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Caption Request ID</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Created</th>
              </tr>
            </thead>
            <tbody>
              {chains?.map((chain) => (
                <tr key={chain.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3 text-slate-900 dark:text-white font-mono">{chain.id}</td>
                  <td className="px-4 py-3 text-slate-900 dark:text-white font-mono">{chain.caption_request_id}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {chain.created_datetime_utc
                      ? new Date(chain.created_datetime_utc).toLocaleString()
                      : '—'}
                  </td>
                </tr>
              ))}
              {(!chains || chains.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                    No LLM prompt chains found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
