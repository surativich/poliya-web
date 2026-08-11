"use client";

import { useState, useRef } from "react";
import { Plus, Package, AlertCircle, Edit, Trash2, FileSpreadsheet, Loader2, Download } from "lucide-react";
import { addProduct, updateProduct, deleteProduct, uploadExcelFile } from "@/actions/inventory.actions";
import { useRouter } from "next/navigation";

export function InventoryClient({ initialProducts, initialMovements }: { initialProducts: any[], initialMovements?: any[] }) {
  const [activeTab, setActiveTab] = useState<"stock" | "history">("stock");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleExcelUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingExcel(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadExcelFile(formData);
    setUploadingExcel(false);
    
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (res.success) {
      alert("Mahsulotlar muvaffaqiyatli yuklandi!");
      router.refresh();
    } else {
      alert("Xatolik: " + res.error);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let res;
    if (editProduct) {
      formData.append("id", editProduct.id);
      res = await updateProduct(formData);
    } else {
      res = await addProduct(formData);
    }
    
    if (res.success) {
      setIsModalOpen(false);
      setEditProduct(null);
      router.refresh();
    } else {
      alert("Xatolik: " + res.error);
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Mahsulotni o'chirishni tasdiqlaysizmi?")) {
      const res = await deleteProduct(id);
      if (res.success) {
        router.refresh();
      } else {
        alert("Xatolik: " + res.error);
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-400" />
            Ombor
          </h2>
          <p className="text-sm text-slate-400 mt-1">Mahsulotlar zaxirasini boshqarish va nazorat qilish.</p>
        </div>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => { setEditProduct(null); setIsModalOpen(true); }}
            className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-3.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            Qo'lda qo'shish
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingExcel}
              className="flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {uploadingExcel ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              Excel
            </button>
            <a
              href="/api/excel-template"
              className="flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-slate-300 px-4 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
              download
            >
              <Download className="w-4 h-4" />
              Shablon
            </a>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleExcelUpload} 
            accept=".xlsx,.xls,.csv" 
            className="hidden" 
          />
        </div>
      </div>

      <div className="flex gap-4 border-b border-white/5 pb-4">
        <button
          onClick={() => setActiveTab("stock")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "stock" ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "text-slate-400 hover:text-white bg-white/5"}`}
        >
          Ombor qoldig'i
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "history" ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "text-slate-400 hover:text-white bg-white/5"}`}
        >
          Harakatlar tarixi
        </button>
      </div>

      {activeTab === "stock" && (
        <div className="grid grid-cols-1 gap-4">
          {initialProducts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-medium bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
              Omborda hozircha mahsulot yo'q.
            </div>
          ) : initialProducts.map((product) => {
            const isLow = product.stock_quantity <= product.min_stock;
            return (
              <div key={product.id} className="bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 shadow-lg flex flex-col gap-3 relative overflow-hidden transition-all active:scale-[0.98]">
                {isLow && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-2xl -mr-8 -mt-8 animate-pulse"></div>
                )}
                
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                      {isLow && <AlertCircle className="w-4 h-4 text-amber-500" />}
                      {product.name}
                    </h3>
                    <p className="text-xs text-indigo-400 mt-1 font-medium bg-indigo-500/10 inline-block px-2 py-0.5 rounded-full border border-indigo-500/20">{product.category}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditProduct(product); setIsModalOpen(true); }} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-indigo-400 hover:bg-indigo-500/20 transition-all active:scale-90 border border-white/5">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-rose-400 hover:bg-rose-500/20 transition-all active:scale-90 border border-white/5">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 bg-slate-950/50 p-3 rounded-xl border border-white/5 mt-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Kelish</span>
                    <span className="font-medium text-slate-300 text-sm">{product.cost_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}</span>
                  </div>
                  <div className="flex flex-col border-l border-white/5 pl-3">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sotish</span>
                    <span className="font-bold text-emerald-400 text-sm">{product.sale_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}</span>
                  </div>
                  <div className="flex flex-col border-l border-white/5 pl-3">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Qoldiq</span>
                    <span className={`font-black text-lg leading-tight ${isLow ? 'text-amber-400' : 'text-indigo-400'}`}>
                      {product.stock_quantity}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "history" && (
        <div className="grid grid-cols-1 gap-3">
          {!initialMovements || initialMovements.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-medium bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
              Harakatlar tarixi bo'sh.
            </div>
          ) : initialMovements.map((move) => (
            <div key={move.id} className="bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 shadow-lg flex flex-col gap-2 relative transition-all active:scale-[0.98]">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white">{move.products?.name}</h3>
                  <p suppressHydrationWarning className="text-xs text-slate-500 mt-0.5">{new Date(move.created_at).toLocaleString("uz-UZ", { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</p>
                </div>
                <div className={`flex flex-col items-end`}>
                  <span className={`text-lg font-black ${move.change_amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {move.change_amount > 0 ? '+' : ''}{move.change_amount}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border ${
                  move.type === 'IN' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                  move.type === 'SALE' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                  'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {move.type}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  Qoldiq: <strong className="text-indigo-400">{move.new_stock}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl scale-in-95">
            <div className="p-6 border-b border-white/5 bg-slate-900/90">
              <h3 className="text-xl font-bold text-white tracking-wide">{editProduct ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold tracking-wide text-slate-300 mb-1.5 uppercase text-[10px]">Mahsulot nomi</label>
                <input required type="text" name="name" defaultValue={editProduct?.name || ''} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-600" placeholder="Masalan: Coca-Cola 1L" />
              </div>
              <div>
                <label className="block text-sm font-bold tracking-wide text-slate-300 mb-1.5 uppercase text-[10px]">Kategoriya</label>
                <input required type="text" name="category" defaultValue={editProduct?.category || ''} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-600" placeholder="Ichimliklar" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold tracking-wide text-slate-300 mb-1.5 uppercase text-[10px]">Kelish narxi (so'm)</label>
                  <input required type="number" name="cost_price" defaultValue={editProduct?.cost_price || ''} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold tracking-wide text-slate-300 mb-1.5 uppercase text-[10px]">Sotish narxi (so'm)</label>
                  <input required type="number" name="sale_price" defaultValue={editProduct?.sale_price || ''} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold tracking-wide text-slate-300 mb-1.5 uppercase text-[10px]">Boshlang'ich qoldiq</label>
                  <input required type="number" name="stock_quantity" defaultValue={editProduct?.stock_quantity || ''} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold tracking-wide text-slate-300 mb-1.5 uppercase text-[10px]">Minimal ogohlantirish</label>
                  <input required type="number" name="min_stock" defaultValue={editProduct?.min_stock || 5} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
                </div>
              </div>
              
              <div className="flex gap-3 pt-6 border-t border-white/5 mt-6">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditProduct(null); }} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl text-sm font-bold transition-all active:scale-95 border border-white/5">
                  Bekor qilish
                </button>
                <button type="submit" className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] active:scale-95">
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
