-- Perfiles de facturación multi-empresa (GABAN Solutions, Montreal Spider Co., etc.)

CREATE TABLE IF NOT EXISTS mecanico."BillingProfile" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "invoicePrefix" TEXT NOT NULL,
    "logoUrl" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "taxId" TEXT,
    "billingEmail" TEXT,
    "infoEmail" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BillingProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BillingProfile_shopId_code_key"
    ON mecanico."BillingProfile"("shopId", "code");

DO $$ BEGIN
    ALTER TABLE mecanico."BillingProfile"
        ADD CONSTRAINT "BillingProfile_shopId_fkey"
        FOREIGN KEY ("shopId") REFERENCES mecanico."Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
