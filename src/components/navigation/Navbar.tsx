"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PublicUser } from "@/server/auth";
import { SearchModal } from "@/components/search/SearchModal";
import { NotificationBell } from "@/components/NotificationBell";
import { LogoutButton } from "@/components/LogoutButton";
import { BrandLogo } from "@/components/ui/BrandLogo";
import {
  Search,
  Heart,
  Plus,
  ShieldCheck,
  Compass,
  ChevronDown,
  MapPin,
  Tag,
  Layers,
} from "lucide-react";

interface NavbarProps {
  currentUser: PublicUser | null;
}

const NAV_CATEGORIES = [
  { name: "Market & Gıda", slug: "market" },
  { name: "Restoran & Kafe", slug: "restoran-kafe" },
  { name: "Elektronik & Teknoloji", slug: "elektronik" },
  { name: "Giyim & Moda", slug: "giyim" },
  { name: "Ev & Yaşam", slug: "ev-yasam" },
  { name: "Otomotiv & Araç", slug: "otomotiv" },
  { name: "Kozmetik & Bakım", slug: "kozmetik" },
  { name: "Bebek & Çocuk", slug: "bebek" },
  { name: "Spor & Outdoor", slug: "spor" },
];

const CITIES = [
  { name: "Lefkoşa", slug: "lefkosa" },
  { name: "Girne", slug: "girne" },
  { name: "Gazimağusa", slug: "gazimagusa" },
  { name: "Güzelyurt", slug: "guzelyurt" },
  { name: "İskele", slug: "iskele" },
  { name: "Lefke", slug: "lefke" },
];

export function Navbar({ currentUser }: NavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isRegionMenuOpen, setIsRegionMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 py-2.5">
          {/* Sol: Logo & Navigasyon Menüleri */}
          <div className="flex items-center gap-6">
            <Link href="/" className="shrink-0">
              <BrandLogo size="md" />
            </Link>

            {/* Desktop Nav Linkleri */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                href="/"
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  pathname === "/"
                    ? "bg-slate-100 text-slate-950"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <Compass className="h-3.5 w-3.5 text-slate-400" />
                Fırsatları Keşfet
              </Link>

              <Link
                href="/harita"
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  pathname === "/harita"
                    ? "bg-slate-100 text-slate-950"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <MapPin className="h-3.5 w-3.5 text-amber-600" />
                Harita
              </Link>

              {/* Kategoriler Açılır Menüsü */}
              <div
                className="relative"
                onMouseEnter={() => setIsCategoryMenuOpen(true)}
                onMouseLeave={() => setIsCategoryMenuOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-950 transition cursor-pointer"
                >
                  <Layers className="h-3.5 w-3.5 text-slate-400" />
                  Kategoriler
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                {isCategoryMenuOpen && (
                  <div className="absolute left-0 top-full mt-1 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg z-50 animate-in fade-in zoom-in-95">
                    <div className="text-[11px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                      Kategoriler
                    </div>
                    {NAV_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/?category=${cat.slug}`}
                        onClick={() => setIsCategoryMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition"
                      >
                        <Tag className="h-3.5 w-3.5 text-amber-600" />
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Bölgeler Açılır Menüsü */}
              <div
                className="relative"
                onMouseEnter={() => setIsRegionMenuOpen(true)}
                onMouseLeave={() => setIsRegionMenuOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setIsRegionMenuOpen(!isRegionMenuOpen)}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-950 transition cursor-pointer"
                >
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  Bölgeler
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                {isRegionMenuOpen && (
                  <div className="absolute left-0 top-full mt-1 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg z-50 animate-in fade-in zoom-in-95">
                    <Link
                      href="/"
                      onClick={() => setIsRegionMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 transition"
                    >
                      <MapPin className="h-3.5 w-3.5 text-amber-600" />
                      📍 Tüm Kıbrıs
                    </Link>
                    <div className="border-t border-slate-100 my-1"></div>
                    {CITIES.map((city) => (
                      <Link
                        key={city.slug}
                        href={`/?location=${city.slug}`}
                        onClick={() => setIsRegionMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition"
                      >
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {city.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Orta: Hızlı Arama Butonu */}
          <div className="flex-1 max-w-sm hidden md:block">
            <button
              onClick={() => setIsSearchOpen(true)}
              type="button"
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/90 px-3.5 py-2 text-xs font-medium text-slate-500 hover:border-slate-300 hover:bg-white transition shadow-2xs cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-400" />
                <span>Fırsat veya ürün ara...</span>
              </span>
              <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-500">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Sağ: İkonlar & Butonlar */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Mobil Arama İkonu */}
            <button
              onClick={() => setIsSearchOpen(true)}
              type="button"
              aria-label="Ara"
              className="flex h-9 w-9 md:hidden items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 transition"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Favoriler Butonu */}
            <Link
              href="/favoriler"
              aria-label="Favorilerim"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-rose-600 transition active:scale-95"
              title="Favorilerim"
            >
              <Heart className="h-4 w-4" />
            </Link>

            {/* Bildirim Çanı */}
            {currentUser && <NotificationBell />}

            {/* + Fırsat Paylaş CTA */}
            <Link
              href="/firsat/yeni"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 active:scale-95 transition"
            >
              <Plus className="h-3.5 w-3.5 text-amber-400" />
              Fırsat Paylaş
            </Link>

            {/* Kullanıcı Giriş / Profil Menüsü */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <Link
                  href="/profil"
                  className="flex items-center gap-2 rounded-xl py-1 px-2 text-xs font-bold text-slate-900 hover:bg-slate-100 transition"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-950 text-white font-black text-xs shadow-2xs">
                    {currentUser.displayName.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden xl:inline max-w-[100px] truncate">
                    {currentUser.displayName}
                  </span>
                </Link>

                {currentUser.role === "admin" && (
                  <Link
                    href="/admin"
                    title="Yönetim Paneli"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition"
                  >
                    <ShieldCheck className="h-4 w-4 text-amber-700" />
                  </Link>
                )}

                <LogoutButton />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 pl-1">
                <Link
                  href="/giris"
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 transition shadow-2xs"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/kayit"
                  className="hidden md:inline-flex rounded-xl bg-slate-950 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shadow-2xs"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ⌘K Arama Modalı */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
