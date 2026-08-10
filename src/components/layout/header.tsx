import { Bell, Menu, Search } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 text-slate-400 hover:text-white transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center gap-2 text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50 focus-within:border-indigo-500/50 focus-within:text-slate-300 transition-colors">
          <Search className="w-4 h-4" />
          <input 
            type="text" 
            placeholder="Qidirish..." 
            className="bg-transparent border-none outline-none text-sm w-64 placeholder:text-slate-500"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
