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
    .eq('is_active', true)
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
    
  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .gte('created_at', todayStr);

  let totalRevenue = 0; // Jami qilingan savdo (naqd + karta + qarz)
  let netCash = 0;      // Kassaga tushgan real pul (naqd + karta o'yinlardan)
  let newDebts = 0;     // Yangi berilgan qarzlar
  let netProfit = 0;    // Sof foyda (tushum - tannarx)
  let totalExpenses = 0; // Jami xarajatlar bugungi

  if (sessions) {
    sessions.forEach(s => {
      totalRevenue += s.total_cost || 0;
      netProfit += s.net_profit || 0;
      
      // Calculate net cash from split payments
      netCash += (s.paid_cash || 0) + (s.paid_card || 0);
      newDebts += s.debt_amount || 0;
    });
  }

  if (debts) {
    debts.forEach(d => {
      // Qarz to'lovi kelsa, u kassaga naqd/karta bo'lib tushadi
      if (d.type === 'payment') {
        const paymentAmount = Math.abs(d.amount);
        netCash += paymentAmount;
      } 
      // Qarz berilishi (debt) allaqachon sessions loopida hisoblandi
    });
  }
  
  if (expenses) {
    expenses.forEach(e => {
      totalExpenses += e.amount || 0;
    });
  }

  // Kassadagi sof qoldiq: Tushgan pullar - Xarajatlar
  const cashBalance = netCash - totalExpenses;
  
  // Haqiqiy foydadan ham xarajatlarni ayirib yuborsak, bugungi toza cho'ntakka qoladigan pul chiqadi:
  const finalProfit = netProfit - totalExpenses;

  return { totalRevenue, netCash, cashBalance, newDebts, netProfit, finalProfit, totalExpenses };
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

export async function endSession(
  sessionId: string, 
  resourceId: string, 
  totalSeconds: number, 
  gameCost: number, 
  paymentMethod: string, 
  customerId?: string,
  newCustomerName?: string,
  newCustomerPhone?: string,
  paidCash: number = 0,
  paidCard: number = 0,
  debtAmount: number = 0
) {
  // 1. Get current session to get items_cost and calculate items profit
  const { data: sessionItems } = await supabase
    .from('session_items')
    .select('total_price, unit_sale_price, unit_cost_price, quantity')
    .eq('session_id', sessionId);
    
  let itemsCost = 0;
  let itemsProfit = 0;
  
  if (sessionItems) {
    sessionItems.forEach(item => {
      itemsCost += item.total_price;
      itemsProfit += (item.unit_sale_price - item.unit_cost_price) * item.quantity;
    });
  }

  const totalCost = gameCost + itemsCost;
  const netProfit = gameCost + itemsProfit; // Game cost is 100% profit

  // If debtAmount is positive, ensure payment method is updated or handled
  // Actually we use 'split' or the main payment method, but we record exact amounts

  // 2. Update session
  const { error } = await supabase
    .from('sessions')
    .update({
      ended_at: new Date().toISOString(),
      status: 'completed',
      total_seconds: totalSeconds,
      game_cost: gameCost,
      total_cost: totalCost,
      net_profit: netProfit,
      payment_method: paymentMethod, // legacy or main method
      paid_cash: paidCash,
      paid_card: paidCard,
      debt_amount: debtAmount
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
  if (debtAmount > 0) {
    let finalCustomerId = customerId;

    // Create new customer if requested
    if (newCustomerName) {
      const { data: newCust, error: createError } = await supabase
        .from('customers')
        .insert([{
          full_name: newCustomerName,
          phone_number: newCustomerPhone || '',
          total_debt: debtAmount
        }])
        .select()
        .single();
        
      if (!createError && newCust) {
        finalCustomerId = newCust.id;
        // The debt is already accounted for in total_debt at creation, but we still need the transaction record
        await supabase.from('debt_transactions').insert([{
          customer_id: finalCustomerId,
          amount: debtAmount,
          type: 'debt',
          description: `Qarz (Naqd: ${paidCash}, Karta: ${paidCard})`
        }]);
      }
    } else if (finalCustomerId) {
      // Existing customer
      const { data: customer } = await supabase.from('customers').select('total_debt').eq('id', finalCustomerId).single();
      if (customer) {
        await supabase.from('debt_transactions').insert([{
          customer_id: finalCustomerId,
          amount: debtAmount,
          type: 'debt',
          description: `Qarz (Naqd: ${paidCash}, Karta: ${paidCard})`
        }]);
        await supabase.from('customers').update({ total_debt: customer.total_debt + debtAmount }).eq('id', finalCustomerId);
      }
    }
  }

  revalidatePath('/');
  return { success: true };
}

export async function endSessionWithNewCustomer(
  sessionId: string, 
  resourceId: string, 
  totalSeconds: number, 
  gameCost: number, 
  formData: FormData,
  paidCash: number = 0,
  paidCard: number = 0,
  debtAmount: number = 0
) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string || '';
  const village = formData.get("village") as string || '';
  const photo = formData.get("photo") as File | null;

  // 1. Get current session to get items_cost and calculate items profit
  const { data: sessionItems } = await supabase
    .from('session_items')
    .select('total_price, unit_sale_price, unit_cost_price, quantity')
    .eq('session_id', sessionId);

  let itemsCost = 0;
  let itemsProfit = 0;
  
  if (sessionItems) {
    sessionItems.forEach(item => {
      itemsCost += item.total_price;
      itemsProfit += (item.unit_sale_price - item.unit_cost_price) * item.quantity;
    });
  }

  const totalCost = gameCost + itemsCost;
  const netProfit = gameCost + itemsProfit;

  // 2. Upload photo if exists
  let photo_url = null;
  if (photo && photo.size > 0) {
    const fileName = `${Date.now()}_${photo.name.replace(/\s/g, '_')}`;
    const { error: uploadError } = await supabase.storage
      .from('customers')
      .upload(fileName, photo);

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('customers')
        .getPublicUrl(fileName);
      photo_url = publicUrl;
    }
  }

  // 3. Create customer
  const { data: newCust, error: createError } = await supabase
    .from('customers')
    .insert([{
      full_name: name,
      phone_number: phone,
      village,
      photo_url,
      total_debt: debtAmount
    }])
    .select()
    .single();

  if (createError || !newCust) {
    return { success: false, error: "Mijoz yaratishda xato: " + (createError?.message || '') };
  }

  // 4. Record debt
  await supabase.from('debt_transactions').insert([{
    customer_id: newCust.id,
    amount: debtAmount,
    type: 'debt',
    session_id: sessionId,
    description: `Qarz (Naqd: ${paidCash}, Karta: ${paidCard})`
  }]);

  // 5. Update session
  const { error } = await supabase
    .from('sessions')
    .update({
      ended_at: new Date().toISOString(),
      status: 'completed',
      total_seconds: totalSeconds,
      game_cost: gameCost,
      total_cost: totalCost,
      net_profit: netProfit,
      payment_method: 'debt',
      paid_cash: paidCash,
      paid_card: paidCard,
      debt_amount: debtAmount
    })
    .eq('id', sessionId);

  if (error) {
    return { success: false, error: error.message };
  }

  // 6. Update resource status
  await supabase
    .from('resources')
    .update({ status: 'free' })
    .eq('id', resourceId);

  revalidatePath('/');
  return { success: true };
}
