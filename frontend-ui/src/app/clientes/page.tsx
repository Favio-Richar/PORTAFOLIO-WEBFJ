"use client";

import { useState, useEffect } from "react";
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
} from "react-icons/fa";

/* ================= EXACT DATA FROM HTML ================= */

const INDUSTRIES = ['todos', 'tecnología', 'finanzas', 'salud', 'retail', 'educación'];

const CLIENTS = [
  {
    id: 1,
    name: "TechCorp Global",
    industry: "tecnología",
    logo: "🚀",
    description: "Transformación digital completa de sistemas legacy",
    results: { revenue: "+245%", users: "2M+", satisfaction: "98%" },
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop",
    testimonial: "La mejor decisión que tomamos fue trabajar con este equipo. Revolucionaron completamente nuestra infraestructura.",
    author: "Sarah Johnson",
    role: "CTO, TechCorp Global",
    year: "2023",
    services: ["Desarrollo Web", "Cloud Architecture", "DevOps"],
    timeline: [
      { phase: "Análisis", duration: "2 semanas", status: "completed" },
      { phase: "Desarrollo", duration: "3 meses", status: "completed" },
      { phase: "Implementación", duration: "1 mes", status: "completed" },
      { phase: "Optimización", duration: "Ongoing", status: "active" }
    ],
    metrics: [
      { label: "Tiempo de Carga", before: "4.5s", after: "0.8s", improvement: 82 },
      { label: "Conversión", before: "2.3%", after: "5.8%", improvement: 152 },
      { label: "Usuarios Activos", before: "50K", after: "2M", improvement: 3900 }
    ]
  },
  {
    id: 2,
    name: "FinanceHub Pro",
    industry: "finanzas",
    logo: "💎",
    description: "Plataforma de inversión con IA y análisis en tiempo real",
    results: { transactions: "$2.5B", clients: "150K+", uptime: "99.99%" },
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    testimonial: "Nuestra plataforma ahora procesa millones de transacciones diarias sin problemas. Impresionante trabajo.",
    author: "Michael Chen",
    role: "CEO, FinanceHub Pro",
    year: "2023",
    services: ["Fintech Development", "Security", "AI Integration"],
    timeline: [
      { phase: "Research", duration: "3 semanas", status: "completed" },
      { phase: "MVP", duration: "2 meses", status: "completed" },
      { phase: "Testing", duration: "1 mes", status: "completed" },
      { phase: "Scale", duration: "Ongoing", status: "active" }
    ],
    metrics: [
      { label: "Transacciones/seg", before: "100", after: "10,000", improvement: 9900 },
      { label: "Tiempo Respuesta", before: "2.1s", after: "0.3s", improvement: 86 },
      { label: "Satisfacción Cliente", before: "78%", after: "96%", improvement: 23 }
    ]
  },
  {
    id: 3,
    name: "HealthCare Plus",
    industry: "salud",
    logo: "🏥",
    description: "Sistema de gestión hospitalaria y telemedicina",
    results: { patients: "500K+", appointments: "1M+", efficiency: "+180%" },
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop",
    testimonial: "Han mejorado drásticamente la experiencia de nuestros pacientes y la eficiencia de nuestro personal médico.",
    author: "Dr. Emma Williams",
    role: "Director Médico, HealthCare Plus",
    year: "2023",
    services: ["Healthcare IT", "Telemedicina", "HIPAA Compliance"],
    timeline: [
      { phase: "Diagnóstico", duration: "1 mes", status: "completed" },
      { phase: "Desarrollo", duration: "4 meses", status: "completed" },
      { phase: "Piloto", duration: "2 meses", status: "completed" },
      { phase: "Expansión", duration: "Ongoing", status: "active" }
    ],
    metrics: [
      { label: "Tiempo de Espera", before: "45min", after: "12min", improvement: 73 },
      { label: "Citas Online", before: "15%", after: "78%", improvement: 420 },
      { label: "Satisfacción", before: "72%", after: "94%", improvement: 31 }
    ]
  },
  {
    id: 4,
    name: "RetailMax",
    industry: "retail",
    logo: "🛍️",
    description: "E-commerce omnicanal con experiencia personalizada",
    results: { sales: "+320%", cart: "+85%", retention: "89%" },
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
    testimonial: "Nuestras ventas online se triplicaron en 6 meses. La plataforma es simplemente espectacular.",
    author: "Laura Martinez",
    role: "VP Marketing, RetailMax",
    year: "2022",
    services: ["E-commerce", "UX/UI Design", "Marketing Automation"],
    timeline: [
      { phase: "Estrategia", duration: "2 semanas", status: "completed" },
      { phase: "Diseño", duration: "1 mes", status: "completed" },
      { phase: "Desarrollo", duration: "2.5 meses", status: "completed" },
      { phase: "Growth", duration: "Ongoing", status: "active" }
    ],
    metrics: [
      { label: "Tasa Conversión", before: "1.8%", after: "5.2%", improvement: 189 },
      { label: "Valor Pedido", before: "$45", after: "$89", improvement: 98 },
      { label: "Retención", before: "42%", after: "89%", improvement: 112 }
    ]
  },
  {
    id: 5,
    name: "EduLearn Academy",
    industry: "educación",
    logo: "🎓",
    description: "Plataforma educativa con gamificación y AI tutoring",
    results: { students: "750K+", completion: "94%", engagement: "+450%" },
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop",
    testimonial: "La plataforma ha revolucionado la forma en que enseñamos. Los estudiantes están más comprometidos que nunca.",
    author: "Prof. David Rodriguez",
    role: "Director Académico, EduLearn",
    year: "2023",
    services: ["EdTech", "Gamificación", "AI Learning"],
    timeline: [
      { phase: "Investigación", duration: "3 semanas", status: "completed" },
      { phase: "Prototipo", duration: "1.5 meses", status: "completed" },
      { phase: "Beta", duration: "2 meses", status: "completed" },
      { phase: "Escala", duration: "Ongoing", status: "active" }
    ],
    metrics: [
      { label: "Tasa Finalización", before: "58%", after: "94%", improvement: 62 },
      { label: "Tiempo Estudio", before: "2.5h/sem", after: "8h/sem", improvement: 220 },
      { label: "Satisfacción", before: "68%", after: "97%", improvement: 43 }
    ]
  },
  {
    id: 6,
    name: "GreenEnergy Solutions",
    industry: "tecnología",
    logo: "⚡",
    description: "IoT y monitoreo inteligente de energía renovable",
    results: { energy: "500MW", reduction: "-65% CO2", efficiency: "+210%" },
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=600&fit=crop",
    testimonial: "La tecnología IoT nos permite optimizar cada panel solar en tiempo real. Resultados extraordinarios.",
    author: "Ana Fernández",
    role: "CTO, GreenEnergy",
    year: "2023",
    services: ["IoT", "Data Analytics", "Sustainability Tech"],
    timeline: [
      { phase: "Audit", duration: "2 semanas", status: "completed" },
      { phase: "IoT Setup", duration: "3 meses", status: "completed" },
      { phase: "Integration", duration: "1 mes", status: "completed" },
      { phase: "Optimize", duration: "Ongoing", status: "active" }
    ],
    metrics: [
      { label: "Eficiencia", before: "68%", after: "91%", improvement: 34 },
      { label: "Downtime", before: "12%", after: "1.2%", improvement: 90 },
      { label: "ROI", before: "5 años", after: "2.1 años", improvement: 58 }
    ]
  }
];

const GLOBAL_STATS = [
  { number: "200+", label: "Clientes Globales", icon: <FaGlobeAmericas className="text-cyan-300" /> },
  { number: "$2.5B+", label: "Revenue Generado", icon: <FaChartLine className="text-blue-300" /> },
  { number: "99.8%", label: "Tasa de Éxito", icon: <FaShieldAlt className="text-emerald-300" /> },
  { number: "24/7", label: "Soporte Dedicado", icon: <FaHeadset className="text-sky-300" /> }
];

const GLOBAL_RESULTS = [
  { number: "850+", label: "Proyectos Completados", icon: "✅", description: "En 50+ países", trend: "+127% YoY" },
  { number: "$4.8B", label: "Revenue Cliente Generado", icon: "📈", description: "Impacto económico total", trend: "+215% crecimiento" },
  { number: "98.9%", label: "Satisfacción Cliente", icon: "🌟", description: "Promedio de calificación", trend: "4.9/5.0 estrellas" },
  { number: "15", label: "Industrias Atendidas", icon: "🏢", description: "Experiencia diversa", trend: "Tech, Finance, Health+" },
  { number: "2.3M", label: "Usuarios Finales", icon: "👥", description: "Alcance global", trend: "+340% engagement" },
  { number: "92%", label: "Retención Clientes", icon: "🔄", description: "Relaciones a largo plazo", trend: "Promedio 4.2 años" }
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
  { number: "01", title: "Consulta Inicial", description: "Reunión estratégica para entender tus objetivos, desafíos y visión del proyecto.", icon: "💬", duration: "1-2 días" },
  { number: "02", title: "Análisis & Estrategia", description: "Investigación profunda, análisis competitivo y desarrollo de estrategia personalizada.", icon: "🔍", duration: "1-2 semanas" },
  { number: "03", title: "Diseño & Prototipo", description: "Creación de wireframes, diseño UI/UX y prototipos interactivos para validación.", icon: "🎨", duration: "2-4 semanas" },
  { number: "04", title: "Desarrollo", description: "Construcción del producto con metodología ágil y entregas incrementales.", icon: "⚙️", duration: "8-16 semanas" },
  { number: "05", title: "Testing & QA", description: "Pruebas exhaustivas de funcionalidad, rendimiento, seguridad y experiencia.", icon: "✅", duration: "2-3 semanas" },
  { number: "06", title: "Lanzamiento & Soporte", description: "Implementación en producción, monitoreo continuo y soporte dedicado 24/7.", icon: "🚀", duration: "Ongoing" }
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
  { title: "Best Digital Agency 2023", organization: "Tech Awards Global", icon: "🏆", year: "2023" },
  { title: "Innovation Excellence", organization: "Digital Innovation Summit", icon: "💡", year: "2023" },
  { title: "Top 10 Development Firms", organization: "Industry Leaders Magazine", icon: "⭐", year: "2023" },
  { title: "Customer Satisfaction Award", organization: "Client Success Institute", icon: "🎯", year: "2023" },
  { title: "Excellence in Design", organization: "UX Design Awards", icon: "🎨", year: "2022" },
  { title: "Best Fintech Solution", organization: "Financial Technology Forum", icon: "💎", year: "2022" }
];

const VIDEO_TESTIMONIALS = [
  { company: "TechCorp Global", author: "Sarah Johnson", role: "CTO, TechCorp", logo: "🚀", quote: "La transformación digital que necesitábamos", url: "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0" },
  { company: "FinanceHub Pro", author: "Michael Chen", role: "CEO, FinanceHub", logo: "💎", quote: "Crecimiento exponencial con AI", url: "https://www.youtube.com/embed/jNQXAC9IVRw?rel=0" },
  { company: "HealthCare Plus", author: "Dr. Emma Williams", role: "Director Médico", logo: "🏥", quote: "Mejorando la experiencia del paciente", url: "https://www.youtube.com/embed/9bZkp7q19f0?rel=0" },
  { company: "RetailMax", author: "Laura Martinez", role: "VP Marketing", logo: "🛍️", quote: "E-commerce que vende 24/7", url: "https://www.youtube.com/embed/OPf0YbXqDm0?rel=0" },
  { company: "EduLearn Academy", author: "Prof. David R.", role: "Director Académico", logo: "🎓", quote: "Educación gamificada y personalizada", url: "https://www.youtube.com/embed/xfzgJ5dRJl4?rel=0" },
  { company: "GreenEnergy Solutions", author: "Ana Fernández", role: "CTO, GreenEnergy", logo: "⚡", quote: "IoT para energía sostenible", url: "https://www.youtube.com/embed/FrXWUjD7uZ4?rel=0" }
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

export default function Clientes() {
  const [filter, setFilter] = useState("todos");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [heroMediaIdx, setHeroMediaIdx] = useState(0);
  const [heroBackgroundMedia, setHeroBackgroundMedia] = useState(HERO_BACKGROUND_FALLBACK);
  const [reviewSummary, setReviewSummary] = useState({ average: 4.9, total: 50 });

  const filteredClients = filter === "todos" ? CLIENTS : CLIENTS.filter(c => c.industry === filter);

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
          <div className="absolute inset-0 bg-gradient-to-b from-[#040816]/90 via-[#060e22]/82 to-[#040816]/92" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(14,165,233,0.16),transparent_48%)]" />
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


      {/* 4. FILTER SECTION (Sticky) */}
      <section className="sticky top-20 z-[100] py-8 px-6 backdrop-blur-2xl bg-[linear-gradient(180deg,rgba(3,8,23,0.92),rgba(3,8,23,0.82))] border-y border-cyan-400/10">
        <div className="max-w-7xl mx-auto">
          <div className="mx-auto w-fit flex flex-wrap justify-center gap-3 p-2 rounded-2xl bg-white/[0.03] border border-cyan-400/15 shadow-[0_0_20px_rgba(34,211,238,0.08)]">
            {INDUSTRIES.map(ind => (
              <button
                key={ind}
                onClick={() => setFilter(ind)}
                className={`px-7 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 border ${
                  filter === ind
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 border-cyan-300 text-white shadow-[0_8px_24px_rgba(56,189,248,0.35)] -translate-y-[1px]"
                    : "bg-[#0b1426]/80 border-white/10 text-slate-300 hover:text-white hover:border-cyan-300/40 hover:bg-[#0f1a30]"
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CASE STUDIES SECTION */}
      <section className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <FadeInUp>
              <h2 className="text-6xl font-bold text-white tracking-tighter mb-4 italic uppercase">Casos de Exito Destacados</h2>
              <p className="text-slate-400 max-w-2xl mx-auto mb-6">Selecciona un sector y revisa resultados reales con metricas de negocio.</p>
              <div className="w-24 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full" />
            </FadeInUp>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <AnimatePresence mode="popLayout">
              {filteredClients.map((client, i) => (
                <motion.div
                  key={client.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 18 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                >
                  <div className="h-full flex flex-col group cursor-pointer rounded-[2.2rem] overflow-hidden border border-cyan-400/15 bg-[linear-gradient(160deg,rgba(8,14,28,0.95),rgba(13,23,45,0.85))] shadow-[0_24px_40px_rgba(0,0,0,0.35)] hover:border-cyan-300/40 transition-all duration-500" onClick={() => setSelectedClient(client)}>
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img src={client.image} alt={client.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-[0.4deg]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/90 via-[#030712]/20 to-transparent opacity-90" />
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/15 border border-cyan-300/40 text-cyan-200">
                        {client.industry}
                      </div>
                    </div>
                    <div className="p-8 md:p-9 flex-1 flex flex-col">
                      <div className="flex items-start gap-5 mb-6">
                        <div className="client-logo-viz mt-1">{client.logo}</div>
                        <div>
                          <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">{client.name}</h3>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{client.year}</span>
                        </div>
                      </div>

                      <p className="text-slate-300 text-base mb-7 leading-relaxed font-medium flex-1">"{client.description}"</p>

                      <div className="grid grid-cols-3 gap-3 mb-7">
                        {Object.entries(client.results).map(([k, v]: any) => (
                          <div key={k} className="bg-black/25 p-4 rounded-2xl text-center border border-white/10 transition-all group-hover:border-cyan-300/25 group-hover:bg-[#0f1a31]">
                            <div className="text-xl md:text-2xl font-black text-white mb-1 tracking-tighter italic">{v}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{k}</div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end items-center pt-6 border-t border-white/10">
                        <span className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-cyan-500/12 border border-cyan-300/40 text-cyan-200 group-hover:bg-cyan-500/20 group-hover:text-white transition-all">
                          Ver detalle
                          <span className="text-sm">?</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 6. PROCESS SECTION */}
      <section className="py-32 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <FadeInUp>
              <h2 className="text-5xl font-bold text-white tracking-tighter mb-4 italic uppercase">Como Trabajamos</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Una metodologia clara, escalable y orientada a resultados medibles.</p>
            </FadeInUp>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PROCESS_STEPS.map((step, i) => (
              <FadeInUp key={i} delay={i * 0.1}>
                <div className="relative overflow-hidden p-10 rounded-[2.5rem] border border-cyan-400/15 bg-[linear-gradient(145deg,rgba(8,13,26,0.96),rgba(14,24,47,0.86))] min-h-[370px] flex flex-col justify-between group transition-all duration-500 hover:-translate-y-2 hover:border-cyan-300/35 hover:shadow-[0_20px_34px_rgba(8,145,178,0.16)]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_55%)]" />
                  <div>
                    <div className="relative z-10 flex items-center justify-between mb-6">
                      <div className="text-5xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">{step.icon}</div>
                      <div className="text-5xl font-black text-cyan-400/15">{step.number}</div>
                    </div>
                    <h3 className="relative z-10 text-2xl font-bold text-white mb-3">{step.title}</h3>
                    <p className="relative z-10 text-slate-300 leading-relaxed text-base">{step.description}</p>
                  </div>
                  <div className="relative z-10 inline-block px-5 py-2 bg-cyan-500/15 text-cyan-200 rounded-full text-[10px] font-black uppercase tracking-widest self-start border border-cyan-300/25">
                    {step.duration}
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* 7. COMPARISON SECTION */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <FadeInUp>
              <h2 className="text-5xl font-bold text-white tracking-tighter mb-4 italic uppercase">Por Que Elegirnos</h2>
              <p className="text-slate-400">Comparacion directa de performance, calidad y soporte.</p>
            </FadeInUp>
          </div>
          <FadeInUp>
            <div className="p-8 md:p-12 rounded-[2.5rem] border border-cyan-400/15 bg-[linear-gradient(160deg,rgba(7,12,24,0.96),rgba(15,25,48,0.84))] relative overflow-hidden shadow-[0_24px_40px_rgba(0,0,0,0.35)]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 items-center text-center">
                <span className="text-white/30 font-black uppercase text-xs tracking-[0.28em]">Otros proveedores</span>
                <div className="hidden md:block h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
                <span className="text-cyan-300 font-black uppercase text-xs tracking-[0.28em]">Nuestra solucion</span>
              </div>
              <div className="space-y-4">
                {COMPARISONS.map((comp, i) => (
                  <div key={i} className="flex items-center gap-5 p-5 rounded-2xl border border-white/10 bg-white/[0.02] group hover:border-cyan-300/30 hover:bg-[#0f1b32] transition-all">
                    <div className="text-3xl w-14 text-center">{comp.icon}</div>
                    <div className="flex-1 grid grid-cols-3 items-center gap-3">
                      <span className="text-right text-white/30 line-through text-sm font-bold uppercase">{comp.before}</span>
                      <FaArrowRight className="mx-auto text-cyan-300 group-hover:translate-x-1 transition-transform" />
                      <span className="text-left text-white font-black text-lg uppercase tracking-tight">{comp.after}</span>
                    </div>
                    <div className="w-44 text-right">
                      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200/60 group-hover:text-cyan-200">{comp.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>
      {/* 8. GALLERY SECTION */}
      <section className="py-32 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <FadeInUp>
              <h2 className="text-5xl font-bold text-white tracking-tighter mb-4 italic uppercase">Nuestro Trabajo en Acción</h2>
              <p className="text-gray-500">Explora una selección de nuestros proyectos más destacados.</p>
            </FadeInUp>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PROJECT_GALLERY.map((proj, i) => (
              <FadeInUp key={i} delay={i * 0.1}>
                <div className="gallery-item group">
                  <img src={proj.image} alt={proj.title} />
                  <div className="gallery-overlay">
                    <span className="text-indigo-400 text-[10px] font-black tracking-widest uppercase mb-2">{proj.category}</span>
                    <h3 className="text-2xl font-bold text-white mb-1">{proj.title}</h3>
                    <p className="text-white/50 text-xs font-bold uppercase">{proj.client}</p>
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* 9. AWARDS SECTION */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <FadeInUp>
            <h2 className="text-5xl font-bold text-white tracking-tighter mb-24 italic uppercase">Reconocidos Globalmente</h2>
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
      </section>

      {/* 10. TESTIMONIALS SECTION (VOCES DE ÉXITO) */}
      <section className="py-32 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <FadeInUp>
              <h2 className="text-5xl font-bold text-white tracking-tighter mb-4 italic uppercase">Voces de Éxito</h2>
              <div className="w-24 h-1 bg-indigo-500 mx-auto rounded-full" />
            </FadeInUp>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {CLIENTS.slice(0, 3).map((client, i) => (
              <FadeInUp key={i} delay={i * 0.15}>
                <div className="glass-effect p-16 rounded-[4rem] border border-white/10 relative group hover:border-indigo-500/30 transition-all">
                  <div className="text-7xl text-indigo-500/20 absolute top-10 right-10 leading-none">"</div>
                  <p className="text-xl text-white/90 italic font-medium leading-relaxed mb-12 relative z-10">
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
      </section>

      {/* 11. VIDEO TESTIMONIALS SECTION */}
      <section className="py-32 px-6 bg-indigo-500/[0.03]">
        <div className="max-w-7xl mx-auto text-center">
          <FadeInUp>
            <div className="inline-block px-6 py-2 bg-indigo-500/10 border border-indigo-500/50 rounded-full mb-8">
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-indigo-400">🎥 Historias de Éxito en Video</span>
            </div>
            <h2 className="text-5xl font-bold text-white tracking-tighter mb-4 italic uppercase">Vea la Transformación en Realidad</h2>
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
                    <h3 className="text-xl font-bold text-white mb-2 uppercase italic">{video.company}</h3>
                    <p className="text-gray-500 text-sm italic mb-8">"{video.quote}"</p>
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
      </section>

      {/* 13. CONTACT FORM SECTION (HABLEMOS) */}
      <section className="py-40 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeInUp>
            <div className="text-center mb-16">
              <div className="text-6xl mb-8">💬</div>
              <h2 className="text-5xl font-bold text-white tracking-tighter mb-4 italic uppercase">Hablemos de Tu Proyecto</h2>
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
      </section>

      {/* 14. REVIEW FORM SECTION (COMPARTE EXPERIENCIA) */}
      <section className="py-32 px-6 bg-indigo-500/[0.05]">
        <div className="max-w-4xl mx-auto">
          <FadeInUp>
            <div className="text-center mb-16">
              <div className="text-5xl mb-8">⭐</div>
              <h2 className="text-5xl font-bold text-white tracking-tighter mb-4 italic uppercase">Comparte Tu Experiencia</h2>
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
      </section>

      {/* 15. CTA SECTION (ESTO ES LA CTA FINAL ELITE 2.0) */}
      <section className="py-40 px-6 bg-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
        <div className="max-w-5xl mx-auto text-center relative z-10 text-white">
          <FadeInUp>
            <div className="text-8xl mb-8 floating-anim">🚀</div>
            <h2 className="text-6xl font-bold tracking-tighter mb-8 italic uppercase leading-none">¿Listo para Ser Nuestro Próximo Caso de Éxito?</h2>
            <p className="text-2xl font-medium opacity-80 mb-16 max-w-2xl mx-auto italic">Únete a las empresas líderes que ya están transformando sus industrias con nosotros.</p>
            <button className="btn-elite px-20 py-8 bg-white text-indigo-600 rounded-full font-black uppercase tracking-[0.4em] text-sm shadow-2xl hover:scale-110">
              Iniciar Proyecto
            </button>
          </FadeInUp>
        </div>
      </section>

      {/* MODAL DETALLES (ESTUDIO DE CASO) */}
      <AnimatePresence>
        {selectedClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[2000] flex items-center justify-center p-6"
            onClick={() => setSelectedClient(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-effect p-12 md:p-24 rounded-[4rem] border border-white/20 max-w-6xl w-full max-h-[90vh] overflow-y-auto relative"
            >
              <button onClick={() => setSelectedClient(null)} className="absolute top-10 right-10 w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/20 hover:text-white transition-all text-2xl">✕</button>

              <div className="flex flex-col md:flex-row gap-16 items-start mb-20">
                <div className="text-9xl filter drop-shadow-[0_0_30px_rgba(99,102,241,0.5)]">{selectedClient.logo}</div>
                <div>
                  <h2 className="text-6xl text-white font-bold uppercase italic tracking-tighter mb-6">{selectedClient.name}</h2>
                  <div className="flex gap-4">
                    <span className="bg-indigo-500/20 text-indigo-400 px-8 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-500/30">{selectedClient.industry}</span>
                    <span className="bg-white/5 text-white/50 px-8 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-white/10">{selectedClient.year}</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-20">
                <div className="space-y-12">
                  <div>
                    <h4 className="text-indigo-400 text-xs font-black uppercase tracking-[0.4em] mb-8">El Desafío</h4>
                    <p className="text-gray-300 text-2xl italic leading-relaxed font-medium">"{selectedClient.testimonial}"</p>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-indigo-400 text-xs font-black uppercase tracking-[0.4em] mb-8">Servicios</h4>
                    <div className="grid grid-cols-1 gap-4">
                      {selectedClient.services.map((s: any) => (
                        <div key={s} className="flex items-center gap-6 p-6 bg-white/5 rounded-3xl border border-white/5">
                          <FaCheckCircle className="text-indigo-500 text-2xl" />
                          <span className="text-white font-black uppercase tracking-widest text-xs">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-12">
                  <h4 className="text-indigo-400 text-xs font-black uppercase tracking-[0.4em] mb-8">Data Viz Performance</h4>
                  <div className="space-y-10">
                    {selectedClient.metrics.map((m: any, idx: number) => (
                      <div key={idx} className="bg-white/5 p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                        <div className="flex justify-between items-center mb-8">
                          <span className="text-white font-black uppercase tracking-widest text-xs italic">{m.label}</span>
                          <div className="px-6 py-2 bg-indigo-500 text-white rounded-full text-sm font-black italic">+{m.improvement}%</div>
                        </div>
                        <div className="flex items-center gap-10 mb-6">
                          <div className="flex-1 text-right text-white/20 line-through text-xs font-black">{m.before}</div>
                          <FaArrowRight className="text-indigo-500" />
                          <div className="flex-1 text-left text-indigo-400 text-2xl font-black italic">{m.after}</div>
                        </div>
                        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${Math.min(m.improvement, 100)}%` }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 shimmer-fill"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-10">
                    <h4 className="text-indigo-400 text-xs font-black uppercase tracking-[0.4em] mb-10">Cronograma de Ejecución</h4>
                    <div className="timeline">
                      {selectedClient.timeline.map((step: any, i: number) => (
                        <div key={i} className="timeline-item">
                          <div className="flex justify-between mb-2">
                            <span className="text-xl text-white font-bold italic uppercase">{step.phase}</span>
                            <span className={`text-[9px] font-black uppercase px-4 py-1 rounded-full ${step.status === 'completed' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-purple-500/20 text-purple-400 animate-pulse'}`}>{step.status}</span>
                          </div>
                          <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">{step.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
