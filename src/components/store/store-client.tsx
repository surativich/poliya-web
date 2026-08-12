"use client";

import { useState, useMemo, useRef } from "react";
import { Search, ShoppingCart, Plus, Minus, X, Loader2, Package } from "lucide-react";
import { processDirectSale } from "@/actions/store.actions";
import { useRouter } from "next/navigation";

export function StoreClient({ products, customers }: { products: any[], customers: any[] }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Barchasi");
  const [cart, setCart] = useState<{ product: any, quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'debt' | 'split' | null>(null);
  const [paidCash, setPaidCash] = useState('');
  const [paidCard, setPaidCard] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const newCustomerFormRef = useRef<HTMLFormElement>(null);

  const router = useRouter();

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ["Barchasi", ...Array.from(cats)];
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === "Barchasi" || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, activeCategory]);

  const cartTotal = cart.reduce((acc, item) => acc + (item.product.sale_price * item.quantity), 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const addToCart = (product: any) => {
    if (product.stock_quantity <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) return prev; // Cannot add more than stock
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQ = item.quantity + delta;
          if (newQ <= 0) return item; // Handled by remove button usually, but prevent <=0
          if (newQ > item.product.stock_quantity) return item;
          return { ...item, quantity: newQ };
        }
        return item;
      });
    });
  };

  const handleCheckout = async (method: string) => {
    if (cart.length === 0) return;
    
    if (method === 'debt') {
      if (isNewCustomer) {
        const formData = new FormData(newCustomerFormRef.current!);
        const name = formData.get('name') as string;
        if (!name?.trim()) {
          alert("Iltimos, yangi mijozning ismini kiriting!");
          return;
        }
      } else if (!selectedCustomerId) {
        setPaymentMethod('debt');
        return;
      }
    }

    setLoadingAction('checkout');
    
    const cartData = cart.map(item => ({
      id: item.product.id,
      sale_price: item.product.sale_price,
      quantity: item.quantity
    }));

    let newCustomerName;
    let newCustomerPhone;
    if (method === 'debt' && isNewCustomer && newCustomerFormRef.current) {
      const formData = new FormData(newCustomerFormRef.current);
      newCustomerName = formData.get('name') as string;
      newCustomerPhone = formData.get('phone') as string;
    }

    let pCash = 0;
    let pCard = 0;
    let dAmount = 0;

    if (method === 'split') {
      pCash = parseInt(paidCash || '0');
      pCard = parseInt(paidCard || '0');
      dAmount = Math.max(0, cartTotal - pCash - pCard);

      if (dAmount > 0) {
        if (!selectedCustomerId && !isNewCustomer) {
          setPaymentMethod('debt');
          return;
        }
      }
    }

    const res = await processDirectSale(
      cartData, 
      method, 
      (method === 'debt' || (method === 'split' && dAmount > 0)) && !isNewCustomer ? selectedCustomerId : undefined, 
      newCustomerName, 
      newCustomerPhone,
      pCash,
      pCard,
      dAmount
    );
    
    if (!res.success) {
      alert("Xatolik: " + res.error);
    } else {
      // Clear cart and close
      setCart([]);
      setIsCartOpen(false);
      setPaymentMethod(null);
      setPaidCash('');
      setPaidCard('');
      setSelectedCustomerId("");
      router.refresh();
    }
    setLoadingAction(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] pb-20 md:pb-0 relative">
      {/* Search and Categories Header */}
      <div className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-md pt-2 pb-4 px-2 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Mahsulot qidirish..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                activeCategory === cat 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto px-2 pb-24">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredProducts.map(product => {
            const inCart = cart.find(i => i.product.id === product.id)?.quantity || 0;
            const isOutOfStock = product.stock_quantity <= 0;
            
            return (
              <button 
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={isOutOfStock}
                className={`relative flex flex-col items-center justify-center p-4 rounded-[1.5rem] border backdrop-blur-md text-center transition-all duration-300 ${
                  isOutOfStock 
                  ? 'opacity-50 border-rose-500/20 bg-rose-500/5' 
                  : 'bg-white/5 border-white/10 hover:border-indigo-500/50 hover:bg-white/10 active:scale-95 shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)]'
                }`}
              >
                {inCart > 0 && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] border-2 border-slate-950 transform scale-in">
                    {inCart}
                  </div>
                )}
                
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
                  isOutOfStock ? 'bg-rose-500/10 text-rose-500' : 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400'
                }`}>
                  <Package className="w-7 h-7" />
                </div>
                
                <h3 className="font-semibold text-white text-sm line-clamp-2 leading-tight">{product.name}</h3>
                <p className="text-emerald-400 font-bold mt-2 tracking-wide">{product.sale_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm</p>
                
                <p className={`text-[10px] mt-2 px-3 py-1 rounded-full font-medium ${isOutOfStock ? 'bg-rose-500/20 text-rose-400' : 'bg-white/5 text-slate-400 border border-white/5'}`}>
                  {isOutOfStock ? 'TUGAGAN' : `Qoldiq: ${product.stock_quantity}`}
                </p>
              </button>
            );
          })}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            Mahsulot topilmadi
          </div>
        )}
      </div>

      {/* Floating Cart Summary Button */}
      {cart.length > 0 && !isCartOpen && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 z-30 animate-in slide-in-from-bottom-5">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl p-4 flex items-center justify-between shadow-[0_10px_40px_rgba(99,102,241,0.5)] active:scale-95 transition-all duration-300 border border-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-indigo-100">{cartItemCount} ta mahsulot</p>
                <p className="font-bold text-lg">{cartTotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm</p>
              </div>
            </div>
            <div className="bg-white/20 px-5 py-2.5 rounded-xl text-sm font-bold backdrop-blur-sm border border-white/10">
              To'lov
            </div>
          </button>
        </div>
      )}

      {/* Bottom Sheet Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900/90 border border-white/10 rounded-t-[2rem] sm:rounded-[2rem] flex flex-col max-h-[90vh] shadow-[0_-20px_60px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-center p-5 border-b border-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <div className="p-2 bg-indigo-500/20 rounded-xl">
                  <ShoppingCart className="w-5 h-5 text-indigo-400" />
                </div>
                Savat
              </h2>
              <button onClick={() => { setIsCartOpen(false); setPaymentMethod(null); setPaidCash(''); setPaidCard(''); }} className="p-2.5 bg-white/5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors active:scale-90">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.map(item => (
                <div key={item.product.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate">{item.product.name}</h4>
                    <p className="text-indigo-400 text-sm font-bold mt-1">{item.product.sale_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm</p>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-slate-950/50 rounded-xl p-1.5 border border-white/5">
                    <button 
                      onClick={() => item.quantity > 1 ? updateQuantity(item.product.id, -1) : removeFromCart(item.product.id)}
                      className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg text-white active:bg-white/10 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center font-bold text-white">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product.id, 1)}
                      disabled={item.quantity >= item.product.stock_quantity}
                      className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg text-white active:bg-white/10 transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {cart.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                  Savat bo'sh
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-900/50 rounded-b-[2rem] border-t border-white/5">
              <div className="flex justify-between items-center mb-5">
                <span className="text-slate-400 font-medium">Jami summa:</span>
                <span className="text-2xl font-black text-white">{cartTotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} <span className="text-indigo-400 text-lg">so'm</span></span>
              </div>

              {paymentMethod === 'debt' ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-slate-300">Qarz uchun mijozni tanlang</h4>
                    <button 
                      onClick={() => setIsNewCustomer(prev => !prev)} 
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                      {isNewCustomer ? "Ro'yxatdan tanlash" : "+ Yangi mijoz"}
                    </button>
                  </div>

                  {isNewCustomer ? (
                    <form ref={newCustomerFormRef} className="space-y-3 animate-in fade-in slide-in-from-top-2" onSubmit={(e) => { e.preventDefault(); handleCheckout('debt'); }}>
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
                    </form>
                  ) : (
                    <select 
                      className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 transition-colors"
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                    >
                      <option value="" disabled>Ro'yxatdan tanlang...</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.full_name} ({c.phone_number || 'raqamsiz'})</option>
                      ))}
                    </select>
                  )}
                  
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setPaymentMethod(null)} className="flex-1 bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-bold active:scale-95 transition-all">
                      Orqaga
                    </button>
                    <button 
                      onClick={() => handleCheckout('debt')}
                      disabled={loadingAction === 'checkout' || (!isNewCustomer && !selectedCustomerId)} 
                      className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white py-4 rounded-2xl font-bold active:scale-95 transition-all shadow-[0_8px_30px_rgba(245,158,11,0.3)] disabled:opacity-50"
                    >
                      {loadingAction === 'checkout' ? <><Loader2 className="w-5 h-5 animate-spin" /> Yozilmoqda...</> : "TASDIQLASH"}
                    </button>
                  </div>
                </div>
              ) : paymentMethod === 'split' ? (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black text-emerald-400 mb-2 uppercase tracking-widest">Naqd pul</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={paidCash}
                        onChange={(e) => setPaidCash(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-blue-400 mb-2 uppercase tracking-widest">Karta / Click</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={paidCard}
                        onChange={(e) => setPaidCard(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                      />
                    </div>
                  </div>

                  <div className={`border rounded-xl p-4 flex justify-between items-center transition-colors ${Math.max(0, cartTotal - parseInt(paidCash || '0') - parseInt(paidCard || '0')) > 0 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-950/50 border-slate-800'}`}>
                    <span className="text-sm font-medium text-slate-400">Qolayotgan qarz:</span>
                    <span className={`text-xl font-black ${Math.max(0, cartTotal - parseInt(paidCash || '0') - parseInt(paidCard || '0')) > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                      {Math.max(0, cartTotal - parseInt(paidCash || '0') - parseInt(paidCard || '0')).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm
                    </span>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setPaymentMethod(null)} className="flex-1 bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-bold active:scale-95 transition-all">
                      Orqaga
                    </button>
                    <button 
                      onClick={() => handleCheckout('split')}
                      disabled={loadingAction === 'checkout'} 
                      className={`flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl font-bold active:scale-95 transition-all shadow-[0_8px_30px_rgba(245,158,11,0.3)] disabled:opacity-50 ${Math.max(0, cartTotal - parseInt(paidCash || '0') - parseInt(paidCard || '0')) > 0 ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white' : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'}`}
                    >
                      {loadingAction === 'checkout' ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        Math.max(0, cartTotal - parseInt(paidCash || '0') - parseInt(paidCard || '0')) > 0 ? 'DAVOM ETISH' : 'TASDIQLASH'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleCheckout('cash')} 
                    disabled={loadingAction === 'checkout' || cart.length === 0} 
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-2xl text-sm font-bold active:scale-95 transition-all flex justify-center disabled:opacity-50 shadow-[0_8px_25px_rgba(16,185,129,0.3)] border border-emerald-400/20"
                  >
                    {loadingAction === 'checkout' ? <Loader2 className="w-5 h-5 animate-spin" /> : "NAQD"}
                  </button>
                  <button 
                    onClick={() => handleCheckout('card')} 
                    disabled={loadingAction === 'checkout' || cart.length === 0} 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-2xl text-sm font-bold active:scale-95 transition-all flex justify-center disabled:opacity-50 shadow-[0_8px_25px_rgba(59,130,246,0.3)] border border-blue-400/20"
                  >
                    {loadingAction === 'checkout' ? <Loader2 className="w-5 h-5 animate-spin" /> : "CLICK"}
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('debt')} 
                    disabled={loadingAction === 'checkout' || cart.length === 0} 
                    className="bg-gradient-to-r from-rose-500 to-rose-600 text-white py-4 rounded-2xl text-sm font-bold active:scale-95 transition-all flex justify-center disabled:opacity-50 shadow-[0_8px_25px_rgba(244,63,94,0.3)] border border-rose-400/20"
                  >
                    QARZ
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('split')} 
                    disabled={loadingAction === 'checkout' || cart.length === 0} 
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-4 rounded-2xl text-sm font-bold active:scale-95 transition-all flex justify-center disabled:opacity-50 shadow-[0_8px_25px_rgba(99,102,241,0.3)] border border-indigo-400/20"
                  >
                    ARALASH
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
