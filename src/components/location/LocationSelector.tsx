"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, ChevronDown, Check } from "lucide-react";

export const CITIES = [
  { name: "Tüm Kıbrıs", slug: "" },
  { name: "Lefkoşa", slug: "lefkosa" },
  { name: "Girne", slug: "girne" },
  { name: "Gazimağusa", slug: "gazimagusa" },
  { name: "Güzelyurt", slug: "guzelyurt" },
  { name: "İskele", slug: "iskele" },
  { name: "Lefke", slug: "lefke" },
];

export function LocationSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCitySlug = searchParams.get("location") || "";

  const selectedCity = CITIES.find((c) => c.slug === currentCitySlug) || CITIES[0];

  function handleSelectCity(slug: string) {
    setIsOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("location", slug);
    } else {
      params.delete("location");
    }
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-300 hover:bg-slate-50 transition"
      >
        <MapPin className="h-3.5 w-3.5 text-amber-600" />
        <span>{selectedCity.name}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 mt-1.5 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-xl z-40 animate-in fade-in zoom-in-95 duration-100">
            {CITIES.map((city) => (
              <button
                key={city.slug}
                type="button"
                onClick={() => handleSelectCity(city.slug)}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                  currentCitySlug === city.slug
                    ? "bg-slate-950 text-white font-bold"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>{city.name}</span>
                {currentCitySlug === city.slug && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
