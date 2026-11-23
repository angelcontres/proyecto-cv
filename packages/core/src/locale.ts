import type { Locale, LocalizedList, LocalizedText } from "@cv/contracts";

/**
 * Resuelve un texto localizado aplicando fallback al idioma por defecto si falta traducción.
 */
export function resolveLocalizedText(
  value: LocalizedText | null | undefined,
  locale: Locale,
  fallbackLocale: Locale = "es"
): string {
  if (!value || typeof value !== "object") {
    return "";
  }

  const primary = value[locale]?.trim();
  if (primary) {
    return primary;
  }

  const fallback = value[fallbackLocale]?.trim();
  if (fallback) {
    return fallback;
  }

  const alternate: Locale = locale === "es" ? "en" : "es";
  return value[alternate]?.trim() ?? "";
}

/**
 * Resuelve una lista de cadenas localizada con fallback automático.
 */
export function resolveLocalizedList(
  value: LocalizedList | null | undefined,
  locale: Locale,
  fallbackLocale: Locale = "es"
): string[] {
  if (!value || typeof value !== "object") {
    return [];
  }

  const primary = value[locale];
  if (Array.isArray(primary) && primary.length > 0) {
    return primary;
  }

  const fallback = value[fallbackLocale];
  if (Array.isArray(fallback) && fallback.length > 0) {
    return fallback;
  }

  return [];
}

/**
 * Indica si un campo bilingüe tiene contenido en un idioma pero falta en el otro.
 */
export function hasIncompleteTranslation(value: LocalizedText | null | undefined): boolean {
  if (!value) {
    return true;
  }
  const hasEs = Boolean(value.es?.trim());
  const hasEn = Boolean(value.en?.trim());
  return (hasEs && !hasEn) || (!hasEs && hasEn) || (!hasEs && !hasEn);
}
