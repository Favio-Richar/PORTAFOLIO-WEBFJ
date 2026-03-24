"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import type { IconType } from 'react-icons';
import { FaArrowRight, FaCode, FaDatabase, FaMobileAlt, FaRocket, FaShoppingCart, FaStar, FaTimes } from 'react-icons/fa';
import { SiGithub, SiGooglechrome, SiWhatsapp } from 'react-icons/si';
import API_BASE from "@/lib/apiBase";
import '@/styles/home-elite.scss';

const BACKEND_URL = API_BASE;
const FALLBACK_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '56971464296';

interface BackendProyecto {
  id: number;
  title?: string;
  description?: string;
  category?: string;
  status?: string;
  image_url?: string;
  video_url?: string | null;
  demo_url?: string | null;
  repo_url?: string | null;
  client_name?: string | null;
  stack?: string | string[];
  results?: string | Record<string, unknown> | null;
}

interface Proyecto {
  id: number;
  title: string;
  description: string;
  category: string;
  featured: boolean;
  active: boolean;
  order_index: number;
  cover_url: string;
  video_url?: string;
  demo_url?: string;
  repo_url?: string;
  stack: string[];
  tags: string[];
  results: string[];
  client_type?: string;
}

const CATEGORY_META: Record<string, {
  label: string;
  icon: IconType;
  topGradient: string;
  badgeClass: string;
  titleClass: string;
  buttonStyle: React.CSSProperties; // Changed to React.CSSProperties
  borderGradient: string; // New property
  cardBackground: string; // New property
  glowColor: string; // New property
}> = {
  web: {
    label: 'Sitio Web',
    icon: FaCode,
    topGradient: 'from-blue-900/70 to-cyan-900/60',
    badgeClass: 'bg-blue-500/15 text-blue-300 border border-blue-400/35',
    titleClass: 'text-sky-200',
    buttonStyle: {
      color: '#93c5fd',
      borderColor: 'rgba(96,165,250,0.55)',
      background: 'rgba(30,58,138,0.25)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '0.625rem 1.25rem', // px-5 py-2.5
      borderRadius: '0.5rem', // rounded-lg
      fontSize: '0.875rem', // text-sm
      fontWeight: '500', // font-medium
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 10px rgba(30,58,138,0.2)', // subtle shadow
    },
    borderGradient: 'linear-gradient(135deg, rgba(56,189,248,0.7), rgba(14,116,144,0.35))',
    cardBackground: 'linear-gradient(170deg, rgba(8,47,73,0.35), rgba(8,14,28,0.94) 60%)',
    glowColor: 'rgba(56,189,248,0.3)',
  },
  ecommerce: {
    label: 'E-Commerce',
    icon: FaShoppingCart,
    topGradient: 'from-emerald-900/70 to-cyan-900/60',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/35',
    titleClass: 'text-pink-200',
    buttonStyle: {
      color: '#86efac',
      borderColor: 'rgba(74,222,128,0.55)',
      background: 'rgba(6,95,70,0.24)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '0.625rem 1.25rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 10px rgba(6,95,70,0.2)',
    },
    borderGradient: 'linear-gradient(135deg, rgba(244,114,182,0.7), rgba(190,24,93,0.35))', // From Backend y APIs
    cardBackground: 'linear-gradient(170deg, rgba(131,24,67,0.32), rgba(8,14,28,0.94) 60%)',
    glowColor: 'rgba(244,114,182,0.28)',
  },
  sistemas: {
    label: 'Sistema',
    icon: FaDatabase,
    topGradient: 'from-violet-900/70 to-indigo-900/60',
    badgeClass: 'bg-violet-500/15 text-violet-300 border border-violet-400/35',
    titleClass: 'text-purple-200',
    buttonStyle: {
      color: '#c4b5fd',
      borderColor: 'rgba(167,139,250,0.55)',
      background: 'rgba(76,29,149,0.24)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '0.625rem 1.25rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 10px rgba(76,29,149,0.2)',
    },
    borderGradient: 'linear-gradient(135deg, rgba(168,85,247,0.7), rgba(126,34,206,0.35))', // From Automatizacion e IA
    cardBackground: 'linear-gradient(170deg, rgba(76,29,149,0.33), rgba(8,14,28,0.94) 60%)',
    glowColor: 'rgba(168,85,247,0.3)',
  },
  apps: {
    label: 'App Movil',
    icon: FaMobileAlt,
    topGradient: 'from-amber-900/70 to-orange-900/60',
    badgeClass: 'bg-amber-500/15 text-amber-300 border border-amber-400/35',
    titleClass: 'text-yellow-200',
    buttonStyle: {
      color: '#fcd34d',
      borderColor: 'rgba(251,191,36,0.55)',
      background: 'rgba(120,53,15,0.24)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '0.625rem 1.25rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 10px rgba(120,53,15,0.2)',
    },
    borderGradient: 'linear-gradient(135deg, rgba(250,204,21,0.72), rgba(202,138,4,0.35))', // From Consultoria Tecnologica
    cardBackground: 'linear-gradient(170deg, rgba(120,53,15,0.34), rgba(8,14,28,0.94) 60%)',
    glowColor: 'rgba(250,204,21,0.3)',
  },
  otro: {
    label: 'Proyecto',
    icon: FaRocket,
    topGradient: 'from-slate-800/75 to-slate-900/70',
    badgeClass: 'bg-slate-500/15 text-slate-300 border border-slate-400/35',
    titleClass: 'text-cyan-200',
    buttonStyle: {
      color: '#cbd5e1',
      borderColor: 'rgba(148,163,184,0.55)',
      background: 'rgba(30,41,59,0.28)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '0.625rem 1.25rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 10px rgba(30,41,59,0.2)',
    },
    borderGradient: 'linear-gradient(135deg, rgba(45,212,191,0.7), rgba(13,148,136,0.35))', // From Optimizacion
    cardBackground: 'linear-gradient(170deg, rgba(17,94,89,0.34), rgba(8,14,28,0.94) 60%)',
    glowColor: 'rgba(45,212,191,0.28)',
  },
};

const FALLBACK_PROJECTS: Proyecto[] = [
  {
    id: 1,
    title: 'Tienda Online Fashion',
    description: 'E-Commerce completo con pagos, inventario y panel de gestion comercial.',
    category: 'ecommerce',
    featured: true,
    active: true,
    order_index: 0,
    cover_url: '',
    video_url: '',
    demo_url: '',
    repo_url: '',
    stack: ['Next.js', 'PostgreSQL'],
    tags: ['Stripe', 'Inventario'],
    results: [],
    client_type: 'Implementacion a medida',
  },
  {
    id: 2,
    title: 'Sistema CRM Corporativo',
    description: 'CRM con automatizacion de leads y tableros para seguimiento de ventas.',
    category: 'sistemas',
    featured: true,
    active: true,
    order_index: 1,
    cover_url: '',
    video_url: '',
    demo_url: '',
    repo_url: '',
    stack: ['React', 'Node.js'],
    tags: ['Leads', 'Pipeline'],
    results: [],
    client_type: 'Implementacion a medida',
  },
  {
    id: 3,
    title: 'Portal Web Corporativo',
    description: 'Sitio enterprise con SEO tecnico, blog y formularios de captacion.',
    category: 'web',
    featured: true,
    active: true,
    order_index: 2,
    cover_url: '',
    video_url: '',
    demo_url: '',
    repo_url: '',
    stack: ['Next.js', 'Vercel'],
    tags: ['SEO', 'CMS'],
    results: [],
    client_type: 'Implementacion a medida',
  },
  {
    id: 4,
    title: 'App de Reservas',
    description: 'Aplicacion para agenda, reservas y notificaciones con alto rendimiento.',
    category: 'apps',
    featured: true,
    active: true,
    order_index: 3,
    cover_url: '',
    video_url: '',
    demo_url: '',
    repo_url: '',
    stack: ['React Native', 'Firebase'],
    tags: ['Agenda', 'Notificaciones'],
    results: [],
    client_type: 'Implementacion a medida',
  },
];

const safeJson = (value: unknown): unknown => {
  if (!value || typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item ?? '').trim()).filter((item) => item.length > 0);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      return toStringArray(parsed);
    } catch {
      return trimmed.split(',').map((item) => item.trim()).filter((item) => item.length > 0);
    }
  }

  return [];
};

const parseProyecto = (item: BackendProyecto): Proyecto => {
  const metaRaw = safeJson(item.results);
  const meta = metaRaw && typeof metaRaw === 'object' && !Array.isArray(metaRaw)
    ? (metaRaw as Record<string, unknown>)
    : {};

  const status = String(item.status || '').toLowerCase();
  const activeByStatus = !['inactivo', 'desactivado', 'archivado'].some((state) => status.includes(state));
  const active = typeof meta.active === 'boolean' ? meta.active : activeByStatus;
  const stackRaw = safeJson(item.stack);
  const tagsRaw = safeJson(meta.tags ?? null);
  const resultsRaw = safeJson(meta.results ?? meta.bullets ?? null);

  return {
    id: Number(item.id),
    title: String(item.title || '').trim(),
    description: String(item.description || '').trim(),
    category: String(item.category || 'otro').trim() || 'otro',
    featured: Boolean(meta.featured),
    active,
    order_index: Number(meta.order_index) || 0,
    cover_url: String(item.image_url || '').trim(),
    video_url: String(item.video_url || '').trim(),
    demo_url: String(item.demo_url || meta.demo_url || meta.demo || '').trim(),
    repo_url: String(item.repo_url || meta.repo_url || meta.github || '').trim(),
    stack: Array.isArray(stackRaw) ? stackRaw.map((entry) => String(entry).trim()).filter(Boolean) : [],
    tags: toStringArray(tagsRaw),
    results: toStringArray(resultsRaw),
    client_type: typeof meta.client_type === 'string'
      ? String(meta.client_type).trim()
      : String(item.client_name || '').trim(),
  };
};

function ProjectSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl p-[1px] overflow-hidden animate-pulse"
      style={{ background: 'linear-gradient(135deg, rgba(100,100,100,0.3), rgba(50,50,50,0.15))' }}
    >
      <div className="relative rounded-2xl h-full" style={{ background: 'linear-gradient(170deg, rgba(15,23,42,0.35), rgba(8,14,28,0.94) 60%)', boxShadow: '0 14px 30px rgba(50,50,50,0.1)' }}>
        <div className="h-44 bg-slate-800/40 rounded-t-xl" />
        <div className="p-5 space-y-3">
          <div className="h-6 w-24 rounded-full bg-slate-700/50" />
          <div className="h-6 w-3/4 rounded bg-slate-700/40" />
          <div className="h-4 w-full rounded bg-slate-800/50" />
          <div className="h-4 w-5/6 rounded bg-slate-800/50" />
          <div className="h-10 w-32 rounded-lg bg-slate-700/40 mt-3" />
        </div>
      </div>
    </motion.div>
  );
}

export default function ProyectosHome() {
  const [projects, setProjects] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Proyecto | null>(null);
  const [contactWhatsapp, setContactWhatsapp] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/api/proyectos`);
        if (!res.ok) throw new Error('No se pudo cargar proyectos');
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('Respuesta invalida');

        const parsed = (data as BackendProyecto[])
          .map(parseProyecto)
          .filter((p) => p.active && p.title.length > 0 && p.description.length > 0)
          .sort((a, b) => a.order_index - b.order_index || a.id - b.id);

        if (isMounted) {
          setProjects(parsed);
        }
      } catch {
        if (isMounted) {
          setProjects(FALLBACK_PROJECTS);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProjects();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchContact = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/contact`, { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        if (cancelled || !data || typeof data !== 'object') return;
        const whatsapp = String((data as any).whatsapp || (data as any).phone || '').trim();
        setContactWhatsapp(whatsapp);
      } catch {
        // fallback env value
      }
    };

    fetchContact();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayProjects = useMemo(() => {
    const source = projects.length > 0 ? projects : FALLBACK_PROJECTS;
    const featured = source.filter((p) => p.featured);
    const nonFeatured = source.filter((p) => !p.featured);
    return [...featured, ...nonFeatured].slice(0, 4);
  }, [projects]);

  const whatsappDigits = useMemo(() => {
    const fromContact = String(contactWhatsapp || '').replace(/\D/g, '');
    if (fromContact.length > 0) return fromContact;
    return String(FALLBACK_WHATSAPP_NUMBER || '').replace(/\D/g, '');
  }, [contactWhatsapp]);

  const normalizeExternalUrl = (rawUrl?: string | null) => {
    const value = String(rawUrl || '').trim();
    if (!value || value === '#' || value.toLowerCase() === 'null' || value.toLowerCase() === 'undefined') return '';
    if (/^https?:\/\//i.test(value)) return value;
    if (/^\/\//.test(value)) return `https:${value}`;
    return `https://${value}`;
  };

  const hasExternalUrl = (rawUrl?: string | null) => Boolean(normalizeExternalUrl(rawUrl));

  const openExternalLink = (rawUrl?: string | null) => {
    const target = normalizeExternalUrl(rawUrl);
    if (!target) return false;
    window.open(target, '_blank', 'noopener,noreferrer');
    return true;
  };

  const openWhatsApp = (projectTitle?: string) => {
    if (!whatsappDigits) return;
    const baseMessage = projectTitle
      ? `Hola, quiero cotizar el proyecto: ${projectTitle}`
      : 'Hola, quiero cotizar un proyecto';
    const url = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(baseMessage)}`;
    window.open(url, '_blank');
  };

  const openProjectDemo = (project: Proyecto) => {
    openExternalLink(project.demo_url);
  };

  const openProjectRepo = (project: Proyecto) => {
    openExternalLink(project.repo_url);
  };

  const selectedVariant = selectedProject
    ? (CATEGORY_META[selectedProject.category] || CATEGORY_META.otro)
    : CATEGORY_META.otro;
  const selectedHasDemoLink = hasExternalUrl(selectedProject?.demo_url);
  const selectedHasRepoLink = hasExternalUrl(selectedProject?.repo_url);

  return (
    <section id="proyectos" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6 border-cyan-400/25">
            <span className="text-cyan-300 mono text-sm">03.</span>
            <span className="text-sm text-slate-300">Proyectos</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display text-white">
            Proyectos <span className="gradient-text">destacados</span>
          </h2>
          <p className="max-w-3xl mx-auto text-base md:text-lg text-slate-300 font-display leading-relaxed">
            Casos desarrollados por FJ Digital Engineering para empresas que necesitaban escalar ventas, optimizar operaciones y acelerar resultados con tecnología.
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {loading
            ? [0, 1, 2, 3].map((index) => <ProjectSkeleton key={index} delay={index * 0.08} />)
            : displayProjects.map((project, index) => {
              const variant = CATEGORY_META[project.category] || CATEGORY_META.otro;
              const Icon = variant.icon;

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: index * 0.08 }}
                  className="group rounded-2xl p-[1px] overflow-hidden"
                  style={{ background: variant.borderGradient }}
                >
                  <div
                    className="relative rounded-2xl h-full transition-all duration-300 group-hover:-translate-y-1 flex flex-col"
                    style={{
                      background: variant.cardBackground,
                      boxShadow: `0 14px 30px ${variant.glowColor}`,
                    }}
                  >
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/7 via-transparent to-white/7 pointer-events-none"></span>

                    <div className={`relative h-44 bg-gradient-to-br ${variant.topGradient} border-b border-white/10 overflow-hidden`}>
                      {project.cover_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={project.cover_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-2xl bg-black/35 border border-white/20 flex items-center justify-center">
                            <Icon className="w-8 h-8 text-white/90" />
                          </div>
                        </div>
                      )}
                      {project.featured && (
                        <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/90 text-[#231603] text-[10px] font-black tracking-wider uppercase">
                          <FaStar className="text-[9px]" />
                          Top
                        </span>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide mb-3 ${variant.badgeClass}`}>
                        {variant.label}
                      </span>

                      <h3 className={`text-xl font-bold mb-2 font-display ${variant.titleClass}`}>{project.title}</h3>
                      <p className="text-slate-300/90 text-sm leading-relaxed mb-5 font-display line-clamp-3">{project.description}</p>

                      <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.98 }} className="mt-auto">
                        <button
                          type="button"
                          onClick={() => setSelectedProject(project)}
                          className="no-underline hover:no-underline relative overflow-hidden group/btn"
                          style={variant.buttonStyle}
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            <span>Ver proyecto</span>
                            <FaArrowRight size={12} />
                          </span>
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" />
                        </button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>

        <div className="flex justify-center mt-10">
          <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.98 }}>
            <Link href="/proyectos" className="projects-cta-animated no-underline hover:no-underline inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm md:text-base font-semibold relative overflow-hidden group/cta">
              <span className="relative z-10 flex items-center gap-2">
                <span>Ver mas proyectos</span>
                <FaArrowRight size={14} />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/cta:translate-x-full transition-transform duration-700 ease-in-out" />
            </Link>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/75 backdrop-blur-sm p-4 md:p-6 flex items-center justify-center"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#090d1a] shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className={`relative h-56 md:h-72 bg-gradient-to-br ${selectedVariant.topGradient} border-b border-white/10 overflow-hidden`}>
                {selectedProject.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedProject.cover_url}
                    alt={selectedProject.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {React.createElement(selectedVariant.icon, { className: 'text-7xl text-white/35' })}
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#090d1a] via-[#090d1a]/35 to-transparent" />

                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-xl border border-white/20 bg-black/50 text-white hover:bg-black/70 transition-colors flex items-center justify-center"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${selectedVariant.badgeClass}`}>
                    {selectedVariant.label}
                  </span>
                  {selectedProject.featured && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-black">
                      <FaStar className="text-[10px]" /> Destacado
                    </span>
                  )}
                </div>

                <h3 className="text-3xl md:text-4xl font-black text-white mb-4">{selectedProject.title}</h3>

                <div className="grid md:grid-cols-3 gap-3 mb-6">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-1">Tipo</p>
                    <p className="text-sm text-slate-100 font-semibold">{selectedProject.client_type || 'Implementacion a medida'}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-1">Stack</p>
                    <p className="text-sm text-slate-100 font-semibold">{selectedProject.stack.length > 0 ? `${selectedProject.stack.length} tecnologias` : 'Definido por alcance'}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-1">Enlaces</p>
                    <p className="text-sm text-slate-100 font-semibold">
                      {[selectedProject.demo_url, selectedProject.repo_url].filter((value) => hasExternalUrl(value)).length} disponibles
                    </p>
                  </div>
                </div>

                <div className="mb-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-cyan-500/[0.03] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200/90 mb-3">Descripcion del proyecto</p>
                  <p className="text-slate-200 leading-relaxed text-base md:text-lg mb-4">{selectedProject.description}</p>

                  {((selectedProject.results && selectedProject.results.length > 0) || selectedProject.tags.length > 0) && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {(selectedProject.results.length > 0 ? selectedProject.results : selectedProject.tags)
                        .slice(0, 4)
                        .map((item) => (
                          <div key={item} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-200">
                            <span className="text-cyan-300 mr-2">•</span>{item}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openProjectRepo(selectedProject)}
                    disabled={!selectedHasRepoLink}
                    className={`rounded-2xl border px-4 py-3 transition-all flex items-center justify-center gap-2 font-sans font-semibold text-sm tracking-normal ${
                      selectedHasRepoLink
                        ? 'border-amber-400/45 bg-gradient-to-b from-[#17120d] to-[#090807] hover:border-amber-300 hover:from-amber-300 hover:to-amber-500 text-amber-300 hover:text-black'
                        : 'border-white/10 bg-white/[0.04] text-slate-500 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <SiGithub className="text-base" /> {selectedHasRepoLink ? 'Ver GitHub' : 'GitHub no disponible'}
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openProjectDemo(selectedProject)}
                    disabled={!selectedHasDemoLink}
                    className={`rounded-2xl border px-4 py-3 transition-all shadow-[0_10px_24px_rgba(245,158,11,0.16)] flex items-center justify-center gap-2 font-sans font-semibold text-sm tracking-normal ${
                      selectedHasDemoLink
                        ? 'border-amber-400/45 bg-gradient-to-b from-[#17120d] to-[#090807] hover:border-amber-300 hover:from-amber-300 hover:to-amber-500 text-amber-300 hover:text-black'
                        : 'border-white/10 bg-white/[0.04] text-slate-500 cursor-not-allowed opacity-60 shadow-none'
                    }`}
                  >
                    <SiGooglechrome className="text-base" /> {selectedHasDemoLink ? 'Ver Demo' : 'Demo no disponible'}
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openWhatsApp(selectedProject.title)}
                    className="rounded-2xl border border-amber-400/45 bg-gradient-to-b from-[#17120d] to-[#090807] px-4 py-3 hover:border-amber-300 hover:from-amber-300 hover:to-amber-500 transition-all shadow-[0_10px_24px_rgba(245,158,11,0.16)] flex items-center justify-center gap-2 text-amber-300 hover:text-black font-sans font-semibold text-sm tracking-normal"
                  >
                    <SiWhatsapp className="text-base" /> Contacto
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => setSelectedProject(null)}
                    className="rounded-2xl border border-amber-400/45 bg-gradient-to-b from-[#17120d] to-[#090807] px-4 py-3 text-amber-300 hover:text-black font-sans font-semibold text-sm tracking-normal hover:border-amber-300 hover:from-amber-300 hover:to-amber-500 transition-all flex items-center justify-center gap-2"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
