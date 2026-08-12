"use client";

import { Activity, Banknote, CreditCard, DollarSign, Users, Loader2, PackagePlus, CheckCircle2, Clock } from "lucide-react";
import { useTimer } from "@/hooks/use-timer";
import { startSession, endSession, endSessionWithNewCustomer } from "@/actions/timer.actions";
import { addSessionItem } from "@/actions/session-items.actions";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export function DashboardClient({ 
  initialResources, 
  initialSessions,
  products,
  customers,
  reservations = []
}: { 
  initialResources: any[], 
  initialSessions: any[],
  products: any[],
  customers: any[],
  reservations?: any[]
}) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [addProductModal, setAddProductModal] = useState<{ isOpen: boolean, sessionId: string | null }>({ isOpen: false, sessionId: null });
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [checkoutModal, setCheckoutModal] = useState<{ isOpen: boolean, session: any | null, resource: any | null, elapsedSeconds: number, gameCost: number, paidCash: string, paidCard: string, showCustomerSelect: boolean, selectedCustomerId: string, isNewCustomer: boolean }>({ isOpen: false, session: null, resource: null, elapsedSeconds: 0, gameCost: 0, paidCash: '', paidCard: '', showCustomerSelect: false, selectedCustomerId: '', isNewCustomer: false });
  const newCustomerFormRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const handleStart = async (resourceId: string, rate: number) => {
    setLoadingAction(`start-${resourceId}`);
    const res = await startSession(resourceId, rate);
    if (!res.success) {
      alert("Xatolik: " + res.error);
    }
    setLoadingAction(null);
    router.refresh();
  };

  const handleEndClick = (session: any, resource: any, elapsedSeconds: number, gameCost: number) => {
    setCheckoutModal({ isOpen: true, session, resource, elapsedSeconds, gameCost, paidCash: '', paidCard: '', showCustomerSelect: false, selectedCustomerId: '', isNewCustomer: false });
  };

  const handleFinalizeCheckout = async () => {
    if (!checkoutModal.session || !checkoutModal.resource) return;
    
    const totalCost = checkoutModal.gameCost + (checkoutModal.session.items_cost || 0);
    const paidCash = parseInt(checkoutModal.paidCash || '0');
    const paidCard = parseInt(checkoutModal.paidCard || '0');
    const debtAmount = Math.max(0, totalCost - paidCash - paidCard);

    if (debtAmount > 0) {
      if (!checkoutModal.showCustomerSelect) {
        setCheckoutModal(prev => ({ ...prev, showCustomerSelect: true }));
        return;
      }
      
      setLoadingAction(`checkout`);
      if (checkoutModal.isNewCustomer) {
        if (newCustomerFormRef.current) {
          const formData = new FormData(newCustomerFormRef.current);
          const name = formData.get("name") as string;
          if (!name || !name.trim()) {
            alert("Iltimos, yangi mijozning ismini kiriting!");
            setLoadingAction(null);
            return;
          }
          const res = await endSessionWithNewCustomer(
            checkoutModal.session.id, 
            checkoutModal.resource.id, 
            checkoutModal.elapsedSeconds, 
            checkoutModal.gameCost, 
            formData,
            paidCash,
            paidCard,
            debtAmount
          );
          if (!res.success) alert("Xatolik: " + res.error);
        }
      } else {
        if (!checkoutModal.selectedCustomerId) {
          alert("Iltimos, ro'yxatdan mijozni tanlang!");
          setLoadingAction(null);
          return;
        }
        const res = await endSession(
          checkoutModal.session.id, 
          checkoutModal.resource.id, 
          checkoutModal.elapsedSeconds, 
          checkoutModal.gameCost, 
          'split', 
          checkoutModal.selectedCustomerId,
          undefined,
          undefined,
          paidCash,
          paidCard,
          debtAmount
        );
        if (!res.success) alert("Xatolik: " + res.error);
      }
    } else {
      setLoadingAction(`checkout`);
      const res = await endSession(
        checkoutModal.session.id, 
        checkoutModal.resource.id, 
        checkoutModal.elapsedSeconds, 
        checkoutModal.gameCost, 
        'split',
        undefined, undefined, undefined,
        paidCash, paidCard, 0
      );
      if (!res.success) alert("Xatolik: " + res.error);
    }
    
    setLoadingAction(null);
    setCheckoutModal({ isOpen: false, session: null, resource: null, elapsedSeconds: 0, gameCost: 0, paidCash: '', paidCard: '', showCustomerSelect: false, selectedCustomerId: '', isNewCustomer: false });
    router.refresh();
  };

  const handleAddProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!addProductModal.sessionId) return;
    
    const formData = new FormData(e.currentTarget);
    const productId = selectedProductId;
    if (!productId) {
      alert("Iltimos, mahsulotni tanlang!");
      return;
    }
    const quantity = parseInt(formData.get("quantity") as string);
    
    setLoadingAction(`add-item`);
    const res = await addSessionItem(addProductModal.sessionId, productId, quantity);
    
    if (!res.success) {
      alert("Xatolik: " + res.error);
    } else {
      setAddProductModal({ isOpen: false, sessionId: null });
      setProductSearch('');
      setSelectedProductId('');
      router.refresh();
    }
    setLoadingAction(null);
  };

  const stadiums = initialResources.filter(r => r.type === 'stadium');
  const billiards = initialResources.filter(r => r.type === 'billiard');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Dashboard</h2>
        <p className="text-sm text-slate-400 mt-1">Biznesingizning joriy holati va kunlik statistikasi.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
            Stadionlar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stadiums.map((stadium) => {
              const session = initialSessions.find(s => s.resource_id === stadium.id);
              const resourceReservations = reservations.filter(r => r.resource_id === stadium.id && r.status === 'pending');
              return (
                <ResourceCard 
                  key={stadium.id}
                  resource={stadium} 
                  session={session}
                  reservations={resourceReservations}
                  loadingAction={loadingAction}
                  onStart={handleStart}
                  onEnd={handleEndClick}
                  onAddProduct={() => setAddProductModal({ isOpen: true, sessionId: session?.id || null })}
                />
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-cyan-500 rounded-full"></span>
            Bilyard Stollari
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {billiards.map((billiard) => {
              const session = initialSessions.find(s => s.resource_id === billiard.id);
              const resourceReservations = reservations.filter(r => r.resource_id === billiard.id && r.status === 'pending');
              return (
                <ResourceCard 
                  key={billiard.id}
                  resource={billiard} 
                  session={session}
                  reservations={resourceReservations}
                  loadingAction={loadingAction}
                  onStart={handleStart}
                  onEnd={handleEndClick}
                  onAddProduct={() => setAddProductModal({ isOpen: true, sessionId: session?.id || null })}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {addProductModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-800 shrink-0">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-indigo-400" />
                Mahsulot qo'shish
              </h3>
            </div>
            <form onSubmit={handleAddProductSubmit} className="p-5 flex flex-col gap-4 overflow-hidden">
              <div className="flex flex-col gap-2 shrink-0">
                <input 
                  type="text" 
                  placeholder="Mahsulot qidirish..." 
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                />
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-2 min-h-[200px]">
                {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).map(p => (
                  <button 
                    key={p.id}
                    type="button" 
                    disabled={p.stock_quantity <= 0}
                    onClick={() => setSelectedProductId(p.id)} 
                    className={`w-full text-left px-3 py-3 rounded-lg flex justify-between items-center transition-all ${selectedProductId === p.id ? 'bg-indigo-500/20 border-indigo-500/50 border shadow-inner' : 'bg-slate-950 border-slate-800 border hover:border-slate-700'} ${p.stock_quantity <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                  >
                    <div>
                      <div className="text-sm font-bold text-white">{p.name}</div>
                      <div className="text-xs font-semibold text-indigo-300 mt-0.5">{p.sale_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm</div>
                    </div>
                    <div className="text-xs font-medium text-slate-400 bg-slate-900 px-2 py-1 rounded-md border border-white/5">
                      {p.stock_quantity <= 0 ? 'Qolmagan' : `${p.stock_quantity} ta`}
                    </div>
                  </button>
                ))}
              </div>

              <input type="hidden" name="product_id" value={selectedProductId} />

              <div className="shrink-0 pt-3 border-t border-slate-800">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Soni</label>
                <input required type="number" name="quantity" min="1" defaultValue="1" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none" />
              </div>
              
              <div className="flex gap-3 pt-2 shrink-0">
                <button type="button" onClick={() => { setAddProductModal({ isOpen: false, sessionId: null }); setProductSearch(''); setSelectedProductId(''); }} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-lg text-sm font-bold transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" disabled={loadingAction === 'add-item' || !selectedProductId} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 flex justify-center items-center shadow-[0_4px_20px_rgba(79,70,229,0.3)]">
                  {loadingAction === 'add-item' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'QO\'SHISH'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutModal.isOpen && (() => {
        const totalCost = checkoutModal.gameCost + (checkoutModal.session?.items_cost || 0);
        const paidCash = parseInt(checkoutModal.paidCash || '0');
        const paidCard = parseInt(checkoutModal.paidCard || '0');
        const debtAmount = Math.max(0, totalCost - paidCash - paidCard);
        
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl my-auto">
              <div className="p-6 border-b border-slate-800 text-center">
                <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-rose-500" />
                </div>
                <h3 className="text-xl font-bold text-white">O'yinni yakunlash</h3>
                <p className="text-slate-400 text-sm mt-1">{checkoutModal.resource?.name}</p>
              </div>
              
              <div className="p-6 bg-slate-900/50 space-y-3 border-b border-slate-800">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">O'ynalgan vaqt:</span>
                  <span className="text-white font-medium">{Math.floor(checkoutModal.elapsedSeconds / 3600)}s {Math.floor((checkoutModal.elapsedSeconds % 3600) / 60)}m</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">O'yin narxi:</span>
                  <span className="text-white font-medium">{checkoutModal.gameCost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Mahsulotlar summasi:</span>
                  <span className="text-white font-medium">{(checkoutModal.session?.items_cost || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm</span>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-800 flex justify-between">
                  <span className="text-slate-300 font-medium">UMUMIY SUMMA:</span>
                  <span className="text-2xl font-bold text-emerald-400 drop-shadow-md">
                    {totalCost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {!checkoutModal.showCustomerSelect ? (
                  <div className="space-y-5 animate-in fade-in">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-black text-emerald-400 mb-2 uppercase tracking-widest">Naqd pul</label>
                        <input 
                          type="number" 
                          placeholder="0"
                          value={checkoutModal.paidCash}
                          onChange={(e) => setCheckoutModal(prev => ({...prev, paidCash: e.target.value}))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-blue-400 mb-2 uppercase tracking-widest">Karta / Click</label>
                        <input 
                          type="number" 
                          placeholder="0"
                          value={checkoutModal.paidCard}
                          onChange={(e) => setCheckoutModal(prev => ({...prev, paidCard: e.target.value}))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                        />
                      </div>
                    </div>

                    <div className={`border rounded-xl p-4 flex justify-between items-center transition-colors ${debtAmount > 0 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-950/50 border-slate-800'}`}>
                      <span className="text-sm font-medium text-slate-400">Qolayotgan qarz:</span>
                      <span className={`text-xl font-black ${debtAmount > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                        {debtAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm
                      </span>
                    </div>

                    <button onClick={handleFinalizeCheckout} disabled={loadingAction === 'checkout'} className={`w-full py-4 rounded-xl text-sm font-black tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${debtAmount > 0 ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-[0_10px_30px_rgba(245,158,11,0.3)] border border-amber-400/20' : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-[0_10px_30px_rgba(16,185,129,0.3)] border border-emerald-400/20'}`}>
                      {loadingAction === 'checkout' ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        debtAmount > 0 ? 'QARZGA YOZISH (DAVOM ETISH)' : 'YAKUNLASH (TO\'LANDI)'
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-slate-300">Qarz uchun mijozni tanlang</h4>
                      <button 
                        onClick={() => setCheckoutModal(prev => ({...prev, isNewCustomer: !prev.isNewCustomer}))} 
                        className="text-[11px] font-black tracking-wider text-indigo-400 hover:text-indigo-300 px-3 py-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20 transition-colors uppercase"
                      >
                        {checkoutModal.isNewCustomer ? "Ro'yxatdan tanlash" : "+ Yangi mijoz"}
                      </button>
                    </div>
                    
                    {checkoutModal.isNewCustomer ? (
                      <form ref={newCustomerFormRef} className="space-y-3 animate-in fade-in slide-in-from-top-2" onSubmit={(e) => { e.preventDefault(); handleFinalizeCheckout(); }}>
                        <input 
                          type="text" 
                          name="name"
                          placeholder="Mijozning ism-familiyasi (majburiy)" 
                          required
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-white outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                        />
                        <input 
                          type="text" 
                          name="phone"
                          placeholder="Telefon raqami (ixtiyoriy)" 
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-white outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                        />
                        <input 
                          type="text" 
                          name="village"
                          placeholder="Qishlog'i (ixtiyoriy)" 
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-white outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                        />
                      </form>
                    ) : (
                      <div className="animate-in fade-in slide-in-from-top-2">
                        <select 
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-white outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                          value={checkoutModal.selectedCustomerId}
                          onChange={(e) => setCheckoutModal(prev => ({...prev, selectedCustomerId: e.target.value}))}
                        >
                          <option value="" disabled>Mijozni tanlang...</option>
                          {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.full_name} ({c.phone_number || 'raqamsiz'})</option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    <button onClick={handleFinalizeCheckout} disabled={loadingAction === 'checkout'} className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white py-4 rounded-xl text-sm font-black tracking-wider transition-all disabled:opacity-50 shadow-[0_10px_30px_rgba(245,158,11,0.3)] border border-amber-400/20">
                      {loadingAction === 'checkout' ? <><Loader2 className="w-5 h-5 animate-spin" /> Qarzga yozilmoqda...</> : "YAKUNLASH (QARZ QO'SHILDI)"}
                    </button>
                  </div>
                )}
                
                <button onClick={() => setCheckoutModal({ isOpen: false, session: null, resource: null, elapsedSeconds: 0, gameCost: 0, paidCash: '', paidCard: '', showCustomerSelect: false, selectedCustomerId: '', isNewCustomer: false })} className="w-full mt-2 bg-transparent hover:bg-slate-800 text-slate-400 py-3 rounded-xl text-sm font-bold transition-colors">
                  Bekor qilish
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}

export function StatCard({ title, value, icon: Icon, color, bgColor }: any) {
  return (
    <div className="relative overflow-hidden bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-4 group hover:bg-white/[0.04] transition-all">
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] opacity-20 transition-colors duration-500 rounded-full ${bgColor} pointer-events-none -mr-10 -mt-10`} />
      <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center shadow-inner relative z-10 border border-white/10`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div className="relative z-10">
        <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">{title}</p>
        <p className="text-xl font-bold text-white mt-1 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function ResourceCard({ resource, session, reservations = [], loadingAction, onStart, onEnd, onAddProduct }: any) {
  const isOccupied = resource.status === "occupied" && session;
  const startedAt = isOccupied ? session.started_at : null;
  const rate = isOccupied ? session.hourly_rate_snapshot : resource.hourly_rate;
  
  const { elapsedSeconds, formattedTime, currentAmount } = useTimer(startedAt, rate);
  
  const isStarting = loadingAction === `start-${resource.id}`;

  const today = new Date();
  const upcomingReservations = reservations
    .map((r: any) => ({ ...r, dateObj: new Date(r.reservation_time) }))
    .filter((r: any) => r.dateObj > today && r.dateObj.getDate() === today.getDate())
    .sort((a: any, b: any) => a.dateObj.getTime() - b.dateObj.getTime());
    
  const nextReservation = upcomingReservations[0];
  let isReservedSoon = false;
  if (nextReservation) {
    const timeDiffMinutes = (nextReservation.dateObj.getTime() - today.getTime()) / (1000 * 60);
    isReservedSoon = timeDiffMinutes <= 15;
  }

  return (
    <div className={`relative bg-white/[0.03] backdrop-blur-xl rounded-[2rem] border p-5 overflow-hidden transition-all duration-500 flex flex-col hover:-translate-y-1 ${isOccupied ? 'border-rose-500/30 shadow-[0_10px_40px_rgba(244,63,94,0.15)]' : 'border-emerald-500/20 hover:border-emerald-500/40 shadow-[0_8px_30px_rgba(16,185,129,0.05)]'} ${isReservedSoon && !isOccupied ? 'animate-pulse border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : ''} ${isReservedSoon && isOccupied ? 'border-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.4)]' : ''}`}>
      
      {resource.image_url && (
        <div 
          className="absolute inset-0 z-0 opacity-10 bg-cover bg-center transition-opacity duration-500 grayscale group-hover:grayscale-0"
          style={{ backgroundImage: `url(${resource.image_url})` }}
        />
      )}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/20 pointer-events-none" />

      <div className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-[80px] opacity-30 pointer-events-none transition-colors duration-700 ${isOccupied ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex flex-col">
          <h4 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
            {resource.name}
          </h4>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
              {rate.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm/soat
            </span>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="flex flex-col items-end gap-2">
          {nextReservation && (
            <div className={`px-3 py-1.5 text-[10px] font-bold rounded-xl flex items-center gap-1.5 shadow-sm border backdrop-blur-md ${isReservedSoon ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-slate-800/80 text-slate-300 border-white/10'}`}>
              <Clock className="w-3 h-3" />
              Bron: {nextReservation.dateObj.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
          <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest flex items-center gap-2 shadow-inner backdrop-blur-md ${isOccupied ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'}`}>
            <span className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] ${isOccupied ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`}></span>
            {isOccupied ? 'BAND' : 'BO\'SH'}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-end space-y-6 relative z-10">
        <div className={`rounded-2xl p-6 text-center border backdrop-blur-sm transition-all duration-500 ${isOccupied ? 'bg-rose-950/30 border-rose-500/20 shadow-[inset_0_0_30px_rgba(244,63,94,0.05)]' : 'bg-slate-900/50 border-white/5 shadow-inner'}`}>
          <p className={`font-mono text-5xl font-black tracking-widest drop-shadow-lg ${isOccupied ? 'text-white' : 'text-slate-600'}`}>
            {isOccupied ? formattedTime : '00:00:00'}
          </p>
          {isOccupied && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] font-bold text-rose-300 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                O'yin: {currentAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
              </span>
              {session.items_cost > 0 && (
                <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                  Do'kon: {session.items_cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-2">
          {isOccupied ? (
            <>
              <button onClick={onAddProduct} className="flex-[2] bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl text-xs font-black tracking-wider transition-all active:scale-95 border border-white/10 backdrop-blur-md shadow-lg flex flex-col items-center justify-center gap-1">
                <PackagePlus className="w-5 h-5 opacity-70" />
                <span>SAVDO</span>
              </button>
              <button 
                onClick={() => onEnd(session, resource, elapsedSeconds, currentAmount)}
                className="flex-[3] flex flex-col justify-center items-center bg-gradient-to-br from-rose-500 to-rose-700 hover:from-rose-400 hover:to-rose-600 text-white py-4 rounded-xl text-sm font-black tracking-wider transition-all active:scale-95 shadow-[0_10px_30px_rgba(244,63,94,0.4)] border border-rose-400/30 gap-1"
              >
                <Clock className="w-5 h-5 opacity-90" />
                <span>YAKUNLASH</span>
              </button>
            </>
          ) : (
            <button 
              onClick={() => onStart(resource.id, rate)}
              disabled={isStarting}
              className="w-full flex justify-center items-center bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white py-5 rounded-2xl text-sm font-black tracking-widest transition-all active:scale-95 shadow-[0_10px_40px_rgba(16,185,129,0.4)] border border-emerald-400/30 disabled:opacity-50 gap-2"
            >
              {isStarting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'BOSHLASH'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
