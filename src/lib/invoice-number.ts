import type { Prisma } from "@prisma/client";

const LEGACY_INV_SEQ = /^INV-(\d+)$/i;
const LEGACY_COT_SEQ = /^COT-(\d+)$/i;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function maxSequenceForPrefix(numbers: string[], prefix: string): number {
  const pattern = new RegExp(`^${escapeRegex(prefix)}-(\\d+)$`, "i");
  let max = 0;
  for (const n of numbers) {
    const m = n.trim().match(pattern);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max;
}

function maxLegacySequence(numbers: string[], pattern: RegExp): number {
  let max = 0;
  for (const n of numbers) {
    const m = n.trim().match(pattern);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max;
}

export function formatNumberWithPrefix(prefix: string, sequence: number): string {
  return `${prefix}-${String(sequence).padStart(4, "0")}`;
}

/** COT-GABAN a partir de INV-GABAN (o COT-{prefix} genérico). */
export function quotePrefixFromInvoicePrefix(invoicePrefix: string): string {
  const upper = invoicePrefix.toUpperCase();
  if (upper.startsWith("INV-")) return `COT-${invoicePrefix.slice(4)}`;
  if (upper.startsWith("INV")) return invoicePrefix.replace(/^INV/i, "COT");
  return `COT-${invoicePrefix}`;
}

/** Siguiente número de factura para un perfil de facturación. */
export async function allocateNextInvoiceNumber(
  tx: Prisma.TransactionClient,
  shopId: string,
  invoicePrefix: string
): Promise<string> {
  const rows = await tx.invoice.findMany({
    where: { shopId },
    select: { invoiceNumber: true },
  });
  const numbers = rows.map((r) => r.invoiceNumber);

  const prefixed = maxSequenceForPrefix(numbers, invoicePrefix);
  if (prefixed > 0 || numbers.some((n) => n.toUpperCase().startsWith(`${invoicePrefix.toUpperCase()}-`))) {
    return formatNumberWithPrefix(invoicePrefix, prefixed + 1);
  }

  // Compatibilidad con numeración legacy INV-0001 sin prefijo de empresa
  const legacy = maxLegacySequence(numbers, LEGACY_INV_SEQ);
  if (invoicePrefix.toUpperCase() === "INV" && legacy > 0) {
    return formatNumberWithPrefix("INV", legacy + 1);
  }

  return formatNumberWithPrefix(invoicePrefix, 1);
}

/** Siguiente número de cotización para un perfil de facturación. */
export async function allocateNextQuoteNumber(
  tx: Prisma.TransactionClient,
  shopId: string,
  invoicePrefix: string
): Promise<string> {
  const quotePrefix = quotePrefixFromInvoicePrefix(invoicePrefix);
  const rows = await tx.quote.findMany({
    where: { shopId },
    select: { quoteNumber: true },
  });
  const numbers = rows.map((r) => r.quoteNumber);

  const prefixed = maxSequenceForPrefix(numbers, quotePrefix);
  if (prefixed > 0 || numbers.some((n) => n.toUpperCase().startsWith(`${quotePrefix.toUpperCase()}-`))) {
    return formatNumberWithPrefix(quotePrefix, prefixed + 1);
  }

  const legacy = maxLegacySequence(numbers, LEGACY_COT_SEQ);
  if (quotePrefix.toUpperCase() === "COT" && legacy > 0) {
    return formatNumberWithPrefix("COT", legacy + 1);
  }

  return formatNumberWithPrefix(quotePrefix, 1);
}

export function isUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "P2002"
  );
}

/** @deprecated Usar formatNumberWithPrefix */
export function formatInvoiceNumber(sequence: number): string {
  return formatNumberWithPrefix("INV", sequence);
}

/** @deprecated Usar formatNumberWithPrefix */
export function formatQuoteNumber(sequence: number): string {
  return formatNumberWithPrefix("COT", sequence);
}
