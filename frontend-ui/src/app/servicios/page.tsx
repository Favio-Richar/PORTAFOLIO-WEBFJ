"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaLaptopCode, FaMobileAlt, FaServer, FaDatabase, FaCloud, FaCogs,
  FaCheckCircle, FaArrowRight, FaWhatsapp, FaStar, FaBolt, FaTrophy, FaClock,
  FaRobot, FaPhoneAlt, FaEnvelopeOpenText, FaSyncAlt, FaPlay, FaTimes, FaChevronDown, FaChevronUp,
  FaRocket, FaChartLine, FaUsers, FaHandshake, FaBullhorn, FaGift, FaCode, FaPaintBrush, FaSearch,
  FaTools, FaMicrochip, FaShieldAlt
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import "@/styles/services-elite.scss";
import PageReviewsWall from "@/components/reviews/PageReviewsWall";

// --- TYPES ---

interface Plan {
  id: number;
  name: string;
  description: string;
  modules: string;
  price: string;
  includes: string[];
  delivery: string[];
  idealFor: string[];
}

interface AdditionalService {
  id: number;
  name: string;
  description: string;
  price: string;
  icon: React.ReactNode;
  category: string;
  includes?: string[];
  paymentType?: string;
}

interface FAQ {
  q: string;
  a: string;
}

interface Stat {
  icon: React.ReactNode;
  number: string;
  label: string;
}

interface Reason {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
  skills: string[];
}

interface ProcessStep {
  id: number;
  title: string;
  description: string;
  duration: string;
  icon: React.ReactNode;
}

// --- DATA DEFINITIONS ---

const defaultConfig = {
  main_title: "Planes Profesionales de Páginas Web",
  subtitle: "Llevamos tu negocio al siguiente nivel con interfaces de alto impacto y estrategias de conversión probadas.",
  whatsapp_number: "56952402170"
};

const plans: Plan[] = [
  {
    id: 1,
    name: 'Landing Page Profesional',
    description: 'Enfocada en un solo objetivo: VENDER.',
    modules: '4–6 módulos',
    price: '$120.000 – $200.000',
    includes: [
      'Hero con imagen o video',
      'Título + propuesta de valor clara',
      'Beneficios destacados',
      'Llamado a la acción (WhatsApp)',
      'Ubicación / Horarios',
      'Botón WhatsApp flotante',
      'Diseño responsive adaptativo',
      'Carga ultra-rápida (Core Web Vitals)'
    ],
    delivery: [
      'Landing lista para convertir',
      'Enlace directo a chat comercial',
      'Diseño alineado a tu marca',
      'Certificado de seguridad SSL'
    ],
    idealFor: ['Emprendedores', 'Servicios locales', 'Ventas rápidas', 'Lanzamientos']
  },
  {
    id: 2,
    name: 'One-Page Website',
    description: 'Todo tu negocio en un desplazamiento infinito.',
    modules: '6–8 módulos',
    price: '$180.000 – $300.000',
    includes: [
      'Inicio / Hero Dinámico',
      'Módulo "Quiénes Somos"',
      'Módulo de Servicios Detallado',
      'Galería de Proyectos / Fotos',
      'Sección de Testimonios',
      'Mapa de Google Interactivo',
      'Formulario de Contacto',
      'Botón WhatsApp fijo',
      'Navegación inteligente con scroll'
    ],
    delivery: [
      'Sitio completo en una sola URL',
      'Flujo de navegación intuitivo',
      'Presencia digital robusta',
      'Optimizada para SEO local'
    ],
    idealFor: ['PYMEs', 'Empresas de servicios', 'Restaurantes', 'Consultoras']
  },
  {
    id: 3,
    name: 'Web Informativa',
    description: 'Tu carta de presentación oficial al mundo.',
    modules: '3–5 secciones',
    price: '$150.000 – $250.000',
    includes: [
      'Resumen Institucional',
      'Propuesta de valor del negocio',
      'Detalle de contacto oficial',
      'Horarios y atención',
      'Enlace a Redes Sociales',
      'Diseño formal y confiable',
      'Sección de preguntas frecuentes'
    ],
    delivery: [
      'Tarjeta de presentación online',
      'Información corporativa clara',
      'Imagen profesional estable',
      'Mínimo mantenimiento'
    ],
    idealFor: ['Estudios jurídicos', 'Oficinas', 'Talleres', 'Negocios tradicionales']
  },
  {
    id: 4,
    name: 'Sitio Web Corporativo Básico',
    description: 'Estructura sólida para empresas en crecimiento.',
    modules: '5–8 secciones',
    price: '$250.000 – $450.000',
    includes: [
      'Página de Inicio Estratégica',
      'Sección Detallada de Nosotros',
      'Portafolio / Servicios segregados',
      'Página de Contacto dedicada',
      'Integración básica con Google Analytics',
      'Diseño corporativo coherente',
      'Multi-página básica (Internas)'
    ],
    delivery: [
      'Sitio web de nivel empresarial',
      'Organización lógica de contenidos',
      'Imagen de marca consolidada',
      'Escalabilidad futura garantizada'
    ],
    idealFor: ['Constructoras', 'Agencias', 'Empresas locales', 'Proveedores B2B']
  },
  {
    id: 5,
    name: 'Sitio Web Corporativo Avanzado',
    description: 'El máximo estándar de desempeño digital.',
    modules: '8–12 secciones',
    price: '$450.000 – $750.000',
    includes: [
      'Arquitectura de información compleja',
      'Blog / Sección de noticias auto-gestionable',
      'Formularios dinámicos avanzados',
      'Estrategia SEO Full On-Page',
      'Animaciones interactivas premium',
      'Velocidad de carga optimizada al máximo',
      'Panel de administrador personalizado',
      'Integración con CRM / Newsletter'
    ],
    delivery: [
      'Herramienta de ventas automatizada',
      'Posicionamiento orgánico premium',
      'Máxima credibilidad en el mercado',
      'Soporte prioritario post-lanzamiento'
    ],
    idealFor: ['Grandes empresas', 'Consorcios', 'Empresas de tecnología', 'Marcas premium']
  },
  {
    id: 6,
    name: 'Página Web Estática',
    description: 'Máxima velocidad, mínimo mantenimiento.',
    modules: 'Variable',
    price: 'Personalizado',
    includes: [
      'Código puro (HTML5/CSS3/JS)',
      'Seguridad invulnerable',
      'Hosting ultra-económico',
      'Sin bases de datos lentas',
      'Desempeño 100/100 en Google'
    ],
    delivery: [
      'Entrega de archivos fuente',
      'Carga instantánea asegurada',
      'Cero costos de mantenimiento técnico',
      'Estabilidad absoluta'
    ],
    idealFor: ['Landing pages de alta concurrencia', 'Sitios gubernamentales', 'Eventos masivos']
  }
];

const additionalServices: AdditionalService[] = [
  // AUTOMATIZACIÓN
  {
    id: 1,
    name: "Bot WhatsApp Automático",
    description: "Responde automáticamente 24/7 a tus clientes",
    price: "$180.000",
    icon: <FaRobot />,
    category: "Automatización",
    paymentType: "Desde",
    includes: ["Respuestas automáticas", "Menú de opciones", "Horarios y ubicación", "Integración con tu web"]
  },
  {
    id: 2,
    name: "Llamadas Automáticas",
    description: "Recordatorios y confirmaciones por voz",
    price: "$250.000",
    icon: <FaPhoneAlt />,
    category: "Automatización",
    paymentType: "Desde",
    includes: ["Recordatorios automáticos", "Confirmación de citas", "Mensajes personalizados", "Panel de gestión"]
  },
  {
    id: 3,
    name: "Email Marketing",
    description: "Campañas automáticas de correo",
    price: "$150.000",
    icon: <FaEnvelopeOpenText />,
    category: "Automatización",
    paymentType: "Desde",
    includes: ["Envíos automáticos", "Segmentación de clientes", "Plantillas personalizadas", "Reportes de apertura"]
  },
  {
    id: 4,
    name: "Integración de Sistemas",
    description: "Conecta todas tus herramientas",
    price: "$300.000",
    icon: <FaSyncAlt />,
    category: "Automatización",
    paymentType: "Desde",
    includes: ["Sincronización de datos", "APIs personalizadas", "Automatización de tareas", "Workflows inteligentes"]
  },
  // DESARROLLO
  {
    id: 5,
    name: "Panel Administrador",
    description: "Edita tu sitio sin programar",
    price: "$200.000",
    icon: <FaCogs />,
    category: "Desarrollo",
    paymentType: "Pago único",
    includes: ["Acceso privado seguro", "Editor de contenido", "Gestión de imágenes", "Base de datos"]
  },
  {
    id: 6,
    name: "Pasarela de Pagos",
    description: "Vende productos y recibe pagos",
    price: "$120.000",
    icon: <FaDatabase />,
    category: "Desarrollo",
    paymentType: "Instalación",
    includes: ["Webpay / Flow / PayPal", "Cuentas de usuario", "Carrito de compras", "Panel de pedidos"]
  },
  // MARKETING & DISEÑO
  {
    id: 7,
    name: "SEO Avanzado",
    description: "Posiciónate en Google",
    price: "$150.000",
    icon: <FaSearch />,
    category: "Marketing",
    paymentType: "Proyecto",
    includes: ["Estudio de palabras clave", "Optimización On-Page", "Google Search Console", "Informes mensuales"]
  },
  {
    id: 8,
    name: "Diseño de Logo & Branding",
    description: "Identidad visual profesional",
    price: "$80.000",
    icon: <FaPaintBrush />,
    category: "Diseño",
    paymentType: "Proyecto",
    includes: ["3 propuestas iniciales", "Paleta de colores", "Manual de marca básico"]
  },
  {
    id: 9,
    name: "Mantenimiento Web",
    description: "Seguridad y velocidad perpetua",
    price: "$40.000",
    icon: <FaTools />,
    category: "Soporte",
    paymentType: "Mensual",
    includes: ["Actualizaciones de seguridad", "Backups semanales", "Soporte técnico", "Optimización continua"]
  },
];

const faqs: FAQ[] = [
  { q: "¿Cuánto tiempo toma tener mi página?", a: "Depende del plan: Landing Pages (3-7 días), Web Corporativa (7-15 días), E-commerce (15-30 días)." },
  { q: "¿Tengo que pagar mensualmente?", a: "No cobramos mensualidades por el diseño. Solo debes considerar tu Hosting y Dominio (aprox $40.000 al año)." },
  { q: "¿Mi página funcionará en celulares?", a: "Sí, todos nuestros diseños son 100% responsive, adaptándose a celulares, tablets y computadoras." },
  { q: "¿Qué pasa si necesito hacer cambios después?", a: "Ofrecemos soporte post-entrega y planes de mantenimiento. Si tu plan tiene Panel Admin, puedes editarlos tú mismo." }
];

const stats: Stat[] = [
  { icon: <FaRocket />, number: "150+", label: "Proyectos" },
  { icon: <FaChartLine />, number: "98%", label: "Satisfacción" },
  { icon: <FaUsers />, number: "7-15", label: "Días Entrega" },
  { icon: <FaClock />, number: "24/7", label: "Soporte" }
];

const reasons: Reason[] = [
  { icon: <FaBolt />, title: "Velocidad Extrema", description: "Sitios optimizados para cargar en milisegundos." },
  { icon: <FaTrophy />, title: "Diseño Premium", description: "Estética de vanguardia que eleva el valor de tu marca." },
  { icon: <FaShieldAlt />, title: "Seguridad Total", description: "Protegemos tus datos y los de tus clientes con certificados SSL." },
  { icon: <FaMobileAlt />, title: "Multi-dispositivo", description: "Experiencia fluida en cualquier pantalla." }
];

const team: TeamMember[] = [
  { name: "Favio", role: "Full Stack Developer", image: "", bio: "Arquitecto de soluciones digitales y experto en experiencia de usuario.", skills: ["React", "TypeScript", "Node.js"] },
  { name: "Richar", role: "UI/UX Designer", image: "", bio: "Especialista en interfaces de alto impacto y estética visual.", skills: ["Figma", "Branding", "CSS"] }
];

const processSteps: ProcessStep[] = [
  { id: 1, title: "Briefing", description: "Reunión para entender tus objetivos y definir la estrategia.", duration: "Día 1", icon: <FaHandshake /> },
  { id: 2, title: "Diseño", description: "Creación del prototipo visual y la estructura de navegación.", duration: "Día 2-4", icon: <FaPaintBrush /> },
  { id: 3, title: "Desarrollo", description: "Programación de las funcionalidades y carga de contenidos.", duration: "Día 5-10", icon: <FaCode /> },
  { id: 4, title: "Lanzamiento", description: "Configuración de hosting, dominio y puesta en marcha.", duration: "Final", icon: <FaRocket /> }
];

const calculatorOptions = {
  type: [
    { id: 'landing', name: 'Landing Page', price: 120000, desc: 'Página única de conversión' },
    { id: 'onepage', name: 'One-Page', price: 180000, desc: 'Sitio completo en una sola página' },
    { id: 'informativa', name: 'Web Informativa', price: 150000, desc: 'Presencia institucional' },
    { id: 'corporativo', name: 'Corporativo', price: 250000, desc: 'Sitio profesional avanzado' }
  ],
  features: [
    { id: 'admin', name: 'Panel Administrador', price: 100000 },
    { id: 'seo', name: 'SEO Avanzado', price: 150000 },
    { id: 'whatsapp', name: 'Bot WhatsApp', price: 180000 },
    { id: 'pagos', name: 'Pasarela de Pagos', price: 120000 },
    { id: 'llamadas', name: 'Sistema de Llamadas', price: 250000 },
    { id: 'mantenimiento', name: 'Mantenimiento (Mes)', price: 40000 }
  ]
};

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
    const typePrice = calculatorOptions.type.find((t: any) => t.id === selectedType)?.price || 0;
    const featuresPrice = selectedFeatures.reduce((acc: number, featId: string) => {
      const feat = calculatorOptions.features.find((f: any) => f.id === featId);
      return acc + (feat?.price || 0);
    }, 0);
    setTotalPrice(typePrice + featuresPrice);
  }, [selectedType, selectedFeatures]);

  const toggleFeature = (id: string) => {
    setSelectedFeatures(prev =>
      prev.includes(id) ? prev.filter((f: string) => f !== id) : [...prev, id]
    );
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { current } = carouselRef;
      const scrollAmount = 320;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="services-page-wrapper">
      {/* 1. BLOCK: HERO */}
      <section className="hero-block">
        <div className="container-elite hero-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hero-badge"
          >
            ⭐⭐⭐⭐⭐ PROYECTOS ELITE
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="hero-title"
          >
            {defaultConfig.main_title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="hero-subtitle"
          >
            {defaultConfig.subtitle}
          </motion.p>
          <div className="hero-btns">
            <button
              className="btn-primary"
              onClick={() => {
                const el = document.getElementById('planes');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Ver Planes de Diseño
            </button>
            <button
              className="btn-secondary"
              onClick={() => window.open(`https://wa.me/${defaultConfig.whatsapp_number}`, '_blank')}
            >
              Consultoría Gratuita
            </button>
          </div>
        </div>
      </section>

      {/* 2. CTA BANNER SPARKLES */}
      <div className="cta-banner bg-slate-900/80 border-y border-white/5 py-8 backdrop-blur-md">
        <div className="cta-container flex items-center justify-center gap-8 overflow-hidden whitespace-nowrap">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 text-indigo-400 font-black text-xl tracking-[0.3em] opacity-40 uppercase">
              DE LA IDEA AL ÉXITO <span className="text-white">🚀</span> DISEÑO WEB ELITE <span className="text-white">✨</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. BLOCK: PLANS */}
      <section id="planes" className="plans-block section-block">
        <div className="container-elite">
          <h2 className="section-title">Planes Estratégicos</h2>
          <p className="section-subtitle">Estructuras de alto desempeño diseñadas para convertir visitantes en clientes fieles.</p>

          <div className="plans-grid">
            {plans.map((plan: Plan) => (
              <article key={plan.id} className="plan-card">
                <div className="plan-header">
                  <div className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">{plan.modules}</div>
                  <h3 className="text-3xl font-black text-white mb-2 leading-tight">{plan.name}</h3>
                  <div className="plan-price">{plan.price}</div>
                  <p className="text-slate-400 text-sm leading-relaxed">{plan.description}</p>
                </div>

                <div className="plan-features">
                  {plan.includes.map((inc, i) => (
                    <div key={i} className="flex items-start gap-3 mb-4 text-[13px] text-slate-300 font-medium">
                      <FaCheckCircle className="text-indigo-500 mt-1 flex-shrink-0" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/5">
                  <div className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-3 opacity-70">Ideal para:</div>
                  <div className="flex flex-wrap gap-2">
                    {plan.idealFor.map((item, i) => (
                      <span key={i} className="text-[10px] bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 text-indigo-300 font-bold">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-8 border-t border-white/5">
                  <button
                    className="plan-btn mb-6"
                    onClick={() => window.open(`https://wa.me/${defaultConfig.whatsapp_number}?text=Hola, me interesa el plan ${plan.name}`, '_blank')}
                  >
                    Seleccionar Plan
                  </button>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-4">Garantía de Entrega</div>
                  <div className="space-y-2">
                    {plan.delivery.map((del, i) => (
                      <div key={i} className="text-slate-400 text-[11px] flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40" />
                        {del}
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ADDITIONAL SERVICES */}
      <section className="section-block bg-slate-950/50">
        <div className="container-elite">
          <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="section-title !text-left !m-0">Potencia tu Alcance</h2>
              <p className="text-slate-400 mt-4 text-lg">Módulos avanzados de automatización y marketing para una ventaja competitiva real.</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => scrollCarousel('left')}
                className="w-14 h-14 rounded-2xl border border-white/10 hover:bg-white/5 flex items-center justify-center text-white transition-all hover:border-indigo-500 group"
              >
                <FaArrowRight className="rotate-180 group-hover:-translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollCarousel('right')}
                className="w-14 h-14 rounded-2xl border border-white/10 hover:bg-white/5 flex items-center justify-center text-white transition-all hover:border-indigo-500 group"
              >
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-12"
          >
            {additionalServices.map((service: AdditionalService) => (
              <div key={service.id} className="min-w-[340px] bg-white/5 border border-white/10 rounded-[2.5rem] p-10 hover:border-indigo-500/50 transition-all group flex flex-col h-full backdrop-blur-sm">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-3xl text-indigo-400 mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-glow">
                  {service.icon}
                </div>
                <div className="text-[10px] font-black text-indigo-400 mb-2 uppercase tracking-[0.2em]">{service.category}</div>
                <h3 className="text-2xl font-black mb-4 text-white">{service.name}</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed flex-grow">{service.description}</p>
                <div className="space-y-3 mb-10">
                  {service.includes?.map((inc, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                      <FaCheckCircle className="text-indigo-500/60 flex-shrink-0" /> {inc}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-8 border-t border-white/5">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{service.paymentType}</div>
                    <div className="text-2xl font-black text-white">{service.price}</div>
                  </div>
                  <button
                    onClick={() => window.open(`https://wa.me/${defaultConfig.whatsapp_number}?text=Me interesa ${service.name}`, '_blank')}
                    className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all text-2xl shadow-lg border border-emerald-500/20"
                  >
                    <FaWhatsapp />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PROMO SECTION */}
      <section className="section-block relative overflow-hidden bg-slate-950">
        <div className="container-elite">
          <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-[3.5rem] p-12 md:p-24 relative overflow-hidden border border-white/10 backdrop-blur-xl group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] group-hover:bg-indigo-500/20 transition-all duration-700" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-3 bg-indigo-500/20 px-6 py-2.5 rounded-full text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-8 border border-indigo-500/30"
                >
                  <FaBolt className="text-yellow-400 animate-pulse" /> Oferta de Lanzamiento
                </motion.div>
                <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tighter">
                  Obtén un <span className="text-indigo-400">30% OFF</span> <br /> en tu inicio
                </h2>
                <p className="text-slate-400 text-xl mb-12 max-w-lg leading-relaxed">
                  Solo para los primeros 10 clientes del mes. No dejes pasar la oportunidad de digitalizar tu visión al mejor precio.
                </p>
                <div className="flex flex-wrap gap-6">
                  {["Dominio Gratis", "SSL Certificado", "Google Index"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-white/70 text-sm font-bold">
                      <FaCheckCircle className="text-emerald-400" /> {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="bg-black/40 backdrop-blur-2xl p-12 rounded-[2.5rem] border border-white/10 text-center w-full max-w-md shadow-2xl">
                  <div className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.3em] mb-6 opacity-70">La oferta expira en:</div>
                  <div className="flex justify-center gap-6 text-white mb-10">
                    {[{ v: '02', l: 'Días' }, { v: '14', l: 'Hrs' }, { v: '55', l: 'Min' }].map((t, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className="text-5xl font-black mb-1">{t.v}</div>
                        <div className="text-[10px] uppercase font-black text-slate-500 tracking-widest">{t.l}</div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => window.open(`https://wa.me/${defaultConfig.whatsapp_number}?text=Hola, quiero la oferta del 30% de descuento`, '_blank')}
                    className="w-full btn-primary !py-6"
                  >
                    RECLAMAR CUPÓN
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. STATS BLOCK */}
      <section className="section-block bg-slate-950">
        <div className="container-elite">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center p-12 bg-white/5 rounded-[2.5rem] border border-white/10 hover:border-indigo-500/50 transition-all group backdrop-blur-sm">
                <div className="text-5xl text-indigo-500 mb-6 flex justify-center group-hover:scale-110 transition-transform duration-500">{stat.icon}</div>
                <div className="text-5xl font-black text-white mb-2">{stat.number}</div>
                <div className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. WHY CHOOSE US */}
      <section className="section-block bg-slate-900/30 border-y border-white/5">
        <div className="container-elite text-center">
          <h2 className="section-title">El Estándar de Excelencia</h2>
          <p className="section-subtitle">Nuestra obsesión por el detalle es lo que nos separa de la competencia.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reasons.map((reason, i) => (
              <div key={i} className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 text-left hover:bg-white/[0.08] transition-all group">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-2xl text-indigo-400 mb-8 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  {reason.icon}
                </div>
                <h3 className="text-xl font-black mb-4 text-white">{reason.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. PROCESS BLOCK */}
      <section className="section-block bg-slate-950">
        <div className="container-elite">
          <h2 className="section-title">Ingeniería Web Paso a Paso</h2>
          <p className="section-subtitle">Flujo de trabajo optimizado para garantizar calidad y puntualidad extrema.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative mt-20">
            <div className="hidden lg:block absolute top-12 left-24 right-24 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
            {processSteps.map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left group">
                <div className="w-20 h-20 rounded-[1.5rem] bg-slate-950 border-2 border-indigo-500/30 flex items-center justify-center text-2xl font-black mb-8 text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.1)] group-hover:border-indigo-500 group-hover:shadow-[0_0_40px_rgba(99,102,241,0.2)] transition-all">
                  {step.id}
                </div>
                <div className="text-indigo-400 text-[10px] font-black mb-3 uppercase tracking-[0.2em]">{step.duration}</div>
                <h3 className="text-2xl font-black mb-4 text-white">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. COMPARISON BLOCK */}
      <section className="section-block bg-slate-900/10 border-y border-white/5">
        <div className="container-elite">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="section-title !text-left">La Diferencia es Elite</h2>
              <p className="text-slate-400 mb-12 text-xl leading-relaxed">
                Compara un diseño convencional vs. nuestra arquitectura premium. Resultados que impactan en cada píxel.
              </p>

              <div className="space-y-6">
                {[
                  { label: "Estética Visual", val: "100%", color: "bg-indigo-500" },
                  { label: "Experiencia de Usuario", val: "95%", color: "bg-purple-500" },
                  { label: "Estrategia de Venta", val: "98%", color: "bg-pink-500" }
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 p-8 rounded-[2rem] border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-black text-white uppercase tracking-widest text-[10px] opacity-70">{item.label}</span>
                      <span className="text-indigo-400 font-black">{item.val}</span>
                    </div>
                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: item.val }}
                        transition={{ duration: 1.5, delay: i * 0.2 }}
                        className={`h-full ${item.color} shadow-[0_0_20px_rgba(99,102,241,0.3)]`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-white/10 group bg-slate-800">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426')] bg-cover bg-center grayscale opacity-50" />
              <motion.div
                className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=2426')] bg-cover bg-center border-r-[8px] border-indigo-500 shadow-[20px_0_50px_rgba(99,102,241,0.4)]"
                style={{ width: `${comparisonState}%` }}
              />
              <input
                type="range" min="0" max="100" value={comparisonState}
                onChange={(e) => setComparisonState(parseInt(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-ew-resize z-10"
              />
              <div className="absolute top-1/2 -translate-y-1/2 w-14 h-14 bg-indigo-500 rounded-2xl z-20 flex items-center justify-center text-white pointer-events-none shadow-2xl border-4 border-slate-950 transition-transform active:scale-90"
                style={{ left: `calc(${comparisonState}% - 28px)` }}>
                <div className="flex gap-1 items-center">
                  <FaChevronDown className="rotate-90 text-[10px]" />
                  <FaChevronDown className="-rotate-90 text-[10px]" />
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-8 px-8 pointer-events-none flex justify-between">
                <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-xl text-[10px] font-black text-white border border-white/10 uppercase tracking-widest">Web Común</div>
                <div className="bg-indigo-600 px-6 py-3 rounded-xl text-[10px] font-black text-white border border-white/20 shadow-2xl uppercase tracking-widest">Diseño Elite</div>
              </div>
            </div>
          </div>
        </div>
      </section>

            {/* 10. REVIEWS WALL (MISMO BLOQUE QUE CLIENTES) */}
      <section className="section-block bg-slate-950">
        <div className="container-elite">
          <PageReviewsWall pageContext="servicios" title="What our customers say" />
        </div>
      </section>

      {/* 11. TEAM */}
      <section className="section-block bg-slate-950 pt-0">
        <div className="container-elite">
          <h2 className="text-4xl font-black mb-16 text-white flex items-center gap-6">
            <span className="w-16 h-1.5 bg-indigo-500 rounded-full" /> Expertos a Cargo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {team.map((member, i) => (
              <div key={i} className="bg-white/5 p-12 rounded-[3.5rem] border border-white/10 flex flex-col items-center md:items-start group hover:bg-white/[0.08] transition-all backdrop-blur-md">
                <div className="w-36 h-36 rounded-3xl bg-indigo-600/10 flex-shrink-0 flex items-center justify-center text-6xl font-black text-indigo-400 border border-indigo-500/20 shadow-inner group-hover:scale-105 transition-all duration-500 mb-8">
                  {member.name.charAt(0)}
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-3xl font-black text-white mb-2 leading-tight">{member.name}</h3>
                  <div className="text-indigo-400 font-bold mb-8 text-xs uppercase tracking-[0.2em]">{member.role}</div>
                  <p className="text-slate-400 text-lg mb-10 leading-relaxed font-medium">"{member.bio}"</p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    {member.skills.map((skill, si) => (
                      <span key={si} className="px-5 py-2.5 bg-indigo-500/10 rounded-xl text-[10px] font-black text-indigo-300 border border-indigo-500/20 uppercase tracking-[0.15em] group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 13. BLOCK: BUDGET CALCULATOR */}
      <section id="calculator" className="calculator-block section-block bg-slate-900/10">
        <div className="container-elite">
          <h2 className="section-title">Inversión a Medida</h2>
          <p className="section-subtitle">Simula el costo de tu plataforma digital con precisión algorítmica.</p>

          <div className="calculator-card shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
            <div className="space-y-16">
              <div>
                <h3 className="text-2xl font-black mb-10 flex items-center gap-4 text-white">
                  <span className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-sm shadow-glow text-white">1</span>
                  Tipo de Proyecto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {calculatorOptions.type.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`p-8 rounded-3xl border-2 transition-all text-left group ${selectedType === type.id
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-2xl scale-[1.02]'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                    >
                      <div className={`font-black mb-2 text-lg ${selectedType === type.id ? 'text-indigo-400' : 'text-white'}`}>{type.name}</div>
                      <div className="text-xs text-slate-400 leading-relaxed">{type.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black mb-10 flex items-center gap-4 text-white">
                  <span className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-sm shadow-glow text-white">2</span>
                  Funcionalidades Extra
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {calculatorOptions.features.map(feat => (
                    <button
                      key={feat.id}
                      onClick={() => toggleFeature(feat.id)}
                      className={`p-6 rounded-[1.5rem] border transition-all flex items-center justify-between group ${selectedFeatures.includes(feat.id)
                        ? 'border-indigo-500 bg-indigo-500/20 shadow-xl'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                    >
                      <span className={`text-sm font-bold ${selectedFeatures.includes(feat.id) ? 'text-white' : 'text-slate-400'}`}>{feat.name}</span>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${selectedFeatures.includes(feat.id) ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-600'}`}>
                        <FaCheckCircle className="text-sm" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col h-full bg-white/5 rounded-[3rem] p-12 border border-white/10 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-600/20 transition-all" />
              <div className="text-xs uppercase tracking-[0.3em] text-slate-500 font-black mb-6">Inversión Estimada</div>
              <div className="text-5xl md:text-6xl font-black text-indigo-400 mb-8 tracking-tighter">
                {totalPrice.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
              </div>
              <p className="text-slate-400 text-sm mb-12 leading-relaxed font-medium">
                *Valor aproximado para desarrollo arquitectónico ELITE. El presupuesto final se detalla tras una reunión técnica presencial o remota.
              </p>
              <button
                className="w-full btn-primary !py-8 !text-xl"
                onClick={() => window.open(`https://wa.me/${defaultConfig.whatsapp_number}?text=Hola, coticé un proyecto de ${totalPrice.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })} en la web.`, '_blank')}
              >
                SOLICITAR COTIZACIÓN 🚀
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 14. BOOKING SECTION */}
      <section className="section-block bg-slate-950">
        <div className="container-elite text-center">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[4rem] p-16 md:p-32 border border-white/20 shadow-glow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000" />
            <h2 className="text-5xl md:text-8xl font-black text-white mb-10 leading-[0.9] tracking-tighter">Agenda tu <br /> Consultoría</h2>
            <p className="text-indigo-100/80 text-xl mb-16 max-w-2xl mx-auto leading-relaxed font-medium">
              Analicemos tu proyecto en una videollamada de alta estrategia. Te daremos la ruta exacta para dominar tu mercado digital.
            </p>
            <div className="flex flex-col items-center gap-10">
              <button
                onClick={() => window.open(`https://wa.me/${defaultConfig.whatsapp_number}?text=Hola, quiero agendar una reunión técnica`, '_blank')}
                className="bg-white text-indigo-600 px-16 py-8 rounded-[2rem] font-black text-2xl hover:scale-105 transition-all shadow-[0_20px_60px_rgba(255,255,255,0.3)] hover:shadow-[0_30px_80px_rgba(255,255,255,0.4)]"
              >
                VER CALENDARIO ELITE
              </button>
              <div className="flex flex-wrap justify-center items-center gap-8 text-white/50 text-[10px] font-black tracking-[0.2em] uppercase">
                <span className="flex items-center gap-3"><FaCheckCircle className="text-emerald-400" /> Sin compromiso</span>
                <span className="flex items-center gap-3"><FaCheckCircle className="text-emerald-400" /> Zoom o Meet</span>
                <span className="flex items-center gap-3"><FaCheckCircle className="text-emerald-400" /> Diagnóstico SEO</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 15. BLOCK: FAQ */}
      <section className="section-block bg-slate-950" id="faq">
        <div className="container-elite">
          <h2 className="section-title">Claridad Absoluta</h2>
          <p className="section-subtitle">Resolvemos tus dudas con la transparencia que tu negocio merece.</p>
          <div className="max-w-4xl mx-auto space-y-4 mt-20">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-indigo-500/30 transition-all backdrop-blur-md">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full p-10 text-left flex items-center justify-between hover:bg-white/[0.02] transition-colors font-black text-xl text-white group"
                >
                  {faq.q}
                  <div className={`w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-sm transition-all duration-500 ${activeFaq === i ? 'rotate-180 bg-indigo-500 text-white' : 'text-slate-500'}`}>
                    <FaChevronDown />
                  </div>
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-10 pt-0 text-slate-400 border-t border-white/5 text-lg leading-relaxed font-medium">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 16. BLOCK: FINAL CTA */}
      <section className="section-block bg-indigo-600 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="hero-shape hero-shape-1" style={{ width: '600px', height: '600px', top: '-200px', left: '-200px' }}></div>
          <div className="hero-shape hero-shape-2" style={{ width: '600px', height: '600px', bottom: '-200px', right: '-200px' }}></div>
        </div>
        <div className="container-elite relative z-10 py-20">
          <h2 className="text-6xl md:text-9xl font-black mb-12 tracking-tighter leading-tight">¿Listo para ser <br /> el #1?</h2>
          <p className="text-2xl md:text-3xl text-indigo-100 mb-20 max-w-3xl mx-auto font-medium leading-relaxed">
            No pierdas más ventas con diseños obsoletos. Obtén una plataforma que proyecte el verdadero poder de tu marca.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <button
              className="bg-white text-indigo-600 px-16 py-8 rounded-[2rem] font-black text-2xl hover:scale-105 transition-all shadow-[0_30px_100px_rgba(255,255,255,0.2)] flex items-center justify-center gap-4"
              onClick={() => window.open(`https://wa.me/${defaultConfig.whatsapp_number}`, '_blank')}
            >
              INICIAR PROYECTO <FaArrowRight />
            </button>
            <button
              className="bg-transparent border-4 border-white/20 text-white px-16 py-8 rounded-[2rem] font-black text-2xl hover:bg-white/10 transition-colors"
              onClick={() => window.open(`https://wa.me/${defaultConfig.whatsapp_number}`, '_blank')}
            >
              Hablemos Ahora
            </button>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {videoModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setVideoModalOpen(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-6xl aspect-video bg-black rounded-[3rem] overflow-hidden z-10 border border-white/10 shadow-glow"
            >
              <button
                className="absolute top-8 right-8 text-white hover:text-indigo-400 z-20 text-4xl"
                onClick={() => setVideoModalOpen(false)}
              >
                <FaTimes />
              </button>
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div >
  );
}

