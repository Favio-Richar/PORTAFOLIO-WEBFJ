"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  FaRocket, FaStar, FaCheck, FaArrowRight,
  FaGlobe, FaShoppingCart, FaMobileAlt, FaDatabase, FaCode,
  FaSpinner, FaExclamationTriangle,
  FaWhatsapp, FaChevronDown, FaChevronLeft, FaChevronRight, FaEye, FaTimes,
  FaLightbulb, FaClock, FaCalendarCheck, FaCogs, FaPlay, FaImage, FaShieldAlt,
  FaReact, FaNodeJs, FaPython, FaFigma,
} from "react-icons/fa";
import {
  SiNextdotjs, SiTypescript, SiPostgresql, SiTailwindcss,
  SiMongodb, SiDocker, SiVercel, SiFirebase, SiGithub, SiGooglechrome, SiWhatsapp,
  SiAmazon, SiGraphql, SiKubernetes, SiTensorflow, SiAngular
} from "react-icons/si";
import { defaultContact, type ContactData } from "@/lib/data/contact";
import API_BASE from "@/lib/apiBase";
import Link from "next/link";

const BACKEND_URL = API_BASE;
const FALLBACK_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "56971464296";

const CAT_STYLES: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  web: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30", glow: "shadow-blue-500/20" },
  ecommerce: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", glow: "shadow-emerald-500/20" },
  sistemas: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/30", glow: "shadow-violet-500/20" },
  apps: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", glow: "shadow-amber-500/20" },
  otro: { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/30", glow: "shadow-slate-500/20" },
};
const AVATAR_BG: Record<string, string> = {
  blue: "bg-blue-600", emerald: "bg-emerald-600", violet: "bg-violet-600",
  amber: "bg-amber-600", pink: "bg-pink-600", cyan: "bg-cyan-600",
};

// ── Section ──
interface BackendProyecto {
  id: number; title?: string; description?: string; category?: string;
  status?: string; image_url?: string; video_url?: string | null; slug?: string | null;
  media?: string | BackendMediaItem[] | null;
  demo_url?: string | null; repo_url?: string | null;
  stack?: string | string[]; results?: string | null; client_name?: string | null;
}

interface BackendMediaItem {
  url?: string | null;
  resource_type?: string | null;
  type?: string | null;
  caption?: string | null;
  is_cover?: boolean | null;
}

interface ProjectMediaItem {
  url: string;
  resource_type: "image" | "video";
  caption?: string;
  is_cover?: boolean;
}

interface Proyecto {
  id: number; slug?: string; title: string; description: string; category: string;
  price: string; featured: boolean; active: boolean; order_index: number;
  cover_url: string; tags: string[]; stack: string[];
  video_url?: string; media?: ProjectMediaItem[];
  demo_url?: string; repo_url?: string;
  results?: string[]; client_type?: string;
}

type AvatarTone = keyof typeof AVATAR_BG;

interface ReviewCard {
  name: string;
  role: string;
  text: string;
  rating: number;
  initial: string;
  color: AvatarTone;
  project: string;
  avatar?: string;
  verified?: boolean;
}

interface ReviewPublishPayload {
  display_name: string;
  company: string;
  email: string;
  rating: number;
  comment: string;
}

const sanitizeReviewAvatar = (rawValue?: string | null): string => {
  const value = String(rawValue || "").trim();
  if (!value) return "";

  const lower = value.toLowerCase();
  if (lower.includes("via.placeholder.com") || lower.includes("placehold.co")) return "";
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("/")) return `${BACKEND_URL}${value}`;
  if (lower.startsWith("lh3.googleusercontent.com/")) return `https://${value}`;
  if (lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("data:image/")) return value;

  return "";
};

const resolveReviewAvatar = (item: any): string => {
  const candidates = [
    item?.author_image,
    item?.user?.avatar_url,
    item?.user?.picture,
    item?.avatar_url,
    item?.profile_image,
    item?.picture,
  ];
  for (const candidate of candidates) {
    const normalized = sanitizeReviewAvatar(candidate || null);
    if (normalized) return normalized;
  }
  return "";
};

interface BackendReview {
  id?: number;
  display_name?: string | null;
  reviewer_email?: string | null;
  author_name?: string | null;
  author_role?: string | null;
  author_company?: string | null;
  comment?: string | null;
  content?: string | null;
  rating?: number | string | null;
  is_verified?: boolean | null;
  created_at?: string | null;
  author_image?: string | null;
  initials?: string | null;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  web: <FaGlobe />, ecommerce: <FaShoppingCart />, sistemas: <FaDatabase />,
  apps: <FaMobileAlt />, landing: <FaGlobe />, reservas: <FaCalendarCheck />,
  automatizacion: <FaCogs />, otro: <FaCode />,
};

const CATEGORY_LABELS: Record<string, string> = {
  web: "Sitio Web", ecommerce: "E-Commerce", sistemas: "Sistema", apps: "App Móvil", otro: "Otro",
};

// ── Section ──
type FilterKey = "all" | "landing" | "ecommerce" | "reservas" | "automatizacion" | "apps" | "otros";

const FILTER_TABS: Array<{ key: FilterKey; label: string; icon: React.ReactNode }> = [
  { key: "all", label: "Todos", icon: <FaRocket className="text-[11px]" /> },
  { key: "landing", label: "Landing Page", icon: <FaGlobe className="text-[11px]" /> },
  { key: "ecommerce", label: "E-Commerce", icon: <FaShoppingCart className="text-[11px]" /> },
  { key: "reservas", label: "Sistemas de reservas", icon: <FaCalendarCheck className="text-[11px]" /> },
  { key: "automatizacion", label: "Automatización", icon: <FaCogs className="text-[11px]" /> },
  { key: "apps", label: "App Móvil", icon: <FaMobileAlt className="text-[11px]" /> },
  { key: "otros", label: "Otros", icon: <FaCode className="text-[11px]" /> },
];

const LANDING_KEYWORDS = ["landing", "funnel", "captacion", "lead"];
const RESERVAS_KEYWORDS = ["reserva", "reservas", "booking", "agenda", "cita", "turno"];
const AUTOMATIZACION_KEYWORDS = ["automatizacion", "automatizar", "workflow", "integracion", "bot", "crm", "erp"];
const CORE_CATEGORY_KEYS = ["web", "landing", "ecommerce", "sistemas", "reservas", "automatizacion", "apps"] as const;

const normalizeFilterText = (value: string): string =>
  value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const toProjectMediaArray = (value: unknown): ProjectMediaItem[] => {
  let parsedValue = value;
  if (typeof value === "string") {
    try {
      parsedValue = JSON.parse(value);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(parsedValue)) return [];

  return parsedValue
    .map((entry) => {
      const raw = (entry || {}) as BackendMediaItem;
      const url = String(raw.url || "").trim();
      if (!url) return null;

      const rawType = String(raw.resource_type || raw.type || "").toLowerCase();
      const resource_type: ProjectMediaItem["resource_type"] = rawType === "video" ? "video" : "image";
      const normalized: ProjectMediaItem = { url, resource_type };
      if (typeof raw.caption === "string" && raw.caption.trim().length > 0) {
        normalized.caption = raw.caption.trim();
      }
      if (typeof raw.is_cover === "boolean") {
        normalized.is_cover = raw.is_cover;
      }
      return normalized;
    })
    .filter((entry): entry is ProjectMediaItem => Boolean(entry));
};

const resolveProjectMedia = (
  project?: { cover_url?: string; video_url?: string; media?: ProjectMediaItem[] } | null,
): ProjectMediaItem[] => {
  if (!project) return [];

  const media: ProjectMediaItem[] = Array.isArray(project.media)
    ? project.media
      .map((entry) => ({
        ...entry,
        url: String(entry?.url || "").trim(),
      }))
      .filter((entry) => entry.url.length > 0)
    : [];

  const coverUrl = String(project.cover_url || "").trim();
  const videoUrl = String(project.video_url || "").trim();

  if (coverUrl) {
    media.unshift({ url: coverUrl, resource_type: "image", is_cover: true });
  }
  if (videoUrl) {
    media.push({ url: videoUrl, resource_type: "video" });
  }

  const seen = new Set<string>();
  return media.filter((entry) => {
    const key = `${entry.resource_type}:${entry.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

function parseProyecto(item: BackendProyecto): Proyecto {
  const safeJson = (v: unknown) => {
    if (!v) return null;
    if (typeof v !== "string") return v;
    try { return JSON.parse(v); } catch { return null; }
  };
  const meta = (() => {
    const p = safeJson(item.results);
    return p && typeof p === "object" && !Array.isArray(p) ? p as Record<string, unknown> : {};
  })();
  const stackRaw = safeJson(item.stack);
  const tagsRaw = safeJson(meta.tags ?? null);
  const resultsRaw = safeJson(meta.results ?? meta.bullets ?? null);
  const mediaRaw = toProjectMediaArray(safeJson(item.media));
  const firstImage = mediaRaw.find((entry) => entry.resource_type === "image")?.url || "";
  const firstVideo = mediaRaw.find((entry) => entry.resource_type === "video")?.url || "";
  const coverUrl = String(item.image_url || firstImage || "").trim();
  const videoUrl = String(item.video_url || firstVideo || "").trim();
  const media = resolveProjectMedia({
    cover_url: coverUrl,
    video_url: videoUrl,
    media: mediaRaw,
  });
  const isActive = typeof meta.active === "boolean" ? meta.active
    : !["inactivo", "desactivado", "archivado"].some(s => (item.status || "").toLowerCase().includes(s));

  return {
    id: Number(item.id),
    slug: String(item.slug || "").trim(),
    title: String(item.title || "").trim(),
    description: String(item.description || "").trim(),
    category: String(item.category || "otro").trim(),
    price: typeof meta.price === "string" ? meta.price : "",
    featured: Boolean(meta.featured),
    active: isActive,
    order_index: Number(meta.order_index) || 0,
    cover_url: coverUrl,
    video_url: videoUrl,
    media,
    tags: Array.isArray(tagsRaw) ? tagsRaw.map(String) : [],
    stack: Array.isArray(stackRaw) ? stackRaw.map(String) : [],
    demo_url: String(item.demo_url || meta.demo_url || meta.demo || "").trim(),
    repo_url: String(item.repo_url || meta.repo_url || meta.github || "").trim(),
    results: Array.isArray(resultsRaw) ? resultsRaw.map((entry) => String(entry).trim()).filter(Boolean) : [],
    client_type: typeof meta.client_type === "string" ? meta.client_type : String(item.client_name || "").trim(),
  };
}

// ── Section ──
const PROCESS_STEPS = [
  {
    num: "01",
    title: "Contexto del negocio",
    desc: "Sector, punto de partida y objetivo comercial que el cliente necesitaba resolver.",
    focus: "Problema + objetivo",
    evidence: "Brief comercial y KPI inicial",
    icon: <FaLightbulb />,
    color: "from-blue-500 to-cyan-500",
  },
  {
    num: "02",
    title: "Solución implementada",
    desc: "Landing, e-commerce, sistema o automatización ejecutada para resolver el problema real.",
    focus: "Ejecución concreta",
    evidence: "Flujo funcional y alcance final",
    icon: <FaCogs />,
    color: "from-violet-500 to-pink-500",
  },
  {
    num: "03",
    title: "Stack y arquitectura",
    desc: "Tecnologías e integraciones aplicadas para rendimiento, escalabilidad y control operativo.",
    focus: "Base técnica",
    evidence: "Integraciones y stack productivo",
    icon: <FaCode />,
    color: "from-emerald-500 to-teal-500",
  },
  {
    num: "04",
    title: "Resultados medibles",
    desc: "Impacto en conversión, ventas, tiempo operativo y calidad del proceso después del lanzamiento.",
    focus: "Impacto real",
    evidence: "Métricas antes vs después",
    icon: <FaRocket />,
    color: "from-amber-500 to-orange-500",
  },
];

interface AboutStackItem {
  id?: number;
  name?: string | null;
  icon_key?: string | null;
  color?: string | null;
  order_index?: number;
  active?: boolean;
}

interface StackRibbonItem {
  name: string;
  iconKey: string;
  color?: string;
}

const STACK_ICON_MAP: Record<string, React.ReactNode> = {
  react: <FaReact />,
  nextjs: <SiNextdotjs />,
  typescript: <SiTypescript />,
  nodejs: <FaNodeJs />,
  python: <FaPython />,
  postgresql: <SiPostgresql />,
  mongodb: <SiMongodb />,
  tailwind: <SiTailwindcss />,
  docker: <SiDocker />,
  vercel: <SiVercel />,
  firebase: <SiFirebase />,
  figma: <FaFigma />,
  aws: <SiAmazon />,
  graphql: <SiGraphql />,
  kubernetes: <SiKubernetes />,
  tensorflow: <SiTensorflow />,
  angular: <SiAngular />,
};

const TECH_STACK_FALLBACK: StackRibbonItem[] = [
  { iconKey: "react", name: "React", color: "#61DAFB" },
  { iconKey: "nextjs", name: "Next.js", color: "#F8FAFC" },
  { iconKey: "typescript", name: "TypeScript", color: "#3178C6" },
  { iconKey: "nodejs", name: "Node.js", color: "#339933" },
  { iconKey: "python", name: "Python", color: "#3776AB" },
  { iconKey: "postgresql", name: "PostgreSQL", color: "#4169E1" },
  { iconKey: "mongodb", name: "MongoDB", color: "#47A248" },
  { iconKey: "tailwind", name: "Tailwind", color: "#06B6D4" },
  { iconKey: "docker", name: "Docker", color: "#2496ED" },
  { iconKey: "vercel", name: "Vercel", color: "#F8FAFC" },
  { iconKey: "firebase", name: "Firebase", color: "#FFCA28" },
  { iconKey: "figma", name: "Figma", color: "#F24E1E" },
];

const TECH_COLORS: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  "React": { bg: "#61DAFB20", border: "#61DAFB", text: "#61DAFB", icon: <FaReact /> },
  "Next.js": { bg: "#FFFFFF20", border: "#FFFFFF", text: "#FFFFFF", icon: <SiNextdotjs /> },
  "TypeScript": { bg: "#3178C620", border: "#3178C6", text: "#3178C6", icon: <SiTypescript /> },
  "Node.js": { bg: "#33993320", border: "#339933", text: "#339933", icon: <FaNodeJs /> },
  "Python": { bg: "#3776AB20", border: "#3776AB", text: "#3776AB", icon: <FaPython /> },
  "TailwindCSS": { bg: "#06B6D420", border: "#06B6D4", text: "#06B6D4", icon: <SiTailwindcss /> },
  "Figma": { bg: "#F24E1E20", border: "#F24E1E", text: "#F24E1E", icon: <FaFigma /> },
  "AWS": { bg: "#FF990020", border: "#FF9900", text: "#FF9900", icon: <SiAmazon /> },
  "Google Cloud": { bg: "#4285F420", border: "#4285F4", text: "#4285F4", icon: <SiAmazon /> },
  "MongoDB": { bg: "#47A24820", border: "#47A248", text: "#47A248", icon: <SiMongodb /> },
  "PostgreSQL": { bg: "#4169E120", border: "#4169E1", text: "#4169E1", icon: <SiPostgresql /> },
  "Docker": { bg: "#2496ED20", border: "#2496ED", text: "#2496ED", icon: <SiDocker /> }
};

const normalizeStackIconKey = (value?: string | null): string => {
  const normalized = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  if (!normalized) return "code";
  if (normalized === "next") return "nextjs";
  if (normalized === "node") return "nodejs";
  if (normalized === "postgres" || normalized === "postgre") return "postgresql";
  if (normalized === "mongo") return "mongodb";
  if (normalized === "ts") return "typescript";
  if (normalized === "k8s") return "kubernetes";
  if (normalized === "tf") return "tensorflow";
  return normalized;
};

const REVIEWS: ReviewCard[] = [
  { name: "María González", role: "CEO, Boutique Fashion MX", text: "Entregaron mi tienda en tiempo récord. Las ventas crecieron 300% el primer mes. El equipo es increíblemente profesional.", rating: 5, initial: "M", color: "blue", project: "E-Commerce Fashion" },
  { name: "Carlos Ramírez", role: "Dir. Comercial, TechSolutions", text: "El CRM transformó nuestra operación. Pasamos de perder oportunidades a cerrar el 80% de nuestros leads calificados.", rating: 5, initial: "C", color: "emerald", project: "Sistema CRM" },
  { name: "Ana Martínez", role: "CTO, InnovateTech", text: "Migración completa a la nube sin downtime. La infraestructura Azure nos da tranquilidad total. Equipo muy capacitado.", rating: 5, initial: "A", color: "violet", project: "Migración Cloud" },
  { name: "Jorge Silva", role: "Fundador, FitLife App", text: "La app superó expectativas. Interfaz intuitiva, cero crashes en producción y usuarios que la aman desde el día 1.", rating: 5, initial: "J", color: "amber", project: "App iOS/Android" },
  { name: "Laura Fernández", role: "Gerente Digital, Clínica Pro", text: "El portal de reservas transformó la experiencia del paciente. Agenda ocupada al 95% y reducción del 60% en no-shows.", rating: 5, initial: "L", color: "pink", project: "Portal Salud" },
  { name: "Roberto Díaz", role: "CEO, RetailMax", text: "El ERP personalizado integró todos nuestros procesos. Ahorramos 40 horas/semana en operaciones manuales.", rating: 5, initial: "R", color: "cyan", project: "Sistema ERP" },
];

const REVIEW_TONES: AvatarTone[] = ["blue", "emerald", "violet", "amber", "pink", "cyan"];

// ── Section ──
const FALLBACK_PROJECTS: Proyecto[] = [
  { id: 1, title: "Tienda Online Fashion", description: "E-Commerce completo con pasarela de pagos, gestión de inventario y panel admin. +300% en ventas el primer mes.", category: "ecommerce", price: "$3,500", featured: true, active: true, order_index: 0, cover_url: "", tags: ["Stripe", "Multi-moneda", "Analytics"], stack: ["Next.js", "Stripe", "PostgreSQL"] },
  { id: 2, title: "Sistema CRM Corporativo", description: "CRM personalizado con pipeline de ventas, automatización y dashboards en tiempo real para equipo de 50+ usuarios.", category: "sistemas", price: "$4,800", featured: true, active: true, order_index: 1, cover_url: "", tags: ["Pipeline", "Automatización", "Reportes"], stack: ["React", "Node.js", "MongoDB"] },
  { id: 3, title: "Portal Web Corporativo", description: "Sitio corporativo enterprise con CMS, blog SEO optimizado, y formularios de captación de leads integrados.", category: "web", price: "$2,200", featured: true, active: true, order_index: 2, cover_url: "", tags: ["SEO", "CMS", "Lead Gen"], stack: ["Next.js", "Sanity", "Vercel"] },
  { id: 4, title: "App Fitness & Reservas", description: "Aplicación móvil iOS/Android para gestión de clases, reservas online y seguimiento de progreso del cliente.", category: "apps", price: "$8,500", featured: false, active: true, order_index: 3, cover_url: "", tags: ["React Native", "Push Notif", "GPS"], stack: ["React Native", "Firebase", "Node.js"] },
  { id: 5, title: "Marketplace Multi-Vendor", description: "Plataforma marketplace con múltiples vendedores, sistema de comisiones, review system y logística integrada.", category: "ecommerce", price: "$7,500", featured: false, active: true, order_index: 4, cover_url: "", tags: ["Multi-vendor", "Comisiones", "Logistics"], stack: ["Next.js", "Stripe Connect", "PostgreSQL"] },
  { id: 6, title: "ERP Manufactura", description: "Sistema de planificación de recursos adaptado a procesos de manufactura: BOM, MRP, control de calidad y trazabilidad.", category: "sistemas", price: "$12,000", featured: false, active: true, order_index: 5, cover_url: "", tags: ["BOM", "MRP", "Trazabilidad"], stack: ["React", "Python", "PostgreSQL"] },
];

const CATEGORY_GRADIENTS: Record<string, string> = {
  web: "from-blue-600/40 to-indigo-800/40",
  ecommerce: "from-emerald-600/40 to-teal-800/40",
  sistemas: "from-violet-600/40 to-purple-800/40",
  apps: "from-amber-600/40 to-orange-800/40",
  otro: "from-slate-600/40 to-slate-800/40",
};

const PROJECTS_PER_PAGE = 6;
const REVIEWS_PER_PAGE = 2;

interface ParticleSpec {
  size: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
  color: string;
}

const PARTICLE_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981"] as const;

const pseudoRandom = (index: number, salt: number): number => {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
};

const roundValue = (value: number, precision = 4): number => Number(value.toFixed(precision));

// ── Section ──
function ParticlesBg() {
  const particles = useMemo<ParticleSpec[]>(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        size: roundValue(pseudoRandom(i, 1) * 4 + 1),
        left: roundValue(pseudoRandom(i, 2) * 100),
        top: roundValue(pseudoRandom(i, 3) * 100),
        duration: roundValue(4 + pseudoRandom(i, 4) * 4, 3),
        delay: roundValue(pseudoRandom(i, 5) * 4, 3),
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            backgroundColor: particle.color,
            opacity: 0.14,
            animationName: "proyectosParticleFloat",
            animationDuration: `${particle.duration}s`,
            animationTimingFunction: "ease-in-out",
            animationDelay: `${particle.delay}s`,
            animationIterationCount: "infinite",
          }}
        />
      ))}
    </div>
  );
}

// ── Section ──
function GridOverlay() {
  return (
    <div
      className="absolute inset-0 opacity-[0.03] pointer-events-none"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }}
    />
  );
}

// ── Section ──
function ProjectSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02] animate-pulse">
      <div className="h-52 bg-slate-800/60" />
      <div className="p-6 space-y-3">
        <div className="h-5 bg-slate-700/60 rounded w-3/4" />
        <div className="h-4 bg-slate-800/60 rounded w-full" />
        <div className="h-4 bg-slate-800/60 rounded w-5/6" />
        <div className="flex gap-2 pt-2">
          <div className="h-6 w-16 bg-slate-700/40 rounded-full" />
          <div className="h-6 w-20 bg-slate-700/40 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ── Section ──
function ProjectCard({
  p,
  onOpenDetails,
}: {
  p: Proyecto;
  onOpenDetails: (project: Proyecto) => void;
}) {
  const cat = CAT_STYLES[p.category] || CAT_STYLES.otro;
  const grad = CATEGORY_GRADIENTS[p.category] || CATEGORY_GRADIENTS.otro;

  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group relative rounded-2xl overflow-hidden border border-white/[0.08] bg-gradient-to-br from-[#070b16] via-[#0a1122] to-[#0a0a12] hover:border-cyan-300/50 transition-all duration-500 flex flex-col"
      style={{ boxShadow: "0 10px 48px rgba(0,0,0,0.5)" }}
    >
      <div className={`absolute -inset-px bg-gradient-to-br ${grad} opacity-[0.14] pointer-events-none`} />

      {/* Top light beam effect */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(ellipse_65%_45%_at_50%_100%,rgba(56,189,248,0.18),transparent)]" />

      {/* Image area */}
      <div className={`relative h-52 bg-gradient-to-br ${grad} flex items-center justify-center overflow-hidden`}>
        {p.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.cover_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/60" />
            <div className="relative z-10 text-6xl opacity-30 group-hover:opacity-50 transition-opacity duration-300">
              {CATEGORY_ICONS[p.category] || <FaCode />}
            </div>
            {/* Decorative circles */}
            <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full border border-white/5" />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full border border-white/5" />
          </>
        )}

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {p.featured && (
            <span className="flex items-center gap-1 bg-amber-500/90 backdrop-blur-sm text-black text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
              <FaStar className="text-[8px]" /> Destacado
            </span>
          )}
          <span className={`${cat.bg} ${cat.text} ${cat.border} border backdrop-blur-sm text-[10px] font-bold px-2.5 py-1 rounded-full`}>
            {CATEGORY_LABELS[p.category] || p.category}
          </span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onOpenDetails(p)}
            className="opacity-0 group-hover:opacity-100 flex items-center gap-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-[10px] uppercase tracking-[0.2em] px-6 py-3 rounded-full transition-all duration-500 shadow-[0_10px_30px_rgba(6,182,212,0.4)] hover:shadow-[0_15px_40px_rgba(6,182,212,0.6)] hover:scale-105 active:scale-95"
          >
            <FaEye className="text-xs" /> Ver Análisis Técnico
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3
          className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors tracking-normal"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          {p.title}
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1 line-clamp-2">{p.description}</p>

        {/* Stack pills */}
        {p.stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {p.stack.slice(0, 3).map((s) => {
              const tech = TECH_COLORS[s];
              return tech ? (
                <span key={s} style={{ backgroundColor: tech.bg, borderColor: tech.border, color: tech.text, boxShadow: `0 2px 8px ${tech.bg}` }} className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 border rounded-md">
                  <span className="text-xs">{tech.icon}</span> {s}
                </span>
              ) : (
                <span key={s} className="text-[10px] font-bold px-2 py-1 bg-white/5 border border-white/10 text-slate-400 rounded-md">
                  {s}
                </span>
              );
            })}
            {p.stack.length > 3 && (
              <span className="text-[10px] font-bold px-2 py-1 bg-white/5 border border-white/10 text-slate-600 rounded-md">
                +{p.stack.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
          {p.price ? (
            <div>
              <div className="text-[10px] text-slate-600 font-bold uppercase mb-0.5">Desde</div>
              <div className="text-lg font-black text-white">{p.price}</div>
            </div>
          ) : <div />}
          <Link
            href={`/proyectos/${p.slug || p.id}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cyan-300/35 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-violet-500/20 text-cyan-100 text-xs font-bold uppercase tracking-[0.08em] hover:border-cyan-200/70 hover:from-cyan-500/40 hover:via-blue-500/42 hover:to-violet-500/40 transition-all hover:scale-105 active:scale-95 shadow-[0_8px_20px_rgba(6,182,212,0.2)]"
          >
            Ver mas
            <span className="w-5 h-5 rounded-full border border-cyan-200/40 bg-cyan-500/20 flex items-center justify-center">
              <FaArrowRight className="text-[9px]" />
            </span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ── Section ──
export default function ProyectosPage() {
  type ReviewPublishMode = "idle" | "google" | "guest";
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [rating, setRating] = useState(0);
  const [reviewSent, setReviewSent] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewSummary, setReviewSummary] = useState({ average: 4.9, total: 150 });
  const [reviewsList, setReviewsList] = useState<ReviewCard[]>(REVIEWS);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState<Proyecto | null>(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isFeaturedPaused, setIsFeaturedPaused] = useState(false);
  const [techStackItems, setTechStackItems] = useState<StackRibbonItem[]>(TECH_STACK_FALLBACK);
  const [isTechStackPaused, setIsTechStackPaused] = useState(false);
  const [portfolioPage, setPortfolioPage] = useState(1);
  const [contactData, setContactData] = useState<ContactData>(defaultContact);
  const [reviewPublishMode, setReviewPublishMode] = useState<ReviewPublishMode>("idle");
  const [googleSdkReady, setGoogleSdkReady] = useState(false);
  const [avatarLoadErrors, setAvatarLoadErrors] = useState<Record<string, boolean>>({});
  const heroRef = useRef<HTMLDivElement>(null);
  const reviewFormRef = useRef<HTMLFormElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const fetchProyectos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/proyectos`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error();
      const parsed = (data as BackendProyecto[]).map(parseProyecto).filter(p => p.active)
        .sort((a, b) => a.order_index - b.order_index || a.id - b.id);
      setProyectos(parsed.length > 0 ? parsed : FALLBACK_PROJECTS);
    } catch {
      setProyectos(FALLBACK_PROJECTS);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProyectos(); }, [fetchProyectos]);

  useEffect(() => {
    let cancelled = false;

    const fetchStackRibbon = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/about-stack`, { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json();
        if (!Array.isArray(payload) || cancelled) return;

        const normalized = (payload as AboutStackItem[])
          .filter((item) => item.active !== false && String(item.name || "").trim().length > 0)
          .sort((a, b) => (Number(a.order_index) || 0) - (Number(b.order_index) || 0))
          .map((item) => ({
            name: String(item.name || "").trim(),
            iconKey: normalizeStackIconKey(item.icon_key || item.name),
            color: String(item.color || "").trim() || undefined,
          }));

        if (normalized.length > 0) {
          setTechStackItems(normalized);
        }
      } catch {
        // Keep fallback stack if API fails.
      }
    };

    fetchStackRibbon();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/services-page/reviews?page_context=proyectos`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) return;
        const backend = data as BackendReview[];
        const ratings = backend.map((r) => Number(r.rating)).filter(v => v > 0);
        if (ratings.length === 0) return;
        setReviewSummary({ average: ratings.reduce((a, b) => a + b, 0) / ratings.length, total: ratings.length });

        const normalized: ReviewCard[] = backend
          .filter((item) => {
            const text = String(item.content || item.comment || "").trim();
            return text.length > 0;
          })
          .sort((a, b) => {
            const verifiedA = a.is_verified ? 1 : 0;
            const verifiedB = b.is_verified ? 1 : 0;
            if (verifiedB !== verifiedA) return verifiedB - verifiedA;

            const ratingA = Math.max(1, Math.min(5, Number(a.rating) || 0));
            const ratingB = Math.max(1, Math.min(5, Number(b.rating) || 0));
            if (ratingB !== ratingA) return ratingB - ratingA;

            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA;
          })
          .map((item, index) => {
            const name = String(item.author_name || item.display_name || "Cliente").trim() || "Cliente";
            const roleRaw = [item.author_role, item.author_company]
              .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
              .join(", ");
            const role = roleRaw || "Cliente";
            const text = String(item.content || item.comment || "").trim();
            const rating = Math.max(1, Math.min(5, Number(item.rating) || 5));
            const initial = String(item.initials || name.charAt(0) || "C").trim().charAt(0).toUpperCase() || "C";
            const avatarCandidate = resolveReviewAvatar(item);

            return {
              name,
              role,
              text,
              rating,
              initial,
              color: REVIEW_TONES[index % REVIEW_TONES.length],
              project: "Caso real",
              verified: Boolean(item.is_verified),
              avatar: avatarCandidate || undefined,
            };
          });

        if (normalized.length > 0) {
          setReviewsList(normalized);
        }
      }).catch(() => { });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchContact = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/contact`, { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (cancelled || !data || typeof data !== "object") return;

        setContactData((prev) => ({
          ...prev,
          whatsapp: String(data.whatsapp || data.phone || prev.whatsapp || defaultContact.whatsapp).trim(),
          phone: String(data.phone || prev.phone || defaultContact.phone).trim(),
          email: String(data.email || prev.email || defaultContact.email).trim(),
        }));
      } catch {
        // Keep fallback values if contact endpoint is unavailable.
      }
    };

    fetchContact();
    return () => { cancelled = true; };
  }, []);

  const displayProjects = proyectos.length > 0 ? proyectos : FALLBACK_PROJECTS;
  const filtered = useMemo(
    () => displayProjects.filter((project) => {
      if (filter === "all") return true;

      const searchText = normalizeFilterText(
        [
          project.title,
          project.description,
          project.category,
          project.client_type || "",
          ...(project.tags || []),
          ...(project.stack || []),
          ...(project.results || []),
        ].join(" ")
      );

      const hasKeyword = (keywords: string[]) => keywords.some((keyword) => searchText.includes(normalizeFilterText(keyword)));
      const normalizedCategory = normalizeFilterText(project.category || "");

      switch (filter as FilterKey) {
        case "landing":
          return normalizedCategory === "web" || normalizedCategory === "landing" || hasKeyword(LANDING_KEYWORDS);
        case "ecommerce":
          return normalizedCategory === "ecommerce";
        case "reservas":
          return normalizedCategory === "sistemas" || normalizedCategory === "reservas" || hasKeyword(RESERVAS_KEYWORDS);
        case "automatizacion":
          return normalizedCategory === "automatizacion" || hasKeyword(AUTOMATIZACION_KEYWORDS);
        case "apps":
          return normalizedCategory === "apps";
        case "otros":
          return (
            normalizedCategory === "otro" ||
            !CORE_CATEGORY_KEYS.includes(normalizedCategory as (typeof CORE_CATEGORY_KEYS)[number])
          );
        default:
          return normalizedCategory === filter;
      }
    }),
    [filter, displayProjects]
  );
  const totalPortfolioPages = useMemo(
    () => Math.max(1, Math.ceil(filtered.length / PROJECTS_PER_PAGE)),
    [filtered.length]
  );
  const paginatedProjects = useMemo(() => {
    const start = (portfolioPage - 1) * PROJECTS_PER_PAGE;
    return filtered.slice(start, start + PROJECTS_PER_PAGE);
  }, [filtered, portfolioPage]);
  const orderedReviews = useMemo(() => (
    [...reviewsList].sort((a, b) => {
      const verifiedA = a.verified ? 1 : 0;
      const verifiedB = b.verified ? 1 : 0;
      if (verifiedB !== verifiedA) return verifiedB - verifiedA;
      if (b.rating !== a.rating) return b.rating - a.rating;
      return a.name.localeCompare(b.name);
    })
  ), [reviewsList]);
  const totalReviewPages = useMemo(
    () => Math.max(1, Math.ceil(orderedReviews.length / REVIEWS_PER_PAGE)),
    [orderedReviews.length]
  );
  const paginatedReviews = useMemo(() => {
    const start = (reviewsPage - 1) * REVIEWS_PER_PAGE;
    return orderedReviews.slice(start, start + REVIEWS_PER_PAGE);
  }, [orderedReviews, reviewsPage]);
  const reviewRangeText = useMemo(() => {
    if (orderedReviews.length === 0) return "Sin resenas disponibles";
    const start = (reviewsPage - 1) * REVIEWS_PER_PAGE + 1;
    const end = Math.min(reviewsPage * REVIEWS_PER_PAGE, orderedReviews.length);
    return `Mostrando ${start} a ${end} de ${orderedReviews.length} resenas`;
  }, [orderedReviews.length, reviewsPage]);
  const paginationItems = useMemo<(number | string)[]>(() => {
    if (totalPortfolioPages <= 7) {
      return Array.from({ length: totalPortfolioPages }, (_, idx) => idx + 1);
    }

    if (portfolioPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPortfolioPages];
    }

    if (portfolioPage >= totalPortfolioPages - 3) {
      return [1, "...", totalPortfolioPages - 4, totalPortfolioPages - 3, totalPortfolioPages - 2, totalPortfolioPages - 1, totalPortfolioPages];
    }

    return [1, "...", portfolioPage - 1, portfolioPage, portfolioPage + 1, "...", totalPortfolioPages];
  }, [totalPortfolioPages, portfolioPage]);
  const featured = useMemo(() => displayProjects.filter((p) => p.featured), [displayProjects]);
  const featuredPool = useMemo(() => {
    if (featured.length > 0) return featured;
    return displayProjects.slice(0, Math.min(6, displayProjects.length));
  }, [featured, displayProjects]);
  const shouldAnimateFeatured = featuredPool.length > 1;
  const featuredTrack = useMemo(
    () => (shouldAnimateFeatured ? [...featuredPool, ...featuredPool] : featuredPool),
    [featuredPool, shouldAnimateFeatured]
  );
  const featuredMarqueeDuration = useMemo(
    () => Math.max(26, featuredPool.length * 7),
    [featuredPool.length]
  );
  const stackRibbon = useMemo(
    () => (techStackItems.length > 0 ? techStackItems : TECH_STACK_FALLBACK),
    [techStackItems]
  );
  const shouldAnimateStackRibbon = stackRibbon.length > 1;
  const stackRibbonTrack = useMemo(
    () => (shouldAnimateStackRibbon ? [...stackRibbon, ...stackRibbon] : stackRibbon),
    [stackRibbon, shouldAnimateStackRibbon]
  );
  const stackRibbonDuration = useMemo(
    () => Math.max(20, stackRibbon.length * 3.8),
    [stackRibbon.length]
  );
  const heroProject = useMemo(
    () => featured[0] || displayProjects[0] || FALLBACK_PROJECTS[0],
    [featured, displayProjects]
  );
  const selectedProjectMedia = useMemo(
    () => resolveProjectMedia(selectedProject),
    [selectedProject]
  );
  const activeSelectedMedia = useMemo(() => {
    if (selectedProjectMedia.length === 0) return null;
    const safeIndex = Math.min(selectedMediaIndex, selectedProjectMedia.length - 1);
    return selectedProjectMedia[safeIndex] || null;
  }, [selectedProjectMedia, selectedMediaIndex]);
  const whatsappDigits = useMemo(() => {
    const fromContact = String(contactData.whatsapp || contactData.phone || "").replace(/\D/g, "");
    if (fromContact.length > 0) return fromContact;
    return String(FALLBACK_WHATSAPP_NUMBER || "").replace(/\D/g, "");
  }, [contactData.whatsapp, contactData.phone]);

  useEffect(() => {
    setPortfolioPage(1);
  }, [filter]);

  useEffect(() => {
    setPortfolioPage((prev) => Math.min(prev, totalPortfolioPages));
  }, [totalPortfolioPages]);
  useEffect(() => {
    setReviewsPage(1);
  }, [reviewsList]);
  useEffect(() => {
    setReviewsPage((prev) => Math.min(prev, totalReviewPages));
  }, [totalReviewPages]);
  useEffect(() => {
    if (totalReviewPages <= 1 || isReviewFormOpen) return;
    const timer = window.setInterval(() => {
      setReviewsPage((prev) => (prev >= totalReviewPages ? 1 : prev + 1));
    }, 6500);
    return () => window.clearInterval(timer);
  }, [totalReviewPages, isReviewFormOpen]);

  useEffect(() => {
    if (selectedProjectMedia.length === 0) {
      setSelectedMediaIndex(0);
      return;
    }
    setSelectedMediaIndex((prev) => Math.min(prev, selectedProjectMedia.length - 1));
  }, [selectedProjectMedia.length]);

  const openProjectDetails = useCallback((project: Proyecto) => {
    const media = resolveProjectMedia(project);
    const firstVideoIndex = media.findIndex((entry) => entry.resource_type === "video");
    setSelectedMediaIndex(firstVideoIndex >= 0 ? firstVideoIndex : 0);
    setSelectedProject(project);
  }, []);

  const closeProjectDetails = useCallback(() => {
    setSelectedProject(null);
    setSelectedMediaIndex(0);
  }, []);

  const normalizeExternalUrl = useCallback((rawUrl?: string | null) => {
    const value = String(rawUrl || "").trim();
    if (!value || value === "#" || value.toLowerCase() === "null" || value.toLowerCase() === "undefined") return "";
    if (/^https?:\/\//i.test(value)) return value;
    if (/^\/\//.test(value)) return `https:${value}`;
    return `https://${value}`;
  }, []);

  const hasExternalUrl = useCallback((rawUrl?: string | null) => {
    return Boolean(normalizeExternalUrl(rawUrl));
  }, [normalizeExternalUrl]);

  const openExternalLink = useCallback((rawUrl?: string | null) => {
    const target = normalizeExternalUrl(rawUrl);
    if (!target) return false;
    window.open(target, "_blank", "noopener,noreferrer");
    return true;
  }, [normalizeExternalUrl]);

  const openWhatsApp = useCallback((projectTitle?: string) => {
    if (!whatsappDigits) return;
    const baseMessage = projectTitle
      ? `Hola, quiero cotizar el proyecto: ${projectTitle}`
      : "Hola, quiero cotizar un proyecto";
    const url = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(baseMessage)}`;
    window.open(url, "_blank");
  }, [whatsappDigits]);

  const openProjectDemo = useCallback((project: Proyecto) => {
    openExternalLink(project.demo_url);
  }, [openExternalLink]);

  const openProjectRepo = useCallback((project: Proyecto) => {
    openExternalLink(project.repo_url);
  }, [openExternalLink]);

  const ensureGoogleSdkLoaded = useCallback(async () => {
    if (typeof window === "undefined") return false;
    if ((window as any).google?.accounts?.id) {
      setGoogleSdkReady(true);
      return true;
    }

    return await new Promise<boolean>((resolve) => {
      const existingScript = document.querySelector('script[data-google-gsi="true"]') as HTMLScriptElement | null;
      if (existingScript) {
        if ((window as any).google?.accounts?.id) {
          setGoogleSdkReady(true);
          resolve(true);
          return;
        }

        existingScript.addEventListener(
          "load",
          () => {
            const ok = Boolean((window as any).google?.accounts?.id);
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
        const ok = Boolean((window as any).google?.accounts?.id);
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
    ensureGoogleSdkLoaded().catch(() => {
      setGoogleSdkReady(false);
    });
  }, [ensureGoogleSdkLoaded]);

  const buildReviewPayload = useCallback((formEl: HTMLFormElement | null): ReviewPublishPayload | null => {
    setReviewError("");
    if (!formEl) {
      setReviewError("No se encontro el formulario.");
      return null;
    }
    if (rating < 1) {
      setReviewError("Selecciona una calificacion entre 1 y 5.");
      return null;
    }

    const fd = new FormData(formEl);
    const authorName = String(fd.get("author_name") || "").trim();
    const authorCompany = String(fd.get("author_company") || "").trim();
    const reviewerEmail = String(fd.get("reviewer_email") || "").trim().toLowerCase();
    const content = String(fd.get("content") || "").trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reviewerEmail);

    if (!authorName || !authorCompany || !isValidEmail || content.length < 20) {
      setReviewError("Completa nombre, empresa, correo valido y una resena de al menos 20 caracteres.");
      return null;
    }

    return {
      display_name: authorName,
      company: authorCompany,
      email: reviewerEmail,
      rating: Math.max(1, Math.min(5, Number(rating) || 5)),
      comment: content,
    };
  }, [rating]);

  const mapApiReviewToCard = useCallback((item: any): ReviewCard | null => {
    const text = String(item?.comment || item?.content || "").trim();
    if (!text) return null;

    const name = String(item?.user?.name || item?.display_name || item?.author_name || "Cliente").trim() || "Cliente";
    const roleRaw = [item?.author_role, item?.author_company]
      .filter((value: unknown): value is string => typeof value === "string" && value.trim().length > 0)
      .join(", ");
    const ratingValue = Math.max(1, Math.min(5, Number(item?.rating) || 5));
    const initial = name.charAt(0).toUpperCase() || "C";
    const avatar = resolveReviewAvatar(item) || undefined;
    const toneIndex = Math.abs(name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) % REVIEW_TONES.length;

    return {
      name,
      role: roleRaw || "Cliente",
      text,
      rating: ratingValue,
      initial,
      color: REVIEW_TONES[toneIndex],
      project: "Caso real",
      verified: Boolean(item?.is_verified),
      avatar,
    };
  }, []);

  const submitReview = useCallback(async (
    payload: ReviewPublishPayload,
    authMode: "google" | "guest",
    googleIdToken?: string
  ) => {
    setReviewPublishMode(authMode);
    setIsSubmitting(true);
    setReviewError("");

    try {
      const res = await fetch(`${BACKEND_URL}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: payload.rating,
          comment: payload.comment,
          authMode,
          googleIdToken: googleIdToken || undefined,
          display_name: payload.display_name,
          company: payload.company,
          email: payload.email,
          page_context: "proyectos",
        }),
      });

      const responsePayload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = responsePayload?.detail || responsePayload?.message || "No se pudo guardar la resena.";
        setReviewError(String(detail));
        return;
      }

      const createdItem = responsePayload?.item || responsePayload;
      const createdStatus = String(createdItem?.status || "").toLowerCase();
      const normalized = mapApiReviewToCard(createdItem);

      if (normalized && createdStatus !== "pending" && createdStatus !== "rejected") {
        setReviewsList((prev) => [normalized, ...prev]);
        setReviewSummary((prev) => {
          const nextTotal = Number(prev.total || 0) + 1;
          const currentAverage = Number(prev.average || 0);
          const nextAverage = ((currentAverage * Number(prev.total || 0)) + payload.rating) / Math.max(1, nextTotal);
          return { average: nextAverage, total: nextTotal };
        });
      }

      reviewFormRef.current?.reset();
      setRating(0);
      setReviewSent(true);
    } catch {
      setReviewError("Error de conexion.");
    } finally {
      setReviewPublishMode("idle");
      setIsSubmitting(false);
    }
  }, [mapApiReviewToCard]);

  const handleGooglePublish = useCallback(async () => {
    const payload = buildReviewPayload(reviewFormRef.current);
    if (!payload) return;

    const googleClientId = String(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "").trim();
    if (!googleClientId) {
      setReviewError("Falta NEXT_PUBLIC_GOOGLE_CLIENT_ID para validar con Google.");
      return;
    }

    const sdkReady = await ensureGoogleSdkLoaded();
    const google = (window as any)?.google;
    if (!sdkReady || !google?.accounts?.id) {
      setReviewError("No se pudo conectar con Google. Revisa bloqueadores y permisos del navegador.");
      return;
    }

    setReviewError("");
    setReviewPublishMode("google");
    let credentialReceived = false;

    google.accounts.id.initialize({
      client_id: googleClientId,
      callback: async (authResponse: { credential?: string }) => {
        const idToken = authResponse?.credential;
        if (!idToken) {
          setReviewPublishMode("idle");
          setReviewError("Google no devolvio credencial.");
          return;
        }
        credentialReceived = true;
        await submitReview(payload, "google", idToken);
      },
      ux_mode: "popup",
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    google.accounts.id.prompt((notification: any) => {
      const notDisplayed = notification?.isNotDisplayed?.();
      const skipped = notification?.isSkippedMoment?.();
      const dismissed = notification?.isDismissedMoment?.();
      const dismissedReason = notification?.getDismissedReason?.();
      if (dismissedReason === "credential_returned" || credentialReceived) return;

      if (notDisplayed || skipped || dismissed) {
        const reason = notification?.getNotDisplayedReason?.() || notification?.getSkippedReason?.() || dismissedReason || "";
        setReviewPublishMode("idle");
        setReviewError(reason ? `No se completo Google (${reason}). Puedes publicar sin validar.` : "No se completo Google. Puedes publicar sin validar.");
      }
    });
  }, [buildReviewPayload, ensureGoogleSdkLoaded, submitReview]);

  const handleReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = buildReviewPayload(e.currentTarget);
    if (!payload) return;
    await submitReview(payload, "guest");
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white overflow-x-hidden">

      {/* Google Font */}
      <style>{`
        @keyframes proyectosParticleFloat {
          0%, 100% { transform: translateY(0); opacity: 0.12; }
          50% { transform: translateY(-30px); opacity: 0.38; }
        }
        @keyframes featuredMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes stackRibbonMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>

      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 1. HERO ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Layered background */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.15),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgba(139,92,246,0.08),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_20%_80%,rgba(6,182,212,0.06),transparent)]" />
          <GridOverlay />
          <ParticlesBg />
        </motion.div>

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-violet-600/5 blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center mb-20"
          >
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-[10px] font-black uppercase tracking-[0.25em] mb-8"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Consultoría Digital de Alto Nivel
              </motion.div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-7">
                <span className="text-white">Arquitectura Digital</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">
                  Impulsamos el Crecimiento
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed font-medium">
                Transformamos desafíos complejos en soluciones digitales de alto impacto. Impulsamos la rentabilidad y escalabilidad de tu negocio mediante tecnología estratégica y diseño orientado a resultados.
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-10">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                  <FaCheck className="text-[10px]" /> Infraestructura de Clase Mundial
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-wider">
                  <FaCheck className="text-[10px]" /> Maximización de Conversión
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-wider">
                  <FaCheck className="text-[10px]" /> Escalabilidad sin Límites
                </span>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => document.getElementById("portafolio")?.scrollIntoView({ behavior: "smooth" })}
                  className="flex items-center gap-3 px-8 py-5 bg-blue-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30 group"
                >
                  <FaEye className="group-hover:scale-110 transition-transform" /> Ver Casos de Éxito
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => openWhatsApp()}
                  className="flex items-center gap-3 px-8 py-4 border border-emerald-500/40 text-emerald-300 font-bold rounded-xl hover:bg-emerald-500/10 hover:text-emerald-200 transition-colors"
                >
                  <FaWhatsapp className="text-emerald-400" /> Agendar Consultoría
                </motion.button>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="relative lg:h-[500px] flex items-center justify-center"
            >
              {/* Decorative Background Agency Image */}
              <div className="absolute -inset-4 md:-inset-10 lg:-inset-20 z-0 opacity-40 blur-[2px] pointer-events-none group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#050508] via-transparent to-transparent z-10" />
                <img
                  src="/img/agency-hero.png"
                  alt="Agency Environment"
                  className="w-full h-full object-cover rounded-[40px] scale-95 group-hover:scale-100 transition-transform duration-[3s]"
                />
              </div>

              {/* Main Featured Project Card (Layered) */}
              <motion.div
                whileHover={{ y: -15, rotateY: -5, rotateX: 5 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="relative z-10 w-full max-w-[440px] perspective-1000"
              >
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b0f1a]/80 backdrop-blur-md min-h-[420px] shadow-[0_40px_100px_rgba(0,0,0,0.6)] group">
                  {heroProject.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={heroProject.cover_url}
                      alt={heroProject.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${CATEGORY_GRADIENTS[heroProject.category] || CATEGORY_GRADIENTS.otro}`} />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 transition-opacity duration-500 group-hover:via-black/50" />

                  <div className="absolute top-5 left-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-black/45 text-white text-[11px] font-bold uppercase tracking-widest backdrop-blur-sm z-20">
                    <FaStar className="text-amber-300 text-[10px]" />
                    Proyecto destacado
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300 font-bold mb-3">
                      {CATEGORY_LABELS[heroProject.category] || "Proyecto digital"}
                    </p>
                    <h3 className="text-2xl md:text-3xl font-black text-white leading-tight mb-3 group-hover:text-cyan-200 transition-colors">
                      {heroProject.title}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed mb-6 line-clamp-3">
                      {heroProject.description}
                    </p>

                    {heroProject.stack.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {heroProject.stack.slice(0, 3).map((item) => (
                          <span
                            key={`${heroProject.id}-${item}`}
                            className="text-[10px] px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-200 backdrop-blur-sm group-hover:border-cyan-500/30 transition-colors"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Glass accent decorations */}
                <div className="absolute -top-6 -right-6 w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border border-white/10 -z-10 animate-pulse" />
                <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full bg-indigo-500/10 blur-2xl -z-20" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mt-16 text-slate-600"
          >
            <FaChevronDown className="text-xl mx-auto" />
          </motion.div>
        </div>
      </section>

      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 2. FEATURED PROJECTS ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(139,92,246,0.04),transparent)]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-[2px] bg-cyan-500" />
              <span className="text-cyan-400 text-xs font-black uppercase tracking-[0.3em]">Ingeniería con Propósito</span>
            </div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tighter">
              Soluciones que <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">Transforman Empresas</span>
            </h2>
            <p className="text-slate-400 text-lg md:text-xl max-w-3xl font-medium leading-relaxed">
              Descubre cómo hemos ayudado a empresas a optimizar sus procesos, reducir costos operativos y dominar su sector mediante tecnología de vanguardia.
            </p>
          </motion.div>

          <div className="flex items-center justify-between mb-8 gap-4">
            <p className="text-[11px] md:text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">
              Ecosistema de Innovación: {featuredPool.length} Casos de Éxito
            </p>
            <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-cyan-400 font-black">
              Innovación en Movimiento
            </span>
          </div>

          <div
            className="relative overflow-hidden"
            onMouseEnter={() => setIsFeaturedPaused(true)}
            onMouseLeave={() => setIsFeaturedPaused(false)}
            onFocusCapture={() => setIsFeaturedPaused(true)}
            onBlurCapture={() => setIsFeaturedPaused(false)}
          >
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => <ProjectSkeleton key={i} />)}
              </div>
            ) : (
              <div
                className="flex w-max"
                style={shouldAnimateFeatured ? {
                  animationName: "featuredMarquee",
                  animationDuration: `${featuredMarqueeDuration}s`,
                  animationTimingFunction: "linear",
                  animationIterationCount: "infinite",
                  animationPlayState: isFeaturedPaused ? "paused" : "running",
                } : undefined}
              >
                {featuredTrack.map((p, i) => {
                  const catStyle = CAT_STYLES[p.category] || CAT_STYLES.otro;
                  const catLabel = CATEGORY_LABELS[p.category] || p.category;
                  const previewTags = p.tags.length > 0 ? p.tags.slice(0, 3) : p.stack.slice(0, 3);

                  return (
                    <div key={`${p.id}-${i}`} className="mr-8 w-[86vw] max-w-[430px] shrink-0">
                      <motion.article
                        whileHover={{ y: -8 }}
                        transition={{ duration: 0.28 }}
                        className="group relative h-full rounded-[28px] overflow-hidden border border-cyan-300/18 bg-[#080b14] hover:border-cyan-300/45 transition-all duration-500"
                        style={{ boxShadow: "0 20px 80px rgba(0,0,0,0.52)" }}
                      >
                        <Link href={`/proyectos/${p.slug || p.id}`} className="block h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-[28px]">
                          <div className={`absolute -inset-px bg-gradient-to-br ${CATEGORY_GRADIENTS[p.category] || CATEGORY_GRADIENTS.otro} opacity-[0.24] pointer-events-none`} />
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_70%_45%_at_50%_100%,rgba(34,211,238,0.2),transparent)] pointer-events-none" />

                          <div className="relative h-64 overflow-hidden flex items-center justify-center">
                            {p.cover_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.cover_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                              <>
                                <div className="text-8xl opacity-25">{CATEGORY_ICONS[p.category]}</div>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                                  className="absolute inset-8 rounded-full border border-white/10"
                                />
                              </>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-[#070a13] via-[#070a13]/35 to-transparent" />

                            <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-3 z-20">
                              <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide px-3 py-1.5 rounded-full border ${catStyle.border} ${catStyle.bg} ${catStyle.text} backdrop-blur-sm`}>
                                {CATEGORY_ICONS[p.category] || <FaCode className="text-[9px]" />} {catLabel}
                              </span>
                              <span className="inline-flex items-center gap-1.5 bg-amber-400 text-black text-[10px] font-black uppercase tracking-wide px-3 py-1.5 rounded-full shadow-lg shadow-amber-400/25">
                                <FaStar className="text-[9px]" /> Bestseller
                              </span>
                            </div>

                            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between text-[11px]">
                              <span className="px-2.5 py-1 rounded-md border border-white/20 bg-black/35 text-slate-200 font-semibold">
                                {p.stack.length > 0 ? `${p.stack.length} tecnologias` : "Stack a medida"}
                              </span>
                              <span className="px-2.5 py-1 rounded-md border border-cyan-300/30 bg-cyan-500/15 text-cyan-200 font-semibold">
                                {p.price ? `${p.price} USD` : "Cotizacion"}
                              </span>
                            </div>
                          </div>

                          <div className="relative p-6 md:p-7 flex flex-col min-h-[310px]">
                            <h3
                              className="text-2xl font-bold text-white mb-3 tracking-normal leading-tight line-clamp-2 min-h-[68px] group-hover:text-cyan-200 transition-colors"
                              style={{ fontFamily: "var(--font-geist-sans)" }}
                            >
                              {p.title}
                            </h3>
                            <p className="text-slate-300/90 text-sm leading-relaxed mb-5 line-clamp-3 min-h-[78px]">{p.description}</p>

                            <div className="flex flex-wrap gap-2 mb-6 min-h-[42px]">
                              {previewTags.length > 0 ? previewTags.map((tag) => (
                                <span key={tag} className="text-[11px] font-bold px-3 py-1.5 bg-white/[0.05] border border-white/12 text-slate-200 rounded-full">
                                  {tag}
                                </span>
                              )) : (
                                <span className="text-[11px] px-3 py-1.5 opacity-0 select-none">placeholder</span>
                              )}
                            </div>

                            <div className="mt-auto pt-5 border-t border-white/[0.08]">
                              <div
                                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-amber-400/40 bg-gradient-to-b from-[#17120d] to-[#010101] text-amber-300 font-bold text-sm group-hover:from-amber-400 group-hover:to-amber-500 group-hover:text-black transition-all shadow-[0_10px_30px_rgba(245,158,11,0.15)]"
                              >
                                <span>Ver caso completo</span>
                                <span className="w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center group-hover:bg-black/20">
                                  <FaArrowRight className="text-[11px]" />
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.article>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 3. FULL PORTFOLIO ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      <section id="portafolio" className="py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-[2px] bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
              <span className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em]">Historial de Resultados</span>
            </div>
            <div className="max-w-4xl mb-12">
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-6 leading-none">
                Portafolio de <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">Innovación</span>
              </h2>
              <p className="text-slate-400 text-lg md:text-xl leading-relaxed font-medium">
                Un recorrido por los desafíos técnicos que hemos superado para entregar valor real a nuestros clientes. Cada proyecto es una prueba de nuestro compromiso con la excelencia.
              </p>
            </div>

            <div className="w-full pt-10 border-t border-white/5">
              <div className="flex flex-wrap items-center justify-start gap-3">
                {FILTER_TABS.map((tab) => {
                  const isActive = filter === tab.key;
                  return (
                    <motion.button
                      type="button"
                      key={tab.key}
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.05)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFilter(tab.key)}
                      className={`group relative px-6 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 border-2 flex items-center gap-3 overflow-hidden ${isActive
                        ? "bg-cyan-500/10 border-cyan-400/60 text-white shadow-[0_0_30px_rgba(34,211,238,0.15)]"
                        : "bg-[#0a0a0a] border-white/10 text-slate-500 hover:border-white/30 hover:text-white"
                        }`}
                    >
                      {/* Active glow bridge */}
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-transparent" />
                      )}

                      <span className={`relative z-10 text-base transition-colors duration-300 ${isActive ? "text-cyan-400" : "text-slate-600 group-hover:text-slate-400"}`}>
                        {tab.icon}
                      </span>
                      <span className="relative z-10">
                        {tab.label}
                      </span>

                      {isActive && (
                        <motion.div
                          layoutId="active-dot-indicator"
                          className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)]"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <ProjectSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="text-7xl mb-6 opacity-20"><FaCode /></div>
              <h3 className="text-2xl font-black text-slate-500 mb-4">No se encontraron despliegues en esta categoría</h3>
              <p className="text-slate-600 max-w-md mx-auto">Nuestra experiencia es vasta; si no visualiza un caso similar al suyo, consulte por nuestras **Soluciones de Ingeniería a Medida**.</p>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div
                  key={`portfolio-page-${portfolioPage}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="contents"
                >
                  {paginatedProjects.map((p, i) => (
                    <ProjectCard
                      key={p.id}
                      p={p}
                      onOpenDetails={openProjectDetails}
                    />
                  ))}
                </motion.div>
              </div>

              {filtered.length > PROJECTS_PER_PAGE && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">
                    Visualizando <span className="text-cyan-400">{(portfolioPage - 1) * PROJECTS_PER_PAGE + 1} - {Math.min(portfolioPage * PROJECTS_PER_PAGE, filtered.length)}</span> de <span className="text-white">{filtered.length}</span> Soluciones Tecnológicas
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-start md:justify-end">
                    <button
                      type="button"
                      onClick={() => setPortfolioPage((prev) => Math.max(1, prev - 1))}
                      disabled={portfolioPage === 1}
                      className="w-9 h-9 rounded-lg border border-white/15 bg-white/[0.02] text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-cyan-300/40 hover:bg-cyan-500/[0.08] transition-all flex items-center justify-center"
                      aria-label="Pagina anterior"
                    >
                      <FaChevronLeft className="text-xs" />
                    </button>

                    {paginationItems.map((item, idx) => (
                      typeof item === "number" ? (
                        <button
                          key={`page-${item}`}
                          type="button"
                          onClick={() => setPortfolioPage(item)}
                          className={`min-w-[2.25rem] h-9 px-3 rounded-lg text-sm font-bold transition-all ${portfolioPage === item
                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_10px_20px_rgba(6,182,212,0.28)]"
                            : "border border-white/15 bg-white/[0.02] text-slate-300 hover:border-cyan-300/40 hover:bg-cyan-500/[0.08]"
                            }`}
                          aria-label={`Ir a pagina ${item}`}
                        >
                          {item}
                        </button>
                      ) : (
                        <span key={`dots-${idx}`} className="px-1 text-slate-500 select-none">{item}</span>
                      )
                    ))}

                    <button
                      type="button"
                      onClick={() => setPortfolioPage((prev) => Math.min(totalPortfolioPages, prev + 1))}
                      disabled={portfolioPage === totalPortfolioPages}
                      className="w-9 h-9 rounded-lg border border-white/15 bg-white/[0.02] text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-cyan-300/40 hover:bg-cyan-500/[0.08] transition-all flex items-center justify-center"
                      aria-label="Pagina siguiente"
                    >
                      <FaChevronRight className="text-xs" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 4. PROCESO DE TRABAJO ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/75 backdrop-blur-sm p-4 md:p-6 flex items-center justify-center"
            onClick={closeProjectDetails}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#090d1a] shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative h-56 md:h-72 overflow-hidden border-b border-white/10">
                {activeSelectedMedia ? (
                  activeSelectedMedia.resource_type === "video" ? (
                    <video
                      key={`media-video-${activeSelectedMedia.url}`}
                      src={activeSelectedMedia.url}
                      className="h-full w-full object-cover"
                      controls
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={`media-image-${activeSelectedMedia.url}`}
                      src={activeSelectedMedia.url}
                      alt={activeSelectedMedia.caption || selectedProject.title}
                      className="h-full w-full object-cover"
                    />
                  )
                ) : (
                  <div className={`h-full w-full bg-gradient-to-br ${CATEGORY_GRADIENTS[selectedProject.category] || CATEGORY_GRADIENTS.otro} flex items-center justify-center text-7xl opacity-40`}>
                    {CATEGORY_ICONS[selectedProject.category] || <FaCode />}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#090d1a] via-[#090d1a]/30 to-transparent" />
                <button
                  type="button"
                  onClick={closeProjectDetails}
                  className="absolute top-4 right-4 w-10 h-10 rounded-xl border border-white/20 bg-black/50 text-white hover:bg-black/70 transition-colors flex items-center justify-center"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6 md:p-8">
                {selectedProjectMedia.length > 1 && (
                  <div className="mb-5 flex flex-wrap gap-2">
                    {selectedProjectMedia.map((item, index) => (
                      <button
                        key={`project-media-thumb-${item.resource_type}-${item.url}-${index}`}
                        type="button"
                        onClick={() => setSelectedMediaIndex(index)}
                        className={`relative h-14 w-20 overflow-hidden rounded-lg border transition-all ${selectedMediaIndex === index
                          ? "border-cyan-300/80 ring-2 ring-cyan-400/40"
                          : "border-white/20 hover:border-cyan-300/45"
                          }`}
                        aria-label={`Ver media ${index + 1}`}
                      >
                        {item.resource_type === "video" ? (
                          <video src={item.url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.url} alt={item.caption || `media-${index + 1}`} className="h-full w-full object-cover" />
                        )}
                        <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/65 border border-white/20 text-white flex items-center justify-center">
                          {item.resource_type === "video" ? <FaPlay className="text-[9px]" /> : <FaImage className="text-[9px]" />}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`${CAT_STYLES[selectedProject.category]?.bg || CAT_STYLES.otro.bg} ${CAT_STYLES[selectedProject.category]?.text || CAT_STYLES.otro.text} border ${CAT_STYLES[selectedProject.category]?.border || CAT_STYLES.otro.border} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider`}>
                    {CATEGORY_LABELS[selectedProject.category] || selectedProject.category}
                  </span>
                  {selectedProject.featured && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-black">
                      <FaStar className="text-[10px]" /> Destacado
                    </span>
                  )}
                </div>

                <h3 className="text-3xl md:text-4xl font-black text-white mb-4">{selectedProject.title}</h3>

                <div className="grid md:grid-cols-3 gap-3 mb-6">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-1">Tipo</p>
                    <p className="text-sm text-slate-100 font-semibold">{selectedProject.client_type || "Implementacion a medida"}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-1">Stack</p>
                    <p className="text-sm text-slate-100 font-semibold">{selectedProject.stack.length > 0 ? `${selectedProject.stack.length} tecnologias` : "Definido por alcance"}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-1">Enlaces</p>
                    <p className="text-sm text-slate-100 font-semibold">
                      {[selectedProject.demo_url, selectedProject.repo_url].filter((value) => hasExternalUrl(value)).length} disponibles
                    </p>
                  </div>
                </div>

                <div className="mb-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-cyan-500/[0.03] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200/90 mb-3">Descripcion del proyecto</p>
                  <p className="text-slate-200 leading-relaxed text-base md:text-lg mb-4">{selectedProject.description}</p>

                  {((selectedProject.results && selectedProject.results.length > 0) || selectedProject.tags.length > 0) && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {(selectedProject.results && selectedProject.results.length > 0 ? selectedProject.results : selectedProject.tags)
                        .slice(0, 4)
                        .map((item) => (
                          <div key={item} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-200">
                            <span className="text-cyan-300 mr-2">•</span>{item}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {selectedProject.stack.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">Stack tecnico</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.stack.map((s) => {
                        const tech = TECH_COLORS[s];
                        return tech ? (
                          <span key={s} style={{ backgroundColor: tech.bg, borderColor: tech.border, color: tech.text, boxShadow: `0 2px 10px ${tech.bg}` }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold">
                            <span className="text-sm">{tech.icon}</span> {s}
                          </span>
                        ) : (
                          <span key={s} className="px-3 py-1.5 rounded-lg border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 text-xs font-bold">
                            {s}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openProjectRepo(selectedProject)}
                    disabled={!hasExternalUrl(selectedProject.repo_url)}
                    className={`rounded-2xl border px-4 py-3 transition-all flex items-center justify-center gap-2 font-sans font-semibold text-sm tracking-normal ${
                      hasExternalUrl(selectedProject.repo_url)
                        ? "border-amber-400/45 bg-gradient-to-b from-[#17120d] to-[#090807] hover:border-amber-300 hover:from-amber-300 hover:to-amber-500 text-amber-300 hover:text-black"
                        : "border-white/10 bg-white/[0.04] text-slate-500 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <SiGithub className="text-base" /> {hasExternalUrl(selectedProject.repo_url) ? "Ver GitHub" : "GitHub no disponible"}
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openProjectDemo(selectedProject)}
                    disabled={!hasExternalUrl(selectedProject.demo_url)}
                    className={`rounded-2xl border px-4 py-3 transition-all shadow-[0_10px_24px_rgba(245,158,11,0.16)] flex items-center justify-center gap-2 font-sans font-semibold text-sm tracking-normal ${
                      hasExternalUrl(selectedProject.demo_url)
                        ? "border-amber-400/45 bg-gradient-to-b from-[#17120d] to-[#090807] hover:border-amber-300 hover:from-amber-300 hover:to-amber-500 text-amber-300 hover:text-black"
                        : "border-white/10 bg-white/[0.04] text-slate-500 cursor-not-allowed opacity-60 shadow-none"
                    }`}
                  >
                    <SiGooglechrome className="text-base" /> {hasExternalUrl(selectedProject.demo_url) ? "Ver Demo" : "Demo no disponible"}
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openWhatsApp(selectedProject.title)}
                    className="rounded-2xl border border-amber-400/45 bg-gradient-to-b from-[#17120d] to-[#090807] px-4 py-3 hover:border-amber-300 hover:from-amber-300 hover:to-amber-500 transition-all shadow-[0_10px_24px_rgba(245,158,11,0.16)] flex items-center justify-center gap-2 text-amber-300 hover:text-black font-sans font-semibold text-sm tracking-normal"
                  >
                    <SiWhatsapp className="text-base" /> Contacto
                  </motion.button>

                  <button
                    type="button"
                    onClick={closeProjectDetails}
                    className="rounded-2xl border border-amber-400/45 bg-gradient-to-b from-[#17120d] to-[#090807] px-4 py-3 text-amber-300 hover:text-black font-sans font-semibold text-sm tracking-normal hover:border-amber-300 hover:from-amber-300 hover:to-amber-500 transition-all flex items-center justify-center gap-2"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- 4. MODELO DE EVALUACION --- */}
      {/* --- 4. AUTORIDAD TECNICA (AGENCIA ELITE) --- */}
      <section className="py-40 px-6 relative border-t border-white/[0.04] bg-[#030303]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(16,185,129,0.03),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(6,182,212,0.03),transparent_50%)]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-[2px] bg-emerald-500" />
              <span className="text-emerald-400 text-sm font-black uppercase tracking-[0.3em]">Expertise de Agencia</span>
            </div>
            <h2 className="text-6xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter mb-8 max-w-4xl">
              Ingeniería que escala <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500">al ritmo de tu negocio.</span>
            </h2>
            <p className="text-slate-500 text-xl max-w-2xl leading-relaxed">
              No construimos simples sitios web. Desarrollamos arquitecturas digitales robustas diseñadas para dominar el mercado y garantizar la continuidad operativa.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto">
            {/* Lado Izquierdo - Card Grande (Ecosistemas) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-7 group relative overflow-hidden rounded-[2.5rem] border border-white/[0.06] bg-[#080808] p-10 md:p-14 hover:border-emerald-500/30 transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 blur-[100px] -mr-20 -mt-20 group-hover:bg-emerald-500/10 transition-colors duration-500" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-2xl mb-8 group-hover:scale-110 transition-transform duration-500">
                    <FaCogs />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-white mb-6">Ecosistemas de <br />Ingeniería Modular</h3>
                  <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                    Implementamos arquitecturas desacopladas (Headless) y microservicios que permiten a su empresa escalar vertical y horizontalmente sin deudas técnicas.
                  </p>
                </div>
                <div className="mt-12 flex flex-wrap gap-4">
                  {["Performance < 1s", "Microservicios", "Escalabilidad Elástica"].map(tag => (
                    <span key={tag} className="px-5 py-2 rounded-full border border-emerald-500/15 bg-emerald-500/5 text-emerald-300 text-xs font-bold uppercase tracking-widest">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Lado Derecho - Stack vertical de 2 cards */}
            <div className="md:col-span-5 grid grid-rows-2 gap-6">
              {/* Card Seguridad */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-[2.5rem] border border-white/[0.06] bg-[#080808] p-10 hover:border-blue-500/30 transition-all duration-500"
              >
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xl group-hover:rotate-[360deg] transition-transform duration-1000">
                    <FaShieldAlt />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-3">Seguridad Corporativa</h3>
                    <p className="text-slate-500 text-base leading-relaxed">
                      Cifrado de grado militar y protocolos de auditoría constante. Protegemos su activo más valioso: la información.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card UX / Conversión */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="group relative overflow-hidden rounded-[2.5rem] border border-white/[0.06] bg-[#080808] p-10 hover:border-amber-500/30 transition-all duration-500"
              >
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xl group-hover:scale-110 transition-transform duration-500">
                    <FaLightbulb />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-3">Conversión UX Elite</h3>
                    <p className="text-slate-500 text-base leading-relaxed">
                      Diseñamos interfaces que no solo se ven bien, sino que están optimizadas neuro-estéticamente para convertir cada visita en negocio.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 5. TECH STACK --- */}
      <section className="py-16 px-0 border-t border-white/[0.04]">
        <div
          className="relative overflow-hidden border-y border-cyan-300/20 bg-gradient-to-r from-slate-950/90 via-[#070b16]/95 to-slate-950/90 py-4 md:py-5 shadow-[0_24px_60px_rgba(3,7,18,0.55)]"
          onMouseEnter={() => setIsTechStackPaused(true)}
          onMouseLeave={() => setIsTechStackPaused(false)}
          onFocusCapture={() => setIsTechStackPaused(true)}
          onBlurCapture={() => setIsTechStackPaused(false)}
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#05070d] to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#05070d] to-transparent z-10" />

          <div
            className="flex w-max"
            style={shouldAnimateStackRibbon ? {
              animationName: "stackRibbonMarquee",
              animationDuration: `${stackRibbonDuration}s`,
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
              animationPlayState: isTechStackPaused ? "paused" : "running",
            } : undefined}
          >
            {stackRibbonTrack.map((tech, index) => {
              const iconKey = normalizeStackIconKey(tech.iconKey || tech.name);
              const iconNode = STACK_ICON_MAP[iconKey] || <FaCode />;
              const iconColor = tech.color || "#94A3B8";

              return (
                <div key={`${tech.name}-${index}`} className="mr-3 md:mr-4 min-w-[120px] md:min-w-[136px] shrink-0">
                  <motion.div
                    whileHover={{ y: -3, scale: 1.02 }}
                    className="h-[92px] md:h-[98px] rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-cyan-300/40 transition-all duration-300 flex flex-col items-center justify-center gap-2 px-3"
                  >
                    <span className="text-[24px] md:text-[26px] leading-none" style={{ color: iconColor }}>
                      {iconNode}
                    </span>
                    <span className="text-[11px] md:text-xs font-bold tracking-wide text-slate-300 text-center">{tech.name}</span>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- 6. IMPACTO ESTRATEGICO Y ROI --- */}
      <section className="py-40 px-6 border-t border-white/[0.04] relative overflow-hidden bg-[#050505]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.02),transparent_70%)]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20"
          >
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                Business Value & ROI
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-white leading-none tracking-tighter mb-6">
                Sistemas que transforman <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">el rendimiento de tu activo.</span>
              </h2>
            </div>
            <p className="text-slate-500 text-lg max-w-md leading-relaxed border-l border-white/10 pl-6">
              Cada ejecución técnica está diseñada para impactar directamente en el balance final: más ventas, menos costos operativos y escalabilidad real.
            </p>
          </motion.div>

          {/* Bento Grid de Impacto */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[240px]">
            {/* 1. Captación y Ventas (Grande - 8 cols) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-8 md:row-span-2 group relative overflow-hidden rounded-[2.5rem] border border-white/[0.06] bg-[#0a0a0a] p-10 md:p-14 hover:border-cyan-500/30 transition-all duration-500"
            >
              <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-cyan-500/5 blur-[120px] group-hover:bg-cyan-500/10 transition-colors duration-500" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-2xl mb-8">
                  <FaGlobe />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl md:text-4xl font-black text-white mb-6">Optimización de <br />Embudo Comercial</h3>
                  <div className="grid md:grid-cols-2 gap-10">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-2">Problema Crítico</span>
                      <p className="text-slate-400 text-base leading-relaxed">Fuga de leads por falta de respuesta inmediata y desorden en el seguimiento manual de consultas.</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500 block mb-2">Ingeniería Aplicada</span>
                      <p className="text-slate-300 text-base leading-relaxed">Centralización en CRM, automatización de WhatsApp y scoring de leads para priorizar el cierre.</p>
                    </div>
                  </div>
                </div>
                <div className="mt-10 pt-8 border-t border-white/5 flex items-center gap-6">
                  <div className="text-2xl font-black text-white">45% <span className="text-cyan-400 text-xs uppercase tracking-widest ml-1 font-bold">Más Cierres</span></div>
                  <div className="w-px h-6 bg-white/10" />
                  <div className="text-2xl font-black text-white">0s <span className="text-cyan-400 text-xs uppercase tracking-widest ml-1 font-bold">Respuesta Automatizada</span></div>
                </div>
              </div>
            </motion.div>

            {/* 2. Gestión y Reservas (Vertical - 4 cols) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-4 md:row-span-2 group relative overflow-hidden rounded-[2.5rem] border border-white/[0.06] bg-[#0a0a0a] p-10 hover:border-violet-500/30 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 text-2xl mb-8">
                  <FaCalendarCheck />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-6 leading-tight">Gestión Operativa <br />& Booking</h3>
                <p className="text-slate-500 text-base leading-relaxed mb-10 flex-1">
                  Eliminamos el caos de la agenda manual instalando sistemas de reserva inteligentes con sincronización bidireccional y depósitos de garantía.
                </p>
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-violet-400 block mb-2">Impacto Directo</span>
                  <p className="text-white font-bold text-sm">Eliminación de No-Shows y 40% ahorro en horas administrativas.</p>
                </div>
              </div>
            </motion.div>

            {/* 3. Automatización (Horizontal - 6 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-6 md:row-span-1 group relative overflow-hidden rounded-[2.5rem] border border-white/[0.06] bg-[#0a0a0a] p-8 md:p-10 hover:border-emerald-500/30 transition-all duration-500"
            >
              <div className="flex gap-8 items-center h-full">
                <div className="w-16 h-16 shrink-0 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-2xl">
                  <FaCogs />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Automatización de Procesos</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">Adiós a las tareas repetitivas. Ingeniería de reglas de negocio para cotizaciones y flujos internos desatendidos.</p>
                </div>
              </div>
            </motion.div>

            {/* 4. Escalabilidad (Horizontal - 6 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-6 md:row-span-1 group relative overflow-hidden rounded-[2.5rem] border border-white/[0.06] bg-[#0a0a0a] p-8 md:p-10 hover:border-amber-500/30 transition-all duration-500"
            >
              <div className="flex gap-8 items-center h-full">
                <div className="w-16 h-16 shrink-0 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-2xl">
                  <FaRocket />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Arquitectura de Crecimiento</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">Sistemas que no mueren al crecer. Diseñados desde el día 1 para soportar aumentos de tráfico de hasta 10x sin fricciones.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-[2px] bg-amber-500" />
              <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Testimonios</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <h2 className="text-5xl font-black text-white tracking-tight mb-4">
                  RESEÑAS QUE ACREDITAN NUESTRA<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 uppercase">AUTORIDAD DIGITAL</span>
                </h2>
                <p className="text-slate-500 text-lg leading-relaxed">
                  Casos de éxito y experiencias de socios estratégicos que han transformado su presencia digital con nuestra ingeniería.
                </p>
              </div>
              {/* Summary stats */}
              <div className="flex items-center gap-6 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                <div className="text-center">
                  <div className="text-3xl font-black text-amber-400">{reviewSummary.average.toFixed(1)}</div>
                  <div className="flex text-amber-500 gap-0.5 text-sm my-1">
                    {Array.from({ length: 5 }).map((_, i) => <FaStar key={i} className="text-[11px]" />)}
                  </div>
                  <div className="text-[10px] text-slate-600 uppercase font-bold">Promedio</div>
                </div>
                <div className="w-[1px] h-12 bg-white/10" />
                <div className="text-center">
                  <div className="text-3xl font-black text-blue-400">{reviewSummary.total}</div>
                  <div className="text-[10px] text-slate-600 uppercase font-bold mt-2">Resenas</div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
              <div className="text-xs md:text-sm text-slate-400 font-medium">
                {reviewRangeText}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setReviewsPage((prev) => Math.max(1, prev - 1))}
                  disabled={reviewsPage === 1}
                  className="w-8 h-8 rounded-lg border border-white/15 text-slate-300 flex items-center justify-center disabled:opacity-35 disabled:cursor-not-allowed hover:border-cyan-300/60 hover:text-cyan-200 transition-colors"
                  aria-label="Resenas anteriores"
                >
                  <FaChevronLeft className="text-xs" />
                </button>
                <div className="px-3 py-1.5 rounded-lg border border-white/12 bg-white/[0.03] text-[11px] font-bold tracking-wide text-slate-300">
                  Pagina {reviewsPage} de {totalReviewPages}
                </div>
                <button
                  type="button"
                  onClick={() => setReviewsPage((prev) => Math.min(totalReviewPages, prev + 1))}
                  disabled={reviewsPage === totalReviewPages}
                  className="w-8 h-8 rounded-lg border border-white/15 text-slate-300 flex items-center justify-center disabled:opacity-35 disabled:cursor-not-allowed hover:border-cyan-300/60 hover:text-cyan-200 transition-colors"
                  aria-label="Siguientes resenas"
                >
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`reviews-page-${reviewsPage}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="grid gap-4 md:grid-cols-2"
              >
                {paginatedReviews.map((r, i) => (
                  <motion.div
                    key={`${r.name}-${i}-${reviewsPage}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-5 rounded-2xl border border-white/[0.06] bg-[#0a0f1f]/80 hover:border-white/15 hover:bg-[#0c1228] transition-all duration-300 min-h-[210px]"
                  >
                    <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-slate-600 border border-white/10 px-2 py-1 rounded-md mb-3">
                      {r.project}
                    </span>
                    <div className="flex text-amber-500 gap-1 text-sm mb-3">
                      {Array.from({ length: r.rating }).map((_, j) => <FaStar key={j} />)}
                    </div>
                    <p className="text-slate-300 leading-relaxed mb-4 text-sm line-clamp-3">{r.text}</p>
                    <div className="flex items-center gap-3">
                      {r.avatar && !avatarLoadErrors[`${r.name}-${i}-${reviewsPage}`] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.avatar}
                          alt={`Avatar de ${r.name}`}
                          className="w-9 h-9 rounded-lg object-cover border border-white/20"
                          onError={() =>
                            setAvatarLoadErrors((prev) => ({
                              ...prev,
                              [`${r.name}-${i}-${reviewsPage}`]: true,
                            }))
                          }
                        />
                      ) : (
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-white text-sm ${AVATAR_BG[r.color]}`}>
                          {r.initial}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-black text-white text-sm truncate">{r.name}</div>
                          {r.verified && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-400/35 bg-emerald-500/15 text-emerald-300 font-bold uppercase tracking-wide">
                              Verificada
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 truncate">{r.role}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {totalReviewPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                {Array.from({ length: totalReviewPages }, (_, idx) => idx + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setReviewsPage(page)}
                    className={`h-2.5 rounded-full transition-all ${page === reviewsPage ? "w-8 bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.55)]" : "w-2.5 bg-white/25 hover:bg-white/45"}`}
                    aria-label={`Ir a pagina de resenas ${page}`}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="mt-12 flex justify-center">
            <div className="relative w-full max-w-2xl flex justify-center">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsReviewFormOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl border border-amber-300/45 bg-gradient-to-r from-amber-500/22 via-orange-500/18 to-amber-500/22 text-amber-100 font-bold text-sm hover:from-amber-500/30 hover:via-orange-500/26 hover:to-amber-500/30 transition-all shadow-[0_10px_28px_rgba(245,158,11,0.22)]"
              >
                {isReviewFormOpen ? "Cerrar resena" : "Dejar una resena"}
                <FaArrowRight className={`text-[11px] transition-transform ${isReviewFormOpen ? "rotate-90" : ""}`} />
              </motion.button>

              <AnimatePresence initial={false}>
                {isReviewFormOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="absolute z-20 bottom-full mb-4 left-1/2 -translate-x-1/2 w-[min(96vw,980px)]"
                  >
                    <div className="relative p-8 md:p-10 rounded-3xl border border-white/[0.12] bg-[#0a0a12] shadow-[0_26px_70px_rgba(0,0,0,0.58)]">
                      <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 rotate-45 bg-[#0a0a12] border-r border-b border-white/[0.12]" />

                      {!reviewSent ? (
                        <>
                          <div className="text-center mb-8">
                            <h3 className="text-3xl font-black text-white mb-2">Trabajaste con nosotros?</h3>
                            <p className="text-slate-400">Tu experiencia ayuda a otros a tomar mejores decisiones.</p>
                          </div>
                          <form ref={reviewFormRef} onSubmit={handleReview} className="space-y-6">
                            <div className="grid md:grid-cols-3 gap-4">
                              <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Nombre completo *</label>
                                <input name="author_name" required placeholder="Nombre completo *"
                                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500/50 transition-colors" />
                              </div>
                              <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Empresa *</label>
                                <input name="author_company" required placeholder="Empresa *"
                                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500/50 transition-colors" />
                              </div>
                              <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Correo / Gmail *</label>
                                <input type="email" name="reviewer_email" required placeholder="Correo / Gmail *"
                                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500/50 transition-colors" />
                              </div>
                            </div>

                            <div>
                              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 block">Calificacion *</label>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => setRating(s)}
                                    className={`text-2xl transition-all duration-150 ${rating >= s ? "text-amber-400 scale-110" : "text-slate-700 hover:text-slate-500"}`}
                                    aria-label={`Calificar con ${s} estrellas`}
                                  >
                                    <FaStar />
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Tu experiencia *</label>
                              <textarea name="content" required rows={4} placeholder="Cuentanos sobre los resultados que obtuviste con el proyecto..." minLength={20}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500/50 transition-colors resize-none" />
                            </div>

                            <AnimatePresence>
                              {reviewError && (
                                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                  className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-bold">
                                  <FaExclamationTriangle /> {reviewError}
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <div className="grid sm:grid-cols-2 gap-3">
                              <button
                                type="button"
                                onClick={handleGooglePublish}
                                disabled={isSubmitting || !googleSdkReady}
                                className="py-4 border border-emerald-400/45 bg-emerald-500/14 text-emerald-100 font-black rounded-xl hover:bg-emerald-500/22 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {reviewPublishMode === "google" ? (
                                  <>
                                    <FaSpinner className="animate-spin" /> Validando...
                                  </>
                                ) : (
                                  "Validar con Google"
                                )}
                              </button>
                              <button
                                type="submit"
                                disabled={isSubmitting}
                                className="py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-500 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isSubmitting && reviewPublishMode !== "google" ? (
                                  <>
                                    <FaSpinner className="animate-spin" /> Enviando...
                                  </>
                                ) : (
                                  "Publicar sin validar"
                                )}
                              </button>
                            </div>
                            {!googleSdkReady && (
                              <p className="text-[11px] text-slate-500 text-center">
                                Cargando Google...
                              </p>
                            )}
                          </form>
                        </>
                      ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                          <div className="text-5xl mb-5">OK</div>
                          <h3 className="text-2xl font-black text-emerald-400 mb-3">Gracias por tu resena</h3>
                          <p className="text-slate-400 mb-7">Sera verificada y publicada por nuestro equipo.</p>
                          <button onClick={() => setReviewSent(false)} className="px-8 py-3 border border-white/10 text-white font-bold rounded-xl hover:bg-white/5 transition-colors text-sm">
                            Escribir otra resena
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 8. CTA FINAL ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      <section className="py-40 px-6 border-t border-white/[0.04] relative overflow-hidden bg-[linear-gradient(180deg,rgba(3,8,22,0.9)_0%,rgba(4,9,18,0.98)_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_48%,rgba(34,211,238,0.13),transparent_62%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_70%_30%,rgba(59,130,246,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_48%_42%_at_24%_72%,rgba(16,185,129,0.1),transparent_62%)]" />
        <motion.div
          className="absolute -top-28 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full border border-cyan-300/12"
          animate={{ rotate: 360, scale: [1, 1.03, 1] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-36 right-[8%] w-[420px] h-[420px] rounded-full bg-cyan-500/18 blur-3xl"
          animate={{ y: [0, -20, 0], x: [0, 12, 0], opacity: [0.28, 0.45, 0.28] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -top-28 left-[10%] w-[360px] h-[360px] rounded-full bg-emerald-500/14 blur-3xl"
          animate={{ y: [0, 18, 0], x: [0, -10, 0], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Disponibles para nuevos proyectos
            </div>

            <h2 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-none">
              Tu Proyecto<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">
                Comienza Hoy
              </span>
            </h2>

            <p className="text-xl text-slate-500 mb-16 max-w-2xl mx-auto leading-relaxed">
              Cotizacion personalizada en menos de 24 horas. Sin compromisos, sin letra pequena. Solo soluciones que funcionen para tu negocio.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-16">
              {[
                { label: "Cotizacion gratis", icon: <FaCheck /> },
                { label: "Respuesta en 24h", icon: <FaClock /> },
                { label: "Sin contratos forzados", icon: <FaCheck /> },
              ].map((item, i) => (
                <span key={i} className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                  <span className="text-emerald-500">{item.icon}</span> {item.label}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => openWhatsApp()}
                className="flex items-center gap-3 px-10 py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 transition-colors shadow-2xl shadow-emerald-600/20 text-sm uppercase tracking-widest">
                <FaWhatsapp className="text-lg" /> WhatsApp
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => window.location.assign("/asesoria")}
                className="flex items-center gap-3 px-10 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-colors shadow-2xl shadow-blue-600/20 text-sm uppercase tracking-widest">
                <FaCalendarCheck /> Reservar asesoria
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => window.location.assign("/servicios")}
                className="flex items-center gap-3 px-10 py-5 border border-white/15 text-white font-black rounded-2xl hover:bg-white/5 transition-colors text-sm uppercase tracking-widest">
                Ver Todos los Servicios <FaArrowRight />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}


