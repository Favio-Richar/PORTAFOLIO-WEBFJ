"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaArrowRight,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaEye,
  FaNewspaper,
  FaRegLightbulb,
} from 'react-icons/fa';
import API_BASE from "@/lib/apiBase";
import '@/styles/home-elite.scss';

const BACKEND_URL = API_BASE;

interface BackendBlogRecord {
  id: number;
  title?: string;
  content?: string;
  category?: string;
  created_at?: string;
  is_published?: boolean;
}

interface BlogPreview {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  views: string;
}

const CATEGORY_IMAGE_FALLBACK: Record<string, string> = {
  reservas: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200',
  facturas: 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=1200',
  seguridad: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200',
  ecommerce: 'https://images.unsplash.com/photo-1556742049-02e45308b01e?auto=format&fit=crop&q=80&w=1200',
  industria: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200',
  estrategia: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
};

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200';

const FALLBACK_POSTS: BlogPreview[] = [
  {
    id: 1,
    title: 'Como un sistema de reservas aumento 200% las ventas de un hotel',
    excerpt: 'Caso real: reservas online, cobro automatizado y operacion en tiempo real para escalar sin caos operativo.',
    category: 'Casos de Exito',
    date: '15 Ene 2024',
    readTime: '5 min',
    image: CATEGORY_IMAGE_FALLBACK.reservas,
    views: '4.0K',
  },
  {
    id: 2,
    title: 'Guia completa: que sistema de facturacion conviene para una empresa en crecimiento',
    excerpt: 'Comparativa practica para decidir entre procesos manuales, sistemas basicos y plataforma integrada.',
    category: 'Guias Practicas',
    date: '12 Ene 2024',
    readTime: '8 min',
    image: CATEGORY_IMAGE_FALLBACK.facturas,
    views: '5.1K',
  },
  {
    id: 5,
    title: 'Seguridad web para empresas: controles minimos para operar sin riesgo',
    excerpt: 'Checklist tecnico para proteger datos, reputacion y continuidad del servicio en proyectos reales.',
    category: 'Seguridad',
    date: '05 Ene 2024',
    readTime: '6 min',
    image: CATEGORY_IMAGE_FALLBACK.seguridad,
    views: '6.3K',
  },
];

const stripMarkup = (content: string): string =>
  content
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[[^\]]*]\(([^)]+)\)/g, ' ')
    .replace(/[^\S\r\n]+/g, ' ')
    .trim();

const estimateReadTime = (content: string): string => {
  const plain = stripMarkup(content);
  const words = plain ? plain.split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.round(words / 190));
  return `${minutes} min`;
};

const formatPostDate = (iso?: string): string => {
  if (!iso) return 'Reciente';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Reciente';
  return date
    .toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
    .replace('.', '');
};

const extractFirstImage = (content: string): string | null => {
  if (!content) return null;

  const htmlMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (htmlMatch?.[1]) return htmlMatch[1];

  const markdownMatch = content.match(/!\[[^\]]*]\((https?:\/\/[^)]+)\)/i);
  if (markdownMatch?.[1]) return markdownMatch[1];

  return null;
};

const resolveCategoryImage = (category?: string): string => {
  const normalized = (category || '').toLowerCase();
  if (normalized.includes('seguridad')) return CATEGORY_IMAGE_FALLBACK.seguridad;
  if (normalized.includes('guia') || normalized.includes('factura')) return CATEGORY_IMAGE_FALLBACK.facturas;
  if (normalized.includes('caso') || normalized.includes('reserva')) return CATEGORY_IMAGE_FALLBACK.reservas;
  if (normalized.includes('industria')) return CATEGORY_IMAGE_FALLBACK.industria;
  if (normalized.includes('estrategia')) return CATEGORY_IMAGE_FALLBACK.estrategia;
  if (normalized.includes('ecommerce')) return CATEGORY_IMAGE_FALLBACK.ecommerce;
  return DEFAULT_IMAGE;
};

const mapBackendBlogToPreview = (item: BackendBlogRecord): BlogPreview => {
  const plain = stripMarkup(item.content || '');
  const excerpt = plain.length > 138 ? `${plain.slice(0, 137)}...` : plain;
  const image = extractFirstImage(item.content || '') || resolveCategoryImage(item.category);
  const syntheticViews = `${(3 + ((item.id || 1) % 6) * 0.7).toFixed(1)}K`;

  return {
    id: item.id,
    title: item.title || 'Articulo sin titulo',
    excerpt: excerpt || 'Contenido tecnico y practico para apoyar decisiones reales de negocio.',
    category: item.category || 'General',
    date: formatPostDate(item.created_at),
    readTime: estimateReadTime(item.content || ''),
    image,
    views: syntheticViews,
  };
};

const CARD_ACCENTS = [
  {
    borderGradient: 'linear-gradient(135deg, rgba(34,211,238,0.7), rgba(14,116,144,0.35))',
    buttonClass: 'text-cyan-200 border-cyan-300/40 bg-cyan-500/10 hover:bg-cyan-500/15',
  },
  {
    borderGradient: 'linear-gradient(135deg, rgba(168,85,247,0.72), rgba(126,34,206,0.35))',
    buttonClass: 'text-purple-200 border-purple-300/40 bg-purple-500/10 hover:bg-purple-500/15',
  },
  {
    borderGradient: 'linear-gradient(135deg, rgba(45,212,191,0.72), rgba(13,148,136,0.35))',
    buttonClass: 'text-emerald-200 border-emerald-300/40 bg-emerald-500/10 hover:bg-emerald-500/15',
  },
] as const;

export default function BlogHome() {
  const [posts, setPosts] = useState<BlogPreview[]>(FALLBACK_POSTS);

  useEffect(() => {
    let isMounted = true;

    const loadPosts = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/blog/`);
        if (!response.ok) return;

        const payload = await response.json();
        if (!Array.isArray(payload) || payload.length === 0) return;

        const mapped = payload
          .filter((item: BackendBlogRecord) => item?.id && item?.title && item?.content && item?.is_published !== false)
          .sort((a: BackendBlogRecord, b: BackendBlogRecord) => {
            const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
            const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
            return bTime - aTime;
          })
          .map(mapBackendBlogToPreview)
          .slice(0, 3);

        if (isMounted && mapped.length > 0) {
          setPosts(mapped);
        }
      } catch (error) {
        console.error('Error loading blog previews', error);
      }
    };

    void loadPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  const displayPosts = useMemo(() => {
    if (posts.length >= 3) return posts.slice(0, 3);

    const missing = 3 - posts.length;
    return [...posts, ...FALLBACK_POSTS.slice(0, missing)].slice(0, 3);
  }, [posts]);

  const featured = displayPosts[0];
  const sidePosts = displayPosts.slice(1);

  if (!featured) return null;

  return (
    <section id="blog" className="relative py-24 px-6 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-12 w-64 h-64 rounded-full bg-indigo-500/12 blur-3xl" />
        <div className="absolute bottom-0 right-8 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6 border border-[var(--border)] bg-[var(--background-card)]">
            <span className="text-cyan-500 font-bold mono text-sm">05.</span>
            <span className="text-sm text-[var(--text-body)]">Blog</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display text-[var(--text-title)]">
            Insights tecnicos para <span className="gradient-text">decisiones de negocio</span>
          </h2>

          <p className="max-w-3xl mx-auto text-base md:text-lg text-[var(--text-body)] font-display leading-relaxed">
            Publicamos casos reales, guias accionables y criterios de arquitectura para ayudarte a vender mas, reducir errores y escalar con control.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--border)] bg-[var(--background-soft)] text-xs font-semibold text-[var(--text-body)]">
              <FaNewspaper className="text-cyan-500" /> Casos aplicados
            </span>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--border)] bg-[var(--background-soft)] text-xs font-semibold text-[var(--text-body)]">
              <FaRegLightbulb className="text-amber-500" /> Guias sin relleno
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.article
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="group lg:col-span-2 rounded-3xl p-[1px] overflow-hidden"
            style={{ background: CARD_ACCENTS[0].borderGradient }}
          >
            <div className="rounded-3xl h-full bg-[var(--background-soft)] overflow-hidden flex flex-col">
              <div className="relative min-h-[430px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--background-soft)] via-[var(--background-soft)]/80 to-transparent" />
                <div className="relative p-6 md:p-8 h-full flex flex-col justify-end">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex px-3 py-1 rounded-full bg-[var(--background-card)] border border-[var(--border)] text-[var(--text-title)] text-xs font-bold uppercase tracking-wide">
                      {featured.category}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--background-card)]/50 border border-[var(--border)] text-[var(--text-body)] text-xs">
                      <FaCalendarAlt className="text-[10px]" /> {featured.date}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/35 border border-white/15 text-slate-200 text-xs">
                      <FaClock className="text-[10px]" /> {featured.readTime}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/35 border border-white/15 text-slate-200 text-xs">
                      <FaEye className="text-[10px]" /> {featured.views}
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-black text-[var(--text-title)] font-display leading-tight max-w-3xl mb-3">
                    {featured.title}
                  </h3>
                  <p className="text-[var(--text-body)] opacity-90 text-base md:text-lg font-display leading-relaxed max-w-2xl mb-5">
                    {featured.excerpt}
                  </p>

                  <Link
                    href={`/blog/${featured.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-cyan-300/40 bg-cyan-500/10 hover:bg-cyan-500/15 text-cyan-100 text-sm font-semibold w-fit transition-colors"
                  >
                    <span>Leer articulo</span>
                    <FaArrowRight size={12} />
                  </Link>
                </div>
              </div>

              <div className="p-5 md:p-6 border-t border-[var(--border-strong)] bg-[var(--background-card)]">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-500 font-bold mb-3">Como aplicarlo en tu negocio</p>
                <div className="grid sm:grid-cols-3 gap-3 mb-4">
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--background-soft)] p-3">
                    <p className="text-[11px] text-cyan-600 dark:text-cyan-200 font-semibold mb-1">Diagnostico inicial</p>
                    <p className="text-xs text-[var(--text-body)]">En 72h definimos mejoras y prioridades.</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--background-soft)] p-3">
                    <p className="text-[11px] text-cyan-600 dark:text-cyan-200 font-semibold mb-1">Roadmap ejecutable</p>
                    <p className="text-xs text-[var(--text-body)]">Plan por fases con tiempo y alcance claro.</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--background-soft)] p-3">
                    <p className="text-[11px] text-cyan-600 dark:text-cyan-200 font-semibold mb-1">Implementacion guiada</p>
                    <p className="text-xs text-[var(--text-body)]">Soporte tecnico y seguimiento real.</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 text-xs text-slate-200">
                    <FaCheckCircle className="text-emerald-300" />
                    Sin costo en la primera evaluacion tecnica
                  </span>
                  <Link
                    href="/contacto"
                    className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-300/35 bg-emerald-500/12 hover:bg-emerald-500/20 text-emerald-100 text-xs font-semibold transition-colors"
                  >
                    <span>Solicitar diagnostico</span>
                    <FaArrowRight size={11} />
                  </Link>
                </div>
              </div>
            </div>
          </motion.article>

          <div className="space-y-6">
            {sidePosts.map((post, index) => {
              const accent = CARD_ACCENTS[index + 1] || CARD_ACCENTS[2];

              return (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="group rounded-2xl p-[1px] overflow-hidden"
                  style={{ background: accent.borderGradient }}
                >
                  <div className="rounded-2xl bg-[var(--background-card)] overflow-hidden">
                    <div className="relative h-36 overflow-hidden border-b border-[var(--border)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.image}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--background-card)]/85 to-transparent" />
                      <span className="absolute top-3 left-3 inline-flex px-2.5 py-1 rounded-full bg-black/40 border border-white/20 text-[10px] font-bold text-white uppercase tracking-wide">
                        {post.category}
                      </span>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] mb-2 mono">
                        <span className="inline-flex items-center gap-1"><FaCalendarAlt className="text-[10px]" /> {post.date}</span>
                        <span className="inline-flex items-center gap-1"><FaClock className="text-[10px]" /> {post.readTime}</span>
                      </div>

                      <h3 className="text-base font-bold text-[var(--text-title)] font-display leading-snug mb-2 line-clamp-2">{post.title}</h3>
                      <p className="text-[var(--text-body)] text-sm font-display leading-relaxed line-clamp-2 mb-3">{post.excerpt}</p>

                      <Link
                        href={`/blog/${post.id}`}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors ${accent.buttonClass}`}
                      >
                        <span>Leer articulo</span>
                        <FaArrowRight size={11} />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.98 }}>
            <Link href="/blog" className="services-cta-animated inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm md:text-base font-semibold">
              <span>Ver blog completo</span>
              <FaArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
