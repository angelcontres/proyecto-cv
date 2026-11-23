import Link from "next/link";
import { Award, Briefcase, GraduationCap, Layers, Mail, Sparkles } from "lucide-react";
import { getServerSession } from "@cv/api-auth";
import { getAdminOverviewCounts } from "@cv/api-cv";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getServerSession();
  const counts = session
    ? await getAdminOverviewCounts(session.userId)
    : {
        experiences: 0,
        educations: 0,
        projects: 0,
        skills: 0,
        certifications: 0,
        contactMessages: 0,
      };

  const cards = [
    { label: "Experiencias", value: counts.experiences, href: "/admin/career", icon: Briefcase },
    { label: "Educación", value: counts.educations, href: "/admin/career", icon: GraduationCap },
    { label: "Proyectos", value: counts.projects, href: "/admin/career", icon: Layers },
    { label: "Habilidades", value: counts.skills, href: "/admin/career", icon: Sparkles },
    { label: "Certificaciones PDF", value: counts.certifications, href: "/admin/certifications", icon: Award },
    { label: "Mensajes", value: counts.contactMessages, href: "/admin/messages", icon: Mail },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <header>
        <div className="flex items-center gap-3 text-xs tracking-[0.2em] text-[#958f87] uppercase">
          <span className="font-mono-tech text-[#ce5e32]">00 //</span>
          <span>Panel de Control</span>
          <span className="h-px flex-1 bg-[rgba(205,196,186,0.14)]" />
        </div>
        <h1 className="font-display mt-3 text-3xl font-normal text-[#cdc4ba]">
          Resumen del CV
        </h1>
        <p className="mt-1 text-sm text-[#958f87]">
          Gestiona tu información profesional bilingüe y tus archivos PDF de certificaciones.
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="rounded-[2px] border border-[rgba(205,196,186,0.22)] bg-[#0a0a0a] p-5 transition hover:border-[#ce5e32]"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono-tech text-[11px] tracking-[0.14em] text-[#958f87] uppercase">
                  {card.label}
                </span>
                <Icon className="h-4 w-4 text-[#ce5e32]" />
              </div>
              <p className="mt-4 text-3xl font-light text-[#cdc4ba]">{card.value}</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
