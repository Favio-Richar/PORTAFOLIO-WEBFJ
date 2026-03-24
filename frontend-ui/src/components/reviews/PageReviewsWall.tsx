"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaStar } from "react-icons/fa";
import API_BASE from "@/lib/apiBase";

function FadeInUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

type ReviewPublishMode = "idle" | "google" | "guest";

type PageReviewsWallProps = {
  pageContext: string;
  title?: string;
};

export default function PageReviewsWall({
  pageContext,
  title = "What our customers say",
}: PageReviewsWallProps) {
  const [reviewSummary, setReviewSummary] = useState({ average: 4.9, total: 0 });
  const [approvedReviews, setApprovedReviews] = useState<any[]>([]);
  const [visibleReviewCount, setVisibleReviewCount] = useState(7);
  const [expandedReviewKeys, setExpandedReviewKeys] = useState<string[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showReviewVerifyModal, setShowReviewVerifyModal] = useState(false);
  const [reviewFormSubmitting, setReviewFormSubmitting] = useState(false);
  const [reviewPublishMode, setReviewPublishMode] = useState<ReviewPublishMode>("idle");
  const [googleSdkReady, setGoogleSdkReady] = useState(false);
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

  const REVIEW_BATCH = 4;
  const REVIEW_PREVIEW_CHARS = 138;

  const ensureGoogleSdkLoaded = useCallback(async () => {
    if (typeof window === "undefined") return false;
    if ((window as any).google?.accounts?.id) {
      setGoogleSdkReady(true);
      return true;
    }

    return await new Promise<boolean>((resolve) => {
      const existingScript = document.querySelector('script[data-google-gsi="true"]') as HTMLScriptElement | null;
      if (existingScript) {
        if ((window as any).google?.accounts?.id) {
          setGoogleSdkReady(true);
          resolve(true);
          return;
        }

        existingScript.addEventListener(
          "load",
          () => {
            const ok = Boolean((window as any).google?.accounts?.id);
            setGoogleSdkReady(ok);
            resolve(ok);
          },
          { once: true }
        );
        existingScript.addEventListener(
          "error",
          () => {
            setGoogleSdkReady(false);
            resolve(false);
          },
          { once: true }
        );
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.dataset.googleGsi = "true";
      script.onload = () => {
        const ok = Boolean((window as any).google?.accounts?.id);
        setGoogleSdkReady(ok);
        resolve(ok);
      };
      script.onerror = () => {
        setGoogleSdkReady(false);
        resolve(false);
      };
      document.head.appendChild(script);
    });
  }, []);

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

  const normalizeReview = (review: any) => {
    const normalizedName = review?.user?.name || review?.display_name || review?.author_name || "Invitado";
    const normalizedComment = String(review?.comment || review?.content || "").trim();
    const normalizedAvatar = sanitizeReviewAvatar(review?.user?.avatar_url || review?.author_image || null);
    return {
      ...review,
      display_name: normalizedName,
      author_name: normalizedName,
      comment: normalizedComment,
      content: normalizedComment,
      author_image: normalizedAvatar,
      is_verified: Boolean(review?.is_verified),
      created_at: review?.created_at || new Date().toISOString(),
    };
  };

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const context = encodeURIComponent((pageContext || "").trim().toLowerCase());
        const res = await fetch(`${API_BASE}/api/reviews?page=1&page_size=40&page_context=${context}`);
        if (!res.ok) return;
        const payload = await res.json();
        const reviews = Array.isArray(payload?.items) ? payload.items : [];

        if (reviews.length === 0) {
          setApprovedReviews([]);
          setReviewSummary((prev) => ({ ...prev, total: 0 }));
          return;
        }

        const ratings = reviews
          .map((review: any) => Number(review.rating))
          .filter((value: number) => !Number.isNaN(value) && value > 0);

        if (ratings.length > 0) {
          const average = ratings.reduce((sum: number, value: number) => sum + value, 0) / ratings.length;
          setReviewSummary({ average, total: ratings.length });
        }

        setApprovedReviews(
          reviews.map((item: any) => ({
            ...item,
            comment: String(item?.comment || item?.content || "").trim(),
            content: String(item?.comment || item?.content || "").trim(),
            display_name: item?.user?.name || item?.display_name || item?.author_name || "Invitado",
            author_image: sanitizeReviewAvatar(item?.user?.avatar_url || item?.author_image || null),
          }))
        );
        setVisibleReviewCount(7);
      } catch (error) {
        console.error("Error loading reviews:", error);
      }
    };

    loadReviews();
  }, [pageContext]);

  useEffect(() => {
    ensureGoogleSdkLoaded().then((ok) => {
      if (!ok) {
        console.error("No se pudo cargar Google Identity Services.");
      }
    });
  }, [ensureGoogleSdkLoaded]);

  useEffect(() => {
    if (!reviewToast) return;
    const timer = setTimeout(() => setReviewToast(null), 3000);
    return () => clearTimeout(timer);
  }, [reviewToast]);

  const toggleReviewExpanded = useCallback((reviewKey: string) => {
    setExpandedReviewKeys((prev) =>
      prev.includes(reviewKey) ? prev.filter((key) => key !== reviewKey) : [...prev, reviewKey]
    );
  }, []);

  const getReviewDateLabel = (rawDate?: string) => {
    if (!rawDate) return "Recently";
    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) return "Recently";
    return parsed.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
  };

  const getReviewInitials = (review: any) => {
    if (review.initials && String(review.initials).trim()) return String(review.initials).trim().slice(0, 2).toUpperCase();
    const name = String(review?.user?.name || review.display_name || review.author_name || "").trim();
    if (!name) return "U";
    const tokens = name.split(" ").filter(Boolean);
    if (tokens.length === 1) return tokens[0].slice(0, 1).toUpperCase();
    return `${tokens[0][0]}${tokens[1][0]}`.toUpperCase();
  };

  const reviewInsightBullets = [
    `${reviewSummary.total} customer reviews`,
    `${reviewSummary.average.toFixed(1)} average rating across projects`,
    "Clients highlight delivery quality, communication and measurable impact",
  ];

  const visibleReviews = approvedReviews.slice(0, visibleReviewCount);
  const hasMoreReviews = visibleReviewCount < approvedReviews.length;
  const reviewFormIsError = Boolean(reviewFormMessage);

  const handleReviewInputChange = (field: string, value: string | number) => {
    setReviewForm((prev) => ({ ...prev, [field]: value }));
  };

  const pushReviewToTop = (review: any) => {
    const normalized = normalizeReview(review);
    setApprovedReviews((prev) => [normalized, ...prev]);
    setVisibleReviewCount((prev) => Math.max(prev, 8));
    setReviewSummary((prev) => {
      const previousTotal = Number(prev.total || 0);
      const previousAverage = Number(prev.average || 0);
      const nextTotal = previousTotal + 1;
      const nextAverage = ((previousAverage * previousTotal) + Number(normalized.rating || 0)) / nextTotal;
      return { average: nextAverage, total: nextTotal };
    });
  };

  const publishToast = (message: string, type: "success" | "error" = "success") => {
    setReviewToast({ type, message });
  };

  const sendReview = async (authMode: "google" | "guest", googleIdToken?: string) => {
    if (!pendingReviewPayload) return;
    setReviewPublishMode(authMode);
    setReviewFormSubmitting(true);
    setReviewFormMessage("");

    try {
      const response = await fetch(`${API_BASE}/api/reviews`, {
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
      if (newItem?.id) {
        pushReviewToTop(newItem);
      }

      const status = String(newItem?.status || "").toLowerCase();
      if (status === "pending") {
        publishToast("Resena enviada. Quedo en revision.", "success");
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
      const msg = "No se pudo conectar con Google. Revisa bloqueadores/extensiones y permite accounts.google.com.";
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
        if (dismissedReason === "credential_returned" || receivedCredential) {
          return;
        }
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

  return (
    <section className="py-20 px-0 bg-transparent">
      <div className="max-w-[1480px] mx-auto">
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

        <FadeInUp>
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-6 mb-10">
            <h2 className="text-center md:text-left text-4xl md:text-5xl font-black text-white tracking-tight">
              {title}
            </h2>
            <button
              type="button"
              onClick={() => {
                setShowReviewForm((prev) => !prev);
                setReviewFormMessage("");
              }}
              className={`group inline-flex items-center gap-2 px-6 py-3 rounded-full border font-black uppercase tracking-[0.12em] text-xs transition-all duration-300 transform-gpu hover:-translate-y-0.5 active:translate-y-px active:scale-95 ${showReviewForm
                ? "border-amber-400/70 bg-amber-900/20 text-amber-200 shadow-[0_0_0_1px_rgba(251,191,36,0.25),0_14px_28px_rgba(0,0,0,0.35)]"
                : "border-amber-500/45 text-amber-300 hover:bg-amber-900/20 hover:shadow-[0_12px_30px_rgba(0,0,0,0.35)]"}`}
            >
              <span className={`text-base leading-none transition-transform duration-300 ${showReviewForm ? "rotate-45" : "group-hover:scale-125"}`}>+</span>
              {showReviewForm ? "Cerrar Formulario" : "Agregar Resena"}
            </button>
          </div>
        </FadeInUp>

        {reviewFormMessage && (
          <div className={`mb-8 rounded-2xl border px-5 py-4 text-sm ${reviewFormIsError
            ? "border-red-700/30 bg-red-900/15 text-red-200"
            : "border-emerald-700/30 bg-emerald-900/15 text-emerald-200"}`}>
            {reviewFormMessage}
          </div>
        )}

        {showReviewForm && (
          <FadeInUp delay={0.05}>
            <form
              onSubmit={handleReviewSubmit}
              className="mb-10 relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,#12151c,#0f1218)] p-6 md:p-8 shadow-[0_20px_45px_rgba(0,0,0,0.42)] transition-all duration-500 hover:border-amber-500/30"
            >
              <div className="pointer-events-none absolute -top-20 -right-12 h-44 w-44 rounded-full bg-amber-400/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-16 h-52 w-52 rounded-full bg-cyan-400/8 blur-3xl" />
              <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/60 to-transparent" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  value={reviewForm.author_name}
                  onChange={(event) => handleReviewInputChange("author_name", event.target.value)}
                  placeholder="Nombre completo *"
                  className="relative w-full rounded-xl border border-white/10 bg-[#11151d] px-4 py-3 text-white placeholder:text-white/35 outline-none transition-all duration-300 hover:border-amber-400/35 focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 focus:shadow-[0_0_0_1px_rgba(251,191,36,0.2)]"
                  required
                />
                <input
                  value={reviewForm.author_company}
                  onChange={(event) => handleReviewInputChange("author_company", event.target.value)}
                  placeholder="Empresa *"
                  className="relative w-full rounded-xl border border-white/10 bg-[#11151d] px-4 py-3 text-white placeholder:text-white/35 outline-none transition-all duration-300 hover:border-amber-400/35 focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 focus:shadow-[0_0_0_1px_rgba(251,191,36,0.2)]"
                  required
                />
                <input
                  type="email"
                  value={reviewForm.author_email}
                  onChange={(event) => handleReviewInputChange("author_email", event.target.value)}
                  placeholder="Correo / Gmail *"
                  className="relative w-full rounded-xl border border-white/10 bg-[#11151d] px-4 py-3 text-white placeholder:text-white/35 outline-none transition-all duration-300 hover:border-amber-400/35 focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 focus:shadow-[0_0_0_1px_rgba(251,191,36,0.2)]"
                  required
                />
              </div>

              <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.14em] font-black text-white/60 mb-3">Calificacion</p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={`review-form-star-${star}`}
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
                className="w-full rounded-2xl border border-white/10 bg-[#11151d] px-4 py-3 text-white placeholder:text-white/35 outline-none transition-all duration-300 hover:border-amber-400/35 focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 focus:shadow-[0_0_0_1px_rgba(251,191,36,0.2)] resize-none"
                required
              />

              <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <p className="text-xs text-white/45">
                  La resena quedara en estado pendiente hasta aprobacion del equipo.
                </p>
                <button
                  type="submit"
                  disabled={reviewFormSubmitting || reviewPublishMode !== "idle"}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[#0c1016] font-black uppercase tracking-[0.12em] text-xs transition-all duration-300 transform-gpu hover:scale-[1.03] hover:shadow-[0_12px_30px_rgba(245,158,11,0.3)] active:scale-95 active:translate-y-px active:shadow-[0_4px_12px_rgba(245,158,11,0.2)] disabled:opacity-60 disabled:hover:scale-100"
                >
                  <span className="inline-flex items-center gap-2">
                    {reviewFormSubmitting && (
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-[#0c1016] border-t-transparent animate-spin" />
                    )}
                    {reviewFormSubmitting ? "Procesando..." : "Publicar Resena"}
                  </span>
                </button>
              </div>
            </form>
          </FadeInUp>
        )}

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
                  No almacenamos contrasenas.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleGooglePublish}
                    disabled={reviewPublishMode !== "idle"}
                    className="inline-flex justify-center items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black uppercase tracking-[0.12em] text-xs transition-all duration-300 transform-gpu hover:scale-[1.02] hover:shadow-[0_12px_28px_rgba(37,99,235,0.36)] active:scale-95 active:translate-y-px disabled:opacity-60"
                  >
                    {reviewPublishMode === "google" && (
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    )}
                    {reviewPublishMode === "google" ? "Validando..." : "Validar con Google"}
                  </button>
                  <button
                    type="button"
                    onClick={() => sendReview("guest")}
                    disabled={reviewPublishMode !== "idle"}
                    className="inline-flex justify-center items-center gap-2 px-5 py-3 rounded-xl border border-white/20 text-white/90 font-black uppercase tracking-[0.12em] text-xs transition-all duration-300 transform-gpu hover:bg-white/10 hover:shadow-[0_10px_24px_rgba(0,0,0,0.34)] active:scale-95 active:translate-y-px disabled:opacity-60"
                  >
                    {reviewPublishMode === "guest" && (
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-white/90 border-t-transparent animate-spin" />
                    )}
                    {reviewPublishMode === "guest" ? "Publicando..." : "Publicar sin foto"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {approvedReviews.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-10 text-center text-white/60">
            <p>Aun no hay resenas aprobadas para mostrar.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
              <FadeInUp delay={0.02}>
                <article className="space-y-5">
                  <div className="relative min-h-[250px] p-7 rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,#1a1d24,#15171c)] shadow-[0_22px_50px_rgba(0,0,0,0.45)]">
                    <div className="absolute -bottom-2 left-8 w-5 h-5 rotate-45 border-r border-b border-white/10 bg-[#15171c]" />
                    <div className="flex items-center gap-1 text-yellow-400 mb-5 text-lg">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar key={`summary-star-${star}`} />
                      ))}
                    </div>
                    <ul className="space-y-4">
                      {reviewInsightBullets.map((item, idx) => (
                        <li key={`insight-${idx}`} className="flex items-start gap-3 text-white/90 leading-relaxed">
                          <FaCheckCircle className="text-white/85 mt-1 text-sm flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-lg font-black border border-violet-300/25">
                      *
                    </div>
                    <div>
                      <p className="text-violet-400 font-black text-2xl leading-none">AI-Generated Summary</p>
                      <p className="text-white/55 text-sm">Based on {reviewSummary.total} approved reviews</p>
                    </div>
                  </div>
                </article>
              </FadeInUp>

              {visibleReviews.map((review: any, idx: number) => {
                const reviewKey = String(review.id ?? `review-${idx}`);
                const isExpanded = expandedReviewKeys.includes(reviewKey);
                const content = String(review.comment || review.content || "").trim();
                const isLong = content.length > REVIEW_PREVIEW_CHARS;
                const displayContent = isExpanded || !isLong
                  ? content
                  : `${content.slice(0, REVIEW_PREVIEW_CHARS)}...`;
                const rating = Math.max(1, Math.min(5, Number(review.rating) || 5));
                const reviewerName = String(review?.user?.name || review.display_name || review.author_name || "Anonymous").trim();
                const reviewerAvatar = sanitizeReviewAvatar(review?.user?.avatar_url || review.author_image || null);

                return (
                  <FadeInUp key={reviewKey} delay={0.06 + idx * 0.05}>
                    <article className="space-y-5">
                      <div className="relative min-h-[250px] p-7 rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,#1a1d24,#15171c)] shadow-[0_22px_50px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
                        <div className="absolute -bottom-2 left-8 w-5 h-5 rotate-45 border-r border-b border-white/10 bg-[#15171c]" />
                        <div className="flex items-center gap-1 text-yellow-400 mb-4 text-lg">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <FaStar key={`${reviewKey}-star-${starIndex}`} className={starIndex < rating ? "text-yellow-400" : "text-slate-700"} />
                          ))}
                        </div>
                        <p className="text-white text-[1.08rem] md:text-[1.18rem] leading-relaxed break-words [overflow-wrap:anywhere]">
                          {displayContent || "Great place to stay"}
                        </p>
                        {isLong && (
                          <button
                            type="button"
                            onClick={() => toggleReviewExpanded(reviewKey)}
                            className="mt-2 text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            {isExpanded ? "Read less" : "Read more"}
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {reviewerAvatar ? (
                          <img
                            src={reviewerAvatar}
                            alt={reviewerName || "Reviewer"}
                            className="w-12 h-12 rounded-full object-cover border border-white/20"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#1b1f2a] border border-white/20 text-white font-black flex items-center justify-center">
                            {getReviewInitials(review)}
                          </div>
                        )}
                        <div>
                          <p className="text-amber-50 font-black text-xl leading-none">{reviewerName || "Anonymous"}</p>
                          <p className="mt-1 text-xs text-white/55">
                            {getReviewDateLabel(review.created_at)} on <span className="text-sky-400">Portfolio</span>
                          </p>
                          <div className="mt-2 flex items-center flex-wrap gap-2 text-xs">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full border font-black uppercase tracking-[0.1em] ${
                                review.is_verified
                                  ? "border-emerald-500/45 bg-emerald-900/30 text-emerald-200"
                                  : "border-white/15 bg-white/5 text-white/65"
                              }`}
                            >
                              {review.is_verified ? "Verificada" : "No verificada"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </FadeInUp>
                );
              })}
            </div>

            {hasMoreReviews && (
              <div className="mt-16 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleReviewCount((prev) => prev + REVIEW_BATCH)}
                  className="min-w-[220px] px-8 py-3 rounded-xl bg-[#1b1f24] border border-white/10 text-white/90 font-bold transition-all duration-300 transform-gpu hover:bg-[#242933] hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(0,0,0,0.35)] active:scale-95 active:translate-y-px active:shadow-[0_6px_16px_rgba(0,0,0,0.3)]"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
