import Link from "next/link";
import { DealCard } from "@/components/DealCard";
import { listDeals } from "@/server/deals";
import { listCategories, listLocations } from "@/server/meta";
import { Search, MapPin, Tag, Flame, Sparkles, SlidersHorizontal, TrendingDown } from "lucide-react";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstValue(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const q = firstValue(params.q) ?? "";
  const category = firstValue(params.category) ?? "";
  const location = firstValue(params.location) ?? "";
  const sortRaw = firstValue(params.sort);
  const sort =
    sortRaw === "top" || sortRaw === "hot" || sortRaw === "discount"
      ? sortRaw
      : "newest";
  const page = Number.parseInt(firstValue(params.page) ?? "1", 10) || 1;

  const [{ items, total, pageSize }, categories, locations] = await Promise.all([
    listDeals({
      q: q || undefined,
      categorySlug: category || undefined,
      locationSlug: location || undefined,
      sort,
      page,
    }),
    listCategories(),
    listLocations(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      {/* Hero / Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-800 to-teal-950 p-6 text-white shadow-md sm:p-8">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-700/60 px-3 py-1 text-xs font-semibold text-teal-200 backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5 text-teal-300" />
            Kıbrıs İndirim & Fırsat Keşfi
          </div>
          <h1 className="text-2xl font-black sm:text-3xl tracking-tight">
            Kıbrıs'ta Bugün Nerede Ne Ucuz?
          </h1>
          <p className="text-sm text-teal-100/90 leading-relaxed">
            Market indirimleri, restoran ve kafe kampanyaları, elektronik fırsatları. Topluluk paylaşıyor ve anlık doğruluyor.
          </p>
        </div>
      </div>

      {/* Arama & Filtreleme Formu */}
      <form
        method="GET"
        action="/"
        className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          <div className="relative sm:col-span-4">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Ürün, market veya marka ara…"
              className="w-full rounded-xl border border-stone-300 bg-stone-50/50 pl-10 pr-3.5 py-2.5 text-sm text-stone-900 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/20"
              aria-label="Arama"
            />
          </div>

          <div className="relative sm:col-span-3">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <select
              name="location"
              defaultValue={location}
              aria-label="Konum"
              className="w-full rounded-xl border border-stone-300 bg-stone-50/50 pl-10 pr-3.5 py-2.5 text-sm text-stone-800 outline-none transition focus:border-teal-600 focus:bg-white"
            >
              <option value="">Tüm Konumlar</option>
              {locations.map((l) => (
                <option key={l.id} value={l.slug}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative sm:col-span-3">
            <Tag className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <select
              name="category"
              defaultValue={category}
              aria-label="Kategori"
              className="w-full rounded-xl border border-stone-300 bg-stone-50/50 pl-10 pr-3.5 py-2.5 text-sm text-stone-800 outline-none transition focus:border-teal-600 focus:bg-white"
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-teal-700 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-teal-800 active:scale-[0.98]"
            >
              Fırsat Bul
            </button>
          </div>
        </div>

        {/* Sıralama Tabları */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3 text-xs">
          <span className="font-semibold text-stone-500 flex items-center gap-1">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Sırala:
          </span>
          <Link
            href={`/?${new URLSearchParams({ ...(q ? { q } : {}), ...(location ? { location } : {}), ...(category ? { category } : {}), sort: "newest" })}`}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              sort === "newest"
                ? "bg-teal-700 text-white font-semibold shadow-2xs"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            En Yeni
          </Link>
          <Link
            href={`/?${new URLSearchParams({ ...(q ? { q } : {}), ...(location ? { location } : {}), ...(category ? { category } : {}), sort: "hot" })}`}
            className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium transition ${
              sort === "hot"
                ? "bg-amber-600 text-white font-semibold shadow-2xs"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            <Flame className="h-3.5 w-3.5 fill-current" />
            En Sıcak
          </Link>
          <Link
            href={`/?${new URLSearchParams({ ...(q ? { q } : {}), ...(location ? { location } : {}), ...(category ? { category } : {}), sort: "discount" })}`}
            className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium transition ${
              sort === "discount"
                ? "bg-emerald-700 text-white font-semibold shadow-2xs"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            <TrendingDown className="h-3.5 w-3.5" />
            En Çok İndirim
          </Link>
          <Link
            href={`/?${new URLSearchParams({ ...(q ? { q } : {}), ...(location ? { location } : {}), ...(category ? { category } : {}), sort: "top" })}`}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              sort === "top"
                ? "bg-teal-700 text-white font-semibold shadow-2xs"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            En Beğenilen
          </Link>
        </div>
      </form>

      {/* Fırsat Listesi */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center text-stone-500 shadow-2xs">
          <p className="font-semibold text-stone-700">Aramanıza uygun fırsat bulunamadı.</p>
          <p className="mt-1 text-sm text-stone-400">
            Farklı bir arama terimi deneyebilir veya ilk fırsatı siz paylaşabilirsiniz!
          </p>
          <Link
            href="/firsat/yeni"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            Fırsat Paylaş
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 px-1">
            <span>Toplam {total} fırsat bulundu</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="flex justify-center gap-2 pt-4 text-sm" aria-label="Sayfalama">
              {page > 1 && (
                <Link
                  href={`/?${new URLSearchParams({ ...(q ? { q } : {}), ...(location ? { location } : {}), ...(category ? { category } : {}), sort, page: String(page - 1) })}`}
                  className="rounded-lg border border-stone-300 bg-white px-3.5 py-1.5 font-medium text-stone-700 shadow-2xs transition hover:bg-stone-50"
                >
                  Önceki
                </Link>
              )}
              <span className="flex items-center px-3.5 py-1.5 text-xs font-medium text-stone-500">
                Sayfa {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/?${new URLSearchParams({ ...(q ? { q } : {}), ...(location ? { location } : {}), ...(category ? { category } : {}), sort, page: String(page + 1) })}`}
                  className="rounded-lg border border-stone-300 bg-white px-3.5 py-1.5 font-medium text-stone-700 shadow-2xs transition hover:bg-stone-50"
                >
                  Sonraki
                </Link>
              )}
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
