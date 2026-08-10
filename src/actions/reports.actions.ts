"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getReportsData() {
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('status', 'completed');
    
  if (error) return { sessions: [] };
  return { sessions };
}
