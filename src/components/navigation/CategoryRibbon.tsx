"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  ShoppingBag,
  UtensilsCrossed,
  Laptop,
  Shirt,
  Package,
  Sparkle,
  Baby,
  Dumbbell,
  Car,
  Tag,
} from "lucide-react";

interface CategoryRibbonProps {
  categories: { id: number; slug: string; name: string; sortOrder?: number; dealsCount?: number }[];
  totalDealsCount?: number;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  market: <ShoppingBag className="h-4 w-4 text-emerald-600" />,
  "restoran-kafe": <UtensilsCrossed className="h-4 w-4 text-amber-600" />,
  elektronik: <Laptop className="h-4 w-4 text-blue-600" />,
  giyim: <Shirt className="h-4 w-4 text-purple-600" />,
  "ev-yasam": <Package className="h-4 w-4 text-teal-600" />,
  kozmetik: <Sparkle className="h-4 w-4 text-rose-600" />,
  bebek: <Baby className="h-4 w-4 text-pink-600" />,
  spor: <Dumbbell className="h-4 w-4 text-indigo-600" />,
  otomotiv: <Car className="h-4 w-4 text-slate-700" />,
};

export function CategoryRibbon({ categories, totalDealsCount }: CategoryRibbonProps) {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "";

  function createCategoryUrl(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    params.delete("page"); // reset pagination
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  return (
    <div className="border-b border-slate-200/80 bg-white shadow-2xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar scroll-smooth">
          {/* Tümü Sekmesi */}
          <Link
            href={createCategoryUrl("")}
            className={`inline-flex items-center gap-1.5 shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              !currentCategory
                ? "bg-slate-950 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            }`}
          >
            <Sparkles className={`h-3.5 w-3.5 ${!currentCategory ? "text-amber-400" : "text-slate-400"}`} />
            <span>Tüm Fırsatlar</span>
            {totalDealsCount !== undefined && (
              <span
                className={`ml-0.5 rounded-md px-1.5 py-0.2 text-[10px] font-extrabold ${
                  !currentCategory ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {totalDealsCount}
              </span>
            )}
          </Link>

          {/* Kategoriler */}
          {categories.map((cat) => {
            const isSelected = currentCategory === cat.slug;
            const icon = CATEGORY_ICONS[cat.slug] || <Tag className="h-3.5 w-3.5 text-slate-400" />;

            return (
              <Link
                key={cat.slug}
                href={createCategoryUrl(cat.slug)}
                className={`inline-flex items-center gap-1.5 shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  isSelected
                    ? "bg-slate-950 text-white shadow-xs font-bold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <span className={isSelected ? "text-amber-400" : ""}>{icon}</span>
                <span>{cat.name}</span>
                {cat.dealsCount !== undefined && cat.dealsCount > 0 && (
                  <span
                    className={`ml-0.5 rounded-md px-1.5 py-0.2 text-[10px] font-bold ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {cat.dealsCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
