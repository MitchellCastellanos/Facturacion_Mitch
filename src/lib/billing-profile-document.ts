import type { BillingProfile, Shop } from "@prisma/client";
import type { ShopEmailConfig } from "@/lib/email-config";
import { shopToEmailConfig } from "@/lib/email-config";

export type DocumentIssuer = {
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  taxId?: string | null;
  logoUrl?: string | null;
  currency?: string | null;
};

/** Datos legales del emisor para PDF y correo (perfil de facturación + fallback del shop). */
export function billingProfileToIssuer(
  profile: BillingProfile | null | undefined,
  shop: Shop
): DocumentIssuer {
  if (!profile) {
    return {
      name: shop.name,
      address: shop.address,
      phone: shop.phone,
      email: shop.billingEmail ?? shop.email,
      taxId: shop.taxId,
      logoUrl: shop.logoUrl,
      currency: shop.currency,
    };
  }

  return {
    name: profile.legalName,
    address: profile.address ?? shop.address,
    phone: profile.phone ?? shop.phone,
    email: profile.billingEmail ?? profile.infoEmail ?? shop.billingEmail ?? shop.email,
    taxId: profile.taxId ?? shop.taxId,
    logoUrl: profile.logoUrl ?? shop.logoUrl,
    currency: shop.currency,
  };
}

export function billingProfileToEmailConfig(
  profile: BillingProfile | null | undefined,
  shop: Shop
): ShopEmailConfig {
  const issuer = billingProfileToIssuer(profile, shop);
  return shopToEmailConfig({
    name: issuer.name,
    email: issuer.email,
    billingEmail: profile?.billingEmail ?? shop.billingEmail,
    infoEmail: profile?.infoEmail ?? shop.infoEmail,
    providersEmail: shop.providersEmail,
    newsletterEmail: shop.newsletterEmail,
  });
}

export function formatWorkContext(input: {
  projectName?: string | null;
  vehicle?: { year: number; make: string; model: string } | null;
}): string | null {
  const project = input.projectName?.trim();
  if (project) return project;
  if (input.vehicle) {
    return `${input.vehicle.year} ${input.vehicle.make} ${input.vehicle.model}`;
  }
  return null;
}
