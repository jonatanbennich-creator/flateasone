import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Member = {
  id: string;
  username: string;
  name: string;
  email: string;
  company: string;
  bio: string;
  avatar_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type MemberProject = {
  id: string;
  member_id: string;
  title: string;
  slug: string;
  description: string;
  project_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};
