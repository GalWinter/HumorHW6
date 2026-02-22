import { createSupabaseServer } from '@/lib/supabase-server'
import ImageGrid from './image-grid'

export default async function ImagesPage() {
  const supabase = await createSupabaseServer()

  const { data: images, count } = await supabase
    .from('images')
    .select('id, url, is_common_use, is_public, image_description, created_datetime_utc, profile_id', { count: 'exact' })
    .order('created_datetime_utc', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Images</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Manage images in the platform. Showing latest 100 of {count ?? 0} total.
        </p>
      </div>
      <ImageGrid images={images ?? []} />
    </div>
  )
}
