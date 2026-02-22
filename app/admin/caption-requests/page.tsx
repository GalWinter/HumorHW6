import { createSupabaseServer } from '@/lib/supabase-server'

export default async function CaptionRequestsPage() {
  const supabase = await createSupabaseServer()

  const { data: requests, count } = await supabase
    .from('caption_requests')
    .select('id, profile_id, image_id, created_datetime_utc', { count: 'exact' })
    .order('created_datetime_utc', { ascending: false })
    .limit(200)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Caption Requests</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          View caption requests. Showing latest 200 of {(count ?? 0).toLocaleString()} total.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">ID</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Profile ID</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Image ID</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Created</th>
              </tr>
            </thead>
            <tbody>
              {requests?.map((request) => (
                <tr key={request.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3 text-slate-900 dark:text-white font-mono">{request.id}</td>
                  <td className="px-4 py-3">
                    <span className="text-slate-600 dark:text-slate-300 font-mono text-xs">
                      {request.profile_id?.slice(0, 8)}...
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-900 dark:text-white font-mono">{request.image_id}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {request.created_datetime_utc
                      ? new Date(request.created_datetime_utc).toLocaleString()
                      : '—'}
                  </td>
                </tr>
              ))}
              {(!requests || requests.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    No caption requests found.
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
