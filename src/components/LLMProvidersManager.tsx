'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Modal from './Modal'
import { createLLMProvider, updateLLMProvider, deleteLLMProvider } from '@/lib/actions/llm'
import { Plus, Pencil, Trash2 } from 'lucide-react'

interface Provider { id: number; name: string; created_datetime_utc: string }

export default function LLMProvidersManager({ providers }: { providers: Provider[] }) {
  const router = useRouter()
  const [mode, setMode] = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Provider | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const result = mode === 'create' ? await createLLMProvider(formData) : await updateLLMProvider(formData)
    setSubmitting(false)
    if (result.error) setError(result.error)
    else { setMode(null); setEditing(null); router.refresh() }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this provider? This will fail if models reference it.')) return
    const result = await deleteLLMProvider(id)
    if (result.error) alert(result.error); else router.refresh()
  }

  return (
    <div className="space-y-4">
      <style>{`.inp{width:100%;background:#0f172a;border:1px solid #334155;border-radius:.5rem;padding:.5rem .75rem;color:white;font-size:.875rem;outline:none}.inp:focus{border-color:#a855f7}`}</style>
      <div className="flex justify-end">
        <button onClick={() => { setEditing(null); setError(null); setMode('create') }}
          className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg">
          <Plus className="w-4 h-4" /> New Provider
        </button>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-slate-800">
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-28">ID</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-28">Created</th>
            <th className="w-20 px-4 py-3" />
          </tr></thead>
          <tbody className="divide-y divide-slate-800">
            {providers.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No providers yet</td></tr>}
            {providers.map((p) => (
              <tr key={p.id} className="hover:bg-slate-800/30">
                <td className="px-4 py-3 text-sm text-white font-medium">{p.name}</td>
                <td className="px-4 py-3 text-xs text-slate-500 font-mono">{p.id}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{new Date(p.created_datetime_utc).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button onClick={() => { setEditing(p); setError(null); setMode('edit') }} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 bg-red-900/40 hover:bg-red-900/60 rounded-lg text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={mode !== null} onClose={() => { setMode(null); setEditing(null) }} title={mode === 'create' ? 'New LLM Provider' : 'Edit LLM Provider'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Name <span className="text-red-400">*</span></label>
            <input name="name" required defaultValue={editing?.name ?? ''} placeholder="e.g. OpenAI, Anthropic" className="inp" />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button type="submit" disabled={submitting} className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm rounded-lg">
            {submitting ? 'Saving…' : mode === 'create' ? 'Create Provider' : 'Save Changes'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
