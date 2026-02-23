import { createClient } from '@/lib/supabase/server'
import LLMProvidersManager from '@/components/LLMProvidersManager'

export default async function LLMProvidersPage() {
  const supabase = await createClient()
  const { data: providers } = await supabase
    .from('llm_providers')
    .select('id, name, created_datetime_utc')
    .order('id')

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">LLM Providers</h1>
        <p className="text-slate-400 text-sm mt-1">{providers?.length ?? 0} providers</p>
      </div>
      <LLMProvidersManager providers={providers ?? []} />
    </div>
  )
}
