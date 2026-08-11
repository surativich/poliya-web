"use client";

import Link from "next/link";
import { Package, BarChart3, History, Settings, ChevronRight, Wallet } from "lucide-react";

export function AdminClient() {
  const adminLinks = [
    { name: "Ombor", description: "Mahsulotlar qoldig'i va narxlarini boshqarish", path: "/inventory", icon: Package, color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
    { name: "Xarajatlar", description: "Oylik, ijara va boshqa biznes chiqimlari", path: "/admin/expenses", icon: Wallet, color: "text-rose-400", bgColor: "bg-rose-500/10" },
    { name: "Hisobotlar", description: "Biznes tushumlari, foyda va statistika", path: "/reports", icon: BarChart3, color: "text-indigo-400", bgColor: "bg-indigo-500/10" },
    { name: "Tarix", description: "Barcha tugatilgan o'yinlar va savdolar tarixi", path: "/history", icon: History, color: "text-blue-400", bgColor: "bg-blue-500/10" },
    { name: "Sozlamalar", description: "Stadionlar va bilyard stollarini tahrirlash", path: "/settings", icon: Settings, color: "text-slate-400", bgColor: "bg-slate-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Admin Panel</h2>
        <p className="text-sm text-slate-400 mt-1">Tizimni va biznesni boshqarish bo'limlari.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {adminLinks.map((link) => (
          <Link key={link.path} href={link.path} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-slate-800/50">
            <div className={`w-14 h-14 rounded-xl ${link.bgColor} flex items-center justify-center shrink-0`}>
              <link.icon className={`w-7 h-7 ${link.color}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{link.name}</h3>
              <p className="text-sm text-slate-400 mt-0.5">{link.description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
