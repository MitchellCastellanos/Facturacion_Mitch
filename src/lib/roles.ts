import { z } from "zod";

/** Roles asignables en el panel de agencia (sin SUPER_ADMIN). */
export const SHOP_ROLE_VALUES = ["OWNER", "MEMBER", "VIEWER"] as const;
export type ShopRole = (typeof SHOP_ROLE_VALUES)[number];

export const SHOP_ROLE_SCHEMA = z.enum(SHOP_ROLE_VALUES);

export const ROLE_LABELS: Record<string, string> = {
  OWNER: "Administrador",
  MEMBER: "Miembro",
  VIEWER: "Solo lectura",
  MECHANIC: "Miembro", // legacy
  SUPER_ADMIN: "Super admin",
};

/** Roles con permiso de edición (incluye legacy MECHANIC). */
export const EDITOR_ROLES = ["OWNER", "MEMBER", "MECHANIC"] as const;

export function roleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role;
}

export function normalizeShopRole(role: string): ShopRole {
  if (role === "MECHANIC") return "MEMBER";
  if (SHOP_ROLE_VALUES.includes(role as ShopRole)) return role as ShopRole;
  return "VIEWER";
}
