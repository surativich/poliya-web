"use client";

import { useState, useMemo, useRef } from "react";
import { Search, ShoppingCart, Plus, Minus, X, Loader2 } from "lucide-react";
import { processDirectSale } from "@/actions/store.actions";
import { useRouter } from "next/navigation";

export function StoreClient({ products, customers }: { products: any[], customers: any[] }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Barchasi");
  const [cart, setCart] = useState<{ product: any, quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

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
    
    if (method === 'debt' && !selectedCustomerId) {
      setPaymentMethod('debt');
      return;
    }

    setLoadingAction('checkout');
    
    const cartData = cart.map(item => ({
      id: item.product.id,
      sale_price: item.product.sale_price,
      quantity: item.quantity
    }));

    const res = await processDirectSale(cartData, method, method === 'debt' ? selectedCustomerId : undefined);
    
    if (!res.success) {
      alert("Xatolik: " + res.error);
    } else {
      // Clear cart and close
      setCart([]);
      setIsCartOpen(false);
      setPaymentMethod(null);
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
                className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all ${
                  isOutOfStock ? 'opacity-50 border-rose-500/30 bg-rose-500/5' : 'bg-slate-900 border-slate-800 hover:border-indigo-500 active:scale-95'
                }`}
              >
                {inCart > 0 && (
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg border-2 border-slate-950">
                    {inCart}
                  </div>
                )}
                
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${isOutOfStock ? 'bg-rose-500/20 text-rose-500' : 'bg-indigo-500/20 text-indigo-400'}`}>
                  <Package className="w-7 h-7" />
                </div>
                
                <h3 className="font-semibold text-white text-sm line-clamp-2 leading-tight">{product.name}</h3>
                <p className="text-emerald-400 font-bold mt-2">{product.sale_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm</p>
                
                <p className={`text-[10px] mt-1 px-2 py-0.5 rounded-full ${isOutOfStock ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
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
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 z-30">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-indigo-500 text-white rounded-2xl p-4 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.5)] shadow-indigo-500/30 active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-indigo-100">{cartItemCount} ta mahsulot</p>
                <p className="font-bold text-lg">{cartTotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm</p>
              </div>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-xl text-sm font-bold">
              To'lov
            </div>
          </button>
        </div>
      )}

      {/* Bottom Sheet Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[90vh] shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95">
            <div className="flex justify-between items-center p-5 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-400" />
                Savat
              </h2>
              <button onClick={() => { setIsCartOpen(false); setPaymentMethod(null); }} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.map(item => (
                <div key={item.product.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate">{item.product.name}</h4>
                    <p className="text-indigo-400 text-sm font-bold">{item.product.sale_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm</p>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-slate-900 rounded-lg p-1 border border-slate-800">
                    <button 
                      onClick={() => item.quantity > 1 ? updateQuantity(item.product.id, -1) : removeFromCart(item.product.id)}
                      className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-md text-white active:bg-slate-700"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center font-bold text-white">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product.id, 1)}
                      disabled={item.quantity >= item.product.stock_quantity}
                      className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-md text-white active:bg-slate-700 disabled:opacity-50"
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

            <div className="p-5 border-t border-slate-800 bg-slate-900 rounded-b-3xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-400">Jami summa:</span>
                <span className="text-2xl font-bold text-emerald-400">{cartTotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm</span>
              </div>

              {paymentMethod === 'debt' ? (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-sm font-medium text-slate-300">Qarz uchun mijozni tanlang:</p>
                  <select 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-white outline-none focus:border-indigo-500"
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                  >
                    <option value="" disabled>Ro'yxatdan tanlang...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.full_name} ({c.phone_number || 'raqamsiz'})</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button onClick={() => setPaymentMethod(null)} className="flex-1 bg-slate-800 text-white py-3.5 rounded-xl font-bold active:scale-95 transition-transform">
                      Orqaga
                    </button>
                    <button 
                      onClick={() => handleCheckout('debt')}
                      disabled={loadingAction === 'checkout' || !selectedCustomerId} 
                      className="flex-[2] flex items-center justify-center gap-2 bg-amber-500 text-white py-3.5 rounded-xl font-bold active:scale-95 transition-transform disabled:opacity-50"
                    >
                      {loadingAction === 'checkout' ? <><Loader2 className="w-5 h-5 animate-spin" /> Yozilmoqda...</> : "TASDIQLASH"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => handleCheckout('cash')} 
                    disabled={loadingAction === 'checkout' || cart.length === 0} 
                    className="bg-emerald-500 text-white py-3.5 rounded-xl text-sm font-bold active:scale-95 transition-transform flex justify-center disabled:opacity-50"
                  >
                    {loadingAction === 'checkout' ? <Loader2 className="w-5 h-5 animate-spin" /> : "NAQD"}
                  </button>
                  <button 
                    onClick={() => handleCheckout('card')} 
                    disabled={loadingAction === 'checkout' || cart.length === 0} 
                    className="bg-blue-500 text-white py-3.5 rounded-xl text-sm font-bold active:scale-95 transition-transform flex justify-center disabled:opacity-50"
                  >
                    {loadingAction === 'checkout' ? <Loader2 className="w-5 h-5 animate-spin" /> : "CLICK"}
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('debt')} 
                    disabled={loadingAction === 'checkout' || cart.length === 0} 
                    className="bg-amber-500 text-white py-3.5 rounded-xl text-sm font-bold active:scale-95 transition-transform flex justify-center disabled:opacity-50"
                  >
                    QARZ
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
