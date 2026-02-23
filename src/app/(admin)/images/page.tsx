import { createClient } from '@/lib/supabase/server'
import ImagesManager from '@/components/ImagesManager'

interface SearchParams { page?: string; search?: string; filter?: string }

export default async function ImagesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const page = parseInt(params.page ?? '1')
  const search = params.search ?? ''
  const filter = params.filter ?? 'all'
  const pageSize = 30

  const supabase = await createClient()
  let query = supabase.from('images').select(
    'id, url, created_datetime_utc, is_public, is_common_use, additional_context, image_description',
    { count: 'exact' }
  )

  if (search) query = query.or(`additional_context.ilike.%${search}%,image_description.ilike.%${search}%`)
  if (filter === 'public') query = query.eq('is_public', true)
  else if (filter === 'private') query = query.eq('is_public', false)
  else if (filter === 'common_use') query = query.eq('is_common_use', true)

  const { data: images, count } = await query
    .order('created_datetime_utc', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Images</h1>
        <p className="text-slate-400 text-sm mt-1">{count ?? 0} total images</p>
      </div>
      <ImagesManager images={images ?? []} page={page} totalPages={Math.ceil((count ?? 0) / pageSize)}
        search={search} filter={filter} total={count ?? 0} />
    </div>
  )
}
