import { createClient } from '@/lib/supabase/server'
import CaptionsTable from '@/components/CaptionsTable'

interface SearchParams {
  page?: string
  search?: string
  filter?: string
}

export default async function CaptionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const page = parseInt(params.page ?? '1')
  const search = params.search ?? ''
  const filter = params.filter ?? 'all'
  const pageSize = 20

  const supabase = await createClient()

  let query = supabase
    .from('captions')
    .select(
      `id, content, created_datetime_utc, is_public, is_featured, like_count,
       profile_id, image_id,
       humor_flavors ( slug )`,
      { count: 'exact' }
    )

  if (search) {
    query = query.ilike('content', `%${search}%`)
  }

  if (filter === 'featured') {
    query = query.eq('is_featured', true)
  } else if (filter === 'public') {
    query = query.eq('is_public', true)
  } else if (filter === 'private') {
    query = query.eq('is_public', false)
  }

  const { data: captions, count } = await query
    .order('created_datetime_utc', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  const totalPages = Math.ceil((count ?? 0) / pageSize)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Captions</h1>
        <p className="text-slate-400 text-sm mt-1">{count ?? 0} total captions</p>
      </div>

      <CaptionsTable
        captions={captions ?? []}
        page={page}
        totalPages={totalPages}
        search={search}
        filter={filter}
        total={count ?? 0}
      />
    </div>
  )
}
