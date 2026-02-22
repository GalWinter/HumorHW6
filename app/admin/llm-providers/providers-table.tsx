'use client'

import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

interface LLMProvider {
  id: string
  name: string
  created_datetime_utc: string | null
}

export default function ProvidersTable({ providers }: { providers: LLMProvider[] }) {
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const router = useRouter()

  const [newProvider, setNewProvider] = useState({ name: '' })
  const [editData, setEditData] = useState<Partial<LLMProvider>>({})

  const filtered = providers.filter((p) => {
    const q = search.toLowerCase()
    return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
  })

  async function handleAdd() {
    if (!newProvider.name) return
    setSaving(true)
    const supabase = createSupabaseBrowser()
    await supabase.from('llm_providers').insert({ name: newProvider.name })
    setNewProvider({ name: '' })
    setShowAddForm(false)
    setSaving(false)
    router.refresh()
  }

  async function handleEdit(id: string) {
    setSaving(true)
    const supabase = createSupabaseBrowser()
    await supabase.from('llm_providers').update(editData).eq('id', id)
    setEditingId(null)
    setEditData({})
    setSaving(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    setSaving(true)
    const supabase = createSupabaseBrowser()
    await supabase.from('llm_providers').delete().eq('id', id)
    setDeleteConfirm(null)
    setSaving(false)
    router.refresh()
  }

  function startEdit(provider: LLMProvider) {
    setEditingId(provider.id)
    setEditData(provider)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search providers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-md px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition"
        >
          {showAddForm ? 'Cancel' : 'Add Provider'}
        </button>
      </div>

      {showAddForm && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add New LLM Provider</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Provider Name *
              </label>
              <input
                type="text"
                value={newProvider.name}
                onChange={(e) => setNewProvider({ name: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., OpenAI, Anthropic, Google..."
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={saving || !newProvider.name}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition"
            >
              {saving ? 'Adding...' : 'Add Provider'}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Provider Name</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">ID</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Created</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((provider) => (
                <tr key={provider.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  {editingId === provider.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editData.name ?? ''}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs font-mono">
                        {provider.id.slice(0, 8)}...
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                        {provider.created_datetime_utc ? new Date(provider.created_datetime_utc).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(provider.id)}
                            disabled={saving}
                            className="px-3 py-1.5 bg-green-500/10 text-green-600 hover:bg-green-500/20 text-xs font-medium rounded-lg transition"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => { setEditingId(null); setEditData({}) }}
                            disabled={saving}
                            className="px-3 py-1.5 bg-slate-500/10 text-slate-600 dark:text-slate-400 hover:bg-slate-500/20 text-xs font-medium rounded-lg transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 dark:text-white">{provider.name}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs font-mono">
                        {provider.id.slice(0, 8)}...
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                        {provider.created_datetime_utc ? new Date(provider.created_datetime_utc).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {deleteConfirm === provider.id ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleDelete(provider.id)}
                              disabled={saving}
                              className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-medium rounded-lg transition"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              disabled={saving}
                              className="px-3 py-1.5 bg-slate-500/10 text-slate-600 dark:text-slate-400 hover:bg-slate-500/20 text-xs font-medium rounded-lg transition"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => startEdit(provider)}
                              className="px-3 py-1.5 bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 text-xs font-medium rounded-lg transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(provider.id)}
                              className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-medium rounded-lg transition"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    No providers found.
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
