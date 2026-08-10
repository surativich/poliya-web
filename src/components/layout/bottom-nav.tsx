"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, History, Settings, Package, Store, Shield } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const mobileLinks = [
    { name: "Asosiy", path: "/", icon: LayoutDashboard },
    { name: "Do'kon", path: "/store", icon: Store },
    { name: "Ombor", path: "/inventory", icon: Package },
    { name: "Qarzlar", path: "/debts", icon: Users },
    { name: "Admin", path: "/admin", icon: Shield },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileLinks.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link
              key={link.path}
              href={link.path}
              className={`flex flex-col items-center justify-center w-full py-1.5 transition-colors ${
                isActive ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <div className={`p-1.5 rounded-full ${isActive ? 'bg-indigo-500/10' : ''}`}>
                <link.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium mt-1">{link.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
