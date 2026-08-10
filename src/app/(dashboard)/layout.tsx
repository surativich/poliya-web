import { BottomNav } from "@/components/layout/bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      
      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto pb-20 w-full flex justify-center">
        <div className="p-4 md:p-8 w-full max-w-7xl">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation (Visible everywhere in mobile-first approach) */}
      <div className="block">
        <BottomNav />
      </div>
    </div>
  );
}
