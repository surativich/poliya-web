"use client";

import { useState } from "react";
import { Plus, Clock, MapPin, CheckCircle, XCircle, User, Loader2 } from "lucide-react";
import { createReservation, cancelReservation, fulfillReservation } from "@/actions/reservations.actions";
import { useRouter } from "next/navigation";

export function ReservationsClient({ initialReservations, resources }: { initialReservations: any[], resources: any[] }) {
  const [reservations, setReservations] = useState(initialReservations);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await createReservation(formData);
    
    if (res.success) {
      setIsModalOpen(false);
      router.refresh();
      // Optionally we could optimistically update, but refresh is fine.
    } else {
      alert("Xato: " + res.error);
    }
    setLoading(false);
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Rostdan ham bu bronni bekor qilmoqchimisiz?")) return;
    const res = await cancelReservation(id);
    if (res.success) {
      router.refresh();
    }
  };

  const handleStart = async (id: string) => {
    // We mark it as fulfilled, but the cashier still needs to go to dashboard to actually start the session.
    // Or we could redirect to dashboard.
    const res = await fulfillReservation(id);
    if (res.success) {
      alert("Bron tasdiqlandi. Endi Asosiy ekranga o'tib o'yinni boshlashingiz mumkin.");
      router.refresh();
    }
  };

  const pendingReservations = reservations.filter(r => r.status === 'pending');

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-slate-900/50 p-4 md:p-6 rounded-3xl border border-white/5 backdrop-blur-md">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Bronlar</h1>
          <p className="text-slate-400 mt-1">Oldindan band qilingan joylar ro'yxati</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 md:px-5 md:py-3 rounded-2xl md:rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_8px_25px_rgba(79,70,229,0.3)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.5)] active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden md:inline">Yangi Bron</span>
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pendingReservations.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900/30 rounded-3xl border border-white/5">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-lg">Kutilayotgan bronlar yo'q</p>
          </div>
        ) : (
          pendingReservations.map(res => {
            const resDate = new Date(res.reservation_time);
            return (
              <div key={res.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                
                <div className="flex justify-between items-start mb-4 relative">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-400" />
                      {res.customer_name}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">{res.customer_phone || 'Raqam kiritilmagan'}</p>
                  </div>
                  <div className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/20">
                    Kutilmoqda
                  </div>
                </div>

                <div className="space-y-3 relative">
                  <div className="flex items-center gap-3 text-slate-300 bg-slate-950/50 p-3 rounded-2xl border border-white/5">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Vaqti</p>
                      <p className="font-bold">{resDate.toLocaleDateString('uz-UZ')} {resDate.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-slate-300 bg-slate-950/50 p-3 rounded-2xl border border-white/5">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Joy</p>
                      <p className="font-bold">{res.resource?.name}</p>
                    </div>
                  </div>
                  
                  {res.deposit_amount > 0 && (
                    <div className="text-emerald-400 text-sm font-bold pt-2">
                      Zaklad: {res.deposit_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-5 relative">
                  <button 
                    onClick={() => handleCancel(res.id)}
                    className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 py-3 rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-colors border border-rose-500/20"
                  >
                    <XCircle className="w-4 h-4" /> Bekor qilish
                  </button>
                  <button 
                    onClick={() => handleStart(res.id)}
                    className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 py-3 rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-colors border border-emerald-500/20"
                  >
                    <CheckCircle className="w-4 h-4" /> Keldi
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                Yangi Bron
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Mijoz Ismi (Majburiy)</label>
                <input required type="text" name="customer_name" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors" placeholder="Ismini kiriting..." />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Telefon (Ixtiyoriy)</label>
                <input type="text" name="customer_phone" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors" placeholder="+998 90 123 45 67" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Qaysi joyni band qiladi?</label>
                <select required name="resource_id" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors">
                  <option value="" disabled selected>Tanlang...</option>
                  {resources.filter(r => r.type !== 'billiard' || r.name !== "Do'kon Kassasi").map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Sana va Vaqt</label>
                <input required type="datetime-local" name="reservation_time" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors [color-scheme:dark]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Zaklad (Ixtiyoriy)</label>
                <input type="number" name="deposit_amount" defaultValue="0" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors" />
              </div>
              
              <div className="pt-4 mt-2 border-t border-white/5">
                <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors disabled:opacity-50">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Bron qilish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
