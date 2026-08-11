"use client";

import { useState } from "react";
import { BarChart3, TrendingUp, Calendar, Clock, DollarSign, Banknote, CreditCard, Users, Activity, Package, Download, Trash2, ShieldAlert, Loader2 } from "lucide-react";
import { StatCard } from "@/components/dashboard/dashboard-client";
import { clearAllTestData } from "@/actions/admin.actions";
import { useRouter } from "next/navigation";

export function ReportsClient({ initialData, stats, shopStats }: { initialData: any[], stats: any, shopStats: any }) {
  const [isClearing, setIsClearing] = useState(false);
  const router = useRouter();

  const handleClearData = async () => {
    if (!confirm("Barcha hisobotlar, tarix va xarajatlar butunlay o'chiriladi. Ishonchingiz komilmi?")) return;
    
    const password = prompt("Xavfsizlik parolini kiriting (Ma'lumotlarni o'chirish uchun):");
    if (password !== "@Samar18") {
      alert("Parol noto'g'ri kiritildi! O'chirish bekor qilindi.");
      return;
    }

    setIsClearing(true);
    const res = await clearAllTestData();
    if (res.success) {
      alert("Barcha ma'lumotlar muvaffaqiyatli tozalandi!");
      router.refresh();
    } else {
      alert("Xatolik: " + res.error);
    }
    setIsClearing(false);
  };

  // Simplistic stats calculation
  const totalRevenue = initialData.reduce((acc, curr) => acc + (curr.total_cost || 0), 0);
  const totalGames = initialData.length;
  const totalHours = initialData.reduce((acc, curr) => acc + (curr.total_seconds || 0), 0) / 3600;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            Hisobotlar
          </h2>
          <p className="text-sm text-slate-400 mt-1">Biznesingizning asosiy ko'rsatkichlari va tahlillari.</p>
        </div>
        <a 
          href="/api/export-reports" 
          download 
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-95"
        >
          <Download className="w-4 h-4" />
          Excel yuklab olish
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Jami Savdo" value={`${stats.totalRevenue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm`} icon={Banknote} color="text-indigo-400" bgColor="bg-indigo-500/10" />
        <StatCard title="Kassaga Tushum" value={`${stats.netCash.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm`} icon={DollarSign} color="text-emerald-400" bgColor="bg-emerald-500/10" />
        <StatCard title="Sof Kassa qoldig'i" value={`${stats.cashBalance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm`} icon={CreditCard} color="text-teal-400" bgColor="bg-teal-500/10" />
        <StatCard title="Yangi qarzlar" value={`${stats.newDebts.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm`} icon={Users} color="text-amber-400" bgColor="bg-amber-500/10" />
        
        <StatCard title="Xarajatlar" value={`${stats.totalExpenses.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm`} icon={Activity} color="text-rose-400" bgColor="bg-rose-500/10" />
        <StatCard title="Sof Foyda (Cho'ntakda)" value={`${stats.finalProfit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm`} icon={TrendingUp} color="text-emerald-400" bgColor="bg-emerald-500/10" />
      </div>

      <h3 className="text-xl font-bold tracking-tight text-white mb-4 mt-8 flex items-center gap-2">
        <Package className="w-5 h-5 text-indigo-400" />
        Do'kon (Bar) Tahlili
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium text-sm">Do'kon Tushumi</h3>
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{shopStats.shopRevenue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} <span className="text-lg text-slate-500 font-normal">so'm</span></p>
          <div className="mt-4 text-sm text-slate-500">Sotilgan barcha mahsulotlar</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium text-sm">Do'kon Foydasi</h3>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{shopStats.shopProfit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} <span className="text-lg text-slate-500 font-normal">so'm</span></p>
          <div className="mt-4 text-sm text-slate-500">Sotilganlardan tushgan sof foyda</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium text-sm">Ombordagi Tovar Qiymati</h3>
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{shopStats.totalInventoryCost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} <span className="text-lg text-slate-500 font-normal">so'm</span></p>
          <div className="mt-4 text-sm text-slate-500">Hozirgi tovarlarning kelish narxi (Sarmoya)</div>
        </div>
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

      {/* Premium Footer with Clear Action */}
      <div className="mt-16 pt-8 border-t border-white/5 flex flex-col items-center justify-center space-y-6 pb-12">
        <button 
          onClick={handleClearData}
          disabled={isClearing}
          className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-rose-500 transition-colors bg-transparent border border-transparent hover:border-rose-500/20 hover:bg-rose-500/10 px-4 py-2 rounded-full disabled:opacity-50"
        >
          {isClearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Test ma'lumotlarini tozalash
        </button>

        <div className="text-center space-y-2">
          <p className="text-sm font-bold text-slate-400">
            Dasturchi bilan aloqa: <a href="https://t.me/camar_me" target="_blank" className="text-indigo-400 hover:text-indigo-300 transition-colors">@camar_me</a>
          </p>
          <p className="text-xs text-slate-500">
            Email: <a href="mailto:oqdwer@gmail.com" className="hover:text-slate-300 transition-colors">oqdwer@gmail.com</a>
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-600 font-medium tracking-wider uppercase">
          <ShieldAlert className="w-3 h-3" />
          <span>Barcha huquqlar himoyalangan &copy; {new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
}
