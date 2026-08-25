import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/server/users";
import { requireUser } from "@/server/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { DealCard } from "@/components/DealCard";
import { ProfileForm } from "@/components/ProfileForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { Shield, Plus, Tag } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profilim",
  description: "Kullanıcı profiliniz, paylaştığınız ve favorilediğiniz fırsatlar.",
};

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) redirect("/giris?next=/profil");

  let user;
  try {
    user = requireUser(token);
  } catch {
    redirect("/giris?next=/profil");
  }

  const profile = await getUserProfile(user.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Profil Başlık Kartı */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-2xl font-black text-white shadow-md">
              {profile.user.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-950">
                  {profile.user.displayName}
                </h1>
                {profile.user.role === "admin" && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-200/80">
                    <Shield className="h-3.5 w-3.5" />
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">{profile.user.email}</p>
              {profile.user.bio && (
                <p className="text-xs text-slate-600 max-w-lg leading-relaxed pt-1">
                  {profile.user.bio}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-slate-700 text-center min-w-[100px]">
              <span className="block text-lg font-black text-slate-950">
                {profile.sharedDeals.length}
              </span>
              <span className="text-[11px] text-slate-500">Paylaşılan Fırsat</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-slate-700 text-center min-w-[100px]">
              <span className="block text-lg font-black text-slate-950">
                {profile.favoriteDeals.length}
              </span>
              <span className="text-[11px] text-slate-500">Favori</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Sol: Profil Düzenleme Formu (4 Kolon) */}
        <div className="lg:col-span-4">
          <ProfileForm
            initialDisplayName={profile.user.displayName}
            initialBio={profile.user.bio}
          />
        </div>

        {/* Sağ: Paylaştığı Fırsatlar (8 Kolon) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Tag className="h-4 w-4 text-amber-600" />
              Paylaştığım Fırsatlar ({profile.sharedDeals.length})
            </h2>
            <Link
              href="/firsat/yeni"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-amber-800 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Yeni Fırsat Ekle
            </Link>
          </div>

          {profile.sharedDeals.length === 0 ? (
            <EmptyState
              title="Henüz bir fırsat paylaşmadınız."
              description="Kıbrıs'ta keşfettiğiniz indirimleri toplulukla paylaşarak puan toplayabilirsiniz."
              actionText="İlk Fırsatını Paylaş"
              actionHref="/firsat/yeni"
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {profile.sharedDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
