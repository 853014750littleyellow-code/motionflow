import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Motion = {
  id: string;
  storage_path: string;
  title?: string;
  brand_id?: string;
  app_name?: string;
  motion_type?: string[];
  style_tags?: string[];
  duration?: number;
  resolution?: string;
  file_type: 'mp4' | 'webp' | 'gif' | 'lottie';
  created_at: string;
  updated_at: string;
  brand?: Brand;
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  motion_count?: number;
};
