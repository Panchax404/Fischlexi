import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Typisierter Supabase-Client mit dem generierten Datenbankschema
export type TypedSupabaseClient = SupabaseClient<Database>;

let supabasePublicSingleton: TypedSupabaseClient | null = null;
let supabaseAdminSingleton: TypedSupabaseClient | null = null;

/**
 * ÖFFENTLICHER LESE-CLIENT — für regulären App-Traffic (RSC, Route Handler).
 * Verwendet NEXT_PUBLIC_SUPABASE_ANON_KEY und respektiert Row Level Security (RLS).
 */
export function getSupabasePublic(): TypedSupabaseClient {
  if (supabasePublicSingleton) {
    return supabasePublicSingleton;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase URL oder Anon Key fehlt für den Public Client. Prüfe .env.local / .env.example.'
    );
  }

  supabasePublicSingleton = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return supabasePublicSingleton;
}

/**
 * ADMIN-CLIENT — umgeht RLS (BYPASSRLS via SUPABASE_SERVICE_ROLE_KEY).
 * ⚠️ NUR für geschützte Backend-/Seed-/Migrations-Jobs verwenden.
 */
export function getSupabaseAdmin(): TypedSupabaseClient {
  if (supabaseAdminSingleton) {
    return supabaseAdminSingleton;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Supabase URL oder Service Role Key fehlt für den Admin Client. Prüfe .env.local.'
    );
  }

  supabaseAdminSingleton = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return supabaseAdminSingleton;
}
