'use client'

import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

interface Mix {
  id: number
  humor_flavor_id: number
  caption_count: number
  created_datetime_utc: string | null
  humor_flavors: { slug: string } | null
}

export default function MixTable({ mixes }: { mixes: Mix[] }) {
  const [editing, setEditing] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  function startEdit(mix: Mix) {
    setEditing(mix.id)
    setEditValue(mix.caption_count.toString())
  }

  function cancelEdit() {
    setEditing(null)
    setEditValue('')
  }

  async function saveEdit(mixId: number) {
    const newCount = parseInt(editValue, 10)
    if (isNaN(newCount) || newCount < 0) {
      alert('Please enter a valid number')
      return
    }

    setSaving(true)
    const supabase = createSupabaseBrowser()
    const { error } = await supabase
      .from('humor_flavor_mix')
      .update({ caption_count: newCount })
      .eq('id', mixId)

    if (error) {
      alert('Failed to update: ' + error.message)
    } else {
      setEditing(null)
      setEditValue('')
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">ID</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Flavor</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Caption Count</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Created</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mixes.map((mix) => (
              <tr key={mix.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                <td className="px-4 py-3 text-slate-900 dark:text-white font-mono">{mix.id}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium text-xs">
                    {mix.humor_flavors?.slug || '—'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {editing === mix.id ? (
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-24 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={saving}
                      autoFocus
                    />
                  ) : (
                    <span className="text-slate-900 dark:text-white font-medium">{mix.caption_count}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                  {mix.created_datetime_utc
                    ? new Date(mix.created_datetime_utc).toLocaleString()
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  {editing === mix.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(mix.id)}
                        disabled={saving}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={saving}
                        className="px-3 py-1.5 bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 text-xs font-medium rounded-lg transition disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(mix)}
                      className="px-3 py-1.5 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 text-xs font-medium rounded-lg transition"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {mixes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No mixes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
