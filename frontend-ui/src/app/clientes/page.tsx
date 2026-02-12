"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowRight,
  FaCheckCircle,
  FaStar,
  FaPlus,
} from "react-icons/fa";
import { FaUserLarge } from "react-icons/fa6";

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
  { number: "200+", label: "Clientes Globales", icon: "🌍" },
  { number: "$2.5B+", label: "Revenue Generado", icon: "💰" },
  { number: "99.8%", label: "Tasa de Éxito", icon: "⭐" },
  { number: "24/7", label: "Soporte Dedicado", icon: "🛡️" }
];

const GLOBAL_RESULTS = [
  { number: "850+", label: "Proyectos Completados", icon: "✅", description: "En 50+ países", trend: "+127% YoY" },
  { number: "$4.8B", label: "Revenue Cliente Generado", icon: "📈", description: "Impacto económico total", trend: "+215% crecimiento" },
  { number: "98.9%", label: "Satisfacción Cliente", icon: "🌟", description: "Promedio de calificación", trend: "4.9/5.0 estrellas" },
  { number: "15", label: "Industrias Atendidas", icon: "🏢", description: "Experiencia diversa", trend: "Tech, Finance, Health+" },
  { number: "2.3M", label: "Usuarios Finales", icon: "👥", description: "Alcance global", trend: "+340% engagement" },
  { number: "92%", label: "Retención Clientes", icon: "🔄", description: "Relaciones a largo plazo", trend: "Promedio 4.2 años" }
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

  const filteredClients = filter === "todos" ? CLIENTS : CLIENTS.filter(c => c.industry === filter);

  return (
    <div className="clients-elite-wrapper">

      {/* 1. HERO SECTION */}
      <header className="hero-gradient pt-40 pb-32 px-6">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <FadeInUp>
            <div className="inline-block px-6 py-2 bg-white/5 border border-indigo-500 rounded-full mb-8 backdrop-blur-md">
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-indigo-400">Portafolio Clientes</span>
            </div>
            <h1 className="text-6xl md:text-[5.5rem] font-bold leading-[1.1] mb-8 tracking-tighter text-white">
              Clientes que <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-500">Transforman</span> Industrias
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-16 leading-relaxed">
              Colaboramos con líderes globales para crear experiencias extraordinarias y forjar el futuro a través de <span className="text-white">Ingeniería Digital de Vanguardia</span>.
            </p>

            {/* Rating Badge */}
            <div className="inline-flex items-center gap-4 bg-white/5 px-8 py-4 rounded-full border-2 border-indigo-500/50 mb-20 backdrop-blur-xl">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => <FaStar key={i} className="text-yellow-400 text-xl" />)}
              </div>
              <span className="text-2xl font-bold text-white">4.9</span>
              <span className="text-gray-500 text-sm font-bold uppercase tracking-widest">(50+ reseñas)</span>
            </div>
          </FadeInUp>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {GLOBAL_STATS.map((stat, i) => (
              <FadeInUp key={i} delay={i * 0.1}>
                <div className="metric-card glass-effect aspect-square flex flex-col items-center justify-center p-8 rounded-[2.5rem]">
                  <div className="text-5xl mb-4">{stat.icon}</div>
                  <div className="text-4xl font-black text-indigo-500 mb-2">{stat.number}</div>
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">{stat.label}</div>
                </div>
              </FadeInUp>
            ))}
          </div>

          {/* Logo Marquee */}
          <div className="logo-marquee mt-24 py-10 bg-white/5 border-y border-white/5 rounded-3xl overflow-hidden">
            <div className="logo-track">
              {Array(20).fill("🚀").map((emoji, i) => (
                <span key={i} className="text-6xl mx-16 opacity-30 hover:opacity-100 transition-opacity cursor-default">{emoji}</span>
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
              <div className="inline-block px-6 py-2 bg-indigo-500/10 border border-indigo-500/50 rounded-full mb-6">
                <span className="text-[10px] font-black tracking-widest uppercase text-indigo-400">📈 Impacto Global</span>
              </div>
              <h2 className="text-5xl font-bold text-white tracking-tighter mb-4">Nuestro Impacto en Números</h2>
              <p className="text-gray-500 max-w-2xl mx-auto">Resultados medibles que demuestran nuestro compromiso con la excelencia.</p>
            </FadeInUp>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {GLOBAL_RESULTS.map((res, i) => (
              <FadeInUp key={i} delay={i * 0.1}>
                <div className="metric-card glass-effect p-12 rounded-[2.5rem] border border-white/5 text-center transition-all hover:border-indigo-500/30">
                  <div className="text-6xl mb-6">{res.icon}</div>
                  <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-4">{res.number}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{res.label}</h3>
                  <p className="text-sm text-gray-500 mb-6">{res.description}</p>
                  <div className="inline-block px-4 py-2 bg-indigo-500/10 rounded-full text-indigo-400 text-[10px] font-black tracking-widest uppercase border border-indigo-500/20">
                    {res.trend}
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* 3. GLOBAL RESULTS SECTION NEW (Repeated per HTML) */}
      <section className="py-32 px-6 bg-indigo-500/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-at-c from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <FadeInUp>
              <div className="inline-block px-6 py-2 bg-indigo-500/20 border-2 border-indigo-500/50 rounded-full mb-6">
                <span className="text-[10px] font-black tracking-widest uppercase text-indigo-400">📈 RESULTADOS GLOBALES</span>
              </div>
              <h2 className="text-5xl font-bold text-white tracking-tighter mb-4">Impacto Global</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Colaborando con líderes para redefinir los estándares de la industria.</p>
            </FadeInUp>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {GLOBAL_RESULTS.map((res, i) => (
              <FadeInUp key={i} delay={i * 0.1}>
                <div className="metric-card glass-effect p-12 rounded-[2.5rem] border border-white/10 text-center hover:scale-105 transition-transform duration-500">
                  <div className="text-6xl mb-8 filter drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]">{res.icon}</div>
                  <div className="text-6xl font-black text-white mb-4 tracking-tighter italic">{res.number}</div>
                  <h3 className="text-xl font-bold text-indigo-400 mb-2">{res.label}</h3>
                  <p className="text-sm text-gray-500 mb-8">{res.description}</p>
                  <div className="inline-block px-6 py-3 bg-indigo-500 text-white rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg shadow-indigo-500/20">
                    {res.trend}
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FILTER SECTION (Sticky) */}
      <section className="sticky top-20 z-[100] py-8 px-6 backdrop-blur-3xl bg-black/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-4">
          {INDUSTRIES.map(ind => (
            <button
              key={ind}
              onClick={() => setFilter(ind)}
              className={`px-8 py-3 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-300 border-2 ${filter === ind ? "bg-indigo-500 border-indigo-500 text-white shadow-xl shadow-indigo-500/20" : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/30"}`}
            >
              {ind}
            </button>
          ))}
        </div>
      </section>

      {/* 5. CASE STUDIES SECTION */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <FadeInUp>
              <h2 className="text-6xl font-bold text-white tracking-tighter mb-4 italic uppercase">Casos de Éxito Destacados</h2>
              <div className="w-24 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full" />
            </FadeInUp>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <AnimatePresence mode="popLayout">
              {filteredClients.map((client, i) => (
                <motion.div
                  key={client.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="case-study-card h-full flex flex-col group cursor-pointer" onClick={() => setSelectedClient(client)}>
                    <div className="aspect-square relative overflow-hidden shine-effect">
                      <img src={client.image} alt={client.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-10 flex-1 flex flex-col">
                      <div className="flex items-center gap-6 mb-8">
                        <div className="client-logo-viz">{client.logo}</div>
                        <div>
                          <h3 className="text-3xl font-bold text-white">{client.name}</h3>
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-4 py-1 rounded-full">{client.industry}</span>
                        </div>
                      </div>
                      <p className="text-gray-400 text-lg mb-10 leading-relaxed font-medium flex-1">"{client.description}"</p>
                      <div className="grid grid-cols-3 gap-4 mb-10">
                        {Object.entries(client.results).map(([k, v]: any) => (
                          <div key={k} className="bg-white/5 p-6 rounded-3xl text-center border border-white/5 transition-all group-hover:bg-white/10">
                            <div className="text-2xl font-black text-white mb-1 tracking-tighter italic">{v}</div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{k}</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-8 border-t border-white/5">
                        <span className="text-white/20 text-xs font-black uppercase tracking-widest">{client.year}</span>
                        <span className="text-indigo-400 font-black uppercase text-xs tracking-widest group-hover:text-white transition-colors">Ver Caso →</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 6. PROCESS SECTION (METODOLOGÍA ELITE) */}
      <section className="py-32 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <FadeInUp>
              <h2 className="text-5xl font-bold text-white tracking-tighter mb-4 italic uppercase">Cómo Trabajamos</h2>
              <p className="text-gray-500 max-w-2xl mx-auto">Metodología probada que garantiza resultados excepcionales en cada proyecto.</p>
            </FadeInUp>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PROCESS_STEPS.map((step, i) => (
              <FadeInUp key={i} delay={i * 0.1}>
                <div className="glass-effect p-12 rounded-[3.5rem] border border-white/5 aspect-square flex flex-col justify-between group hover:border-indigo-500/30">
                  <div>
                    <div className="text-6xl mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">{step.icon}</div>
                    <div className="text-5xl font-black text-indigo-500/10 mb-6">{step.number}</div>
                    <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                    <p className="text-gray-400 leading-relaxed text-sm">{step.description}</p>
                  </div>
                  <div className="inline-block px-6 py-2 bg-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest self-start">
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
              <h2 className="text-5xl font-bold text-white tracking-tighter mb-4 italic uppercase">Por Qué Elegirnos</h2>
              <p className="text-gray-500">Comparación con soluciones tradicionales del mercado.</p>
            </FadeInUp>
          </div>
          <FadeInUp>
            <div className="glass-effect p-12 md:p-20 rounded-[4rem] border border-white/10 relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-center text-center">
                <span className="text-white/20 font-black uppercase text-xs tracking-[0.3em]">Otros Proveedores</span>
                <div className="hidden md:block h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                <span className="text-indigo-400 font-black uppercase text-xs tracking-[0.3em]">Nuestra Solución</span>
              </div>
              <div className="space-y-6">
                {COMPARISONS.map((comp, i) => (
                  <div key={i} className="comparison-item flex items-center gap-8 group">
                    <div className="text-3xl w-16 text-center">{comp.icon}</div>
                    <div className="flex-1 grid grid-cols-3 items-center gap-4">
                      <span className="text-right text-white/30 line-through text-sm font-bold uppercase">{comp.before}</span>
                      <FaArrowRight className="mx-auto text-indigo-500 group-hover:scale-125 transition-transform" />
                      <span className="text-left text-white font-black text-lg uppercase tracking-tight">{comp.after}</span>
                    </div>
                    <div className="w-52 text-right">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400/50 group-hover:text-indigo-400">{comp.label}</span>
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
