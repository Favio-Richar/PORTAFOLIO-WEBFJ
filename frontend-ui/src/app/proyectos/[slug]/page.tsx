"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaGlobe, FaCode, FaCogs, FaMobileAlt, FaShoppingCart, FaCalendarCheck,
  FaTimes, FaPlay, FaImage, FaStar, FaArrowRight, FaReact, FaNodeJs, FaPython, FaFigma
} from "react-icons/fa";
import { SiGooglechrome, SiGithub, SiWhatsapp, SiNextdotjs, SiTypescript, SiTailwindcss, SiAmazon, SiMongodb, SiPostgresql, SiDocker } from "react-icons/si";
import API_BASE from "@/lib/apiBase";

const BACKEND_URL = API_BASE;
const FALLBACK_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "56971464296";

// --- Tipos y Helpers ---
interface ProjectMediaItem {
  url: string;
  resource_type: "image" | "video";
  caption?: string;
  is_cover?: boolean;
}

interface Proyecto {
  id: number;
  slug?: string;
  title: string;
  description: string;
  category: string;
  price: string;
  featured: boolean;
  active: boolean;
  order_index: number;
  cover_url: string;
  tags: string[];
  stack: string[];
  video_url?: string;
  media?: ProjectMediaItem[];
  demo_url?: string;
  repo_url?: string;
  results?: string[];
  client_type?: string;
}

interface BackendMediaItem {
  url?: string | null;
  resource_type?: string | null;
  type?: string | null;
  caption?: string | null;
  is_cover?: boolean | null;
}

interface BackendProyecto {
  id: number; title?: string; description?: string; category?: string;
  status?: string; image_url?: string; video_url?: string | null; slug?: string | null;
  media?: string | BackendMediaItem[] | null;
  demo_url?: string | null; repo_url?: string | null;
  stack?: string | string[]; results?: string | null; client_name?: string | null;
  featured?: boolean | string | number;
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  web: "from-blue-600/40 to-indigo-800/40",
  ecommerce: "from-emerald-600/40 to-teal-800/40",
  sistemas: "from-violet-600/40 to-purple-800/40",
  apps: "from-amber-600/40 to-orange-800/40",
  otro: "from-slate-600/40 to-slate-800/40",
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  web: <FaGlobe />, ecommerce: <FaShoppingCart />, sistemas: <FaCogs />,
  apps: <FaMobileAlt />, landing: <FaGlobe />, reservas: <FaCalendarCheck />,
  automatizacion: <FaCogs />, otro: <FaCode />,
};

const CATEGORY_LABELS: Record<string, string> = {
  web: "Sitio Web", ecommerce: "E-Commerce", sistemas: "Sistema", apps: "App Móvil", otro: "Otro",
};

const CAT_STYLES: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  web: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30", glow: "shadow-blue-500/20" },
  ecommerce: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", glow: "shadow-emerald-500/20" },
  sistemas: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/30", glow: "shadow-violet-500/20" },
  apps: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", glow: "shadow-amber-500/20" },
  otro: { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/30", glow: "shadow-slate-500/20" },
};

const TECH_COLORS: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  "React": { bg: "#61DAFB20", border: "#61DAFB", text: "#61DAFB", icon: <FaReact /> },
  "Next.js": { bg: "#FFFFFF20", border: "#FFFFFF", text: "#FFFFFF", icon: <SiNextdotjs /> },
  "TypeScript": { bg: "#3178C620", border: "#3178C6", text: "#3178C6", icon: <SiTypescript /> },
  "Node.js": { bg: "#33993320", border: "#339933", text: "#339933", icon: <FaNodeJs /> },
  "Python": { bg: "#3776AB20", border: "#3776AB", text: "#3776AB", icon: <FaPython /> },
  "TailwindCSS": { bg: "#06B6D420", border: "#06B6D4", text: "#06B6D4", icon: <SiTailwindcss /> },
  "Figma": { bg: "#F24E1E20", border: "#F24E1E", text: "#F24E1E", icon: <FaFigma /> },
  "AWS": { bg: "#FF990020", border: "#FF9900", text: "#FF9900", icon: <SiAmazon /> },
  "Google Cloud": { bg: "#4285F420", border: "#4285F4", text: "#4285F4", icon: <SiAmazon /> },
  "MongoDB": { bg: "#47A24820", border: "#47A248", text: "#47A248", icon: <SiMongodb /> },
  "PostgreSQL": { bg: "#4169E120", border: "#4169E1", text: "#4169E1", icon: <SiPostgresql /> },
  "Docker": { bg: "#2496ED20", border: "#2496ED", text: "#2496ED", icon: <SiDocker /> }
};

const toProjectMediaArray = (value: unknown): ProjectMediaItem[] => {
  let parsedValue = value;
  if (typeof value === "string") {
    try { parsedValue = JSON.parse(value); } catch { return []; }
  }
  if (!Array.isArray(parsedValue)) return [];
  return parsedValue.map((entry) => {
    const raw = (entry || {}) as BackendMediaItem;
    const url = String(raw.url || "").trim();
    if (!url) return null;
    const rawType = String(raw.resource_type || raw.type || "").toLowerCase();
    const resource_type = rawType === "video" ? "video" : "image";
    return { url, resource_type, caption: raw.caption, is_cover: raw.is_cover } as ProjectMediaItem;
  }).filter((entry): entry is ProjectMediaItem => Boolean(entry));
};

const resolveProjectMedia = (p: Partial<Proyecto> | null): ProjectMediaItem[] => {
  if (!p) return [];
  const mediaContent = Array.isArray(p.media) ? p.media : [];
  return mediaContent.filter(m => m && m.url && m.url.trim().length > 0);
};

function parseProyecto(item: BackendProyecto): Proyecto {
  const safeJson = (v: unknown) => {
    if (!v) return null;
    if (typeof v !== "string") return v;
    try { return JSON.parse(v); } catch { return null; }
  };
  const meta = (() => {
    const p = safeJson(item.results);
    return p && typeof p === "object" && !Array.isArray(p) ? p as Record<string, unknown> : {};
  })();
  const stackRaw = safeJson(item.stack);
  const tagsRaw = safeJson(meta.tags ?? null);
  const resultsRaw = safeJson(meta.results ?? meta.bullets ?? null);
  const mediaRaw = toProjectMediaArray(safeJson(item.media));
  const coverUrl = String(item.image_url || mediaRaw.find((entry) => entry.resource_type === "image")?.url || "").trim();
  const videoUrl = String(item.video_url || mediaRaw.find((entry) => entry.resource_type === "video")?.url || "").trim();

  const resolvedMedia: ProjectMediaItem[] = [];
  if (coverUrl && !mediaRaw.some(m => m.url === coverUrl)) resolvedMedia.push({ url: coverUrl, resource_type: "image" });
  if (videoUrl && !mediaRaw.some(m => m.url === videoUrl)) resolvedMedia.push({ url: videoUrl, resource_type: "video" });
  mediaRaw.forEach(m => { if (!resolvedMedia.some(rm => rm.url === m.url)) resolvedMedia.push(m); });

  const isActive = typeof meta.active === "boolean" ? meta.active : !["inactivo", "desactivado", "archivado"].some(s => (item.status || "").toLowerCase().includes(s));

  return {
    id: Number(item.id),
    slug: String(item.slug || "").trim(),
    title: String(item.title || "").trim(),
    description: String(item.description || "").trim(),
    category: String(item.category || "otro").trim(),
    price: typeof meta.price === "string" ? meta.price : "",
    featured: Boolean(meta.featured || item.featured),
    active: isActive,
    order_index: Number(meta.order_index) || 0,
    cover_url: coverUrl,
    video_url: videoUrl,
    media: resolvedMedia,
    tags: Array.isArray(tagsRaw) ? tagsRaw.map(String) : [],
    stack: Array.isArray(stackRaw) ? stackRaw.map(String) : [],
    demo_url: String(item.demo_url || meta.demo_url || meta.demo || "").trim(),
    repo_url: String(item.repo_url || meta.repo_url || meta.github || "").trim(),
    results: Array.isArray(resultsRaw) ? resultsRaw.map((entry) => String(entry).trim()).filter(Boolean) : [],
    client_type: typeof meta.client_type === "string" ? meta.client_type : String(item.client_name || "").trim(),
  };
}

export default function ProjectDetailsPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Proyecto | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [contactPhone, setContactPhone] = useState(FALLBACK_WHATSAPP_NUMBER);

  useEffect(() => {
    // Fetch project
    const idToFetch = slug;
    if (!idToFetch) return;

    fetch(`${BACKEND_URL}/api/proyectos/${idToFetch}`)
      .then(res => {
        if (!res.ok) throw new Error("Proyecto no encontrado");
        return res.json();
      })
      .then(data => {
        setProject(parseProyecto(data));
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => setLoading(false));

    fetch(`${BACKEND_URL}/api/contact`, { cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const nextPhone = String(d?.whatsapp || d?.phone || "").replace(/\D/g, "");
        if (nextPhone) setContactPhone(nextPhone);
      })
      .catch(() => { });
  }, [slug]);

  const normalizeExternalUrl = (rawUrl?: string | null) => {
    const value = String(rawUrl || "").trim();
    if (!value || value === "#" || value.toLowerCase() === "null") return "";
    if (/^https?:\/\//i.test(value)) return value;
    if (/^\/\//.test(value)) return `https:${value}`;
    return `https://${value}`;
  };

  const openProjectDemo = () => {
    const target = normalizeExternalUrl(project?.demo_url);
    if (target) window.open(target, "_blank", "noopener,noreferrer");
  };

  const openProjectRepo = () => {
    const target = normalizeExternalUrl(project?.repo_url);
    if (target) window.open(target, "_blank", "noopener,noreferrer");
  };

  const openWhatsApp = () => {
    if (!project) return;
    const msg = `Hola, vengo desde el portafolio y estoy interesado en un proyecto similar a: ${project.title}.`;
    window.open(`https://wa.me/${contactPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const hasDemoLink = Boolean(normalizeExternalUrl(project?.demo_url));
  const hasRepoLink = Boolean(normalizeExternalUrl(project?.repo_url));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex flex-col items-center justify-center p-6 text-center">
        <FaCode className="text-6xl text-slate-700 mb-6" />
        <h1 className="text-3xl font-black mb-4">Proyecto No Encontrado</h1>
        <p className="text-slate-400 mb-8">El caso de éxito que buscas no existe o ha sido movido.</p>
        <button onClick={() => router.push("/proyectos")} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 transition-colors font-bold rounded-xl text-white">
          Volver a Proyectos
        </button>
      </div>
    );
  }

  const selectedProjectMedia = resolveProjectMedia(project);
  const safeIndex = Math.min(selectedMediaIndex, Math.max(0, selectedProjectMedia.length - 1));
  const activeSelectedMedia = selectedProjectMedia[safeIndex] || null;

  return (
    <>
      <div className="min-h-screen bg-[#050508] text-white pt-28 pb-20 px-4 md:px-8 xl:px-0">
        <div className="max-w-7xl mx-auto">

          <button
            onClick={() => router.push("/proyectos")}
            className="mb-8 flex items-center gap-2 text-slate-400 hover:text-cyan-300 transition-colors font-semibold text-sm w-fit group"
          >
            <FaArrowRight className="transform rotate-180 group-hover:-translate-x-1 transition-transform" />
            Volver al portafolio
          </button>

          {/* Grid Principal */}
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">

            {/* Columna Izquierda: Título Principal, Reproductor, Descripción */}
            <div className="lg:col-span-8 flex flex-col gap-10">

              {/* Hero de la Vista (Explicación de la Página) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6 }}
                className="mb-8 p-8 md:p-10 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] -z-10 group-hover:bg-cyan-500/10 transition-colors duration-700"></div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <span className="h-1 w-12 bg-cyan-500 rounded-full"></span>
                    <h2 className="text-cyan-400 font-bold text-sm tracking-[0.2em] uppercase">
                      Insight de Ingeniería
                    </h2>
                  </div>
                  
                  <h3 className="text-3xl md:text-4xl font-black text-white leading-tight">
                    Análisis detallado de <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">arquitectura y ejecución</span>
                  </h3>
                  
                  <p className="text-slate-400 text-base md:text-lg font-medium max-w-2xl leading-relaxed">
                    Esta vista presenta el desglose técnico del proyecto, analizando la pila tecnológica empleada, los hitos de desarrollo y el valor estratégico aportado al negocio.
                  </p>
                </div>
              </motion.div>

              {/* Cabecera del Proyecto (Badges + Nombre) */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <div className="flex flex-wrap items-center gap-4 mb-8">
                  <span className={`${CAT_STYLES[project.category]?.bg || CAT_STYLES.otro.bg} ${CAT_STYLES[project.category]?.text || CAT_STYLES.otro.text} border ${CAT_STYLES[project.category]?.border || CAT_STYLES.otro.border} px-5 py-2 rounded-xl text-[12px] font-black uppercase tracking-[0.15em] shadow-lg shadow-cyan-500/5`}>
                    {CATEGORY_LABELS[project.category] || project.category}
                  </span>
                  {project.featured && (
                    <span className="flex items-center gap-2 px-5 py-2 rounded-xl text-[12px] font-black uppercase tracking-[0.15em] bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-lg shadow-amber-500/5">
                      <FaStar className="text-[11px]" /> Proyecto Destacado
                    </span>
                  )}
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter mb-8 max-w-4xl">
                  {project.title}
                </h1>
              </motion.div>

              {/* Reproductor Principal (Acotado, NO "Hero") */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1 }}
                className="w-full rounded-2xl md:rounded-3xl overflow-hidden bg-[#090d1a] border border-white/10 shadow-2xl relative"
              >
                <div className="aspect-video w-full relative">
                  {activeSelectedMedia ? (
                    activeSelectedMedia.resource_type === "video" ? (
                      <video src={activeSelectedMedia.url} className="absolute inset-0 w-full h-full object-contain bg-black" controls playsInline />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={activeSelectedMedia.url} alt={activeSelectedMedia.caption || project.title} className="absolute inset-0 w-full h-full object-contain bg-[#0a0f1c]" />
                    )
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${CATEGORY_GRADIENTS[project.category] || CATEGORY_GRADIENTS.otro} flex items-center justify-center text-8xl opacity-30`}>
                      {CATEGORY_ICONS[project.category] || <FaCode />}
                    </div>
                  )}
                  <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-2xl md:rounded-3xl" />
                </div>
              </motion.div>

              {/* Carrusel de Miniaturas */}
              {selectedProjectMedia.length > 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                  {selectedProjectMedia.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedMediaIndex(index)}
                      className={`relative h-20 w-32 shrink-0 overflow-hidden rounded-xl border transition-all ${selectedMediaIndex === index ? "border-cyan-400 ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-500/10" : "border-white/10 hover:border-white/30 hover:scale-105"
                        }`}
                    >
                      {item.resource_type === "video" ? (
                        <video src={item.url} className="h-full w-full object-cover opacity-80" muted playsInline />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.url} alt={`Media ${index}`} className="h-full w-full object-cover opacity-80" />
                      )}
                      {selectedMediaIndex !== index && <div className="absolute inset-0 bg-black/40 hover:bg-transparent transition-colors" />}
                      <span className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-sm shadow-sm">
                        {item.resource_type === "video" ? <FaPlay className="text-[9px] ml-0.5" /> : <FaImage className="text-[9px]" />}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Detalles y Resumen */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="space-y-12 mt-4 pb-12">

                {/* Resumen */}
                <section>
                  <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 text-white pb-4 border-b border-white/5">
                    <span className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                      <FaGlobe className="text-cyan-400 text-sm" />
                    </span>
                    Sobre este proyecto
                  </h2>
                  <div className="text-slate-300 leading-relaxed font-light text-base md:text-lg whitespace-pre-wrap">
                    {project.description}
                  </div>
                </section>

                {/* Hitos / Resultados */}
                {((project.results && project.results.length > 0) || project.tags.length > 0) && (
                  <section>
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 pb-4 border-b border-white/5">
                      <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <FaStar className="text-emerald-400 text-sm" />
                      </span>
                      Hitos y Características
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {(project.results && project.results.length > 0 ? project.results : project.tags).map((item, idx) => (
                        <div key={idx} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-slate-200 flex items-start gap-4 hover:bg-white/[0.04] transition-colors">
                          <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0 mt-0.5 border border-cyan-500/20">
                            <span className="text-cyan-400 font-bold text-xs">✓</span>
                          </div>
                          <span className="text-[15px] leading-relaxed font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

              </motion.div>

            </div>

            {/* Columna Derecha: Sticky Sidebar (Info Técnica y Botones) */}
            <div className="lg:col-span-4 relative">
              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                className="sticky top-32 space-y-6"
              >

                <div className="space-y-6">
                  {/* Card: Sector / Cliente */}
                  <div className="rounded-2xl border border-white/10 bg-[#0a0f1c] p-6 shadow-xl relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] -z-10"></div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <FaGlobe className="text-sm" />
                      </div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-400/80 font-black">
                        Sector / Cliente
                      </p>
                    </div>
                    <p className="text-xl text-slate-100 font-black tracking-tight leading-none pl-1">
                      {project.client_type || "Solución a Medida"}
                    </p>
                  </div>

                  {/* Card: Inversión Estimada */}
                  {project.price && (
                    <div className="rounded-2xl border border-white/10 bg-[#0a0f1c] p-6 shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] -z-10"></div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <FaStar className="text-sm" />
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400/80 font-black">
                          Inversión Estimada
                        </p>
                      </div>
                      <p className="text-2xl text-emerald-400 font-black tracking-tight leading-none pl-1">
                        {project.price}
                      </p>
                    </div>
                  )}

                  {/* Card: Stack Tecnológico */}
                  {project.stack.length > 0 && (
                    <div className="rounded-2xl border border-white/10 bg-[#0a0f1c] p-6 shadow-xl relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] -z-10"></div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                          <FaCode className="text-sm" />
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400/80 font-black">
                          Stack Tecnológico
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {project.stack.map(s => {
                          const tech = TECH_COLORS[s];
                          return tech ? (
                            <span key={s} style={{ backgroundColor: tech.bg, borderColor: tech.border, color: tech.text }} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-black uppercase tracking-wider shadow-sm transition-transform hover:scale-105">
                              {s}
                            </span>
                          ) : (
                            <span key={s} className="px-2.5 py-1 rounded-md border border-white/10 bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                              {s}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                  {/* Acciones Restauradas (Estilo Amarillo/Negro Original) */}
                  <div className="space-y-4">
                    <button
                      onClick={openProjectDemo}
                      disabled={!hasDemoLink}
                      className={`w-full rounded-2xl border px-6 py-5 transition-all flex items-center justify-between font-sans font-bold text-[14px] tracking-widest uppercase group ${
                        hasDemoLink
                          ? "border-amber-400/45 bg-gradient-to-b from-[#17120d] to-[#090807] hover:border-amber-300 hover:from-amber-300 hover:to-amber-500 shadow-[0_10px_32px_rgba(245,158,11,0.2)] text-amber-300 hover:text-black"
                          : "border-white/10 bg-white/[0.04] text-slate-500 cursor-not-allowed opacity-60 shadow-none"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          hasDemoLink
                            ? "border border-amber-400/30 bg-amber-400/10 text-amber-400 group-hover:bg-black group-hover:text-amber-400"
                            : "border border-white/10 bg-white/[0.04] text-slate-500"
                        }`}>
                          <SiGooglechrome className="text-xl" />
                        </div>
                        <span>{hasDemoLink ? "Visitar Proyecto" : "Demo no disponible"}</span>
                      </div>
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                      onClick={openWhatsApp}
                      className="w-full rounded-2xl border border-amber-400/45 bg-gradient-to-b from-[#17120d] to-[#090807] px-6 py-5 hover:border-amber-300 hover:from-amber-300 hover:to-amber-500 transition-all shadow-[0_10px_32px_rgba(245,158,11,0.2)] flex items-center justify-between text-amber-300 hover:text-black font-sans font-bold text-[14px] tracking-widest uppercase group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full border border-amber-400/30 bg-amber-400/10 flex items-center justify-center text-amber-400 group-hover:bg-black group-hover:text-amber-400 transition-all">
                          <SiWhatsapp className="text-xl" />
                        </div>
                        <span>Cotizar Similar</span>
                      </div>
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    {hasRepoLink && (
                      <button
                        onClick={openProjectRepo}
                        className="w-full rounded-2xl border border-amber-400/45 bg-gradient-to-b from-[#17120d] to-[#090807] px-6 py-5 hover:border-amber-300 hover:from-amber-300 hover:to-amber-500 transition-all flex items-center justify-center gap-3 text-amber-300 hover:text-black font-sans font-bold text-[14px] tracking-widest uppercase"
                      >
                        <SiGithub className="text-xl" /> Ver Código Fuente
                      </button>
                    )}
                  </div>

              </motion.div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
