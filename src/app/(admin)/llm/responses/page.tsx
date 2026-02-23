import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SearchParams { page?: string }

export default async function LLMResponsesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const page = parseInt(params.page ?? '1')
  const pageSize = 25
  const supabase = await createClient()

  const { data: responses, count } = await supabase
    .from('llm_model_responses')
    .select(
      'id, created_datetime_utc, processing_time_seconds, llm_temperature, llm_model_response, llm_models(name), humor_flavors(slug)',
      { count: 'exact' }
    )
    .order('created_datetime_utc', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  const totalPages = Math.ceil((count ?? 0) / pageSize)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">LLM Responses</h1>
        <p className="text-slate-400 text-sm mt-1">{count ?? 0} total responses</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-slate-800">
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Response Preview</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-32">Model</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-28">Flavor</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-16">Time (s)</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-36">Created</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-800">
            {(responses ?? []).map((r) => (
              <tr key={r.id} className="hover:bg-slate-800/30">
                <td className="px-4 py-3">
                  <p className="text-sm text-slate-300 line-clamp-2 max-w-md">
                    {r.llm_model_response ?? <span className="text-slate-600 italic">empty</span>}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                    {(r.llm_models as { name: string } | null)?.name ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-purple-400">
                    {(r.humor_flavors as { slug: string } | null)?.slug ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-400 text-center">{r.processing_time_seconds}s</td>
                <td className="px-4 py-3 text-xs text-slate-500">{new Date(r.created_datetime_utc).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-500">Page {page} of {totalPages} ({count} total)</p>
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
