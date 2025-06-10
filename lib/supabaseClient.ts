import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseAdminSingleton: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdminSingleton) {
    return supabaseAdminSingleton;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase URL or Service Role Key is missing for admin client. Check your .env.local file.");
  }

  supabaseAdminSingleton = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      // Wir deaktivieren autoRefreshToken für Service Role Keys, da sie nicht ablaufen
      autoRefreshToken: false,
      persistSession: false,
    }
  });
  return supabaseAdminSingleton;
}