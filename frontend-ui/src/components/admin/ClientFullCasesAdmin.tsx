"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  FaEdit,
  FaExternalLinkAlt,
  FaGlobeAmericas,
  FaImage,
  FaPlus,
  FaSave,
  FaTimes,
  FaTrash,
  FaUpload,
  FaVideo,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import API_BASE from "@/lib/apiBase";
import { adminFetch } from "@/lib/adminFetch";

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

interface CaseLink {
  label: string;
  url: string;
}

interface FullCase {
  id?: number;
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
  extra_links: CaseLink[];
  order_index: number;
  is_featured: boolean;
  is_published: boolean;
}

const API_ROOT = `${API_BASE}/api`;

function emptyCase(): FullCase {
  return {
    slug: "",
    company_name: "",
    client_name: "",
    client_role: "",
    industry: "Tecnología",
    year: "2026",
    country: "",
    website_url: "",
    logo_url: "",
    cover_image_url: "",
    cover_video_url: "",
    headline: "",
    summary: "",
    challenge: "",
    solution: "",
    impact: "",
    testimonial: "",
    services: [],
    technologies: [],
    kpis: [],
    timeline: [],
    gallery: [],
    extra_links: [],
    order_index: 0,
    is_featured: false,
    is_published: true,
  };
}

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

function splitCommaList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeCase(raw: unknown): FullCase {
  const data = (raw ?? {}) as Record<string, unknown>;
  return {
    id: typeof data.id === "number" ? data.id : undefined,
    slug: asString(data.slug),
    company_name: asString(data.company_name),
    client_name: asString(data.client_name),
    client_role: asString(data.client_role),
    industry: asString(data.industry) || "Tecnología",
    year: asString(data.year) || "2026",
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
    extra_links: parseArray<CaseLink>(data.extra_links),
    order_index: asNumber(data.order_index, 0),
    is_featured: Boolean(data.is_featured),
    is_published: data.is_published !== false,
  };
}

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await adminFetch(`${API_ROOT}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("No se pudo subir el archivo");
  }

  const data = await response.json();
  return data.url;
}

export default function ClientFullCasesAdmin() {
  const [cases, setCases] = useState<FullCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<FullCase | null>(null);

  const publishedCount = useMemo(() => cases.filter((c) => c.is_published).length, [cases]);

  const loadCases = async () => {
    setLoading(true);
    try {
      const response = await adminFetch(`${API_ROOT}/casos-completos`);
      if (!response.ok) throw new Error("No se pudo cargar casos completos");
      const data = await response.json();
      setCases((data || []).map(normalizeCase));
    } catch (error) {
      console.error(error);
      alert("Error cargando casos completos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const openCreate = () => {
    setEditingCase(emptyCase());
    setIsModalOpen(true);
  };

  const openEdit = (item: FullCase) => {
    setEditingCase(item);
    setIsModalOpen(true);
  };

  const saveCase = async () => {
    if (!editingCase) return;
    if (!editingCase.company_name || !editingCase.client_name || !editingCase.headline || !editingCase.summary) {
      alert("Completa al menos empresa, cliente, titular y resumen.");
      return;
    }

    setSaving(true);
    try {
      const isNew = !editingCase.id;
      const endpoint = isNew
        ? `${API_ROOT}/casos-completos`
        : `${API_ROOT}/casos-completos/${editingCase.id}`;

      const payload = {
        ...editingCase,
        services: JSON.stringify(editingCase.services),
        technologies: JSON.stringify(editingCase.technologies),
        kpis: JSON.stringify(editingCase.kpis),
        timeline: JSON.stringify(editingCase.timeline),
        gallery: JSON.stringify(editingCase.gallery),
        extra_links: JSON.stringify(editingCase.extra_links),
      };

      const response = await adminFetch(endpoint, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("No se pudo guardar el caso completo");
      setIsModalOpen(false);
      await loadCases();
    } catch (error) {
      console.error(error);
      alert("Error guardando caso completo");
    } finally {
      setSaving(false);
    }
  };

  const deleteCase = async (id?: number) => {
    if (!id) return;
    if (!confirm("¿Eliminar este caso completo?")) return;

    try {
      const response = await adminFetch(`${API_ROOT}/casos-completos/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("No se pudo eliminar");
      await loadCases();
    } catch (error) {
      console.error(error);
      alert("Error eliminando caso completo");
    }
  };

  return (
    <section className="bg-[#0d131f]/90 border border-white/10 rounded-none overflow-hidden shadow-2xl">
      <div className="px-10 py-8 border-b border-white/10 flex items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black uppercase tracking-tight text-white">Casos Completos</h3>
          <p className="text-white/40 text-xs uppercase tracking-[0.2em] mt-1">
            Gestiona fichas completas: datos cliente, web, KPIs, timeline, fotos y videos
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 border border-white/15 bg-white/[0.02] text-[11px] font-black uppercase tracking-widest text-white/80">
            Publicados: <span className="text-emerald-300">{publishedCount}</span>
          </div>
          <button
            onClick={openCreate}
            className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase text-[10px] tracking-[0.25em] flex items-center gap-3"
          >
            <FaPlus /> Nuevo Caso Completo
          </button>
        </div>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="py-24 text-center text-white/50 font-bold uppercase tracking-[0.25em] text-xs">Cargando...</div>
        ) : cases.length === 0 ? (
          <div className="py-24 text-center border border-white/10 bg-white/[0.01]">
            <p className="text-white/60 font-bold uppercase tracking-[0.25em] text-xs">Sin casos completos aún</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cases.map((item) => (
              <div key={item.id} className="bg-black/30 border border-white/10 rounded-3xl p-5 group hover:border-amber-500/40 transition-all">
                <div className="aspect-video rounded-2xl overflow-hidden mb-4 bg-black/50 border border-white/10">
                  {item.cover_image_url ? (
                    <img src={item.cover_image_url} alt={item.company_name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-xs uppercase font-black tracking-widest">
                      Sin portada
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-black text-amber-300">{item.industry}</span>
                  <span className={`text-[10px] uppercase tracking-[0.2em] font-black ${item.is_published ? "text-emerald-300" : "text-orange-300"}`}>
                    {item.is_published ? "Publicado" : "Borrador"}
                  </span>
                </div>

                <h4 className="text-white font-black text-xl leading-tight mb-2">{item.company_name}</h4>
                <p className="text-white/60 text-sm leading-relaxed mb-5 line-clamp-3">{item.headline || item.summary}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="flex-1 py-3 bg-white/5 border border-white/10 hover:border-amber-500/40 text-white/90 font-black uppercase text-[10px] tracking-[0.2em] rounded-xl flex items-center justify-center gap-2"
                  >
                    <FaEdit /> Editar
                  </button>
                  <button
                    onClick={() => deleteCase(item.id)}
                    className="px-4 py-3 bg-red-600/20 border border-red-500/40 hover:bg-red-600/35 text-red-300 rounded-xl"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && editingCase && (
          <FullCaseModal
            item={editingCase}
            saving={saving}
            onClose={() => setIsModalOpen(false)}
            onSave={saveCase}
            onChange={setEditingCase}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function FullCaseModal({
  item,
  saving,
  onClose,
  onSave,
  onChange,
}: {
  item: FullCase;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (next: FullCase) => void;
}) {
  const [uploadingField, setUploadingField] = useState<string>("");

  const update = (patch: Partial<FullCase>) => onChange({ ...item, ...patch });

  const handleSingleUpload = async (
    file: File | undefined,
    field: "logo_url" | "cover_image_url" | "cover_video_url",
  ) => {
    if (!file) return;
    setUploadingField(field);
    try {
      const url = await uploadFile(file);
      update({ [field]: url } as Partial<FullCase>);
    } catch (error) {
      console.error(error);
      alert("No se pudo subir el archivo.");
    } finally {
      setUploadingField("");
    }
  };

  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploadingField("gallery");
    try {
      const uploaded: CaseMediaItem[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadFile(file);
        uploaded.push({
          type: file.type.startsWith("video/") ? "video" : "image",
          url,
        });
      }
      update({ gallery: [...item.gallery, ...uploaded] });
    } catch (error) {
      console.error(error);
      alert("No se pudieron subir todos los archivos.");
    } finally {
      setUploadingField("");
    }
  };

  return (
    <div className="fixed inset-0 z-[3200] bg-black/90 p-6 md:p-10 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="max-w-6xl mx-auto bg-[#0b101a] border border-white/10 rounded-[2.2rem] overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Caso Completo de Cliente</h3>
            <p className="text-white/40 text-xs uppercase tracking-[0.2em] mt-1">Completa toda la ficha de evidencia real</p>
          </div>
          <button onClick={onClose} className="w-11 h-11 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/30 flex items-center justify-center">
            <FaTimes />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid md:grid-cols-3 gap-5">
            <Field label="Empresa">
              <input value={item.company_name} onChange={(e) => update({ company_name: e.target.value })} className="input-admin" placeholder="TechCorp Global" />
            </Field>
            <Field label="Cliente / Contacto">
              <input value={item.client_name} onChange={(e) => update({ client_name: e.target.value })} className="input-admin" placeholder="Sarah Johnson" />
            </Field>
            <Field label="Cargo del Cliente">
              <input value={item.client_role} onChange={(e) => update({ client_role: e.target.value })} className="input-admin" placeholder="CTO" />
            </Field>
          </div>

          <div className="grid md:grid-cols-4 gap-5">
            <Field label="Slug">
              <input value={item.slug} onChange={(e) => update({ slug: e.target.value })} className="input-admin" placeholder="techcorp-global-transformacion" />
            </Field>
            <Field label="Industria">
              <input value={item.industry} onChange={(e) => update({ industry: e.target.value })} className="input-admin" placeholder="Finanzas" />
            </Field>
            <Field label="Año">
              <input value={item.year} onChange={(e) => update({ year: e.target.value })} className="input-admin" placeholder="2026" />
            </Field>
            <Field label="País">
              <input value={item.country} onChange={(e) => update({ country: e.target.value })} className="input-admin" placeholder="Chile" />
            </Field>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <Field label="URL de la Web del Cliente">
              <div className="relative">
                <input value={item.website_url} onChange={(e) => update({ website_url: e.target.value })} className="input-admin pr-12" placeholder="https://cliente.com" />
                <FaGlobeAmericas className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" />
              </div>
            </Field>
            <Field label="Enlaces extra (label|url por línea)">
              <textarea
                value={item.extra_links.map((link) => `${link.label}|${link.url}`).join("\n")}
                onChange={(e) =>
                  update({
                    extra_links: e.target.value
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line) => {
                        const [label, url] = line.split("|");
                        return { label: (label || "").trim(), url: (url || "").trim() };
                      })
                      .filter((link) => link.label && link.url),
                  })
                }
                className="input-admin min-h-[96px]"
                placeholder="Sitio Público|https://...\nApp Store|https://..."
              />
            </Field>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <UploadBox
              label="Logo del Cliente"
              url={item.logo_url}
              uploading={uploadingField === "logo_url"}
              accept="image/*"
              onUpload={(file) => handleSingleUpload(file, "logo_url")}
              onClear={() => update({ logo_url: "" })}
            />
            <UploadBox
              label="Portada Imagen"
              url={item.cover_image_url}
              uploading={uploadingField === "cover_image_url"}
              accept="image/*"
              onUpload={(file) => handleSingleUpload(file, "cover_image_url")}
              onClear={() => update({ cover_image_url: "" })}
            />
            <UploadBox
              label="Portada Video"
              url={item.cover_video_url}
              uploading={uploadingField === "cover_video_url"}
              accept="video/*"
              onUpload={(file) => handleSingleUpload(file, "cover_video_url")}
              onClear={() => update({ cover_video_url: "" })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Titular del Caso">
              <input value={item.headline} onChange={(e) => update({ headline: e.target.value })} className="input-admin" placeholder="Cómo aumentó la conversión en 46% en 6 meses" />
            </Field>
            <Field label="Resumen Ejecutivo">
              <textarea value={item.summary} onChange={(e) => update({ summary: e.target.value })} className="input-admin min-h-[96px]" placeholder="Resumen corto para portada del caso..." />
            </Field>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <Field label="Desafío Inicial">
              <textarea value={item.challenge} onChange={(e) => update({ challenge: e.target.value })} className="input-admin min-h-[120px]" placeholder="Problema que tenía el cliente..." />
            </Field>
            <Field label="Solución Aplicada">
              <textarea value={item.solution} onChange={(e) => update({ solution: e.target.value })} className="input-admin min-h-[120px]" placeholder="Estrategia y ejecución..." />
            </Field>
            <Field label="Impacto de Negocio">
              <textarea value={item.impact} onChange={(e) => update({ impact: e.target.value })} className="input-admin min-h-[120px]" placeholder="Resultados reales y efectos en negocio..." />
            </Field>
          </div>

          <Field label="Testimonio del Cliente">
            <textarea value={item.testimonial} onChange={(e) => update({ testimonial: e.target.value })} className="input-admin min-h-[96px]" placeholder="Cita textual del cliente..." />
          </Field>

          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Servicios (separados por coma)">
              <textarea
                value={item.services.join(", ")}
                onChange={(e) => update({ services: splitCommaList(e.target.value) })}
                className="input-admin min-h-[80px]"
                placeholder="Diagnóstico, UX, Desarrollo, QA, Integraciones..."
              />
            </Field>
            <Field label="Tecnologías (separadas por coma)">
              <textarea
                value={item.technologies.join(", ")}
                onChange={(e) => update({ technologies: splitCommaList(e.target.value) })}
                className="input-admin min-h-[80px]"
                placeholder="Next.js, FastAPI, PostgreSQL, Redis..."
              />
            </Field>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <Field label="KPIs (label, antes, después, mejora)">
              <div className="space-y-3">
                {item.kpis.map((kpi, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-2">
                    <input value={kpi.label} onChange={(e) => update({ kpis: item.kpis.map((row, i) => (i === idx ? { ...row, label: e.target.value } : row)) })} className="input-admin" placeholder="Conversión" />
                    <input value={kpi.improvement} onChange={(e) => update({ kpis: item.kpis.map((row, i) => (i === idx ? { ...row, improvement: e.target.value } : row)) })} className="input-admin" placeholder="+46%" />
                    <input value={kpi.before} onChange={(e) => update({ kpis: item.kpis.map((row, i) => (i === idx ? { ...row, before: e.target.value } : row)) })} className="input-admin" placeholder="Antes" />
                    <div className="flex gap-2">
                      <input value={kpi.after} onChange={(e) => update({ kpis: item.kpis.map((row, i) => (i === idx ? { ...row, after: e.target.value } : row)) })} className="input-admin flex-1" placeholder="Después" />
                      <button onClick={() => update({ kpis: item.kpis.filter((_, i) => i !== idx) })} className="px-3 border border-red-500/40 text-red-300 rounded-lg">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
                <button onClick={() => update({ kpis: [...item.kpis, { label: "", before: "", after: "", improvement: "" }] })} className="px-4 py-2 border border-amber-600/40 text-amber-300 rounded-xl text-xs uppercase font-black tracking-[0.2em]">
                  <FaPlus className="inline mr-2" /> Agregar KPI
                </button>
              </div>
            </Field>

            <Field label="Timeline (fase, resumen, duración)">
              <div className="space-y-3">
                {item.timeline.map((phase, idx) => (
                  <div key={idx} className="space-y-2 p-3 border border-white/10 rounded-xl">
                    <input value={phase.phase} onChange={(e) => update({ timeline: item.timeline.map((row, i) => (i === idx ? { ...row, phase: e.target.value } : row)) })} className="input-admin" placeholder="Fase" />
                    <input value={phase.duration || ""} onChange={(e) => update({ timeline: item.timeline.map((row, i) => (i === idx ? { ...row, duration: e.target.value } : row)) })} className="input-admin" placeholder="Duración" />
                    <div className="flex gap-2">
                      <textarea value={phase.summary} onChange={(e) => update({ timeline: item.timeline.map((row, i) => (i === idx ? { ...row, summary: e.target.value } : row)) })} className="input-admin min-h-[80px] flex-1" placeholder="Resumen de fase..." />
                      <button onClick={() => update({ timeline: item.timeline.filter((_, i) => i !== idx) })} className="px-3 border border-red-500/40 text-red-300 rounded-lg self-start mt-1">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
                <button onClick={() => update({ timeline: [...item.timeline, { phase: "", summary: "", duration: "" }] })} className="px-4 py-2 border border-amber-600/40 text-amber-300 rounded-xl text-xs uppercase font-black tracking-[0.2em]">
                  <FaPlus className="inline mr-2" /> Agregar Fase
                </button>
              </div>
            </Field>
          </div>

          <Field label="Galería de Fotos / Videos">
            <div className="space-y-4">
              <label className="inline-flex items-center gap-2 px-4 py-3 border border-emerald-600/40 text-emerald-300 rounded-xl cursor-pointer text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-900/20">
                <FaUpload /> {uploadingField === "gallery" ? "Subiendo..." : "Subir Assets"}
                <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => handleGalleryUpload(e.target.files)} />
              </label>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {item.gallery.map((asset, idx) => (
                  <div key={`${asset.url}-${idx}`} className="border border-white/10 rounded-xl overflow-hidden bg-black/40">
                    <div className="aspect-video bg-black/60">
                      {asset.type === "video" ? (
                        <video src={asset.url} className="w-full h-full object-cover" muted loop playsInline />
                      ) : (
                        <img src={asset.url} alt="asset" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-2 flex items-center justify-between text-[10px] uppercase font-black tracking-[0.18em]">
                      <span className={asset.type === "video" ? "text-orange-300" : "text-amber-300"}>
                        {asset.type === "video" ? <><FaVideo className="inline mr-1" />Video</> : <><FaImage className="inline mr-1" />Imagen</>}
                      </span>
                      <button onClick={() => update({ gallery: item.gallery.filter((_, i) => i !== idx) })} className="text-red-300 hover:text-red-200">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Field>

          <div className="grid md:grid-cols-3 gap-5">
            <Field label="Orden">
              <input type="number" value={item.order_index} onChange={(e) => update({ order_index: Number(e.target.value || 0) })} className="input-admin" />
            </Field>
            <Field label="Destacado">
              <label className="h-[46px] px-4 border border-white/10 rounded-xl flex items-center justify-between text-sm text-white/80">
                <span>Mostrar como destacado</span>
                <input type="checkbox" checked={item.is_featured} onChange={(e) => update({ is_featured: e.target.checked })} />
              </label>
            </Field>
            <Field label="Publicado">
              <label className="h-[46px] px-4 border border-white/10 rounded-xl flex items-center justify-between text-sm text-white/80">
                <span>Visible en sitio público</span>
                <input type="checkbox" checked={item.is_published} onChange={(e) => update({ is_published: e.target.checked })} />
              </label>
            </Field>
          </div>
        </div>

        <div className="px-8 py-6 border-t border-white/10 bg-black/20 flex gap-3">
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 py-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-black font-black uppercase tracking-[0.2em] text-xs rounded-xl flex items-center justify-center gap-2"
          >
            <FaSave /> {saving ? "Guardando..." : "Guardar Caso Completo"}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-4 border border-white/15 text-white/70 hover:text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2"
          >
            <FaTimes /> Cerrar
          </button>
          {item.website_url ? (
            <a
              href={item.website_url}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-4 border border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/20 rounded-xl text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2"
            >
              <FaExternalLinkAlt /> Ver Web
            </a>
          ) : null}
        </div>

        <style jsx>{`
          .input-admin {
            width: 100%;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.75rem;
            padding: 0.75rem 1rem;
            color: #f5f5f4;
            outline: none;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
          }

          .input-admin:focus {
            border-color: rgba(245, 158, 11, 0.7);
            box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.14);
          }
        `}</style>
      </motion.div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-300/90">{label}</label>
      {children}
    </div>
  );
}

function UploadBox({
  label,
  url,
  uploading,
  accept,
  onUpload,
  onClear,
}: {
  label: string;
  url: string;
  uploading: boolean;
  accept: string;
  onUpload: (file: File | undefined) => void;
  onClear: () => void;
}) {
  const isVideo = accept.includes("video");

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-300/90">{label}</label>
      <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/40">
        <div className="aspect-video">
          {url ? (
            isVideo ? (
              <video src={url} className="w-full h-full object-cover" controls />
            ) : (
              <img src={url} alt={label} className="w-full h-full object-cover" />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/30 text-xs uppercase tracking-[0.2em] font-black">
              Sin archivo
            </div>
          )}
        </div>
        <div className="p-3 flex gap-2">
          <label className="flex-1 py-2 text-center border border-amber-700/40 text-amber-300 rounded-xl cursor-pointer text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-900/20">
            <FaUpload className="inline mr-2" />
            {uploading ? "Subiendo..." : "Subir"}
            <input type="file" accept={accept} className="hidden" onChange={(e) => onUpload(e.target.files?.[0])} />
          </label>
          {url ? (
            <button onClick={onClear} className="px-3 border border-red-500/40 text-red-300 rounded-xl">
              <FaTrash />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
