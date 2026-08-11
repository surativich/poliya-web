"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { loginWithPin } from "@/actions/auth.actions";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await loginWithPin(pin);
      if (res.success) {
        window.location.href = "/";
      } else {
        setError(res.error || "Xatolik yuz berdi");
        setLoading(false);
      }
    } catch (err) {
      setError("Server bilan ulanishda xatolik");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-sm">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 text-center border-b border-white/5 bg-slate-900/50">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              POS System
            </h1>
            <p className="text-slate-400 mt-2 text-sm font-medium">Tizimga kirish uchun PIN-kodni kiriting</p>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-indigo-400" />
                  </div>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    required
                    maxLength={4}
                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-950/50 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-center text-2xl tracking-[0.5em] font-bold"
                    placeholder="••••"
                  />
                </div>
              </div>

              {error && (
                <div className="text-rose-400 text-sm font-medium text-center bg-rose-500/10 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || pin.length < 4}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-2xl shadow-[0_0_15px_rgba(99,102,241,0.3)] text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]"
              >
                {loading ? "Kirilmoqda..." : "Kirish"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
