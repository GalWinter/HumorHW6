import { createSupabaseServer } from '@/lib/supabase-server'
import CaptionTable from './caption-table'

export default async function CaptionsPage() {
  const supabase = await createSupabaseServer()

  const { data: captions, count } = await supabase
    .from('captions')
    .select(`
      id,
      content,
      is_public,
      is_featured,
      like_count,
      created_datetime_utc,
      profile_id,
      image_id,
      humor_flavor_id
    `, { count: 'exact' })
    .order('created_datetime_utc', { ascending: false })
    .limit(200)

  const { data: humorFlavors } = await supabase
    .from('humor_flavors')
    .select('id, slug')

  const flavorMap: Record<number, string> = {}
  if (humorFlavors) {
    for (const f of humorFlavors) {
      flavorMap[f.id] = f.slug
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Captions</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Manage captions. Showing latest 200 of {(count ?? 0).toLocaleString()} total.
        </p>
      </div>
      <CaptionTable captions={captions ?? []} flavorMap={flavorMap} />
    </div>
  )
}
