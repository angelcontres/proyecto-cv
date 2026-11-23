import { describe, expect, it } from "vitest";
import { hasIncompleteTranslation, resolveLocalizedText } from "@cv/core";
import { experienceSchema } from "../src/index";

describe("Microservicio api-cv :: Validación e i18n", () => {
  it("rechaza experiencia donde endDate es anterior a startDate", () => {
    const res = experienceSchema.safeParse({
      company: "Acme Corp",
      roleI18n: { es: "Desarrollador", en: "Developer" },
      summaryI18n: { es: "", en: "" },
      startDate: "2024-06-01",
      endDate: "2024-01-01",
      isCurrent: false,
    });
    expect(res.success).toBe(false);
  });

  it("resuelve textos localizados con fallback y detecta traducciones incompletas", () => {
    expect(resolveLocalizedText({ es: "Hola", en: "" }, "en", "es")).toBe("Hola");
    expect(resolveLocalizedText({ es: "Hola", en: "Hello" }, "en", "es")).toBe("Hello");
    expect(hasIncompleteTranslation({ es: "Hola", en: "" })).toBe(true);
    expect(hasIncompleteTranslation({ es: "Hola", en: "Hello" })).toBe(false);
  });
});
