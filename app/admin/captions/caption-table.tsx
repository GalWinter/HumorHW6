'use client'

import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

interface Caption {
  id: string
  content: string | null
  is_public: boolean
  is_featured: boolean
  like_count: number
  created_datetime_utc: string
  profile_id: string
  image_id: string
  humor_flavor_id: number | null
}

export default function CaptionTable({
  captions,
  flavorMap,
}: {
  captions: Caption[]
  flavorMap: Record<number, string>
}) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'featured' | 'public' | 'private'>('all')
  const [toggling, setToggling] = useState<string | null>(null)
  const router = useRouter()

  const filtered = captions.filter((c) => {
    const q = search.toLowerCase()
    const matchesSearch =
      (c.content?.toLowerCase().includes(q) ?? false) ||
      c.id.toLowerCase().includes(q)
    const matchesFilter =
      filter === 'all' ||
      (filter === 'featured' && c.is_featured) ||
      (filter === 'public' && c.is_public) ||
      (filter === 'private' && !c.is_public)
    return matchesSearch && matchesFilter
  })

  async function toggleField(captionId: string, field: 'is_public' | 'is_featured', current: boolean) {
    setToggling(captionId + field)
    const supabase = createSupabaseBrowser()
    await supabase
      .from('captions')
      .update({ [field]: !current })
      .eq('id', captionId)
    setToggling(null)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search captions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-md px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
          {(['all', 'featured', 'public', 'private'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition capitalize ${
                filter === f
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 w-[40%]">Content</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Flavor</th>
                <th className="text-center px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Likes</th>
                <th className="text-center px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Public</th>
                <th className="text-center px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Featured</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition">
                  <td className="px-4 py-3">
                    <p className="text-zinc-800 dark:text-zinc-200 line-clamp-2">
                      {c.content ?? '(empty)'}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-mono mt-1">{c.id.slice(0, 8)}...</p>
                  </td>
                  <td className="px-4 py-3">
                    {c.humor_flavor_id ? (
                      <span className="px-2 py-1 text-xs rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-medium">
                        {flavorMap[c.humor_flavor_id] ?? `#${c.humor_flavor_id}`}
                      </span>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-mono text-sm ${
                      c.like_count > 0
                        ? 'text-green-600 dark:text-green-400'
                        : c.like_count < 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-zinc-400'
                    }`}>
                      {c.like_count > 0 ? '+' : ''}{c.like_count}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleField(c.id, 'is_public', c.is_public)}
                      disabled={toggling === c.id + 'is_public'}
                      className={`px-2 py-1 rounded text-xs font-medium transition ${
                        c.is_public
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {c.is_public ? 'Yes' : 'No'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleField(c.id, 'is_featured', c.is_featured)}
                      disabled={toggling === c.id + 'is_featured'}
                      className={`px-2 py-1 rounded text-xs font-medium transition ${
                        c.is_featured
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {c.is_featured ? 'Featured' : 'No'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    {new Date(c.created_datetime_utc).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-400">
                    No captions found.
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
