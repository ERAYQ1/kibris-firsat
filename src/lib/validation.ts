import { z } from "zod";
import { CURRENCIES } from "./currency";
import { REPORT_REASONS } from "./report-reasons";

const passwordSchema = z
  .string()
  .min(10, "Şifre en az 10 karakter olmalı.")
  .max(128, "Şifre en fazla 128 karakter olabilir.")
  .regex(/[a-zA-ZçğıöşüÇĞİÖŞÜ]/, "Şifre en az bir harf içermeli.")
  .regex(/[0-9]/, "Şifre en az bir rakam içermeli.");

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta girin.").max(254),
  password: passwordSchema,
  displayName: z
    .string()
    .trim()
    .min(2, "İsim en az 2 karakter olmalı.")
    .max(40, "İsim en fazla 40 karakter olabilir."),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(128),
});

const priceSchema = z
  .string()
  .trim()
  .regex(/^\d{1,9}([.,]\d{1,2})?$/, "Geçerli bir fiyat girin.");

export const dealCreateSchema = z
  .object({
    title: z.string().trim().min(5, "Başlık en az 5 karakter olmalı.").max(120),
    description: z.string().trim().max(2000).optional().or(z.literal("")),
    price: priceSchema,
    originalPrice: priceSchema.optional().or(z.literal("")),
    currency: z.enum(CURRENCIES),
    categoryId: z.coerce.number().int().positive(),
    locationId: z.coerce.number().int().positive(),
    storeName: z.string().trim().min(2, "Mağaza adı en az 2 karakter olmalı.").max(80),
    expiresAt: z
      .string()
      .datetime({ offset: true })
      .optional()
      .nullable()
      .or(z.literal("")),
  })
  .strict();

export const commentCreateSchema = z
  .object({
    content: z
      .string()
      .trim()
      .min(2, "Yorum en az 2 karakter olmalı.")
      .max(1000, "Yorum en fazla 1000 karakter olabilir."),
  })
  .strict();

export const voteSchema = z
  .object({
    value: z.union([z.literal(1), z.literal(-1), z.literal(0)]),
  })
  .strict();

export const reportSchema = z
  .object({
    reason: z.enum(REPORT_REASONS.map((r) => r.value) as [string, ...string[]]),
    details: z.string().trim().max(500).optional().or(z.literal("")),
  })
  .strict();

export function parsePriceToCents(input: string): number {
  const normalized = input.replace(",", ".");
  const value = Number.parseFloat(normalized);
  return Math.round(value * 100);
}

export type DealCreateInput = z.infer<typeof dealCreateSchema>;
export type CommentCreateInput = z.infer<typeof commentCreateSchema>;
