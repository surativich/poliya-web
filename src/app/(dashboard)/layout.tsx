import { BottomNav } from "@/components/layout/bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto pb-20">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
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
