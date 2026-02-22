import { createSupabaseServer } from '@/lib/supabase-server'

export default async function FlavorsPage() {
  const supabase = await createSupabaseServer()

  const { data: flavors } = await supabase
    .from('humor_flavors')
    .select('id, slug, description, created_datetime_utc')
    .order('id', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Humor Flavors</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          View all humor flavors. {flavors?.length ?? 0} total.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">ID</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Description</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Created</th>
              </tr>
            </thead>
            <tbody>
              {flavors?.map((flavor) => (
                <tr key={flavor.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3 text-slate-900 dark:text-white font-mono">{flavor.id}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium text-xs">
                      {flavor.slug}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{flavor.description || '—'}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {flavor.created_datetime_utc
                      ? new Date(flavor.created_datetime_utc).toLocaleString()
                      : '—'}
                  </td>
                </tr>
              ))}
              {(!flavors || flavors.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    No flavors found.
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
