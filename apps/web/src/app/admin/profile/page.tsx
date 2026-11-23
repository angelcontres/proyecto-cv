"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";

interface ProfileFormState {
  slug: string;
  defaultLocale: "es" | "en";
  fullName: string;
  headlineEs: string;
  headlineEn: string;
  bioEs: string;
  bioEn: string;
  location: string;
  availabilityEs: string;
  availabilityEn: string;
  publicEmail: string;
  linkedin: string;
  github: string;
  website: string;
  x: string;
}

const INITIAL_STATE: ProfileFormState = {
  slug: "mi-cv",
  defaultLocale: "es",
  fullName: "",
  headlineEs: "",
  headlineEn: "",
  bioEs: "",
  bioEn: "",
  location: "",
  availabilityEs: "",
  availabilityEn: "",
  publicEmail: "",
  linkedin: "",
  github: "",
  website: "",
  x: "",
};

const inputCls =
  "mt-1.5 w-full rounded-[2px] border border-[rgba(205,196,186,0.24)] bg-black px-3 py-2 text-sm text-[#cdc4ba] outline-none transition focus:border-[#ce5e32]";
const labelCls =
  "font-mono-tech block text-[11px] tracking-[0.14em] text-[#958f87] uppercase";

export default function AdminProfilePage() {
  const [form, setForm] = useState<ProfileFormState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/profile")
      .then((res) => res.json())
      .then((data) => {
        const p = data.profile;
        if (!p) return;
        const info = p.localizedInfo || {};
        const social = p.socialLinks || {};
        setForm({
          slug: p.slug || "mi-cv",
          defaultLocale: p.defaultLocale === "en" ? "en" : "es",
          fullName: info.fullName || "",
          headlineEs: info.headline?.es || "",
          headlineEn: info.headline?.en || "",
          bioEs: info.bio?.es || "",
          bioEn: info.bio?.en || "",
          location: info.location || "",
          availabilityEs: info.availabilityBadge?.es || "",
          availabilityEn: info.availabilityBadge?.en || "",
          publicEmail: info.publicEmail || "",
          linkedin: social.linkedin || "",
          github: social.github || "",
          website: social.website || "",
          x: social.x || "",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: form.slug,
          defaultLocale: form.defaultLocale,
          localizedInfo: {
            fullName: form.fullName,
            headline: { es: form.headlineEs, en: form.headlineEn },
            bio: { es: form.bioEs, en: form.bioEn },
            location: form.location,
            availabilityBadge: { es: form.availabilityEs, en: form.availabilityEn },
            publicEmail: form.publicEmail,
          },
          socialLinks: {
            linkedin: form.linkedin,
            github: form.github,
            website: form.website,
            x: form.x,
          },
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setFeedback({ type: "err", text: result.error || "No se pudo guardar el perfil." });
      } else {
        setFeedback({ type: "ok", text: "Perfil actualizado correctamente." });
      }
    } catch {
      setFeedback({ type: "err", text: "Error de red al guardar." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-[#958f87]">Cargando perfil...</p>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center gap-3 text-xs tracking-[0.2em] text-[#958f87] uppercase">
        <span className="font-mono-tech text-[#ce5e32]">01 //</span>
        <span>Identidad</span>
        <span className="h-px flex-1 bg-[rgba(205,196,186,0.14)]" />
      </div>
      <h1 className="font-display mt-3 text-3xl font-normal text-[#cdc4ba]">
        Perfil Profesional e Idiomas
      </h1>
      <p className="mt-1 text-sm text-[#958f87]">
        Configura tu identidad pública en Español e Inglés.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-6 rounded-[2px] border border-[rgba(205,196,186,0.22)] bg-[#0a0a0a] p-6"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className={labelCls}>Nombre completo</label>
            <input
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Slug público (/u/...)</label>
            <input
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Idioma por defecto</label>
            <select
              value={form.defaultLocale}
              onChange={(e) =>
                setForm({ ...form, defaultLocale: e.target.value === "en" ? "en" : "es" })
              }
              className={inputCls}
            >
              <option value="es">Español (ES)</option>
              <option value="en">Inglés (EN)</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls}>Titular (ES)</label>
            <input
              value={form.headlineEs}
              onChange={(e) => setForm({ ...form, headlineEs: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Headline (EN)</label>
            <input
              value={form.headlineEn}
              onChange={(e) => setForm({ ...form, headlineEn: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls}>Biografía (ES)</label>
            <textarea
              rows={3}
              value={form.bioEs}
              onChange={(e) => setForm({ ...form, bioEs: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Summary / Bio (EN)</label>
            <textarea
              rows={3}
              value={form.bioEn}
              onChange={(e) => setForm({ ...form, bioEn: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls}>Ubicación</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Correo visible</label>
            <input
              type="email"
              value={form.publicEmail}
              onChange={(e) => setForm({ ...form, publicEmail: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls}>LinkedIn URL</label>
            <input
              value={form.linkedin}
              onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
              placeholder="https://linkedin.com/in/..."
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>GitHub URL</label>
            <input
              value={form.github}
              onChange={(e) => setForm({ ...form, github: e.target.value })}
              placeholder="https://github.com/..."
              className={inputCls}
            />
          </div>
        </div>

        {feedback ? (
          <div
            className={`rounded-[2px] border px-4 py-2.5 text-xs ${
              feedback.type === "ok"
                ? "border-[rgba(205,196,186,0.4)] bg-[rgba(205,196,186,0.08)] text-[#cdc4ba]"
                : "border-[#ce5e32] bg-[rgba(206,94,50,0.12)] text-[#cdc4ba]"
            }`}
          >
            {feedback.text}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-[2px] border border-[#cdc4ba] bg-[#cdc4ba] px-5 py-2.5 text-xs font-medium tracking-[0.14em] text-black uppercase transition hover:opacity-85 disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? "Guardando..." : "Guardar Perfil"}
        </button>
      </form>
    </div>
  );
}
