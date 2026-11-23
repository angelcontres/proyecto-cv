import { NextResponse } from "next/server";
import { findPrimaryProfileIdByUser } from "../repositories/auth.repository";
import { getServerSession, type SessionPayload } from "./session.service";

export interface AuthenticatedContext {
  session: SessionPayload;
  profileId: string;
}

/**
 * Resuelve la sesión autenticada y el perfil principal perteneciente al usuario.
 * Garantiza aislamiento Multi-Tenant entre todos los microservicios.
 */
export async function requireAuthenticatedContext(): Promise<
  | { ok: true; ctx: AuthenticatedContext }
  | { ok: false; response: NextResponse }
> {
  const session = await getServerSession();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "No autorizado. Inicia sesión primero." }, { status: 401 }),
    };
  }

  const profile = await findPrimaryProfileIdByUser(session.userId);
  if (!profile) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Perfil no encontrado para el usuario autenticado." },
        { status: 404 }
      ),
    };
  }

  return {
    ok: true,
    ctx: { session, profileId: profile.id },
  };
}
