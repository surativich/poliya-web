"use client";

import { Activity, Banknote, CreditCard, DollarSign, Users, Loader2, PackagePlus, CheckCircle2 } from "lucide-react";
import { useTimer } from "@/hooks/use-timer";
import { startSession, endSession, endSessionWithNewCustomer } from "@/actions/timer.actions";
import { addSessionItem } from "@/actions/session-items.actions";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export function DashboardClient({ 
  initialResources, 
  initialSessions,
  products,
  stats,
  customers
}: { 
  initialResources: any[], 
  initialSessions: any[],
  products: any[],
  stats: any,
  customers: any[]
}) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [addProductModal, setAddProductModal] = useState<{ isOpen: boolean, sessionId: string | null }>({ isOpen: false, sessionId: null });
  const [checkoutModal, setCheckoutModal] = useState<{ isOpen: boolean, session: any | null, resource: any | null, elapsedSeconds: number, gameCost: number, showCustomerSelect: boolean, selectedCustomerId: string, isNewCustomer: boolean }>({ isOpen: false, session: null, resource: null, elapsedSeconds: 0, gameCost: 0, showCustomerSelect: false, selectedCustomerId: '', isNewCustomer: false });
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
    setCheckoutModal({ isOpen: true, session, resource, elapsedSeconds, gameCost, showCustomerSelect: false, selectedCustomerId: '', isNewCustomer: false });
  };

  const handleFinalizeCheckout = async (paymentMethod: string) => {
    if (!checkoutModal.session || !checkoutModal.resource) return;
    
    if (paymentMethod === 'debt' && !checkoutModal.showCustomerSelect) {
      setCheckoutModal(prev => ({ ...prev, showCustomerSelect: true }));
      return;
    }
    
    setLoadingAction(`checkout`);

    if (paymentMethod === 'debt' && checkoutModal.showCustomerSelect) {
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
            formData
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
          paymentMethod, 
          checkoutModal.selectedCustomerId
        );
        if (!res.success) alert("Xatolik: " + res.error);
      }
    } else {
      const res = await endSession(
        checkoutModal.session.id, 
        checkoutModal.resource.id, 
        checkoutModal.elapsedSeconds, 
        checkoutModal.gameCost, 
        paymentMethod
      );
      if (!res.success) alert("Xatolik: " + res.error);
    }
    
    setLoadingAction(null);
    setCheckoutModal({ isOpen: false, session: null, resource: null, elapsedSeconds: 0, gameCost: 0, showCustomerSelect: false, selectedCustomerId: '', isNewCustomer: false });
    router.refresh();
  };

  const handleAddProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!addProductModal.sessionId) return;
    
    const formData = new FormData(e.currentTarget);
    const productId = formData.get("product_id") as string;
    const quantity = parseInt(formData.get("quantity") as string);
    
    setLoadingAction(`add-item`);
    const res = await addSessionItem(addProductModal.sessionId, productId, quantity);
    
    if (!res.success) {
      alert("Xatolik: " + res.error);
    } else {
      setAddProductModal({ isOpen: false, sessionId: null });
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <StatCard title="Bugungi tushum" value={`${stats.totalIncome.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, " ")} so'm`} icon={DollarSign} color="text-emerald-400" bgColor="bg-emerald-500/10" />
        <StatCard title="Naqd tushum" value={`${stats.cashIncome.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, " ")} so'm`} icon={Banknote} color="text-indigo-400" bgColor="bg-indigo-500/10" />
        <StatCard title="Click/Payme" value={`${stats.cardIncome.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, " ")} so'm`} icon={CreditCard} color="text-blue-400" bgColor="bg-blue-500/10" />
        <StatCard title="Yangi qarzlar" value={`${stats.newDebts.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, " ")} so'm`} icon={Users} color="text-amber-400" bgColor="bg-amber-500/10" />
        <StatCard title="Faol o'yinlar" value={`${initialSessions.length} ta`} icon={Activity} color="text-rose-400" bgColor="bg-rose-500/10" />
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
              return (
                <ResourceCard 
                  key={stadium.id}
                  resource={stadium} 
                  session={session}
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
              return (
                <ResourceCard 
                  key={billiard.id}
                  resource={billiard} 
                  session={session}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-indigo-400" />
                Mahsulot qo'shish
              </h3>
            </div>
            <form onSubmit={handleAddProductSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Mahsulotni tanlang</label>
                <select name="product_id" required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none">
                  <option value="" disabled selected>Tanlang...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.stock_quantity <= 0}>
                      {p.name} - {p.sale_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm {p.stock_quantity <= 0 ? '(Qolmagan)' : `(${p.stock_quantity} ta bor)`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Soni</label>
                <input required type="number" name="quantity" min="1" defaultValue="1" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none" />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setAddProductModal({ isOpen: false, sessionId: null })} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" disabled={loadingAction === 'add-item'} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex justify-center items-center">
                  {loadingAction === 'add-item' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
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
                <span className="text-2xl font-bold text-emerald-400">
                  {(checkoutModal.gameCost + (checkoutModal.session?.items_cost || 0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {!checkoutModal.showCustomerSelect ? (
                <>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">To'lov turini tanlang</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <button onClick={() => handleFinalizeCheckout('cash')} disabled={loadingAction === 'checkout'} className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">NAQD</button>
                    <button onClick={() => handleFinalizeCheckout('card')} disabled={loadingAction === 'checkout'} className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">CLICK</button>
                    <button onClick={() => handleFinalizeCheckout('debt')} disabled={loadingAction === 'checkout'} className="bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">QARZ</button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-slate-300">Qarz uchun mijozni tanlang</h4>
                    <button 
                      onClick={() => setCheckoutModal(prev => ({...prev, isNewCustomer: !prev.isNewCustomer}))} 
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                      {checkoutModal.isNewCustomer ? "Ro'yxatdan tanlash" : "+ Yangi mijoz"}
                    </button>
                  </div>
                  
                  {checkoutModal.isNewCustomer ? (
                    <form ref={newCustomerFormRef} className="space-y-3 animate-in fade-in slide-in-from-top-2" onSubmit={(e) => { e.preventDefault(); handleFinalizeCheckout('debt'); }}>
                      <input 
                        type="text" 
                        name="name"
                        placeholder="Mijozning ism-familiyasi (majburiy)" 
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-white outline-none focus:border-indigo-500"
                      />
                      <input 
                        type="text" 
                        name="phone"
                        placeholder="Telefon raqami (ixtiyoriy)" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-white outline-none focus:border-indigo-500"
                      />
                      <input 
                        type="text" 
                        name="village"
                        placeholder="Qishlog'i (ixtiyoriy)" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-white outline-none focus:border-indigo-500"
                      />
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400">Rasmini yuklash (ixtiyoriy)</label>
                        <input 
                          type="file" 
                          name="photo"
                          accept="image/*"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500 text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20"
                        />
                      </div>
                    </form>
                  ) : (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <select 
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-white outline-none focus:border-indigo-500"
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
                  
                  <button onClick={() => handleFinalizeCheckout('debt')} disabled={loadingAction === 'checkout'} className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                    QARZGA YOZISH
                  </button>
                </div>
              )}
              <button onClick={() => setCheckoutModal({ isOpen: false, session: null, resource: null, elapsedSeconds: 0, gameCost: 0, showCustomerSelect: false, selectedCustomerId: '', isNewCustomer: false })} className="w-full mt-2 bg-transparent hover:bg-slate-800 text-slate-400 py-2 rounded-lg text-sm font-medium transition-colors">
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bgColor }: any) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4 hover:border-slate-700 transition-colors">
      <div className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-sm text-slate-400 font-medium">{title}</p>
        <p className="text-lg font-bold text-white mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function ResourceCard({ resource, session, loadingAction, onStart, onEnd, onAddProduct }: any) {
  const isOccupied = resource.status === "occupied" && session;
  const startedAt = isOccupied ? session.started_at : null;
  const rate = isOccupied ? session.hourly_rate_snapshot : resource.hourly_rate;
  
  const { elapsedSeconds, formattedTime, currentAmount } = useTimer(startedAt, rate);
  
  const isStarting = loadingAction === `start-${resource.id}`;

  return (
    <div className={`relative bg-slate-900 rounded-xl border p-5 overflow-hidden transition-all duration-300 flex flex-col ${isOccupied ? 'border-rose-500/30 hover:border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : 'border-emerald-500/30 hover:border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.05)]'}`}>
      
      {/* Background gradient indicator */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] opacity-20 -mr-10 -mt-10 pointer-events-none ${isOccupied ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            {resource.name}
          </h4>
          <p className="text-xs text-slate-400 mt-1">{rate.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm / soat</p>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${isOccupied ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isOccupied ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></span>
          {isOccupied ? 'BAND' : 'BO\'SH'}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-end space-y-4 relative z-10">
        <div className="bg-slate-950/50 rounded-lg p-4 text-center border border-slate-800/50">
          <p className={`font-mono text-3xl font-bold tracking-wider ${isOccupied ? 'text-white' : 'text-slate-600'}`}>
            {isOccupied ? formattedTime : '00:00:00'}
          </p>
          {isOccupied && (
            <div className="mt-2 flex items-center justify-center gap-4 text-xs font-medium">
              <span className="text-indigo-400">O'yin: {currentAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}</span>
              {session.items_cost > 0 && <span className="text-emerald-400">Mahsulot: {session.items_cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}</span>}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {isOccupied ? (
            <>
              <button onClick={onAddProduct} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700">
                + Mahsulot
              </button>
              <button 
                onClick={() => onEnd(session, resource, elapsedSeconds, currentAmount)}
                className="flex-1 flex justify-center items-center bg-rose-500 hover:bg-rose-600 text-white py-2 rounded-lg text-sm font-medium transition-colors shadow-[0_0_10px_rgba(244,63,94,0.3)]"
              >
                Yakunlash
              </button>
            </>
          ) : (
            <button 
              onClick={() => onStart(resource.id, rate)}
              disabled={isStarting}
              className="w-full flex justify-center items-center bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-medium transition-colors shadow-[0_0_10px_rgba(16,185,129,0.3)] disabled:opacity-50"
            >
              {isStarting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Boshlash'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
