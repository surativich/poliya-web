"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getSessionItems(sessionId: string) {
  const { data, error } = await supabase
    .from('session_items')
    .select(`
      *,
      products ( name )
    `)
    .eq('session_id', sessionId);
    
  if (error) {
    console.error("Error fetching session items:", error);
    return [];
  }
  return data;
}

export async function addSessionItem(sessionId: string, productId: string, quantity: number) {
  // 1. Get product info to snapshot price and check stock
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (!product || product.stock_quantity < quantity) {
    return { success: false, error: "Mahsulot qoldig'i yetarli emas!" };
  }

  const total_price = product.sale_price * quantity;

  // 2. Insert session item
  const { error: insertError } = await supabase
    .from('session_items')
    .insert([{
      session_id: sessionId,
      product_id: productId,
      quantity: quantity,
      unit_cost_price: product.cost_price,
      unit_sale_price: product.sale_price,
      total_price: total_price
    }]);

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  // 3. Update session items_cost
  // We fetch current session to get current items_cost
  const { data: session } = await supabase
    .from('sessions')
    .select('items_cost')
    .eq('id', sessionId)
    .single();
    
  const newItemsCost = (session?.items_cost || 0) + total_price;
  
  await supabase
    .from('sessions')
    .update({ items_cost: newItemsCost })
    .eq('id', sessionId);

  // 4. Decrease stock
  await supabase
    .from('products')
    .update({ stock_quantity: product.stock_quantity - quantity })
    .eq('id', productId);

  // 5. Add inventory movement for history
  await supabase
    .from('inventory_movements')
    .insert([{
      product_id: productId,
      type: 'SALE',
      change_amount: -quantity,
      previous_stock: product.stock_quantity,
      new_stock: product.stock_quantity - quantity,
      reason: "O'yin ichida sotildi"
    }]);

  revalidatePath('/');
  return { success: true };
}
