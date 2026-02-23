'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Modal from './Modal'
import { createTerm, updateTerm, deleteTerm } from '@/lib/actions/terms'
import { Search, ChevronLeft, ChevronRight, Plus, Pencil, Trash2 } from 'lucide-react'

interface Term {
  id: number
  term: string
  definition: string
  example: string
  priority: number
  term_type_id: number | null
  term_types: { name: string } | null
}

interface TermType { id: number; name: string }

interface Props {
  terms: Term[]
  termTypes: TermType[]
  page: number
  totalPages: number
  search: string
  total: number
}

export default function TermsManager({ terms, termTypes, page, totalPages, search, total }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()
  const [searchInput, setSearchInput] = useState(search)
  const [mode, setMode] = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Term | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)

  const navigate = (p: string, s: string) => {
    const sp = new URLSearchParams()
    if (s) sp.set('search', s)
    if (p !== '1') sp.set('page', p)
    startTransition(() => router.push(`${pathname}?${sp.toString()}`))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const result = mode === 'create' ? await createTerm(formData) : await updateTerm(formData)
    setSubmitting(false)
    if (result.error) setError(result.error)
    else { setMode(null); setEditing(null); router.refresh() }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this term?')) return
    const result = await deleteTerm(id)
    if (result.error) alert(result.error)
    else router.refresh()
  }

  return (
    <div className="space-y-4">
      <style>{`.inp{width:100%;background:#0f172a;border:1px solid #334155;border-radius:.5rem;padding:.5rem .75rem;color:white;font-size:.875rem;outline:none}.inp:focus{border-color:#a855f7}.th{text-align:left;padding:.75rem 1rem;font-size:.75rem;font-weight:500;color:#64748b;text-transform:uppercase;letter-spacing:.05em}`}</style>

      <div className="flex gap-3">
        <form onSubmit={(e) => { e.preventDefault(); navigate('1', searchInput) }} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search terms…"
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500" />
          </div>
          <button type="submit" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg">Search</button>
        </form>
        <button onClick={() => { setEditing(null); setError(null); setMode('create') }}
          className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg">
          <Plus className="w-4 h-4" /> New
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-slate-800">
            <th className="th">Term</th>
            <th className="th w-32">Type</th>
            <th className="th w-16">Priority</th>
            <th className="th w-20">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-800">
            {terms.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">No terms found</td></tr>}
            {terms.map((term) => (
              <>
                <tr key={term.id} className="hover:bg-slate-800/40 cursor-pointer" onClick={() => setExpanded(expanded === term.id ? null : term.id)}>
                  <td className="px-4 py-3">
                    <p className="text-sm text-white font-medium">{term.term}</p>
                    {expanded !== term.id && <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{term.definition}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                      {term.term_types?.name ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400 text-center">{term.priority}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={(e) => { e.stopPropagation(); setEditing(term); setError(null); setMode('edit') }}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(term.id) }}
                        className="p-1.5 bg-red-900/40 hover:bg-red-900/60 rounded-lg text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
                {expanded === term.id && (
                  <tr key={`${term.id}-expanded`} className="bg-slate-950/50">
                    <td colSpan={4} className="px-6 py-3 space-y-2">
                      <div><p className="text-xs text-slate-500">Definition</p><p className="text-sm text-slate-300">{term.definition}</p></div>
                      <div><p className="text-xs text-slate-500">Example</p><p className="text-sm text-slate-400 italic">{term.example}</p></div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-500">Showing {terms.length} of {total}</p>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => navigate(String(page - 1), search)} className="p-1.5 rounded-lg border border-slate-700 text-slate-400 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-xs text-slate-400">{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => navigate(String(page + 1), search)} className="p-1.5 rounded-lg border border-slate-700 text-slate-400 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      <Modal open={mode !== null} onClose={() => { setMode(null); setEditing(null) }} title={mode === 'create' ? 'New Term' : 'Edit Term'} maxWidth="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Term <span className="text-red-400">*</span></label>
            <input name="term" required defaultValue={editing?.term ?? ''} className="inp" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Type</label>
            <select name="term_type_id" defaultValue={editing?.term_type_id ?? ''} className="inp">
              <option value="">— None —</option>
              {termTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Definition <span className="text-red-400">*</span></label>
            <textarea name="definition" required defaultValue={editing?.definition ?? ''} rows={3} className="inp" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Example <span className="text-red-400">*</span></label>
            <textarea name="example" required defaultValue={editing?.example ?? ''} rows={2} className="inp" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Priority</label>
            <input type="number" name="priority" defaultValue={editing?.priority ?? 0} className="inp" />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button type="submit" disabled={submitting} className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm rounded-lg">
            {submitting ? 'Saving…' : mode === 'create' ? 'Create Term' : 'Save Changes'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
