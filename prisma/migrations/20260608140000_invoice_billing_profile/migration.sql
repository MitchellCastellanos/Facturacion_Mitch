-- Facturas/cotizaciones multi-empresa + proyecto opcional (sin vehículo obligatorio)

ALTER TABLE mecanico."Invoice" ADD COLUMN IF NOT EXISTS "billingProfileId" TEXT;
ALTER TABLE mecanico."Invoice" ADD COLUMN IF NOT EXISTS "projectName" TEXT;
ALTER TABLE mecanico."Invoice" ALTER COLUMN "vehicleId" DROP NOT NULL;

ALTER TABLE mecanico."Quote" ADD COLUMN IF NOT EXISTS "billingProfileId" TEXT;
ALTER TABLE mecanico."Quote" ADD COLUMN IF NOT EXISTS "projectName" TEXT;
ALTER TABLE mecanico."Quote" ALTER COLUMN "vehicleId" DROP NOT NULL;

DO $$ BEGIN
    ALTER TABLE mecanico."Invoice"
        ADD CONSTRAINT "Invoice_billingProfileId_fkey"
        FOREIGN KEY ("billingProfileId") REFERENCES mecanico."BillingProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE mecanico."Quote"
        ADD CONSTRAINT "Quote_billingProfileId_fkey"
        FOREIGN KEY ("billingProfileId") REFERENCES mecanico."BillingProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE mecanico."LineItemType" ADD VALUE IF NOT EXISTS 'DEVELOPMENT';
ALTER TYPE mecanico."LineItemType" ADD VALUE IF NOT EXISTS 'DESIGN';
ALTER TYPE mecanico."LineItemType" ADD VALUE IF NOT EXISTS 'HOSTING';
ALTER TYPE mecanico."LineItemType" ADD VALUE IF NOT EXISTS 'MAINTENANCE';
ALTER TYPE mecanico."LineItemType" ADD VALUE IF NOT EXISTS 'CONSULTING';
