import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Biznes Boshqaruv | POS System",
  description: "Stadion va Bilyard boshqaruvi tizimi",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className="dark">
      <body className="bg-[#0a0a0a] text-slate-50 min-h-screen flex flex-col antialiased font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        <main className="flex-1 w-full max-w-md mx-auto relative bg-[#0a0a0a] shadow-2xl min-h-screen pb-[env(safe-area-inset-bottom,0px)]">
          {children}
        </main>
      </body>
    </html>
  );
}
