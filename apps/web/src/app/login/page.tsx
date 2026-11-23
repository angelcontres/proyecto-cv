"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "No se pudo iniciar sesión.");
        return;
      }

      router.push(nextPath.startsWith("/") ? nextPath : "/admin");
      router.refresh();
    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative w-full max-w-md rounded-[2px] border border-[rgba(205,196,186,0.3)] bg-[#0a0a0a] p-8">
      <span className="font-mono-tech pointer-events-none absolute top-2 left-2.5 text-xs text-[#6f6962]">
        +
      </span>
      <span className="font-mono-tech pointer-events-none absolute top-2 right-2.5 text-xs text-[#6f6962]">
        +
      </span>

      <div className="flex items-center gap-3 text-xs tracking-[0.18em] text-[#958f87] uppercase">
        <span className="font-mono-tech text-[#ce5e32]">00 //</span>
        <span>Autenticación</span>
        <span className="h-px flex-1 bg-[rgba(205,196,186,0.14)]" />
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[2px] border border-[rgba(205,196,186,0.3)] text-[#ce5e32]">
          <LockKeyhole className="h-4 w-4" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-normal text-[#cdc4ba]">Acceso Privado</h1>
          <p className="text-xs text-[#958f87]">Administra tu CV y certificaciones PDF</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="email"
            className="font-mono-tech block text-[11px] tracking-[0.14em] text-[#958f87] uppercase"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@proyecto-cv.local"
            className="mt-1.5 w-full rounded-[2px] border border-[rgba(205,196,186,0.24)] bg-black px-3.5 py-2.5 text-sm text-[#cdc4ba] outline-none transition focus:border-[#ce5e32]"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="font-mono-tech block text-[11px] tracking-[0.14em] text-[#958f87] uppercase"
          >
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1.5 w-full rounded-[2px] border border-[rgba(205,196,186,0.24)] bg-black px-3.5 py-2.5 text-sm text-[#cdc4ba] outline-none transition focus:border-[#ce5e32]"
          />
        </div>

        {error ? (
          <div className="rounded-[2px] border border-[#ce5e32] bg-[rgba(206,94,50,0.12)] px-3.5 py-2.5 text-xs text-[#cdc4ba]">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[2px] border border-[#cdc4ba] bg-[#cdc4ba] py-2.5 text-xs font-medium tracking-[0.16em] text-black uppercase transition hover:opacity-85 disabled:opacity-50"
        >
          {loading ? "Validando..." : "Iniciar Sesión"}
        </button>
      </form>

      <div className="mt-6 border-t border-[rgba(205,196,186,0.12)] pt-4 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#958f87] transition hover:text-[#cdc4ba]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a la página pública
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-12">
      <Suspense fallback={<div className="text-sm text-[#958f87]">Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
