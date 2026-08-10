"use client";

import { Settings as SettingsIcon, Save, User, Shield, Key } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-indigo-400" />
          Sozlamalar
        </h2>
        <p className="text-sm text-slate-400 mt-1">Tizim parametrlarini va hisobingizni sozlash.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 bg-slate-800 text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors">
            <User className="w-5 h-5 text-indigo-400" />
            Asosiy profil
          </button>
          <button className="w-full flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-slate-300 px-4 py-3 rounded-xl text-sm font-medium transition-colors border border-slate-800">
            <Shield className="w-5 h-5 text-emerald-400" />
            Xavfsizlik
          </button>
          <button className="w-full flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-slate-300 px-4 py-3 rounded-xl text-sm font-medium transition-colors border border-slate-800">
            <Key className="w-5 h-5 text-rose-400" />
            API Kalitlar (Supabase)
          </button>
        </div>
        
        <div className="col-span-1 md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Asosiy profil ma'lumotlari</h3>
          
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Biznes Nomi</label>
              <input type="text" defaultValue="Ruslan aka poliya" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Admin Ismi</label>
              <input type="text" defaultValue="Admin" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Telefon raqam</label>
              <input type="text" defaultValue="+998 90 123 45 67" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" />
            </div>

            <div className="pt-4 mt-6 border-t border-slate-800">
              <button type="button" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
                <Save className="w-4 h-4" />
                Saqlash
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
