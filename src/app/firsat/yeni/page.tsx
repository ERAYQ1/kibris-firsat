import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/current-user";
import { listCategories, listLocations } from "@/server/meta";
import { DealForm } from "@/components/DealForm";

export const metadata = { title: "Fırsat Paylaş" };

export default async function NewDealPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const [categories, locations] = await Promise.all([listCategories(), listLocations()]);

  if (categories.length === 0 || locations.length === 0) {
    return (
      <p className="text-sm text-stone-600">
        Sistem henüz hazırlanmamış. Lütfen <code>npm run db:seed</code> komutunu çalıştırın.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Fırsat Paylaş</h1>
      <DealForm categories={categories} locations={locations} />
    </div>
  );
}
