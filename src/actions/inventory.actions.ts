"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name');
    
  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }
  return data;
}

export async function addProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const cost_price = parseInt(formData.get("cost_price") as string);
  const sale_price = parseInt(formData.get("sale_price") as string);
  const stock_quantity = parseInt(formData.get("stock_quantity") as string);
  const min_stock = parseInt(formData.get("min_stock") as string) || 5;

  const { error } = await supabase
    .from('products')
    .insert([{
      name,
      category,
      cost_price,
      sale_price,
      stock_quantity,
      min_stock
    }]);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/inventory');
  return { success: true };
}

export async function updateProduct(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const cost_price = parseInt(formData.get("cost_price") as string);
  const sale_price = parseInt(formData.get("sale_price") as string);
  const stock_quantity = parseInt(formData.get("stock_quantity") as string);
  const min_stock = parseInt(formData.get("min_stock") as string) || 5;

  const { error } = await supabase
    .from('products')
    .update({
      name,
      category,
      cost_price,
      sale_price,
      stock_quantity,
      min_stock
    })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/inventory');
  return { success: true };
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/inventory');
  return { success: true };
}
