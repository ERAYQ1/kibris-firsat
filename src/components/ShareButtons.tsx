"use client";

import { Share2, Link2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  title: string;
  url?: string;
}

export function ShareButtons({ title }: Props) {
  function handleCopy() {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    toast.success("Bağlantı kopyalandı! 🔗");
  }

  function handleWhatsApp() {
    if (typeof window === "undefined") return;
    const text = encodeURIComponent(`Kıbrıs Fırsat'ta gördüm: ${title} 👉 ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  }

  async function handleNativeShare() {
    if (typeof window === "undefined") return;
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Kıbrıs Fırsat: ${title}`,
          url: window.location.href,
        });
      } catch {
        // user cancelled or share failed
      }
    } else {
      handleCopy();
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleWhatsApp}
        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100/80 active:scale-95 shadow-2xs"
      >
        <MessageCircle className="h-4 w-4 fill-emerald-600 text-emerald-600" />
        <span>WhatsApp</span>
      </button>

      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 active:scale-95 shadow-2xs"
      >
        <Link2 className="h-4 w-4 text-stone-500" />
        <span>Linki Kopyala</span>
      </button>

      <button
        type="button"
        onClick={handleNativeShare}
        aria-label="Paylaş"
        className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white p-1.5 text-stone-600 transition hover:border-stone-300 hover:bg-stone-50 active:scale-95 shadow-2xs sm:hidden"
      >
        <Share2 className="h-4 w-4 text-stone-500" />
      </button>
    </div>
  );
}
