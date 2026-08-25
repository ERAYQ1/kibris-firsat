"use client";

import { useState } from "react";
import { toast } from "sonner";
import { User, Check } from "lucide-react";

interface Props {
  initialDisplayName: string;
  initialBio: string | null;
}

export function ProfileForm({ initialDisplayName, initialBio }: Props) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio || "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          bio: bio || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error?.message ?? "Profil güncellenemedi.");
      }

      toast.success("Profil bilgileriniz başarıyla güncellendi! ✨");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
      <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5 border-b border-stone-100 pb-3">
        <User className="h-4 w-4 text-teal-600" />
        Profil Bilgilerini Düzenle
      </h3>

      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1">
          Görünen İsim / Kullanıcı Adı *
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          minLength={2}
          maxLength={40}
          className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 shadow-2xs"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1">
          Hakkımda / Biyografi (Opsiyonel)
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={300}
          placeholder="Kendinizden veya fırsat ilgi alanlarınızdan bahsedin (Örn: Girne'deki kahve ve restoran indirimleri avcısı)."
          className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 shadow-2xs"
        />
        <span className="text-[11px] text-stone-400 block text-right">
          {bio.length}/300
        </span>
      </div>

      <div className="pt-1">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-teal-800 active:scale-95 disabled:opacity-50 shadow-2xs"
        >
          <Check className="h-3.5 w-3.5" />
          {saving ? "Kaydediliyor…" : "Değişiklikleri Kaydet"}
        </button>
      </div>
    </form>
  );
}
