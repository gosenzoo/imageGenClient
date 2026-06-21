'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import type { PromptPreset, PresetType } from '@/lib/types'

export async function getPresets(): Promise<PromptPreset[]> {
  const { data, error } = await supabase
    .from('prompt_presets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`プリセット取得失敗: ${error.message}`)
  return (data ?? []) as PromptPreset[]
}

export async function createPreset(
  type: PresetType,
  label: string,
  content: string
): Promise<void> {
  const { error } = await supabase
    .from('prompt_presets')
    .insert({ type, label, content })

  if (error) throw new Error(`プリセット作成失敗: ${error.message}`)
  revalidatePath('/presets')
}

export async function updatePreset(
  id: string,
  type: PresetType,
  label: string,
  content: string
): Promise<void> {
  const { error } = await supabase
    .from('prompt_presets')
    .update({ type, label, content })
    .eq('id', id)

  if (error) throw new Error(`プリセット更新失敗: ${error.message}`)
  revalidatePath('/presets')
}

export async function deletePreset(id: string): Promise<void> {
  const { error } = await supabase
    .from('prompt_presets')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`プリセット削除失敗: ${error.message}`)
  revalidatePath('/presets')
}
