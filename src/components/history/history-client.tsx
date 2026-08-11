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

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[1.5rem] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-indigo-300 uppercase bg-slate-950/40 border-b border-white/5">
              <tr>
                <th className="px-6 py-5 font-bold tracking-wider">Joy / Resurs</th>
                <th className="px-6 py-5 font-bold tracking-wider">Boshlandi</th>
                <th className="px-6 py-5 font-bold tracking-wider">Yakunlandi</th>
                <th className="px-6 py-5 font-bold tracking-wider">Vaqt</th>
                <th className="px-6 py-5 font-bold tracking-wider">O'yin summasi</th>
                <th className="px-6 py-5 font-bold tracking-wider">Mahsulotlar</th>
                <th className="px-6 py-5 font-bold tracking-wider">Jami Summa</th>
                <th className="px-6 py-5 font-bold tracking-wider">To'lov turi</th>
                <th className="px-6 py-5 font-bold tracking-wider text-right">Batafsil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500 font-medium">
                    Tarix ma'lumotlari topilmadi.
                  </td>
                </tr>
              ) : filteredSessions.map((session) => (
                <tr key={session.id} className="hover:bg-white/5 transition-colors duration-200">
                  <td className="px-6 py-4 font-bold text-white">{session.resources?.name}</td>
                  <td className="px-6 py-4 text-slate-400 font-medium">{format(new Date(session.started_at), 'dd.MM.yyyy HH:mm')}</td>
                  <td className="px-6 py-4 text-slate-400 font-medium">{session.ended_at ? format(new Date(session.ended_at), 'dd.MM.yyyy HH:mm') : '-'}</td>
                  <td className="px-6 py-4 text-slate-400 font-mono">{formatTime(session.total_seconds)}</td>
                  <td className="px-6 py-4 text-indigo-300 font-medium">{session.game_cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm</td>
                  <td className="px-6 py-4 text-indigo-300 font-medium">{session.items_cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm</td>
                  <td className="px-6 py-4 text-emerald-400 font-bold">{session.total_cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider bg-white/10 text-slate-300 uppercase shadow-inner border border-white/5">
                      {session.payment_method || 'Noma\'lum'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleViewDetails(session)} className="text-indigo-400 hover:text-white p-2.5 rounded-xl bg-white/5 hover:bg-indigo-500/20 transition-all border border-transparent hover:border-indigo-500/30">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
