"use client";

import { History, Search, Eye } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { getSessionItemsHistory } from "@/actions/history.actions";

export function HistoryClient({ initialSessions }: { initialSessions: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [sessionItems, setSessionItems] = useState<any[]>([]);

  const filteredSessions = initialSessions.filter(s => 
    s.resources?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}s ${m}d`;
  };

  const handleViewDetails = async (session: any) => {
    setSelectedSession(session);
    const items = await getSessionItemsHistory(session.id);
    setSessionItems(items || []);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-400" />
            Tarix
          </h2>
          <p className="text-sm text-slate-400 mt-1">Barcha yakunlangan o'yinlar va moliya tarixi.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Stol / Stadion nomi..."
            className="block w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredSessions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-medium bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
            Tarix ma'lumotlari topilmadi.
          </div>
        ) : filteredSessions.map((session) => (
          <div key={session.id} className="bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 shadow-lg flex flex-col gap-3 relative transition-all active:scale-[0.98]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                  {session.resources?.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{format(new Date(session.started_at), 'dd.MM.yyyy HH:mm')} &mdash; {session.ended_at ? format(new Date(session.ended_at), 'HH:mm') : '-'}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xl font-black text-emerald-400">{session.total_cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide bg-slate-950 px-2 py-0.5 rounded-full mt-1 border border-white/5">
                  {session.payment_method || 'Noma\'lum'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-950/50 p-2.5 rounded-xl border border-white/5 mt-1">
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Vaqt</span>
                <span className="font-mono font-medium text-slate-300 text-sm mt-0.5">{formatTime(session.total_seconds)}</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center border-l border-white/5">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">O'yin</span>
                <span className="font-medium text-indigo-300 text-sm mt-0.5">{session.game_cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center border-l border-white/5">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Mahsulot</span>
                <span className="font-medium text-indigo-300 text-sm mt-0.5">{session.items_cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}</span>
              </div>
            </div>

            <button 
              onClick={() => handleViewDetails(session)} 
              className="w-full mt-1 bg-white/5 hover:bg-white/10 active:bg-white/10 text-indigo-400 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-white/5 transition-colors"
            >
              <Eye className="w-4 h-4" /> Batafsil
            </button>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl scale-in-95">
            <div className="p-6 border-b border-white/5 bg-slate-900/90 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white tracking-wide">Sessiya tafsilotlari</h3>
                <p className="text-sm text-slate-400 mt-1 font-medium">{selectedSession.resources?.name} &bull; {format(new Date(selectedSession.started_at), 'dd.MM.yyyy HH:mm')}</p>
              </div>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              <h4 className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-4">Olingan mahsulotlar</h4>
              {sessionItems.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-500 font-medium">Mahsulot olinmagan.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {sessionItems.map(item => (
                    <li key={item.id} className="flex justify-between items-center text-sm bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="text-slate-300">
                        <span className="text-white font-bold text-base">{item.products?.name}</span> <br/>
                        <span className="text-xs text-slate-500 font-medium mt-0.5 inline-block">{item.quantity} x {item.unit_sale_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm</span>
                      </div>
                      <div className="text-emerald-400 font-bold text-lg">
                        {item.total_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="p-5 border-t border-white/5 bg-slate-950/50 flex justify-end">
              <button onClick={() => setSelectedSession(null)} className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 border border-white/10">
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
