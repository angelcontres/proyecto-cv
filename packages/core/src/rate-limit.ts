interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Limitador de frecuencia en memoria por clave (ej. IP + ruta).
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
  now: number = Date.now()
): RateLimitResult {
  const current = buckets.get(key);

  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - 1),
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (current.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - current.count),
    retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

/**
 * Limpia el registro de rate limit para un identificador (útil tras login exitoso o en tests).
 */
export function resetRateLimit(key: string): void {
  buckets.delete(key);
}
