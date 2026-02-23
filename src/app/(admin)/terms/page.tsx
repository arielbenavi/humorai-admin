import { createClient } from '@/lib/supabase/server'
import TermsManager from '@/components/TermsManager'

interface SearchParams { page?: string; search?: string }

export default async function TermsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const page = parseInt(params.page ?? '1')
  const search = params.search ?? ''
  const pageSize = 20
  const supabase = await createClient()

  const [termTypesResult, termsResult] = await Promise.all([
    supabase.from('term_types').select('id, name').order('name'),
    (() => {
      let q = supabase.from('terms').select(
        'id, term, definition, example, priority, term_type_id, term_types(name)',
        { count: 'exact' }
      )
      if (search) q = q.ilike('term', `%${search}%`)
      return q.order('priority', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1)
    })(),
  ])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Terms</h1>
        <p className="text-slate-400 text-sm mt-1">{termsResult.count ?? 0} total terms</p>
      </div>
      <TermsManager terms={termsResult.data ?? []} termTypes={termTypesResult.data ?? []}
        page={page} totalPages={Math.ceil((termsResult.count ?? 0) / pageSize)}
        search={search} total={termsResult.count ?? 0} />
    </div>
  )
}
