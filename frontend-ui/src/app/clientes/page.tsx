"use client";

import React, { useState, useEffect, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowRight,
  FaCheckCircle,
  FaStar,
  FaPlus,
  FaGlobeAmericas,
  FaChartLine,
  FaShieldAlt,
  FaHeadset,
  FaRocket,
  FaGem,
  FaHospital,
  FaShoppingBag,
  FaGraduationCap,
  FaBolt,
  FaUniversity,
  FaBuilding,
  FaTools,
  FaBullseye,
  FaTrophy,
  FaLightbulb,
  FaPalette,
  FaHardHat,
  FaImages,
  FaPlayCircle,
  FaArrowLeft,
  FaComments,
  FaSearch,
  FaPencilRuler,
  FaCogs,
  FaVial,
} from "react-icons/fa";

import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineCommandLine,
  HiOutlineBeaker,
  HiOutlineRocketLaunch
} from "react-icons/hi2";

/* ================= EXACT DATA FROM HTML ================= */

const INDUSTRIES = ['todos', 'tecnología', 'finanzas', 'salud', 'retail', 'educación', 'construcción'];

/* ================= COMPONENTS ================= */

function FadeInUp({ children, delay = 0 }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// Componente para el modal de detalle para evitar re-renders globales
// Memorizado para no re-renderizar si el padre cambia (ej. el fondo del hero)
const ClientDetailModal = memo(({ selectedClient, onClose }: { selectedClient: any, onClose: () => void }) => {
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);

  // Reset idx when client changes
  useEffect(() => {
    setActiveMediaIdx(0);
  }, [selectedClient?.id]);

  if (!selectedClient) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-0 md:p-10"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#050a18] w-full h-full relative flex flex-col"
      >
        {/* Sticky Header inside Modal */}
        <div className="p-8 md:p-12 border-b border-white/5 flex justify-between items-center bg-[#050a18]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-8">
            <div
              className="text-5xl md:text-6xl filter drop-shadow-[0_0_20px_rgba(14,165,233,0.3)] bg-white/5 w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center border border-white/10"
              style={{ color: selectedClient.logoColor || 'white' }}
            >
              {selectedClient.logo}
            </div>
            <div>
              <h2 className="text-3xl md:text-5xl text-white font-[950] uppercase tracking-tight mb-2 leading-none">{selectedClient.name}</h2>
              <div className="flex gap-3">
                <span className="bg-sky-500/10 text-sky-400 px-4 py-1.5 rounded-full text-[10px] font-900 uppercase tracking-widest border border-sky-500/20">{selectedClient.industry}</span>
                <span className="bg-white/5 text-white/40 px-4 py-1.5 rounded-full text-[10px] font-900 uppercase tracking-widest border border-white/10">Proyecto {selectedClient.year}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all text-xl border border-white/10"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content - Dashboard Grid */}
        <div className="flex-1 overflow-y-auto p-12 md:p-20">
          <div className="max-w-[1600px] mx-auto">
            <div className="modal-dashboard-grid">
              {/* FEATURED MEDIA (PASARELA) - SIDE BY SIDE ON DESKTOP */}
              <div className="hero-cell media-pasarela">
                <div className="main-media-viewer">
                  {(() => {
                    const currentMedia = (selectedClient.media && selectedClient.media.length > 0)
                      ? selectedClient.media[activeMediaIdx]
                      : { url: selectedClient.image, type: 'image' };

                    if (currentMedia?.type === 'video') {
                      return (
                        <video key={currentMedia.url} autoPlay muted loop playsInline className="w-full h-full object-cover">
                          <source src={currentMedia.url} type="video/mp4" />
                        </video>
                      );
                    }
                    return <img key={currentMedia?.url} src={currentMedia?.url} alt={selectedClient.name} className="w-full h-full object-cover" />;
                  })()}

                  {/* Media Navigation Overlay */}
                  {selectedClient.media && selectedClient.media.length > 1 && (
                    <div className="media-nav-overlay">
                      <button
                        onClick={() => setActiveMediaIdx(prev => (prev - 1 + selectedClient.media.length) % selectedClient.media.length)}
                        className="nav-btn prev"
                      >
                        <FaArrowLeft />
                      </button>
                      <button
                        onClick={() => setActiveMediaIdx(prev => (prev + 1) % selectedClient.media.length)}
                        className="nav-btn next"
                      >
                        <FaArrowRight />
                      </button>
                    </div>
                  )}
                </div>

                {/* Mini Thumbnail Strip */}
                {selectedClient.media && selectedClient.media.length > 1 && (
                  <div className="media-thumbnail-strip">
                    {selectedClient.media.map((m: any, idx: number) => (
                      <div
                        key={idx}
                        className={`mini-thumb ${idx === activeMediaIdx ? 'active' : ''}`}
                        onClick={() => setActiveMediaIdx(idx)}
                      >
                        {m.type === 'video' ? (
                          <video
                            src={m.url}
                            className="w-full h-full object-cover"
                            preload="metadata"
                            muted
                          />
                        ) : (
                          <img
                            src={m.url}
                            alt={`thumbnail-${idx}`}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&h=150&fit=crop';
                            }}
                          />
                        )}
                        {m.type === 'video' && <div className="video-badge"><FaPlayCircle /></div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PROJECT VISION CELL - BOX-LESS (MINIMALIST) */}
              <div className="vision-cell minimalist-detail">
                <div className="cell-header">
                  <span className="cell-title">Visión del Proyecto</span>
                  <div className="cell-line" />
                </div>
                <p className="text-white text-3xl md:text-5xl leading-[1.2] font-900 mb-12 tracking-tighter">
                  "{selectedClient.testimonial}"
                </p>
                <div className="flex items-center gap-6 p-8 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-xl">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center text-5xl border border-white/10 shadow-2xl" style={{ color: selectedClient.logoColor }}>
                    {selectedClient.logo}
                  </div>
                  <div>
                    <div className="text-lg font-900 text-white uppercase tracking-[0.2em] mb-1">{selectedClient.author}</div>
                    <div className="text-sm font-bold text-sky-400 uppercase tracking-[0.3em] opacity-80">{selectedClient.role}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* METRICS CELL - VISUAL FLUID DESIGN (NO TABLES) */}
            <div className="metrics-cell minimalist-section">
              <div className="cell-header">
                <span className="cell-title">Impacto en Negocio</span>
                <div className="cell-line" />
              </div>
              <div className="flex flex-wrap gap-8 justify-center">
                {selectedClient.metrics.map((m: any, idx: number) => (
                  <div key={idx} className="flex-1 min-w-[280px] max-w-[350px]">
                    {/* Circular Badge with Gradient */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-purple-500/20 rounded-[2rem] blur-xl group-hover:blur-2xl transition-all" />
                      <div className="relative p-8 rounded-[2rem] bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 hover:border-sky-500/30 transition-all">
                        {/* Metric Label */}
                        <div className="flex items-center justify-between mb-6">
                          <span className="text-xs font-black text-white/50 uppercase tracking-[0.2em]">{m.label}</span>
                          <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-500/20 to-purple-500/20 border border-sky-500/30">
                            <span className="text-xs font-black text-sky-400">+{m.improvement}%</span>
                          </div>
                        </div>

                        {/* Before/After Visual Flow */}
                        <div className="flex items-center gap-6">
                          {/* Before Value */}
                          <div className="flex-1 text-center">
                            <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Antes</div>
                            <div className="text-xl font-bold text-white/40 line-through">{m.before}</div>
                          </div>

                          {/* Arrow Indicator */}
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-purple-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                              <FaArrowRight className="text-white text-sm" />
                            </div>
                          </div>

                          {/* After Value - HIGHLIGHTED */}
                          <div className="flex-1 text-center">
                            <div className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-2">Ahora</div>
                            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-400">
                              {m.after}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SOLUTIONS CELL - MINIMALIST */}
            <div className="solutions-cell minimalist-section">
              <div className="cell-header">
                <span className="cell-title">Soluciones Aplicadas</span>
                <div className="cell-line" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {selectedClient.services.map((s: any) => (
                  <div key={s} className="flex items-center gap-4 p-5 bg-white/2 rounded-2xl border border-white/5 hover:border-sky-500/30 transition-all">
                    <FaCheckCircle className="text-sky-500 text-xl" />
                    <span className="text-white/90 font-800 uppercase tracking-widest text-xs">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* MULTIMEDIA GALLERY (Hidden as it's in pasarela) */}
            <div className="gallery-cell" />

            {/* TIMELINE CELL - MINIMALIST */}
            <div className="timeline-cell minimalist-section">
              <div className="cell-header">
                <span className="cell-title">Technical Timeline</span>
                <div className="cell-line" />
              </div>
              <div className="space-y-8">
                {selectedClient.timeline.map((step: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-white/2 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${step.status === 'completed' ? 'bg-sky-500' : 'bg-purple-500 animate-pulse'}`} />
                      <div>
                        <div className="text-xs font-900 text-white uppercase tracking-widest mb-1">{step.phase}</div>
                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">{step.duration}</div>
                      </div>
                    </div>
                    <span className={`text-[8px] font-900 uppercase px-3 py-1 rounded-full border ${step.status === 'completed' ? 'border-sky-500/30 text-sky-400 bg-sky-500/5' : 'border-purple-500/30 text-purple-400 bg-purple-500/5'}`}>
                      {step.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

ClientDetailModal.displayName = "ClientDetailModal";

export default function ClientesPage() {

  const GLOBAL_STATS = [
    { number: "200+", label: "Clientes Globales", icon: <FaGlobeAmericas className="text-cyan-300" /> },
    { number: "$2.5B+", label: "Revenue Generado", icon: <FaChartLine className="text-blue-300" /> },
    { number: "99.8%", label: "Tasa de Éxito", icon: <FaShieldAlt className="text-emerald-300" /> },
    { number: "24/7", label: "Soporte Dedicado", icon: <FaHeadset className="text-sky-300" /> }
  ];

  const GLOBAL_RESULTS = [
    { number: "850+", label: "Proyectos Completados", icon: <FaCheckCircle className="text-emerald-400" />, description: "En 50+ países", trend: "+127% YoY" },
    { number: "$4.8B", label: "Revenue Cliente Generado", icon: <FaChartLine className="text-blue-400" />, description: "Impacto económico total", trend: "+215% crecimiento" },
    { number: "98.9%", label: "Satisfacción Cliente", icon: <FaStar className="text-yellow-400" />, description: "Promedio de calificación", trend: "4.9/5.0 estrellas" },
    { number: "15", label: "Industrias Atendidas", icon: <FaBuilding className="text-sky-400" />, description: "Experiencia diversa", trend: "Tech, Finance, Health+" },
    { number: "2.3M", label: "Usuarios Finales", icon: <FaGlobeAmericas className="text-indigo-400" />, description: "Alcance global", trend: "+340% engagement" },
    { number: "92%", label: "Retención Clientes", icon: <FaShieldAlt className="text-emerald-400" />, description: "Relaciones a largo plazo", trend: "Promedio 4.2 años" }
  ];

  const IMPACT_CARD_THEMES = [
    { border: "border-emerald-300/30", glow: "shadow-[0_0_36px_rgba(16,185,129,0.22)]", value: "from-emerald-200 to-cyan-300" },
    { border: "border-sky-300/30", glow: "shadow-[0_0_36px_rgba(56,189,248,0.24)]", value: "from-sky-200 to-indigo-300" },
    { border: "border-violet-300/30", glow: "shadow-[0_0_36px_rgba(139,92,246,0.24)]", value: "from-violet-200 to-fuchsia-300" },
    { border: "border-cyan-300/30", glow: "shadow-[0_0_36px_rgba(34,211,238,0.24)]", value: "from-cyan-200 to-blue-300" },
    { border: "border-blue-300/30", glow: "shadow-[0_0_36px_rgba(59,130,246,0.24)]", value: "from-blue-200 to-indigo-300" },
    { border: "border-teal-300/30", glow: "shadow-[0_0_36px_rgba(20,184,166,0.24)]", value: "from-teal-200 to-cyan-300" },
  ];

  const PROCESS_STEPS = [
    {
      number: "01",
      title: "Consulta Inicial",
      description: "Reunión estratégica para entender tus objetivos, desafíos y visión del proyecto.",
      extra: "Definimos alcance, prioridades y oportunidades de mejora para asegurar una base sólida.",
      icon: <HiOutlineChatBubbleLeftRight />,
      duration: "1-2 días"
    },
    {
      number: "02",
      title: "Análisis & Estrategia",
      description: "Investigación profunda, análisis competitivo y desarrollo de estrategia personalizada.",
      extra: "Nos enfocamos en el estudio del mercado, identificación de oportunidades y definición técnica clara.",
      icon: <HiOutlineMagnifyingGlass />,
      duration: "1-2 semanas"
    },
    {
      number: "03",
      title: "Diseño & Prototipo",
      description: "Creación de wireframes, diseño UI/UX y prototipos interactivos para validación.",
      extra: "Realizamos validación temprana con una experiencia centrada totalmente en el usuario final.",
      icon: <HiOutlinePencilSquare />,
      duration: "2-4 semanas"
    },
    {
      number: "04",
      title: "Desarrollo",
      description: "Construcción del producto con metodología ágil y entregas incrementales.",
      extra: "Implementamos una arquitectura escalable siguiendo las mejores prácticas y optimización continua.",
      icon: <HiOutlineCommandLine />,
      duration: "8-16 semanas"
    },
    {
      number: "05",
      title: "Testing & QA",
      description: "Pruebas exhaustivas de funcionalidad, rendimiento, seguridad y experiencia.",
      extra: "Ejecutamos pruebas automatizadas y un control de calidad riguroso en cada etapa del desarrollo.",
      icon: <HiOutlineBeaker />,
      duration: "2-3 semanas"
    },
    {
      number: "06",
      title: "Lanzamiento & Soporte",
      description: "Implementación operativa y monitoreo de impacto real.",
      extra: "Ofrecemos monitoreo proactivo y acompañamiento estratégico post-lanzamiento.",
      icon: <HiOutlineRocketLaunch />,
      duration: "Continuo"
    }
  ];

  const COMPARISONS = [
    { label: "Tiempo de Desarrollo", before: "6-12 meses", after: "2-4 meses", icon: "⏱️" },
    { label: "Coste del Proyecto", before: "Alto presupuesto", after: "Optimizado -40%", icon: "💰" },
    { label: "Calidad del Código", before: "Estándar", after: "Enterprise-grade", icon: "💻" },
    { label: "Soporte Post-lanzamiento", before: "Limitado", after: "24/7 Dedicado", icon: "🛡️" },
    { label: "Escalabilidad", before: "Limitada", after: "Ilimitada", icon: "📈" }
  ];

  const PROJECT_GALLERY = [
    { title: "Dashboard Analytics", category: "UI/UX", client: "TechCorp", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop" },
    { title: "Mobile Banking App", category: "FinTech", client: "FinanceHub", image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&h=400&fit=crop" },
    { title: "E-commerce Platform", category: "Retail", client: "RetailMax", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop" },
    { title: "Healthcare Portal", category: "HealthTech", client: "HealthCare Plus", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop" },
    { title: "Learning Platform", category: "EdTech", client: "EduLearn", image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&h=400&fit=crop" },
    { title: "IoT Dashboard", category: "Technology", client: "GreenEnergy", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop" }
  ];

  const AWARDS = [
    { title: "Best Digital Agency 2023", organization: "Tech Awards Global", icon: <FaTrophy className="text-yellow-400" />, year: "2023" },
    { title: "Innovation Excellence", organization: "Digital Innovation Summit", icon: <FaLightbulb className="text-orange-400" />, year: "2023" },
    { title: "Top 10 Development Firms", organization: "Industry Leaders Magazine", icon: <FaStar className="text-sky-400" />, year: "2023" },
    { title: "Customer Satisfaction Award", organization: "Client Success Institute", icon: <FaBullseye className="text-emerald-400" />, year: "2023" },
    { title: "Excellence in Design", organization: "UX Design Awards", icon: <FaPalette className="text-purple-400" />, year: "2022" },
    { title: "Best Fintech Solution", organization: "Financial Technology Forum", icon: <FaGem className="text-cyan-400" />, year: "2022" }
  ];

  const VIDEO_TESTIMONIALS = [
    { company: "TechCorp Global", author: "Sarah Johnson", role: "CTO, TechCorp", logo: <FaRocket className="text-sky-400" />, quote: "La transformación digital que necesitábamos", url: "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0" },
    { company: "FinanceHub Pro", author: "Michael Chen", role: "CEO, FinanceHub", logo: <FaUniversity className="text-emerald-400" />, quote: "Crecimiento exponencial con AI", url: "https://www.youtube.com/embed/jNQXAC9IVRw?rel=0" },
    { company: "HealthCare Plus", author: "Dr. Emma Williams", role: "Director Médico", logo: <FaHospital className="text-red-400" />, quote: "Mejorando la experiencia del paciente", url: "https://www.youtube.com/embed/9bZkp7q19f0?rel=0" },
    { company: "RetailMax", author: "Laura Martinez", role: "VP Marketing", logo: <FaShoppingBag className="text-orange-400" />, quote: "E-commerce que vende 24/7", url: "https://www.youtube.com/embed/OPf0YbXqDm0?rel=0" },
    { company: "EduLearn Academy", author: "Prof. David R.", role: "Director Académico", logo: <FaGraduationCap className="text-purple-400" />, quote: "Educación gamificada y personalizada", url: "https://www.youtube.com/embed/xfzgJ5dRJl4?rel=0" },
    { company: "GreenEnergy Solutions", author: "Ana Fernández", role: "CTO, GreenEnergy", logo: <FaBolt className="text-yellow-400" />, quote: "IoT para energía sostenible", url: "https://www.youtube.com/embed/FrXWUjD7uZ4?rel=0" }
  ];

  const HERO_BACKGROUND_FALLBACK = [
    {
      type: "image",
      url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=2400&h=1400&fit=crop",
      alt: "Equipo colaborando en sala de estrategia",
    },
    {
      type: "video",
      url: "https://cdn.coverr.co/videos/coverr-working-on-a-laptop-1579/1080p.mp4",
    },
    {
      type: "image",
      url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=2400&h=1400&fit=crop",
      alt: "Reunion ejecutiva con dashboards",
    },
  ];
  const CLIENTS_HERO_TAG = "[clients-hero]";
  const INDUSTRY_ICON_RAIL = [
    { icon: <FaBullseye />, color: "#EF4444", glow: "rgba(239,68,68,0.38)", label: "Estrategia" },
    { icon: <FaTools />, color: "#94A3B8", glow: "rgba(148,163,184,0.35)", label: "Ingenieria" },
    { icon: <FaRocket />, color: "#3B82F6", glow: "rgba(59,130,246,0.38)", label: "Lanzamiento" },
    { icon: <FaGem />, color: "#06B6D4", glow: "rgba(6,182,212,0.38)", label: "Premium" },
    { icon: <FaHospital />, color: "#EC4899", glow: "rgba(236,72,153,0.36)", label: "Salud" },
    { icon: <FaShoppingBag />, color: "#0EA5E9", glow: "rgba(14,165,233,0.36)", label: "Retail" },
    { icon: <FaGraduationCap />, color: "#8B5CF6", glow: "rgba(139,92,246,0.36)", label: "Educacion" },
    { icon: <FaBolt />, color: "#F59E0B", glow: "rgba(245,158,11,0.38)", label: "Energia" },
    { icon: <FaUniversity />, color: "#A78BFA", glow: "rgba(167,139,250,0.36)", label: "Finanzas" },
    { icon: <FaBuilding />, color: "#22C55E", glow: "rgba(34,197,94,0.36)", label: "Enterprise" },
  ];



  const [filter, setFilter] = useState("todos");
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const handleCloseModal = useCallback(() => {
    setSelectedClient(null);
  }, []);

  const handleSelectClient = useCallback((client: any) => {
    setSelectedClient(client);
  }, []);
  const [liveClients, setLiveClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [heroMediaIdx, setHeroMediaIdx] = useState(0);
  const [heroBackgroundMedia, setHeroBackgroundMedia] = useState(HERO_BACKGROUND_FALLBACK);
  const [reviewSummary, setReviewSummary] = useState({ average: 4.9, total: 50 });
  const [currentPage, setCurrentPage] = useState(1); // Paginación
  const ITEMS_PER_PAGE = 6; // 2 filas x 3 columnas

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
            if (c.video_url) {
              allMedia.push({ type: 'video', url: c.video_url });
            }
            // 2. Add Hero Image if exists
            if (c.image_url) {
              allMedia.push({ type: 'image', url: c.image_url });
            }
            // 3. Add Gallery items, avoiding duplicates with hero items
            gallery.forEach((item: any) => {
              if (item.url !== c.image_url && item.url !== c.video_url) {
                allMedia.push(item);
              }
            });

            // Parse structured JSON fields
            const rawMetrics = typeof c.metrics === 'string' ? JSON.parse(c.metrics) : (c.metrics || []);
            const rawServices = typeof c.services === 'string' ? JSON.parse(c.services) : (c.services || []);
            const rawTimeline = typeof c.timeline === 'string' ? JSON.parse(c.timeline) : (c.timeline || []);

            // First image from allMedia for the card thumbnail
            const cardThumb = allMedia.find(m => m.type === 'image')?.url;

            return {
              ...c,
              name: c.company_name || c.title || c.name || "Sin título",
              industry,
              image: cardThumb || c.image_url || c.logo_url || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop",
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
                  educación: ["Plataforma LMS", "Aulas Virtuales", "Gamificación Educativa", "Certificaciones Digitales"],
                  construcción: ["BIM Web", "Gestión de Proyectos", "IoT Construcción", "Realidad Aumentada"],
                  tecnología: ["Desarrollo Full-Stack", "Cloud Computing", "DevOps & CI/CD", "Machine Learning"]
                };
                return industryServices[industry] || ["Desarrollo Web", "Arquitectura Cloud", "Consultoría Tech", "Optimización"];
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
      } finally {
        setLoading(false);
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

  // Resetear a página 1 cuando cambia el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

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

  useEffect(() => {
    const loadReviewSummary = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/services-page/reviews");
        if (!res.ok) return;
        const reviews = await res.json();
        if (!Array.isArray(reviews) || reviews.length === 0) return;

        const ratings = reviews
          .map((review: any) => Number(review.rating))
          .filter((value: number) => !Number.isNaN(value) && value > 0);

        if (ratings.length === 0) return;

        const average = ratings.reduce((sum: number, value: number) => sum + value, 0) / ratings.length;
        setReviewSummary({ average, total: ratings.length });
      } catch (error) {
        console.error("Error loading review summary:", error);
      }
    };

    loadReviewSummary();
  }, []);

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
                    onClick={() => setFilter(ind)}
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
                        <div className="success-badge">CASO DE ÉXITO • {client.year}</div>
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
                  <span className="btn-icon">←</span> Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="elite-nav-btn next-btn"
                >
                  Siguiente <span className="btn-icon">→</span>
                </button>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* 6. PROCESS SECTION (CORPORATE REDESIGN) */}
      <section className="corporate-process-section py-24 px-6 relative overflow-hidden">
        {/* High-Fidelity SVG Wavy Background */}
        <div className="wavy-bg-svg-container">
          <svg viewBox="0 0 1440 800" preserveAspectRatio="none" className="wavy-svg">
            <defs>
              <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5b7a8a" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#2c3e50" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="waveGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4d5c66" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#141e26" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="waveGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1a2a33" stopOpacity="1" />
                <stop offset="100%" stopColor="#0d141a" stopOpacity="1" />
              </linearGradient>
            </defs>

            <rect width="1440" height="800" fill="#0f172a" />

            {/* Path 1: Top-Right Sweep */}
            <path d="M1440 0C1100 0 800 200 600 500C400 800 100 800 0 800V0H1440Z" fill="url(#waveGrad1)" opacity="0.6" />

            {/* Path 2: Bottom-Left Sweep */}
            <path d="M0 800C300 800 600 600 800 300C1000 0 1300 0 1440 0V800H0Z" fill="url(#waveGrad2)" opacity="0.8" />

            {/* Path 3: Bottom Accent */}
            <path d="M1440 800C1100 800 900 600 700 700C500 800 200 800 0 700V800H1440Z" fill="url(#waveGrad3)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto z-10 relative">
          <div className="text-center mb-16">
            <FadeInUp>
              <h2 className="section-title">Como Trabajamos</h2>
              <p className="section-description">
                Aplicamos un proceso estructurado y orientado a resultados que permite a pequeñas y medianas empresas implementar tecnología con claridad, control y crecimiento sostenible.
              </p>
            </FadeInUp>
          </div>

          <div className="corporate-grid">
            {PROCESS_STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="step-card group"
              >
                <div className="step-header">
                  <div className="watermark">{step.number}</div>
                  <div className="icon-circle">
                    {step.icon}
                  </div>
                </div>

                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.description}</p>
                  <p className="step-extra">{step.extra}</p>
                </div>

                <div className="step-footer">
                  <span className="duration-tag">{step.duration}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. COMPARISON SECTION - MODERN TWO-COLUMN LAYOUT */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <FadeInUp>
              <div className="inline-block px-6 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400 rounded-full mb-8 shadow-lg shadow-cyan-500/30">
                <span className="text-[10px] font-black tracking-[0.4em] uppercase text-cyan-300">💎 VENTAJA COMPETITIVA</span>
              </div>
              <h2 className="text-6xl font-black tracking-tighter mb-6 uppercase" style={{ color: '#22d3ee' }}>Más que un Servicio, un Aliado Digital</h2>
              <p className="text-2xl font-bold max-w-4xl mx-auto leading-relaxed" style={{ color: '#e2e8f0' }}>Acompañamos a empresas y emprendedores a construir una presencia profesional que inspire confianza y genere oportunidades reales.</p>
            </FadeInUp>
          </div>

          {/* TWO COLUMN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* LEFT: COMPARISON TABLE */}
            <FadeInUp>
              <div className="p-10 md:p-12 rounded-[3rem] border-2 border-cyan-400/40 bg-gradient-to-br from-[#0a0f1e]/95 to-[#0f1829]/90 backdrop-blur-xl relative overflow-hidden shadow-2xl shadow-cyan-500/20">
                {/* Header */}

                {/* Header */}
                <div className="relative grid grid-cols-3 gap-6 mb-10 items-center text-center">
                  <span className="text-white/50 font-black uppercase text-xs tracking-[0.25em]">OTROS</span>
                  <div className="h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-orange-400 rounded-full" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-black uppercase text-xs tracking-[0.25em]">NOSOTROS</span>
                </div>

                {/* Comparison Items */}
                <div className="relative space-y-4">
                  {COMPARISONS.map((comp, i) => (
                    <div key={i} className="comparison-card group p-5 rounded-2xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border-2 border-cyan-500/20 hover:border-cyan-400/60 hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30">
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className="text-3xl w-12 flex justify-center text-cyan-400 group-hover:text-cyan-300 group-hover:scale-110 transition-all drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">
                          {comp.icon}
                        </div>

                        {/* Before/After */}
                        <div className="flex-1 grid grid-cols-3 items-center gap-3">
                          <span className="text-right text-white/40 line-through text-xs font-bold uppercase tracking-wide">
                            {comp.before}
                          </span>
                          <div className="flex justify-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-500 flex items-center justify-center group-hover:scale-125 transition-transform shadow-lg shadow-cyan-500/50">
                              <FaArrowRight className="text-white text-xs" />
                            </div>
                          </div>
                          <span className="text-left text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300 font-black text-sm uppercase tracking-tight drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                            {comp.after}
                          </span>
                        </div>

                        {/* Label */}
                        <div className="w-32 text-right">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-400/70 group-hover:text-orange-300 transition-colors drop-shadow-[0_0_8px_rgba(255,107,0,0.4)]">
                            {comp.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInUp>

            {/* RIGHT: DESCRIPTIVE TEXT BOX */}
            <FadeInUp delay={0.2}>
              <div className="h-full flex flex-col gap-6">
                {/* Main Description Card */}
                <div className="p-10 rounded-[3rem] bg-gradient-to-br from-blue-500/5 via-transparent to-orange-500/5 border-2 border-blue-400/20 backdrop-blur-sm relative overflow-hidden">
                  <div className="relative">
                    <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-orange-300 mb-6 uppercase tracking-tight">Excelencia Garantizada</h3>
                    <p className="text-lg text-white/90 leading-relaxed mb-8">
                      No somos solo otro proveedor de tecnología. Somos tu <span className="text-cyan-300 font-black drop-shadow-[0_0_10px_rgba(0,240,255,0.6)]">socio estratégico</span> en transformación digital, comprometidos con resultados medibles y soluciones que escalan con tu negocio.
                    </p>

                    {/* Key Benefits */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-cyan-600/30 flex items-center justify-center flex-shrink-0 border-2 border-cyan-400/60 shadow-lg shadow-cyan-500/40">
                          <FaCheckCircle className="text-cyan-300 text-lg drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                        </div>
                        <div>
                          <h4 className="text-white font-black mb-1">Arquitectura Enterprise</h4>
                          <p className="text-sm text-white/70">Soluciones escalables diseñadas para crecer con tu empresa</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/30 flex items-center justify-center flex-shrink-0 border-2 border-blue-400/60 shadow-lg shadow-blue-500/40">
                          <FaCheckCircle className="text-blue-300 text-lg drop-shadow-[0_0_8px_rgba(0,0,255,0.8)]" />
                        </div>
                        <div>
                          <h4 className="text-white font-black mb-1">Soporte 24/7 Dedicado</h4>
                          <p className="text-sm text-white/70">Equipo técnico siempre disponible para resolver cualquier incidencia</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/30 to-orange-600/30 flex items-center justify-center flex-shrink-0 border-2 border-orange-400/60 shadow-lg shadow-orange-500/40">
                          <FaCheckCircle className="text-orange-300 text-lg drop-shadow-[0_0_8px_rgba(255,107,0,0.8)]" />
                        </div>
                        <div>
                          <h4 className="text-white font-black mb-1">Resultados que se Notan</h4>
                          <p className="text-sm text-white/70">Estrategia, diseño y tecnología alineados para posicionar tu marca, generar confianza y convertir visitantes en clientes.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Card */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border-2 border-cyan-400/40 text-center backdrop-blur-sm shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all">
                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-cyan-400 mb-2">99.9%</div>
                    <div className="text-xs font-bold text-cyan-300/80 uppercase tracking-wider">Uptime</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-2 border-blue-400/40 text-center backdrop-blur-sm shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all">
                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-400 mb-2">200+</div>
                    <div className="text-xs font-bold text-blue-300/80 uppercase tracking-wider">Proyectos</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-[#0a0f1e]/80 border-2 border-orange-400/40 text-center backdrop-blur-sm shadow-lg shadow-orange-500/10 hover:shadow-orange-500/30 transition-all">
                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-orange-400 mb-2">4.9★</div>
                    <div className="text-xs font-bold text-orange-300/80 uppercase tracking-wider">Rating</div>
                  </div>
                </div>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* 8. GALLERY SECTION */}
      <section className="py-32 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <FadeInUp>
              <h2 className="text-5xl font-bold text-white tracking-tighter mb-4 uppercase">Nuestro Trabajo en Acción</h2>
              <p className="text-gray-500">Explora una selección de nuestros proyectos más destacados.</p>
            </FadeInUp>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PROJECT_GALLERY.map((proj, i) => (
              <FadeInUp key={i} delay={i * 0.1}>
                <div className="gallery-item group">
                  <img src={proj.image} alt={proj.title} />
                  {/* gallery-overlay removed - images should be fully visible */}
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section >

      {/* 9. AWARDS SECTION */}
      < section className="py-32 px-6" >
        <div className="max-w-7xl mx-auto text-center">
          <FadeInUp>
            <h2 className="text-5xl font-bold text-white tracking-tighter mb-24 uppercase">Reconocidos Globalmente</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {AWARDS.map((award, i) => (
                <div key={i} className="glass-effect p-10 rounded-[2.5rem] border border-white/5 transition-all hover:translate-y-[-10px] hover:border-indigo-500/30 flex flex-col items-center justify-center">
                  <div className="text-6xl mb-6">{award.icon}</div>
                  <h4 className="text-[10px] font-black text-white uppercase mb-2 leading-tight tracking-widest">{award.title}</h4>
                  <p className="text-[9px] text-gray-500 font-bold uppercase mb-4">{award.organization}</p>
                  <span className="text-indigo-400 text-[10px] font-black bg-indigo-500/10 px-4 py-1 rounded-full uppercase">{award.year}</span>
                </div>
              ))}
            </div>
          </FadeInUp>
        </div>
      </section >

      {/* 10. TESTIMONIALS SECTION (VOCES DE ÉXITO) */}
      < section className="py-32 px-6 bg-white/[0.02] border-y border-white/5" >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <FadeInUp>
              <h2 className="text-5xl font-bold text-white tracking-tighter mb-4 uppercase">Voces de Éxito</h2>
              <div className="w-24 h-1 bg-indigo-500 mx-auto rounded-full" />
            </FadeInUp>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {displayClients.slice(0, 3).map((client: any, i) => (
              <FadeInUp key={i} delay={i * 0.15}>
                <div className="glass-effect p-16 rounded-[4rem] border border-white/10 relative group hover:border-indigo-500/30 transition-all">
                  <div className="text-7xl text-indigo-500/20 absolute top-10 right-10 leading-none">"</div>
                  <p className="text-xl text-white/90 font-medium leading-relaxed mb-12 relative z-10">
                    {client.testimonial}
                  </p>
                  <div className="flex items-center gap-6 border-t border-white/5 pt-10">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/20">
                      {client.logo}
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">{client.author}</div>
                      <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{client.role}</div>
                    </div>
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section >

      {/* 11. VIDEO TESTIMONIALS SECTION */}
      < section className="py-32 px-6 bg-indigo-500/[0.03]" >
        <div className="max-w-7xl mx-auto text-center">
          <FadeInUp>
            <div className="inline-block px-6 py-2 bg-indigo-500/10 border border-indigo-500/50 rounded-full mb-8">
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-indigo-400">🎥 Historias de Éxito en Video</span>
            </div>
            <h2 className="text-5xl font-bold text-white tracking-tighter mb-4 uppercase">Vea la Transformación en Realidad</h2>
            <p className="text-gray-400 mb-20 max-w-2xl mx-auto">Escucha directamente de nuestros clientes cómo transformamos sus negocios.</p>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {VIDEO_TESTIMONIALS.map((video, i) => (
              <FadeInUp key={i} delay={i * 0.1}>
                <div className="card-3d glass-effect rounded-[3rem] overflow-hidden border border-white/10 group">
                  <div className="aspect-video relative overflow-hidden bg-black/50">
                    <iframe
                      src={video.url}
                      title={video.author}
                      className="w-full h-full opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-700"
                    />
                    <div className="absolute inset-0 flex items-center justify-center group-hover:hidden transition-all duration-300">
                      <div className="w-24 h-24 bg-indigo-500 rounded-full flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-all opacity-80 group-hover:opacity-100">
                        <FaPlus className="text-4xl -rotate-45" />
                      </div>
                    </div>
                  </div>
                  <div className="p-10 text-left">
                    <h3 className="text-xl font-bold text-white mb-2 uppercase">{video.company}</h3>
                    <p className="text-gray-500 text-sm mb-8">"{video.quote}"</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-2xl border border-white/5">{video.logo}</div>
                      <div>
                        <div className="text-xs font-black text-white uppercase tracking-widest">{video.author}</div>
                        <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-[0.2em]">{video.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section >

      {/* 13. CONTACT FORM SECTION (HABLEMOS) */}
      < section className="py-40 px-6" >
        <div className="max-w-4xl mx-auto">
          <FadeInUp>
            <div className="text-center mb-16">
              <div className="text-6xl mb-8">💬</div>
              <h2 className="text-5xl font-bold text-white tracking-tighter mb-4 uppercase">Hablemos de Tu Proyecto</h2>
              <p className="text-gray-500">Cuéntanos tu visión y te mostraremos cómo hacerla realidad.</p>
            </div>
            <form className="glass-effect p-12 md:p-20 rounded-[4rem] border border-white/10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-indigo-400">Nombre Completo *</label>
                  <input placeholder="Ej: Carlos Méndez" className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white outline-none focus:border-indigo-500 transition-all font-bold placeholder-white/20" />
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-indigo-400">Email Corporativo *</label>
                  <input placeholder="carlos@empresa.com" className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white outline-none focus:border-indigo-500 transition-all font-bold placeholder-white/20" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-indigo-400">Empresa *</label>
                  <input placeholder="Nombre de su empresa" className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white outline-none focus:border-indigo-500 transition-all font-bold placeholder-white/20" />
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-indigo-400">Tipo de Proyecto *</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white outline-none focus:border-indigo-500 transition-all font-bold appearance-none">
                    <option className="bg-[#1a1a2e]">Desarrollo Web</option>
                    <option className="bg-[#1a1a2e]">Aplicación Móvil</option>
                    <option className="bg-[#1a1a2e]">IA Integration</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-indigo-400">Mensaje *</label>
                <textarea rows={4} placeholder="Describe tu proyecto..." className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] px-8 py-8 text-white outline-none focus:border-indigo-500 transition-all font-bold placeholder-white/20 resize-none" />
              </div>
              <button className="btn-elite w-full py-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-black uppercase tracking-[0.5em] text-xs shadow-2xl shadow-indigo-500/50">
                🚀 Enviar Consulta
              </button>
            </form>
          </FadeInUp>
        </div>
      </section >

      {/* 14. REVIEW FORM SECTION (COMPARTE EXPERIENCIA) */}
      < section className="py-32 px-6 bg-indigo-500/[0.05]" >
        <div className="max-w-4xl mx-auto">
          <FadeInUp>
            <div className="text-center mb-16">
              <div className="text-5xl mb-8">⭐</div>
              <h2 className="text-5xl font-bold text-white tracking-tighter mb-4 uppercase">Comparte Tu Experiencia</h2>
              <p className="text-gray-500">Tu opinión nos ayuda a mejorar cada día.</p>
            </div>
            <div className="glass-effect p-12 md:p-20 rounded-[4rem] border border-white/10 text-center">
              <div className="flex justify-center gap-6 mb-12">
                {[1, 2, 3, 4, 5].map(star => (
                  <FaStar
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-5xl cursor-pointer transition-all ${rating >= star ? "text-yellow-400 scale-125 filter drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" : "text-white/10 hover:text-white/20"}`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <input placeholder="Nombre Completo" className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white outline-none focus:border-indigo-500 transition-all font-bold placeholder-white/20" />
                <input placeholder="Empresa / Cargo" className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white outline-none focus:border-indigo-500 transition-all font-bold placeholder-white/20" />
              </div>
              <textarea rows={4} placeholder="Tu reseña..." className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] px-8 py-8 text-white outline-none focus:border-indigo-500 transition-all font-bold placeholder-white/20 resize-none mb-10" />
              <button className="btn-elite px-16 py-6 border-2 border-indigo-500 text-indigo-500 rounded-full font-black uppercase tracking-[0.3em] text-xs hover:bg-indigo-500 hover:text-white transition-all">
                ✨ Publicar Reseña
              </button>
            </div>
          </FadeInUp>
        </div>
      </section >

      {/* 15. CTA SECTION (ESTO ES LA CTA FINAL ELITE 2.0) */}
      < section className="py-40 px-6 bg-indigo-600 relative overflow-hidden" >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
        <div className="max-w-5xl mx-auto text-center relative z-10 text-white">
          <FadeInUp>
            <div className="text-8xl mb-8 floating-anim">🚀</div>
            <h2 className="text-6xl font-bold tracking-tighter mb-8 uppercase leading-none">¿Listo para Ser Nuestro Próximo Caso de Éxito?</h2>
            <p className="text-2xl font-medium opacity-80 mb-16 max-w-2xl mx-auto">Únete a las empresas líderes que ya están transformando sus industrias con nosotros.</p>
            <button className="btn-elite px-20 py-8 bg-white text-indigo-600 rounded-full font-black uppercase tracking-[0.4em] text-sm shadow-2xl hover:scale-110">
              Iniciar Proyecto
            </button>
          </FadeInUp>
        </div>
      </section >

      {/* 5. MODAL DETAIL - CLIENT */}
      <AnimatePresence>
        {
          selectedClient && (
            <ClientDetailModal
              selectedClient={selectedClient}
              onClose={handleCloseModal}
            />
          )
        }
      </AnimatePresence >

    </div >
  );
}
