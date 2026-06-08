import type { PrismaClient } from "@prisma/client";
import { BRAND } from "@/config/brand";

/** Crea o actualiza los perfiles de facturación definidos en BRAND.billingProfiles. */
export async function seedBillingProfiles(prisma: PrismaClient, shopId: string) {
  for (const profile of BRAND.billingProfiles) {
    await prisma.billingProfile.upsert({
      where: { shopId_code: { shopId, code: profile.code } },
      update: {
        legalName: profile.legalName,
        invoicePrefix: profile.invoicePrefix,
        isDefault: profile.isDefault,
        isActive: true,
      },
      create: {
        shopId,
        code: profile.code,
        legalName: profile.legalName,
        invoicePrefix: profile.invoicePrefix,
        isDefault: profile.isDefault,
        billingEmail: profile.isDefault ? BRAND.emails.billing : null,
        infoEmail: profile.isDefault ? BRAND.emails.info : null,
      },
    });
  }

  // Garantiza un solo perfil por defecto
  const defaults = await prisma.billingProfile.findMany({
    where: { shopId, isDefault: true },
    orderBy: { createdAt: "asc" },
  });
  if (defaults.length > 1) {
    const [, ...rest] = defaults;
    await prisma.billingProfile.updateMany({
      where: { id: { in: rest.map((p) => p.id) } },
      data: { isDefault: false },
    });
  }
}
