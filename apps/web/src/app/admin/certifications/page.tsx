"use client";

import { useEffect, useState } from "react";
import { Eye, FileUp, Trash2, X } from "lucide-react";

interface CertificationItem {
  id: string;
  titleI18n: { es?: string; en?: string };
  issuer: string;
  issueDate: string;
  category: string;
  credentialId?: string | null;
  verifyUrl?: string | null;
  allowDownload: boolean;
  isVisible: boolean;
  fileAsset?: {
    id: string;
    originalName: string;
    sizeBytes: number;
  } | null;
}

const inputCls =
  "mt-1.5 w-full rounded-[2px] border border-[rgba(205,196,186,0.24)] bg-black px-3 py-2 text-sm text-[#cdc4ba] outline-none transition focus:border-[#ce5e32]";
const labelCls =
  "font-mono-tech block text-[11px] tracking-[0.14em] text-[#958f87] uppercase";

export default function AdminCertificationsPage() {
  const [items, setItems] = useState<CertificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewAssetId, setPreviewAssetId] = useState<string | null>(null);

  const [titleEs, setTitleEs] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("2026-01-01");
  const [category, setCategory] = useState("Cloud");
  const [credentialId, setCredentialId] = useState("");
  const [verifyUrl, setVerifyUrl] = useState("");
  const [allowDownload, setAllowDownload] = useState(true);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  async function reloadCertifications() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/certifications");
      const data = await res.json();
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/certifications")
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
  }, []);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append(
        "metadata",
        JSON.stringify({
          titleI18n: { es: titleEs, en: titleEn },
          issuer,
          issueDate,
          category,
          credentialId,
          verifyUrl,
          allowDownload,
          isVisible: true,
          sortOrder: items.length,
          skills: [],
        })
      );
      if (pdfFile) {
        formData.append("file", pdfFile);
      }

      const res = await fetch("/api/admin/certifications", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al guardar certificación.");
        return;
      }

      setTitleEs("");
      setTitleEn("");
      setIssuer("");
      setCredentialId("");
      setVerifyUrl("");
      setPdfFile(null);
      await reloadCertifications();
    } catch {
      setError("Error de conexión al subir certificación.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/certifications/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center gap-3 text-xs tracking-[0.2em] text-[#958f87] uppercase">
        <span className="font-mono-tech text-[#ce5e32]">03 //</span>
        <span>Bóveda Documental</span>
        <span className="h-px flex-1 bg-[rgba(205,196,186,0.14)]" />
      </div>
      <h1 className="font-display mt-3 text-3xl font-normal text-[#cdc4ba]">
        Certificaciones y PDFs
      </h1>
      <p className="mt-1 text-sm text-[#958f87]">
        Sube los PDFs reales de tus certificaciones para mostrarlos en el visor modal interactivo.
      </p>

      <form
        onSubmit={handleCreate}
        className="mt-6 space-y-4 rounded-[2px] border border-[rgba(205,196,186,0.22)] bg-[#0a0a0a] p-6"
      >
        <h2 className="font-mono-tech text-xs tracking-[0.14em] text-[#ce5e32] uppercase">
          Agregar nueva certificación
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls}>Título (ES)</label>
            <input
              required
              value={titleEs}
              onChange={(e) => setTitleEs(e.target.value)}
              placeholder="Ej. Arquitecto Cloud Certificado"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Title (EN)</label>
            <input
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="Ex. Certified Cloud Architect"
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className={labelCls}>Entidad Emisora</label>
            <input
              required
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              placeholder="AWS / Google / Coursera"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Categoría</label>
            <input
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Fecha de Emisión</label>
            <input
              type="date"
              required
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls}>ID de Credencial</label>
            <input
              value={credentialId}
              onChange={(e) => setCredentialId(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>URL de Verificación</label>
            <input
              value={verifyUrl}
              onChange={(e) => setVerifyUrl(e.target.value)}
              placeholder="https://..."
              className={inputCls}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2px] border border-dashed border-[rgba(205,196,186,0.28)] bg-black p-4">
          <div>
            <label className={labelCls}>Archivo PDF del certificado (máx. 10 MB)</label>
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              className="mt-1.5 text-xs text-[#b0a9a0]"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-[#cdc4ba]">
            <input
              type="checkbox"
              checked={allowDownload}
              onChange={(e) => setAllowDownload(e.target.checked)}
            />
            Permitir descarga directa al visitante
          </label>
        </div>

        {error ? (
          <div className="rounded-[2px] border border-[#ce5e32] bg-[rgba(206,94,50,0.12)] px-4 py-2.5 text-xs text-[#cdc4ba]">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-[2px] border border-[#cdc4ba] bg-[#cdc4ba] px-5 py-2.5 text-xs font-medium tracking-[0.14em] text-black uppercase hover:opacity-85 disabled:opacity-50"
        >
          <FileUp className="h-3.5 w-3.5" />
          {submitting ? "Subiendo..." : "Guardar Certificación"}
        </button>
      </form>

      <section className="mt-8 space-y-3">
        <h2 className="font-mono-tech text-xs tracking-[0.16em] text-[#958f87] uppercase">
          Certificaciones guardadas
        </h2>
        {loading ? (
          <p className="text-sm text-[#958f87]">Cargando...</p>
        ) : items.length === 0 ? (
          <p className="rounded-[2px] border border-[rgba(205,196,186,0.2)] bg-[#0a0a0a] p-6 text-sm text-[#958f87]">
            Aún no hay certificaciones cargadas.
          </p>
        ) : (
          items.map((cert) => (
            <div
              key={cert.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-[2px] border border-[rgba(205,196,186,0.2)] bg-[#0a0a0a] p-4"
            >
              <div>
                <p className="font-medium text-[#cdc4ba]">
                  {cert.titleI18n.es || cert.titleI18n.en}
                </p>
                <p className="font-mono-tech mt-0.5 text-xs text-[#958f87]">
                  {cert.issuer} · {cert.category} · {cert.issueDate.slice(0, 10)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {cert.fileAsset ? (
                  <button
                    type="button"
                    onClick={() => setPreviewAssetId(cert.fileAsset!.id)}
                    className="inline-flex items-center gap-1.5 rounded-[2px] border border-[rgba(205,196,186,0.3)] px-3 py-1.5 text-[11px] font-medium tracking-[0.1em] text-[#cdc4ba] uppercase hover:bg-[rgba(205,196,186,0.08)]"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Ver PDF
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => handleDelete(cert.id)}
                  className="inline-flex items-center gap-1.5 rounded-[2px] border border-[#ce5e32] px-3 py-1.5 text-[11px] font-medium tracking-[0.1em] text-[#ce5e32] uppercase hover:bg-[#ce5e32] hover:text-black"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {previewAssetId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2px] border border-[rgba(205,196,186,0.35)] bg-[#0a0a0a]">
            <div className="flex items-center justify-between border-b border-[rgba(205,196,186,0.2)] px-4 py-3">
              <span className="font-mono-tech text-xs tracking-[0.14em] text-[#cdc4ba] uppercase">
                Vista Previa PDF
              </span>
              <button
                type="button"
                onClick={() => setPreviewAssetId(null)}
                className="rounded-[2px] border border-[rgba(205,196,186,0.24)] p-1 text-[#cdc4ba] hover:bg-[rgba(205,196,186,0.1)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <iframe
              src={`/api/assets/${previewAssetId}`}
              className="h-full w-full flex-1 bg-black"
              title="Visor PDF Certificado"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
