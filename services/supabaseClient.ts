import { createClient } from '@supabase/supabase-js';

// Mencoba membaca variable dari berbagai kemungkinan environment (Vite, CRA, atau Node)
const getEnv = (key: string) => {
  // Cek import.meta.env (Vite)
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  // Cek process.env (Create React App / Node)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || process.env[`REACT_APP_${key.replace('VITE_', '')}`];
  }
  return '';
};

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('WARNING: Supabase URL or Anon Key is missing. Please check your environment variables (.env file).');
}

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-key'
);