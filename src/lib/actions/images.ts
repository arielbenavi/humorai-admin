'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const STORAGE_BUCKET = 'images'

export async function createImage(formData: FormData) {
  const supabase = await createClient()

  let url = (formData.get('url') as string) || ''
  const file = formData.get('file') as File | null

  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = file.name.split('.').pop() ?? 'jpg'
    const fileName = `${Date.now()}.${ext}`

    const { data, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, buffer, { contentType: file.type, upsert: false })

    if (uploadError) {
      return { error: `Storage upload failed: ${uploadError.message}. Falling back to URL input.` }
    }

    const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path)
    url = urlData.publicUrl
  }

  if (!url) return { error: 'Either a file or a URL is required.' }

  const { error } = await supabase.from('images').insert({
    url,
    is_public: formData.get('is_public') === 'true',
    is_common_use: formData.get('is_common_use') === 'true',
    additional_context: (formData.get('additional_context') as string) || null,
    image_description: (formData.get('image_description') as string) || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/images')
  return { error: null }
}

export async function updateImage(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { error } = await supabase
    .from('images')
    .update({
      url: formData.get('url') as string,
      is_public: formData.get('is_public') === 'true',
      is_common_use: formData.get('is_common_use') === 'true',
      additional_context: (formData.get('additional_context') as string) || null,
      image_description: (formData.get('image_description') as string) || null,
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/images')
  return { error: null }
}

export async function deleteImage(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('images').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/images')
  return { error: null }
}
