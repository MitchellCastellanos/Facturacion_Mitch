import { db } from "@/lib/db";
import type { BillingProfile } from "@prisma/client";

/** Perfil activo para crear/documentar; usa el indicado, el default o el primero disponible. */
export async function resolveBillingProfile(
  shopId: string,
  billingProfileId?: string | null
): Promise<BillingProfile> {
  if (billingProfileId) {
    const selected = await db.billingProfile.findFirst({
      where: { id: billingProfileId, shopId, isActive: true },
    });
    if (selected) return selected;
  }

  const defaultProfile = await db.billingProfile.findFirst({
    where: { shopId, isDefault: true, isActive: true },
  });
  if (defaultProfile) return defaultProfile;

  const anyProfile = await db.billingProfile.findFirst({
    where: { shopId, isActive: true },
    orderBy: { createdAt: "asc" },
  });
  if (!anyProfile) {
    throw new Error("No hay perfiles de facturación configurados. Crea uno en Configuración.");
  }
  return anyProfile;
}
