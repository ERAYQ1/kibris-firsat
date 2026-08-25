import { getCurrentUser } from "@/server/current-user";
import { listOpenReports } from "@/server/deals";
import { adminGetStats, adminListUsers } from "@/server/users";
import { AdminReportList } from "@/components/AdminReportList";
import { AdminUserModeration } from "@/components/AdminUserModeration";
import { ShieldCheck, Tag, Users, AlertTriangle, MessageSquare, Heart, ShieldAlert } from "lucide-react";

export const metadata = { title: "Yönetim Paneli" };

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
        Bu sayfayı görüntülemek için giriş yapmalısınız.
      </div>
    );
  }
  if (user.role !== "admin") {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
        Bu sayfaya erişim yetkiniz bulunmamaktadır.
      </div>
    );
  }

  const stats = adminGetStats(user);
  const reports = listOpenReports();
  const usersList = adminListUsers(user);

  return (
    <div className="space-y-8">
      {/* Başlık */}
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-teal-700" />
          Kıbrıs Fırsat Yönetim Paneli
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Platform istatistikleri, moderasyon raporları ve kullanıcı yönetimi.
        </p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold">Toplam Fırsat</span>
            <Tag className="h-4 w-4 text-teal-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-stone-900">{stats.totalDeals}</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold">Aktif Fırsat</span>
            <Tag className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-700">{stats.activeDeals}</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold">Kullanıcılar</span>
            <Users className="h-4 w-4 text-teal-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-stone-900">{stats.totalUsers}</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold">Yorumlar</span>
            <MessageSquare className="h-4 w-4 text-teal-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-stone-900">{stats.totalComments}</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold">Favoriler</span>
            <Heart className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-stone-900">{stats.totalFavorites}</p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between text-rose-500">
            <span className="text-xs font-semibold">Açık Şikayet</span>
            <AlertTriangle className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-rose-700">{stats.openReports}</p>
        </div>
      </div>

      {/* Şikayetler & Moderasyon */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-1.5 border-b border-stone-200 pb-2">
          <ShieldAlert className="h-4 w-4 text-rose-600" />
          İnceleme Bekleyen Şikayetler ({reports.length})
        </h2>
        <AdminReportList reports={reports} />
      </section>

      {/* Kullanıcı Moderasyonu */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-1.5 border-b border-stone-200 pb-2">
          <Users className="h-4 w-4 text-teal-700" />
          Kullanıcı Yönetimi & Moderasyon ({usersList.length})
        </h2>
        <AdminUserModeration initialUsers={usersList} />
      </section>
    </div>
  );
}
