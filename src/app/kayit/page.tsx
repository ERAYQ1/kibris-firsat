import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hesap Oluştur",
  description: "Kıbrıs Fırsat topluluğuna katılın.",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center justify-center mb-2">
          <BrandLogo size="lg" showText={false} />
        </Link>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">
          Hesap Oluşturun
        </h1>
        <p className="text-xs text-slate-500">
          Kıbrıs Fırsat topluluğuna katılın, tasarruf edin ve indirimleri keşfedin.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <AuthForm mode="register" />

        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
          Zaten hesabınız var mı?{" "}
          <Link href="/giris" className="font-bold text-slate-900 hover:text-amber-800 hover:underline">
            Giriş Yapın
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
