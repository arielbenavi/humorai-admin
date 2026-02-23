'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateHumorMix(id: number, captionCount: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('humor_flavor_mix')
    .update({ caption_count: captionCount })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/humor-mix')
  return { error: null }
}
