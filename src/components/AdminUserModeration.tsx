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
      toast.success(isBanned ? "Kullanıcı engellendi (Ban)." : "Kullanıcının engeli kaldırıldı.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata oluştu.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-xs">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-stone-200 bg-stone-50 font-semibold text-stone-700">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Kullanıcı</th>
            <th className="p-3">E-posta</th>
            <th className="p-3">Rol</th>
            <th className="p-3">Kayıt Tarihi</th>
            <th className="p-3">Durum</th>
            <th className="p-3 text-right">İşlem</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {usersList.map((u) => (
            <tr key={u.id} className="hover:bg-stone-50/50">
              <td className="p-3 font-mono text-stone-400">#{u.id}</td>
              <td className="p-3 font-bold text-stone-900">{u.displayName}</td>
              <td className="p-3 text-stone-600">{u.email}</td>
              <td className="p-3">
                {u.role === "admin" ? (
                  <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 font-bold text-amber-800">
                    <Shield className="h-3 w-3" /> Admin
                  </span>
                ) : (
                  <span className="text-stone-500">Üye</span>
                )}
              </td>
              <td className="p-3 text-stone-500">{formatTimeAgo(u.createdAt)}</td>
              <td className="p-3">
                {u.isBanned === 1 ? (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 font-bold text-rose-800">
                    Engelli (Banned)
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800">
                    Aktif
                  </span>
                )}
              </td>
              <td className="p-3 text-right">
                {u.role !== "admin" && (
                  <button
                    type="button"
                    disabled={loadingId === u.id}
                    onClick={() => handleToggleBan(u.id)}
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition active:scale-95 disabled:opacity-50 ${
                      u.isBanned === 1
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                    }`}
                  >
                    {u.isBanned === 1 ? (
                      <>
                        <UserCheck className="h-3 w-3" /> Engeli Kaldır
                      </>
                    ) : (
                      <>
                        <UserX className="h-3 w-3" /> Engelle (Ban)
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
