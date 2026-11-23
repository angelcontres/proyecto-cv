"use client";

import { useEffect, useState } from "react";
import { Check, Trash2 } from "lucide-react";

interface MessageItem {
  id: string;
  senderName: string;
  senderEmail: string;
  company?: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [items, setItems] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/messages")
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

  async function toggleRead(item: MessageItem) {
    const res = await fetch(`/api/admin/messages/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: !item.isRead }),
    });
    if (res.ok) {
      setItems((prev) =>
        prev.map((m) => (m.id === item.id ? { ...m, isRead: !item.isRead } : m))
      );
    }
  }

  async function deleteMessage(id: string) {
    const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((m) => m.id !== id));
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center gap-3 text-xs tracking-[0.2em] text-[#958f87] uppercase">
        <span className="font-mono-tech text-[#ce5e32]">04 //</span>
        <span>Contacto</span>
        <span className="h-px flex-1 bg-[rgba(205,196,186,0.14)]" />
      </div>
      <h1 className="font-display mt-3 text-3xl font-normal text-[#cdc4ba]">
        Bandeja de Mensajes
      </h1>
      <p className="mt-1 text-sm text-[#958f87]">
        Mensajes enviados por reclutadores desde el formulario de contacto de tu CV.
      </p>

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="text-sm text-[#958f87]">Cargando mensajes...</p>
        ) : items.length === 0 ? (
          <p className="rounded-[2px] border border-[rgba(205,196,186,0.2)] bg-[#0a0a0a] p-6 text-sm text-[#958f87]">
            No has recibido mensajes aún.
          </p>
        ) : (
          items.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-[2px] border p-5 ${
                msg.isRead
                  ? "border-[rgba(205,196,186,0.2)] bg-[#0a0a0a]"
                  : "border-[#ce5e32] bg-[#0a0a0a]"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-[#cdc4ba]">{msg.subject}</p>
                  <p className="font-mono-tech mt-0.5 text-xs text-[#958f87]">
                    {msg.senderName} ({msg.senderEmail})
                    {msg.company ? ` · ${msg.company}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleRead(msg)}
                    className="inline-flex items-center gap-1 rounded-[2px] border border-[rgba(205,196,186,0.25)] px-3 py-1.5 text-[11px] font-medium tracking-[0.1em] text-[#cdc4ba] uppercase hover:bg-[rgba(205,196,186,0.08)]"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {msg.isRead ? "Marcar no leído" : "Marcar leído"}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMessage(msg.id)}
                    className="inline-flex items-center gap-1 rounded-[2px] border border-[#ce5e32] px-3 py-1.5 text-[11px] font-medium tracking-[0.1em] text-[#ce5e32] uppercase hover:bg-[#ce5e32] hover:text-black"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-[#b0a9a0]">{msg.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
