"use server";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getInventoryMovements() {
  const { data, error } = await supabase
    .from("inventory_movements")
    .select("*, products(name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching inventory moves:", error);
    return [];
  }
  return data;
}

// Optionally a function to manually add movement when editing stock
export async function addInventoryMovement(productId: string, prevStock: number, newStock: number, type: string, reason: string) {
  const { error } = await supabase.from("inventory_movements").insert([{
    product_id: productId,
    previous_stock: prevStock,
    change_amount: newStock - prevStock,
    new_stock: newStock,
    type,
    reason
  }]);
  
  if (error) {
    console.error("Error adding inventory move:", error);
  }
}

