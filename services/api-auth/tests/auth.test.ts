import { describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimit } from "@cv/core";
import {
  hashPassword,
  signSessionToken,
  verifyPassword,
  verifySessionToken,
} from "../src/index";

describe("Microservicio api-auth", () => {
  it("hashea y verifica contraseñas correctamente", async () => {
    const hash = await hashPassword("MiClaveSegura123!");
    expect(hash).not.toBe("MiClaveSegura123!");
    expect(await verifyPassword("MiClaveSegura123!", hash)).toBe(true);
    expect(await verifyPassword("Incorrecta!", hash)).toBe(false);
  });

  it("firma y verifica tokens de sesión JWT", async () => {
    const token = await signSessionToken({
      userId: "user-uuid-1",
      email: "owner@example.com",
      name: "Owner",
      role: "OWNER",
    });

    const decoded = await verifySessionToken(token);
    expect(decoded).toEqual({
      userId: "user-uuid-1",
      email: "owner@example.com",
      name: "Owner",
      role: "OWNER",
    });

    expect(await verifySessionToken("token.invalido.123")).toBeNull();
  });

  it("bloquea solicitudes cuando se supera el umbral del rate limit", () => {
    const key = "login:127.0.0.1:test@example.com";
    resetRateLimit(key);

    const t0 = 1_000_000;
    expect(checkRateLimit(key, 2, 60_000, t0).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 60_000, t0 + 100).allowed).toBe(true);

    const third = checkRateLimit(key, 2, 60_000, t0 + 200);
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
    expect(checkRateLimit(key, 2, 60_000, t0 + 61_000).allowed).toBe(true);
  });
});
