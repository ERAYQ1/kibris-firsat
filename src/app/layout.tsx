import type { Metadata } from "next";
import "./globals.css";
import { getCurrentUser } from "@/server/current-user";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "Kıbrıs Fırsat — Kuzey Kıbrıs İndirim & Fiyat Keşif Platformu",
    template: "%s | Kıbrıs Fırsat",
  },
  description:
    "Kuzey Kıbrıs genelindeki market, restoran, kafe ve teknoloji indirimlerini keşfedin, tasarruf edin ve toplulukla paylaşın.",
  openGraph: {
    title: "Kıbrıs Fırsat — Kuzey Kıbrıs Fırsat Keşif Platformu",
    description: "Kıbrıs'taki market, restoran ve mağaza indirimleri tek platformda.",
    siteName: "Kıbrıs Fırsat",
    locale: "tr_TR",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <html lang="tr">
      <body className="min-h-screen flex flex-col bg-slate-50/60 text-slate-900 antialiased selection:bg-amber-100 selection:text-amber-950 pb-16 sm:pb-0 font-sans">
        <Toaster richColors position="top-right" />
        
        {/* Global Navbar */}
        <Navbar currentUser={user} />

        {/* Ana İçerik */}
        <main className="flex-1 w-full">{children}</main>

        {/* Global Footer */}
        <Footer />

        {/* Mobil Bottom Nav */}
        <MobileBottomNav />
      </body>
    </html>
  );
}
