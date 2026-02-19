import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// The new clean way
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// THE FIX: Add this line to stop the error in the other files!
export const supabaseClient = supabase;
