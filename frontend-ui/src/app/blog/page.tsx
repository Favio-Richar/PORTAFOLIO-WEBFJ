"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  FaClock, FaChevronRight, FaRegComments, FaShareAlt,
  FaRocket, FaCode, FaCloud, FaRobot, FaLock, FaUserCircle,
  FaCalendarAlt, FaFire, FaEnvelopeOpenText, FaTwitter, FaLinkedin, FaGithub
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

interface BlogHeroConfig {
  media_type: "image" | "video";
  background_image_url: string;
  background_video_url: string;
  card_kicker: string;
  card_title: string;
  card_description: string;
  card_tags: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const DEFAULT_HERO_CONFIG: BlogHeroConfig = {
  media_type: "video",
  background_image_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1600",
  background_video_url: "",
  card_kicker: "Radar Tecnologico 2026",
  card_title: "3 tendencias que estan cambiando el desarrollo",
  card_description: "IA agentes, cloud eficiente y seguridad zero trust para productos reales.",
  card_tags: '["LLM OPS","CLOUD NATIVE","ZERO TRUST"]',
};

const normalizeHeroConfig = (payload: Partial<BlogHeroConfig> | null | undefined): BlogHeroConfig => {
  const raw = payload || {};
  return {
    ...DEFAULT_HERO_CONFIG,
    ...raw,
    media_type: raw.media_type === "image" ? "image" : "video",
    background_image_url: raw.background_image_url || DEFAULT_HERO_CONFIG.background_image_url,
    background_video_url: raw.background_video_url || "",
    card_kicker: raw.card_kicker || DEFAULT_HERO_CONFIG.card_kicker,
    card_title: raw.card_title || DEFAULT_HERO_CONFIG.card_title,
    card_description: raw.card_description || DEFAULT_HERO_CONFIG.card_description,
    card_tags: raw.card_tags || DEFAULT_HERO_CONFIG.card_tags,
  };
};

const parseCardTags = (raw: string): string[] => {
  const value = raw.trim();
  if (!value) return [];
  if (value.startsWith("[")) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      return [];
    }
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

// --- Mock Data (Based on requested template) ---
const MOCK_POSTS: BlogPost[] = [
  {
    id: 1,
    title: "Cómo un Sistema de Reservas Aumentó 200% las Ventas de un Hotel",
    excerpt: "Descubre cómo un pequeño hotel implementó nuestro sistema de reservas y triplicó su ocupación en 6 meses.",
    date: "15 Ene 2024",
    category: "Casos de Éxito",
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
    views: "4.0K",
    content: `
      <div class="modal-body-content">
        <p><strong>El Hotel Paraíso</strong>, ubicado en la costa, tenía un problema común: la mayoría de sus reservas eran telefónicas y en el mostrador. Perdían mucha clientela potencial que buscaba reservar online.</p>
        <h3>📊 El Problema Inicial</h3>
        <ul>
          <li>No tenía presencia online para reservas</li>
          <li>Personal gastaba 4 horas diarias en gestionar reservas manualmente</li>
          <li>Perdía clientes que querían reservar desde sus celulares</li>
          <li>No tenía reportes de ocupación en tiempo real</li>
          <li>Overbooking ocasional afectaba la reputación</li>
          <li>Competidores online les llevaban clientes</li>
        </ul>
        <h3>💡 La Solución: Sistema de Reservas TechSys</h3>
        <p>Implementamos nuestro sistema de reservas con las siguientes características:</p>
        <ul>
          <li>✓ Reservas online 24/7 en sitio web del hotel</li>
          <li>✓ Confirmación automática por email</li>
          <li>✓ Notificaciones por SMS 24 horas antes de la llegada</li>
          <li>✓ Panel de control en tiempo real</li>
          <li>✓ Integración con pasarelas de pago (Stripe, PayPal)</li>
          <li>✓ Reportes de ocupación y rentabilidad</li>
          <li>✓ Calendar view para staff</li>
          <li>✓ Integración con OTAs (Booking, Airbnb)</li>
        </ul>
        <div class="cta-box bg-blue-500/10 border border-blue-500/20 p-8 rounded-3xl my-10">
          <h4 class="text-blue-400 font-bold mb-4 text-xl">📈 Resultados en 6 Meses</h4>
          <p><strong>Ocupación:</strong> 45% → 90% (+100%)</p>
          <p><strong>Ingresos:</strong> Aumento de 200%</p>
          <p><strong>Tiempo administrativo:</strong> De 4h a 30 minutos/día</p>
          <p><strong>No-shows:</strong> Reducción del 85% con recordatorios</p>
        </div>
        <h3>🎯 Implementación</h3>
        <ol>
          <li><strong>Semana 1:</strong> Análisis de necesidades y setup del sistema</li>
          <li><strong>Semana 2:</strong> Capacitación del equipo (3 horas)</li>
          <li><strong>Semana 3:</strong> Lanzamiento del sistema con promoción</li>
        </ol>
      </div>
    `
  },
  {
    id: 2,
    title: "Guía Completa: ¿Cuál es el Mejor Sistema de Facturas para tu Empresa?",
    excerpt: "Comparamos facturas manuales vs. automáticas. Descubre por qué Excel ya no es suficiente.",
    date: "12 Ene 2024",
    category: "Guías Prácticas",
    readTime: "8 min",
    image: "https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=800",
    views: "5.1K",
    content: `
      <h3>❌ Problema: ¿Por Qué Excel No Es Suficiente?</h3>
      <ul>
        <li>Errores humanos en cálculos (especialmente con muchas facturas)</li>
        <li>No cumple requisitos fiscales modernos (CFDI en México, etc)</li>
        <li>Imposible generar reportes rápido cuando lo necesitas</li>
      </ul>
      <h3>✅ ¿Qué Buscar en un Sistema de Facturas?</h3>
      <ul>
        <li><strong>Cumplimiento Fiscal:</strong> Debe generar facturas legales y válidas</li>
        <li><strong>Seguridad:</strong> Encriptación y respaldos automáticos</li>
        <li><strong>Automatización:</strong> Recordatorios de cobro, secuencias automáticas</li>
      </ul>
      <div class="cta-box bg-blue-500/10 border border-blue-500/20 p-8 rounded-3xl my-10 text-center">
        <h4 class="text-blue-400 font-bold mb-4">💡 Nuestro Sistema de Facturas</h4>
        <p>Generación automática de CFDI, timbrado digital certificado y automatización de cobranza.</p>
      </div>
    `
  },
  {
    id: 3,
    title: "5 Errores Costosos en Gestión de Inventarios que Puedes Evitar",
    excerpt: "Descubre los errores más comunes en inventarios y cómo un sistema automatizado te ahorra miles.",
    date: "10 Ene 2024",
    category: "Tips & Consejos",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
    views: "6.0K",
    content: `
      <h3>🚨 Error #1: Conteo Manual y Desactualizado</h3>
      <p>Pérdidas de hasta $20,000 anuales por stock fantasma o duplicado.</p>
      <h3>🚨 Error #2: No Saber Cuándo Reabastecer</h3>
      <p>Pérdida de ventas por quiebre de stock o capital inmovilizado por exceso.</p>
      <div class="cta-box border border-blue-500/20 p-8 rounded-3xl my-10">
        <h4>✅ La Solución: Sistema de Inventarios Inteligente</h4>
        <p>✓ Rastreo en tiempo real, alertas automáticas de bajo stock y control de vencimientos.</p>
      </div>
    `
  },
  {
    id: 4,
    title: "¿Por Qué los Restaurantes Necesitan un POS Moderno en 2024?",
    excerpt: "Analicemos por qué un POS tradicional ya no es suficiente y qué características debe tener.",
    date: "8 Ene 2024",
    category: "Industria",
    readTime: "7 min",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
    views: "4.2K",
    content: `
      <h3>⚖️ POS Antiguo vs. POS Moderno</h3>
      <p>Un POS moderno permite integrar delivery (Uber Eats, PedidosYa), gestionar recetas y ver datos en tiempo real desde cualquier tablet.</p>
      <div class="cta-box border border-blue-500/20 p-8 rounded-3xl my-10">
        <h4>📈 Caso de Éxito en Restaurantes</h4>
        <p>Aumento de velocidad de servicio en 40% y reducción de errores en 90%.</p>
      </div>
    `
  },
  {
    id: 5,
    title: "Seguridad en Sistemas Web: ¿Qué Debes Saber?",
    excerpt: "Guía de seguridad esencial para proteger tu información empresarial online.",
    date: "5 Ene 2024",
    category: "Seguridad",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    views: "6.3K",
    content: `
      <h3>⚠️ ¿Por Qué la Seguridad es Crítica?</h3>
      <p>Un ataque puede costar la reputación y confianza de años. ISO 27001 y GDPR no son opcionales.</p>
      <ul>
        <li>✓ Encriptación SSL (HTTPS)</li>
        <li>✓ Backup automático diario</li>
        <li>✓ Firewall y protección DDoS</li>
      </ul>
    `
  },
  {
    id: 6,
    title: "Desarrollo Personalizado vs. Plataforma SaaS: ¿Cuál Elegir?",
    excerpt: "Análisis detallado de costos, tiempos y beneficios de cada opción para tu negocio.",
    date: "2 Ene 2024",
    category: "Estrategia",
    readTime: "9 min",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    views: "7.5K",
    content: `
      <div class="cta-box border border-blue-500/20 p-8 rounded-3xl my-10">
        <h4 class="text-blue-400 font-bold mb-4">💰 Análisis de Costos (3 Años)</h4>
        <p><strong>Desarrollo Custom:</strong> $62,000 aprox.</p>
        <p><strong>Plataforma SaaS:</strong> $12,764 aprox.</p>
      </div>
      <p>Para PYMES, la escalabilidad y soporte de un SaaS suele ser la opción ganadora.</p>
    `
  },
  {
    id: 7,
    title: "Cómo Automatizar la Cobranza y Reducir Deuda Incobrable",
    excerpt: "Estrategias y herramientas para cobrar más rápido y tener mejor cash flow.",
    date: "1 Ene 2024",
    category: "Tips & Consejos",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800",
    views: "3.2K",
    content: `
      <p>La deuda incobrable afecta al 20% de las ventas a crédito. Automatizar recordatorios es vital.</p>
      <ul>
        <li>✓ Envío automático de facturas</li>
        <li>✓ Recordatorios a 1, 7 y 14 días</li>
        <li>✓ Portal de pagos online</li>
      </ul>
    `
  },
  {
    id: 8,
    title: "E-commerce 2024: ¿Qué Necesitas Para Vender Online Exitosamente?",
    excerpt: "Guía completa de elementos esenciales para una tienda online profesional.",
    date: "28 Dic 2023",
    category: "Industria",
    readTime: "7 min",
    image: "https://images.unsplash.com/photo-1556742049-02e45308b01e?auto=format&fit=crop&q=80&w=800",
    views: "4.8K",
    content: `
      <h3>🛒 Elementos Esenciales</h3>
      <ul>
        <li>✓ Gateway de pagos seguro</li>
        <li>✓ Inventarios integrados</li>
        <li>✓ Gestión de envíos automatizada</li>
      </ul>
    `
  },
  {
    id: 9,
    title: "Clínicas y Consultorios: ¿Cómo Gestionar Pacientes Efectivamente?",
    excerpt: "Sistema de gestión de pacientes para optimizar tu clínica o consultorio.",
    date: "25 Dic 2023",
    category: "Industria",
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
    views: "2.9K",
    content: `
      <h3>📋 Clínica Digital</h3>
      <p>Historial médico digital, citas automáticas y recetas digitales integradas.</p>
    `
  },
  {
    id: 10,
    title: "Retail: Cómo Integrar Online y Tienda Física",
    excerpt: "Estrategia omnichannel para tiendas que quieren vender en línea y tienda física.",
    date: "22 Dic 2023",
    category: "Estrategia",
    readTime: "7 min",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800",
    views: "3.5K",
    content: `
      <h3>🔗 Omnichannel Retail</h3>
      <p>Sincroniza inventarios entre tu tienda física y online para evitar quiebres de stock.</p>
    `
  },
  {
    id: 11,
    title: "Integración de Pasarelas de Pago: Guía Técnica 2024",
    excerpt: "Cómo integrar Stripe, PayPal, Mercado Pago y más en tu sistema.",
    date: "20 Dic 2023",
    category: "Guías Prácticas",
    readTime: "8 min",
    image: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&q=80&w=800",
    views: "5.2K",
    content: `
      <h3>💳 Pasarelas Modernas</h3>
      <p>Stripe y Mercado Pago lideran la región por su facilidad de integración y bajas tasas.</p>
    `
  },
  {
    id: 12,
    title: "Analytics y Reportes: Cómo Tomar Decisiones Basadas en Datos",
    excerpt: "Uso avanzado de datos y analytics para optimizar tu negocio.",
    date: "18 Dic 2023",
    category: "Guías Prácticas",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    views: "4.1K",
    content: `
      <h3>📊 Data-Driven Business</h3>
      <p>Análisis de ingresos, rentabilidad y LTV (Lifetime Value) para escalar tu negocio.</p>
    `
  }
];

// --- Integrations Data ---
const INTEGRATIONS_DATA = {
  "Pasarelas": [
    { name: "Stripe", icon: "💳", desc: "Pagos online con tarjeta crédito/débito en 135+ países" },
    { name: "PayPal", icon: "🅿️", desc: "Billetera digital y pagos recurrentes" },
    { name: "Mercado Pago", icon: "🇲🇽", desc: "La plataforma #1 en Latinoamérica" },
    { name: "Openpay", icon: "🔐", desc: "Financiamiento y pagos seguros" },
    { name: "Conekta", icon: "🏦", desc: "Procesador de pagos para México" },
    { name: "2Checkout", icon: "💰", desc: "Pagos globales y soporte multimoneda" }
  ],
  "Logística": [
    { name: "FedEx", icon: "🚚", desc: "Envíos internacionales confiables" },
    { name: "DHL", icon: "📦", desc: "Rastreo en tiempo real" },
    { name: "Shipit", icon: "🎯", desc: "Envíos locales en Latinoamérica" },
    { name: "Loggi", icon: "🚛", desc: "Logística urbana en Brasil y LatAm" },
    { name: "Easypost", icon: "🌍", desc: "Múltiples carriers en una plataforma" },
    { name: "Google Maps", icon: "📍", desc: "Geolocalización y rutas optimizadas" }
  ],
  "Marketplaces": [
    { name: "Booking.com", icon: "🏨", desc: "Sincronización de disponibilidad en tiempo real" },
    { name: "Airbnb", icon: "🏠", desc: "Gestión de propiedades y reservas" },
    { name: "Uber Eats", icon: "🍔", desc: "Integración para restaurantes" },
    { name: "Pedidos Ya", icon: "🛵", desc: "Plataforma de delivery en LatAm" },
    { name: "Amazon", icon: "🛒", desc: "Venta en Amazon desde tu panel" },
    { name: "eBay", icon: "🌐", desc: "Gestión centralizada de inventario" }
  ],
  "Herramientas": [
    { name: "Google Analytics", icon: "📊", desc: "Análisis detallado de visitantes y comportamiento" },
    { name: "Mailchimp", icon: "📧", desc: "Email marketing y automatización" },
    { name: "Slack", icon: "💬", desc: "Notificaciones de órdenes y alertas" },
    { name: "Twilio", icon: "📞", desc: "SMS y notificaciones automatizadas" },
    { name: "Zapier", icon: "📋", desc: "Automatización con 5,000+ apps" },
    { name: "Contabilidad", icon: "🏦", desc: "Exportar a Excel, QuickBooks, SAP" }
  ]
};

export default function BlogPage() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [heroConfig, setHeroConfig] = useState<BlogHeroConfig>(DEFAULT_HERO_CONFIG);
  const [activeTab, setActiveTab] = useState("Pasarelas");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    const loadHeroConfig = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/blog/hero`);
        if (!response.ok) return;
        const data = await response.json();
        if (isMounted) setHeroConfig(normalizeHeroConfig(data));
      } catch (error) {
        console.error("Error loading blog hero config", error);
      }
    };

    void loadHeroConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  const showHeroVideo = heroConfig.media_type === "video" && heroConfig.background_video_url.trim().length > 0;
  const heroCardTags = useMemo(() => {
    const tags = parseCardTags(heroConfig.card_tags || "");
    return tags.length > 0 ? tags : parseCardTags(DEFAULT_HERO_CONFIG.card_tags);
  }, [heroConfig.card_tags]);
  const postsPerPage = 6; // Ajustado para mejor visualización

  const filteredPosts = MOCK_POSTS.filter(post => {
    const matchesCategory = activeCategory === "Todos" || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  return (
    <div className="blog-page-wrapper">
      {/* 1. HERO SECTION - FEATURED ARTICLE */}
      <section className="hero-gradient pt-40 pb-24 relative overflow-hidden">
        {showHeroVideo ? (
          <video
            className="hero-bg-media"
            src={heroConfig.background_video_url}
            poster={heroConfig.background_image_url || DEFAULT_HERO_CONFIG.background_image_url}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <Image
            src={heroConfig.background_image_url || DEFAULT_HERO_CONFIG.background_image_url}
            alt="Blog hero background"
            fill
            priority
            unoptimized
            className="hero-bg-media"
          />
        )}
        <div className="hero-bg-overlay" />
        <div className="hero-grid-overlay" />

        <div className="blog-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row gap-16 items-center"
          >
            <div className="lg:w-1/2 hero-copy">
              <span className="hero-badge">
                ARTICULO DESTACADO
              </span>
              <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight">
                El Futuro del{" "}
                <span className="gradient-text">Software Engineering</span>{" "}
                en la era de la IA
              </h1>
              <p className="text-slate-200/90 text-xl mb-10 leading-relaxed max-w-xl">
                Analisis profundo sobre como los modelos fundacionales estan redefiniendo el ciclo de vida de desarrollo.
              </p>
              <div className="flex items-center gap-6 flex-wrap">
                <Link href="/blog" className="cta-button px-10 py-4 rounded-2xl text-white font-bold flex items-center gap-3">
                  Leer Ahora <FaChevronRight className="text-xs" />
                </Link>
                <div className="flex items-center gap-3 text-slate-300/80 text-sm">
                  <FaClock /> 15 min de lectura
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="hero-media-shell">
                {showHeroVideo ? (
                  <video
                    className="hero-media-content"
                    src={heroConfig.background_video_url}
                    poster={heroConfig.background_image_url || DEFAULT_HERO_CONFIG.background_image_url}
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <Image
                    src={heroConfig.background_image_url || DEFAULT_HERO_CONFIG.background_image_url}
                    alt="Hero media"
                    fill
                    unoptimized
                    className="hero-media-content"
                  />
                )}
                <div className="hero-media-vignette" />
              </div>

              <div className="hero-media-glow hero-media-glow--blue" />
              <div className="hero-media-glow hero-media-glow--violet" />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="hero-feature-card"
              >
                <p className="hero-feature-kicker">{heroConfig.card_kicker.toUpperCase()}</p>
                <h3>{heroConfig.card_title}</h3>
                <p>{heroConfig.card_description}</p>
                <div className="hero-feature-tags">
                  {heroCardTags.map((tag) => (
                    <span key={tag}>{tag.toUpperCase()}</span>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. STATS SECTION (Integrated from requested HTML) */}
      <section className="py-32 relative overflow-hidden bg-slate-900/30 border-y border-white/5">
        <div className="blog-container">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 italic">📊 Números Que Hablan Por Sí Solos</h2>
            <p className="text-slate-400 text-lg">Confianza de miles de empresas en Latinoamérica</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8 mb-20">
            {[
              { icon: "🏢", val: "5,200+", label: "Empresas Activas", desc: "En 12 países" },
              { icon: "💳", val: "$850M+", label: "Transacciones", desc: "Procesadas en 2023" },
              { icon: "📈", val: "99.98%", label: "Uptime", desc: "Garantizado" },
              { icon: "👥", val: "125K+", label: "Usuarios Activos", desc: "Usando nuestros sistemas" },
              { icon: "⭐", val: "4.8/5", label: "Rating Promedio", desc: "En nuestros productos" },
              { icon: "🎯", val: "24/7", label: "Soporte Técnico", desc: "En español" }
            ].map((stat, i) => (
              <div key={i} className="article-card p-8 rounded-[2rem] text-center group hover:border-blue-500/50 transition-all">
                <div className="text-5xl mb-6">{stat.icon}</div>
                <div className="text-3xl font-bold text-blue-400 mb-2 tracking-tighter">{stat.val}</div>
                <div className="text-white text-sm font-bold mb-2">{stat.label}</div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">{stat.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-12 bg-slate-950/50 rounded-[3rem] border border-white/5">
            {[
              { icon: "✅", title: "Implementación en 7 días", desc: "Setup rápido y sin complicaciones" },
              { icon: "✅", title: "ROI Promedio", desc: "Recuperan inversión en 3-4 meses" },
              { icon: "✅", title: "Seguridad", desc: "Certificación ISO 27001 y GDPR" },
              { icon: "✅", title: "Escalabilidad", desc: "Startup hasta Fortune 500" }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <span className="text-blue-500 text-lg">{item.icon}</span>
                <div>
                  <h4 className="text-white font-bold text-sm mb-1">{item.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. INTEGRATIONS SECTION (Tabs) */}
      <section className="py-32 bg-slate-950">
        <div className="blog-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 italic">🔗 Integraciones y Partners Confiables</h2>
            <p className="text-slate-400 text-lg">Conecta con las herramientas que ya usas</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-16 border-b border-white/5 pb-8">
            {["Pasarelas", "Logística", "Marketplaces", "Herramientas"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all border ${activeTab === tab
                  ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                  : "bg-white/5 border-white/10 text-slate-400 hover:border-blue-500/30"
                  }`}
              >
                {tab === "Pasarelas" && "💳 "}
                {tab === "Logística" && "🚚 "}
                {tab === "Marketplaces" && "🛍️ "}
                {tab === "Herramientas" && "🔧 "}
                {tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {(INTEGRATIONS_DATA[activeTab as keyof typeof INTEGRATIONS_DATA] || []).map((item, i) => (
                <div key={i} className="article-card p-10 rounded-[2.5rem] group">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-4xl group-hover:bg-blue-500/10 transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors">{item.name}</h3>
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1 block">✓ Integrado</span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          <div className="mt-24 p-12 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-[3rem] text-center">
            <h3 className="text-3xl font-bold mb-4 text-white italic">¿Necesitas una integración personalizada?</h3>
            <p className="text-slate-400 mb-10 max-w-2xl mx-auto">
              Nuestro equipo de developers puede crear integraciones custom para tus necesidades específicas y flujos de trabajo particulares.
            </p>
            <button className="cta-button px-12 py-5 rounded-2xl text-white font-bold text-lg shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1">
              Solicitar Integración Custom
            </button>
          </div>
        </div>
      </section>
      {/* 4. MAIN CONTENT (GRID + SIDEBAR) */}
      <section className="py-32 bg-slate-950">
        <div className="blog-container">
          <div className="flex flex-col lg:flex-row gap-16">

            {/* MAIN ARTICLES GRID */}
            <main className="lg:w-2/3">
              <div className="breadcrumb text-slate-500 text-xs mb-8 flex items-center gap-2">
                <span>🏠 Inicio</span> / <span>📚 Blog</span> / <span className="text-blue-400">{activeCategory}</span>
              </div>

              <div className="blog-header mb-12">
                <h1 className="text-4xl lg:text-6xl font-bold mb-6 italic">📚 Blog de Sistemas Web</h1>
                <p className="text-slate-400">Guías, Tips, Casos de Éxito y Soluciones para Transformar tu Negocio Digital</p>
              </div>

              {/* Categorías (Filtros) */}
              <div className="flex flex-wrap gap-3 mb-12">
                {["Todos", "Casos de Éxito", "Guías Prácticas", "Tips & Consejos", "Industria", "Seguridad", "Estrategia"].map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                    className={`px-6 py-2 rounded-xl text-xs font-bold border transition-all ${activeCategory === cat
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-white/5 border-white/10 text-slate-400 hover:border-blue-500/30"
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
                      className="square-card group"
                    >
                      <div className="square-image">
                        <Image src={post.image} alt={post.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                        <span className="absolute top-6 right-6 px-4 py-1.5 bg-blue-500 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest">
                          {post.category}
                        </span>
                      </div>
                      <div className="square-content">
                        <div>
                          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-bold mb-4 uppercase tracking-widest">
                            <FaCalendarAlt className="text-blue-500" /> {post.date}
                          </div>
                          <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors leading-tight">
                            {post.title}
                          </h3>
                          <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
                            {post.excerpt}
                          </p>
                        </div>
                        <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                          <button
                            onClick={() => setSelectedPost(post)}
                            className="text-blue-400 text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all"
                          >
                            Seguir Leyendo <FaChevronRight className="text-[10px]" />
                          </button>
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
                  <p className="text-slate-600 mt-4">Intenta ajustar tus parámetros de búsqueda.</p>
                </div>
              )}

              {/* Paginación */}
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

            {/* SIDEBAR COMPLETO */}
            <aside className="lg:w-1/3 space-y-12">
              {/* Búsqueda */}
              <div className="article-card p-8 rounded-[2.5rem]">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3 italic">
                  🔍 Buscar artículos
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Escribe para buscar..."
                    className="search-input w-full px-6 py-4 rounded-2xl text-white"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  />
                </div>
              </div>

              {/* Mini Stats Sidebar */}
              <div className="article-card p-8 rounded-[2.5rem]">
                <h3 className="text-xl font-bold mb-8 italic">📊 Estadísticas</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { val: "12", label: "Artículos" },
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
              <div className="article-card p-8 rounded-[2.5rem] border border-white/5">
                <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-6">
                  <span className="text-2xl">🔥</span>
                  <h3 className="text-xl font-bold text-white italic">Trending Ahora</h3>
                </div>

                <div className="space-y-8">
                  {[...MOCK_POSTS]
                    .sort((a, b) => parseFloat(b.views) - parseFloat(a.views))
                    .slice(0, 5)
                    .map((art, idx) => (
                      <div
                        key={idx}
                        className="flex gap-6 group cursor-pointer border-b border-white/5 pb-6 last:border-0 last:pb-0"
                        onClick={() => setSelectedPost(art)}
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
                      </div>
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
                <h3 className="text-xl font-bold mb-8 italic">🏷️ Etiquetas</h3>
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
                <h3 className="text-xl font-bold mb-4 text-blue-400 italic">🚀 ¿Necesitas Soluciones?</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Tenemos la solución perfecta para tu negocio. Consulta sin costo.
                </p>
                <button className="cta-button w-full py-4 rounded-2xl text-white font-bold mb-4">Solicitar Demo</button>
                <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-blue-400 font-bold text-sm">Ver Catálogo</button>
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
            <h2 className="text-4xl font-bold">Conversación (24)</h2>
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
                    Excelente artículo sobre Next.js. ¿Podrías profundizar en el uso masivo de Partial Prerendering en aplicaciones E-commerce?
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
            <h3 className="text-2xl font-bold mb-8">Deja tu opinión técnica</h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="Nombre completo" className="search-input w-full px-8 py-5 rounded-2xl shadow-inner" />
                <input type="email" placeholder="Email corporativo" className="search-input w-full px-8 py-5 rounded-2xl shadow-inner" />
              </div>
              <textarea placeholder="Tu comentario o pregunta técnica..." rows={5} className="search-input w-full px-8 py-6 rounded-3xl resize-none shadow-inner"></textarea>
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
              Recibe las últimas tendencias en ingeniería directamente en tu inbox. <br /> Sin spam, solo contenido elite.
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center max-w-2xl mx-auto">
              <input type="email" placeholder="Introduce tu email" className="search-input flex-1 px-10 py-5 rounded-2xl text-lg backdrop-blur-xl" />
              <button className="cta-button px-12 py-5 rounded-2xl text-white font-bold text-lg whitespace-nowrap">
                Unirme Ahora
              </button>
            </div>
            <p className="text-slate-500 text-xs mt-10 font-medium italic">
              * Al suscribirte, aceptas nuestra política de privacidad y términos de servicio.
            </p>
          </div>
        </div>
      </section>

      {/* 7. MODAL (Dynamic Content Viewer) */}
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
                          La clave para una infraestructura resiliente no es evitar el fallo, sino diseñar sistemas que puedan recuperarse automáticamente sin intervención humana.
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
                      <div className="text-white font-bold">Favio Jiménez</div>
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
