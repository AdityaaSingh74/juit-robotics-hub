import { createClient } from '@supabase/supabase-js';
import { mockSupabase } from '@/lib/mockSupabaseClient';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enable mock mode during development
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let supabase: any;

if (USE_MOCK) {
  supabase = mockSupabase;
} else if (!supabaseUrl || !supabaseAnonKey) {
  // Log only critical error to help with setup
  if (typeof window !== 'undefined') {
    console.error('Missing Supabase configuration. Please check your .env file.');
    console.error('Required environment variables:');
    console.error('  - VITE_SUPABASE_URL');
    console.error('  - VITE_SUPABASE_ANON_KEY');
  }
  supabase = mockSupabase;
} else {
  try {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      // Removed redundant apikey header - Supabase handles auth internally
      // The apikey header was causing conflicts with Supabase's own auth mechanism
    });
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    supabase = mockSupabase;
  }
}

export { supabase };