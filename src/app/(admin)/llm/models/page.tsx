import { createClient } from '@/lib/supabase/server'
import LLMModelsManager from '@/components/LLMModelsManager'

export default async function LLMModelsPage() {
  const supabase = await createClient()
  const [{ data: models }, { data: providers }] = await Promise.all([
    supabase.from('llm_models').select('id, name, provider_model_id, is_temperature_supported, created_datetime_utc, llm_provider_id, llm_providers(name)').order('id'),
    supabase.from('llm_providers').select('id, name').order('name'),
  ])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">LLM Models</h1>
        <p className="text-slate-400 text-sm mt-1">{models?.length ?? 0} models</p>
      </div>
      <LLMModelsManager models={models ?? []} providers={providers ?? []} />
    </div>
  )
}
