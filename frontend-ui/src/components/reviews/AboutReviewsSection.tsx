"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaQuoteLeft, FaStar } from "react-icons/fa";

type ReviewPublishMode = "idle" | "google" | "guest";

type AboutReviewsSectionProps = {
  pageContext: string;
};

const FALLBACK_REVIEWS = [
  {
    id: "fallback-1",
    author_name: "Juan Martinez",
    author_role: "CEO, TechVentures",
    author_company: "TechVentures",
    comment:
      "Transformaron completamente nuestra operacion. El sistema ERP desarrollado aumento nuestra eficiencia en un 300%.",
    rating: 5,
  },
  {
    id: "fallback-2",
    author_name: "Maria Campos",
    author_role: "Directora Digital",
    author_company: "RetailCorp",
    comment:
      "La atencion al detalle es impresionante. Cada pixel, cada interaccion esta cuidada al maximo nivel.",
    rating: 5,
  },
  {
    id: "fallback-3",
    author_name: "Carlos Rodriguez",
    author_role: "CTO",
    author_company: "FinTech Pro",
    comment:
      "El equipo de soporte 24/7 nos ha salvado en momentos criticos. Respuesta en menos de 5 minutos.",
    rating: 5,
  },
];

const sanitizeReviewAvatar = (rawValue?: string | null) => {
  const value = String(rawValue || "").trim();
  if (!value) return null;
  const lower = value.toLowerCase();
  if (lower.includes("via.placeholder.com") || lower.includes("placehold.co")) return null;
  if (
    lower.startsWith("http://") ||
    lower.startsWith("https://") ||
    lower.startsWith("data:image/")
  ) {
    return value;
  }
  return null;
};

const sanitizeReviewComment = (rawValue?: string | null) => {
  const raw = String(rawValue || "").replace(/\s+/g, " ").trim();
  if (!raw) return "";

  const suspiciousPattern =
    /(google_client_ids|next_public_google_client_id|client_id_anterior|client_id_nuevo|optionalmente\s+varios\s+client|separados\s+por\s+coma|oauth)/i;

  const quotedSegments = Array.from(raw.matchAll(/"([^"]+)"/g))
    .map((match) => String(match[1] || "").trim())
    .filter(Boolean);

  if (suspiciousPattern.test(raw)) {
    const cleanSegment = quotedSegments.find(
      (segment) => !suspiciousPattern.test(segment) && segment.length >= 8
    );
    return cleanSegment || "";
  }

  if (quotedSegments.length >= 2) {
    return quotedSegments.join(" ");
  }

  return raw;
};

const normalizeReview = (review: any) => {
  const normalizedName = String(review?.user?.name || review?.display_name || review?.author_name || "Invitado").trim();
  const normalizedComment = sanitizeReviewComment(review?.comment || review?.content || "");
  const normalizedAvatar = sanitizeReviewAvatar(review?.user?.avatar_url || review?.author_image || null);
  return {
    ...review,
    display_name: normalizedName,
    author_name: normalizedName,
    author_role: String(review?.author_role || review?.role || "").trim(),
    author_company: String(review?.company || review?.author_company || "").trim(),
    comment: normalizedComment,
    content: normalizedComment,
    author_image: normalizedAvatar,
    rating: Math.max(1, Math.min(5, Number(review?.rating) || 5)),
    is_verified: Boolean(review?.is_verified),
    created_at: review?.created_at || new Date().toISOString(),
  };
};

const resolveReviewContexts = (pageContext: string) => {
  const normalized = String(pageContext || "").trim().toLowerCase();
  if (!normalized) return ["clientes"];
  if (normalized === "sobre mi" || normalized === "sobre_mi" || normalized === "sobremi") return ["sobre-mi"];
  return [normalized];
};

export default function AboutReviewsSection({ pageContext }: AboutReviewsSectionProps) {
  const [approvedReviews, setApprovedReviews] = useState<any[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showReviewVerifyModal, setShowReviewVerifyModal] = useState(false);
  const [reviewFormSubmitting, setReviewFormSubmitting] = useState(false);
  const [reviewPublishMode, setReviewPublishMode] = useState<ReviewPublishMode>("idle");
  const [pendingReviewPayload, setPendingReviewPayload] = useState<any>(null);
  const [reviewFormMessage, setReviewFormMessage] = useState("");
  const [reviewToast, setReviewToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [reviewForm, setReviewForm] = useState({
    author_name: "",
    author_company: "",
    author_email: "",
    content: "",
    rating: 5,
  });
  const normalizedContext = String(pageContext || "").trim().toLowerCase();
  const isAboutContext =
    normalizedContext === "sobre-mi" ||
    normalizedContext === "sobre mi" ||
    normalizedContext === "sobre_mi" ||
    normalizedContext === "sobremi";

  const getInitials = (name: string) => {
    const clean = String(name || "").trim();
    if (!clean) return "U";
    const tokens = clean.split(" ").filter(Boolean);
    if (tokens.length === 1) return tokens[0].slice(0, 1).toUpperCase();
    return `${tokens[0][0]}${tokens[1][0]}`.toUpperCase();
  };

  const ensureGoogleSdkLoaded = useCallback(async () => {
    if (typeof window === "undefined") return false;
    if ((window as any).google?.accounts?.id) {
      return true;
    }

    return await new Promise<boolean>((resolve) => {
      const existingScript = document.querySelector('script[data-google-gsi="true"]') as HTMLScriptElement | null;
      if (existingScript) {
        if ((window as any).google?.accounts?.id) {
          resolve(true);
          return;
        }
        existingScript.addEventListener(
          "load",
          () => resolve(Boolean((window as any).google?.accounts?.id)),
          { once: true }
        );
        existingScript.addEventListener("error", () => resolve(false), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.dataset.googleGsi = "true";
      script.onload = () => resolve(Boolean((window as any).google?.accounts?.id));
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }, []);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const contexts = resolveReviewContexts(pageContext);
        const groups = await Promise.all(
          contexts.map(async (ctx) => {
            const encodedContext = encodeURIComponent(ctx);
            const res = await fetch(`http://localhost:8000/api/reviews?page=1&page_size=40&page_context=${encodedContext}`);
            if (!res.ok) return [];
            const payload = await res.json();
            return Array.isArray(payload?.items) ? payload.items : [];
          })
        );

        const merged = groups.flat();
        const normalized = merged
          .map((item: any) => normalizeReview(item))
          .filter((item: any) => (item.status || "approved").toLowerCase() === "approved")
          .filter((item: any) => String(item.comment || "").trim().length >= 8);

        const seen = new Set<string>();
        const deduped = normalized.filter((item: any) => {
          const idKey = String(item?.id || "").trim();
          const fallbackKey = `${String(item?.author_name || "").trim()}|${String(item?.comment || "").trim()}|${String(item?.created_at || "").trim()}`;
          const key = idKey || fallbackKey;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        deduped.sort((a: any, b: any) => {
          const dateA = new Date(a?.created_at || 0).getTime();
          const dateB = new Date(b?.created_at || 0).getTime();
          return dateB - dateA;
        });

        setApprovedReviews(deduped);
      } catch (error) {
        console.error("Error loading reviews:", error);
      }
    };

    loadReviews();
  }, [pageContext]);

  useEffect(() => {
    ensureGoogleSdkLoaded().then((ok) => {
      if (!ok) console.error("No se pudo cargar Google Identity Services.");
    });
  }, [ensureGoogleSdkLoaded]);

  useEffect(() => {
    if (!reviewToast) return;
    const timer = setTimeout(() => setReviewToast(null), 3200);
    return () => clearTimeout(timer);
  }, [reviewToast]);

  const publishToast = (message: string, type: "success" | "error" = "success") => {
    setReviewToast({ type, message });
  };

  const handleReviewInputChange = (field: string, value: string | number) => {
    setReviewForm((prev) => ({ ...prev, [field]: value }));
  };

  const pushReviewToTop = (review: any) => {
    const normalized = normalizeReview(review);
    setApprovedReviews((prev) => [normalized, ...prev]);
  };

  const sendReview = async (authMode: "google" | "guest", googleIdToken?: string) => {
    if (!pendingReviewPayload) return;
    setReviewPublishMode(authMode);
    setReviewFormSubmitting(true);
    setReviewFormMessage("");

    try {
      const response = await fetch("http://localhost:8000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: pendingReviewPayload.rating,
          comment: pendingReviewPayload.comment,
          authMode,
          googleIdToken: googleIdToken || undefined,
          display_name: pendingReviewPayload.display_name,
          company: pendingReviewPayload.company,
          email: pendingReviewPayload.email,
          page_context: pageContext,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.detail || payload?.message || "No se pudo publicar la resena.");
      }

      const newItem = normalizeReview(payload?.item || payload);
      const status = String(newItem?.status || "").toLowerCase();
      if (status !== "pending") {
        pushReviewToTop(newItem);
      }

      if (status === "pending") {
        publishToast("Resena enviada. Quedo pendiente de aprobacion.", "success");
      } else {
        publishToast(authMode === "google" ? "Resena publicada" : "Resena enviada", "success");
      }

      setShowReviewVerifyModal(false);
      setShowReviewForm(false);
      setPendingReviewPayload(null);
      setReviewForm({
        author_name: "",
        author_company: "",
        author_email: "",
        content: "",
        rating: 5,
      });
    } catch (error: any) {
      const message = error?.message || "Ocurrio un problema al publicar la resena.";
      setReviewFormMessage(message);
      publishToast(message, "error");
      console.error("Error publishing review:", error);
    } finally {
      setReviewPublishMode("idle");
      setReviewFormSubmitting(false);
    }
  };

  const handleGooglePublish = async () => {
    if (!pendingReviewPayload) return;
    const googleClientId = String(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "").trim();
    if (!googleClientId) {
      const msg = "Falta NEXT_PUBLIC_GOOGLE_CLIENT_ID en el frontend.";
      setReviewFormMessage(msg);
      publishToast(msg, "error");
      return;
    }

    const sdkReady = await ensureGoogleSdkLoaded();
    const google = (window as any)?.google;
    if (!google?.accounts?.id || !sdkReady) {
      const msg = "No se pudo conectar con Google. Revisa bloqueadores y permite accounts.google.com.";
      setReviewFormMessage(msg);
      publishToast(msg, "error");
      return;
    }

    setReviewPublishMode("google");
    let receivedCredential = false;

    google.accounts.id.initialize({
      client_id: googleClientId,
      callback: async (response: any) => {
        const idToken = response?.credential;
        if (!idToken) {
          setReviewPublishMode("idle");
          setReviewFormMessage("No se recibio token de Google.");
          return;
        }
        receivedCredential = true;
        await sendReview("google", idToken);
      },
      ux_mode: "popup",
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    google.accounts.id.prompt((notification: any) => {
      const notDisplayedReason = notification?.getNotDisplayedReason?.();
      const skippedReason = notification?.getSkippedReason?.();
      const dismissedReason = notification?.getDismissedReason?.();

      if (
        notification?.isNotDisplayed?.() ||
        notification?.isSkippedMoment?.() ||
        notification?.isDismissedMoment?.()
      ) {
        if (dismissedReason === "credential_returned" || receivedCredential) return;
        setReviewPublishMode("idle");
        const rawReason = notDisplayedReason || skippedReason || dismissedReason;
        const reason = rawReason ? ` (${rawReason})` : "";
        const message = `No fue posible completar Google${reason}. Puedes publicar sin validar.`;
        setReviewFormMessage(message);
        publishToast(message, "error");
      }
    });
  };

  const handleReviewSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReviewFormMessage("");

    const authorName = reviewForm.author_name.trim();
    const authorCompany = reviewForm.author_company.trim();
    const authorEmail = reviewForm.author_email.trim();
    const content = reviewForm.content.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!authorName || !authorCompany || !authorEmail || content.length < 20) {
      setReviewFormMessage("Completa nombre, empresa, correo y una resena de al menos 20 caracteres.");
      return;
    }

    if (!emailPattern.test(authorEmail)) {
      setReviewFormMessage("Ingresa un correo valido (ejemplo@dominio.com).");
      return;
    }

    setPendingReviewPayload({
      display_name: authorName,
      company: authorCompany,
      email: authorEmail,
      rating: Math.max(1, Math.min(5, Number(reviewForm.rating) || 5)),
      comment: content,
    });
    setShowReviewVerifyModal(true);
  };

  const cards = useMemo(() => {
    const approved = approvedReviews.slice(0, 3);
    if (isAboutContext) return approved;
    if (approved.length >= 3) return approved;

    const usedIds = new Set(
      approved.map((review: any) => String(review?.id || review?.author_name || review?.display_name || ""))
    );

    const needed = 3 - approved.length;
    const fallbackPool = FALLBACK_REVIEWS.filter((item) => !usedIds.has(String(item.id)));
    return [...approved, ...fallbackPool.slice(0, needed)];
  }, [approvedReviews, isAboutContext]);

  return (
    <section className="pt-20 md:pt-24 pb-10 md:pb-14 px-4 bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <AnimatePresence>
          {reviewToast && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed top-6 right-6 z-[160] max-w-sm"
            >
              <div
                className={`rounded-2xl border px-4 py-3 backdrop-blur-xl shadow-[0_20px_45px_rgba(0,0,0,0.45)] ${
                  reviewToast.type === "success"
                    ? "border-emerald-500/35 bg-emerald-900/35 text-emerald-100"
                    : "border-rose-500/35 bg-rose-900/35 text-rose-100"
                }`}
              >
                <p className="text-sm font-semibold leading-relaxed">{reviewToast.message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center mb-16">
          <span className="text-blue-400 font-semibold text-sm tracking-widest uppercase mb-4 block">
            Testimonios
          </span>
          <h2 className="font-display text-5xl md:text-6xl font-bold text-white">
            {isAboutContext ? (
              <>
                Resenas <span className="gradient-text">Sobre Mi</span>
              </>
            ) : (
              <>
                Clientes <span className="gradient-text">Satisfechos</span>
              </>
            )}
          </h2>
        </div>

        <div className="flex justify-center mb-10">
          <button
            type="button"
            onClick={() => {
              setShowReviewForm((prev) => !prev);
              setReviewFormMessage("");
            }}
            className={`group inline-flex items-center gap-2 px-6 py-3 rounded-full border font-black uppercase tracking-[0.12em] text-xs transition-all duration-300 transform-gpu hover:-translate-y-0.5 active:translate-y-px active:scale-95 ${
              showReviewForm
                ? "border-amber-400/70 bg-amber-900/20 text-amber-200 shadow-[0_0_0_1px_rgba(251,191,36,0.25),0_14px_28px_rgba(0,0,0,0.35)]"
                : "border-amber-500/45 text-amber-300 hover:bg-amber-900/20 hover:shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
            }`}
          >
            <span className={`text-base leading-none transition-transform duration-300 ${showReviewForm ? "rotate-45" : "group-hover:scale-125"}`}>+</span>
            {showReviewForm ? "Cerrar Formulario" : "Agregar Resena"}
          </button>
        </div>

        {reviewFormMessage && (
          <div className="max-w-5xl mx-auto mb-8 rounded-2xl border border-red-700/30 bg-red-900/15 px-5 py-4 text-sm text-red-200">
            {reviewFormMessage}
          </div>
        )}

        {showReviewForm && (
          <form
            onSubmit={handleReviewSubmit}
            className="max-w-5xl mx-auto mb-12 relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,#12151c,#0f1218)] p-6 md:p-8 shadow-[0_20px_45px_rgba(0,0,0,0.42)] transition-all duration-500 hover:border-amber-500/30"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                value={reviewForm.author_name}
                onChange={(event) => handleReviewInputChange("author_name", event.target.value)}
                placeholder="Nombre completo *"
                className="w-full rounded-xl border border-white/10 bg-[#11151d] px-4 py-3 text-white placeholder:text-white/35 outline-none transition-all duration-300 hover:border-amber-400/35 focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20"
                required
              />
              <input
                value={reviewForm.author_company}
                onChange={(event) => handleReviewInputChange("author_company", event.target.value)}
                placeholder="Empresa *"
                className="w-full rounded-xl border border-white/10 bg-[#11151d] px-4 py-3 text-white placeholder:text-white/35 outline-none transition-all duration-300 hover:border-amber-400/35 focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20"
                required
              />
              <input
                type="email"
                value={reviewForm.author_email}
                onChange={(event) => handleReviewInputChange("author_email", event.target.value)}
                placeholder="Correo / Gmail *"
                className="w-full rounded-xl border border-white/10 bg-[#11151d] px-4 py-3 text-white placeholder:text-white/35 outline-none transition-all duration-300 hover:border-amber-400/35 focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20"
                required
              />
            </div>

            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.14em] font-black text-white/60 mb-3">Calificacion</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={`about-review-form-star-${star}`}
                    type="button"
                    onClick={() => handleReviewInputChange("rating", star)}
                    className="text-2xl transition-all duration-200 hover:scale-125 active:scale-90"
                  >
                    <FaStar className={Number(reviewForm.rating) >= star ? "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.45)]" : "text-slate-600"} />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={reviewForm.content}
              onChange={(event) => handleReviewInputChange("content", event.target.value)}
              placeholder="Cuentanos tu experiencia (minimo 20 caracteres) *"
              rows={4}
              className="w-full rounded-2xl border border-white/10 bg-[#11151d] px-4 py-3 text-white placeholder:text-white/35 outline-none transition-all duration-300 hover:border-amber-400/35 focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 resize-none"
              required
            />

            <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <p className="text-xs text-white/45">La resena quedara en estado pendiente hasta aprobacion del equipo.</p>
              <button
                type="submit"
                disabled={reviewFormSubmitting || reviewPublishMode !== "idle"}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[#0c1016] font-black uppercase tracking-[0.12em] text-xs transition-all duration-300 transform-gpu hover:scale-[1.03] hover:shadow-[0_12px_30px_rgba(245,158,11,0.3)] active:scale-95 disabled:opacity-60"
              >
                {reviewFormSubmitting ? "Procesando..." : "Publicar Resena"}
              </button>
            </div>
          </form>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {cards.length === 0 && isAboutContext ? (
            <div className="md:col-span-3 rounded-3xl border border-white/10 bg-slate-900/30 p-8 text-center">
              <p className="text-slate-300 text-lg font-semibold">Aun no hay resenas registradas en Sobre mi.</p>
              <p className="text-slate-500 text-sm mt-2">
                Publica una desde este formulario y luego apruebala en el panel de Admin.
              </p>
            </div>
          ) : cards.map((review, i) => {
            const name = String(review?.user?.name || review.display_name || review.author_name || "Invitado").trim();
            const role = String(review.author_role || review.role || "").trim();
            const company = String(review.author_company || review.company || "").trim();
            const defaultRole = "Cliente";
            const defaultCompany = "Portfolio";
            const content = String(review.comment || review.content || "").trim();
            const rating = Math.max(1, Math.min(5, Number(review.rating) || 5));
            const avatar = sanitizeReviewAvatar(review?.user?.avatar_url || review.author_image || null);
            return (
              <motion.div
                key={String(review.id || `about-review-${i}`)}
                className="relative p-8 rounded-3xl bg-slate-800/30 border border-white/5 hover:border-white/20 transition-all group overflow-hidden"
                initial={{ opacity: 0, scale: 0.95, y: 14 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.12, duration: 0.45 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
              >
                <FaQuoteLeft className="absolute top-6 left-6 w-8 h-8 text-blue-500/20" />
                <div className="flex gap-1 mb-6 mt-4">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <FaStar key={`about-card-star-${i}-${starIndex}`} className={starIndex < rating ? "w-5 h-5 text-yellow-500 fill-yellow-500" : "w-5 h-5 text-slate-700"} />
                  ))}
                </div>
                <p className="text-slate-300 text-lg leading-relaxed mb-8 relative z-10 break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-pre-wrap">
                  {content || "Excelente servicio y ejecucion profesional."}
                </p>
                <div className="flex items-center gap-4">
                  {avatar ? (
                    <img src={avatar} alt={name} className="w-14 h-14 rounded-full object-cover border border-white/20" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                      {getInitials(name)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-white font-bold">{name}</h4>
                    <p className="text-slate-500 text-sm">{role || defaultRole}</p>
                    <p className="text-blue-400 text-xs mt-1">{company || defaultCompany}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {showReviewVerifyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-md p-6 flex items-center justify-center"
            onClick={() => {
              if (reviewPublishMode === "idle") {
                setShowReviewVerifyModal(false);
                setPendingReviewPayload(null);
              }
            }}
          >
            <motion.div
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 16, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,#0d1220,#10162a)] p-7 md:p-8 shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="inline-flex px-3 py-1.5 rounded-full border border-amber-500/40 bg-amber-900/15 text-[10px] tracking-[0.18em] font-black uppercase text-amber-300 mb-4">
                Verifica tu resena
              </div>
              <h3 className="text-3xl font-black text-white mb-3">Publicacion segura y confiable</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Para mostrar tu foto real y proteger la calidad del feedback, valida tu resena con Google.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGooglePublish}
                  disabled={reviewPublishMode !== "idle"}
                  className="inline-flex justify-center items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black uppercase tracking-[0.12em] text-xs transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
                >
                  {reviewPublishMode === "google" ? "Validando..." : "Validar con Google"}
                </button>
                <button
                  type="button"
                  onClick={() => sendReview("guest")}
                  disabled={reviewPublishMode !== "idle"}
                  className="inline-flex justify-center items-center gap-2 px-5 py-3 rounded-xl border border-white/20 text-white/90 font-black uppercase tracking-[0.12em] text-xs transition-all duration-300 hover:bg-white/10 disabled:opacity-60"
                >
                  {reviewPublishMode === "guest" ? "Publicando..." : "Publicar sin foto"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
