"use client";

import { useState } from "react";
import { Plus, Package, AlertCircle, Edit, Trash2 } from "lucide-react";
import { addProduct, updateProduct, deleteProduct } from "@/actions/inventory.actions";
import { useRouter } from "next/navigation";

export function InventoryClient({ initialProducts }: { initialProducts: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const router = useRouter();

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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-400" />
            Ombor
          </h2>
          <p className="text-sm text-slate-400 mt-1">Mahsulotlar zaxirasini boshqarish va nazorat qilish.</p>
        </div>
        <button 
          onClick={() => { setEditProduct(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yangi mahsulot
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Mahsulot Nomi</th>
                <th className="px-6 py-4 font-medium">Kategoriya</th>
                <th className="px-6 py-4 font-medium">Kelish Narxi</th>
                <th className="px-6 py-4 font-medium">Sotish Narxi</th>
                <th className="px-6 py-4 font-medium">Qoldiq</th>
                <th className="px-6 py-4 font-medium text-right">Harakatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {initialProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Omborda hozircha mahsulot yo'q.
                  </td>
                </tr>
              ) : initialProducts.map((product) => {
                const isLow = product.stock_quantity <= product.min_stock;
                return (
                  <tr key={product.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                      {isLow && <AlertCircle className="w-4 h-4 text-amber-500" />}
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{product.category}</td>
                    <td className="px-6 py-4 text-slate-300">{product.cost_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm</td>
                    <td className="px-6 py-4 text-emerald-400 font-medium">{product.sale_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${isLow ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-slate-800 text-slate-300'}`}>
                        {product.stock_quantity} dona
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                      <button onClick={() => { setEditProduct(product); setIsModalOpen(true); }} className="text-indigo-400 hover:text-indigo-300 transition-colors p-1" title="Tahrirlash">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="text-rose-400 hover:text-rose-300 transition-colors p-1" title="O'chirish">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">{editProduct ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Mahsulot nomi</label>
                <input required type="text" name="name" defaultValue={editProduct?.name || ''} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none" placeholder="Masalan: Coca-Cola 1L" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Kategoriya</label>
                <input required type="text" name="category" defaultValue={editProduct?.category || ''} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none" placeholder="Ichimliklar" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Kelish narxi (so'm)</label>
                  <input required type="number" name="cost_price" defaultValue={editProduct?.cost_price || ''} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Sotish narxi (so'm)</label>
                  <input required type="number" name="sale_price" defaultValue={editProduct?.sale_price || ''} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Boshlang'ich qoldiq</label>
                  <input required type="number" name="stock_quantity" defaultValue={editProduct?.stock_quantity || ''} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Minimal ogohlantirish</label>
                  <input required type="number" name="min_stock" defaultValue={editProduct?.min_stock || 5} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none" />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 mt-2">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditProduct(null); }} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
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
