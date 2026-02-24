'use client'

import { useRouter } from 'next/navigation'
import { deleteInvitation } from '@/lib/actions/access'
import { Trash2, KeyRound } from 'lucide-react'

interface Invitation {
  id: number
  created_datetime_utc: string
  inviter_id: string | null
  profiles: { email: string | null }[] | null
}

export default function InvitationsManager({ invitations }: { invitations: Invitation[] }) {
  const router = useRouter()

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this invitation?')) return
    const result = await deleteInvitation(id)
    if (result.error) alert(result.error); else router.refresh()
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {invitations.length === 0 ? (
        <p className="px-4 py-8 text-center text-slate-500 text-sm">No invitations</p>
      ) : (
        <table className="w-full">
          <thead><tr className="border-b border-slate-800">
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-20">ID</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Invited By</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-36">Created</th>
            <th className="w-16 px-4 py-3" />
          </tr></thead>
          <tbody className="divide-y divide-slate-800">
            {invitations.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-800/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-sm text-slate-300 font-mono">{inv.id}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-400">
                  {inv.profiles?.[0]?.email ?? inv.inviter_id ?? '—'}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{new Date(inv.created_datetime_utc).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(inv.id)}
                    className="p-1.5 bg-red-900/40 hover:bg-red-900/60 rounded-lg text-red-400 hover:text-red-300">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
