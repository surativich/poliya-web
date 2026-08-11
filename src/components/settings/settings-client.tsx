"use client";

import { useState } from "react";
import { Settings as SettingsIcon, Save, User, MapPin, Plus, Trash2, Edit } from "lucide-react";
import { addResource, updateResource, deleteResource } from "@/actions/resources.actions";
import { useRouter } from "next/navigation";

export function SettingsClient({ initialResources }: { initialResources: any[] }) {
  const [activeTab, setActiveTab] = useState<"profile" | "resources">("resources");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editResource, setEditResource] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    let res;
    if (editResource) {
      formData.append("id", editResource.id);
      res = await updateResource(formData);
    } else {
      res = await addResource(formData);
    }

    setLoading(false);
    if (res.success) {
      setIsModalOpen(false);
      setEditResource(null);
      router.refresh();
    } else {
      alert("Xatolik: " + res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Rostdan ham bu joyni o'chirmoqchimisiz?")) {
      const res = await deleteResource(id);
      if (res.success) {
        router.refresh();
      } else {
        alert("O'chirishda xatolik: " + res.error);
      }
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-indigo-400" />
          Sozlamalar
        </h2>
        <p className="text-sm text-slate-400 mt-1">Stadionlar, stollar va tizim parametrlari.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab("resources")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors border ${activeTab === "resources" ? "bg-slate-800 text-white border-slate-700" : "bg-slate-900/50 hover:bg-slate-900 text-slate-400 border-slate-800"}`}
          >
            <MapPin className={`w-5 h-5 ${activeTab === "resources" ? "text-indigo-400" : "text-slate-500"}`} />
            Stadion & Bilyard
          </button>
          <button 
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors border ${activeTab === "profile" ? "bg-slate-800 text-white border-slate-700" : "bg-slate-900/50 hover:bg-slate-900 text-slate-400 border-slate-800"}`}
          >
            <User className={`w-5 h-5 ${activeTab === "profile" ? "text-indigo-400" : "text-slate-500"}`} />
            Asosiy profil
          </button>
        </div>
        
        <div className="col-span-1 md:col-span-3">
          {activeTab === "profile" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">Asosiy profil ma'lumotlari</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Biznes Nomi</label>
                  <input type="text" defaultValue="Ruslan aka poliya" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" />
                </div>
                <div className="pt-4 mt-6 border-t border-slate-800">
                  <button type="button" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
                    <Save className="w-4 h-4" />
                    Saqlash
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "resources" && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Barcha joylar</h3>
                <button 
                  onClick={() => { setEditResource(null); setIsModalOpen(true); }}
                  className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Yangi joy qo'shish
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-xs text-indigo-300 uppercase bg-slate-950/40 border-b border-white/5">
                    <tr>
                      <th className="px-4 py-3 font-bold tracking-wider">Rasm</th>
                      <th className="px-4 py-3 font-bold tracking-wider">Nomi</th>
                      <th className="px-4 py-3 font-bold tracking-wider">Turi</th>
                      <th className="px-4 py-3 font-bold tracking-wider">Soatiga (so'm)</th>
                      <th className="px-4 py-3 font-bold tracking-wider text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {initialResources.map(res => (
                      <tr key={res.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          {res.image_url ? (
                            <img src={res.image_url} alt={res.name} className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 border border-white/10">yo'q</div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-bold text-white">{res.name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${res.type === "stadium" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
                            {res.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-indigo-400">{res.hourly_rate.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}</td>
                        <td className="px-4 py-3 flex justify-end gap-2">
                          <button onClick={() => { setEditResource(res); setIsModalOpen(true); }} className="p-2 bg-slate-800 hover:bg-indigo-500 hover:text-white text-slate-400 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(res.id)} className="p-2 bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-400 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {initialResources.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Hali joylar qo'shilmagan.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl scale-in-95">
            <div className="p-6 border-b border-white/5 bg-slate-900/90">
              <h3 className="text-xl font-bold text-white tracking-wide">{editResource ? "Joyni tahrirlash" : "Yangi joy"}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Nomi</label>
                <input required type="text" name="name" defaultValue={editResource?.name || ""} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none" placeholder="Masalan: Stadion 1" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Turi</label>
                <select required name="type" defaultValue={editResource?.type || "stadium"} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none">
                  <option value="stadium">Stadion</option>
                  <option value="billiard">Bilyard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Soatiga narxi (so'm)</label>
                <input required type="number" name="hourly_rate" defaultValue={editResource?.hourly_rate || ""} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Rasm (ixtiyoriy)</label>
                <input type="file" accept="image/*" name="image" className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/20 file:text-indigo-400 hover:file:bg-indigo-500/30 transition-colors" />
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/5 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl font-bold transition-all border border-white/5">Bekor qilish</button>
                <button type="submit" disabled={loading} className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-xl font-bold transition-all disabled:opacity-50">{loading ? "Saqlanmoqda..." : "Saqlash"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

