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

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Joy / Resurs</th>
                <th className="px-6 py-4 font-medium">Boshlandi</th>
                <th className="px-6 py-4 font-medium">Yakunlandi</th>
                <th className="px-6 py-4 font-medium">Vaqt</th>
                <th className="px-6 py-4 font-medium">O'yin summasi</th>
                <th className="px-6 py-4 font-medium">Mahsulotlar</th>
                <th className="px-6 py-4 font-medium">Jami Summa</th>
                <th className="px-6 py-4 font-medium">To'lov turi</th>
                <th className="px-6 py-4 font-medium text-right">Batafsil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-slate-500">
                    Tarix ma'lumotlari topilmadi.
                  </td>
                </tr>
              ) : filteredSessions.map((session) => (
                <tr key={session.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{session.resources?.name}</td>
                  <td className="px-6 py-4 text-slate-300">{format(new Date(session.started_at), 'dd.MM.yyyy HH:mm')}</td>
                  <td className="px-6 py-4 text-slate-300">{session.ended_at ? format(new Date(session.ended_at), 'dd.MM.yyyy HH:mm') : '-'}</td>
                  <td className="px-6 py-4 text-slate-300">{formatTime(session.total_seconds)}</td>
                  <td className="px-6 py-4 text-slate-300">{session.game_cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm</td>
                  <td className="px-6 py-4 text-slate-300">{session.items_cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm</td>
                  <td className="px-6 py-4 text-emerald-400 font-bold">{session.total_cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 uppercase">
                      {session.payment_method || 'Noma\'lum'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleViewDetails(session)} className="text-indigo-400 hover:text-indigo-300 p-2 rounded-lg hover:bg-slate-800 transition-colors">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Sessiya tafsilotlari</h3>
              <p className="text-sm text-slate-400 mt-1">{selectedSession.resources?.name} - {format(new Date(selectedSession.started_at), 'dd.MM.yyyy HH:mm')}</p>
            </div>
            <div className="p-5 max-h-96 overflow-y-auto">
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Olingan mahsulotlar</h4>
              {sessionItems.length === 0 ? (
                <p className="text-sm text-slate-500">Mahsulot olinmagan.</p>
              ) : (
                <ul className="space-y-3">
                  {sessionItems.map(item => (
                    <li key={item.id} className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                      <div className="text-slate-300">
                        <span className="text-white font-medium">{item.products?.name}</span> <br/>
                        <span className="text-xs text-slate-500">{item.quantity} x {item.unit_sale_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm</span>
                      </div>
                      <div className="text-white font-medium">
                        {item.total_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="p-5 border-t border-slate-800 bg-slate-900/50 text-right">
              <button onClick={() => setSelectedSession(null)} className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
