"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaRocket, FaStar, FaCheck, FaTimes, FaPlus, FaMinus, FaLightbulb,
  FaShieldAlt, FaChartBar, FaUserTie, FaWhatsapp, FaEnvelope, FaPhone,
  FaGlobe, FaShoppingCart, FaMobileAlt, FaDatabase, FaUsers, FaTools,
  FaServer, FaLock, FaBolt, FaCloudUploadAlt, FaCode
} from "react-icons/fa";

// --- DATA ---
const ALL_PROJECTS = [
  { id: 1, title: "Landing Page Profesional", category: "web", price: "$800", icon: <FaGlobe />, desc: "Página única optimizada para conversión" },
  { id: 2, title: "Sitio Web Corporativo", category: "web", price: "$1,500", icon: <FaGlobe />, desc: "5-10 páginas con diseño profesional" },
  { id: 3, title: "Tienda Online E-Commerce", category: "ecommerce", price: "$3,500", icon: <FaShoppingCart />, desc: "Plataforma completa de ventas online" },
  { id: 4, title: "Marketplace Multi-Vendor", category: "ecommerce", price: "$7,500", icon: <FaShoppingCart />, desc: "Mercado con múltiples vendedores" },
  { id: 5, title: "Sistema CRM", category: "sistemas", price: "$4,800", icon: <FaDatabase />, desc: "Gestión completa de clientes" },
  { id: 6, title: "Sistema ERP", category: "sistemas", price: "$12,000", icon: <FaChartBar />, desc: "Planificación de recursos empresariales" },
  { id: 7, title: "App Móvil iOS/Android", category: "apps", price: "$8,500", icon: <FaMobileAlt />, desc: "Aplicación nativa multiplataforma" },
  { id: 8, title: "Portal de Reservas", category: "sistemas", price: "$2,800", icon: <FaUsers />, desc: "Sistema de citas y agendamiento" },
  { id: 9, title: "Blog Corporativo", category: "web", price: "$1,200", icon: <FaTools />, desc: "Plataforma de contenido SEO" },
  { id: 10, title: "Catálogo Digital", category: "web", price: "$900", icon: <FaGlobe />, desc: "Muestra productos/servicios online" },
  { id: 11, title: "Intranet Empresarial", category: "sistemas", price: "$6,500", icon: <FaShieldAlt />, desc: "Portal interno para empleados" },
  { id: 12, title: "App Web Progresiva (PWA)", category: "apps", price: "$5,200", icon: <FaMobileAlt />, desc: "Web app con funciones nativas" }
];

const SUGGESTED_PROJECTS = [
  { id: 1, title: "Chatbot IA con GPT-4", interest: 78, price: "$5,500", icon: "🤖", color: "#6366f1", tags: ["IA Avanzada", "Multiidioma", "Integración Web"] },
  { id: 2, title: "Plataforma de Cursos Online", interest: 92, price: "$6,800", icon: "🎓", color: "#14b8a6", tags: ["Video HD", "Certificados", "Membresías"] },
  { id: 3, title: "App de Delivery / Logística", interest: 65, price: "$9,200", icon: "📍", color: "#f59e0b", tags: ["GPS Real-time", "Rutas IA", "Multi-ciudad"] },
  { id: 4, title: "Sistema de Facturación Electrónica", interest: 88, price: "$4,200", icon: "💳", color: "#ec4899", tags: ["Timbrado SAT", "XML/PDF", "Reportes"] },
  { id: 5, title: "Telemedicina / Consultas Online", interest: 71, price: "$7,500", icon: "🏥", color: "#8b5cf6", tags: ["Video HD", "HIPAA", "Recetas"] },
  { id: 6, title: "Red Social / Comunidad Online", interest: 54, price: "$8,900", icon: "🎮", color: "#06b6d4", tags: ["Feeds", "Mensajería", "Grupos"] }
];

const FAQ_CATEGORIES = [
  {
    title: "💰 Precios y Pagos",
    color: "blue",
    items: [
      { q: "¿Ofrecen planes de pago o financiamiento?", a: "Sí, ofrecemos planes de pago flexibles en 2-4 cuotas sin intereses para proyectos >$2,000 USD. 50% inicio / 50% final." },
      { q: "¿Qué incluye exactamente el precio?", a: "Diseño, desarrollo, hosting 1 año, SSL, 3 rondas de revisión, capacitación y 30 días de soporte post-lanzamiento." },
      { q: "¿Hay costos adicionales ocultos?", a: "No. Solo dominios ($15-50/año) o licencias premium específicas. Todo se detalla en la cotización." }
    ]
  },
  {
    title: "⏱️ Tiempos y Entrega",
    color: "emerald",
    items: [
      { q: "¿Cuánto tiempo tarda un proyecto?", a: "Landing: 1-2 semanas. Web Corp: 3-4 semanas. E-Commerce: 4-6 semanas. Sistemas: 6-12 semanas. Apps: 8-16 semanas." },
      { q: "¿Qué pasa si necesito cambios?", a: "Incluimos 3 rondas de revisión. Cambios menores son gratis; cambios estructurales fuera del alcance se cotizan aparte." },
      { q: "¿Entregan por etapas?", a: "Sí: Diseño > Prototipo > Desarrollo > Testing > Lanzamiento. Revisas cada etapa." }
    ]
  },
  {
    title: "🛠️ Soporte y Mantenimiento",
    color: "violet",
    items: [
      { q: "¿Incluyen soporte post-lanzamiento?", a: "Sí, 30 días gratuitos para bugs. Luego ofrecemos planes de mantenimiento desde $150/mes." },
      { q: "¿Ofrecen contratos a largo plazo?", a: "Sí, planes mensuales con actualizaciones, seguridad, backups y soporte prioritario." },
      { q: "¿Puedo escalar el proyecto después?", a: "Totalmente. Desarrollamos pensando en escalabilidad. Puedes añadir módulos cuando quieras." }
    ]
  },
  {
    title: "🔐 Seguridad y Hosting",
    color: "amber",
    items: [
      { q: "¿Dónde se aloja mi sistema?", a: "Usamos Microsoft Azure Enterprise. 99.9% uptime, CDN global y seguridad ISO 27001." },
      { q: "¿Qué tan seguro es?", a: "SSL/TLS, WAF, protección DDoS, encriptación y MFA incluidos por defecto." },
      { q: "¿Hacen backups?", a: "Sí, backups diarios automáticos con retención de 30 días." }
    ]
  },
  {
    title: "📱 Tecnología",
    color: "pink",
    items: [
      { q: "¿Qué tecnologías usan?", a: "React, Next.js, Node.js, Python, SQL/NoSQL. Apps: React Native o Nativo. Lo mejor para cada caso." },
      { q: "¿Es responsive?", a: "100%. Diseño Mobile-First garantizado para funcionar perfecto en celulares y tablets." },
      { q: "¿Integran otras herramientas?", a: "Sí: Stripe, PayPal, Salesforce, HubSpot, Mailchimp, Google Analytics, ERPs, etc." }
    ]
  }
];

const REVIEWS = [
  { name: "María González", role: "Dueña de Boutique Fashion", text: "Excelente servicio. Entregaron mi tienda online en tiempo récord y funcionando perfectamente. Las ventas aumentaron un 300% en el primer mes.", rating: 5, initial: "M", color: "blue" },
  { name: "Carlos Ramírez", role: "Director Comercial, TechSolutions", text: "El sistema CRM que desarrollaron transformó nuestra operación comercial. Ahora podemos dar seguimiento a 500+ clientes sin perder detalle.", rating: 5, initial: "C", color: "emerald" },
  { name: "Ana Martínez", role: "CEO, Consulting Group", text: "Profesionales de primer nivel. El sitio web que crearon posicionó nuestra marca digitalmente. Ahora recibimos 200+ consultas mensuales.", rating: 5, initial: "A", color: "violet" },
  { name: "Jorge Silva", role: "Fundador, FitLife App", text: "La app móvil que desarrollaron superó nuestras expectativas. Interface intuitiva, rápida y sin errores. Soporte técnico A+.", rating: 5, initial: "J", color: "amber" },
  { name: "Laura Fernández", role: "CTO, InnovateTech", text: "Migración completa a la nube sin downtime. La seguridad Microsoft Azure nos da tranquilidad total. Equipo técnico muy capacitado.", rating: 5, initial: "L", color: "pink" },
  { name: "Roberto Díaz", role: "Gerente, Dental Clinic Pro", text: "Portal de reservas espectacular. Nuestros clientes pueden agendar citas 24/7 y nosotros optimizamos recursos. Resultados impresionantes.", rating: 5, initial: "R", color: "cyan" }
];

export default function ProyectosElitePage() {
  const [filter, setFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<string | null>(null); // For FAQ
  const [rating, setRating] = useState(0);
  const [reviewSent, setReviewSent] = useState(false);
  const [votedProjects, setVotedProjects] = useState<number[]>([]);
  const [reviewSummary, setReviewSummary] = useState({ average: 4.9, total: 150 });
  const [reviewError, setReviewError] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const filteredProjects = useMemo(() =>
    filter === "all" ? ALL_PROJECTS : ALL_PROJECTS.filter(p => p.category === filter),
    [filter]
  );

  const toggleFaq = (idx: string) => {
    setActiveTab(activeTab === idx ? null : idx);
  };

  const handleVote = (id: number) => {
    if (!votedProjects.includes(id)) {
      setVotedProjects([...votedProjects, id]);
      alert("¡Gracias por tu voto! Hemos registrado tu interés.");
    }
  };

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
        console.error("Error loading project reviews summary:", error);
      }
    };

    loadReviewSummary();
  }, []);

  const handleSubmitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReviewError("");

    if (rating < 1) {
      setReviewError("Selecciona una calificacion entre 1 y 5.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const authorName = String(formData.get("author_name") || "").trim();
    const authorRole = String(formData.get("author_role") || "").trim();
    const content = String(formData.get("content") || "").trim();

    if (!authorName || !authorRole || content.length < 20) {
      setReviewError("Completa nombre, cargo y un comentario mas detallado.");
      return;
    }

    try {
      setIsSubmittingReview(true);
      const res = await fetch("http://localhost:8000/api/services-page/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_name: authorName,
          author_role: authorRole,
          author_company: authorRole,
          content,
          rating,
          page_context: "proyectos",
        }),
      });

      if (!res.ok) {
        setReviewError("No se pudo guardar la reseña. Intenta nuevamente.");
        return;
      }

      event.currentTarget.reset();
      setRating(0);
      setReviewSent(true);
    } catch (error) {
      console.error("Error submitting project review:", error);
      setReviewError("Error de conexion al guardar la reseña.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="projects-elite-wrapper pt-20">

      {/* 1. HERO SECTION */}
      <section className="hero-bg py-32 px-6 text-center relative z-10">
        <div className="max-w-6xl mx-auto relative z-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="badge-elite mb-8"> <FaRocket /> PROYECTOS PROFESIONALES </span>
            <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 drop-shadow-2xl">
              Nuestros Proyectos
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-16 leading-relaxed">
              Soluciones digitales profesionales para empresas, PYMES y emprendedores que buscan crecer con tecnología de vanguardia.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { val: "150+", label: "Proyectos Completados" },
                { val: "98%", label: "Clientes Satisfechos" },
                { val: "24/7", label: "Soporte Técnico" },
                { val: "5+", label: "Años de Experiencia" }
              ].map((stat, i) => (
                <div key={i} className="glass-box p-8">
                  <div className="text-4xl font-black text-white mb-2 glow-text">{stat.val}</div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. 🔥 BESTSELLERS SECTION */}
      <section className="py-32 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black mb-6 text-white">🔥 Proyectos Más Solicitados</h2>
            <p className="text-xl text-slate-400">Los proyectos más populares y exitosos que ofrecemos para tu éxito digital</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { title: "Página Web Corporativa", price: "1,500", desc: "Sitio web profesional con diseño moderno, optimizado para SEO y totalmente responsive.", tags: ["Diseño Responsivo", "SEO Optimizado", "Hosting"], color: "from-blue-600 to-indigo-800", icon: <FaGlobe /> },
              { title: "Tienda Online E-Commerce", price: "3,500", desc: "Plataforma completa de ventas online con carrito, pasarela de pagos y panel de administración.", tags: ["Pagos Seguros", "Inventario", "Panel Admin"], color: "from-emerald-600 to-teal-800", icon: <FaShoppingCart /> },
              { title: "Sistema de Gestión CRM", price: "4,800", desc: "Gestiona clientes, ventas y seguimiento. Aumenta productividad con automatización y reportes.", tags: ["Automatización", "Reportes", "Multi-usuario"], color: "from-violet-600 to-purple-800", icon: <FaDatabase /> }
            ].map((p, i) => (
              <div key={i} className="project-card-midnight group">
                <div className={`card-visual bg-gradient-to-br ${p.color}`}>
                  <span className="bestseller-badge">⭐ MÁS VENDIDO</span>
                  {p.icon}
                </div>
                <div className="p-10 flex-1 flex flex-col">
                  <h3 className="text-2xl font-black mb-4 text-white">{p.title}</h3>
                  <p className="text-slate-400 mb-8 leading-relaxed flex-1">{p.desc}</p>
                  <div className="flex flex-wrap gap-2 mb-10">
                    {p.tags.map(t => <span key={t} className="tag-elite">{t}</span>)}
                  </div>
                  <div className="flex justify-between items-center pt-8 border-t border-white/10">
                    <div className="text-3xl font-black text-white">${p.price} <span className="text-sm text-slate-500 font-bold uppercase">USD</span></div>
                    <button className="px-6 py-3 bg-blue-600/20 text-blue-400 border border-blue-600/50 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all">Detalles</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. 📂 ALL PROJECTS GRID */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-6 text-white">📂 Portafolio Completo</h2>
            <div className="flex flex-wrap justify-center gap-4 mt-10">
              {["all", "web", "ecommerce", "sistemas", "apps"].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-3 rounded-full font-bold transition-all border ${filter === f
                      ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30"
                      : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  {f === "all" ? "Todos" : f === "web" ? "Sitios Web" : f === "ecommerce" ? "E-Commerce" : f === "sistemas" ? "Sistemas" : "Apps Móviles"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((p) => (
                <motion.div
                  layout
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="project-card-midnight"
                >
                  <div className="card-visual h-40 text-5xl bg-gradient-to-br from-slate-800 to-slate-900">
                    {p.icon}
                  </div>
                  <div className="p-8">
                    <h3 className="text-lg font-black mb-2 text-white">{p.title}</h3>
                    <p className="text-sm text-slate-400 mb-6 line-clamp-2">{p.desc}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                      <div className="text-xl font-black text-blue-400">{p.price}</div>
                      <button className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Ver Más</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 4. 🎯 CLIENT TYPE GUIDE */}
      <section className="py-32 px-6 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black mb-6 text-white">🎯 ¿Qué Proyecto Es Ideal Para Ti?</h2>
            <p className="text-xl text-slate-400">Encuentra la solución perfecta según el tamaño y necesidades de tu negocio</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { type: "Emprendedor / Freelancer", icon: "💡", desc: "Estás comenzando tu negocio y necesitas establecer presencia online profesional.", recs: ["Landing Page Profesional", "Página Web Personal", "Catálogo Digital"], budget: "$800 - $2,000", color: "blue" },
              { type: "PYME", icon: "🏢", desc: "Tu negocio está creciendo y necesitas herramientas profesionales para escalar operaciones.", recs: ["Web Corporativa Completa", "Tienda Online E-Commerce", "Sistema de Reservas", "Sistema CRM Básico"], budget: "$2,500 - $6,000", color: "emerald" },
              { type: "Empresa / Corporativo", icon: "🏛️", desc: "Empresa establecida que requiere soluciones enterprise robustas y escalables.", recs: ["Portal Corporativo Enterprise", "Sistema ERP Personalizado", "Intranet Empresarial", "App Web/Móvil Custom"], budget: "$7,000+", color: "violet" }
            ].map((c, i) => (
              <div key={i} className="client-type-card-midnight border-t-4" style={{ borderColor: c.color === 'blue' ? '#3b82f6' : c.color === 'emerald' ? '#10b981' : '#8b5cf6' }}>
                <div className="icon-circle text-white">{c.icon}</div>
                <h3 className="text-2xl font-black mb-6 text-white">{c.type}</h3>
                <p className="text-slate-400 mb-10 leading-relaxed italic">{c.desc}</p>
                <div className="mb-10">
                  <div className="text-xs font-black uppercase tracking-widest text-white mb-6">Proyectos Recomendados:</div>
                  <div className="space-y-3">
                    {c.recs.map(r => (
                      <div key={r} className="p-4 bg-white/5 border-l-2 border-white/20 rounded-r-xl font-bold text-sm text-slate-300">
                        <FaCheck className={`inline mr-2 text-${c.color}-400`} /> {r}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-6 bg-black/20 rounded-2xl border border-white/5 mt-auto">
                  <div className="text-xs text-slate-500 font-bold mb-2 uppercase">Presupuesto estimado:</div>
                  <div className={`text-3xl font-black text-${c.color}-400`}>{c.budget}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 🛡️ TECHNOLOGY COMPARISON */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black mb-6 text-white">🛡️ Tecnologías y Seguridad</h2>
            <p className="text-xl text-slate-400">Comparativa de herramientas tecnológicas y soluciones Microsoft</p>
          </div>

          <div className="comparison-wrapper-midnight mb-20 overflow-x-auto">
            <table className="min-w-[800px]">
              <thead>
                <tr>
                  <th className="w-1/3">Característica</th>
                  <th className="text-center">Solución Estándar</th>
                  <th className="text-center">Microsoft Azure</th>
                  <th className="text-center text-blue-400">Nuestra Solución</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { f: "Certificación SSL/TLS", s: true, a: true, o: true },
                  { f: "Firewall Avanzado", s: true, a: true, o: true },
                  { f: "Backup Automático Diario", s: false, a: true, o: true },
                  { f: "CDN Global (Velocidad)", s: false, a: true, o: true },
                  { f: "Autenticación Multi-Factor", s: false, a: true, o: true },
                  { f: "Protección DDoS", s: false, a: true, o: true },
                  { f: "Monitoreo 24/7", s: false, a: true, o: true },
                  { f: "Escalabilidad Automática", s: false, a: true, o: true },
                  { f: "Cumplimiento GDPR/ISO", s: false, a: true, o: true }
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="font-bold text-slate-300">{row.f}</td>
                    <td className="text-center">{row.s ? <span className="text-emerald-500">✓</span> : <span className="text-red-500">✗</span>}</td>
                    <td className="text-center">{row.a ? <span className="text-emerald-500">✓</span> : <span className="text-red-500">✗</span>}</td>
                    <td className="text-center">{row.o ? <span className="text-blue-400 font-bold">✓</span> : <span className="text-red-500">✗</span>}</td>
                  </tr>
                ))}
                <tr className="bg-emerald-900/10">
                  <td className="font-black text-emerald-400">💼 Soporte Técnico Dedicado</td>
                  <td className="text-center text-slate-600 font-bold">Limitado</td>
                  <td className="text-center text-slate-600 font-bold">Premium</td>
                  <td className="text-center font-black text-emerald-400">24/7 Prioritario</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Certs Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: <FaUserTie />, title: "Microsoft Partner", desc: "Acceso a tecnología Azure enterprise" },
              { icon: <FaLock />, title: "Seguridad Total", desc: "Estándares ISO 27001 y GDPR" },
              { icon: <FaBolt />, title: "Rendimiento", desc: "Uptime del 99.9% garantizado" },
              { icon: <FaCloudUploadAlt />, title: "Backup Continuo", desc: "Respaldo automático cada 24h" }
            ].map((c, i) => (
              <div key={i} className="glass-box p-8 text-center hover:border-blue-500/50">
                <div className="text-5xl mb-6 text-white">{c.icon}</div>
                <h4 className="text-lg font-black text-white mb-2">{c.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. 💡 SUGGESTED PROJECTS */}
      <section className="py-32 px-6 bg-gradient-to-b from-slate-900 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black mb-6 text-white">💡 Próximas Innovaciones</h2>
            <p className="text-xl text-slate-400">¿Te gustaría que desarrollemos estos proyectos? Vota por tus favoritos</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {SUGGESTED_PROJECTS.map((p) => (
              <div key={p.id} className="project-card-midnight border-dashed border-2 border-white/10" style={{ borderColor: p.color }}>
                <div className="card-visual h-48 text-7xl relative" style={{ background: `linear-gradient(135deg, ${p.color}40, transpartent)` }}>
                  <span className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black tracking-widest text-white uppercase border border-white/20">
                    🆕 PRÓXIMAMENTE
                  </span>
                  {p.icon}
                </div>
                <div className="p-10">
                  <h3 className="text-2xl font-black mb-4 text-white">{p.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {p.tags.map(t => <span key={t} className="tag-elite">{t}</span>)}
                  </div>

                  <div className="mb-10 p-6 bg-amber-900/10 rounded-2xl border-l-4 border-amber-500">
                    <div className="text-xs font-black text-amber-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                      <FaLightbulb /> Interés del Mercado
                    </div>
                    <div className="h-3 w-full bg-amber-900/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${p.interest}%` }}
                        className="h-full bg-amber-500"
                      />
                    </div>
                    <div className="text-[11px] text-amber-500 mt-3 font-bold">{p.interest} empresas interesadas</div>
                  </div>

                  <div className="flex justify-between items-center pt-8 border-t border-white/10">
                    <div className="text-2xl font-black" style={{ color: p.color }}>{p.price}</div>
                    <button
                      onClick={() => handleVote(p.id)}
                      disabled={votedProjects.includes(p.id)}
                      className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${votedProjects.includes(p.id) ? "bg-white/10 text-slate-400" : "bg-white/90 text-black hover:scale-105"
                        }`}
                    >
                      {votedProjects.includes(p.id) ? "Votado ✓" : <>👍 Me Interesa</>}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 p-12 glass-box text-center border border-blue-500/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-600/5"></div>
            <div className="relative z-10">
              <h3 className="text-3xl font-black text-blue-400 mb-4">💡 ¿Tienes Una Idea Diferente?</h3>
              <p className="text-lg text-blue-200/70 mb-10 max-w-2xl mx-auto">Si tienes en mente un proyecto que no está en esta lista, contáctanos y evaluamos tu visión empresarial.</p>
              <button className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">
                🚀 Proponer Mi Proyecto
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ❓ FAQ SECTION - CATEGORIZED */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black mb-6 text-white">❓ Preguntas Frecuentes</h2>
            <p className="text-xl text-slate-400">Resolvemos tus dudas más comunes sobre nuestros servicios</p>
          </div>

          <div className="space-y-8">
            {FAQ_CATEGORIES.map((cat, catIdx) => (
              <div key={catIdx} className={`p-8 rounded-3xl border-l-4 bg-gradient-to-r from-${cat.color}-900/10 to-transparent border-${cat.color}-500`}>
                <h3 className={`text-2xl font-black text-${cat.color}-400 mb-8 flex items-center gap-3`}>
                  {cat.title}
                </h3>
                <div className="space-y-4">
                  {cat.items.map((faq, i) => {
                    const uniqueId = `${catIdx}-${i}`;
                    const isActive = activeTab === uniqueId;
                    return (
                      <div
                        key={i}
                        className={`faq-item-midnight ${isActive ? 'active' : ''}`}
                        onClick={() => toggleFaq(uniqueId)}
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="text-lg font-bold text-white">{faq.q}</h4>
                          <span className={`text-2xl font-black text-${cat.color}-500 transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`}>
                            {isActive ? <FaMinus /> : <FaPlus />}
                          </span>
                        </div>
                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <p className="text-slate-400 mt-6 pt-6 border-t border-white/10 leading-relaxed">{faq.a}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 p-12 bg-slate-800/50 rounded-3xl text-center relative overflow-hidden group border border-white/5">
            <h3 className="text-3xl font-black text-white mb-4">¿No encontraste tu pregunta?</h3>
            <p className="text-white/60 mb-10">Contáctanos directamente y resolveremos todas tus dudas en minutos.</p>
            <button className="px-12 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-3 mx-auto">
              💬 Hacer Una Pregunta
            </button>
          </div>
        </div>
      </section>

      {/* 8. ⭐ REVIEWS / TESTIMONIALS */}
      <section className="py-32 px-6 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black mb-6 text-white text-center">⭐ Voces de Éxito</h2>
            <div className="flex justify-center items-center gap-12 mt-12 pb-12 border-b border-white/10">
              <div className="text-center">
                <div className="text-6xl font-black text-amber-500 mb-2">{reviewSummary.average.toFixed(1)}</div>
                <div className="flex justify-center text-amber-500 mb-2 text-xl"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Calificación Promedio</div>
              </div>
              <div className="w-[1px] h-20 bg-white/10"></div>
              <div className="text-center">
                <div className="text-6xl font-black text-blue-500 mb-2">{reviewSummary.total}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-3">Reseñas Verificadas</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {REVIEWS.map((r, i) => (
              <div key={i} className="review-card-midnight">
                <div className="flex text-amber-500 gap-1 mb-8 relative z-10 text-xl">
                  {Array.from({ length: r.rating }).map((_, st) => <FaStar key={st} />)}
                </div>
                <p className="text-slate-300 text-lg leading-relaxed mb-10 relative z-10 italic">"{r.text}"</p>
                <div className="flex items-center gap-6 relative z-10">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-xl bg-${r.color}-600`}>
                    {r.initial}
                  </div>
                  <div>
                    <div className="text-lg font-black text-white">{r.name}</div>
                    <div className="text-sm text-slate-500 font-bold">{r.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 9. ✍️ REVIEW SUBMISSION FORM */}
          <div className="mt-32 max-w-4xl mx-auto">
            <div className="glass-box p-16">
              {!reviewSent ? (
                <>
                  <div className="text-center mb-16">
                    <div className="text-6xl mb-6">✍️</div>
                    <h3 className="text-4xl font-black text-white mb-4">¿Trabajaste con nosotros?</h3>
                    <p className="text-lg text-slate-400">Nos encantaría conocer tu experiencia para seguir mejorando.</p>
                  </div>
                  <form className="space-y-8" onSubmit={handleSubmitReview}>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-white ml-2">Nombre Completo *</label>
                        <input type="text" required placeholder="Ej: María González" className="input-elite" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-white ml-2">Cargo o Empresa *</label>
                        <input type="text" required placeholder="Ej: CEO TechSolutions" className="input-elite" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-black uppercase tracking-widest text-white ml-2">Tu Calificación *</label>
                      <div className="flex gap-4">
                        {[1, 2, 3, 4, 5].map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setRating(s)}
                            className={`text-5xl transition-all ${rating >= s ? "text-amber-500 scale-110" : "text-slate-700"}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-white ml-2">Tu Reseña *</label>
                      <textarea required rows={6} placeholder="Cuéntanos sobre los resultados del proyecto..." className="input-elite resize-none"></textarea>
                      <div className="text-xs text-slate-500 text-right">Mínimo 50 caracteres</div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-blue-600/20 hover:scale-[1.01] active:scale-95 transition-all"
                    >
                      🚀 Enviar Mi Experiencia
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-20 px-10">
                  <div className="text-8xl mb-8">🎉</div>
                  <h3 className="text-4xl font-black text-emerald-400 mb-4">¡Gracias por tu reseña!</h3>
                  <p className="text-xl text-slate-400 leading-relaxed mb-10">Tu opinión es invaluable. Será verificada por nuestro equipo antes de publicarse.</p>
                  <button onClick={() => setReviewSent(false)} className="px-10 py-4 bg-white/10 text-white font-black rounded-xl uppercase tracking-widest text-xs hover:bg-white/20">Volver a Formulario</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 10. 🚀 FINAL CTA */}
      <section className="py-40 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_60%)]"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-6xl md:text-7xl font-black text-white mb-8 leading-tight tracking-tighter">¿Listo Para Escalar Tu Negocio?</h2>
          <p className="text-xl md:text-2xl text-slate-400 mb-16 leading-relaxed max-w-2xl mx-auto hover:text-white transition-colors">
            Contáctanos hoy y recibe una cotización personalizada sin compromiso. Respondemos en menos de 24 horas.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-20 text-slate-500 text-sm font-bold uppercase tracking-widest">
            <span className="flex items-center gap-2"><FaCheck className="text-emerald-500" /> Respuesta en 24h</span>
            <span className="flex items-center gap-2"><FaCheck className="text-emerald-500" /> Cotización Gratis</span>
            <span className="flex items-center gap-2"><FaCheck className="text-emerald-500" /> Sin Compromiso</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            <button className="px-12 py-6 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-emerald-600/20 hover:bg-emerald-500 transition-all flex items-center gap-3">
              <FaEnvelope /> Enviar Email
            </button>
            <button className="px-12 py-6 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-blue-600/20 hover:bg-blue-500 transition-all flex items-center gap-3">
              <FaWhatsapp /> WhatsApp
            </button>
            <button className="px-12 py-6 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-200 transition-all flex items-center gap-3">
              <FaPhone /> Llamar
            </button>
          </div>
        </div>
      </section>

      {/* FLOATING CONTACT BUTTON */}
      <button className="floating-contact-btn group">
        <span className="text-xl">📞</span>
        <span>Contactar Ahora</span>
      </button>

      {/* FOOTER */}
      <footer className="py-12 text-center border-t border-white/5 bg-black/40">
        <p className="text-slate-600 text-xs font-bold uppercase tracking-[0.4em]">© 2024 Portfolio de Proyectos · Elite 2.0 Engineering</p>
      </footer>

    </div>
  );
}
