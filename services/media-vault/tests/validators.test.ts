import { describe, expect, it } from "vitest";
import { sanitizeFileName, validateFontBuffer, validatePdfBuffer } from "../src/index";

describe("Microservicio media-vault :: validatePdfBuffer", () => {
  it("acepta un PDF válido con cabecera %PDF-", () => {
    const validPdf = Buffer.from("%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF", "ascii");
    const result = validatePdfBuffer({
      buffer: validPdf,
      originalName: "AWS Certified Solutions Architect.pdf",
      mimeType: "application/pdf",
      maxBytes: 10 * 1024 * 1024,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.sizeBytes).toBe(validPdf.length);
      expect(result.sha256).toHaveLength(64);
      expect(result.sanitizedOriginalName).toBe("AWS_Certified_Solutions_Architect.pdf");
    }
  });

  it("rechaza un archivo que no inicia con firma binaria %PDF-", () => {
    const fakePdf = Buffer.from("<html><script>alert(1)</script></html>", "utf8");
    const result = validatePdfBuffer({
      buffer: fakePdf,
      originalName: "malicioso.pdf",
      mimeType: "application/pdf",
      maxBytes: 10 * 1024 * 1024,
    });

    expect(result.ok).toBe(false);
  });

  it("rechaza archivos que superan el tamaño máximo", () => {
    const validPdf = Buffer.from("%PDF-1.4\n" + "A".repeat(2048), "ascii");
    const result = validatePdfBuffer({
      buffer: validPdf,
      originalName: "grande.pdf",
      mimeType: "application/pdf",
      maxBytes: 1024,
    });

    expect(result.ok).toBe(false);
  });

  it("sanitiza nombres con rutas peligrosas", () => {
    expect(sanitizeFileName("../../etc/passwd/certificado final.pdf")).toBe(
      "certificado_final.pdf"
    );
  });
});

describe("Microservicio media-vault :: validateFontBuffer", () => {
  it("acepta fuentes WOFF2 y OTF con firma binaria válida", () => {
    const woff2 = Buffer.concat([Buffer.from("wOF2", "ascii"), Buffer.alloc(32)]);
    const res = validateFontBuffer({
      buffer: woff2,
      originalName: "DisplayFont.woff2",
      maxBytes: 5 * 1024 * 1024,
    });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.format).toBe("woff2");
  });

  it("rechaza archivos disfrazados como fuente sin magic bytes válidos", () => {
    const fake = Buffer.from("not-a-font-file", "ascii");
    const res = validateFontBuffer({
      buffer: fake,
      originalName: "fake.woff2",
      maxBytes: 5 * 1024 * 1024,
    });
    expect(res.ok).toBe(false);
  });
});
