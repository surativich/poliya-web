
import { NextResponse } from "next/server";
import * as xlsx from "xlsx";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: sessions } = await supabase
    .from("sessions")
    .select("*, resources(name)")
    .order("created_at", { ascending: false });

  if (!sessions) {
    return NextResponse.json({ error: "No data found" }, { status: 404 });
  }

  const exportData = sessions.map(s => ({
    "ID": s.id,
    "Stadion/Stol": s.resources?.name || "Noma`lum",
    "Boshlandi": new Date(s.created_at).toLocaleString("uz-UZ"),
    "Tugadi": s.ended_at ? new Date(s.ended_at).toLocaleString("uz-UZ") : "Davom etmoqda",
    "O`ynalgan vaqt (daqiqa)": s.total_seconds ? Math.round(s.total_seconds / 60) : 0,
    "O`yin narxi (so`m)": s.game_cost || 0,
    "Mahsulotlar narxi (so`m)": s.items_cost || 0,
    "Jami (so`m)": s.total_cost || 0,
    "Sof Foyda (so`m)": s.net_profit || 0,
    "To`lov usuli": s.payment_method === "cash" ? "Naqd" : s.payment_method === "card" ? "Karta" : s.payment_method === "debt" ? "Qarz" : "Noma`lum",
    "Holat": s.status === "completed" ? "Yakunlangan" : "Faol"
  }));

  const ws = xlsx.utils.json_to_sheet(exportData);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Hisobotlar");
  
  const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename='hisobot.xlsx'"
    }
  });
}

