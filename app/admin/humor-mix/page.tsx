import { createSupabaseServer } from '@/lib/supabase-server'
import MixTable from './mix-table'

export default async function HumorMixPage() {
  const supabase = await createSupabaseServer()

  const { data: rawMixes } = await supabase
    .from('humor_flavor_mix')
    .select(`
      id,
      humor_flavor_id,
      caption_count,
      created_datetime_utc,
      humor_flavors(slug)
    `)
    .order('created_datetime_utc', { ascending: false })

  // Supabase returns joined humor_flavors as array; normalize to single object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mixes = (rawMixes ?? []).map((m: any) => ({
    id: m.id,
    humor_flavor_id: m.humor_flavor_id,
    caption_count: m.caption_count,
    created_datetime_utc: m.created_datetime_utc,
    humor_flavors: Array.isArray(m.humor_flavors) ? m.humor_flavors[0] ?? null : m.humor_flavors,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Humor Flavor Mix</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage humor flavor mix and caption counts. {mixes.length} total.
        </p>
      </div>
      <MixTable mixes={mixes} />
    </div>
  )
}
