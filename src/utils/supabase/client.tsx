import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Use environment variables if available, otherwise fall back to imported values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || `https://${projectId}.supabase.co`;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || publicAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);