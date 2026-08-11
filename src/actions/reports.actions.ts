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

export async function getShopStats() {
  const { data: products } = await supabase
    .from("products")
    .select("cost_price, stock_quantity");

  let totalInventoryCost = 0;
  if (products) {
    products.forEach(p => {
      totalInventoryCost += (p.cost_price || 0) * (p.stock_quantity || 0);
    });
  }

  const { data: sessionItems } = await supabase
    .from("session_items")
    .select("total_price, unit_sale_price, unit_cost_price, quantity");

  let shopRevenue = 0;
  let shopProfit = 0;

  if (sessionItems) {
    sessionItems.forEach(item => {
      shopRevenue += item.total_price || 0;
      shopProfit += ((item.unit_sale_price || 0) - (item.unit_cost_price || 0)) * (item.quantity || 0);
    });
  }

  return { shopRevenue, shopProfit, totalInventoryCost };
}

