"use client";

import { useState } from "react";
import { Plus, Wallet, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { addExpense } from "@/actions/expenses.actions";

export function ExpensesClient({ initialExpenses }: { initialExpenses: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await addExpense(formData);
    setLoading(false);
    if (res.success) {
      setIsModalOpen(false);
    } else {
      alert("Xatolik: " + res.error);
    }
  };

  const totalExpenses = initialExpenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Wallet className="w-6 h-6 text-rose-400" />
              Xarajatlar
            </h2>
            <p className="text-sm text-slate-400 mt-1">Jami chiqimlar: {totalExpenses.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:shadow-[0_0_25px_rgba(244,63,94,0.5)] active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Xarajat qo'shish
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {initialExpenses.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-medium bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
            Hali xarajatlar yo'q.
          </div>
        ) : initialExpenses.map((exp) => (
          <div key={exp.id} className="bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 shadow-lg flex flex-col gap-2 relative transition-all active:scale-[0.98]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-white capitalize">{exp.category}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{new Date(exp.created_at).toLocaleString("uz-UZ", { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</p>
              </div>
              <span className="text-lg font-black text-rose-400">-{exp.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} sum</span>
            </div>
            {exp.description && (
              <div className="mt-2 pt-2 border-t border-white/5 text-sm text-slate-400">
                {exp.description}
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl scale-in-95">
            <div className="p-6 border-b border-white/5 bg-slate-900/90">
              <h3 className="text-xl font-bold text-white tracking-wide">Yangi xarajat</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold tracking-wide text-slate-300 mb-1.5 uppercase text-[10px]">Summa (so'm)</label>
                <input required type="number" name="amount" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500/50 outline-none transition-all placeholder:text-slate-600" />
              </div>
              <div>
                <label className="block text-sm font-bold tracking-wide text-slate-300 mb-1.5 uppercase text-[10px]">Kategoriya</label>
                <select required name="category" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500/50 outline-none transition-all">
                  <option value="ijara">Ijara</option>
                  <option value="oylik">Oylik maosh</option>
                  <option value="kommunal">Kommunal (Svet, Gaz, Suv)</option>
                  <option value="xojalik">Xo'jalik mollari</option>
                  <option value="boshqa">Boshqa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold tracking-wide text-slate-300 mb-1.5 uppercase text-[10px]">Izoh (ixtiyoriy)</label>
                <input type="text" name="description" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500/50 outline-none transition-all placeholder:text-slate-600" placeholder="Nimaga sarflandi?" />
              </div>
              
              <div className="flex gap-3 pt-6 border-t border-white/5 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl text-sm font-bold transition-all active:scale-95 border border-white/5">
                  Bekor qilish
                </button>
                <button type="submit" disabled={loading} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:shadow-[0_0_25px_rgba(244,63,94,0.5)] active:scale-95 disabled:opacity-50">
                  {loading ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

