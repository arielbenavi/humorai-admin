import { createClient } from '@/lib/supabase/server'
import UsersTable from '@/components/UsersTable'

interface SearchParams {
  page?: string
  search?: string
  filter?: string
}

export default async function UsersPage({
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
    .from('profiles')
    .select('id, first_name, last_name, email, created_datetime_utc, modified_datetime_utc, is_superadmin, is_in_study, is_matrix_admin', { count: 'exact' })

  if (search) {
    query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
  }

  if (filter === 'superadmin') {
    query = query.eq('is_superadmin', true)
  } else if (filter === 'study') {
    query = query.eq('is_in_study', true)
  }

  const { data: users, count } = await query
    .order('created_datetime_utc', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  const totalPages = Math.ceil((count ?? 0) / pageSize)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-slate-400 text-sm mt-1">
          {count ?? 0} total users
        </p>
      </div>

      <UsersTable
        users={users ?? []}
        page={page}
        totalPages={totalPages}
        search={search}
        filter={filter}
        total={count ?? 0}
      />
    </div>
  )
}
