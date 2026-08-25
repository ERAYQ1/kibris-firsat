import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getCurrentUser } from "@/server/current-user";
import { LogoutButton } from "@/components/LogoutButton";
import { NotificationBell } from "@/components/NotificationBell";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Toaster } from "sonner";
import { Flame, PlusCircle, ShieldCheck, Heart, User } from "lucide-react";

export const metadata: Metadata = {
  title: {
    default: "Kıbrıs Fırsat — Topluluk Destekli İndirim & Fiyat Keşif Platformu",
    template: "%s | Kıbrıs Fırsat",
  },
  description:
    "Kuzey Kıbrıs'taki market, restoran, kafe ve mağaza indirimlerini keşfedin, paylaşın ve toplulukla doğrulayın.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  return (
    <html lang="tr">
      <body className="min-h-screen flex flex-col bg-stone-50/50 text-stone-900 antialiased selection:bg-teal-100 selection:text-teal-900 pb-16 sm:pb-0">
        <Toaster richColors position="top-right" />
        <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/95 backdrop-blur-xs">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-black tracking-tight text-teal-800">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white shadow-2xs">
                <Flame className="h-5 w-5 fill-white" />
              </span>
              <span>Kıbrıs Fırsat</span>
            </Link>

            <nav className="flex items-center gap-3 text-sm">
              <Link href="/" className="font-medium text-stone-600 transition hover:text-stone-900 hidden sm:inline-block">
                Fırsatlar
              </Link>
              <Link
                href="/firsat/yeni"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3.5 py-1.5 font-semibold text-white shadow-2xs transition hover:bg-teal-800 active:scale-[0.98]"
              >
                <PlusCircle className="h-4 w-4" />
                Fırsat Paylaş
              </Link>

              {user ? (
                <div className="flex items-center gap-2.5 sm:border-l sm:border-stone-200 sm:pl-3">
                  <Link
                    href="/favoriler"
                    aria-label="Favorilerim"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 transition hover:border-stone-300 hover:bg-stone-50 active:scale-95 shadow-2xs"
                  >
                    <Heart className="h-4 w-4 text-rose-500" />
                  </Link>

                  <NotificationBell />

                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="hidden sm:inline-flex items-center gap-1 font-medium text-amber-700 hover:text-amber-800 text-xs bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Yönetim
                    </Link>
                  )}

                  <Link
                    href="/profil"
                    className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 shadow-2xs"
                  >
                    <User className="h-3.5 w-3.5 text-teal-700" />
                    <span className="hidden md:inline-block max-w-[100px] truncate">{user.displayName}</span>
                  </Link>

                  <LogoutButton />
                </div>
              ) : (
                <div className="flex items-center gap-2 border-l border-stone-200 pl-3">
                  <Link
                    href="/giris"
                    className="font-medium text-stone-600 transition hover:text-stone-900"
                  >
                    Giriş
                  </Link>
                  <Link
                    href="/kayit"
                    className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 font-semibold text-stone-800 shadow-2xs transition hover:bg-stone-50"
                  >
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-7">{children}</main>

        <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500 hidden sm:block">
          <div className="mx-auto max-w-5xl px-4">
            <p className="font-semibold text-stone-700">Kıbrıs Fırsat</p>
            <p className="mt-1 text-stone-400">
              Kuzey Kıbrıs genelindeki market, restoran ve mağazalarda topluluk tarafından paylaşılan fırsat keşif platformu.
            </p>
          </div>
        </footer>

        <MobileBottomNav />
      </body>
    </html>
  );
}
