import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getEnvConfig } from "@cv/core";

export const SESSION_COOKIE_NAME = "cv_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 días

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

function getSecretKey(): Uint8Array {
  const { authSecret } = getEnvConfig();
  return new TextEncoder().encode(authSecret);
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    email: payload.email,
    name: payload.name,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });

    if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
      return null;
    }

    return {
      userId: payload.sub,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : "",
      role: typeof payload.role === "string" ? payload.role : "USER",
    };
  } catch {
    return null;
  }
}

export async function getServerSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  return verifySessionToken(token);
}

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await signSessionToken(payload);
  const cookieStore = await cookies();
  const { isProd } = getEnvConfig();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
