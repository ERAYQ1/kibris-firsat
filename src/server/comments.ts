import { asc, eq } from "drizzle-orm";
import { getDb, type Db } from "@/server/db";
import { comments, deals, users } from "@/db/schema";
import { Errors } from "@/lib/errors";
import type { PublicUser } from "@/server/auth";
import { commentCreateSchema } from "@/lib/validation";

export interface CommentItem {
  id: number;
  dealId: number;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: number;
}

export function listComments(dealId: number, database: Db = getDb()): CommentItem[] {
  if (!Number.isInteger(dealId) || dealId <= 0) throw Errors.badRequest("Geçersiz fırsat.");

  return database
    .select({
      id: comments.id,
      dealId: comments.dealId,
      authorId: comments.userId,
      authorName: users.displayName,
      content: comments.content,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.userId))
    .where(eq(comments.dealId, dealId))
    .orderBy(asc(comments.createdAt))
    .all();
}

export function createComment(
  dealId: number,
  input: unknown,
  author: PublicUser,
  database: Db = getDb()
): CommentItem {
  if (!Number.isInteger(dealId) || dealId <= 0) throw Errors.badRequest("Geçersiz fırsat.");

  const deal = database.select({ id: deals.id, status: deals.status }).from(deals).where(eq(deals.id, dealId)).get();
  if (!deal || deal.status === "removed") throw Errors.notFound("Fırsat");

  const data = commentCreateSchema.parse(input);

  const inserted = database
    .insert(comments)
    .values({
      dealId,
      userId: author.id,
      content: data.content,
    })
    .returning({
      id: comments.id,
      dealId: comments.dealId,
      authorId: comments.userId,
      content: comments.content,
      createdAt: comments.createdAt,
    })
    .get();

  return {
    ...inserted,
    authorName: author.displayName,
  };
}

export function deleteComment(
  commentId: number,
  actor: PublicUser,
  database: Db = getDb()
): void {
  if (!Number.isInteger(commentId) || commentId <= 0) throw Errors.badRequest("Geçersiz yorum.");

  const comment = database.select().from(comments).where(eq(comments.id, commentId)).get();
  if (!comment) throw Errors.notFound("Yorum");

  if (comment.userId !== actor.id && actor.role !== "admin") {
    throw Errors.forbidden();
  }

  database.delete(comments).where(eq(comments.id, commentId)).run();
}
