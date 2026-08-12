"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Seguimiento } from "@prisma/client";

export function SeguimientoTimeline({
  initiativeId,
  seguimientos,
  canAdd,
}: {
  initiativeId: string;
  seguimientos: Seguimiento[];
  canAdd: boolean;
}) {
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [autor, setAutor] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sorted = [...seguimientos].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/initiatives/${initiativeId}/seguimientos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto, fecha, autor: autor || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.errors?.[0] ?? "No se pudo guardar el seguimiento.");
      }
      setTexto("");
      setAutor("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">Historial de seguimientos</h3>

      {canAdd && (
        <form onSubmit={handleAdd} className="mb-4 flex flex-col gap-2 border-b border-slate-100 pb-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <input
              type="date"
              className="input w-40"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
            <input
              className="input flex-1"
              placeholder="Autor (opcional)"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
            />
          </div>
          <textarea
            className="input"
            rows={2}
            placeholder="Describe el avance..."
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
          <button type="submit" className="btn-primary self-start" disabled={saving}>
            {saving ? "Guardando..." : "Agregar seguimiento"}
          </button>
        </form>
      )}

      {sorted.length === 0 && (
        <p className="text-sm text-slate-400">Sin seguimientos registrados todavía.</p>
      )}

      <ol className="flex flex-col gap-3">
        {sorted.map((s) => (
          <li key={s.id} className="border-l-2 border-slate-200 pl-3">
            <p className="text-xs font-medium text-slate-500">
              {new Date(s.fecha).toLocaleDateString("es-CO")}
              {s.autor ? ` — ${s.autor}` : ""}
            </p>
            <p className="text-sm text-slate-800">{s.texto}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
