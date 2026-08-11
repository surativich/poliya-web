"use server";

import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";

export async function clearAllTestData() {
  try {
    // Delete in correct order to respect foreign keys
    await sql`DELETE FROM session_items`;
    await sql`DELETE FROM inventory_movements`;
    await sql`DELETE FROM debt_transactions`;
    await sql`DELETE FROM sessions`;
    await sql`DELETE FROM expenses`;
    
    // Reset customer debts to 0
    await sql`UPDATE customers SET total_debt = 0`;
    
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to clear data:", error);
    return { success: false, error: error.message };
  }
}
