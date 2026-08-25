"use client";

import { useState } from "react";
import type { CommentItem } from "@/server/comments";
import type { PublicUser } from "@/server/auth";
import { formatRelativeTime } from "@/lib/format";
import { toast } from "sonner";
import { MessageSquare, Send, Trash2, User } from "lucide-react";
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
      toast.success("Yorumunuz eklendi!");
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
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
      <div className="flex items-center gap-2 border-b border-stone-100 pb-4">
        <MessageSquare className="h-5 w-5 text-teal-700" />
        <h2 className="text-lg font-bold text-stone-900">
          Topluluk Yorumları ({comments.length})
        </h2>
      </div>

      <div className="mt-5 space-y-4">
        {comments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-200 py-8 text-center text-sm text-stone-500">
            Henüz yorum yapılmamış. Fırsatın geçerliliği veya stok durumu hakkında ilk yorumu sen yaz!
          </div>
        ) : (
          comments.map((comment) => {
            const canDelete =
              currentUser &&
              (currentUser.id === comment.authorId || currentUser.role === "admin");

            return (
              <div
                key={comment.id}
                className="group relative rounded-xl border border-stone-100 bg-stone-50/60 p-4 transition hover:bg-stone-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-stone-800">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-teal-800">
                      <User className="h-4 w-4" />
                    </div>
                    <span>{comment.authorName}</span>
                    <span className="text-xs font-normal text-stone-400">
                      · {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={deletingId === comment.id}
                      className="rounded-md p-1 text-stone-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 focus:opacity-100"
                      title="Yorumu sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <p className="mt-2.5 text-sm leading-relaxed text-stone-700 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 border-t border-stone-100 pt-5">
        {currentUser ? (
          <form onSubmit={handleAddComment} className="space-y-3">
            <label className="block">
              <span className="sr-only">Yorumunuz</span>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Fırsat hakkında bilgi ekle (Örn: Hangi şubede gördün? Fiyat hala geçerli mi?)"
                rows={3}
                maxLength={1000}
                required
                className="w-full rounded-xl border border-stone-300 bg-white p-3.5 text-sm text-stone-900 shadow-2xs outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
              />
            </label>
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400">
                {content.length}/1000 karakter
              </span>
              <button
                type="submit"
                disabled={pending || !content.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4.5 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-teal-800 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                {pending ? "Gönderiliyor…" : "Yorum Yap"}
              </button>
            </div>
          </form>
        ) : (
          <div className="rounded-xl bg-teal-50/60 p-4 text-center text-sm text-stone-600 border border-teal-100">
            Yorum yazmak ve topluluğa bilgi vermek için{" "}
            <Link href="/giris" className="font-semibold text-teal-800 hover:underline">
              Giriş Yap
            </Link>{" "}
            veya{" "}
            <Link href="/kayit" className="font-semibold text-teal-800 hover:underline">
              Kayıt Ol
            </Link>
            .
          </div>
        )}
      </div>
    </section>
  );
}
