import type { Prisma } from "@prisma/client";
import { billingProfileToIssuer } from "@/lib/billing-profile-document";
import { shouldSuppressTaxesOnPdf, type InvoicePaymentMode } from "@/lib/invoice-payments";

type InvoiceWithRelations = Prisma.InvoiceGetPayload<{
  include: {
    client: true;
    vehicle: true;
    lineItems: true;
    shop: true;
    billingProfile: true;
  };
}> & {
  paymentMode?: InvoicePaymentMode | null;
};

/** Serializa Decimals de Prisma para generateInvoicePdf / InvoiceDocument. */
export function serializeInvoiceForPdf(invoice: InvoiceWithRelations) {
  const suppressTaxes =
    invoice.paymentMode != null
      ? shouldSuppressTaxesOnPdf(invoice.paymentMode)
      : false;

  const issuer = billingProfileToIssuer(invoice.billingProfile, invoice.shop);

  return {
    ...invoice,
    shop: issuer,
    projectName: invoice.projectName,
    subtotal: invoice.subtotal.toString(),
    taxRate: invoice.taxRate.toString(),
    taxAmount: invoice.taxAmount.toString(),
    total: invoice.total.toString(),
    suppressTaxes,
    lineItems: invoice.lineItems.map((item) => ({
      ...item,
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toString(),
      lineTotal: item.lineTotal.toString(),
    })),
  };
}
