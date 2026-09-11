import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && (supabaseAnonKey || supabaseServiceRoleKey));

// Public client for client-side queries with RLS
export const supabase = isSupabaseConfigured && supabaseAnonKey
  ? createClient(supabaseUrl!, supabaseAnonKey)
  : null;

// Privileged client for server-side transactions & webhook verification
export const supabaseAdmin = isSupabaseConfigured && supabaseServiceRoleKey
  ? createClient(supabaseUrl!, supabaseServiceRoleKey)
  : null;