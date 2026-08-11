"use client";

import { useState, useEffect } from "react";
import { LockScreen } from "./lock-screen";

export function AuthProvider({ children, settings }: { children: React.ReactNode, settings: any }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check auth status
    const authRole = sessionStorage.getItem("poliya_auth");
    if (authRole) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleUnlock = (role: string) => {
    setIsAuthenticated(true);
  };

  if (isAuthenticated === null) {
    // Loading state
    return <div className="fixed inset-0 bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!isAuthenticated) {
    return <LockScreen settings={settings} onUnlock={handleUnlock} />;
  }

  return <>{children}</>;
}
