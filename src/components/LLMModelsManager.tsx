'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Modal from './Modal'
import { createLLMModel, updateLLMModel, deleteLLMModel } from '@/lib/actions/llm'
import { Plus, Pencil, Trash2, Thermometer } from 'lucide-react'

interface Model {
  id: number; name: string; provider_model_id: string
  is_temperature_supported: boolean; created_datetime_utc: string
  llm_provider_id: number; llm_providers: { name: string } | null
}
interface Provider { id: number; name: string }

export default function LLMModelsManager({ models, providers }: { models: Model[]; providers: Provider[] }) {
  const router = useRouter()
  const [mode, setMode] = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Model | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSubmitting(true)
    const formData = new FormData(e.currentTarget)
    // Handle checkbox
    if (!formData.has('is_temperature_supported')) formData.set('is_temperature_supported', 'false')
    const result = mode === 'create' ? await createLLMModel(formData) : await updateLLMModel(formData)
    setSubmitting(false)
    if (result.error) setError(result.error)
    else { setMode(null); setEditing(null); router.refresh() }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this model? This will fail if flavor steps reference it.')) return
    const result = await deleteLLMModel(id)
    if (result.error) alert(result.error); else router.refresh()
  }

  return (
    <div className="space-y-4">
      <style>{`.inp{width:100%;background:#0f172a;border:1px solid #334155;border-radius:.5rem;padding:.5rem .75rem;color:white;font-size:.875rem;outline:none}.inp:focus{border-color:#a855f7}`}</style>
      <div className="flex justify-end">
        <button onClick={() => { setEditing(null); setError(null); setMode('create') }}
          className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg">
          <Plus className="w-4 h-4" /> New Model
        </button>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-slate-800">
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Provider Model ID</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-28">Provider</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-12">Temp</th>
            <th className="w-20 px-4 py-3" />
          </tr></thead>
          <tbody className="divide-y divide-slate-800">
            {models.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No models yet</td></tr>}
            {models.map((m) => (
              <tr key={m.id} className="hover:bg-slate-800/30">
                <td className="px-4 py-3 text-sm text-white font-medium">{m.name}</td>
                <td className="px-4 py-3 text-xs text-slate-400 font-mono">{m.provider_model_id}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{m.llm_providers?.name ?? '—'}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  {m.is_temperature_supported && <Thermometer className="w-3.5 h-3.5 text-orange-400 mx-auto" />}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button onClick={() => { setEditing(m); setError(null); setMode('edit') }} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(m.id)} className="p-1.5 bg-red-900/40 hover:bg-red-900/60 rounded-lg text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={mode !== null} onClose={() => { setMode(null); setEditing(null) }} title={mode === 'create' ? 'New LLM Model' : 'Edit LLM Model'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Display Name <span className="text-red-400">*</span></label>
            <input name="name" required defaultValue={editing?.name ?? ''} placeholder="e.g. GPT-4o" className="inp" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Provider Model ID <span className="text-red-400">*</span></label>
            <input name="provider_model_id" required defaultValue={editing?.provider_model_id ?? ''} placeholder="e.g. gpt-4o-mini" className="inp" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Provider <span className="text-red-400">*</span></label>
            <select name="llm_provider_id" required defaultValue={editing?.llm_provider_id ?? ''} className="inp">
              <option value="">— Select Provider —</option>
              {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input type="checkbox" name="is_temperature_supported" value="true" defaultChecked={editing?.is_temperature_supported ?? false} className="accent-purple-500" />
            Temperature supported
          </label>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button type="submit" disabled={submitting} className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm rounded-lg">
            {submitting ? 'Saving…' : mode === 'create' ? 'Create Model' : 'Save Changes'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
