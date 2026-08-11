"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function addResource(formData: FormData) {
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const hourlyRate = parseInt(formData.get("hourly_rate") as string);
  const imageFile = formData.get("image") as File;

  let image_url = null;

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { error: uploadError, data } = await supabase.storage
      .from("resources")
      .upload(fileName, imageFile);

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }
    
    const { data: { publicUrl } } = supabase.storage.from("resources").getPublicUrl(fileName);
    image_url = publicUrl;
  }

  const { error } = await supabase.from("resources").insert([{
    name,
    type,
    hourly_rate: hourlyRate,
    image_url
  }]);

  if (error) return { success: false, error: error.message };
  
  revalidatePath("/");
  revalidatePath("/settings");
  return { success: true };
}

export async function updateResource(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const hourlyRate = parseInt(formData.get("hourly_rate") as string);
  const imageFile = formData.get("image") as File;

  let updates: any = {
    name,
    type,
    hourly_rate: hourlyRate
  };

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("resources")
      .upload(fileName, imageFile);

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }
    
    const { data: { publicUrl } } = supabase.storage.from("resources").getPublicUrl(fileName);
    updates.image_url = publicUrl;
  }

  const { error } = await supabase.from("resources").update(updates).eq("id", id);

  if (error) return { success: false, error: error.message };
  
  revalidatePath("/");
  revalidatePath("/settings");
  return { success: true };
}

export async function deleteResource(id: string) {
  const { error } = await supabase.from("resources").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  
  revalidatePath("/");
  revalidatePath("/settings");
  return { success: true };
}

