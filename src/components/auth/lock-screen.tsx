"use client";

import { useState, useEffect } from "react";
import { Lock, Unlock, Phone, Shield, UserCog, Delete } from "lucide-react";

export function LockScreen({ settings, onUnlock }: { settings: any, onUnlock: (role: string) => void }) {
  const [pin, setPin] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [loginMode, setLoginMode] = useState<"cashier" | "admin">("cashier");
  const [adminPassword, setAdminPassword] = useState("");
  
  const MAX_ATTEMPTS = 3;
  const LOCKOUT_SECONDS = 15;

  useEffect(() => {
    // Check for existing lockout in localStorage
    const lockoutEnd = localStorage.getItem("poliya_lockout_end");
    if (lockoutEnd) {
      const remaining = Math.ceil((parseInt(lockoutEnd) - Date.now()) / 1000);
      if (remaining > 0) {
        setIsLocked(true);
        setLockoutTime(remaining);
      } else {
        localStorage.removeItem("poliya_lockout_end");
      }
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLocked && lockoutTime > 0) {
      timer = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setAttempts(0);
            localStorage.removeItem("poliya_lockout_end");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLocked, lockoutTime]);

  const handleFailedAttempt = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    if (newAttempts >= MAX_ATTEMPTS) {
      setIsLocked(true);
      setLockoutTime(LOCKOUT_SECONDS);
      localStorage.setItem("poliya_lockout_end", (Date.now() + LOCKOUT_SECONDS * 1000).toString());
    } else {
      // Vibrate if supported
      if (navigator.vibrate) navigator.vibrate(200);
    }
  };

  const handlePinInput = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      if (newPin.length === 4) {
        // Verify PIN
        if (newPin === (settings?.cashier_pin || "1111")) {
          // Success
          sessionStorage.setItem("poliya_auth", "cashier");
          onUnlock("cashier");
        } else {
          // Fail
          handleFailedAttempt();
          setTimeout(() => setPin(""), 300);
        }
      }
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === (settings?.admin_password || "@Samar18")) {
      sessionStorage.setItem("poliya_auth", "admin");
      onUnlock("admin");
    } else {
      handleFailedAttempt();
      setAdminPassword("");
    }
  };

  const handleCallAdmin = () => {
    window.location.href = `tel:${settings?.admin_phone || "+998901234567"}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
      
      <div className="mb-12 flex flex-col items-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-300 ${isLocked ? 'bg-rose-500/20 text-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.3)]' : 'bg-indigo-500/20 text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.2)]'}`}>
          {isLocked ? <Lock className="w-10 h-10" /> : <Shield className="w-10 h-10" />}
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Tizimga kirish</h1>
        <p className="text-slate-400 mt-2 text-sm text-center">
          {isLocked 
            ? "Xavfsizlik tizimi bloklandi!" 
            : loginMode === "cashier" ? "Kassir PIN kodini kiriting" : "Admin maxfiy parolini kiriting"}
        </p>
      </div>

      {isLocked ? (
        <div className="flex flex-col items-center w-full max-w-xs space-y-6">
          <div className="text-rose-500 font-mono text-5xl font-black tabular-nums">
            00:{lockoutTime.toString().padStart(2, '0')}
          </div>
          <p className="text-rose-400/80 text-sm text-center">
            Urunishlar soni tugadi. Iltimos, kuting yoki admin bilan bog'laning.
          </p>
          <button 
            onClick={handleCallAdmin}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-rose-500/20 mt-4"
          >
            <Phone className="w-5 h-5" /> Adminga qo'ng'iroq
          </button>
        </div>
      ) : (
        <div className="w-full max-w-xs">
          {loginMode === "cashier" ? (
            <div className="flex flex-col items-center">
              {/* PIN Dots */}
              <div className="flex gap-4 mb-10">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${i < pin.length ? 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]' : 'bg-slate-800'}`} />
                ))}
              </div>

              {/* Number Pad */}
              <div className="grid grid-cols-3 gap-4 w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handlePinInput(num.toString())}
                    className="h-16 rounded-full bg-slate-900 border border-slate-800 text-2xl font-semibold text-white active:bg-indigo-500/20 active:border-indigo-500/50 transition-all"
                  >
                    {num}
                  </button>
                ))}
                <div /> {/* Empty space */}
                <button
                  onClick={() => handlePinInput("0")}
                  className="h-16 rounded-full bg-slate-900 border border-slate-800 text-2xl font-semibold text-white active:bg-indigo-500/20 active:border-indigo-500/50 transition-all"
                >
                  0
                </button>
                <button
                  onClick={() => setPin(prev => prev.slice(0, -1))}
                  className="h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 active:bg-slate-800 transition-all"
                >
                  <Delete className="w-6 h-6" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAdminLogin} className="flex flex-col items-center w-full">
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Parolni kiriting..."
                className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl px-6 py-4 text-center text-xl text-white focus:border-indigo-500 outline-none transition-all tracking-widest"
                autoFocus
              />
              <button 
                type="submit"
                className="w-full bg-indigo-500 text-white py-4 rounded-2xl font-bold mt-6 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
              >
                Kirish
              </button>
            </form>
          )}
        </div>
      )}

      {/* Mode Switcher */}
      {!isLocked && (
        <div className="absolute bottom-10">
          <button 
            onClick={() => {
              setLoginMode(prev => prev === "cashier" ? "admin" : "cashier");
              setPin("");
              setAdminPassword("");
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {loginMode === "cashier" ? (
              <><UserCog className="w-4 h-4" /> Admin bo'lib kirish</>
            ) : (
              <><Unlock className="w-4 h-4" /> Kassir bo'lib kirish</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
