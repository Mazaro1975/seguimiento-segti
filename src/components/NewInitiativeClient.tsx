"use client";

import { useRouter } from "next/navigation";
import type { Direction } from "@prisma/client";
import { InitiativeForm, type InitiativeFormValues } from "./InitiativeForm";

const EMPTY_VALUES: InitiativeFormValues = {
  title: "",
  directionId: "",
  tipoBpOpr: "",
  clasificacion: "SIN_CLASIFICAR",
  estado: "SIN_ESTADO",
  esfuerzo: "",
  prioridad: "",
  trimestre: "SIN_Q",
  liderTI: "",
  liderNegocio: "",
  tipoSolicitud: "",
  director: "",
  businessPartner: "",
};

export function NewInitiativeClient({ directions }: { directions: Direction[] }) {
  const router = useRouter();

  async function handleCreate(values: InitiativeFormValues) {
    const res = await fetch("/api/initiatives", {
      method: "POST",
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
      throw new Error(body.errors?.[0] ?? "No se pudo crear la iniciativa.");
    }
    const created = await res.json();
    router.push(`/iniciativas/${created.id}`);
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Nueva iniciativa</h2>
      <InitiativeForm
        directions={directions}
        initialValues={EMPTY_VALUES}
        submitLabel="Crear iniciativa"
        onSubmit={handleCreate}
      />
    </div>
  );
}
