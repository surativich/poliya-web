import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { PullToRefresh } from "@/components/layout/pull-to-refresh";
import { getSystemSettings } from "@/actions/security.actions";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSystemSettings();

  return (
    <html lang="uz" className="dark">
      <body className="bg-[#0a0a0a] text-slate-50 min-h-screen flex flex-col antialiased font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overscroll-none">
        <main className="flex-1 w-full max-w-md mx-auto relative bg-[#0a0a0a] shadow-2xl min-h-screen pb-[env(safe-area-inset-bottom,0px)]">
          <AuthProvider settings={settings}>
            <PullToRefresh>
              {children}
            </PullToRefresh>
          </AuthProvider>
        </main>
      </body>
    </html>
  );
}
