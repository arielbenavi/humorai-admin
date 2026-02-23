'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSignupDomain, deleteSignupDomain } from '@/lib/actions/access'
import { Plus, Trash2, Globe } from 'lucide-react'

interface Domain { id: number; apex_domain: string; created_datetime_utc: string }

export default function SignupDomainsManager({ domains }: { domains: Domain[] }) {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    setSubmitting(true); setError(null)
    const formData = new FormData()
    formData.set('apex_domain', input.trim())
    const result = await createSignupDomain(formData)
    setSubmitting(false)
    if (result.error) setError(result.error)
    else { setInput(''); router.refresh() }
  }

  const handleDelete = async (id: number, domain: string) => {
    if (!confirm(`Remove "${domain}" from allowed domains?`)) return
    const result = await deleteSignupDomain(id)
    if (result.error) alert(result.error); else router.refresh()
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex gap-2">
        <div className="relative flex-1">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="example.edu"
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500" />
        </div>
        <button type="submit" disabled={submitting || !input.trim()}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm rounded-lg">
          <Plus className="w-4 h-4" /> Add Domain
        </button>
      </form>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {domains.length === 0 ? (
          <p className="px-4 py-8 text-center text-slate-500 text-sm">No allowed domains yet</p>
        ) : (
          <ul className="divide-y divide-slate-800">
            {domains.map((d) => (
              <li key={d.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/30">
                <Globe className="w-4 h-4 text-green-400 shrink-0" />
                <span className="flex-1 text-sm text-white font-mono">{d.apex_domain}</span>
                <span className="text-xs text-slate-600">{new Date(d.created_datetime_utc).toLocaleDateString()}</span>
                <button onClick={() => handleDelete(d.id, d.apex_domain)}
                  className="p-1.5 bg-red-900/40 hover:bg-red-900/60 rounded-lg text-red-400 hover:text-red-300">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
