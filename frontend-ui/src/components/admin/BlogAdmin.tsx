"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
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
  FaVideo,
} from "react-icons/fa";

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

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const INITIAL_CARD_FORM: BlogCardDraft = {
  title: "",
  content: "",
  author: "Equipo Editorial",
  category: "General",
  tags: "",
  is_published: true,
};

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

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const orderedSlides = useMemo(
    () => [...slides].sort((a, b) => a.order_index - b.order_index || a.id - b.id),
    [slides]
  );

  const orderedCards = useMemo(
    () =>
      [...cards].sort((a, b) => {
        const aTime = Date.parse(a.created_at || "");
        const bTime = Date.parse(b.created_at || "");
        const aIsValid = Number.isFinite(aTime);
        const bIsValid = Number.isFinite(bTime);

        if (aIsValid && bIsValid && bTime !== aTime) return bTime - aTime;
        if (bIsValid && !aIsValid) return 1;
        if (aIsValid && !bIsValid) return -1;
        return b.id - a.id;
      }),
    [cards]
  );

  const currentSlide = useMemo(() => {
    if (orderedSlides.length === 0) return null;
    return orderedSlides.find((item) => item.is_active) || orderedSlides[0];
  }, [orderedSlides]);

  const resetCardForm = () => {
    setCardForm(INITIAL_CARD_FORM);
    setEditingCardId(null);
  };

  const closeCardForm = () => {
    setIsCardFormOpen(false);
    resetCardForm();
  };

  const openNewCardForm = () => {
    resetCardForm();
    setIsCardFormOpen(true);
  };

  const loadSlides = async () => {
    setIsLoadingSlides(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/blog/hero/slides`);
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
    try {
      const response = await fetch(`${BACKEND_URL}/api/blog/`);
      if (!response.ok) throw new Error("No se pudieron cargar las tarjetas");
      const data = await response.json();
      const normalized = Array.isArray(data) ? data.map((item: Partial<BlogCard>) => normalizeCard(item)) : [];
      setCards(normalized);
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar las tarjetas del blog");
    } finally {
      setIsLoadingCards(false);
    }
  };

  useEffect(() => {
    void loadSlides();
    void loadCards();
  }, []);

  const setSlideActive = async (slideId: number, isActive: boolean) => {
    await fetch(`${BACKEND_URL}/api/blog/hero/slides/${slideId}`, {
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

      const uploadResponse = await fetch(`${BACKEND_URL}/api/upload`, {
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

      const createResponse = await fetch(`${BACKEND_URL}/api/blog/hero/slides`, {
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
      const response = await fetch(`${BACKEND_URL}/api/blog/hero/slides/${slideId}`, { method: "DELETE" });
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

      const response = await fetch(endpoint, {
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

  const togglePublishCard = async (card: BlogCard) => {
    setWorkingCardId(card.id);
    try {
      const response = await fetch(`${BACKEND_URL}/api/blog/${card.id}`, {
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
      const response = await fetch(`${BACKEND_URL}/api/blog/${cardId}`, { method: "DELETE" });
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

  return (
    <div className="max-w-7xl mx-auto space-y-8">
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
            <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-200 via-blue-200 to-cyan-300 bg-clip-text text-transparent">
              Tarjetas del Blog
            </h2>
            <p className="text-slate-400 mt-2">
              Administra titulos, descripcion, categoria y estado de publicacion de cada tarjeta del blog.
            </p>
          </div>
          <button
            type="button"
            onClick={openNewCardForm}
            className="px-5 py-3 rounded-xl border border-blue-400/35 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20 font-semibold inline-flex items-center gap-2"
          >
            <FaPlus /> Nueva tarjeta
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-8">
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-blue-200/90">Tarjetas registradas</p>
            {isLoadingCards ? (
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-8 text-slate-300">Cargando tarjetas...</div>
            ) : orderedCards.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-8 text-slate-300">No hay tarjetas creadas.</div>
            ) : (
              orderedCards.map((card) => (
                <article
                  key={card.id}
                  className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950/70 to-slate-900/60 p-5 hover:border-cyan-400/35 transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
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
                    <button
                      type="button"
                      onClick={() => editCard(card)}
                      className="px-3 py-2 rounded-lg text-xs font-semibold border border-blue-400/30 text-blue-200 hover:bg-blue-500/15 inline-flex items-center gap-2"
                    >
                      <FaEdit /> Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => void togglePublishCard(card)}
                      disabled={workingCardId === card.id}
                      className="px-3 py-2 rounded-lg text-xs font-semibold border border-amber-400/30 text-amber-200 hover:bg-amber-500/15 inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      {card.is_published ? <FaRegEyeSlash /> : <FaRegEye />}
                      {card.is_published ? "Ocultar" : "Publicar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteCard(card.id)}
                      disabled={workingCardId === card.id}
                      className="px-3 py-2 rounded-lg text-xs font-semibold border border-rose-400/30 text-rose-200 hover:bg-rose-500/15 inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      <FaTrash /> Eliminar
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-slate-950/55 p-5">
            {isCardFormOpen ? (
              <>
                <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-amber-200/90 mb-4">
                  {editingCardId ? `Editando tarjeta #${editingCardId}` : "Nueva tarjeta"}
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.12em] text-slate-300 mb-2">Titulo</label>
                    <input
                      value={cardForm.title}
                      onChange={(event) => handleCardInput("title", event.target.value)}
                      placeholder="Ej: Guia completa para escalar tu ecommerce"
                      className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-400/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.12em] text-slate-300 mb-2">Categoria</label>
                      <input
                        value={cardForm.category}
                        onChange={(event) => handleCardInput("category", event.target.value)}
                        placeholder="Ej: Guias practicas"
                        className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-400/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.12em] text-slate-300 mb-2">Autor</label>
                      <input
                        value={cardForm.author}
                        onChange={(event) => handleCardInput("author", event.target.value)}
                        placeholder="Equipo Editorial"
                        className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-400/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.12em] text-slate-300 mb-2">Tags</label>
                    <input
                      value={cardForm.tags}
                      onChange={(event) => handleCardInput("tags", event.target.value)}
                      placeholder="api, saas, arquitectura"
                      className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-400/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.12em] text-slate-300 mb-2">Descripcion</label>
                    <textarea
                      value={cardForm.content}
                      onChange={(event) => handleCardInput("content", event.target.value)}
                      rows={7}
                      placeholder="Describe el valor del articulo en lenguaje claro para cliente."
                      className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-400/50 resize-none"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={cardForm.is_published}
                      onChange={(event) => handleCardInput("is_published", event.target.checked)}
                      className="accent-blue-500"
                    />
                    Publicar tarjeta al guardar
                  </label>

                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void handleSaveCard()}
                      disabled={isSavingCard}
                      className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-60"
                    >
                      <FaSave /> {isSavingCard ? "Guardando..." : editingCardId ? "Actualizar tarjeta" : "Crear tarjeta"}
                    </button>
                    <button
                      type="button"
                      onClick={closeCardForm}
                      className="px-4 py-2.5 rounded-lg border border-white/15 text-slate-200 text-sm font-semibold hover:bg-white/5"
                    >
                      {editingCardId ? "Cancelar edicion" : "Cerrar formulario"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full min-h-[260px] rounded-xl border border-dashed border-blue-300/20 bg-blue-500/5 flex flex-col items-center justify-center text-center p-6">
                <p className="text-xs uppercase tracking-[0.2em] font-bold text-blue-200/90 mb-3">Formulario oculto</p>
                <p className="text-slate-300 text-sm max-w-md mb-5">
                  Pulsa <span className="font-semibold text-blue-200">Nueva tarjeta</span> para abrir el formulario de creacion.
                </p>
                <button
                  type="button"
                  onClick={openNewCardForm}
                  className="px-4 py-2.5 rounded-lg border border-blue-400/35 bg-blue-500/15 text-blue-200 hover:bg-blue-500/25 text-sm font-semibold inline-flex items-center gap-2"
                >
                  <FaPlus /> Nueva tarjeta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
