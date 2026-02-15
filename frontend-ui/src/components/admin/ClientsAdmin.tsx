"use client";

import { useEffect, useMemo, useState } from "react";
import { FaSave, FaTrash, FaUpload, FaImage, FaVideo, FaPlus, FaEdit, FaTimes, FaLayerGroup, FaImages, FaPlayCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ClientFullCasesAdmin from "./ClientFullCasesAdmin";

type MediaType = "image" | "video";

interface MediaItem {
  id?: number;
  title: string;
  description?: string;
  type: MediaType;
  url: string;
  order_index: number;
  active: boolean;
}

interface GalleryItem {
  type: "image" | "video";
  url: string;
}

interface CaseStudy {
  id?: number;
  client_name: string;
  company_name: string;
  industry: string;
  year: string;
  website_url: string;
  logo_url: string;
  description: string;
  testimonial: string;
  media: GalleryItem[];
  services?: string;
  timeline?: string;
  metrics?: string;
  results?: string;
}

const CLIENTS_HERO_TAG = "[clients-hero]";
const LEGACY_BROKEN_VIDEO_URL = "https://cdn.coverr.co/videos/coverr-working-on-a-laptop-1579/1080p.mp4";
const DEFAULT_VIDEO_URL = "https://www.w3schools.com/html/mov_bbb.mp4";
const DEFAULT_CLIENTS_HERO_MEDIA: MediaItem[] = [
  {
    title: "",
    description: "",
    type: "image",
    url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=2400&h=1400&fit=crop",
    order_index: 0,
    active: true,
  },
  {
    title: "",
    description: "",
    type: "video",
    url: DEFAULT_VIDEO_URL,
    order_index: 1,
    active: true,
  },
  {
    title: "",
    description: "",
    type: "image",
    url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=2400&h=1400&fit=crop",
    order_index: 2,
    active: true,
  },
];

function withTag(description?: string) {
  const base = (description || "").trim();
  if (base.includes(CLIENTS_HERO_TAG)) return base;
  return `${CLIENTS_HERO_TAG} ${base}`.trim();
}

function byOrder(a: MediaItem, b: MediaItem) {
  return (a.order_index || 0) - (b.order_index || 0);
}

export default function ClientsAdmin() {
  const [activeTab, setActiveTab] = useState<"hero" | "cases" | "fullCases">("cases");

  // HERO PASSAGE STATE
  const [items, setItems] = useState<MediaItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [newItem, setNewItem] = useState<MediaItem>({
    title: "",
    description: "",
    type: "image",
    url: "",
    order_index: 0,
    active: true,
  });

  // CASES STATE
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseStudy | null>(null);
  const [loadingCases, setLoadingCases] = useState(false);

  const nextOrder = useMemo(() => {
    if (!items.length) return 0;
    return Math.max(...items.map((i) => i.order_index || 0)) + 1;
  }, [items]);
  const photosCount = useMemo(() => items.filter((i) => i.type === "image").length, [items]);
  const videosCount = useMemo(() => items.filter((i) => i.type === "video").length, [items]);

  async function loadData() {
    setLoadingCases(true);
    try {
      // Load Hero Media
      const heroRes = await fetch("http://localhost:8000/api/media");
      if (heroRes.ok) {
        const all = await heroRes.json();
        const filtered = (all as MediaItem[])
          .filter((m) => (m.description || "").includes(CLIENTS_HERO_TAG))
          .sort(byOrder);

        const normalized = filtered.map((m) =>
          m.type === "video" && m.url === LEGACY_BROKEN_VIDEO_URL ? { ...m, url: DEFAULT_VIDEO_URL } : m
        );

        if (!filtered.length && !seeding) {
          setSeeding(true);
          await Promise.all(
            DEFAULT_CLIENTS_HERO_MEDIA.map((m) =>
              fetch("http://localhost:8000/api/media", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...m, description: withTag(m.description) }),
              })
            )
          );
          const refresh = await fetch("http://localhost:8000/api/media");
          if (refresh.ok) {
            const refreshedAll = await refresh.json();
            setItems((refreshedAll as MediaItem[]).filter(m => (m.description || "").includes(CLIENTS_HERO_TAG)).sort(byOrder));
          }
          setSeeding(false);
        } else {
          setItems(normalized);
        }
      }

      // Load Cases (Casos de Éxito)
      const casesRes = await fetch("http://localhost:8000/api/casos-exito");
      if (casesRes.ok) {
        const data = await casesRes.json();
        setCases(data.map((c: any) => ({
          ...c,
          title: c.company_name, // fallback for legacy display logic
          category: c.industry,  // fallback for legacy display logic
          media: typeof c.media === 'string' ? JSON.parse(c.media) : (c.media || [])
        })));
      }
    } catch (e) {
      console.error("Error loading data", e);
    } finally {
      setLoadingCases(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("http://localhost:8000/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setNewItem((prev) => ({
        ...prev,
        url: data.url,
        type: file.type.startsWith("video/") ? "video" : "image",
        order_index: nextOrder,
      }));
    } catch (_e) {
      alert("No se pudo subir el archivo.");
    } finally {
      setUploading(false);
    }
  }

  async function addToHero() {
    if (!newItem.url) return alert("Primero sube un archivo.");
    const payload = {
      ...newItem,
      description: withTag(newItem.description),
      order_index: Number.isFinite(newItem.order_index) ? newItem.order_index : nextOrder,
    };

    try {
      const res = await fetch("http://localhost:8000/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Create failed");

      setNewItem({
        title: "",
        description: "",
        type: "image",
        url: "",
        order_index: nextOrder + 1,
        active: true,
      });
      await loadData();
    } catch (_e) {
      alert("No se pudo agregar a la pasarela.");
    }
  }

  async function discardUploadedPreview() {
    const previewUrl = newItem.url;
    setNewItem({
      title: "",
      description: "",
      type: "image",
      url: "",
      order_index: nextOrder,
      active: true,
    });

    if (!previewUrl) return;
    try {
      await fetch(`http://localhost:8000/api/upload/delete?url=${encodeURIComponent(previewUrl)}`, {
        method: "DELETE",
      });
    } catch (_e) {
      // Si falla la limpieza remota, el usuario igual puede volver a subir.
    }
  }

  async function saveAll() {
    setSaving(true);
    try {
      const updates = items.map((item, idx) =>
        fetch(`http://localhost:8000/api/media/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...item, order_index: idx, description: withTag(item.description) }),
        })
      );
      await Promise.all(updates);
      await loadData();
      alert("Cambios guardados.");
    } catch (_e) {
      alert("No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(item: MediaItem) {
    if (!item.id) return;
    if (!confirm("¿Eliminar este media del hero de Clientes?")) return;

    try {
      const res = await fetch(`http://localhost:8000/api/media/${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");

      if (item.url?.includes("/uploads/")) {
        await fetch(`http://localhost:8000/api/upload/delete?url=${encodeURIComponent(item.url)}`, {
          method: "DELETE",
        });
      }

      await loadData();
    } catch (_e) {
      alert("No se pudo eliminar el elemento.");
    }
  }

  // --- CASE STUDY CRUD ---
  const handleOpenNewCase = () => {
    setEditingCase({
      client_name: "",
      company_name: "",
      industry: "Tecnología",
      year: "2024",
      website_url: "",
      logo_url: "",
      description: "",
      testimonial: "",
      media: [],
      services: "[]",
      timeline: "[]",
      metrics: "[]",
      results: "{}"
    });
    setIsCaseModalOpen(true);
  };

  const handleEditCase = (c: CaseStudy) => {
    setEditingCase(c);
    setIsCaseModalOpen(true);
  };

  const handleDeleteCase = async (id: number) => {
    if (!confirm("¿Eliminar este Caso de Éxito?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/casos-exito/${id}`, { method: "DELETE" });
      if (res.ok) {
        await loadData();
      }
    } catch (e) {
      alert("Error al eliminar");
    }
  };

  const handleSaveCase = async () => {
    if (!editingCase) return;
    try {
      const isNew = !editingCase.id;
      const endpoint = isNew ? "http://localhost:8000/api/casos-exito" : `http://localhost:8000/api/casos-exito/${editingCase.id}`;
      const method = isNew ? "POST" : "PUT";

      // Prepare payload
      const payload = {
        ...editingCase,
        media: JSON.stringify(editingCase.media),
        services: editingCase.services || "[]",
        timeline: editingCase.timeline || "[]",
        metrics: editingCase.metrics || "[]",
        results: editingCase.results || "{}"
      };
      if (isNew) delete (payload as any).id;

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsCaseModalOpen(false);
        await loadData();
      } else {
        throw new Error("Failed to save");
      }
    } catch (e) {
      alert("Error al guardar");
    }
  };

  function patchItem(idx: number, patch: Partial<MediaItem>) {
    setItems((prev) => {
      const clone = [...prev];
      clone[idx] = { ...clone[idx], ...patch };
      return clone;
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-24 space-y-8">
      {/* TABS HEADER */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("cases")}
          className={`px-8 py-4 font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === "cases" ? "bg-emerald-600 text-white" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
        >
          <FaLayerGroup className="inline mr-2" /> Casos de Éxito
        </button>
        <button
          onClick={() => setActiveTab("fullCases")}
          className={`px-8 py-4 font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === "fullCases" ? "bg-amber-600 text-black" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
        >
          <FaImages className="inline mr-2" /> Casos Completos
        </button>
        <button
          onClick={() => setActiveTab("hero")}
          className={`px-8 py-4 font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === "hero" ? "bg-blue-600 text-white" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
        >
          <FaImage className="inline mr-2" /> Pasarela Hero
        </button>
      </div>

      {activeTab === "cases" ? (
        <section className="bg-[#0a1120]/90 border border-white/10 rounded-none overflow-hidden shadow-2xl">
          <div className="px-10 py-8 border-b border-white/10 flex items-center justify-between gap-6">
            <div>
              <h3 className="text-3xl font-black uppercase tracking-tight text-white">Casos de Éxito</h3>
              <p className="text-white/40 text-xs uppercase tracking-[0.2em] mt-1">Administra las tarjetas de clientes y sus galerías</p>
            </div>
            <button onClick={handleOpenNewCase} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[10px] tracking-[0.25em] flex items-center gap-3">
              <FaPlus /> Nuevo Caso
            </button>
          </div>

          <div className="p-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((c) => {
              const coverImage = c.media?.find(m => m.type === "image")?.url || c.logo_url;
              return (
                <div key={c.id} className="bg-black/40 border border-white/10 rounded-3xl p-6 group hover:border-emerald-500/50 transition-all">
                  <div className="aspect-video rounded-2xl overflow-hidden mb-6 bg-white/5 relative">
                    {coverImage ? (
                      <img src={coverImage} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px] font-black uppercase">Sin Imagen</div>
                    )}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button onClick={() => handleEditCase(c)} className="p-3 bg-black/60 text-white/50 hover:text-emerald-400 rounded-xl border border-white/10"><FaEdit /></button>
                      <button onClick={() => handleDeleteCase(c.id!)} className="p-3 bg-black/60 text-white/50 hover:text-red-500 rounded-xl border border-white/10"><FaTrash /></button>
                    </div>
                  </div>
                  <h4 className="text-white font-black uppercase text-lg tracking-tight mb-2">{c.company_name}</h4>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                    <span>{c.industry}</span>
                    <span className="text-white/20">{c.media?.length || 0} Assets</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : activeTab === "fullCases" ? (
        <ClientFullCasesAdmin />
      ) : (
        /* BACKGROUND MEDIA MANAGEMENT */
        <div className="bg-[#0a1120]/90 border border-white/10 rounded-none overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <div className="px-10 py-8 border-b border-white/10 flex items-center justify-between gap-6">
            <div>
              <h3 className="text-3xl font-black uppercase tracking-tight text-white">Clientes · Pasarela de Fondo</h3>
              <p className="text-white/40 text-xs uppercase tracking-[0.2em] mt-1">
                Gestiona fotos y videos del hero de la página Clientes
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 border border-white/15 bg-white/[0.02] text-[11px] font-black uppercase tracking-widest text-white/80">
                Fotos: <span className="text-cyan-300">{photosCount}</span>
              </div>
              <div className="px-4 py-2 border border-white/15 bg-white/[0.02] text-[11px] font-black uppercase tracking-widest text-white/80">
                Videos: <span className="text-blue-300">{videosCount}</span>
              </div>
              <button
                onClick={saveAll}
                disabled={saving || !items.length}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black uppercase text-[10px] tracking-[0.25em] rounded-none flex items-center gap-3"
              >
                <FaSave /> {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>

          <section className="p-8 border-b border-white/10 bg-[#070b14]/50">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-5">
                <h4 className="text-white font-black uppercase text-xs tracking-[0.3em]">Proceso de Subida</h4>
                <label className={`block border border-white/15 p-6 text-center cursor-pointer hover:border-blue-400/40 ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
                  <FaUpload className="mx-auto text-2xl text-blue-400 mb-3" />
                  <p className="text-white/70 font-bold text-xs">{uploading ? "Subiendo..." : "Seleccionar archivo"}</p>
                  <p className="text-white/30 text-[10px] mt-1 uppercase">jpg · png · mp4</p>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(f);
                    }}
                  />
                </label>

                <div className="w-full">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <button
                      onClick={addToHero}
                      disabled={!newItem.url}
                      className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2"
                    >
                      <FaPlus /> Agregar
                    </button>
                    <button
                      onClick={discardUploadedPreview}
                      disabled={!newItem.url}
                      className="w-full px-6 py-3 bg-red-600/20 border border-red-500/40 hover:bg-red-600/35 disabled:opacity-50 text-red-200 font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2"
                    >
                      <FaTrash /> Eliminar Preview
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">
                  1) Sube archivo 2) Revisa preview 3) Agrega y luego guarda cambios.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-black uppercase text-xs tracking-[0.3em]">Preview Antes de Agregar</h4>
                <div className="border border-white/10 bg-[#0b1326] overflow-hidden">
                  <div className="aspect-video bg-black/50 relative">
                    {!newItem.url ? (
                      <div className="w-full h-full flex items-center justify-center text-white/35 text-sm font-bold uppercase tracking-wider">
                        Sin preview
                      </div>
                    ) : newItem.type === "video" ? (
                      <video
                        src={newItem.url}
                        className="w-full h-full object-cover"
                        muted
                        autoPlay
                        loop
                        playsInline
                        controls
                        preload="metadata"
                      />
                    ) : (
                      <img src={newItem.url} alt="Preview media" className="w-full h-full object-cover" />
                    )}
                    {newItem.url ? (
                      <span className="absolute top-2 right-2 text-[10px] font-black uppercase px-2 py-1 bg-black/60 text-white/80 border border-white/20">
                        {newItem.type === "video" ? <span className="inline-flex items-center gap-1"><FaVideo /> Video</span> : <span className="inline-flex items-center gap-1"><FaImage /> Foto</span>}
                      </span>
                    ) : null}
                  </div>
                  <div className="p-4 text-[11px] text-white/70 font-bold uppercase tracking-widest">
                    {newItem.type === "video" ? "Video de fondo listo para agregar" : "Foto de fondo lista para agregar"}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="p-8">
            <h4 className="text-white font-black uppercase text-xs tracking-[0.3em] mb-6">Fotos y Videos ya Subidos</h4>
            {!items.length ? (
              <div className="py-20 text-center border border-white/10 bg-white/[0.01]">
                <p className="text-white/60 font-bold uppercase text-xs tracking-[0.25em]">Sin elementos en pasarela</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {items.map((item, idx) => (
                  <div key={item.id || idx} className="border border-white/10 bg-[#0b1326] overflow-hidden">
                    <div className="aspect-video bg-black/50 relative">
                      {item.type === "video" ? (
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          muted
                          autoPlay
                          loop
                          playsInline
                          controls
                          preload="metadata"
                        />
                      ) : (
                        <img src={item.url} alt={item.title || "media"} className="w-full h-full object-cover" />
                      )}
                      <span className="absolute top-2 right-2 text-[10px] font-black uppercase px-2 py-1 bg-black/60 text-white/80 border border-white/20">
                        {item.type === "video" ? <span className="inline-flex items-center gap-1"><FaVideo /> Video</span> : <span className="inline-flex items-center gap-1"><FaImage /> Foto</span>}
                      </span>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="text-white/80 text-xs font-bold uppercase tracking-wider">
                        {item.type === "video" ? "Video de fondo" : "Foto de fondo"}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">
                          Posición #{idx + 1}
                        </span>
                        <label className="text-white/70 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.active}
                            onChange={(e) => patchItem(idx, { active: e.target.checked })}
                          />
                          Activo
                        </label>
                      </div>

                      <button
                        onClick={() => deleteItem(item)}
                        className="w-full px-3 py-2 bg-red-600/20 border border-red-500/40 hover:bg-red-600/35 text-red-300 font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2"
                      >
                        <FaTrash /> Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* CASE MODAL */}
      <AnimatePresence>
        {isCaseModalOpen && editingCase && (
          <CaseModal
            item={editingCase}
            onClose={() => setIsCaseModalOpen(false)}
            onSave={handleSaveCase}
            onChange={(newData) => setEditingCase(newData)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CaseModal({ item, onClose, onSave, onChange }: {
  item: CaseStudy,
  onClose: () => void,
  onSave: () => void,
  onChange: (newData: CaseStudy) => void
}) {
  const [uploading, setUploading] = useState<"hero" | "gallery">(null as any);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "hero" | "hero-video" | "gallery") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(target === "gallery" ? "gallery" : "hero");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("http://localhost:8000/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      if (target === "hero") {
        onChange({ ...item, logo_url: data.url });
      } else if (target === "hero-video") {
        // En CasoExito no hay hero-video separado, se mete en gallery
        const newMedia: GalleryItem[] = [{ type: "video", url: data.url }, ...item.media];
        onChange({ ...item, media: newMedia });
      } else {
        const type = (file.type.startsWith("video/") ? "video" : "image") as MediaType;
        const newMedia: GalleryItem[] = [...item.media, { type, url: data.url }];
        onChange({ ...item, media: newMedia });
      }
    } catch (e) {
      alert("Error subiendo archivo");
    } finally {
      setUploading(null as any);
    }
  };

  const removeMedia = (idx: number) => {
    const newMedia = item.media.filter((_, i) => i !== idx);
    onChange({ ...item, media: newMedia });
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-black/95 flex items-center justify-center p-8 overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="bg-[#050a18] border border-white/10 rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-4xl">
        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <h3 className="text-2xl font-black uppercase text-white tracking-tighter">Configurar Caso de Éxito</h3>
          <button onClick={onClose} className="text-white/20 hover:text-white transition-all text-2xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-10">
          {/* DESCRIPTION AT TOP */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Descripción del Impacto (Visión)</label>
            <textarea value={item.description} onChange={(e) => onChange({ ...item, description: e.target.value })} className="w-full bg-white/5 border border-white/10 p-6 rounded-none text-white outline-none focus:border-emerald-500 min-h-[120px] resize-none" placeholder="Describe los logros principales..." />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Nombre de la Empresa</label>
              <input value={item.company_name} onChange={(e) => onChange({ ...item, company_name: e.target.value })} className="w-full bg-white/5 border border-white/10 p-5 rounded-none text-white outline-none focus:border-emerald-500" placeholder="E.g. TechCorp Global" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Nombre del Contacto/Cliente</label>
              <input value={item.client_name} onChange={(e) => onChange({ ...item, client_name: e.target.value })} className="w-full bg-white/5 border border-white/10 p-5 rounded-none text-white outline-none focus:border-emerald-500" placeholder="E.g. Juan Pérez" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Industria</label>
              <input value={item.industry} onChange={(e) => onChange({ ...item, industry: e.target.value })} className="w-full bg-white/5 border border-white/10 p-5 rounded-none text-white outline-none focus:border-emerald-500" placeholder="E.g. Finanzas" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Año</label>
              <input value={item.year} onChange={(e) => onChange({ ...item, year: e.target.value })} className="w-full bg-white/5 border border-white/10 p-5 rounded-none text-white outline-none focus:border-emerald-500" placeholder="2024" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#0ea5e9]">URL Web Desplegada</label>
              <input value={item.website_url} onChange={(e) => onChange({ ...item, website_url: e.target.value })} className="w-full bg-white/5 border border-white/10 p-5 rounded-none text-white outline-none focus:border-emerald-500" placeholder="https://..." />
            </div>
          </div>

          {/* TESTIMONIAL */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-fuchsia-400">Testimonio del Cliente</label>
            <textarea value={item.testimonial} onChange={(e) => onChange({ ...item, testimonial: e.target.value })} className="w-full bg-white/5 border border-white/10 p-6 rounded-none text-white outline-none focus:border-fuchsia-500 min-h-[80px] resize-none" placeholder="Cita directa del cliente..." />
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* LOGO IMAGE */}
            <div className="space-y-5">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex justify-between items-center">
                Logo del Cliente
                {item.logo_url && <span className="text-white/20 text-[8px]">SUBIDO</span>}
              </label>
              <div className="aspect-video bg-black/40 border border-white/10 rounded-none overflow-hidden relative group">
                {item.logo_url ? (
                  <>
                    <img src={item.logo_url} className="w-full h-full object-contain p-4 group-hover:opacity-40 transition-all" />
                    <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all bg-black/40">
                      <label className="p-4 bg-emerald-600 text-white rounded-full cursor-pointer hover:bg-emerald-500 shadow-xl" title="Cambiar Logo">
                        <FaUpload size={16} />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "hero")} />
                      </label>
                      <button
                        onClick={() => onChange({ ...item, logo_url: "" })}
                        className="p-4 bg-red-600 text-white rounded-full hover:bg-red-500 shadow-xl"
                        title="Eliminar Logo"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center text-white/10 hover:text-emerald-400 hover:bg-white/[0.02] cursor-pointer transition-all gap-3">
                    <FaUpload className="text-2xl" />
                    <span className="font-black uppercase text-[10px] tracking-widest">Subir Logo Cliente</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "hero")} />
                  </label>
                )}
              </div>
            </div>

            {/* PREVIEW OF FIRST GALLERY IMAGE AS COVER */}
            <div className="space-y-5">
              <label className="text-[10px] font-black uppercase tracking-widest text-cyan-400 flex justify-between items-center">
                Portada (Primera imagen de Galería)
              </label>
              <div className="aspect-video bg-black/40 border border-white/10 rounded-none overflow-hidden relative">
                {item.media.find(m => m.type === "image") ? (
                  <img src={item.media.find(m => m.type === "image")!.url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/5 gap-3">
                    <FaImages className="text-2xl" />
                    <span className="font-black uppercase text-[10px] tracking-widest text-center px-4">Sube imágenes en la sección de galería abajo</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MULTIMEDIA GALLERY (5 PHOTOS, 5 VIDEOS) */}
          <div className="space-y-8 pt-10 border-t border-white/5">
            <div className="flex justify-between items-end">
              <div>
                <h4 className="text-white font-black uppercase text-xs tracking-widest">Galería del Proyecto</h4>
                <p className="text-[10px] text-white/30 uppercase mt-1">Sube hasta 5 fotos y 5 videos (10 total)</p>
              </div>
              <label className="flex items-center gap-3 px-6 py-3 bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 rounded-full text-[10px] font-black uppercase hover:bg-emerald-600/20 cursor-pointer">
                <FaPlus /> Cargar Multimedia
                <input type="file" className="hidden" multiple accept="image/*,video/*" onChange={(e) => handleFileUpload(e, "gallery")} />
              </label>
            </div>

            <div className="grid grid-cols-5 gap-4">
              {item.media.map((m, idx) => (
                <div key={idx} className="aspect-square bg-black border border-white/10 rounded-2xl relative group overflow-hidden shadow-2xl">
                  {m.type === "image" ? (
                    <img src={m.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-all" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-blue-400 bg-blue-500/5 group-hover:opacity-30 transition-all">
                      <FaPlayCircle size={24} />
                      <span className="text-[8px] font-black mt-2">VIDEO</span>
                    </div>
                  )}

                  {/* HOVER ACTIONS FOR GALLERY ITEM */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <label className="p-2 bg-emerald-600 text-white rounded-full cursor-pointer hover:bg-emerald-500 shadow-lg" title="Cambiar Media">
                      <FaEdit size={12} />
                      <input type="file" className="hidden" accept="image/*,video/*" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const fd = new FormData();
                          fd.append("file", file);
                          const res = await fetch("http://localhost:8000/api/upload", { method: "POST", body: fd });
                          const data = await res.json();
                          const newMedia = [...item.media];
                          newMedia[idx] = { type: file.type.startsWith("video/") ? "video" : "image", url: data.url };
                          onChange({ ...item, media: newMedia });
                        } catch (err) { alert("Error al cambiar media"); }
                      }} />
                    </label>
                    <button
                      onClick={() => removeMedia(idx)}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-500 shadow-lg"
                      title="Eliminar"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>

                  <div className="absolute bottom-2 left-2 text-[8px] font-black uppercase text-white/40 tracking-widest pointer-events-none">
                    {m.type === "image" ? <FaImage className="inline mr-1" /> : <FaVideo className="inline mr-1" />}
                    {m.type}
                  </div>
                </div>
              ))}
              {[...Array(Math.max(0, 10 - item.media.length))].map((_, i) => (
                <div key={i} className="aspect-square border border-dashed border-white/5 rounded-2xl flex items-center justify-center text-white/5 uppercase font-black text-[10px]">Vacío</div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-10 bg-white/[0.02] border-t border-white/5 flex gap-4">
          <button onClick={onSave} className="flex-1 py-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs tracking-[0.3em] rounded-full shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-3">
            <FaSave /> Guardar y Publicar
          </button>
          <button onClick={onClose} className="px-10 py-6 bg-white/5 text-white/40 hover:text-white rounded-full font-black uppercase text-[10px] tracking-widest transition-all">Cancelar</button>
        </div>
      </motion.div>
    </div>
  );
}
