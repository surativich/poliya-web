import Link from "next/link";
import { LayoutDashboard, Users, Box, History, Settings, FileText, QrCode, MonitorPlay, CreditCard, Package, BarChart3 } from "lucide-react";

export function Sidebar() {
  const routes = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Ombor", path: "/inventory", icon: Package },
    { name: "Qarz Daftari", path: "/debts", icon: Users },
    { name: "Tarix", path: "/history", icon: History },
    { name: "Hisobotlar", path: "/reports", icon: BarChart3 },
    { name: "QR Kodlar", path: "/qr-codes", icon: QrCode },
    { name: "Sozlamalar", path: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          POS System
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {routes.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <route.icon className="w-5 h-5" />
              {route.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            A
          </div>
          <div>
            <p className="text-sm font-medium text-white">Admin</p>
            <p className="text-xs text-slate-400">Tizim administratori</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
