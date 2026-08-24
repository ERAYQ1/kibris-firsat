import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getCurrentUser } from "@/server/current-user";
import { LogoutButton } from "@/components/LogoutButton";

export const metadata: Metadata = {
  title: {
    default: "Kıbrıs Fırsat — Topluluk destekli fırsat platformu",
    template: "%s | Kıbrıs Fırsat",
  },
  description:
    "Kıbrıs'ta uygun fiyatlı ürün ve hizmetleri keşfedin, paylaşın, toplulukla doğrulayın.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  return (
    <html lang="tr">
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="text-lg font-bold tracking-tight text-teal-800">
              Kıbrıs Fırsat
            </Link>
            <nav className="flex items-center gap-3 text-sm">
              <Link href="/" className="text-stone-600 hover:text-stone-900">
                Fırsatlar
              </Link>
              <Link
                href="/firsat/yeni"
                className="rounded-md bg-teal-700 px-3 py-1.5 font-medium text-white hover:bg-teal-800"
              >
                Fırsat Paylaş
              </Link>
              {user ? (
                <>
                  {user.role === "admin" && (
                    <Link href="/admin" className="text-stone-600 hover:text-stone-900">
                      Yönetim
                    </Link>
                  )}
                  <span className="text-stone-500">{user.displayName}</span>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link href="/giris" className="text-stone-600 hover:text-stone-900">
                    Giriş
                  </Link>
                  <Link href="/kayit" className="text-stone-600 hover:text-stone-900">
                    Kayıt Ol
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
        <footer className="border-t border-stone-200 bg-white py-4 text-center text-xs text-stone-400">
          Kıbrıs Fırsat — topluluk destekli fiyat keşif platformu
        </footer>
      </body>
    </html>
  );
}
