"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function processDirectSale(cartItems: any[], paymentMethod: string, customerId?: string) {
  if (cartItems.length === 0) return { success: false, error: "Savat bo'sh" };

  const totalCost = cartItems.reduce((acc, item) => acc + (item.sale_price * item.quantity), 0);

  let storeResId = null;
  const { data: existingRes } = await supabase.from('resources').select('id').eq('name', "Do'kon Kassasi").single();
  if (existingRes) {
    storeResId = existingRes.id;
  } else {
    // create virtual resource
    const { data: newRes } = await supabase.from('resources').insert([{ 
      name: "Do'kon Kassasi", 
      type: "store", 
      status: "free", 
      hourly_rate: 0 
    }]).select().single();
    if (newRes) storeResId = newRes.id;
  }

  // 1. Create a completed session for the sale
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .insert([{
      resource_id: storeResId,
      status: 'completed',
      hourly_rate_snapshot: 0,
      total_seconds: 0,
      game_cost: 0,
      items_cost: totalCost,
      total_cost: totalCost,
      payment_method: paymentMethod,
      ended_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (sessionError) {
    // try inserting without resource_id entirely if null is not allowed (but it usually is)
    // actually, let's just log and return
    console.error("Error creating direct sale session:", sessionError);
    return { success: false, error: sessionError.message };
  }

  // 2. Insert session items & update stock
  for (const item of cartItems) {
    await supabase.from('session_items').insert([{
      session_id: session.id,
      product_id: item.id,
      quantity: item.quantity,
      unit_cost_price: item.sale_price, // simplified for store direct sales
      unit_sale_price: item.sale_price,
      total_price: item.sale_price * item.quantity
    }]);

    const { data: product } = await supabase.from('products').select('stock_quantity').eq('id', item.id).single();
    if (product) {
      await supabase.from('products').update({ stock_quantity: product.stock_quantity - item.quantity }).eq('id', item.id);
    }
  }

  // 3. Handle debt if payment method is debt
  if (paymentMethod === 'debt' && customerId) {
    await supabase.from('debt_transactions').insert([{
      customer_id: customerId,
      amount: totalCost,
      type: 'debt',
      session_id: session.id,
      description: "Do'kondan mahsulot"
    }]);
  }

  revalidatePath("/");
  revalidatePath("/store");
  revalidatePath("/reports");
  
  return { success: true, sessionId: session.id };
}
