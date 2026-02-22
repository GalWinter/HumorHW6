'use client'

import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

interface LLMModel {
  id: string
  name: string
  provider_model_id: string
  is_temperature_supported: boolean
  llm_provider_id: string | null
}

interface LLMProvider {
  id: string
  name: string
}

export default function ModelsTable({ models, providers }: { models: LLMModel[]; providers: LLMProvider[] }) {
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const router = useRouter()

  const [newModel, setNewModel] = useState({
    name: '',
    provider_model_id: '',
    is_temperature_supported: false,
    llm_provider_id: ''
  })

  const [editData, setEditData] = useState<Partial<LLMModel>>({})

  const filtered = models.filter((m) => {
    const q = search.toLowerCase()
    return (
      m.name.toLowerCase().includes(q) ||
      m.provider_model_id.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q)
    )
  })

  async function handleAdd() {
    if (!newModel.name || !newModel.provider_model_id) return
    setSaving(true)
    const supabase = createSupabaseBrowser()
    await supabase.from('llm_models').insert({
      name: newModel.name,
      provider_model_id: newModel.provider_model_id,
      is_temperature_supported: newModel.is_temperature_supported,
      llm_provider_id: newModel.llm_provider_id || null
    })
    setNewModel({ name: '', provider_model_id: '', is_temperature_supported: false, llm_provider_id: '' })
    setShowAddForm(false)
    setSaving(false)
    router.refresh()
  }

  async function handleEdit(id: string) {
    setSaving(true)
    const supabase = createSupabaseBrowser()
    await supabase.from('llm_models').update(editData).eq('id', id)
    setEditingId(null)
    setEditData({})
    setSaving(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    setSaving(true)
    const supabase = createSupabaseBrowser()
    await supabase.from('llm_models').delete().eq('id', id)
    setDeleteConfirm(null)
    setSaving(false)
    router.refresh()
  }

  function startEdit(model: LLMModel) {
    setEditingId(model.id)
    setEditData(model)
  }

  function getProviderName(providerId: string | null) {
    if (!providerId) return '—'
    return providers.find(p => p.id === providerId)?.name ?? '—'
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search models..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-md px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition"
        >
          {showAddForm ? 'Cancel' : 'Add Model'}
        </button>
      </div>

      {showAddForm && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add New LLM Model</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={newModel.name}
                onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Model name..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Provider Model ID *
              </label>
              <input
                type="text"
                value={newModel.provider_model_id}
                onChange={(e) => setNewModel({ ...newModel, provider_model_id: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., gpt-4, claude-3-opus..."
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={newModel.is_temperature_supported}
                  onChange={(e) => setNewModel({ ...newModel, is_temperature_supported: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                />
                Temperature Supported
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Provider
              </label>
              <select
                value={newModel.llm_provider_id}
                onChange={(e) => setNewModel({ ...newModel, llm_provider_id: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select provider...</option>
                {providers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAdd}
              disabled={saving || !newModel.name || !newModel.provider_model_id}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition"
            >
              {saving ? 'Adding...' : 'Add Model'}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Name</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Provider Model ID</th>
                <th className="text-center px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Temperature</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Provider</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((model) => (
                <tr key={model.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  {editingId === model.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editData.name ?? ''}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editData.provider_model_id ?? ''}
                          onChange={(e) => setEditData({ ...editData, provider_model_id: e.target.value })}
                          className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={editData.is_temperature_supported ?? false}
                          onChange={(e) => setEditData({ ...editData, is_temperature_supported: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={editData.llm_provider_id ?? ''}
                          onChange={(e) => setEditData({ ...editData, llm_provider_id: e.target.value || null })}
                          className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                        >
                          <option value="">None</option>
                          {providers.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(model.id)}
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
                        <p className="font-medium text-slate-900 dark:text-white">{model.name}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono text-xs">
                        {model.provider_model_id}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {model.is_temperature_supported ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 text-xs font-medium">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {getProviderName(model.llm_provider_id)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {deleteConfirm === model.id ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleDelete(model.id)}
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
                              onClick={() => startEdit(model)}
                              className="px-3 py-1.5 bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 text-xs font-medium rounded-lg transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(model.id)}
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
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No models found.
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
