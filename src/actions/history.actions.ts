"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getCompletedSessions() {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      resources ( name, type )
    `)
    .eq('status', 'completed')
    .order('ended_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching completed sessions:", error);
    return [];
  }
  return data;
}

export async function getSessionItemsHistory(sessionId: string) {
  const { data, error } = await supabase
    .from('session_items')
    .select(`
      *,
      products ( name )
    `)
    .eq('session_id', sessionId);
    
  if (error) return [];
  return data;
}
