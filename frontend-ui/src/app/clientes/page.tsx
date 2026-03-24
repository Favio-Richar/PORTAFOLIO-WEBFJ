"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowRight,
  FaStar,
  FaRocket,
  FaHospital,
  FaShoppingBag,
  FaGraduationCap,
  FaBolt,
  FaUniversity,
  FaHardHat,
  FaCogs,
  FaServer,
  FaCode
} from "react-icons/fa";

import { INDUSTRIES } from "./constants";
import {
  GLOBAL_STATS,
  GLOBAL_RESULTS,
  IMPACT_CARD_THEMES,
  HERO_BACKGROUND_FALLBACK,
  CLIENTS_HERO_TAG,
  INDUSTRY_ICON_RAIL,
} from "./data";
import FadeInUp from "./components/FadeInUp";
import ClientDetailModal from "./components/ClientDetailModal";
import ReviewsWallSection from "./components/ReviewsWallSection";
import ClientJourneySections from "./components/ClientJourneySections";
import API_BASE from "@/lib/apiBase";
export default function ClientesPage() {

  const [filter, setFilter] = useState("todos");
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const handleCloseModal = useCallback(() => {
    setSelectedClient(null);
  }, []);

  const handleSelectClient = useCallback((client: any) => {
    setSelectedClient(client);
  }, []);
  const [liveClients, setLiveClients] = useState<any[]>([]);
  const [heroMediaIdx, setHeroMediaIdx] = useState(0);
  const [heroBackgroundMedia, setHeroBackgroundMedia] = useState(HERO_BACKGROUND_FALLBACK);
  const [reviewSummary, setReviewSummary] = useState({ average: 4.9, total: 50 });
  const [currentPage, setCurrentPage] = useState(1);
  const [stopScroll, setStopScroll] = useState(false);
  const ITEMS_PER_PAGE = 12; // Aumentamos para que la pasarela tenga más contenido

  const sanitizeAssetUrl = (rawValue?: string | null) => {
    const value = String(rawValue || "").trim();
    if (!value) return null;
    const lower = value.toLowerCase();
    if (lower.includes("via.placeholder.com") || lower.includes("placehold.co")) return null;
    if (
      lower.startsWith("http://") ||
      lower.startsWith("https://") ||
      lower.startsWith("data:image/") ||
      lower.startsWith("/uploads/")
    ) {
      return value;
    }
    return null;
  };

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch(`${API_BASE}/api/casos-exito`);
        if (res.ok) {
          const data = await res.json();
          const normalized = data.map((c: any) => {
            const industry = (c.category || "tecnología").toLowerCase();
            let icon = <FaRocket />;
            let color = "#0ea5e9";

            if (industry === "crm-erp") { icon = <FaCogs />; color = "#10b981"; }
            else if (industry === "infraestructura-cloud") { icon = <FaServer />; color = "#0ea5e9"; }
            else if (industry === "apps-mobile") { icon = <FaRocket />; color = "#ef4444"; }
            else if (industry === "agencias-digitales") { icon = <FaShoppingBag />; color = "#f59e0b"; }
            else if (industry === "sistemas-web") { icon = <FaCode />; color = "#8b5cf6"; }
            else if (c.title?.includes("GreenEnergy")) { icon = <FaBolt />; color = "#fbbf24"; }

            // Consolidate all media (Hero Image, Hero Video, Gallery)
            const gallery = typeof c.media === 'string' ? JSON.parse(c.media) : (c.media || []);
            const allMedia = [];

            // 1. Add Hero Video if exists
            const safeVideoUrl = sanitizeAssetUrl(c.video_url);
            if (safeVideoUrl) {
              allMedia.push({ type: 'video', url: safeVideoUrl });
            }
            // 2. Add Hero Image if exists
            const safeImageUrl = sanitizeAssetUrl(c.image_url);
            if (safeImageUrl) {
              allMedia.push({ type: 'image', url: safeImageUrl });
            }
            // 3. Add Gallery items, avoiding duplicates with hero items
            gallery.forEach((item: any) => {
              const mediaUrl = sanitizeAssetUrl(item?.url);
              if (mediaUrl && mediaUrl !== safeImageUrl && mediaUrl !== safeVideoUrl) {
                allMedia.push({ ...item, url: mediaUrl });
              }
            });

            // Parse structured JSON fields
            const rawMetrics = typeof c.metrics === 'string' ? JSON.parse(c.metrics) : (c.metrics || []);
            const rawServices = typeof c.services === 'string' ? JSON.parse(c.services) : (c.services || []);
            const rawTimeline = typeof c.timeline === 'string' ? JSON.parse(c.timeline) : (c.timeline || []);

            // First image from allMedia for the card thumbnail
            const cardThumb = sanitizeAssetUrl(allMedia.find(m => m.type === 'image')?.url);
            const safeLogoUrl = sanitizeAssetUrl(c.logo_url);

            return {
              ...c,
              name: c.company_name || c.title || c.name || "Sin título",
              industry,
              image: cardThumb || safeImageUrl || safeLogoUrl || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop",
              logo_url: safeLogoUrl,
              logo: icon,
              logoColor: color,
              results: typeof c.results === 'string' ? JSON.parse(c.results) : (c.results || { revenue: "+100%", users: "10K+", satisfaction: "99%" }),
              metrics: rawMetrics.length > 0 ? rawMetrics : [
                { label: "Eficiencia Operativa", before: "45%", after: "95%", improvement: 111 },
                { label: "Tiempo de Respuesta", before: "5 min", after: "30 seg", improvement: 90 },
                { label: "Satisfacción Usuario", before: "72%", after: "98%", improvement: 36 }
              ],
              // Consolidate Testimonial
              testimonial: (c.testimonial || c.description || "Desarrollamos una solución tecnológica integral que transformó digitalmente las operaciones del negocio.").replace(/["']/g, ""),
              media: allMedia,
              author: (c.client_name || c.name || "Client"),
              role: "Partner",
              year: c.year || "2024",
              services: rawServices.length > 0 ? rawServices : (() => {
                const industryServices: Record<string, string[]> = {
                  "sistemas-web": ["Arquitectura Microservicios", "Frontend High-Performance", "Backend Escalable", "Optimización de Core Web Vitals"],
                  "crm-erp": ["Implementación CRM", "Módulos ERP a medida", "Automatización de Workflow", "Integración de Inventarios"],
                  "infraestructura-cloud": ["Migración a AWS/Azure", "Orquestación Kubernetes", "Seguridad de Redes", "DevOps & CI/CD"],
                  "apps-mobile": ["Apps Nativas iOS/Android", "Desarrollo Multiplataforma", "Sincronización Offline", "UX/UI Mobile First"],
                  "agencias-digitales": ["Ecosistemas para Agencias", "Herramientas de Operación", "Dashboard de Métricas", "Sistemas de Gestión de Leads"]
                };
                const industryKey = String(industry || "")
                  .toLowerCase()
                  .replace(/á|á/g, "a")
                  .replace(/é|é/g, "e")
                  .replace(/í|í/g, "i")
                  .replace(/ó|ó/g, "o")
                  .replace(/ú|ú/g, "u")
                  .replace(/ñ|ñ/g, "n");

                return industryServices[industryKey] || ["Desarrollo Web", "Arquitectura Cloud", "Consultoría Tech", "Optimización"];
              })(),
              timeline: rawTimeline.length > 0 ? rawTimeline : [
                { phase: "Análisis y Diseño UX/UI", duration: "2 semanas", status: "completed" },
                { phase: "Desarrollo Backend & APIs", duration: "4 semanas", status: "completed" },
                { phase: "Desarrollo Frontend", duration: "4 semanas", status: "completed" },
                { phase: "Testing y QA", duration: "2 semanas", status: "completed" },
                { phase: "Deployment y Capacitación", duration: "1 semana", status: "completed" }
              ]
            };
          });
          setLiveClients(normalized);
        }
      } catch (e) {
        console.error("Error fetching projects", e);
      }
    }
    fetchProjects();
  }, []);

  // Filtrar clientes según la industria seleccionada
  const filteredClients = (liveClients || []).filter(c => filter === "todos" || c.industry === filter);

  // Calcular paginación
  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayClients = filteredClients.slice(startIndex, endIndex);

  useEffect(() => {
    const loadHeroMedia = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/media`);
        if (!res.ok) return;
        const all = await res.json();
        const heroMedia = (all || [])
          .filter((m: any) => m.active && (m.description || "").includes(CLIENTS_HERO_TAG))
          .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
          .map((m: any) => ({
            type: m.type === "video" ? "video" : "image",
            url: m.url,
            alt: m.title || "Clientes hero background",
          }));

        if (heroMedia.length > 0) {
          setHeroBackgroundMedia(heroMedia);
          setHeroMediaIdx(0);
        }
      } catch (error) {
        console.error("Error loading clients hero media:", error);
      }
    };

    loadHeroMedia();
  }, []);

  useEffect(() => {
    if (heroBackgroundMedia.length <= 1) return;
    const interval = setInterval(() => {
      setHeroMediaIdx((prev) => (prev + 1) % heroBackgroundMedia.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [heroBackgroundMedia.length]);

  return (
    <div className="clients-elite-wrapper">
      <style>{`
        .marquee-inner {
            animation: marqueeScroll linear infinite;
        }

        @keyframes marqueeScroll {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
        }
      `}</style>
      {/* 1. HERO SECTION */}
      <header className="hero-gradient pt-40 pb-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroBackgroundMedia[heroMediaIdx].url}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="absolute inset-0"
            >
              {heroBackgroundMedia[heroMediaIdx].type === "video" ? (
                <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                  <source src={heroBackgroundMedia[heroMediaIdx].url} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={heroBackgroundMedia[heroMediaIdx].url}
                  alt={heroBackgroundMedia[heroMediaIdx].alt || "Clientes hero background"}
                  className="w-full h-full object-cover"
                />
              )}
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/75 via-[#0b1220]/75 to-[#060b14]/85 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(99,102,241,0.2),transparent_45%),radial-gradient(circle_at_75%_82%,rgba(14,165,233,0.18),transparent_48%)]" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <FadeInUp>
            <div className="inline-block px-6 py-2 bg-white/10 border border-white/10 rounded-full mb-8 backdrop-blur-md">
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-200">Portafolio de clientes</span>
            </div>
            <h1 className="text-6xl md:text-[5.5rem] font-bold leading-[1.1] mb-8 tracking-tighter text-white">
              Soluciones digitales que <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-300">escalan</span> tu negocio
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-16 leading-relaxed font-medium">
              Ingeniería de software a medida para empresas que exigen <span className="text-white font-black">automatización, seguridad y plataformas escalables</span> con resultados medibles.
            </p>

            {/* Rating Badge */}
            <div className="inline-flex items-center gap-4 bg-white/10 px-8 py-4 rounded-full border border-white/10 mb-20 backdrop-blur-xl">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => <FaStar key={i} className="text-yellow-500 text-xl" />)}
              </div>
              <span className="text-2xl font-bold text-white">{reviewSummary.average.toFixed(1)}</span>
              <span className="text-slate-300 text-sm font-bold uppercase tracking-widest">({reviewSummary.total} reseñas)</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/contacto"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black uppercase tracking-[0.18em] text-xs shadow-[0_18px_40px_rgba(79,70,229,0.35)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(79,70,229,0.45)]"
              >
                Agendar diagnóstico
                <FaArrowRight className="text-[11px] group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/clientes/casos-completos"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/15 bg-white/5 text-white font-black uppercase tracking-[0.18em] text-xs transition-all hover:bg-white/10"
              >
                Ver casos completos
              </Link>
            </div>
          </FadeInUp>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {GLOBAL_STATS.map((stat, i) => (
              <FadeInUp key={i} delay={i * 0.1}>
                <div className="metric-card relative aspect-square flex flex-col items-center justify-center p-8 rounded-[2.5rem] bg-white/5 backdrop-blur-md border border-white/10 shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="relative z-10 text-5xl mb-4 grayscale brightness-75 opacity-90">{stat.icon}</div>
                  <div className="relative z-10 text-4xl font-black text-white mb-2">{stat.number}</div>
                  <div className="relative z-10 text-xs text-slate-300 font-bold uppercase tracking-widest">{stat.label}</div>
                </div>
              </FadeInUp>
            ))}
          </div>

          {/* Icon Runway */}
          <div className="logo-marquee mt-24 py-7 px-6 bg-gradient-to-r from-[#0a1728]/95 via-[#11253c]/95 to-[#0a1728]/95 border border-cyan-400/30 rounded-3xl backdrop-blur-md overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
            <div className="logo-track">
              {[...INDUSTRY_ICON_RAIL, ...INDUSTRY_ICON_RAIL].map((item, i) => (
                <span
                  key={i}
                  title={item.label}
                  className="inline-flex items-center justify-center mx-9 h-14 w-14 rounded-2xl border border-white/10 bg-[#0c1c2e]/80 opacity-95 hover:opacity-100 hover:scale-110 transition-all duration-300"
                  style={{ boxShadow: `0 0 24px ${item.glow}` }}
                >
                  <span
                    className="text-[2rem]"
                    style={{ color: item.color, filter: `drop-shadow(0 0 8px ${item.glow})` }}
                  >
                    {item.icon}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* 2. GLOBAL RESULTS (IMPACTO GLOBAL) */}
      <section className="py-32 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <FadeInUp>
              <div className="inline-block px-6 py-2 bg-cyan-500/10 border border-cyan-400/60 rounded-full mb-6 backdrop-blur-md">
                <span className="text-[10px] font-black tracking-widest uppercase text-cyan-300">Impacto Global</span>
              </div>
              <h2 className="text-5xl font-bold text-white tracking-tighter mb-4">Nuestro Impacto en Números</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Resultados medibles con enfoque en crecimiento, rendimiento y confianza operativa.</p>
            </FadeInUp>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {GLOBAL_RESULTS.map((res, i) => (
              <FadeInUp key={i} delay={i * 0.1}>
                <div
                  className={`group relative overflow-hidden p-12 rounded-[2.5rem] text-center bg-[linear-gradient(160deg,rgba(9,15,32,0.95),rgba(17,26,49,0.85))] border ${IMPACT_CARD_THEMES[i % IMPACT_CARD_THEMES.length].border} ${IMPACT_CARD_THEMES[i % IMPACT_CARD_THEMES.length].glow} transition-all duration-500 hover:-translate-y-2 hover:scale-[1.015]`}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.22),transparent_55%)]" />
                  <div className="absolute -inset-[1px] rounded-[2.5rem] border border-white/5 pointer-events-none" />
                  <div className="relative z-10">
                    <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl shadow-[inset_0_0_18px_rgba(255,255,255,0.06)]">
                      {res.icon}
                    </div>
                    <div className={`text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${IMPACT_CARD_THEMES[i % IMPACT_CARD_THEMES.length].value} mb-4 drop-shadow-[0_0_18px_rgba(125,211,252,0.2)]`}>
                      {res.number}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{res.label}</h3>
                    <p className="text-sm text-slate-400 mb-6">{res.description}</p>
                    <div className="inline-block px-4 py-2 bg-cyan-500/10 rounded-full text-cyan-300 text-[10px] font-black tracking-widest uppercase border border-cyan-400/30 shadow-[0_0_14px_rgba(34,211,238,0.18)]">
                      {res.trend}
                    </div>
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>


      {/* 4. SUCCESS CASES SECTION (Includes Filter and Grid) */}
      <section className="clients-cases-section">
        <div className="max-w-7xl mx-auto">
          {/* Redesigned Section Header - Asymmetric Grid */}
          <div className="relative mx-auto max-w-7xl px-4 py-20 mb-12">
            {/* Ambient Light Effect */}
            <div className="absolute -z-50 size-[500px] -top-20 -left-40 aspect-square rounded-full bg-blue-500/10 blur-[120px]"></div>
            <div className="absolute -z-50 size-[400px] bottom-0 -right-20 aspect-square rounded-full bg-cyan-500/5 blur-[100px]"></div>

            {/* Redesigned Section Header Title */}
            <FadeInUp>
              <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-cyan-300">Excelencia en ingeniería</span>
              </div>

              <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-8 tracking-tighter text-white">
                Casos de <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-400">Éxito</span> Destacados
              </h2>

              <p className="text-xl text-slate-400 max-w-4xl mb-16 leading-relaxed">
                Transformamos procesos empresariales complejos en plataformas digitales de alto rendimiento.
                Ingeniería especializada en arquitecturas escalables y sistemas CRM/ERP a medida para el crecimiento de su negocio.
              </p>
            </FadeInUp>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start mt-8">
              {/* Left Column: Main Showcase (2/3) */}
              <div className="md:col-span-2">
                <FadeInUp delay={0.1}>
                  <div className="relative group rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 aspect-[16/9]">
                    <img
                      alt="Caso destacado de ingeniería"
                      src="/img/Responsive.jpg"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Interior Shadow Overlay - Clean presentation */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-transparent to-transparent opacity-60"></div>
                  </div>
                </FadeInUp>
              </div>

              {/* Right Column: Detailed Value Prop (1/3) */}
              <div className="md:col-span-1">
                <FadeInUp delay={0.2}>
                  <div className="space-y-10">
                    {/* Featured Metric Card */}
                    <div className="relative rounded-3xl overflow-hidden border border-cyan-500/20 bg-white/5 backdrop-blur-xl p-1 shadow-2xl hover:border-cyan-500/40 transition-colors duration-500">
                      <img
                        alt="Detalle de interfaz"
                        src="/img/webdev.jpg"
                        className="w-full h-auto rounded-2xl"
                      />
                    </div>

                    {/* Detailed Text Content - Focused on Business Logic */}
                    <div className="px-1">
                      <h3 className="text-2xl font-bold text-white mb-5 tracking-tight leading-snug">
                        Optimización de <span className="text-cyan-400">Procesos</span> de Negocio
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed mb-10">
                        Centralizamos su flujo de datos y automatizamos tareas críticas,
                        permitiéndole escalar su operación con total seguridad y eficiencia tecnológica.
                      </p>

                      <div className="space-y-4 mb-10">
                        <div className="flex items-center gap-3 text-cyan-300">
                          <FaRocket className="text-sm" />
                          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-300">Escalabilidad Garantizada</span>
                        </div>
                        <div className="flex items-center gap-3 text-emerald-400">
                          <FaStar className="text-sm" />
                          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-300">Soporte Tecnológico Premium</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeInUp>
              </div>
            </div>
          </div>
        </div>



        {/* Success Cases Marquee (Pasarela) */}
        <div
          className="overflow-hidden w-full relative py-10"
          onMouseEnter={() => setStopScroll(true)}
          onMouseLeave={() => setStopScroll(false)}
        >
          {/* Gradient Mask - Left */}
          <div className="absolute left-0 top-0 h-full w-20 md:w-32 z-10 pointer-events-none bg-gradient-to-r from-[#070b14] to-transparent" />

          <div
            className="marquee-inner flex w-fit"
            style={{
              animationPlayState: stopScroll ? "paused" : "running",
              animationDuration: (displayClients.length || 1) * 5000 + "ms"
            }}
          >
            <div className="flex">
              {[...displayClients, ...displayClients].map((client: any, i) => (
                <div
                  key={`${client.id}-${i}`}
                  className="w-[28rem] mx-6 shrink-0 transition-all duration-500"
                >
                  <div
                    className="case-card group cursor-pointer"
                    onClick={() => handleSelectClient(client)}
                    style={{ '--brand-color': client.logoColor } as any}
                  >
                    {/* Card Image Banner */}
                    <div className="card-image-bg">
                      <img src={client.image} alt={client.name} className="impact-image" />
                      <div className="card-overlay" />

                      <div className="logo-badge">
                        {client.logo_url ? (
                          <img src={client.logo_url} alt={client.name} />
                        ) : (
                          <span style={{ color: client.logoColor }}>{client.logo}</span>
                        )}
                      </div>

                      <div className="industry-tag">
                        {client.industry}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="card-content">
                      <div className="card-info">
                        <h3 className="client-name">{client.company_name || client.name}</h3>
                        <div className="success-badge">CASO DE ÉXITO - {client.year}</div>
                      </div>

                      <p className="corporate-description line-clamp-3">
                        {client.testimonial || client.description}
                      </p>

                      <div className="results-grid">
                        {Object.entries(client.results).map(([key, value]: any) => (
                          <div key={key} className="result-stat">
                            <div className="stat-val">{value}</div>
                            <div className="stat-key">{key}</div>
                          </div>
                        ))}
                      </div>

                      <div className="card-action">
                        <button className="elite-view-btn">
                          VER DETALLE DEL CASO
                          <FaArrowRight />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gradient Mask - Right */}
          <div className="absolute right-0 top-0 h-full w-20 md:w-32 z-10 pointer-events-none bg-gradient-to-l from-[#070b14] to-transparent" />
        </div>
      </section>

      <ClientJourneySections />

      <ReviewsWallSection pageContext="clientes" onSummaryChange={setReviewSummary} />

      {/* 15. CTA SECTION - ULTRA-WIDE HORIZONTAL REDESIGN (REF: "ALARGADO") */}
      <section className="py-20 px-6 relative overflow-hidden bg-[#050608]">
        {/* Ambient background glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-0 left-0 w-[800px] h-[600px] bg-purple-600/5 blur-[160px] rounded-full" />
          <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-600/5 blur-[160px] rounded-full" />
        </div>

        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="p-px rounded-[2.5rem] bg-gradient-to-r from-white/10 via-white/5 to-white/10 shadow-[0_50px_100px_-30px_rgba(0,0,0,0.8)]">
            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12 py-12 md:py-14 px-10 md:px-24 rounded-[39px] bg-[#0c1222] overflow-hidden border border-white/[0.02]">
              {/* Subtle mesh background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.06),transparent_50%)]" />

              <div className="relative z-10 text-left flex-1">
                {/* Badge */}
                <div className="inline-flex items-center bg-white/[0.03] backdrop-blur-xl px-4 py-1.5 shadow-inner gap-2 rounded-full text-[9px] mb-6 border border-white/5 w-fit uppercase tracking-[0.25em] font-bold text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500/50" />
                  Con la confianza de los expertos
                </div>

                {/* Heading - RESTORED EXACT TEXT FROM WHITE REFERENCE */}
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-5 leading-[1.1] text-white tracking-tight">
                  Impulsa tu crecimiento con <br />
                  <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
                    estrategia digital y ejecución senior
                  </span>
                </h2>

                {/* Description - RESTORED EXACT TEXT FROM WHITE REFERENCE */}
                <p className="text-slate-400 max-w-2xl md:text-lg text-sm leading-relaxed font-medium opacity-80">
                  Alineamos negocio, tecnología y automatización para mejorar conversiones, elevar la eficiencia y sostener el crecimiento.
                </p>
              </div>

              {/* Action Area - Horizontal Alignment */}
              <div className="relative z-10 flex flex-col items-center lg:items-end gap-6 min-w-fit">
                <Link
                  href="/contacto"
                  className="group relative px-14 py-5 rounded-[20px] bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400 transition-all duration-500 hover:scale-105 hover:shadow-[0_20px_60px_-15px_rgba(168,85,247,0.5)] active:scale-95 shadow-xl"
                >
                  <span className="relative z-10 text-[#070b14] font-black text-sm uppercase tracking-[0.18em]">
                    Agendar diagnóstico
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-[20px]" />
                </Link>

                <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
                  <span className="h-1.2 w-1.2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-[0.2em]">Respuesta en {"<"} 24 horas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MODAL DETAIL - CLIENT */}
      <AnimatePresence>
        {
          selectedClient && (
            <ClientDetailModal
              key={selectedClient?.id ?? "selected-client"}
              selectedClient={selectedClient}
              onClose={handleCloseModal}
            />
          )
        }
      </AnimatePresence >

    </div >
  );
}








