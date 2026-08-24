import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Kayıt Ol" };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-sm space-y-4">
      <h1 className="text-xl font-bold">Kayıt Ol</h1>
      <AuthForm mode="register" />
      <p className="text-sm text-stone-500">
        Zaten hesabınız var mı?{" "}
        <Link href="/giris" className="font-medium text-teal-700 hover:underline">
          Giriş yapın
        </Link>
      </p>
    </div>
  );
}
