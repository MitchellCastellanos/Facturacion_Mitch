"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import sharp from "sharp";
import { db } from "@/lib/db";
import { getShopId } from "@/lib/shop-context";
import { requireOwner } from "@/lib/permissions";
import { uploadBillingProfileLogoToStorage } from "@/lib/storage";
import { ADMIN } from "@/lib/routes";

async function trimLogo(buffer: Buffer, contentType: string): Promise<Buffer> {
  if (contentType === "image/svg+xml") return buffer;
  try {
    return await sharp(buffer).trim().toBuffer();
  } catch {
    return buffer;
  }
}

const profileSchema = z.object({
  legalName: z.string().min(1, "El nombre legal es requerido").max(120),
  code: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(20)
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  invoicePrefix: z.string().min(2, "Prefijo requerido").max(30),
  address: z.string().max(255).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  taxId: z.string().max(100).optional().or(z.literal("")),
  billingEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  infoEmail: z.string().email("Email inválido").optional().or(z.literal("")),
});

function parseProfileForm(formData: FormData) {
  return profileSchema.safeParse({
    legalName: formData.get("legalName") as string,
    code: (formData.get("code") as string)?.toLowerCase().trim(),
    invoicePrefix: (formData.get("invoicePrefix") as string)?.trim(),
    address: formData.get("address") as string,
    phone: formData.get("phone") as string,
    taxId: formData.get("taxId") as string,
    billingEmail: formData.get("billingEmail") as string,
    infoEmail: formData.get("infoEmail") as string,
  });
}

export async function getBillingProfiles() {
  const shopId = await getShopId();
  return db.billingProfile.findMany({
    where: { shopId },
    orderBy: [{ isDefault: "desc" }, { legalName: "asc" }],
  });
}

export async function createBillingProfile(formData: FormData) {
  await requireOwner();
  const shopId = await getShopId();

  const parsed = parseProfileForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const existing = await db.billingProfile.count({ where: { shopId } });
  const isDefault = existing === 0;

  if (isDefault) {
    await db.billingProfile.updateMany({ where: { shopId }, data: { isDefault: false } });
  }

  try {
    await db.billingProfile.create({
      data: {
        shopId,
        legalName: data.legalName,
        code: data.code,
        invoicePrefix: data.invoicePrefix,
        address: data.address || null,
        phone: data.phone || null,
        taxId: data.taxId || null,
        billingEmail: data.billingEmail || null,
        infoEmail: data.infoEmail || null,
        isDefault,
      },
    });
  } catch {
    return { error: { code: ["Ya existe un perfil con ese código"] } };
  }

  revalidatePath(ADMIN.settings);
  return { success: true };
}

export async function updateBillingProfile(profileId: string, formData: FormData) {
  await requireOwner();
  const shopId = await getShopId();

  const parsed = parseProfileForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const profile = await db.billingProfile.findFirst({ where: { id: profileId, shopId } });
  if (!profile) return { error: { _form: ["Perfil no encontrado"] } };

  const data = parsed.data;

  try {
    await db.billingProfile.update({
      where: { id: profileId },
      data: {
        legalName: data.legalName,
        code: data.code,
        invoicePrefix: data.invoicePrefix,
        address: data.address || null,
        phone: data.phone || null,
        taxId: data.taxId || null,
        billingEmail: data.billingEmail || null,
        infoEmail: data.infoEmail || null,
      },
    });
  } catch {
    return { error: { code: ["Ya existe un perfil con ese código"] } };
  }

  revalidatePath(ADMIN.settings);
  return { success: true };
}

export async function setDefaultBillingProfile(profileId: string) {
  await requireOwner();
  const shopId = await getShopId();

  const profile = await db.billingProfile.findFirst({
    where: { id: profileId, shopId, isActive: true },
  });
  if (!profile) return { error: "Perfil no encontrado" };

  await db.$transaction([
    db.billingProfile.updateMany({ where: { shopId }, data: { isDefault: false } }),
    db.billingProfile.update({ where: { id: profileId }, data: { isDefault: true } }),
  ]);

  revalidatePath(ADMIN.settings);
  return { success: true };
}

export async function toggleBillingProfileActive(profileId: string, active: boolean) {
  await requireOwner();
  const shopId = await getShopId();

  const profile = await db.billingProfile.findFirst({ where: { id: profileId, shopId } });
  if (!profile) return { error: "Perfil no encontrado" };

  if (!active && profile.isDefault) {
    return { error: "No puedes desactivar el perfil por defecto. Elige otro primero." };
  }

  await db.billingProfile.update({ where: { id: profileId }, data: { isActive: active } });
  revalidatePath(ADMIN.settings);
  return { success: true };
}

export async function deleteBillingProfile(profileId: string) {
  await requireOwner();
  const shopId = await getShopId();

  const count = await db.billingProfile.count({ where: { shopId } });
  if (count <= 1) return { error: "Debe existir al menos un perfil de facturación" };

  const profile = await db.billingProfile.findFirst({ where: { id: profileId, shopId } });
  if (!profile) return { error: "Perfil no encontrado" };
  if (profile.isDefault) return { error: "No puedes eliminar el perfil por defecto" };

  await db.billingProfile.delete({ where: { id: profileId } });
  revalidatePath(ADMIN.settings);
  return { success: true };
}

export async function uploadBillingProfileLogo(profileId: string, formData: FormData) {
  await requireOwner();
  const shopId = await getShopId();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: "Supabase no está configurado" };
  }

  const profile = await db.billingProfile.findFirst({ where: { id: profileId, shopId } });
  if (!profile) return { error: "Perfil no encontrado" };

  const file = formData.get("logo") as File | null;
  if (!file || file.size === 0) return { error: "No se seleccionó ningún archivo" };

  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) return { error: "El logo no puede superar 5 MB" };

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Solo se aceptan JPG, PNG, WebP o SVG" };
  }

  try {
    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const ext = (file.name.split(".").pop() ?? "png").toLowerCase();
    const buffer = await trimLogo(rawBuffer, file.type);

    const { publicUrl } = await uploadBillingProfileLogoToStorage(
      shopId,
      profileId,
      buffer,
      file.type,
      ext
    );
    const logoUrl = `${publicUrl}?t=${Date.now()}`;

    await db.billingProfile.update({ where: { id: profileId }, data: { logoUrl } });
    revalidatePath(ADMIN.settings);
    return { success: true, logoUrl };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return { error: `Error subiendo logo: ${message}` };
  }
}
