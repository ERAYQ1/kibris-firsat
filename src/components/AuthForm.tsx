"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";

interface Props {
  mode: "login" | "register";
}

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/";

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form.entries())),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "İşlem başarısız oldu.");
      }

      toast.success(mode === "login" ? "Giriş başarılı! Hoş geldiniz." : "Hesabınız başarıyla oluşturuldu! 🎉");
      router.refresh();
      router.push(nextUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Bir hata oluştu.";
      setError(msg);
      toast.error(msg);
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode === "register" && (
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Ad Soyad / Kullanıcı Adı
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              name="displayName"
              required
              minLength={2}
              maxLength={40}
              placeholder="Örn: Ahmet Yılmaz"
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-900 shadow-2xs outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 placeholder:text-slate-400"
            />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700">E-posta Adresi</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="ornek@kibris.com"
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-900 shadow-2xs outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700">Şifre</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            name="password"
            type="password"
            required
            minLength={mode === "register" ? 10 : 1}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder="••••••••••"
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-900 shadow-2xs outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 placeholder:text-slate-400"
          />
        </div>
        {mode === "register" && (
          <span className="block text-[11px] text-slate-400 pt-0.5">
            En az 10 karakter; harf ve rakam içermelidir.
          </span>
        )}
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 py-3 text-xs font-bold text-white shadow-sm hover:bg-slate-800 active:scale-[0.98] transition disabled:opacity-50 cursor-pointer"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-white" />
            İşleniyor...
          </>
        ) : (
          <>
            <span>{mode === "login" ? "Giriş Yap" : "Kayıt Ol"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </button>
    </form>
  );
}
