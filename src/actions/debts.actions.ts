"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
  return data;
}

export async function addDebt(formData: FormData) {
  const full_name = formData.get("full_name") as string;
  const phone_number = formData.get("phone_number") as string;
  const village = formData.get("village") as string;
  const amount = parseInt(formData.get("amount") as string);
  const description = formData.get("description") as string;
  const photo = formData.get("photo") as File;
  
  let photo_url = null;

  // 1. Upload photo to Supabase Storage
  if (photo && photo.size > 0) {
    const fileName = `${Date.now()}_${photo.name.replace(/\s/g, '_')}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('customers')
      .upload(fileName, photo);

    if (uploadError) {
      return { success: false, error: "Rasm yuklashda xatolik: " + uploadError.message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('customers')
      .getPublicUrl(fileName);
      
    photo_url = publicUrl;
  }

  // 2. Insert Customer
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .insert([{
      full_name,
      phone_number,
      village,
      photo_url,
      total_debt: amount
    }])
    .select()
    .single();

  if (customerError) {
    return { success: false, error: "Mijoz yaratishda xato: " + customerError.message };
  }

  // 3. Insert Debt Transaction
  const { error: txError } = await supabase
    .from('debt_transactions')
    .insert([{
      customer_id: customer.id,
      amount: amount,
      type: 'debt',
      description: description
    }]);

  if (txError) {
    return { success: false, error: "Qarz tranzaksiyasida xato: " + txError.message };
  }

  revalidatePath('/debts');
  return { success: true };
}

export async function payDebt(customerId: string, amount: number, paymentMethod: string) {
  // Get current customer debt
  const { data: customer, error: fetchError } = await supabase
    .from('customers')
    .select('total_debt')
    .eq('id', customerId)
    .single();

  if (fetchError || !customer) {
    return { success: false, error: "Mijoz topilmadi" };
  }

  // Insert payment transaction (amount is negative for payments in UI, or we record it as positive but type='payment', let's stick to schema: amount is negative for payment)
  const txAmount = -Math.abs(amount);

  const { error: txError } = await supabase
    .from('debt_transactions')
    .insert([{
      customer_id: customerId,
      amount: txAmount,
      type: 'payment',
      payment_method: paymentMethod,
      description: "Qarz to'lovi"
    }]);

  if (txError) {
    return { success: false, error: "To'lovni saqlashda xato: " + txError.message };
  }

  // Update total debt
  const newDebt = customer.total_debt + txAmount; // newDebt = total - payment
  await supabase
    .from('customers')
    .update({ total_debt: newDebt })
    .eq('id', customerId);

  revalidatePath('/debts');
  return { success: true };
}
