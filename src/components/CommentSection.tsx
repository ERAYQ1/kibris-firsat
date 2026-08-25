"use client";

import { useState } from "react";
import type { CommentItem } from "@/server/comments";
import type { PublicUser } from "@/server/auth";
import { formatRelativeTime } from "@/lib/format";
import { toast } from "sonner";
import { MessageSquare, Send, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";

interface Props {
  dealId: number;
  initialComments: CommentItem[];
  currentUser: PublicUser | null;
}

export function CommentSection({ dealId, initialComments, currentUser }: Props) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || content.trim().length < 2) {
      toast.error("Yorum en az 2 karakter olmalıdır.");
      return;
    }

    setPending(true);
    try {
      const res = await fetch(`/api/deals/${dealId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "Yorum gönderilemedi.");
      }

      const { comment } = (await res.json()) as { comment: CommentItem };
      setComments((prev) => [...prev, comment]);
      setContent("");
      toast.success("Yorumunuz paylaşıldı! ✨");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata oluştu.");
    } finally {
      setPending(false);
    }
  }

  async function handleDeleteComment(commentId: number) {
    if (!confirm("Bu yorumu silmek istediğinize emin misiniz?")) return;

    setDeletingId(commentId);
    try {
      const res = await fetch(`/api/deals/${dealId}/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "Yorum silinemedi.");
      }

      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success("Yorum silindi.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata oluştu.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
          <MessageSquare className="h-4.5 w-4.5 text-amber-600" />
          Topluluk Yorumları ({comments.length})
        </h3>
      </div>

      {/* Yorum Ekleme Alanı */}
      {currentUser ? (
        <form onSubmit={handleAddComment} className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="Fırsatın stok durumu, kalitesi veya diğer detaylar hakkında yorum yazın..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:bg-white focus:ring-2 focus:ring-slate-950/10 placeholder:text-slate-400"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pending || !content.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 active:scale-95 disabled:opacity-50 transition shadow-2xs cursor-pointer"
            >
              {pending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Yorum Yap
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-600">
          Yorum yapabilmek için lütfen{" "}
          <Link href={`/giris?next=/firsat/${dealId}`} className="font-bold text-slate-950 hover:underline">
            Giriş Yapın
          </Link>
          .
        </div>
      )}

      {/* Yorum Listesi */}
      <div className="space-y-3 pt-2">
        {comments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-xs text-slate-400">
            Henüz yorum yapılmamış. Fırsat hakkında ilk yorumu sen yaz!
          </div>
        ) : (
          comments.map((comment) => {
            const canDelete =
              currentUser &&
              (currentUser.id === comment.authorId || currentUser.role === "admin");

            return (
              <div
                key={comment.id}
                className="group relative rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-[11px] font-bold text-white">
                      {comment.authorName.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{comment.authorName}</p>
                      <p className="text-[10px] text-slate-400">{formatRelativeTime(comment.createdAt)}</p>
                    </div>
                  </div>

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={deletingId === comment.id}
                      title="Yorumu Sil"
                      className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <p className="mt-2.5 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
