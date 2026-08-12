"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_ROLE, getPermissions, type Role, type RolePermissions } from "@/lib/roles";

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
  permissions: RolePermissions;
}

const RoleContext = createContext<RoleContextValue | null>(null);
const STORAGE_KEY = "segti-active-role";

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>(DEFAULT_ROLE);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Role | null;
    if (stored) setRoleState(stored);
  }, []);

  function setRole(next: Role) {
    setRoleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  const value = useMemo(
    () => ({ role, setRole, permissions: getPermissions(role) }),
    [role]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole debe usarse dentro de RoleProvider");
  return ctx;
}
