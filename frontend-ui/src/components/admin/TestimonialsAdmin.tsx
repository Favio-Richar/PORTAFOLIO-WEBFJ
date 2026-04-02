"use client";

import { useEffect, useMemo, useState } from "react";
import { FaCheck, FaClock, FaEdit, FaStar, FaTimes, FaTrash } from "react-icons/fa";
import API_BASE from "@/lib/apiBase";
import { adminFetch } from "@/lib/adminFetch";

type ReviewStatus = "pending" | "approved" | "rejected";

interface ReviewItem {
  id: number;
  author_name: string;
  author_role?: string | null;
  author_company?: string | null;
  content: string;
  rating: number;
  page_context?: string | null;
  status: ReviewStatus;
  created_at?: string | null;
}

const API_ROOT = `${API_BASE}/api/services-page/reviews`;
const KNOWN_REVIEW_ORIGINS = ["blog", "clientes", "servicios", "proyectos", "sobre-mi"] as const;

function normalizePageContext(value?: string | null) {
  const raw = (value || "general").toLowerCase().trim();
  if (raw === "cliente") return "clientes";
  if (raw === "clientes") return "clientes";
  if (raw === "servicio") return "servicios";
  if (raw === "servicios") return "servicios";
  if (raw === "proyecto") return "proyectos";
  if (raw === "proyectos") return "proyectos";
  if (raw === "sobre mi" || raw === "sobre_mi" || raw === "sobremi" || raw === "about") return "sobre-mi";
  return raw || "general";
}

function getOriginLabel(origin: string) {
  const normalized = normalizePageContext(origin);
  const labels: Record<string, string> = {
    blog: "Blog",
    clientes: "Clientes",
    servicios: "Servicios",
    proyectos: "Proyecto",
    "sobre-mi": "Sobre mi",
    general: "General",
  };
  return labels[normalized] || normalized;
}

function formatReviewDate(value?: string | null) {
  if (!value) return "Sin fecha";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Sin fecha";
  return parsed.toLocaleString("es-CL", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TestimonialsAdmin() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [draftContentById, setDraftContentById] = useState<Record<number, string>>({});

  const [statusFilter, setStatusFilter] = useState<"all" | ReviewStatus>("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [search, setSearch] = useState("");

  async function loadReviews() {
    try {
      setLoading(true);
      setError("");
      const res = await adminFetch(`${API_ROOT}/admin`);
      if (!res.ok) throw new Error("No se pudo cargar reviews");
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Error cargando reviews desde la BD.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  const stats = useMemo(() => {
    const total = reviews.length;
    const approved = reviews.filter((r) => r.status === "approved").length;
    const pending = reviews.filter((r) => r.status === "pending").length;
    return { total, approved, pending };
  }, [reviews]);

  const sources = useMemo(() => {
    const dynamic = Array.from(
      new Set(reviews.map((r) => normalizePageContext(r.page_context)).filter(Boolean))
    );

    const knownOrigins = KNOWN_REVIEW_ORIGINS as readonly string[];
    const extras = dynamic.filter((src) => !knownOrigins.includes(src)).sort();
    return [...KNOWN_REVIEW_ORIGINS, ...extras];
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reviews.filter((r) => {
      const source = normalizePageContext(r.page_context);
      const byStatus = statusFilter === "all" ? true : r.status === statusFilter;
      const bySource = sourceFilter === "all" ? true : source === sourceFilter;
      const bySearch = !q
        ? true
        : `${r.author_name} ${r.author_role || ""} ${r.author_company || ""} ${r.content} ${source}`
            .toLowerCase()
            .includes(q);
      return byStatus && bySource && bySearch;
    });
  }, [reviews, statusFilter, sourceFilter, search]);

  async function updateReview(review: ReviewItem, patch: Partial<ReviewItem>) {
    try {
      setSavingId(review.id);
      const res = await adminFetch(`${API_ROOT}/${review.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("No se pudo actualizar");
      const updated = await res.json();
      setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      return updated as ReviewItem;
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar la review.");
      return null;
    } finally {
      setSavingId(null);
    }
  }

  function startEditing(review: ReviewItem) {
    setEditingReviewId(review.id);
    setDraftContentById((prev) => ({
      ...prev,
      [review.id]: review.content || "",
    }));
  }

  function cancelEditing(reviewId: number) {
    setEditingReviewId((prev) => (prev === reviewId ? null : prev));
    setDraftContentById((prev) => {
      const next = { ...prev };
      delete next[reviewId];
      return next;
    });
  }

  async function saveEditedContent(review: ReviewItem) {
    const draft = (draftContentById[review.id] ?? "").trim();
    if (!draft) {
      setError("El comentario no puede quedar vacio.");
      return;
    }

    const updated = await updateReview(review, {
      content: draft,
      status: review.status,
    });

    if (updated) {
      cancelEditing(review.id);
    }
  }

  async function deleteReview(id: number) {
    const ok = window.confirm("Eliminar esta review?");
    if (!ok) return;

    try {
      setSavingId(id);
      const res = await adminFetch(`${API_ROOT}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar");
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar la review.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="admin-content-v2 fade-in">
      {/* 📊 MINI STATS BAR */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#0f172a]/80 border border-white/5 p-4 rounded-lg flex items-center justify-between group hover:border-blue-500/20 transition-all">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-0.5">Volumen</p>
            <p className="text-2xl font-black text-white">{stats.total}</p>
          </div>
          <div className="w-10 h-10 bg-blue-500/5 rounded-md flex items-center justify-center text-blue-500 border border-blue-500/10 group-hover:bg-blue-500/10 group-hover:scale-110 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/></svg>
          </div>
        </div>

        <div className="bg-[#0f172a]/80 border border-white/5 p-4 rounded-lg flex items-center justify-between group hover:border-emerald-500/20 transition-all">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60 mb-0.5">Aprobados</p>
            <p className="text-2xl font-black text-emerald-400">{stats.approved}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-500/5 rounded-md flex items-center justify-center text-emerald-500 border border-emerald-500/10">
            <FaCheck className="text-sm" />
          </div>
        </div>

        <div className="bg-[#0f172a]/80 border border-white/5 p-4 rounded-lg flex items-center justify-between group hover:border-amber-500/20 transition-all">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/60 mb-0.5">Moderación</p>
            <p className="text-2xl font-black text-amber-400">{stats.pending}</p>
          </div>
          <div className="w-10 h-10 bg-amber-500/5 rounded-md flex items-center justify-center text-amber-500 border border-amber-500/10">
            <FaClock className="text-sm" />
          </div>
        </div>

        <div className="flex items-center justify-end">
           <button
            onClick={loadReviews}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md text-xs font-black uppercase tracking-widest hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            Sincronizar Data
          </button>
        </div>
      </section>

      {/* 📁 FILTERS PANEL */}
      <section className="bg-slate-900 border border-white/5 rounded-xl overflow-hidden shadow-2xl shadow-black/50 mb-10">
        <div className="p-4 border-b border-white/5 flex flex-col lg:flex-row lg:items-center gap-4 bg-slate-900/50">
           <div className="relative flex-1">
             <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtro rápido por cliente, empresa o palabras clave..."
              className="w-full bg-slate-950 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-blue-500/50 transition-all outline-none"
             />
             <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/></svg>
             </div>
           </div>

           <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | ReviewStatus)}
                className="bg-slate-950 border border-white/10 text-white px-3 py-2.5 text-xs font-bold rounded-lg outline-none cursor-pointer hover:bg-slate-800 transition-colors"
                style={{ appearance: 'none' }}
              >
                <option value="all">TODOS LOS ESTADOS</option>
                <option value="pending">EN REVISIÓN</option>
                <option value="approved">PUBLICADOS</option>
                <option value="rejected">RECHAZADOS</option>
              </select>

              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="bg-slate-950 border border-white/10 text-white px-3 py-2.5 text-xs font-bold rounded-lg outline-none cursor-pointer hover:bg-slate-800 transition-colors"
                style={{ appearance: 'none' }}
              >
                <option value="all">TODOS LOS ORIGENES</option>
                {sources.map((src) => (
                  <option key={src} value={src}>{getOriginLabel(src).toUpperCase()}</option>
                ))}
              </select>
           </div>
        </div>

        {/* 📋 THE PROFESSIONAL DATA GRID */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
             <div className="py-24 text-center">
                <div className="inline-block w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Optimizando Data Table...</p>
             </div>
          ) : filteredReviews.length === 0 ? (
             <div className="py-24 text-center">
                <p className="text-slate-600 font-medium italic">No se han encontrado registros que coincidan con los filtros actuales.</p>
             </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/40 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                  <th className="px-6 py-4">Cliente / Empresa</th>
                  <th className="px-6 py-4">Calificación</th>
                  <th className="px-6 py-4 w-1/3">Comentario</th>
                  <th className="px-6 py-4">Origen</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredReviews.map((review) => {
                   const isEditing = editingReviewId === review.id;
                   const draftValue = isEditing ? draftContentById[review.id] ?? review.content : review.content;
                   const initials = review.author_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                   const avatarBg = `hsl(${(review.author_name.length * 137.5) % 360}, 50%, 35%)`;

                   return (
                     <tr key={review.id} className="group hover:bg-white/[0.02] transition-all">
                       {/* CLIENTE INFO */}
                       <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                             <div 
                               className="w-9 h-9 flex items-center justify-center rounded-full text-xs font-black shadow-inner border border-white/10" 
                               style={{ backgroundColor: avatarBg }}
                             >
                               {initials}
                             </div>
                             <div>
                                <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{review.author_name}</p>
                                <p className="text-[10px] text-slate-500 font-medium">
                                   {review.author_role || "Empresario"} {review.author_company ? `@ ${review.author_company}` : ""}
                                </p>
                             </div>
                          </div>
                       </td>

                       {/* CALIFICACION */}
                       <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                             <div className="flex gap-0.5 text-amber-500 text-[10px]">
                               {Array.from({ length: 5 }).map((_, i) => (
                                 <FaStar key={i} className={i < (review.rating || 0) ? "text-amber-500" : "text-white/10"} />
                               ))}
                             </div>
                             <span className="text-[11px] font-black text-white/50">{review.rating} / 5.0</span>
                          </div>
                       </td>

                       {/* COMENTARIO */}
                       <td className="px-6 py-5">
                          {isEditing ? (
                             <div className="space-y-2">
                                <textarea
                                  value={draftValue}
                                  onChange={(e) => setDraftContentById(p => ({ ...p, [review.id]: e.target.value }))}
                                  className="w-full bg-[#030712] border border-blue-500/30 p-2 text-xs text-slate-300 outline-none rounded min-h-[80px]"
                                />
                                <div className="flex gap-2">
                                   <button 
                                      onClick={() => saveEditedContent(review)}
                                      className="px-3 py-1 bg-emerald-600 text-[9px] font-black uppercase tracking-widest rounded hover:bg-emerald-500"
                                   >
                                      Sincronizar
                                   </button>
                                   <button 
                                      onClick={() => cancelEditing(review.id)}
                                      className="px-3 py-1 bg-slate-800 text-[9px] font-black uppercase tracking-widest rounded hover:bg-slate-700"
                                   >
                                      Cancelar
                                   </button>
                                </div>
                             </div>
                          ) : (
                             <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 max-w-md group-hover:text-slate-200 transition-colors italic">
                                "{review.content}"
                             </p>
                          )}
                       </td>

                       {/* ORIGEN */}
                       <td className="px-6 py-5 whitespace-nowrap">
                          <span className="px-2 py-1 bg-slate-800/50 border border-white/5 text-slate-500 text-[9px] font-black uppercase rounded tracking-tighter">
                             {getOriginLabel(review.page_context || "general")}
                          </span>
                       </td>

                       {/* ESTADO DROPDOWN */}
                       <td className="px-6 py-5 whitespace-nowrap">
                          <StatusBadge status={review.status} />
                          <div className="mt-1">
                             <select
                                value={review.status}
                                onChange={(e) => updateReview(review, { status: e.target.value as ReviewStatus })}
                                className="bg-transparent text-[9px] font-bold text-blue-500/70 hover:text-blue-400 outline-none cursor-pointer uppercase tracking-tighter"
                             >
                                <option value="pending" className="bg-slate-900">Pasar a Pendiente</option>
                                <option value="approved" className="bg-slate-900">Aprobar Review</option>
                                <option value="rejected" className="bg-slate-900">Rechazar Review</option>
                             </select>
                          </div>
                                         <td className="px-6 py-5 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2 transition-all">
                             <button 
                                disabled={savingId === review.id}
                                onClick={() => startEditing(review)}
                                className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-blue-600 text-blue-500 hover:text-white rounded border border-white/5 transition-all shadow-lg"
                                title="Editar comentario"
                             >
                                <FaEdit className="text-[12px]" />
                             </button>
                             <button 
                                disabled={savingId === review.id}
                                onClick={() => deleteReview(review.id)}
                                className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-red-600 text-red-500 hover:text-white rounded border border-white/5 transition-all shadow-lg"
                                title="Eliminar registro"
                             >
                                <FaTrash className="text-[12px]" style={{ color: '#ff0000', filter: 'drop-shadow(0 0 5px rgba(255,0,0,0.5))' }} />
                             </button>
                          </div>
                        </td>
       </td>
                     </tr>
                   );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        {/* 📊 FOOTER / SUMMARY */}
        <div className="p-4 bg-slate-950/50 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-slate-600">
           <p className="uppercase tracking-[0.2em]">Última sincronización: {new Date().toLocaleTimeString()}</p>
           <p className="uppercase tracking-[0.2em]">{filteredReviews.length} RESULTADOS ENCONTRADOS / {reviews.length} TOTAL</p>
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  const configs = {
    approved: { dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]", text: "text-emerald-400", label: "Publicado" },
    rejected: { dot: "bg-rose-500", text: "text-rose-400", label: "Rechazado" },
    pending: { dot: "bg-amber-500 animate-pulse", text: "text-amber-400", label: "Moderación" },
  };

  const { dot, text, label } = configs[status || "pending"];

  return (
    <div className="flex items-center gap-2">
       <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
       <span className={`text-[10px] font-black uppercase tracking-widest ${text}`}>{label}</span>
    </div>
  );
}
