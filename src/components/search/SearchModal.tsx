"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, TrendingUp, Sparkles, Store, ArrowRight } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SEARCHES = [
  "iPhone 16",
  "Erülkü Market",
  "Eziç Burger",
  "Hellim",
  "5L Sıvı Yağ",
  "Kahve",
  "Pizza",
  "Benzin",
];

const POPULAR_CATEGORIES = [
  { name: "Market & Gıda", slug: "market" },
  { name: "Elektronik", slug: "elektronik" },
  { name: "Restoran & Kafe", slug: "restoran" },
  { name: "Giyim & Moda", slug: "giyim" },
  { name: "Otomotiv", slug: "otomotiv" },
];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleSearch(term: string) {
    if (!term.trim()) return;
    onClose();
    router.push(`/?q=${encodeURIComponent(term.trim())}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in duration-150">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5"
        >
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Fırsat, ürün veya mağaza adı yazın... (örn: iPhone, pizza, hellim)"
            autoFocus
            className="flex-1 text-base text-slate-900 placeholder:text-slate-400 outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            className="rounded-xl bg-slate-950 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition"
          >
            Ara
          </button>
        </form>

        {/* Önerilen Aramalar */}
        <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
          <div>
            <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
              Popüler Aramalar
            </h4>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleSearch(item)}
                  className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-950 hover:text-white hover:border-slate-950 transition"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Hızlı Kategori Seçimi
            </h4>
            <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {POPULAR_CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push(`/?category=${cat.slug}`);
                  }}
                  className="flex items-center justify-between rounded-xl border border-slate-200/80 p-2.5 text-xs font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition"
                >
                  <span className="flex items-center gap-2">
                    <Store className="h-3.5 w-3.5 text-slate-400" />
                    {cat.name}
                  </span>
                  <ArrowRight className="h-3 w-3 text-slate-300" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
