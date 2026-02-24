"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowRight, FaCalendarCheck, FaCheckCircle, FaLayerGroup, FaRocket, FaWhatsapp } from "react-icons/fa";

type Combo = {
  id: number;
  title: string;
  ideal: string;
  includes: string[];
  individualValue: string;
  comboPrice: string;
  note: string;
  deliverables: string[];
  timeline: string;
  notIncluded: string[];
  marketNote: string;
};

type ReservationType = "asesoria" | "combo" | "plan" | "servicio";

const solutionsBackdropImage =
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=2400&q=80";

const DEFAULT_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "56952402170";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

const normalizeWhatsappNumber = (value?: string | null): string =>
  String(value || "")
    .trim()
    .replace(/[^\d]/g, "");

const buildReservationHref = (type: ReservationType, name: string, price?: string) => {
  const params = new URLSearchParams({
    source: "servicios-combos",
    reserve_type: type,
    reserve_name: name,
  });

  if (price) {
    params.set("reserve_price", price);
  }

  return `/asesoria?${params.toString()}`;
};

const buildWhatsappHref = (type: ReservationType, name: string, price?: string, whatsappNumber?: string) => {
  const target = normalizeWhatsappNumber(whatsappNumber) || normalizeWhatsappNumber(DEFAULT_WHATSAPP_NUMBER);
  const message = [
    "Hola, quiero reservar una asesoria.",
    `Tipo: ${type}.`,
    `Solicitud: ${name}.`,
    price ? `Precio de referencia: ${price}.` : "",
    "Quedo atento para confirmar disponibilidad.",
  ]
    .filter(Boolean)
    .join(" ");

  return `https://wa.me/${target}?text=${encodeURIComponent(message)}`;
};

const pymeCombos: Combo[] = [
  {
    id: 1,
    title: "Combo 1 - Presencia Digital Profesional",
    ideal: "Ideal para negocios que recien quieren profesionalizar su imagen.",
    includes: ["Branding completo", "Pack redes sociales", "Fotografia profesional"],
    individualValue: "$450.000 CLP",
    comboPrice: "$390.000 CLP",
    note: "Ahorro visible para facilitar el cierre comercial.",
    deliverables: [
      "Identidad visual base: logo, paleta y tipografias",
      "Pack de piezas graficas para redes sociales (feed y stories)",
      "Sesion fotografica y seleccion de imagenes editadas",
      "Entrega de archivos base para uso comercial",
    ],
    timeline: "7 a 12 dias habiles",
    notIncluded: [
      "Impresion de material fisico",
      "Compra de imagenes premium de terceros",
      "Gestion mensual de redes sociales",
    ],
    marketNote: "Posicion competitivo para PYMEs en Chile que buscan presencia profesional inicial.",
  },
  {
    id: 2,
    title: "Combo 2 - Crecimiento Digital",
    ideal: "Para negocios que ya tienen web y quieren vender mas.",
    includes: ["SEO Local (1 mes)", "Google Ads setup", "Meta Ads setup", "Email marketing setup"],
    individualValue: "$510.000 CLP",
    comboPrice: "$450.000 CLP",
    note: "Sube ticket promedio inmediato con foco en demanda.",
    deliverables: [
      "SEO local inicial con optimizacion de perfil y estructura base",
      "Configuracion de campanas Google Ads y Meta Ads",
      "Instalacion de pixeles, eventos y conversion tracking",
      "Setup de automatizacion de email para captacion/seguimiento",
    ],
    timeline: "10 a 15 dias habiles",
    notIncluded: [
      "Presupuesto de pauta publicitaria",
      "Gestion mensual posterior a la configuracion",
      "Licencias de plataformas externas",
    ],
    marketNote: "Alineado a paquetes de activacion comercial para PYMEs chilenas con foco en demanda.",
  },
  {
    id: 3,
    title: "Combo 3 - E-commerce Optimizado",
    ideal: "Para tiendas online que quieren vender en serio.",
    includes: ["Pasarela de pago", "Email automation", "SEO Local", "Mantenimiento 2 meses"],
    individualValue: "$440.000 CLP",
    comboPrice: "$390.000 CLP",
    note: "Paquete equilibrado para conversion y continuidad operativa.",
    deliverables: [
      "Integracion de una pasarela de pago con flujo de confirmacion",
      "Automatizacion de emails de compra/seguimiento",
      "Ajustes SEO local basicos para visibilidad inicial",
      "Mantenimiento preventivo y correctivo por 2 meses",
    ],
    timeline: "12 a 18 dias habiles",
    notIncluded: [
      "Comisiones de pasarela de pago",
      "Carga masiva de catalogo por lote",
      "Campanas pagadas de trafico",
    ],
    marketNote: "Paquete competitivo para e-commerce chileno que busca estabilizar conversion y operacion.",
  },
];

const enterpriseCombos: Combo[] = [
  {
    id: 4,
    title: "Combo 4 - Automatizacion Empresarial",
    ideal: "Para empresas que necesitan orden comercial y operacion trazable.",
    includes: ["Bot WhatsApp API", "Integracion CRM", "Automatizacion email", "Capacitacion equipo"],
    individualValue: "$550.000 CLP",
    comboPrice: "$520.000 CLP",
    note: "Eleva ticket sin generar friccion de compra.",
    deliverables: [
      "Configuracion de bot WhatsApp Business API para flujo comercial",
      "Integracion con CRM para seguimiento de leads y oportunidades",
      "Automatizacion de secuencias de correo de soporte comercial",
      "Capacitacion operativa al equipo para uso diario",
    ],
    timeline: "15 a 25 dias habiles",
    notIncluded: [
      "Licenciamiento CRM y proveedores de API",
      "Mesa de soporte 24/7 permanente",
      "Desarrollo de ERP completo",
    ],
    marketNote: "Posicion de entrada solida para empresas chilenas en etapa de orden y escalamiento.",
  },
  {
    id: 5,
    title: "Combo 5 - Transformacion Digital Completa",
    ideal: "Para empresas que buscan estructura digital de alto impacto.",
    includes: ["Migracion WordPress a moderno", "Integracion CRM", "PWA empresarial", "SEO tecnico base"],
    individualValue: "$1.150.000 CLP",
    comboPrice: "$1.050.000 CLP",
    note: "Ticket alto real con solucion de punta a punta.",
    deliverables: [
      "Migracion de WordPress a stack moderno orientado a rendimiento",
      "Integracion CRM para centralizar y seguir oportunidades",
      "Implementacion de PWA empresarial con base operativa",
      "SEO tecnico inicial para estructura e indexacion",
    ],
    timeline: "25 a 45 dias habiles",
    notIncluded: [
      "Redaccion de contenido desde cero",
      "Infraestructura mensual (hosting, terceros, licencias)",
      "Integraciones enterprise fuera de alcance acordado",
    ],
    marketNote: "Ticket premium competitivo para proyectos de transformacion digital en Chile.",
  },
];

const pymePremiumItems = [
  "SEO Local y posicionamiento en Google",
  "Campanas Google y Meta Ads optimizadas",
  "Automatizacion de email marketing",
  "Branding profesional",
  "Fotografia y contenido visual",
  "Mantenimiento y soporte continuo",
];

const enterprisePremiumItems = [
  "Integracion CRM avanzada",
  "Automatizacion con WhatsApp Business API",
  "Apps moviles PWA",
  "Migracion tecnologica moderna",
  "Auditoria de seguridad",
  "Infraestructura y hosting profesional",
];

const parseClpValue = (value: string): number => Number(String(value || "").replace(/[^\d]/g, "")) || 0;
const formatClp = (value: number): string => `$${value.toLocaleString("es-CL")} CLP`;

function ComboCard({
  combo,
  segment,
  whatsappNumber,
}: {
  combo: Combo;
  segment: "PYMEs" | "Empresarial";
  whatsappNumber: string;
}) {
  const individualAmount = parseClpValue(combo.individualValue);
  const comboAmount = parseClpValue(combo.comboPrice);
  const savings = Math.max(individualAmount - comboAmount, 0);
  const savingsPercent = individualAmount > 0 ? Math.round((savings / individualAmount) * 100) : 0;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b1534]/90 via-[#0c1f4f]/75 to-[#060d25]/95 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:shadow-[0_20px_45px_-28px_rgba(34,211,238,0.6)]">
      <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-cyan-300/15 blur-2xl" />
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full border border-cyan-300/35 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100">
            {segment}
          </span>
          <span className="text-xs font-semibold text-slate-300">#{combo.id}</span>
        </div>

        <h3 className="text-xl font-black leading-tight text-white">{combo.title}</h3>
        <p className="text-sm leading-relaxed text-slate-300">{combo.ideal}</p>

        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-200">Incluye</p>
          <ul className="space-y-2">
            {combo.includes.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-200">
                <FaCheckCircle className="mt-0.5 shrink-0 text-cyan-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Valor individual</p>
            <p className="mt-1 text-sm font-semibold text-slate-200">{combo.individualValue}</p>
          </div>
          <div className="rounded-lg border border-cyan-300/35 bg-cyan-500/10 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100">Precio combo</p>
            <p className="mt-1 text-sm font-black text-cyan-100">{combo.comboPrice}</p>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-slate-300">{combo.note}</p>

        <div className="flex items-center justify-end gap-2">
          <Link
            href={buildReservationHref("combo", combo.title, combo.comboPrice)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/45 bg-cyan-500/15 text-cyan-100 transition hover:bg-cyan-500/25 hover:text-white"
            aria-label={`Reservar ${combo.title}`}
            title={`Reservar ${combo.title}`}
          >
            <FaCalendarCheck className="text-sm" />
          </Link>
          <a
            href={buildWhatsappHref("combo", combo.title, combo.comboPrice, whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#25D366]/55 bg-[#25D366]/18 text-[#D9FFE8] transition hover:bg-[#25D366]/28 hover:text-white"
            aria-label={`Reservar ${combo.title} por WhatsApp`}
            title={`Reservar ${combo.title} por WhatsApp`}
          >
            <FaWhatsapp className="text-sm" />
          </a>
        </div>

        <details className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-xs font-black uppercase tracking-[0.14em] text-cyan-100">
            Ver detalle completo
            <FaArrowRight className="text-[11px]" />
          </summary>

          <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-300">Alcance y entregables</p>
              <ul className="mt-2 space-y-2">
                {combo.deliverables.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-200">
                    <FaCheckCircle className="mt-0.5 shrink-0 text-cyan-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-black/25 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Plazo estimado</p>
                <p className="mt-1 text-sm font-semibold text-slate-100">{combo.timeline}</p>
              </div>
              <div className="rounded-lg border border-cyan-300/30 bg-cyan-500/10 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-cyan-100">Ahorro combo</p>
                <p className="mt-1 text-sm font-black text-cyan-100">
                  {formatClp(savings)} ({savingsPercent}%)
                </p>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-300">No incluye</p>
              <ul className="mt-2 space-y-2">
                {combo.notIncluded.map((item) => (
                  <li key={item} className="text-sm text-slate-300">
                    - {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs leading-relaxed text-slate-300">
              Referencia mercado chileno: {combo.marketNote} Valores referenciales en CLP; no incluye IVA, pauta ni
              comisiones de terceros.
            </p>
          </div>
        </details>
      </div>
    </article>
  );
}

export default function ServiciosCombosPage() {
  const [resolvedWhatsappNumber, setResolvedWhatsappNumber] = useState<string>(normalizeWhatsappNumber(DEFAULT_WHATSAPP_NUMBER));

  useEffect(() => {
    let cancelled = false;

    const loadContactWhatsapp = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/contact`);
        if (!response.ok) return;
        const payload = (await response.json().catch(() => null)) as
          | { whatsapp?: string | null; phone?: string | null }
          | null;
        const fromContact = normalizeWhatsappNumber(payload?.whatsapp || payload?.phone);
        if (!cancelled && fromContact) {
          setResolvedWhatsappNumber(fromContact);
        }
      } catch {
        // keep env fallback
      }
    };

    void loadContactWhatsapp();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#040917] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(56,189,248,0.2),transparent_34%),radial-gradient(circle_at_90%_20%,rgba(16,185,129,0.14),transparent_35%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.12),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[940px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.2]"
          style={{ backgroundImage: `url("${solutionsBackdropImage}")` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,9,23,0.35)_0%,rgba(4,9,23,0.82)_52%,rgba(4,9,23,1)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(34,211,238,0.18),transparent_45%)]" />
      </div>

      <section className="relative mx-auto max-w-7xl px-6 pb-14 pt-16 md:pt-20">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-500/10 px-5 py-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-100">
            <FaLayerGroup />
            Combos Estrategicos
          </span>
          <h1 className="mt-7 text-4xl font-black leading-tight text-white md:text-6xl">
            Soluciones empaquetadas para subir ticket promedio
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-slate-300 md:text-lg">
            La clave no es vender servicios sueltos. La clave es ofrecer paquetes con enfoque de resultado para PYMEs
            y empresas que buscan crecimiento real.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={buildReservationHref("asesoria", "Asesoria sobre combos estrategicos")}
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/45 bg-cyan-500/15 px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-cyan-100 transition hover:bg-cyan-500/25"
            >
              Agendar asesoria
              <FaArrowRight />
            </Link>
            <Link
              href="/servicios"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-slate-200 transition hover:bg-white/10"
            >
              Volver a servicios
            </Link>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-14">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center rounded-full border border-cyan-300/35 bg-cyan-500/10 px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100">
            Diagnostico rapido
          </span>
          <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">Que tipo de empresa eres?</h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base">
            Encuentra la solucion ideal para tu negocio. Cada empresa esta en un nivel diferente de crecimiento.
            Selecciona la opcion que mejor describe tu situacion y te mostramos la mejor estrategia para avanzar.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <article className="rounded-2xl border border-emerald-300/30 bg-emerald-500/10 p-6">
            <span className="inline-flex rounded-full border border-emerald-300/35 bg-emerald-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100">
              1 - PYME
            </span>
            <h3 className="mt-4 text-xl font-black text-white">Soy emprendedor o pequena empresa</h3>
            <p className="mt-2 text-sm text-slate-200">Estoy comenzando o tengo un negocio pequeno y quiero vender mas.</p>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-100">Generalmente necesitas</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                {[
                  "Mejorar tu imagen digital",
                  "Aparecer en Google",
                  "Generar mas clientes",
                  "Automatizar tareas basicas",
                  "Ordenar tu presencia online",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <FaCheckCircle className="mt-0.5 shrink-0 text-emerald-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-100">Te recomendamos</p>
              <p className="mt-2 text-sm text-slate-200">SEO Local, Google Ads, Meta Ads, Email Marketing, Branding y Mantenimiento Web.</p>
            </div>

            <Link
              href="#pyme-soluciones"
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-emerald-300/40 bg-emerald-500/20 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-emerald-100 transition hover:bg-emerald-500/30"
            >
              Ver soluciones para PYMEs
              <FaArrowRight />
            </Link>
          </article>

          <article className="rounded-2xl border border-blue-300/30 bg-blue-500/10 p-6">
            <span className="inline-flex rounded-full border border-blue-300/35 bg-blue-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-100">
              2 - CRECIMIENTO
            </span>
            <h3 className="mt-4 text-xl font-black text-white">Soy una empresa en crecimiento</h3>
            <p className="mt-2 text-sm text-slate-200">Ya tengo clientes, pero necesito orden, automatizacion y estructura.</p>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-100">Generalmente necesitas</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                {[
                  "Automatizar procesos internos",
                  "Integrar sistemas",
                  "Centralizar clientes en CRM",
                  "Reducir errores manuales",
                  "Escalar operaciones",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <FaCheckCircle className="mt-0.5 shrink-0 text-blue-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-100">Te recomendamos</p>
              <p className="mt-2 text-sm text-slate-200">Integracion CRM, Bot WhatsApp Business API, automatizacion avanzada, migracion moderna y App PWA.</p>
            </div>

            <Link
              href="#empresarial-soluciones"
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-blue-300/40 bg-blue-500/20 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-blue-100 transition hover:bg-blue-500/30"
            >
              Ver soluciones empresariales
              <FaArrowRight />
            </Link>
          </article>

          <article className="rounded-2xl border border-violet-300/30 bg-violet-500/10 p-6">
            <span className="inline-flex rounded-full border border-violet-300/35 bg-violet-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-violet-100">
              3 - CONSOLIDADA
            </span>
            <h3 className="mt-4 text-xl font-black text-white">Soy una empresa consolidada</h3>
            <p className="mt-2 text-sm text-slate-200">Necesito optimizar, escalar y asegurar mi infraestructura tecnologica.</p>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-violet-100">Generalmente necesitas</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                {[
                  "Arquitectura tecnologica solida",
                  "Seguridad avanzada",
                  "Optimizacion de rendimiento",
                  "Sistemas personalizados",
                  "Integraciones complejas",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <FaCheckCircle className="mt-0.5 shrink-0 text-violet-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-violet-100">Te recomendamos</p>
              <p className="mt-2 text-sm text-slate-200">Auditoria de Seguridad, desarrollo a medida, ERP empresarial, hosting dedicado y automatizacion integral.</p>
            </div>

            <Link
              href={buildReservationHref("asesoria", "Evaluacion estrategica de empresa")}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-violet-300/40 bg-violet-500/20 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-violet-100 transition hover:bg-violet-500/30"
            >
              Solicitar evaluacion estrategica
              <FaArrowRight />
            </Link>
          </article>
        </div>
      </section>

      <section id="pyme-soluciones" className="relative mx-auto max-w-7xl px-6 pb-14">
        <div className="mb-6 flex items-center gap-3">
          <span className="rounded-full border border-emerald-300/40 bg-emerald-500/10 px-4 py-1 text-xs font-black uppercase tracking-[0.18em] text-emerald-100">
            PARTE 1
          </span>
          <h2 className="text-2xl font-black text-white md:text-3xl">Combos para PYMEs</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {pymeCombos.map((combo) => (
            <ComboCard key={combo.id} combo={combo} segment="PYMEs" whatsappNumber={resolvedWhatsappNumber} />
          ))}
        </div>
      </section>

      <section id="empresarial-soluciones" className="relative mx-auto max-w-7xl px-6 pb-14">
        <div className="mb-6 flex items-center gap-3">
          <span className="rounded-full border border-blue-300/40 bg-blue-500/10 px-4 py-1 text-xs font-black uppercase tracking-[0.18em] text-blue-100">
            PARTE 1
          </span>
          <h2 className="text-2xl font-black text-white md:text-3xl">Combos Empresariales</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {enterpriseCombos.map((combo) => (
            <ComboCard key={combo.id} combo={combo} segment="Empresarial" whatsappNumber={resolvedWhatsappNumber} />
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-14">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0a1639]/90 via-[#0a1f4f]/70 to-[#09122f]/90 p-6 md:p-10">
          <h3 className="text-2xl font-black text-white md:text-3xl">Resultado estrategico</h3>
          <p className="mt-4 max-w-4xl text-sm leading-relaxed text-slate-200 md:text-base">
            Si logras vender 1 combo empresarial al mes y 2 combos PYME, puedes facturar sobre $1.500.000 a
            $2.000.000 mensual sin exagerar.
          </p>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-14">
        <div className="mb-6 flex items-center gap-3">
          <span className="rounded-full border border-purple-300/40 bg-purple-500/10 px-4 py-1 text-xs font-black uppercase tracking-[0.18em] text-purple-100">
            PARTE 2
          </span>
          <h2 className="text-2xl font-black text-white md:text-3xl">Texto Premium para tu landing</h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-6 md:p-8">
          <h3 className="text-2xl font-black text-cyan-100 md:text-4xl">Potencia tu Empresa con Servicios Estrategicos</h3>
          <p className="mt-4 text-slate-200">
            No se trata solo de tener una pagina web. Se trata de construir una estructura digital solida que genere
            ventas, automatice procesos y escale tu negocio.
          </p>
          <p className="mt-2 text-slate-300">
            Ofrecemos servicios adicionales disenados para empresas chilenas que buscan resultados reales.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-emerald-300/30 bg-emerald-500/10 p-6">
            <h4 className="text-xl font-black text-emerald-100">Para PYMEs que quieren crecer</h4>
            <p className="mt-2 text-sm text-slate-200">
              Soluciones practicas y efectivas para aumentar ventas, mejorar presencia digital y profesionalizar tu
              negocio.
            </p>
            <ul className="mt-4 space-y-2">
              {pymePremiumItems.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-100">
                  <FaCheckCircle className="mt-0.5 text-emerald-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs uppercase tracking-[0.14em] text-emerald-100/90">
              Disenados para negocios que necesitan crecer sin complicaciones tecnicas.
            </p>
          </article>

          <article className="rounded-2xl border border-blue-300/30 bg-blue-500/10 p-6">
            <h4 className="text-xl font-black text-blue-100">Para Empresas que necesitan escalar</h4>
            <p className="mt-2 text-sm text-slate-200">
              Arquitectura tecnologica, automatizacion y sistemas que ordenan y profesionalizan tu operacion.
            </p>
            <ul className="mt-4 space-y-2">
              {enterprisePremiumItems.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-100">
                  <FaCheckCircle className="mt-0.5 text-blue-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs uppercase tracking-[0.14em] text-blue-100/90">
              Pensado para empresas que quieren estructura, control y crecimiento sostenido.
            </p>
          </article>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-2xl border border-cyan-300/35 bg-gradient-to-r from-cyan-500/12 to-blue-500/12 p-7 md:p-10">
          <div className="flex items-center gap-3 text-cyan-100">
            <FaRocket />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Bloque de cierre</span>
          </div>
          <h3 className="mt-3 text-3xl font-black text-white">Impacto medible en tu negocio</h3>
          <ul className="mt-5 grid grid-cols-1 gap-3 text-sm text-slate-100 md:grid-cols-2 lg:grid-cols-5">
            {["Mas clientes", "Mas control interno", "Menos errores operativos", "Mas eficiencia", "Mas crecimiento"].map(
              (item) => (
                <li key={item} className="rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-center font-semibold">
                  {item}
                </li>
              )
            )}
          </ul>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-slate-200">
            No importa el tamano de tu empresa. Lo importante es tener la estructura adecuada para crecer.
            Agenda una asesoria y definamos el siguiente paso.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={buildReservationHref("asesoria", "Asesoria estrategica para crecimiento empresarial")}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-slate-950 transition hover:bg-cyan-400"
            >
              Agendar asesoria estrategica
              <FaArrowRight />
            </Link>
            <Link
              href="/servicios"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/5 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-slate-100 transition hover:bg-white/10"
            >
              Revisar servicios base
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
