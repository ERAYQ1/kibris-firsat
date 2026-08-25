import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/server/users";
import { requireUser } from "@/server/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { DealCard } from "@/components/DealCard";
import { ProfileForm } from "@/components/ProfileForm";
import { Shield, Sparkles } from "lucide-react";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) redirect("/giris");

  let user;
  try {
    user = requireUser(token);
  } catch {
    redirect("/giris");
  }

  const profile = await getUserProfile(user.id);

  return (
    <div className="space-y-6">
      {/* Profil Başlık Kartı */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-700 text-2xl font-black text-white shadow-md">
              {profile.user.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-stone-900">
                  {profile.user.displayName}
                </h1>
                {profile.user.role === "admin" && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                    <Shield className="h-3.5 w-3.5" />
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400">{profile.user.email}</p>
              {profile.user.bio && (
                <p className="mt-1 text-xs text-stone-600 max-w-lg">
                  {profile.user.bio}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <div className="rounded-xl bg-stone-100 px-3 py-2 text-stone-700 text-center">
              <span className="block text-base font-black text-stone-900">
                {profile.sharedDeals.length}
              </span>
              <span>Paylaşılan Fırsat</span>
            </div>
            <div className="rounded-xl bg-rose-50 px-3 py-2 text-rose-700 text-center">
              <span className="block text-base font-black text-rose-900">
                {profile.favoriteDeals.length}
              </span>
              <span>Favori</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sol Kolon: Profil Düzenleme Formu */}
        <div className="lg:col-span-1">
          <ProfileForm
            initialDisplayName={profile.user.displayName}
            initialBio={profile.user.bio}
          />
        </div>

        {/* Sağ Kolon: Paylaştığı Fırsatlar */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-teal-600" />
              Paylaştığım Fırsatlar ({profile.sharedDeals.length})
            </h2>
            <Link
              href="/firsat/yeni"
              className="text-xs font-bold text-teal-700 hover:underline"
            >
              + Yeni Fırsat Ekle
            </Link>
          </div>

          {profile.sharedDeals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-xs text-stone-400">
              Henüz bir fırsat paylaşmadınız.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
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
