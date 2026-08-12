"use client";

import { useState } from "react";
import type { Direction } from "@prisma/client";
import {
  CLASIFICACION_LABELS,
  ESTADO_LABELS,
  TIPO_BP_OPR_LABELS,
  TIPO_SOLICITUD_LABELS,
  TRIMESTRE_LABELS,
  enumOptions,
} from "@/lib/labels";

export interface InitiativeFormValues {
  title: string;
  directionId: string;
  tipoBpOpr: string;
  clasificacion: string;
  estado: string;
  esfuerzo: string;
  prioridad: string;
  trimestre: string;
  liderTI: string;
  liderNegocio: string;
  tipoSolicitud: string;
  director: string;
  businessPartner: string;
}

interface InitiativeFormProps {
  directions: Direction[];
  initialValues: InitiativeFormValues;
  disabled?: boolean;
  submitLabel: string;
  onSubmit: (values: InitiativeFormValues) => Promise<void>;
}

export function InitiativeForm({
  directions,
  initialValues,
  disabled = false,
  submitLabel,
  onSubmit,
}: InitiativeFormProps) {
  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof InitiativeFormValues>(key: K, v: string) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error al guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card grid grid-cols-1 gap-4 sm:grid-cols-2">
      {error && (
        <p className="sm:col-span-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="sm:col-span-2">
        <label className="label">Nombre de la iniciativa</label>
        <input
          className="input"
          required
          disabled={disabled}
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </div>

      <div>
        <label className="label">Dirección</label>
        <select
          className="input"
          required
          disabled={disabled}
          value={values.directionId}
          onChange={(e) => set("directionId", e.target.value)}
        >
          <option value="">Seleccionar...</option>
          {directions.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Tipo (BP/OPR)</label>
        <select
          className="input"
          disabled={disabled}
          value={values.tipoBpOpr}
          onChange={(e) => set("tipoBpOpr", e.target.value)}
        >
          <option value="">—</option>
          {enumOptions(TIPO_BP_OPR_LABELS).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Clasificación</label>
        <select
          className="input"
          disabled={disabled}
          value={values.clasificacion}
          onChange={(e) => set("clasificacion", e.target.value)}
        >
          {enumOptions(CLASIFICACION_LABELS).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Estado</label>
        <select
          className="input"
          disabled={disabled}
          value={values.estado}
          onChange={(e) => set("estado", e.target.value)}
        >
          {enumOptions(ESTADO_LABELS).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Trimestre</label>
        <select
          className="input"
          disabled={disabled}
          value={values.trimestre}
          onChange={(e) => set("trimestre", e.target.value)}
        >
          {enumOptions(TRIMESTRE_LABELS).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Esfuerzo (1-5)</label>
        <input
          className="input"
          type="number"
          min={1}
          max={5}
          disabled={disabled}
          value={values.esfuerzo}
          onChange={(e) => set("esfuerzo", e.target.value)}
        />
      </div>

      <div>
        <label className="label">Prioridad</label>
        <input
          className="input"
          type="number"
          min={1}
          disabled={disabled}
          value={values.prioridad}
          onChange={(e) => set("prioridad", e.target.value)}
        />
      </div>

      <div>
        <label className="label">Tipo de Solicitud</label>
        <select
          className="input"
          disabled={disabled}
          value={values.tipoSolicitud}
          onChange={(e) => set("tipoSolicitud", e.target.value)}
        >
          <option value="">—</option>
          {enumOptions(TIPO_SOLICITUD_LABELS).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Líder TI</label>
        <input
          className="input"
          disabled={disabled}
          value={values.liderTI}
          onChange={(e) => set("liderTI", e.target.value)}
        />
      </div>

      <div>
        <label className="label">Líder de Negocio</label>
        <input
          className="input"
          disabled={disabled}
          value={values.liderNegocio}
          onChange={(e) => set("liderNegocio", e.target.value)}
        />
      </div>

      <div>
        <label className="label">Director responsable</label>
        <input
          className="input"
          disabled={disabled}
          value={values.director}
          onChange={(e) => set("director", e.target.value)}
        />
      </div>

      <div>
        <label className="label">Business Partner</label>
        <input
          className="input"
          disabled={disabled}
          value={values.businessPartner}
          onChange={(e) => set("businessPartner", e.target.value)}
        />
      </div>

      {!disabled && (
        <div className="sm:col-span-2">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Guardando..." : submitLabel}
          </button>
        </div>
      )}
    </form>
  );
}
