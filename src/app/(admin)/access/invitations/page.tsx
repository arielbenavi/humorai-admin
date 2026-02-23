import { createClient } from '@/lib/supabase/server'
import InvitationsManager from '@/components/InvitationsManager'

export default async function InvitationsPage() {
  const supabase = await createClient()
  const { data: invitations } = await supabase
    .from('invitations')
    .select('id, created_datetime_utc, inviter_id, profiles:inviter_id(email)')
    .order('created_datetime_utc', { ascending: false })

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Invitations</h1>
        <p className="text-slate-400 text-sm mt-1">{invitations?.length ?? 0} invitations</p>
      </div>
      <InvitationsManager invitations={invitations ?? []} />
    </div>
  )
}
