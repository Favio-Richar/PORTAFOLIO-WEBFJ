"use client";

import { useEffect, useMemo, useState } from "react";
import { FaCheck, FaClock, FaEdit, FaStar, FaTimes, FaTrash } from "react-icons/fa";

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

const API_BASE = "http://localhost:8000/api/services-page/reviews";
const KNOWN_REVIEW_ORIGINS = ["blog", "clientes", "servicios", "proyectos"] as const;

function normalizePageContext(value?: string | null) {
  const raw = (value || "general").toLowerCase().trim();
  if (raw === "cliente") return "clientes";
  if (raw === "servicio") return "servicios";
  if (raw === "proyecto") return "proyectos";
  return raw || "general";
}

function getOriginLabel(origin: string) {
  const normalized = normalizePageContext(origin);
  const labels: Record<string, string> = {
    blog: "Blog",
    clientes: "Cliente",
    servicios: "Servicio",
    proyectos: "Proyecto",
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
      const res = await fetch(`${API_BASE}/admin`);
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
      const res = await fetch(`${API_BASE}/${review.id}`, {
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
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
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
    <div className="max-w-[1400px] mx-auto p-8 space-y-6">
      <section className="border border-white/10 bg-[#070b14]/70 p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black text-white uppercase tracking-wide">Testimonios y Reviews</h2>
            <p className="text-white/60 mt-2">Administra comentario, calificacion, estado y origen.</p>
          </div>
          <button
            onClick={loadReviews}
            className="px-6 py-3 text-xs font-black uppercase tracking-[0.25em] bg-blue-600 text-white hover:bg-blue-500 transition-colors"
          >
            Recargar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="border border-white/10 bg-white/[0.03] p-4">
            <p className="text-white/50 text-xs uppercase tracking-widest">Total</p>
            <p className="text-white text-3xl font-black">{stats.total}</p>
          </div>
          <div className="border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="text-emerald-300 text-xs uppercase tracking-widest">Aprobadas</p>
            <p className="text-emerald-300 text-3xl font-black">{stats.approved}</p>
          </div>
          <div className="border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="text-amber-300 text-xs uppercase tracking-widest">Pendientes</p>
            <p className="text-amber-300 text-3xl font-black">{stats.pending}</p>
          </div>
        </div>
      </section>

      <section className="border border-white/10 bg-[#070b14]/70 p-8">
        {error && <div className="mb-4 text-red-400 font-bold">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por autor, empresa o comentario..."
            className="lg:col-span-2 bg-black/30 border border-white/15 text-white px-4 py-3 outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | ReviewStatus)}
            className="bg-black/30 border border-white/15 text-white px-4 py-3 outline-none"
          >
            <option value="all" className="bg-slate-900">Todos los estados</option>
            <option value="pending" className="bg-slate-900">pending</option>
            <option value="approved" className="bg-slate-900">approved</option>
            <option value="rejected" className="bg-slate-900">rejected</option>
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-black/30 border border-white/15 text-white px-4 py-3 outline-none"
          >
            <option value="all" className="bg-slate-900">Todos los origenes</option>
            {sources.map((src) => (
              <option key={src} value={src} className="bg-slate-900">
                {getOriginLabel(src)}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">
          Mostrando {filteredReviews.length} de {reviews.length} registros
        </div>

        {loading ? (
          <div className="text-white/60">Cargando reviews...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-white/60">No hay reviews para esos filtros.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredReviews.map((review) => (
              <article key={review.id} className="border border-white/10 bg-white/[0.03] p-5 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-white font-black">{review.author_name}</p>
                    <p className="text-white/50 text-sm">
                      {review.author_role || "Sin cargo"}
                      {review.author_company ? ` • ${review.author_company}` : ""}
                    </p>
                    <p className="text-white/35 text-xs mt-1">
                      Fecha: {formatReviewDate(review.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={review.status} />
                  </div>
                </div>

                {(() => {
                  const isEditing = editingReviewId === review.id;
                  const draftValue = isEditing
                    ? draftContentById[review.id] ?? review.content
                    : review.content;

                  return (
                <textarea
                  value={draftValue}
                  readOnly={!isEditing}
                  onChange={(e) =>
                    setDraftContentById((prev) => ({
                      ...prev,
                      [review.id]: e.target.value,
                    }))
                  }
                  className={`w-full min-h-[100px] border p-3 outline-none transition-colors ${
                    isEditing
                      ? "bg-black/30 border-blue-500/40 text-white"
                      : "bg-black/20 border-white/10 text-white/80 cursor-not-allowed"
                  }`}
                />
                  );
                })()}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-black/30 border border-white/15 p-3">
                    <p className="text-white/50 text-[10px] uppercase tracking-widest mb-2">Calificacion</p>
                    <p className="text-white font-bold">{Math.max(1, Math.min(5, review.rating || 0))} / 5</p>
                    <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">Solo lectura</p>
                  </div>

                  <div className="bg-black/30 border border-white/15 p-3">
                    <p className="text-white/50 text-[10px] uppercase tracking-widest mb-2">Estado</p>
                    <select
                      value={review.status}
                      onChange={(e) => updateReview(review, { status: e.target.value as ReviewStatus })}
                      className="w-full bg-transparent text-white outline-none"
                    >
                      <option value="pending" className="bg-slate-900">pending</option>
                      <option value="approved" className="bg-slate-900">approved</option>
                      <option value="rejected" className="bg-slate-900">rejected</option>
                    </select>
                  </div>

                  <div className="bg-black/30 border border-white/15 p-3">
                    <p className="text-white/50 text-[10px] uppercase tracking-widest mb-2">Origen</p>
                    <p className="text-white/80 text-sm">{getOriginLabel(normalizePageContext(review.page_context))}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: Math.max(1, Math.min(5, review.rating || 0)) }).map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {editingReviewId === review.id ? (
                      <>
                        <button
                          disabled={savingId === review.id}
                          onClick={() => saveEditedContent(review)}
                          className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
                        >
                          Guardar
                        </button>
                        <button
                          disabled={savingId === review.id}
                          onClick={() => cancelEditing(review.id)}
                          className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        disabled={savingId === review.id}
                        onClick={() => startEditing(review)}
                        className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] bg-blue-700 text-white hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                      >
                        <FaEdit /> Editar
                      </button>
                    )}
                    <button
                      disabled={savingId === review.id}
                      onClick={() => deleteReview(review.id)}
                      className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] bg-red-700 text-white hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
                    >
                      <FaTrash /> Eliminar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatusPill({ status }: { status: ReviewStatus }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
        <FaCheck /> approved
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-rose-500/20 text-rose-300 border border-rose-500/40">
        <FaTimes /> rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/40">
      <FaClock /> pending
    </span>
  );
}
