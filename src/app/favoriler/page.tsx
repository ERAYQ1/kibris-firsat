import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DealGridViewCard } from "@/components/deals/DealGridViewCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { listUserFavorites } from "@/server/favorites";
import { requireUser } from "@/server/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { Heart } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favori Fırsatlarım",
  description: "Kaydettiğiniz ve takip ettiğiniz indirim fırsatları.",
};

export default async function FavoritesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) redirect("/giris?next=/favoriler");

  let user;
  try {
    user = requireUser(token);
  } catch {
    redirect("/giris?next=/favoriler");
  }

  const items = listUserFavorites(user.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 flex items-center gap-2.5 tracking-tight">
            <Heart className="h-7 w-7 text-rose-500 fill-rose-500" />
            Favori Fırsatlarım
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Kaydettiğiniz ve takip etmek istediğiniz Kıbrıs indirimleri.
          </p>
        </div>
        <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
          {items.length} Kayıtlı Fırsat
        </span>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-7 w-7 text-rose-500" />}
          title="Henüz favori fırsatınız bulunmuyor."
          description="Fırsat kartlarındaki kalp ikonuna tıklayarak beğendiğiniz indirimleri kolayca listenize ekleyebilirsiniz."
          actionText="Fırsatları Keşfet"
          actionHref="/"
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((deal) => (
            <DealGridViewCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  );
}
