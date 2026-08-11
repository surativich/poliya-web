"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getSystemSettings() {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching settings:", error);
      return null;
    }
    return data;
  } catch (error) {
    console.error("Failed to fetch system settings", error);
    return null;
  }
}

export async function updateSystemSettings(formData: FormData) {
  try {
    const cashier_pin = formData.get("cashier_pin") as string;
    const admin_password = formData.get("admin_password") as string;
    const admin_phone = formData.get("admin_phone") as string;

    const { data: currentSettings } = await supabase
      .from('system_settings')
      .select('id')
      .limit(1)
      .single();

    if (currentSettings) {
      const { error } = await supabase
        .from('system_settings')
        .update({
          cashier_pin,
          admin_password,
          admin_phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentSettings.id);

      if (error) throw error;
    } else {
      // Create if doesn't exist
      const { error } = await supabase
        .from('system_settings')
        .insert({
          cashier_pin,
          admin_password,
          admin_phone
        });
      
      if (error) throw error;
    }

    revalidatePath("/admin/security");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update settings:", error);
    return { success: false, error: error.message };
  }
}
