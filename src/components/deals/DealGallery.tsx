"use client";

import { useState } from "react";
import { Maximize2, X } from "lucide-react";
import { DealVisual } from "@/components/deals/DealVisual";

interface ImageItem {
  id: number;
  filename: string;
  sortOrder: number;
}

interface DealGalleryProps {
  title: string;
  categorySlug?: string;
  categoryName?: string;
  storeName?: string;
  images: ImageItem[];
}

export function DealGallery({
  title,
  categorySlug = "market",
  categoryName = "Kıbrıs Fırsatı",
  storeName = "Kıbrıs Fırsat",
  images,
}: DealGalleryProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="overflow-hidden rounded-3xl border border-slate-200/90 shadow-2xs">
        <DealVisual
          title={title}
          categorySlug={categorySlug}
          categoryName={categoryName}
          storeName={storeName}
          aspect="video"
          className="h-full w-full min-h-[260px]"
        />
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
