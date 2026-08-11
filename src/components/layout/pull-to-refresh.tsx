"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const startY = useRef(0);
  const currentY = useRef(0);

  const THRESHOLD = 80;

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY.current === 0 || isRefreshing) return;
      
      currentY.current = e.touches[0].clientY;
      const pullDistance = currentY.current - startY.current;

      if (pullDistance > 0 && window.scrollY === 0) {
        setIsPulling(true);
        setPullProgress(Math.min(pullDistance / THRESHOLD, 1));
        
        // Prevent default scrolling when pulling
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;
      
      const pullDistance = currentY.current - startY.current;
      
      if (pullDistance >= THRESHOLD) {
        setIsRefreshing(true);
        setIsPulling(false);
        setPullProgress(1);
        
        // Refresh page natively
        window.location.reload();
      } else {
        setIsPulling(false);
        setPullProgress(0);
      }
      
      startY.current = 0;
      currentY.current = 0;
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isRefreshing, isPulling]);

  return (
    <div className="relative min-h-screen w-full flex flex-col">
      {/* Pull indicator */}
      <div 
        className={`absolute top-0 left-0 right-0 z-50 flex justify-center overflow-hidden transition-all duration-300 ease-out`}
        style={{
          height: isRefreshing ? '60px' : isPulling ? `${pullProgress * 60}px` : '0px',
          opacity: isRefreshing || isPulling ? 1 : 0
        }}
      >
        <div className="mt-4 bg-slate-800/80 backdrop-blur-md rounded-full shadow-lg p-2.5 flex items-center justify-center border border-white/10">
          <Loader2 
            className={`w-5 h-5 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} 
            style={{ transform: !isRefreshing ? `rotate(${pullProgress * 360}deg)` : 'none' }}
          />
        </div>
      </div>
      
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
