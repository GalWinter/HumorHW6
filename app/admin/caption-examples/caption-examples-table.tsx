'use client'

import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

interface CaptionExample {
  id: string
  image_description: string
  caption: string
  explanation: string | null
  priority: number
  image_id: string | null
  created_datetime_utc: string | null
}

export default function CaptionExamplesTable({ captionExamples }: { captionExamples: CaptionExample[] }) {
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const router = useRouter()

  const [newExample, setNewExample] = useState({
    image_description: '',
    caption: '',
    explanation: '',
    priority: 0,
    image_id: ''
  })

  const [editData, setEditData] = useState<Partial<CaptionExample>>({})

  const filtered = captionExamples.filter((ex) => {
    const q = search.toLowerCase()
    return (
      ex.image_description.toLowerCase().includes(q) ||
      ex.caption.toLowerCase().includes(q) ||
      (ex.explanation?.toLowerCase().includes(q) ?? false) ||
      ex.id.toLowerCase().includes(q)
    )
  })

  async function handleAdd() {
    if (!newExample.image_description || !newExample.caption) return
    setSaving(true)
    const supabase = createSupabaseBrowser()
    await supabase.from('caption_examples').insert({
      image_description: newExample.image_description,
      caption: newExample.caption,
      explanation: newExample.explanation || null,
      priority: newExample.priority,
      image_id: newExample.image_id || null
    })
    setNewExample({ image_description: '', caption: '', explanation: '', priority: 0, image_id: '' })
    setShowAddForm(false)
    setSaving(false)
    router.refresh()
  }

  async function handleEdit(id: string) {
    setSaving(true)
    const supabase = createSupabaseBrowser()
    await supabase.from('caption_examples').update(editData).eq('id', id)
    setEditingId(null)
    setEditData({})
    setSaving(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    setSaving(true)
    const supabase = createSupabaseBrowser()
    await supabase.from('caption_examples').delete().eq('id', id)
    setDeleteConfirm(null)
    setSaving(false)
    router.refresh()
  }

  function startEdit(example: CaptionExample) {
    setEditingId(example.id)
    setEditData(example)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search examples..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-md px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition"
        >
          {showAddForm ? 'Cancel' : 'Add Example'}
        </button>
      </div>

      {showAddForm && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add New Caption Example</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Image Description *
              </label>
              <textarea
                value={newExample.image_description}
                onChange={(e) => setNewExample({ ...newExample, image_description: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="Describe the image..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Caption *
              </label>
              <input
                type="text"
                value={newExample.caption}
                onChange={(e) => setNewExample({ ...newExample, caption: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Caption text..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Explanation
              </label>
              <textarea
                value={newExample.explanation}
                onChange={(e) => setNewExample({ ...newExample, explanation: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={2}
                placeholder="Optional explanation..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Priority
                </label>
                <input
                  type="number"
                  value={newExample.priority}
                  onChange={(e) => setNewExample({ ...newExample, priority: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Image ID
                </label>
                <input
                  type="text"
                  value={newExample.image_id}
                  onChange={(e) => setNewExample({ ...newExample, image_id: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Optional..."
                />
              </div>
            </div>
            <button
              onClick={handleAdd}
              disabled={saving || !newExample.image_description || !newExample.caption}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition"
            >
              {saving ? 'Adding...' : 'Add Example'}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Image Description</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Caption</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Explanation</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Priority</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Image ID</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Created</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ex) => (
                <tr key={ex.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  {editingId === ex.id ? (
                    <>
                      <td className="px-4 py-3">
                        <textarea
                          value={editData.image_description ?? ''}
                          onChange={(e) => setEditData({ ...editData, image_description: e.target.value })}
                          className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                          rows={2}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editData.caption ?? ''}
                          onChange={(e) => setEditData({ ...editData, caption: e.target.value })}
                          className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <textarea
                          value={editData.explanation ?? ''}
                          onChange={(e) => setEditData({ ...editData, explanation: e.target.value })}
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
                        <input
                          type="text"
                          value={editData.image_id ?? ''}
                          onChange={(e) => setEditData({ ...editData, image_id: e.target.value || null })}
                          className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                        {ex.created_datetime_utc ? new Date(ex.created_datetime_utc).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(ex.id)}
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
                        <p className="text-slate-900 dark:text-white line-clamp-2">{ex.image_description}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-900 dark:text-white line-clamp-2">{ex.caption}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        <p className="line-clamp-2">{ex.explanation ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-900 dark:text-white">{ex.priority}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs font-mono">
                        {ex.image_id ? ex.image_id.slice(0, 8) + '...' : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                        {ex.created_datetime_utc ? new Date(ex.created_datetime_utc).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {deleteConfirm === ex.id ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleDelete(ex.id)}
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
                              onClick={() => startEdit(ex)}
                              className="px-3 py-1.5 bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 text-xs font-medium rounded-lg transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(ex.id)}
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
                    No caption examples found.
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
