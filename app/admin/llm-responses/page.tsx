import { createSupabaseServer } from '@/lib/supabase-server'

export default async function LLMResponsesPage() {
  const supabase = await createSupabaseServer()

  const { data: responses, count } = await supabase
    .from('llm_model_responses')
    .select(`
      id,
      llm_model_response,
      processing_time_seconds,
      llm_model_id,
      profile_id,
      created_datetime_utc,
      llm_models(name)
    `, { count: 'exact' })
    .order('created_datetime_utc', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">LLM Model Responses</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          View LLM model responses. Showing latest 100 of {(count ?? 0).toLocaleString()} total.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">ID</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Model</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Response</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Time (s)</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Profile ID</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Created</th>
              </tr>
            </thead>
            <tbody>
              {responses?.map((response) => (
                <tr key={response.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3 text-slate-900 dark:text-white font-mono">{response.id}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium text-xs">
                      {(response.llm_models as any)?.name || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-md">
                    <div className="truncate" title={response.llm_model_response || ''}>
                      {response.llm_model_response
                        ? response.llm_model_response.length > 100
                          ? response.llm_model_response.substring(0, 100) + '...'
                          : response.llm_model_response
                        : '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-900 dark:text-white font-mono">
                    {response.processing_time_seconds?.toFixed(2) ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-600 dark:text-slate-300 font-mono text-xs">
                      {response.profile_id?.slice(0, 8)}...
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {response.created_datetime_utc
                      ? new Date(response.created_datetime_utc).toLocaleString()
                      : '—'}
                  </td>
                </tr>
              ))}
              {(!responses || responses.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No LLM responses found.
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
