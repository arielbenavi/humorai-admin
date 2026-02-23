import { createClient } from '@/lib/supabase/server'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface SearchParams { page?: string }

export default async function PromptChainsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const page = parseInt(params.page ?? '1')
  const pageSize = 30
  const supabase = await createClient()

  const { data: chains, count } = await supabase
    .from('llm_prompt_chains')
    .select('id, created_datetime_utc, caption_request_id', { count: 'exact' })
    .order('created_datetime_utc', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  const totalPages = Math.ceil((count ?? 0) / pageSize)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">LLM Prompt Chains</h1>
        <p className="text-slate-400 text-sm mt-1">{count ?? 0} total chains</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-slate-800">
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Chain ID</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Caption Request ID</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-40">Created</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-800">
            {(chains ?? []).map((c) => (
              <tr key={c.id} className="hover:bg-slate-800/30">
                <td className="px-4 py-3 text-sm text-slate-300 font-mono">{c.id}</td>
                <td className="px-4 py-3 text-sm text-slate-400 font-mono">{c.caption_request_id}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{new Date(c.created_datetime_utc).toLocaleString()}</td>
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
