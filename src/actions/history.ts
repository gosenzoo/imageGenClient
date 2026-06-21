'use server'

import { supabase } from '@/lib/supabase'
import type { Generation } from '@/lib/types'

const PAGE_SIZE = 10

export async function getHistory(page: number): Promise<{ data: Generation[]; total: number }> {
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data, error, count } = await supabase
    .from('generations')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw new Error(`履歴取得失敗: ${error.message}`)
  return { data: (data ?? []) as Generation[], total: count ?? 0 }
}
