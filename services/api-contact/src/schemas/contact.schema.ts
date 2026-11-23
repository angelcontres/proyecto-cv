import { z } from "zod";

export const contactMessageSchema = z.object({
  senderName: z.string().trim().min(2, "Tu nombre es obligatorio.").max(120),
  senderEmail: z.string().trim().email("Correo electrónico inválido.").max(160),
  company: z.string().trim().max(120).optional().default(""),
  subject: z.string().trim().min(2, "El asunto es obligatorio.").max(160),
  message: z.string().trim().min(10, "El mensaje debe tener al menos 10 caracteres.").max(4000),
  websiteHoneypot: z.string().optional().default(""),
});

export const markReadSchema = z.object({
  isRead: z.boolean(),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
