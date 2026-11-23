import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Award,
  Briefcase,
  ExternalLink,
  LayoutDashboard,
  Mail,
  Paintbrush,
  UserCircle,
} from "lucide-react";
import { getServerSession } from "@cv/api-auth";
import { LogoutButton } from "@web/components/admin/LogoutButton";

export const dynamic = "force-dynamic";

const navItems = [
  { href: "/admin", label: "Resumen", code: "00", icon: LayoutDashboard },
  { href: "/admin/profile", label: "Perfil e Idiomas", code: "01", icon: UserCircle },
  { href: "/admin/career", label: "Carrera y Skills", code: "02", icon: Briefcase },
  { href: "/admin/certifications", label: "Certificaciones PDF", code: "03", icon: Award },
  { href: "/admin/messages", label: "Mensajes", code: "04", icon: Mail },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-black text-[#cdc4ba]">
      <aside className="flex w-68 shrink-0 flex-col justify-between border-r border-[rgba(205,196,186,0.22)] bg-[#0a0a0a] p-5">
        <div>
          <div className="mb-6 border-b border-[rgba(205,196,186,0.14)] pb-4">
            <p className="font-mono-tech text-[11px] tracking-[0.18em] text-[#ce5e32] uppercase">
              CV Studio CMS
            </p>
            <p className="font-display mt-1 truncate text-lg text-[#cdc4ba]">{session.name}</p>
            <p className="font-mono-tech truncate text-[11px] text-[#958f87]">{session.email}</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 rounded-[2px] border border-transparent px-3 py-2.5 text-xs font-medium tracking-[0.1em] text-[#b0a9a0] uppercase transition hover:border-[rgba(205,196,186,0.22)] hover:bg-[rgba(205,196,186,0.05)] hover:text-[#cdc4ba]"
                >
                  <span className="font-mono-tech text-[10px] text-[#ce5e32]">{item.code}</span>
                  <Icon className="h-3.5 w-3.5 text-[#958f87]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-[2px] border border-dashed border-[rgba(205,196,186,0.25)] bg-black p-3.5">
            <div className="flex items-center gap-2 text-[11px] font-medium tracking-[0.12em] text-[#ce5e32] uppercase">
              <Paintbrush className="h-3.5 w-3.5" />
              Studio Visual (Fase 2)
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-[#958f87]">
              Lienzo libre conectado a tus datos bilingües y certificados.
            </p>
          </div>
        </div>

        <div className="space-y-2 border-t border-[rgba(205,196,186,0.14)] pt-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-[2px] px-3 py-2 text-xs font-medium tracking-[0.12em] text-[#b0a9a0] uppercase transition hover:bg-[rgba(205,196,186,0.06)] hover:text-[#cdc4ba]"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver sitio público
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
