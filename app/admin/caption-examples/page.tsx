import { createSupabaseServer } from '@/lib/supabase-server'
import CaptionExamplesTable from './caption-examples-table'

export default async function CaptionExamplesPage() {
  const supabase = await createSupabaseServer()

  const { data: captionExamples } = await supabase
    .from('caption_examples')
    .select('id, image_description, caption, explanation, priority, image_id, created_datetime_utc')
    .order('priority', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Caption Examples</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage caption examples for training. {captionExamples?.length ?? 0} total examples.
        </p>
      </div>
      <CaptionExamplesTable captionExamples={captionExamples ?? []} />
    </div>
  )
}
