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
  const ITEMS_PER_PAGE = 6;

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
        const res = await fetch("http://localhost:8000/api/casos-exito");
        if (res.ok) {
          const data = await res.json();
          const normalized = data.map((c: any) => {
            const industry = (c.category || "tecnología").toLowerCase();
            let icon = <FaRocket />;
            let color = "#0ea5e9";

            if (industry === "finanzas") { icon = <FaUniversity />; color = "#10b981"; }
            else if (industry === "salud") { icon = <FaHospital />; color = "#ef4444"; }
            else if (industry === "retail") { icon = <FaShoppingBag />; color = "#f59e0b"; }
            else if (industry === "educación") { icon = <FaGraduationCap />; color = "#8b5cf6"; }
            else if (industry === "construcción") { icon = <FaHardHat />; color = "#fbbf24"; }
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
                  finanzas: ["Desarrollo Web Bancario", "Arquitectura Cloud", "Seguridad Financiera", "APIs de Pago"],
                  salud: ["Telemedicina", "Historia Clínica Digital", "Cumplimiento HIPAA", "Analytics Médico"],
                  retail: ["E-commerce Enterprise", "App Móvil Nativa", "Integración ERP/CRM", "Marketing Automation"],
                  educacion: ["Plataforma LMS", "Aulas Virtuales", "Gamificación Educativa", "Certificaciones Digitales"],
                  construccion: ["BIM Web", "Gestión de Proyectos", "IoT Construcción", "Realidad Aumentada"],
                  tecnologia: ["Desarrollo Full-Stack", "Cloud Computing", "DevOps & CI/CD", "Machine Learning"]
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
        const res = await fetch("http://localhost:8000/api/media");
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
          {/* Overlays removed - background images/videos should be fully visible */}
        </div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <FadeInUp>
            <div className="inline-block px-6 py-2 bg-white/5 border border-cyan-500/60 rounded-full mb-8 backdrop-blur-md">
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-cyan-300">Portafolio Clientes</span>
            </div>
            <h1 className="text-6xl md:text-[5.5rem] font-bold leading-[1.1] mb-8 tracking-tighter text-white">
              Clientes que <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-400">Transforman</span> Industrias
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-16 leading-relaxed">
              Diseñamos y escalamos plataformas digitales para empresas que exigen resultados reales, seguridad operativa y crecimiento medible. <span className="text-white">Tecnología aplicada con enfoque de negocio.</span>
            </p>

            {/* Rating Badge */}
            <div className="inline-flex items-center gap-4 bg-white/5 px-8 py-4 rounded-full border-2 border-cyan-500/40 mb-20 backdrop-blur-xl">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => <FaStar key={i} className="text-yellow-400 text-xl" />)}
              </div>
              <span className="text-2xl font-bold text-white">{reviewSummary.average.toFixed(1)}</span>
              <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">({reviewSummary.total} reviews)</span>
            </div>
          </FadeInUp>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {GLOBAL_STATS.map((stat, i) => (
              <FadeInUp key={i} delay={i * 0.1}>
                <div className="metric-card relative aspect-square flex flex-col items-center justify-center p-8 rounded-[2.5rem] bg-gradient-to-br from-[#0b1426]/92 via-[#101b31]/90 to-[#0a1324]/92 border border-cyan-400/45 shadow-[0_0_0_1px_rgba(34,211,238,0.16),0_0_26px_rgba(6,182,212,0.2)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/80 hover:shadow-[0_0_0_1px_rgba(125,211,252,0.28),0_0_34px_rgba(56,189,248,0.34)]">
                  <div className="absolute inset-[1px] rounded-[2.4rem] bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.1),transparent_56%)] pointer-events-none" />
                  <div className="relative z-10 text-5xl mb-4">{stat.icon}</div>
                  <div className="relative z-10 text-4xl font-black text-cyan-300 mb-2 drop-shadow-[0_0_12px_rgba(56,189,248,0.35)]">{stat.number}</div>
                  <div className="relative z-10 text-xs text-slate-200 font-bold uppercase tracking-widest">{stat.label}</div>
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
          {/* Section Header */}
          <div className="section-header">
            <FadeInUp>
              <h2 className="section-title">Casos de Éxito Destacados</h2>
              <p className="section-description">
                Empresas y negocios que confiaron en nuestra ingeniería digital para mejorar su gestión,
                optimizar procesos y crecer de manera sostenible. Cada colaboración refleja soluciones prácticas,
                diseñadas a la medida de pequeñas y medianas empresas que buscan profesionalizar y potenciar su operación.
              </p>
            </FadeInUp>
          </div>

          {/* Tabs / Filter Menu */}
          <div className="filter-tabs-container">
            <FadeInUp delay={0.1}>
              <div className="tabs-wrapper" role="tablist" aria-label="Categorías de casos de éxito">
                {INDUSTRIES.map(ind => (
                  <button
                    key={ind}
                    role="tab"
                    aria-selected={filter === ind}
                    onClick={() => {
                      setFilter(ind);
                      setCurrentPage(1);
                    }}
                    className={`filter-tab ${filter === ind ? 'active' : ''}`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </FadeInUp>
          </div>

          {/* Grid of Cards */}
          <div className="cases-grid">
            <AnimatePresence mode="popLayout">
              {displayClients.map((client: any, i) => (
                <motion.div
                  key={client.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="h-full"
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
                        <div className="success-badge">CASO DE EXITO - {client.year}</div>
                      </div>

                      <p className="corporate-description">
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
                </motion.div>
              ))}
            </AnimatePresence>
          </div>


          {/* Pagination Counter - Functional */}
          <FadeInUp delay={0.3}>
            <div className="pagination-container">
              <div className="page-counter">
                <div className="counter-label">
                  Página <span>{currentPage}</span> DE {totalPages || 1}
                </div>
                <div className="counter-nav">
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`nav-dot ${idx === currentPage - 1 ? 'active' : ''}`}
                      onClick={() => setCurrentPage(idx + 1)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </div>
              </div>
              <div className="pagination-buttons">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="elite-nav-btn prev-btn"
                >
                  <span className="btn-icon">&larr;</span> Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="elite-nav-btn next-btn"
                >
                  Siguiente <span className="btn-icon">&rarr;</span>
                </button>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      <ClientJourneySections />

      <ReviewsWallSection pageContext="clientes" onSummaryChange={setReviewSummary} />

      {/* 15. CTA SECTION */}
      <section className="py-36 px-6 relative overflow-hidden border-t border-white/10 bg-[radial-gradient(circle_at_12%_18%,rgba(14,116,144,0.2),transparent_45%),radial-gradient(circle_at_88%_82%,rgba(15,23,42,0.55),transparent_50%),linear-gradient(145deg,#070b14_0%,#0a1220_45%,#0b1622_100%)]">
        <div className="pointer-events-none absolute -top-24 left-10 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-12 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="max-w-5xl mx-auto relative z-10">
          <FadeInUp>
            <div className="mx-auto text-center rounded-[2.8rem] border border-white/15 bg-[linear-gradient(165deg,rgba(11,19,31,0.9),rgba(8,15,25,0.95))] backdrop-blur-xl p-10 md:p-14 shadow-[0_32px_90px_rgba(0,0,0,0.5)]">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-300/35 bg-amber-950/20 mb-7">
                <span className="h-2 w-2 rounded-full bg-amber-200" />
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-100">
                  Impulsemos tu siguiente fase
                </span>
              </div>

              <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05] mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-slate-100 to-yellow-500 drop-shadow-[0_0_18px_rgba(245,158,11,0.2)]">
                ¿Listo para ser nuestro próximo caso de éxito?
              </h2>

              <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10">
                Diseñamos soluciones con foco en crecimiento real, operación estable y resultados medibles para tu negocio.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/contacto"
                  className="group relative isolate overflow-hidden w-full sm:w-auto min-w-[240px] px-10 py-4 rounded-full border border-amber-200/35 bg-[linear-gradient(120deg,#fef3c7_0%,#f59e0b_45%,#e5e7eb_100%)] text-[#0b1220] font-black uppercase tracking-[0.16em] text-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(245,158,11,0.36)] active:translate-y-px active:scale-[0.99]"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-[130%] bg-[linear-gradient(115deg,transparent_24%,rgba(255,255,255,0.6)_48%,transparent_72%)] transition-transform duration-700 group-hover:translate-x-[130%]" />
                  <span className="relative z-10">Iniciar Proyecto</span>
                </Link>
                <Link
                  href="/clientes/casos-completos"
                  className="group relative isolate overflow-hidden w-full sm:w-auto min-w-[240px] px-10 py-4 rounded-full border border-slate-300/25 bg-[linear-gradient(140deg,rgba(148,163,184,0.08),rgba(255,255,255,0.02))] text-slate-100 font-black uppercase tracking-[0.16em] text-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-200/55 hover:shadow-[0_14px_30px_rgba(15,23,42,0.45)] active:translate-y-px active:scale-[0.99]"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-[130%] bg-[linear-gradient(115deg,transparent_24%,rgba(148,163,184,0.28)_48%,transparent_72%)] transition-transform duration-700 group-hover:translate-x-[130%]" />
                  <span className="relative z-10">Ver Casos Completos</span>
                </Link>
              </div>
            </div>
          </FadeInUp>
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








