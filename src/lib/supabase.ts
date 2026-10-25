import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nsbmlujnxwfnuhnidmap.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zYm1sdWpueHdmbnVobmlkbWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyNTE3NDQsImV4cCI6MjEwNzgyNzc0NH0.Q3ae0ec_UkxiOLJq8GTCRVDsqElwkKIek7zD3vhugqI';

console.log('[Kheti AI] ✅ Supabase connected:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export const isSupabaseConfigured = true;
