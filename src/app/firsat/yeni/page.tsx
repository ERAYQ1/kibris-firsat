import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/current-user";
import { listCategories, listLocations } from "@/server/meta";
import { DealForm } from "@/components/DealForm";
import { Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fırsat Paylaş",
  description: "Kuzey Kıbrıs'taki yeni bir indirimi toplulukla paylaşın.",
};

export default async function NewDealPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?next=/firsat/yeni");

  const [categories, locations] = await Promise.all([listCategories(), listLocations()]);

  if (categories.length === 0 || locations.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center text-sm text-slate-600">
        Sistem kategorileri henüz yüklenmemiş. Lütfen <code>npm run db:seed</code> çalıştırın.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900 border border-amber-200/80 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-600" />
          Kıbrıs Fırsat Keşif Ağı
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          Yeni Bir Fırsat Paylaş
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Market, kafe, restoran veya mağazalarda gördüğün avantajlı fiyatı toplulukla paylaş.
        </p>
      </div>

      <DealForm categories={categories} locations={locations} />
    </div>
  );
}
