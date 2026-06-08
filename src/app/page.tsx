import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/config/brand";
import { Code2, Globe, Sparkles } from "lucide-react";

const SERVICES = [
  {
    icon: Globe,
    title: "Sitios web",
    description: "Landing pages, e-commerce y portales a medida con rendimiento y SEO.",
  },
  {
    icon: Code2,
    title: "Software a medida",
    description: "Apps web, paneles admin, integraciones y automatización de procesos.",
  },
  {
    icon: Sparkles,
    title: "Mantenimiento",
    description: "Hosting, actualizaciones, soporte y evolución continua de tus proyectos.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={BRAND.logoPath}
            alt={BRAND.shopName}
            width={48}
            height={48}
            className="h-12 w-auto object-contain"
            priority
          />
          <span className="font-semibold text-lg hidden sm:inline">{BRAND.shopName}</span>
        </Link>
        <Link
          href="/admin/login"
          className="text-sm text-slate-300 hover:text-white transition-colors"
        >
          Acceso equipo
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 pb-20">
        <section className="text-center py-12 sm:py-20">
          <Image
            src={BRAND.logoPath}
            alt={BRAND.shopName}
            width={220}
            height={220}
            className="mx-auto h-28 sm:h-36 w-auto object-contain"
            priority
          />
          <h1 className="mt-8 text-4xl sm:text-5xl font-bold tracking-tight">
            Servicios web y software
          </h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
            {BRAND.shopName} — desarrollo, diseño y facturación profesional desde Montréal.
            También operamos como Montreal Spider Co. según el proyecto.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`mailto:${BRAND.emails.info}?subject=Cotización%20de%20proyecto`}
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-xl transition-colors"
            >
              Solicitar cotización
            </a>
            <a
              href={`mailto:${BRAND.emails.contact}`}
              className="inline-flex items-center justify-center border border-slate-600 hover:border-slate-400 text-slate-200 font-medium px-6 py-3 rounded-xl transition-colors"
            >
              {BRAND.emails.contact}
            </a>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="font-semibold text-lg">{service.title}</h2>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{service.description}</p>
              </div>
            );
          })}
        </section>
      </main>

      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} {BRAND.shopName} · Montréal, QC
      </footer>
    </div>
  );
}
