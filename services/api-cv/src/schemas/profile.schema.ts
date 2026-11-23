import { z } from "zod";
import {
  localeSchema,
  localizedTextSchema,
  optionalLocalizedTextSchema,
  safeUrlSchema,
} from "@cv/contracts";

export const profileUpdateSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9-]+$/, "El slug solo admite minúsculas, números y guiones."),
  defaultLocale: localeSchema.default("es"),
  localizedInfo: z.object({
    fullName: z.string().trim().min(2).max(120),
    headline: localizedTextSchema,
    bio: optionalLocalizedTextSchema,
    location: z.string().trim().max(120).optional().default(""),
    availabilityBadge: optionalLocalizedTextSchema.optional().default({ es: "", en: "" }),
    publicEmail: z.string().trim().email("Correo público inválido.").or(z.literal("")).default(""),
  }),
  socialLinks: z.object({
    linkedin: safeUrlSchema.optional().default(""),
    github: safeUrlSchema.optional().default(""),
    website: safeUrlSchema.optional().default(""),
    x: safeUrlSchema.optional().default(""),
  }),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
