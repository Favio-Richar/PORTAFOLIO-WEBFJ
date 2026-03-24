"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChevronDown,
  FaChevronRight,
  FaComments,
  FaEdit,
  FaLayerGroup,
  FaLightbulb,
  FaIndustry,
  FaListAlt,
  FaQuestionCircle,
  FaRedo,
  FaSave,
  FaTimes,
  FaUpload,
  FaTools,
  FaTrash,
  FaPhotoVideo,
} from "react-icons/fa";
import API_BASE from "@/lib/apiBase";
import { adminFetch } from "@/lib/adminFetch";

const BACKEND_URL = API_BASE;

type Plan = {
  id: number;
  name: string;
  description: string;
  price: string;
  category?: string | null;
  modules?: string | null;
  includes?: string | null;
  delivery?: string | null;
  ideal_for?: string | null;
  order_index?: number;
};

type AdditionalService = {
  id: number;
  name: string;
  description: string;
  price: string;
  icon?: string | null;
  includes?: string | null;
  payment_type?: string | null;
  recurring?: boolean;
};

type ServiceCombo = {
  id: number;
  title: string;
  segment: string;
  ideal: string;
  includes?: string | null;
  individual_value: string;
  combo_price: string;
  note: string;
  deliverables?: string | null;
  timeline: string;
  not_included?: string | null;
  market_note?: string | null;
  order_index?: number;
  active?: boolean;
};

type ComboDiagnosticCard = {
  id: number;
  badge: string;
  title: string;
  description: string;
  needs_label?: string | null;
  needs?: string | null;
  recommendations_label?: string | null;
  recommendations_text: string;
  cta_text: string;
  cta_href: string;
  theme?: string | null;
  order_index?: number;
  active?: boolean;
};

type ComboHighlightCard = {
  id: number;
  title: string;
  description: string;
  items?: string | null;
  footer_note?: string | null;
  theme?: string | null;
  order_index?: number;
  active?: boolean;
};

type Faq = {
  id: number;
  question: string;
  answer: string;
  category?: string | null;
  active?: boolean;
  order?: number;
};

type Industry = {
  id: number;
  name: string;
  description: string;
  icon?: string | null;
  examples?: string | null;
  order_index?: number;
  active?: boolean;
};

type AdvisoryServiceCard = {
  id: number;
  title: string;
  price: string;
  duration?: string | null;
  audience?: string | null;
  includes?: string | null;
  result: string;
  market_note?: string | null;
  icon?: string | null;
  order_index?: number;
  active?: boolean;
};

type ServiceMarqueeCard = {
  id: number;
  title: string;
  image_url: string;
  order_index?: number;
  active?: boolean;
};

type MediaLibraryItem = {
  id?: number;
  asset_id?: string | null;
  public_id?: string | null;
  title?: string | null;
  description?: string | null;
  type?: string | null;
  url: string;
  created_at?: string | null;
  source?: "db" | "cloudinary";
  order_index?: number;
  active?: boolean;
};

type CloudinaryLibraryResponse = {
  items?: Array<{
    asset_id?: string | null;
    public_id?: string | null;
    url?: string | null;
    resource_type?: string | null;
    created_at?: string | null;
  }>;
  count?: number;
};

type Review = {
  id: number;
  status?: string;
  page_context?: string | null;
};

const EMPTY_PLAN = {
  name: "",
  description: "",
  price: "",
  category: "",
  modules: "",
  includes: "",
  delivery: "",
  ideal_for: "",
  order_index: 0,
};

const DEFAULT_PLAN_SEED = [
  {
    name: "Landing Page Profesional",
    description: "Pagina unica optimizada para conversion maxima. Ideal para campanas Google Ads y Meta Ads.",
    modules: "1 pagina + 3 secciones",
    price: "Desde $149.000 CLP",
    category: "Landing",
    includes:
      "Diseno UX/UI premium responsive\nCopywriting persuasivo\nFormulario de captura de leads\nIntegracion WhatsApp Business API\nGoogle Analytics 4 + Meta Pixel\nOptimizacion velocidad Core Web Vitals\nSSL + Hosting 1 ano incluido\n1 revision de diseno incluida",
    delivery: "Entrega en 3-5 dias habiles\nCodigo fuente entregado\nManual de administracion\nSoporte tecnico 15 dias",
    ideal_for: "Campanas publicitarias\nLanzamientos de producto\nEventos\nServicios profesionales",
    order_index: 0,
  },
  {
    name: "Web Corporativa Pro",
    description: "Sitio institucional multi-pagina que proyecta profesionalismo y autoridad de marca.",
    modules: "5-8 paginas personalizadas",
    price: "Desde $299.000 CLP",
    category: "Corporativa",
    includes:
      "Diseno exclusivo sin templates\nHasta 8 paginas (Inicio, Nosotros, Servicios, etc.)\nBlog con panel administrativo\nSEO tecnico On-Page completo\nIntegracion redes sociales\nMapa interactivo Google Maps\nFormularios avanzados con validacion\nCertificado SSL + Hosting 1 ano",
    delivery:
      "Entrega en 7-12 dias habiles\n2 revisiones de diseno incluidas\nCapacitacion uso panel admin\nBackups automaticos mensuales\nSoporte tecnico 30 dias",
    ideal_for: "PYMEs chilenas\nConsultoras\nEmpresas B2B\nEstudios profesionales",
    order_index: 1,
  },
  {
    name: "E-Commerce Completo",
    description: "Tienda online profesional lista para vender con pasarelas de pago chilenas integradas.",
    modules: "Ilimitado productos",
    price: "Desde $549.000 CLP",
    category: "E-commerce",
    includes:
      "Catalogo ilimitado de productos\nPasarela Webpay Plus / Flow / Khipu\nCarrito de compras persistente\nGestion de stock y inventario\nPanel de clientes con historial\nReportes de ventas y analytics\nApp movil de gestion incluida\nIntegracion con servicios de despacho",
    delivery:
      "Entrega en 15-25 dias habiles\nCapacitacion completa equipo\nSoporte prioritario 60 dias\nOptimizacion continua 3 meses\nMarketing digital inicial incluido",
    ideal_for: "Retail chileno\nMarcas propias\nImportadores\nDistribuidores\nArtesanias",
    order_index: 2,
  },
  {
    name: "Web App a Medida",
    description: "Aplicacion web personalizada para procesos especificos de tu negocio.",
    modules: "Funcionalidades custom",
    price: "Desde $899.000 CLP",
    category: "Web App",
    includes:
      "Analisis de requerimientos detallado\nArquitectura escalable\nBase de datos relacional\nAPI RESTful propia\nPanel de administracion avanzado\nAutenticacion de usuarios (roles)\nReportes y dashboards personalizados\nIntegracion con sistemas externos",
    delivery:
      "Entrega en 30-45 dias habiles\nDocumentacion tecnica completa\nCapacitacion intensiva\nSoporte y mantenimiento 90 dias\nGarantia de funcionamiento 6 meses",
    ideal_for: "Startups chilenas\nProcesos internos\nSaaS\nMarketplaces verticales",
    order_index: 3,
  },
  {
    name: "One Page Premium",
    description: "Todo tu negocio en una sola pagina con navegacion fluida y animaciones premium.",
    modules: "1 pagina + 8 secciones",
    price: "Desde $199.000 CLP",
    category: "One Page",
    includes:
      "Diseno storytelling scroll\nAnimaciones GSAP avanzadas\nNavegacion inteligente por secciones\nGaleria multimedia interactiva\nIntegracion WhatsApp y redes\nFormulario de contacto multi-step\nOptimizacion movil extrema\nSEO local para Google Maps",
    delivery: "Entrega en 5-8 dias habiles\n1 revision incluida\nCodigo optimizado\nSoporte 15 dias",
    ideal_for: "Restaurantes\nSpas y centros esteticos\nProfesionales independientes\nEventos",
    order_index: 4,
  },
  {
    name: "Portal Inmobiliario",
    description: "Plataforma especializada para corredores y agencias inmobiliarias chilenas.",
    modules: "Sistema completo",
    price: "Desde $449.000 CLP",
    category: "Inmobiliario",
    includes:
      "Ficha de propiedades profesional\nBuscador avanzado con filtros\nMapa interactivo con geolocalizacion\nCalculadora de credito hipotecario\nIntegracion portales\nGestion de leads y corredores\nAlertas de nuevas propiedades\nApp movil para corredores",
    delivery: "Entrega en 20-30 dias habiles\nCapacitacion uso avanzado\nSoporte 60 dias\nImportacion de propiedades inicial",
    ideal_for: "Corredoras de propiedades\nInmobiliarias\nConstructoras\nAdministradoras",
    order_index: 5,
  },
];

const EMPTY_SERVICE = {
  name: "",
  description: "",
  price: "",
  icon: "tools",
  includes: "",
  payment_type: "Proyecto",
  recurring: false,
};

const EMPTY_COMBO = {
  title: "",
  segment: "PYMEs",
  ideal: "",
  includes: "",
  individual_value: "",
  combo_price: "",
  note: "",
  deliverables: "",
  timeline: "",
  not_included: "",
  market_note: "",
  order_index: 0,
  active: true,
};

const EMPTY_DIAGNOSTIC_CARD = {
  badge: "",
  title: "",
  description: "",
  needs_label: "Generalmente necesitas",
  needs: "",
  recommendations_label: "Te recomendamos",
  recommendations_text: "",
  cta_text: "",
  cta_href: "",
  theme: "emerald",
  order_index: 0,
  active: true,
};

const EMPTY_HIGHLIGHT_CARD = {
  title: "",
  description: "",
  items: "",
  footer_note: "",
  theme: "emerald",
  order_index: 0,
  active: true,
};

const EMPTY_FAQ = {
  question: "",
  answer: "",
  category: "General",
  order: 0,
  active: true,
};

const EMPTY_INDUSTRY = {
  name: "",
  description: "",
  icon: "briefcase",
  examples: "",
  order_index: 0,
  active: true,
};

const EMPTY_ADVISORY = {
  title: "",
  price: "",
  duration: "60 minutos",
  audience: "",
  includes: "",
  result: "",
  market_note: "",
  icon: "briefcase",
  order_index: 0,
  active: true,
};

const EMPTY_MARQUEE_CARD = {
  title: "",
  image_url: "",
  order_index: 0,
  active: true,
};

const DEFAULT_ADVISORY_SEED = [
  {
    title: "Asesoria TI Estrategica para PYMEs",
    price: "$79.000 CLP",
    duration: "60 minutos",
    audience: "Minimarkets\nTalleres\nServicios tecnicos\nEmpresas pequenas que no saben que sistema implementar",
    includes:
      "Diagnostico general del negocio (ventas, inventario, procesos)\nEvaluacion de herramientas actuales\nIdentificacion de problemas criticos\nRecomendacion de software (ERP, POS, CRM, automatizacion)\nDefinicion de prioridades\nPlan de accion de corto y mediano plazo",
    result: "El cliente sale con claridad sobre que sistema necesita, que implementar primero y que inversion estimada requiere.",
    market_note: "Referencia mercado Chile: $70.000-$120.000. $79.000 es competitivo y profesional.",
    icon: "briefcase",
    order_index: 0,
    active: true,
  },
  {
    title: "Asesoria en Automatizacion de Procesos",
    price: "$89.000 CLP",
    duration: "60 minutos",
    audience: "Empresas con tareas repetitivas manuales\nNegocios que usan Excel para todo\nEmpresas que quieren ahorrar tiempo",
    includes:
      "Identificacion de procesos manuales\nEvaluacion de tareas repetitivas\nAnalisis de ahorro potencial\nPropuesta de automatizacion (RPA, scripts, integraciones API)\nDefinicion de herramientas necesarias\nRoadmap tecnico de implementacion",
    result: "Plan concreto para reducir carga operativa y errores humanos.",
    market_note: "Referencia mercado Chile: $80.000-$150.000. $89.000 es atractivo y serio.",
    icon: "robot",
    order_index: 1,
    active: true,
  },
  {
    title: "Asesoria Web y Optimizacion de Ventas",
    price: "$69.000 CLP",
    duration: "60 minutos",
    audience: "Negocios con pagina web que no vende\nE-commerce con baja conversion\nEmpresas con mala presentacion digital",
    includes:
      "Revision UX/UI\nEvaluacion de estructura comercial\nAnalisis de confianza y credibilidad\nRecomendaciones de mejora\nChecklist SEO basico\nEstrategia para aumentar conversion",
    result: "Lista priorizada de mejoras concretas para vender mas.",
    market_note: "Referencia mercado Chile: $50.000-$100.000. $69.000 es excelente punto medio.",
    icon: "chartline",
    order_index: 2,
    active: true,
  },
  {
    title: "Asesoria ERP / Sistema de Gestion Empresarial",
    price: "$99.000 CLP",
    duration: "90 minutos",
    audience: "Bodegas\nMinimarkets\nEmpresas con inventario\nNegocios que necesitan control real",
    includes:
      "Analisis completo de procesos\nDefinicion de modulos necesarios\nEstructura de roles\nEvaluacion build vs SaaS\nIntegracion con facturacion\nRoadmap de implementacion",
    result: "Documento base para implementar un ERP correctamente.",
    market_note: "Referencia mercado Chile: $100.000-$200.000. $99.000 es competitivo y atractivo.",
    icon: "server",
    order_index: 3,
    active: true,
  },
  {
    title: "Asesoria en Desarrollo de Sistema a Medida",
    price: "$89.000 CLP",
    duration: "60 minutos",
    audience: "Empresas que quieren sistema propio\nClientes que no saben cuanto cuesta desarrollar",
    includes:
      "Levantamiento de requerimientos\nDefinicion funcional inicial\nRecomendacion tecnologica\nEstimacion preliminar de costos y tiempos\nPropuesta de arquitectura",
    result: "Base clara para cotizacion formal de desarrollo.",
    market_note: "Referencia mercado Chile: $70.000-$150.000. $89.000 es ideal para posicion profesional.",
    icon: "code",
    order_index: 4,
    active: true,
  },
  {
    title: "Primera Sesion Diagnostica Breve",
    price: "$39.000 CLP",
    duration: "30 minutos",
    audience: "Ideal como puerta de entrada\nEmpresas que quieren un diagnostico general rapido\nClientes que prefieren validar antes de invertir mas",
    includes: "Diagnostico general\nIdentificacion de problema principal\nRecomendacion de siguiente paso\nSin plan detallado",
    result: "Muchos clientes compran primero esta sesion y luego avanzan a una asesoria completa.",
    market_note: "Precio entrada recomendado para activar nuevas oportunidades.",
    icon: "clock",
    order_index: 5,
    active: true,
  },
];

const DEFAULT_ADDITIONAL_SERVICES_SEED = [
  {
    name: "Integracion CRM Empresarial",
    description:
      "Conexion estrategica entre tu web y CRM para gestion avanzada de clientes y seguimiento real de oportunidades.",
    price: "$250.000 CLP",
    icon: "sync",
    includes:
      "Configuracion CRM\nSincronizacion automatica de leads\nPipeline de ventas personalizado\nHistorial de interacciones\nAutomatizacion basica de seguimiento\nCapacitacion equipo",
    payment_type: "Proyecto unico",
    recurring: false,
  },
  {
    name: "App Movil PWA Empresarial",
    description: "Aplicacion web progresiva optimizada para rendimiento y experiencia movil.",
    price: "$550.000 CLP",
    icon: "mobile",
    includes:
      "Instalacion en dispositivos moviles\nNotificaciones push\nOptimizacion rendimiento\nFuncionalidad offline basica\nPanel de administracion\nPublicacion lista para uso empresarial",
    payment_type: "Proyecto unico desde",
    recurring: false,
  },
  {
    name: "Integracion Pasarelas de Pago",
    description: "Implementacion segura de sistemas de pago en tu sitio web.",
    price: "$80.000 CLP",
    icon: "creditcard",
    includes:
      "Configuracion Webpay / Flow / MercadoPago / Stripe / Khipu\nIntegracion backend\nWebhook de confirmacion automatica\nPruebas en ambiente sandbox\nValidacion flujo completo",
    payment_type: "Por pasarela",
    recurring: false,
  },
  {
    name: "Migracion WordPress a Tecnologia Moderna",
    description: "Modernizacion completa para mejorar velocidad y rendimiento.",
    price: "$350.000 CLP",
    icon: "rocket",
    includes:
      "Migracion contenido\nOptimizacion SEO tecnica\nRediseno visual moderno\nMejora de rendimiento (Core Web Vitals)\nMantencion estructura URL",
    payment_type: "Proyecto unico desde",
    recurring: false,
  },
  {
    name: "Mantenimiento Web Premium",
    description: "Plan de soporte continuo para estabilidad y seguridad.",
    price: "$45.000 CLP",
    icon: "tools",
    includes:
      "Actualizaciones tecnicas\nBackups automaticos\nMonitoreo basico\nSoporte tecnico prioritario\nResolucion incidencias",
    payment_type: "Mensual",
    recurring: true,
  },
  {
    name: "Hosting VPS Chile",
    description: "Infraestructura optimizada con baja latencia en Chile.",
    price: "$35.000 CLP",
    icon: "server",
    includes: "VPS 4GB RAM\nSSD NVMe\nConfiguracion inicial\nFirewall basico\nMonitoreo basico",
    payment_type: "Mensual",
    recurring: true,
  },
  {
    name: "Auditoria de Seguridad Web",
    description: "Evaluacion tecnica de vulnerabilidades y mejoras.",
    price: "$150.000 CLP",
    icon: "shield",
    includes:
      "Escaneo de vulnerabilidades\nRevision configuraciones criticas\nHardening basico\nInforme ejecutivo con recomendaciones",
    payment_type: "Auditoria unica",
    recurring: false,
  },
  {
    name: "Bot WhatsApp Business API",
    description: "Automatizacion comercial con respuestas, menus y derivacion de oportunidades desde WhatsApp.",
    price: "$180.000 CLP",
    icon: "robot",
    includes:
      "Respuestas automaticas 24/7\nMenu interactivo con botones\nIntegracion con formularios y sitio web\nAnalitica de conversaciones\nPlantillas de mensajes aprobadas",
    payment_type: "Setup unico",
    recurring: false,
  },
  {
    name: "Email Marketing Automation",
    description: "Secuencias automaticas de correo para captacion, seguimiento comercial y recuperacion de oportunidades.",
    price: "$120.000 CLP",
    icon: "mail",
    includes:
      "Secuencias de bienvenida\nAutomatizacion de seguimiento\nRecuperacion de carritos o leads\nSegmentacion de audiencias\nMetricas de apertura y clicks",
    payment_type: "Setup + mensual",
    recurring: true,
  },
  {
    name: "SEO Local Chile",
    description: "Posicionamiento local en Google para negocios que necesitan aparecer en mapas y busquedas cercanas.",
    price: "$150.000 CLP",
    icon: "map-marker",
    includes:
      "Optimizacion Google Business Profile\nKeywords locales\nMejoras on-page basicas\nGestion de resenas\nReporte de posicionamiento",
    payment_type: "Mensual",
    recurring: true,
  },
  {
    name: "Campanas Google Ads",
    description: "Configuracion y lanzamiento de campanas de Google Ads con foco en demanda y conversion.",
    price: "$200.000 CLP",
    icon: "bullhorn",
    includes:
      "Investigacion de keywords\nConfiguracion de campanas\nTracking de conversiones\nCopies iniciales de anuncios\nRevision de estructura y optimizacion base",
    payment_type: "Setup + gestion",
    recurring: false,
  },
  {
    name: "Meta Ads Facebook Instagram",
    description: "Campanas en Meta Ads para captacion, remarketing y performance en redes sociales.",
    price: "$180.000 CLP",
    icon: "bullhorn",
    includes:
      "Configuracion Business Manager\nPixeles y eventos\nSegmentacion inicial\nCampana de captacion o remarketing\nDashboard base de resultados",
    payment_type: "Setup + gestion",
    recurring: false,
  },
  {
    name: "Branding Completo",
    description: "Identidad visual profesional con lineamientos claros para presentar tu negocio con consistencia.",
    price: "$250.000 CLP",
    icon: "paint-brush",
    includes:
      "Logo base\nPaleta cromatica\nSistema tipografico\nManual de marca basico\nAplicaciones iniciales",
    payment_type: "Proyecto unico",
    recurring: false,
  },
  {
    name: "Pack Redes Sociales",
    description: "Kit grafico para redes con piezas listas para comunicar una marca de forma profesional.",
    price: "$80.000 CLP",
    icon: "instagram",
    includes:
      "Templates para feed\nStories editables\nPortadas destacadas\nAjuste de foto de perfil\nGuia base de uso",
    payment_type: "Pack unico",
    recurring: false,
  },
  {
    name: "Fotografia Profesional",
    description: "Sesion fotografica para productos, espacios o equipo con entrega editada para uso comercial.",
    price: "$120.000 CLP",
    icon: "camera",
    includes:
      "Sesion fotografica\nFotos editadas\nTomas de producto o ambiente\nEntrega digital optimizada",
    payment_type: "Sesion",
    recurring: false,
  },
  {
    name: "Capacitacion Equipo Comercial",
    description: "Transferencia operativa para que el equipo use correctamente las automatizaciones y herramientas activadas.",
    price: "$90.000 CLP",
    icon: "users",
    includes:
      "Sesion de capacitacion\nBuenas practicas de operacion\nResolucion de dudas\nChecklist de uso diario",
    payment_type: "Sesion",
    recurring: false,
  },
  {
    name: "SEO Tecnico Base",
    description: "Correcciones tecnicas iniciales para indexacion, estructura y rendimiento de un sitio web.",
    price: "$110.000 CLP",
    icon: "search",
    includes:
      "Revision de indexacion\nMejoras meta y headings\nAjustes de sitemap y robots\nCorrecciones de performance base",
    payment_type: "Auditoria + implementacion base",
    recurring: false,
  },
];

const DEFAULT_COMBO_SEED = [
  {
    title: "Combo 1 - Presencia Digital Profesional",
    segment: "PYMEs",
    ideal: "Ideal para negocios que recien quieren profesionalizar su imagen.",
    includes: "Branding Completo\nPack Redes Sociales\nFotografia Profesional",
    individual_value: "$450.000 CLP",
    combo_price: "$390.000 CLP",
    note: "Ahorro visible para facilitar el cierre comercial.",
    deliverables:
      "Identidad visual base: logo, paleta y tipografias\nPack de piezas graficas para redes sociales feed y stories\nSesion fotografica y seleccion de imagenes editadas\nEntrega de archivos base para uso comercial",
    timeline: "7 a 12 dias habiles",
    not_included:
      "Impresion de material fisico\nCompra de imagenes premium de terceros\nGestion mensual de redes sociales",
    market_note: "Posicion competitivo para PYMEs en Chile que buscan presencia profesional inicial.",
    order_index: 0,
    active: true,
  },
  {
    title: "Combo 2 - Crecimiento Digital",
    segment: "PYMEs",
    ideal: "Para negocios que ya tienen web y quieren vender mas.",
    includes: "SEO Local Chile\nCampanas Google Ads\nMeta Ads Facebook Instagram\nEmail Marketing Automation",
    individual_value: "$510.000 CLP",
    combo_price: "$450.000 CLP",
    note: "Sube ticket promedio inmediato con foco en demanda.",
    deliverables:
      "SEO local inicial con optimizacion de perfil y estructura base\nConfiguracion de campanas Google Ads y Meta Ads\nInstalacion de pixeles, eventos y conversion tracking\nSetup de automatizacion de email para captacion y seguimiento",
    timeline: "10 a 15 dias habiles",
    not_included:
      "Presupuesto de pauta publicitaria\nGestion mensual posterior a la configuracion\nLicencias de plataformas externas",
    market_note: "Alineado a paquetes de activacion comercial para PYMEs chilenas con foco en demanda.",
    order_index: 1,
    active: true,
  },
  {
    title: "Combo 3 - E-commerce Optimizado",
    segment: "PYMEs",
    ideal: "Para tiendas online que quieren vender en serio.",
    includes: "Integracion Pasarelas de Pago\nEmail Marketing Automation\nSEO Local Chile\nMantenimiento Web Premium",
    individual_value: "$440.000 CLP",
    combo_price: "$390.000 CLP",
    note: "Paquete equilibrado para conversion y continuidad operativa.",
    deliverables:
      "Integracion de una pasarela de pago con flujo de confirmacion\nAutomatizacion de emails de compra y seguimiento\nAjustes SEO local basicos para visibilidad inicial\nMantenimiento preventivo y correctivo por 2 meses",
    timeline: "12 a 18 dias habiles",
    not_included: "Comisiones de pasarela de pago\nCarga masiva de catalogo por lote\nCampanas pagadas de trafico",
    market_note: "Paquete competitivo para e-commerce chileno que busca estabilizar conversion y operacion.",
    order_index: 2,
    active: true,
  },
  {
    title: "Combo 4 - Automatizacion Empresarial",
    segment: "Empresarial",
    ideal: "Para empresas que necesitan orden comercial y operacion trazable.",
    includes:
      "Bot WhatsApp Business API\nIntegracion CRM Empresarial\nEmail Marketing Automation\nCapacitacion Equipo Comercial",
    individual_value: "$550.000 CLP",
    combo_price: "$520.000 CLP",
    note: "Eleva ticket sin generar friccion de compra.",
    deliverables:
      "Configuracion de bot WhatsApp Business API para flujo comercial\nIntegracion con CRM para seguimiento de leads y oportunidades\nAutomatizacion de secuencias de correo de soporte comercial\nCapacitacion operativa al equipo para uso diario",
    timeline: "15 a 25 dias habiles",
    not_included:
      "Licenciamiento CRM y proveedores de API\nMesa de soporte 24/7 permanente\nDesarrollo de ERP completo",
    market_note: "Posicion de entrada solida para empresas chilenas en etapa de orden y escalamiento.",
    order_index: 3,
    active: true,
  },
  {
    title: "Combo 5 - Transformacion Digital Completa",
    segment: "Empresarial",
    ideal: "Para empresas que buscan estructura digital de alto impacto.",
    includes:
      "Migracion WordPress a Tecnologia Moderna\nIntegracion CRM Empresarial\nApp Movil PWA Empresarial\nSEO Tecnico Base",
    individual_value: "$1.150.000 CLP",
    combo_price: "$1.050.000 CLP",
    note: "Ticket alto real con solucion de punta a punta.",
    deliverables:
      "Migracion de WordPress a stack moderno orientado a rendimiento\nIntegracion CRM para centralizar y seguir oportunidades\nImplementacion de PWA empresarial con base operativa\nSEO tecnico inicial para estructura e indexacion",
    timeline: "25 a 45 dias habiles",
    not_included:
      "Redaccion de contenido desde cero\nInfraestructura mensual hosting, terceros o licencias\nIntegraciones enterprise fuera de alcance acordado",
    market_note: "Ticket premium competitivo para proyectos de transformacion digital en Chile.",
    order_index: 4,
    active: true,
  },
];

const DEFAULT_COMBO_DIAGNOSTIC_SEED = [
  {
    badge: "1 - PYME",
    title: "Soy emprendedor o pequena empresa",
    description: "Estoy comenzando o tengo un negocio pequeno y quiero vender mas.",
    needs_label: "Generalmente necesitas",
    needs:
      "Mejorar tu imagen digital\nAparecer en Google\nGenerar mas clientes\nAutomatizar tareas basicas\nOrdenar tu presencia online",
    recommendations_label: "Te recomendamos",
    recommendations_text: "SEO Local, Google Ads, Meta Ads, Email Marketing, Branding y Mantenimiento Web.",
    cta_text: "Ver soluciones para PYMEs",
    cta_href: "#pyme-soluciones",
    theme: "emerald",
    order_index: 0,
    active: true,
  },
  {
    badge: "2 - CRECIMIENTO",
    title: "Soy una empresa en crecimiento",
    description: "Ya tengo clientes, pero necesito orden, automatizacion y estructura.",
    needs_label: "Generalmente necesitas",
    needs:
      "Automatizar procesos internos\nIntegrar sistemas\nCentralizar clientes en CRM\nReducir errores manuales\nEscalar operaciones",
    recommendations_label: "Te recomendamos",
    recommendations_text: "Integracion CRM, Bot WhatsApp Business API, automatizacion avanzada, migracion moderna y App PWA.",
    cta_text: "Ver soluciones empresariales",
    cta_href: "#empresarial-soluciones",
    theme: "blue",
    order_index: 1,
    active: true,
  },
  {
    badge: "3 - CONSOLIDADA",
    title: "Soy una empresa consolidada",
    description: "Necesito optimizar, escalar y asegurar mi infraestructura tecnologica.",
    needs_label: "Generalmente necesitas",
    needs:
      "Arquitectura tecnologica solida\nSeguridad avanzada\nOptimizacion de rendimiento\nSistemas personalizados\nIntegraciones complejas",
    recommendations_label: "Te recomendamos",
    recommendations_text: "Auditoria de Seguridad, desarrollo a medida, ERP empresarial, hosting dedicado y automatizacion integral.",
    cta_text: "Solicitar evaluacion estrategica",
    cta_href: "/asesoria?source=servicios-combos&reserve_type=asesoria&reserve_name=Evaluacion+estrategica+de+empresa",
    theme: "violet",
    order_index: 2,
    active: true,
  },
];

const DEFAULT_COMBO_HIGHLIGHT_SEED = [
  {
    title: "Para PYMEs que quieren crecer",
    description: "Soluciones practicas y efectivas para aumentar ventas, mejorar presencia digital y profesionalizar tu negocio.",
    items:
      "Branding Completo\nPack Redes Sociales\nFotografia Profesional\nSEO Local Chile\nCampanas Google Ads\nMeta Ads Facebook Instagram",
    footer_note: "Disenados para negocios que necesitan crecer sin complicaciones tecnicas.",
    theme: "emerald",
    order_index: 0,
    active: true,
  },
  {
    title: "Para Empresas que necesitan escalar",
    description: "Arquitectura tecnologica, automatizacion y sistemas que ordenan y profesionalizan tu operacion.",
    items:
      "Bot WhatsApp Business API\nIntegracion CRM Empresarial\nEmail Marketing Automation\nCapacitacion Equipo Comercial\nMigracion WordPress a Tecnologia Moderna\nApp Movil PWA Empresarial",
    footer_note: "Pensado para empresas que quieren estructura, control y crecimiento sostenido.",
    theme: "blue",
    order_index: 1,
    active: true,
  },
];

const DEFAULT_INDUSTRY_SEED = [
  {
    name: "Restaurantes & Food",
    description: "Menus digitales, pedidos online, reservas y delivery integrado.",
    icon: "utensils",
    examples: "Sushi\nPizza\nCafeterias\nFood trucks",
    order_index: 0,
    active: true,
  },
  {
    name: "Inmobiliarias",
    description: "Portales de propiedades, CRM inmobiliario y calculadoras de credito.",
    icon: "home",
    examples: "Corredoras\nConstructoras\nArriendo\nAdministradoras",
    order_index: 1,
    active: true,
  },
  {
    name: "Salud & Bienestar",
    description: "Reservas medicas, telemedicina, historiales y recordatorios automaticos.",
    icon: "heartbeat",
    examples: "Clinicas\nDentistas\nKinesiologos\nSpas",
    order_index: 2,
    active: true,
  },
  {
    name: "Retail & E-commerce",
    description: "Tiendas online con pasarelas chilenas, stock y logistica integrada.",
    icon: "shoppingbag",
    examples: "Moda\nTecnologia\nMascotas\nDeportes",
    order_index: 3,
    active: true,
  },
  {
    name: "Servicios Profesionales",
    description: "Webs de autoridad para abogados, contadores, consultores y agencias.",
    icon: "briefcase",
    examples: "Abogados\nContadores\nConsultoras\nAgencias",
    order_index: 4,
    active: true,
  },
  {
    name: "Educacion & Capacitacion",
    description: "Plataformas e-learning, inscripciones y gestion de cursos.",
    icon: "graduationcap",
    examples: "Cursos online\nColegios\nUniversidades\nCapacitacion",
    order_index: 5,
    active: true,
  },
];

const DEFAULT_MARQUEE_SEED = [
  {
    title: "Showcase Multi-dispositivo",
    image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=60",
    order_index: 0,
    active: true,
  },
  {
    title: "UX/UI Mobile First",
    image_url: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&auto=format&fit=crop&q=60",
    order_index: 1,
    active: true,
  },
  {
    title: "Desarrollo High Performance",
    image_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=60",
    order_index: 2,
    active: true,
  },
  {
    title: "Analitica y Estrategia",
    image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=60",
    order_index: 3,
    active: true,
  },
  {
    title: "E-commerce Escalable",
    image_url: "https://images.unsplash.com/photo-1557821552-17105176677c?w=1200&auto=format&fit=crop&q=60",
    order_index: 4,
    active: true,
  },
  {
    title: "Diseno Visual Premium",
    image_url: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=1200&auto=format&fit=crop&q=60",
    order_index: 5,
    active: true,
  },
];

const formatListFieldForForm = (value?: string | null) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((item) => String(item ?? "").trim()).filter(Boolean).join("\n");
  } catch {
    // keep raw string
  }
  return raw;
};

const parseListFieldForView = (value?: string | null) => {
  return String(value || "")
    .replace(/\r/g, "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const getNextOrderIndex = (items: Array<{ order_index?: number | null }>): number => {
  return items.reduce((max, item) => {
    const current = Number(item?.order_index);
    if (!Number.isFinite(current)) return max;
    return current > max ? current : max;
  }, -1) + 1;
};

const getNextFaqOrder = (items: Array<{ order?: number | null }>): number => {
  return items.reduce((max, item) => {
    const current = Number(item?.order);
    if (!Number.isFinite(current)) return max;
    return current > max ? current : max;
  }, -1) + 1;
};

const VIDEO_URL_PATTERN = /\.(mp4|webm|ogg|mov|m4v|avi)(\?.*)?$/i;

const normalizeMediaType = (type?: string | null, url?: string | null): "image" | "video" => {
  const normalizedType = String(type || "").trim().toLowerCase();
  if (normalizedType === "video") return "video";
  return VIDEO_URL_PATTERN.test(String(url || "").trim()) || String(url || "").includes("/video/upload/")
    ? "video"
    : "image";
};

const isVideoMediaUrl = (url?: string | null): boolean => normalizeMediaType(null, url) === "video";

const fileNameToTitle = (filename: string): string => {
  const base = String(filename || "").replace(/\.[^.]+$/, "");
  return base.replace(/[_-]+/g, " ").trim();
};

export default function ServicesAdmin() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [services, setServices] = useState<AdditionalService[]>([]);
  const [combos, setCombos] = useState<ServiceCombo[]>([]);
  const [comboDiagnosticCards, setComboDiagnosticCards] = useState<ComboDiagnosticCard[]>([]);
  const [comboHighlightCards, setComboHighlightCards] = useState<ComboHighlightCard[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [advisoryCards, setAdvisoryCards] = useState<AdvisoryServiceCard[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [marqueeCards, setMarqueeCards] = useState<ServiceMarqueeCard[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingKey, setSavingKey] = useState("");

  const [planForm, setPlanForm] = useState(EMPTY_PLAN);
  const [serviceForm, setServiceForm] = useState(EMPTY_SERVICE);
  const [comboForm, setComboForm] = useState(EMPTY_COMBO);
  const [comboDiagnosticForm, setComboDiagnosticForm] = useState(EMPTY_DIAGNOSTIC_CARD);
  const [comboHighlightForm, setComboHighlightForm] = useState(EMPTY_HIGHLIGHT_CARD);
  const [faqForm, setFaqForm] = useState(EMPTY_FAQ);
  const [marqueeForm, setMarqueeForm] = useState(EMPTY_MARQUEE_CARD);
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [planEditForm, setPlanEditForm] = useState<Plan | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [serviceEditForm, setServiceEditForm] = useState<AdditionalService | null>(null);
  const [editingComboId, setEditingComboId] = useState<number | null>(null);
  const [comboEditForm, setComboEditForm] = useState<ServiceCombo | null>(null);
  const [editingComboDiagnosticId, setEditingComboDiagnosticId] = useState<number | null>(null);
  const [comboDiagnosticEditForm, setComboDiagnosticEditForm] = useState<ComboDiagnosticCard | null>(null);
  const [editingComboHighlightId, setEditingComboHighlightId] = useState<number | null>(null);
  const [comboHighlightEditForm, setComboHighlightEditForm] = useState<ComboHighlightCard | null>(null);
  const [editingFaqId, setEditingFaqId] = useState<number | null>(null);
  const [faqEditForm, setFaqEditForm] = useState<Faq | null>(null);
  const [advisoryForm, setAdvisoryForm] = useState(EMPTY_ADVISORY);
  const [editingAdvisoryId, setEditingAdvisoryId] = useState<number | null>(null);
  const [advisoryEditForm, setAdvisoryEditForm] = useState<AdvisoryServiceCard | null>(null);
  const [industryForm, setIndustryForm] = useState(EMPTY_INDUSTRY);
  const [editingIndustryId, setEditingIndustryId] = useState<number | null>(null);
  const [industryEditForm, setIndustryEditForm] = useState<Industry | null>(null);
  const [editingMarqueeId, setEditingMarqueeId] = useState<number | null>(null);
  const [marqueeEditForm, setMarqueeEditForm] = useState<ServiceMarqueeCard | null>(null);
  const [marqueeUploadingTarget, setMarqueeUploadingTarget] = useState<"create" | "edit" | null>(null);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [mediaLibraryTarget, setMediaLibraryTarget] = useState<"create" | "edit">("create");
  const [mediaLibraryItems, setMediaLibraryItems] = useState<MediaLibraryItem[]>([]);
  const [mediaLibraryLoading, setMediaLibraryLoading] = useState(false);
  const [mediaLibraryError, setMediaLibraryError] = useState("");
  const marqueeCreateFileInputRef = useRef<HTMLInputElement | null>(null);
  const marqueeEditFileInputRef = useRef<HTMLInputElement | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [plansRes, servicesRes, combosRes, comboDiagnosticRes, comboHighlightRes, faqsRes, advisoryRes, industriesRes, marqueeRes, reviewsRes] = await Promise.all([
        adminFetch(`${BACKEND_URL}/api/services-page/plans`),
        adminFetch(`${BACKEND_URL}/api/services-page/additional-services`),
        adminFetch(`${BACKEND_URL}/api/services-page/combos/admin`),
        adminFetch(`${BACKEND_URL}/api/services-page/combo-diagnostic-cards/admin`),
        adminFetch(`${BACKEND_URL}/api/services-page/combo-highlight-cards/admin`),
        adminFetch(`${BACKEND_URL}/api/services-page/faqs/admin`),
        adminFetch(`${BACKEND_URL}/api/services-page/advisory-services/admin`),
        adminFetch(`${BACKEND_URL}/api/services-page/industries/admin`),
        adminFetch(`${BACKEND_URL}/api/services-page/marquee-cards/admin`),
        adminFetch(`${BACKEND_URL}/api/services-page/reviews/admin`),
      ]);

      const plansData = plansRes.ok ? await plansRes.json() : [];
      const servicesData = servicesRes.ok ? await servicesRes.json() : [];
      const combosData = combosRes.ok ? await combosRes.json() : [];
      const comboDiagnosticData = comboDiagnosticRes.ok ? await comboDiagnosticRes.json() : [];
      const comboHighlightData = comboHighlightRes.ok ? await comboHighlightRes.json() : [];
      const faqsData = faqsRes.ok ? await faqsRes.json() : [];
      const advisoryData = advisoryRes.ok ? await advisoryRes.json() : [];
      const industriesData = industriesRes.ok ? await industriesRes.json() : [];
      const marqueeData = marqueeRes.ok ? await marqueeRes.json() : [];
      const reviewsData = reviewsRes.ok ? await reviewsRes.json() : [];

      setPlans(Array.isArray(plansData) ? plansData : []);
      setServices(Array.isArray(servicesData) ? servicesData : []);
      setCombos(
        Array.isArray(combosData)
          ? combosData.map((item) => ({
              ...item,
              includes: formatListFieldForForm(item.includes),
              deliverables: formatListFieldForForm(item.deliverables),
              not_included: formatListFieldForForm(item.not_included),
            }))
          : []
      );
      setComboDiagnosticCards(
        Array.isArray(comboDiagnosticData)
          ? comboDiagnosticData.map((item) => ({
              ...item,
              needs: formatListFieldForForm(item.needs),
            }))
          : []
      );
      setComboHighlightCards(
        Array.isArray(comboHighlightData)
          ? comboHighlightData.map((item) => ({
              ...item,
              items: formatListFieldForForm(item.items),
            }))
          : []
      );
      setFaqs(Array.isArray(faqsData) ? faqsData : []);
      setAdvisoryCards(
        Array.isArray(advisoryData)
          ? advisoryData.map((item) => ({
              ...item,
              audience: formatListFieldForForm(item.audience),
              includes: formatListFieldForForm(item.includes),
            }))
          : []
      );
      setIndustries(Array.isArray(industriesData) ? industriesData : []);
      setMarqueeCards(Array.isArray(marqueeData) ? marqueeData : []);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el modulo de servicios.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const pendingServiceReviews = useMemo(
    () =>
      reviews.filter(
        (review) =>
          (review.page_context || "").toLowerCase().trim() === "servicios" &&
          (review.status || "").toLowerCase().trim() === "pending"
      ).length,
    [reviews]
  );

  useEffect(() => {
    if (editingPlanId === null) return;
    const stillExists = plans.some((item) => item.id === editingPlanId);
    if (!stillExists) {
      setEditingPlanId(null);
      setPlanEditForm(null);
    }
  }, [plans, editingPlanId]);

  useEffect(() => {
    if (editingServiceId === null) return;
    const stillExists = services.some((item) => item.id === editingServiceId);
    if (!stillExists) {
      setEditingServiceId(null);
      setServiceEditForm(null);
    }
  }, [services, editingServiceId]);

  useEffect(() => {
    if (editingComboId === null) return;
    const stillExists = combos.some((item) => item.id === editingComboId);
    if (!stillExists) {
      setEditingComboId(null);
      setComboEditForm(null);
    }
  }, [combos, editingComboId]);

  useEffect(() => {
    if (editingComboDiagnosticId === null) return;
    const stillExists = comboDiagnosticCards.some((item) => item.id === editingComboDiagnosticId);
    if (!stillExists) {
      setEditingComboDiagnosticId(null);
      setComboDiagnosticEditForm(null);
    }
  }, [comboDiagnosticCards, editingComboDiagnosticId]);

  useEffect(() => {
    if (editingComboHighlightId === null) return;
    const stillExists = comboHighlightCards.some((item) => item.id === editingComboHighlightId);
    if (!stillExists) {
      setEditingComboHighlightId(null);
      setComboHighlightEditForm(null);
    }
  }, [comboHighlightCards, editingComboHighlightId]);

  useEffect(() => {
    if (editingFaqId === null) return;
    const stillExists = faqs.some((item) => item.id === editingFaqId);
    if (!stillExists) {
      setEditingFaqId(null);
      setFaqEditForm(null);
    }
  }, [faqs, editingFaqId]);

  useEffect(() => {
    if (editingAdvisoryId === null) return;
    const stillExists = advisoryCards.some((item) => item.id === editingAdvisoryId);
    if (!stillExists) {
      setEditingAdvisoryId(null);
      setAdvisoryEditForm(null);
    }
  }, [advisoryCards, editingAdvisoryId]);

  useEffect(() => {
    if (editingIndustryId === null) return;
    const stillExists = industries.some((item) => item.id === editingIndustryId);
    if (!stillExists) {
      setEditingIndustryId(null);
      setIndustryEditForm(null);
    }
  }, [industries, editingIndustryId]);

  useEffect(() => {
    if (editingMarqueeId === null) return;
    const stillExists = marqueeCards.some((item) => item.id === editingMarqueeId);
    if (!stillExists) {
      setEditingMarqueeId(null);
      setMarqueeEditForm(null);
    }
  }, [marqueeCards, editingMarqueeId]);

  const postResource = useCallback(async (url: string, payload: object, successMessage: string, key: string) => {
    try {
      setSavingKey(key);
      setError("");
      setNotice("");

      const res = await adminFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorPayload = await res.json().catch(() => ({}));
        throw new Error(errorPayload?.detail || "No se pudo guardar.");
      }

      setNotice(successMessage);
      await loadAll();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
      return false;
    } finally {
      setSavingKey("");
    }
  }, [loadAll]);

  const putResource = useCallback(async (url: string, payload: object, successMessage: string, key: string) => {
    try {
      setSavingKey(key);
      setError("");
      setNotice("");

      const res = await adminFetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorPayload = await res.json().catch(() => ({}));
        throw new Error(errorPayload?.detail || "No se pudo actualizar.");
      }

      setNotice(successMessage);
      await loadAll();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar.");
      return false;
    } finally {
      setSavingKey("");
    }
  }, [loadAll]);

  const deleteResource = useCallback(async (url: string, successMessage: string, key: string) => {
    try {
      setSavingKey(key);
      setError("");
      setNotice("");

      const res = await adminFetch(url, { method: "DELETE" });
      if (!res.ok) {
        const errorPayload = await res.json().catch(() => ({}));
        throw new Error(errorPayload?.detail || "No se pudo eliminar.");
      }

      setNotice(successMessage);
      await loadAll();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar.");
      return false;
    } finally {
      setSavingKey("");
    }
  }, [loadAll]);

  const createPlan = async () => {
    if (!planForm.name.trim() || !planForm.description.trim() || !planForm.price.trim()) {
      setError("Plan: nombre, descripcion y precio son obligatorios.");
      return;
    }

    const ok = await postResource(
      `${BACKEND_URL}/api/services-page/plans`,
      {
        ...planForm,
        name: planForm.name.trim(),
        description: planForm.description.trim(),
        price: planForm.price.trim(),
        order_index: getNextOrderIndex(plans),
      },
      "Plan creado correctamente.",
      "plan"
    );

    if (ok) setPlanForm(EMPTY_PLAN);
  };

  const savePlan = async (plan: Plan) => {
    if (!plan.name.trim() || !plan.description.trim() || !plan.price.trim()) {
      setError("Plan: nombre, descripcion y precio son obligatorios.");
      return false;
    }

    return await putResource(
      `${BACKEND_URL}/api/services-page/plans/${plan.id}`,
      {
        name: plan.name.trim(),
        description: plan.description.trim(),
        price: plan.price.trim(),
        category: String(plan.category || "").trim(),
        modules: String(plan.modules || "").trim(),
        includes: String(plan.includes || "").trim(),
        delivery: String(plan.delivery || "").trim(),
        ideal_for: String(plan.ideal_for || "").trim(),
        order_index: Number(plan.order_index) || 0,
      },
      "Plan actualizado correctamente.",
      `plan-save-${plan.id}`
    );
  };

  const removePlan = async (plan: Plan) => {
    const confirmed = window.confirm(`Eliminar plan "${plan.name}"? Esta accion no borra otros datos.`);
    if (!confirmed) return;
    await deleteResource(
      `${BACKEND_URL}/api/services-page/plans/${plan.id}`,
      "Plan eliminado correctamente.",
      `plan-delete-${plan.id}`
    );
  };

  const startEditPlan = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setPlanEditForm({
      ...plan,
      modules: formatListFieldForForm(plan.modules),
      includes: formatListFieldForForm(plan.includes),
      delivery: formatListFieldForForm(plan.delivery),
      ideal_for: formatListFieldForForm(plan.ideal_for),
    });
  };

  const cancelEditPlan = () => {
    setEditingPlanId(null);
    setPlanEditForm(null);
  };

  const saveEditingPlan = async () => {
    if (!planEditForm) return;
    const ok = await savePlan(planEditForm);
    if (ok) {
      setEditingPlanId(null);
      setPlanEditForm(null);
    }
  };

  const seedDefaultPlans = async () => {
    try {
      setSavingKey("plan-seed");
      setError("");
      setNotice("");

      const existingNames = new Set(plans.map((item) => item.name.trim().toLowerCase()));
      const missing = DEFAULT_PLAN_SEED.filter((item) => !existingNames.has(item.name.trim().toLowerCase()));

      if (!missing.length) {
        setNotice("Las tarjetas base de planes ya existen en BD.");
        return;
      }

      for (const payload of missing) {
        const res = await adminFetch(`${BACKEND_URL}/api/services-page/plans`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorPayload = await res.json().catch(() => ({}));
          throw new Error(errorPayload?.detail || "No se pudieron cargar las tarjetas base de planes.");
        }
      }

      setNotice(`Se cargaron ${missing.length} tarjetas base de planes.`);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las tarjetas base de planes.");
    } finally {
      setSavingKey("");
    }
  };

  const createService = async () => {
    if (!serviceForm.name.trim() || !serviceForm.description.trim() || !serviceForm.price.trim()) {
      setError("Servicio adicional: nombre, descripcion y precio son obligatorios.");
      return;
    }

    const ok = await postResource(
      `${BACKEND_URL}/api/services-page/additional-services`,
      {
        ...serviceForm,
        name: serviceForm.name.trim(),
        description: serviceForm.description.trim(),
        price: serviceForm.price.trim(),
      },
      "Servicio adicional creado correctamente.",
      "service"
    );

    if (ok) setServiceForm(EMPTY_SERVICE);
  };

  const saveService = async (service: AdditionalService) => {
    if (!service.name.trim() || !service.description.trim() || !service.price.trim()) {
      setError("Servicio adicional: nombre, descripcion y precio son obligatorios.");
      return false;
    }

    return await putResource(
      `${BACKEND_URL}/api/services-page/additional-services/${service.id}`,
      {
        name: service.name.trim(),
        description: service.description.trim(),
        price: service.price.trim(),
        icon: String(service.icon || "").trim(),
        includes: String(service.includes || "").trim(),
        payment_type: String(service.payment_type || "").trim(),
      },
      "Servicio adicional actualizado correctamente.",
      `service-save-${service.id}`
    );
  };

  const removeService = async (service: AdditionalService) => {
    const confirmed = window.confirm(`Eliminar servicio "${service.name}"? Esta accion no borra otros datos.`);
    if (!confirmed) return;
    await deleteResource(
      `${BACKEND_URL}/api/services-page/additional-services/${service.id}`,
      "Servicio adicional eliminado correctamente.",
      `service-delete-${service.id}`
    );
  };

  const startEditService = (service: AdditionalService) => {
    setEditingServiceId(service.id);
    setServiceEditForm({
      ...service,
      includes: formatListFieldForForm(service.includes),
    });
  };

  const cancelEditService = () => {
    setEditingServiceId(null);
    setServiceEditForm(null);
  };

  const saveEditingService = async () => {
    if (!serviceEditForm) return;
    const ok = await saveService(serviceEditForm);
    if (ok) {
      setEditingServiceId(null);
      setServiceEditForm(null);
    }
  };

  const seedDefaultAdditionalServices = async () => {
    try {
      setSavingKey("service-seed");
      setError("");
      setNotice("");

      const existingNames = new Set(services.map((item) => item.name.trim().toLowerCase()));
      const missing = DEFAULT_ADDITIONAL_SERVICES_SEED.filter(
        (item) => !existingNames.has(item.name.trim().toLowerCase())
      );

      if (!missing.length) {
        setNotice("Las tarjetas base de servicios adicionales ya existen en BD.");
        return;
      }

      for (const payload of missing) {
        const res = await adminFetch(`${BACKEND_URL}/api/services-page/additional-services`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorPayload = await res.json().catch(() => ({}));
          throw new Error(errorPayload?.detail || "No se pudieron cargar las tarjetas base de servicios.");
        }
      }

      setNotice(`Se cargaron ${missing.length} tarjetas base de servicios adicionales.`);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las tarjetas base de servicios.");
    } finally {
      setSavingKey("");
    }
  };

  const createCombo = async () => {
    if (
      !comboForm.title.trim() ||
      !comboForm.ideal.trim() ||
      !comboForm.individual_value.trim() ||
      !comboForm.combo_price.trim() ||
      !comboForm.note.trim() ||
      !comboForm.timeline.trim()
    ) {
      setError("Combo: titulo, ideal, valores, nota y plazo son obligatorios.");
      return;
    }

    const ok = await postResource(
      `${BACKEND_URL}/api/services-page/combos`,
      {
        ...comboForm,
        title: comboForm.title.trim(),
        segment: comboForm.segment.trim() || "PYMEs",
        ideal: comboForm.ideal.trim(),
        includes: comboForm.includes.trim(),
        individual_value: comboForm.individual_value.trim(),
        combo_price: comboForm.combo_price.trim(),
        note: comboForm.note.trim(),
        deliverables: comboForm.deliverables.trim(),
        timeline: comboForm.timeline.trim(),
        not_included: comboForm.not_included.trim(),
        market_note: comboForm.market_note.trim(),
        order_index: getNextOrderIndex(combos),
      },
      "Combo creado correctamente.",
      "combo"
    );

    if (ok) setComboForm(EMPTY_COMBO);
  };

  const saveCombo = async (combo: ServiceCombo) => {
    if (
      !combo.title.trim() ||
      !combo.ideal.trim() ||
      !combo.individual_value.trim() ||
      !combo.combo_price.trim() ||
      !combo.note.trim() ||
      !combo.timeline.trim()
    ) {
      setError("Combo: titulo, ideal, valores, nota y plazo son obligatorios.");
      return false;
    }

    return await putResource(
      `${BACKEND_URL}/api/services-page/combos/${combo.id}`,
      {
        title: combo.title.trim(),
        segment: combo.segment.trim() || "PYMEs",
        ideal: combo.ideal.trim(),
        includes: String(combo.includes || "").trim(),
        individual_value: combo.individual_value.trim(),
        combo_price: combo.combo_price.trim(),
        note: combo.note.trim(),
        deliverables: String(combo.deliverables || "").trim(),
        timeline: combo.timeline.trim(),
        not_included: String(combo.not_included || "").trim(),
        market_note: String(combo.market_note || "").trim(),
        order_index: Number(combo.order_index) || 0,
        active: Boolean(combo.active),
      },
      "Combo actualizado correctamente.",
      `combo-save-${combo.id}`
    );
  };

  const removeCombo = async (combo: ServiceCombo) => {
    const confirmed = window.confirm(`Eliminar combo "${combo.title}"? Esta accion no borra otros datos.`);
    if (!confirmed) return;
    await deleteResource(
      `${BACKEND_URL}/api/services-page/combos/${combo.id}`,
      "Combo eliminado correctamente.",
      `combo-delete-${combo.id}`
    );
  };

  const startEditCombo = (combo: ServiceCombo) => {
    setEditingComboId(combo.id);
    setComboEditForm({
      ...combo,
      includes: formatListFieldForForm(combo.includes),
      deliverables: formatListFieldForForm(combo.deliverables),
      not_included: formatListFieldForForm(combo.not_included),
    });
  };

  const cancelEditCombo = () => {
    setEditingComboId(null);
    setComboEditForm(null);
  };

  const saveEditingCombo = async () => {
    if (!comboEditForm) return;
    const ok = await saveCombo(comboEditForm);
    if (ok) {
      setEditingComboId(null);
      setComboEditForm(null);
    }
  };

  const seedDefaultCombos = async () => {
    try {
      setSavingKey("combo-seed");
      setError("");
      setNotice("");

      const existingTitles = new Set(combos.map((item) => item.title.trim().toLowerCase()));
      const missing = DEFAULT_COMBO_SEED.filter((item) => !existingTitles.has(item.title.trim().toLowerCase()));

      if (!missing.length) {
        setNotice("Los combos base ya existen en BD.");
        return;
      }

      for (const payload of missing) {
        const res = await adminFetch(`${BACKEND_URL}/api/services-page/combos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorPayload = await res.json().catch(() => ({}));
          throw new Error(errorPayload?.detail || "No se pudieron cargar los combos base.");
        }
      }

      setNotice(`Se cargaron ${missing.length} combos base.`);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los combos base.");
    } finally {
      setSavingKey("");
    }
  };

  const createComboDiagnosticCard = async () => {
    if (
      !comboDiagnosticForm.badge.trim() ||
      !comboDiagnosticForm.title.trim() ||
      !comboDiagnosticForm.description.trim() ||
      !comboDiagnosticForm.recommendations_text.trim() ||
      !comboDiagnosticForm.cta_text.trim() ||
      !comboDiagnosticForm.cta_href.trim()
    ) {
      setError("Diagnostico: badge, titulo, descripcion, recomendacion y CTA son obligatorios.");
      return;
    }

    const ok = await postResource(
      `${BACKEND_URL}/api/services-page/combo-diagnostic-cards`,
      {
        ...comboDiagnosticForm,
        badge: comboDiagnosticForm.badge.trim(),
        title: comboDiagnosticForm.title.trim(),
        description: comboDiagnosticForm.description.trim(),
        needs_label: comboDiagnosticForm.needs_label.trim(),
        needs: comboDiagnosticForm.needs.trim(),
        recommendations_label: comboDiagnosticForm.recommendations_label.trim(),
        recommendations_text: comboDiagnosticForm.recommendations_text.trim(),
        cta_text: comboDiagnosticForm.cta_text.trim(),
        cta_href: comboDiagnosticForm.cta_href.trim(),
        theme: comboDiagnosticForm.theme.trim(),
        order_index: getNextOrderIndex(comboDiagnosticCards),
      },
      "Tarjeta diagnostica creada correctamente.",
      "combo-diagnostic"
    );

    if (ok) setComboDiagnosticForm(EMPTY_DIAGNOSTIC_CARD);
  };

  const saveComboDiagnosticCard = async (card: ComboDiagnosticCard) => {
    if (
      !card.badge.trim() ||
      !card.title.trim() ||
      !card.description.trim() ||
      !card.recommendations_text.trim() ||
      !card.cta_text.trim() ||
      !card.cta_href.trim()
    ) {
      setError("Diagnostico: badge, titulo, descripcion, recomendacion y CTA son obligatorios.");
      return false;
    }

    return await putResource(
      `${BACKEND_URL}/api/services-page/combo-diagnostic-cards/${card.id}`,
      {
        badge: card.badge.trim(),
        title: card.title.trim(),
        description: card.description.trim(),
        needs_label: String(card.needs_label || "").trim(),
        needs: String(card.needs || "").trim(),
        recommendations_label: String(card.recommendations_label || "").trim(),
        recommendations_text: card.recommendations_text.trim(),
        cta_text: card.cta_text.trim(),
        cta_href: card.cta_href.trim(),
        theme: String(card.theme || "").trim(),
        order_index: Number(card.order_index) || 0,
        active: Boolean(card.active),
      },
      "Tarjeta diagnostica actualizada correctamente.",
      `combo-diagnostic-save-${card.id}`
    );
  };

  const removeComboDiagnosticCard = async (card: ComboDiagnosticCard) => {
    const confirmed = window.confirm(`Eliminar tarjeta diagnostica "${card.title}"? Esta accion no borra otros datos.`);
    if (!confirmed) return;
    await deleteResource(
      `${BACKEND_URL}/api/services-page/combo-diagnostic-cards/${card.id}`,
      "Tarjeta diagnostica eliminada correctamente.",
      `combo-diagnostic-delete-${card.id}`
    );
  };

  const startEditComboDiagnosticCard = (card: ComboDiagnosticCard) => {
    setEditingComboDiagnosticId(card.id);
    setComboDiagnosticEditForm({
      ...card,
      needs: formatListFieldForForm(card.needs),
    });
  };

  const cancelEditComboDiagnosticCard = () => {
    setEditingComboDiagnosticId(null);
    setComboDiagnosticEditForm(null);
  };

  const saveEditingComboDiagnosticCard = async () => {
    if (!comboDiagnosticEditForm) return;
    const ok = await saveComboDiagnosticCard(comboDiagnosticEditForm);
    if (ok) {
      setEditingComboDiagnosticId(null);
      setComboDiagnosticEditForm(null);
    }
  };

  const seedDefaultComboDiagnosticCards = async () => {
    try {
      setSavingKey("combo-diagnostic-seed");
      setError("");
      setNotice("");

      const existingTitles = new Set(comboDiagnosticCards.map((item) => item.title.trim().toLowerCase()));
      const missing = DEFAULT_COMBO_DIAGNOSTIC_SEED.filter((item) => !existingTitles.has(item.title.trim().toLowerCase()));

      if (!missing.length) {
        setNotice("Las tarjetas de diagnostico base ya existen en BD.");
        return;
      }

      for (const payload of missing) {
        const res = await adminFetch(`${BACKEND_URL}/api/services-page/combo-diagnostic-cards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorPayload = await res.json().catch(() => ({}));
          throw new Error(errorPayload?.detail || "No se pudieron cargar las tarjetas diagnosticas base.");
        }
      }

      setNotice(`Se cargaron ${missing.length} tarjetas diagnosticas base.`);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las tarjetas diagnosticas base.");
    } finally {
      setSavingKey("");
    }
  };

  const createComboHighlightCard = async () => {
    if (!comboHighlightForm.title.trim() || !comboHighlightForm.description.trim()) {
      setError("Tarjeta premium: titulo y descripcion son obligatorios.");
      return;
    }

    const ok = await postResource(
      `${BACKEND_URL}/api/services-page/combo-highlight-cards`,
      {
        ...comboHighlightForm,
        title: comboHighlightForm.title.trim(),
        description: comboHighlightForm.description.trim(),
        items: comboHighlightForm.items.trim(),
        footer_note: comboHighlightForm.footer_note.trim(),
        theme: comboHighlightForm.theme.trim(),
        order_index: getNextOrderIndex(comboHighlightCards),
      },
      "Tarjeta premium creada correctamente.",
      "combo-highlight"
    );

    if (ok) setComboHighlightForm(EMPTY_HIGHLIGHT_CARD);
  };

  const saveComboHighlightCard = async (card: ComboHighlightCard) => {
    if (!card.title.trim() || !card.description.trim()) {
      setError("Tarjeta premium: titulo y descripcion son obligatorios.");
      return false;
    }

    return await putResource(
      `${BACKEND_URL}/api/services-page/combo-highlight-cards/${card.id}`,
      {
        title: card.title.trim(),
        description: card.description.trim(),
        items: String(card.items || "").trim(),
        footer_note: String(card.footer_note || "").trim(),
        theme: String(card.theme || "").trim(),
        order_index: Number(card.order_index) || 0,
        active: Boolean(card.active),
      },
      "Tarjeta premium actualizada correctamente.",
      `combo-highlight-save-${card.id}`
    );
  };

  const removeComboHighlightCard = async (card: ComboHighlightCard) => {
    const confirmed = window.confirm(`Eliminar tarjeta premium "${card.title}"? Esta accion no borra otros datos.`);
    if (!confirmed) return;
    await deleteResource(
      `${BACKEND_URL}/api/services-page/combo-highlight-cards/${card.id}`,
      "Tarjeta premium eliminada correctamente.",
      `combo-highlight-delete-${card.id}`
    );
  };

  const startEditComboHighlightCard = (card: ComboHighlightCard) => {
    setEditingComboHighlightId(card.id);
    setComboHighlightEditForm({
      ...card,
      items: formatListFieldForForm(card.items),
    });
  };

  const cancelEditComboHighlightCard = () => {
    setEditingComboHighlightId(null);
    setComboHighlightEditForm(null);
  };

  const saveEditingComboHighlightCard = async () => {
    if (!comboHighlightEditForm) return;
    const ok = await saveComboHighlightCard(comboHighlightEditForm);
    if (ok) {
      setEditingComboHighlightId(null);
      setComboHighlightEditForm(null);
    }
  };

  const seedDefaultComboHighlightCards = async () => {
    try {
      setSavingKey("combo-highlight-seed");
      setError("");
      setNotice("");

      const existingTitles = new Set(comboHighlightCards.map((item) => item.title.trim().toLowerCase()));
      const missing = DEFAULT_COMBO_HIGHLIGHT_SEED.filter((item) => !existingTitles.has(item.title.trim().toLowerCase()));

      if (!missing.length) {
        setNotice("Las tarjetas premium base ya existen en BD.");
        return;
      }

      for (const payload of missing) {
        const res = await adminFetch(`${BACKEND_URL}/api/services-page/combo-highlight-cards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorPayload = await res.json().catch(() => ({}));
          throw new Error(errorPayload?.detail || "No se pudieron cargar las tarjetas premium base.");
        }
      }

      setNotice(`Se cargaron ${missing.length} tarjetas premium base.`);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las tarjetas premium base.");
    } finally {
      setSavingKey("");
    }
  };

  const createFaq = async () => {
    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      setError("FAQ: pregunta y respuesta son obligatorias.");
      return;
    }

    const ok = await postResource(
      `${BACKEND_URL}/api/services-page/faqs`,
      {
        ...faqForm,
        question: faqForm.question.trim(),
        answer: faqForm.answer.trim(),
        order: getNextFaqOrder(faqs),
      },
      "FAQ creada correctamente.",
      "faq"
    );

    if (ok) setFaqForm(EMPTY_FAQ);
  };

  const saveFaq = async (faq: Faq) => {
    if (!faq.question.trim() || !faq.answer.trim()) {
      setError("FAQ: pregunta y respuesta son obligatorias.");
      return false;
    }

    return await putResource(
      `${BACKEND_URL}/api/services-page/faqs/${faq.id}`,
      {
        question: faq.question.trim(),
        answer: faq.answer.trim(),
        category: String(faq.category || "General").trim() || "General",
        order: Number(faq.order) || 0,
        active: Boolean(faq.active),
      },
      "FAQ actualizada correctamente.",
      `faq-save-${faq.id}`
    );
  };

  const removeFaq = async (faq: Faq) => {
    const confirmed = window.confirm(`Eliminar FAQ "${faq.question}"? Esta accion no borra otros datos.`);
    if (!confirmed) return;
    await deleteResource(
      `${BACKEND_URL}/api/services-page/faqs/${faq.id}`,
      "FAQ eliminada correctamente.",
      `faq-delete-${faq.id}`
    );
  };

  const startEditFaq = (faq: Faq) => {
    setEditingFaqId(faq.id);
    setFaqEditForm({ ...faq });
  };

  const cancelEditFaq = () => {
    setEditingFaqId(null);
    setFaqEditForm(null);
  };

  const saveEditingFaq = async () => {
    if (!faqEditForm) return;
    const ok = await saveFaq(faqEditForm);
    if (ok) {
      setEditingFaqId(null);
      setFaqEditForm(null);
    }
  };

  const createAdvisory = async () => {
    if (!advisoryForm.title.trim() || !advisoryForm.price.trim() || !advisoryForm.result.trim()) {
      setError("Asesoria: titulo, precio y resultado son obligatorios.");
      return;
    }

    const ok = await postResource(
      `${BACKEND_URL}/api/services-page/advisory-services`,
      {
        ...advisoryForm,
        title: advisoryForm.title.trim(),
        price: advisoryForm.price.trim(),
        duration: advisoryForm.duration.trim(),
        audience: advisoryForm.audience.trim(),
        includes: advisoryForm.includes.trim(),
        result: advisoryForm.result.trim(),
        market_note: advisoryForm.market_note.trim(),
        icon: advisoryForm.icon.trim(),
        order_index: getNextOrderIndex(advisoryCards),
      },
      "Asesoria creada correctamente.",
      "advisory"
    );

    if (ok) setAdvisoryForm(EMPTY_ADVISORY);
  };

  const saveAdvisory = async (card: AdvisoryServiceCard) => {
    if (!card.title.trim() || !card.price.trim() || !card.result.trim()) {
      setError("Asesoria: titulo, precio y resultado son obligatorios.");
      return false;
    }

    return await putResource(
      `${BACKEND_URL}/api/services-page/advisory-services/${card.id}`,
      {
        title: card.title.trim(),
        price: card.price.trim(),
        duration: String(card.duration || "").trim(),
        audience: String(card.audience || "").trim(),
        includes: String(card.includes || "").trim(),
        result: card.result.trim(),
        market_note: String(card.market_note || "").trim(),
        icon: String(card.icon || "").trim(),
        order_index: Number(card.order_index) || 0,
        active: Boolean(card.active),
      },
      "Asesoria actualizada correctamente.",
      `advisory-save-${card.id}`
    );
  };

  const removeAdvisory = async (card: AdvisoryServiceCard) => {
    const confirmed = window.confirm(`Eliminar asesoria "${card.title}"? Esta accion no borra otros datos.`);
    if (!confirmed) return;
    await deleteResource(
      `${BACKEND_URL}/api/services-page/advisory-services/${card.id}`,
      "Asesoria eliminada correctamente.",
      `advisory-delete-${card.id}`
    );
  };

  const startEditAdvisory = (card: AdvisoryServiceCard) => {
    setEditingAdvisoryId(card.id);
    setAdvisoryEditForm({ ...card });
  };

  const cancelEditAdvisory = () => {
    setEditingAdvisoryId(null);
    setAdvisoryEditForm(null);
  };

  const saveEditingAdvisory = async () => {
    if (!advisoryEditForm) return;
    const ok = await saveAdvisory(advisoryEditForm);
    if (ok) {
      setEditingAdvisoryId(null);
      setAdvisoryEditForm(null);
    }
  };

  const seedDefaultAdvisories = async () => {
    try {
      setSavingKey("advisory-seed");
      setError("");
      setNotice("");

      const existingTitles = new Set(advisoryCards.map((item) => item.title.trim().toLowerCase()));
      const missing = DEFAULT_ADVISORY_SEED.filter((item) => !existingTitles.has(item.title.trim().toLowerCase()));

      if (!missing.length) {
        setNotice("Las 6 tarjetas base ya existen en BD.");
        return;
      }

      for (const payload of missing) {
        const res = await adminFetch(`${BACKEND_URL}/api/services-page/advisory-services`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorPayload = await res.json().catch(() => ({}));
          throw new Error(errorPayload?.detail || "No se pudieron cargar las tarjetas base.");
        }
      }

      setNotice(`Se cargaron ${missing.length} tarjetas base de asesoria.`);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las tarjetas base.");
    } finally {
      setSavingKey("");
    }
  };

  const createIndustry = async () => {
    if (!industryForm.name.trim() || !industryForm.description.trim()) {
      setError("Industria: nombre y descripcion son obligatorios.");
      return;
    }

    const ok = await postResource(
      `${BACKEND_URL}/api/services-page/industries`,
      {
        ...industryForm,
        name: industryForm.name.trim(),
        description: industryForm.description.trim(),
        order_index: getNextOrderIndex(industries),
      },
      "Industria creada correctamente.",
      "industry"
    );

    if (ok) setIndustryForm(EMPTY_INDUSTRY);
  };

  const saveIndustry = async (industry: Industry) => {
    if (!industry.name.trim() || !industry.description.trim()) {
      setError("Industria: nombre y descripcion son obligatorios.");
      return false;
    }

    return await putResource(
      `${BACKEND_URL}/api/services-page/industries/${industry.id}`,
      {
        name: industry.name.trim(),
        description: industry.description.trim(),
        icon: String(industry.icon || "").trim(),
        examples: String(industry.examples || "").trim(),
        order_index: Number(industry.order_index) || 0,
        active: Boolean(industry.active),
      },
      "Industria actualizada correctamente.",
      `industry-save-${industry.id}`
    );
  };

  const removeIndustry = async (industry: Industry) => {
    const confirmed = window.confirm(`Eliminar industria "${industry.name}"? Esta accion no borra otros datos.`);
    if (!confirmed) return;
    await deleteResource(
      `${BACKEND_URL}/api/services-page/industries/${industry.id}`,
      "Industria eliminada correctamente.",
      `industry-delete-${industry.id}`
    );
  };

  const startEditIndustry = (industry: Industry) => {
    setEditingIndustryId(industry.id);
    setIndustryEditForm({
      ...industry,
      examples: formatListFieldForForm(industry.examples),
    });
  };

  const cancelEditIndustry = () => {
    setEditingIndustryId(null);
    setIndustryEditForm(null);
  };

  const saveEditingIndustry = async () => {
    if (!industryEditForm) return;
    const ok = await saveIndustry(industryEditForm);
    if (ok) {
      setEditingIndustryId(null);
      setIndustryEditForm(null);
    }
  };

  const seedDefaultIndustries = async () => {
    try {
      setSavingKey("industry-seed");
      setError("");
      setNotice("");

      const existingNames = new Set(industries.map((item) => item.name.trim().toLowerCase()));
      const missing = DEFAULT_INDUSTRY_SEED.filter((item) => !existingNames.has(item.name.trim().toLowerCase()));

      if (!missing.length) {
        setNotice("Las industrias base ya existen en BD.");
        return;
      }

      for (const payload of missing) {
        const res = await adminFetch(`${BACKEND_URL}/api/services-page/industries`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorPayload = await res.json().catch(() => ({}));
          throw new Error(errorPayload?.detail || "No se pudieron cargar las industrias base.");
        }
      }

      setNotice(`Se cargaron ${missing.length} industrias base.`);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las industrias base.");
    } finally {
      setSavingKey("");
    }
  };

  const createMarqueeCard = async () => {
    if (!marqueeForm.title.trim() || !marqueeForm.image_url.trim()) {
      setError("Marquee: titulo e imagen son obligatorios.");
      return;
    }

    const ok = await postResource(
      `${BACKEND_URL}/api/services-page/marquee-cards`,
      {
        title: marqueeForm.title.trim(),
        image_url: marqueeForm.image_url.trim(),
        order_index: getNextOrderIndex(marqueeCards),
        active: Boolean(marqueeForm.active),
      },
      "Tarjeta marquee creada correctamente.",
      "marquee"
    );

    if (ok) setMarqueeForm(EMPTY_MARQUEE_CARD);
  };

  const saveMarqueeCard = async (card: ServiceMarqueeCard) => {
    if (!card.title.trim() || !card.image_url.trim()) {
      setError("Marquee: titulo e imagen son obligatorios.");
      return false;
    }

    return await putResource(
      `${BACKEND_URL}/api/services-page/marquee-cards/${card.id}`,
      {
        title: card.title.trim(),
        image_url: card.image_url.trim(),
        order_index: Number(card.order_index) || 0,
        active: Boolean(card.active),
      },
      "Tarjeta marquee actualizada correctamente.",
      `marquee-save-${card.id}`
    );
  };

  const removeMarqueeCard = async (card: ServiceMarqueeCard) => {
    const confirmed = window.confirm(`Eliminar tarjeta marquee "${card.title}"? Esta accion no borra otros datos.`);
    if (!confirmed) return;
    await deleteResource(
      `${BACKEND_URL}/api/services-page/marquee-cards/${card.id}`,
      "Tarjeta marquee eliminada correctamente.",
      `marquee-delete-${card.id}`
    );
  };

  const startEditMarqueeCard = (card: ServiceMarqueeCard) => {
    setEditingMarqueeId(card.id);
    setMarqueeEditForm({ ...card });
  };

  const cancelEditMarqueeCard = () => {
    setEditingMarqueeId(null);
    setMarqueeEditForm(null);
  };

  const saveEditingMarqueeCard = async () => {
    if (!marqueeEditForm) return;
    const ok = await saveMarqueeCard(marqueeEditForm);
    if (ok) {
      setEditingMarqueeId(null);
      setMarqueeEditForm(null);
    }
  };

  const seedDefaultMarqueeCards = async () => {
    try {
      setSavingKey("marquee-seed");
      setError("");
      setNotice("");

      const existingTitles = new Set(marqueeCards.map((item) => item.title.trim().toLowerCase()));
      const missing = DEFAULT_MARQUEE_SEED.filter((item) => !existingTitles.has(item.title.trim().toLowerCase()));

      if (!missing.length) {
        setNotice("Las tarjetas marquee base ya existen en BD.");
        return;
      }

      for (const payload of missing) {
        const res = await adminFetch(`${BACKEND_URL}/api/services-page/marquee-cards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorPayload = await res.json().catch(() => ({}));
          throw new Error(errorPayload?.detail || "No se pudieron cargar las tarjetas marquee base.");
        }
      }

      setNotice(`Se cargaron ${missing.length} tarjetas marquee base.`);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las tarjetas marquee base.");
    } finally {
      setSavingKey("");
    }
  };

  const normalizeCollectionOrderIndex = async (
    items: Array<{ id: number; order_index?: number | null }>,
    endpoint: string
  ): Promise<number> => {
    const sortedItems = [...items].sort((a, b) => {
      const orderA = Number(a.order_index);
      const orderB = Number(b.order_index);
      const normalizedA = Number.isFinite(orderA) ? orderA : Number.MAX_SAFE_INTEGER;
      const normalizedB = Number.isFinite(orderB) ? orderB : Number.MAX_SAFE_INTEGER;
      if (normalizedA !== normalizedB) return normalizedA - normalizedB;
      return (Number(a.id) || 0) - (Number(b.id) || 0);
    });

    const changes = sortedItems
      .map((item, index) => ({ item, nextOrder: index }))
      .filter(({ item, nextOrder }) => (Number(item.order_index) || 0) !== nextOrder);

    for (const { item, nextOrder } of changes) {
      const res = await adminFetch(`${endpoint}/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_index: nextOrder }),
      });

      if (!res.ok) {
        const errorPayload = await res.json().catch(() => ({}));
        throw new Error(errorPayload?.detail || `No se pudo actualizar el orden del registro ${item.id}.`);
      }
    }

    return changes.length;
  };

  const normalizeFaqOrder = async (): Promise<number> => {
    const sortedFaqs = [...faqs].sort((a, b) => {
      const orderA = Number(a.order);
      const orderB = Number(b.order);
      const normalizedA = Number.isFinite(orderA) ? orderA : Number.MAX_SAFE_INTEGER;
      const normalizedB = Number.isFinite(orderB) ? orderB : Number.MAX_SAFE_INTEGER;
      if (normalizedA !== normalizedB) return normalizedA - normalizedB;
      return (Number(a.id) || 0) - (Number(b.id) || 0);
    });

    const changes = sortedFaqs
      .map((item, index) => ({ item, nextOrder: index }))
      .filter(({ item, nextOrder }) => (Number(item.order) || 0) !== nextOrder);

    for (const { item, nextOrder } of changes) {
      const res = await adminFetch(`${BACKEND_URL}/api/services-page/faqs/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: nextOrder }),
      });

      if (!res.ok) {
        const errorPayload = await res.json().catch(() => ({}));
        throw new Error(errorPayload?.detail || `No se pudo actualizar el orden de la FAQ ${item.id}.`);
      }
    }

    return changes.length;
  };

  const reorderAllServiceOrders = async () => {
    try {
      setSavingKey("services-reindex");
      setError("");
      setNotice("");

      const totalRecords =
        plans.length +
        combos.length +
        comboDiagnosticCards.length +
        comboHighlightCards.length +
        advisoryCards.length +
        faqs.length +
        industries.length +
        marqueeCards.length;

      if (!totalRecords) {
        setNotice("No hay registros de servicios para reordenar.");
        return;
      }

      const changesBySection = {
        plans: await normalizeCollectionOrderIndex(plans, `${BACKEND_URL}/api/services-page/plans`),
        combos: await normalizeCollectionOrderIndex(combos, `${BACKEND_URL}/api/services-page/combos`),
        diagnostic: await normalizeCollectionOrderIndex(
          comboDiagnosticCards,
          `${BACKEND_URL}/api/services-page/combo-diagnostic-cards`
        ),
        highlights: await normalizeCollectionOrderIndex(
          comboHighlightCards,
          `${BACKEND_URL}/api/services-page/combo-highlight-cards`
        ),
        advisories: await normalizeCollectionOrderIndex(
          advisoryCards,
          `${BACKEND_URL}/api/services-page/advisory-services`
        ),
        faqs: await normalizeFaqOrder(),
        industries: await normalizeCollectionOrderIndex(industries, `${BACKEND_URL}/api/services-page/industries`),
        marquee: await normalizeCollectionOrderIndex(marqueeCards, `${BACKEND_URL}/api/services-page/marquee-cards`),
      };

      const totalChanges = Object.values(changesBySection).reduce((sum, count) => sum + count, 0);
      if (!totalChanges) {
        setNotice("Todo servicios ya estaba ordenado en secuencia automatica.");
        return;
      }

      setNotice(
        `Orden automatico aplicado: ${totalChanges} cambio(s). Planes ${changesBySection.plans}, Combos ${changesBySection.combos}, Diagnostico ${changesBySection.diagnostic}, Premium ${changesBySection.highlights}, Asesorias ${changesBySection.advisories}, FAQ ${changesBySection.faqs}, Industrias ${changesBySection.industries}, Marquee ${changesBySection.marquee}.`
      );
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo reordenar todos los modulos de servicios.");
    } finally {
      setSavingKey("");
    }
  };

  const reorderMarqueeSequentially = async () => {
    try {
      setSavingKey("marquee-reindex");
      setError("");
      setNotice("");

      if (!marqueeCards.length) {
        setNotice("No hay tarjetas marquee para reordenar.");
        return;
      }

      const changes = await normalizeCollectionOrderIndex(
        marqueeCards,
        `${BACKEND_URL}/api/services-page/marquee-cards`
      );

      if (!changes) {
        setNotice("El orden de marquee ya esta secuencial.");
        return;
      }

      setNotice(`Orden marquee normalizado: ${changes} tarjeta(s) actualizadas.`);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo reordenar el carrusel marquee.");
    } finally {
      setSavingKey("");
    }
  };

  const handleUploadMarqueeMedia = async (file: File, target: "create" | "edit") => {
    const isAllowed = file.type.startsWith("image/") || file.type.startsWith("video/");
    if (!isAllowed) {
      setError("Solo se permiten imagenes o videos para el carrusel marquee.");
      return;
    }

    try {
      setMarqueeUploadingTarget(target);
      setError("");
      setNotice("");

      const formData = new FormData();
      formData.append("file", file);

      const res = await adminFetch(`${BACKEND_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorPayload = await res.json().catch(() => ({}));
        throw new Error(errorPayload?.detail || "No se pudo subir el archivo multimedia.");
      }

      const payload = await res.json();
      const uploadedUrl = String(payload?.url || "").trim();
      if (!uploadedUrl) throw new Error("El servidor no devolvio una URL valida del archivo.");
      const uploadedType = normalizeMediaType(String(payload?.resource_type || ""), uploadedUrl);

      // Guardar tambien en tabla Media (BD) para que aparezca en la biblioteca global.
      try {
        const mediaListRes = await adminFetch(`${BACKEND_URL}/api/media`);
        const mediaList = mediaListRes.ok ? await mediaListRes.json() : [];
        const existsInLibrary =
          Array.isArray(mediaList) &&
          mediaList.some((item: MediaLibraryItem) => String(item?.url || "").trim() === uploadedUrl);

        if (!existsInLibrary) {
          await adminFetch(`${BACKEND_URL}/api/media`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: fileNameToTitle(file.name) || "Marquee Asset",
              description: "Asset cargado desde Servicios Admin (Marquee).",
              type: uploadedType,
              url: uploadedUrl,
              order_index: 0,
              active: true,
            }),
          });
        }
      } catch {
        // No bloquea el flujo principal de subida marquee.
      }

      if (target === "create") {
        setMarqueeForm((prev) => ({
          ...prev,
          image_url: uploadedUrl,
          title: prev.title.trim() ? prev.title : fileNameToTitle(file.name),
        }));
      } else {
        setMarqueeEditForm((prev) =>
          prev
            ? {
                ...prev,
                image_url: uploadedUrl,
                title: prev.title.trim() ? prev.title : fileNameToTitle(file.name),
              }
            : prev
        );
      }

      setNotice("Archivo multimedia cargado correctamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir el archivo multimedia.");
    } finally {
      setMarqueeUploadingTarget(null);
    }
  };

  const onMarqueeCreateFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    await handleUploadMarqueeMedia(file, "create");
  };

  const onMarqueeEditFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    await handleUploadMarqueeMedia(file, "edit");
  };

  const openMediaLibraryForMarquee = async (target: "create" | "edit") => {
    setMediaLibraryOpen(true);
    setMediaLibraryTarget(target);
    setMediaLibraryError("");
    setMediaLibraryLoading(true);

    try {
      const [cloudinaryRes, mediaRes] = await Promise.all([
        adminFetch(`${BACKEND_URL}/api/upload/library?limit=500`),
        adminFetch(`${BACKEND_URL}/api/media`),
      ]);

      const cloudinaryData: CloudinaryLibraryResponse = cloudinaryRes.ok
        ? await cloudinaryRes.json().catch(() => ({}))
        : {};
      const cloudinaryItemsRaw = Array.isArray(cloudinaryData?.items) ? cloudinaryData.items : [];
      const cloudinaryItems: MediaLibraryItem[] = cloudinaryItemsRaw
        .map((item) => {
          const url = String(item?.url || "").trim();
          if (!url) return null;
          const publicId = String(item?.public_id || "").trim();
          const publicIdName = publicId ? publicId.split("/").pop() || publicId : "";
          return {
            asset_id: item?.asset_id || null,
            public_id: publicId || null,
            title: fileNameToTitle(publicIdName || "Archivo Cloudinary"),
            description: "[cloudinary]",
            type: String(item?.resource_type || "").trim() || normalizeMediaType(null, url),
            url,
            created_at: item?.created_at || null,
            source: "cloudinary",
            active: true,
          } as MediaLibraryItem;
        })
        .filter((item): item is MediaLibraryItem => Boolean(item));

      const mediaData = mediaRes.ok ? await mediaRes.json().catch(() => []) : [];
      const mediaItemsFromDb: MediaLibraryItem[] = Array.isArray(mediaData)
        ? (mediaData as MediaLibraryItem[]).map((item) => ({
            ...item,
            source: "db",
          }))
        : [];

      if (!cloudinaryRes.ok && !mediaRes.ok) {
        throw new Error("No se pudo cargar la biblioteca multimedia desde Cloudinary ni desde BD.");
      }

      const mergedByUrl = new Map<string, MediaLibraryItem>();
      for (const item of [...cloudinaryItems, ...mediaItemsFromDb]) {
        const url = String(item?.url || "").trim();
        if (!url) continue;

        const prev = mergedByUrl.get(url);
        if (!prev) {
          mergedByUrl.set(url, item);
          continue;
        }

        mergedByUrl.set(url, {
          ...prev,
          ...item,
          id: item.id ?? prev.id,
          asset_id: item.asset_id ?? prev.asset_id,
          public_id: item.public_id ?? prev.public_id,
          title: (item.title && String(item.title).trim()) ? item.title : prev.title,
          description: (item.description && String(item.description).trim()) ? item.description : prev.description,
          type: (item.type && String(item.type).trim()) ? item.type : prev.type,
          created_at: item.created_at || prev.created_at,
          source: item.source || prev.source,
          order_index: item.order_index ?? prev.order_index,
          active: item.active ?? prev.active,
        });
      }

      const safeTime = (value?: string | null) => {
        const ts = Date.parse(String(value || ""));
        return Number.isFinite(ts) ? ts : 0;
      };

      const items = Array.from(mergedByUrl.values())
        .filter((item) => String(item?.url || "").trim())
        .sort((a, b) => {
          const byDate = safeTime(b.created_at) - safeTime(a.created_at);
          if (byDate !== 0) return byDate;
          return (a.order_index || 0) - (b.order_index || 0);
        });

      setMediaLibraryItems(items);
    } catch (err) {
      setMediaLibraryItems([]);
      setMediaLibraryError(err instanceof Error ? err.message : "No se pudo cargar la biblioteca multimedia.");
    } finally {
      setMediaLibraryLoading(false);
    }
  };

  const applyMediaLibraryItemToMarquee = (item: MediaLibraryItem) => {
    const selectedUrl = String(item.url || "").trim();
    if (!selectedUrl) return;

    if (mediaLibraryTarget === "create") {
      setMarqueeForm((prev) => ({
        ...prev,
        image_url: selectedUrl,
        title: prev.title.trim() ? prev.title : String(item.title || "").trim(),
      }));
    } else {
      setMarqueeEditForm((prev) =>
        prev
          ? {
              ...prev,
              image_url: selectedUrl,
              title: prev.title.trim() ? prev.title : String(item.title || "").trim(),
            }
          : prev
      );
    }

    setMediaLibraryOpen(false);
  };

  return (
    <div className="max-w-[1400px] mx-auto p-8 space-y-6">
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#070b14]/70 backdrop-blur-2xl p-8 md:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.5)] group">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8 z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Sistemas de Administración
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none">
              Servicios <span className="text-blue-500">Admin</span>
            </h2>
            <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
              Consola estratégica para la gestión de arquitectura de servicios, planes corporativos y métricas de mercado en tiempo real.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadAll}
              disabled={savingKey === "services-reindex"}
              className="group/btn px-8 py-4 text-[11px] font-black uppercase tracking-[0.25em] bg-white text-black hover:bg-blue-500 hover:text-white transition-all rounded-full flex items-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:shadow-blue-500/20 overflow-hidden disabled:opacity-60"
            >
              <FaRedo className="group-hover/btn:rotate-180 transition-transform duration-500" />
              Sincronizar Datos
            </button>
            <button
              onClick={reorderAllServiceOrders}
              disabled={savingKey === "services-reindex"}
              className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] bg-blue-600/10 border border-blue-500/30 text-blue-200 hover:bg-blue-600 hover:text-white transition-all rounded-full flex items-center gap-3 disabled:opacity-50"
            >
              {savingKey === "services-reindex" ? <FaRedo className="animate-spin" /> : <FaLayerGroup />}
              {savingKey === "services-reindex" ? "Reordenando..." : "Reordenar Todo"}
            </button>
          </div>
        </div>

        <div className="relative grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mt-12 z-10">
          <StatCard title="Planes" value={plans.length} color="blue" />
          <StatCard title="Adicionales" value={services.length} color="emerald" />
          <StatCard title="Combos" value={combos.length} color="violet" />
          <StatCard title="FAQs" value={faqs.length} color="violet" />
          <StatCard title="Asesorías" value={advisoryCards.length} color="emerald" />
          <StatCard title="Industrias" value={industries.length} color="blue" />
          <StatCard title="Marquee" value={marqueeCards.length} color="blue" />
          <StatCard title="Reviews" value={pendingServiceReviews} color="amber" />
        </div>
      </section>

      {error && (
        <section className="border border-red-500/30 bg-red-500/10 p-4 text-red-300 font-bold">
          {error}
        </section>
      )}
      {notice && (
        <section className="border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300 font-bold">
          {notice}
        </section>
      )}

      {loading ? (
        <section className="border border-white/10 bg-[#070b14]/70 p-8 text-white/70">
          Cargando datos de servicios...
        </section>
      ) : (
        <div className="space-y-6">
          <div className="sticky top-3 z-20 flex justify-end">
            <button
              onClick={reorderAllServiceOrders}
              disabled={savingKey === "services-reindex"}
              className="px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] bg-blue-600/20 border border-blue-500/40 text-blue-100 hover:bg-blue-600 hover:text-white transition-all rounded-xl shadow-lg shadow-blue-500/10 disabled:opacity-50 flex items-center gap-2"
            >
              {savingKey === "services-reindex" ? <FaRedo className="animate-spin" /> : <FaLayerGroup />}
              {savingKey === "services-reindex" ? "Reordenando servicios..." : "Reordenar todo servicios"}
            </button>
          </div>
          <CrudPanel title="Planes Profesionales" icon={<FaListAlt />} subtitle="Gestión de arquitectura de precios y paquetes">
            <CollapsibleForm title="Añadir nuevo plan de servicio">
              <div className="grid md:grid-cols-3 gap-5">
                <Input label="Nombre del Plan" value={planForm.name} onChange={(v) => setPlanForm((p) => ({ ...p, name: v }))} />
                <Input label="Precio Unitario" value={planForm.price} onChange={(v) => setPlanForm((p) => ({ ...p, price: v }))} />
                <Input label="Categoría" value={planForm.category} onChange={(v) => setPlanForm((p) => ({ ...p, category: v }))} />
                <Input label="Módulos Incluidos" value={planForm.modules} onChange={(v) => setPlanForm((p) => ({ ...p, modules: v }))} />
                <AutoOrderField label="Orden en Vista (Automatico)" value={getNextOrderIndex(plans)} hint="Se asigna al publicar" />
              </div>
              <div className="grid md:grid-cols-3 gap-5">
                <TextArea label="Incluye (un ítem por línea)" value={planForm.includes} onChange={(v) => setPlanForm((p) => ({ ...p, includes: v }))} />
                <TextArea label="Detalles de Entrega" value={planForm.delivery} onChange={(v) => setPlanForm((p) => ({ ...p, delivery: v }))} />
                <TextArea label="Audiencia Ideal" value={planForm.ideal_for} onChange={(v) => setPlanForm((p) => ({ ...p, ideal_for: v }))} />
              </div>
              <TextArea label="Descripción Estratégica" value={planForm.description} onChange={(v) => setPlanForm((p) => ({ ...p, description: v }))} />
              <div className="flex flex-wrap gap-3 pt-2">
                <ActionButton loading={savingKey === "plan"} onClick={createPlan} text="Publicar nuevo plan" />
                <button
                  onClick={seedDefaultPlans}
                  disabled={savingKey === "plan-seed"}
                  className="px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  {savingKey === "plan-seed" ? "Cargando..." : "Restaurar planes básicos"}
                </button>
              </div>
            </CollapsibleForm>

            {!plans.length ? (
              <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl">
                <p className="text-white/40 text-sm">No hay planes registrados en la base de datos.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {plans.map((plan) => (
                  <article key={plan.id} className="group relative flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl border border-white/5 bg-[#0d121f]/60 backdrop-blur-sm hover:border-white/20 hover:bg-[#141a2b] transition-all duration-500 shadow-xl overflow-hidden">
                    {/* Left Side: Visual Anchor */}
                    <div className="hidden md:flex w-24 h-24 rounded-2xl bg-blue-500/10 border border-blue-500/20 items-center justify-center text-blue-400 group-hover:scale-110 transition-transform duration-500">
                      <FaLayerGroup size={32} />
                    </div>

                    {/* Main Info Area */}
                    <div className="flex-1 min-w-0 w-full space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400/80 bg-cyan-400/5 px-2 py-0.5 rounded border border-cyan-400/10">
                          {plan.category || "General"}
                        </span>
                        <span className="text-[9px] text-white/20 font-mono">#ID:{plan.id}</span>
                      </div>
                      <h3 className="text-xl font-black text-white group-hover:text-cyan-200 transition-colors uppercase leading-tight line-clamp-1">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-white/40 font-medium line-clamp-2 max-w-2xl leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    {/* Pricing / Meta details */}
                    <div className="hidden lg:block text-right px-8 border-x border-white/5">
                      <p className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors leading-none">{plan.price}</p>
                      <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-black mt-2">Orden Hierárquico: {plan.order_index ?? 0}</p>
                    </div>

                    {/* Right Side: Primary Actions */}
                    <div className="flex md:flex-col lg:flex-row items-center gap-3 w-full md:w-auto">
                      <button 
                        onClick={() => startEditPlan(plan)} 
                        className="flex-1 md:w-full lg:w-32 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl border border-blue-500/20 transition-all flex items-center justify-center gap-2 group/btn"
                      >
                        <FaEdit className="group-hover/btn:rotate-12 transition-transform" /> Editar
                      </button>
                      <button 
                        onClick={() => removePlan(plan)} 
                        disabled={savingKey === `plan-delete-${plan.id}`} 
                        className="p-3 text-[10px] bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CrudPanel>

          <CrudPanel title="Servicios Adicionales" icon={<FaTools />} subtitle="Catálogo de soluciones técnicas complementarias de alto nivel">
            <CollapsibleForm title="Nueva extensión de servicio corporativo">
              <div className="grid md:grid-cols-2 gap-5">
                <Input label="Nombre del Servicio" value={serviceForm.name} onChange={(v) => setServiceForm((s) => ({ ...s, name: v }))} />
                <Input label="Precio / Valor" value={serviceForm.price} onChange={(v) => setServiceForm((s) => ({ ...s, price: v }))} />
                <Input label="Referencia de Icono" value={serviceForm.icon} onChange={(v) => setServiceForm((s) => ({ ...s, icon: v }))} />
                <Input label="Tipo de Transacción" value={serviceForm.payment_type} onChange={(v) => setServiceForm((s) => ({ ...s, payment_type: v }))} />
              </div>
              <TextArea label="Alcance del Servicio (un ítem por línea)" value={serviceForm.includes} onChange={(v) => setServiceForm((s) => ({ ...s, includes: v }))} />
              <TextArea label="Propuesta de Valor (Descripción)" value={serviceForm.description} onChange={(v) => setServiceForm((s) => ({ ...s, description: v }))} />
              <div className="flex flex-wrap gap-3 pt-2">
                <ActionButton loading={savingKey === "service"} onClick={createService} text="Publicar servicio adicional" />
                <button
                  onClick={seedDefaultAdditionalServices}
                  disabled={savingKey === "service-seed"}
                  className="px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  {savingKey === "service-seed" ? "Cargando..." : "Cargar catálogo base"}
                </button>
              </div>
            </CollapsibleForm>

            {!services.length ? (
              <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl">
                <p className="text-white/40 text-sm">No hay servicios adicionales registrados.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {services.map((service) => (
                  <article key={service.id} className="group relative flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl border border-white/5 bg-[#0d121f]/60 backdrop-blur-sm hover:border-white/20 hover:bg-[#141a2b] transition-all duration-500 shadow-xl overflow-hidden">
                    {/* Left Side: Visual Anchor */}
                    <div className="hidden md:flex w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-500">
                      <FaTools size={24} />
                    </div>

                    {/* Main Info Area */}
                    <div className="flex-1 min-w-0 w-full space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-cyan-400/80 font-black uppercase tracking-widest">{service.price} {service.payment_type ? `· ${service.payment_type}` : ""}</span>
                        <span className="text-[9px] text-white/20 font-mono">#ID:{service.id}</span>
                      </div>
                      <h3 className="text-lg font-black text-white group-hover:text-cyan-200 transition-colors uppercase leading-tight line-clamp-1">
                        {service.name}
                      </h3>
                      <p className="text-[11px] text-white/40 font-medium line-clamp-1 max-w-xl leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    {/* Right Side: Primary Actions */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <button 
                        onClick={() => startEditService(service)} 
                        className="flex-1 md:w-32 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg border border-blue-500/20 transition-all flex items-center justify-center gap-2 group/btn"
                      >
                        <FaEdit className="group-hover/btn:rotate-12 transition-transform" /> Editar
                      </button>
                      <button 
                        onClick={() => removeService(service)} 
                        disabled={savingKey === `service-delete-${service.id}`} 
                        className="p-2.5 text-[10px] bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-lg border border-red-500/20 transition-all"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CrudPanel>

          <CrudPanel title="Asesorías Estratégicas" icon={<FaLayerGroup />} subtitle="Catálogo de consultoría experta de alto impacto para negocios digitales">
            <CollapsibleForm title="Nueva tarjeta de asesoría de alto valor">
              <div className="grid md:grid-cols-3 gap-5">
                <Input label="Título de Asesoría" value={advisoryForm.title} onChange={(v) => setAdvisoryForm((a) => ({ ...a, title: v }))} />
                <Input label="Precio / Sesión" value={advisoryForm.price} onChange={(v) => setAdvisoryForm((a) => ({ ...a, price: v }))} />
                <Input label="Duración Estimada" value={advisoryForm.duration} onChange={(v) => setAdvisoryForm((a) => ({ ...a, duration: v }))} />
                <Input label="Icon Reference" value={advisoryForm.icon} onChange={(v) => setAdvisoryForm((a) => ({ ...a, icon: v }))} />
                <AutoOrderField label="Orden (Automatico)" value={getNextOrderIndex(advisoryCards)} hint="Se asigna al publicar" />
                <CheckBox label="Publicar Inmediatamente" checked={advisoryForm.active} onChange={(checked) => setAdvisoryForm((a) => ({ ...a, active: checked }))} />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <TextArea label="Target / Audiencia (un ítem por línea)" value={advisoryForm.audience} onChange={(v) => setAdvisoryForm((a) => ({ ...a, audience: v }))} />
                <TextArea label="Entregables (un ítem por línea)" value={advisoryForm.includes} onChange={(v) => setAdvisoryForm((a) => ({ ...a, includes: v }))} />
              </div>
              <TextArea label="Propuesta de Valor (Resultado Final)" value={advisoryForm.result} onChange={(v) => setAdvisoryForm((a) => ({ ...a, result: v }))} />
              <TextArea label="Observación Estratégica" value={advisoryForm.market_note} onChange={(v) => setAdvisoryForm((a) => ({ ...a, market_note: v }))} />
              <div className="flex flex-wrap gap-3 pt-2">
                <ActionButton loading={savingKey === "advisory"} onClick={createAdvisory} text="Publicar asesoría corporativa" />
                <button
                  onClick={seedDefaultAdvisories}
                  disabled={savingKey === "advisory-seed"}
                  className="px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  {savingKey === "advisory-seed" ? "Cargando..." : "Cargar tarjetas base (6)"}
                </button>
              </div>
            </CollapsibleForm>

            {!advisoryCards.length ? (
              <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl">
                <p className="text-white/40 text-sm">No hay asesorías estratégicas registradas.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {advisoryCards.map((card) => (
                  <article key={card.id} className={`group relative flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl border transition-all duration-500 shadow-xl overflow-hidden ${card.active ? "border-white/5 bg-[#0d121f]/60 hover:border-white/20 hover:bg-[#141a2b]" : "border-red-900/10 bg-red-950/5 opacity-60"}`}>
                    {/* Left Side: Visual Anchor */}
                    <div className="hidden md:flex w-24 h-24 rounded-2xl bg-amber-500/10 border border-amber-500/20 items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-500">
                      <FaLightbulb size={32} />
                    </div>

                    {/* Main Info Area */}
                    <div className="flex-1 min-w-0 w-full space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/80 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                          Asesoría Estratégica
                        </span>
                        <span className="text-[9px] text-white/20 font-mono">#ID:{card.id}</span>
                        {!card.active && <span className="px-2 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 text-[8px] font-black uppercase">Offline</span>}
                      </div>
                      <h3 className="text-xl font-black text-white group-hover:text-amber-200 transition-colors uppercase leading-tight line-clamp-1">
                        {card.title}
                      </h3>
                      <p className="text-xs text-white/40 font-medium line-clamp-1 max-w-xl leading-relaxed">
                        &ldquo;{card.result}&rdquo;
                      </p>
                    </div>

                    {/* Pricing / Meta details */}
                    <div className="hidden lg:block text-right px-8 border-x border-white/5">
                      <p className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors leading-none">{card.price}</p>
                      <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-black mt-2">{card.duration || "60 min"}</p>
                    </div>

                    {/* Right Side: Primary Actions */}
                    <div className="flex md:flex-col lg:flex-row items-center gap-3 w-full md:w-auto">
                      <button 
                        onClick={() => startEditAdvisory(card)} 
                        className="flex-1 md:w-full lg:w-32 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] bg-amber-600/10 hover:bg-amber-600 text-amber-500 hover:text-white rounded-xl border border-amber-500/20 transition-all flex items-center justify-center gap-2 group/btn"
                      >
                        <FaEdit className="group-hover/btn:rotate-12 transition-transform" /> Editar
                      </button>
                      <button 
                        onClick={() => removeAdvisory(card)} 
                        disabled={savingKey === `advisory-delete-${card.id}`} 
                        className="p-3 text-[10px] bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CrudPanel>

          <CrudPanel title="Carrusel Marquee" icon={<FaLayerGroup />} subtitle="Tarjetas del carrusel visual de la pagina de servicios">
            <CollapsibleForm title="Nueva tarjeta marquee">
              <div className="grid md:grid-cols-3 gap-5">
                <Input label="Titulo" value={marqueeForm.title} onChange={(v) => setMarqueeForm((m) => ({ ...m, title: v }))} />
                <Input label="Media URL (Imagen o Video)" value={marqueeForm.image_url} onChange={(v) => setMarqueeForm((m) => ({ ...m, image_url: v }))} />
                <AutoOrderField label="Orden (Automatico)" value={getNextOrderIndex(marqueeCards)} hint="Se asigna al publicar" />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => marqueeCreateFileInputRef.current?.click()}
                  disabled={marqueeUploadingTarget === "create"}
                  className="px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] bg-blue-600/10 border border-blue-500/20 text-blue-200 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {marqueeUploadingTarget === "create" ? <FaRedo className="animate-spin" /> : <FaUpload />}
                  {marqueeUploadingTarget === "create" ? "Subiendo..." : "Subir foto/video"}
                </button>
                <button
                  type="button"
                  onClick={() => void openMediaLibraryForMarquee("create")}
                  className="px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <FaPhotoVideo />
                  Seleccionar de biblioteca
                </button>
                <input
                  ref={marqueeCreateFileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(event) => {
                    void onMarqueeCreateFileChange(event);
                  }}
                />
              </div>
              {marqueeForm.image_url.trim() && (
                <div className="rounded-xl overflow-hidden border border-white/10 bg-black/20">
                  {isVideoMediaUrl(marqueeForm.image_url) ? (
                    <video src={marqueeForm.image_url} className="w-full max-h-64 object-cover" controls muted playsInline />
                  ) : (
                    <img src={marqueeForm.image_url} alt={marqueeForm.title || "Preview marquee"} className="w-full max-h-64 object-cover" />
                  )}
                </div>
              )}
              <div className="flex items-center gap-4">
                <CheckBox label="Tarjeta activa" checked={marqueeForm.active} onChange={(checked) => setMarqueeForm((m) => ({ ...m, active: checked }))} />
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <ActionButton loading={savingKey === "marquee"} onClick={createMarqueeCard} text="Publicar tarjeta marquee" />
                <button
                  onClick={seedDefaultMarqueeCards}
                  disabled={savingKey === "marquee-seed"}
                  className="px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  {savingKey === "marquee-seed" ? "Cargando..." : "Cargar tarjetas base"}
                </button>
              </div>
            </CollapsibleForm>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <button
                onClick={reorderMarqueeSequentially}
                disabled={savingKey === "marquee-reindex" || savingKey === "services-reindex"}
                className="px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] bg-blue-600/10 border border-blue-500/20 text-blue-200 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
              >
                {savingKey === "marquee-reindex" || savingKey === "services-reindex" ? "Reordenando..." : "Reordenar secuencial"}
              </button>
              <span className="text-[10px] text-white/45 uppercase tracking-[0.2em] font-bold">
                Normaliza orden a 0,1,2,3...
              </span>
            </div>

            {!marqueeCards.length ? (
              <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl">
                <p className="text-white/40 text-sm">No hay tarjetas marquee registradas.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {marqueeCards.map((card) => (
                  <article key={card.id} className={`group relative flex flex-col md:flex-row items-center gap-6 p-5 rounded-2xl border transition-all duration-500 shadow-xl overflow-hidden ${card.active ? "border-white/5 bg-[#0d121f]/60 hover:border-white/20 hover:bg-[#141a2b]" : "border-red-900/10 bg-red-950/5 opacity-60"}`}>
                    <div className="hidden md:flex w-28 h-20 rounded-xl overflow-hidden border border-white/10 bg-black/30 shrink-0">
                      {isVideoMediaUrl(card.image_url) ? (
                        <video src={card.image_url} className="w-full h-full object-cover" muted loop playsInline />
                      ) : (
                        <img src={card.image_url} alt={card.title} className="w-full h-full object-cover" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 w-full space-y-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] text-blue-300 font-black uppercase tracking-widest">Orden {card.order_index ?? 0}</span>
                        {!card.active && <span className="px-2 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 text-[8px] font-black uppercase">Offline</span>}
                      </div>
                      <h3 className="text-lg font-black text-white group-hover:text-blue-200 transition-colors uppercase leading-tight line-clamp-1">
                        {card.title}
                      </h3>
                      <p className="text-[11px] text-white/40 font-medium line-clamp-1 max-w-2xl leading-relaxed">
                        {card.image_url}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <button
                        onClick={() => startEditMarqueeCard(card)}
                        className="flex-1 md:w-32 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] bg-blue-600/10 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg border border-blue-500/20 transition-all flex items-center justify-center gap-2 group/btn"
                      >
                        <FaEdit className="group-hover/btn:rotate-12 transition-transform" /> Editar
                      </button>
                      <button
                        onClick={() => removeMarqueeCard(card)}
                        disabled={savingKey === `marquee-delete-${card.id}`}
                        className="p-2.5 text-[10px] bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-lg border border-red-500/20 transition-all"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CrudPanel>

          <CrudPanel title="Combos de Servicios" icon={<FaLayerGroup />} subtitle="Paquetes comerciales administrables para la pagina de servicios y combos">
            <CollapsibleForm title="Nuevo combo administrable">
              <div className="grid md:grid-cols-3 gap-5">
                <Input label="Titulo del Combo" value={comboForm.title} onChange={(v) => setComboForm((c) => ({ ...c, title: v }))} />
                <Input label="Segmento" value={comboForm.segment} onChange={(v) => setComboForm((c) => ({ ...c, segment: v }))} />
                <AutoOrderField label="Orden (Automatico)" value={getNextOrderIndex(combos)} hint="Se asigna al publicar" />
                <Input label="Valor Individual" value={comboForm.individual_value} onChange={(v) => setComboForm((c) => ({ ...c, individual_value: v }))} />
                <Input label="Precio Combo" value={comboForm.combo_price} onChange={(v) => setComboForm((c) => ({ ...c, combo_price: v }))} />
                <Input label="Plazo Estimado" value={comboForm.timeline} onChange={(v) => setComboForm((c) => ({ ...c, timeline: v }))} />
              </div>
              <TextArea label="Ideal para" value={comboForm.ideal} onChange={(v) => setComboForm((c) => ({ ...c, ideal: v }))} />
              <div className="grid md:grid-cols-3 gap-5">
                <TextArea label="Servicios incluidos (uno por linea)" value={comboForm.includes} onChange={(v) => setComboForm((c) => ({ ...c, includes: v }))} />
                <TextArea label="Entregables (uno por linea)" value={comboForm.deliverables} onChange={(v) => setComboForm((c) => ({ ...c, deliverables: v }))} />
                <TextArea label="No incluido (uno por linea)" value={comboForm.not_included} onChange={(v) => setComboForm((c) => ({ ...c, not_included: v }))} />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <TextArea label="Nota comercial" value={comboForm.note} onChange={(v) => setComboForm((c) => ({ ...c, note: v }))} />
                <TextArea label="Referencia de mercado" value={comboForm.market_note} onChange={(v) => setComboForm((c) => ({ ...c, market_note: v }))} />
              </div>
              <div className="flex items-center gap-4">
                <CheckBox label="Combo activo" checked={comboForm.active} onChange={(checked) => setComboForm((c) => ({ ...c, active: checked }))} />
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <ActionButton loading={savingKey === "combo"} onClick={createCombo} text="Publicar combo" />
                <button
                  onClick={seedDefaultCombos}
                  disabled={savingKey === "combo-seed"}
                  className="px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  {savingKey === "combo-seed" ? "Cargando..." : "Cargar combos base"}
                </button>
              </div>
            </CollapsibleForm>

            {!combos.length ? (
              <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl">
                <p className="text-white/40 text-sm">No hay combos registrados en la base de datos.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {combos.map((combo) => (
                  <article key={combo.id} className={`group relative flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl border transition-all duration-500 shadow-xl overflow-hidden ${combo.active ? "border-white/5 bg-[#0d121f]/60 hover:border-white/20 hover:bg-[#141a2b]" : "border-red-900/10 bg-red-950/5 opacity-60"}`}>
                    <div className="hidden md:flex w-20 h-20 rounded-2xl bg-violet-500/10 border border-violet-500/20 items-center justify-center text-violet-400 group-hover:scale-110 transition-transform duration-500">
                      <FaLayerGroup size={24} />
                    </div>

                    <div className="flex-1 min-w-0 w-full space-y-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] text-violet-300 font-black uppercase tracking-widest">{combo.segment}</span>
                        <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">{combo.combo_price}</span>
                        <span className="text-[9px] text-white/20 font-mono">#ID:{combo.id}</span>
                        {!combo.active && <span className="px-2 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 text-[8px] font-black uppercase">Offline</span>}
                      </div>
                      <h3 className="text-lg font-black text-white group-hover:text-violet-200 transition-colors uppercase leading-tight line-clamp-1">
                        {combo.title}
                      </h3>
                      <p className="text-[11px] text-white/40 font-medium line-clamp-2 max-w-2xl leading-relaxed">
                        {combo.ideal}
                      </p>
                    </div>

                    <div className="hidden lg:block text-right px-8 border-x border-white/5">
                      <p className="text-2xl font-black text-white group-hover:text-violet-300 transition-colors leading-none">{combo.combo_price}</p>
                      <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-black mt-2">Orden: {combo.order_index ?? 0}</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <button
                        onClick={() => startEditCombo(combo)}
                        className="flex-1 md:w-32 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] bg-violet-600/10 hover:bg-violet-600 text-violet-300 hover:text-white rounded-lg border border-violet-500/20 transition-all flex items-center justify-center gap-2 group/btn"
                      >
                        <FaEdit className="group-hover/btn:rotate-12 transition-transform" /> Editar
                      </button>
                      <button
                        onClick={() => removeCombo(combo)}
                        disabled={savingKey === `combo-delete-${combo.id}`}
                        className="p-2.5 text-[10px] bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-lg border border-red-500/20 transition-all"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CrudPanel>

          <CrudPanel title="Diagnostico de Empresa" icon={<FaComments />} subtitle="Tarjetas que clasifican el tipo de empresa en la pagina de combos">
            <CollapsibleForm title="Nueva tarjeta de diagnostico">
              <div className="grid md:grid-cols-3 gap-5">
                <Input label="Badge" value={comboDiagnosticForm.badge} onChange={(v) => setComboDiagnosticForm((c) => ({ ...c, badge: v }))} />
                <Input label="Tema" value={comboDiagnosticForm.theme} onChange={(v) => setComboDiagnosticForm((c) => ({ ...c, theme: v }))} />
                <AutoOrderField label="Orden (Automatico)" value={getNextOrderIndex(comboDiagnosticCards)} hint="Se asigna al publicar" />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <Input label="Titulo" value={comboDiagnosticForm.title} onChange={(v) => setComboDiagnosticForm((c) => ({ ...c, title: v }))} />
                <Input label="CTA href" value={comboDiagnosticForm.cta_href} onChange={(v) => setComboDiagnosticForm((c) => ({ ...c, cta_href: v }))} />
              </div>
              <TextArea label="Descripcion" value={comboDiagnosticForm.description} onChange={(v) => setComboDiagnosticForm((c) => ({ ...c, description: v }))} />
              <div className="grid md:grid-cols-2 gap-5">
                <TextArea label="Generalmente necesitas (uno por linea)" value={comboDiagnosticForm.needs} onChange={(v) => setComboDiagnosticForm((c) => ({ ...c, needs: v }))} />
                <TextArea label="Te recomendamos" value={comboDiagnosticForm.recommendations_text} onChange={(v) => setComboDiagnosticForm((c) => ({ ...c, recommendations_text: v }))} />
              </div>
              <div className="grid md:grid-cols-3 gap-5">
                <Input label="Label necesidades" value={comboDiagnosticForm.needs_label} onChange={(v) => setComboDiagnosticForm((c) => ({ ...c, needs_label: v }))} />
                <Input label="Label recomendaciones" value={comboDiagnosticForm.recommendations_label} onChange={(v) => setComboDiagnosticForm((c) => ({ ...c, recommendations_label: v }))} />
                <Input label="Texto CTA" value={comboDiagnosticForm.cta_text} onChange={(v) => setComboDiagnosticForm((c) => ({ ...c, cta_text: v }))} />
              </div>
              <div className="flex items-center gap-4">
                <CheckBox label="Tarjeta activa" checked={comboDiagnosticForm.active} onChange={(checked) => setComboDiagnosticForm((c) => ({ ...c, active: checked }))} />
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <ActionButton loading={savingKey === "combo-diagnostic"} onClick={createComboDiagnosticCard} text="Publicar diagnostico" />
                <button
                  onClick={seedDefaultComboDiagnosticCards}
                  disabled={savingKey === "combo-diagnostic-seed"}
                  className="px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  {savingKey === "combo-diagnostic-seed" ? "Cargando..." : "Cargar diagnostico base"}
                </button>
              </div>
            </CollapsibleForm>

            {!comboDiagnosticCards.length ? (
              <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl">
                <p className="text-white/40 text-sm">No hay tarjetas de diagnostico registradas.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {comboDiagnosticCards.map((card) => (
                  <article key={card.id} className={`group relative flex flex-col md:flex-row items-center gap-6 p-5 rounded-2xl border transition-all duration-500 shadow-xl overflow-hidden ${card.active ? "border-white/5 bg-[#0d121f]/60 hover:border-white/20 hover:bg-[#141a2b]" : "border-red-900/10 bg-red-950/5 opacity-60"}`}>
                    <div className="hidden md:flex w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-500">
                      <FaComments size={24} />
                    </div>

                    <div className="flex-1 min-w-0 w-full space-y-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] text-cyan-300 font-black uppercase tracking-widest">{card.badge}</span>
                        <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">{card.theme}</span>
                        {!card.active && <span className="px-2 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 text-[8px] font-black uppercase">Offline</span>}
                      </div>
                      <h3 className="text-lg font-black text-white group-hover:text-cyan-200 transition-colors uppercase leading-tight line-clamp-1">
                        {card.title}
                      </h3>
                      <p className="text-[11px] text-white/40 font-medium line-clamp-2 max-w-2xl leading-relaxed">
                        {card.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <button
                        onClick={() => startEditComboDiagnosticCard(card)}
                        className="flex-1 md:w-32 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] bg-cyan-600/10 hover:bg-cyan-600 text-cyan-300 hover:text-white rounded-lg border border-cyan-500/20 transition-all flex items-center justify-center gap-2 group/btn"
                      >
                        <FaEdit className="group-hover/btn:rotate-12 transition-transform" /> Editar
                      </button>
                      <button
                        onClick={() => removeComboDiagnosticCard(card)}
                        disabled={savingKey === `combo-diagnostic-delete-${card.id}`}
                        className="p-2.5 text-[10px] bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-lg border border-red-500/20 transition-all"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CrudPanel>

          <CrudPanel title="Tarjetas Premium de Combos" icon={<FaLightbulb />} subtitle="Bloques de valor que aparecen debajo de los combos en la landing">
            <CollapsibleForm title="Nueva tarjeta premium">
              <div className="grid md:grid-cols-3 gap-5">
                <Input label="Titulo" value={comboHighlightForm.title} onChange={(v) => setComboHighlightForm((c) => ({ ...c, title: v }))} />
                <Input label="Tema" value={comboHighlightForm.theme} onChange={(v) => setComboHighlightForm((c) => ({ ...c, theme: v }))} />
                <AutoOrderField label="Orden (Automatico)" value={getNextOrderIndex(comboHighlightCards)} hint="Se asigna al publicar" />
              </div>
              <TextArea label="Descripcion" value={comboHighlightForm.description} onChange={(v) => setComboHighlightForm((c) => ({ ...c, description: v }))} />
              <TextArea label="Items (uno por linea)" value={comboHighlightForm.items} onChange={(v) => setComboHighlightForm((c) => ({ ...c, items: v }))} />
              <TextArea label="Mensaje final" value={comboHighlightForm.footer_note} onChange={(v) => setComboHighlightForm((c) => ({ ...c, footer_note: v }))} />
              <div className="flex items-center gap-4">
                <CheckBox label="Tarjeta activa" checked={comboHighlightForm.active} onChange={(checked) => setComboHighlightForm((c) => ({ ...c, active: checked }))} />
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <ActionButton loading={savingKey === "combo-highlight"} onClick={createComboHighlightCard} text="Publicar tarjeta premium" />
                <button
                  onClick={seedDefaultComboHighlightCards}
                  disabled={savingKey === "combo-highlight-seed"}
                  className="px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  {savingKey === "combo-highlight-seed" ? "Cargando..." : "Cargar premium base"}
                </button>
              </div>
            </CollapsibleForm>

            {!comboHighlightCards.length ? (
              <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl">
                <p className="text-white/40 text-sm">No hay tarjetas premium registradas.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {comboHighlightCards.map((card) => (
                  <article key={card.id} className={`group relative flex flex-col md:flex-row items-center gap-6 p-5 rounded-2xl border transition-all duration-500 shadow-xl overflow-hidden ${card.active ? "border-white/5 bg-[#0d121f]/60 hover:border-white/20 hover:bg-[#141a2b]" : "border-red-900/10 bg-red-950/5 opacity-60"}`}>
                    <div className="hidden md:flex w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-500">
                      <FaLightbulb size={24} />
                    </div>

                    <div className="flex-1 min-w-0 w-full space-y-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] text-emerald-300 font-black uppercase tracking-widest">{card.theme}</span>
                        {!card.active && <span className="px-2 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 text-[8px] font-black uppercase">Offline</span>}
                      </div>
                      <h3 className="text-lg font-black text-white group-hover:text-emerald-200 transition-colors uppercase leading-tight line-clamp-1">
                        {card.title}
                      </h3>
                      <p className="text-[11px] text-white/40 font-medium line-clamp-2 max-w-2xl leading-relaxed">
                        {card.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <button
                        onClick={() => startEditComboHighlightCard(card)}
                        className="flex-1 md:w-32 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-600/10 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg border border-emerald-500/20 transition-all flex items-center justify-center gap-2 group/btn"
                      >
                        <FaEdit className="group-hover/btn:rotate-12 transition-transform" /> Editar
                      </button>
                      <button
                        onClick={() => removeComboHighlightCard(card)}
                        disabled={savingKey === `combo-highlight-delete-${card.id}`}
                        className="p-2.5 text-[10px] bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-lg border border-red-500/20 transition-all"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CrudPanel>

          <CrudPanel title="Preguntas Frecuentes" icon={<FaQuestionCircle />} subtitle="Repositorio central de conocimiento y resolución de dudas para clientes">
            <CollapsibleForm title="Nueva consulta estratégica (FAQ)">
              <div className="grid md:grid-cols-3 gap-5">
                <Input label="Pregunta / Título" value={faqForm.question} onChange={(v) => setFaqForm((f) => ({ ...f, question: v }))} />
                <Input label="Categoría de Negocio" value={faqForm.category} onChange={(v) => setFaqForm((f) => ({ ...f, category: v }))} />
                <AutoOrderField label="Orden de Visualizacion (Automatico)" value={getNextFaqOrder(faqs)} hint="Se asigna al publicar" />
              </div>
              <TextArea label="Respuesta Detallada" value={faqForm.answer} onChange={(v) => setFaqForm((f) => ({ ...f, answer: v }))} />
              <div className="flex items-center gap-4">
                <CheckBox label="Publicar FAQ" checked={faqForm.active} onChange={(checked) => setFaqForm((f) => ({ ...f, active: checked }))} />
              </div>
              <div className="pt-2">
                <ActionButton loading={savingKey === "faq"} onClick={createFaq} text="Publicar FAQ estratégica" />
              </div>
            </CollapsibleForm>

            {!faqs.length ? (
              <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl">
                <p className="text-white/40 text-sm">No hay preguntas registradas todavía.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {faqs.map((faq) => (
                  <article key={faq.id} className="group relative flex flex-col md:flex-row items-center gap-6 p-5 rounded-2xl border border-white/5 bg-[#0d121f]/60 hover:border-white/20 hover:bg-[#141a2b] transition-all duration-500 shadow-xl overflow-hidden">
                    {/* Left: Category Visual */}
                    <div className="hidden md:flex w-16 h-16 rounded-xl bg-cyan-500/10 border border-cyan-500/20 items-center justify-center text-cyan-500 shrink-0">
                      <FaQuestionCircle size={24} />
                    </div>

                    {/* Info Area */}
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500/80 bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/10">
                          {faq.category || "General"}
                        </span>
                        {!faq.active && <span className="px-2 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 text-[8px] font-black uppercase">Oculta</span>}
                      </div>
                      <h3 className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors uppercase leading-tight mb-2">
                        {faq.question}
                      </h3>
                      <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                        <p className="text-[10px] text-white/50 leading-relaxed line-clamp-2">
                          {faq.answer}
                        </p>
                      </div>
                    </div>

                    {/* Order info */}
                    <div className="hidden lg:block px-6 border-l border-white/5">
                      <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black mb-1">Orden</p>
                      <p className="text-xl font-black text-white/40">{faq.order}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col lg:flex-row items-center gap-2 w-full md:w-auto shrink-0">
                      <button 
                        onClick={() => startEditFaq(faq)} 
                        className="flex-1 md:w-32 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] bg-cyan-600/10 hover:bg-cyan-600 text-cyan-400 hover:text-white rounded-lg border border-cyan-500/20 transition-all flex items-center justify-center gap-2 group/btn"
                      >
                        <FaEdit className="group-hover/btn:rotate-12 transition-transform" /> Editar
                      </button>
                      <button 
                        onClick={() => removeFaq(faq)} 
                        disabled={savingKey === `faq-delete-${faq.id}`} 
                        className="p-2.5 text-[10px] bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-lg border border-red-500/20 transition-all shrink-0"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CrudPanel>

          <CrudPanel title="Especialistas por Industria" icon={<FaComments />} subtitle="Segmentación estratégica y casos de éxito por sector industrial">
            <CollapsibleForm title="Nueva vertical de industria">
              <div className="grid md:grid-cols-2 gap-5">
                <Input label="Nombre de Industria" value={industryForm.name} onChange={(v) => setIndustryForm((i) => ({ ...i, name: v }))} />
                <Input label="Referencia de Icono" value={industryForm.icon} onChange={(v) => setIndustryForm((i) => ({ ...i, icon: v }))} />
                <Input label="Ejemplos de Clientes (coma)" value={industryForm.examples} onChange={(v) => setIndustryForm((i) => ({ ...i, examples: v }))} />
                <AutoOrderField label="Prioridad de Visualizacion (Automatica)" value={getNextOrderIndex(industries)} hint="Se asigna al publicar" />
              </div>
              <TextArea label="Descripción del Valor por Sector" value={industryForm.description} onChange={(v) => setIndustryForm((i) => ({ ...i, description: v }))} />
              <div className="flex items-center gap-4">
                <CheckBox label="Vertical Activa" checked={industryForm.active} onChange={(checked) => setIndustryForm((i) => ({ ...i, active: checked }))} />
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <ActionButton loading={savingKey === "industry"} onClick={createIndustry} text="Aperturar industria especializada" />
                <button
                  onClick={seedDefaultIndustries}
                  disabled={savingKey === "industry-seed"}
                  className="px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  {savingKey === "industry-seed" ? "Cargando..." : "Cargar sectores base (6)"}
                </button>
              </div>
            </CollapsibleForm>

            {!industries.length ? (
              <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl">
                <p className="text-white/40 text-sm">No hay industrias registradas en el sistema.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {industries.map((industry) => {
                  const exampleItems = parseListFieldForView(industry.examples);

                  return (
                    <article key={industry.id} className={`group relative flex flex-col md:flex-row items-center gap-6 p-5 rounded-2xl border transition-all duration-500 shadow-xl overflow-hidden ${industry.active ? "border-white/5 bg-[#0d121f]/60 hover:border-white/20 hover:bg-[#141a2b]" : "border-red-900/10 bg-red-950/5 opacity-60"}`}>
                      {/* Left: Sector Visual */}
                      <div className="hidden md:flex w-20 h-20 rounded-xl bg-blue-500/10 border border-blue-500/20 items-center justify-center text-blue-500 shrink-0 group-hover:bg-blue-500/20 transition-all">
                        <FaIndustry size={28} />
                      </div>

                      {/* Info Area */}
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/80 bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">
                            Vertical: {industry.icon || "Sector"}
                          </span>
                          {!industry.active && <span className="px-2 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 text-[8px] font-black uppercase">Offline</span>}
                        </div>
                        <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors uppercase leading-tight mb-2">
                          {industry.name}
                        </h3>
                        <p className="text-[11px] text-white/50 leading-relaxed line-clamp-1 mb-3">
                          {industry.description}
                        </p>
                        
                        {exampleItems.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 items-center">
                            <span className="text-[8px] text-white/30 font-black uppercase tracking-widest mr-1">Casos:</span>
                            {exampleItems.slice(0, 4).map((ex, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md border border-white/5 bg-white/5 text-[9px] text-white/40">
                                {ex}
                              </span>
                            ))}
                            {exampleItems.length > 4 && <span className="text-[9px] text-white/20">+{exampleItems.length - 4} más</span>}
                          </div>
                        )}
                      </div>

                      {/* Order info */}
                      <div className="hidden lg:block px-8 border-x border-white/5 shrink-0">
                        <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black mb-1">Prioridad</p>
                        <p className="text-2xl font-black text-white/40 group-hover:text-blue-400 transition-colors">#{industry.order_index}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col lg:flex-row items-center gap-2 w-full md:w-auto shrink-0">
                        <button 
                          onClick={() => startEditIndustry(industry)} 
                          className="flex-1 md:w-32 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg border border-blue-500/20 transition-all flex items-center justify-center gap-2 group/btn"
                        >
                          <FaEdit className="group-hover/btn:rotate-12 transition-transform" /> Editar
                        </button>
                        <button 
                          onClick={() => removeIndustry(industry)} 
                          disabled={savingKey === `industry-delete-${industry.id}`} 
                          className="p-3 text-[10px] bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-lg border border-red-500/20 transition-all shrink-0"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </CrudPanel>
        </div>
      )}

      {/* MODALES DE EDICIÓN - Enterprise Modal System */}
      <AnimatePresence>
        {/* Modal: Planes */}
        {editingPlanId && planEditForm && (
          <AdminModal key="modal-edit-plan" title="Edición de Paquete Profesional" onClose={cancelEditPlan}>
            <div className="grid md:grid-cols-2 gap-5">
              <Input label="Nombre del Plan" value={planEditForm.name} onChange={(v) => setPlanEditForm((p) => (p ? { ...p, name: v } : p))} />
              <Input label="Precio" value={planEditForm.price} onChange={(v) => setPlanEditForm((p) => (p ? { ...p, price: v } : p))} />
              <Input label="Categoría" value={String(planEditForm.category || "")} onChange={(v) => setPlanEditForm((p) => (p ? { ...p, category: v } : p))} />
              <AutoOrderField label="Orden (Automatico)" value={Number(planEditForm.order_index) || 0} hint="Usa Reordenar Todo para normalizar" />
            </div>
            <TextArea label="Descripción Estratégica" value={planEditForm.description} onChange={(v) => setPlanEditForm((p) => (p ? { ...p, description: v } : p))} />
            <div className="grid md:grid-cols-2 gap-5">
              <TextArea label="Lista de Inclusiones" value={String(planEditForm.includes || "")} onChange={(v) => setPlanEditForm((p) => (p ? { ...p, includes: v } : p))} />
              <TextArea label="Detalles de Entrega" value={String(planEditForm.delivery || "")} onChange={(v) => setPlanEditForm((p) => (p ? { ...p, delivery: v } : p))} />
            </div>
            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
              <button 
                onClick={saveEditingPlan} 
                disabled={savingKey === `plan-save-${editingPlanId}`} 
                className="px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg flex items-center gap-3 rounded-xl"
              >
                <FaSave /> {savingKey === `plan-save-${editingPlanId}` ? "Guardando..." : "Confirmar Cambios"}
              </button>
              <button onClick={cancelEditPlan} className="px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] bg-white/5 hover:bg-white/10 text-white transition-all rounded-xl border border-white/10">Cancelar</button>
            </div>
          </AdminModal>
        )}

        {/* Modal: Servicios Adicionales */}
        {editingServiceId && serviceEditForm && (
          <AdminModal key="modal-edit-service" title="Edición de Servicio Complementario" onClose={cancelEditService}>
            <div className="grid md:grid-cols-2 gap-5">
              <Input label="Nombre del Servicio" value={serviceEditForm.name} onChange={(v) => setServiceEditForm((s) => (s ? { ...s, name: v } : s))} />
              <Input label="Precio / Valor" value={serviceEditForm.price} onChange={(v) => setServiceEditForm((s) => (s ? { ...s, price: v } : s))} />
              <Input label="Icono (ref)" value={serviceEditForm.icon || ""} onChange={(v) => setServiceEditForm((s) => (s ? { ...s, icon: v } : s))} />
              <Input label="Tipo Pago" value={serviceEditForm.payment_type || ""} onChange={(v) => setServiceEditForm((s) => (s ? { ...s, payment_type: v } : s))} />
            </div>
            <TextArea label="Propuesta de Valor" value={serviceEditForm.description} onChange={(v) => setServiceEditForm((s) => (s ? { ...s, description: v } : s))} />
            <TextArea label="Alcance del Servicio" value={serviceEditForm.includes || ""} onChange={(v) => setServiceEditForm((s) => (s ? { ...s, includes: v } : s))} />
            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
              <button 
                onClick={saveEditingService} 
                disabled={savingKey === `service-save-${editingServiceId}`} 
                className="px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg flex items-center gap-3 rounded-xl"
              >
                <FaSave /> {savingKey === `service-save-${editingServiceId}` ? "Actualizar Servicio" : "Actualizar Servicio"}
              </button>
              <button onClick={cancelEditService} className="px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] bg-white/5 hover:bg-white/10 text-white transition-all rounded-xl border border-white/10">Cancelar</button>
            </div>
          </AdminModal>
        )}

        {/* Modal: Marquee */}
        {editingMarqueeId && marqueeEditForm && (
          <AdminModal key="modal-edit-marquee" title="Edicion de Tarjeta Marquee" onClose={cancelEditMarqueeCard}>
            <div className="grid md:grid-cols-2 gap-5">
              <Input label="Titulo" value={marqueeEditForm.title} onChange={(v) => setMarqueeEditForm((m) => (m ? { ...m, title: v } : m))} />
              <AutoOrderField label="Orden (Automatico)" value={Number(marqueeEditForm.order_index) || 0} hint="Usa Reordenar Todo para normalizar" />
            </div>
            <Input label="Media URL (Imagen o Video)" value={marqueeEditForm.image_url} onChange={(v) => setMarqueeEditForm((m) => (m ? { ...m, image_url: v } : m))} />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => marqueeEditFileInputRef.current?.click()}
                disabled={marqueeUploadingTarget === "edit"}
                className="px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] bg-blue-600/10 border border-blue-500/20 text-blue-200 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {marqueeUploadingTarget === "edit" ? <FaRedo className="animate-spin" /> : <FaUpload />}
                {marqueeUploadingTarget === "edit" ? "Subiendo..." : "Subir foto/video"}
              </button>
              <button
                type="button"
                onClick={() => void openMediaLibraryForMarquee("edit")}
                className="px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <FaPhotoVideo />
                Seleccionar de biblioteca
              </button>
              <input
                ref={marqueeEditFileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(event) => {
                  void onMarqueeEditFileChange(event);
                }}
              />
            </div>
            <div className="rounded-xl overflow-hidden border border-white/10 bg-black/20">
              {isVideoMediaUrl(marqueeEditForm.image_url) ? (
                <video src={marqueeEditForm.image_url} className="w-full max-h-64 object-cover" controls muted playsInline />
              ) : (
                <img src={marqueeEditForm.image_url} alt={marqueeEditForm.title} className="w-full max-h-64 object-cover" />
              )}
            </div>
            <div className="flex items-center gap-4 py-2">
              <CheckBox label="Visible en el carrusel" checked={Boolean(marqueeEditForm.active)} onChange={(checked) => setMarqueeEditForm((m) => (m ? { ...m, active: checked } : m))} />
            </div>
            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
              <button
                onClick={saveEditingMarqueeCard}
                disabled={savingKey === `marquee-save-${editingMarqueeId}`}
                className="px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg flex items-center gap-3 rounded-xl"
              >
                <FaSave /> {savingKey === `marquee-save-${editingMarqueeId}` ? "Guardando..." : "Guardar Tarjeta"}
              </button>
              <button onClick={cancelEditMarqueeCard} className="px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] bg-white/5 hover:bg-white/10 text-white transition-all rounded-xl border border-white/10">Cancelar</button>
            </div>
          </AdminModal>
        )}

        {/* Modal: Asesorías */}
        {editingAdvisoryId && advisoryEditForm && (
          <AdminModal key="modal-edit-advisory" title="Control Panel: Asesoría Estratégica" onClose={cancelEditAdvisory}>
            <div className="grid md:grid-cols-2 gap-5">
              <Input label="Título Profesional" value={advisoryEditForm.title} onChange={(v) => setAdvisoryEditForm((a) => (a ? { ...a, title: v } : a))} />
              <Input label="Precio Sesión" value={advisoryEditForm.price} onChange={(v) => setAdvisoryEditForm((a) => (a ? { ...a, price: v } : a))} />
              <Input label="Duración" value={String(advisoryEditForm.duration || "")} onChange={(v) => setAdvisoryEditForm((a) => (a ? { ...a, duration: v } : a))} />
              <AutoOrderField label="Orden (Automatico)" value={Number(advisoryEditForm.order_index) || 0} hint="Usa Reordenar Todo para normalizar" />
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <TextArea label="Target / Audiencia" value={String(advisoryEditForm.audience || "")} onChange={(v) => setAdvisoryEditForm((a) => (a ? { ...a, audience: v } : a))} />
              <TextArea label="Entregables Clave" value={String(advisoryEditForm.includes || "")} onChange={(v) => setAdvisoryEditForm((a) => (a ? { ...a, includes: v } : a))} />
            </div>
            <TextArea label="Resultado Esperado" value={advisoryEditForm.result} onChange={(v) => setAdvisoryEditForm((a) => (a ? { ...a, result: v } : a))} />
            <div className="flex items-center gap-4 py-2">
              <CheckBox label="Visible en el Catálogo" checked={Boolean(advisoryEditForm.active)} onChange={(checked) => setAdvisoryEditForm((a) => (a ? { ...a, active: checked } : a))} />
            </div>
            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
              <button 
                onClick={saveEditingAdvisory} 
                disabled={savingKey === `advisory-save-${editingAdvisoryId}`} 
                className="px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg flex items-center gap-3 rounded-xl"
              >
                <FaSave /> {savingKey === `advisory-save-${editingAdvisoryId}` ? "Guardando..." : "Confirmar Cambios"}
              </button>
              <button onClick={cancelEditAdvisory} className="px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] bg-white/5 hover:bg-white/10 text-white transition-all rounded-xl border border-white/10">Cancelar</button>
            </div>
          </AdminModal>
        )}

        {/* Modal: Combos */}
        {editingComboId && comboEditForm && (
          <AdminModal key="modal-edit-combo" title="Edicion de Combo Comercial" onClose={cancelEditCombo}>
            <div className="grid md:grid-cols-3 gap-5">
              <Input label="Titulo del Combo" value={comboEditForm.title} onChange={(v) => setComboEditForm((c) => (c ? { ...c, title: v } : c))} />
              <Input label="Segmento" value={comboEditForm.segment} onChange={(v) => setComboEditForm((c) => (c ? { ...c, segment: v } : c))} />
              <AutoOrderField label="Orden (Automatico)" value={Number(comboEditForm.order_index) || 0} hint="Usa Reordenar Todo para normalizar" />
              <Input label="Valor Individual" value={comboEditForm.individual_value} onChange={(v) => setComboEditForm((c) => (c ? { ...c, individual_value: v } : c))} />
              <Input label="Precio Combo" value={comboEditForm.combo_price} onChange={(v) => setComboEditForm((c) => (c ? { ...c, combo_price: v } : c))} />
              <Input label="Plazo Estimado" value={comboEditForm.timeline} onChange={(v) => setComboEditForm((c) => (c ? { ...c, timeline: v } : c))} />
            </div>
            <TextArea label="Ideal para" value={comboEditForm.ideal} onChange={(v) => setComboEditForm((c) => (c ? { ...c, ideal: v } : c))} />
            <div className="grid md:grid-cols-3 gap-5">
              <TextArea label="Servicios incluidos" value={String(comboEditForm.includes || "")} onChange={(v) => setComboEditForm((c) => (c ? { ...c, includes: v } : c))} />
              <TextArea label="Entregables" value={String(comboEditForm.deliverables || "")} onChange={(v) => setComboEditForm((c) => (c ? { ...c, deliverables: v } : c))} />
              <TextArea label="No incluido" value={String(comboEditForm.not_included || "")} onChange={(v) => setComboEditForm((c) => (c ? { ...c, not_included: v } : c))} />
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <TextArea label="Nota comercial" value={comboEditForm.note} onChange={(v) => setComboEditForm((c) => (c ? { ...c, note: v } : c))} />
              <TextArea label="Referencia de mercado" value={String(comboEditForm.market_note || "")} onChange={(v) => setComboEditForm((c) => (c ? { ...c, market_note: v } : c))} />
            </div>
            <div className="flex items-center gap-4 py-2">
              <CheckBox label="Visible en catalogo" checked={Boolean(comboEditForm.active)} onChange={(checked) => setComboEditForm((c) => (c ? { ...c, active: checked } : c))} />
            </div>
            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
              <button
                onClick={saveEditingCombo}
                disabled={savingKey === `combo-save-${editingComboId}`}
                className="px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg flex items-center gap-3 rounded-xl"
              >
                <FaSave /> {savingKey === `combo-save-${editingComboId}` ? "Guardando..." : "Guardar Combo"}
              </button>
              <button onClick={cancelEditCombo} className="px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] bg-white/5 hover:bg-white/10 text-white transition-all rounded-xl border border-white/10">Cancelar</button>
            </div>
          </AdminModal>
        )}

        {/* Modal: Diagnostico */}
        {editingComboDiagnosticId && comboDiagnosticEditForm && (
          <AdminModal key="modal-edit-combo-diagnostic" title="Edicion de Tarjeta Diagnostica" onClose={cancelEditComboDiagnosticCard}>
            <div className="grid md:grid-cols-3 gap-5">
              <Input label="Badge" value={comboDiagnosticEditForm.badge} onChange={(v) => setComboDiagnosticEditForm((c) => (c ? { ...c, badge: v } : c))} />
              <Input label="Tema" value={String(comboDiagnosticEditForm.theme || "")} onChange={(v) => setComboDiagnosticEditForm((c) => (c ? { ...c, theme: v } : c))} />
              <AutoOrderField label="Orden (Automatico)" value={Number(comboDiagnosticEditForm.order_index) || 0} hint="Usa Reordenar Todo para normalizar" />
              <Input label="Titulo" value={comboDiagnosticEditForm.title} onChange={(v) => setComboDiagnosticEditForm((c) => (c ? { ...c, title: v } : c))} />
              <Input label="Texto CTA" value={comboDiagnosticEditForm.cta_text} onChange={(v) => setComboDiagnosticEditForm((c) => (c ? { ...c, cta_text: v } : c))} />
              <Input label="CTA href" value={comboDiagnosticEditForm.cta_href} onChange={(v) => setComboDiagnosticEditForm((c) => (c ? { ...c, cta_href: v } : c))} />
            </div>
            <TextArea label="Descripcion" value={comboDiagnosticEditForm.description} onChange={(v) => setComboDiagnosticEditForm((c) => (c ? { ...c, description: v } : c))} />
            <div className="grid md:grid-cols-2 gap-5">
              <TextArea label="Generalmente necesitas" value={String(comboDiagnosticEditForm.needs || "")} onChange={(v) => setComboDiagnosticEditForm((c) => (c ? { ...c, needs: v } : c))} />
              <TextArea label="Te recomendamos" value={comboDiagnosticEditForm.recommendations_text} onChange={(v) => setComboDiagnosticEditForm((c) => (c ? { ...c, recommendations_text: v } : c))} />
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <Input label="Label necesidades" value={String(comboDiagnosticEditForm.needs_label || "")} onChange={(v) => setComboDiagnosticEditForm((c) => (c ? { ...c, needs_label: v } : c))} />
              <Input label="Label recomendaciones" value={String(comboDiagnosticEditForm.recommendations_label || "")} onChange={(v) => setComboDiagnosticEditForm((c) => (c ? { ...c, recommendations_label: v } : c))} />
            </div>
            <div className="flex items-center gap-4 py-2">
              <CheckBox label="Visible en catalogo" checked={Boolean(comboDiagnosticEditForm.active)} onChange={(checked) => setComboDiagnosticEditForm((c) => (c ? { ...c, active: checked } : c))} />
            </div>
            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
              <button
                onClick={saveEditingComboDiagnosticCard}
                disabled={savingKey === `combo-diagnostic-save-${editingComboDiagnosticId}`}
                className="px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg flex items-center gap-3 rounded-xl"
              >
                <FaSave /> {savingKey === `combo-diagnostic-save-${editingComboDiagnosticId}` ? "Guardando..." : "Guardar Diagnostico"}
              </button>
              <button onClick={cancelEditComboDiagnosticCard} className="px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] bg-white/5 hover:bg-white/10 text-white transition-all rounded-xl border border-white/10">Cancelar</button>
            </div>
          </AdminModal>
        )}

        {/* Modal: Premium */}
        {editingComboHighlightId && comboHighlightEditForm && (
          <AdminModal key="modal-edit-combo-highlight" title="Edicion de Tarjeta Premium" onClose={cancelEditComboHighlightCard}>
            <div className="grid md:grid-cols-3 gap-5">
              <Input label="Titulo" value={comboHighlightEditForm.title} onChange={(v) => setComboHighlightEditForm((c) => (c ? { ...c, title: v } : c))} />
              <Input label="Tema" value={String(comboHighlightEditForm.theme || "")} onChange={(v) => setComboHighlightEditForm((c) => (c ? { ...c, theme: v } : c))} />
              <AutoOrderField label="Orden (Automatico)" value={Number(comboHighlightEditForm.order_index) || 0} hint="Usa Reordenar Todo para normalizar" />
            </div>
            <TextArea label="Descripcion" value={comboHighlightEditForm.description} onChange={(v) => setComboHighlightEditForm((c) => (c ? { ...c, description: v } : c))} />
            <TextArea label="Items" value={String(comboHighlightEditForm.items || "")} onChange={(v) => setComboHighlightEditForm((c) => (c ? { ...c, items: v } : c))} />
            <TextArea label="Mensaje final" value={String(comboHighlightEditForm.footer_note || "")} onChange={(v) => setComboHighlightEditForm((c) => (c ? { ...c, footer_note: v } : c))} />
            <div className="flex items-center gap-4 py-2">
              <CheckBox label="Visible en catalogo" checked={Boolean(comboHighlightEditForm.active)} onChange={(checked) => setComboHighlightEditForm((c) => (c ? { ...c, active: checked } : c))} />
            </div>
            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
              <button
                onClick={saveEditingComboHighlightCard}
                disabled={savingKey === `combo-highlight-save-${editingComboHighlightId}`}
                className="px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg flex items-center gap-3 rounded-xl"
              >
                <FaSave /> {savingKey === `combo-highlight-save-${editingComboHighlightId}` ? "Guardando..." : "Guardar Tarjeta"}
              </button>
              <button onClick={cancelEditComboHighlightCard} className="px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] bg-white/5 hover:bg-white/10 text-white transition-all rounded-xl border border-white/10">Cancelar</button>
            </div>
          </AdminModal>
        )}

        {/* Modal: FAQs */}
        {editingFaqId && faqEditForm && (
          <AdminModal key="modal-edit-faq" title="Editor de FAQ Corporativo" onClose={cancelEditFaq}>
            <div className="grid md:grid-cols-2 gap-5">
              <Input label="Pregunta / Título" value={faqEditForm.question} onChange={(v) => setFaqEditForm((f) => (f ? { ...f, question: v } : f))} />
              <Input label="Categoría" value={faqEditForm.category || ""} onChange={(v) => setFaqEditForm((f) => (f ? { ...f, category: v } : f))} />
              <AutoOrderField label="Orden (Automatico)" value={Number(faqEditForm.order) || 0} hint="Usa Reordenar Todo para normalizar" />
            </div>
            <TextArea label="Respuesta de Expertos" value={faqEditForm.answer} onChange={(v) => setFaqEditForm((f) => (f ? { ...f, answer: v } : f))} />
            <div className="flex items-center gap-4 py-2">
              <CheckBox label="Estado: Publicado" checked={Boolean(faqEditForm.active)} onChange={(checked) => setFaqEditForm((f) => (f ? { ...f, active: checked } : f))} />
            </div>
            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
              <button 
                onClick={saveEditingFaq} 
                disabled={savingKey === `faq-save-${editingFaqId}`} 
                className="px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg flex items-center gap-3 rounded-xl"
              >
                <FaSave /> {savingKey === `faq-save-${editingFaqId}` ? "Guardando..." : "Actualizar FAQ"}
              </button>
              <button onClick={cancelEditFaq} className="px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] bg-white/5 hover:bg-white/10 text-white transition-all rounded-xl border border-white/10">Cancelar</button>
            </div>
          </AdminModal>
        )}

        {/* Modal: Industrias */}
        {editingIndustryId && industryEditForm && (
          <AdminModal key="modal-edit-industry" title="Configuración de Vertical de Industria" onClose={cancelEditIndustry}>
            <div className="grid md:grid-cols-2 gap-5">
              <Input label="Nombre del Sector" value={industryEditForm.name} onChange={(v) => setIndustryEditForm((i) => (i ? { ...i, name: v } : i))} />
              <Input label="Icono (Fa ref)" value={industryEditForm.icon || ""} onChange={(v) => setIndustryEditForm((i) => (i ? { ...i, icon: v } : i))} />
              <AutoOrderField label="Orden Prioridad (Automatica)" value={Number(industryEditForm.order_index) || 0} hint="Usa Reordenar Todo para normalizar" />
            </div>
            <TextArea label="Descripción del Valor en el Sector" value={industryEditForm.description} onChange={(v) => setIndustryEditForm((i) => (i ? { ...i, description: v } : i))} />
            <TextArea label="Casos de Éxito / Ejemplos (uno por línea)" value={industryEditForm.examples || ""} onChange={(v) => setIndustryEditForm((i) => (i ? { ...i, examples: v } : i))} />
            <div className="flex items-center gap-4 py-2">
              <CheckBox label="Estatus: Activo" checked={Boolean(industryEditForm.active)} onChange={(checked) => setIndustryEditForm((i) => (i ? { ...i, active: checked } : i))} />
            </div>
            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
              <button 
                onClick={saveEditingIndustry} 
                disabled={savingKey === `industry-save-${editingIndustryId}`} 
                className="px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg flex items-center gap-3 rounded-xl"
              >
                <FaSave /> {savingKey === `industry-save-${editingIndustryId}` ? "Guardando..." : "Confirmar Cambios"}
              </button>
              <button onClick={cancelEditIndustry} className="px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] bg-white/5 hover:bg-white/10 text-white transition-all rounded-xl border border-white/10">Cancelar</button>
            </div>
          </AdminModal>
        )}

        {/* Modal: Biblioteca multimedia marquee */}
        {mediaLibraryOpen && (
          <AdminModal key="modal-media-library" title="Biblioteca Multimedia" onClose={() => setMediaLibraryOpen(false)}>
            <p className="text-xs text-white/60">
              Selecciona una imagen o video existente para asociarlo a la tarjeta marquee.
            </p>
            {!mediaLibraryLoading && !mediaLibraryError && (
              <p className="text-[11px] text-cyan-300/80 font-semibold">
                Archivos cargados: {mediaLibraryItems.length}
              </p>
            )}
            {mediaLibraryLoading ? (
              <div className="rounded-xl border border-white/10 bg-black/20 p-8 text-white/60 text-sm">
                Cargando biblioteca multimedia...
              </div>
            ) : mediaLibraryError ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300 text-sm">
                {mediaLibraryError}
              </div>
            ) : !mediaLibraryItems.length ? (
              <div className="rounded-xl border border-white/10 bg-black/20 p-8 text-white/60 text-sm">
                No hay archivos en la biblioteca. Puedes subir uno nuevo con el botón &quot;Subir foto/video&quot;.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4 max-h-[55vh] overflow-y-auto pr-2">
                {mediaLibraryItems.map((item, index) => {
                  const itemUrl = String(item.url || "").trim();
                  const mediaType = normalizeMediaType(item.type, itemUrl);
                  const mediaTitle = String(item.title || "").trim() || `Archivo ${index + 1}`;

                  return (
                    <article key={`${item.id ?? "media"}-${index}`} className="rounded-xl border border-white/10 bg-black/25 p-3 space-y-3">
                      <div className="rounded-lg overflow-hidden border border-white/10 bg-black/30 h-40">
                        {mediaType === "video" ? (
                          <video src={itemUrl} className="w-full h-full object-cover" muted loop playsInline />
                        ) : (
                          <img src={itemUrl} alt={mediaTitle} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[11px] text-white font-black uppercase tracking-[0.15em] line-clamp-1">{mediaTitle}</p>
                          <span className={`text-[8px] px-2 py-0.5 rounded-full border ${item.source === "cloudinary" ? "border-cyan-400/30 text-cyan-300 bg-cyan-500/10" : "border-violet-400/30 text-violet-300 bg-violet-500/10"}`}>
                            {item.source === "cloudinary" ? "Cloudinary" : "BD"}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/45 line-clamp-1">{itemUrl}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => applyMediaLibraryItemToMarquee(item)}
                        className="w-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] bg-blue-600/10 border border-blue-500/20 text-blue-200 hover:bg-blue-600 hover:text-white transition-all"
                      >
                        Usar este archivo
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </AdminModal>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdminModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#0b0f1a] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/20">
              <FaEdit />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">{title}</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mt-0.5">Editor de Parámetros Enterprise</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all flex items-center justify-center"
          >
            <FaTimes />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

function CrudPanel({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b0f1a]/80 backdrop-blur-sm p-8 space-y-8 shadow-2xl group/panel">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover/panel:scale-110 transition-transform">
            {icon}
          </div>
          <div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">{title}</h3>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.25em] font-bold mt-0.5">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="relative z-10 w-full">
        {children}
      </div>
    </section>
  );
}

function CollapsibleForm({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`rounded-2xl border transition-all duration-500 overflow-hidden ${open ? "border-blue-500/30 bg-blue-500/5 mb-8" : "border-white/10 bg-black/20"}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full transition-all ${open ? "bg-blue-500" : "bg-white/20 group-hover:bg-blue-400 animate-pulse"}`} />
          <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${open ? "text-blue-300" : "text-white/60"}`}>
            {open ? "Cerrar Panel de Entrada" : title}
          </span>
        </div>
        <span className="text-white/40 group-hover:text-white transition-colors">
          {open ? <FaChevronDown /> : <FaChevronRight />}
        </span>
      </button>
      {open && (
        <div className="border-t border-white/10 p-8 pt-6 space-y-6">
          {children}
        </div>
      )}
    </div>
  );
}

function AutoOrderField({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black">{label}</span>
      <div className="w-full bg-[#050508] border border-white/10 rounded-xl text-white/80 px-4 py-3 text-sm">
        {value}
      </div>
      {hint ? <span className="text-[9px] text-white/35 uppercase tracking-[0.15em]">{hint}</span> : null}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-[#050508] border border-white/10 rounded-xl text-white px-4 py-3 text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-white/10"
        placeholder={`Ingresar ${label.toLowerCase()}...`}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2 w-full">
      <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full bg-[#050508] border border-white/10 rounded-xl text-white px-4 py-3 text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none placeholder:text-white/10"
        placeholder={`Describir detalladamente ${label.toLowerCase()}...`}
      />
    </label>
  );
}

function CheckBox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group mt-2">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <div className="w-10 h-5 bg-white/10 rounded-full peer-checked:bg-blue-600 transition-colors" />
        <div className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
      </div>
      <span className="text-[11px] font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">{label}</span>
    </label>
  );
}

function ActionButton({
  text,
  onClick,
  loading,
}: {
  text: string;
  onClick: () => void;
  loading: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="px-8 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] bg-blue-600 text-white hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
    >
      {loading ? <FaRedo className="animate-spin" /> : <FaSave />}
      {loading ? "Sincronizando..." : text}
    </button>
  );
}

function StatCard({ title, value, color }: { title: string; value: number; color: "blue" | "emerald" | "violet" | "amber" }) {
  const colorStyles: Record<typeof color, string> = {
    blue: "from-blue-500/20 text-blue-400 border-blue-500/20",
    emerald: "from-emerald-500/20 text-emerald-400 border-emerald-500/20",
    violet: "from-violet-500/20 text-violet-400 border-violet-500/20",
    amber: "from-amber-500/20 text-amber-400 border-amber-500/20",
  };

  return (
    <div className={`relative overflow-hidden group border rounded-3xl p-6 bg-gradient-to-br transition-all duration-500 hover:scale-105 hover:shadow-2xl ${colorStyles[color]}`}>
      <div className="relative z-10 flex flex-col items-center text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-2 opacity-60 group-hover:opacity-100 transition-opacity">{title}</p>
        <p className="text-4xl font-black tracking-tight">{value}</p>
      </div>
      <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full blur-2xl opacity-20 bg-${color}-500`} />
    </div>
  );
}

