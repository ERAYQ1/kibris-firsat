"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  mode: "login" | "register";
}

export function AuthForm({ mode }: Props) {
  const router = useRouter();
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
      router.refresh();
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      setPending(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-teal-600 focus:outline-none";

  return (
    <form onSubmit={onSubmit} className="max-w-sm space-y-4">
      {mode === "register" && (
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Görünen ad</span>
          <input name="displayName" required minLength={2} maxLength={40} className={inputClass} />
        </label>
      )}
      <label className="block">
        <span className="mb-1 block text-sm font-medium">E-posta</span>
        <input name="email" type="email" required autoComplete="email" className={inputClass} />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Şifre</span>
        <input
          name="password"
          type="password"
          required
          minLength={mode === "register" ? 10 : 1}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className={inputClass}
        />
        {mode === "register" && (
          <span className="mt-1 block text-xs text-stone-400">
            En az 10 karakter; harf ve rakam içermeli.
          </span>
        )}
      </label>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-teal-700 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
      >
        {pending ? "Gönderiliyor…" : mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
      </button>
    </form>
  );
}
