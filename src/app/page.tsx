import Link from "next/link";
import { listDeals } from "@/server/deals";
import { listCategories, listLocations, listPopularStores } from "@/server/meta";
import { DealCard } from "@/components/DealCard";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Search,
  MapPin,
  Flame,
  Sparkles,
  TrendingDown,
  ShoppingBag,
  UtensilsCrossed,
  Laptop,
  Shirt,
  Sparkle,
  Car,
  Wrench,
  PartyPopper,
  Plane,
  GraduationCap,
  Package,
  Store,
  Plus,
  CheckCircle2,
} from "lucide-react";

interface SearchParamsProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    location?: string;
    minPrice?: string;
    maxPrice?: string;
    minDiscount?: string;
    sort?: "newest" | "top" | "hot" | "discount" | "price_asc" | "price_desc";
    page?: string;
  }>;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  market: <ShoppingBag className="h-5 w-5" />,
  restoran: <UtensilsCrossed className="h-5 w-5" />,
  elektronik: <Laptop className="h-5 w-5" />,
  giyim: <Shirt className="h-5 w-5" />,
  kozmetik: <Sparkle className="h-5 w-5" />,
  ev: <Package className="h-5 w-5" />,
  otomotiv: <Car className="h-5 w-5" />,
  hizmet: <Wrench className="h-5 w-5" />,
  eglence: <PartyPopper className="h-5 w-5" />,
  seyahat: <Plane className="h-5 w-5" />,
  egitim: <GraduationCap className="h-5 w-5" />,
  diger: <Store className="h-5 w-5" />,
};

const POPULAR_TAGS = [
  { label: "🧀 Hellim", query: "hellim" },
  { label: "☕ Kahve", query: "kahve" },
  { label: "🍕 Pizza", query: "pizza" },
  { label: "📱 iPhone", query: "iphone" },
  { label: "🥩 Erülkü Market", query: "erülkü" },
  { label: "🍔 Eziç Burger", query: "eziç" },
];

export default async function HomePage({ searchParams }: SearchParamsProps) {
  const params = await searchParams;
  const query = params.q || "";
  const categorySlug = params.category || "";
  const locationSlug = params.location || "";
  const sort = params.sort || "newest";
  const minDiscount = params.minDiscount ? Number.parseInt(params.minDiscount, 10) : undefined;
  const minPrice = params.minPrice ? Number.parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number.parseFloat(params.maxPrice) : undefined;
  const page = params.page ? Math.max(1, Number.parseInt(params.page, 10)) : 1;

  const minPriceCents = minPrice ? Math.round(minPrice * 100) : undefined;
  const maxPriceCents = maxPrice ? Math.round(maxPrice * 100) : undefined;

  const [dealsResult, categories, locations, popularStores] = await Promise.all([
    listDeals({
      q: query,
      categorySlug: categorySlug || undefined,
      locationSlug: locationSlug || undefined,
      minPriceCents,
      maxPriceCents,
      minDiscount,
      sort,
      page,
      pageSize: 16,
    }),
    listCategories(),
    listLocations(),
    listPopularStores(6),
  ]);

  const hasActiveFilters = Boolean(
    query || categorySlug || locationSlug || minPrice || maxPrice || minDiscount || sort !== "newest"
  );

  function createFilterUrl(overrides: Record<string, string | number | undefined>) {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (categorySlug) p.set("category", categorySlug);
    if (locationSlug) p.set("location", locationSlug);
    if (minPrice) p.set("minPrice", minPrice.toString());
    if (maxPrice) p.set("maxPrice", maxPrice.toString());
    if (minDiscount) p.set("minDiscount", minDiscount.toString());
    if (sort && sort !== "newest") p.set("sort", sort);

    for (const [key, value] of Object.entries(overrides)) {
      if (value === undefined || value === "") {
        p.delete(key);
      } else {
        p.set(key, String(value));
      }
    }
    const qs = p.toString();
    return qs ? `/?${qs}` : "/";
  }

  return (
    <div className="space-y-12 pb-12">
      {/* 1. HERO & ARAMA ALANI */}
      {!hasActiveFilters && (
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 sm:px-12 sm:py-16 text-white shadow-xl">
          <div className="relative z-10 mx-auto max-w-3xl text-center space-y-5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-amber-400 backdrop-blur-md border border-white/10">
              <Sparkles className="h-3.5 w-3.5" />
              Kuzey Kıbrıs'ın Fırsat Keşif Platformu
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Kıbrıs'taki en iyi fırsatları keşfet.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Marketlerden restoranlara, elektronikten hizmetlere kadar Kuzey Kıbrıs'taki
              indirimleri tek yerde bul, karşılaştır ve tasarruf et.
            </p>

            {/* Büyük Arama & Konum Formu */}
            <form
              action="/"
              method="GET"
              className="mt-6 flex flex-col sm:flex-row items-center gap-2 rounded-2xl bg-white p-2 text-slate-900 shadow-2xl"
            >
              <div className="flex flex-1 items-center gap-2.5 px-3 py-1.5 w-full">
                <Search className="h-5 w-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="Ne arıyorsun? (iPhone, pizza, market, kahve...)"
                  className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-2">
                <div className="flex items-center gap-1.5 px-2 text-slate-600 text-xs font-semibold">
                  <MapPin className="h-4 w-4 text-amber-600 shrink-0" />
                  <select
                    name="location"
                    defaultValue={locationSlug}
                    className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer py-1"
                  >
                    <option value="">Tüm Kıbrıs</option>
                    {locations.map((loc) => (
                      <option key={loc.slug} value={loc.slug}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 active:scale-95 transition shadow-sm"
                >
                  Fırsatları Keşfet
                </button>
              </div>
            </form>

            {/* Popüler Hızlı Arama Etiketleri */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-300">
              <span className="font-semibold text-slate-400">Popüler:</span>
              {POPULAR_TAGS.map((tag) => (
                <Link
                  key={tag.query}
                  href={`/?q=${encodeURIComponent(tag.query)}`}
                  className="rounded-lg bg-white/10 px-2.5 py-1 font-medium hover:bg-white/20 transition"
                >
                  {tag.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2. POPÜLER KATEGORİLER */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Kategoriler</h2>
            <p className="text-xs text-slate-500">İhtiyacın olan alandaki indirimleri keşfet</p>
          </div>
          {categorySlug && (
            <Link
              href={createFilterUrl({ category: "" })}
              className="text-xs font-bold text-amber-700 hover:underline"
            >
              Tüm Kategoriler
            </Link>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {categories.map((cat) => {
            const isSelected = categorySlug === cat.slug;
            const icon = CATEGORY_ICONS[cat.slug] || <Store className="h-5 w-5" />;

            return (
              <Link
                key={cat.slug}
                href={createFilterUrl({ category: isSelected ? "" : cat.slug })}
                className={`group flex flex-col items-center justify-center rounded-2xl border p-3.5 text-center transition-all duration-150 ${
                  isSelected
                    ? "border-slate-950 bg-slate-950 text-white shadow-md"
                    : "border-slate-200/90 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 shadow-2xs"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                    isSelected
                      ? "bg-white/15 text-amber-400"
                      : "bg-slate-100 text-slate-700 group-hover:bg-amber-50 group-hover:text-amber-800"
                  }`}
                >
                  {icon}
                </div>
                <span className="mt-2 text-xs font-bold leading-snug line-clamp-1">
                  {cat.name}
                </span>
                <span
                  className={`mt-0.5 text-[10px] ${
                    isSelected ? "text-slate-300" : "text-slate-400"
                  }`}
                >
                  {cat.dealsCount ? `${cat.dealsCount} fırsat` : "Fırsatları gör"}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. FIRSATLAR LİSTESİ & GELİŞMİŞ FİLTRELEME */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {query
                ? `“${query}” için Fırsatlar`
                : categorySlug
                ? `${categories.find((c) => c.slug === categorySlug)?.name || "Kategori"} Fırsatları`
                : "Tüm Fırsatlar"}
            </h2>
            <p className="text-xs text-slate-500">
              Toplam {dealsResult.total} fırsat listeleniyor
            </p>
          </div>

          {/* Sıralama Sekmeleri */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            <Link
              href={createFilterUrl({ sort: "newest" })}
              className={`rounded-xl px-3 py-1.5 transition ${
                sort === "newest"
                  ? "bg-slate-950 text-white font-bold"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              En Yeni
            </Link>
            <Link
              href={createFilterUrl({ sort: "hot" })}
              className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 transition ${
                sort === "hot"
                  ? "bg-slate-950 text-white font-bold"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              Sıcak
            </Link>
            <Link
              href={createFilterUrl({ sort: "discount" })}
              className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 transition ${
                sort === "discount"
                  ? "bg-slate-950 text-white font-bold"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
              En Çok İndirim
            </Link>
            <Link
              href={createFilterUrl({ sort: "price_asc" })}
              className={`rounded-xl px-3 py-1.5 transition ${
                sort === "price_asc"
                  ? "bg-slate-950 text-white font-bold"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              En Ucuz
            </Link>
          </div>
        </div>

        {/* Hızlı Filtre Butonları */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Konum Filtreleri */}
          {locations.map((loc) => {
            const isLocSelected = locationSlug === loc.slug;
            return (
              <Link
                key={loc.slug}
                href={createFilterUrl({ location: isLocSelected ? "" : loc.slug })}
                className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 font-semibold transition ${
                  isLocSelected
                    ? "bg-amber-500 text-slate-950 font-bold shadow-2xs"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <MapPin className="h-3 w-3 text-slate-400" />
                {loc.name}
              </Link>
            );
          })}

          {/* İndirim Filtreleri */}
          <Link
            href={createFilterUrl({ minDiscount: minDiscount === 25 ? "" : 25 })}
            className={`rounded-xl px-3 py-1.5 font-semibold transition ${
              minDiscount === 25
                ? "bg-rose-600 text-white font-bold"
                : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            %25+ İndirim
          </Link>
          <Link
            href={createFilterUrl({ minDiscount: minDiscount === 50 ? "" : 50 })}
            className={`rounded-xl px-3 py-1.5 font-semibold transition ${
              minDiscount === 50
                ? "bg-rose-600 text-white font-bold"
                : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            %50+ İndirim
          </Link>

          {hasActiveFilters && (
            <Link
              href="/"
              className="rounded-xl bg-slate-200 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-300 transition"
            >
              Filtreleri Sıfırla
            </Link>
          )}
        </div>

        {/* Fırsat Kartları Grid */}
        {dealsResult.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-2">
            {dealsResult.items.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aradığınız kriterlere uygun fırsat bulunamadı."
            description="Farklı bir arama terimi deneyebilir, filtreleri temizleyebilir veya ilk fırsatı siz ekleyebilirsiniz."
            actionText="Tüm Fırsatları Göster"
            actionHref="/"
          />
        )}
      </section>

      {/* 4. POPÜLER İŞLETMELER */}
      {popularStores.length > 0 && !hasActiveFilters && (
        <section className="space-y-4 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Popüler İşletmeler</h2>
              <p className="text-xs text-slate-500">Kıbrıs'ın güvenilir süpermarket ve restoranları</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {popularStores.map((store) => (
              <Link
                key={store.id}
                href={`/magaza/${store.id}`}
                className="group flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-slate-400 hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-black text-sm group-hover:bg-amber-50 group-hover:text-amber-900 transition">
                    {store.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                      {store.name}
                      {store.isVerified && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {store.locationName}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700">
                    {store.dealsCount} Fırsat
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. BÖLGELERE GÖRE FIRSATLAR */}
      {!hasActiveFilters && (
        <section className="space-y-4 pt-6 border-t border-slate-200">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Kıbrıs Şehirleri</h2>
            <p className="text-xs text-slate-500">Bölgendeki en taze fırsatları tek tıkla incele</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {locations.map((loc) => (
              <Link
                key={loc.slug}
                href={`/?location=${loc.slug}`}
                className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 text-center hover:border-slate-950 hover:shadow-md transition group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 group-hover:bg-slate-950 group-hover:text-amber-400 transition">
                  <MapPin className="h-5 w-5" />
                </div>
                <span className="mt-2 text-xs font-bold text-slate-900">{loc.name}</span>
                <span className="mt-0.5 text-[10px] text-slate-400">
                  {loc.dealsCount ? `${loc.dealsCount} Fırsat` : "Fırsatları gör"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 6. FIRSAT PAYLAŞ CTA BANNER */}
      {!hasActiveFilters && (
        <section className="rounded-3xl bg-linear-to-r from-slate-950 to-slate-900 p-8 sm:p-12 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                Topluluğa Katıl
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Kıbrıs'ta yeni bir indirim mi gördün?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md">
                Gördüğün fırsatı 1 dakikada paylaş, binlerce kişinin tasarruf etmesini sağla ve topluluk puanı kazan.
              </p>
            </div>

            <Link
              href="/firsat/yeni"
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-3.5 text-sm font-black text-slate-950 hover:bg-amber-400 active:scale-95 transition shadow-lg shrink-0"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              Fırsat Paylaş
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
