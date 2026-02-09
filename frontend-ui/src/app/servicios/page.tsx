"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaLaptopCode, FaMobileAlt, FaServer, FaDatabase, FaCloud, FaCogs,
  FaCheckCircle, FaArrowRight, FaWhatsapp, FaStar, FaBolt, FaTrophy, FaClock,
  FaRobot, FaPhoneAlt, FaEnvelopeOpenText, FaSyncAlt, FaPlay, FaTimes, FaChevronDown, FaChevronUp,
  FaRocket, FaChartLine, FaUsers, FaHandshake, FaBullhorn, FaGift, FaCode, FaPaintBrush, FaSearch
} from "react-icons/fa";

// --- DATA DEFINITIONS ---

const plans = [
  {
    id: 1,
    name: 'Landing Page Profesional',
    description: 'Página única enfocada en conversión inmediata',
    modules: '4–6 módulos',
    price: '$120.000 – $200.000',
    includes: ['Hero con imagen o video', 'Título + propuesta de valor', 'Beneficios destacados', 'Llamado a la acción', 'Horarios y ubicación', 'Botón WhatsApp flotante', 'Diseño responsive', 'Carga rápida'],
    delivery: ['Web lista para publicar', 'Enlace directo a WhatsApp', 'Diseño profesional', 'Optimizada móviles'],
    idealFor: ['Emprendedores', 'Servicios locales', 'Restaurantes', 'Negocios rápidos']
  },
  {
    id: 2,
    name: 'One-Page Website',
    description: 'Sitio completo en una sola página con scroll vertical',
    modules: '6–8 módulos',
    price: '$180.000 – $300.000',
    includes: ['Inicio / Hero', 'Servicios o Menú', 'Galería', 'Nosotros', 'Testimonios', 'Ubicación', 'Contacto', 'Nav interna'],
    delivery: ['Web completa single-page', 'Navegación fluida', 'Imagen sólida', 'Contacto inmediato'],
    idealFor: ['PYMEs', 'Tiendas locales', 'Negocios compactos']
  },
  {
    id: 3,
    name: 'Web Informativa',
    description: 'Página enfocada solo en mostrar información institucional',
    modules: '3–5 secciones',
    price: '$150.000 – $250.000',
    includes: ['Info negocio', 'Qué ofrece', 'Horarios', 'Dirección', 'Contacto', 'Redes sociales', 'Diseño formal'],
    delivery: ['Presencia online', 'Info clara', 'Imagen profesional'],
    idealFor: ['Oficinas', 'Talleres', 'Consultas', 'Tradicionales']
  },
  {
    id: 4,
    name: 'Sitio Web Corporativo Básico',
    description: 'Web estructurada con varias páginas internas',
    modules: '5–8 páginas',
    price: '$250.000 – $450.000',
    includes: ['Inicio', 'Servicios', 'Portafolio', 'Nosotros', 'Clientes', 'Ubicación', 'Contacto', 'Diseño corporativo'],
    delivery: ['Sitio completo multipágina', 'Imagen corporativa', 'Organización clara', 'Escalable'],
    idealFor: ['PYMEs formales', 'Empresas establecidas']
  },
  {
    id: 5,
    name: 'Sitio Web Corporativo Avanzado',
    description: 'Web profesional escalable, lista para crecer',
    modules: '8–12 páginas',
    price: '$450.000 – $750.000',
    includes: ['Todo lo del básico', 'Blog/Noticias', 'Formularios avanzados', 'SEO básico', 'Animaciones', 'Optimización total'],
    delivery: ['Nivel profesional superior', 'Base marketing digital', 'Alta credibilidad'],
    idealFor: ['Empresas en crecimiento', 'Consultoras']
  },
  {
    id: 6,
    name: 'Página Web Estática',
    description: 'Concepto técnico (base de desarrollo)',
    modules: 'Variable',
    price: 'Variable',
    includes: ['HTML/CSS/JS', 'Contenido fijo', 'Sin panel admin', 'Cambios por código'],
    delivery: ['Web ultra rápida', 'Sin costos mensuales', 'Bajo mantenimiento'],
    idealFor: ['Prototipos', 'Landing simple']
  }
];

const additionalServices = [
  { id: 1, name: "Bot WhatsApp Automático", description: "Responde 24/7 a tus clientes", price: "$180.000", icon: <FaRobot />, category: "Automatización" },
  { id: 2, name: "Sistema de Llamadas", description: "Recordatorios y confirmaciones", price: "$250.000", icon: <FaPhoneAlt />, category: "Automatización" },
  { id: 3, name: "Email Marketing", description: "Campañas automáticas", price: "$150.000", icon: <FaEnvelopeOpenText />, category: "Automatización" },
  { id: 4, name: "Integración Sistemas", description: "Conecta todas tus herramientas", price: "$300.000", icon: <FaSyncAlt />, category: "Automatización" },
  { id: 5, name: "Panel Administrador", description: "Gestiona tu contenido fácil", price: "$200.000", icon: <FaCogs />, category: "Desarrollo" },
  { id: 6, name: "SEO Avanzado", description: "Posiciónate en Google", price: "$150.000", icon: <FaSearch />, category: "Marketing" },
  { id: 7, name: "Diseño de Logo", description: "Identidad visual profesional", price: "$80.000", icon: <FaPaintBrush />, category: "Diseño" },
  { id: 8, name: "Mantenimiento Web", description: "Actualizaciones y seguridad", price: "$40.000/mes", icon: <FaServer />, category: "Soporte" },
];

const faqs = [
  { q: "¿Cuánto tiempo toma el desarrollo?", a: "Depende del plan. Landing pages toman 3-5 días, sitios corporativos 2-3 semanas." },
  { q: "¿Incluye dominio y hosting?", a: "Asesoramos en la compra, pero suelen ser costos directos del cliente para que tengan la propiedad total." },
  { q: "¿Es autoadministrable?", a: "Los planes con Panel Administrador sí. Las webs estáticas requieren intervención técnica." },
  { q: "¿Tienen garantía?", a: "Sí, ofrecemos 3 meses de garantía sobre fallos técnicos." }
];

const calculatorOptions = {
  type: [
    { id: 'landing', name: 'Landing Page', price: 150000, desc: 'Una sola página optimizada' },
    { id: 'corporativo', name: 'Sitio Corporativo', price: 350000, desc: 'Multipágina profesional' },
    { id: 'ecommerce', name: 'E-Commerce', price: 600000, desc: 'Tienda en línea' }
  ],
  features: [
    { id: 'admin', name: 'Panel Administrable', price: 100000 },
    { id: 'seo', name: 'SEO Avanzado', price: 150000 },
    { id: 'chat', name: 'Chatbot WhatsApp', price: 180000 },
    { id: 'payment', name: 'Pasarela de Pagos', price: 120000 }
  ]
};

const stats = [
  { icon: <FaRocket />, number: "150+", label: "Proyectos Lanzados" },
  { icon: <FaChartLine />, number: "300%", label: "Aumento Promedio de Ventas" },
  { icon: <FaUsers />, number: "98%", label: "Clientes Satisfechos" },
  { icon: <FaClock />, number: "7-15", label: "Días Promedio de Entrega" }
];

const reasons = [
  { icon: <FaCode />, title: "Código Limpio", description: "Desarrollamos con las mejores prácticas para asegurar velocidad y escalabilidad." },
  { icon: <FaMobileAlt />, title: "100% Responsive", description: "Tu sitio se verá perfecto en celulares, tablets y computadoras." },
  { icon: <FaSearch />, title: "SEO Friendly", description: "Estructura optimizada para que Google ame tu sitio web." },
  { icon: <FaHandshake />, title: "Soporte Real", description: "No te dejamos solo. Te acompañamos después del lanzamiento." }
];

const team = [
  { name: "Favio", role: "Full Stack Developer", image: "", bio: "Experto en React y Node.js con pasión por el código limpio.", skills: ["React", "Node", "AWS"] },
  { name: "Richar", role: "UI/UX Designer", image: "", bio: "Creativo obsesionado con la experiencia de usuario y el diseño moderno.", skills: ["Figma", "Adobe", "CSS"] },
  { name: "Equipo", role: "Marketing Digital", image: "", bio: "Especialistas en hacer crecer tu negocio online.", skills: ["SEO", "SEM", "Social"] }
];

export default function ServicesPage() {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Calculator State
  const [selectedType, setSelectedType] = useState('landing');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // Carousel State
  const carouselRef = useRef<HTMLDivElement>(null);

  // Comparison Slider State
  const [comparisonState, setComparisonState] = useState(50); // 0 to 100

  useEffect(() => {
    const typePrice = calculatorOptions.type.find(t => t.id === selectedType)?.price || 0;
    const featuresPrice = selectedFeatures.reduce((acc, featId) => {
      const feat = calculatorOptions.features.find(f => f.id === featId);
      return acc + (feat?.price || 0);
    }, 0);
    setTotalPrice(typePrice + featuresPrice);
  }, [selectedType, selectedFeatures]);

  const toggleFeature = (id: string) => {
    setSelectedFeatures(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { current } = carouselRef;
      const scrollAmount = 320; // Aproxima el ancho de tarjeta + gap
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="bg-slate-950 text-slate-50 font-sans w-full overflow-x-hidden min-h-screen">

      {/* 1. HERO SECTION */}
      <section className="relative w-full py-24 px-4 overflow-hidden border-b border-slate-800/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950 -z-10" />

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold text-sm mb-8 backdrop-blur-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </span>
            🚀 Transformamos Ideas en Realidad Digital
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-500 drop-shadow-sm">
            PLANES WEB PRO
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mb-10 leading-relaxed">
            Diseños modernos, estrategias de conversión y tecnología de punta para elevar tu negocio al siguiente nivel. Experiencia digital premium garantizada.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-16">
            <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 flex items-center gap-2">
              📅 Agendar Reunión Gratis
            </button>
            <button
              onClick={() => setVideoModalOpen(true)}
              className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-white border border-slate-700 rounded-full font-bold backdrop-blur-md transition-all hover:scale-105 flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                <FaPlay className="text-xs ml-0.5" />
              </div>
              Ver Video Presentación
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl opacity-90">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-4 hover:bg-white/10 transition-colors">
              <div className="p-3 rounded-lg bg-indigo-500/20 text-indigo-400">
                <FaStar className="text-xl" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white text-lg">150+</div>
                <div className="text-sm text-slate-400">Proyectos Exitosos</div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-4 hover:bg-white/10 transition-colors">
              <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-400">
                <FaTrophy className="text-xl" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white text-lg">98%</div>
                <div className="text-sm text-slate-400">Clientes Satisfechos</div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-4 hover:bg-white/10 transition-colors">
              <div className="p-3 rounded-lg bg-amber-500/20 text-amber-400">
                <FaBolt className="text-xl" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white text-lg">7-15 Días</div>
                <div className="text-sm text-slate-400">Entrega Rápida</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO MODAL */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setVideoModalOpen(false)} />
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            <button
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-red-500/80 rounded-full text-white transition-colors"
              onClick={() => setVideoModalOpen(false)}
            >
              <FaTimes />
            </button>
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="Video Presentación"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      )}

      {/* 2. CTA BANNER */}
      <section className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
        <div className="max-w-7xl mx-auto text-center relative z-10 flex items-center justify-center gap-3">
          <span className="font-bold text-white tracking-wide text-sm md:text-base">¡OFERTAS DE LANZAMIENTO DISPONIBLES!</span>
          <span className="bg-white text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">NUEVO</span>
        </div>
      </section>

      {/* 3. PLANS GRID */}
      <section className="w-full py-24 px-4 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Elige tu Plan Ideal</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Soluciones web escalables y profesionales diseñadas para cada etapa de tu negocio.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map(plan => (
              <article key={plan.id} className="relative group bg-slate-900/40 border border-slate-800 hover:border-indigo-500/50 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 flex flex-col">
                <div className="p-8 pb-4 border-b border-slate-800">
                  <span className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded-full mb-4 border border-indigo-500/20">
                    {plan.modules}
                  </span>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed h-10">{plan.description}</p>
                </div>

                <div className="p-8 pt-6 flex-1 flex flex-col">
                  <div className="mb-6">
                    <div className="text-sm text-slate-500 mb-1 font-semibold">Inversión</div>
                    <div className="text-3xl font-extrabold text-white tracking-tight">{plan.price}</div>
                  </div>

                  <div className="space-y-6 mb-8 flex-1">
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Incluye</h4>
                      <ul className="space-y-2">
                        {plan.includes.slice(0, 4).map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                            <FaCheckCircle className="text-indigo-500 mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Entrega</h4>
                      <ul className="space-y-2">
                        {plan.delivery.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                            <FaCheckCircle className="text-emerald-500 mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-800">
                    {plan.idealFor.map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PROMO SECTION */}
      <section className="w-full py-24 bg-gradient-to-r from-indigo-900 to-slate-900 relative overflow-hidden border-y border-slate-700">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/20 text-orange-400 font-bold text-sm mb-6 border border-orange-500/30">
            🔥 OFERTA POR TIEMPO LIMITADO
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">¡Lleva tu negocio al siguiente nivel hoy!</h2>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
            Contrata cualquier plan Web Pro y recibe un mes de soporte premium totalmente GRATIS.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-500/40">
                <FaBolt className="text-xl" />
              </div>
              <strong className="text-white text-lg block mb-1">Hosting Veloz</strong>
              <span className="text-indigo-200 text-sm">Carga en milisegundos</span>
            </div>
            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-500/40">
                <FaCheckCircle className="text-xl" />
              </div>
              <strong className="text-white text-lg block mb-1">Seguridad SSL</strong>
              <span className="text-emerald-200 text-sm">Certificado incluido</span>
            </div>
            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-pink-500/40">
                <FaMobileAlt className="text-xl" />
              </div>
              <strong className="text-white text-lg block mb-1">Mobile First</strong>
              <span className="text-pink-200 text-sm">Diseño adaptable</span>
            </div>
          </div>

          <button className="px-10 py-4 bg-white text-indigo-900 font-bold rounded-full shadow-xl hover:scale-105 transition-transform">
            Quiero Aprovechar la Oferta ➔
          </button>
        </div>
      </section>

      {/* 5. STATS SECTION */}
      <section className="w-full py-20 bg-slate-950 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Resultados que Hablan</h2>
            <p className="text-slate-400">Nuestros números demuestran nuestro compromiso con la excelencia</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="p-8 bg-slate-900 rounded-3xl border border-slate-800 text-center hover:border-indigo-500/30 transition-colors group">
                <div className="text-4xl md:text-5xl text-indigo-500 mb-4 transform group-hover:scale-110 transition-transform duration-300 inline-block">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
                  {stat.number}
                </div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
