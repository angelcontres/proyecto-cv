import crypto from "node:crypto";
import { sanitizeFileName } from "./pdf.validator";

export type FontValidationResult =
  | { ok: true; format: "woff2" | "ttf" | "otf"; sha256: string; sizeBytes: number; sanitizedOriginalName: string }
  | { ok: false; error: string };

const WOFF2_MAGIC = Buffer.from("wOF2", "ascii");
const OTF_MAGIC = Buffer.from("OTTO", "ascii");
const TTF_MAGIC_1 = Buffer.from([0x00, 0x01, 0x00, 0x00]);
const TTF_MAGIC_2 = Buffer.from("true", "ascii");

export function validateFontBuffer(params: {
  buffer: Buffer;
  originalName: string;
  maxBytes: number;
}): FontValidationResult {
  const { buffer, originalName, maxBytes } = params;

  if (!buffer || buffer.length < 4) {
    return { ok: false, error: "El archivo de fuente está vacío o dañado." };
  }

  if (buffer.length > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024));
    return { ok: false, error: `La fuente supera el máximo permitido de ${maxMb} MB.` };
  }

  const lower = originalName.toLowerCase().trim();
  const header = buffer.subarray(0, 4);

  let format: "woff2" | "ttf" | "otf" | null = null;
  if (lower.endsWith(".woff2") && header.equals(WOFF2_MAGIC)) {
    format = "woff2";
  } else if (lower.endsWith(".otf") && header.equals(OTF_MAGIC)) {
    format = "otf";
  } else if (lower.endsWith(".ttf") && (header.equals(TTF_MAGIC_1) || header.equals(TTF_MAGIC_2))) {
    format = "ttf";
  }

  if (!format) {
    return {
      ok: false,
      error: "Formato o firma binaria de fuente no válida. Se admite .woff2, .ttf u .otf.",
    };
  }

  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
  return {
    ok: true,
    format,
    sha256,
    sizeBytes: buffer.length,
    sanitizedOriginalName: sanitizeFileName(originalName),
  };
}
