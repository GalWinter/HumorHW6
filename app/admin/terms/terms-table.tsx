'use client'

import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

interface Term {
  id: string
  term: string
  definition: string
  example: string | null
  priority: number
  term_type_id: string | null
  created_datetime_utc: string | null
}

interface TermType {
  id: string
  name: string
}

export default function TermsTable({ terms, termTypes }: { terms: Term[]; termTypes: TermType[] }) {
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const router = useRouter()

  const [newTerm, setNewTerm] = useState({
    term: '',
    definition: '',
    example: '',
    priority: 0,
    term_type_id: ''
  })

  const [editData, setEditData] = useState<Partial<Term>>({})

  const filtered = terms.filter((t) => {
    const q = search.toLowerCase()
    return (
      t.term.toLowerCase().includes(q) ||
      t.definition.toLowerCase().includes(q) ||
      (t.example?.toLowerCase().includes(q) ?? false) ||
      t.id.toLowerCase().includes(q)
    )
  })

  async function handleAdd() {
    if (!newTerm.term || !newTerm.definition) return
    setSaving(true)
    const supabase = createSupabaseBrowser()
    await supabase.from('terms').insert({
      term: newTerm.term,
      definition: newTerm.definition,
      example: newTerm.example || null,
      priority: newTerm.priority,
      term_type_id: newTerm.term_type_id || null
    })
    setNewTerm({ term: '', definition: '', example: '', priority: 0, term_type_id: '' })
    setShowAddForm(false)
    setSaving(false)
    router.refresh()
  }

  async function handleEdit(id: string) {
    setSaving(true)
    const supabase = createSupabaseBrowser()
    await supabase.from('terms').update(editData).eq('id', id)
    setEditingId(null)
    setEditData({})
    setSaving(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    setSaving(true)
    const supabase = createSupabaseBrowser()
    await supabase.from('terms').delete().eq('id', id)
    setDeleteConfirm(null)
    setSaving(false)
    router.refresh()
  }

  function startEdit(term: Term) {
    setEditingId(term.id)
    setEditData(term)
  }

  function getTermTypeName(typeId: string | null) {
    if (!typeId) return '—'
    return termTypes.find(t => t.id === typeId)?.name ?? '—'
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search terms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-md px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition"
        >
          {showAddForm ? 'Cancel' : 'Add Term'}
        </button>
      </div>

      {showAddForm && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add New Term</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Term *
              </label>
              <input
                type="text"
                value={newTerm.term}
                onChange={(e) => setNewTerm({ ...newTerm, term: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Term name..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Definition *
              </label>
              <textarea
                value={newTerm.definition}
                onChange={(e) => setNewTerm({ ...newTerm, definition: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="Definition..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Example
              </label>
              <textarea
                value={newTerm.example}
                onChange={(e) => setNewTerm({ ...newTerm, example: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={2}
                placeholder="Optional example..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Priority
                </label>
                <input
                  type="number"
                  value={newTerm.priority}
                  onChange={(e) => setNewTerm({ ...newTerm, priority: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Term Type
                </label>
                <select
                  value={newTerm.term_type_id}
                  onChange={(e) => setNewTerm({ ...newTerm, term_type_id: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">None</option>
                  {termTypes.map(tt => (
                    <option key={tt.id} value={tt.id}>{tt.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleAdd}
              disabled={saving || !newTerm.term || !newTerm.definition}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition"
            >
              {saving ? 'Adding...' : 'Add Term'}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Term</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Definition</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Example</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Priority</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Type</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Created</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((term) => (
                <tr key={term.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  {editingId === term.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editData.term ?? ''}
                          onChange={(e) => setEditData({ ...editData, term: e.target.value })}
                          className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <textarea
                          value={editData.definition ?? ''}
                          onChange={(e) => setEditData({ ...editData, definition: e.target.value })}
                          className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                          rows={2}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <textarea
                          value={editData.example ?? ''}
                          onChange={(e) => setEditData({ ...editData, example: e.target.value })}
                          className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                          rows={2}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={editData.priority ?? 0}
                          onChange={(e) => setEditData({ ...editData, priority: parseInt(e.target.value) || 0 })}
                          className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={editData.term_type_id ?? ''}
                          onChange={(e) => setEditData({ ...editData, term_type_id: e.target.value || null })}
                          className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                        >
                          <option value="">None</option>
                          {termTypes.map(tt => (
                            <option key={tt.id} value={tt.id}>{tt.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                        {term.created_datetime_utc ? new Date(term.created_datetime_utc).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(term.id)}
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
                        <p className="font-medium text-slate-900 dark:text-white">{term.term}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-600 dark:text-slate-300 line-clamp-2">{term.definition}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        <p className="line-clamp-2">{term.example ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-900 dark:text-white">{term.priority}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {getTermTypeName(term.term_type_id)}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                        {term.created_datetime_utc ? new Date(term.created_datetime_utc).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {deleteConfirm === term.id ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleDelete(term.id)}
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
                              onClick={() => startEdit(term)}
                              className="px-3 py-1.5 bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 text-xs font-medium rounded-lg transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(term.id)}
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
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No terms found.
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
