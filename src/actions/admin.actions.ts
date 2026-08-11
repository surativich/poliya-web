"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function clearAllTestData() {
  try {
    // Delete in correct order to respect foreign keys
    await supabase.from('session_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('inventory_movements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('debt_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Reset customer debts to 0
    await supabase.from('customers').update({ total_debt: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
    
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to clear data:", error);
    return { success: false, error: error.message };
  }
}
