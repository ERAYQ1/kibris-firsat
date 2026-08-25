"use client";

import { useState } from "react";
import {
  Tag,
  Maximize2,
  X,
  ShoppingBag,
  UtensilsCrossed,
  Laptop,
  Shirt,
  Sparkle,
  Package,
  Car,
} from "lucide-react";

interface ImageItem {
  id: number;
  filename: string;
  sortOrder: number;
}

interface DealGalleryProps {
  title: string;
  categorySlug?: string;
  categoryName?: string;
  images: ImageItem[];
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  market: <ShoppingBag className="h-16 w-16 text-emerald-600/80 stroke-[1.5]" />,
  "restoran-kafe": <UtensilsCrossed className="h-16 w-16 text-amber-600/80 stroke-[1.5]" />,
  restoran: <UtensilsCrossed className="h-16 w-16 text-amber-600/80 stroke-[1.5]" />,
  elektronik: <Laptop className="h-16 w-16 text-blue-600/80 stroke-[1.5]" />,
  giyim: <Shirt className="h-16 w-16 text-purple-600/80 stroke-[1.5]" />,
  kozmetik: <Sparkle className="h-16 w-16 text-rose-600/80 stroke-[1.5]" />,
  "ev-yasam": <Package className="h-16 w-16 text-teal-600/80 stroke-[1.5]" />,
  otomotiv: <Car className="h-16 w-16 text-slate-600/80 stroke-[1.5]" />,
};

export function DealGallery({ title, categorySlug, categoryName, images }: DealGalleryProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!images || images.length === 0) {
    const icon = (categorySlug && CATEGORY_ICONS[categorySlug]) || (
      <Tag className="h-16 w-16 text-amber-600/80 stroke-[1.5]" />
    );

    return (
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-100 flex flex-col items-center justify-center text-slate-600 shadow-2xs p-6 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200/80">
          {icon}
        </div>
        <span className="mt-3 text-xs font-bold text-slate-900 tracking-wide uppercase">
          {categoryName || "Kıbrıs Fırsatı"}
        </span>
        <span className="text-[11px] text-slate-500 mt-0.5">Doğrulanmış Yerel Fırsat</span>
      </div>
    );
  }

  const currentImg = images[selectedIdx] || images[0];

  return (
    <div className="space-y-3">
      {/* Ana Büyük Görsel */}
      <div className="group relative aspect-4/3 w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-sm">
        <img
          src={`/api/images/${currentImg.filename}`}
          alt={title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105 cursor-pointer"
          onClick={() => setIsLightboxOpen(true)}
        />
        <button
          onClick={() => setIsLightboxOpen(true)}
          type="button"
          aria-label="Görseli Büyüt"
          className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950/80 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition hover:bg-slate-950 cursor-pointer shadow-sm"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Küçük Önizleme Şeridi */}
      {images.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setSelectedIdx(idx)}
              type="button"
              className={`relative aspect-4/3 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition cursor-pointer ${
                selectedIdx === idx
                  ? "border-slate-950 ring-2 ring-slate-950/20"
                  : "border-slate-200 opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={`/api/images/${img.filename}`}
                alt={`${title} - ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md animate-in fade-in">
          <button
            onClick={() => setIsLightboxOpen(false)}
            type="button"
            className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="max-h-[85vh] max-w-[90vw] overflow-hidden rounded-2xl shadow-2xl">
            <img
              src={`/api/images/${currentImg.filename}`}
              alt={title}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
