"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function loginWithPin(pin: string) {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("pin_code", pin)
    .single();

  if (error || !user) {
    return { success: false, error: "Noto`"g`"ri PIN-kod!" };
  }

  const cookieStore = await cookies();
  cookieStore.set("auth_role", user.role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/"
  });

  return { success: true, role: user.role };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_role");
  return { success: true };
}

export async function getCurrentRole() {
  const cookieStore = await cookies();
  const role = cookieStore.get("auth_role");
  return role?.value || null;
}

