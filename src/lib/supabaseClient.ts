import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper function to create a client with specific persistence settings
export const createSupabaseClientWithPersistence = (persistent: boolean) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: persistent ? window.localStorage : window.sessionStorage,
      autoRefreshToken: true,
      persistSession: persistent,
      detectSessionInUrl: true
    }
  })
}