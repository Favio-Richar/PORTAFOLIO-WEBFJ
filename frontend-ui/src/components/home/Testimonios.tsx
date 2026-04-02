"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowRight, FaCheckCircle, FaLayerGroup, FaQuoteLeft, FaStar, FaUserCircle } from 'react-icons/fa';
import API_BASE from "@/lib/apiBase";
import '@/styles/home-elite.scss';

const BACKEND_URL = API_BASE;

type ReviewItem = {
  id: number | string;
  author_name: string;
  author_role?: string | null;
  author_company?: string | null;
  author_image?: string | null;
  is_verified?: boolean;
  content: string;
  rating: number;
  created_at?: string | null;
  status?: string | null;
};

type RawReviewItem = Partial<ReviewItem> & {
  avatar_url?: string | null;
  profile_image?: string | null;
  picture?: string | null;
  display_name?: string | null;
  comment?: string | null;
  user?: {
    name?: string | null;
    avatar_url?: string | null;
    picture?: string | null;
    image?: string | null;
  } | null;
};

const FALLBACK_REVIEWS: ReviewItem[] = [
  {
    id: 'fallback-1',
    author_name: 'Cliente sector Salud',
    author_role: 'Direccion Operativa',
    author_company: 'Clinica privada',
    author_image: null,
    is_verified: true,
    content:
      'El sistema nos ordeno agenda, pagos y seguimiento. Bajamos errores operativos y mejoramos la experiencia del paciente.',
    rating: 5,
    created_at: null,
    status: 'approved',
  },
  {
    id: 'fallback-2',
    author_name: 'Cliente sector E-commerce',
    author_role: 'Gerencia Comercial',
    author_company: 'Retail digital',
    author_image: null,
    is_verified: true,
    content:
      'Pasamos de procesos manuales a un flujo claro de venta y postventa. Hoy tenemos mas control y mas conversion.',
    rating: 5,
    created_at: null,
    status: 'approved',
  },
];

const SECTORS = [
  'Clinicas y salud',
  'E-commerce y retail',
  'Servicios profesionales',
  'Educacion y capacitacion',
  'Empresas B2B',
  'Negocios locales',
];

const SECTOR_CHIP_STYLES = [
  'border-cyan-300/30 bg-cyan-500/12 text-cyan-100',
  'border-sky-300/30 bg-sky-500/12 text-sky-100',
  'border-indigo-300/30 bg-indigo-500/12 text-indigo-100',
  'border-violet-300/30 bg-violet-500/12 text-violet-100',
  'border-emerald-300/30 bg-emerald-500/12 text-emerald-100',
  'border-blue-300/30 bg-blue-500/12 text-blue-100',
] as const;

const SECTOR_PANEL_ITEMS = [
  { title: 'Cobertura', value: '6 sectores' },
  { title: 'Casos', value: 'Implementaciones reales' },
  { title: 'Enfoque', value: 'Operacion + conversion' },
];

const STAT_ACCENTS = [
  {
    borderGradient: 'linear-gradient(135deg, rgba(34,211,238,0.65), rgba(14,116,144,0.25))',
    cardBackground: 'linear-gradient(165deg, var(--background-soft), var(--background))',
    glow: '0 14px 30px rgba(8,145,178,0.15)',
  },
  {
    borderGradient: 'linear-gradient(135deg, rgba(96,165,250,0.65), rgba(59,130,246,0.25))',
    cardBackground: 'linear-gradient(165deg, var(--background-soft), var(--background))',
    glow: '0 14px 30px rgba(59,130,246,0.15)',
  },
  {
    borderGradient: 'linear-gradient(135deg, rgba(168,85,247,0.65), rgba(126,34,206,0.25))',
    cardBackground: 'linear-gradient(165deg, var(--background-soft), var(--background))',
    glow: '0 14px 30px rgba(168,85,247,0.15)',
  },
  {
    borderGradient: 'linear-gradient(135deg, rgba(45,212,191,0.65), rgba(13,148,136,0.25))',
    cardBackground: 'linear-gradient(165deg, var(--background-soft), var(--background))',
    glow: '0 14px 30px rgba(13,148,136,0.15)',
  },
] as const;

const sanitizeReviewAvatar = (rawValue?: string | null): string | null => {
  const value = String(rawValue || '').trim();
  if (!value) return null;

  const lower = value.toLowerCase();
  if (lower.includes('via.placeholder.com') || lower.includes('placehold.co')) return null;
  if (value.startsWith('//')) return `https:${value}`;
  if (value.startsWith('/')) return `${BACKEND_URL}${value}`;
  if (lower.startsWith('lh3.googleusercontent.com/')) return `https://${value}`;
  if (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('data:image/')
  ) {
    return value;
  }

  return null;
};

const resolveReviewAvatar = (item: RawReviewItem): string | null => {
  const candidates = [
    item.author_image,
    item.user?.avatar_url,
    item.user?.picture,
    item.user?.image,
    item.avatar_url,
    item.profile_image,
    item.picture,
  ];

  for (const candidate of candidates) {
    const normalized = sanitizeReviewAvatar(candidate || null);
    if (normalized) return normalized;
  }

  return null;
};

const getInitials = (name?: string | null): string => {
  const normalized = String(name || '').trim();
  if (!normalized) return '';

  const tokens = normalized.split(' ').filter(Boolean);
  if (tokens.length === 1) return tokens[0].slice(0, 1).toUpperCase();
  return `${tokens[0][0]}${tokens[1][0]}`.toUpperCase();
};

const sanitizeReviewContent = (rawValue?: string | null): string => {
  const raw = String(rawValue || '').replace(/\s+/g, ' ').trim();
  if (!raw) return '';

  const suspiciousPattern =
    /(google_client_ids|next_public_google_client_id|client_id_anterior|client_id_nuevo|oauth|opcionalmente\s+varios\s+client|separados\s+por\s+coma|estado\s+pendiente\s+hasta\s+aprobacion|resena\s+quedara\s+en\s+estado\s+pendiente)/i;

  const quotedSegments = Array.from(raw.matchAll(/"([^"]+)"/g))
    .map((match) => String(match[1] || '').trim())
    .filter(Boolean);

  if (suspiciousPattern.test(raw)) {
    const cleanSegment = quotedSegments.find(
      (segment) => !suspiciousPattern.test(segment) && segment.length >= 12
    );
    return cleanSegment || '';
  }

  return raw;
};

const normalizeReview = (item: RawReviewItem): ReviewItem => {
  const authorName =
    String(item.author_name || item.display_name || item.user?.name || '').trim() || 'Cliente';
  const rawContent = String(item.content || item.comment || '').replace(/\s+/g, ' ').trim();
  const sanitizedContent = sanitizeReviewContent(rawContent);
  const content =
    sanitizedContent ||
    (rawContent
      ? 'Resena verificada mediante Google. Comentario disponible en detalle.'
      : '');
  const rating = Math.max(1, Math.min(5, Number(item.rating || 5)));
  const authorImage = resolveReviewAvatar(item);

  return {
    id: item.id || `${authorName}-${content.slice(0, 10)}`,
    author_name: authorName,
    author_role: item.author_role || null,
    author_company: item.author_company || null,
    author_image: authorImage,
    // Verified in home means: backend verified + avatar available.
    is_verified: Boolean(item.is_verified && authorImage),
    content,
    rating,
    created_at: item.created_at || null,
    status: item.status || null,
  };
};

const getReviewDateLabel = (iso?: string | null): string => {
  if (!iso) return 'Reciente';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Reciente';

  return date
    .toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
    .replace('.', '');
};

export default function Testimonios() {
  const [reviewSummary, setReviewSummary] = useState({ average: 4.9, total: 50 });
  const [featuredReviews, setFeaturedReviews] = useState<ReviewItem[]>(FALLBACK_REVIEWS);
  const [reviewPairIndex, setReviewPairIndex] = useState(0);
  const [avatarLoadErrors, setAvatarLoadErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;

    const loadPaginatedReviews = async (context?: string): Promise<RawReviewItem[]> => {
      const pageSize = 40;
      const maxPages = 25;
      const collected: RawReviewItem[] = [];
      const contextParam = context ? `&page_context=${encodeURIComponent(context)}` : '';

      for (let page = 1; page <= maxPages; page++) {
        const response = await fetch(
          `${BACKEND_URL}/api/reviews?page=${page}&page_size=${pageSize}${contextParam}`
        );
        if (!response.ok) break;

        const payload = await response.json();
        const items = Array.isArray(payload?.items)
          ? payload.items
          : (Array.isArray(payload) ? payload : []);

        if (!Array.isArray(items) || items.length === 0) break;
        collected.push(...(items as RawReviewItem[]));

        const totalPages = Number(payload?.total_pages || payload?.pages || 0);
        const hasNextFlag = Boolean(payload?.has_next || payload?.next_page || payload?.next);
        const inferredHasNext = items.length === pageSize;

        if (!(hasNextFlag || (totalPages > 0 && page < totalPages) || inferredHasNext)) {
          break;
        }
      }

      return collected;
    };

    const loadServicePageReviews = async (context?: string): Promise<RawReviewItem[]> => {
      try {
        const contextParam = context ? `?page_context=${encodeURIComponent(context)}` : '';
        const response = await fetch(`${BACKEND_URL}/api/services-page/reviews${contextParam}`);
        if (!response.ok) return [];
        const payload = await response.json();
        return Array.isArray(payload) ? (payload as RawReviewItem[]) : [];
      } catch {
        return [];
      }
    };

    const loadReviews = async () => {
      try {
        // Load reviews from both endpoints because some deployments expose avatar
        // data only in /api/services-page/reviews.
        const [mainGlobal, serviceGlobal] = await Promise.all([
          loadPaginatedReviews(),
          loadServicePageReviews(),
        ]);
        let merged = [...serviceGlobal, ...mainGlobal];

        // Fallback by known contexts if backend instance does not return global items.
        if (merged.length === 0) {
          const contexts = ['clientes', 'proyectos', 'servicios', 'blog', 'sobre-mi', 'contacto', 'asesoria'];
          const groups = await Promise.all(
            contexts.map(async (context) => {
              const [main, service] = await Promise.all([
                loadPaginatedReviews(context),
                loadServicePageReviews(context),
              ]);
              return [...service, ...main];
            })
          );
          merged = groups.flat();
        }

        if (!isMounted) return;
        if (merged.length === 0) return;

        const normalized = merged
          .map((item) => normalizeReview(item as RawReviewItem))
          .filter(
            (item) =>
              item.content.length >= 20 ||
              Boolean(item.is_verified && item.author_image)
          )
          .filter((item) => String(item.status || 'approved').toLowerCase() !== 'rejected');

        const sourceReviews = normalized.length > 0 ? normalized : FALLBACK_REVIEWS;

        const ratings = sourceReviews
          .map((item) => Number(item.rating))
          .filter((value) => !Number.isNaN(value) && value > 0);

        if (ratings.length > 0) {
          const average = ratings.reduce((sum, value) => sum + value, 0) / ratings.length;
          setReviewSummary({
            average: Number(average.toFixed(1)),
            total: sourceReviews.length,
          });
        }

        const dedupedMap = new Map<string, ReviewItem>();
        sourceReviews.forEach((review) => {
          const idKey = String(review.id || '').trim();
          const fallbackKey = `${String(review.author_name).toLowerCase()}-${String(review.content).toLowerCase()}-${String(review.created_at || '').toLowerCase()}`;
          const key = idKey || fallbackKey;
          if (!dedupedMap.has(key)) {
            dedupedMap.set(key, review);
          }
        });

        const deduped = Array.from(dedupedMap.values()).sort((a, b) => {
          // Priority rule:
          // 1) Verified reviews always first (regardless of rating)
          // 2) Newest first
          // 3) Stable fallback by id
          const verifiedDiff = Number(Boolean(b.is_verified)) - Number(Boolean(a.is_verified));
          if (verifiedDiff !== 0) return verifiedDiff;

          const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
          if (aDate !== bDate) return bDate - aDate;

          const aId = Number(a.id);
          const bId = Number(b.id);
          if (!Number.isNaN(aId) && !Number.isNaN(bId) && aId !== bId) {
            return bId - aId;
          }
          return 0;
        });

        const verifiedWithPhoto = deduped.filter(
          (review) => Boolean(review.is_verified && review.author_image)
        );
        const remainingReviews = deduped.filter(
          (review) => !(review.is_verified && review.author_image)
        );
        const prioritizedReviews =
          verifiedWithPhoto.length > 0
            ? [...verifiedWithPhoto, ...remainingReviews]
            : deduped;

        if (prioritizedReviews.length > 0) {
          setFeaturedReviews(prioritizedReviews);
          setReviewPairIndex(0);
        }
      } catch (error) {
        console.error('Error loading home trust reviews:', error);
      }
    };

    void loadReviews();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (featuredReviews.length <= 2) return;

    const totalPairs = Math.ceil(featuredReviews.length / 2);
    const interval = window.setInterval(() => {
      setReviewPairIndex((prev) => (prev + 1) % totalPairs);
    }, 7000);

    return () => window.clearInterval(interval);
  }, [featuredReviews]);

  const visibleReviews = useMemo(() => {
    if (featuredReviews.length <= 2) return featuredReviews;

    const totalPairs = Math.ceil(featuredReviews.length / 2);
    const safePairIndex = reviewPairIndex % totalPairs;
    const start = safePairIndex * 2;
    return featuredReviews.slice(start, start + 2);
  }, [featuredReviews, reviewPairIndex]);

  const stats = useMemo(
    () => [
      { value: '50+', label: 'Proyectos entregados', helper: 'Web, e-commerce y sistemas' },
      { value: '8+', label: 'Anos de experiencia', helper: 'Consultoria y desarrollo' },
      { value: `${reviewSummary.average.toFixed(1)}/5`, label: 'Calificacion promedio', helper: `${reviewSummary.total} resenas` },
      { value: '<24h', label: 'Respuesta inicial', helper: 'Canal directo por WhatsApp' },
    ],
    [reviewSummary]
  );

  return (
    <section id="confianza" className="py-24 px-6 bg-[var(--background)]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-5 border border-[var(--border)] bg-[var(--background-card)]">
            <span className="text-cyan-500 font-bold mono text-sm">07.</span>
            <span className="text-sm text-[var(--text-body)]">Confianza y resultados</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-title)] font-display mb-3">
            Trabajo real con <span className="gradient-text">impacto medible</span>
          </h2>
          <p className="max-w-3xl mx-auto text-[var(--text-body)] font-display text-base md:text-lg leading-relaxed">
            No trabajamos con promesas vacias. Mostramos resultados, proceso y feedback real de clientes en distintos sectores.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
          {stats.map((stat, idx) => {
            const accent = STAT_ACCENTS[idx] || STAT_ACCENTS[0];
            return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ duration: 0.35 }}
              className="group rounded-xl p-[1px] overflow-hidden"
              style={{ background: accent.borderGradient }}
            >
              <div
                className="relative rounded-xl p-4 md:p-5 text-center border border-white/5 overflow-hidden"
                style={{ background: accent.cardBackground, boxShadow: accent.glow }}
              >
                <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/8 via-transparent to-white/8" />
                <span className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-24 h-14 bg-white/10 blur-2xl opacity-30" />
                <p className="relative text-3xl md:text-4xl font-black gradient-text mb-2 font-display">{stat.value}</p>
                <p className="relative text-slate-100 text-sm font-semibold font-display">{stat.label}</p>
                <p className="relative text-slate-400 text-xs mt-1 font-display">{stat.helper}</p>
              </div>
            </motion.div>
          );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.35 }}
            className="glass-card relative overflow-hidden rounded-2xl p-6 md:p-7 border-cyan-400/20 bg-[linear-gradient(165deg,rgba(9,12,22,0.9),rgba(7,10,18,0.96))]"
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-8 -left-10 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="absolute -bottom-8 right-10 w-36 h-36 rounded-full bg-emerald-400/8 blur-3xl" />
              <div className="absolute inset-0 bg-[linear-gradient(155deg,rgba(255,255,255,0.03),rgba(255,255,255,0)_32%)]" />
            </div>

            <div className="relative z-10 h-full flex flex-col">
            <div className="inline-flex w-fit items-center gap-2 px-3 py-1.5 mb-4 rounded-full border border-cyan-300/25 bg-cyan-500/10 text-cyan-100 text-[11px] font-semibold tracking-wide">
              <FaLayerGroup className="text-[11px]" />
              Sectores activos de implementacion
            </div>
            <h3 className="text-xl font-bold text-white font-display mb-3">Sectores con los que trabajamos</h3>
            <p className="text-slate-300 text-sm md:text-base font-display mb-5">
              Si no podemos mostrar logos por privacidad, mostramos donde ya hemos implementado procesos, sitios y sistemas.
            </p>
            <div className="grid sm:grid-cols-2 gap-2.5 mb-6">
              {SECTORS.map((sector, sectorIndex) => (
                <motion.span
                  key={sector}
                  whileHover={{ y: -1, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className={`inline-flex items-center justify-center px-3 py-2 rounded-full border text-xs font-semibold transition-colors ${SECTOR_CHIP_STYLES[sectorIndex] || SECTOR_CHIP_STYLES[0]}`}
                >
                  <span className="mr-1.5 w-1.5 h-1.5 rounded-full bg-white/80" />
                  {sector}
                </motion.span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 text-xs text-emerald-200">
                <FaCheckCircle className="text-emerald-300" />
                Casos y procesos auditables en cada proyecto
              </span>
              <Link
                href="/clientes/casos-completos"
                className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-300/35 bg-cyan-500/12 hover:bg-cyan-500/18 text-cyan-100 text-xs font-semibold transition-colors"
              >
                <span>Ver casos completos</span>
                <FaArrowRight size={11} />
              </Link>
            </div>

            <div className="mt-6 pt-5 border-t border-white/10 grid sm:grid-cols-3 gap-3">
              {SECTOR_PANEL_ITEMS.map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3"
                >
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">{item.title}</p>
                  <p className="text-xs text-slate-200 font-semibold leading-relaxed">{item.value}</p>
                </motion.div>
              ))}
            </div>
            </div>
          </motion.div>

          <motion.div
            viewport={{ once: true }}
            transition={{ delay: 0.06 }}
            className="glass-card relative overflow-hidden rounded-2xl p-6 md:p-7 border border-[var(--border)] bg-[var(--background-soft)] flex flex-col"
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-6 -right-8 w-36 h-36 rounded-full bg-cyan-400/10 blur-3xl" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-slate-300/10 blur-3xl" />
              <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.03),rgba(255,255,255,0)_35%)]" />
            </div>

            <div className="relative z-10 flex h-full flex-col">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-xl font-bold text-[var(--text-title)] font-display">Resenas recientes de clientes</h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-300/30 bg-emerald-500/10 text-emerald-200 text-[10px] font-semibold uppercase tracking-wide">
                  <FaCheckCircle className="text-[9px]" />
                  Verificadas primero
                </span>
              </div>
              <div className="space-y-4 flex-1">
                {visibleReviews.map((review, idx) => (
                  <motion.article
                    key={`${review.id}-${reviewPairIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.08 }}
                    whileHover={{ y: -2 }}
                    className="rounded-xl border border-[var(--border)] bg-[var(--background-card)] p-4 shadow-sm transition-colors duration-300 hover:border-cyan-500/30 min-h-[176px]"
                  >
                    <motion.div
                      initial={{ opacity: 0.3, scaleX: 0.92 }}
                      whileInView={{ opacity: 0.6, scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.45, delay: 0.1 + idx * 0.06 }}
                      className="h-px w-full bg-gradient-to-r from-transparent via-cyan-200/45 to-transparent mb-3 origin-center"
                    />

                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        {review.author_image && !avatarLoadErrors[String(review.id)] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={review.author_image}
                            alt={review.author_name}
                            onError={() =>
                              setAvatarLoadErrors((prev) => ({
                                ...prev,
                                [String(review.id)]: true,
                              }))
                            }
                            className="w-10 h-10 rounded-full object-cover border border-cyan-300/35 shadow-[0_0_0_2px_rgba(8,145,178,0.12)]"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full border border-cyan-300/30 bg-cyan-500/12 flex items-center justify-center text-cyan-100 font-bold text-sm">
                            {getInitials(review.author_name) || <FaUserCircle className="text-base text-cyan-200" />}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-white font-display truncate">{review.author_name}</p>
                            {review.is_verified && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-emerald-300/30 bg-emerald-500/10 text-emerald-200 text-[10px] font-semibold">
                                <FaCheckCircle className="text-[9px]" />
                                Verificada
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 font-display">
                            {[review.author_role, review.author_company].filter(Boolean).join('  -  ') || 'Cliente verificado'}  -  {getReviewDateLabel(review.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: review.rating }).map((_, index) => (
                          <FaStar key={`${review.id}-star-${index}`} className="text-[12px]" />
                        ))}
                      </div>
                    </div>
                    <div className="relative pl-3">
                      <span className="absolute left-0 top-1 h-[calc(100%-0.55rem)] w-[2px] rounded-full bg-gradient-to-b from-cyan-300/55 to-transparent" />
                      <p className="text-sm text-slate-200/95 font-display leading-relaxed">
                        <FaQuoteLeft className="inline-block text-cyan-300 mr-2 text-[12px]" />
                        {review.content}
                      </p>
                    </div>
                  </motion.article>
                ))}
              </div>
              <div className="mt-4 h-5 flex items-center justify-center gap-2">
                {featuredReviews.length > 2 &&
                  Array.from({ length: Math.ceil(featuredReviews.length / 2) }).map((_, idx) => (
                    <button
                      key={`review-pair-${idx}`}
                      type="button"
                      aria-label={`Mostrar bloque ${idx + 1} de resenas`}
                      onClick={() => setReviewPairIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        reviewPairIndex === idx
                          ? 'w-5 bg-cyan-300/90'
                          : 'w-1.5 bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
              </div>

              <div className="mt-auto pt-5 flex justify-end">
                <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/contacto"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-300/35 bg-emerald-500/12 hover:bg-emerald-500/18 text-emerald-100 text-xs font-semibold transition-colors"
                  >
                    <span>Solicitar diagnostico</span>
                    <FaArrowRight size={11} />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


