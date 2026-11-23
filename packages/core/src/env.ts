import fs from "node:fs";
import path from "node:path";

const DEFAULT_DEV_SECRET = "dev-local-auth-secret-proyecto-cv-2026-min-32-chars";

function findWorkspaceRoot(startDir: string): string {
  let current = path.resolve(startDir);
  for (let i = 0; i < 6; i += 1) {
    if (fs.existsSync(path.join(current, "pnpm-workspace.yaml"))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return startDir;
}

/**
 * Lee y normaliza variables de entorno del servidor resolviendo rutas relativas desde la raíz del monorepo.
 */
export function getEnvConfig() {
  const isProd = process.env.NODE_ENV === "production";
  const authSecret = process.env.AUTH_SECRET || (isProd ? "" : DEFAULT_DEV_SECRET);

  if (isProd && authSecret.length < 32) {
    throw new Error("AUTH_SECRET debe definirse con al menos 32 caracteres en producción.");
  }

  const maxPdfSizeMb = Number(process.env.MAX_PDF_SIZE_MB ?? "10");
  const storageDirRaw = process.env.STORAGE_LOCAL_DIR || "./storage/uploads";
  const workspaceRoot = findWorkspaceRoot(/*turbopackIgnore: true*/ process.cwd());

  return {
    isProd,
    authSecret,
    allowSignup: process.env.ALLOW_SIGNUP === "true",
    primaryProfileSlug: process.env.PRIMARY_PROFILE_SLUG || "mi-cv",
    storageProvider: process.env.STORAGE_PROVIDER || "local",
    storageLocalDir: path.isAbsolute(storageDirRaw)
      ? storageDirRaw
      : path.resolve(workspaceRoot, storageDirRaw),
    maxPdfBytes: Math.max(1, Number.isFinite(maxPdfSizeMb) ? maxPdfSizeMb : 10) * 1024 * 1024,
  };
}
