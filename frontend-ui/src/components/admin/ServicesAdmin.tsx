"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaChevronDown,
  FaChevronRight,
  FaComments,
  FaEdit,
  FaLayerGroup,
  FaListAlt,
  FaQuestionCircle,
  FaRedo,
  FaSave,
  FaTools,
  FaTrash,
} from "react-icons/fa";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

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

export default function ServicesAdmin() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [services, setServices] = useState<AdditionalService[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [advisoryCards, setAdvisoryCards] = useState<AdvisoryServiceCard[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingKey, setSavingKey] = useState("");

  const [planForm, setPlanForm] = useState(EMPTY_PLAN);
  const [serviceForm, setServiceForm] = useState(EMPTY_SERVICE);
  const [faqForm, setFaqForm] = useState(EMPTY_FAQ);
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [planEditForm, setPlanEditForm] = useState<Plan | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [serviceEditForm, setServiceEditForm] = useState<AdditionalService | null>(null);
  const [editingFaqId, setEditingFaqId] = useState<number | null>(null);
  const [faqEditForm, setFaqEditForm] = useState<Faq | null>(null);
  const [advisoryForm, setAdvisoryForm] = useState(EMPTY_ADVISORY);
  const [editingAdvisoryId, setEditingAdvisoryId] = useState<number | null>(null);
  const [advisoryEditForm, setAdvisoryEditForm] = useState<AdvisoryServiceCard | null>(null);
  const [industryForm, setIndustryForm] = useState(EMPTY_INDUSTRY);
  const [editingIndustryId, setEditingIndustryId] = useState<number | null>(null);
  const [industryEditForm, setIndustryEditForm] = useState<Industry | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [plansRes, servicesRes, faqsRes, advisoryRes, industriesRes, reviewsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/services-page/plans`),
        fetch(`${BACKEND_URL}/api/services-page/additional-services`),
        fetch(`${BACKEND_URL}/api/services-page/faqs/admin`),
        fetch(`${BACKEND_URL}/api/services-page/advisory-services/admin`),
        fetch(`${BACKEND_URL}/api/services-page/industries/admin`),
        fetch(`${BACKEND_URL}/api/services-page/reviews/admin`),
      ]);

      const plansData = plansRes.ok ? await plansRes.json() : [];
      const servicesData = servicesRes.ok ? await servicesRes.json() : [];
      const faqsData = faqsRes.ok ? await faqsRes.json() : [];
      const advisoryData = advisoryRes.ok ? await advisoryRes.json() : [];
      const industriesData = industriesRes.ok ? await industriesRes.json() : [];
      const reviewsData = reviewsRes.ok ? await reviewsRes.json() : [];

      setPlans(Array.isArray(plansData) ? plansData : []);
      setServices(Array.isArray(servicesData) ? servicesData : []);
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

  const postResource = useCallback(async (url: string, payload: object, successMessage: string, key: string) => {
    try {
      setSavingKey(key);
      setError("");
      setNotice("");

      const res = await fetch(url, {
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

      const res = await fetch(url, {
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

      const res = await fetch(url, { method: "DELETE" });
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
        const res = await fetch(`${BACKEND_URL}/api/services-page/plans`, {
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
        const res = await fetch(`${BACKEND_URL}/api/services-page/additional-services`, {
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
        const res = await fetch(`${BACKEND_URL}/api/services-page/advisory-services`, {
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
        const res = await fetch(`${BACKEND_URL}/api/services-page/industries`, {
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

  return (
    <div className="max-w-[1400px] mx-auto p-8 space-y-6">
      <section className="border border-white/10 bg-[#070b14]/70 p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black text-white uppercase tracking-wide">Servicios Admin</h2>
            <p className="text-white/60 mt-2">Crea y gestiona tarjetas del modulo de servicios desde aqui.</p>
          </div>
          <button
            onClick={loadAll}
            className="px-6 py-3 text-xs font-black uppercase tracking-[0.25em] bg-blue-600 text-white hover:bg-blue-500 transition-colors inline-flex items-center gap-2"
          >
            <FaRedo /> Recargar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-6">
          <StatCard title="Planes" value={plans.length} color="blue" />
          <StatCard title="Servicios Extra" value={services.length} color="emerald" />
          <StatCard title="FAQs" value={faqs.length} color="violet" />
          <StatCard title="Asesorias" value={advisoryCards.length} color="emerald" />
          <StatCard title="Industrias" value={industries.length} color="blue" />
          <StatCard title="Resenas Pendientes" value={pendingServiceReviews} color="amber" />
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
          <CrudPanel title="Planes Profesionales" icon={<FaListAlt />} subtitle="Controla las tarjetas de planes y precios">
            <CollapsibleForm title="Nuevo plan">
              <div className="grid md:grid-cols-2 gap-3">
                <Input label="Nombre" value={planForm.name} onChange={(v) => setPlanForm((p) => ({ ...p, name: v }))} />
                <Input label="Precio" value={planForm.price} onChange={(v) => setPlanForm((p) => ({ ...p, price: v }))} />
                <Input label="Categoria" value={planForm.category} onChange={(v) => setPlanForm((p) => ({ ...p, category: v }))} />
                <Input label="Modulos" value={planForm.modules} onChange={(v) => setPlanForm((p) => ({ ...p, modules: v }))} />
                <Input label="Incluye (coma o linea)" value={planForm.includes} onChange={(v) => setPlanForm((p) => ({ ...p, includes: v }))} />
                <Input label="Entrega (coma o linea)" value={planForm.delivery} onChange={(v) => setPlanForm((p) => ({ ...p, delivery: v }))} />
                <Input label="Ideal para (coma o linea)" value={planForm.ideal_for} onChange={(v) => setPlanForm((p) => ({ ...p, ideal_for: v }))} />
                <Input
                  label="Orden"
                  value={String(planForm.order_index)}
                  onChange={(v) => setPlanForm((p) => ({ ...p, order_index: Number(v) || 0 }))}
                />
              </div>
              <TextArea label="Descripcion" value={planForm.description} onChange={(v) => setPlanForm((p) => ({ ...p, description: v }))} />
              <div className="flex flex-wrap gap-2">
                <ActionButton loading={savingKey === "plan"} onClick={createPlan} text="Crear plan" />
                <button
                  onClick={seedDefaultPlans}
                  disabled={savingKey === "plan-seed"}
                  className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-emerald-600 text-white hover:bg-emerald-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {savingKey === "plan-seed" ? "Cargando..." : "Cargar 6 planes base"}
                </button>
              </div>
            </CollapsibleForm>
            {!plans.length ? (
              <p className="text-white/60 text-sm">No hay planes registrados en BD.</p>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {plans.map((plan) => {
                  const isEditing = editingPlanId === plan.id && planEditForm?.id === plan.id;

                  if (isEditing && planEditForm) {
                    return (
                      <article key={plan.id} className="border border-cyan-400/35 bg-cyan-500/5 p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-black uppercase tracking-[0.16em] text-cyan-300">Editando plan</h4>
                          <span className="text-xs text-white/50">ID {plan.id}</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <Input
                            label="Nombre"
                            value={planEditForm.name}
                            onChange={(v) => setPlanEditForm((prev) => (prev ? { ...prev, name: v } : prev))}
                          />
                          <Input
                            label="Precio"
                            value={planEditForm.price}
                            onChange={(v) => setPlanEditForm((prev) => (prev ? { ...prev, price: v } : prev))}
                          />
                          <Input
                            label="Categoria"
                            value={String(planEditForm.category || "")}
                            onChange={(v) => setPlanEditForm((prev) => (prev ? { ...prev, category: v } : prev))}
                          />
                          <Input
                            label="Orden"
                            value={String(planEditForm.order_index ?? 0)}
                            onChange={(v) => setPlanEditForm((prev) => (prev ? { ...prev, order_index: Number(v) || 0 } : prev))}
                          />
                        </div>
                        <TextArea
                          label="Descripcion"
                          value={planEditForm.description}
                          onChange={(v) => setPlanEditForm((prev) => (prev ? { ...prev, description: v } : prev))}
                        />
                        <TextArea
                          label="Modulos (coma o linea)"
                          value={String(planEditForm.modules || "")}
                          onChange={(v) => setPlanEditForm((prev) => (prev ? { ...prev, modules: v } : prev))}
                        />
                        <TextArea
                          label="Incluye (coma o linea)"
                          value={String(planEditForm.includes || "")}
                          onChange={(v) => setPlanEditForm((prev) => (prev ? { ...prev, includes: v } : prev))}
                        />
                        <TextArea
                          label="Entrega (coma o linea)"
                          value={String(planEditForm.delivery || "")}
                          onChange={(v) => setPlanEditForm((prev) => (prev ? { ...prev, delivery: v } : prev))}
                        />
                        <TextArea
                          label="Ideal para (coma o linea)"
                          value={String(planEditForm.ideal_for || "")}
                          onChange={(v) => setPlanEditForm((prev) => (prev ? { ...prev, ideal_for: v } : prev))}
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={saveEditingPlan}
                            disabled={savingKey === `plan-save-${plan.id}`}
                            className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                          >
                            <FaSave />
                            {savingKey === `plan-save-${plan.id}` ? "Guardando..." : "Guardar"}
                          </button>
                          <button
                            onClick={cancelEditPlan}
                            className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-white/10 text-white hover:bg-white/20 transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => removePlan(plan)}
                            disabled={savingKey === `plan-delete-${plan.id}`}
                            className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-red-700 text-white hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                          >
                            <FaTrash />
                            {savingKey === `plan-delete-${plan.id}` ? "Eliminando..." : "Borrar"}
                          </button>
                        </div>
                      </article>
                    );
                  }

                  const modulesItems = parseListFieldForView(plan.modules);
                  const includesItems = parseListFieldForView(plan.includes);
                  const deliveryItems = parseListFieldForView(plan.delivery);
                  const idealForItems = parseListFieldForView(plan.ideal_for);

                  return (
                    <article key={plan.id} className="border border-white/15 bg-black/20 p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-white font-black text-lg leading-tight">{plan.name}</p>
                          <p className="text-cyan-200 text-sm mt-1">
                            {plan.price} {plan.category ? `- ${plan.category}` : ""}
                          </p>
                        </div>
                        <p className="text-xs text-white/60">Orden: {plan.order_index ?? 0}</p>
                      </div>

                      <p className="text-sm text-white/80">{plan.description}</p>

                      <div className="grid md:grid-cols-2 gap-3">
                        {modulesItems.length > 0 && (
                          <div className="border border-white/10 bg-black/20 p-3">
                            <p className="text-[11px] uppercase tracking-widest text-blue-300 font-bold mb-2">Modulos</p>
                            <ul className="space-y-1 text-sm text-white/80">
                              {modulesItems.slice(0, 4).map((item) => (
                                <li key={item}>- {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {includesItems.length > 0 && (
                          <div className="border border-white/10 bg-black/20 p-3">
                            <p className="text-[11px] uppercase tracking-widest text-blue-300 font-bold mb-2">Incluye</p>
                            <ul className="space-y-1 text-sm text-white/80">
                              {includesItems.slice(0, 4).map((item) => (
                                <li key={item}>- {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {deliveryItems.length > 0 && (
                          <div className="border border-white/10 bg-black/20 p-3">
                            <p className="text-[11px] uppercase tracking-widest text-blue-300 font-bold mb-2">Entrega</p>
                            <ul className="space-y-1 text-sm text-white/80">
                              {deliveryItems.slice(0, 4).map((item) => (
                                <li key={item}>- {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {idealForItems.length > 0 && (
                          <div className="border border-white/10 bg-black/20 p-3">
                            <p className="text-[11px] uppercase tracking-widest text-blue-300 font-bold mb-2">Ideal para</p>
                            <ul className="space-y-1 text-sm text-white/80">
                              {idealForItems.slice(0, 4).map((item) => (
                                <li key={item}>- {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => startEditPlan(plan)}
                          className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-blue-600 text-white hover:bg-blue-500 transition-colors inline-flex items-center gap-2"
                        >
                          <FaEdit />
                          Editar
                        </button>
                        <button
                          onClick={() => removePlan(plan)}
                          disabled={savingKey === `plan-delete-${plan.id}`}
                          className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-red-700 text-white hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                        >
                          <FaTrash />
                          {savingKey === `plan-delete-${plan.id}` ? "Eliminando..." : "Borrar"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </CrudPanel>

          <CrudPanel title="Servicios Adicionales" icon={<FaTools />} subtitle="Crea tarjetas de servicios extra">
            <CollapsibleForm title="Nuevo servicio adicional">
              <div className="grid md:grid-cols-2 gap-3">
                <Input label="Nombre" value={serviceForm.name} onChange={(v) => setServiceForm((s) => ({ ...s, name: v }))} />
                <Input label="Precio" value={serviceForm.price} onChange={(v) => setServiceForm((s) => ({ ...s, price: v }))} />
                <Input label="Icon key" value={serviceForm.icon} onChange={(v) => setServiceForm((s) => ({ ...s, icon: v }))} />
                <Input label="Tipo de pago" value={serviceForm.payment_type} onChange={(v) => setServiceForm((s) => ({ ...s, payment_type: v }))} />
                <Input label="Incluye (coma o linea)" value={serviceForm.includes} onChange={(v) => setServiceForm((s) => ({ ...s, includes: v }))} />
              </div>
              <TextArea label="Descripcion" value={serviceForm.description} onChange={(v) => setServiceForm((s) => ({ ...s, description: v }))} />
              <div className="flex flex-wrap gap-2">
                <ActionButton loading={savingKey === "service"} onClick={createService} text="Crear servicio adicional" />
                <button
                  onClick={seedDefaultAdditionalServices}
                  disabled={savingKey === "service-seed"}
                  className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-emerald-600 text-white hover:bg-emerald-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {savingKey === "service-seed" ? "Cargando..." : "Cargar 7 tarjetas base"}
                </button>
              </div>
            </CollapsibleForm>
            {!services.length ? (
              <p className="text-white/60 text-sm">No hay servicios adicionales registrados en BD.</p>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {services.map((service) => {
                  const isEditing = editingServiceId === service.id && serviceEditForm?.id === service.id;

                  if (isEditing && serviceEditForm) {
                    return (
                      <article key={service.id} className="border border-cyan-400/35 bg-cyan-500/5 p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-black uppercase tracking-[0.16em] text-cyan-300">Editando servicio</h4>
                          <span className="text-xs text-white/50">ID {service.id}</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <Input
                            label="Nombre"
                            value={serviceEditForm.name}
                            onChange={(v) => setServiceEditForm((prev) => (prev ? { ...prev, name: v } : prev))}
                          />
                          <Input
                            label="Precio"
                            value={serviceEditForm.price}
                            onChange={(v) => setServiceEditForm((prev) => (prev ? { ...prev, price: v } : prev))}
                          />
                          <Input
                            label="Icon key"
                            value={String(serviceEditForm.icon || "")}
                            onChange={(v) => setServiceEditForm((prev) => (prev ? { ...prev, icon: v } : prev))}
                          />
                          <Input
                            label="Tipo de pago"
                            value={String(serviceEditForm.payment_type || "")}
                            onChange={(v) => setServiceEditForm((prev) => (prev ? { ...prev, payment_type: v } : prev))}
                          />
                        </div>
                        <TextArea
                          label="Descripcion"
                          value={serviceEditForm.description}
                          onChange={(v) => setServiceEditForm((prev) => (prev ? { ...prev, description: v } : prev))}
                        />
                        <TextArea
                          label="Incluye (coma o linea)"
                          value={String(serviceEditForm.includes || "")}
                          onChange={(v) => setServiceEditForm((prev) => (prev ? { ...prev, includes: v } : prev))}
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={saveEditingService}
                            disabled={savingKey === `service-save-${service.id}`}
                            className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                          >
                            <FaSave />
                            {savingKey === `service-save-${service.id}` ? "Guardando..." : "Guardar"}
                          </button>
                          <button
                            onClick={cancelEditService}
                            className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-white/10 text-white hover:bg-white/20 transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => removeService(service)}
                            disabled={savingKey === `service-delete-${service.id}`}
                            className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-red-700 text-white hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                          >
                            <FaTrash />
                            {savingKey === `service-delete-${service.id}` ? "Eliminando..." : "Borrar"}
                          </button>
                        </div>
                      </article>
                    );
                  }

                  const includesItems = parseListFieldForView(service.includes);

                  return (
                    <article key={service.id} className="border border-white/15 bg-black/20 p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-white font-black text-lg leading-tight">{service.name}</p>
                          <p className="text-cyan-200 text-sm mt-1">
                            {service.price} {service.payment_type ? `- ${service.payment_type}` : ""}
                          </p>
                        </div>
                        <p className="text-xs text-white/60">Icon: {service.icon || "tools"}</p>
                      </div>
                      <p className="text-sm text-white/80">{service.description}</p>

                      {includesItems.length > 0 && (
                        <div className="border border-white/10 bg-black/20 p-3">
                          <p className="text-[11px] uppercase tracking-widest text-blue-300 font-bold mb-2">Incluye</p>
                          <ul className="space-y-1 text-sm text-white/80">
                            {includesItems.slice(0, 5).map((item) => (
                              <li key={item}>- {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => startEditService(service)}
                          className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-blue-600 text-white hover:bg-blue-500 transition-colors inline-flex items-center gap-2"
                        >
                          <FaEdit />
                          Editar
                        </button>
                        <button
                          onClick={() => removeService(service)}
                          disabled={savingKey === `service-delete-${service.id}`}
                          className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-red-700 text-white hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                        >
                          <FaTrash />
                          {savingKey === `service-delete-${service.id}` ? "Eliminando..." : "Borrar"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </CrudPanel>

          <CrudPanel title="Asesorias Estrategicas" icon={<FaLayerGroup />} subtitle="Bloque rotatorio de 6 tarjetas en servicios">
            <CollapsibleForm title="Nueva asesoria">
              <div className="grid md:grid-cols-2 gap-3">
                <Input label="Titulo" value={advisoryForm.title} onChange={(v) => setAdvisoryForm((a) => ({ ...a, title: v }))} />
                <Input label="Precio" value={advisoryForm.price} onChange={(v) => setAdvisoryForm((a) => ({ ...a, price: v }))} />
                <Input label="Duracion" value={advisoryForm.duration} onChange={(v) => setAdvisoryForm((a) => ({ ...a, duration: v }))} />
                <Input label="Icon key" value={advisoryForm.icon} onChange={(v) => setAdvisoryForm((a) => ({ ...a, icon: v }))} />
                <Input
                  label="Orden"
                  value={String(advisoryForm.order_index)}
                  onChange={(v) => setAdvisoryForm((a) => ({ ...a, order_index: Number(v) || 0 }))}
                />
                <CheckBox label="Activa" checked={advisoryForm.active} onChange={(checked) => setAdvisoryForm((a) => ({ ...a, active: checked }))} />
              </div>
              <TextArea label="Para quien es (una linea por item)" value={advisoryForm.audience} onChange={(v) => setAdvisoryForm((a) => ({ ...a, audience: v }))} />
              <TextArea label="Incluye (una linea por item)" value={advisoryForm.includes} onChange={(v) => setAdvisoryForm((a) => ({ ...a, includes: v }))} />
              <TextArea label="Resultado" value={advisoryForm.result} onChange={(v) => setAdvisoryForm((a) => ({ ...a, result: v }))} />
              <TextArea label="Nota de mercado" value={advisoryForm.market_note} onChange={(v) => setAdvisoryForm((a) => ({ ...a, market_note: v }))} />
              <div className="flex flex-wrap gap-2">
                <ActionButton loading={savingKey === "advisory"} onClick={createAdvisory} text="Crear asesoria" />
                <button
                  onClick={seedDefaultAdvisories}
                  disabled={savingKey === "advisory-seed"}
                  className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-emerald-600 text-white hover:bg-emerald-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {savingKey === "advisory-seed" ? "Cargando..." : "Cargar 6 tarjetas base"}
                </button>
              </div>
            </CollapsibleForm>

            {!advisoryCards.length ? (
              <p className="text-white/60 text-sm">No hay asesorias registradas en BD.</p>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {advisoryCards.map((card) => {
                  const isEditing = editingAdvisoryId === card.id && advisoryEditForm?.id === card.id;

                  if (isEditing && advisoryEditForm) {
                    return (
                      <article key={card.id} className="border border-cyan-400/35 bg-cyan-500/5 p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-black uppercase tracking-[0.16em] text-cyan-300">Editando asesoria</h4>
                          <span className="text-xs text-white/50">ID {card.id}</span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          <Input
                            label="Titulo"
                            value={advisoryEditForm.title}
                            onChange={(v) => setAdvisoryEditForm((prev) => (prev ? { ...prev, title: v } : prev))}
                          />
                          <Input
                            label="Precio"
                            value={advisoryEditForm.price}
                            onChange={(v) => setAdvisoryEditForm((prev) => (prev ? { ...prev, price: v } : prev))}
                          />
                          <Input
                            label="Duracion"
                            value={String(advisoryEditForm.duration || "")}
                            onChange={(v) => setAdvisoryEditForm((prev) => (prev ? { ...prev, duration: v } : prev))}
                          />
                          <Input
                            label="Icon key"
                            value={String(advisoryEditForm.icon || "")}
                            onChange={(v) => setAdvisoryEditForm((prev) => (prev ? { ...prev, icon: v } : prev))}
                          />
                          <Input
                            label="Orden"
                            value={String(advisoryEditForm.order_index ?? 0)}
                            onChange={(v) =>
                              setAdvisoryEditForm((prev) => (prev ? { ...prev, order_index: Number(v) || 0 } : prev))
                            }
                          />
                          <CheckBox
                            label="Activa"
                            checked={Boolean(advisoryEditForm.active)}
                            onChange={(checked) => setAdvisoryEditForm((prev) => (prev ? { ...prev, active: checked } : prev))}
                          />
                        </div>

                        <TextArea
                          label="Para quien es (una linea por item)"
                          value={String(advisoryEditForm.audience || "")}
                          onChange={(v) => setAdvisoryEditForm((prev) => (prev ? { ...prev, audience: v } : prev))}
                        />
                        <TextArea
                          label="Incluye (una linea por item)"
                          value={String(advisoryEditForm.includes || "")}
                          onChange={(v) => setAdvisoryEditForm((prev) => (prev ? { ...prev, includes: v } : prev))}
                        />
                        <TextArea
                          label="Resultado"
                          value={advisoryEditForm.result}
                          onChange={(v) => setAdvisoryEditForm((prev) => (prev ? { ...prev, result: v } : prev))}
                        />
                        <TextArea
                          label="Nota de mercado"
                          value={String(advisoryEditForm.market_note || "")}
                          onChange={(v) => setAdvisoryEditForm((prev) => (prev ? { ...prev, market_note: v } : prev))}
                        />

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={saveEditingAdvisory}
                            disabled={savingKey === `advisory-save-${card.id}`}
                            className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                          >
                            <FaSave />
                            {savingKey === `advisory-save-${card.id}` ? "Guardando..." : "Guardar"}
                          </button>
                          <button
                            onClick={cancelEditAdvisory}
                            className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-white/10 text-white hover:bg-white/20 transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => removeAdvisory(card)}
                            disabled={savingKey === `advisory-delete-${card.id}`}
                            className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-red-700 text-white hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                          >
                            <FaTrash />
                            {savingKey === `advisory-delete-${card.id}` ? "Eliminando..." : "Borrar"}
                          </button>
                        </div>
                      </article>
                    );
                  }

                  const audienceItems = parseListFieldForView(card.audience);
                  const includesItems = parseListFieldForView(card.includes);

                  return (
                    <article key={card.id} className="border border-white/15 bg-black/20 p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-white font-black text-lg leading-tight">{card.title}</p>
                          <p className="text-cyan-200 text-sm mt-1">{card.price} · {card.duration || "60 minutos"}</p>
                        </div>
                        <div className="text-right text-xs text-white/60">
                          <p>Orden: {card.order_index ?? 0}</p>
                          <p>{card.active ? "Activa" : "Inactiva"}</p>
                        </div>
                      </div>

                      <p className="text-sm text-white/80 line-clamp-3">{card.result}</p>

                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="border border-white/10 bg-black/20 p-3">
                          <p className="text-[11px] uppercase tracking-widest text-blue-300 font-bold mb-2">Para quien es</p>
                          <ul className="space-y-1 text-sm text-white/80">
                            {audienceItems.slice(0, 4).map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="border border-white/10 bg-black/20 p-3">
                          <p className="text-[11px] uppercase tracking-widest text-blue-300 font-bold mb-2">Incluye</p>
                          <ul className="space-y-1 text-sm text-white/80">
                            {includesItems.slice(0, 4).map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {card.market_note && <p className="text-xs text-white/60">{card.market_note}</p>}

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => startEditAdvisory(card)}
                          className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-blue-600 text-white hover:bg-blue-500 transition-colors inline-flex items-center gap-2"
                        >
                          <FaEdit />
                          Editar
                        </button>
                        <button
                          onClick={() => removeAdvisory(card)}
                          disabled={savingKey === `advisory-delete-${card.id}`}
                          className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-red-700 text-white hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                        >
                          <FaTrash />
                          {savingKey === `advisory-delete-${card.id}` ? "Eliminando..." : "Borrar"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </CrudPanel>

          <CrudPanel title="Preguntas Frecuentes" icon={<FaQuestionCircle />} subtitle="Gestiona FAQ del sitio de servicios">
            <CollapsibleForm title="Nueva FAQ">
              <div className="grid md:grid-cols-2 gap-3">
                <Input label="Pregunta" value={faqForm.question} onChange={(v) => setFaqForm((f) => ({ ...f, question: v }))} />
                <Input label="Categoria" value={faqForm.category} onChange={(v) => setFaqForm((f) => ({ ...f, category: v }))} />
                <Input label="Orden" value={String(faqForm.order)} onChange={(v) => setFaqForm((f) => ({ ...f, order: Number(v) || 0 }))} />
                <CheckBox label="Activa" checked={faqForm.active} onChange={(checked) => setFaqForm((f) => ({ ...f, active: checked }))} />
              </div>
              <TextArea label="Respuesta" value={faqForm.answer} onChange={(v) => setFaqForm((f) => ({ ...f, answer: v }))} />
              <ActionButton loading={savingKey === "faq"} onClick={createFaq} text="Crear FAQ" />
            </CollapsibleForm>
            {!faqs.length ? (
              <p className="text-white/60 text-sm">No hay FAQ registradas en BD.</p>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {faqs.map((faq) => {
                  const isEditing = editingFaqId === faq.id && faqEditForm?.id === faq.id;

                  if (isEditing && faqEditForm) {
                    return (
                      <article key={faq.id} className="border border-cyan-400/35 bg-cyan-500/5 p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-black uppercase tracking-[0.16em] text-cyan-300">Editando FAQ</h4>
                          <span className="text-xs text-white/50">ID {faq.id}</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <Input
                            label="Pregunta"
                            value={faqEditForm.question}
                            onChange={(v) => setFaqEditForm((prev) => (prev ? { ...prev, question: v } : prev))}
                          />
                          <Input
                            label="Categoria"
                            value={String(faqEditForm.category || "")}
                            onChange={(v) => setFaqEditForm((prev) => (prev ? { ...prev, category: v } : prev))}
                          />
                          <Input
                            label="Orden"
                            value={String(faqEditForm.order ?? 0)}
                            onChange={(v) => setFaqEditForm((prev) => (prev ? { ...prev, order: Number(v) || 0 } : prev))}
                          />
                          <CheckBox
                            label="Activa"
                            checked={Boolean(faqEditForm.active)}
                            onChange={(checked) => setFaqEditForm((prev) => (prev ? { ...prev, active: checked } : prev))}
                          />
                        </div>
                        <TextArea
                          label="Respuesta"
                          value={faqEditForm.answer}
                          onChange={(v) => setFaqEditForm((prev) => (prev ? { ...prev, answer: v } : prev))}
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={saveEditingFaq}
                            disabled={savingKey === `faq-save-${faq.id}`}
                            className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                          >
                            <FaSave />
                            {savingKey === `faq-save-${faq.id}` ? "Guardando..." : "Guardar"}
                          </button>
                          <button
                            onClick={cancelEditFaq}
                            className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-white/10 text-white hover:bg-white/20 transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => removeFaq(faq)}
                            disabled={savingKey === `faq-delete-${faq.id}`}
                            className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-red-700 text-white hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                          >
                            <FaTrash />
                            {savingKey === `faq-delete-${faq.id}` ? "Eliminando..." : "Borrar"}
                          </button>
                        </div>
                      </article>
                    );
                  }

                  return (
                    <article key={faq.id} className="border border-white/15 bg-black/20 p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-white font-black text-lg leading-tight">{faq.question}</p>
                          <p className="text-cyan-200 text-sm mt-1">{faq.category || "General"}</p>
                        </div>
                        <div className="text-right text-xs text-white/60">
                          <p>Orden: {faq.order ?? 0}</p>
                          <p>{faq.active ? "Activa" : "Inactiva"}</p>
                        </div>
                      </div>
                      <p className="text-sm text-white/80">{faq.answer}</p>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => startEditFaq(faq)}
                          className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-blue-600 text-white hover:bg-blue-500 transition-colors inline-flex items-center gap-2"
                        >
                          <FaEdit />
                          Editar
                        </button>
                        <button
                          onClick={() => removeFaq(faq)}
                          disabled={savingKey === `faq-delete-${faq.id}`}
                          className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-red-700 text-white hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                        >
                          <FaTrash />
                          {savingKey === `faq-delete-${faq.id}` ? "Eliminando..." : "Borrar"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </CrudPanel>

          <CrudPanel title="Especialistas por Industria" icon={<FaComments />} subtitle="Tarjetas de industrias del bloque publico">
            <CollapsibleForm title="Nueva industria">
              <div className="grid md:grid-cols-2 gap-3">
                <Input label="Nombre industria" value={industryForm.name} onChange={(v) => setIndustryForm((i) => ({ ...i, name: v }))} />
                <Input label="Icon key" value={industryForm.icon} onChange={(v) => setIndustryForm((i) => ({ ...i, icon: v }))} />
                <Input label="Ejemplos (coma o linea)" value={industryForm.examples} onChange={(v) => setIndustryForm((i) => ({ ...i, examples: v }))} />
                <Input label="Orden" value={String(industryForm.order_index)} onChange={(v) => setIndustryForm((i) => ({ ...i, order_index: Number(v) || 0 }))} />
                <CheckBox label="Activo" checked={industryForm.active} onChange={(checked) => setIndustryForm((i) => ({ ...i, active: checked }))} />
              </div>
              <TextArea label="Descripcion" value={industryForm.description} onChange={(v) => setIndustryForm((i) => ({ ...i, description: v }))} />
              <div className="flex flex-wrap gap-2">
                <ActionButton loading={savingKey === "industry"} onClick={createIndustry} text="Crear industria" />
                <button
                  onClick={seedDefaultIndustries}
                  disabled={savingKey === "industry-seed"}
                  className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-emerald-600 text-white hover:bg-emerald-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {savingKey === "industry-seed" ? "Cargando..." : "Cargar 6 industrias base"}
                </button>
              </div>
            </CollapsibleForm>
            {!industries.length ? (
              <p className="text-white/60 text-sm">No hay industrias registradas en BD.</p>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {industries.map((industry) => {
                  const isEditing = editingIndustryId === industry.id && industryEditForm?.id === industry.id;

                  if (isEditing && industryEditForm) {
                    return (
                      <article key={industry.id} className="border border-cyan-400/35 bg-cyan-500/5 p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-black uppercase tracking-[0.16em] text-cyan-300">Editando industria</h4>
                          <span className="text-xs text-white/50">ID {industry.id}</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <Input
                            label="Nombre industria"
                            value={industryEditForm.name}
                            onChange={(v) => setIndustryEditForm((prev) => (prev ? { ...prev, name: v } : prev))}
                          />
                          <Input
                            label="Icon key"
                            value={String(industryEditForm.icon || "")}
                            onChange={(v) => setIndustryEditForm((prev) => (prev ? { ...prev, icon: v } : prev))}
                          />
                          <Input
                            label="Orden"
                            value={String(industryEditForm.order_index ?? 0)}
                            onChange={(v) =>
                              setIndustryEditForm((prev) => (prev ? { ...prev, order_index: Number(v) || 0 } : prev))
                            }
                          />
                          <CheckBox
                            label="Activa"
                            checked={Boolean(industryEditForm.active)}
                            onChange={(checked) => setIndustryEditForm((prev) => (prev ? { ...prev, active: checked } : prev))}
                          />
                        </div>
                        <TextArea
                          label="Descripcion"
                          value={industryEditForm.description}
                          onChange={(v) => setIndustryEditForm((prev) => (prev ? { ...prev, description: v } : prev))}
                        />
                        <TextArea
                          label="Ejemplos (coma o linea)"
                          value={String(industryEditForm.examples || "")}
                          onChange={(v) => setIndustryEditForm((prev) => (prev ? { ...prev, examples: v } : prev))}
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={saveEditingIndustry}
                            disabled={savingKey === `industry-save-${industry.id}`}
                            className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                          >
                            <FaSave />
                            {savingKey === `industry-save-${industry.id}` ? "Guardando..." : "Guardar"}
                          </button>
                          <button
                            onClick={cancelEditIndustry}
                            className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-white/10 text-white hover:bg-white/20 transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => removeIndustry(industry)}
                            disabled={savingKey === `industry-delete-${industry.id}`}
                            className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-red-700 text-white hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                          >
                            <FaTrash />
                            {savingKey === `industry-delete-${industry.id}` ? "Eliminando..." : "Borrar"}
                          </button>
                        </div>
                      </article>
                    );
                  }

                  const exampleItems = parseListFieldForView(industry.examples);

                  return (
                    <article key={industry.id} className="border border-white/15 bg-black/20 p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-white font-black text-lg leading-tight">{industry.name}</p>
                          <p className="text-cyan-200 text-sm mt-1">Icon: {industry.icon || "briefcase"}</p>
                        </div>
                        <div className="text-right text-xs text-white/60">
                          <p>Orden: {industry.order_index ?? 0}</p>
                          <p>{industry.active ? "Activa" : "Inactiva"}</p>
                        </div>
                      </div>

                      <p className="text-sm text-white/80">{industry.description}</p>

                      {exampleItems.length > 0 && (
                        <div className="border border-white/10 bg-black/20 p-3">
                          <p className="text-[11px] uppercase tracking-widest text-blue-300 font-bold mb-2">Ejemplos</p>
                          <ul className="space-y-1 text-sm text-white/80">
                            {exampleItems.slice(0, 6).map((item) => (
                              <li key={item}>- {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => startEditIndustry(industry)}
                          className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-blue-600 text-white hover:bg-blue-500 transition-colors inline-flex items-center gap-2"
                        >
                          <FaEdit />
                          Editar
                        </button>
                        <button
                          onClick={() => removeIndustry(industry)}
                          disabled={savingKey === `industry-delete-${industry.id}`}
                          className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-red-700 text-white hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                        >
                          <FaTrash />
                          {savingKey === `industry-delete-${industry.id}` ? "Eliminando..." : "Borrar"}
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
    <section className="border border-white/10 bg-[#070b14]/70 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-blue-300">{icon}</span>
        <div>
          <h3 className="text-xl font-black text-white">{title}</h3>
          <p className="text-xs text-white/50 uppercase tracking-widest">{subtitle}</p>
        </div>
      </div>
      {children}
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
    <div className="border border-white/10 bg-black/20">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">
          {open ? "Ocultar formulario" : title}
        </span>
        <span className="text-white/70">{open ? <FaChevronDown /> : <FaChevronRight />}</span>
      </button>
      {open && <div className="border-t border-white/10 p-4 space-y-4">{children}</div>}
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
    <label className="space-y-1">
      <span className="text-[11px] uppercase tracking-widest text-white/60 font-bold">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-black/30 border border-white/15 text-white px-3 py-2 text-sm outline-none"
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
    <label className="space-y-1 block">
      <span className="text-[11px] uppercase tracking-widest text-white/60 font-bold">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="w-full bg-black/30 border border-white/15 text-white px-3 py-2 text-sm outline-none resize-y"
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
    <label className="flex items-center gap-2 mt-5">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="text-sm text-white/80">{label}</span>
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
      className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? "Guardando..." : text}
    </button>
  );
}

function StatCard({ title, value, color }: { title: string; value: number; color: "blue" | "emerald" | "violet" | "amber" }) {
  const colorStyles: Record<typeof color, string> = {
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    violet: "border-violet-500/30 bg-violet-500/10 text-violet-300",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  };

  return (
    <div className={`border p-4 ${colorStyles[color]}`}>
      <p className="text-xs uppercase tracking-widest opacity-70">{title}</p>
      <p className="text-3xl font-black mt-1">{value}</p>
    </div>
  );
}
