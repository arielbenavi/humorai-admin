'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateHumorMix(id: number, captionCount: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('humor_flavor_mix')
    .update({ caption_count: captionCount, modified_by_user_id: user!.id })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/humor-mix')
  return { error: null }
}
