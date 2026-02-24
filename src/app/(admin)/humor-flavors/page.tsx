import { createClient } from '@/lib/supabase/server'
import { Sparkles, ChevronDown } from 'lucide-react'

export default async function HumorFlavorsPage() {
  const supabase = await createClient()

  const { data: flavors } = await supabase
    .from('humor_flavors')
    .select(`
      id, slug, description,
      humor_flavor_steps (
        id, order_by, description, llm_temperature, llm_system_prompt, llm_user_prompt,
        llm_models ( name, provider_model_id ),
        humor_flavor_step_types ( slug, description ),
        llm_input_types: llm_input_type_id ( slug ),
        llm_output_types: llm_output_type_id ( slug )
      )
    `)
    .order('id')

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Humor Flavors</h1>
        <p className="text-slate-400 text-sm mt-1">{flavors?.length ?? 0} flavors configured</p>
      </div>

      <div className="space-y-4">
        {(flavors ?? []).map((flavor) => {
          const steps = (flavor.humor_flavor_steps ?? []).sort(
            (a: { order_by: number }, b: { order_by: number }) => a.order_by - b.order_by
          )
          return (
            <div key={flavor.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              {/* Flavor header */}
              <div className="flex items-start gap-4 p-5">
                <div className="w-9 h-9 bg-purple-500/15 border border-purple-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-semibold text-white">{flavor.slug}</h2>
                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">id: {flavor.id}</span>
                    <span className="text-xs text-slate-500">{steps.length} step{steps.length !== 1 ? 's' : ''}</span>
                  </div>
                  {flavor.description && <p className="text-sm text-slate-400 mt-1">{flavor.description}</p>}
                </div>
              </div>

              {/* Steps */}
              {steps.length > 0 && (
                <div className="border-t border-slate-800">
                  <div className="px-5 py-2 bg-slate-950/40">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pipeline Steps</p>
                  </div>
                  <div className="divide-y divide-slate-800/60">
                    {steps.map((step: {
                      id: number; order_by: number; description: string | null;
                      llm_temperature: number | null; llm_system_prompt: string | null;
                      llm_user_prompt: string | null;
                      llm_models: { name: string; provider_model_id: string }[] | null;
                      humor_flavor_step_types: { slug: string; description: string }[] | null;
                      llm_input_types: { slug: string }[] | null;
                      llm_output_types: { slug: string }[] | null;
                    }) => (
                      <details key={step.id} className="group">
                        <summary className="flex items-center gap-3 px-5 py-3 cursor-pointer list-none hover:bg-slate-800/30 transition-colors">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-xs flex items-center justify-center shrink-0">
                            {step.order_by}
                          </span>
                          <span className="text-xs font-medium text-slate-300">
                            {step.humor_flavor_step_types?.[0]?.slug ?? 'step'}
                          </span>
                          {step.llm_models?.[0] && (
                            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                              {step.llm_models[0].name}
                            </span>
                          )}
                          {step.description && (
                            <span className="text-xs text-slate-500 truncate flex-1">{step.description}</span>
                          )}
                          {step.llm_temperature != null && (
                            <span className="text-xs text-orange-400 ml-auto shrink-0">T={step.llm_temperature}</span>
                          )}
                          <ChevronDown className="w-3.5 h-3.5 text-slate-600 group-open:rotate-180 transition-transform shrink-0" />
                        </summary>
                        <div className="px-5 pb-4 pt-2 grid grid-cols-2 gap-4 bg-slate-950/30">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Input → Output</p>
                            <p className="text-xs text-slate-300">
                              {step.llm_input_types?.[0]?.slug ?? '?'} → {step.llm_output_types?.[0]?.slug ?? '?'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Step Type</p>
                            <p className="text-xs text-slate-300">{step.humor_flavor_step_types?.[0]?.description ?? '—'}</p>
                          </div>
                          {step.llm_system_prompt && (
                            <div className="col-span-2">
                              <p className="text-xs text-slate-500 mb-1">System Prompt</p>
                              <pre className="text-xs text-slate-300 bg-slate-950 border border-slate-800 rounded-lg p-3 whitespace-pre-wrap max-h-40 overflow-y-auto font-mono">
                                {step.llm_system_prompt}
                              </pre>
                            </div>
                          )}
                          {step.llm_user_prompt && (
                            <div className="col-span-2">
                              <p className="text-xs text-slate-500 mb-1">User Prompt</p>
                              <pre className="text-xs text-slate-300 bg-slate-950 border border-slate-800 rounded-lg p-3 whitespace-pre-wrap max-h-40 overflow-y-auto font-mono">
                                {step.llm_user_prompt}
                              </pre>
                            </div>
                          )}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
