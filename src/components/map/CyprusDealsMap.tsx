"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Store as StoreIcon,
  Phone,
  ArrowUpRight,
  ExternalLink,
  Flame,
  CheckCircle2,
  Navigation,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

export interface MapStoreItem {
  id: number;
  name: string;
  locationName: string;
  locationSlug: string;
  address: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  isVerified: boolean;
  deals: {
    id: number;
    title: string;
    priceCents: number;
    originalPriceCents: number | null;
    currency: "TRY" | "GBP" | "EUR";
    categoryName: string;
    categorySlug: string;
    couponCode?: string | null;
  }[];
}

interface CyprusDealsMapProps {
  stores: MapStoreItem[];
  locations: { id: number; slug: string; name: string }[];
}

export function CyprusDealsMap({ stores, locations }: CyprusDealsMapProps) {
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(
    stores.length > 0 ? stores[0].id : null
  );

  const filteredStores = stores.filter((s) => {
    if (selectedCity && s.locationSlug !== selectedCity) return false;
    return true;
  });

  const selectedStore = stores.find((s) => s.id === selectedStoreId) || filteredStores[0];

  // Kıbrıs koordinatlarını (32.8 - 34.6 boylam, 35.0 - 35.5 enlem) SVG viewport'una (800x400) projeksiyon dönüştürücüsü
  function projectCoordinates(lat: number | null, lng: number | null) {
    if (!lat || !lng) return { x: 400, y: 200 };
    // Kuzey Kıbrıs koordinat sınırları
    const minLng = 32.75;
    const maxLng = 34.65;
    const minLat = 35.05;
    const maxLat = 35.45;

    const x = ((lng - minLng) / (maxLng - minLng)) * 740 + 30;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 320 + 40;
    return { x: Math.max(30, Math.min(770, x)), y: Math.max(30, Math.min(370, y)) };
  }

  return (
    <div className="space-y-6">
      {/* 1. Şehir / Bölge Seçim Butonları */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setSelectedCity("");
            if (stores.length > 0) setSelectedStoreId(stores[0].id);
          }}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
            !selectedCity
              ? "bg-slate-950 text-white shadow-xs"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <MapPin className="h-3.5 w-3.5 text-amber-400" />
          <span>Tüm Kıbrıs ({stores.length} Mağaza)</span>
        </button>

        {locations.map((loc) => {
          const count = stores.filter((s) => s.locationSlug === loc.slug).length;
          const isSelected = selectedCity === loc.slug;
          return (
            <button
              key={loc.slug}
              type="button"
              onClick={() => {
                setSelectedCity(loc.slug);
                const firstInCity = stores.find((s) => s.locationSlug === loc.slug);
                if (firstInCity) setSelectedStoreId(firstInCity.id);
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                isSelected
                  ? "bg-slate-950 text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>{loc.name}</span>
              <span
                className={`rounded-md px-1.5 py-0.2 text-[10px] font-extrabold ${
                  isSelected ? "bg-slate-800 text-amber-300" : "bg-slate-100 text-slate-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Harita & Detay Kartı Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* SOL: İNTERAKTİF KUZEY KIBRIS VEKTÖR HARİTASI (lg:col-span-8) */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-200/90 bg-gradient-to-b from-sky-50/40 to-slate-100/60 p-4 sm:p-6 shadow-2xs relative overflow-hidden">
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-950 text-white">
                <Navigation className="h-4 w-4 text-amber-400" />
              </span>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-950">
                  Kuzey Kıbrıs Fırsat Haritası
                </h3>
                <p className="text-[11px] text-slate-500">
                  Mağazaları ve fırsatları keşfetmek için harita üzerindeki pinlere tıklayın
                </p>
              </div>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
              <CheckCircle2 className="h-3 w-3" />
              Canlı Konumlar
            </span>
          </div>

          {/* SVG Kıbrıs Adası Silüeti ve Pinler */}
          <div className="relative w-full aspect-[2/1] rounded-2xl bg-white/80 border border-slate-200 shadow-inner overflow-hidden flex items-center justify-center">
            
            <svg
              viewBox="0 0 800 400"
              className="w-full h-full select-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="island-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E2E8F0" />
                  <stop offset="100%" stopColor="#CBD5E1" />
                </linearGradient>
                <filter id="pin-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.3" />
                </filter>
              </defs>

              {/* Akdeniz Dalgaları Arkaplan İzi */}
              <path
                d="M 50,50 Q 200,80 400,40 T 750,60 M 30,350 Q 250,380 500,340 T 770,360"
                stroke="#E0F2FE"
                strokeWidth="1.5"
                fill="none"
              />

              {/* Kuzey Kıbrıs Şematik Ada Silüeti (Lefke'den Karpaz Burnuna) */}
              <path
                d="M 60,250 
                   C 100,240 120,220 160,210 
                   C 200,180 260,170 320,165 
                   C 400,160 480,180 540,190 
                   C 600,160 670,120 730,90 
                   C 765,70 775,85 750,110 
                   C 700,150 630,190 570,220 
                   C 540,250 510,270 460,270 
                   C 400,280 340,270 280,260 
                   C 220,260 170,275 120,280 
                   Z"
                fill="url(#island-grad)"
                stroke="#94A3B8"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />

              {/* Bölge Etiketleri */}
              <text x="140" y="270" fill="#64748B" fontSize="12" fontWeight="bold">Lefke</text>
              <text x="210" y="225" fill="#64748B" fontSize="12" fontWeight="bold">Güzelyurt</text>
              <text x="310" y="160" fill="#64748B" fontSize="13" fontWeight="900">Girne</text>
              <text x="340" y="240" fill="#475569" fontSize="13" fontWeight="900">Lefkoşa</text>
              <text x="490" y="235" fill="#64748B" fontSize="13" fontWeight="900">Gazimağusa</text>
              <text x="560" y="180" fill="#64748B" fontSize="12" fontWeight="bold">İskele</text>
              <text x="680" y="120" fill="#94A3B8" fontSize="11" fontWeight="bold">Karpaz</text>

              {/* Mağaza Pinleri */}
              {filteredStores.map((st) => {
                const pos = projectCoordinates(st.latitude, st.longitude);
                const isSelected = selectedStore?.id === st.id;
                const dealCount = st.deals.length;

                return (
                  <g
                    key={st.id}
                    className="cursor-pointer transition-transform duration-200"
                    onClick={() => setSelectedStoreId(st.id)}
                    transform={`translate(${pos.x}, ${pos.y})`}
                  >
                    {/* Seçili Pin Efekti (Radyal Halka) */}
                    {isSelected && (
                      <circle
                        r="18"
                        className="animate-ping fill-amber-400/40"
                      />
                    )}

                    {/* Pin Gövdesi */}
                    <circle
                      r={isSelected ? "14" : "11"}
                      fill={isSelected ? "#0F172A" : "#EA580C"}
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      filter="url(#pin-glow)"
                    />

                    {/* Pin İçi İkon veya Fırsat Sayısı */}
                    <text
                      y="4"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize={isSelected ? "10" : "9"}
                      fontWeight="900"
                    >
                      {dealCount > 0 ? dealCount : "★"}
                    </text>

                    {/* Hover & Seçili Mağaza İsim Etiketi */}
                    <g transform="translate(0, -22)">
                      <rect
                        x="-45"
                        y="-14"
                        width="90"
                        height="18"
                        rx="6"
                        fill={isSelected ? "#0F172A" : "#FFFFFF"}
                        stroke={isSelected ? "#F59E0B" : "#CBD5E1"}
                        strokeWidth="1"
                      />
                      <text
                        y="-2"
                        textAnchor="middle"
                        fill={isSelected ? "#FFFFFF" : "#1E293B"}
                        fontSize="9"
                        fontWeight="bold"
                      >
                        {st.name.length > 13 ? st.name.slice(0, 11) + ".." : st.name}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-950 border border-amber-400" />
              Seçili İşletme
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-600" />
              Aktif İndirimli Mağaza
            </span>
          </div>
        </div>

        {/* SAĞ: SEÇİLİ İŞLETME VE FIRSATLARI (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedStore ? (
            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
              
              {/* İşletme Başlığı & Konum */}
              <div className="border-b border-slate-100 pb-3.5 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
                      <MapPin className="h-3 w-3" />
                      {selectedStore.locationName}
                    </span>
                    <h2 className="text-base font-black text-slate-950 leading-snug">
                      {selectedStore.name}
                    </h2>
                  </div>
                  {selectedStore.isVerified && <VerifiedBadge />}
                </div>

                {selectedStore.address && (
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {selectedStore.address}
                  </p>
                )}

                {selectedStore.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <span>{selectedStore.phone}</span>
                  </div>
                )}
              </div>

              {/* Mağazadaki Aktif Fırsatlar Listesi */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 text-amber-600" />
                    Aktif Fırsatlar
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                    {selectedStore.deals.length} Fırsat
                  </span>
                </div>

                {selectedStore.deals.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    Bu işletmede şu an aktif fırsat bulunmuyor.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {selectedStore.deals.map((deal) => {
                      const discount = deal.originalPriceCents
                        ? Math.round(
                            ((deal.originalPriceCents - deal.priceCents) /
                              deal.originalPriceCents) *
                              100
                          )
                        : null;

                      return (
                        <Link
                          key={deal.id}
                          href={`/firsat/${deal.id}`}
                          className="group block rounded-2xl border border-slate-100 bg-slate-50/70 p-3 hover:border-slate-300 hover:bg-white transition shadow-2xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-slate-500">
                              {deal.categoryName}
                            </span>
                            {discount && discount > 0 && (
                              <span className="rounded-md bg-rose-600 px-1.5 py-0.2 text-[10px] font-black text-white">
                                -%{discount}
                              </span>
                            )}
                          </div>

                          <h4 className="mt-1 text-xs font-bold text-slate-900 line-clamp-2 group-hover:text-amber-700 transition">
                            {deal.title}
                          </h4>

                          <div className="mt-2 flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                            <span className="font-black text-slate-950">
                              {formatCurrency(deal.priceCents, deal.currency)}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 group-hover:translate-x-0.5 transition">
                              <span>İncele</span>
                              <ArrowUpRight className="h-3 w-3" />
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Mağaza Sayfasına Git Butonu */}
              <Link
                href={`/magaza/${selectedStore.id}`}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-950 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition shadow-xs"
              >
                <StoreIcon className="h-3.5 w-3.5 text-amber-400" />
                <span>İşletme Sayfasına Git</span>
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </Link>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              Harita üzerinden bir işletme seçin.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
