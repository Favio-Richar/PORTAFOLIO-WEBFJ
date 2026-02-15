"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaChartLine,
  FaExternalLinkAlt,
  FaPlayCircle,
  FaShieldAlt,
  FaUsers,
} from "react-icons/fa";

type MediaType = "image" | "video";

interface CaseMediaItem {
  type: MediaType;
  url: string;
  caption?: string;
}

interface CaseKpi {
  label: string;
  before: string;
  after: string;
  improvement: string;
}

interface CaseTimelineItem {
  phase: string;
  summary: string;
  duration?: string;
}

interface FullCase {
  id: number;
  slug: string;
  company_name: string;
  client_name: string;
  client_role: string;
  industry: string;
  year: string;
  country: string;
  website_url: string;
  logo_url: string;
  cover_image_url: string;
  cover_video_url: string;
  headline: string;
  summary: string;
  challenge: string;
  solution: string;
  impact: string;
  testimonial: string;
  services: string[];
  technologies: string[];
  kpis: CaseKpi[];
  timeline: CaseTimelineItem[];
  gallery: CaseMediaItem[];
  is_featured: boolean;
}

const API_BASE = "http://localhost:8000/api";

function parseArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed as T[];
    } catch {
      return [];
    }
  }
  return [];
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeCase(raw: unknown): FullCase {
  const data = (raw ?? {}) as Record<string, unknown>;
  return {
    id: typeof data.id === "number" ? data.id : 0,
    slug: asString(data.slug),
    company_name: asString(data.company_name),
    client_name: asString(data.client_name),
    client_role: asString(data.client_role),
    industry: asString(data.industry) || "General",
    year: asString(data.year),
    country: asString(data.country),
    website_url: asString(data.website_url),
    logo_url: asString(data.logo_url),
    cover_image_url: asString(data.cover_image_url),
    cover_video_url: asString(data.cover_video_url),
    headline: asString(data.headline),
    summary: asString(data.summary),
    challenge: asString(data.challenge),
    solution: asString(data.solution),
    impact: asString(data.impact),
    testimonial: asString(data.testimonial),
    services: parseArray<string>(data.services),
    technologies: parseArray<string>(data.technologies),
    kpis: parseArray<CaseKpi>(data.kpis),
    timeline: parseArray<CaseTimelineItem>(data.timeline),
    gallery: parseArray<CaseMediaItem>(data.gallery),
    is_featured: Boolean(data.is_featured),
  };
}

export default function CasosCompletosPage() {
  const [cases, setCases] = useState<FullCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState("todos");
  const [selectedCase, setSelectedCase] = useState<FullCase | null>(null);

  useEffect(() => {
    async function loadCases() {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/casos-completos?published_only=true`);
        if (!response.ok) throw new Error("No se pudieron cargar los casos completos");
        const data = await response.json();
        setCases((data || []).map(normalizeCase));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadCases();
  }, []);

  const industries = useMemo(() => {
    const list = Array.from(new Set(cases.map((item) => item.industry?.toLowerCase()).filter(Boolean)));
    return ["todos", ...list];
  }, [cases]);

  const filteredCases = useMemo(() => {
    if (selectedIndustry === "todos") return cases;
    return cases.filter((item) => item.industry?.toLowerCase() === selectedIndustry);
  }, [cases, selectedIndustry]);

  const featuredCount = useMemo(() => cases.filter((item) => item.is_featured).length, [cases]);
  const totalKpis = useMemo(() => cases.reduce((sum, item) => sum + item.kpis.length, 0), [cases]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1c1207_0%,#0f1116_45%,#0a0d13_100%)] text-stone-100">
      <section className="px-6 pt-16 pb-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/clientes"
            className="inline-flex items-center gap-2 px-4 py-2 border border-amber-700/40 bg-amber-950/25 text-amber-300 text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-amber-900/30 transition-all"
          >
            <FaArrowLeft /> Volver a Clientes
          </Link>

          <div className="mt-8 grid lg:grid-cols-2 gap-10 items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-300 mb-4">Casos Completos</p>
              <h1 className="text-5xl md:text-6xl font-black leading-[1.05] tracking-tight mb-5">
                Evidencia Real de
                <span className="block text-amber-200">Resultados con Clientes</span>
              </h1>
              <p className="text-stone-400 max-w-2xl leading-relaxed">
                Aquí no mostramos promesas. Mostramos procesos, decisiones, métricas y evolución real de proyectos con clientes.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <StatCard icon={<FaUsers />} value={`${cases.length}`} label="Casos Publicados" />
              <StatCard icon={<FaShieldAlt />} value={`${featuredCount}`} label="Casos Destacados" />
              <StatCard icon={<FaChartLine />} value={`${totalKpis}`} label="KPIs Documentados" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-3">
          {industries.map((industry) => (
            <button
              key={industry}
              onClick={() => setSelectedIndustry(industry)}
              className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                selectedIndustry === industry
                  ? "bg-amber-600 text-black border-amber-500"
                  : "bg-white/[0.02] text-stone-300 border-white/15 hover:border-amber-700/45"
              }`}
            >
              {industry}
            </button>
          ))}
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="py-32 text-center text-stone-500 font-black uppercase tracking-[0.25em] text-xs">Cargando casos...</div>
          ) : filteredCases.length === 0 ? (
            <div className="py-32 text-center border border-white/10 bg-black/20 rounded-3xl">
              <p className="text-stone-400 font-black uppercase tracking-[0.25em] text-xs">No hay casos en esta categoría</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7">
              {filteredCases.map((item, i) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: i * 0.05 }}
                  className="rounded-[2rem] border border-[#3f3324] bg-[#131720]/92 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.35)] group"
                >
                  <div className="aspect-[16/10] bg-black/50 relative">
                    {item.cover_image_url ? (
                      <img src={item.cover_image_url} alt={item.company_name} className="w-full h-full object-cover opacity-75 group-hover:opacity-95 transition-all" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-500 text-xs uppercase tracking-widest font-black">Sin portada</div>
                    )}
                    {item.cover_video_url ? (
                      <span className="absolute top-3 right-3 px-3 py-1 rounded-full border border-amber-700/40 bg-amber-950/40 text-[10px] font-black uppercase tracking-[0.16em] text-amber-300">
                        <FaPlayCircle className="inline mr-1" /> Video
                      </span>
                    ) : null}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">{item.industry}</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">{item.year}</span>
                    </div>
                    <h2 className="text-2xl font-black text-stone-100 mb-2 leading-tight">{item.company_name}</h2>
                    <p className="text-sm text-stone-400 leading-relaxed line-clamp-3 mb-5">{item.headline || item.summary}</p>

                    <div className="flex gap-2 mb-5">
                      <span className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-[10px] uppercase tracking-[0.18em] text-stone-300 font-black">
                        {item.services.length} servicios
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-[10px] uppercase tracking-[0.18em] text-stone-300 font-black">
                        {item.kpis.length} kpis
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedCase(item)}
                      className="w-full py-3 rounded-xl border border-amber-700/45 bg-amber-950/25 text-amber-200 hover:bg-amber-900/30 font-black uppercase tracking-[0.2em] text-xs transition-all"
                    >
                      Ver Caso Completo
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {selectedCase && <CaseDetailModal item={selectedCase} onClose={() => setSelectedCase(null)} />}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-[#3e3325] bg-[#141922]/92 px-5 py-4">
      <div className="text-amber-300 mb-2">{icon}</div>
      <p className="text-3xl font-black text-amber-100 leading-none mb-1">{value}</p>
      <p className="text-[10px] uppercase tracking-[0.2em] font-black text-stone-400">{label}</p>
    </div>
  );
}

function CaseDetailModal({ item, onClose }: { item: FullCase; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[3500] bg-black/85 backdrop-blur-sm p-4 md:p-8 overflow-y-auto"
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        className="max-w-6xl mx-auto rounded-[2rem] overflow-hidden border border-white/10 bg-[#11161f]"
      >
        <div className="p-6 md:p-8 border-b border-white/10 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] font-black text-amber-300 mb-2">{item.industry} · {item.year}</p>
            <h3 className="text-3xl font-black text-stone-100">{item.company_name}</h3>
            <p className="text-stone-400 text-sm mt-2">{item.client_name}{item.client_role ? ` · ${item.client_role}` : ""}</p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-white/15 rounded-xl text-xs uppercase tracking-[0.2em] font-black text-stone-300 hover:text-stone-100"
          >
            Cerrar
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/30">
              <div className="aspect-video">
                {item.cover_video_url ? (
                  <video src={item.cover_video_url} controls className="w-full h-full object-cover" />
                ) : item.cover_image_url ? (
                  <img src={item.cover_image_url} alt={item.company_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-500 text-xs uppercase tracking-widest font-black">Sin media de portada</div>
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-[#453726] bg-[#171c25] p-6">
              <h4 className="text-amber-200 font-black text-2xl mb-3">{item.headline}</h4>
              <p className="text-stone-300/90 leading-relaxed mb-5">{item.summary}</p>
              {item.website_url ? (
                <a
                  href={item.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-700/45 text-amber-200 text-[10px] uppercase tracking-[0.2em] font-black hover:bg-amber-900/20"
                >
                  <FaExternalLinkAlt /> Visitar Web
                </a>
              ) : null}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <InfoBox title="Desafío" content={item.challenge} />
            <InfoBox title="Solución" content={item.solution} />
            <InfoBox title="Impacto" content={item.impact} />
          </div>

          {item.kpis.length > 0 ? (
            <div>
              <h4 className="text-xl font-black text-stone-100 mb-4 uppercase tracking-wide">KPIs del Caso</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {item.kpis.map((kpi, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-[#3e3324] bg-[#151a22]">
                    <p className="text-xs uppercase tracking-[0.2em] font-black text-amber-300 mb-3">{kpi.label}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-black mb-1">Antes</p>
                        <p className="text-sm text-stone-300">{kpi.before}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-emerald-300/90 font-black mb-1">Después</p>
                        <p className="text-sm text-stone-100">{kpi.after}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">{kpi.improvement}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {item.timeline.length > 0 ? (
            <div>
              <h4 className="text-xl font-black text-stone-100 mb-4 uppercase tracking-wide">Timeline</h4>
              <div className="space-y-3">
                {item.timeline.map((phase, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-white/10 bg-[#151a23]">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-amber-300 mb-2">
                      {phase.phase} {phase.duration ? `· ${phase.duration}` : ""}
                    </p>
                    <p className="text-sm text-stone-300 leading-relaxed">{phase.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {item.gallery.length > 0 ? (
            <div>
              <h4 className="text-xl font-black text-stone-100 mb-4 uppercase tracking-wide">Galería</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {item.gallery.map((asset, idx) => (
                  <div key={`${asset.url}-${idx}`} className="rounded-xl overflow-hidden border border-white/10 bg-black/30">
                    <div className="aspect-square">
                      {asset.type === "video" ? (
                        <video src={asset.url} className="w-full h-full object-cover" muted loop playsInline />
                      ) : (
                        <img src={asset.url} alt={asset.caption || `media-${idx}`} className="w-full h-full object-cover" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {item.testimonial ? (
            <blockquote className="p-5 rounded-2xl border border-amber-700/35 bg-amber-950/20 text-stone-200 leading-relaxed">
              “{item.testimonial}”
            </blockquote>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}

function InfoBox({ title, content }: { title: string; content?: string }) {
  return (
    <div className="p-5 rounded-2xl border border-[#3f3425] bg-[#151a22]">
      <p className="text-[10px] uppercase tracking-[0.2em] font-black text-amber-300 mb-3">{title}</p>
      <p className="text-sm text-stone-300 leading-relaxed">{content || "Sin información registrada."}</p>
    </div>
  );
}
