'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCaptionExample(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase.from('caption_examples').insert({
    image_description: formData.get('image_description') as string,
    caption: formData.get('caption') as string,
    explanation: formData.get('explanation') as string,
    priority: parseInt(formData.get('priority') as string) || 0,
    image_id: (formData.get('image_id') as string) || null,
    created_by_user_id: user!.id,
    modified_by_user_id: user!.id,
  })
  if (error) return { error: error.message }
  revalidatePath('/caption-examples')
  return { error: null }
}

export async function updateCaptionExample(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const id = formData.get('id') as string
  const { error } = await supabase.from('caption_examples').update({
    image_description: formData.get('image_description') as string,
    caption: formData.get('caption') as string,
    explanation: formData.get('explanation') as string,
    priority: parseInt(formData.get('priority') as string) || 0,
    image_id: (formData.get('image_id') as string) || null,
    modified_by_user_id: user!.id,
  }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/caption-examples')
  return { error: null }
}

export async function deleteCaptionExample(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('caption_examples').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/caption-examples')
  return { error: null }
}
