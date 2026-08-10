import { createClient } from "@supabase/supabase-js";
import { Clock, CheckCircle2 } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';

export default async function ViewResourcePage({ params }: { params: { id: string } }) {
  // 1. Get resource
  const { data: resource } = await supabase
    .from('resources')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!resource) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-slate-300">Resurs topilmadi</h1>
      </div>
    );
  }

  // 2. Get active session if occupied
  let session = null;
  let items = [];
  if (resource.status === 'occupied') {
    const { data: activeSession } = await supabase
      .from('sessions')
      .select('*')
      .eq('resource_id', resource.id)
      .eq('status', 'active')
      .single();
      
    session = activeSession;
    
    if (session) {
      const { data: sessionItems } = await supabase
        .from('session_items')
        .select('*, products(name)')
        .eq('session_id', session.id);
      items = sessionItems || [];
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8 font-sans">
      <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Background glow */}
        <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none ${resource.status === 'occupied' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>

        <div className="text-center relative z-10 mb-8">
          <h1 className="text-3xl font-black tracking-tight mb-2">{resource.name}</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-sm font-medium text-slate-300">
            {resource.type === 'stadium' ? 'Futbol Stadioni' : 'Bilyard Stoli'}
          </div>
        </div>

        {resource.status === 'free' ? (
          <div className="text-center py-12 relative z-10">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-400 mb-2">Hozirda bo'sh</h2>
            <p className="text-slate-400">Ushbu joy band qilinmagan. O'yinni boshlash uchun administratorga murojaat qiling.</p>
            <p className="mt-6 text-xl font-bold text-white">{resource.hourly_rate.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm / soat</p>
          </div>
        ) : (
          <div className="relative z-10 space-y-6">
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-center">
              <div className="flex justify-center mb-3">
                <span className="flex items-center gap-2 text-rose-400 font-bold bg-rose-500/10 px-3 py-1 rounded-full text-sm">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  BAND QILINGAN
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-1">Boshlangan vaqt</p>
              <p className="text-xl font-bold text-white flex items-center justify-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                {session ? new Date(session.started_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </p>
            </div>

            {items.length > 0 && (
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">Olingan mahsulotlar</h3>
                <ul className="space-y-3">
                  {items.map((item: any) => (
                    <li key={item.id} className="flex justify-between items-center text-sm border-b border-slate-800/50 pb-2 last:border-0 last:pb-0">
                      <div className="text-slate-300">
                        <span className="font-medium text-slate-200">{item.products?.name}</span> <span className="text-slate-500">x{item.quantity}</span>
                      </div>
                      <div className="font-medium text-slate-300">
                        {item.total_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="text-center mt-8">
              <p className="text-xs text-slate-500 mb-1">Hozirgi tarif</p>
              <p className="text-lg font-bold text-slate-300">{session?.hourly_rate_snapshot.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm / soat</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
