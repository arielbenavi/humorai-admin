import { createClient } from '@/lib/supabase/server'
import SignupDomainsManager from '@/components/SignupDomainsManager'

export default async function SignupDomainsPage() {
  const supabase = await createClient()
  const { data: domains } = await supabase
    .from('allowed_signup_domains')
    .select('id, apex_domain, created_datetime_utc')
    .order('apex_domain')

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Allowed Signup Domains</h1>
        <p className="text-slate-400 text-sm mt-1">Email domains allowed to sign up. {domains?.length ?? 0} domains.</p>
      </div>
      <SignupDomainsManager domains={domains ?? []} />
    </div>
  )
}
