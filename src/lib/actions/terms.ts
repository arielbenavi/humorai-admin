'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTerm(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('terms').insert({
    term: formData.get('term') as string,
    definition: formData.get('definition') as string,
    example: formData.get('example') as string,
    priority: parseInt(formData.get('priority') as string) || 0,
    term_type_id: formData.get('term_type_id') ? parseInt(formData.get('term_type_id') as string) : null,
  })
  if (error) return { error: error.message }
  revalidatePath('/terms')
  return { error: null }
}

export async function updateTerm(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('terms').update({
    term: formData.get('term') as string,
    definition: formData.get('definition') as string,
    example: formData.get('example') as string,
    priority: parseInt(formData.get('priority') as string) || 0,
    term_type_id: formData.get('term_type_id') ? parseInt(formData.get('term_type_id') as string) : null,
  }).eq('id', formData.get('id') as string)
  if (error) return { error: error.message }
  revalidatePath('/terms')
  return { error: null }
}

export async function deleteTerm(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('terms').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/terms')
  return { error: null }
}
