import Link from "next/link";
import { notFound } from "next/navigation";
import { getDealDetail, getUserVote, isDealActive } from "@/server/deals";
import { listComments } from "@/server/comments";
import { getCurrentUser } from "@/server/current-user";
import { formatPrice, formatRelativeTime, formatDate } from "@/lib/format";
import { VoteButtons } from "@/components/VoteButtons";
import { ReportButton } from "@/components/ReportButton";
import { CommentSection } from "@/components/CommentSection";
import { AppError } from "@/lib/errors";
import { Store, MapPin, Tag, User, Calendar, History, Image as ImageIcon } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DealDetailPage({ params }: Props) {
  const { id } = await params;
  const dealId = Number.parseInt(id, 10);
  if (!Number.isInteger(dealId) || dealId <= 0) notFound();

  let detail;
  try {
    detail = getDealDetail(dealId);
  } catch (err) {
    if (err instanceof AppError && err.status === 404) notFound();
    throw err;
  }

  const user = await getCurrentUser();
  const active = isDealActive({ status: detail.deal.status, expiresAt: detail.deal.expiresAt });
  const userVote = user ? getUserVote(dealId, user.id) : 0;
  const d = detail.deal;
  const comments = listComments(dealId);

  const hasDiscount =
    d.originalPriceCents !== null && d.originalPriceCents > d.priceCents;
  const discountPercent = hasDiscount
    ? Math.round(((d.originalPriceCents! - d.priceCents) / d.originalPriceCents!) * 100)
    : null;

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold leading-tight text-stone-900">{d.title}</h1>
        </div>

        {!active && (
          <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-800 border border-amber-200/70">
            {d.status === "removed"
              ? "Bu fırsat moderatörler tarafından kaldırılmış."
              : d.status === "reported"
                ? "Bu fırsat inceleme altında."
                : "Bu fırsatın süresi dolmuş."}
          </div>
        )}

        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-3.5xl font-black tracking-tight text-teal-800">
            {formatPrice(d.priceCents, d.currency)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-lg font-medium text-stone-400 line-through">
                {formatPrice(d.originalPriceCents!, d.currency)}
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                %{discountPercent} İndirim
              </span>
            </>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl bg-stone-50/80 p-4 sm:grid-cols-2 text-sm border border-stone-100">
          <div className="flex items-center gap-2 text-stone-700">
            <Store className="h-4 w-4 text-teal-600 shrink-0" />
            <span className="text-stone-500">Mağaza:</span>
            <span className="font-semibold text-stone-900">{detail.storeName}</span>
          </div>

          <div className="flex items-center gap-2 text-stone-700">
            <MapPin className="h-4 w-4 text-teal-600 shrink-0" />
            <span className="text-stone-500">Konum:</span>
            <span className="font-semibold text-stone-900">{detail.locationName}</span>
          </div>

          <div className="flex items-center gap-2 text-stone-700">
            <Tag className="h-4 w-4 text-teal-600 shrink-0" />
            <span className="text-stone-500">Kategori:</span>
            <span className="font-semibold text-stone-900">{detail.categoryName}</span>
          </div>

          <div className="flex items-center gap-2 text-stone-700">
            <User className="h-4 w-4 text-teal-600 shrink-0" />
            <span className="text-stone-500">Paylaşan:</span>
            <span className="font-semibold text-stone-900">{detail.authorName}</span>
          </div>

          <div className="flex items-center gap-2 text-stone-700">
            <Calendar className="h-4 w-4 text-stone-400 shrink-0" />
            <span className="text-stone-500">Paylaşım:</span>
            <span>{formatRelativeTime(d.createdAt)}</span>
          </div>

          {d.expiresAt !== null && (
            <div className="flex items-center gap-2 text-stone-700">
              <Calendar className="h-4 w-4 text-stone-400 shrink-0" />
              <span className="text-stone-500">Son Geçerlilik:</span>
              <span className="font-medium text-stone-800">{formatDate(d.expiresAt)}</span>
            </div>
          )}
        </div>

        {d.description && (
          <div className="mt-5 border-t border-stone-100 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Detaylar</h3>
            <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-stone-700">
              {d.description}
            </p>
          </div>
        )}

        {active && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-stone-100 pt-5">
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <VoteButtons dealId={d.id} initialValue={userVote} />
                  <ReportButton dealId={d.id} />
                </>
              ) : (
                <p className="text-sm text-stone-500">
                  <Link href="/giris" className="font-semibold text-teal-700 hover:underline">
                    Giriş yapın
                  </Link>{" "}
                  (oy vermek ve şikayet için).
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {detail.images.length > 0 && (
        <section aria-label="Fotoğraflar" className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-stone-800">
            <ImageIcon className="h-4 w-4 text-teal-700" />
            <span>Fırsat Görselleri ({detail.images.length})</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {detail.images.map((img) => (
              <img
                key={img.filename}
                src={`/api/images/${img.filename}`}
                alt={`${d.title} fotoğrafı`}
                loading="lazy"
                className="w-full rounded-xl border border-stone-200 object-cover shadow-2xs hover:shadow-md transition"
              />
            ))}
          </div>
        </section>
      )}

      {detail.priceHistory.length > 1 && (
        <section aria-label="Fiyat geçmişi" className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <History className="h-4 w-4 text-teal-700" />
            <h2 className="text-sm font-bold text-stone-900">Fiyat Değişim Geçmişi</h2>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            {detail.priceHistory.map((entry) => (
              <li key={entry.recordedAt} className="flex justify-between">
                <span>{formatDate(entry.recordedAt)}</span>
                <span className="font-semibold text-stone-900">
                  {formatPrice(entry.priceCents, d.currency)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Yorumlar Bölümü */}
      <CommentSection
        dealId={dealId}
        initialComments={comments}
        currentUser={user}
      />
    </article>
  );
}
