import { createSupabaseServer } from '@/lib/supabase-server'
import ModelsTable from './models-table'

export default async function LLMModelsPage() {
  const supabase = await createSupabaseServer()

  const { data: models } = await supabase
    .from('llm_models')
    .select('id, name, provider_model_id, is_temperature_supported, llm_provider_id')
    .order('name')

  const { data: providers } = await supabase
    .from('llm_providers')
    .select('id, name')
    .order('name')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">LLM Models</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage available language models. {models?.length ?? 0} total models.
        </p>
      </div>
      <ModelsTable models={models ?? []} providers={providers ?? []} />
    </div>
  )
}
