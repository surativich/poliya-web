import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin relative z-10" />
      </div>
      <p className="text-sm font-medium text-slate-400 animate-pulse">Ma'lumotlar yuklanmoqda...</p>
    </div>
  );
}
