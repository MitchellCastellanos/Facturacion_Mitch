/**
 * Marca y dominio de la agencia en producción.
 * Las variables de Vercel tienen prioridad; esto es fallback y documentación en código.
 */
export const BRAND = {
  domain: "gabansolutions.ca",
  appUrl: "https://gabansolutions.ca",
  shopId: "shop-gaban-agency",
  shopName: "GABAN Solutions",
  /** Logo PNG sin fondo — favicon, homepage, emails de respaldo */
  logoPath: "/logo.png",
  bookingSlug: "gaban-solutions",
  timezone: "America/Montreal",
  emails: {
    contact: "info@gabansolutions.ca",
    billing: "billing@gabansolutions.ca",
    info: "info@gabansolutions.ca",
    providers: "providers@gabansolutions.ca",
    newsletter: "newsletter@gabansolutions.ca",
  },
  mailFrom: {
    invoices: "GABAN Solutions <billing@gabansolutions.ca>",
    reminders: "GABAN Solutions <info@gabansolutions.ca>",
    accounting: "GABAN Solutions <billing@gabansolutions.ca>",
    web: "GABAN Solutions <info@gabansolutions.ca>",
    fallback: "GABAN Solutions <info@gabansolutions.ca>",
  },
  /** Perfiles de facturación iniciales — se crean en bootstrap/seed */
  billingProfiles: [
    {
      code: "gaban",
      legalName: "GABAN Solutions",
      invoicePrefix: "INV-GABAN",
      isDefault: true,
    },
    {
      code: "msc",
      legalName: "Montreal Spider Co.",
      invoicePrefix: "INV-MSC",
      isDefault: false,
    },
  ],
  /** Hosts legacy que redirigen al dominio propio */
  legacyHosts: ["mecanico-management.vercel.app"],
} as const;

export function bookingPublicPath(slug = BRAND.bookingSlug): string {
  return `/book/${slug}`;
}

export function bookingPublicUrl(slug = BRAND.bookingSlug): string {
  return `${BRAND.appUrl}${bookingPublicPath(slug)}`;
}
