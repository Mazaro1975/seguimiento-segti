export const ROLES = [
  "COORDINADOR",
  "DIRECTOR",
  "BUSINESS_PARTNER",
  "LIDER_TI",
  "SOLO_LECTURA",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  COORDINADOR: "Coordinador",
  DIRECTOR: "Director",
  BUSINESS_PARTNER: "Business Partner",
  LIDER_TI: "Líder TI",
  SOLO_LECTURA: "Solo lectura",
};

export interface RolePermissions {
  canCreate: boolean;
  canEdit: boolean;
  canArchive: boolean;
  canClone: boolean;
  canAddSeguimiento: boolean;
  canManageCatalogs: boolean;
}

export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  COORDINADOR: {
    canCreate: true,
    canEdit: true,
    canArchive: true,
    canClone: true,
    canAddSeguimiento: true,
    canManageCatalogs: true,
  },
  DIRECTOR: {
    canCreate: true,
    canEdit: true,
    canArchive: true,
    canClone: true,
    canAddSeguimiento: true,
    canManageCatalogs: false,
  },
  BUSINESS_PARTNER: {
    canCreate: false,
    canEdit: true,
    canArchive: false,
    canClone: false,
    canAddSeguimiento: true,
    canManageCatalogs: false,
  },
  LIDER_TI: {
    canCreate: false,
    canEdit: true,
    canArchive: false,
    canClone: false,
    canAddSeguimiento: true,
    canManageCatalogs: false,
  },
  SOLO_LECTURA: {
    canCreate: false,
    canEdit: false,
    canArchive: false,
    canClone: false,
    canAddSeguimiento: false,
    canManageCatalogs: false,
  },
};

export const DEFAULT_ROLE: Role = "COORDINADOR";

export function getPermissions(role: Role): RolePermissions {
  return ROLE_PERMISSIONS[role];
}
