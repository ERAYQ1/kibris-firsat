import { getCurrentUser } from "@/server/current-user";
import { listOpenReports } from "@/server/deals";
import { adminGetStats, adminListUsers } from "@/server/users";
import { AdminReportList } from "@/components/AdminReportList";
import { AdminUserModeration } from "@/components/AdminUserModeration";
import {
  ShieldCheck,
  Tag,
  Users,
  AlertTriangle,
  MessageSquare,
  Heart,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yönetim Paneli",
  description: "Platform istatistikleri ve içerik moderasyonu.",
};

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-rose-900 shadow-sm space-y-3">
          <AlertTriangle className="h-10 w-10 text-rose-600 mx-auto" />
          <h2 className="text-lg font-bold">Yetkisiz Erişim</h2>
          <p className="text-xs text-rose-700">
            Bu yönetim paneline yalnızca yetkili sistem yöneticileri erişebilir.
          </p>
        </div>
      </div>
    );
  }

  const stats = adminGetStats(user);
  const reports = listOpenReports();
  const usersList = adminListUsers(user);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Başlık */}
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900 border border-amber-200/80 mb-2">
          <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
          Yönetici Konsolu
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          Kıbrıs Fırsat Yönetim Paneli
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Sistem metrikleri, açık şikayetler kuyruğu ve kullanıcı moderasyonu.
        </p>
      </div>

      {/* KPI İstatistik Kartları */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">Toplam Fırsat</span>
            <Tag className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-950">{stats.totalDeals}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">Aktif Fırsat</span>
            <Sparkles className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-700">{stats.activeDeals}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">Kullanıcılar</span>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-950">{stats.totalUsers}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">Yorumlar</span>
            <MessageSquare className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-950">{stats.totalComments}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">Favoriler</span>
            <Heart className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-950">{stats.totalFavorites}</p>
        </div>

        <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-5 shadow-xs">
          <div className="flex items-center justify-between text-rose-500">
            <span className="text-xs font-bold text-rose-800">Açık Şikayet</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-rose-700">{stats.openReports}</p>
        </div>
      </div>

      {/* Şikayetler & Moderasyon */}
      <section className="space-y-4">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
          <ShieldAlert className="h-4 w-4 text-rose-600" />
          İnceleme Bekleyen Şikayetler ({reports.length})
        </h2>
        <AdminReportList reports={reports} />
      </section>

      {/* Kullanıcı Moderasyonu */}
      <section className="space-y-4">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
          <Users className="h-4 w-4 text-slate-900" />
          Kullanıcı Yönetimi ({usersList.length})
        </h2>
        <AdminUserModeration initialUsers={usersList} />
      </section>
    </div>
  );
}
