"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UserX, UserCheck, Shield } from "lucide-react";
import { formatTimeAgo } from "@/lib/format";

interface UserItem {
  id: number;
  email: string;
  displayName: string;
  role: "user" | "admin";
  isBanned: number;
  createdAt: number;
}

interface Props {
  initialUsers: UserItem[];
}

export function AdminUserModeration({ initialUsers }: Props) {
  const [usersList, setUsersList] = useState(initialUsers);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function handleToggleBan(userId: number) {
    setLoadingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.message ?? "İşlem başarısız.");
      }

      const { isBanned } = (await res.json()) as { isBanned: boolean };
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isBanned: isBanned ? 1 : 0 } : u))
      );
      toast.success(isBanned ? "Kullanıcı engellendi." : "Kullanıcı engeli kaldırıldı.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata oluştu.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xs">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-slate-100 bg-slate-50 font-bold text-slate-700">
          <tr>
            <th className="p-4">ID</th>
            <th className="p-4">Kullanıcı</th>
            <th className="p-4">E-posta</th>
            <th className="p-4">Rol</th>
            <th className="p-4">Kayıt Tarihi</th>
            <th className="p-4">Durum</th>
            <th className="p-4 text-right">İşlem</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {usersList.map((u) => (
            <tr key={u.id} className="hover:bg-slate-50/60 transition">
              <td className="p-4 font-mono text-slate-400">#{u.id}</td>
              <td className="p-4 font-bold text-slate-900">{u.displayName}</td>
              <td className="p-4 text-slate-600">{u.email}</td>
              <td className="p-4">
                {u.role === "admin" ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 font-bold text-amber-800 border border-amber-200">
                    <Shield className="h-3 w-3" /> Admin
                  </span>
                ) : (
                  <span className="text-slate-500">Üye</span>
                )}
              </td>
              <td className="p-4 text-slate-500">{formatTimeAgo(u.createdAt)}</td>
              <td className="p-4">
                {u.isBanned === 1 ? (
                  <span className="rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 border border-rose-200/80">
                    Engellendi (Ban)
                  </span>
                ) : (
                  <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200/80">
                    Aktif
                  </span>
                )}
              </td>
              <td className="p-4 text-right">
                {u.role !== "admin" && (
                  <button
                    type="button"
                    disabled={loadingId === u.id}
                    onClick={() => handleToggleBan(u.id)}
                    className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 disabled:opacity-50 ${
                      u.isBanned === 1
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                    }`}
                  >
                    {u.isBanned === 1 ? (
                      <>
                        <UserCheck className="h-3.5 w-3.5" /> Engeli Kaldır
                      </>
                    ) : (
                      <>
                        <UserX className="h-3.5 w-3.5" /> Engelle
                      </>
                    )}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
