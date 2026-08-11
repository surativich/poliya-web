"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, History, Package, Store, Shield, Calendar } from "lucide-react";
import { useEffect, useState } from "react";

export function BottomNav() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Lock-screen saves auth in sessionStorage as "poliya_auth" (cashier or admin)
    const storedRole = sessionStorage.getItem("poliya_auth");
    setRole(storedRole || "cashier"); // default to cashier if nothing found, but UI shouldn't reach here if locked
  }, []);

  const mobileLinks = role === "cashier" ? [
    { name: "Asosiy", path: "/", icon: LayoutDashboard },
    { name: "Do'kon", path: "/store", icon: Store },
    { name: "Bron", path: "/reservations", icon: Calendar },
    { name: "Tarix", path: "/history", icon: History },
    { name: "Qarz", path: "/debts", icon: Users },
  ] : [
    { name: "Asosiy", path: "/", icon: LayoutDashboard },
    { name: "Do'kon", path: "/store", icon: Store },
    { name: "Bron", path: "/reservations", icon: Calendar },
    { name: "Ombor", path: "/inventory", icon: Package },
    { name: "Qarz", path: "/debts", icon: Users },
    { name: "Admin", path: "/admin", icon: Shield },
  ];

  if (!role) return null; // Wait for role to load to prevent flicker

  return (
    <nav className="fixed bottom-0 left-0 w-full z-[50] pb-[env(safe-area-inset-bottom,0px)] bg-slate-950/80 backdrop-blur-2xl border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="max-w-md mx-auto flex justify-between items-center px-2 py-2">
        {mobileLinks.map((link) => {
          const isActive = pathname === link.path;
          const Icon = link.icon;
          
          return (
            <Link
              key={link.path}
              href={link.path}
              prefetch={true}
              className={`relative flex flex-col items-center justify-center w-full py-2 px-1 transition-all duration-300 active:scale-90 ${
                isActive ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-indigo-500 rounded-b-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
              )}
              <Icon className={`w-6 h-6 mb-1 transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-medium tracking-wide transition-all ${isActive ? 'font-bold' : ''}`}>
                {link.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
