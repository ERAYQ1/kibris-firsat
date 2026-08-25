import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice, formatDate } from "@/lib/format";
import { getDealDetail, incrementViewCount } from "@/server/deals";
import { listComments } from "@/server/comments";
import { getCurrentUser } from "@/server/current-user";
import { VoteButtons } from "@/components/VoteButtons";
import { ReportButton } from "@/components/ReportButton";
import { CommentSection } from "@/components/CommentSection";
import { FavoriteButton } from "@/components/FavoriteButton";
import { VerificationPanel } from "@/components/VerificationPanel";
import { ShareButtons } from "@/components/ShareButtons";
import {
  Store,
  MapPin,
  Tag,
  Calendar,
  Eye,
  TrendingDown,
  ArrowLeft,
  CheckCircle2,
  Phone,
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
      title: `${deal.title} — ${formatPrice(deal.priceCents, deal.currency)} | Kıbrıs Fırsat`,
      description: `${deal.storeName} (${deal.locationName}) - ${deal.title} fırsatını inceleyin. ${deal.description ?? ""}`,
      openGraph: {
        title: `${deal.title} — ${formatPrice(deal.priceCents, deal.currency)}`,
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

  let discountPercent = 0;
  if (deal.originalPriceCents && deal.originalPriceCents > deal.priceCents) {
    discountPercent = Math.round(
      ((deal.originalPriceCents - deal.priceCents) / deal.originalPriceCents) * 100
    );
  }

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
      availability: deal.status === "active" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: deal.storeName,
      },
    },
  };

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Tüm Fırsatlara Dön
        </Link>

        <ShareButtons title={deal.title} />
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-5">
        {/* Başlık & Oylama */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-stone-100 pb-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 text-xs font-bold text-teal-800 border border-teal-200/60">
                <Tag className="h-3 w-3 text-teal-600" />
                {deal.categoryName}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700">
                <MapPin className="h-3 w-3 text-stone-500" />
                {deal.locationName}
              </span>
              {deal.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200/60">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  Doğrulanmış Fırsat
                </span>
              )}
            </div>

            <h1 className="text-2xl font-black text-stone-900 leading-tight">
              {deal.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <FavoriteButton dealId={deal.id} />
            <VoteButtons dealId={deal.id} />
          </div>
        </div>

        {/* Fiyat & İndirim Alanı */}
        <div className="flex flex-wrap items-baseline gap-3 rounded-xl bg-stone-50/80 p-4 border border-stone-200/60">
          <span className="text-3xl font-black text-teal-800 tracking-tight">
            {formatPrice(deal.priceCents, deal.currency)}
          </span>
          {deal.originalPriceCents && deal.originalPriceCents > deal.priceCents && (
            <>
              <span className="text-lg font-medium text-stone-400 line-through">
                {formatPrice(deal.originalPriceCents, deal.currency)}
              </span>
              {discountPercent > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
                  <TrendingDown className="h-3.5 w-3.5" />
                  %{discountPercent} İndirim
                </span>
              )}
            </>
          )}
        </div>

        {/* Fotoğraflar (Varsa) */}
        {deal.images && deal.images.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {deal.images.map((img) => (
              <a
                key={img.id}
                href={`/api/images/${img.filename}`}
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-4/3 overflow-hidden rounded-xl border border-stone-200 bg-stone-100"
              >
                <img
                  src={`/api/images/${img.filename}`}
                  alt={deal.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </a>
            ))}
          </div>
        )}

        {/* Açıklama */}
        {deal.description && (
          <div className="rounded-xl border border-stone-100 bg-stone-50/40 p-4 text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">
            {deal.description}
          </div>
        )}

        {/* Mağaza & Detay Bilgileri */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-xl border border-stone-200/60 p-4 text-xs text-stone-600 bg-white">
          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 font-semibold text-stone-800">
              <Store className="h-4 w-4 text-teal-600" />
              İşletme:{" "}
              <Link href={`/magaza/${deal.storeId}`} className="font-medium text-teal-700 hover:underline">
                {deal.storeName}
              </Link>
            </p>
            {deal.storePhone && (
              <p className="flex items-center gap-1.5 text-stone-600">
                <Phone className="h-4 w-4 text-stone-400" />
                İletişim: {deal.storePhone}
              </p>
            )}
            <p className="flex items-center gap-1.5 text-stone-500">
              Paylaşan: <span className="font-medium text-stone-700">{deal.authorName}</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-stone-500">
              <Calendar className="h-4 w-4 text-stone-400" />
              Paylaşım: {formatDate(deal.createdAt)}
            </p>
            {deal.expiresAt && (
              <p className="flex items-center gap-1.5 text-amber-700 font-medium">
                <Calendar className="h-4 w-4 text-amber-600" />
                Son Geçerlilik: {formatDate(deal.expiresAt)}
              </p>
            )}
            <p className="flex items-center gap-1.5 text-stone-500">
              <Eye className="h-4 w-4 text-stone-400" />
              {deal.viewCount} Görüntülenme
            </p>
          </div>
        </div>

        {/* Fiyat Geçmişi (Varsa) */}
        {deal.priceHistory && deal.priceHistory.length > 1 && (
          <div className="rounded-xl border border-stone-200 p-4">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Fiyat Değişim Geçmişi
            </h3>
            <ul className="divide-y divide-stone-100 text-xs">
              {deal.priceHistory.map((ph) => (
                <li key={ph.id} className="flex items-center justify-between py-1.5 text-stone-600">
                  <span className="font-bold text-teal-800">
                    {formatPrice(ph.priceCents, ph.currency)}
                  </span>
                  <span className="text-stone-400">{formatDate(ph.recordedAt)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <ReportButton dealId={deal.id} />
        </div>
      </div>

      {/* Topluluk Güven & Doğrulama Paneli */}
      <VerificationPanel dealId={deal.id} />

      {/* Yorumlar Bölümü */}
      <CommentSection
        dealId={deal.id}
        initialComments={comments}
        currentUser={currentUser}
      />
    </article>
  );
}
