'use client'

import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

interface WhitelistEmail {
  id: number
  email_address: string
  created_datetime_utc: string | null
  modified_datetime_utc: string | null
}

export default function WhitelistTable({ emails }: { emails: WhitelistEmail[] }) {
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const router = useRouter()

  const [newEmail, setNewEmail] = useState({ email_address: '' })
  const [editData, setEditData] = useState<Partial<WhitelistEmail>>({})

  const filtered = emails.filter((e) => {
    const q = search.toLowerCase()
    return e.email_address.toLowerCase().includes(q)
  })

  async function handleAdd() {
    if (!newEmail.email_address) return
    setSaving(true)
    const supabase = createSupabaseBrowser()
    await supabase.from('whitelist_email_addresses').insert({ email_address: newEmail.email_address })
    setNewEmail({ email_address: '' })
    setShowAddForm(false)
    setSaving(false)
    router.refresh()
  }

  async function handleEdit(id: number) {
    setSaving(true)
    const supabase = createSupabaseBrowser()
    await supabase.from('whitelist_email_addresses').update({ email_address: editData.email_address }).eq('id', id)
    setEditingId(null)
    setEditData({})
    setSaving(false)
    router.refresh()
  }

  async function handleDelete(id: number) {
    setSaving(true)
    const supabase = createSupabaseBrowser()
    await supabase.from('whitelist_email_addresses').delete().eq('id', id)
    setDeleteConfirm(null)
    setSaving(false)
    router.refresh()
  }

  function startEdit(email: WhitelistEmail) {
    setEditingId(email.id)
    setEditData(email)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search emails..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-md px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition"
        >
          {showAddForm ? 'Cancel' : 'Add Email'}
        </button>
      </div>

      {showAddForm && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add Whitelisted Email</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={newEmail.email_address}
                onChange={(e) => setNewEmail({ email_address: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., user@example.com"
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={saving || !newEmail.email_address}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition"
            >
              {saving ? 'Adding...' : 'Add Email'}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Email Address</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">ID</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Created</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Modified</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((email) => (
                <tr key={email.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  {editingId === email.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          type="email"
                          value={editData.email_address ?? ''}
                          onChange={(e) => setEditData({ ...editData, email_address: e.target.value })}
                          className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs font-mono">
                        {email.id}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                        {email.created_datetime_utc ? new Date(email.created_datetime_utc).toLocaleDateString() : '\u2014'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                        {email.modified_datetime_utc ? new Date(email.modified_datetime_utc).toLocaleDateString() : '\u2014'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(email.id)}
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
                        <p className="font-medium text-slate-900 dark:text-white">{email.email_address}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs font-mono">
                        {email.id}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                        {email.created_datetime_utc ? new Date(email.created_datetime_utc).toLocaleDateString() : '\u2014'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                        {email.modified_datetime_utc ? new Date(email.modified_datetime_utc).toLocaleDateString() : '\u2014'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {deleteConfirm === email.id ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleDelete(email.id)}
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
                              onClick={() => startEdit(email)}
                              className="px-3 py-1.5 bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 text-xs font-medium rounded-lg transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(email.id)}
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
                    No whitelisted emails found.
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
