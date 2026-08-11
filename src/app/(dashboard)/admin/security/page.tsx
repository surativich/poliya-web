"use client";

import { useState } from "react";
import { ShieldCheck, Key, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { updatePin } from "@/actions/auth.actions";
import { useRouter } from "next/navigation";

export default function SecurityPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>, role: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPin = formData.get("pin") as string;
    
    if (newPin.length < 4) {
      alert("PIN kod kamida 4 xonali bo'lishi kerak!");
      return;
    }
    
    setLoading(true);
    const res = await updatePin(role, newPin);
    setLoading(false);
    
    if (res.success) {
      alert("PIN kod muvaffaqiyatli yangilandi!");
      e.currentTarget.reset();
      router.refresh();
    } else {
      alert("Xatolik: " + res.error);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            Xavfsizlik va PIN kodlar
          </h2>
          <p className="text-sm text-slate-400 mt-1">Kassir va Admin parollarini (PIN) yangilash.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Key className="w-32 h-32 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-6 relative z-10">Admin PIN kodi</h3>
          <form onSubmit={(e) => handleUpdate(e, "admin")} className="space-y-4 relative z-10">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1.5 uppercase text-[10px] tracking-wider">Yangi PIN kod</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-3" />
                <input required type="password" name="pin" minLength={4} maxLength={8} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono tracking-widest" placeholder="****" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] active:scale-95 disabled:opacity-50">
              Admin parolini yangilash
            </button>
          </form>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Key className="w-32 h-32 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-6 relative z-10">Kassir PIN kodi</h3>
          <form onSubmit={(e) => handleUpdate(e, "cashier")} className="space-y-4 relative z-10">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1.5 uppercase text-[10px] tracking-wider">Yangi PIN kod</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-3" />
                <input required type="password" name="pin" minLength={4} maxLength={8} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono tracking-widest" placeholder="****" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-95 disabled:opacity-50">
              Kassir parolini yangilash
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

