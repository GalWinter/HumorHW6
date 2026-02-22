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
  additional_context: string | null
  created_datetime_utc: string
  profile_id: string | null
}

interface ImageFormData {
  url: string
  additional_context: string
  image_description: string
  is_public: boolean
  is_common_use: boolean
}

export default function ImageGrid({ images }: { images: ImageRow[] }) {
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'table'>('grid')
  const [toggling, setToggling] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<ImageRow | null>(null)
  const [formData, setFormData] = useState<ImageFormData>({
    url: '',
    additional_context: '',
    image_description: '',
    is_public: false,
    is_common_use: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const filtered = images.filter((img) => {
    const q = search.toLowerCase()
    return (
      img.id.toLowerCase().includes(q) ||
      (img.image_description?.toLowerCase().includes(q) ?? false) ||
      (img.url?.toLowerCase().includes(q) ?? false) ||
      (img.additional_context?.toLowerCase().includes(q) ?? false)
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

  function openCreateModal() {
    setFormData({
      url: '',
      additional_context: '',
      image_description: '',
      is_public: false,
      is_common_use: false,
    })
    setShowCreateModal(true)
  }

  function openEditModal(image: ImageRow) {
    setSelectedImage(image)
    setFormData({
      url: image.url || '',
      additional_context: image.additional_context || '',
      image_description: image.image_description || '',
      is_public: image.is_public ?? false,
      is_common_use: image.is_common_use ?? false,
    })
    setShowEditModal(true)
  }

  function openDeleteModal(image: ImageRow) {
    setSelectedImage(image)
    setShowDeleteModal(true)
  }

  async function handleCreate() {
    setIsSubmitting(true)
    try {
      const supabase = createSupabaseBrowser()
      const newImage = {
        id: crypto.randomUUID(),
        url: formData.url || null,
        additional_context: formData.additional_context || null,
        image_description: formData.image_description || null,
        is_public: formData.is_public,
        is_common_use: formData.is_common_use,
        created_datetime_utc: new Date().toISOString(),
      }

      await supabase.from('images').insert([newImage])

      setShowCreateModal(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to create image:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdate() {
    if (!selectedImage) return

    setIsSubmitting(true)
    try {
      const supabase = createSupabaseBrowser()
      await supabase
        .from('images')
        .update({
          url: formData.url || null,
          additional_context: formData.additional_context || null,
          image_description: formData.image_description || null,
          is_public: formData.is_public,
          is_common_use: formData.is_common_use,
          modified_datetime_utc: new Date().toISOString(),
        })
        .eq('id', selectedImage.id)

      setShowEditModal(false)
      setSelectedImage(null)
      router.refresh()
    } catch (error) {
      console.error('Failed to update image:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!selectedImage) return

    setIsSubmitting(true)
    try {
      const supabase = createSupabaseBrowser()
      await supabase.from('images').delete().eq('id', selectedImage.id)

      setShowDeleteModal(false)
      setSelectedImage(null)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete image:', error)
    } finally {
      setIsSubmitting(false)
    }
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
        <div className="flex gap-3 items-center">
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition"
          >
            Upload Image
          </button>
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
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <p className="text-[10px] text-zinc-400 font-mono">{img.id.slice(0, 8)}...</p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(img)}
                      className="px-2 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 text-xs font-medium rounded-lg transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(img)}
                      className="px-2 py-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-medium rounded-lg transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
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
                  <th className="text-right px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Actions</th>
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
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openEditModal(img)}
                          className="px-3 py-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 text-xs font-medium rounded-lg transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(img)}
                          className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-medium rounded-lg transition"
                        >
                          Delete
                        </button>
                      </div>
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Upload New Image</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://images.almostcrackd.ai/..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Additional Context
                </label>
                <input
                  type="text"
                  value={formData.additional_context}
                  onChange={(e) => setFormData({ ...formData, additional_context: e.target.value })}
                  placeholder="Optional context information..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Image Description
                </label>
                <textarea
                  value={formData.image_description}
                  onChange={(e) => setFormData({ ...formData, image_description: e.target.value })}
                  placeholder="Describe the image..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Public</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_common_use}
                    onChange={(e) => setFormData({ ...formData, is_common_use: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Common Use</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isSubmitting || !formData.url}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Image'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Edit Image</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://images.almostcrackd.ai/..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Additional Context
                </label>
                <input
                  type="text"
                  value={formData.additional_context}
                  onChange={(e) => setFormData({ ...formData, additional_context: e.target.value })}
                  placeholder="Optional context information..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Image Description
                </label>
                <textarea
                  value={formData.image_description}
                  onChange={(e) => setFormData({ ...formData, image_description: e.target.value })}
                  placeholder="Describe the image..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Public</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_common_use}
                    onChange={(e) => setFormData({ ...formData, is_common_use: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Common Use</span>
                </label>
              </div>

              {selectedImage.url && (
                <div className="mt-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Current Image Preview:</p>
                  <div className="w-32 h-32 rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedImage.url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedImage(null)
                }}
                disabled={isSubmitting}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={isSubmitting || !formData.url}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Delete Image</h3>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Are you sure you want to delete this image? This action cannot be undone.
            </p>

            {selectedImage.url && (
              <div className="mb-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                <div className="w-32 h-32 rounded-lg overflow-hidden mx-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedImage.url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                {selectedImage.image_description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 text-center">
                    {selectedImage.image_description.slice(0, 100)}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedImage(null)
                }}
                disabled={isSubmitting}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Image'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
