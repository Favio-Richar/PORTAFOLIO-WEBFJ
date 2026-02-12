"use client";

import { useEffect, useMemo, useState } from "react";
import { FaSave, FaTrash, FaUpload, FaImage, FaVideo, FaPlus } from "react-icons/fa";

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

  const nextOrder = useMemo(() => {
    if (!items.length) return 0;
    return Math.max(...items.map((i) => i.order_index || 0)) + 1;
  }, [items]);
  const photosCount = useMemo(() => items.filter((i) => i.type === "image").length, [items]);
  const videosCount = useMemo(() => items.filter((i) => i.type === "video").length, [items]);

  async function loadMedia() {
    try {
      const res = await fetch("http://localhost:8000/api/media");
      if (!res.ok) return;
      const all = await res.json();
      const filtered = (all as MediaItem[])
        .filter((m) => (m.description || "").includes(CLIENTS_HERO_TAG))
        .sort(byOrder);

      const normalized = filtered.map((m) =>
        m.type === "video" && m.url === LEGACY_BROKEN_VIDEO_URL ? { ...m, url: DEFAULT_VIDEO_URL } : m
      );

      const fixes = normalized.filter((m, i) => m.url !== filtered[i].url && m.id);
      if (fixes.length) {
        await Promise.all(
          fixes.map((m) =>
            fetch(`http://localhost:8000/api/media/${m.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(m),
            })
          )
        );
      }

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
          const refreshedFiltered = (refreshedAll as MediaItem[])
            .filter((m) => (m.description || "").includes(CLIENTS_HERO_TAG))
            .sort(byOrder);
          setItems(refreshedFiltered);
        }
        setSeeding(false);
      } else {
        setItems(normalized);
      }
    } catch (e) {
      console.error("Error loading clients media", e);
    }
  }

  useEffect(() => {
    loadMedia();
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
      await loadMedia();
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
      await loadMedia();
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

      await loadMedia();
    } catch (_e) {
      alert("No se pudo eliminar el elemento.");
    }
  }

  function patchItem(idx: number, patch: Partial<MediaItem>) {
    setItems((prev) => {
      const clone = [...prev];
      clone[idx] = { ...clone[idx], ...patch };
      return clone;
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-24">
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
    </div>
  );
}
