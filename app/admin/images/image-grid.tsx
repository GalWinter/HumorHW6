'use client'

import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

interface ImageRow {
  id: string
  url: string | null
  is_common_use: boolean | null
  is_public: boolean | null
  image_description: string | null
  created_datetime_utc: string
  profile_id: string | null
}

export default function ImageGrid({ images }: { images: ImageRow[] }) {
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'table'>('grid')
  const [toggling, setToggling] = useState<string | null>(null)
  const router = useRouter()

  const filtered = images.filter((img) => {
    const q = search.toLowerCase()
    return (
      img.id.toLowerCase().includes(q) ||
      (img.image_description?.toLowerCase().includes(q) ?? false) ||
      (img.url?.toLowerCase().includes(q) ?? false)
    )
  })

  async function toggleField(imageId: string, field: 'is_public' | 'is_common_use', current: boolean | null) {
    setToggling(imageId + field)
    const supabase = createSupabaseBrowser()
    await supabase
      .from('images')
      .update({ [field]: !(current ?? false) })
      .eq('id', imageId)
    setToggling(null)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by description or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-md px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
          <button
            onClick={() => setView('grid')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              view === 'grid'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setView('table')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              view === 'table'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((img) => (
            <div
              key={img.id}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden group"
            >
              <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 relative">
                {img.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img.url}
                    alt={img.image_description ?? 'Image'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm">
                    No image
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  {img.is_public && (
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                      Public
                    </span>
                  )}
                  {img.is_common_use && (
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                      Common
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                  {img.image_description?.slice(0, 100) ?? 'No description'}
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => toggleField(img.id, 'is_public', img.is_public)}
                    disabled={toggling === img.id + 'is_public'}
                    className={`text-[10px] px-2 py-1 rounded-md font-medium transition ${
                      img.is_public
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {img.is_public ? 'Public' : 'Private'}
                  </button>
                  <button
                    onClick={() => toggleField(img.id, 'is_common_use', img.is_common_use)}
                    disabled={toggling === img.id + 'is_common_use'}
                    className={`text-[10px] px-2 py-1 rounded-md font-medium transition ${
                      img.is_common_use
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {img.is_common_use ? 'Common Use' : 'Not Common'}
                  </button>
                </div>
                <p className="text-[10px] text-zinc-400 mt-2 font-mono">{img.id.slice(0, 8)}...</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Image</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Description</th>
                  <th className="text-center px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Public</th>
                  <th className="text-center px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Common Use</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((img) => (
                  <tr key={img.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        {img.url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300 max-w-xs truncate">
                      {img.image_description?.slice(0, 80) ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleField(img.id, 'is_public', img.is_public)}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          img.is_public
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {img.is_public ? 'Yes' : 'No'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleField(img.id, 'is_common_use', img.is_common_use)}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          img.is_common_use
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {img.is_common_use ? 'Yes' : 'No'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(img.created_datetime_utc).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-zinc-400">No images found.</div>
      )}
    </div>
  )
}
