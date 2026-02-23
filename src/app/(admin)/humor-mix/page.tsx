import { createClient } from '@/lib/supabase/server'
import HumorMixManager from '@/components/HumorMixManager'

export default async function HumorMixPage() {
  const supabase = await createClient()
  const { data: mix } = await supabase
    .from('humor_flavor_mix')
    .select('id, caption_count, humor_flavor_id, humor_flavors(slug)')
    .order('caption_count', { ascending: false })

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Humor Mix</h1>
        <p className="text-slate-400 text-sm mt-1">Caption count weighting per humor flavor</p>
      </div>
      <HumorMixManager mix={mix ?? []} />
    </div>
  )
}
