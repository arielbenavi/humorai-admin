'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createWhitelistEmail, deleteWhitelistEmail } from '@/lib/actions/access'
import { Plus, Trash2, Mail } from 'lucide-react'

interface Email { id: number; email_address: string; created_datetime_utc: string }

export default function WhitelistManager({ emails }: { emails: Email[] }) {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    setSubmitting(true); setError(null)
    const formData = new FormData()
    formData.set('email_address', input.trim())
    const result = await createWhitelistEmail(formData)
    setSubmitting(false)
    if (result.error) setError(result.error)
    else { setInput(''); router.refresh() }
  }

  const handleDelete = async (id: number, email: string) => {
    if (!confirm(`Remove "${email}" from whitelist?`)) return
    const result = await deleteWhitelistEmail(id)
    if (result.error) alert(result.error); else router.refresh()
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="email" value={input} onChange={(e) => setInput(e.target.value)} placeholder="user@example.com"
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500" />
        </div>
        <button type="submit" disabled={submitting || !input.trim()}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm rounded-lg">
          <Plus className="w-4 h-4" /> Add Email
        </button>
      </form>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {emails.length === 0 ? (
          <p className="px-4 py-8 text-center text-slate-500 text-sm">No whitelisted emails yet</p>
        ) : (
          <ul className="divide-y divide-slate-800">
            {emails.map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/30">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="flex-1 text-sm text-white">{e.email_address}</span>
                <span className="text-xs text-slate-600">{new Date(e.created_datetime_utc).toLocaleDateString()}</span>
                <button onClick={() => handleDelete(e.id, e.email_address)}
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
