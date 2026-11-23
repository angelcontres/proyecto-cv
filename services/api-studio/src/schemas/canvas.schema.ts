import { z } from "zod";

export const canvasNodeTypeSchema = z.enum([
  "free_text",
  "free_image",
  "free_card",
  "free_button",
  "free_badge",
  "free_divider",
  "custom_code",
  "widget_hero",
  "widget_timeline",
  "widget_projects",
  "widget_skills",
  "widget_certifications",
  "widget_cert_spotlight",
  "widget_contact",
  "widget_controls",
]);

export const canvasNodeSchema = z.object({
  id: z.string().min(1).max(80),
  type: canvasNodeTypeSchema,
  label: z.string().trim().min(1).max(120),
  desktop: z.object({
    x: z.number().min(0).max(5000),
    y: z.number().min(0).max(20000),
    w: z.number().min(40).max(2400),
    h: z.number().min(24).max(4000),
    zIndex: z.number().int().min(0).max(999),
  }),
  mobile: z.object({
    order: z.number().int().min(0).max(9999),
    visible: z.boolean().default(true),
  }),
  style: z
    .object({
      backgroundColor: z.string().max(40).optional(),
      textColor: z.string().max(40).optional(),
      borderRadius: z.number().min(0).max(120).optional(),
      padding: z.number().min(0).max(120).optional(),
      shadow: z.enum(["none", "sm", "md", "lg"]).optional(),
      animation: z.enum(["none", "fade-up", "fade-in", "scale-in"]).optional(),
    })
    .default({}),
  props: z.record(z.unknown()).default({}),
});

export const canvasSchemaV1 = z.object({
  version: z.literal(1),
  canvasSettings: z.object({
    desktopWidth: z.number().int().min(800).max(1920).default(1200),
    minHeight: z.number().int().min(600).max(20000).default(1400),
    gridSize: z.number().int().min(1).max(64).default(8),
    snapToGrid: z.boolean().default(true),
  }),
  nodes: z.array(canvasNodeSchema).max(200),
});

export const layoutSaveSchema = z.object({
  canvasSchema: canvasSchemaV1,
  publish: z.boolean().optional().default(false),
});

export type CanvasSchemaV1 = z.infer<typeof canvasSchemaV1>;
