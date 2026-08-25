import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/format";
import { getDealDetail, incrementViewCount } from "@/server/deals";
import { listComments } from "@/server/comments";
import { getCurrentUser } from "@/server/current-user";
import { VoteButtons } from "@/components/VoteButtons";
import { ReportButton } from "@/components/ReportButton";
import { CommentSection } from "@/components/CommentSection";
import { FavoriteButton } from "@/components/FavoriteButton";
import { VerificationPanel } from "@/components/VerificationPanel";
import { ShareButtons } from "@/components/ShareButtons";
import { DealPrice } from "@/components/deals/DealPrice";
import { DealGallery } from "@/components/deals/DealGallery";
import { LiveCountdown } from "@/components/deals/LiveCountdown";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import {
  MapPin,
  Tag,
  Eye,
  ArrowLeft,
  Phone,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const dealId = Number.parseInt(id, 10);
  if (!Number.isInteger(dealId) || dealId <= 0) return { title: "Fırsat Bulunamadı" };

  try {
    const deal = getDealDetail(dealId);
    return {
      title: `${deal.title} — ${deal.storeName} | Kıbrıs Fırsat`,
      description: `${deal.storeName} (${deal.locationName}) - ${deal.title}. Fiyat ve indirim detayları Kıbrıs Fırsat'ta.`,
      openGraph: {
        title: `${deal.title} — ${deal.storeName}`,
        description: `${deal.storeName} (${deal.locationName}) fırsatı`,
        images: deal.images.length > 0 ? [`/api/images/${deal.images[0].filename}`] : [],
      },
    };
  } catch {
    return { title: "Fırsat Bulunamadı" };
  }
}

export default async function DealDetailPage({ params }: Props) {
  const { id } = await params;
  const dealId = Number.parseInt(id, 10);
  if (!Number.isInteger(dealId) || dealId <= 0) notFound();

  let deal;
  try {
    deal = getDealDetail(dealId);
    incrementViewCount(dealId);
  } catch {
    notFound();
  }

  const [comments, currentUser] = await Promise.all([
    listComments(dealId),
    getCurrentUser(),
  ]);

  // Schema.org JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: deal.title,
    description: deal.description || deal.title,
    image: deal.images.map((img) => `/api/images/${img.filename}`),
    offers: {
      "@type": "Offer",
      priceCurrency: deal.currency,
      price: (deal.priceCents / 100).toFixed(2),
      availability:
        deal.status === "active"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: deal.storeName,
      },
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Üst Gezinme & Paylaşım */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Fırsatlara Dön
        </Link>

        <ShareButtons title={deal.title} />
      </div>

      {/* İki Kolonlu Ana Detay Alanı */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sol Kolon: Galeri & İşletme Detayı (5 Kolon) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Görsel Galerisi */}
          <DealGallery title={deal.title} images={deal.images} />

          {/* Mağaza Kartı */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 font-black text-slate-800 text-sm">
                  {deal.storeName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <Link
                    href={`/magaza/${deal.storeId}`}
                    className="font-bold text-slate-900 text-sm hover:underline flex items-center gap-1.5"
                  >
                    {deal.storeName}
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </Link>
                  <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {deal.locationName}
                  </p>
                </div>
              </div>
            </div>

            {deal.storePhone && (
              <p className="flex items-center gap-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                İletişim: <span className="font-semibold">{deal.storePhone}</span>
              </p>
            )}
          </div>

          {/* Fiyat Değişim Geçmişi (Varsa) */}
          {deal.priceHistory && deal.priceHistory.length > 1 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
              <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <TrendingUp className="h-3.5 w-3.5 text-amber-600" />
                Fiyat Değişim Geçmişi
              </h4>
              <ul className="divide-y divide-slate-100 text-xs">
                {deal.priceHistory.map((ph) => (
                  <li key={ph.id} className="flex items-center justify-between py-2">
                    <DealPrice priceCents={ph.priceCents} currency={ph.currency} size="sm" />
                    <span className="text-slate-400">{formatDate(ph.recordedAt)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sağ Kolon: Fiyat, Bilgiler ve Aksiyonlar (7 Kolon) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            {/* Rozetler & Üst Bilgi */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                  <Tag className="h-3 w-3 text-slate-400" />
                  {deal.categoryName}
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  {deal.locationName}
                </span>
                {deal.isVerified && <VerifiedBadge type="deal" />}
              </div>

              <LiveCountdown expiresAt={deal.expiresAt} status={deal.status} />
            </div>

            {/* Fırsat Başlığı */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 leading-snug tracking-tight">
              {deal.title}
            </h1>

            {/* Büyük Fiyat Alanı */}
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200/80">
              <DealPrice
                priceCents={deal.priceCents}
                originalPriceCents={deal.originalPriceCents}
                currency={deal.currency}
                size="xl"
              />
            </div>

            {/* Açıklama */}
            {deal.description && (
              <div className="space-y-2 text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-5 whitespace-pre-wrap">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Fırsat Açıklaması
                </h4>
                <p>{deal.description}</p>
              </div>
            )}

            {/* Paylaşan & Zaman Bilgisi */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Paylaşan: {deal.authorName}</span>
                <span>•</span>
                <span>{formatDate(deal.createdAt)}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-slate-500">
                  <Eye className="h-3.5 w-3.5 text-slate-400" />
                  {deal.viewCount} Görüntülenme
                </span>
              </div>
            </div>

            {/* Aksiyon & Etkileşim Barı */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <div className="flex items-center gap-2">
                <FavoriteButton dealId={deal.id} variant="pill" />
                <VoteButtons dealId={deal.id} />
              </div>

              <ReportButton dealId={deal.id} />
            </div>
          </div>

          {/* Topluluk Doğrulama Paneli */}
          <VerificationPanel dealId={deal.id} />

          {/* Yorumlar Bölümü */}
          <CommentSection
            dealId={deal.id}
            initialComments={comments}
            currentUser={currentUser}
          />
        </div>
      </div>
    </div>
  );
}
