"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Banknote, BarChart3, Bike, Building2, Calculator, CircleDollarSign,
  CreditCard, Globe, Home, Landmark, Link2, Mail, MapPin, MessageCircle,
  Package, PhoneCall, Route, ShieldCheck, ShoppingBag, Store, Truck,
  UtensilsCrossed, Wallet, Wrench,
  type LucideIcon
} from "lucide-react";
import {
  FaClock, FaChevronRight, FaRegComments, FaShareAlt,
  FaRocket, FaCode, FaUserCircle,
  FaCalendarAlt, FaFire, FaEnvelopeOpenText
} from "react-icons/fa";
import "@/styles/blog-elite.scss";

// --- Types ---
interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  image: string;
  views: string;
  content?: string;
}

interface BackendBlogRecord {
  id: number;
  title: string;
  content: string;
  author?: string;
  category?: string;
  tags?: string;
  is_published?: boolean;
  created_at?: string;
}

interface BlogHeroTextConfig {
  badge_text: string;
  headline_prefix: string;
  headline_highlight: string;
  headline_suffix: string;
  description: string;
  cta_text: string;
  cta_url: string;
  read_time_text: string;
  card_kicker: string;
  card_title: string;
  card_description: string;
  card_tags: string;
  media_type: "image" | "video";
  background_image_url: string;
  background_video_url: string;
}

interface BlogHeroMediaSlide {
  id?: number;
  media_type: "image" | "video";
  background_image_url: string;
  background_video_url: string;
  is_active?: boolean;
  order_index?: number;
}

interface HeroLeadFormState {
  nombre: string;
  email: string;
  telefono: string;
  servicio: string;
  descripcion: string;
}

type HeroLeadStatus = "idle" | "sending" | "success" | "error";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const DEFAULT_HERO_TEXT_CONFIG: BlogHeroTextConfig = {
  badge_text: "Blog de estrategia tecnologica",
  headline_prefix: "Decisiones tecnicas",
  headline_highlight: "claras y seguras",
  headline_suffix: "para empresas que crecen",
  description: "En este blog compartimos casos reales, guias practicas y decisiones de arquitectura para crecer con tecnologia sin improvisar.",
  cta_text: "Solicitar diagnostico",
  cta_url: "/contacto",
  read_time_text: "Respuesta tecnica en menos de 24h",
  card_kicker: "Radar Tecnologico 2026",
  card_title: "3 tendencias que estan cambiando el desarrollo",
  card_description: "IA agentes, cloud eficiente y seguridad zero trust para productos reales.",
  card_tags: '["LLM OPS","CLOUD NATIVE","ZERO TRUST"]',
  media_type: "video",
  background_image_url: "",
  background_video_url: "",
};

const DEFAULT_HERO_MEDIA_SLIDE: BlogHeroMediaSlide = {
  media_type: "video",
  background_image_url: "",
  background_video_url: "",
};

const HERO_LEAD_SERVICE_OPTIONS = [
  "Diagnostico de arquitectura",
  "Desarrollo de plataforma web",
  "Automatizacion y analitica",
  "Integraciones y APIs",
  "Ciberseguridad y hardening",
];

const INITIAL_HERO_LEAD_FORM: HeroLeadFormState = {
  nombre: "",
  email: "",
  telefono: "",
  servicio: HERO_LEAD_SERVICE_OPTIONS[0],
  descripcion: "",
};

const normalizeHeroTextConfig = (payload: Partial<BlogHeroTextConfig> | null | undefined): BlogHeroTextConfig => {
  const raw = payload || {};
  const hasLegacyCopy =
    (raw.badge_text || "").trim() === "Articulo destacado" &&
    (raw.headline_prefix || "").trim() === "El Futuro del" &&
    (raw.headline_highlight || "").trim() === "Software Engineering" &&
    (raw.headline_suffix || "").trim() === "en la era de la IA" &&
    (raw.cta_text || "").trim() === "Leer Ahora";

  return {
    ...DEFAULT_HERO_TEXT_CONFIG,
    ...raw,
    media_type: raw.media_type === "image" ? "image" : "video",
    background_image_url: raw.background_image_url || DEFAULT_HERO_TEXT_CONFIG.background_image_url,
    background_video_url: raw.background_video_url || "",
    badge_text: hasLegacyCopy ? DEFAULT_HERO_TEXT_CONFIG.badge_text : (raw.badge_text || DEFAULT_HERO_TEXT_CONFIG.badge_text),
    headline_prefix: hasLegacyCopy ? DEFAULT_HERO_TEXT_CONFIG.headline_prefix : (raw.headline_prefix || DEFAULT_HERO_TEXT_CONFIG.headline_prefix),
    headline_highlight: hasLegacyCopy ? DEFAULT_HERO_TEXT_CONFIG.headline_highlight : (raw.headline_highlight || DEFAULT_HERO_TEXT_CONFIG.headline_highlight),
    headline_suffix: hasLegacyCopy ? DEFAULT_HERO_TEXT_CONFIG.headline_suffix : (raw.headline_suffix || DEFAULT_HERO_TEXT_CONFIG.headline_suffix),
    description: hasLegacyCopy ? DEFAULT_HERO_TEXT_CONFIG.description : (raw.description || DEFAULT_HERO_TEXT_CONFIG.description),
    cta_text: hasLegacyCopy ? DEFAULT_HERO_TEXT_CONFIG.cta_text : (raw.cta_text || DEFAULT_HERO_TEXT_CONFIG.cta_text),
    cta_url: hasLegacyCopy ? DEFAULT_HERO_TEXT_CONFIG.cta_url : (raw.cta_url || DEFAULT_HERO_TEXT_CONFIG.cta_url),
    read_time_text: hasLegacyCopy ? DEFAULT_HERO_TEXT_CONFIG.read_time_text : (raw.read_time_text || DEFAULT_HERO_TEXT_CONFIG.read_time_text),
    card_kicker: raw.card_kicker || DEFAULT_HERO_TEXT_CONFIG.card_kicker,
    card_title: raw.card_title || DEFAULT_HERO_TEXT_CONFIG.card_title,
    card_description: raw.card_description || DEFAULT_HERO_TEXT_CONFIG.card_description,
    card_tags: raw.card_tags || DEFAULT_HERO_TEXT_CONFIG.card_tags,
  };
};

const normalizeHeroMediaSlide = (payload: Partial<BlogHeroMediaSlide> | null | undefined): BlogHeroMediaSlide => {
  const raw = payload || {};
  return {
    ...DEFAULT_HERO_MEDIA_SLIDE,
    ...raw,
    media_type: raw.media_type === "image" ? "image" : "video",
    background_image_url: raw.background_image_url || DEFAULT_HERO_MEDIA_SLIDE.background_image_url,
    background_video_url: raw.background_video_url || "",
    is_active: typeof raw.is_active === "boolean" ? raw.is_active : true,
    order_index: Number(raw.order_index || 0),
  };
};

const BLOG_CATEGORY_IMAGE_FALLBACK: Record<string, string> = {
  reservas: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200",
  facturas: "https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=1200",
  seguridad: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200",
  ecommerce: "https://images.unsplash.com/photo-1556742049-02e45308b01e?auto=format&fit=crop&q=80&w=1200",
  industria: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200",
  estrategia: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
};

const BLOG_DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200";

const extractFirstImage = (content: string): string | null => {
  if (!content) return null;

  const htmlMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (htmlMatch?.[1]) return htmlMatch[1];

  const markdownMatch = content.match(/!\[[^\]]*]\((https?:\/\/[^)]+)\)/i);
  if (markdownMatch?.[1]) return markdownMatch[1];

  return null;
};

const stripMarkup = (content: string): string =>
  content
    .replace(/<[^>]+>/g, " ")
    .replace(/\[[^\]]*]\(([^)]+)\)/g, " ")
    .replace(/[^\S\r\n]+/g, " ")
    .trim();

const estimateReadTime = (content: string): string => {
  const plain = stripMarkup(content);
  const words = plain ? plain.split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.round(words / 190));
  return `${minutes} min`;
};

const formatPostDate = (iso?: string): string => {
  if (!iso) return "Reciente";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Reciente";
  return date
    .toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })
    .replace(".", "");
};

const resolveCategoryImage = (category?: string): string => {
  const normalized = (category || "").toLowerCase();
  if (normalized.includes("seguridad")) return BLOG_CATEGORY_IMAGE_FALLBACK.seguridad;
  if (normalized.includes("guia") || normalized.includes("factura")) return BLOG_CATEGORY_IMAGE_FALLBACK.facturas;
  if (normalized.includes("caso") || normalized.includes("reserva")) return BLOG_CATEGORY_IMAGE_FALLBACK.reservas;
  if (normalized.includes("industria")) return BLOG_CATEGORY_IMAGE_FALLBACK.industria;
  if (normalized.includes("estrategia")) return BLOG_CATEGORY_IMAGE_FALLBACK.estrategia;
  if (normalized.includes("ecommerce")) return BLOG_CATEGORY_IMAGE_FALLBACK.ecommerce;
  return BLOG_DEFAULT_IMAGE;
};

const mapBackendBlogToPost = (item: BackendBlogRecord): BlogPost => {
  const plainContent = stripMarkup(item.content || "");
  const excerpt = plainContent.length > 170 ? `${plainContent.slice(0, 169)}...` : plainContent;
  const resolvedImage = extractFirstImage(item.content || "") || resolveCategoryImage(item.category);
  const normalizedViews = `${(3 + ((item.id || 1) % 6) * 0.7).toFixed(1)}K`;

  return {
    id: item.id,
    title: item.title || "Articulo sin titulo",
    excerpt: excerpt || "Contenido tecnico y practico para apoyar decisiones reales de negocio.",
    date: formatPostDate(item.created_at),
    category: item.category || "General",
    readTime: estimateReadTime(item.content || ""),
    image: resolvedImage,
    views: normalizedViews,
    content: item.content || "",
  };
};

// --- Mock Data (Based on requested template) ---
// --- Mock Data (Clean fallback) ---
const MOCK_POSTS: BlogPost[] = [
  {
    id: 1,
    title: "Como un sistema de reservas aumento 200% las ventas de un hotel",
    excerpt: "Caso real de implementacion: reservas online, cobro automatizado y ocupacion en tiempo real.",
    date: "15 Ene 2024",
    category: "Casos de Exito",
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200",
    views: "4.0K",
    content: `
      <h3>Contexto del proyecto</h3>
      <p>El hotel tenia reservas manuales y bajo control operativo. Se implemento un motor de reservas web con pago integrado.</p>
      <h3>Resultado</h3>
      <p>En 6 meses se duplico la ocupacion, se redujeron errores de overbooking y el equipo admin ahorro varias horas por dia.</p>
    `,
  },
  {
    id: 2,
    title: "Guia completa: que sistema de facturacion conviene para una empresa en crecimiento",
    excerpt: "Comparativa clara entre facturacion manual, sistemas basicos y plataforma integrada.",
    date: "12 Ene 2024",
    category: "Guias Practicas",
    readTime: "8 min",
    image: "https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=1200",
    views: "5.1K",
    content: `
      <h3>Problema comun</h3>
      <p>Las empresas crecen mas rapido que su proceso administrativo. Eso genera errores de cobro y retrasos de caja.</p>
      <h3>Recomendacion</h3>
      <p>Centralizar facturacion, clientes y reportes en una sola plataforma para control real del negocio.</p>
    `,
  },
  {
    id: 3,
    title: "5 errores costosos en gestion de inventario y como evitarlos",
    excerpt: "Lecciones practicas para ecommerce y retail: stock, reposicion y trazabilidad.",
    date: "10 Ene 2024",
    category: "Tips y Consejos",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200",
    views: "6.0K",
    content: `
      <h3>Errores que se repiten</h3>
      <p>Falta de datos en tiempo real, reposicion tardia y compras sin criterio de demanda.</p>
      <h3>Que funciona</h3>
      <p>Alertas inteligentes, control por lotes y panel ejecutivo de movimiento de inventario.</p>
    `,
  },
  {
    id: 4,
    title: "Por que un restaurante necesita un POS moderno para escalar operaciones",
    excerpt: "Integracion con delivery, cocina, caja y reportes de margen en un solo flujo.",
    date: "8 Ene 2024",
    category: "Industria",
    readTime: "7 min",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200",
    views: "4.2K",
    content: `
      <h3>Operacion unificada</h3>
      <p>Un POS conectado reduce errores de pedido, acelera caja y permite decisiones diarias con datos reales.</p>
    `,
  },
  {
    id: 5,
    title: "Seguridad web para empresas: controles minimos para operar sin riesgo",
    excerpt: "Checklist tecnico para proteger datos, reputacion y continuidad del servicio.",
    date: "5 Ene 2024",
    category: "Seguridad",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200",
    views: "6.3K",
    content: `
      <h3>Base de seguridad</h3>
      <p>HTTPS estricto, backups verificables, control de accesos y monitoreo de eventos de seguridad.</p>
    `,
  },
  {
    id: 6,
    title: "Plataforma SaaS o desarrollo a medida: decision tecnica para directores",
    excerpt: "Comparativa de costos, tiempo de salida y flexibilidad segun etapa de negocio.",
    date: "2 Ene 2024",
    category: "Estrategia",
    readTime: "9 min",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
    views: "7.5K",
    content: `
      <h3>Decision correcta</h3>
      <p>No se trata de tecnologia favorita, se trata de riesgo, tiempo y retorno esperado del proyecto.</p>
    `,
  },
  {
    id: 7,
    title: "Automatizacion de cobranza: como mejorar flujo de caja sin aumentar equipo",
    excerpt: "Estrategias de recordatorios, estado de deuda y portal de pagos para clientes.",
    date: "1 Ene 2024",
    category: "Tips y Consejos",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1200",
    views: "3.2K",
    content: `
      <h3>Impacto directo</h3>
      <p>Automatizar cobranzas reduce mora y libera tiempo de operaciones para tareas de mayor valor.</p>
    `,
  },
  {
    id: 8,
    title: "Ecommerce profesional: que necesita una tienda para vender de forma estable",
    excerpt: "Arquitectura operativa: catalogo, pagos, logistica, soporte y analitica.",
    date: "28 Dic 2023",
    category: "Industria",
    readTime: "7 min",
    image: "https://images.unsplash.com/photo-1556742049-02e45308b01e?auto=format&fit=crop&q=80&w=1200",
    views: "4.8K",
    content: `
      <h3>Base operativa</h3>
      <p>La venta online sostenible depende de integracion entre inventario, despacho y experiencia del cliente.</p>
    `,
  },
];
// --- Integrations Data ---
type IntegrationTabKey = "Pasarelas" | "Logistica" | "Marketplaces" | "Herramientas";

interface IntegrationItem {
  name: string;
  icon: LucideIcon;
  desc: string;
  accent: string; // "R G B"
}

const INTEGRATION_TABS: Array<{ key: IntegrationTabKey; label: string; icon: LucideIcon }> = [
  { key: "Pasarelas", label: "Pasarelas", icon: CreditCard },
  { key: "Logistica", label: "Logistica", icon: Truck },
  { key: "Marketplaces", label: "Marketplaces", icon: ShoppingBag },
  { key: "Herramientas", label: "Herramientas", icon: Wrench },
];

const INTEGRATIONS_DATA: Record<IntegrationTabKey, IntegrationItem[]> = {
  Pasarelas: [
    { name: "Stripe", icon: CreditCard, desc: "Pagos online con tarjeta para distintos mercados.", accent: "34 211 238" },
    { name: "PayPal", icon: Wallet, desc: "Billetera digital y pagos recurrentes para clientes globales.", accent: "59 130 246" },
    { name: "Mercado Pago", icon: CircleDollarSign, desc: "Cobro local optimizado para Latinoamerica.", accent: "14 165 233" },
    { name: "Openpay", icon: ShieldCheck, desc: "Flujo de cobro seguro con validaciones antifraude.", accent: "245 158 11" },
    { name: "Conekta", icon: Landmark, desc: "Procesamiento de pagos orientado a negocio regional.", accent: "168 85 247" },
    { name: "2Checkout", icon: Banknote, desc: "Cobro internacional y soporte multimoneda.", accent: "244 114 182" },
  ],
  Logistica: [
    { name: "FedEx", icon: Truck, desc: "Envios internacionales con seguimiento operativo.", accent: "59 130 246" },
    { name: "DHL", icon: Package, desc: "Rastreo de envios y estados en tiempo real.", accent: "245 158 11" },
    { name: "Shipit", icon: Route, desc: "Orquestacion de entregas para ecommerce regional.", accent: "34 197 94" },
    { name: "Loggi", icon: Bike, desc: "Logistica urbana para despachos de ultima milla.", accent: "244 63 94" },
    { name: "Easypost", icon: Globe, desc: "Gestion multi-carrier con reglas de envio.", accent: "45 212 191" },
    { name: "Google Maps", icon: MapPin, desc: "Geolocalizacion, rutas y direccionamiento inteligente.", accent: "56 189 248" },
  ],
  Marketplaces: [
    { name: "Booking.com", icon: Building2, desc: "Sincronizacion de disponibilidad para reservas.", accent: "99 102 241" },
    { name: "Airbnb", icon: Home, desc: "Gestion centralizada de propiedades y calendario.", accent: "244 63 94" },
    { name: "Uber Eats", icon: UtensilsCrossed, desc: "Operacion conectada para restaurantes y delivery.", accent: "16 185 129" },
    { name: "Pedidos Ya", icon: Bike, desc: "Integracion de pedidos y estado de reparto.", accent: "236 72 153" },
    { name: "Amazon", icon: ShoppingBag, desc: "Publicacion y control de inventario omnicanal.", accent: "250 204 21" },
    { name: "eBay", icon: Store, desc: "Catalogo y stock sincronizado en un solo panel.", accent: "56 189 248" },
  ],
  Herramientas: [
    { name: "Google Analytics", icon: BarChart3, desc: "Analitica de conversion y comportamiento en sitio.", accent: "45 212 191" },
    { name: "Mailchimp", icon: Mail, desc: "Automatizacion de correos para embudos y nurturing.", accent: "14 165 233" },
    { name: "Slack", icon: MessageCircle, desc: "Alertas operativas para equipos de proyecto.", accent: "168 85 247" },
    { name: "Twilio", icon: PhoneCall, desc: "Notificaciones por SMS y canales de contacto.", accent: "34 197 94" },
    { name: "Zapier", icon: Route, desc: "Automatizacion de procesos entre sistemas.", accent: "249 115 22" },
    { name: "Contabilidad", icon: Calculator, desc: "Exportacion y conciliacion para control financiero.", accent: "59 130 246" },
  ],
};

const BLOG_INSIGHTS_STATS = [
  { icon: "", val: "120+", label: "Articulos Tecnicos", desc: "Publicados y actualizados" },
  { icon: "", val: "35K+", label: "Lecturas Anuales", desc: "Audiencia profesional" },
  { icon: "", val: "7.4 min", label: "Tiempo de Lectura", desc: "Promedio por articulo" },
  { icon: "", val: "82%", label: "Lectores Recurrentes", desc: "Vuelven por nuevo contenido" },
  { icon: "", val: "40+", label: "Casos Documentados", desc: "Escenarios reales de negocio" },
  { icon: "24h", val: "24h", label: "Respuesta Tecnica", desc: "A consultas prioritarias" },
];

const BLOG_INSIGHTS_PILLARS = [
  { title: "Publicacion semanal", desc: "Contenido tecnico accionable sin relleno." },
  { title: "Fuentes verificadas", desc: "Buenas practicas y arquitectura aplicable." },
  { title: "Enfoque en negocio", desc: "Tecnologia alineada a conversion y escalabilidad." },
  { title: "Asesoria directa", desc: "Recomendaciones claras para tomar decisiones." },
];

export default function BlogPage() {
  const router = useRouter();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>(MOCK_POSTS);
  const [heroTextConfig, setHeroTextConfig] = useState<BlogHeroTextConfig>(DEFAULT_HERO_TEXT_CONFIG);
  const [heroSlides, setHeroSlides] = useState<BlogHeroMediaSlide[]>([]);
  const [activeHeroSlideIndex, setActiveHeroSlideIndex] = useState(0);
  const [isHeroLeadModalOpen, setIsHeroLeadModalOpen] = useState(false);
  const [heroLeadForm, setHeroLeadForm] = useState<HeroLeadFormState>(INITIAL_HERO_LEAD_FORM);
  const [heroLeadStatus, setHeroLeadStatus] = useState<HeroLeadStatus>("idle");
  const [heroLeadError, setHeroLeadError] = useState("");
  const [activeTab, setActiveTab] = useState<IntegrationTabKey>("Pasarelas");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    const loadHeroData = async () => {
      try {
        const [textResponse, slidesResponse] = await Promise.all([
          fetch(`${BACKEND_URL}/api/blog/hero`),
          fetch(`${BACKEND_URL}/api/blog/hero/slides`),
        ]);

        if (textResponse.ok) {
          const textData = await textResponse.json();
          if (isMounted) setHeroTextConfig(normalizeHeroTextConfig(textData));
        }

        if (slidesResponse.ok) {
          const slidesData = await slidesResponse.json();
          const normalizedSlides = Array.isArray(slidesData)
            ? slidesData
                .map((item: Partial<BlogHeroMediaSlide>) => normalizeHeroMediaSlide(item))
                .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
            : [];

          if (isMounted) {
            setHeroSlides(normalizedSlides);
            setActiveHeroSlideIndex(0);
          }
        }
      } catch (error) {
        console.error("Error loading blog hero data", error);
      }
    };

    void loadHeroData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadBlogCards = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/blog/`);
        if (!response.ok) return;

        const payload = await response.json();
        if (!Array.isArray(payload) || payload.length === 0) return;

        const mapped = payload
          .map((item: BackendBlogRecord) => item)
          .filter((item) => item?.id && item?.title && item?.content && item?.is_published !== false)
          .map(mapBackendBlogToPost);

        if (isMounted && mapped.length > 0) {
          setPosts(mapped);
          setCurrentPage(1);
        }
      } catch (error) {
        console.error("Error loading blog cards", error);
      }
    };

    void loadBlogCards();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (heroSlides.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveHeroSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 7000);

    return () => window.clearInterval(interval);
  }, [heroSlides.length]);

  useEffect(() => {
    if (!isHeroLeadModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsHeroLeadModalOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isHeroLeadModalOpen]);

  const currentHeroSlide = heroSlides[activeHeroSlideIndex] || null;
  const showHeroVideo = !!currentHeroSlide && currentHeroSlide.media_type === "video" && currentHeroSlide.background_video_url.trim().length > 0;
  const showHeroImage = !!currentHeroSlide && currentHeroSlide.background_image_url.trim().length > 0;

  const openHeroLeadModal = () => {
    setHeroLeadStatus("idle");
    setHeroLeadError("");
    setIsHeroLeadModalOpen(true);
  };

  const closeHeroLeadModal = () => {
    setIsHeroLeadModalOpen(false);
  };

  const handleHeroLeadInput = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setHeroLeadForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleHeroLeadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHeroLeadStatus("sending");
    setHeroLeadError("");

    try {
      const response = await fetch("/api/enviar-cotizacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: heroLeadForm.nombre.trim(),
          email: heroLeadForm.email.trim(),
          telefono: heroLeadForm.telefono.trim(),
          servicio: heroLeadForm.servicio,
          descripcion: `[Origen: Blog Hero]\\n${heroLeadForm.descripcion.trim()}`,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const detail = typeof payload?.error === "string" ? payload.error : "No se pudo enviar la solicitud.";
        throw new Error(detail);
      }

      setHeroLeadStatus("success");
      setHeroLeadForm(INITIAL_HERO_LEAD_FORM);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo enviar la solicitud.";
      setHeroLeadError(message);
      setHeroLeadStatus("error");
    }
  };

  const goToBlogArticles = () => {
    const target = document.getElementById("blog-articles");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    window.scrollTo({ top: 1200, behavior: "smooth" });
  };

  const postsPerPage = 6; // Ajustado para mejor visualizacin
  const categoryOptions = ["Todos", ...Array.from(new Set(posts.map((post) => post.category).filter(Boolean)))];

  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === "Todos" || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  useEffect(() => {
    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
      return;
    }
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  return (
    <div className="blog-page-wrapper">
      {/* 1. HERO SECTION - FEATURED ARTICLE */}
      <section className="hero-gradient py-32 lg:py-40 min-h-[78vh] relative overflow-hidden">
        {showHeroVideo ? (
          <video
            className="hero-bg-media"
            src={currentHeroSlide!.background_video_url}
            poster={showHeroImage ? currentHeroSlide!.background_image_url : undefined}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : showHeroImage ? (
          <Image
            src={currentHeroSlide!.background_image_url}
            alt="Blog hero background"
            fill
            priority
            unoptimized
            className="hero-bg-media"
          />
        ) : null}
        <div className="hero-bg-overlay" />

        <div className="blog-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full min-h-[58vh] flex items-center"
          >
            <div className="hero-copy hero-copy--ordered max-w-4xl">
              <span className="hero-badge">
                {heroTextConfig.badge_text}
              </span>
              <h1 className="hero-title">
                {heroTextConfig.headline_prefix}{" "}
                <span className="gradient-text">{heroTextConfig.headline_highlight}</span>{" "}
                {heroTextConfig.headline_suffix}
              </h1>
              <p className="hero-description text-lg md:text-xl mb-10 leading-relaxed max-w-3xl">
                {heroTextConfig.description}
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <button
                  type="button"
                  onClick={openHeroLeadModal}
                  className="cta-button hero-primary-cta px-10 py-4 rounded-2xl text-white font-bold flex items-center gap-3"
                >
                  {heroTextConfig.cta_text} <FaChevronRight className="text-xs" />
                </button>
                <Link
                  href={heroTextConfig.cta_url || "/contacto"}
                  className="px-6 py-3 rounded-2xl border border-cyan-300/75 bg-slate-950/80 text-cyan-300 font-semibold text-sm shadow-[0_8px_25px_rgba(2,6,23,0.5)] backdrop-blur-md hover:border-cyan-200 hover:text-cyan-200 hover:bg-slate-900/90 transition-all"
                >
                  Ver mas contenido
                </Link>
                <div className="flex items-center gap-3 text-amber-300 text-sm font-semibold drop-shadow-[0_2px_8px_rgba(2,6,23,0.6)]">
                  <FaClock /> {heroTextConfig.read_time_text}
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 text-[11px] font-semibold uppercase tracking-[0.15em]">
                {["Diagnostico inicial sin costo", "Respuesta en 24h", "Arquitectura segura para escalar"].map((item) => (
                  <span
                    key={item}
                    className="px-4 py-2 rounded-xl border border-amber-300/80 bg-slate-950/84 text-amber-300 shadow-[0_6px_20px_rgba(2,6,23,0.45)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. BLOG INSIGHTS SECTION */}
      <section className="blog-insights-section py-32 relative overflow-hidden border-y border-white/5">
        <div className="blog-container">
          <div className="text-center mb-16">
            <span className="insights-kicker inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6">
              Blog Intelligence
            </span>
            <h2 className="insights-title text-4xl lg:text-6xl font-black mb-5">Insights que Impulsan Decisiones de Negocio</h2>
            <p className="insights-subtitle text-lg max-w-3xl mx-auto">
              Este bloque resume el valor real del blog: contenido tecnico, casos aplicables y acompanamiento para decisiones de tecnologia con menor riesgo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-7 mb-16">
            {BLOG_INSIGHTS_STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="insight-stat-card p-7 rounded-[1.8rem] text-center group"
              >
                <div className="insight-icon text-4xl mb-5">{stat.icon}</div>
                <div className="insight-value text-3xl font-extrabold mb-2 tracking-tight">{stat.val}</div>
                <div className="insight-label text-sm font-bold mb-2 uppercase tracking-wide">{stat.label}</div>
                <p className="insight-desc text-xs font-semibold leading-relaxed">{stat.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="insights-pillars-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-10 rounded-[2.2rem]">
            {BLOG_INSIGHTS_PILLARS.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.35, delay: 0.1 + i * 0.05 }}
                className="insight-pillar-item flex gap-3 items-start"
              >
                <span className="insight-check mt-1 w-5 h-5 rounded-md text-[11px] font-black flex items-center justify-center">
                  
                </span>
                <div>
                  <h4 className="insight-pillar-title font-bold text-sm mb-1 capitalize">{item.title}</h4>
                  <p className="insight-pillar-desc text-xs leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. INTEGRATIONS SECTION (Tabs) */}
      <section className="integrations-section py-32 bg-slate-950">
        <div className="blog-container">
          <div className="text-center mb-16">
            <span className="integrations-kicker inline-flex items-center px-4 py-2 rounded-full mb-6">
              Casos y guias de integracion
            </span>
            <h2 className="integrations-title text-4xl lg:text-5xl font-black mb-6 uppercase tracking-tight flex items-center justify-center gap-3">
              <Link2 size={34} />
              Integraciones reales para proyectos de agencia
            </h2>
            <p className="integrations-subtitle text-lg max-w-3xl mx-auto">
              Estas plataformas se usan en proyectos reales con clientes. En el blog explicamos como integrarlas paso a paso.
            </p>
          </div>

          <div className="integration-tabs flex flex-wrap justify-center gap-4 mb-16 border-b border-white/5 pb-8">
            {INTEGRATION_TABS.map((tabMeta) => {
              const TabIcon = tabMeta.icon;
              const isActive = activeTab === tabMeta.key;
              return (
                <button
                  key={tabMeta.key}
                  onClick={() => setActiveTab(tabMeta.key)}
                  className={`integration-tab px-8 py-3 rounded-xl font-bold text-sm transition-all border ${isActive ? "is-active" : ""}`}
                >
                  <TabIcon size={15} />
                  <span>{tabMeta.label}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="integration-cards-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {(INTEGRATIONS_DATA[activeTab] || []).map((item) => {
                const ItemIcon = item.icon;
                return (
                  <article
                    key={item.name}
                    className="integration-card p-10 rounded-[2.5rem] group"
                    style={{ "--integration-accent": item.accent } as CSSProperties}
                  >
                    <div className="flex items-center gap-6 mb-8">
                      <div className="integration-icon-shell w-16 h-16 rounded-2xl flex items-center justify-center">
                        <ItemIcon size={28} strokeWidth={2.25} />
                      </div>
                      <div>
                        <h3 className="integration-name text-xl font-bold">{item.name}</h3>
                        <span className="integration-badge text-[10px] font-bold uppercase tracking-widest mt-1 block">Guia en el blog</span>
                      </div>
                    </div>
                    <p className="integration-desc text-sm leading-relaxed">{item.desc}</p>
                  </article>
                );
              })}
            </motion.div>
          </AnimatePresence>

          <div className="integration-cta-box mt-24 p-12 rounded-[3rem] text-center">
            <h3 className="text-3xl font-black mb-4 uppercase tracking-tight">Buscas una integracion especifica?</h3>
            <p className="text-slate-300 mb-10 max-w-2xl mx-auto">
              Revisa las guias del blog y, si necesitas apoyo tecnico para tu caso, agenda asesoria con nuestro equipo.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={goToBlogArticles}
                className="cta-button integration-cta-primary px-10 py-4 rounded-2xl text-white font-bold text-base transition-all hover:-translate-y-1"
              >
                Ver guias de integracion
              </button>
              <button
                onClick={openHeroLeadModal}
                className="integration-cta-secondary px-10 py-4 rounded-2xl font-bold text-base transition-all"
              >
                Solicitar asesoria tecnica
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* 4. MAIN CONTENT (GRID + SIDEBAR) */}
      <section id="blog-articles" className="py-32 bg-slate-950">
        <div className="blog-container">
          <div className="flex flex-col lg:flex-row gap-16">

            {/* MAIN ARTICLES GRID */}
            <main className="lg:w-2/3">
              <div className="blog-header mb-12">
                <h1 className="blog-main-title text-4xl lg:text-6xl font-black mb-6">Blog de Sistemas Web</h1>
                <p className="blog-main-subtitle text-slate-300">
                  Guias, casos reales y decisiones tecnicas para transformar operaciones digitales.
                </p>
              </div>

              {/* Categorias (Filtros) */}
              <div className="flex flex-wrap gap-3 mb-12">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                    className={`blog-filter-chip px-6 py-2 rounded-xl text-xs font-bold border transition-all ${
                      activeCategory === cat ? "is-active" : ""
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <AnimatePresence mode="popLayout">
                  {paginatedPosts.map((post, idx) => (
                    <motion.div
                      layout
                      key={post.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                      className="square-card group cursor-pointer"
                      onClick={() => router.push(`/blog/${post.id}`)}
                    >
                      <div className="square-image">
                        <Image src={post.image} alt={post.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                        <span className="blog-card-category absolute top-6 right-6 px-4 py-1.5 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest">
                          {post.category}
                        </span>
                      </div>
                      <div className="square-content">
                        <div>
                          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-bold mb-4 uppercase tracking-widest">
                            <FaCalendarAlt className="text-blue-500" /> {post.date}
                          </div>
                          <h3 className="blog-card-title text-2xl font-bold mb-4 group-hover:text-blue-300 transition-colors leading-tight">
                            {post.title}
                          </h3>
                          <p className="blog-card-excerpt text-slate-300 text-sm line-clamp-3 leading-relaxed">
                            {post.excerpt}
                          </p>
                        </div>
                        <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                          <Link
                            href={`/blog/${post.id}`}
                            onClick={(event) => event.stopPropagation()}
                            className="blog-read-btn text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all"
                          >
                            Seguir leyendo <FaChevronRight className="text-[10px]" />
                          </Link>
                          <div className="flex items-center gap-4 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                            <div className="flex items-center gap-1.5">
                              <FaClock className="text-blue-500/50" /> {post.readTime}
                            </div>
                            <span className="w-1 h-1 rounded-full bg-slate-800" />
                            <div className="flex items-center gap-1.5">
                              <FaFire className="text-orange-600/50" /> {post.views} Vistas
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* No Results */}
              {filteredPosts.length === 0 && (
                <div className="text-center py-40 border-2 border-dashed border-white/5 rounded-[4rem]">
                  <FaRocket className="text-6xl text-slate-700 mx-auto mb-8 animate-bounce" />
                  <h3 className="text-3xl font-bold text-slate-400">Sin resultados encontrados</h3>
                  <p className="text-slate-500 mt-4">Intenta ajustar tus parametros de busqueda.</p>
                </div>
              )}

              {/* Paginacion */}
              {totalPages > 1 && (
                <div className="mt-16 flex justify-center gap-4">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 800, behavior: 'smooth' }); }}
                      className={`w-12 h-12 rounded-xl font-bold transition-all border ${currentPage === i + 1
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-white/5 border-white/10 text-slate-400 hover:border-blue-500/30"
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </main>

            {/* SIDEBAR */}
            <aside className="lg:w-1/3 space-y-12">
              {/* Busqueda */}
              <div className="article-card blog-sidebar-card p-8 rounded-[2.5rem]">
                <h3 className="blog-sidebar-title text-xl font-bold mb-6 flex items-center gap-3">
                  Buscar articulos
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Escribe para buscar..."
                    className="search-input blog-search-input w-full px-6 py-4 rounded-2xl text-white"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  />
                </div>
              </div>

              {/* Mini Stats Sidebar */}
              <div className="article-card blog-sidebar-card p-8 rounded-[2.5rem]">
                <h3 className="blog-sidebar-title text-xl font-bold mb-8">Estadisticas</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { val: "12", label: "Articulos" },
                    { val: "45K+", label: "Lecturas" },
                    { val: "1.2K+", label: "Comentarios" },
                    { val: "500+", label: "Seguidores" }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                      <div className="text-xl font-bold text-blue-400">{stat.val}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Ahora (Integrated from requested image) */}
              <div className="article-card blog-sidebar-card p-8 rounded-[2.5rem] border border-white/5">
                <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-6">
                  <FaFire className="text-xl text-amber-400" />
                  <h3 className="blog-sidebar-title text-xl font-bold text-white">Tendencias del blog</h3>
                </div>

                <div className="space-y-8">
                  {[...posts]
                    .sort((a, b) => parseFloat(b.views) - parseFloat(a.views))
                    .slice(0, 5)
                    .map((art, idx) => (
                      <Link
                        key={`${art.id}-${idx}`}
                        href={`/blog/${art.id}`}
                        className="flex gap-6 group cursor-pointer border-b border-white/5 pb-6 last:border-0 last:pb-0"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-blue-400 text-sm font-bold shrink-0 group-hover:bg-blue-600/20 transition-colors">
                          {idx < 9 ? `0${idx + 1}` : idx + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                            {art.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold mt-2 lowercase">
                            <FaFire className="text-orange-600" /> {art.views} vistas
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>

              {/* Newsletter Sidebar */}
              <div className="article-card p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/30">
                <FaEnvelopeOpenText className="text-4xl text-blue-400 mb-6" />
                <h3 className="text-2xl font-bold mb-4 italic">Newsletter</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  Recibe los mejores tips sobre sistemas web cada semana.
                </p>
                <div className="space-y-4">
                  <input type="email" placeholder="tu@email.com" className="search-input w-full px-6 py-4 rounded-2xl text-sm" />
                  <button className="cta-button w-full py-4 rounded-2xl text-white font-bold">Suscribirme</button>
                </div>
              </div>

              {/* Etiquetas Populares */}
              <div className="article-card p-8 rounded-[2.5rem]">
                <h3 className="text-xl font-bold mb-8 italic"> Etiquetas</h3>
                <div className="flex flex-wrap gap-2">
                  {['Reservas', 'Facturas', 'Inventarios', 'POS', 'Seguridad', 'E-commerce', 'API', 'Soporte', 'Datos'].map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-slate-400 hover:border-blue-500/50 cursor-pointer transition-all">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA Soluciones */}
              <div className="article-card p-8 rounded-[2.5rem] border-blue-500/50 bg-blue-900/10">
                <h3 className="text-xl font-bold mb-4 text-blue-400 italic"> Necesitas Soluciones?</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Tenemos la solucin perfecta para tu negocio. Consulta sin costo.
                </p>
                <button className="cta-button w-full py-4 rounded-2xl text-white font-bold mb-4">Solicitar Demo</button>
                <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-blue-400 font-bold text-sm">Ver Catlogo</button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* 5. COMMENTS SECTION */}
      <section className="py-32 bg-slate-950">
        <div className="blog-container max-w-4xl">
          <div className="flex items-center gap-4 mb-16">
            <FaRegComments className="text-4xl text-blue-500" />
            <h2 className="text-4xl font-bold">Conversacin (24)</h2>
          </div>

          <div className="space-y-12 mb-20">
            {/* Comment 1 */}
            <div className="article-card p-10 rounded-[3rem]">
              <div className="flex gap-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <FaUserCircle className="text-4xl" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold">Marcos Tech</h4>
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Hace 2 horas</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed mb-6">
                    Excelente artculo sobre Next.js. Podras profundizar en el uso masivo de Partial Prerendering en aplicaciones E-commerce?
                  </p>
                  <div className="flex gap-6 text-xs font-bold uppercase tracking-widest">
                    <button className="text-blue-400 hover:text-white">Responder</button>
                    <button className="text-slate-500 hover:text-white">Reportar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comment Form */}
          <div className="article-card p-12 rounded-[3.5rem] border-blue-500/20 bg-slate-900/40">
            <h3 className="text-2xl font-bold mb-8">Deja tu opinin tcnica</h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="Nombre completo" className="search-input w-full px-8 py-5 rounded-2xl shadow-inner" />
                <input type="email" placeholder="Email corporativo" className="search-input w-full px-8 py-5 rounded-2xl shadow-inner" />
              </div>
              <textarea placeholder="Tu comentario o pregunta tcnica..." rows={5} className="search-input w-full px-8 py-6 rounded-3xl resize-none shadow-inner"></textarea>
              <button className="cta-button px-12 py-5 rounded-2xl text-white font-bold flex items-center gap-3">
                Publicar Comentario <FaRocket />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 6. NEWSLETTER BOTTOM */}
      <section className="py-40 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.1),transparent_50%100%)]" />
        <div className="blog-container text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <span className="w-20 h-20 bg-blue-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-blue-500/30">
              <FaEnvelopeOpenText className="text-4xl text-blue-400" />
            </span>
            <h2 className="text-5xl lg:text-7xl font-bold mb-8 italic">No te pierdas de nada</h2>
            <p className="text-slate-400 text-xl mb-16 leading-relaxed">
              Recibe las ltimas tendencias en ingeniera directamente en tu inbox. <br /> Sin spam, solo contenido elite.
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center max-w-2xl mx-auto">
              <input type="email" placeholder="Introduce tu email" className="search-input flex-1 px-10 py-5 rounded-2xl text-lg backdrop-blur-xl" />
              <button className="cta-button px-12 py-5 rounded-2xl text-white font-bold text-lg whitespace-nowrap">
                Unirme Ahora
              </button>
            </div>
            <p className="text-slate-500 text-xs mt-10 font-medium italic">
              * Al suscribirte, aceptas nuestra poltica de privacidad y trminos de servicio.
            </p>
          </div>
        </div>
      </section>

      {/* 7. MODAL HERO CTA */}
      <AnimatePresence>
        {isHeroLeadModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              className="lead-modal-card w-full max-w-3xl rounded-[2rem] border border-blue-400/25 bg-slate-950/95 shadow-[0_30px_90px_rgba(2,6,23,0.75)] p-6 md:p-10 relative"
            >
              <button
                onClick={closeHeroLeadModal}
                className="absolute right-5 top-5 w-10 h-10 rounded-full border border-white/20 bg-white/5 text-slate-200 hover:bg-white/10 transition-colors"
                aria-label="Cerrar formulario"
              >
                
              </button>

              <div className="lead-offer-badge mb-5">
                <span className="lead-offer-dot" />
                <span>Anuncio para empresas que quieren escalar con seguridad</span>
                <span className="lead-offer-tag">Cupos limitados del mes</span>
              </div>
              <h3 className="lead-marketing-title text-3xl md:text-5xl font-black leading-tight mb-4">
                Convierte tu idea en una
                {" "}
                <span className="gradient-text lead-glow-text">solucion rentable y segura</span>
              </h3>
              <p className="lead-marketing-copy mb-6 text-base md:text-lg leading-relaxed">
                Recibe una recomendacion tecnica real, con prioridades claras y plan de ejecucion para tu web, app o plataforma.
              </p>
              <div className="lead-proof-list mb-8">
                {["Diagnostico inicial sin costo", "Roadmap tecnico en 24h", "Enfoque en resultados de negocio"].map((item) => (
                  <span key={item} className="lead-proof-item">
                    {item}
                  </span>
                ))}
              </div>

              <form onSubmit={handleHeroLeadSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    name="nombre"
                    value={heroLeadForm.nombre}
                    onChange={handleHeroLeadInput}
                    required
                    placeholder="Nombre y apellido"
                    className="search-input w-full px-5 py-4 rounded-2xl text-sm text-white"
                  />
                  <input
                    name="email"
                    type="email"
                    value={heroLeadForm.email}
                    onChange={handleHeroLeadInput}
                    required
                    placeholder="Email corporativo"
                    className="search-input w-full px-5 py-4 rounded-2xl text-sm text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    name="telefono"
                    value={heroLeadForm.telefono}
                    onChange={handleHeroLeadInput}
                    required
                    placeholder="Telefono / WhatsApp"
                    className="search-input w-full px-5 py-4 rounded-2xl text-sm text-white"
                  />
                  <select
                    name="servicio"
                    value={heroLeadForm.servicio}
                    onChange={handleHeroLeadInput}
                    className="search-input w-full px-5 py-4 rounded-2xl text-sm text-white"
                  >
                    {HERO_LEAD_SERVICE_OPTIONS.map((option) => (
                      <option key={option} value={option} className="bg-slate-900 text-white">
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  name="descripcion"
                  value={heroLeadForm.descripcion}
                  onChange={handleHeroLeadInput}
                  placeholder="Describe tu objetivo: problema principal, plazo y alcance estimado."
                  rows={4}
                  className="search-input w-full px-5 py-4 rounded-2xl text-sm text-white resize-none"
                />

                {heroLeadStatus === "error" && (
                  <div className="rounded-xl border border-red-400/35 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {heroLeadError || "Ocurrio un error al enviar la solicitud."}
                  </div>
                )}

                {heroLeadStatus === "success" && (
                  <div className="rounded-xl border border-emerald-400/35 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    Solicitud enviada. Te contactaremos en menos de 24 horas.
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeHeroLeadModal}
                    className="px-6 py-3 rounded-xl border border-white/20 bg-white/5 text-slate-200 font-semibold hover:bg-white/10 transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    disabled={heroLeadStatus === "sending"}
                    className="cta-button hero-primary-cta px-8 py-3 rounded-xl text-white font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {heroLeadStatus === "sending" ? "Enviando..." : "Enviar solicitud"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. MODAL (Dynamic Content Viewer) */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-20 bg-slate-950/90 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ y: 100, scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 100, scale: 0.9 }}
              className="bg-slate-900 w-full max-w-6xl h-full rounded-[4rem] overflow-hidden border border-white/10 shadow-4xl flex flex-col lg:flex-row relative"
            >
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-10 right-10 z-50 w-14 h-14 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center border border-white/10 transition-colors"
              >
                <span className="text-3xl">&times;</span>
              </button>

              <div className="lg:w-1/2 relative h-64 lg:h-auto">
                <Image src={selectedPost.image} alt={selectedPost.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
              </div>

              <div className="lg:w-1/2 p-12 lg:p-24 overflow-y-auto">
                <span className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-6 block">{selectedPost.category}</span>
                <h2 className="text-4xl lg:text-6xl font-bold mb-10 leading-tight">{selectedPost.title}</h2>
                <div className="flex items-center gap-8 text-slate-500 text-xs font-bold uppercase tracking-widest mb-16 border-b border-white/5 pb-10">
                  <span className="flex items-center gap-2"><FaCalendarAlt /> {selectedPost.date}</span>
                  <span className="flex items-center gap-2"><FaClock /> {selectedPost.readTime}</span>
                </div>
                <div className="text-slate-300 text-lg leading-relaxed space-y-8">
                  {selectedPost.content ? (
                    <div
                      className="blog-content-rich"
                      dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                    />
                  ) : (
                    <>
                      <p className="font-medium italic">{selectedPost.excerpt}</p>
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      </p>
                      <div className="p-10 bg-slate-950 rounded-3xl border border-white/5">
                        <h4 className="text-white font-bold mb-4 flex items-center gap-3"><FaCode className="text-blue-500" /> Key Takeaway</h4>
                        <p className="text-slate-400 text-sm">
                          La clave para una infraestructura resiliente no es evitar el fallo, sino disear sistemas que puedan recuperarse automticamente sin intervencin humana.
                        </p>
                      </div>
                      <p>
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                      </p>
                    </>
                  )}
                </div>

                <div className="mt-20 pt-16 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FaUserCircle className="text-4xl text-slate-600" />
                    <div>
                      <div className="text-white font-bold">Favio Jimnez</div>
                      <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Autor Principal</div>
                    </div>
                  </div>
                  <button className="p-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 transition-colors">
                    <FaShareAlt />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



