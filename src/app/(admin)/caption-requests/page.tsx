import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SearchParams { page?: string }

export default async function CaptionRequestsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const page = parseInt(params.page ?? '1')
  const pageSize = 30
  const supabase = await createClient()

  const { data: requests, count } = await supabase
    .from('caption_requests')
    .select('id, created_datetime_utc, profile_id, image_id', { count: 'exact' })
    .order('created_datetime_utc', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  const totalPages = Math.ceil((count ?? 0) / pageSize)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Caption Requests</h1>
        <p className="text-slate-400 text-sm mt-1">{count ?? 0} total requests</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-slate-800">
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-20">ID</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Profile ID</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Image ID</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-36">Created</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-800">
            {(requests ?? []).map((r) => (
              <tr key={r.id} className="hover:bg-slate-800/30">
                <td className="px-4 py-3 text-sm text-slate-300 font-mono">{r.id}</td>
                <td className="px-4 py-3 text-xs text-slate-400 font-mono truncate max-w-xs">{r.profile_id}</td>
                <td className="px-4 py-3 text-xs text-slate-400 font-mono truncate max-w-xs">{r.image_id}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{new Date(r.created_datetime_utc).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-500">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              {page > 1 && <Link href={`?page=${page - 1}`} className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white"><ChevronLeft className="w-4 h-4" /></Link>}
              <span className="text-xs text-slate-400">{page} / {totalPages}</span>
              {page < totalPages && <Link href={`?page=${page + 1}`} className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white"><ChevronRight className="w-4 h-4" /></Link>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
