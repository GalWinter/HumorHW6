'use client'

import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  is_superadmin: boolean
  is_in_study: boolean
  is_matrix_admin: boolean
  created_datetime_utc: string | null
}

export default function UserTable({ profiles }: { profiles: Profile[] }) {
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState<string | null>(null)
  const router = useRouter()

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase()
    return (
      (p.first_name?.toLowerCase().includes(q) ?? false) ||
      (p.last_name?.toLowerCase().includes(q) ?? false) ||
      (p.email?.toLowerCase().includes(q) ?? false) ||
      p.id.toLowerCase().includes(q)
    )
  })

  async function toggleField(profileId: string, field: 'is_superadmin' | 'is_in_study' | 'is_matrix_admin', currentVal: boolean) {
    setSaving(profileId + field)
    const supabase = createSupabaseBrowser()
    await supabase
      .from('profiles')
      .update({ [field]: !currentVal })
      .eq('id', profileId)
    setSaving(null)
    router.refresh()
  }

  function Toggle({
    checked,
    loading,
    onClick,
  }: {
    checked: boolean
    loading: boolean
    onClick: () => void
  }) {
    return (
      <button
        onClick={onClick}
        disabled={loading}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          checked ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'
        } ${loading ? 'opacity-50' : ''}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    )
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search by name, email, or ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">User</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Email</th>
                <th className="text-center px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Superadmin</th>
                <th className="text-center px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">In Study</th>
                <th className="text-center px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Matrix Admin</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900 dark:text-white">
                      {[p.first_name, p.last_name].filter(Boolean).join(' ') || 'Unnamed'}
                    </p>
                    <p className="text-xs text-zinc-400 font-mono">{p.id.slice(0, 8)}...</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{p.email ?? '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <Toggle
                      checked={p.is_superadmin}
                      loading={saving === p.id + 'is_superadmin'}
                      onClick={() => toggleField(p.id, 'is_superadmin', p.is_superadmin)}
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Toggle
                      checked={p.is_in_study}
                      loading={saving === p.id + 'is_in_study'}
                      onClick={() => toggleField(p.id, 'is_in_study', p.is_in_study)}
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Toggle
                      checked={p.is_matrix_admin}
                      loading={saving === p.id + 'is_matrix_admin'}
                      onClick={() => toggleField(p.id, 'is_matrix_admin', p.is_matrix_admin)}
                    />
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                    {p.created_datetime_utc
                      ? new Date(p.created_datetime_utc).toLocaleDateString()
                      : '—'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">
                    No users found.
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
