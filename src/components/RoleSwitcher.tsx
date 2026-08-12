"use client";

import { ROLES, ROLE_LABELS } from "@/lib/roles";
import { useRole } from "./RoleContext";

export function RoleSwitcher() {
  const { role, setRole } = useRole();

  return (
    <div>
      <label className="label" htmlFor="role-switcher">
        Rol activo
      </label>
      <select
        id="role-switcher"
        className="input"
        value={role}
        onChange={(e) => setRole(e.target.value as (typeof ROLES)[number])}
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>
      <p className="mt-1 text-[11px] text-slate-400">
        MVP local: sin autenticación real, solo controla qué acciones se muestran.
      </p>
    </div>
  );
}
