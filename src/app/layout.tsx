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
      <body className={`bg-slate-950 text-slate-50 min-h-screen flex antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}
