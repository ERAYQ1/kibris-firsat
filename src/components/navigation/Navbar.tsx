"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PublicUser } from "@/server/auth";
import { SearchModal } from "@/components/search/SearchModal";
import { LocationSelector } from "@/components/location/LocationSelector";
import { NotificationBell } from "@/components/NotificationBell";
import { LogoutButton } from "@/components/LogoutButton";
import {
  Flame,
  Search,
  Heart,
  Plus,
  ShieldCheck,
  Compass,
} from "lucide-react";

interface NavbarProps {
  currentUser: PublicUser | null;
}

export function Navbar({ currentUser }: NavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          {/* Sol: Logo & Marka */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm transition group-hover:scale-105">
                <Flame className="h-5 w-5 fill-amber-500 text-amber-500" />
              </span>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tight text-slate-950 leading-tight">
                  Kıbrıs Fırsat
                </span>
                <span className="text-[10px] font-semibold text-amber-700 tracking-wider uppercase">
                  Kuzey Kıbrıs
                </span>
              </div>
            </Link>

            <div className="hidden lg:block">
              <LocationSelector />
            </div>
          </div>

          {/* Orta: Arama Barı Tetikleyicisi */}
          <div className="flex-1 max-w-md hidden md:block">
            <button
              onClick={() => setIsSearchOpen(true)}
              type="button"
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-xs font-medium text-slate-400 hover:border-slate-300 hover:bg-white transition shadow-2xs"
            >
              <span className="flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-400" />
                <span>Ne arıyorsun? (iPhone, pizza, market...)</span>
              </span>
              <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Sağ: Linkler & Aksiyonlar */}
          <div className="flex items-center gap-2.5">
            {/* Mobil Arama İkonu */}
            <button
              onClick={() => setIsSearchOpen(true)}
              type="button"
              aria-label="Ara"
              className="flex h-9 w-9 md:hidden items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Keşfet Linki */}
            <Link
              href="/"
              className={`hidden sm:inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                pathname === "/"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Compass className="h-3.5 w-3.5 text-slate-400" />
              Keşfet
            </Link>

            {/* Favoriler Butonu */}
            <Link
              href="/favoriler"
              aria-label="Favorilerim"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-rose-600 transition active:scale-95"
            >
              <Heart className="h-4 w-4 text-slate-500 hover:text-rose-500" />
            </Link>

            {/* Bildirim Zili */}
            {currentUser && <NotificationBell />}

            {/* Fırsat Paylaş CTA */}
            <Link
              href="/firsat/yeni"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-sm transition hover:bg-amber-400 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              Fırsat Paylaş
            </Link>

            {/* Kullanıcı Durumu */}
            {currentUser ? (
              <div className="flex items-center gap-2 border-l border-slate-200 pl-2.5">
                {currentUser.role === "admin" && (
                  <Link
                    href="/admin"
                    title="Yönetim Paneli"
                    className="hidden sm:inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-800 border border-amber-200/80 hover:bg-amber-100 transition"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                    Admin
                  </Link>
                )}

                <Link
                  href="/profil"
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-[10px] font-bold text-white">
                    {currentUser.displayName.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="hidden md:inline-block max-w-[90px] truncate">
                    {currentUser.displayName}
                  </span>
                </Link>

                <LogoutButton />
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-slate-200 pl-2.5">
                <Link
                  href="/giris"
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Giriş
                </Link>
                <Link
                  href="/kayit"
                  className="rounded-xl bg-slate-950 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 transition"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Arama Modalı */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
