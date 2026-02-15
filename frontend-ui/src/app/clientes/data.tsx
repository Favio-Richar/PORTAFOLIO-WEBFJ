import {
  FaCheckCircle,
  FaStar,
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
  FaComments,
  FaSearch,
  FaPencilRuler,
  FaCogs,
} from "react-icons/fa";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineCommandLine,
  HiOutlineBeaker,
  HiOutlineRocketLaunch,
} from "react-icons/hi2";

export const GLOBAL_STATS = [
  { number: "200+", label: "Clientes Globales", icon: <FaGlobeAmericas className="text-cyan-300" /> },
  { number: "$2.5B+", label: "Revenue Generado", icon: <FaChartLine className="text-blue-300" /> },
  { number: "99.8%", label: "Tasa de Exito", icon: <FaShieldAlt className="text-emerald-300" /> },
  { number: "24/7", label: "Soporte Dedicado", icon: <FaHeadset className="text-sky-300" /> },
];

export const GLOBAL_RESULTS = [
  { number: "850+", label: "Proyectos Completados", icon: <FaCheckCircle className="text-emerald-400" />, description: "En 50+ paises", trend: "+127% YoY" },
  { number: "$4.8B", label: "Revenue Cliente Generado", icon: <FaChartLine className="text-blue-400" />, description: "Impacto economico total", trend: "+215% crecimiento" },
  { number: "98.9%", label: "Satisfaccion Cliente", icon: <FaStar className="text-yellow-400" />, description: "Promedio de calificacion", trend: "4.9/5.0 estrellas" },
  { number: "15", label: "Industrias Atendidas", icon: <FaBuilding className="text-sky-400" />, description: "Experiencia diversa", trend: "Tech, Finance, Health+" },
  { number: "2.3M", label: "Usuarios Finales", icon: <FaGlobeAmericas className="text-indigo-400" />, description: "Alcance global", trend: "+340% engagement" },
  { number: "92%", label: "Retencion Clientes", icon: <FaShieldAlt className="text-emerald-400" />, description: "Relaciones a largo plazo", trend: "Promedio 4.2 anos" },
];

export const IMPACT_CARD_THEMES = [
  { border: "border-emerald-300/30", glow: "shadow-[0_0_36px_rgba(16,185,129,0.22)]", value: "from-emerald-200 to-cyan-300" },
  { border: "border-sky-300/30", glow: "shadow-[0_0_36px_rgba(56,189,248,0.24)]", value: "from-sky-200 to-indigo-300" },
  { border: "border-violet-300/30", glow: "shadow-[0_0_36px_rgba(139,92,246,0.24)]", value: "from-violet-200 to-fuchsia-300" },
  { border: "border-cyan-300/30", glow: "shadow-[0_0_36px_rgba(34,211,238,0.24)]", value: "from-cyan-200 to-blue-300" },
  { border: "border-blue-300/30", glow: "shadow-[0_0_36px_rgba(59,130,246,0.24)]", value: "from-blue-200 to-indigo-300" },
  { border: "border-teal-300/30", glow: "shadow-[0_0_36px_rgba(20,184,166,0.24)]", value: "from-teal-200 to-cyan-300" },
];

export const PROCESS_STEPS = [
  {
    number: "01",
    title: "Consulta Inicial",
    description: "Reunion estrategica para entender tus objetivos, desafios y vision del proyecto.",
    extra: "Definimos alcance, prioridades y oportunidades de mejora para asegurar una base solida.",
    icon: <HiOutlineChatBubbleLeftRight />,
    duration: "1-2 dias",
  },
  {
    number: "02",
    title: "Analisis & Estrategia",
    description: "Investigacion profunda, analisis competitivo y desarrollo de estrategia personalizada.",
    extra: "Nos enfocamos en el estudio del mercado, identificacion de oportunidades y definicion tecnica clara.",
    icon: <HiOutlineMagnifyingGlass />,
    duration: "1-2 semanas",
  },
  {
    number: "03",
    title: "Diseno & Prototipo",
    description: "Creacion de wireframes, diseno UI/UX y prototipos interactivos para validacion.",
    extra: "Realizamos validacion temprana con una experiencia centrada totalmente en el usuario final.",
    icon: <HiOutlinePencilSquare />,
    duration: "2-4 semanas",
  },
  {
    number: "04",
    title: "Desarrollo",
    description: "Construccion del producto con metodologia agil y entregas incrementales.",
    extra: "Implementamos una arquitectura escalable siguiendo las mejores practicas y optimizacion continua.",
    icon: <HiOutlineCommandLine />,
    duration: "8-16 semanas",
  },
  {
    number: "05",
    title: "Testing & QA",
    description: "Pruebas exhaustivas de funcionalidad, rendimiento, seguridad y experiencia.",
    extra: "Ejecutamos pruebas automatizadas y un control de calidad riguroso en cada etapa del desarrollo.",
    icon: <HiOutlineBeaker />,
    duration: "2-3 semanas",
  },
  {
    number: "06",
    title: "Lanzamiento & Soporte",
    description: "Implementacion operativa y monitoreo de impacto real.",
    extra: "Ofrecemos monitoreo proactivo y acompanamiento estrategico post-lanzamiento.",
    icon: <HiOutlineRocketLaunch />,
    duration: "Continuo",
  },
];

export const COMPARISONS = [
  { label: "Tiempo de Desarrollo", before: "6-12 meses", after: "2-4 meses", icon: "⏱️" },
  { label: "Coste del Proyecto", before: "Alto presupuesto", after: "Optimizado -40%", icon: "💰" },
  { label: "Calidad del Codigo", before: "Estandar", after: "Enterprise-grade", icon: "💻" },
  { label: "Soporte Post-lanzamiento", before: "Limitado", after: "24/7 Dedicado", icon: "🛡️" },
  { label: "Escalabilidad", before: "Limitada", after: "Ilimitada", icon: "📈" },
];

export const CLIENT_ONBOARDING = [
  {
    title: "Kickoff Estrategico",
    description: "Alineamos objetivos, alcance y KPIs para arrancar con foco de negocio.",
    deliverable: "Brief validado + roadmap inicial",
    timing: "Primeras 48h",
    icon: <FaComments className="text-amber-300" />,
  },
  {
    title: "Diagnostico de tu Presencia",
    description: "Auditamos web, procesos y conversion para detectar mejoras de mayor impacto.",
    deliverable: "Informe de hallazgos priorizados",
    timing: "Semana 1",
    icon: <FaSearch className="text-orange-300" />,
  },
  {
    title: "Plan de Ejecucion",
    description: "Definimos sprints, entregables y fechas para que siempre sepas que sigue.",
    deliverable: "Cronograma de trabajo por fases",
    timing: "Semana 1",
    icon: <FaPencilRuler className="text-amber-200" />,
  },
  {
    title: "Produccion y QA",
    description: "Construimos, probamos y lanzamos iteraciones sin perder calidad ni control.",
    deliverable: "Entregas funcionales + reporte QA",
    timing: "Semanas 2+",
    icon: <FaCogs className="text-emerald-300" />,
  },
];

export const CLIENT_PROMISES = [
  {
    label: "Canal directo de comunicacion con nuestro equipo",
    icon: <FaHeadset className="text-amber-300 text-lg mt-0.5 flex-shrink-0" />,
  },
  {
    label: "Reporte semanal con avance real del proyecto",
    icon: <FaChartLine className="text-emerald-300 text-lg mt-0.5 flex-shrink-0" />,
  },
  {
    label: "Visibilidad de tareas, prioridades y fechas",
    icon: <FaBullseye className="text-orange-300 text-lg mt-0.5 flex-shrink-0" />,
  },
  {
    label: "Soporte post-lanzamiento con acompanamiento",
    icon: <FaShieldAlt className="text-emerald-300 text-lg mt-0.5 flex-shrink-0" />,
  },
];

export const CLIENT_EVOLUTION_STAGES = [
  {
    phase: "Primeros 90 dias",
    title: "Orden Operativo y Direccion Clara",
    context: "Convertimos objetivos difusos en un plan ejecutable con responsables, prioridades y seguimiento.",
    before: "Procesos sueltos, tareas sin visibilidad y decisiones reactivas.",
    after: "Roadmap activo, tablero de control y cadencia semanal de avances.",
    metric: "+31% velocidad de ejecucion",
    icon: FaBullseye,
    iconColor: "#EF4444",
    iconBorder: "rgba(239,68,68,0.5)",
    iconBg: "rgba(239,68,68,0.14)",
    iconGlow: "rgba(239,68,68,0.3)",
  },
  {
    phase: "Mes 6",
    title: "Resultados Comerciales Consistentes",
    context: "Con optimizacion continua, el sistema empieza a sostener crecimiento real.",
    before: "Captacion irregular y baja conversion en canales principales.",
    after: "Funnel estabilizado con mejor conversion y mayor ticket promedio.",
    metric: "+46% conversion calificada",
    icon: FaChartLine,
    iconColor: "#22C55E",
    iconBorder: "rgba(34,197,94,0.5)",
    iconBg: "rgba(34,197,94,0.14)",
    iconGlow: "rgba(34,197,94,0.3)",
  },
  {
    phase: "Mes 12",
    title: "Escala y Relacion de Largo Plazo",
    context: "El cliente pasa de ejecutar proyectos aislados a operar con una base digital escalable.",
    before: "Dependencia de acciones puntuales y alto esfuerzo operativo.",
    after: "Operacion estandarizada, decisiones por datos y crecimiento sostenido.",
    metric: "2.3 proyectos por cliente activo",
    icon: FaShieldAlt,
    iconColor: "#3B82F6",
    iconBorder: "rgba(59,130,246,0.5)",
    iconBg: "rgba(59,130,246,0.14)",
    iconGlow: "rgba(59,130,246,0.3)",
  },
];

export const CLIENT_RELATIONSHIP_STATS = [
  {
    label: "Retencion de clientes",
    value: "92%",
    detail: "La mayoria continua trabajando con nosotros despues del primer proyecto.",
    icon: FaShieldAlt,
    iconColor: "#22C55E",
    iconBorder: "rgba(34,197,94,0.5)",
    iconBg: "rgba(34,197,94,0.14)",
    iconGlow: "rgba(34,197,94,0.28)",
  },
  {
    label: "Relacion promedio",
    value: "4.2 anos",
    detail: "Acompanamiento real y evolucion constante del negocio.",
    icon: FaHeadset,
    iconColor: "#F59E0B",
    iconBorder: "rgba(245,158,11,0.5)",
    iconBg: "rgba(245,158,11,0.14)",
    iconGlow: "rgba(245,158,11,0.28)",
  },
  {
    label: "Referidos directos",
    value: "38%",
    detail: "Nuevos clientes que llegan por recomendacion de clientes actuales.",
    icon: FaGlobeAmericas,
    iconColor: "#0EA5E9",
    iconBorder: "rgba(14,165,233,0.5)",
    iconBg: "rgba(14,165,233,0.14)",
    iconGlow: "rgba(14,165,233,0.28)",
  },
];

export const HERO_BACKGROUND_FALLBACK = [
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

export const CLIENTS_HERO_TAG = "[clients-hero]";

export const INDUSTRY_ICON_RAIL = [
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
