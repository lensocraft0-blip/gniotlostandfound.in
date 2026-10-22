import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { UserProfile } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

// Create real client if configured, otherwise null
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export interface SupabaseConfigStatus {
  configured: boolean;
  urlPresent: boolean;
  keyPresent: boolean;
  projectHost: string;
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  return {
    configured: isSupabaseConfigured,
    urlPresent: Boolean(supabaseUrl),
    keyPresent: Boolean(supabaseAnonKey),
    projectHost: supabaseUrl ? new URL(supabaseUrl).host : 'not-configured',
  };
}
