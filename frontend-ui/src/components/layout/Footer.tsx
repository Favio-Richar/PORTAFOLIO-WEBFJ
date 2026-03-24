"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  FaArrowRight,
  FaClock,
  FaEnvelope,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaWhatsapp,
} from "react-icons/fa";
import API_BASE from "@/lib/apiBase";
import { defaultContact, type ContactData } from "@/lib/data/contact";

type FooterNavItem = {
  href: string;
  label: string;
  meta: string;
};

type FooterServiceItem = {
  href: string;
  label: string;
  meta: string;
};

type ContactItem = {
  label: string;
  value: string;
  href: string;
  icon: ReactNode;
};

const SERVICE_LINKS: FooterServiceItem[] = [
  {
    href: "/servicios",
    label: "Desarrollo web",
    meta: "Sitios, plataformas y software a medida",
  },
  {
    href: "/servicios",
    label: "Automatizacion",
    meta: "Flujos, integraciones y procesos operativos",
  },
  {
    href: "/servicios",
    label: "Sistemas empresariales",
    meta: "Herramientas para control, ventas y gestion",
  },
  {
    href: "/servicios",
    label: "Consultoria tecnica",
    meta: "Diagnostico, roadmap y decisiones de arquitectura",
  },
];

const NAV_LINKS: FooterNavItem[] = [
  {
    href: "/sobre-mi",
    label: "Empresa",
    meta: "Vision, enfoque y experiencia",
  },
  {
    href: "/proyectos",
    label: "Proyectos",
    meta: "Casos reales y soluciones implementadas",
  },
  {
    href: "/clientes",
    label: "Clientes",
    meta: "Resultados, confianza y evidencia comercial",
  },
  {
    href: "/blog",
    label: "Blog",
    meta: "Contenido tecnico y estrategia digital",
  },
];

function normalizeExternalUrl(rawUrl?: string | null): string {
  const value = String(rawUrl || "").trim();
  if (!value || value === "#" || value.toLowerCase() === "null" || value.toLowerCase() === "undefined") {
    return "";
  }
  if (/^https?:\/\//i.test(value)) return value;
  if (/^\/\//.test(value)) return `https:${value}`;
  return `https://${value}`;
}

function buildWhatsAppHref(rawNumber?: string | null, message?: string): string {
  const digits = String(rawNumber || "").replace(/\D/g, "");
  if (!digits) return "";
  const text = encodeURIComponent(message || "Hola, quiero conversar sobre un proyecto.");
  return `https://wa.me/${digits}?text=${text}`;
}

export default function Footer() {
  const pathname = usePathname();
  const isServicesPage = pathname?.startsWith("/servicios");
  const [contactData, setContactData] = useState<ContactData>(defaultContact);

  useEffect(() => {
    let cancelled = false;

    const loadContact = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/contact`, { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (cancelled || !data || typeof data !== "object") return;

        setContactData({
          email: String(data.email || defaultContact.email).trim(),
          phone: String(data.phone || defaultContact.phone).trim(),
          whatsapp: String(data.whatsapp || data.phone || defaultContact.whatsapp).trim(),
          linkedin: String(data.linkedin || defaultContact.linkedin || "").trim(),
          github: String(data.github || defaultContact.github || "").trim(),
          facebook: String(data.facebook || "").trim(),
          instagram: String(data.instagram || "").trim(),
          twitter: String(data.twitter || "").trim(),
          tiktok: String(data.tiktok || "").trim(),
          location: String(data.location || defaultContact.location).trim(),
          lat: typeof data.lat === "number" ? data.lat : defaultContact.lat,
          lng: typeof data.lng === "number" ? data.lng : defaultContact.lng,
          hero_image: String(data.hero_image || "").trim(),
          hero_video: String(data.hero_video || "").trim(),
        });
      } catch {
        // Keep default contact data if the endpoint is unavailable.
      }
    };

    loadContact();
    return () => {
      cancelled = true;
    };
  }, []);

  if (pathname?.startsWith("/auth") || pathname?.startsWith("/admin")) {
    return null;
  }

  const year = new Date().getFullYear();
  const accent = isServicesPage
    ? {
        line: "from-cyan-400/70 via-sky-400/80 to-cyan-300/70",
        glow: "shadow-[0_0_40px_rgba(34,211,238,0.08)]",
        heading: "text-cyan-300",
        border: "border-cyan-400/20",
        soft: "bg-cyan-400/10",
        pill: "text-cyan-200 border-cyan-400/20 bg-cyan-400/10",
        button: "from-cyan-400 to-sky-500 text-[#03131a]",
        outline: "border-cyan-400/25 text-cyan-100 hover:border-cyan-300/40",
      }
    : {
        line: "from-indigo-400/70 via-cyan-400/80 to-violet-400/70",
        glow: "shadow-[0_0_40px_rgba(99,102,241,0.08)]",
        heading: "text-cyan-300",
        border: "border-white/10",
        soft: "bg-cyan-400/10",
        pill: "text-slate-200 border-white/10 bg-white/[0.04]",
        button: "from-cyan-400 to-indigo-500 text-[#04111d]",
        outline: "border-white/10 text-slate-100 hover:border-cyan-300/35",
      };

  const whatsappHref = buildWhatsAppHref(
    contactData.whatsapp || contactData.phone,
    "Hola, quiero conversar sobre un proyecto con FJ Digital Engineering."
  );

  const contactItems: ContactItem[] = [
    {
      label: "Correo",
      value: contactData.email || defaultContact.email,
      href: `mailto:${contactData.email || defaultContact.email}`,
      icon: <FaEnvelope />,
    },
    {
      label: "Telefono",
      value: contactData.phone || defaultContact.phone,
      href: `tel:${String(contactData.phone || defaultContact.phone).replace(/\s+/g, "")}`,
      icon: <FaPhoneAlt />,
    },
    {
      label: "WhatsApp",
      value: contactData.whatsapp || defaultContact.whatsapp,
      href: whatsappHref,
      icon: <FaWhatsapp />,
    },
    {
      label: "Ubicacion",
      value: contactData.location || defaultContact.location,
      href: "/contacto",
      icon: <FaMapMarkerAlt />,
    },
  ].filter((item) => Boolean(item.value && item.href));

  const socialLinks = [
    {
      href: normalizeExternalUrl(contactData.github || defaultContact.github),
      label: "GitHub",
      icon: <FaGithub />,
    },
    {
      href: normalizeExternalUrl(contactData.linkedin || defaultContact.linkedin),
      label: "LinkedIn",
      icon: <FaLinkedin />,
    },
    {
      href: normalizeExternalUrl(contactData.instagram),
      label: "Instagram",
      icon: <FaInstagram />,
    },
  ].filter((item) => Boolean(item.href));

  return (
    <footer
      suppressHydrationWarning
      className="relative overflow-hidden border-t border-white/10 bg-[#040507] text-slate-300"
    >
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accent.line}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(56,189,248,0.08),transparent_28%),radial-gradient(circle_at_85%_78%,rgba(99,102,241,0.08),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.04),transparent_22%)] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 pb-8 pt-12">
        <div className={`mb-10 flex flex-col gap-6 rounded-[1.75rem] border ${accent.border} bg-white/[0.03] px-6 py-6 backdrop-blur-xl md:flex-row md:items-center md:justify-between ${accent.glow}`}>
          <div className="max-w-2xl space-y-3">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] ${accent.pill}`}>
              <FaClock className="text-[10px]" />
              Agenda abierta | Diagnostico en 24h
            </span>
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-white md:text-[2rem]">
                Un cierre serio para una agencia que vende con confianza.
              </h2>
              <p className="max-w-xl text-sm leading-7 text-slate-400 md:text-[15px]">
                Disenamos plataformas, automatizaciones y sistemas empresariales con una presentacion pulida, estructura clara y foco en resultados reales.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contacto"
              className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r px-5 py-3 text-sm font-black transition-transform duration-300 hover:-translate-y-0.5 ${accent.button}`}
            >
              Agendar consulta <FaArrowRight className="text-xs" />
            </Link>
            <Link
              href="/proyectos"
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-all duration-300 ${accent.outline}`}
            >
              Ver proyectos
            </Link>
          </div>
        </div>

        <div className="grid gap-10 border-b border-white/10 pb-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-4">
              <div className="relative">
                <div className={`absolute inset-0 rounded-2xl blur-xl ${accent.soft}`} />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-[#0d1220] to-[#05070d] text-white font-black text-lg tracking-[0.18em]">
                  FJ
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-lg font-black leading-none tracking-tight text-white md:text-xl">
                  FJ Digital Engineering
                </p>
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                  Arquitectura digital y sistemas con proposito
                </p>
              </div>
            </Link>

            <p className="max-w-md text-sm leading-7 text-slate-400">
              Construimos experiencias digitales sobrias, claras y escalables para empresas que necesitan crecer con control, tecnologia bien pensada y ejecucion confiable.
            </p>

            <div className="flex flex-wrap gap-3">
              <span className={`inline-flex items-center rounded-full border px-3 py-2 text-[11px] font-semibold ${accent.pill}`}>
                Respuesta &lt; 24h
              </span>
              <span className={`inline-flex items-center rounded-full border px-3 py-2 text-[11px] font-semibold ${accent.pill}`}>
                Remoto Chile y LATAM
              </span>
              <span className={`inline-flex items-center rounded-full border px-3 py-2 text-[11px] font-semibold ${accent.pill}`}>
                Soporte continuo
              </span>
            </div>

            {socialLinks.length > 0 ? (
              <div className="flex items-center gap-3">
                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-cyan-400/10 hover:text-white"
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <FooterColumn title="Servicios" accentClass={accent.heading}>
            {SERVICE_LINKS.map((item) => (
              <FooterInternalLink key={item.label} href={item.href} label={item.label} meta={item.meta} />
            ))}
          </FooterColumn>

          <FooterColumn title="Explorar" accentClass={accent.heading}>
            {NAV_LINKS.map((item) => (
              <FooterInternalLink key={item.label} href={item.href} label={item.label} meta={item.meta} />
            ))}
          </FooterColumn>

          <div className="space-y-5">
            <FooterHeading title="Contacto" accentClass={accent.heading} />

            <div className="space-y-3">
              {contactItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 transition-all duration-300 hover:border-cyan-300/25 hover:bg-white/[0.04]"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#0b101a] text-cyan-300">
                    {item.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-[0.24em] text-slate-500">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-slate-200 group-hover:text-white break-words">
                      {item.value}
                    </span>
                  </span>
                </a>
              ))}
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-4">
              <p className="text-sm font-semibold text-white">Atencion profesional</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Diagnostico, propuesta y ejecucion orientada a resultados medibles.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 py-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-200">
              &copy; {year} FJ Digital Engineering. Todos los derechos reservados.
            </p>
            <p className="max-w-xl text-xs uppercase tracking-[0.18em] text-slate-500">
              Ingenieria digital, automatizacion y sistemas empresariales para marcas que buscan una presencia premium y funcional.
            </p>
          </div>

          <div className="flex flex-col gap-3 text-sm text-slate-400 md:items-end">
            <div className="flex flex-wrap items-center gap-3">
              <span>{contactData.location || defaultContact.location}</span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-600 md:inline-block" />
              <span>{contactData.email || defaultContact.email}</span>
            </div>
            <div className="flex flex-wrap items-center gap-5 text-xs uppercase tracking-[0.18em]">
              <Link href="/privacidad" className="transition-colors hover:text-white">
                Privacidad
              </Link>
              <Link href="/terminos" className="transition-colors hover:text-white">
                Terminos
              </Link>
              <Link href="/contacto" className="transition-colors hover:text-white">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterHeading({ title, accentClass }: { title: string; accentClass: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`h-5 w-[3px] rounded-full ${accentClass.replace("text-", "bg-")}`} />
      <h3 className="text-sm font-black uppercase tracking-[0.22em] text-white">{title}</h3>
    </div>
  );
}

function FooterColumn({
  title,
  accentClass,
  children,
}: {
  title: string;
  accentClass: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-5">
      <FooterHeading title={title} accentClass={accentClass} />
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function FooterInternalLink({
  href,
  label,
  meta,
}: {
  href: string;
  label: string;
  meta: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-transparent px-3 py-3 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.03]"
    >
      <span className="block text-sm font-semibold text-slate-100 transition-colors group-hover:text-white">
        {label}
      </span>
      <span className="mt-1 block text-xs leading-5 text-slate-500">{meta}</span>
    </Link>
  );
}
