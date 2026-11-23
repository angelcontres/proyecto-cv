import { z } from "zod";

export type Locale = "es" | "en";

export interface LocalizedText {
  es?: string;
  en?: string;
}

export interface LocalizedList {
  es?: string[];
  en?: string[];
}

export interface OkResponse {
  ok: true;
}

export interface ApiErrorBody {
  error: string;
  details?: Record<string, string[] | undefined>;
}

export const localeSchema = z.enum(["es", "en"]);

export const localizedTextSchema = z
  .object({
    es: z.string().trim().max(4000).optional().default(""),
    en: z.string().trim().max(4000).optional().default(""),
  })
  .refine((val) => Boolean(val.es.trim() || val.en.trim()), {
    message: "Debe proporcionarse al menos el texto en español o inglés.",
  });

export const optionalLocalizedTextSchema = z.object({
  es: z.string().trim().max(4000).optional().default(""),
  en: z.string().trim().max(4000).optional().default(""),
});

export const localizedListSchema = z.object({
  es: z.array(z.string().trim().min(1).max(300)).optional().default([]),
  en: z.array(z.string().trim().min(1).max(300)).optional().default([]),
});

export const safeUrlSchema = z
  .string()
  .trim()
  .refine(
    (val) => {
      if (!val) return true;
      try {
        const url = new URL(val);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "La URL debe iniciar con http:// o https://" }
  );
