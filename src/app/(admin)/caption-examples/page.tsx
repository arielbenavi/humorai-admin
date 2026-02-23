import { createClient } from '@/lib/supabase/server'
import CaptionExamplesManager from '@/components/CaptionExamplesManager'

interface SearchParams { page?: string; search?: string }

export default async function CaptionExamplesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const page = parseInt(params.page ?? '1')
  const search = params.search ?? ''
  const pageSize = 20
  const supabase = await createClient()

  let query = supabase.from('caption_examples').select(
    'id, image_description, caption, explanation, priority, image_id, created_datetime_utc',
    { count: 'exact' }
  )
  if (search) query = query.or(`caption.ilike.%${search}%,image_description.ilike.%${search}%`)

  const { data, count } = await query
    .order('priority', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Caption Examples</h1>
        <p className="text-slate-400 text-sm mt-1">{count ?? 0} total examples</p>
      </div>
      <CaptionExamplesManager examples={data ?? []} page={page}
        totalPages={Math.ceil((count ?? 0) / pageSize)} search={search} total={count ?? 0} />
    </div>
  )
}
