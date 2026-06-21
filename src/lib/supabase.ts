import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// サーバーサイド専用クライアント（service role key 使用）
export const supabase = createClient(supabaseUrl, supabaseKey)

export const GENERATED_BUCKET = 'generated-images'
export const REFERENCE_BUCKET = 'reference-images'
