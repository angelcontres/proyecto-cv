import Link from "next/link";
import { ArrowRight, FileCheck2, LayoutTemplate, ShieldCheck } from "lucide-react";
import { getPrimaryPublishedShowcase } from "@cv/api-cv";
import type { LocalizedText } from "@cv/contracts";
import { resolveLocalizedText } from "@cv/core";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const profile = await getPrimaryPublishedShowcase();
  const publishedLayout = profile?.pageLayouts?.[0];

  if (!profile || !publishedLayout) {
    return (
      <main className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center overflow-hidden px-6 py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-0 h-[420px] w-[420px] rounded-full border border-[rgba(205,196,186,0.14)]"
          style={{
            background: "radial-gradient(circle, rgba(206,94,50,0.14) 0%, transparent 68%)",
          }}
        />

        <div className="relative rounded-[2px] border border-[rgba(205,196,186,0.28)] bg-[#0a0a0a] p-8 md:p-12">
          <div className="flex items-center gap-3 text-xs tracking-[0.2em] text-[#958f87] uppercase">
            <span className="font-mono-tech text-[#ce5e32]">00 //</span>
            <span>Fase 1 Inicializada · Obsidian Edition</span>
            <span className="h-px flex-1 bg-[rgba(205,196,186,0.14)]" />
          </div>

          <h1 className="mt-6 text-4xl font-medium tracking-[-0.03em] text-[#cdc4ba] md:text-5xl">
            Tu Plataforma de CV Interactivo
            <span className="font-display mt-2 block text-2xl font-normal italic text-[#958f87] md:text-3xl">
              lista para arquitectura, datos y diseño desde cero.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[#b0a9a0]">
            Aún no hay una versión publicada del CV en PostgreSQL. Enciende Docker Desktop, aplica el
            esquema con Prisma e ingresa al panel privado para cargar tu trayectoria, subir PDFs de
            certificaciones y diseñar tu página.
          </p>

          <div className="mt-8 grid border-y border-[rgba(205,196,186,0.2)] md:grid-cols-3">
            <div className="p-5 md:pl-0">
              <div className="flex items-center gap-2 text-xs font-medium tracking-[0.14em] text-[#ce5e32] uppercase">
                <LayoutTemplate className="h-4 w-4" />
                <span>01 · Base de Datos</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#958f87]">
                Ejecuta <code className="font-mono-tech text-[#cdc4ba]">docker compose up -d</code> y{" "}
                <code className="font-mono-tech text-[#cdc4ba]">pnpm db:push</code>.
              </p>
            </div>
            <div className="border-t border-[rgba(205,196,186,0.2)] p-5 md:border-t-0 md:border-l">
              <div className="flex items-center gap-2 text-xs font-medium tracking-[0.14em] text-[#ce5e32] uppercase">
                <ShieldCheck className="h-4 w-4" />
                <span>02 · Seed Inicial</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#958f87]">
                Corre <code className="font-mono-tech text-[#cdc4ba]">pnpm db:seed</code> para crear
                tu usuario propietario y perfil inicial.
              </p>
            </div>
            <div className="border-t border-[rgba(205,196,186,0.2)] p-5 md:border-t-0 md:border-l md:pr-0">
              <div className="flex items-center gap-2 text-xs font-medium tracking-[0.14em] text-[#ce5e32] uppercase">
                <FileCheck2 className="h-4 w-4" />
                <span>03 · CMS &amp; PDFs</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#958f87]">
                Carga certificaciones PDF validadas y prepara el constructor libre de la Fase 2.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-[2px] border border-[#cdc4ba] bg-[#cdc4ba] px-5 py-3 text-xs font-medium tracking-[0.16em] text-black uppercase transition hover:opacity-85"
            >
              Iniciar Sesión
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-[2px] border border-[rgba(205,196,186,0.3)] px-5 py-3 text-xs font-medium tracking-[0.16em] text-[#cdc4ba] uppercase transition hover:bg-[rgba(205,196,186,0.08)]"
            >
              Panel de Administración
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const info = (profile.localizedInfo || {}) as {
    fullName?: string;
    headline?: LocalizedText;
    bio?: LocalizedText;
    location?: string;
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="rounded-[2px] border border-[rgba(205,196,186,0.28)] bg-[#0a0a0a] p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono-tech text-xs tracking-[0.18em] text-[#ce5e32] uppercase">
              00 // DOSSIER PROFESIONAL
            </p>
            <h1 className="mt-2 text-4xl font-medium tracking-[-0.03em] text-[#cdc4ba]">
              {info.fullName || "Perfil Profesional"}
            </h1>
            <p className="font-display mt-1 text-xl italic text-[#b0a9a0]">
              {resolveLocalizedText(info.headline, "es")}
            </p>
            {info.location ? (
              <p className="font-mono-tech mt-2 text-xs text-[#958f87]">{info.location}</p>
            ) : null}
          </div>
          <Link
            href="/admin"
            className="rounded-[2px] border border-[rgba(205,196,186,0.3)] px-4 py-2 text-xs font-medium tracking-[0.14em] text-[#cdc4ba] uppercase hover:bg-[rgba(205,196,186,0.08)]"
          >
            Editar CV
          </Link>
        </div>
        {info.bio ? (
          <p className="mt-5 max-w-2xl border-t border-[rgba(205,196,186,0.12)] pt-5 text-sm leading-relaxed text-[#b0a9a0]">
            {resolveLocalizedText(info.bio, "es")}
          </p>
        ) : null}
      </header>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-[2px] border border-[rgba(205,196,186,0.22)] bg-[#0a0a0a] p-6">
          <h2 className="font-mono-tech text-xs tracking-[0.18em] text-[#958f87] uppercase">
            01 // Experiencia
          </h2>
          <div className="mt-5 space-y-4">
            {profile.experiences.map((exp) => (
              <div key={exp.id} className="border-l border-[#ce5e32] pl-4">
                <p className="font-medium text-[#cdc4ba]">
                  {resolveLocalizedText(exp.roleI18n as LocalizedText, "es")}
                </p>
                <p className="font-mono-tech text-xs text-[#958f87]">{exp.company}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2px] border border-[rgba(205,196,186,0.22)] bg-[#0a0a0a] p-6">
          <h2 className="font-mono-tech text-xs tracking-[0.18em] text-[#958f87] uppercase">
            02 // Certificaciones PDF
          </h2>
          <div className="mt-5 space-y-3">
            {profile.certifications.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center justify-between rounded-[2px] border border-[rgba(205,196,186,0.14)] bg-black p-3.5"
              >
                <div>
                  <p className="text-sm font-medium text-[#cdc4ba]">
                    {resolveLocalizedText(cert.titleI18n as LocalizedText, "es")}
                  </p>
                  <p className="font-mono-tech text-xs text-[#958f87]">{cert.issuer}</p>
                </div>
                {cert.fileAsset ? (
                  <a
                    href={`/api/assets/${cert.fileAsset.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-[2px] border border-[#ce5e32] px-3 py-1.5 font-mono-tech text-[11px] tracking-[0.12em] text-[#ce5e32] uppercase transition hover:bg-[#ce5e32] hover:text-black"
                  >
                    Ver PDF
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
