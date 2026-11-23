import { describe, expect, it } from "vitest";
import { certificationMetadataSchema } from "../src/index";

describe("Microservicio api-certifications :: Validación", () => {
  it("rechaza URLs de verificación no http/https en certificaciones", () => {
    const res = certificationMetadataSchema.safeParse({
      titleI18n: { es: "Cert", en: "Cert" },
      issuer: "Cloud Org",
      issueDate: "2025-05-01",
      category: "Cloud",
      verifyUrl: "javascript:alert(1)",
    });
    expect(res.success).toBe(false);
  });
});
