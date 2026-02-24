"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  FaClock, FaChevronRight, FaRegComments,
  FaRocket, FaUserCircle,
  FaCalendarAlt, FaEnvelopeOpenText, FaStar
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
type NewsletterStatus = "idle" | "sending" | "success" | "error";
type BlogPostsLoadStatus = "loading" | "ready" | "empty" | "error";
type BlogPostsSource = "backend" | "fallback-empty" | "fallback-error";
const ENABLE_PUBLIC_BLOG_COMMENTS = process.env.NEXT_PUBLIC_ENABLE_BLOG_COMMENTS === "true";

interface BlogCommentItem {
  id: number | string;
  author_name: string;
  author_role?: string | null;
  author_company?: string | null;
  content: string;
  rating: number;
  created_at?: string | null;
  status?: string | null;
}

interface BlogCommentFormState {
  author_name: string;
  author_email: string;
  content: string;
  rating: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const DEFAULT_HERO_TEXT_CONFIG: BlogHeroTextConfig = {
  badge_text: "Blog tecnico para negocios digitales",
  headline_prefix: "Estrategia, arquitectura y",
  headline_highlight: "ejecucion real",
  headline_suffix: "para escalar tu producto web",
  description: "Publicamos casos reales, guias accionables y decisiones tecnicas aplicadas a proyectos de reservas, ecommerce y servicios web.",
  cta_text: "Agendar diagnostico",
  cta_url: "/contacto",
  read_time_text: "Respuesta tecnica en menos de 24 horas",
  card_kicker: "Hoja de ruta recomendada",
  card_title: "Prioridades tecnicas para crecer sin friccion",
  card_description: "Arquitectura modular, automatizacion y seguridad operativa para equipos en crecimiento.",
  card_tags: '["ARQUITECTURA","AUTOMATIZACION","SEGURIDAD"]',
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

const INITIAL_BLOG_COMMENT_FORM: BlogCommentFormState = {
  author_name: "",
  author_email: "",
  content: "",
  rating: 5,
};

const normalizeHeroTextConfig = (payload: Partial<BlogHeroTextConfig> | null | undefined): BlogHeroTextConfig => {
  const raw = payload || {};
  const hasLegacyCopy =
    (raw.badge_text || "").trim() === "Articulo destacado" &&
    (raw.headline_prefix || "").trim() === "El Futuro del" &&
    (raw.headline_highlight || "").trim() === "Software Engineering" &&
    (raw.headline_suffix || "").trim() === "en la era de la IA" &&
    (raw.cta_text || "").trim() === "Leer Ahora";

  const hasPreviousDefaultCopy =
    (raw.badge_text || "").trim() === "Blog de estrategia tecnologica" &&
    (raw.headline_prefix || "").trim() === "Decisiones tecnicas" &&
    (raw.headline_highlight || "").trim() === "claras y seguras" &&
    (raw.headline_suffix || "").trim() === "para empresas que crecen" &&
    (raw.description || "").trim() === "En este blog compartimos casos reales, guias practicas y decisiones de arquitectura para crecer con tecnologia sin improvisar." &&
    (raw.cta_text || "").trim() === "Solicitar diagnostico" &&
    (raw.read_time_text || "").trim() === "Respuesta tecnica en menos de 24h";

  const shouldResetCopyToDefault = hasLegacyCopy || hasPreviousDefaultCopy;

  return {
    ...DEFAULT_HERO_TEXT_CONFIG,
    ...raw,
    media_type: raw.media_type === "image" ? "image" : "video",
    background_image_url: raw.background_image_url || DEFAULT_HERO_TEXT_CONFIG.background_image_url,
    background_video_url: raw.background_video_url || "",
    badge_text: shouldResetCopyToDefault ? DEFAULT_HERO_TEXT_CONFIG.badge_text : (raw.badge_text || DEFAULT_HERO_TEXT_CONFIG.badge_text),
    headline_prefix: shouldResetCopyToDefault ? DEFAULT_HERO_TEXT_CONFIG.headline_prefix : (raw.headline_prefix || DEFAULT_HERO_TEXT_CONFIG.headline_prefix),
    headline_highlight: shouldResetCopyToDefault ? DEFAULT_HERO_TEXT_CONFIG.headline_highlight : (raw.headline_highlight || DEFAULT_HERO_TEXT_CONFIG.headline_highlight),
    headline_suffix: shouldResetCopyToDefault ? DEFAULT_HERO_TEXT_CONFIG.headline_suffix : (raw.headline_suffix || DEFAULT_HERO_TEXT_CONFIG.headline_suffix),
    description: shouldResetCopyToDefault ? DEFAULT_HERO_TEXT_CONFIG.description : (raw.description || DEFAULT_HERO_TEXT_CONFIG.description),
    cta_text: shouldResetCopyToDefault ? DEFAULT_HERO_TEXT_CONFIG.cta_text : (raw.cta_text || DEFAULT_HERO_TEXT_CONFIG.cta_text),
    cta_url: shouldResetCopyToDefault ? DEFAULT_HERO_TEXT_CONFIG.cta_url : (raw.cta_url || DEFAULT_HERO_TEXT_CONFIG.cta_url),
    read_time_text: shouldResetCopyToDefault ? DEFAULT_HERO_TEXT_CONFIG.read_time_text : (raw.read_time_text || DEFAULT_HERO_TEXT_CONFIG.read_time_text),
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
    .toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" })
    .replace(".", "");
};

const formatBlogCommentDate = (iso?: string | null): string => {
  if (!iso) return "Reciente";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Reciente";

  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Hace unos minutos";
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours === 1 ? "" : "s"}`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays <= 7) return `Hace ${diffDays} dia${diffDays === 1 ? "" : "s"}`;
  return formatPostDate(iso);
};

const normalizeBlogComment = (item: Partial<BlogCommentItem>): BlogCommentItem => {
  const authorName = String(item.author_name || "").trim() || "Invitado";
  const content = String(item.content || "").trim();
  const rating = Math.max(1, Math.min(5, Number(item.rating || 5)));
  return {
    id: item.id ?? `${authorName}-${content.slice(0, 8)}`,
    author_name: authorName,
    author_role: item.author_role || null,
    author_company: item.author_company || null,
    content,
    rating,
    created_at: item.created_at || null,
    status: item.status || null,
  };
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

  return {
    id: item.id,
    title: item.title || "Articulo sin titulo",
    excerpt: excerpt || "Contenido tecnico y practico para apoyar decisiones reales de negocio.",
    date: formatPostDate(item.created_at),
    category: item.category || "General",
    readTime: estimateReadTime(item.content || ""),
    image: resolvedImage,
    content: item.content || "",
  };
};

const BLOG_EDITORIAL_FALLBACK_POSTS: BlogPost[] = [
  {
    id: 1,
    title: "Como un sistema de reservas aumento 200% las ventas de un hotel",
    excerpt: "Caso real de implementacion de reservas online con pagos integrados y automatizacion operativa.",
    date: "15 ene 2024",
    category: "Casos de Exito",
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200",
    content: "",
  },
  {
    id: 2,
    title: "Guia completa: que sistema de facturacion conviene para una empresa en crecimiento",
    excerpt: "Comparativa clara entre alternativas de facturacion para crecer con orden financiero.",
    date: "12 ene 2024",
    category: "Guias Practicas",
    readTime: "8 min",
    image: "https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=1200",
    content: "",
  },
  {
    id: 3,
    title: "5 errores costosos en gestion de inventario y como evitarlos",
    excerpt: "Lecciones practicas para ecommerce y retail enfocadas en reposicion y control de stock.",
    date: "10 ene 2024",
    category: "Tips y Consejos",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200",
    content: "",
  },
  {
    id: 4,
    title: "Por que un restaurante necesita un POS moderno para escalar operaciones",
    excerpt: "Integracion de caja, cocina y delivery para decisiones de negocio con datos reales.",
    date: "08 ene 2024",
    category: "Industria",
    readTime: "7 min",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200",
    content: "",
  },
  {
    id: 5,
    title: "Seguridad web para empresas: controles minimos para operar sin riesgo",
    excerpt: "Checklist tecnico para proteger datos y continuidad operativa en aplicaciones web.",
    date: "05 ene 2024",
    category: "Seguridad",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200",
    content: "",
  },
  {
    id: 6,
    title: "Plataforma SaaS o desarrollo a medida: decision tecnica para directores",
    excerpt: "Comparativa de costo, velocidad y flexibilidad para decidir la mejor ruta de producto.",
    date: "02 ene 2024",
    category: "Estrategia",
    readTime: "7 min",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
    content: "",
  },
  {
    id: 7,
    title: "Automatizacion de cobranza: como mejorar flujo de caja sin aumentar equipo",
    excerpt: "Estrategias para reducir mora con recordatorios, reglas de cobro y seguimiento automatizado.",
    date: "01 ene 2024",
    category: "Tips y Consejos",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1200",
    content: "",
  },
  {
    id: 8,
    title: "Ecommerce profesional: que necesita una tienda para vender de forma estable",
    excerpt: "Base operativa para vender online con catalogo, inventario, pagos y soporte conectados.",
    date: "28 dic 2023",
    category: "Industria",
    readTime: "7 min",
    image: "https://images.unsplash.com/photo-1556742049-02e45308b01e?auto=format&fit=crop&q=80&w=1200",
    content: "",
  },
];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(BLOG_EDITORIAL_FALLBACK_POSTS);
  const [postsLoadStatus, setPostsLoadStatus] = useState<BlogPostsLoadStatus>("loading");
  const [postsLoadError, setPostsLoadError] = useState("");
  const [postsSource, setPostsSource] = useState<BlogPostsSource>("backend");
  const [blogComments, setBlogComments] = useState<BlogCommentItem[]>([]);
  const [blogCommentForm, setBlogCommentForm] = useState<BlogCommentFormState>(INITIAL_BLOG_COMMENT_FORM);
  const [blogCommentSubmitting, setBlogCommentSubmitting] = useState(false);
  const [blogCommentMessage, setBlogCommentMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeCommentSlideIndex, setActiveCommentSlideIndex] = useState(0);
  const [visibleCommentFeedCount, setVisibleCommentFeedCount] = useState(4);
  const [heroTextConfig, setHeroTextConfig] = useState<BlogHeroTextConfig>(DEFAULT_HERO_TEXT_CONFIG);
  const [heroSlides, setHeroSlides] = useState<BlogHeroMediaSlide[]>([]);
  const [activeHeroSlideIndex, setActiveHeroSlideIndex] = useState(0);
  const [isHeroLeadModalOpen, setIsHeroLeadModalOpen] = useState(false);
  const [heroLeadForm, setHeroLeadForm] = useState<HeroLeadFormState>(INITIAL_HERO_LEAD_FORM);
  const [heroLeadStatus, setHeroLeadStatus] = useState<HeroLeadStatus>("idle");
  const [heroLeadError, setHeroLeadError] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<NewsletterStatus>("idle");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [searchQuery, setSearchQuery] = useState("");

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
        if (isMounted) {
          setPostsLoadStatus("loading");
          setPostsLoadError("");
          setPostsSource("backend");
        }

        const response = await fetch(`${BACKEND_URL}/api/blog/`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`No se pudieron obtener publicaciones (${response.status}).`);
        }

        const payload = await response.json();
        if (!Array.isArray(payload)) {
          throw new Error("Formato invalido de publicaciones.");
        }

        const mapped = payload
          .map((item: BackendBlogRecord) => item)
          .filter((item) => item?.id && item?.title && item?.content && item?.is_published !== false)
          .map(mapBackendBlogToPost)
          .sort((a, b) => b.id - a.id);

        if (!isMounted) return;

        if (mapped.length === 0) {
          setPosts(BLOG_EDITORIAL_FALLBACK_POSTS);
          setPostsSource("fallback-empty");
          setPostsLoadStatus("ready");
          return;
        }

        setPosts(mapped);
        setPostsSource("backend");
        setPostsLoadStatus("ready");
      } catch (error) {
        console.error("Error loading blog cards", error);
        if (!isMounted) return;
        const message = error instanceof Error ? error.message : "No se pudieron cargar las publicaciones del blog.";
        setPosts(BLOG_EDITORIAL_FALLBACK_POSTS);
        setPostsSource("fallback-error");
        setPostsLoadError(message);
        setPostsLoadStatus("ready");
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

  useEffect(() => {
    if (!ENABLE_PUBLIC_BLOG_COMMENTS) {
      setBlogComments([]);
      return;
    }

    let isMounted = true;

    const loadBlogComments = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/services-page/reviews?page_context=blog`);
        if (!response.ok) return;
        const payload = await response.json();
        if (!Array.isArray(payload)) return;
        if (!isMounted) return;

        const normalized = payload
          .map((item) => normalizeBlogComment(item as Partial<BlogCommentItem>))
          .filter((item) => item.content.length > 0);
        setBlogComments(normalized);
      } catch (error) {
        console.error("Error loading blog comments:", error);
      }
    };

    void loadBlogComments();
    return () => {
      isMounted = false;
    };
  }, []);

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

  const handleNewsletterEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewsletterEmail(event.target.value);
    if (newsletterStatus !== "idle") {
      setNewsletterStatus("idle");
      setNewsletterMessage("");
    }
  };

  const handleNewsletterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = newsletterEmail.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setNewsletterStatus("error");
      setNewsletterMessage("Ingresa un correo valido para suscribirte.");
      return;
    }

    setNewsletterStatus("sending");
    setNewsletterMessage("");

    try {
      const response = await fetch("/api/enviar-cotizacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: "Suscriptor blog",
          email,
          telefono: "No informado",
          servicio: "Newsletter Blog",
          descripcion: "[Origen: Blog Newsletter] Solicitud de suscripcion al boletin tecnico.",
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const detail = typeof payload?.error === "string" ? payload.error : "No se pudo completar la suscripcion.";
        throw new Error(detail);
      }

      setNewsletterStatus("success");
      setNewsletterMessage("Suscripcion registrada. Te enviaremos contenido tecnico de alto valor.");
      setNewsletterEmail("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo completar la suscripcion.";
      setNewsletterStatus("error");
      setNewsletterMessage(message);
    }
  };

  const handleBlogCommentInput = (field: keyof BlogCommentFormState, value: string | number) => {
    setBlogCommentForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlogCommentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBlogCommentMessage(null);

    const authorName = blogCommentForm.author_name.trim();
    const authorEmail = blogCommentForm.author_email.trim();
    const content = blogCommentForm.content.trim();
    const rating = Math.max(1, Math.min(5, Number(blogCommentForm.rating) || 5));
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!authorName || !authorEmail || content.length < 20) {
      setBlogCommentMessage({
        type: "error",
        text: "Completa nombre, email y un comentario de al menos 20 caracteres.",
      });
      return;
    }

    if (!emailPattern.test(authorEmail)) {
      setBlogCommentMessage({
        type: "error",
        text: "Ingresa un email valido para registrar el comentario.",
      });
      return;
    }

    try {
      setBlogCommentSubmitting(true);
      const response = await fetch(`${BACKEND_URL}/api/services-page/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_name: authorName,
          author_role: authorEmail,
          author_company: "Lector del blog",
          content,
          rating,
          page_context: "blog",
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo registrar el comentario.");
      }

      setBlogCommentForm(INITIAL_BLOG_COMMENT_FORM);
      setBlogCommentMessage({
        type: "success",
        text: "Comentario enviado. Queda pendiente de moderacion y se publicara en esta seccion.",
      });
    } catch (error) {
      console.error("Error submitting blog comment:", error);
      setBlogCommentMessage({
        type: "error",
        text: "Error de conexion. Intenta nuevamente en unos segundos.",
      });
    } finally {
      setBlogCommentSubmitting(false);
    }
  };

  const goToBlogArticles = () => {
    const target = document.getElementById("blog-feed");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    window.scrollTo({ top: 1200, behavior: "smooth" });
  };

  const scrollToCommentForm = () => {
    const target = document.getElementById("blog-comments-form");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const carouselComments = blogComments;
  const blogCommentsTotal = carouselComments.length;
  const safeActiveCommentIndex = blogCommentsTotal > 0 ? activeCommentSlideIndex % blogCommentsTotal : 0;
  const activeCommentSlide = blogCommentsTotal > 0 ? carouselComments[safeActiveCommentIndex] : null;
  const commentFeedPool = blogCommentsTotal > 1
    ? carouselComments.filter((_, index) => index !== safeActiveCommentIndex)
    : [];
  const shouldShowCommentFeed = commentFeedPool.length > 0;
  const visibleCommentFeed = commentFeedPool.slice(0, visibleCommentFeedCount);
  const hasMoreCommentFeed = visibleCommentFeedCount < commentFeedPool.length;

  useEffect(() => {
    setActiveCommentSlideIndex(0);
    setVisibleCommentFeedCount(blogComments.length > 1 ? Math.min(4, blogComments.length - 1) : 0);
  }, [blogComments.length]);

  useEffect(() => {
    if (blogCommentsTotal <= 1) return;
    const interval = window.setInterval(() => {
      setActiveCommentSlideIndex((prev) => (prev + 1) % blogCommentsTotal);
    }, 6000);
    return () => window.clearInterval(interval);
  }, [blogCommentsTotal]);

  const goToPrevComment = () => {
    if (blogCommentsTotal <= 1) return;
    setActiveCommentSlideIndex((prev) => (prev - 1 + blogCommentsTotal) % blogCommentsTotal);
  };

  const goToNextComment = () => {
    if (blogCommentsTotal <= 1) return;
    setActiveCommentSlideIndex((prev) => (prev + 1) % blogCommentsTotal);
  };

  const scrollToCommentFeed = () => {
    const target = document.getElementById("blog-comments-feed");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const categoryOptions = useMemo(() => {
    const unique = Array.from(
      new Set(
        posts
          .map((post) => post.category.trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

    return ["Todas", ...unique];
  }, [posts]);

  useEffect(() => {
    if (activeCategory !== "Todas" && !categoryOptions.includes(activeCategory)) {
      setActiveCategory("Todas");
    }
  }, [activeCategory, categoryOptions]);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesCategory =
        activeCategory === "Todas" || post.category.toLowerCase() === activeCategory.toLowerCase();
      if (!matchesCategory) return false;

      if (!normalizedQuery) return true;
      const haystack = `${post.title} ${post.excerpt} ${post.category}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [posts, activeCategory, searchQuery]);

  const readingHighlights = filteredPosts.slice(0, 4);
  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const recentPosts = featuredPost ? filteredPosts.slice(1, 7) : [];
  const hasAppliedFilter = activeCategory !== "Todas" || searchQuery.trim().length > 0;
  const estimatedReadMinutes = filteredPosts.reduce((acc, post) => {
    const minutes = Number.parseInt(post.readTime, 10);
    return acc + (Number.isFinite(minutes) ? minutes : 0);
  }, 0);

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
              <div className="hero-actions flex items-center gap-4 flex-wrap">
                <button
                  type="button"
                  onClick={openHeroLeadModal}
                  className="cta-button hero-primary-cta px-10 py-4 rounded-2xl text-white font-bold flex items-center gap-3"
                >
                  {heroTextConfig.cta_text} <FaChevronRight className="text-xs" />
                </button>
                <button
                  type="button"
                  onClick={goToBlogArticles}
                  className="hero-secondary-cta px-6 py-3 rounded-2xl border border-cyan-300/75 bg-slate-950/80 text-cyan-300 font-semibold text-sm shadow-[0_8px_25px_rgba(2,6,23,0.5)] backdrop-blur-md hover:border-cyan-200 hover:text-cyan-200 hover:bg-slate-900/90 transition-all"
                >
                  Ver articulos destacados
                </button>
                <div className="hero-response-line flex items-center gap-3 text-sm font-semibold drop-shadow-[0_2px_8px_rgba(2,6,23,0.6)]">
                  <FaClock /> {heroTextConfig.read_time_text}
                </div>
              </div>
              <div className="hero-proof-chips mt-6 flex flex-wrap gap-3 text-[11px] font-semibold uppercase tracking-[0.15em]">
                {["Diagnostico orientado a negocio", "Implementacion en fases claras", "Escalabilidad y seguridad desde el inicio"].map((item) => (
                  <span
                    key={item}
                    className="hero-proof-chip px-4 py-2 rounded-xl border border-amber-300/80 bg-slate-950/84 text-amber-300 shadow-[0_6px_20px_rgba(2,6,23,0.45)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. FILTROS DEL BLOG */}
      <section className="blog-insights-section py-24 relative overflow-hidden border-y border-white/5">
        <div className="blog-container">
          <div className="text-center mb-10">
            <span className="insights-kicker inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5">
              Explora por tema
            </span>
            <h2 className="insights-title text-4xl lg:text-5xl font-black mb-4">Un blog real, ordenado por categorias</h2>
            <p className="insights-subtitle text-lg max-w-3xl mx-auto">
              Filtra por categoria o busca por palabra clave para encontrar guias, casos y buenas practicas puntuales.
            </p>
          </div>

          <div className="blog-filter-shell rounded-[2rem] border border-white/10 bg-slate-900/65 p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] font-black text-cyan-200/85 mb-2">Busqueda editorial</p>
                <p className="text-sm text-slate-300">Encuentra contenido por titulo, categoria o resumen.</p>
              </div>
              <div className="w-full lg:max-w-lg">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Buscar: ecommerce, seguridad, reservas..."
                  className="search-input blog-search-field w-full px-5 py-3 rounded-xl text-sm text-white"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {categoryOptions.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`blog-filter-chip ${isActive ? "is-active" : ""} px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.12em] border transition-all ${isActive
                      ? "border-cyan-300/65 bg-cyan-400/15 text-cyan-100"
                      : "border-white/15 bg-white/5 text-slate-300 hover:border-cyan-300/45 hover:text-cyan-100"
                      }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-7">
              <div className="blog-metric-card rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400 font-bold mb-1">Articulos visibles</p>
                <p className="text-3xl font-black text-white">{filteredPosts.length}</p>
              </div>
              <div className="blog-metric-card rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400 font-bold mb-1">Categorias activas</p>
                <p className="text-3xl font-black text-white">{Math.max(categoryOptions.length - 1, 0)}</p>
              </div>
              <div className="blog-metric-card rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400 font-bold mb-1">Minutos estimados</p>
                <p className="text-3xl font-black text-white">{estimatedReadMinutes}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LECTURAS RECOMENDADAS */}
      <section className="editorial-picks-section py-24 bg-slate-950 border-b border-white/5">
        <div className="blog-container">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
            <div>
              <span className="integrations-kicker inline-flex items-center px-4 py-2 rounded-full mb-5">
                Lecturas recomendadas
              </span>
              <h2 className="text-3xl md:text-5xl font-black mb-3">Seleccion editorial del momento</h2>
              <p className="text-slate-300 max-w-3xl">
                Articulos destacados para comprender tendencias, arquitectura y decisiones de producto en proyectos web.
              </p>
            </div>
            <button
              type="button"
              onClick={goToBlogArticles}
              className="insights-primary-action px-8 py-3 rounded-xl text-sm font-extrabold uppercase tracking-[0.12em] w-fit"
            >
              Ir al feed completo
            </button>
          </div>

          {postsLoadStatus === "loading" && posts.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={`editorial-loading-${idx}`}
                  className="editorial-pick-card rounded-[1.6rem] border border-white/10 bg-slate-900/65 h-[23rem] animate-pulse"
                />
              ))}
            </div>
          )}

          {postsLoadStatus === "ready" && readingHighlights.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {readingHighlights.map((post, index) => (
                <motion.article
                  key={`highlight-${post.id}`}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.28, delay: index * 0.04 }}
                  className="editorial-pick-card rounded-[1.6rem] border border-white/10 bg-slate-900/65 overflow-hidden"
                >
                  <Link href={`/blog/${post.id}`} className="block">
                    <div className="relative h-44">
                      <Image src={post.image} alt={post.title} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">
                        <FaCalendarAlt className="text-blue-400" /> {post.date}
                      </div>
                      <h3 className="text-lg font-black text-white leading-tight mb-3 line-clamp-2">{post.title}</h3>
                      <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">{post.excerpt}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest text-cyan-200/85 font-bold">{post.category}</span>
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{post.readTime}</span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
      {/* 4. PUBLICACIONES RECIENTES */}
      <section id="blog-feed" className="blog-feed-section py-28 bg-slate-950">
        <div className="blog-container">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
            <div>
              <span className="integrations-kicker inline-flex items-center px-4 py-2 rounded-full mb-5">
                Publicaciones recientes
              </span>
              <h2 className="blog-main-title text-4xl lg:text-6xl font-black mb-4">
                Novedades y casos aplicados
              </h2>
              <p className="blog-main-subtitle text-slate-300 max-w-3xl">
                Entradas claras y directas sobre sistemas web, integraciones y operacion digital.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveCategory("Todas");
                setSearchQuery("");
              }}
              disabled={!hasAppliedFilter}
              className="insights-secondary-action px-7 py-3 rounded-xl text-sm font-bold uppercase tracking-[0.1em] w-fit disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Limpiar filtros
            </button>
          </div>

          {postsLoadStatus === "loading" && posts.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`post-loading-${index}`}
                  className="rounded-[2rem] border border-white/10 bg-slate-900/70 h-[30rem] animate-pulse"
                />
              ))}
            </div>
          )}

          {postsLoadStatus === "ready" && filteredPosts.length === 0 && (
            <div className="rounded-[2rem] border border-cyan-300/25 bg-slate-900/75 p-8 md:p-10 text-center">
              <h3 className="text-2xl font-black text-slate-100 mb-3">No hay resultados con ese filtro</h3>
              <p className="text-slate-300 mb-6">
                Ajusta la categoria o cambia el termino de busqueda para encontrar articulos.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("Todas");
                  setSearchQuery("");
                }}
                className="insights-primary-action inline-flex px-7 py-3 rounded-xl text-xs font-bold uppercase tracking-[0.1em]"
              >
                Ver todas las publicaciones
              </button>
            </div>
          )}

          {postsLoadStatus === "ready" && postsSource !== "backend" && (
            <div className="mb-8 rounded-2xl border border-amber-300/30 bg-amber-500/10 px-5 py-4">
              <p className="text-sm font-semibold text-amber-100">
                {postsSource === "fallback-empty"
                  ? "No hay publicaciones publicadas en tu backend. Se muestra contenido editorial de ejemplo."
                  : "No se pudo conectar al backend del blog. Se muestra contenido editorial de ejemplo temporalmente."}
              </p>
              {postsSource === "fallback-error" && postsLoadError ? (
                <p className="text-xs text-amber-200/80 mt-2">{postsLoadError}</p>
              ) : null}
            </div>
          )}

          {postsLoadStatus === "ready" && featuredPost && (
            <article className="feed-featured-card mb-10 overflow-hidden rounded-[2.2rem] border border-cyan-300/28 bg-gradient-to-br from-slate-900/92 via-slate-900/86 to-blue-950/55 shadow-[0_26px_60px_rgba(2,6,23,0.58)]">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative min-h-[280px] lg:min-h-[360px]">
                  <Image src={featuredPost.image} alt={featuredPost.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/25 to-transparent" />
                  <span className="absolute top-6 left-6 px-4 py-2 rounded-xl border border-cyan-300/60 bg-slate-950/70 text-cyan-200 text-[10px] font-black uppercase tracking-[0.18em]">
                    Articulo destacado
                  </span>
                </div>
                <div className="p-8 md:p-10 lg:p-12 flex flex-col justify-between gap-8">
                  <div>
                    <div className="flex items-center gap-3 text-slate-400 text-[10px] font-bold mb-5 uppercase tracking-widest">
                      <FaCalendarAlt className="text-blue-400" /> {featuredPost.date}
                      <span className="w-1 h-1 rounded-full bg-slate-600" />
                      <FaClock className="text-blue-400/80" /> {featuredPost.readTime}
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black text-slate-100 leading-tight mb-5">
                      {featuredPost.title}
                    </h3>
                    <p className="text-slate-300 text-base leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-[11px] font-bold uppercase tracking-widest text-slate-300">
                      {featuredPost.category}
                    </span>
                    <Link
                      href={`/blog/${featuredPost.id}`}
                      className="insights-primary-action inline-flex items-center gap-2 px-7 py-3 rounded-xl text-xs font-extrabold uppercase tracking-[0.12em]"
                    >
                      Leer articulo
                      <FaChevronRight className="text-[10px]" />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          )}

          {postsLoadStatus === "ready" && recentPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {recentPosts.map((post, idx) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className="square-card group"
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
                      <h3 className="blog-card-title text-2xl font-bold mb-4 leading-tight">
                        {post.title}
                      </h3>
                      <p className="blog-card-excerpt text-slate-300 text-sm line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                      <Link
                        href={`/blog/${post.id}`}
                        className="blog-read-btn text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all"
                      >
                        Ver articulo <FaChevronRight className="text-[10px]" />
                      </Link>
                      <div className="flex items-center gap-1.5 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                        <FaClock className="text-blue-500/50" /> {post.readTime}
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. COMMENTS SECTION */}
      {ENABLE_PUBLIC_BLOG_COMMENTS && activeCommentSlide && (
        <section className="comments-section py-24 relative overflow-hidden">
          <div className="blog-container max-w-4xl relative z-10">
            <div className="comments-header mb-12">
              <div className="comments-kicker">Debate tecnico activo</div>
              <div className="comments-title-row">
                <span className="comments-title-icon">
                  <FaRegComments />
                </span>
                <h2 className="comments-title">Conversacion tecnica <span>({blogCommentsTotal})</span></h2>
              </div>
              <p className="comments-subtitle">
                Opiniones de lectores sobre arquitectura, implementacion y decisiones reales en productos web.
              </p>
            </div>

            <div className="comments-carousel-shell mb-10">
              <div className="comments-carousel-toolbar">
                <span className="comments-carousel-count">
                  Comentario {safeActiveCommentIndex + 1} de {blogCommentsTotal}
                </span>
                {blogCommentsTotal > 1 && (
                  <div className="comments-carousel-controls">
                    <button type="button" onClick={goToPrevComment}>Anterior</button>
                    <button type="button" onClick={goToNextComment}>Siguiente</button>
                  </div>
                )}
              </div>

              <AnimatePresence mode="wait">
                <motion.article
                  key={`comment-slide-${activeCommentSlide.id}-${safeActiveCommentIndex}`}
                  initial={{ opacity: 0, y: 14, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.985 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="comment-card comment-slide-card"
                >
                  <div className="comment-avatar">
                    <FaUserCircle className="text-4xl" />
                  </div>
                  <div className="comment-body">
                    <div className="comment-meta">
                      <h4>{activeCommentSlide.author_name}</h4>
                      <span>{formatBlogCommentDate(activeCommentSlide.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 mb-2">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <FaStar key={`${activeCommentSlide.id}-rating-${index}`} className={index < activeCommentSlide.rating ? "text-amber-400" : "text-slate-700"} />
                      ))}
                    </div>
                    <p className="comment-text">
                      {activeCommentSlide.content}
                    </p>
                    <div className="comment-actions">
                      <button type="button" onClick={scrollToCommentForm} className="comment-action-primary">
                        Responder en comentarios
                      </button>
                      <button type="button" onClick={goToBlogArticles} className="comment-action-secondary">
                        Ver mas articulos
                      </button>
                    </div>
                  </div>
                </motion.article>
              </AnimatePresence>

              {blogCommentsTotal > 1 && (
                <div className="comments-carousel-dots">
                  {carouselComments.map((comment, index) => (
                    <button
                      key={`comment-dot-${comment.id}-${index}`}
                      type="button"
                      className={`comments-carousel-dot ${index === safeActiveCommentIndex ? "is-active" : ""}`}
                      onClick={() => setActiveCommentSlideIndex(index)}
                      aria-label={`Ir a comentario ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {shouldShowCommentFeed && (
                <button type="button" className="comment-feed-anchor" onClick={scrollToCommentFeed}>
                  Bajar para ver mas resenas <FaChevronRight className="text-[11px] rotate-90" />
                </button>
              )}
            </div>

            {shouldShowCommentFeed && (
              <div id="blog-comments-feed" className="comment-feed-grid mb-12">
                {visibleCommentFeed.map((comment, index) => (
                  <article key={`feed-${comment.id}-${index}`} className="comment-card comment-feed-card">
                    <div className="comment-avatar">
                      <FaUserCircle className="text-3xl" />
                    </div>
                    <div className="comment-body">
                      <div className="comment-meta">
                        <h4>{comment.author_name}</h4>
                        <span>{formatBlogCommentDate(comment.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400 mb-2">
                        {Array.from({ length: 5 }).map((_, starIndex) => (
                          <FaStar key={`feed-star-${comment.id}-${starIndex}`} className={starIndex < comment.rating ? "text-amber-400" : "text-slate-700"} />
                        ))}
                      </div>
                      <p className="comment-text">{comment.content}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {shouldShowCommentFeed && hasMoreCommentFeed && (
              <div className="flex justify-center mb-12">
                <button
                  type="button"
                  className="comment-load-more"
                  onClick={() => setVisibleCommentFeedCount((prev) => Math.min(prev + 4, commentFeedPool.length))}
                >
                  Ver mas comentarios
                </button>
              </div>
            )}

            {/* Comment Form */}
            <div id="blog-comments-form" className="comment-form-shell">
              <div className="comment-form-header">
                <h3>Deja tu opinion tecnica</h3>
                <span className="comment-form-badge">Moderacion editorial activa</span>
              </div>
              {blogCommentMessage && (
                <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${blogCommentMessage.type === "success"
                  ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-200"
                  : "border-red-500/35 bg-red-500/10 text-red-200"
                  }`}>
                  {blogCommentMessage.text}
                </div>
              )}
              <form className="comment-form space-y-5" onSubmit={handleBlogCommentSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    className="comment-input w-full"
                    value={blogCommentForm.author_name}
                    onChange={(event) => handleBlogCommentInput("author_name", event.target.value)}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email corporativo"
                    className="comment-input w-full"
                    value={blogCommentForm.author_email}
                    onChange={(event) => handleBlogCommentInput("author_email", event.target.value)}
                    required
                  />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.14em] font-black text-white/60 mb-3">Calificacion</p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={`blog-comment-star-${star}`}
                        type="button"
                        onClick={() => handleBlogCommentInput("rating", star)}
                        className="text-2xl transition-all duration-200 hover:scale-110 active:scale-95"
                      >
                        <FaStar className={Number(blogCommentForm.rating) >= star ? "text-yellow-400" : "text-slate-700"} />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  placeholder="Tu comentario o aporte sobre este contenido..."
                  rows={4}
                  className="comment-input w-full resize-none"
                  value={blogCommentForm.content}
                  onChange={(event) => handleBlogCommentInput("content", event.target.value)}
                  required
                />
                <button className="comment-submit cta-button text-white font-bold flex items-center gap-3" type="submit" disabled={blogCommentSubmitting}>
                  {blogCommentSubmitting ? "Enviando..." : "Publicar comentario"} <FaRocket />
                </button>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* 5.5 AI FEATURES SECTION (BLOQUE CARACTERÍSTICAS) */}
      <section className="py-24 px-4 bg-[#020617] flex flex-col justify-center items-center gap-8 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className='px-6 py-2 border border-slate-800 text-blue-400 text-xs font-black rounded-full uppercase tracking-widest bg-slate-900/50 backdrop-blur-sm'
        >
          Características
        </motion.button>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-black text-white max-w-3xl text-center leading-[1.1] tracking-tight"
        >
          Agentes de IA que <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">automatizan y aceleran</span> el crecimiento
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className='text-lg md:text-xl text-slate-400 max-w-2xl text-center font-medium leading-relaxed'
        >
          Optimice las operaciones, aumente la productividad y escale sin esfuerzo, todo impulsado por la automatización inteligente.
        </motion.p>

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className='bg-gradient-to-b from-[#020204] to-[#120d26] border border-slate-800/60 rounded-3xl p-8 space-y-4 transition-all duration-300 shadow-2xl hover:border-blue-500/30 group'
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-900/80 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-300">
              <svg className='text-blue-400' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <p className='font-black text-xl text-white'>Automatización de tareas</p>
            <p className='text-sm md:text-base text-slate-400 leading-relaxed'>
              Deje que la IA se encargue de las tareas repetitivas y que consumen mucho tiempo para que su equipo pueda concentrarse en el crecimiento.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5 }}
            className='bg-gradient-to-b from-[#020204] to-[#120d26] border border-slate-800/60 rounded-3xl p-8 space-y-4 transition-all duration-300 shadow-2xl hover:border-blue-500/30 group'
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-900/80 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-300">
              <svg className='text-blue-400' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M12 7v5l4 2" />
              </svg>
            </div>
            <p className='font-black text-xl text-white'>Monitoreo en tiempo real</p>
            <p className='text-sm md:text-base text-slate-400 leading-relaxed'>
              Potencie su negocio permitiendo que la IA se haga cargo de las tareas repetitivas y libere a su equipo para realizar trabajos de alto impacto.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -5 }}
            className='bg-gradient-to-b from-[#020204] to-[#120d26] border border-slate-800/60 rounded-3xl p-8 space-y-4 transition-all duration-300 shadow-2xl hover:border-blue-500/30 group'
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-900/80 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 7.9999C20.9996 7.64918 20.9071 7.30471 20.7315 7.00106C20.556 6.69742 20.3037 6.44526 20 6.2699L13 2.2699C12.696 2.09437 12.3511 2.00195 12 2.00195C11.6489 2.00195 11.304 2.09437 11 2.2699L4 6.2699C3.69626 6.44526 3.44398 6.69742 3.26846 7.00106C3.09294 7.30471 3.00036 7.64918 3 7.9999V15.9999C3.00036 16.3506 3.09294 16.6951 3.26846 16.9987C3.44398 17.3024 3.69626 17.5545 4 17.7299L11 21.7299C11.304 21.9054 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9054 13 21.7299L20 17.7299C20.3037 17.5545 20.556 17.3024 20.7315 16.9987C20.9071 16.6951 20.9996 16.3506 21 15.9999V7.9999Z" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3.29999 7L12 12L20.7 7" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 22V12" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className='font-black text-xl text-white'>Conciencia del contexto</p>
            <p className='text-sm md:text-base text-slate-400 leading-relaxed'>
              La IA se encarga de las tareas repetitivas para que su equipo pueda centrarse en el crecimiento y en obtener resultados.
            </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className='bg-gradient-to-b from-[#020204] to-[#120d26] border border-slate-800/60 rounded-3xl p-8 space-y-4 transition-all duration-300 shadow-2xl hover:border-blue-500/30 group'
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-900/80 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-300">
              <svg className='text-blue-400' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M3 5V19A9 3 0 0 0 21 19V5" />
                <path d="M3 12A9 3 0 0 0 21 12" />
              </svg>
            </div>
            <p className='font-black text-xl text-white'>Optimización de recursos</p>
            <p className='text-sm md:text-base text-slate-400 leading-relaxed'>
              Potencie su negocio permitiendo que la IA se haga cargo de las tareas repetitivas y libere al equipo para trabajos de alto impacto.
            </p>
          </motion.div>

          {/* Card 5 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5 }}
            className='bg-gradient-to-b from-[#020204] to-[#120d26] border border-slate-800/60 rounded-3xl p-8 space-y-4 transition-all duration-300 shadow-2xl hover:border-blue-500/30 group'
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-900/80 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-300">
              <svg className='text-blue-400' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <path d="M16 3.128a4 4 0 0 1 0 7.744" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <p className='font-black text-xl text-white'>Acceso basado en roles</p>
            <p className='text-sm md:text-base text-slate-400 leading-relaxed'>
              Libera a tu equipo del trabajo manual y repetitivo. Deja que la IA automatice las tareas mientras tú te concentras en escalar.
            </p>
          </motion.div>

          {/* Card 6 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -5 }}
            className='bg-gradient-to-b from-[#020204] to-[#120d26] border border-slate-800/60 rounded-3xl p-8 space-y-4 transition-all duration-300 shadow-2xl hover:border-blue-500/30 group'
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-900/80 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-300">
              <svg className='text-blue-400' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" />
                <path d="m12 15 5 6H7Z" />
              </svg>
            </div>
            <p className='font-black text-xl text-white'>Colaboración IA-Agente</p>
            <p className='text-sm md:text-base text-slate-400 leading-relaxed'>
              Deje que la IA se encargue de las tareas repetitivas para que su equipo pueda mantenerse enfocado en el crecimiento del negocio.
            </p>
          </motion.div>
        </div>
      </section>
      <section className="py-24 relative overflow-hidden bg-[#020617]">
        {/* Glow effects focused on the center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none opacity-50" />

        <div className="blog-container relative z-10 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto p-px rounded-[3rem] bg-gradient-to-b from-blue-500/30 via-slate-700/20 to-transparent"
          >
            <div className="flex flex-col items-center justify-center text-center py-16 md:py-24 rounded-[47px] bg-[#0f172a]/80 backdrop-blur-2xl shadow-2xl relative overflow-hidden border border-white/5">
              {/* Discrete grid overlay inside the card */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

              <div className="flex items-center justify-center bg-slate-800/60 backdrop-blur-md px-5 py-2.5 shadow-xl gap-2 rounded-full text-[10px] md:text-xs mb-8 border border-white/10">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-400">
                  <path d="M2.503 10.06a3.3 3.3 0 0 0-.88 1.809 4.7 4.7 0 0 0-.067 1.03v.545h.75q.416-.002.825-.075a3.24 3.24 0 0 0 1.81-.882 1.65 1.65 0 0 0-.131-2.325 1.65 1.65 0 0 0-2.307-.103m1.632 1.621a2.1 2.1 0 0 1-1.182.563h-.206v-.207a2.1 2.1 0 0 1 .563-1.18.34.34 0 0 1 .225-.076.63.63 0 0 1 .44.206.506.506 0 0 1 .16.694m9.6-9.581a.853.853 0 0 0-.835-.835A8.2 8.2 0 0 0 6.816 3.28L5.288 5.062l-2.25-.468a.94.94 0 0 0-.863.253l-.637.637a.94.94 0 0 0-.263.76.94.94 0 0 0 .422.693l1.931 1.238.122.075 3 3.047.075.075 1.238 1.931a.94.94 0 0 0 .693.422h.104a.94.94 0 0 0 .656-.272l.637-.637a.94.94 0 0 0 .253-.863l-.468-2.24 1.725-1.482A8.24 8.24 0 0 0 13.735 2.1M2.915 5.765l1.238.263-.6.703-.937-.628zm5.982 6.657-.628-.938.703-.6.263 1.238zm1.978-5.053-3.45 2.943-2.737-2.737 2.943-3.45a6.98 6.98 0 0 1 4.932-1.688 7 7 0 0 1-1.688 4.932" fill="currentColor" />
                  <path d="M10.434 6.216a1.116 1.116 0 0 0-.056-1.594 1.086 1.086 0 0 0-1.918.742 1.1 1.1 0 0 0 .38.786 1.125 1.125 0 0 0 1.594.066" fill="currentColor" />
                </svg>
                <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent font-black uppercase tracking-[0.2em]">Con la confianza de expertos</span>
              </div>

              <h2 className="text-4xl md:text-6xl font-black mt-2 leading-[1.05] text-white tracking-tight drop-shadow-2xl">
                Desbloquea tu potencial con <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">orientacion tecnica</span>
                {" "}y resultados reales
              </h2>

              <p className="text-slate-400 mt-8 max-w-2xl px-6 text-lg md:text-xl font-medium leading-relaxed">
                Acelera tus objetivos con estrategias personalizadas y un ecosistema de soporte diseñado para la excelencia digital.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-8 mt-14">
                <Link
                  href="/asesoria"
                  className="group relative px-12 py-5 rounded-2xl font-black text-white overflow-hidden transition-all duration-500 hover:scale-[1.05] active:scale-[0.98] shadow-[0_15px_40px_-10px_rgba(99,102,241,0.5)]"
                >
                  {/* Shiny Gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-700 transition-all duration-500 group-hover:opacity-90" />
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.6)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_2s_infinite]" />

                  <span className="relative flex items-center gap-3">
                    Agendar Asesoria <FaRocket className="text-sm group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("newsletter-inline-form");
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group relative px-12 py-5 rounded-2xl font-black text-slate-200 overflow-hidden border border-white/10 transition-all duration-500 hover:text-white hover:border-white/20 bg-slate-900/40 backdrop-blur-md shadow-xl"
                >
                  {/* Subtle hover background */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-slate-800 to-slate-900" />

                  <span className="relative flex items-center gap-3">
                    Unirme al Newsletter <FaEnvelopeOpenText className="text-sm group-hover:rotate-12 transition-transform duration-300" />
                  </span>
                </button>
              </div>

              {/* Newsletter Inline Form */}
              <div id="newsletter-inline-form" className="mt-16 w-full max-w-lg px-6">
                <form onSubmit={handleNewsletterSubmit} className="space-y-5">
                  <div className="relative group">
                    <input
                      type="email"
                      placeholder="tu@empresa.com"
                      value={newsletterEmail}
                      onChange={handleNewsletterEmailChange}
                      required
                      className="w-full px-8 py-5 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-bold placeholder:text-slate-600 text-lg shadow-inner group-hover:border-white/10"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={newsletterStatus === "sending"}
                    className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black hover:bg-slate-200 transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-[0.99]"
                  >
                    {newsletterStatus === "sending" ? (
                      <>Procesando...</>
                    ) : (
                      <>
                        Suscribirme Ahora <FaRocket className="text-sm" />
                      </>
                    )}
                  </button>
                  {newsletterStatus !== "idle" && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-center text-sm font-black mt-4 ${newsletterStatus === "success" ? "text-emerald-400" : "text-rose-400"}`}
                    >
                      {newsletterMessage}
                    </motion.p>
                  )}
                </form>
              </div>
            </div>
          </motion.div>
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
                <span aria-hidden="true">&times;</span>
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

    </div>
  );
}
