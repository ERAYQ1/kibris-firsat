import { getCurrentUser } from "@/server/current-user";
import { listOpenReports } from "@/server/deals";
import { AdminReportList } from "@/components/AdminReportList";

export const metadata = { title: "Yönetim" };

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <p className="rounded-md bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
        Bu sayfa için giriş yapmalısınız.
      </p>
    );
  }
  if (user.role !== "admin") {
    return (
      <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        Bu sayfaya erişim yetkiniz yok.
      </p>
    );
  }

  const reports = listOpenReports();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Rapor Yönetimi</h1>
      <AdminReportList reports={reports} />
    </div>
  );
}
