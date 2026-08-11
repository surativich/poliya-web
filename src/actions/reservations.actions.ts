"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getReservations() {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      resource:resources(name, type)
    `)
    .order('reservation_time', { ascending: true });
    
  if (error) {
    console.error("Error fetching reservations:", error);
    return [];
  }
  return data || [];
}

export async function createReservation(formData: FormData) {
  const resourceId = formData.get('resource_id') as string;
  const customerName = formData.get('customer_name') as string;
  const customerPhone = formData.get('customer_phone') as string;
  const reservationTime = formData.get('reservation_time') as string;
  const depositAmount = parseInt(formData.get('deposit_amount') as string) || 0;

  if (!resourceId || !customerName || !reservationTime) {
    return { success: false, error: "Barcha kerakli maydonlarni to'ldiring." };
  }

  const { error } = await supabase.from('reservations').insert([{
    resource_id: resourceId,
    customer_name: customerName,
    customer_phone: customerPhone,
    reservation_time: reservationTime,
    deposit_amount: depositAmount,
    status: 'pending'
  }]);

  if (error) {
    console.error("Error creating reservation:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/reservations');
  return { success: true };
}

export async function cancelReservation(id: string) {
  const { error } = await supabase
    .from('reservations')
    .update({ status: 'cancelled' })
    .eq('id', id);

  if (error) {
    console.error("Error cancelling reservation:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/reservations');
  return { success: true };
}

export async function fulfillReservation(id: string) {
  // Update the reservation status to fulfilled
  const { error } = await supabase
    .from('reservations')
    .update({ status: 'fulfilled' })
    .eq('id', id);

  if (error) {
    console.error("Error fulfilling reservation:", error);
    return { success: false, error: error.message };
  }

  // Notice: The actual starting of the session will be handled 
  // on the frontend side by calling the timer action handleStart.
  revalidatePath('/');
  revalidatePath('/reservations');
  return { success: true };
}
