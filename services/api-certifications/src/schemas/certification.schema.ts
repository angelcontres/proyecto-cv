import { z } from "zod";
import { localizedTextSchema, safeUrlSchema } from "@cv/contracts";

export const certificationMetadataSchema = z.object({
  titleI18n: localizedTextSchema,
  issuer: z.string().trim().min(1, "El emisor es obligatorio.").max(140),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha YYYY-MM-DD requerido."),
  expiryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha YYYY-MM-DD requerido.")
    .nullable()
    .optional(),
  category: z.string().trim().min(1, "La categoría es obligatoria.").max(80),
  credentialId: z.string().trim().max(120).optional().default(""),
  verifyUrl: safeUrlSchema.optional().default(""),
  skills: z.array(z.string().trim().min(1).max(40)).max(20).optional().default([]),
  allowDownload: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  isVisible: z.boolean().default(true),
});

export type CertificationMetadataInput = z.infer<typeof certificationMetadataSchema>;
