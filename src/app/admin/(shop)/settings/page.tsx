import { ADMIN, PLATFORM, adminPath } from "@/lib/routes";
import { getShopSettings } from "@/actions/settings";
import { getTeamMembers } from "@/actions/users";
import { getBillingProfiles } from "@/actions/billing-profiles";
import { ShopSettingsForm } from "@/components/settings/ShopSettingsForm";
import { BillingProfilesManager } from "@/components/settings/BillingProfilesManager";
import { TeamManagement } from "@/components/settings/TeamManagement";
import { SupportCard } from "@/components/settings/SupportCard";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect(ADMIN.login);

  const shop = await getShopSettings();
  if (!shop) redirect(ADMIN.dashboard);

  const isOwner = session.user.role === "OWNER";
  const team = isOwner ? await getTeamMembers() : [];
  const billingProfiles = isOwner ? await getBillingProfiles() : [];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-slate-500 text-sm mt-1">
          Perfiles de facturación, datos de la agencia, correo, contraseña y equipo
        </p>
      </div>

      {isOwner && <BillingProfilesManager profiles={billingProfiles} />}

      <ShopSettingsForm shop={shop} />

      {isOwner && (
        <TeamManagement members={team} currentUserId={session.user.id} />
      )}

      <SupportCard />
    </div>
  );
}
