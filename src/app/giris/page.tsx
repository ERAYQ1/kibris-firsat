import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Giriş" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm space-y-4">
      <h1 className="text-xl font-bold">Giriş Yap</h1>
      <AuthForm mode="login" />
      <p className="text-sm text-stone-500">
        Hesabınız yok mu?{" "}
        <Link href="/kayit" className="font-medium text-teal-700 hover:underline">
          Kayıt olun
        </Link>
      </p>
    </div>
  );
}
