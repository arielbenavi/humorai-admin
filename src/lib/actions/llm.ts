'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ---- LLM Providers ----

export async function createLLMProvider(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('llm_providers').insert({
    name: formData.get('name') as string,
  })
  if (error) return { error: error.message }
  revalidatePath('/llm/providers')
  return { error: null }
}

export async function updateLLMProvider(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('llm_providers').update({
    name: formData.get('name') as string,
  }).eq('id', formData.get('id') as string)
  if (error) return { error: error.message }
  revalidatePath('/llm/providers')
  return { error: null }
}

export async function deleteLLMProvider(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('llm_providers').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/llm/providers')
  return { error: null }
}

// ---- LLM Models ----

export async function createLLMModel(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('llm_models').insert({
    name: formData.get('name') as string,
    provider_model_id: formData.get('provider_model_id') as string,
    llm_provider_id: parseInt(formData.get('llm_provider_id') as string),
    is_temperature_supported: formData.get('is_temperature_supported') === 'true',
  })
  if (error) return { error: error.message }
  revalidatePath('/llm/models')
  return { error: null }
}

export async function updateLLMModel(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('llm_models').update({
    name: formData.get('name') as string,
    provider_model_id: formData.get('provider_model_id') as string,
    llm_provider_id: parseInt(formData.get('llm_provider_id') as string),
    is_temperature_supported: formData.get('is_temperature_supported') === 'true',
  }).eq('id', formData.get('id') as string)
  if (error) return { error: error.message }
  revalidatePath('/llm/models')
  return { error: null }
}

export async function deleteLLMModel(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('llm_models').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/llm/models')
  return { error: null }
}
