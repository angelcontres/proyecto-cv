import crypto from "node:crypto";

const PDF_MAGIC_BYTES = Buffer.from("%PDF-", "ascii");

export interface PdfValidationSuccess {
  ok: true;
  sha256: string;
  sizeBytes: number;
  sanitizedOriginalName: string;
}

export interface PdfValidationFailure {
  ok: false;
  error: string;
}

export type PdfValidationResult = PdfValidationSuccess | PdfValidationFailure;

export function sanitizeFileName(rawName: string): string {
  const base = rawName.split(/[\\/]/).pop() || "certificado.pdf";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_");
  return cleaned.slice(0, 120) || "certificado.pdf";
}

export function validatePdfBuffer(params: {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  maxBytes: number;
}): PdfValidationResult {
  const { buffer, originalName, mimeType, maxBytes } = params;

  if (!buffer || buffer.length === 0) {
    return { ok: false, error: "El archivo PDF está vacío." };
  }

  if (buffer.length > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024));
    return {
      ok: false,
      error: `El archivo PDF supera el límite permitido de ${maxMb} MB.`,
    };
  }

  const lowerName = originalName.toLowerCase().trim();
  if (!lowerName.endsWith(".pdf")) {
    return { ok: false, error: "El archivo debe tener extensión .pdf." };
  }

  if (mimeType && mimeType !== "application/pdf" && mimeType !== "application/octet-stream") {
    return { ok: false, error: "Tipo MIME no permitido; se requiere application/pdf." };
  }

  const headerSlice = buffer.subarray(0, 1024);
  const magicOffset = headerSlice.indexOf(PDF_MAGIC_BYTES);
  if (magicOffset === -1 || magicOffset > 16) {
    return {
      ok: false,
      error: "El contenido del archivo no corresponde a un documento PDF válido (%PDF-).",
    };
  }

  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
  return {
    ok: true,
    sha256,
    sizeBytes: buffer.length,
    sanitizedOriginalName: sanitizeFileName(originalName),
  };
}
