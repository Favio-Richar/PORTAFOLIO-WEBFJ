"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  FaArrowRight,
  FaBriefcase,
  FaBullhorn,
  FaCamera,
  FaCalendarCheck,
  FaChartLine,
  FaCheck,
  FaCheckCircle,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaCode,
  FaCreditCard,
  FaEnvelopeOpenText,
  FaFacebook,
  FaGoogle,
  FaGraduationCap,
  FaHeartbeat,
  FaHome,
  FaInstagram,
  FaMapMarkerAlt,
  FaMobileAlt,
  FaPaintBrush,
  FaPenSquare,
  FaQuoteLeft,
  FaRobot,
  FaRocket,
  FaServer,
  FaShieldAlt,
  FaShopify,
  FaShoppingBag,
  FaStar,
  FaSyncAlt,
  FaTimes,
  FaTools,
  FaUsers,
  FaUtensils,
  FaWhatsapp,
  FaWordpress,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import API_BASE from "@/lib/apiBase";
import "@/styles/services-elite.scss";

// --- TYPES ---

interface Plan {
  id: number;
  name: string;
  description: string;
  modules: string;
  price: string;
  priceValue: number;
  includes: string[];
  delivery: string[];
  idealFor: string[];
  popular?: boolean;
  image: string;
}

interface AdditionalService {
  id: number;
  name: string;
  description: string;
  price: string;
  priceValue: number;
  icon: React.ReactNode;
  category: string;
  includes: string[];
  paymentType: string;
}

interface FAQ {
  q: string;
  a: string;
}

interface Stat {
  icon: React.ReactNode;
  number: string;
  label: string;
}

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  image: string;
  date: string;
}

interface ApiReviewUser {
  name?: string | null;
  avatar_url?: string | null;
}

interface ApiReviewItem {
  id: number;
  display_name?: string | null;
  author_name?: string | null;
  author_role?: string | null;
  author_company?: string | null;
  comment?: string | null;
  content?: string | null;
  rating: number;
  created_at?: string | null;
  author_image?: string | null;
  status?: string | null;
  user?: ApiReviewUser | null;
}

interface ApiReviewListResponse {
  items?: ApiReviewItem[];
}

interface Industry {
  id: number;
  name: string;
  icon: React.ReactNode;
  description: string;
  examples: string[];
}

interface ApiPlan {
  id: number;
  name: string;
  description: string;
  modules?: string | null;
  price: string;
  includes?: string | null;
  delivery?: string | null;
  ideal_for?: string | null;
  category?: string | null;
}

interface ApiAdditionalService {
  id: number;
  name: string;
  description: string;
  price: string;
  icon?: string | null;
  includes?: string | null;
  payment_type?: string | null;
}

interface ApiFaq {
  id: number;
  question: string;
  answer: string;
}

interface ApiIndustry {
  id: number;
  name: string;
  description: string;
  icon?: string | null;
  examples?: string | null;
}

interface ApiAdvisoryService {
  id: number;
  title: string;
  price: string;
  duration?: string | null;
  audience?: string | null;
  includes?: string | null;
  result: string;
  market_note?: string | null;
  icon?: string | null;
  order_index?: number;
  active?: boolean;
}

interface ApiMarqueeCard {
  id: number;
  title: string;
  image_url: string;
  order_index?: number;
  active?: boolean;
}

interface MarqueeCard {
  id: number;
  title: string;
  image: string;
}

// --- DATA DEFINITIONS ---

const DEFAULT_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "56971464296";

const defaultConfig = {
  main_title: "Agencia Digital de Alto Impacto",
  subtitle: "Soluciones digitales, automatización y desarrollo de sistemas para empresas que necesitan crecer con control, ventas consistentes y operaciones eficientes.",
  whatsapp_number: DEFAULT_WHATSAPP_NUMBER,
  email: "contacto@tuagencia.cl",
  address: "Santiago, Chile"
};

const BACKEND_URL = API_BASE;

const normalizeWhatsappNumber = (value?: string | null): string =>
  String(value || "")
    .trim()
    .replace(/[^\d]/g, "");

const sanitizeAdditionalServiceName = (value: string): string => {
  const raw = String(value || "").trim();
  const lower = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (lower.includes("integracion crm") && (lower.includes("hubspot") || lower.includes("salesforce"))) {
    return "Integracion CRM Empresarial";
  }

  return raw
    .replace(/\(\s*hubspot\s*\/\s*salesforce\s*\)/gi, "")
    .replace(/\(\s*hubspot\s*\/\s*sales force\s*\)/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
};

type ReservationType = "asesoria" | "plan" | "servicio" | "combo";

// IMAGENES DE APOYO VISUAL PARA LA LANDING DE SERVICIOS
const images = {
  heroAmbient: "/img/dark-3d-background.webp",
  heroShowcase: "/img/the7.jpg",
  serviceShowcase: "/img/webdev.jpg",
  serviceMobile: "/img/mobile.jpg",
  serviceResponsive: "/img/Responsive.jpg",
  faqSupport: "/img/support.jpg",
  hero: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80",
  process: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80",
  landing: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80",
  corporativa: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
  ecommerce: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
  testimonial1: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
  testimonial2: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
  testimonial3: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
  cta: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&q=80",
  team: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80"
};

const serviceExecutionCards = [
  {
    badge: "Captacion comercial",
    title: "Web comercial para captar y convertir.",
    description:
      "Creamos sitios y landing pages con oferta clara, confianza visual y llamados a la accion pensados para generar consultas.",
    support:
      "Funciona mejor para campañas, trafico organico y presentaciones comerciales.",
    highlights: ["Oferta clara", "Conversion real", "Mejor confianza"],
    imageMode: "photo",
    glow: "from-fuchsia-500/20 via-cyan-400/10 to-transparent",
    image: images.serviceShowcase,
    imageAlt: "Sitio web comercial para captar consultas"
  },
  {
    badge: "Arquitectura operativa",
    title: "Arquitectura estable para crecer sin friccion.",
    description:
      "Definimos modulos, flujos y reglas para que la solucion sea mantenible, escalable y mas facil de operar.",
    support:
      "Menos retrabajo tecnico, mas orden interno y mejor continuidad.",
    highlights: ["Base escalable", "Orden interno", "Continuidad"],
    imageMode: "photo",
    glow: "from-amber-300/16 via-sky-400/10 to-transparent",
    image: images.process,
    imageAlt: "Equipo trabajando arquitectura de procesos digitales"
  },
  {
    badge: "Integracion real",
    title: "Integraciones que ordenan la operacion.",
    description:
      "Conectamos WhatsApp, formularios, CRM y correo para acelerar respuesta, seguimiento y control comercial.",
    support:
      "La informacion queda conectada y lista para operar sin duplicidad.",
    highlights: ["WhatsApp y CRM", "Seguimiento", "Datos claros"],
    imageMode: "mockup",
    glow: "from-cyan-400/18 via-sky-500/12 to-transparent",
    image: images.serviceMobile,
    imageAlt: "Integracion de herramientas digitales empresariales"
  },
  {
    badge: "Experiencia premium",
    title: "Experiencia premium en desktop y movil.",
    description:
      "Cuidamos legibilidad, velocidad y consistencia visual para que tu marca se vea seria y profesional en todo dispositivo.",
    support:
      "Una experiencia clara mejora percepcion, confianza y permanencia.",
    highlights: ["Responsive real", "Lectura clara", "Mas valor"],
    imageMode: "mockup",
    glow: "from-indigo-400/18 via-cyan-300/10 to-transparent",
    image: images.serviceResponsive,
    imageAlt: "Experiencia digital premium en distintos dispositivos"
  }
] as const;

const parseArrayField = (value: unknown): string[] => {
  const splitListTokens = (text: string, splitByComma: boolean): string[] => {
    const normalized = String(text || "")
      .replace(/\r/g, "")
      .replace(/\\n/g, "\n")
      .replace(/`n/g, "\n");

    const splitter = splitByComma ? /[\n,]/ : /\n/;
    return normalized
      .split(splitter)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  if (Array.isArray(value)) {
    return value.flatMap((item) => splitListTokens(String(item ?? ""), false));
  }

  if (typeof value !== "string") return [];
  const trimmed = value.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.flatMap((item) => splitListTokens(String(item ?? ""), false));
    }
  } catch {
    // fallback to comma/new line parsing
  }

  return splitListTokens(trimmed, true);
};

const parsePriceValue = (price: string): number => {
  const numeric = Number(String(price || "").replace(/[^\d]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
};

const LIVE_ID_OFFSETS = {
  plan: 100000,
  service: 200000,
  faq: 300000,
  advisory: 400000,
  industry: 500000,
  review: 600000,
  marquee: 700000,
} as const;

const makeLiveId = (offset: number, rawId: number): number => offset + (Number(rawId) || 0);
const VIDEO_URL_PATTERN = /\.(mp4|webm|ogg|mov|m4v|avi)(\?.*)?$/i;
const isVideoMediaUrl = (url?: string | null): boolean => {
  const value = String(url || "").trim();
  if (!value) return false;
  return VIDEO_URL_PATTERN.test(value) || value.includes("/video/upload/");
};

const sanitizeReviewAvatar = (rawValue?: string | null): string => {
  const value = String(rawValue || "").trim();
  if (!value) return "";
  const lower = value.toLowerCase();
  if (lower.includes("via.placeholder.com") || lower.includes("placehold.co")) return "";
  if (lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("data:image/")) {
    return value;
  }
  return "";
};

const formatReviewDate = (rawDate?: string | null): string => {
  if (!rawDate) return "Reciente";
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return "Reciente";
  return parsed.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
};

const mapApiReviewToTestimonial = (review: ApiReviewItem): Testimonial => {
  const name = review.user?.name || review.display_name || review.author_name || "Cliente";
  const image = sanitizeReviewAvatar(review.user?.avatar_url || review.author_image || null);
  const content = String(review.comment || review.content || "").trim();

  return {
    id: makeLiveId(LIVE_ID_OFFSETS.review, review.id),
    name,
    role: review.author_role || "Cliente verificado",
    company: review.author_company || "Cliente",
    content,
    rating: Math.max(1, Math.min(5, Number(review.rating) || 5)),
    image,
    date: formatReviewDate(review.created_at),
  };
};

const INDUSTRY_ICON_COMPONENTS: Record<string, React.ReactNode> = {
  utensils: <FaUtensils />,
  home: <FaHome />,
  heartbeat: <FaHeartbeat />,
  shoppingbag: <FaShoppingBag />,
  briefcase: <FaBriefcase />,
  graduationcap: <FaGraduationCap />,
};

const SERVICE_ICON_COMPONENTS: Record<string, React.ReactNode> = {
  robot: <FaRobot />,
  bullhorn: <FaBullhorn />,
  envelope: <FaEnvelopeOpenText />,
  sync: <FaSyncAlt />,
  paintbrush: <FaPaintBrush />,
  camera: <FaCamera />,
  mobile: <FaMobileAlt />,
  creditcard: <FaCreditCard />,
  rocket: <FaRocket />,
  tools: <FaTools />,
  server: <FaServer />,
  shield: <FaShieldAlt />,
  chartline: <FaChartLine />,
};

const resolvePlanImage = (category?: string | null) => {
  const key = String(category || "").toLowerCase();
  if (key.includes("ecommerce") || key.includes("retail")) return images.ecommerce;
  if (key.includes("landing") || key.includes("onepage")) return images.landing;
  return images.corporativa;
};

const resolveIndustryIcon = (icon?: string | null, name?: string) => {
  const direct = String(icon || "").toLowerCase().replace(/[^a-z]/g, "");
  if (direct && INDUSTRY_ICON_COMPONENTS[direct]) return INDUSTRY_ICON_COMPONENTS[direct];
  const inferred = String(name || "").toLowerCase();
  if (inferred.includes("restaur")) return <FaUtensils />;
  if (inferred.includes("inmobil")) return <FaHome />;
  if (inferred.includes("salud")) return <FaHeartbeat />;
  if (inferred.includes("retail") || inferred.includes("commerce")) return <FaShoppingBag />;
  if (inferred.includes("educ")) return <FaGraduationCap />;
  return <FaBriefcase />;
};

const getIndustryTheme = (name: string) => {
  const key = String(name || "").toLowerCase();

  if (key.includes("restaur") || key.includes("food")) {
    return {
      iconBox: "bg-orange-500/15 border border-orange-400/30",
      iconColor: "text-orange-300",
      chip: "bg-orange-500/10 border border-orange-400/30 text-orange-100",
      glow: "hover:shadow-[0_24px_60px_rgba(249,115,22,0.25)]",
      border: "hover:border-orange-400/50",
    };
  }
  if (key.includes("inmobil") || key.includes("propiedad")) {
    return {
      iconBox: "bg-sky-500/15 border border-sky-400/30",
      iconColor: "text-sky-300",
      chip: "bg-sky-500/10 border border-sky-400/30 text-sky-100",
      glow: "hover:shadow-[0_24px_60px_rgba(56,189,248,0.22)]",
      border: "hover:border-sky-400/50",
    };
  }
  if (key.includes("salud") || key.includes("bienestar")) {
    return {
      iconBox: "bg-emerald-500/15 border border-emerald-400/30",
      iconColor: "text-emerald-300",
      chip: "bg-emerald-500/10 border border-emerald-400/30 text-emerald-100",
      glow: "hover:shadow-[0_24px_60px_rgba(16,185,129,0.22)]",
      border: "hover:border-emerald-400/50",
    };
  }
  if (key.includes("retail") || key.includes("commerce")) {
    return {
      iconBox: "bg-violet-500/15 border border-violet-400/30",
      iconColor: "text-violet-300",
      chip: "bg-violet-500/10 border border-violet-400/30 text-violet-100",
      glow: "hover:shadow-[0_24px_60px_rgba(167,139,250,0.25)]",
      border: "hover:border-violet-400/50",
    };
  }
  if (key.includes("educ") || key.includes("capacit")) {
    return {
      iconBox: "bg-amber-500/15 border border-amber-400/30",
      iconColor: "text-amber-300",
      chip: "bg-amber-500/10 border border-amber-400/30 text-amber-100",
      glow: "hover:shadow-[0_24px_60px_rgba(245,158,11,0.24)]",
      border: "hover:border-amber-400/50",
    };
  }
  return {
    iconBox: "bg-cyan-500/15 border border-cyan-400/30",
    iconColor: "text-cyan-300",
    chip: "bg-cyan-500/10 border border-cyan-400/30 text-cyan-100",
    glow: "hover:shadow-[0_24px_60px_rgba(34,211,238,0.22)]",
    border: "hover:border-cyan-400/50",
  };
};

const resolveAdditionalServiceIcon = (icon?: string | null) => {
  const key = String(icon || "").toLowerCase().replace(/[^a-z]/g, "");
  return SERVICE_ICON_COMPONENTS[key] || <FaTools />;
};

const resolveAdvisoryIcon = (icon?: string | null) => {
  const key = String(icon || "").toLowerCase().replace(/[^a-z]/g, "");
  if (key.includes("robot")) return <FaRobot />;
  if (key.includes("chart")) return <FaChartLine />;
  if (key.includes("server") || key.includes("erp")) return <FaServer />;
  if (key.includes("code") || key.includes("dev")) return <FaCode />;
  if (key.includes("clock") || key.includes("time")) return <FaClock />;
  return <FaBriefcase />;
};

const resolveServiceCategory = (service: ApiAdditionalService): string => {
  const source = `${service.name || ""} ${service.description || ""}`.toLowerCase();
  if (source.includes("asesor") || source.includes("consultor") || source.includes("diagnostic")) return "Asesoria";
  if (source.includes("seo") || source.includes("ads") || source.includes("google") || source.includes("meta")) return "Marketing";
  if (source.includes("automat") || source.includes("crm") || source.includes("email")) return "Automatizacion";
  if (source.includes("brand") || source.includes("dise") || source.includes("foto")) return "Diseno";
  if (source.includes("hosting") || source.includes("manten") || source.includes("seguridad")) return "Soporte";
  if (source.includes("app") || source.includes("web") || source.includes("integraci") || source.includes("migraci")) return "Desarrollo";
  return "Servicio";
};

type AdvisoryService = {
  id: number;
  icon: React.ReactNode;
  title: string;
  price: string;
  duration: string;
  audience: string[];
  includes: string[];
  result: string;
  marketNote: string;
};

const defaultAdvisoryServices: AdvisoryService[] = [
  {
    id: 1,
    icon: <FaBriefcase />,
    title: "Asesoria TI Estrategica para PYMEs",
    price: "$79.000 CLP",
    duration: "60 minutos",
    audience: [
      "Minimarkets",
      "Talleres",
      "Servicios tecnicos",
      "Empresas pequenas que no saben que sistema implementar",
    ],
    includes: [
      "Diagnostico general del negocio (ventas, inventario, procesos)",
      "Evaluacion de herramientas actuales",
      "Identificacion de problemas criticos",
      "Recomendacion de software (ERP, POS, CRM, automatizacion)",
      "Definicion de prioridades",
      "Plan de accion de corto y mediano plazo",
    ],
    result: "El cliente sale con claridad sobre que sistema necesita, que implementar primero y que inversion estimada requiere.",
    marketNote: "Referencia mercado Chile: $70.000-$120.000. $79.000 es competitivo y profesional.",
  },
  {
    id: 2,
    icon: <FaRobot />,
    title: "Asesoria en Automatizacion de Procesos",
    price: "$89.000 CLP",
    duration: "60 minutos",
    audience: [
      "Empresas con tareas repetitivas manuales",
      "Negocios que usan Excel para todo",
      "Empresas que quieren ahorrar tiempo",
    ],
    includes: [
      "Identificacion de procesos manuales",
      "Evaluacion de tareas repetitivas",
      "Analisis de ahorro potencial",
      "Propuesta de automatizacion (RPA, scripts, integraciones API)",
      "Definicion de herramientas necesarias",
      "Roadmap tecnico de implementacion",
    ],
    result: "Plan concreto para reducir carga operativa y errores humanos.",
    marketNote: "Referencia mercado Chile: $80.000-$150.000. $89.000 es atractivo y serio.",
  },
  {
    id: 3,
    icon: <FaChartLine />,
    title: "Asesoria Web y Optimizacion de Ventas",
    price: "$69.000 CLP",
    duration: "60 minutos",
    audience: [
      "Negocios con pagina web que no vende",
      "E-commerce con baja conversion",
      "Empresas con mala presentacion digital",
    ],
    includes: [
      "Revision UX/UI",
      "Evaluacion de estructura comercial",
      "Analisis de confianza y credibilidad",
      "Recomendaciones de mejora",
      "Checklist SEO basico",
      "Estrategia para aumentar conversion",
    ],
    result: "Lista priorizada de mejoras concretas para vender mas.",
    marketNote: "Referencia mercado Chile: $50.000-$100.000. $69.000 es excelente punto medio.",
  },
  {
    id: 4,
    icon: <FaServer />,
    title: "Asesoria ERP / Sistema de Gestion Empresarial",
    price: "$99.000 CLP",
    duration: "90 minutos",
    audience: [
      "Bodegas",
      "Minimarkets",
      "Empresas con inventario",
      "Negocios que necesitan control real",
    ],
    includes: [
      "Analisis completo de procesos",
      "Definicion de modulos necesarios",
      "Estructura de roles",
      "Evaluacion build vs SaaS",
      "Integracion con facturacion",
      "Roadmap de implementacion",
    ],
    result: "Documento base para implementar un ERP correctamente.",
    marketNote: "Referencia mercado Chile: $100.000-$200.000. $99.000 es competitivo y atractivo.",
  },
  {
    id: 5,
    icon: <FaCode />,
    title: "Asesoria en Desarrollo de Sistema a Medida",
    price: "$89.000 CLP",
    duration: "60 minutos",
    audience: [
      "Empresas que quieren sistema propio",
      "Clientes que no saben cuanto cuesta desarrollar",
    ],
    includes: [
      "Levantamiento de requerimientos",
      "Definicion funcional inicial",
      "Recomendacion tecnologica",
      "Estimacion preliminar de costos y tiempos",
      "Propuesta de arquitectura",
    ],
    result: "Base clara para cotizacion formal de desarrollo.",
    marketNote: "Referencia mercado Chile: $70.000-$150.000. $89.000 es ideal para posicion profesional.",
  },
  {
    id: 6,
    icon: <FaClock />,
    title: "Primera Sesion Diagnostica Breve",
    price: "$39.000 CLP",
    duration: "30 minutos",
    audience: [
      "Ideal como puerta de entrada",
      "Empresas que quieren un diagnostico general rapido",
      "Clientes que prefieren validar antes de invertir mas",
    ],
    includes: [
      "Diagnostico general",
      "Identificacion de problema principal",
      "Recomendacion de siguiente paso",
      "Sin plan detallado",
    ],
    result: "Muchos clientes compran primero esta sesion y luego avanzan a una asesoria completa.",
    marketNote: "Precio entrada recomendado para activar nuevas oportunidades.",
  },
];

const plans: Plan[] = [
  {
    id: 1,
    name: 'Landing Page Profesional',
    description: 'Página única optimizada para conversión máxima. Ideal para campañas Google Ads y Meta Ads.',
    modules: '1 página + 3 secciones',
    price: 'Desde $149.000 CLP',
    priceValue: 149000,
    includes: [
      'Diseño UX/UI premium responsive',
      'Copywriting persuasivo',
      'Formulario de captura de leads',
      'Integración WhatsApp Business API',
      'Google Analytics 4 + Meta Pixel',
      'Optimización velocidad Core Web Vitals',
      'SSL + Hosting 1 año incluido',
      '1 revisión de diseño incluida'
    ],
    delivery: [
      'Entrega en 3-5 días hábiles',
      'Código fuente entregado',
      'Manual de administración',
      'Soporte técnico 15 días'
    ],
    idealFor: ['Campañas publicitarias', 'Lanzamientos de producto', 'Eventos', 'Servicios profesionales'],
    image: images.landing
  },
  {
    id: 2,
    name: 'Web Corporativa Pro',
    description: 'Sitio institucional multi-página que proyecta profesionalismo y autoridad de marca.',
    modules: '5-8 páginas personalizadas',
    price: 'Desde $299.000 CLP',
    priceValue: 299000,
    includes: [
      'Diseño exclusivo sin templates',
      'Hasta 8 páginas (Inicio, Nosotros, Servicios, etc.)',
      'Blog con panel administrativo',
      'SEO técnico On-Page completo',
      'Integración redes sociales',
      'Mapa interactivo Google Maps',
      'Formularios avanzados con validación',
      'Certificado SSL + Hosting 1 año'
    ],
    delivery: [
      'Entrega en 7-12 días hábiles',
      '2 revisiones de diseño incluidas',
      'Capacitación uso panel admin',
      'Backups automáticos mensuales',
      'Soporte técnico 30 días'
    ],
    idealFor: ['PYMEs chilenas', 'Consultoras', 'Empresas B2B', 'Estudios profesionales'],
    popular: true,
    image: images.corporativa
  },
  {
    id: 3,
    name: 'E-Commerce Completo',
    description: 'Tienda online profesional lista para vender con pasarelas de pago chilenas integradas.',
    modules: 'Ilimitado productos',
    price: 'Desde $549.000 CLP',
    priceValue: 549000,
    includes: [
      'Catálogo ilimitado de productos',
      'Pasarela Webpay Plus / Flow / Khipu',
      'Carrito de compras persistente',
      'Gestión de stock y inventario',
      'Panel de clientes con historial',
      'Reportes de ventas y analytics',
      'App móvil de gestión incluida',
      'Integración con servicios de despacho (Chilexpress, Starken, Blue Express)'
    ],
    delivery: [
      'Entrega en 15-25 días hábiles',
      'Capacitación completa equipo',
      'Soporte prioritario 60 días',
      'Optimización continua 3 meses',
      'Marketing digital inicial incluido'
    ],
    idealFor: ['Retail chileno', 'Marcas propias', 'Importadores', 'Distribuidores', 'Artesanías'],
    image: images.ecommerce
  },
  {
    id: 4,
    name: 'Web App a Medida',
    description: 'Aplicación web personalizada para procesos específicos de tu negocio.',
    modules: 'Funcionalidades custom',
    price: 'Desde $899.000 CLP',
    priceValue: 899000,
    includes: [
      'Análisis de requerimientos detallado',
      'Arquitectura escalable',
      'Base de datos relacional',
      'API RESTful propia',
      'Panel de administración avanzado',
      'Autenticación de usuarios (roles)',
      'Reportes y dashboards personalizados',
      'Integración con sistemas externos'
    ],
    delivery: [
      'Entrega en 30-45 días hábiles',
      'Documentación técnica completa',
      'Capacitación intensiva',
      'Soporte y mantenimiento 90 días',
      'Garantía de funcionamiento 6 meses'
    ],
    idealFor: ['Startups chilenas', 'Procesos internos', 'SaaS', 'Marketplaces verticales'],
    image: images.corporativa
  },
  {
    id: 5,
    name: 'One Page Premium',
    description: 'Todo tu negocio en una sola página con navegación fluida y animaciones premium.',
    modules: '1 página + 8 secciones',
    price: 'Desde $199.000 CLP',
    priceValue: 199000,
    includes: [
      'Diseño storytelling scroll',
      'Animaciones GSAP avanzadas',
      'Navegación inteligente por secciones',
      'Galería multimedia interactiva',
      'Integración WhatsApp y redes',
      'Formulario de contacto multi-step',
      'Optimización móvil extrema',
      'SEO local para Google Maps'
    ],
    delivery: [
      'Entrega en 5-8 días hábiles',
      '1 revisión incluida',
      'Código optimizado',
      'Soporte 15 días'
    ],
    idealFor: ['Restaurantes', 'Spas y centros estéticos', 'Profesionales independientes', 'Eventos'],
    image: images.landing
  },
  {
    id: 6,
    name: 'Portal Inmobiliario',
    description: 'Plataforma especializada para corredores y agencias inmobiliarias chilenas.',
    modules: 'Sistema completo',
    price: 'Desde $449.000 CLP',
    priceValue: 449000,
    includes: [
      'Ficha de propiedades profesional',
      'Buscador avanzado con filtros',
      'Mapa interactivo con geolocalización',
      'Calculadora de crédito hipotecario',
      'Integración portales (Portalinmobiliario, Yapo, MercadoLibre)',
      'Gestión de leads y corredores',
      'Alertas de nuevas propiedades',
      'App móvil para corredores'
    ],
    delivery: [
      'Entrega en 20-30 días hábiles',
      'Capacitación uso avanzado',
      'Soporte 60 días',
      'Importación de propiedades inicial'
    ],
    idealFor: ['Corredoras de propiedades', 'Inmobiliarias', 'Constructoras', 'Administradoras'],
    image: images.corporativa
  }
];

const legacyAdditionalServices: AdditionalService[] = [
  // AUTOMATIZACIÓN
  {
    id: 1,
    name: "Bot WhatsApp Business API",
    description: "Automatización inteligente con respuestas automáticas, menús interactivos y integración con tu CRM.",
    price: "$180.000",
    priceValue: 180000,
    icon: <FaRobot />,
    category: "Automatización",
    paymentType: "Setup único",
    includes: ["Respuestas automáticas 24/7", "Menú interactivo con botones", "Integración web y forms", "Analytics de conversaciones", "Plantillas HSM aprobadas"]
  },
  {
    id: 2,
    name: "Email Marketing Automation",
    description: "Secuencias automáticas de correos para nutrir leads y recuperar carritos abandonados.",
    price: "$120.000",
    priceValue: 120000,
    icon: <FaEnvelopeOpenText />,
    category: "Automatización",
    paymentType: "Setup + $25.000/mes",
    includes: ["Secuencias de bienvenida", "Carritos abandonados", "Newsletters mensuales", "Segmentación avanzada", "Reportes de apertura y clicks"]
  },
  {
    id: 3,
    name: "Integracion CRM Empresarial",
    description: "Conecta tu web con tu CRM para gestión centralizada de clientes y ventas.",
    price: "$250.000",
    priceValue: 250000,
    icon: <FaSyncAlt />,
    category: "Automatización",
    paymentType: "Setup único",
    includes: ["Sincronización leads automática", "Historial de interacciones", "Scoring de leads", "Tareas automáticas", "Reportes unificados"]
  },
  // MARKETING DIGITAL
  {
    id: 4,
    name: "SEO Local Chile",
    description: "Posicionamiento en Google para búsquedas locales. Aparece en Google Maps y el pack local.",
    price: "$150.000",
    priceValue: 150000,
    icon: <FaMapMarkerAlt />,
    category: "Marketing",
    paymentType: "Mensual",
    includes: ["Optimización Google Business", "Keywords locales", "Link building local", "Reviews management", "Reporte mensual posiciones"]
  },
  {
    id: 5,
    name: "Campañas Google Ads",
    description: "Gestión profesional de campañas de búsqueda, display y remarketing en Google.",
    price: "$200.000",
    priceValue: 200000,
    icon: <FaGoogle />,
    category: "Marketing",
    paymentType: "Setup + 15% ad spend",
    includes: ["Estrategia de keywords", "Copy ads optimizado", "Landing pages dedicadas", "Remarketing dinámico", "Optimización continua"]
  },
  {
    id: 6,
    name: "Meta Ads (Facebook/Instagram)",
    description: "Campañas en redes sociales enfocadas en conversión y generación de leads.",
    price: "$180.000",
    priceValue: 180000,
    icon: <FaBullhorn />,
    category: "Marketing",
    paymentType: "Setup + 15% ad spend",
    includes: ["Segmentación avanzada", "Creatividades A/B testing", "Píxeles y eventos", "Lookalike audiences", "Reportes semanales"]
  },
  // DISEÑO Y BRANDING
  {
    id: 7,
    name: "Branding Completo",
    description: "Identidad visual profesional: logo, colores, tipografías y manual de marca.",
    price: "$250.000",
    priceValue: 250000,
    icon: <FaPaintBrush />,
    category: "Diseño",
    paymentType: "Proyecto único",
    includes: ["Logo vectorial (3 propuestas)", "Paleta cromática", "Tipografías corporativas", "Manual de marca básico", "Aplicaciones básicas"]
  },
  {
    id: 8,
    name: "Pack Redes Sociales",
    description: "Diseño de templates para Instagram, Facebook y LinkedIn profesional.",
    price: "$80.000",
    priceValue: 80000,
    icon: <FaInstagram />,
    category: "Diseño",
    paymentType: "Pack único",
    includes: ["10 templates feed", "5 stories animadas", "Portadas de highlights", "Foto de perfil optimizada", "Guía de uso"]
  },
  {
    id: 9,
    name: "Fotografía Profesional",
    description: "Sesión fotográfica para productos, local o equipo. Incluye edición.",
    price: "$120.000",
    priceValue: 120000,
    icon: <FaCamera />,
    category: "Diseño",
    paymentType: "Sesión",
    includes: ["2 horas de sesión", "20 fotos editadas", "Fotos de producto", "Fotos ambientales", "Entrega digital 48h"]
  },
  // DESARROLLO Y TECNOLOGÍA
  {
    id: 10,
    name: "App Móvil PWA",
    description: "Aplicación web progresiva que funciona como app nativa en iOS y Android.",
    price: "$350.000",
    priceValue: 350000,
    icon: <FaMobileAlt />,
    category: "Desarrollo",
    paymentType: "Proyecto único",
    includes: ["Instalable en móviles", "Notificaciones push", "Funciona offline", "Icono en home screen", "Actualización automática"]
  },
  {
    id: 11,
    name: "Integración Pasarelas de Pago",
    description: "Webpay Plus, Flow, Khipu, MercadoPago, Stripe o PayPal integrados.",
    price: "$80.000",
    priceValue: 80000,
    icon: <FaCreditCard />,
    category: "Desarrollo",
    paymentType: "Por pasarela",
    includes: ["Configuración completa", "Webhook de confirmación", "Panel de transacciones", "Reembolsos automáticos", "Soporte técnico"]
  },
  {
    id: 12,
    name: "Migración WordPress a Moderno",
    description: "Migra tu web lenta de WordPress a tecnología moderna (Next.js) ultra rápida.",
    price: "$200.000",
    priceValue: 200000,
    icon: <FaRocket />,
    category: "Desarrollo",
    paymentType: "Proyecto único",
    includes: ["Migración contenido completa", "Rediseño moderno", "Misma URL estructura", "Redirect 301 SEO", "Sin downtime"]
  },
  // SOPORTE Y MANTENIMIENTO
  {
    id: 13,
    name: "Mantenimiento Premium",
    description: "Tu web siempre actualizada, segura y funcionando al 100%.",
    price: "$45.000",
    priceValue: 45000,
    icon: <FaTools />,
    category: "Soporte",
    paymentType: "Mensual",
    includes: ["Actualizaciones de seguridad", "Backups diarios cloud", "Soporte técnico 24/7", "Cambios menores ilimitados", "Reporte mensual"]
  },
  {
    id: 14,
    name: "Hosting Dedicado Chile",
    description: "Servidor dedicado en datacenter chileno (Reñaca o Santiago) baja latencia.",
    price: "$35.000",
    priceValue: 35000,
    icon: <FaServer />,
    category: "Soporte",
    paymentType: "Mensual",
    includes: ["Servidor VPS 4GB RAM", "SSD NVMe", "Ancho de banda ilimitado", "IP chilena", "Soporte técnico"]
  },
  {
    id: 15,
    name: "Auditoría de Seguridad",
    description: "Revisión completa de vulnerabilidades y hardening de tu web.",
    price: "$150.000",
    priceValue: 150000,
    icon: <FaShieldAlt />,
    category: "Soporte",
    paymentType: "Auditoría única",
    includes: ["Escaneo vulnerabilidades", "Pentesting básico", "Reporte ejecutivo", "Plan de remediación", "Certificado seguridad"]
  }
];

const additionalServices: AdditionalService[] = [
  {
    id: 1,
    name: "Integracion CRM Empresarial",
    description:
      "Conexion estrategica entre tu web y CRM para gestion avanzada de clientes y seguimiento real de oportunidades.",
    price: "$250.000 CLP",
    priceValue: 250000,
    icon: <FaSyncAlt />,
    category: "Automatizacion",
    paymentType: "Proyecto unico",
    includes: [
      "Configuracion CRM",
      "Sincronizacion automatica de leads",
      "Pipeline de ventas personalizado",
      "Historial de interacciones",
      "Automatizacion basica de seguimiento",
      "Capacitacion equipo",
    ],
  },
  {
    id: 2,
    name: "App Movil PWA Empresarial",
    description: "Aplicacion web progresiva optimizada para rendimiento y experiencia movil.",
    price: "$550.000 CLP",
    priceValue: 550000,
    icon: <FaMobileAlt />,
    category: "Desarrollo",
    paymentType: "Proyecto unico desde",
    includes: [
      "Instalacion en dispositivos moviles",
      "Notificaciones push",
      "Optimizacion rendimiento",
      "Funcionalidad offline basica",
      "Panel de administracion",
      "Publicacion lista para uso empresarial",
    ],
  },
  {
    id: 3,
    name: "Integracion Pasarelas de Pago",
    description: "Implementacion segura de sistemas de pago en tu sitio web.",
    price: "$80.000 CLP",
    priceValue: 80000,
    icon: <FaCreditCard />,
    category: "Desarrollo",
    paymentType: "Por pasarela",
    includes: [
      "Configuracion Webpay / Flow / MercadoPago / Stripe / Khipu",
      "Integracion backend",
      "Webhook de confirmacion automatica",
      "Pruebas en ambiente sandbox",
      "Validacion flujo completo",
    ],
  },
  {
    id: 4,
    name: "Migracion WordPress a Tecnologia Moderna",
    description: "Modernizacion completa para mejorar velocidad y rendimiento.",
    price: "$350.000 CLP",
    priceValue: 350000,
    icon: <FaWordpress />,
    category: "Desarrollo",
    paymentType: "Proyecto unico desde",
    includes: [
      "Migracion contenido",
      "Optimizacion SEO tecnica",
      "Rediseno visual moderno",
      "Mejora de rendimiento (Core Web Vitals)",
      "Mantencion estructura URL",
    ],
  },
  {
    id: 5,
    name: "Mantenimiento Web Premium",
    description: "Plan de soporte continuo para estabilidad y seguridad.",
    price: "$45.000 CLP",
    priceValue: 45000,
    icon: <FaTools />,
    category: "Soporte",
    paymentType: "Mensual",
    includes: [
      "Actualizaciones tecnicas",
      "Backups automaticos",
      "Monitoreo basico",
      "Soporte tecnico prioritario",
      "Resolucion incidencias",
    ],
  },
  {
    id: 6,
    name: "Hosting VPS Chile",
    description: "Infraestructura optimizada con baja latencia en Chile.",
    price: "$35.000 CLP",
    priceValue: 35000,
    icon: <FaServer />,
    category: "Soporte",
    paymentType: "Mensual",
    includes: [
      "VPS 4GB RAM",
      "SSD NVMe",
      "Configuracion inicial",
      "Firewall basico",
      "Monitoreo basico",
    ],
  },
  {
    id: 7,
    name: "Auditoria de Seguridad Web",
    description: "Evaluacion tecnica de vulnerabilidades y mejoras.",
    price: "$150.000 CLP",
    priceValue: 150000,
    icon: <FaShieldAlt />,
    category: "Soporte",
    paymentType: "Auditoria unica",
    includes: [
      "Escaneo de vulnerabilidades",
      "Revision configuraciones criticas",
      "Hardening basico",
      "Informe ejecutivo con recomendaciones",
    ],
  },
];

const faqs: FAQ[] = [
  {
    q: "¿Cuánto tiempo toma desarrollar mi proyecto web?",
    a: "Los tiempos varían según complejidad: Landing Pages (3-5 días), Webs corporativas (7-12 días), E-commerce (15-25 días), Web Apps (30-45 días). Trabajamos con metodología ágil y entregas parciales para que veas avances constantes."
  },
  {
    q: "¿Cuáles son los costos mensuales adicionales?",
    a: "El desarrollo es pago único. Los únicos costos recurrentes son: Hosting ($25.000-$45.000/mes), Dominio ($15.000/año), y Mantenimiento opcional ($45.000/mes). No hay letras chicas ni costos ocultos."
  },
  {
    q: "¿Mi sitio funcionará correctamente en celulares?",
    a: "Absolutamente. Todos nuestros diseños son 100% responsive y mobile-first. Testeamos en iOS, Android, tablets y diferentes tamaños de pantalla. Además optimizamos velocidad para conexiones 3G/4G comunes en Chile."
  },
  {
    q: "¿Qué pasa si necesito cambios después de entregado?",
    a: "Incluimos revisiones según tu plan (1-2 revisiones). Post-entrega ofrecemos soporte garantizado (15-90 días según plan) y planes de mantenimiento mensual con cambios ilimitados. También puedes contratar horas ad-hoc."
  },
  {
    q: "¿Trabajan con empresas de regiones?",
    a: "Sí, trabajamos con clientes de todo Chile. Las reuniones son vía Zoom/Google Meet y el proceso es 100% remoto. Tenemos clientes en Concepción, Valparaíso, La Serena, Puerto Montt y otras regiones."
  },
  {
    q: "¿Cómo se realiza el pago?",
    a: "Trabajamos con 50% al inicio y 50% contra entrega. Aceptamos transferencia bancaria, Webpay, Flow o factura con pago a 30 días para empresas establecidas. Para proyectos grandes podemos acordar hitos de pago."
  },
  {
    q: "¿Incluyen dominio y hosting?",
    a: "Sí, nuestros planes incluyen dominio .cl o .com por 1 año y hosting por 1 año en servidor chileno. Posteriores años el dominio cuesta ~$15.000 y hosting desde $25.000/mes según tráfico."
  },
  {
    q: "¿Puedo ver ejemplos de trabajos realizados?",
    a: "Por supuesto. Contáctanos por WhatsApp y te enviaremos nuestro portafolio completo con casos de éxito de diferentes industrias: retail, servicios, inmobiliarias, restaurantes, etc."
  }
];

const stats: Stat[] = [
  { icon: <FaRocket />, number: "280+", label: "Proyectos Entregados" },
  { icon: <FaChartLine />, number: "97%", label: "Clientes que Renuevan" },
  { icon: <FaClock />, number: "<2hrs", label: "Tiempo de Respuesta" },
  { icon: <FaUsers />, number: "6+", label: "Años en el Mercado" }
];

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "María José González",
    role: "Gerente Comercial",
    company: "FitLife Chile",
    content: "La landing page que desarrollaron aumentó nuestras conversiones de Google Ads en un 340%. El ROI fue inmediato. Profesionalismo y resultados excepcionales, los recomiendo 100%.",
    rating: 5,
    image: images.testimonial1,
    date: "Hace 2 semanas"
  },
  {
    id: 2,
    name: "Carlos Andrés Mendoza",
    role: "Director General",
    company: "Constructora del Sur",
    content: "Nuestra web corporativa quedó impecable. El proceso fue transparente, cumplieron exactamente los plazos y la comunicación fue excelente. Ya tenemos 3 proyectos más con ellos.",
    rating: 5,
    image: images.testimonial2,
    date: "Hace 1 mes"
  },
  {
    id: 3,
    name: "Ana María Silva",
    role: "Fundadora",
    company: "Moda Sustentable Chile",
    content: "El e-commerce superó todas nuestras expectativas. Las ventas online representan ahora el 60% de nuestro negocio. La integración con Webpay fue clave para la confianza de nuestros clientes.",
    rating: 5,
    image: images.testimonial3,
    date: "Hace 3 semanas"
  }
];

const industries: Industry[] = [
  {
    id: 1,
    name: "Restaurantes & Food",
    icon: <FaUtensils />,
    description: "Menús digitales, pedidos online, reservas y delivery integrado.",
    examples: ["Sushi", "Pizza", "Cafeterías", "Food trucks"]
  },
  {
    id: 2,
    name: "Inmobiliarias",
    icon: <FaHome />,
    description: "Portales de propiedades, CRM inmobiliario y calculadoras de crédito.",
    examples: ["Corredoras", "Constructoras", "Arriendo", "Administradoras"]
  },
  {
    id: 3,
    name: "Salud & Bienestar",
    icon: <FaHeartbeat />,
    description: "Reservas médicas, telemedicina, historiales y recordatorios automáticos.",
    examples: ["Clínicas", "Dentistas", "Kinesiólogos", "Spas"]
  },
  {
    id: 4,
    name: "Retail & E-commerce",
    icon: <FaShoppingBag />,
    description: "Tiendas online con pasarelas chilenas, stock y logística integrada.",
    examples: ["Moda", "Tecnología", "Mascotas", "Deportes"]
  },
  {
    id: 5,
    name: "Servicios Profesionales",
    icon: <FaBriefcase />,
    description: "Webs de autoridad para abogados, contadores, consultores y agencias.",
    examples: ["Abogados", "Contadores", "Consultoras", "Agencias"]
  },
  {
    id: 6,
    name: "Educación & Capacitación",
    icon: <FaGraduationCap />,
    description: "Plataformas e-learning, inscripciones y gestión de cursos.",
    examples: ["Cursos online", "Colegios", "Universidades", "Capacitación"]
  }
];

type ServicePillar = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  icon: React.ReactNode;
  accent: string;
};

const servicePillars: ServicePillar[] = [
  {
    eyebrow: "Web comercial",
    title: "Sitios y landing pages que explican, posicionan y convierten",
    description:
      "Creamos paginas comerciales y corporativas que presentan tu oferta con claridad, elevan percepcion de marca y capturan oportunidades reales.",
    bullets: [
      "Arquitectura de contenido orientada a negocio",
      "Diseno responsive con foco en conversion",
      "SEO tecnico, velocidad y confianza visual",
    ],
    icon: <FaBullhorn />,
    accent: "from-cyan-500/15 to-sky-500/10 border-cyan-300/25 text-cyan-100",
  },
  {
    eyebrow: "Automatizacion",
    title: "Procesos conectados para vender y operar con menos friccion",
    description:
      "Integramos formularios, CRM, WhatsApp, correo y tareas repetitivas para que tu equipo pierda menos tiempo y responda mejor.",
    bullets: [
      "Seguimientos automaticos y trazabilidad",
      "Integraciones utiles para ventas y operacion",
      "Menos carga manual y menos errores",
    ],
    icon: <FaRobot />,
    accent: "from-emerald-500/15 to-cyan-500/10 border-emerald-300/25 text-emerald-100",
  },
  {
    eyebrow: "Sistema interno",
    title: "Herramientas a medida para ordenar operacion y control",
    description:
      "Desarrollamos portales, dashboards y sistemas internos para seguimiento, inventario, reservas, clientes, reportes y procesos criticos.",
    bullets: [
      "Roles, modulos y permisos segun tu realidad",
      "Datos mas claros para decidir mejor",
      "Base escalable para crecer sin caos",
    ],
    icon: <FaServer />,
    accent: "from-indigo-500/15 to-violet-500/10 border-indigo-300/25 text-indigo-100",
  },
  {
    eyebrow: "Soporte continuo",
    title: "Mantenimiento, evolucion y criterio tecnico despues de publicar",
    description:
      "No soltamos el proyecto al entregarlo. Dejamos soporte inicial, prioridades claras y una ruta de mejora para la siguiente etapa.",
    bullets: [
      "Ajustes posteriores y mejoras puntuales",
      "Mantenimiento, performance y continuidad",
      "Roadmap tecnico de evolucion",
    ],
    icon: <FaShieldAlt />,
    accent: "from-amber-500/15 to-orange-500/10 border-amber-300/25 text-amber-100",
  },
];

// --- COMPONENTES AUXILIARES ---

const fallbackMarqueeCards: MarqueeCard[] = [
  {
    id: 1,
    title: "Showcase Multi-dispositivo",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=60",
  },
  {
    id: 2,
    title: "UX/UI Mobile First",
    image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&auto=format&fit=crop&q=60",
  },
  {
    id: 3,
    title: "Desarrollo High Performance",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=60",
  },
  {
    id: 4,
    title: "Analitica y Estrategia",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=60",
  },
  {
    id: 5,
    title: "E-commerce Escalable",
    image: "https://images.unsplash.com/photo-1557821552-17105176677c?w=1200&auto=format&fit=crop&q=60",
  },
  {
    id: 6,
    title: "Diseno Visual Premium",
    image: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=1200&auto=format&fit=crop&q=60",
  },
];

const ModelMarquee = ({ cards }: { cards: MarqueeCard[] }) => {
  const [stopScroll, setStopScroll] = useState(false);
  const baseCards = cards.length > 0 ? cards : fallbackMarqueeCards;
  const marqueeItems = [...baseCards, ...baseCards, ...baseCards];

  return (
    <section className="py-20 bg-slate-950 overflow-hidden relative border-y border-white/5">
      <style>{`
        .services-marquee-track {
          animation: servicesMarqueeScroll linear infinite;
        }
        @keyframes servicesMarqueeScroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <div
        className="absolute left-0 top-0 h-full w-32 md:w-48 z-10 pointer-events-none bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"
      />

      <div
        className="overflow-hidden w-full relative"
        onMouseEnter={() => setStopScroll(true)}
        onMouseLeave={() => setStopScroll(false)}
      >
        <div
          className="flex w-fit services-marquee-track"
          style={{
            animationPlayState: stopScroll ? "paused" : "running",
            animationDuration: baseCards.length * 4000 + "ms"
          }}
        >
          <div className="flex">
            {marqueeItems.map((card, index) => (
              <div key={`${card.id}-${index}`} className="w-80 mx-4 h-[28rem] relative group rounded-3xl overflow-hidden border border-white/10 hover:border-cyan-400/50 transition-all duration-500 shadow-2xl">
                {isVideoMediaUrl(card.image) ? (
                  <video
                    src={card.image}
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img src={card.image} alt={card.title} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 w-full p-8 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  <p className="text-white text-xl font-bold tracking-tight mb-2">{card.title}</p>
                  <div className="h-1 w-12 bg-cyan-400 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="absolute right-0 top-0 h-full w-32 md:w-48 z-10 pointer-events-none bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent"
      />
    </section>
  );
};

export default function ServicesPage() {
  type ReviewPublishMode = "idle" | "google" | "guest";
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activePlan, setActivePlan] = useState<number>(2);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReviewVerifyModal, setShowReviewVerifyModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: "", company: "", email: "", rating: 5, message: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewPublishMode, setReviewPublishMode] = useState<ReviewPublishMode>("idle");
  const [pendingReviewPayload, setPendingReviewPayload] = useState<null | {
    display_name: string;
    company: string;
    email: string;
    rating: number;
    comment: string;
  }>(null);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [googleSdkReady, setGoogleSdkReady] = useState(false);
  const [selectedAdditionalService, setSelectedAdditionalService] = useState<AdditionalService | null>(null);
  const [resolvedWhatsappNumber, setResolvedWhatsappNumber] = useState<string>(normalizeWhatsappNumber(defaultConfig.whatsapp_number));
  const [livePlans, setLivePlans] = useState<Plan[]>([]);
  const [liveAdditionalServices, setLiveAdditionalServices] = useState<AdditionalService[]>([]);
  const [liveFaqs, setLiveFaqs] = useState<FAQ[]>([]);
  const [liveAdvisoryServices, setLiveAdvisoryServices] = useState<AdvisoryService[]>([]);
  const [liveIndustries, setLiveIndustries] = useState<Industry[]>([]);
  const [liveMarqueeCards, setLiveMarqueeCards] = useState<MarqueeCard[]>([]);
  const [liveReviews, setLiveReviews] = useState<Testimonial[]>([]);
  const [servicesLiveLoadOk, setServicesLiveLoadOk] = useState(false);
  const [reviewsLiveLoadOk, setReviewsLiveLoadOk] = useState(false);
  const [advisoryStartIndex, setAdvisoryStartIndex] = useState(0);
  const [advisoryDirection, setAdvisoryDirection] = useState<1 | -1>(1);

  const containerRef = useRef<HTMLDivElement>(null);

  const ensureGoogleSdkLoaded = useCallback(async () => {
    if (typeof window === "undefined") return false;
    if ((window as { google?: { accounts?: { id?: unknown } } }).google?.accounts?.id) {
      setGoogleSdkReady(true);
      return true;
    }

    return await new Promise<boolean>((resolve) => {
      const existingScript = document.querySelector('script[data-google-gsi="true"]') as HTMLScriptElement | null;
      if (existingScript) {
        if ((window as { google?: { accounts?: { id?: unknown } } }).google?.accounts?.id) {
          setGoogleSdkReady(true);
          resolve(true);
          return;
        }

        existingScript.addEventListener(
          "load",
          () => {
            const ok = Boolean((window as { google?: { accounts?: { id?: unknown } } }).google?.accounts?.id);
            setGoogleSdkReady(ok);
            resolve(ok);
          },
          { once: true }
        );
        existingScript.addEventListener(
          "error",
          () => {
            setGoogleSdkReady(false);
            resolve(false);
          },
          { once: true }
        );
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.dataset.googleGsi = "true";
      script.onload = () => {
        const ok = Boolean((window as { google?: { accounts?: { id?: unknown } } }).google?.accounts?.id);
        setGoogleSdkReady(ok);
        resolve(ok);
      };
      script.onerror = () => {
        setGoogleSdkReady(false);
        resolve(false);
      };
      document.head.appendChild(script);
    });
  }, []);

  useEffect(() => {
    const loadServicesContent = async () => {
      try {
        const [plansResult, servicesResult, faqsResult, advisoryResult, industriesResult, marqueeResult] = await Promise.allSettled([
          fetch(`${BACKEND_URL}/api/services-page/plans`),
          fetch(`${BACKEND_URL}/api/services-page/additional-services`),
          fetch(`${BACKEND_URL}/api/services-page/faqs`),
          fetch(`${BACKEND_URL}/api/services-page/advisory-services`),
          fetch(`${BACKEND_URL}/api/services-page/industries`),
          fetch(`${BACKEND_URL}/api/services-page/marquee-cards`),
        ]);
        let hasLiveData = false;

        if (plansResult.status === "fulfilled" && plansResult.value.ok) {
          const data = (await plansResult.value.json()) as ApiPlan[];
          if (Array.isArray(data)) {
            hasLiveData = hasLiveData || data.length > 0;
            setLivePlans(
              data.map((plan) => ({
                id: makeLiveId(LIVE_ID_OFFSETS.plan, plan.id),
                name: plan.name,
                description: plan.description,
                modules: plan.modules || "Sin especificar",
                price: plan.price,
                priceValue: parsePriceValue(plan.price),
                includes: parseArrayField(plan.includes),
                delivery: parseArrayField(plan.delivery),
                idealFor: parseArrayField(plan.ideal_for),
                image: resolvePlanImage(plan.category),
              }))
            );
          }
        }

        if (servicesResult.status === "fulfilled" && servicesResult.value.ok) {
          const data = (await servicesResult.value.json()) as ApiAdditionalService[];
          if (Array.isArray(data)) {
            hasLiveData = hasLiveData || data.length > 0;
            setLiveAdditionalServices(
              data.map((service) => ({
                id: makeLiveId(LIVE_ID_OFFSETS.service, service.id),
                name: sanitizeAdditionalServiceName(service.name),
                description: service.description,
                price: service.price,
                priceValue: parsePriceValue(service.price),
                icon: resolveAdditionalServiceIcon(service.icon),
                category: resolveServiceCategory(service),
                includes: parseArrayField(service.includes),
                paymentType: service.payment_type || "Proyecto",
              }))
            );
          }
        }

        if (faqsResult.status === "fulfilled" && faqsResult.value.ok) {
          const data = (await faqsResult.value.json()) as ApiFaq[];
          if (Array.isArray(data)) {
            hasLiveData = hasLiveData || data.length > 0;
            setLiveFaqs(
              data.map((faq) => ({
                q: faq.question,
                a: faq.answer,
              }))
            );
          }
        }

        if (advisoryResult.status === "fulfilled" && advisoryResult.value.ok) {
          const data = (await advisoryResult.value.json()) as ApiAdvisoryService[];
          if (Array.isArray(data)) {
            hasLiveData = hasLiveData || data.length > 0;
            setLiveAdvisoryServices(
              data.map((item) => ({
                id: makeLiveId(LIVE_ID_OFFSETS.advisory, item.id),
                icon: resolveAdvisoryIcon(item.icon),
                title: item.title,
                price: item.price,
                duration: item.duration || "60 minutos",
                audience: parseArrayField(item.audience),
                includes: parseArrayField(item.includes),
                result: item.result,
                marketNote: item.market_note || "",
              }))
            );
          }
        }

        if (industriesResult.status === "fulfilled" && industriesResult.value.ok) {
          const data = (await industriesResult.value.json()) as ApiIndustry[];
          if (Array.isArray(data)) {
            hasLiveData = hasLiveData || data.length > 0;
            setLiveIndustries(
              data.map((industry) => ({
                id: makeLiveId(LIVE_ID_OFFSETS.industry, industry.id),
                name: industry.name,
                description: industry.description,
                icon: resolveIndustryIcon(industry.icon, industry.name),
                examples: parseArrayField(industry.examples),
              }))
            );
          }
        }

        if (marqueeResult.status === "fulfilled" && marqueeResult.value.ok) {
          const data = (await marqueeResult.value.json()) as ApiMarqueeCard[];
          if (Array.isArray(data)) {
            hasLiveData = hasLiveData || data.length > 0;
            setLiveMarqueeCards(
              data.map((card) => ({
                id: makeLiveId(LIVE_ID_OFFSETS.marquee, card.id),
                title: String(card.title || "").trim(),
                image: String(card.image_url || "").trim(),
              })).filter((card) => card.title && card.image)
            );
          }
        }

        setServicesLiveLoadOk(hasLiveData);
      } catch {
        // keep static fallback data
        setServicesLiveLoadOk(false);
      }
    };

    loadServicesContent();
  }, []);

  useEffect(() => {
    ensureGoogleSdkLoaded().catch(() => {
      setGoogleSdkReady(false);
    });
  }, [ensureGoogleSdkLoaded]);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/reviews?page=1&page_size=40&page_context=servicios`);
        if (!res.ok) {
          setReviewsLiveLoadOk(false);
          return;
        }
        const payload = (await res.json()) as ApiReviewListResponse;
        const data = Array.isArray(payload?.items) ? payload.items : [];
        if (!data.length) {
          setLiveReviews([]);
          setReviewsLiveLoadOk(false);
          return;
        }

        const mapped = data.map(mapApiReviewToTestimonial);

        setLiveReviews(mapped);
        setReviewsLiveLoadOk(true);
      } catch {
        // fallback to static testimonials
        setReviewsLiveLoadOk(false);
      }
    };

    loadReviews();
  }, []);

  const displayTestimonials = useMemo(() => {
    if (reviewsLiveLoadOk && liveReviews.length > 0) return liveReviews;
    return testimonials;
  }, [liveReviews, reviewsLiveLoadOk]);

  const displayPlans = useMemo(() => {
    if (servicesLiveLoadOk && livePlans.length > 0) return livePlans;
    return plans;
  }, [livePlans, servicesLiveLoadOk]);

  const displayAdditionalServices = useMemo(() => {
    if (servicesLiveLoadOk && liveAdditionalServices.length > 0) return liveAdditionalServices;
    return additionalServices.length > 0 ? additionalServices : legacyAdditionalServices;
  }, [liveAdditionalServices, servicesLiveLoadOk]);

  const displayFaqs = useMemo(() => {
    if (servicesLiveLoadOk && liveFaqs.length > 0) return liveFaqs;
    return faqs;
  }, [liveFaqs, servicesLiveLoadOk]);

  const displayAdvisoryServices = useMemo(() => {
    if (liveAdvisoryServices.length > 0) return liveAdvisoryServices;
    return defaultAdvisoryServices;
  }, [liveAdvisoryServices]);

  const displayIndustries = useMemo(() => {
    if (servicesLiveLoadOk && liveIndustries.length > 0) return liveIndustries;
    return industries;
  }, [liveIndustries, servicesLiveLoadOk]);

  const displayMarqueeCards = useMemo(() => {
    if (liveMarqueeCards.length > 0) return liveMarqueeCards;
    return fallbackMarqueeCards;
  }, [liveMarqueeCards]);

  const serviceStats = useMemo<Stat[]>(
    () => [
      { icon: <FaBriefcase />, number: `${displayPlans.length}+`, label: "Planes base disponibles" },
      { icon: <FaTools />, number: `${displayAdditionalServices.length}+`, label: "Servicios complementarios" },
      { icon: <FaCalendarCheck />, number: `${displayAdvisoryServices.length}+`, label: "Asesorias estrategicas" },
      { icon: <FaClock />, number: "24-48h", label: "Diagnostico y propuesta inicial" },
    ],
    [displayPlans.length, displayAdditionalServices.length, displayAdvisoryServices.length]
  );

  void stats;
  void servicePillars;

  const advisorySingle = useMemo(
    () => ({
      service: displayAdvisoryServices[advisoryStartIndex],
      index: advisoryStartIndex,
    }),
    [advisoryStartIndex, displayAdvisoryServices]
  );

  const advisoryPair = useMemo(
    () => [
      { service: displayAdvisoryServices[advisoryStartIndex], index: advisoryStartIndex },
      {
        service: displayAdvisoryServices[(advisoryStartIndex + 1) % displayAdvisoryServices.length],
        index: (advisoryStartIndex + 1) % displayAdvisoryServices.length,
      },
    ],
    [advisoryStartIndex, displayAdvisoryServices]
  );

  const goToNextAdvisory = useCallback(() => {
    if (!displayAdvisoryServices.length) return;
    setAdvisoryDirection(1);
    setAdvisoryStartIndex((prev) => (prev + 1) % displayAdvisoryServices.length);
  }, [displayAdvisoryServices]);

  const goToPrevAdvisory = useCallback(() => {
    if (!displayAdvisoryServices.length) return;
    setAdvisoryDirection(-1);
    setAdvisoryStartIndex((prev) => (prev - 1 + displayAdvisoryServices.length) % displayAdvisoryServices.length);
  }, [displayAdvisoryServices]);

  useEffect(() => {
    if (displayAdvisoryServices.length <= 1) return;
    const timer = window.setInterval(() => {
      goToNextAdvisory();
    }, 7000);
    return () => window.clearInterval(timer);
  }, [goToNextAdvisory, displayAdvisoryServices.length]);

  useEffect(() => {
    if (!displayAdvisoryServices.length) {
      setAdvisoryStartIndex(0);
      return;
    }
    if (advisoryStartIndex >= displayAdvisoryServices.length) {
      setAdvisoryStartIndex(0);
    }
  }, [displayAdvisoryServices.length, advisoryStartIndex]);

  useEffect(() => {
    if (!selectedAdditionalService) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedAdditionalService(null);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedAdditionalService]);

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
        // keep fallback number
      }
    };

    void loadContactWhatsapp();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!displayPlans.length) return;
    if (!displayPlans.some((plan) => plan.id === activePlan)) {
      setActivePlan(displayPlans[0].id);
    }
  }, [displayPlans, activePlan]);

  const openWhatsApp = (message: string) => {
    const target = normalizeWhatsappNumber(resolvedWhatsappNumber) || normalizeWhatsappNumber(defaultConfig.whatsapp_number);
    window.open(
      `https://wa.me/${target}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const buildReservationHref = (type: ReservationType, name: string, price?: string) => {
    const params = new URLSearchParams({
      source: "servicios",
      reserve_type: type,
      reserve_name: name,
    });
    if (price) {
      params.set("reserve_price", price);
    }
    return `/asesoria?${params.toString()}`;
  };

  const buildReservationWhatsappMessage = (type: ReservationType, name: string, price?: string) => {
    const priceLine = price ? `Precio de referencia: ${price}.` : "";
    return [
      "Hola, quiero reservar una asesoria.",
      `Tipo: ${type}.`,
      `Solicitud: ${name}.`,
      priceLine,
      "Quedo atento para confirmar horario.",
    ]
      .filter(Boolean)
      .join(" ");
  };

  const openReservationWhatsapp = (type: ReservationType, name: string, price?: string) => {
    openWhatsApp(buildReservationWhatsappMessage(type, name, price));
  };

  const getAdditionalServiceTheme = (service: AdditionalService) => {
    const name = service.name.toLowerCase();
    const normalizedCategory = service.category
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (name.includes("google")) {
      return {
        cardBorder: "border-[#EA4335]/35 hover:border-[#EA4335]/70",
        glow: "group-hover:shadow-[0_26px_50px_-30px_rgba(234,67,53,0.8)]",
        orb: "bg-[#EA4335]/25",
        iconWrap: "bg-gradient-to-br from-[#EA4335]/25 via-[#FBBC05]/20 to-[#34A853]/20 ring-[#EA4335]/40",
        iconColor: "text-[#EA4335]",
        badge: "bg-[#EA4335]/10 text-[#FCE1DC] border-[#EA4335]/35",
        check: "text-[#34A853]",
        price: "text-[#FBBC05]",
        button: "bg-[#EA4335]/12 text-[#FCE1DC] border border-[#EA4335]/45 hover:bg-[#EA4335]/20 hover:text-white",
        title: "group-hover:text-[#FCE1DC]",
      };
    }

    if (name.includes("meta") || name.includes("facebook") || name.includes("instagram")) {
      return {
        cardBorder: "border-[#1877F2]/35 hover:border-[#1877F2]/70",
        glow: "group-hover:shadow-[0_26px_50px_-30px_rgba(24,119,242,0.8)]",
        orb: "bg-[#1877F2]/25",
        iconWrap: "bg-gradient-to-br from-[#1877F2]/25 via-[#7B61FF]/20 to-[#E4405F]/20 ring-[#1877F2]/40",
        iconColor: "text-[#1877F2]",
        badge: "bg-[#1877F2]/10 text-[#DCEBFF] border-[#1877F2]/35",
        check: "text-[#7DB6FF]",
        price: "text-[#A9CDFF]",
        button: "bg-[#1877F2]/12 text-[#DCEBFF] border border-[#1877F2]/45 hover:bg-[#1877F2]/22 hover:text-white",
        title: "group-hover:text-[#DCEBFF]",
      };
    }

    if (name.includes("whatsapp")) {
      return {
        cardBorder: "border-[#25D366]/35 hover:border-[#25D366]/70",
        glow: "group-hover:shadow-[0_26px_50px_-30px_rgba(37,211,102,0.75)]",
        orb: "bg-[#25D366]/20",
        iconWrap: "bg-gradient-to-br from-[#25D366]/20 to-emerald-500/15 ring-[#25D366]/35",
        iconColor: "text-[#25D366]",
        badge: "bg-[#25D366]/10 text-[#D9FFE8] border-[#25D366]/35",
        check: "text-[#25D366]",
        price: "text-[#8FF0BB]",
        button: "bg-[#25D366]/10 text-[#D9FFE8] border border-[#25D366]/40 hover:bg-[#25D366]/20 hover:text-white",
        title: "group-hover:text-[#D9FFE8]",
      };
    }

    switch (normalizedCategory) {
      case "automatizacion":
        return {
          cardBorder: "border-cyan-300/25 hover:border-cyan-300/60",
          glow: "group-hover:shadow-[0_26px_50px_-30px_rgba(34,211,238,0.8)]",
          orb: "bg-cyan-300/20",
          iconWrap: "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 ring-cyan-300/35",
          iconColor: "text-cyan-200",
          badge: "bg-cyan-500/10 text-cyan-100 border-cyan-300/30",
          check: "text-cyan-300",
          price: "text-cyan-100",
          button: "bg-cyan-500/10 text-cyan-100 border border-cyan-300/30 hover:bg-cyan-500/20 hover:text-white",
          title: "group-hover:text-cyan-100",
        };
      case "marketing":
        return {
          cardBorder: "border-emerald-300/25 hover:border-emerald-300/60",
          glow: "group-hover:shadow-[0_26px_50px_-30px_rgba(52,211,153,0.8)]",
          orb: "bg-emerald-300/20",
          iconWrap: "bg-gradient-to-br from-emerald-500/20 to-lime-500/20 ring-emerald-300/35",
          iconColor: "text-emerald-200",
          badge: "bg-emerald-500/10 text-emerald-100 border-emerald-300/30",
          check: "text-emerald-300",
          price: "text-emerald-100",
          button: "bg-emerald-500/10 text-emerald-100 border border-emerald-300/30 hover:bg-emerald-500/20 hover:text-white",
          title: "group-hover:text-emerald-100",
        };
      case "diseno":
        return {
          cardBorder: "border-fuchsia-300/25 hover:border-fuchsia-300/60",
          glow: "group-hover:shadow-[0_26px_50px_-30px_rgba(232,121,249,0.8)]",
          orb: "bg-fuchsia-300/20",
          iconWrap: "bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 ring-fuchsia-300/35",
          iconColor: "text-fuchsia-200",
          badge: "bg-fuchsia-500/10 text-fuchsia-100 border-fuchsia-300/30",
          check: "text-fuchsia-300",
          price: "text-fuchsia-100",
          button: "bg-fuchsia-500/10 text-fuchsia-100 border border-fuchsia-300/30 hover:bg-fuchsia-500/20 hover:text-white",
          title: "group-hover:text-fuchsia-100",
        };
      case "desarrollo":
        return {
          cardBorder: "border-sky-300/25 hover:border-sky-300/60",
          glow: "group-hover:shadow-[0_26px_50px_-30px_rgba(56,189,248,0.8)]",
          orb: "bg-sky-300/20",
          iconWrap: "bg-gradient-to-br from-sky-500/20 to-indigo-500/20 ring-sky-300/35",
          iconColor: "text-sky-200",
          badge: "bg-sky-500/10 text-sky-100 border-sky-300/30",
          check: "text-sky-300",
          price: "text-sky-100",
          button: "bg-sky-500/10 text-sky-100 border border-sky-300/30 hover:bg-sky-500/20 hover:text-white",
          title: "group-hover:text-sky-100",
        };
      case "soporte":
        return {
          cardBorder: "border-amber-300/25 hover:border-amber-300/60",
          glow: "group-hover:shadow-[0_26px_50px_-30px_rgba(251,191,36,0.75)]",
          orb: "bg-amber-300/20",
          iconWrap: "bg-gradient-to-br from-amber-500/20 to-orange-500/20 ring-amber-300/35",
          iconColor: "text-amber-200",
          badge: "bg-amber-500/10 text-amber-100 border-amber-300/30",
          check: "text-amber-300",
          price: "text-amber-100",
          button: "bg-amber-500/10 text-amber-100 border border-amber-300/30 hover:bg-amber-500/20 hover:text-white",
          title: "group-hover:text-amber-100",
        };
      default:
        return {
          cardBorder: "border-cyan-300/25 hover:border-cyan-300/60",
          glow: "group-hover:shadow-[0_26px_50px_-30px_rgba(34,211,238,0.75)]",
          orb: "bg-cyan-300/20",
          iconWrap: "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 ring-cyan-300/35",
          iconColor: "text-cyan-200",
          badge: "bg-cyan-500/10 text-cyan-100 border-cyan-300/30",
          check: "text-cyan-300",
          price: "text-cyan-100",
          button: "bg-cyan-500/10 text-cyan-100 border border-cyan-300/30 hover:bg-cyan-500/20 hover:text-white",
          title: "group-hover:text-cyan-100",
        };
    }
  };

  const pushReviewToTop = (review: ApiReviewItem) => {
    const mapped = mapApiReviewToTestimonial(review);
    setLiveReviews((prev) => [mapped, ...prev.filter((item) => item.id !== mapped.id)]);
    setReviewsLiveLoadOk(true);
  };

  const resetReviewForm = () => {
    setReviewForm({ name: "", company: "", email: "", rating: 5, message: "" });
    setPendingReviewPayload(null);
  };

  const sendReview = async (authMode: "google" | "guest", googleIdToken?: string) => {
    if (!pendingReviewPayload) return;
    setReviewPublishMode(authMode);
    setReviewSubmitting(true);
    setReviewError("");
    setReviewSuccess("");

    try {
      const response = await fetch(`${BACKEND_URL}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: pendingReviewPayload.rating,
          comment: pendingReviewPayload.comment,
          authMode,
          googleIdToken: googleIdToken || undefined,
          display_name: pendingReviewPayload.display_name,
          company: pendingReviewPayload.company,
          email: pendingReviewPayload.email,
          page_context: "servicios",
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.detail || payload?.message || "No se pudo enviar la reseña.");
      }

      const createdReview = (payload?.item || payload) as ApiReviewItem;
      if (createdReview?.id) {
        pushReviewToTop(createdReview);
      }

      const status = String(createdReview?.status || "").toLowerCase();
      if (status === "pending") {
        setReviewSuccess("Reseña enviada. Quedó en revisión del equipo.");
      } else {
        setReviewSuccess(authMode === "google" ? "Reseña publicada con Google." : "Reseña publicada.");
      }

      setShowReviewVerifyModal(false);
      setShowReviewModal(false);
      resetReviewForm();
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : "Error enviando la reseña.");
    } finally {
      setReviewPublishMode("idle");
      setReviewSubmitting(false);
    }
  };

  const handleGooglePublish = async () => {
    if (!pendingReviewPayload) return;

    const googleClientId = String(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "").trim();
    if (!googleClientId) {
      setReviewError("Falta NEXT_PUBLIC_GOOGLE_CLIENT_ID para validar con Google.");
      return;
    }

    const sdkReady = await ensureGoogleSdkLoaded();
    const google = (
      window as unknown as {
        google?: {
          accounts?: {
            id?: {
              initialize: (options: {
                client_id: string;
                callback: (response: { credential?: string }) => Promise<void>;
                ux_mode: "popup";
                auto_select: boolean;
                cancel_on_tap_outside: boolean;
              }) => void;
              prompt: (callback: (notification: {
                isNotDisplayed?: () => boolean;
                isSkippedMoment?: () => boolean;
                isDismissedMoment?: () => boolean;
                getNotDisplayedReason?: () => string;
                getSkippedReason?: () => string;
                getDismissedReason?: () => string;
              }) => void) => void;
            };
          };
        };
      }
    )?.google;
    if (!sdkReady || !google?.accounts?.id) {
      setReviewError("No se pudo conectar con Google. Revisa bloqueadores y permisos de popup.");
      return;
    }

    setReviewPublishMode("google");
    let credentialReceived = false;

    google.accounts.id.initialize({
      client_id: googleClientId,
      callback: async (authResponse: { credential?: string }) => {
        const idToken = authResponse?.credential;
        if (!idToken) {
          setReviewPublishMode("idle");
          setReviewError("Google no devolvió credencial.");
          return;
        }
        credentialReceived = true;
        await sendReview("google", idToken);
      },
      ux_mode: "popup",
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    google.accounts.id.prompt((notification) => {
      const notDisplayed = notification?.isNotDisplayed?.();
      const skipped = notification?.isSkippedMoment?.();
      const dismissed = notification?.isDismissedMoment?.();
      const dismissedReason = notification?.getDismissedReason?.();

      if (dismissedReason === "credential_returned" || credentialReceived) {
        return;
      }

      if (notDisplayed || skipped || dismissed) {
        const reason = notification?.getNotDisplayedReason?.() || notification?.getSkippedReason?.() || dismissedReason || "";
        setReviewPublishMode("idle");
        setReviewError(reason ? `No se completó Google (${reason}). Puedes publicar sin validar.` : "No se completó Google. Puedes publicar sin validar.");
      }
    });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess("");

    const name = reviewForm.name.trim();
    const company = reviewForm.company.trim();
    const email = reviewForm.email.trim();
    const message = reviewForm.message.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !company || !email || message.length < 20) {
      setReviewError("Completa nombre, empresa, correo y una reseña de al menos 20 caracteres.");
      return;
    }

    if (!emailRegex.test(email)) {
      setReviewError("Ingresa un correo válido (ejemplo@dominio.com).");
      return;
    }

    setPendingReviewPayload({
      display_name: name,
      company,
      email,
      rating: Math.max(1, Math.min(5, Number(reviewForm.rating) || 5)),
      comment: message,
    });
    setShowReviewVerifyModal(true);
  };

  const renderAdvisoryCard = (service: AdvisoryService, idx: number) => {
    const isEven = idx % 2 === 0;
    const cardBg = isEven
      ? "bg-[linear-gradient(155deg,rgba(5,30,62,0.96),rgba(3,17,43,0.98))]"
      : "bg-[linear-gradient(155deg,rgba(10,22,58,0.96),rgba(4,13,38,0.98))]";
    const cardBorder = isEven ? "border-cyan-300/35" : "border-blue-300/30";
    const cardGlow = isEven
      ? "hover:shadow-[0_34px_80px_-44px_rgba(34,211,238,0.95)]"
      : "hover:shadow-[0_34px_80px_-44px_rgba(59,130,246,0.95)]";
    const iconStyle = isEven
      ? "bg-cyan-400/15 border-cyan-300/45 text-cyan-100"
      : "bg-blue-400/15 border-blue-300/45 text-blue-100";
    const labelColor = isEven ? "text-cyan-300" : "text-blue-200";
    const resultStyle = isEven
      ? "border-cyan-300/35 bg-cyan-500/12"
      : "border-blue-300/35 bg-blue-500/12";
    const buttonStyle = isEven
      ? "border-cyan-300/45 bg-cyan-500/18 text-cyan-50 hover:bg-cyan-500/28"
      : "border-blue-300/45 bg-blue-500/18 text-blue-50 hover:bg-blue-500/28";
    const titleStyle = isEven
      ? "text-transparent bg-clip-text bg-gradient-to-r from-[#F6DEAE] via-[#EACB8A] to-[#CFA564] drop-shadow-[0_6px_18px_rgba(6,11,28,0.55)]"
      : "text-transparent bg-clip-text bg-gradient-to-r from-[#F2D7A4] via-[#DFBC78] to-[#C49652] drop-shadow-[0_6px_18px_rgba(6,11,28,0.55)]";

    return (
      <article
        key={service.id}
        className={`group rounded-3xl border ${cardBorder} ${cardBg} p-7 lg:p-8 transition-all duration-300 h-full flex flex-col ${cardGlow}`}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border ${iconStyle}`}>
            {service.icon}
          </div>
          <div className="text-right">
            <p className={`text-[11px] uppercase tracking-[0.16em] font-black ${labelColor}`}>{service.duration}</p>
            <p className={`text-xl font-black mt-1 ${labelColor}`}>{service.price}</p>
          </div>
        </div>

        <h3 className={`text-2xl font-black mb-4 leading-tight ${titleStyle}`}>{service.title}</h3>

        <p className={`text-xs uppercase tracking-[0.16em] font-black mb-2 ${labelColor}`}>Para quien es</p>
        <ul className="space-y-1.5 mb-5">
          {service.audience.map((item) => (
            <li key={item} className="text-sm text-slate-200/90 flex items-start gap-2">
              <FaCheckCircle className={isEven ? "text-cyan-300 mt-0.5" : "text-blue-300 mt-0.5"} />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <p className={`text-xs uppercase tracking-[0.16em] font-black mb-2 ${labelColor}`}>Incluye</p>
        <ul className="space-y-1.5 mb-5">
          {service.includes.map((item) => (
            <li key={item} className="text-sm text-slate-200/90 flex items-start gap-2">
              <FaCheckCircle className={isEven ? "text-cyan-300 mt-0.5" : "text-blue-300 mt-0.5"} />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className={`rounded-2xl border p-4 mb-4 ${resultStyle}`}>
          <p className={`text-xs uppercase tracking-[0.16em] font-black mb-1 ${labelColor}`}>Resultado</p>
          <p className="text-sm text-slate-100/95">{service.result}</p>
        </div>

        <p className="text-xs text-slate-400 mb-5">{service.marketNote}</p>

        <div className="mt-auto flex items-center justify-end gap-2">
          <Link
            href={buildReservationHref("asesoria", service.title, service.price)}
            className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all ${buttonStyle}`}
            aria-label={`Reservar ${service.title}`}
            title={`Reservar ${service.title}`}
          >
            <FaCalendarCheck className="text-sm" />
          </Link>
          <button
            onClick={() => openReservationWhatsapp("asesoria", service.title, service.price)}
            className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all ${buttonStyle}`}
            aria-label={`Reservar ${service.title} por WhatsApp`}
            title={`Reservar ${service.title} por WhatsApp`}
          >
            <FaWhatsapp className="text-sm" />
          </button>
        </div>
      </article>
    );
  };
  return (
    <div ref={containerRef} className="min-h-screen bg-slate-950 text-white overflow-x-hidden font-sans selection:bg-indigo-500 selection:text-white">

      {/* HERO SECTION CON IMAGEN DE FONDO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden isolate">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={images.hero}
            alt="Agencia Digital"
            fill
            className="object-cover scale-[1.03] saturate-[1.05]"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(2,6,23,0.9)_0%,rgba(2,6,23,0.78)_45%,rgba(2,6,23,0.92)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_22%,rgba(56,189,248,0.22),transparent_37%),radial-gradient(circle_at_12%_86%,rgba(16,185,129,0.14),transparent_34%),radial-gradient(circle_at_88%_10%,rgba(129,140,248,0.16),transparent_30%)]" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-slate-950 to-transparent" />
        </div>

        <div className="container-elite relative z-10 px-6 py-32 text-center max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3A2B17]/35 backdrop-blur-md border border-[#B89563]/35 text-[#E5C892] text-sm font-semibold mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Agencia estratégica digital • Respuesta en menos de 2 horas
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.06] text-[#F2E6CF] drop-shadow-[0_10px_40px_rgba(2,6,23,0.8)]"
          >
            Diseño que <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E8C27A] via-[#F3D79A] to-[#CFA96B]">vende</span>
            <br />
            Tecnología que <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D8B06B] via-[#E6C79A] to-[#C58B63]">escala</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-2xl text-[#DCCCAD] max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            {defaultConfig.subtitle}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="text-sm md:text-base text-[#BCA887] max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Asesoría, marketing y desarrollo web orientado a resultado comercial real para PYMEs y empresas en crecimiento.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href={buildReservationHref("asesoria", "Asesoría estratégica inicial")}
              className="group px-8 py-4 rounded-full border border-[#B89563]/38 bg-[linear-gradient(135deg,rgba(24,19,14,0.96),rgba(47,34,23,0.98))] font-black text-lg transition-all flex items-center gap-3 shadow-[0_18px_40px_-22px_rgba(18,12,7,0.82)] hover:-translate-y-1 hover:border-[#D4B06E]/58 hover:bg-[linear-gradient(135deg,rgba(31,23,15,0.98),rgba(61,43,28,1))] hover:shadow-[0_24px_52px_-24px_rgba(28,20,12,0.95)] backdrop-blur-sm"
              style={{ color: "#E7D2AE", WebkitTextFillColor: "#E7D2AE" }}
            >
              <FaCalendarCheck className="text-lg text-[#D4B06E]" />
              Agendar Asesoría Estratégica
            </Link>
            <button
              onClick={() => document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' })}
              className="group px-8 py-4 bg-[rgba(14,18,29,0.74)] hover:bg-[rgba(20,25,38,0.86)] border border-[#B89563]/35 rounded-full font-semibold text-[#E7D2AE] text-lg transition-all flex items-center gap-3 backdrop-blur-sm"
            >
              Ver Planes y Precios
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.42 }}
            className="mt-8 flex flex-wrap justify-center gap-3"
          >
            {stats.slice(0, 3).map((stat) => (
              <div
                key={stat.label}
                className="inline-flex items-center gap-2 rounded-full border border-[#B89563]/18 bg-[rgba(15,20,34,0.56)] px-4 py-2 text-xs md:text-sm text-[#D9C8A8]"
              >
                <span className="font-black text-[#EBCB8E]">{stat.number}</span>
                <span className="text-[#C4B08E]">{stat.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 flex flex-wrap justify-center gap-3 items-center"
          >
            <div className="flex items-center gap-2 rounded-full border border-[#B89563]/25 bg-[rgba(34,28,19,0.55)] px-4 py-2 text-[#E1C38A] text-xs font-semibold uppercase tracking-[0.12em]">
              <FaShieldAlt className="text-[#D9B46A]" /> SSL Seguro
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#9E865E]/25 bg-[rgba(27,24,18,0.52)] px-4 py-2 text-[#DCC596] text-xs font-semibold uppercase tracking-[0.12em]">
              <FaCheckCircle className="text-[#D4B06E]" /> Enfoque en conversión
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#866A47]/25 bg-[rgba(31,24,18,0.52)] px-4 py-2 text-[#D9C39A] text-xs font-semibold uppercase tracking-[0.12em]">
              <FaClock className="text-[#C79C61]" /> Implementación puntual
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-white rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* STATS BAR */}
      <section className="py-12 bg-slate-900/50 border-y border-white/5">
        <div className="container-elite max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {serviceStats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-5 text-center"
              >
                <div className="mb-3 flex justify-center text-cyan-200">{stat.icon}</div>
                <div className="text-2xl md:text-3xl font-black text-white mb-2">{stat.number}</div>
                <div className="text-xs md:text-sm text-slate-400 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIES SECTION */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_18%,rgba(56,189,248,0.09),transparent_38%),radial-gradient(circle_at_82%_82%,rgba(250,204,21,0.08),transparent_35%)]" />
        <div className="container-elite max-w-7xl mx-auto px-6">
          <div className="mb-16 relative z-10 mx-auto max-w-5xl text-center lg:text-left">
            <div className="flex flex-col items-center lg:items-start">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-sky-400/30 bg-sky-400/10 text-sky-200 text-xs font-bold uppercase tracking-[0.18em] mb-5">
                Verticales activas
              </span>
              <h2 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-yellow-200 via-amber-300 to-sky-300 bg-clip-text text-transparent drop-shadow-[0_6px_24px_rgba(245,158,11,0.28)]">
                Especialistas por Industria
              </h2>
              <div className="max-w-3xl space-y-4">
                <p className="text-slate-200 text-lg leading-relaxed">
                  Conocemos las particularidades de cada rubro en Chile y aterrizamos la solucion segun el contexto real de tu empresa.
                </p>
                <p className="text-slate-300/90 text-base leading-relaxed">
                  Te acompaniamos con lenguaje simple, tiempos claros y propuestas realistas para que tomes decisiones con confianza desde el primer contacto.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm lg:justify-start">
              <span className="px-3 py-1 rounded-full border border-amber-300/35 bg-amber-300/10 text-amber-100">Estrategia comprensible</span>
              <span className="px-3 py-1 rounded-full border border-sky-300/35 bg-sky-300/10 text-sky-100">Proceso ordenado</span>
              <span className="px-3 py-1 rounded-full border border-emerald-300/35 bg-emerald-300/10 text-emerald-100">Resultados medibles</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {displayIndustries.map((industry, i) => {
              const theme = getIndustryTheme(industry.name);
              return (
                <motion.div
                  key={industry.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className={`group bg-gradient-to-b from-white/[0.08] to-white/[0.03] border border-white/15 rounded-3xl p-8 transition-all cursor-pointer ${theme.border} ${theme.glow}`}
                  onClick={() => openWhatsApp(`Hola, me interesa una web para ${industry.name}`)}
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 transition-all ${theme.iconBox} ${theme.iconColor}`}>
                    {industry.icon}
                  </div>
                  <h3 className="text-2xl font-black mb-3 text-white group-hover:text-slate-50">{industry.name}</h3>
                  <p className="text-slate-200/90 mb-5 leading-relaxed">{industry.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {industry.examples.map((example, j) => (
                      <span key={j} className={`text-xs px-3 py-1 rounded-full ${theme.chip}`}>
                        {example}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <ModelMarquee cards={displayMarqueeCards} />


      {/* SECCIÓN DE EXCELENCIA Y CONSISTENCIA (BENEFICIOS PREMIUM) */}
      <section className='bg-slate-950 py-32 px-6 relative overflow-hidden'>
        {/* Glow effects background */}
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />

        <div className='container-elite max-w-7xl mx-auto flex items-center flex-col justify-center text-center relative z-10'>
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='bg-slate-900/80 border border-white/10 text-sm text-cyan-100/80 px-7 py-2.5 rounded-full font-bold uppercase tracking-widest backdrop-blur-sm'
          >
            Servicios estrategicos
          </motion.button>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className='text-cyan-300 font-black text-4xl md:text-5xl xl:text-6xl mt-8 leading-[1.02] tracking-tight max-w-4xl mx-auto'
            style={{ color: "#67E8F9" }}
          >
            Tecnología que ordena. Web que convierte.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className='text-lg md:text-xl text-slate-300 max-w-3xl mt-4 font-medium leading-relaxed'
          >
            Desarrollamos sitios web, automatizaciones y sistemas para que tu empresa capte mejor, responda mas rapido y opere con mas control.
          </motion.p>

          <div className='w-full max-w-7xl grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-10 mt-16'>
            {serviceExecutionCards.map((card, index) => {
              const imageOnRight = index % 2 === 1;
              const isMockup = card.imageMode === "mockup";
              const contentBlock = (
                <div className={`flex flex-col justify-center p-7 text-left md:p-9 ${imageOnRight ? "md:order-1" : ""}`}>
                  <p className='text-[11px] font-black uppercase tracking-[0.2em] text-cyan-100/70'>
                    {card.badge}
                  </p>

                  <h3 className='mt-4 text-3xl font-black leading-tight text-cyan-300'>
                    {card.title}
                  </h3>

                  <p className='mt-5 text-base leading-relaxed text-slate-300'>
                    {card.description}
                  </p>

                  <ul className='mt-6 space-y-3'>
                    {card.highlights.map((item) => (
                      <li key={`${card.title}-${item}`} className='flex items-center gap-3 text-sm text-slate-200'>
                        <span className='h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.55)]' />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <p className='mt-6 border-t border-white/10 pt-5 text-sm leading-relaxed text-slate-400'>
                    {card.support}
                  </p>
                </div>
              );

              return (
                <motion.article
                  key={card.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -6 }}
                  className='group overflow-hidden rounded-[2.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,8,23,0.98))] shadow-[0_26px_70px_rgba(2,12,35,0.34)] transition-all duration-300 hover:border-cyan-400/25'
                >
                  {isMockup ? (
                    <div className='flex h-full flex-col'>
                      <div className='relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-[linear-gradient(180deg,rgba(16,25,45,0.98),rgba(8,15,30,0.98))]'>
                        <Image
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 42vw"
                          className='object-cover blur-3xl scale-110 opacity-16'
                          src={card.image}
                          alt=""
                        />
                        <div className='absolute inset-0 bg-[radial-gradient(circle_at_24%_22%,rgba(103,232,249,0.12),transparent_26%),radial-gradient(circle_at_78%_24%,rgba(96,165,250,0.16),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.14),rgba(2,6,23,0.56))]' />
                        <div className='absolute inset-0 p-5 md:p-8'>
                          <div className='relative h-full w-full'>
                            <Image
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 42vw"
                              className='object-contain'
                              src={card.image}
                              alt={card.imageAlt}
                            />
                          </div>
                        </div>
                      </div>
                      {contentBlock}
                    </div>
                  ) : (
                    <div className='grid h-full md:grid-cols-[minmax(240px,0.92fr)_minmax(0,1.08fr)]'>
                      <div className={`relative min-h-[280px] overflow-hidden ${imageOnRight ? "md:order-2" : ""}`}>
                        <>
                          <Image
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            className='object-cover transition-transform duration-700 group-hover:scale-[1.04]'
                            src={card.image}
                            alt={card.imageAlt}
                          />
                          <div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08)_0%,rgba(2,6,23,0.2)_28%,rgba(2,6,23,0.48)_68%,rgba(2,6,23,0.82)_100%)]' />
                        </>
                      </div>
                      {contentBlock}
                    </div>
                  )}
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* SERVICIOS DE ASESORIA (MERCADO CHILENO) */}
      <section className="py-28 bg-[linear-gradient(180deg,#020b21_0%,#031331_48%,#020a1d_100%)] relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(34,211,238,0.16),transparent_42%),radial-gradient(circle_at_84%_84%,rgba(59,130,246,0.16),transparent_45%)]" />
        <div className="container-elite max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, amount: 0.35 }}
            className="text-center mb-16"
          >
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-200 text-xs font-bold uppercase tracking-[0.18em] mb-5"
            >
              Asesoria ejecutiva
            </motion.span>
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.55, delay: 0.12 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black mb-6 leading-tight text-[#7DD3FC]"
            >
              Asesoria estrategica
              <span className="block text-[#7DD3FC]">
                para decisiones de tecnologia y operacion
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-slate-200 text-lg max-w-3xl mx-auto leading-relaxed"
            >
              Analizamos procesos, detectamos cuellos de botella y definimos prioridades para que inviertas con criterio, reduzcas friccion operativa y avances con una hoja de ruta clara.
            </motion.p>
          </motion.div>

          <div className="flex items-center justify-center gap-3 mb-8">
            <button
              onClick={goToPrevAdvisory}
              aria-label="Tarjeta anterior"
              className="w-10 h-10 rounded-full border border-cyan-300/40 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20 transition-all flex items-center justify-center"
            >
              <FaChevronLeft />
            </button>
            <div className="px-3 py-1 rounded-full border border-white/15 bg-white/5 text-xs tracking-[0.14em] uppercase text-slate-300 font-bold">
              {advisoryStartIndex + 1} / {displayAdvisoryServices.length}
            </div>
            <button
              onClick={goToNextAdvisory}
              aria-label="Siguiente tarjeta"
              className="w-10 h-10 rounded-full border border-cyan-300/40 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20 transition-all flex items-center justify-center"
            >
              <FaChevronRight />
            </button>
          </div>

          <div className="md:hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`advisory-mobile-${advisoryStartIndex}`}
                initial={{ opacity: 0, rotate: advisoryDirection === 1 ? 3 : -3, scale: 0.985 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: advisoryDirection === 1 ? -3 : 3, scale: 0.985 }}
                transition={{ duration: 0.42 }}
              >
                {renderAdvisoryCard(advisorySingle.service, advisorySingle.index)}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="hidden md:block">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`advisory-desktop-${advisoryStartIndex}`}
                className="grid grid-cols-2 gap-7 items-stretch"
                initial={{ opacity: 0, rotate: advisoryDirection === 1 ? 2 : -2, scale: 0.992 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: advisoryDirection === 1 ? -2 : 2, scale: 0.992 }}
                transition={{ duration: 0.45 }}
              >
                {advisoryPair.map(({ service, index }) => renderAdvisoryCard(service, index))}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            {displayAdvisoryServices.map((service, idx) => (
              <button
                key={service.id}
                aria-label={`Ver asesoria ${idx + 1}`}
                onClick={() => {
                  if (idx === advisoryStartIndex) return;
                  setAdvisoryDirection(idx > advisoryStartIndex ? 1 : -1);
                  setAdvisoryStartIndex(idx);
                }}
                className={`h-2.5 rounded-full transition-all ${idx === advisoryStartIndex
                  ? "w-7 bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                  : "w-2.5 bg-white/30 hover:bg-cyan-200/70"
                  }`}
              />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href={buildReservationHref("asesoria", "Asesoria estrategica para mi empresa")}
              className="group relative inline-flex items-center gap-4 rounded-[1.35rem] border border-[#6EE7D8]/25 bg-[linear-gradient(145deg,rgba(8,14,28,0.98),rgba(17,24,39,0.96))] px-5 py-4 shadow-[0_24px_60px_-30px_rgba(94,234,212,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-[#7DD3FC]/45 hover:shadow-[0_30px_70px_-28px_rgba(96,165,250,0.3)]"
              style={{ color: "#F4FFFE", WebkitTextFillColor: "#F4FFFE", textDecoration: "none" }}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#6EE7D8]/20 bg-[linear-gradient(145deg,rgba(45,212,191,0.16),rgba(59,130,246,0.12))] text-[#99F6E4] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <FaCalendarCheck className="text-base" />
              </span>
              <span className="flex flex-col items-start leading-none text-left">
                <span className="text-[0.68rem] font-black uppercase tracking-[0.24em] text-[#99F6E4]/75">
                  Asesoria estrategica
                </span>
                <span className="mt-2 text-sm md:text-base font-black tracking-[0.01em] text-[#F4FFFE]">
                  Reservar para mi empresa
                </span>
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#7DD3FC]/20 bg-[linear-gradient(145deg,rgba(45,212,191,0.14),rgba(59,130,246,0.14))] text-[#DFFCF8] transition-all duration-300 group-hover:translate-x-1 group-hover:border-[#7DD3FC]/35 group-hover:bg-[linear-gradient(145deg,rgba(45,212,191,0.22),rgba(59,130,246,0.2))]">
                <FaArrowRight className="text-xs" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* PLANS SECTION MEJORADA */}
      <section id="planes" className="py-32 bg-slate-950 relative">
        <div className="container-elite max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-5 py-2 rounded-full border border-[#2E6D7D]/35 bg-[linear-gradient(180deg,rgba(16,32,46,0.94),rgba(10,22,35,0.8))] text-[#68A9B8] text-xs md:text-sm font-semibold uppercase tracking-[0.24em] mb-6 shadow-[0_12px_30px_-24px_rgba(54,122,142,0.7)]">
              Inversion clara
            </span>
            <h2
              className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
              style={{
                background: "linear-gradient(90deg, #63C7CF 0%, #3F94B2 52%, #315F86 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
              }}
            >
              Planes y precios para implementar con claridad
            </h2>
            <p className="text-slate-300 text-lg max-w-3xl mx-auto leading-relaxed">
              Compara alcances, entregables y nivel de soporte para elegir la alternativa que mejor responde a la etapa de crecimiento de tu empresa.
            </p>
            <p className="text-slate-400 text-base max-w-3xl mx-auto mt-3 leading-relaxed">
              Trabajamos con tiempos realistas, alcance definido y acompanamiento consultivo para que la inversion se traduzca en resultados visibles desde el inicio.
            </p>
          </div>

          {/* Plan Selector */}
          <div className="relative left-1/2 mb-12 w-screen max-w-none -translate-x-1/2 overflow-x-auto pb-2 no-scrollbar px-6 xl:px-10">
            <div className="flex w-max min-w-full flex-nowrap justify-start gap-4 xl:justify-center">
              {displayPlans.map((plan) => (
                <motion.button
                  key={plan.id}
                  onClick={() => setActivePlan(plan.id)}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className={`relative shrink-0 overflow-hidden px-6 py-3 rounded-full font-semibold tracking-wide border transition-all duration-300 ${activePlan === plan.id
                    ? "bg-[linear-gradient(135deg,rgba(20,58,76,0.98),rgba(16,38,55,0.98))] text-[#7FD0DB] border-[#3F94B2]/45 shadow-[0_16px_36px_-18px_rgba(41,124,151,0.58)]"
                    : "bg-[linear-gradient(180deg,rgba(17,24,39,0.8),rgba(15,23,42,0.6))] text-[#6B8696] border-[#31546A]/24 hover:text-[#75AFC0] hover:border-[#377D95]/40 hover:bg-[linear-gradient(180deg,rgba(19,33,48,0.94),rgba(14,26,40,0.78))]"
                    }`}
                >
                  {activePlan === plan.id && (
                    <motion.span
                      layoutId="active-plan-pill-glow"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[#57B7C7]/12 via-[#3F94B2]/10 to-[#315F86]/14"
                    />
                  )}
                  <span className="relative z-10">{plan.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Active Plan Detail */}
          <motion.div
            key={activePlan}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            {displayPlans.filter((p) => p.id === activePlan).map((plan) => (
              <div key={plan.id} className={`group relative rounded-[2.5rem] overflow-hidden shadow-[0_30px_80px_-35px_rgba(14,165,233,0.35)] ${plan.popular
                ? 'bg-gradient-to-br from-indigo-900/45 via-slate-900 to-sky-950/40 border-2 border-indigo-400/60'
                : 'bg-gradient-to-br from-slate-900/95 via-slate-900 to-slate-950 border border-white/10'
                }`}>
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -top-24 -left-16 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />
                  <div className="absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
                </div>
                {plan.popular && (
                  <div className="absolute top-6 right-6 z-20 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 px-4 py-1 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg shadow-amber-500/30">
                    <FaStar /> Más Elegido
                  </div>
                )}

                <div className="relative z-10 grid md:grid-cols-2 gap-0">
                  <div className="p-8 md:p-12">
                    <div className="inline-flex items-center px-3 py-1 rounded-full border border-cyan-300/30 bg-cyan-500/10 text-cyan-100 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
                      {plan.modules}
                    </div>
                    <h3 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight text-[#76C6D7]">
                      {plan.name}
                    </h3>
                    <p className="text-slate-300/95 mb-7 leading-relaxed">{plan.description}</p>
                    <div className="inline-flex flex-col mb-8">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Inversión desde</span>
                      <div className="text-4xl md:text-5xl font-extrabold text-[#F3B562] drop-shadow-[0_0_20px_rgba(243,181,98,0.18)]">
                        {plan.price}
                      </div>
                    </div>

                    <button
                      onClick={() => openWhatsApp(`Hola, me interesa el plan ${plan.name} por ${plan.price}`)}
                      className="w-full py-4 rounded-2xl font-bold tracking-wide transition-all mb-4 text-zinc-100 border border-zinc-400/35 bg-gradient-to-r from-black via-zinc-900 to-slate-900 shadow-[0_14px_30px_-16px_rgba(0,0,0,0.9)] hover:border-red-400/70 hover:shadow-[0_0_35px_-10px_rgba(239,68,68,0.85)] hover:from-zinc-950 hover:via-black hover:to-zinc-900"
                    >
                      Solicitar Cotización Detallada
                    </button>
                    <p className="text-xs text-slate-400 text-center">Asesoría inicial + respuesta en menos de 2 horas</p>
                  </div>

                  <div className="p-8 md:p-12 bg-slate-900/50 border-l border-white/10 backdrop-blur-sm">
                    <h4 className="font-bold mb-6 text-lg text-cyan-100">¿Qué incluye?</h4>
                    <div className="space-y-4 mb-8">
                      {plan.includes.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm text-slate-200/95">
                          <FaCheckCircle className="text-cyan-300 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <h4 className="font-bold mb-4 text-sm uppercase tracking-[0.14em] text-cyan-100/90">Ideal para:</h4>
                    <div className="flex flex-wrap gap-2">
                      {plan.idealFor.map((item, i) => (
                        <span key={i} className="text-xs bg-cyan-500/10 text-cyan-100 px-3 py-1 rounded-full border border-cyan-300/25">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Plan Cards Grid (Mobile/Quick View) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {displayPlans.filter((p) => p.id !== activePlan).slice(0, 3).map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                onClick={() => setActivePlan(plan.id)}
                className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900 to-slate-950 border border-white/10 rounded-2xl p-6 hover:border-cyan-300/50 transition-all cursor-pointer group shadow-lg shadow-slate-950/60"
              >
                <div className="pointer-events-none absolute -top-14 -right-14 h-32 w-32 rounded-full bg-cyan-400/10 blur-2xl group-hover:bg-cyan-300/20 transition-all" />
                <h3 className="text-xl font-bold mb-2 text-[#7CCFDE] group-hover:text-[#A6E3EE] transition-colors">
                  {plan.name}
                </h3>
                <p className="text-slate-300/90 text-sm mb-4 line-clamp-2">{plan.description}</p>
                <div className="text-2xl font-extrabold text-[#F0B35B]">{plan.price}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ADDITIONAL SERVICES - TODOS LOS SERVICIOS */}
      <section className="py-32 bg-slate-900/30 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.12),transparent_45%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_80%,rgba(99,102,241,0.12),transparent_45%)]" />
        <div className="container-elite max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-5 py-2 rounded-full border border-[#2E6D7D]/35 bg-[linear-gradient(180deg,rgba(16,32,46,0.94),rgba(10,22,35,0.8))] text-[#68A9B8] text-xs md:text-sm font-semibold uppercase tracking-[0.22em] mb-6 shadow-[0_12px_30px_-24px_rgba(54,122,142,0.7)]">
              Escalamiento operativo
            </span>
            <h2
              className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
              style={{
                background: "linear-gradient(90deg, #43C7BB 0%, #2FA6C4 52%, #4267C9 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
              }}
            >
              Servicios complementarios para automatizar, integrar y dar continuidad
            </h2>
            <p className="text-slate-200 text-lg max-w-3xl mx-auto leading-relaxed">
              Servicios orientados a operacion real de empresa: automatizacion, desarrollo e integraciones para mejorar control, seguimiento y continuidad tecnica.
            </p>
            <p className="text-slate-400 text-base max-w-3xl mx-auto mt-3 leading-relaxed">
              Cada implementacion se conecta a tu flujo actual y queda preparada para uso comercial, seguimiento y mejora continua.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayAdditionalServices.map((service, i) => {
              const theme = getAdditionalServiceTheme(service);

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -8, scale: 1.01 }}
                  transition={{ duration: 0.45, delay: i * 0.04 }}
                  viewport={{ once: true }}
                  className={`group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-slate-900/95 via-[#111b39] to-slate-950 border backdrop-blur-sm transition-all duration-300 ${theme.cardBorder} ${theme.glow}`}
                >
                  <div className={`pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full blur-3xl ${theme.orb}`} />

                  <div className="relative z-10 flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ring-1 transition-all ${theme.iconWrap}`}>
                      <span className={theme.iconColor}>{service.icon}</span>
                    </div>
                    <span className={`text-[11px] font-black uppercase tracking-[0.12em] px-2.5 py-1 rounded-lg border ${theme.badge}`}>
                      {service.category}
                    </span>
                  </div>
                  <h3 className={`relative z-10 text-lg font-bold mb-2 transition-colors ${theme.title}`}>{service.name}</h3>
                  <p className="relative z-10 text-slate-300 text-sm mb-4 line-clamp-2 leading-relaxed">{service.description}</p>

                  <div className="relative z-10 space-y-2 mb-6">
                    {service.includes.slice(0, 3).map((inc, j) => (
                      <div key={j} className="flex items-center gap-2 text-xs text-slate-200/95">
                        <FaCheck className={`text-[10px] ${theme.check}`} /> {inc}
                      </div>
                    ))}
                  </div>

                  <div className="relative z-10 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">{service.paymentType}</div>
                        <div className={`text-2xl font-extrabold ${theme.price}`}>{service.price}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={buildReservationHref("servicio", service.name, service.price)}
                          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${theme.button}`}
                          aria-label={`Reservar ${service.name}`}
                          title={`Reservar ${service.name}`}
                        >
                          <FaCalendarCheck className="text-sm" />
                        </Link>
                        <button
                          onClick={() => openReservationWhatsapp("servicio", service.name, service.price)}
                          className="w-11 h-11 rounded-full flex items-center justify-center border border-[#25D366]/50 bg-[#25D366]/14 text-[#D9FFE8] transition-all hover:bg-[#25D366]/24 hover:text-white"
                          aria-label={`Reservar ${service.name} por WhatsApp`}
                          title={`Reservar ${service.name} por WhatsApp`}
                        >
                          <FaWhatsapp className="text-sm" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedAdditionalService(service)}
                      className="mt-3 inline-flex items-center gap-2 rounded-lg border border-cyan-300/35 bg-cyan-500/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-cyan-100 hover:bg-cyan-500/20 transition-colors"
                    >
                      Ver detalle completo
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/servicios/combos"
              className="group relative inline-flex items-center gap-3 mx-auto rounded-xl border border-cyan-300/50 bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(56,189,248,0.2),rgba(59,130,246,0.2))] px-6 py-3 text-sm font-extrabold tracking-[0.03em] text-cyan-50 shadow-[0_18px_40px_-24px_rgba(34,211,238,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200/80 hover:shadow-[0_24px_48px_-22px_rgba(34,211,238,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              aria-label="Ver todos los servicios disponibles"
              title="Ver todos los servicios disponibles"
            >
              Ver todos los servicios disponibles{" "}
              <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS CON BOTÓN DEJAR RESEÑA */}
      <section className="py-32 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.1),transparent_50%)]" />

        <div className="container-elite max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
            <div>
              <h2
                className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
                style={{ color: "#22D3EE", WebkitTextFillColor: "#22D3EE", textShadow: "none" }}
              >
                Resultados reales de nuestros clientes
              </h2>
              <p className="text-slate-400 text-lg">Experiencias referidas por pequenas y medianas empresas (PYMEs), negocios personales y empresas en crecimiento de Chile que mejoraron su presencia digital y sus ventas.</p>
            </div>
            <motion.button
              onClick={() => {
                setReviewError("");
                setReviewSuccess("");
                setShowReviewVerifyModal(false);
                setShowReviewModal(true);
              }}
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="group relative overflow-hidden px-7 py-3.5 rounded-[1.4rem] border border-[#F8C36A]/45 bg-[linear-gradient(135deg,#F7C45C_0%,#FB923C_52%,#F97316_100%)] text-[#221302] font-black tracking-[0.02em] shadow-[0_22px_46px_-20px_rgba(249,115,22,0.65)] hover:-translate-y-1 hover:shadow-[0_28px_56px_-22px_rgba(249,115,22,0.78)] transition-all duration-300 flex items-center gap-3"
            >
              <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_15%,rgba(255,244,214,0.35)_50%,transparent_85%)] -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700" />
              <span className="relative z-10 flex items-center gap-2">
                <FaPenSquare className="text-[#221302]" /> Dejar mi reseña
              </span>
              <span className="relative z-10 h-2.5 w-2.5 rounded-full bg-[#7C2D12] shadow-[0_0_12px_rgba(124,45,18,0.45)] animate-pulse" />
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayTestimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 border border-white/10 rounded-3xl p-8 relative hover:border-indigo-500/30 transition-all"
              >
                <FaQuoteLeft className="text-4xl text-indigo-500/20 absolute top-6 left-6" />
                <div className="flex gap-1 mb-6 pt-8">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-500 text-sm" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-bold overflow-hidden">
                    {testimonial.image ? (
                      <Image src={testimonial.image} alt={testimonial.name} width={48} height={48} className="object-cover" />
                    ) : (
                      testimonial.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}, {testimonial.company}</div>
                    <div className="text-xs text-slate-600 mt-1">{testimonial.date}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 items-center opacity-50">
            <div className="flex items-center gap-2 text-slate-400">
              <FaGoogle /> Google Ads
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <FaFacebook /> Meta Ads
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <FaShopify /> Shopify
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <FaWordpress /> WordPress
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      {/* 14. FAQ SECTION - REDESIGNED */}
      <section className="py-32 px-6 relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] border-t border-white/[0.04] overflow-hidden">
        {/* Decorative Ambient Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-indigo-500/05 blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24 faq-modern-wrapper">
          {/* Left Side: Productive Presence Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="w-full lg:w-[46%] relative"
          >
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.6)] group">
              <Image
                className="w-full h-auto object-cover grayscale-[0.15] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                src={images.faqSupport}
                width={980}
                height={849}
                sizes="(max-width: 1024px) 100vw, 46vw"
                alt="Ingeniería de alto rendimiento"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Floating Badge on Image */}
              <div className="absolute bottom-10 left-10 right-10 p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <p className="text-white text-xs font-bold leading-relaxed">
                  Respuesta clara, seguimiento cercano y soporte continuo para que tu solucion siga funcionando bien.
                </p>
              </div>
            </div>

            {/* Ambient Glows */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-600/20 rounded-full blur-[80px] -z-10" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-cyan-600/15 rounded-full blur-[100px] -z-10" />
          </motion.div>

          {/* Right Side: FAQ Accordion */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="w-full lg:w-[54%]"
          >
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-indigo-300">Preguntas Frecuentes</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
                ¿Buscas <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-cyan-300">respuesta</span>?
              </h2>
              <p className="text-slate-400 leading-relaxed text-lg max-w-xl">
                Resolvemos tus dudas críticas para que inicies tu proyecto con una ruta tecnológica clara y resultados comerciales medibles.
              </p>
            </div>

            {/* Accordion Logic */}
            <div className="divide-y divide-white/10 border-t border-white/10">
              {displayFaqs.map((faq, i) => (
                <div key={i} className="py-2 transition-all duration-300">
                  <button
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full flex items-center justify-between py-6 text-left group"
                  >
                    <h3 className={`text-lg font-semibold transition-all duration-300 pr-8 ${activeFaq === i ? 'text-indigo-300 scale-[1.02]' : 'text-slate-200 group-hover:text-white'}`}>
                      {faq.q}
                    </h3>
                    <div className={`shrink-0 w-6 h-6 rounded-full border border-white/10 flex items-center justify-center transition-all duration-500 ${activeFaq === i ? 'bg-indigo-500 border-indigo-400 text-white rotate-180' : 'text-slate-500 group-hover:border-indigo-400 group-hover:text-indigo-300'}`}>
                      <FaChevronDown size={10} />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {activeFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                      >
                        <div className="pb-8 pr-12">
                          <p className="text-slate-400 leading-relaxed text-[0.95rem]">
                            {faq.a}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Removed Quick Contact Link per user request */}
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA CON IMAGEN */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src={images.cta} alt="CTA Background" fill className="object-cover" />
          <div className="absolute inset-0 bg-slate-950/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950" />
        </div>

        <div className="container-elite max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              ¿Listo para transformar tu negocio?
            </h2>
            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
              Agenda una consultoría gratuita de 30 minutos. Analizaremos tu situación actual y te daremos un plan de acción concreto sin compromiso.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={buildReservationHref("asesoria", "Consultoria gratuita de 30 minutos")}
                className="group px-8 py-4 rounded-full border border-cyan-300/35 bg-[linear-gradient(135deg,rgba(15,23,42,0.94),rgba(30,41,59,0.95))] text-cyan-50 font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_16px_34px_-22px_rgba(34,211,238,0.55)] hover:-translate-y-0.5 hover:border-cyan-200/60 hover:bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(37,49,67,0.98))] hover:shadow-[0_22px_40px_-20px_rgba(34,211,238,0.62)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                <FaWhatsapp className="text-xl text-cyan-200 transition-colors duration-300 group-hover:text-cyan-100" />
                Agendar Consultoría Gratis
              </Link>
              <button
                onClick={() => document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full font-semibold text-lg transition-all backdrop-blur-sm"
              >
                Ver Planes y Precios
              </button>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><FaCheckCircle className="text-emerald-400" /> Sin compromiso</span>
              <span className="flex items-center gap-2"><FaCheckCircle className="text-emerald-400" /> Diagnóstico gratuito</span>
              <span className="flex items-center gap-2"><FaCheckCircle className="text-emerald-400" /> Respuesta en 2 hrs</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* MODAL DEJAR RESEÑA */}
      <AnimatePresence>
        {selectedAdditionalService && (
          <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAdditionalService(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 8 }}
              transition={{ duration: 0.22 }}
              className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-cyan-300/25 bg-gradient-to-br from-slate-900 via-[#0c1840] to-slate-950 shadow-2xl"
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-cyan-300/15 blur-3xl" />
              <button
                className="absolute right-4 top-4 z-20 rounded-full border border-white/20 bg-black/35 p-2 text-slate-300 hover:text-white"
                onClick={() => setSelectedAdditionalService(null)}
                aria-label="Cerrar detalle"
              >
                <FaTimes size={18} />
              </button>

              <div className="relative z-10 max-h-[85vh] overflow-y-auto p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-cyan-300/35 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100">
                    {selectedAdditionalService.category}
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-300">
                    Detalle real del servicio
                  </span>
                </div>

                <h3 className="mt-4 text-2xl font-black leading-tight text-white md:text-3xl">{selectedAdditionalService.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-200 md:text-base">{selectedAdditionalService.description}</p>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Tipo de cobro</p>
                    <p className="mt-1 text-sm font-semibold text-slate-100">{selectedAdditionalService.paymentType}</p>
                  </div>
                  <div className="rounded-xl border border-cyan-300/35 bg-cyan-500/10 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-100">Precio</p>
                    <p className="mt-1 text-lg font-black text-cyan-100">{selectedAdditionalService.price}</p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-white/10 bg-black/25 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Incluye</p>
                  <ul className="mt-3 space-y-2">
                    {selectedAdditionalService.includes.map((item, index) => (
                      <li key={`${item}-${index}`} className="flex items-start gap-2 text-sm text-slate-200">
                        <FaCheckCircle className="mt-0.5 shrink-0 text-cyan-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={buildReservationHref("servicio", selectedAdditionalService.name, selectedAdditionalService.price)}
                    className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/45 bg-cyan-500/15 px-5 py-3 text-xs font-black uppercase tracking-[0.15em] text-cyan-100 hover:bg-cyan-500/25 transition-colors"
                  >
                    Reservar este servicio
                    <FaArrowRight />
                  </Link>
                  <button
                    onClick={() =>
                      openReservationWhatsapp("servicio", selectedAdditionalService.name, selectedAdditionalService.price)
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-[#25D366]/55 bg-[#25D366]/18 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#D9FFE8] hover:bg-[#25D366]/26 transition-colors"
                  >
                    <FaWhatsapp />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => setSelectedAdditionalService(null)}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-200 hover:bg-white/10 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showReviewModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setReviewError("");
                setReviewSuccess("");
                setShowReviewVerifyModal(false);
                setShowReviewModal(false);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-slate-900 rounded-3xl p-8 border border-white/10 shadow-2xl"
            >
              <button
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
                onClick={() => {
                  setReviewError("");
                  setReviewSuccess("");
                  setShowReviewVerifyModal(false);
                  setShowReviewModal(false);
                }}
              >
                <FaTimes size={24} />
              </button>

              <h3 className="text-2xl font-bold mb-2">Deja tu reseña</h3>
              <p className="text-slate-400 mb-6">Tu opinión nos ayuda a mejorar y ayuda a otros clientes.</p>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre completo</label>
                  <input
                    type="text"
                    required
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                    placeholder="Tu nombre"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Empresa</label>
                  <input
                    type="text"
                    value={reviewForm.company}
                    onChange={(e) => setReviewForm({ ...reviewForm, company: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                    placeholder="Nombre de tu empresa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Correo / Gmail</label>
                  <input
                    type="email"
                    required
                    value={reviewForm.email}
                    onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                    placeholder="tucorreo@gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Calificación</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className={`text-2xl transition-colors ${star <= reviewForm.rating ? 'text-yellow-500' : 'text-slate-600'}`}
                      >
                        <FaStar />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tu experiencia</label>
                  <textarea
                    required
                    rows={4}
                    value={reviewForm.message}
                    onChange={(e) => setReviewForm({ ...reviewForm, message: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors resize-none"
                    placeholder="Cuéntanos sobre tu experiencia trabajando con nosotros..."
                  />
                </div>

                {reviewError && (
                  <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {reviewError}
                  </div>
                )}
                {reviewSuccess && (
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                    {reviewSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {reviewSubmitting ? "Enviando..." : "Continuar para verificar"}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showReviewVerifyModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowReviewVerifyModal(false);
                setReviewPublishMode("idle");
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative w-full max-w-xl bg-slate-900 rounded-3xl p-8 border border-white/10 shadow-2xl"
            >
              <button
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
                onClick={() => {
                  setShowReviewVerifyModal(false);
                  setReviewPublishMode("idle");
                }}
              >
                <FaTimes size={24} />
              </button>

              <h3 className="text-2xl font-bold mb-2">Verificar reseña</h3>
              <p className="text-slate-400 mb-6">
                Puedes validar con Google para registrar foto/perfil, o publicar sin validar.
              </p>

              {reviewError && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300 mb-4">
                  {reviewError}
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGooglePublish}
                  disabled={reviewSubmitting}
                  className="w-full py-4 bg-white text-slate-900 rounded-xl font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {reviewPublishMode === "google"
                    ? "Conectando con Google..."
                    : googleSdkReady
                      ? "Verificar con Google"
                      : "Cargar Google y verificar"}
                </button>
                <button
                  type="button"
                  onClick={() => sendReview("guest")}
                  disabled={reviewSubmitting}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {reviewPublishMode === "guest" ? "Publicando..." : "Publicar sin verificar"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
