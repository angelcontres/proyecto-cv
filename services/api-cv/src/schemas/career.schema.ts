import { z } from "zod";
import {
  localizedListSchema,
  localizedTextSchema,
  optionalLocalizedTextSchema,
  safeUrlSchema,
} from "@cv/contracts";

export const experienceSchema = z
  .object({
    company: z.string().trim().min(1, "La empresa es obligatoria.").max(140),
    location: z.string().trim().max(120).optional().default(""),
    roleI18n: localizedTextSchema,
    summaryI18n: optionalLocalizedTextSchema,
    highlightsI18n: localizedListSchema.optional().default({ es: [], en: [] }),
    tags: z.array(z.string().trim().min(1).max(40)).max(20).optional().default([]),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha YYYY-MM-DD requerido."),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha YYYY-MM-DD requerido.")
      .nullable()
      .optional(),
    isCurrent: z.boolean().default(false),
    sortOrder: z.number().int().min(0).max(9999).default(0),
    isVisible: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.isCurrent || !data.endDate) return true;
      return data.endDate >= data.startDate;
    },
    {
      message: "La fecha de fin no puede ser anterior a la fecha de inicio.",
      path: ["endDate"],
    }
  );

export const educationSchema = z
  .object({
    institution: z.string().trim().min(1, "La institución es obligatoria.").max(160),
    location: z.string().trim().max(120).optional().default(""),
    degreeI18n: localizedTextSchema,
    summaryI18n: optionalLocalizedTextSchema,
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha YYYY-MM-DD requerido."),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha YYYY-MM-DD requerido.")
      .nullable()
      .optional(),
    isCurrent: z.boolean().default(false),
    sortOrder: z.number().int().min(0).max(9999).default(0),
    isVisible: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.isCurrent || !data.endDate) return true;
      return data.endDate >= data.startDate;
    },
    {
      message: "La fecha de fin no puede ser anterior a la fecha de inicio.",
      path: ["endDate"],
    }
  );

export const projectSchema = z.object({
  titleI18n: localizedTextSchema,
  summaryI18n: optionalLocalizedTextSchema,
  tags: z.array(z.string().trim().min(1).max(40)).max(20).optional().default([]),
  demoUrl: safeUrlSchema.optional().default(""),
  repoUrl: safeUrlSchema.optional().default(""),
  year: z.number().int().min(1990).max(2100).nullable().optional(),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  isVisible: z.boolean().default(true),
});

export const skillSchema = z.object({
  name: z.string().trim().min(1, "El nombre de la habilidad es obligatorio.").max(80),
  category: z.string().trim().min(1, "La categoría es obligatoria.").max(60),
  level: z.number().int().min(1).max(100).default(80),
  years: z.number().min(0).max(60).nullable().optional(),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  isVisible: z.boolean().default(true),
});

export type ExperienceInput = z.infer<typeof experienceSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
