"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Building2, Loader2, Plus, Star, Trash2, Upload } from "lucide-react";
import {
  createBillingProfile,
  updateBillingProfile,
  setDefaultBillingProfile,
  toggleBillingProfileActive,
  deleteBillingProfile,
  uploadBillingProfileLogo,
} from "@/actions/billing-profiles";

export interface BillingProfileRow {
  id: string;
  legalName: string;
  code: string;
  invoicePrefix: string;
  logoUrl: string | null;
  address: string | null;
  phone: string | null;
  taxId: string | null;
  billingEmail: string | null;
  infoEmail: string | null;
  isDefault: boolean;
  isActive: boolean;
}

interface BillingProfilesManagerProps {
  profiles: BillingProfileRow[];
}

type FormMode = { type: "create" } | { type: "edit"; profile: BillingProfileRow };

const emptyForm = {
  legalName: "",
  code: "",
  invoicePrefix: "",
  address: "",
  phone: "",
  taxId: "",
  billingEmail: "",
  infoEmail: "",
};

export function BillingProfilesManager({ profiles }: BillingProfilesManagerProps) {
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [pending, startTransition] = useTransition();
  const logoInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function openCreate() {
    setFormMode({ type: "create" });
  }

  function openEdit(profile: BillingProfileRow) {
    setFormMode({ type: "edit", profile });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      let result;
      if (formMode?.type === "edit") {
        result = await updateBillingProfile(formMode.profile.id, formData);
      } else {
        result = await createBillingProfile(formData);
      }

      if (result?.success) {
        toast.success(formMode?.type === "edit" ? "Perfil actualizado" : "Perfil creado");
        setFormMode(null);
      } else if (result?.error) {
        const msg = Object.values(result.error).flat()[0];
        toast.error(typeof msg === "string" ? msg : "Error al guardar");
      }
    });
  }

  function handleSetDefault(id: string) {
    startTransition(async () => {
      const result = await setDefaultBillingProfile(id);
      if (result?.success) toast.success("Perfil por defecto actualizado");
      else toast.error(result?.error ?? "Error");
    });
  }

  function handleToggleActive(id: string, active: boolean) {
    startTransition(async () => {
      const result = await toggleBillingProfileActive(id, active);
      if (result?.success) toast.success(active ? "Perfil activado" : "Perfil desactivado");
      else toast.error(result?.error ?? "Error");
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar el perfil «${name}»?`)) return;
    startTransition(async () => {
      const result = await deleteBillingProfile(id);
      if (result?.success) toast.success("Perfil eliminado");
      else toast.error(result?.error ?? "Error");
    });
  }

  function handleLogoUpload(profileId: string, file: File) {
    const formData = new FormData();
    formData.append("logo", file);
    startTransition(async () => {
      const result = await uploadBillingProfileLogo(profileId, formData);
      if (result?.success) toast.success("Logo actualizado");
      else toast.error(result?.error ?? "Error subiendo logo");
    });
  }

  const formDefaults =
    formMode?.type === "edit"
      ? {
          legalName: formMode.profile.legalName,
          code: formMode.profile.code,
          invoicePrefix: formMode.profile.invoicePrefix,
          address: formMode.profile.address ?? "",
          phone: formMode.profile.phone ?? "",
          taxId: formMode.profile.taxId ?? "",
          billingEmail: formMode.profile.billingEmail ?? "",
          infoEmail: formMode.profile.infoEmail ?? "",
        }
      : emptyForm;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-slate-500" />
            Perfiles de facturación
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Empresas legales con las que emites facturas (GABAN Solutions, Montreal Spider Co., etc.)
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Nuevo perfil
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {profiles.length === 0 && (
          <p className="px-6 py-8 text-sm text-slate-500 text-center">
            No hay perfiles configurados. Crea al menos uno para facturar.
          </p>
        )}

        {profiles.map((profile) => (
          <div key={profile.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                type="button"
                onClick={() => logoInputRefs.current[profile.id]?.click()}
                className="relative h-12 w-12 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden hover:border-slate-300"
                title="Subir logo"
              >
                {profile.logoUrl ? (
                  <Image
                    src={profile.logoUrl}
                    alt={profile.legalName}
                    width={48}
                    height={48}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Building2 className="h-5 w-5 text-slate-400" />
                )}
                <span className="absolute inset-0 bg-black/0 hover:bg-black/5 flex items-center justify-center opacity-0 hover:opacity-100">
                  <Upload className="h-3.5 w-3.5 text-slate-600" />
                </span>
              </button>
              <input
                ref={(el) => {
                  logoInputRefs.current[profile.id] = el;
                }}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleLogoUpload(profile.id, file);
                  e.target.value = "";
                }}
              />

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-slate-900 truncate">{profile.legalName}</p>
                  {profile.isDefault && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      <Star className="h-3 w-3 fill-current" />
                      Por defecto
                    </span>
                  )}
                  {!profile.isActive && (
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      Inactivo
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500">
                  {profile.invoicePrefix} · {profile.code}
                  {profile.taxId ? ` · NEQ ${profile.taxId}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {!profile.isDefault && profile.isActive && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleSetDefault(profile.id)}
                  className="text-sm text-slate-600 hover:text-slate-900 px-2 py-1"
                >
                  Hacer default
                </button>
              )}
              <button
                type="button"
                disabled={pending}
                onClick={() => openEdit(profile)}
                className="text-sm font-medium text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50"
              >
                Editar
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => handleToggleActive(profile.id, !profile.isActive)}
                className="text-sm text-slate-600 hover:text-slate-900 px-2 py-1"
              >
                {profile.isActive ? "Desactivar" : "Activar"}
              </button>
              {!profile.isDefault && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleDelete(profile.id, profile.legalName)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {formMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {formMode.type === "create" ? "Nuevo perfil de facturación" : "Editar perfil"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre legal
                  </label>
                  <input
                    name="legalName"
                    defaultValue={formDefaults.legalName}
                    required
                    placeholder="GABAN Solutions"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
                  <input
                    name="code"
                    defaultValue={formDefaults.code}
                    required
                    placeholder="gaban"
                    pattern="[a-z0-9-]+"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Prefijo facturas
                  </label>
                  <input
                    name="invoicePrefix"
                    defaultValue={formDefaults.invoicePrefix}
                    required
                    placeholder="INV-GABAN"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
                  <input
                    name="address"
                    defaultValue={formDefaults.address}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                  <input
                    name="phone"
                    defaultValue={formDefaults.phone}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NEQ / Tax ID</label>
                  <input
                    name="taxId"
                    defaultValue={formDefaults.taxId}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email facturación
                  </label>
                  <input
                    name="billingEmail"
                    type="email"
                    defaultValue={formDefaults.billingEmail}
                    placeholder="billing@..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email info</label>
                  <input
                    name="infoEmail"
                    type="email"
                    defaultValue={formDefaults.infoEmail}
                    placeholder="info@..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFormMode(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50"
                >
                  {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
