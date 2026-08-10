"use client";

import { useState } from "react";
import { Plus, Users, Upload, Camera, Search, Loader2, History, X } from "lucide-react";
import { addDebt, payDebt, getCustomerHistory } from "@/actions/debts.actions";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function DebtsClient({ initialCustomers }: { initialCustomers: any[] }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [payModal, setPayModal] = useState<{ isOpen: boolean, customer: any | null }>({ isOpen: false, customer: null });
  const [historyModal, setHistoryModal] = useState<{ isOpen: boolean, customer: any | null, history: any[] }>({ isOpen: false, customer: null, history: [] });
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  async function handleAddSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoadingAction('add');
    const formData = new FormData(e.currentTarget);
    const res = await addDebt(formData);
    if (res.success) {
      setIsAddModalOpen(false);
      router.refresh();
    } else {
      alert("Xatolik: " + res.error);
    }
    setLoadingAction(null);
  }

  async function handlePaySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!payModal.customer) return;
    
    setLoadingAction('pay');
    const formData = new FormData(e.currentTarget);
    const amount = parseInt(formData.get("amount") as string);
    const paymentMethod = formData.get("payment_method") as string;
    
    const res = await payDebt(payModal.customer.id, amount, paymentMethod);
    if (res.success) {
      setPayModal({ isOpen: false, customer: null });
      router.refresh();
    } else {
      alert("Xatolik: " + res.error);
    }
    setLoadingAction(null);
  }

  const filteredCustomers = initialCustomers.filter(c => 
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone_number && c.phone_number.includes(searchTerm))
  );

  async function handleViewHistory(customer: any) {
    setLoadingAction(`history-${customer.id}`);
    const history = await getCustomerHistory(customer.id);
    setHistoryModal({ isOpen: true, customer, history: history || [] });
    setLoadingAction(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            Qarz Daftari
          </h2>
          <p className="text-sm text-slate-400 mt-1">Mijozlarning qarzlarini hisobga olish va to'lovlarni qabul qilish.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ism yoki tel orqali qidirish..."
              className="block w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 outline-none text-sm"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Yangi qarz
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
            Mijozlar topilmadi.
          </div>
        ) : filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex-shrink-0 overflow-hidden relative border border-slate-700">
                {customer.photo_url ? (
                  <Image src={customer.photo_url} alt={customer.full_name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    <Users className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-bold text-white truncate">{customer.full_name}</h4>
                <p className="text-xs text-slate-400 mt-1 truncate">{customer.phone_number || 'Tel yo\'q'}</p>
                <p className="text-xs text-slate-400 truncate">{customer.village || 'Manzil yo\'q'}</p>
              </div>
            </div>
            
            <div className="mt-5 pt-4 border-t border-slate-800">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Jami Qarz:</p>
                  <p className={`text-xl font-bold ${customer.total_debt > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {customer.total_debt.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleViewHistory(customer)}
                    disabled={loadingAction === `history-${customer.id}`}
                    className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {loadingAction === `history-${customer.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <History className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => setPayModal({ isOpen: true, customer })}
                    disabled={customer.total_debt <= 0}
                    className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    To'lash
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Debt Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl my-8">
            <div className="p-5 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-400" />
                Yangi qarz yozish
              </h3>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-400 hover:border-indigo-400/50 cursor-pointer transition-colors relative overflow-hidden">
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-medium">Rasm yuklash</span>
                  <input type="file" name="photo" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">F.I.Sh.</label>
                <input required type="text" name="full_name" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="Ali Valiyev" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Telefon raqami</label>
                  <input type="text" name="phone_number" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="+998..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Qishloq/Manzil</label>
                  <input type="text" name="village" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Qarz summasi (so'm)</label>
                <input required type="number" name="amount" min="1" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-rose-400 font-bold outline-none focus:ring-2 focus:ring-rose-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Izoh</label>
                <textarea name="description" rows={2} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="Nimaga qarz bo'ldi..."></textarea>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" disabled={loadingAction === 'add'} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex justify-center items-center">
                  {loadingAction === 'add' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Debt Modal */}
      {payModal.isOpen && payModal.customer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="p-5 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Qarzni to'lash</h3>
              <p className="text-sm text-slate-400 mt-1">{payModal.customer.full_name}</p>
            </div>
            <form onSubmit={handlePaySubmit} className="p-5 space-y-4">
              <div className="bg-slate-950/50 rounded-lg p-3 text-center border border-slate-800 mb-4">
                <p className="text-xs text-slate-400">Joriy qarz</p>
                <p className="text-2xl font-bold text-rose-400">{payModal.customer.total_debt.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">To'lov summasi (so'm)</label>
                <input required type="number" name="amount" min="1" max={payModal.customer.total_debt} defaultValue={payModal.customer.total_debt} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-emerald-400 font-bold outline-none focus:ring-2 focus:ring-emerald-500/50 text-lg" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">To'lov turi</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="cursor-pointer">
                    <input type="radio" name="payment_method" value="cash" className="peer sr-only" defaultChecked />
                    <div className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-center text-sm font-medium text-slate-400 peer-checked:border-emerald-500 peer-checked:bg-emerald-500/10 peer-checked:text-emerald-400 hover:bg-slate-800 transition-colors">
                      Naqd
                    </div>
                  </label>
                  <label className="cursor-pointer">
                    <input type="radio" name="payment_method" value="card" className="peer sr-only" />
                    <div className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-center text-sm font-medium text-slate-400 peer-checked:border-blue-500 peer-checked:bg-blue-500/10 peer-checked:text-blue-400 hover:bg-slate-800 transition-colors">
                      Click / Payme
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setPayModal({ isOpen: false, customer: null })} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" disabled={loadingAction === 'pay'} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex justify-center items-center">
                  {loadingAction === 'pay' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'To\'lash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyModal.isOpen && historyModal.customer && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/90 rounded-t-3xl sm:rounded-2xl z-10">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" />
                  Qarz Tarixi
                </h3>
                <p className="text-sm text-slate-400 mt-1">{historyModal.customer.full_name}</p>
              </div>
              <button onClick={() => setHistoryModal({ isOpen: false, customer: null, history: [] })} className="p-2.5 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {historyModal.history.length === 0 ? (
                <div className="text-center py-8 text-slate-500">Tarix topilmadi</div>
              ) : (
                historyModal.history.map((tx: any) => (
                  <div key={tx.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${tx.type === 'debt' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {tx.type === 'debt' ? "Qarz Oldi" : "Qarz To'ladi"}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(tx.created_at).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center my-3">
                      <span className="text-slate-300 font-medium">{tx.description || 'Izohsiz'}</span>
                      <span className={`text-lg font-bold ${tx.type === 'debt' ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {tx.type === 'payment' ? '-' : '+'}{tx.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm
                      </span>
                    </div>

                    {/* Show Session Details if available */}
                    {tx.sessions && (
                      <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                        {tx.sessions.resources?.name && (
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">O'yin/Joy:</span>
                            <span className="text-slate-300 font-medium">{tx.sessions.resources.name} ({(tx.sessions.total_seconds / 3600).toFixed(1)} soat) - {tx.sessions.game_cost} so'm</span>
                          </div>
                        )}
                        
                        {tx.sessions.session_items && tx.sessions.session_items.length > 0 && (
                          <div className="text-xs">
                            <span className="text-slate-500 block mb-1">Mahsulotlar:</span>
                            <ul className="list-disc list-inside text-slate-300 font-medium pl-1">
                              {tx.sessions.session_items.map((item: any, idx: number) => (
                                <li key={idx}>{item.products?.name} x {item.quantity}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
