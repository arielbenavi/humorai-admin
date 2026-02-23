import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check superadmin status
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin, first_name, last_name, email')
    .eq('id', user.id)
    .single()

  if (!profile?.is_superadmin) {
    redirect('/access-denied')
  }

  const displayName = [profile!.first_name, profile!.last_name].filter(Boolean).join(' ') || user.email || 'Admin'
  const displayEmail = profile!.email || user.email || ''

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      <Sidebar user={{ name: displayName, email: displayEmail }} />
      <main className="flex-1 overflow-y-auto bg-slate-950">
        {children}
      </main>
    </div>
  )
}
