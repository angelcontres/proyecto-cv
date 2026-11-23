import { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";

/**
 * Extrae la IP aproximada del cliente desde cabeceras estándar de proxy.
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}

/**
 * Parsea y valida el cuerpo JSON de una petición con Zod.
 */
export async function parseAndValidate<T>(
  request: NextRequest,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Cuerpo JSON inválido." }, { status: 400 }),
    };
  }

  const parsed = schema.safeParse(rawBody);
  if (!parsed.success) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Datos de entrada inválidos.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      ),
    };
  }

  return { ok: true, data: parsed.data };
}

export function notFoundResponse(message = "Recurso no encontrado."): NextResponse {
  return NextResponse.json({ error: message }, { status: 404 });
}
