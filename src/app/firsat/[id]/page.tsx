import Link from "next/link";
import { notFound } from "next/navigation";
import { getDealDetail, getUserVote, isDealActive } from "@/server/deals";
import { getCurrentUser } from "@/server/current-user";
import { formatPrice, formatRelativeTime, formatDate } from "@/lib/format";
import { VoteButtons } from "@/components/VoteButtons";
import { ReportButton } from "@/components/ReportButton";
import { AppError } from "@/lib/errors";

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

  return (
    <article className="mx-auto max-w-2xl space-y-4">
      <div className="rounded-lg border border-stone-200 bg-white p-5">
        <h1 className="text-xl font-bold leading-snug">{d.title}</h1>
        {!active && (
          <p className="mt-2 rounded bg-stone-100 px-3 py-1.5 text-sm text-stone-600">
            {d.status === "removed"
              ? "Bu fırsat kaldırılmış."
              : d.status === "reported"
                ? "Bu fırsat inceleme altında."
                : "Bu fırsatın süresi dolmuş."}
          </p>
        )}
        <p className="mt-3 text-3xl font-extrabold text-teal-800">
          {formatPrice(d.priceCents, d.currency)}
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-stone-500">Mağaza</dt>
          <dd className="font-medium">{detail.storeName}</dd>
          <dt className="text-stone-500">Konum</dt>
          <dd className="font-medium">{detail.locationName}</dd>
          <dt className="text-stone-500">Kategori</dt>
          <dd className="font-medium">{detail.categoryName}</dd>
          <dt className="text-stone-500">Paylaşan</dt>
          <dd className="font-medium">{detail.authorName}</dd>
          <dt className="text-stone-500">Paylaşım</dt>
          <dd>{formatRelativeTime(d.createdAt)}</dd>
          {d.expiresAt !== null && (
            <>
              <dt className="text-stone-500">Geçerlilik</dt>
              <dd>{formatDate(d.expiresAt)}</dd>
            </>
          )}
          <dt className="text-stone-500">Topluluk</dt>
          <dd>
            👍 {Number(detail.upvotes)} · 👎 {Number(detail.downvotes)}
          </dd>
        </dl>

        {d.description && (
          <p className="mt-4 whitespace-pre-line border-t border-stone-100 pt-4 text-sm leading-relaxed text-stone-700">
            {d.description}
          </p>
        )}

        {active && (
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-stone-100 pt-4">
            {user ? (
              <>
                <VoteButtons dealId={d.id} initialValue={userVote} />
                <ReportButton dealId={d.id} />
              </>
            ) : (
              <p className="text-sm text-stone-500">
                <Link href="/giris" className="font-medium text-teal-700 hover:underline">
                  Giriş yapın
                </Link>{" "}
                oy vermek veya raporlamak için.
              </p>
            )}
          </div>
        )}
      </div>

      {detail.images.length > 0 && (
        <section aria-label="Fotoğraflar" className="grid gap-2 sm:grid-cols-2">
          {detail.images.map((img) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={img.filename}
              src={`/api/images/${img.filename}`}
              alt={`${d.title} fotoğrafı`}
              loading="lazy"
              className="w-full rounded-lg border border-stone-200 object-cover"
            />
          ))}
        </section>
      )}

      {detail.priceHistory.length > 1 && (
        <section aria-label="Fiyat geçmişi" className="rounded-lg border border-stone-200 bg-white p-5">
          <h2 className="text-sm font-semibold">Fiyat geçmişi</h2>
          <ul className="mt-2 space-y-1 text-sm text-stone-600">
            {detail.priceHistory.map((entry) => (
              <li key={entry.recordedAt}>
                {formatDate(entry.recordedAt)} — {formatPrice(entry.priceCents, d.currency)}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
