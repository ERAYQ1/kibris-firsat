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
          displayName: displayName.trim(),
          bio: bio.trim() || undefined,
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
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-3">
        <User className="h-4 w-4 text-amber-600" />
        Profil Bilgilerini Düzenle
      </h3>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700">
          Görünen İsim / Kullanıcı Adı *
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          minLength={2}
          maxLength={40}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 shadow-2xs"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700">
          Biyografi (İsteğe bağlı)
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={300}
          placeholder="Kendinizden veya takip ettiğiniz fırsat alanlarından bahsedin..."
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 shadow-2xs"
        />
        <span className="text-[11px] text-slate-400 block text-right">
          {bio.length}/300
        </span>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4.5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 active:scale-95 disabled:opacity-50 shadow-sm"
        >
          <Check className="h-4 w-4" />
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>
    </form>
  );
}
