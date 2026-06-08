import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { BRAND } from "@/config/brand";
import { seedBillingProfiles } from "@/lib/seed-billing-profiles";

export const maxDuration = 60;

/**
 * Inicialización única en producción (Vercel puede alcanzar Supabase).
 * Header: x-setup-secret = CRON_SECRET
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-setup-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = (process.env.PLATFORM_ADMIN_EMAIL ?? "mitchell.castellanos@hotmail.com").toLowerCase();
  const password = process.env.PLATFORM_ADMIN_PASSWORD;
  const name = process.env.PLATFORM_ADMIN_NAME ?? "Mitchell Castellanos";

  if (!password) {
    return NextResponse.json(
      { error: "Falta PLATFORM_ADMIN_PASSWORD en variables de entorno" },
      { status: 500 }
    );
  }

  try {
    const hash = await bcrypt.hash(password, 12);

    await db.user.upsert({
      where: { email },
      update: { name, passwordHash: hash, role: "SUPER_ADMIN", shopId: null },
      create: { name, email, passwordHash: hash, role: "SUPER_ADMIN", shopId: null },
    });

    const shop = await db.shop.upsert({
      where: { id: BRAND.shopId },
      update: {
        name: BRAND.shopName,
        email: BRAND.emails.contact,
        billingEmail: BRAND.emails.billing,
        infoEmail: BRAND.emails.info,
        slug: BRAND.bookingSlug,
      },
      create: {
        id: BRAND.shopId,
        name: BRAND.shopName,
        email: BRAND.emails.contact,
        billingEmail: BRAND.emails.billing,
        infoEmail: BRAND.emails.info,
        slug: BRAND.bookingSlug,
        currency: "CAD",
      },
    });

    await seedBillingProfiles(db, shop.id);

    const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase().trim();
    const ownerPassword = process.env.OWNER_PASSWORD?.trim();
    if (ownerEmail && ownerPassword) {
      const ownerHash = await bcrypt.hash(ownerPassword, 12);
      await db.user.upsert({
        where: { email: ownerEmail },
        update: {
          name: process.env.OWNER_NAME ?? "Administrador",
          passwordHash: ownerHash,
          role: "OWNER",
          shopId: shop.id,
        },
        create: {
          name: process.env.OWNER_NAME ?? "Administrador",
          email: ownerEmail,
          passwordHash: ownerHash,
          role: "OWNER",
          shopId: shop.id,
        },
      });
    }

    const userCount = await db.user.count();

    return NextResponse.json({
      ok: true,
      message: "Bootstrap completado",
      superAdmin: email,
      shop: shop.name,
      shopId: shop.id,
      billingProfiles: BRAND.billingProfiles.length,
      ownerCreated: Boolean(ownerEmail && ownerPassword),
      users: userCount,
      adminUrl: "/admin",
      platformUrl: "/platform",
    });
  } catch (err) {
    console.error("[bootstrap]", err);
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
