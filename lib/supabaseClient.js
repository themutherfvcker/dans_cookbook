import { createClient } from '@supabase/supabase-js'

let cachedClient = null

export function getSupabase() {
  if (cachedClient) return cachedClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    // Avoid throwing during module import; only throw if the client is actually requested at runtime
    throw new Error('Supabase client requested without NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  cachedClient = createClient(url, anonKey, { auth: { persistSession: true, detectSessionInUrl: true } })
  return cachedClient
}
