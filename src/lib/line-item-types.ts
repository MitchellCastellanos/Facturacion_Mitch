/** Tipos de línea para formularios de factura/cotización (agencia web). */
export const FORM_LINE_ITEM_TYPES = [
  { value: "DEVELOPMENT", label: "Desarrollo" },
  { value: "DESIGN", label: "Diseño" },
  { value: "HOSTING", label: "Hosting" },
  { value: "MAINTENANCE", label: "Mantenimiento" },
  { value: "CONSULTING", label: "Consultoría" },
  { value: "OTHER", label: "Otro" },
] as const;

export type FormLineItemType = (typeof FORM_LINE_ITEM_TYPES)[number]["value"];

export const LINE_ITEM_TYPE_LABELS: Record<string, string> = {
  DEVELOPMENT: "Desarrollo",
  DESIGN: "Diseño",
  HOSTING: "Hosting",
  MAINTENANCE: "Mantenimiento",
  CONSULTING: "Consultoría",
  OTHER: "Otro",
  LABOUR: "Mano de obra",
  PART: "Repuesto",
};

export const LINE_ITEM_TYPES_FOR_VALIDATION = [
  "DEVELOPMENT",
  "DESIGN",
  "HOSTING",
  "MAINTENANCE",
  "CONSULTING",
  "OTHER",
  "LABOUR",
  "PART",
] as const;
