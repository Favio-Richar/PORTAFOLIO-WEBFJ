"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  FaCloudUploadAlt,
  FaEdit,
  FaImage,
  FaPlus,
  FaRegEye,
  FaRegEyeSlash,
  FaSave,
  FaTrash,
  FaTimes,
  FaVideo,
} from "react-icons/fa";
import API_BASE from "@/lib/apiBase";
import { adminFetch } from "@/lib/adminFetch";

type MediaType = "image" | "video";

interface BlogHeroSlide {
  id: number;
  media_type: MediaType;
  background_image_url: string;
  background_video_url: string;
  is_active: boolean;
  order_index: number;
}

interface BlogCard {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  tags: string;
  is_published: boolean;
  created_at: string;
  is_local_seed?: boolean;
}

interface BlogCardDraft {
  title: string;
  content: string;
  author: string;
  category: string;
  tags: string;
  is_published: boolean;
}

interface UploadResponse {
  url?: string;
}

const BACKEND_URL = API_BASE;

const INITIAL_CARD_FORM: BlogCardDraft = {
  title: "",
  content: "",
  author: "Equipo Editorial",
  category: "General",
  tags: "",
  is_published: true,
};

const LOCAL_BLOG_SEED_CARDS: BlogCard[] = [
  {
    id: -1001,
    title: "Como un sistema de reservas aumento 200% las ventas de un hotel",
    content: "Caso real de implementacion de reservas online con pagos integrados y automatizacion operativa.",
    author: "Equipo Editorial",
    category: "Casos de Exito",
    tags: "reservas, ventas, automatizacion",
    is_published: true,
    created_at: "2024-01-15T00:00:00Z",
    is_local_seed: true,
  },
  {
    id: -1002,
    title: "Guia completa: que sistema de facturacion conviene para una empresa en crecimiento",
    content: "Comparativa clara entre alternativas de facturacion para crecer con orden financiero.",
    author: "Equipo Editorial",
    category: "Guias Practicas",
    tags: "facturacion, pymes, guias",
    is_published: true,
    created_at: "2024-01-12T00:00:00Z",
    is_local_seed: true,
  },
  {
    id: -1003,
    title: "5 errores costosos en gestion de inventario y como evitarlos",
    content: "Lecciones practicas para ecommerce y retail enfocadas en reposicion y control de stock.",
    author: "Equipo Editorial",
    category: "Tips y Consejos",
    tags: "inventario, ecommerce, operaciones",
    is_published: true,
    created_at: "2024-01-10T00:00:00Z",
    is_local_seed: true,
  },
  {
    id: -1004,
    title: "Por que un restaurante necesita un POS moderno para escalar operaciones",
    content: "Integracion de caja, cocina y delivery para decisiones de negocio con datos reales.",
    author: "Equipo Editorial",
    category: "Industria",
    tags: "pos, restaurantes, integraciones",
    is_published: true,
    created_at: "2024-01-08T00:00:00Z",
    is_local_seed: true,
  },
  {
    id: -1005,
    title: "Seguridad web para empresas: controles minimos para operar sin riesgo",
    content: "Checklist tecnico para proteger datos y continuidad operativa en aplicaciones web.",
    author: "Equipo Editorial",
    category: "Seguridad",
    tags: "seguridad, hardening, continuidad",
    is_published: true,
    created_at: "2024-01-05T00:00:00Z",
    is_local_seed: true,
  },
  {
    id: -1006,
    title: "Plataforma SaaS o desarrollo a medida: decision tecnica para directores",
    content: "Comparativa de costo, velocidad y flexibilidad para decidir la mejor ruta de producto.",
    author: "Equipo Editorial",
    category: "Estrategia",
    tags: "saas, producto, arquitectura",
    is_published: true,
    created_at: "2024-01-02T00:00:00Z",
    is_local_seed: true,
  },
  {
    id: -1007,
    title: "Automatizacion de cobranza: como mejorar flujo de caja sin aumentar equipo",
    content: "Estrategias para reducir mora con recordatorios, reglas de cobro y seguimiento automatizado.",
    author: "Equipo Editorial",
    category: "Tips y Consejos",
    tags: "cobranza, flujo de caja, automatizacion",
    is_published: true,
    created_at: "2024-01-01T00:00:00Z",
    is_local_seed: true,
  },
  {
    id: -1008,
    title: "Ecommerce profesional: que necesita una tienda para vender de forma estable",
    content: "Base operativa para vender online con catalogo, inventario, pagos y soporte conectados.",
    author: "Equipo Editorial",
    category: "Industria",
    tags: "ecommerce, catalogo, pagos",
    is_published: true,
    created_at: "2023-12-28T00:00:00Z",
    is_local_seed: true,
  },
];

const normalizeSlide = (raw: Partial<BlogHeroSlide> | null | undefined): BlogHeroSlide => ({
  id: Number(raw?.id || 0),
  media_type: raw?.media_type === "video" ? "video" : "image",
  background_image_url: raw?.background_image_url || "",
  background_video_url: raw?.background_video_url || "",
  is_active: typeof raw?.is_active === "boolean" ? raw.is_active : true,
  order_index: Number(raw?.order_index || 0),
});

const normalizeCard = (raw: Partial<BlogCard> | null | undefined): BlogCard => ({
  id: Number(raw?.id || 0),
  title: (raw?.title || "Sin titulo").trim(),
  content: raw?.content || "",
  author: (raw?.author || "Equipo Editorial").trim(),
  category: (raw?.category || "General").trim(),
  tags: raw?.tags || "",
  is_published: typeof raw?.is_published === "boolean" ? raw.is_published : true,
  created_at: raw?.created_at || "",
  is_local_seed: false,
});

const summarize = (text: string, max = 170): string => {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean || "Sin descripcion";
  return `${clean.slice(0, max - 3)}...`;
};

const formatCreatedAt = (iso: string): string => {
  if (!iso) return "Fecha no disponible";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return date.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
};

export default function BlogAdmin() {
  const [slides, setSlides] = useState<BlogHeroSlide[]>([]);
  const [isLoadingSlides, setIsLoadingSlides] = useState(true);
  const [uploadingType, setUploadingType] = useState<"" | "image" | "video">("");
  const [workingSlideId, setWorkingSlideId] = useState<number | null>(null);

  const [cards, setCards] = useState<BlogCard[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [workingCardId, setWorkingCardId] = useState<number | null>(null);
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  const [isCardFormOpen, setIsCardFormOpen] = useState(false);
  const [cardForm, setCardForm] = useState<BlogCardDraft>(INITIAL_CARD_FORM);
  const [cardsSource, setCardsSource] = useState<"backend" | "fallback-empty" | "fallback-error">("backend");
  const [cardsLoadError, setCardsLoadError] = useState("");

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const orderedSlides = useMemo(
    () => [...slides].sort((a, b) => a.order_index - b.order_index || a.id - b.id),
    [slides]
  );

  const orderedCards = useMemo(
    () =>
      [...cards].sort((a, b) => {
        // Ordenar estrictamente por ID descendente para coincidir con la página pública
        return b.id - a.id;
      }),
    [cards]
  );

  const editorialCards = useMemo(() => orderedCards.slice(0, 4), [orderedCards]);
  const featuredRecentCard = orderedCards.length > 0 ? orderedCards[0] : null;
  const recentCards = useMemo(() => orderedCards.slice(1, 7), [orderedCards]);
  const archivedCards = useMemo(() => orderedCards.slice(7), [orderedCards]);

  const currentSlide = useMemo(() => {
    if (orderedSlides.length === 0) return null;
    return orderedSlides.find((item) => item.is_active) || orderedSlides[0];
  }, [orderedSlides]);

  const resetCardForm = () => {
    setCardForm(INITIAL_CARD_FORM);
    setEditingCardId(null);
  };

  const handleOpenCreate = (initialCategory?: string) => {
    resetCardForm();
    if (initialCategory) {
      setCardForm((prev) => ({ ...prev, category: initialCategory }));
    }
    setIsCardFormOpen(true);
  };

  const closeCardForm = () => {
    setIsCardFormOpen(false);
    resetCardForm();
  };

  const loadSlides = async () => {
    setIsLoadingSlides(true);
    try {
      const response = await adminFetch(`${BACKEND_URL}/api/blog/hero/slides`);
      if (!response.ok) throw new Error("No se pudieron cargar los medias");
      const data = await response.json();
      const normalized = Array.isArray(data) ? data.map((item: Partial<BlogHeroSlide>) => normalizeSlide(item)) : [];
      setSlides(normalized);
    } catch (error) {
      console.error(error);
      alert("No se pudo cargar la pasarela de fondo");
    } finally {
      setIsLoadingSlides(false);
    }
  };

  const loadCards = async () => {
    setIsLoadingCards(true);
    setCardsLoadError("");
    try {
      const response = await adminFetch(`${BACKEND_URL}/api/blog/`);
      if (!response.ok) throw new Error("No se pudieron cargar las tarjetas");
      const data = await response.json();
      const normalized = Array.isArray(data) ? data.map((item: Partial<BlogCard>) => normalizeCard(item)) : [];
      if (normalized.length === 0) {
        setCards(LOCAL_BLOG_SEED_CARDS);
        setCardsSource("fallback-empty");
      } else {
        setCards(normalized);
        setCardsSource("backend");
      }
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "No se pudieron cargar las tarjetas del blog";
      setCardsLoadError(message);
      setCards(LOCAL_BLOG_SEED_CARDS);
      setCardsSource("fallback-error");
    } finally {
      setIsLoadingCards(false);
    }
  };

  useEffect(() => {
    void loadSlides();
    void loadCards();
  }, []);

  const setSlideActive = async (slideId: number, isActive: boolean) => {
    await adminFetch(`${BACKEND_URL}/api/blog/hero/slides/${slideId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: isActive }),
    });
  };

  const uploadAndCreateSlide = async (file: File, mediaType: MediaType) => {
    setUploadingType(mediaType);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await adminFetch(`${BACKEND_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });
      if (!uploadResponse.ok) throw new Error("No se pudo subir el archivo");

      const uploaded = (await uploadResponse.json()) as UploadResponse;
      if (!uploaded.url) throw new Error("No se recibio URL del archivo");

      const payload = {
        media_type: mediaType,
        background_image_url: mediaType === "image" ? uploaded.url : null,
        background_video_url: mediaType === "video" ? uploaded.url : null,
        is_active: true,
        order_index: orderedSlides.length,
      };

      const createResponse = await adminFetch(`${BACKEND_URL}/api/blog/hero/slides`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!createResponse.ok) throw new Error("No se pudo guardar el media");

      const created = normalizeSlide(await createResponse.json());
      const activeOthers = orderedSlides.filter((item) => item.is_active && item.id !== created.id);
      if (activeOthers.length > 0) {
        await Promise.all(activeOthers.map((item) => setSlideActive(item.id, false)));
      }

      await loadSlides();
      alert(`${mediaType === "image" ? "Foto" : "Video"} subido y activado`);
    } catch (error) {
      console.error(error);
      alert("Error subiendo media");
    } finally {
      setUploadingType("");
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>, mediaType: MediaType) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadAndCreateSlide(file, mediaType);
    event.target.value = "";
  };

  const deleteSlide = async (slideId: number) => {
    if (!confirm("Eliminar este fondo?")) return;
    setWorkingSlideId(slideId);
    try {
      const response = await adminFetch(`${BACKEND_URL}/api/blog/hero/slides/${slideId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("No se pudo eliminar");
      await loadSlides();
    } catch (error) {
      console.error(error);
      alert("Error eliminando media");
    } finally {
      setWorkingSlideId(null);
    }
  };

  const handleCardInput = (field: keyof BlogCardDraft, value: string | boolean) => {
    setCardForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveCard = async () => {
    if (!cardForm.title.trim() || !cardForm.content.trim()) {
      alert("Titulo y descripcion son obligatorios.");
      return;
    }

    setIsSavingCard(true);
    try {
      const payload = {
        title: cardForm.title.trim(),
        content: cardForm.content.trim(),
        author: cardForm.author.trim() || "Equipo Editorial",
        category: cardForm.category.trim() || "General",
        tags: cardForm.tags.trim() || null,
        is_published: cardForm.is_published,
      };

      const endpoint = editingCardId ? `${BACKEND_URL}/api/blog/${editingCardId}` : `${BACKEND_URL}/api/blog/`;
      const method = editingCardId ? "PUT" : "POST";

      const response = await adminFetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("No se pudo guardar la tarjeta");

      await loadCards();
      closeCardForm();
    } catch (error) {
      console.error(error);
      alert("Error guardando tarjeta");
    } finally {
      setIsSavingCard(false);
    }
  };

  const editCard = (card: BlogCard) => {
    setEditingCardId(card.id);
    setCardForm({
      title: card.title,
      content: card.content,
      author: card.author || "Equipo Editorial",
      category: card.category || "General",
      tags: card.tags || "",
      is_published: card.is_published,
    });
    setIsCardFormOpen(true);
  };

  const loadSeedAsTemplate = (card: BlogCard) => {
    setEditingCardId(null);
    setCardForm({
      title: card.title,
      content: card.content,
      author: card.author || "Equipo Editorial",
      category: card.category || "General",
      tags: card.tags || "",
      is_published: true,
    });
    setIsCardFormOpen(true);
  };

  const togglePublishCard = async (card: BlogCard) => {
    setWorkingCardId(card.id);
    try {
      const response = await adminFetch(`${BACKEND_URL}/api/blog/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !card.is_published }),
      });
      if (!response.ok) throw new Error("No se pudo actualizar estado");
      await loadCards();
    } catch (error) {
      console.error(error);
      alert("Error cambiando estado de publicacion");
    } finally {
      setWorkingCardId(null);
    }
  };

  const deleteCard = async (cardId: number) => {
    if (!confirm("Eliminar esta tarjeta del blog?")) return;

    setWorkingCardId(cardId);
    try {
      const response = await adminFetch(`${BACKEND_URL}/api/blog/${cardId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("No se pudo eliminar");
      await loadCards();
      if (editingCardId === cardId) closeCardForm();
    } catch (error) {
      console.error(error);
      alert("Error eliminando tarjeta");
    } finally {
      setWorkingCardId(null);
    }
  };

  const renderBlogCardItem = (card: BlogCard, blockLabel: string, keyPrefix: string) => (
    <article
      key={`${keyPrefix}-${card.id}`}
      className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950/70 to-slate-900/60 p-5 hover:border-cyan-400/35 transition-all"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[10px] px-2 py-1 rounded-full border border-cyan-300/35 text-cyan-200 bg-cyan-500/10 uppercase tracking-widest">
              {blockLabel}
            </span>
            <span className="text-[10px] px-2 py-1 rounded-full border border-amber-300/30 text-amber-200 bg-amber-500/10 uppercase tracking-widest">
              {card.category || "General"}
            </span>
            <span
              className={`text-[10px] px-2 py-1 rounded-full border uppercase tracking-widest ${
                card.is_published
                  ? "border-emerald-400/35 text-emerald-200 bg-emerald-500/10"
                  : "border-slate-400/35 text-slate-300 bg-slate-500/10"
              }`}
            >
              {card.is_published ? "Publicado" : "Oculto"}
            </span>
            {card.is_local_seed ? (
              <span className="text-[10px] px-2 py-1 rounded-full border border-blue-300/35 text-blue-200 bg-blue-500/10 uppercase tracking-widest">
                Base local
              </span>
            ) : null}
          </div>
          <h3 className="text-lg md:text-xl font-black text-slate-100 leading-tight">{card.title}</h3>
        </div>
        <span className="text-[11px] text-slate-400 whitespace-nowrap">{formatCreatedAt(card.created_at)}</span>
      </div>

      <p className="text-sm leading-relaxed text-slate-300">{summarize(card.content)}</p>

      <div className="mt-4 text-xs text-slate-400 flex items-center gap-3 flex-wrap">
        <span>Autor: {card.author || "Equipo Editorial"}</span>
        {card.tags ? <span className="text-blue-200/90">Tags: {card.tags}</span> : null}
      </div>

      <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap gap-2">
        {card.is_local_seed ? (
          <button
            type="button"
            onClick={() => loadSeedAsTemplate(card)}
            className="px-3 py-2 rounded-lg text-xs font-semibold border border-blue-400/30 text-blue-200 hover:bg-blue-500/15 inline-flex items-center gap-2"
          >
            <FaPlus /> Usar como plantilla
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => editCard(card)}
          disabled={!!card.is_local_seed}
          className="px-3 py-2 rounded-lg text-xs font-semibold border border-blue-400/30 text-blue-200 hover:bg-blue-500/15 inline-flex items-center gap-2"
        >
          <FaEdit /> Editar
        </button>
        <button
          type="button"
          onClick={() => void togglePublishCard(card)}
          disabled={workingCardId === card.id || !!card.is_local_seed}
          className="px-3 py-2 rounded-lg text-xs font-semibold border border-amber-400/30 text-amber-200 hover:bg-amber-500/15 inline-flex items-center gap-2 disabled:opacity-50"
        >
          {card.is_published ? <FaRegEyeSlash /> : <FaRegEye />}
          {card.is_published ? "Ocultar" : "Publicar"}
        </button>
        <button
          type="button"
          onClick={() => void deleteCard(card.id)}
          disabled={workingCardId === card.id || !!card.is_local_seed}
          className="px-3 py-2 rounded-lg text-xs font-semibold border border-rose-400/30 text-rose-200 hover:bg-rose-500/15 inline-flex items-center gap-2 disabled:opacity-50"
        >
          <FaTrash /> Eliminar
        </button>
      </div>
    </article>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* MODAL FORM - Movido al inicio para asegurar que se vea encima de todo (z-index correcto) */}
      <AnimatePresence>
        {isCardFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-[#0b1121] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                  {editingCardId ? `Editando Tarjeta #${editingCardId}` : "Nueva Tarjeta de Blog"}
                </h3>
                <button onClick={closeCardForm} className="text-white/50 hover:text-white transition-colors">
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] text-blue-300 font-bold mb-2">Título</label>
                  <input
                    value={cardForm.title}
                    onChange={(event) => handleCardInput("title", event.target.value)}
                    placeholder="Ej: Guia completa para escalar tu ecommerce"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.15em] text-blue-300 font-bold mb-2">Categoría</label>
                    <input
                      value={cardForm.category}
                      onChange={(event) => handleCardInput("category", event.target.value)}
                      placeholder="Ej: Guias practicas"
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.15em] text-blue-300 font-bold mb-2">Autor</label>
                    <input
                      value={cardForm.author}
                      onChange={(event) => handleCardInput("author", event.target.value)}
                      placeholder="Equipo Editorial"
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] text-blue-300 font-bold mb-2">Tags (separados por coma)</label>
                  <input
                    value={cardForm.tags}
                    onChange={(event) => handleCardInput("tags", event.target.value)}
                    placeholder="api, saas, arquitectura"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] text-blue-300 font-bold mb-2">Contenido / Descripción</label>
                  <textarea
                    value={cardForm.content}
                    onChange={(event) => handleCardInput("content", event.target.value)}
                    rows={8}
                    placeholder="Escribe el contenido del artículo o una descripción detallada..."
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>

                <label className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={cardForm.is_published}
                    onChange={(event) => handleCardInput("is_published", event.target.checked)}
                    className="w-5 h-5 accent-blue-500"
                  />
                  <span className="text-sm font-bold text-white">Publicar inmediatamente</span>
                </label>
              </div>

              <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                <button
                  onClick={closeCardForm}
                  className="px-6 py-3 rounded-xl border border-white/10 text-white/60 font-bold text-xs uppercase tracking-widest hover:bg-white/10 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => void handleSaveCard()}
                  disabled={isSavingCard}
                  className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
                >
                  <FaSave /> {isSavingCard ? "Guardando..." : "Guardar Tarjeta"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] font-bold text-amber-300/90 mb-2">Blog Hero Background</p>
            <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-200 via-blue-200 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
              Fondo del Hero
            </h2>
            <p className="text-slate-400 mt-2">Administra solo fotos y videos del fondo del bloque principal del blog.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploadingType !== ""}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold inline-flex items-center gap-2 transition-all disabled:opacity-60"
            >
              <FaImage /> {uploadingType === "image" ? "Subiendo..." : "Subir foto"}
            </button>
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              disabled={uploadingType !== ""}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold inline-flex items-center gap-2 transition-all disabled:opacity-60"
            >
              <FaVideo /> {uploadingType === "video" ? "Subiendo..." : "Subir video"}
            </button>
          </div>
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => void handleFileChange(e, "image")}
          className="hidden"
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={(e) => void handleFileChange(e, "video")}
          className="hidden"
        />

        {isLoadingSlides ? (
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-8 text-slate-300">Cargando fondo...</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-blue-500/20 bg-slate-950/40 p-6">
              <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-amber-200/90 mb-4">Media en uso</p>
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-900/60 min-h-[320px] relative">
                {currentSlide ? (
                  currentSlide.media_type === "video" && currentSlide.background_video_url ? (
                    <video
                      src={currentSlide.background_video_url}
                      className="absolute inset-0 w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls
                    />
                  ) : currentSlide.background_image_url ? (
                    <Image
                      src={currentSlide.background_image_url}
                      alt={`Fondo activo ${currentSlide.id}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">Sin media activa</div>
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">No hay media activo</div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-blue-200/90">Lista de fondos</p>
              {orderedSlides.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-8 text-slate-300">No hay medias.</div>
              ) : (
                orderedSlides.map((slide) => {
                  const isCurrent = currentSlide?.id === slide.id;

                  return (
                    <div key={slide.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 hover:border-blue-400/30 transition-all">
                      <div className="grid grid-cols-[100px_1fr] gap-4">
                        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-slate-900 aspect-[4/3]">
                          {slide.media_type === "video" && slide.background_video_url ? (
                            <video src={slide.background_video_url} className="w-full h-full object-cover" muted />
                          ) : slide.background_image_url ? (
                            <Image src={slide.background_image_url} alt={`Slide ${slide.id}`} fill unoptimized className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">Sin media</div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-[10px] px-2 py-1 rounded-full border border-blue-300/30 text-blue-200 bg-blue-500/10">
                              {slide.media_type === "video" ? "VIDEO" : "FOTO"}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] px-2 py-1 rounded-full border border-emerald-400/30 text-emerald-200 bg-emerald-500/10">
                                EN USO
                              </span>
                            )}
                          </div>
                          <p className="text-slate-200 text-sm font-semibold">Fondo #{slide.id}</p>
                          <p className="text-slate-400 text-xs mt-1">Orden {slide.order_index + 1}</p>

                          <button
                            type="button"
                            onClick={() => deleteSlide(slide.id)}
                            disabled={workingSlideId === slide.id}
                            className="mt-3 px-3 py-2 rounded-lg text-xs font-semibold border border-rose-400/30 text-rose-200 hover:bg-rose-500/15 transition-all inline-flex items-center gap-2 disabled:opacity-50"
                          >
                            <FaTrash /> Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        <div className="mt-6 rounded-xl border border-dashed border-blue-300/25 bg-blue-500/5 p-4 text-xs text-blue-100/80 inline-flex items-center gap-2">
          <FaCloudUploadAlt />
          Cuando subes una nueva foto/video se marca automaticamente como el media en uso.
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] font-bold text-amber-300/90 mb-2">Blog Cards Manager</p>
            <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-200 via-blue-200 to-cyan-300 bg-clip-text text-transparent mb-3">
              Tarjetas del Blog
            </h2>
            <p className="text-slate-400 mb-4">
              Administra titulos, descripcion, categoria y estado de publicacion de cada tarjeta del blog.
            </p>
            {orderedCards.length > 0 && (
              <div className="flex flex-wrap gap-3 text-xs font-semibold">
                <div className="rounded-lg bg-amber-500/15 border border-amber-500/30 px-3 py-2">
                  <span className="text-amber-200">Bloque 1:</span> {editorialCards.length} de 4 tarjetas
                </div>
                <div className="rounded-lg bg-cyan-500/15 border border-cyan-500/30 px-3 py-2">
                  <span className="text-cyan-200">Bloque 2:</span> {(featuredRecentCard ? 1 : 0) + recentCards.length} tarjetas
                </div>
                <div className="rounded-lg bg-slate-500/15 border border-slate-500/30 px-3 py-2">
                  <span className="text-slate-200">Historial:</span> {archivedCards.length} tarjetas
                </div>
                <div className="rounded-lg bg-blue-500/15 border border-blue-500/30 px-3 py-2">
                  <span className="text-blue-200">Total:</span> {orderedCards.length} tarjetas
                </div>
              </div>
            )}
          </div>
        </div>

        {cardsSource !== "backend" ? (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              cardsSource === "fallback-error"
                ? "border-amber-300/35 bg-amber-500/10 text-amber-100"
                : "border-blue-300/35 bg-blue-500/10 text-blue-100"
            }`}
          >
            {cardsSource === "fallback-empty"
              ? "No hay tarjetas guardadas en backend. Se muestran tarjetas base del blog para que no quede vacio."
              : "No se pudo leer tarjetas desde backend. Se muestran tarjetas base locales de respaldo."}
            {cardsSource === "fallback-error" && cardsLoadError ? (
              <span className="block text-xs text-amber-200/85 mt-1">{cardsLoadError}</span>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-16">
          <div className="space-y-4">
            <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-blue-200/90">✓ Vista previa de bloques (como se ven en /blog)</p>
            
            {isLoadingCards ? (
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-8 text-slate-300">Cargando tarjetas...</div>
            ) : orderedCards.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-8 text-slate-300">No hay tarjetas creadas.</div>
            ) : (
              <div className="space-y-16">
                {/* BLOQUE 1 */}
                <section className="rounded-3xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-slate-950/50 p-6">
                  <div className="mb-6 pb-5 border-b-2 border-amber-500/20">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] font-black text-amber-300/90">📖 Bloque 1</p>
                        <h3 className="text-2xl md:text-3xl font-black text-amber-100">Lecturas Recomendadas</h3>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right text-sm text-slate-400 font-bold">
                          <p className="text-amber-200">{editorialCards.length}/4 tarjetas</p>
                        </div>
                        <button
                          onClick={() => handleOpenCreate("Lecturas Recomendadas")}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 text-[10px] font-bold uppercase tracking-widest hover:bg-amber-500/30 flex items-center gap-2"
                        >
                          <FaPlus /> Crear aquí
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 italic mt-3">
                      Se muestran las primeras 4 tarjetas ordenadas por fecha (más recientes primero).
                    </p>
                  </div>

                  <div className="rounded-lg bg-amber-500/15 border border-amber-500/30 p-4 mb-6">
                    <p className="text-xs uppercase tracking-[0.18em] text-amber-200 font-bold">⭐ Posiciones 1-4: Seleccion Editorial</p>
                  </div>

                  {editorialCards.length > 0 ? (
                    <div className="space-y-3">
                      {editorialCards.map((card, idx) => (
                        <div key={`editorial-${card.id}-${idx}`}>
                          <div className="text-[10px] font-bold text-amber-300/70 mb-2">Posición {idx + 1}</div>
                          {renderBlogCardItem(card, "Lecturas recomendadas", `editorial-${idx}`)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-5 text-sm text-slate-300">
                      No hay tarjetas en este bloque.
                    </div>
                  )}
                </section>

                {/* BLOQUE 2 */}
                <section className="rounded-3xl border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 to-slate-950/50 p-6">
                  <div className="mb-6 pb-5 border-b-2 border-cyan-500/20">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] font-black text-cyan-300/90">📰 Bloque 2</p>
                        <h3 className="text-2xl md:text-3xl font-black text-cyan-100">Publicaciones Recientes</h3>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right text-sm text-slate-400 font-bold">
                          <p className="text-cyan-200">{(featuredRecentCard ? 1 : 0) + recentCards.length} tarjetas</p>
                        </div>
                        <button
                          onClick={() => handleOpenCreate("General")}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-500/30 flex items-center gap-2"
                        >
                          <FaPlus /> Crear aquí
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 italic mt-3">
                      Primera tarjeta como "Artículo destacado" (grande), resto como "Publicaciones recientes".
                    </p>
                  </div>

                  {featuredRecentCard ? (
                    <div className="space-y-6">
                      <div className="rounded-lg bg-cyan-500/15 border border-cyan-500/30 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-cyan-200 font-bold">🔝 Posición 1: Articulo Destacado</p>
                      </div>
                      {renderBlogCardItem(featuredRecentCard, "Articulo destacado", "featured")}
                      
                      {recentCards.length > 0 && (
                        <>
                          <div className="rounded-lg bg-blue-500/15 border border-blue-500/30 p-4 mt-8">
                            <p className="text-xs uppercase tracking-[0.18em] text-blue-200 font-bold">📄 Posiciones 2-7: Publicaciones Recientes</p>
                          </div>
                          <div className="space-y-3">
                            {recentCards.map((card, idx) => (
                              <div key={`recent-${card.id}-${idx}`}>
                                <div className="text-[10px] font-bold text-blue-300/70 mb-2">Posición {idx + 2}</div>
                                {renderBlogCardItem(card, "Publicacion reciente", `recent-${idx}`)}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-5 text-sm text-slate-300">
                      No hay tarjetas para este bloque.
                    </div>
                  )}
                </section>

                {/* BLOQUE 3 - HISTORIAL (Tarjetas antiguas que ya no salen en portada) */}
                {archivedCards.length > 0 && (
                  <section className="rounded-3xl border-2 border-slate-500/30 bg-gradient-to-br from-slate-950/20 to-slate-900/50 p-6">
                    <div className="mb-6 pb-5 border-b-2 border-slate-500/20">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.28em] font-black text-slate-400">🗄️ Historial</p>
                          <h3 className="text-2xl md:text-3xl font-black text-slate-200">Otras Publicaciones</h3>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-right text-sm text-slate-400 font-bold">
                            <p className="text-slate-300">{archivedCards.length} tarjetas</p>
                          </div>
                          <button
                            onClick={() => handleOpenCreate("General")}
                            className="px-3 py-1.5 rounded-lg bg-slate-500/20 border border-slate-500/40 text-slate-300 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-500/30 flex items-center gap-2"
                          >
                            <FaPlus /> Crear aquí
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 italic mt-3">
                        Estas tarjetas son más antiguas y no aparecen en la sección principal de "Publicaciones Recientes" (que muestra solo las 7 últimas), pero siguen publicadas y accesibles por búsqueda o categoría.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {archivedCards.map((card, idx) => (
                        <div key={`archived-${card.id}-${idx}`}>
                          <div className="text-[10px] font-bold text-slate-500 mb-2">Posición {idx + 8}</div>
                          {renderBlogCardItem(card, "Historial / Archivo", `archived-${idx}`)}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
