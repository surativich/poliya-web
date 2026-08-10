"use client";

import { QrCode, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export function QRCodesClient({ resources }: { resources: any[] }) {
  
  const getUrl = (id: string) => {
    // Localhost in dev, actual domain in prod
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/view/${id}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <QrCode className="w-6 h-6 text-indigo-400" />
            QR Kodlar
          </h2>
          <p className="text-sm text-slate-400 mt-1">Har bir stol/stadion uchun QR kod generatsiyasi. Ularni chop etib yopishtiring.</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Printer className="w-4 h-4" />
          Barchasini chop etish
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {resources.map((resource) => (
          <div key={resource.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center hover:border-slate-700 transition-colors">
            <h3 className="text-lg font-bold text-white mb-1">{resource.name}</h3>
            <p className="text-xs text-slate-400 mb-6">{resource.type === 'stadium' ? 'Stadion' : 'Bilyard'}</p>
            
            <div className="bg-white p-4 rounded-xl mb-6 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <QRCodeSVG 
                value={getUrl(resource.id)} 
                size={160}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"L"}
                includeMargin={false}
              />
            </div>
            
            <div className="text-xs text-slate-500 font-mono bg-slate-950 px-3 py-2 rounded-md break-all w-full select-all">
              {getUrl(resource.id)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
