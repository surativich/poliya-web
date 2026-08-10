"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function getResources() {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .order('name');
    
  if (error) {
    console.error("Error fetching resources:", error);
    return [];
  }
  return data;
}

export async function getActiveSessions() {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('status', 'active');
    
  if (error) {
    console.error("Error fetching active sessions:", error);
    return [];
  }
  return data;
}

export async function getTodayStats() {
  // Bugungi sanani boshlanishi (UTC yoki local bo'lishi mumkin, soddalik uchun o'tgan 24 soat olamiz)
  const today = new Date();
  today.setHours(0,0,0,0);
  const todayStr = today.toISOString();

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('status', 'completed')
    .gte('ended_at', todayStr);

  const { data: debts } = await supabase
    .from('debt_transactions')
    .select('*')
    .gte('created_at', todayStr);

  let totalIncome = 0;
  let cashIncome = 0;
  let cardIncome = 0;
  let newDebts = 0;

  if (sessions) {
    sessions.forEach(s => {
      totalIncome += s.total_cost || 0;
      if (s.payment_method === 'cash') cashIncome += s.total_cost || 0;
      if (s.payment_method === 'card') cardIncome += s.total_cost || 0;
      if (s.payment_method === 'debt') newDebts += s.total_cost || 0;
    });
  }

  if (debts) {
    debts.forEach(d => {
      if (d.type === 'payment') {
        // qarz to'lovi
        const paymentAmount = Math.abs(d.amount);
        totalIncome += paymentAmount;
        if (d.payment_method === 'cash') cashIncome += paymentAmount;
        if (d.payment_method === 'card') cardIncome += paymentAmount;
      } else if (d.type === 'debt') {
        newDebts += Math.abs(d.amount);
      }
    });
  }

  return { totalIncome, cashIncome, cardIncome, newDebts };
}

export async function startSession(resourceId: string, hourlyRate: number) {
  const { data: existingSession } = await supabase
    .from('sessions')
    .select('id')
    .eq('resource_id', resourceId)
    .eq('status', 'active')
    .single();

  if (existingSession) {
    return { success: false, error: "Bu joy allaqachon band." };
  }

  const { data, error } = await supabase
    .from('sessions')
    .insert([{
      resource_id: resourceId,
      hourly_rate_snapshot: hourlyRate,
      status: 'active'
    }])
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  await supabase
    .from('resources')
    .update({ status: 'occupied' })
    .eq('id', resourceId);

  revalidatePath('/');
  return { success: true, data };
}

export async function endSession(sessionId: string, resourceId: string, totalSeconds: number, gameCost: number, paymentMethod: string, customerId?: string) {
  // 1. Get current session to get items_cost
  const { data: session } = await supabase
    .from('sessions')
    .select('items_cost')
    .eq('id', sessionId)
    .single();

  const itemsCost = session?.items_cost || 0;
  const totalCost = gameCost + itemsCost;

  // 2. Update session
  const { error } = await supabase
    .from('sessions')
    .update({
      ended_at: new Date().toISOString(),
      status: 'completed',
      total_seconds: totalSeconds,
      game_cost: gameCost,
      total_cost: totalCost,
      payment_method: paymentMethod
    })
    .eq('id', sessionId);

  if (error) {
    return { success: false, error: error.message };
  }

  // 3. Update resource status
  await supabase
    .from('resources')
    .update({ status: 'free' })
    .eq('id', resourceId);
    
  // 4. Handle debt if applicable
  if (paymentMethod === 'debt' && customerId) {
    // get customer
    const { data: customer } = await supabase.from('customers').select('total_debt').eq('id', customerId).single();
    if (customer) {
      // insert debt tx
      await supabase.from('debt_transactions').insert([{
        customer_id: customerId,
        amount: totalCost,
        type: 'debt',
        description: 'O\'yin va mahsulotlar uchun qarz'
      }]);
      // update customer debt
      await supabase.from('customers').update({ total_debt: customer.total_debt + totalCost }).eq('id', customerId);
    }
  }

  revalidatePath('/');
  return { success: true };
}
