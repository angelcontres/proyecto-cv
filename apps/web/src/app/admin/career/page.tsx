"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type Tab = "experiences" | "educations" | "projects" | "skills";

interface GenericItem {
  id: string;
  company?: string;
  institution?: string;
  name?: string;
  category?: string;
  level?: number;
  roleI18n?: { es?: string; en?: string };
  degreeI18n?: { es?: string; en?: string };
  titleI18n?: { es?: string; en?: string };
}

const inputCls =
  "rounded-[2px] border border-[rgba(205,196,186,0.24)] bg-black px-3 py-2 text-sm text-[#cdc4ba] outline-none transition focus:border-[#ce5e32]";

export default function AdminCareerPage() {
  const [tab, setTab] = useState<Tab>("experiences");
  const [items, setItems] = useState<GenericItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [primaryField, setPrimaryField] = useState("");
  const [secondaryField, setSecondaryField] = useState("");
  const [startDate, setStartDate] = useState("2024-01-01");
  const [skillLevel, setSkillLevel] = useState(85);
  const [error, setError] = useState<string | null>(null);

  async function reloadTabItems(activeTab: Tab) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${activeTab}`);
      const data = await res.json();
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/${tab}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setItems(data.items || []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab]);

  async function handleQuickAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    let payload: Record<string, unknown> = {};
    if (tab === "experiences") {
      payload = {
        company: primaryField,
        roleI18n: { es: secondaryField, en: secondaryField },
        summaryI18n: { es: "", en: "" },
        startDate,
        isCurrent: true,
      };
    } else if (tab === "educations") {
      payload = {
        institution: primaryField,
        degreeI18n: { es: secondaryField, en: secondaryField },
        summaryI18n: { es: "", en: "" },
        startDate,
        isCurrent: false,
      };
    } else if (tab === "projects") {
      payload = {
        titleI18n: { es: primaryField, en: primaryField },
        summaryI18n: { es: secondaryField, en: secondaryField },
        tags: [],
      };
    } else {
      payload = {
        name: primaryField,
        category: secondaryField || "General",
        level: skillLevel,
      };
    }

    const res = await fetch(`/api/admin/${tab}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Error al agregar registro.");
      return;
    }

    setPrimaryField("");
    setSecondaryField("");
    await reloadTabItems(tab);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/${tab}/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "experiences", label: "Experiencia" },
    { id: "educations", label: "Educación" },
    { id: "projects", label: "Proyectos" },
    { id: "skills", label: "Habilidades" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center gap-3 text-xs tracking-[0.2em] text-[#958f87] uppercase">
        <span className="font-mono-tech text-[#ce5e32]">02 //</span>
        <span>Trayectoria y Stack</span>
        <span className="h-px flex-1 bg-[rgba(205,196,186,0.14)]" />
      </div>
      <h1 className="font-display mt-3 text-3xl font-normal text-[#cdc4ba]">
        Carrera, Proyectos y Habilidades
      </h1>
      <p className="mt-1 text-sm text-[#958f87]">
        Alimenta los datos estructurados que conectan con los widgets del Constructor Visual.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setLoading(true);
              setTab(t.id);
            }}
            className={`rounded-[2px] px-4 py-2 text-xs font-medium tracking-[0.14em] uppercase transition ${
              tab === t.id
                ? "border border-[#cdc4ba] bg-[#cdc4ba] text-black"
                : "border border-[rgba(205,196,186,0.22)] bg-[#0a0a0a] text-[#b0a9a0] hover:border-[rgba(205,196,186,0.45)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleQuickAdd}
        className="mt-6 grid gap-4 rounded-[2px] border border-[rgba(205,196,186,0.22)] bg-[#0a0a0a] p-5 md:grid-cols-4"
      >
        <input
          required
          value={primaryField}
          onChange={(e) => setPrimaryField(e.target.value)}
          placeholder={
            tab === "experiences"
              ? "Empresa"
              : tab === "educations"
                ? "Institución"
                : tab === "projects"
                  ? "Nombre del proyecto"
                  : "Habilidad (ej. TypeScript)"
          }
          className={inputCls}
        />
        <input
          required
          value={secondaryField}
          onChange={(e) => setSecondaryField(e.target.value)}
          placeholder={
            tab === "experiences"
              ? "Rol / Puesto"
              : tab === "educations"
                ? "Título / Carrera"
                : tab === "projects"
                  ? "Resumen breve"
                  : "Categoría (ej. Frontend)"
          }
          className={inputCls}
        />
        {tab === "experiences" || tab === "educations" ? (
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputCls}
          />
        ) : tab === "skills" ? (
          <input
            type="number"
            min={1}
            max={100}
            value={skillLevel}
            onChange={(e) => setSkillLevel(Number(e.target.value))}
            className={inputCls}
          />
        ) : (
          <div />
        )}
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 rounded-[2px] border border-[#cdc4ba] bg-[#cdc4ba] px-4 py-2 text-xs font-medium tracking-[0.14em] text-black uppercase hover:opacity-85"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar
        </button>
      </form>

      {error ? (
        <div className="mt-3 rounded-[2px] border border-[#ce5e32] bg-[rgba(206,94,50,0.12)] px-4 py-2 text-xs text-[#cdc4ba]">
          {error}
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="text-sm text-[#958f87]">Cargando...</p>
        ) : items.length === 0 ? (
          <p className="rounded-[2px] border border-[rgba(205,196,186,0.2)] bg-[#0a0a0a] p-6 text-sm text-[#958f87]">
            Sin registros en esta sección todavía.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-[2px] border border-[rgba(205,196,186,0.2)] bg-[#0a0a0a] p-4"
            >
              <div>
                <p className="font-medium text-[#cdc4ba]">
                  {item.company ||
                    item.institution ||
                    item.titleI18n?.es ||
                    item.name ||
                    "Registro"}
                </p>
                <p className="font-mono-tech mt-0.5 text-xs text-[#958f87]">
                  {item.roleI18n?.es || item.degreeI18n?.es || item.category || ""}
                  {typeof item.level === "number" ? ` · Nivel ${item.level}%` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="inline-flex items-center gap-1 rounded-[2px] border border-[#ce5e32] px-3 py-1.5 text-[11px] font-medium tracking-[0.1em] text-[#ce5e32] uppercase hover:bg-[#ce5e32] hover:text-black"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
