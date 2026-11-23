import { jwtVerify } from "jose";

export const EDGE_SESSION_COOKIE_NAME = "cv_session";
const DEFAULT_DEV_SECRET = "dev-local-auth-secret-proyecto-cv-2026-min-32-chars";

/**
 * Verificación de sesión ligera compatible con Edge Runtime (sin dependencias Node ni Prisma).
 */
export async function isValidEdgeSessionCookie(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secretValue =
    process.env.AUTH_SECRET || (process.env.NODE_ENV === "production" ? "" : DEFAULT_DEV_SECRET);
  if (!secretValue) return false;

  try {
    await jwtVerify(token, new TextEncoder().encode(secretValue), {
      algorithms: ["HS256"],
    });
    return true;
  } catch {
    return false;
  }
}
