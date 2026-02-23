'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Modal from './Modal'
import { createCaptionExample, updateCaptionExample, deleteCaptionExample } from '@/lib/actions/caption-examples'
import { Search, ChevronLeft, ChevronRight, Plus, Pencil, Trash2 } from 'lucide-react'

interface CaptionExample {
  id: number
  image_description: string
  caption: string
  explanation: string
  priority: number
  image_id: string | null
  created_datetime_utc: string
}

interface Props {
  examples: CaptionExample[]
  page: number
  totalPages: number
  search: string
  total: number
}

export default function CaptionExamplesManager({ examples, page, totalPages, search, total }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()
  const [searchInput, setSearchInput] = useState(search)
  const [mode, setMode] = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<CaptionExample | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const navigate = (p: string, s: string) => {
    const sp = new URLSearchParams()
    if (s) sp.set('search', s)
    if (p !== '1') sp.set('page', p)
    startTransition(() => router.push(`${pathname}?${sp.toString()}`))
  }

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); navigate('1', searchInput) }
  const openCreate = () => { setEditing(null); setError(null); setMode('create') }
  const openEdit = (ex: CaptionExample) => { setEditing(ex); setError(null); setMode('edit') }
  const closeModal = () => { setMode(null); setEditing(null); setError(null) }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const result = mode === 'create' ? await createCaptionExample(formData) : await updateCaptionExample(formData)
    setSubmitting(false)
    if (result.error) setError(result.error)
    else { closeModal(); router.refresh() }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this caption example?')) return
    const result = await deleteCaptionExample(id)
    if (result.error) alert(result.error)
    else router.refresh()
  }

  return (
    <div className="space-y-4">
      <style>{`.inp{width:100%;background:#0f172a;border:1px solid #334155;border-radius:.5rem;padding:.5rem .75rem;color:white;font-size:.875rem;outline:none}.inp:focus{border-color:#a855f7}`}</style>

      <div className="flex gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search caption or description…"
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500" />
          </div>
          <button type="submit" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg">Search</button>
        </form>
        <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg">
          <Plus className="w-4 h-4" /> New
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-slate-800">
            <th className="th">Caption</th>
            <th className="th w-16">Priority</th>
            <th className="th w-28">Created</th>
            <th className="th w-20">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-800">
            {examples.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">No examples found</td></tr>}
            {examples.map((ex) => (
              <tr key={ex.id} className="hover:bg-slate-800/40">
                <td className="px-4 py-3">
                  <p className="text-sm text-slate-200 line-clamp-1 font-medium">{ex.caption}</p>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{ex.image_description}</p>
                </td>
                <td className="px-4 py-3 text-sm text-slate-400 text-center">{ex.priority}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{new Date(ex.created_datetime_utc).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(ex)} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(ex.id)} className="p-1.5 bg-red-900/40 hover:bg-red-900/60 rounded-lg text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-500">Showing {examples.length} of {total}</p>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => navigate(String(page - 1), search)} className="p-1.5 rounded-lg border border-slate-700 text-slate-400 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-xs text-slate-400">{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => navigate(String(page + 1), search)} className="p-1.5 rounded-lg border border-slate-700 text-slate-400 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      <Modal open={mode !== null} onClose={closeModal} title={mode === 'create' ? 'New Caption Example' : 'Edit Caption Example'} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Image Description <span className="text-red-400">*</span></label>
            <textarea name="image_description" required defaultValue={editing?.image_description ?? ''} rows={2} className="inp" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Caption <span className="text-red-400">*</span></label>
            <textarea name="caption" required defaultValue={editing?.caption ?? ''} rows={2} className="inp" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Explanation <span className="text-red-400">*</span></label>
            <textarea name="explanation" required defaultValue={editing?.explanation ?? ''} rows={3} className="inp" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1">Priority</label>
              <input type="number" name="priority" defaultValue={editing?.priority ?? 0} className="inp" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1">Image ID (optional)</label>
              <input name="image_id" defaultValue={editing?.image_id ?? ''} placeholder="UUID…" className="inp" />
            </div>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button type="submit" disabled={submitting} className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm rounded-lg">
            {submitting ? 'Saving…' : mode === 'create' ? 'Create' : 'Save Changes'}
          </button>
        </form>
      </Modal>
      <style>{`.th{text-align:left;padding:.75rem 1rem;font-size:.75rem;font-weight:500;color:#64748b;text-transform:uppercase;letter-spacing:.05em}`}</style>
    </div>
  )
}
