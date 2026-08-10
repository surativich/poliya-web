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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/70 backdrop-blur-2xl border-t border-white/5 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto relative">
        {mobileLinks.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link
              key={link.path}
              href={link.path}
              className={`flex flex-col items-center justify-center w-full py-1 transition-all duration-300 active:scale-90 ${
                isActive ? "text-indigo-400 translate-y-[-2px]" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-indigo-500/15 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : ''}`}>
                <link.icon className={`transition-all duration-300 ${isActive ? 'w-6 h-6' : 'w-5 h-5'}`} />
              </div>
              <span className={`text-[10px] font-medium mt-1 transition-all duration-300 ${isActive ? 'opacity-100 font-bold' : 'opacity-70'}`}>
                {link.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
