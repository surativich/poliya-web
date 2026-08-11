"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getExpenses() {
  const { data, error } = await supabase
    .from("expenses")
    .select("*, users(full_name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }
  return data;
}

export async function addExpense(formData: FormData) {
  const amount = parseInt(formData.get("amount") as string);
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;
  // TODO: getting user_id requires passing it or getting from cookie, but Supabase anon key won't know it unless we do.
  // We can just leave user_id null for now or fetch role from cookie and insert.

  const { error } = await supabase.from("expenses").insert([{
    amount,
    category,
    description
  }]);

  if (error) {
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin");
  return { success: true };
}

