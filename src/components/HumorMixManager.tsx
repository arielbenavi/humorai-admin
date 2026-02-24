'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateHumorMix } from '@/lib/actions/humor-mix'
import { Pencil, Check, X } from 'lucide-react'

interface MixItem {
  id: number
  caption_count: number
  humor_flavor_id: number
  humor_flavors: { slug: string }[] | null
}

export default function HumorMixManager({ mix }: { mix: MixItem[] }) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState<number>(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = mix.reduce((sum, m) => sum + m.caption_count, 0)

  const startEdit = (item: MixItem) => {
    setEditingId(item.id)
    setEditValue(item.caption_count)
    setError(null)
  }

  const cancelEdit = () => { setEditingId(null); setError(null) }

  const saveEdit = async (id: number) => {
    setSaving(true)
    const result = await updateHumorMix(id, editValue)
    setSaving(false)
    if (result.error) setError(result.error)
    else { setEditingId(null); router.refresh() }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Humor Flavor</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-32">Caption Count</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-24">Weight %</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {mix.map((item) => {
              const pct = total > 0 ? ((item.caption_count / total) * 100).toFixed(1) : '0.0'
              const isEditing = editingId === item.id
              return (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-sm text-white font-medium">
                      {item.humor_flavors?.[0]?.slug ?? `flavor #${item.humor_flavor_id}`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                        className="w-24 bg-slate-800 border border-purple-500 rounded-lg px-2 py-1 text-sm text-white focus:outline-none"
                        min={0}
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm text-slate-300">{item.caption_count}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-800 rounded-full h-1.5 max-w-20">
                        <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-slate-500 w-10">{pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="flex gap-1.5">
                        <button onClick={() => saveEdit(item.id)} disabled={saving}
                          className="p-1.5 bg-green-900/40 hover:bg-green-900/60 rounded-lg text-green-400 disabled:opacity-50">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={cancelEdit} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(item)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-800 bg-slate-950/30">
              <td className="px-4 py-2 text-xs text-slate-500 font-medium">Total</td>
              <td className="px-4 py-2 text-xs text-slate-400 font-semibold">{total}</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
