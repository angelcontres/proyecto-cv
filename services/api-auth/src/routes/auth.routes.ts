import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, parseAndValidate, resetRateLimit } from "@cv/core";
import { findAuthUserByEmail } from "../repositories/auth.repository";
import { loginSchema } from "../schemas/login.schema";
import { verifyPassword } from "../services/password.service";
import { clearSessionCookie, getServerSession, setSessionCookie } from "../services/session.service";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 8;

export async function handleLogin(request: NextRequest) {
  const parsed = await parseAndValidate(request, loginSchema);
  if (!parsed.ok) return parsed.response;

  const { email, password } = parsed.data;
  const rateKey = `login:${getClientIp(request)}:${email}`;
  const rateCheck = checkRateLimit(rateKey, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS);

  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos de inicio de sesión. Intenta más tarde." },
      {
        status: 429,
        headers: { "Retry-After": String(rateCheck.retryAfterSeconds) },
      }
    );
  }

  const user = await findAuthUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
  }

  resetRateLimit(rateKey);

  await setSessionCookie({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
}

export async function handleLogout() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}

export async function handleMe() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
  return NextResponse.json({ user: session });
}
