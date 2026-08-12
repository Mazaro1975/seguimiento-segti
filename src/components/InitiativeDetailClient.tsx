"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Direction } from "@prisma/client";
import { useRole } from "./RoleContext";
import { InitiativeForm, type InitiativeFormValues } from "./InitiativeForm";
import { SeguimientoTimeline } from "./SeguimientoTimeline";
import type { InitiativeWithRelations } from "@/lib/types";

function toFormValues(initiative: InitiativeWithRelations): InitiativeFormValues {
  return {
    title: initiative.title,
    directionId: initiative.directionId,
    tipoBpOpr: initiative.tipoBpOpr ?? "",
    clasificacion: initiative.clasificacion,
    estado: initiative.estado,
    esfuerzo: initiative.esfuerzo?.toString() ?? "",
    prioridad: initiative.prioridad?.toString() ?? "",
    trimestre: initiative.trimestre,
    liderTI: initiative.liderTI ?? "",
    liderNegocio: initiative.liderNegocio ?? "",
    tipoSolicitud: initiative.tipoSolicitud ?? "",
    director: initiative.director ?? "",
    businessPartner: initiative.businessPartner ?? "",
  };
}

export function InitiativeDetailClient({
  initiative,
  directions,
}: {
  initiative: InitiativeWithRelations;
  directions: Direction[];
}) {
  const router = useRouter();
  const { permissions } = useRole();
  const [busy, setBusy] = useState(false);

  async function handleSave(values: InitiativeFormValues) {
    const res = await fetch(`/api/initiatives/${initiative.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        esfuerzo: values.esfuerzo === "" ? null : Number(values.esfuerzo),
        prioridad: values.prioridad === "" ? null : Number(values.prioridad),
        tipoBpOpr: values.tipoBpOpr || null,
        tipoSolicitud: values.tipoSolicitud || null,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.errors?.[0] ?? "No se pudo guardar.");
    }
    router.refresh();
  }

  async function handleClone() {
    setBusy(true);
    try {
      const res = await fetch(`/api/initiatives/${initiative.id}/clone`, { method: "POST" });
      const body = await res.json();
      if (res.ok) router.push(`/iniciativas/${body.id}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleArchiveToggle() {
    setBusy(true);
    try {
      const res = await fetch(`/api/initiatives/${initiative.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: !initiative.archivedAt }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const readOnly = !permissions.canEdit;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{initiative.title}</h2>
          {initiative.archivedAt && (
            <span className="badge bg-slate-500">Archivada</span>
          )}
        </div>
        <div className="flex gap-2">
          {permissions.canClone && (
            <button className="btn-secondary" onClick={handleClone} disabled={busy}>
              Clonar
            </button>
          )}
          {permissions.canArchive && (
            <button className="btn-danger" onClick={handleArchiveToggle} disabled={busy}>
              {initiative.archivedAt ? "Reactivar" : "Archivar"}
            </button>
          )}
        </div>
      </div>

      <InitiativeForm
        directions={directions}
        initialValues={toFormValues(initiative)}
        disabled={readOnly}
        submitLabel="Guardar cambios"
        onSubmit={handleSave}
      />

      <SeguimientoTimeline
        initiativeId={initiative.id}
        seguimientos={initiative.seguimientos}
        canAdd={permissions.canAddSeguimiento}
      />
    </div>
  );
}
