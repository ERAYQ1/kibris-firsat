import Link from "next/link";
import { ShieldCheck, Heart } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white pt-12 pb-16 text-slate-600 text-xs">
      <div className="mx-auto max-w-6xl px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Kolon 1: Marka */}
        <div className="space-y-3">
          <Link href="/" className="inline-block">
            <BrandLogo size="md" />
          </Link>
          <p className="text-slate-500 leading-relaxed">
            Kuzey Kıbrıs genelindeki en güncel market, restoran, elektronik ve hizmet fırsatlarını
            keşfedin, tasarruf edin ve toplulukla paylaşın.
          </p>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Topluluk & Editör Doğrulamalı
          </div>
        </div>

        {/* Kolon 2: Bölgeler */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            Bölgelere Göre Fırsatlar
          </h4>
          <ul className="space-y-1.5">
            <li>
              <Link href="/?location=lefkosa" className="hover:text-slate-950 hover:underline">
                Lefkoşa Fırsatları
              </Link>
            </li>
            <li>
              <Link href="/?location=girne" className="hover:text-slate-950 hover:underline">
                Girne Fırsatları
              </Link>
            </li>
            <li>
              <Link href="/?location=gazimagusa" className="hover:text-slate-950 hover:underline">
                Gazimağusa Fırsatları
              </Link>
            </li>
            <li>
              <Link href="/?location=guzelyurt" className="hover:text-slate-950 hover:underline">
                Güzelyurt Fırsatları
              </Link>
            </li>
            <li>
              <Link href="/?location=iskele" className="hover:text-slate-950 hover:underline">
                İskele Fırsatları
              </Link>
            </li>
            <li>
              <Link href="/?location=lefke" className="hover:text-slate-950 hover:underline">
                Lefke Fırsatları
              </Link>
            </li>
          </ul>
        </div>

        {/* Kolon 3: Popüler Kategoriler */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            Popüler Kategoriler
          </h4>
          <ul className="space-y-1.5">
            <li>
              <Link href="/?category=market" className="hover:text-slate-950 hover:underline">
                Süpermarket & Gıda
              </Link>
            </li>
            <li>
              <Link href="/?category=restoran" className="hover:text-slate-950 hover:underline">
                Restoran & Kafe
              </Link>
            </li>
            <li>
              <Link href="/?category=elektronik" className="hover:text-slate-950 hover:underline">
                Elektronik & Teknoloji
              </Link>
            </li>
            <li>
              <Link href="/?category=giyim" className="hover:text-slate-950 hover:underline">
                Giyim & Moda
              </Link>
            </li>
            <li>
              <Link href="/?category=otomotiv" className="hover:text-slate-950 hover:underline">
                Otomotiv & Yakıt
              </Link>
            </li>
          </ul>
        </div>

        {/* Kolon 4: Hızlı Bağlantılar */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            Kıbrıs Fırsat
          </h4>
          <ul className="space-y-1.5">
            <li>
              <Link href="/firsat/yeni" className="font-semibold text-amber-700 hover:underline">
                + Fırsat Paylaş
              </Link>
            </li>
            <li>
              <Link href="/favoriler" className="hover:text-slate-950 hover:underline">
                Favorilerim
              </Link>
            </li>
            <li>
              <Link href="/profil" className="hover:text-slate-950 hover:underline">
                Profilim
              </Link>
            </li>
            <li>
              <Link href="/giris" className="hover:text-slate-950 hover:underline">
                Giriş Yap
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
        <p>© 2026 Kıbrıs Fırsat. Tüm hakları saklıdır.</p>
        <p className="flex items-center gap-1">
          Kıbrıs topluluğu için <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> ile geliştirildi.
        </p>
      </div>
    </footer>
  );
}
