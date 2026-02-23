import { createClient } from '@/lib/supabase/server'
import WhitelistManager from '@/components/WhitelistManager'

export default async function WhitelistPage() {
  const supabase = await createClient()
  const { data: emails } = await supabase
    .from('whitelist_email_addresses')
    .select('id, email_address, created_datetime_utc')
    .order('email_address')

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Whitelist Email Addresses</h1>
        <p className="text-slate-400 text-sm mt-1">Individual emails allowed to sign up. {emails?.length ?? 0} addresses.</p>
      </div>
      <WhitelistManager emails={emails ?? []} />
    </div>
  )
}
