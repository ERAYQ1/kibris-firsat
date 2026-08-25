import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { Flame, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giriş Yap",
  description: "Kıbrıs Fırsat hesabınıza giriş yapın.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 mb-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
            <Flame className="h-5 w-5 fill-amber-500 text-amber-500" />
          </span>
        </Link>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">
          Tekrar Hoş Geldiniz
        </h1>
        <p className="text-xs text-slate-500">
          Kıbrıs Fırsat hesabınıza giriş yaparak fırsatları oylayın ve paylaşın.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <AuthForm mode="login" />

        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
          Hesabınız yok mu?{" "}
          <Link href="/kayit" className="font-bold text-slate-900 hover:text-amber-800 hover:underline">
            Hemen Ücretsiz Kayıt Olun
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
        Güvenli oturum ve şifreli veri koruması
      </div>
    </div>
  );
}
