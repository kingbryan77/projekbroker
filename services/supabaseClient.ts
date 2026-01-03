import { createClient } from '@supabase/supabase-js';

/**
 * PENTING: Ganti URL dan KEY di bawah ini dengan kredensial proyek Supabase Anda.
 * Anda bisa menemukannya di: Project Settings > API
 */
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-public-key';

// Inisialisasi client Supabase asli
// Jika environment variable tersedia, ia akan menggunakannya.
export const supabase = createClient(
  (typeof process !== 'undefined' && process.env.SUPABASE_URL) || SUPABASE_URL,
  (typeof process !== 'undefined' && process.env.SUPABASE_ANON_KEY) || SUPABASE_ANON_KEY
);