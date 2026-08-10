"use client";

import { BarChart3, TrendingUp, Calendar, Clock, DollarSign, Banknote, CreditCard, Users, Activity } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";

export function ReportsClient({ initialData, stats }: { initialData: any[], stats: any }) {
  // Simplistic stats calculation
  const totalRevenue = initialData.reduce((acc, curr) => acc + (curr.total_cost || 0), 0);
  const totalGames = initialData.length;
  const totalHours = initialData.reduce((acc, curr) => acc + (curr.total_seconds || 0), 0) / 3600;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
          Hisobotlar
        </h2>
        <p className="text-sm text-slate-400 mt-1">Biznesingizning asosiy ko'rsatkichlari va tahlillari.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Bugungi tushum" value={`${stats.totalIncome.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm`} icon={DollarSign} color="text-emerald-400" bgColor="bg-emerald-500/10" />
        <StatCard title="Naqd tushum" value={`${stats.cashIncome.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm`} icon={Banknote} color="text-indigo-400" bgColor="bg-indigo-500/10" />
        <StatCard title="Click/Payme" value={`${stats.cardIncome.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm`} icon={CreditCard} color="text-blue-400" bgColor="bg-blue-500/10" />
        <StatCard title="Yangi qarzlar" value={`${stats.newDebts.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm`} icon={Users} color="text-amber-400" bgColor="bg-amber-500/10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium text-sm">Umumiy Tushum</h3>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{totalRevenue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} <span className="text-lg text-slate-500 font-normal">so'm</span></p>
          <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 w-max px-2 py-1 rounded-md">
            <TrendingUp className="w-4 h-4" />
            <span>Tarix bo'yicha barcha daromad</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium text-sm">Jami O'yinlar Soni</h3>
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-indigo-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{totalGames} <span className="text-lg text-slate-500 font-normal">marta</span></p>
          <div className="mt-4 text-sm text-slate-500">
            Yakunlangan sessiyalar
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium text-sm">O'ynalgan Vaqt</h3>
            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-rose-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{totalHours.toFixed(1)} <span className="text-lg text-slate-500 font-normal">soat</span></p>
          <div className="mt-4 text-sm text-slate-500">
            Stadion va stollar bandligi
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-64 flex flex-col items-center justify-center text-center">
        <BarChart3 className="w-12 h-12 text-slate-700 mb-3" />
        <h3 className="text-lg font-medium text-slate-300">Grafiklar va batafsil tahlil</h3>
        <p className="text-sm text-slate-500 mt-2 max-w-sm">Tez kunda bu yerda oylik, haftalik va kunlik dinamik grafiklar paydo bo'ladi (Chart.js yoki Recharts yordamida).</p>
      </div>
    </div>
  );
}
