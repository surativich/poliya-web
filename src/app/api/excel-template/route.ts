
import { NextResponse } from "next/server";
import * as xlsx from "xlsx";

export async function GET() {
  const ws = xlsx.utils.json_to_sheet([
    {
      "Nomi": "Cola 1L",
      "Kategoriya": "Ichimliklar",
      "Kelish narxi": 8000,
      "Sotish narxi": 12000,
      "Soni": 50,
      "Min qoldiq": 5
    }
  ]);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Mahsulotlar");
  const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename='shablon.xlsx'"
    }
  });
}

