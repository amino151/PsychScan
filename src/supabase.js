import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Détermine si un backend Supabase réel est configuré. Sinon, l'application
// bascule automatiquement sur un mode démo local (mock) entièrement navigable.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.info(
    '[PsychoScan IOS] VITE_SUPABASE_URL/ANON_KEY absents : mode démo local (données mock) activé.'
  );
}

export const supabase = createClient(supabaseUrl || 'http://localhost', supabaseAnonKey || 'public-anon-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});
