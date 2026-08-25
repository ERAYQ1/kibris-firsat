"use client";

import { useState } from "react";
import { Share2, Check, Copy, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

interface Props {
  title: string;
  url?: string;
}

export function ShareButtons({ title, url }: Props) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  function getShareUrl() {
    if (typeof window === "undefined") return url || "";
    return url || window.location.href;
  }

  async function handleCopy() {
    const fullUrl = getShareUrl();
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success("Bağlantı kopyalandı!");
      setTimeout(() => setCopied(false), 2000);
      setIsOpen(false);
    } catch {
      toast.error("Bağlantı kopyalanamadı.");
    }
  }

  function handleNativeShare() {
    const fullUrl = getShareUrl();
    if (navigator.share) {
      navigator
        .share({
          title,
          text: `${title} — Kıbrıs Fırsat`,
          url: fullUrl,
        })
        .catch(() => null);
    } else {
      setIsOpen(!isOpen);
    }
  }

  function handleWhatsApp() {
    const fullUrl = getShareUrl();
    const text = encodeURIComponent(`Kıbrıs Fırsat'ta buldum: ${title}\n${fullUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    setIsOpen(false);
  }

  function handleTelegram() {
    const fullUrl = getShareUrl();
    const text = encodeURIComponent(title);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${text}`, "_blank");
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleNativeShare}
        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 hover:bg-slate-50 transition"
      >
        <Share2 className="h-3.5 w-3.5 text-slate-500" />
        <span>Paylaş</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 mt-1.5 w-48 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl z-40 animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={handleWhatsApp}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition"
            >
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              WhatsApp'ta Paylaş
            </button>

            <button
              type="button"
              onClick={handleTelegram}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-900 transition"
            >
              <Send className="h-4 w-4 text-sky-600" />
              Telegram'da Paylaş
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4 text-slate-500" />
              )}
              {copied ? "Kopyalandı!" : "Bağlantıyı Kopyala"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
