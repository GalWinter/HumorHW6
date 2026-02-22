import { createSupabaseServer } from '@/lib/supabase-server'

export default async function FlavorStepsPage() {
  const supabase = await createSupabaseServer()

  const { data: steps } = await supabase
    .from('humor_flavor_steps')
    .select(`
      id,
      description,
      humor_flavor_id,
      llm_model_id,
      order_by,
      humor_flavor_step_type_id,
      humor_flavors(slug),
      humor_flavor_step_types(slug),
      llm_models(name)
    `)
    .order('humor_flavor_id', { ascending: true })
    .order('order_by', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Humor Flavor Steps</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          View all flavor steps with their configurations. {steps?.length ?? 0} total.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">ID</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Flavor</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Step Type</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Order</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Model</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Description</th>
              </tr>
            </thead>
            <tbody>
              {steps?.map((step) => (
                <tr key={step.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3 text-slate-900 dark:text-white font-mono">{step.id}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium text-xs">
                      {(step.humor_flavors as any)?.slug || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium text-xs">
                      {(step.humor_flavor_step_types as any)?.slug || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-900 dark:text-white font-mono">{step.order_by}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium text-xs">
                      {(step.llm_models as any)?.name || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-md truncate">
                    {step.description || '—'}
                  </td>
                </tr>
              ))}
              {(!steps || steps.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No flavor steps found.
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
