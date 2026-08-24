import { DealCard } from "@/components/DealCard";
import { listDeals } from "@/server/deals";
import { listCategories, listLocations } from "@/server/meta";

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
  const sort = firstValue(params.sort) === "top" ? "top" : "newest";
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
    <div className="space-y-5">
      <form method="GET" action="/" className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Fırsat ara…"
          className="min-w-40 flex-1 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
          aria-label="Arama"
        />
        <select
          name="location"
          defaultValue={location}
          aria-label="Konum"
          className="rounded-md border border-stone-300 bg-white px-2 py-2 text-sm"
        >
          <option value="">Tüm konumlar</option>
          {locations.map((l) => (
            <option key={l.id} value={l.slug}>
              {l.name}
            </option>
          ))}
        </select>
        <select
          name="category"
          defaultValue={category}
          aria-label="Kategori"
          className="rounded-md border border-stone-300 bg-white px-2 py-2 text-sm"
        >
          <option value="">Tüm kategoriler</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          name="sort"
          defaultValue={sort}
          aria-label="Sıralama"
          className="rounded-md border border-stone-300 bg-white px-2 py-2 text-sm"
        >
          <option value="newest">En yeni</option>
          <option value="top">En beğenilen</option>
        </select>
        <button
          type="submit"
          className="rounded-md bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-900"
        >
          Ara
        </button>
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 p-10 text-center text-sm text-stone-500">
          Henüz fırsat yok veya aramanızla eşleşen sonuç bulunamadı.
        </div>
      ) : (
        <>
          <p className="text-xs text-stone-400">{total} fırsat</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
          {totalPages > 1 && (
            <nav className="flex justify-center gap-2 pt-2 text-sm" aria-label="Sayfalama">
              {page > 1 && (
                <a href={`/?page=${page - 1}`} className="rounded border px-3 py-1 hover:bg-white">
                  Önceki
                </a>
              )}
              <span className="px-3 py-1 text-stone-500">
                Sayfa {page} / {totalPages}
              </span>
              {page < totalPages && (
                <a href={`/?page=${page + 1}`} className="rounded border px-3 py-1 hover:bg-white">
                  Sonraki
                </a>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
