'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ---- Signup Domains ----

export async function createSignupDomain(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('allowed_signup_domains').insert({
    apex_domain: (formData.get('apex_domain') as string).toLowerCase().trim(),
  })
  if (error) return { error: error.message }
  revalidatePath('/access/signup-domains')
  return { error: null }
}

export async function deleteSignupDomain(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('allowed_signup_domains').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/access/signup-domains')
  return { error: null }
}

// ---- Whitelist Emails ----

export async function createWhitelistEmail(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('whitelist_email_addresses').insert({
    email_address: (formData.get('email_address') as string).toLowerCase().trim(),
  })
  if (error) return { error: error.message }
  revalidatePath('/access/whitelist')
  return { error: null }
}

export async function deleteWhitelistEmail(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('whitelist_email_addresses').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/access/whitelist')
  return { error: null }
}

// ---- Invitations ----

export async function deleteInvitation(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('invitations').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/access/invitations')
  return { error: null }
}
