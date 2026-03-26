import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let client: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase nie jest skonfigurowany. Ustaw VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY.');
  }
  if (!client) {
    client = createSupabaseClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
