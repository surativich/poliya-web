"use client";

import { useState } from "react";
import { ShieldCheck, ArrowLeft, Key, Lock, Phone, Loader2 } from "lucide-react";
import Link from "next/link";
import { updateSystemSettings } from "@/actions/security.actions";

export function SecurityClient({ initialSettings }: { initialSettings: any }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateSystemSettings(formData);
    setLoading(false);

    if (res.success) {
      alert("Xavfsizlik sozlamalari muvaffaqiyatli saqlandi!");
    } else {
      alert("Xatolik yuz berdi: " + res.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-teal-400" />
            Xavfsizlik
          </h2>
          <p className="text-sm text-slate-400 mt-1">Kirish parollari va PIN kodlarni boshqarish.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold tracking-wide text-slate-300 mb-1.5 flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-400" /> Kassir PIN kodi (4 xonali)
              </label>
              <input 
                required 
                type="text" 
                name="cashier_pin" 
                pattern="[0-9]{4}"
                maxLength={4}
                defaultValue={initialSettings?.cashier_pin || "1111"}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-teal-500/50 outline-none transition-all placeholder:text-slate-600 font-mono tracking-widest text-lg" 
              />
              <p className="text-xs text-slate-500 mt-1">Dasturga kirganda kassirlar kiritadigan oddiy kod.</p>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <label className="block text-sm font-bold tracking-wide text-slate-300 mb-1.5 flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-400" /> Admin Paroli
              </label>
              <input 
                required 
                type="text" 
                name="admin_password" 
                defaultValue={initialSettings?.admin_password || "@Samar18"}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-teal-500/50 outline-none transition-all placeholder:text-slate-600 font-mono" 
              />
              <p className="text-xs text-slate-500 mt-1">Ma'lumotlarni o'chirish yoki Admin panelga kirish uchun maxfiy parol.</p>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <label className="block text-sm font-bold tracking-wide text-slate-300 mb-1.5 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" /> Adminga qo'ng'iroq raqami
              </label>
              <input 
                required 
                type="text" 
                name="admin_phone" 
                defaultValue={initialSettings?.admin_phone || "+998"}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-teal-500/50 outline-none transition-all placeholder:text-slate-600 font-mono" 
              />
              <p className="text-xs text-slate-500 mt-1">Blokirovka vaqtida "Adminga qo'ng'iroq" qilinganda ketadigan raqam.</p>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3.5 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
            Saqlash
          </button>
        </form>
      </div>
    </div>
  );
}
