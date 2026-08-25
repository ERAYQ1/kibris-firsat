import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DealCard } from "@/components/DealCard";
import { listUserFavorites } from "@/server/favorites";
import { requireUser } from "@/server/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { Heart, Sparkles } from "lucide-react";

export default async function FavoritesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) redirect("/giris");

  let user;
  try {
    user = requireUser(token);
  } catch {
    redirect("/giris");
  }

  const items = listUserFavorites(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
            Favori Fırsatlarım
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Kaydettiğiniz ve takip etmek istediğiniz Kıbrıs fırsatları.
          </p>
        </div>
        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800">
          {items.length} Fırsat
        </span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center text-stone-500 shadow-2xs">
          <Heart className="mx-auto h-12 w-12 text-stone-300 stroke-1 mb-2" />
          <p className="font-semibold text-stone-700">Henüz favori fırsatınız yok.</p>
          <p className="mt-1 text-sm text-stone-400">
            Beğendiğiniz veya takip etmek istediğiniz indirimleri kalp ikonuna tıklayarak buraya ekleyebilirsiniz.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            <Sparkles className="h-4 w-4" />
            Fırsatları Keşfet
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  );
}
