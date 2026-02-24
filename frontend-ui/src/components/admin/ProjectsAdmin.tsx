"use client";

/**
 * ProyectoAdmin.tsx
 * Panel de administración completo para gestión de Proyectos.
 * CRUD, gestión de media (Cloudinary), validaciones y UX premium.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaImage, FaVideo,
  FaGlobe, FaShoppingCart, FaMobileAlt, FaDatabase, FaCode,
  FaCheck, FaExclamationTriangle, FaSpinner, FaEye, FaEyeSlash,
  FaStar, FaSearch, FaRedo,
  FaCloudUploadAlt, FaTrashAlt, FaLink
} from "react-icons/fa";
import AboutStackAdmin from "./AboutStackAdmin";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MediaItem {
  url: string;
  resource_type: "image" | "video";
  caption?: string;
  is_cover?: boolean;
}

interface Proyecto {
  id: number;
  title: string;
  description: string;
  category: string;
  price: string;
  price_note: string;
  featured: boolean;
  active: boolean;
  order_index: number;
  stack: string[];
  results: string[];
  media: MediaItem[];
  cover_url: string;
  video_url: string;
  tags: string[];
  client_type: string;
  status?: string;
  version?: string;
  demo_url?: string;
  repo_url?: string;
  deployment_date?: string;
  client_name?: string;
  year?: string;
  created_at?: string;
}

interface FormData {
  title: string;
  description: string;
  category: string;
  price: string;
  price_note: string;
  featured: boolean;
  active: boolean;
  order_index: number;
  stack: string[];
  results: string[];
  media: MediaItem[];
  cover_url: string;
  video_url: string;
  demo_url: string;
  repo_url: string;
  tags: string[];
  client_type: string;
}

interface BackendMediaItem {
  type?: string;
  resource_type?: string;
  url?: string;
  caption?: string;
  is_cover?: boolean;
}

interface BackendProyecto {
  id: number;
  title?: string;
  description?: string;
  category?: string;
  status?: string;
  version?: string;
  image_url?: string;
  video_url?: string | null;
  media?: string | BackendMediaItem[] | null;
  demo_url?: string;
  repo_url?: string;
  stack?: string | string[];
  results?: string | unknown[] | Record<string, unknown> | null;
  deployment_date?: string | null;
  client_name?: string | null;
  year?: string | null;
  created_at?: string;
}

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? "").trim())
      .filter((item) => item.length > 0);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      return toStringArray(parsed);
    } catch {
      return trimmed
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }
  }

  return [];
};

const toMediaArray = (value: unknown): MediaItem[] => {
  let parsedValue = value;
  if (typeof value === "string") {
    try {
      parsedValue = JSON.parse(value);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(parsedValue)) return [];

  return parsedValue
    .map((item) => {
      const raw = (item || {}) as BackendMediaItem;
      const url = String(raw.url || "").trim();
      if (!url) return null;

      const rawType = String(raw.resource_type || raw.type || "").toLowerCase();
      const resource_type: MediaItem["resource_type"] = rawType === "video" ? "video" : "image";
      const normalized: MediaItem = { url, resource_type };
      if (typeof raw.caption === "string" && raw.caption.trim().length > 0) {
        normalized.caption = raw.caption;
      }
      if (typeof raw.is_cover === "boolean") {
        normalized.is_cover = raw.is_cover;
      }
      return normalized;
    })
    .filter((item): item is MediaItem => Boolean(item));
};

const isActiveFromStatus = (status?: string): boolean => {
  if (!status) return true;
  const normalized = status.toLowerCase();
  return !normalized.includes("inactivo") && !normalized.includes("desactivado") && !normalized.includes("archivado");
};

const parseResultsMeta = (
  raw: BackendProyecto["results"],
  fallbackActive: boolean,
) => {
  const defaults = {
    results: [] as string[],
    price: "",
    price_note: "",
    featured: false,
    active: fallbackActive,
    order_index: 0,
    tags: [] as string[],
    client_type: "",
  };

  if (raw == null) return defaults;

  let parsed: unknown = raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return defaults;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      return { ...defaults, results: toStringArray(trimmed) };
    }
  }

  if (Array.isArray(parsed)) {
    return { ...defaults, results: toStringArray(parsed) };
  }

  if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    return {
      results: toStringArray(obj.results ?? obj.bullets),
      price: typeof obj.price === "string" ? obj.price : "",
      price_note: typeof obj.price_note === "string" ? obj.price_note : "",
      featured: Boolean(obj.featured),
      active: typeof obj.active === "boolean" ? obj.active : fallbackActive,
      order_index: Number(obj.order_index) || 0,
      tags: toStringArray(obj.tags),
      client_type: typeof obj.client_type === "string" ? obj.client_type : "",
    };
  }

  return defaults;
};

const toProjectMetaPayload = (source: FormData | Proyecto) => ({
  results: source.results,
  price: source.price,
  price_note: source.price_note,
  featured: source.featured,
  active: source.active,
  order_index: source.order_index,
  tags: source.tags,
  client_type: source.client_type,
});

const mapBackendProyecto = (item: BackendProyecto): Proyecto => {
  const media = toMediaArray(item.media);
  const stack = toStringArray(item.stack);
  const fallbackActive = isActiveFromStatus(item.status);
  const meta = parseResultsMeta(item.results, fallbackActive);

  const firstImage = media.find((m) => m.resource_type === "image")?.url || "";
  const firstVideo = media.find((m) => m.resource_type === "video")?.url || "";

  return {
    id: Number(item.id),
    title: String(item.title || "").trim(),
    description: String(item.description || "").trim(),
    category: String(item.category || "otro").trim(),
    price: meta.price,
    price_note: meta.price_note,
    featured: meta.featured,
    active: meta.active,
    order_index: meta.order_index,
    stack,
    results: meta.results,
    media,
    cover_url: String(item.image_url || firstImage || "").trim(),
    video_url: String(item.video_url || firstVideo || "").trim(),
    tags: meta.tags,
    client_type: meta.client_type || String(item.client_name || "").trim(),
    status: item.status || undefined,
    version: item.version || undefined,
    demo_url: item.demo_url || undefined,
    repo_url: item.repo_url || undefined,
    deployment_date: item.deployment_date || undefined,
    client_name: item.client_name || undefined,
    year: item.year || undefined,
    created_at: item.created_at,
  };
};

const toBackendPayload = (form: FormData, current?: Proyecto | null) => {
  const coverFromMedia =
    form.media.find((m) => m.resource_type === "image")?.url ||
    current?.cover_url ||
    "";
  const videoFromMedia =
    form.media.find((m) => m.resource_type === "video")?.url ||
    current?.video_url ||
    "";

  return {
    title: form.title.trim(),
    category: form.category.trim() || "otro",
    status: form.active ? (current?.status || "En Produccion") : "Inactivo",
    version: current?.version || "v1.0",
    description: form.description.trim(),
    image_url: (form.cover_url || coverFromMedia).trim(),
    video_url: (form.video_url || videoFromMedia).trim() || null,
    media: JSON.stringify(
      form.media.map((m) => ({
        type: m.resource_type,
        url: m.url,
        caption: m.caption,
        is_cover: m.is_cover,
      })),
    ),
    demo_url: form.demo_url.trim() || null,
    repo_url: form.repo_url.trim() || null,
    stack: JSON.stringify(form.stack),
    results: JSON.stringify(toProjectMetaPayload(form)),
    deployment_date: current?.deployment_date || null,
    client_name: form.client_type || current?.client_name || null,
    year: current?.year || null,
  };
};

// ── Constants ─────────────────────────────────────────────────────────────────

const EMPTY_FORM: FormData = {
  title: "",
  description: "",
  category: "web",
  price: "",
  price_note: "",
  featured: false,
  active: true,
  order_index: 0,
  stack: [],
  results: [],
  media: [],
  cover_url: "",
  video_url: "",
  demo_url: "",
  repo_url: "",
  tags: [],
  client_type: "",
};

const CATEGORIES = [
  { key: "web", label: "Sitio Web", icon: <FaGlobe /> },
  { key: "ecommerce", label: "E-Commerce", icon: <FaShoppingCart /> },
  { key: "sistemas", label: "Sistema", icon: <FaDatabase /> },
  { key: "apps", label: "App Móvil", icon: <FaMobileAlt /> },
  { key: "otro", label: "Otro", icon: <FaCode /> },
];

const CLIENT_TYPES = ["Emprendedor", "PYME", "Empresa", "Corporativo", "Startup", "ONG"];

// ── Toast notifications ───────────────────────────────────────────────────────

interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed top-6 right-6 z-[9999] space-y-3 max-w-sm">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            className={`flex items-start gap-3 p-4 rounded-2xl border font-bold text-sm shadow-2xl backdrop-blur-xl ${
              t.type === "success"
                ? "bg-emerald-900/80 border-emerald-500/50 text-emerald-300"
                : t.type === "error"
                ? "bg-red-900/80 border-red-500/50 text-red-300"
                : t.type === "warning"
                ? "bg-amber-900/80 border-amber-500/50 text-amber-300"
                : "bg-blue-900/80 border-blue-500/50 text-blue-300"
            }`}
          >
            <span className="text-lg flex-shrink-0 mt-0.5">
              {t.type === "success" ? "✓" : t.type === "error" ? "✗" : t.type === "warning" ? "⚠" : "ℹ"}
            </span>
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => onDismiss(t.id)}
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <FaTimes />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Confirm dialog ────────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, loading }: ConfirmDialogProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-slate-900 border border-white/10 rounded-3xl p-10 max-w-md w-full shadow-2xl"
      >
        <div className="text-5xl mb-6 text-center">⚠️</div>
        <h3 className="text-2xl font-black text-white text-center mb-4">{title}</h3>
        <p className="text-slate-400 text-center mb-10 leading-relaxed">{message}</p>
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-4 bg-white/10 text-white font-black rounded-xl hover:bg-white/20 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-500 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaTrash />}
            {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Tag/Array input ───────────────────────────────────────────────────────────

function TagInput({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const [inputVal, setInputVal] = useState("");

  const add = () => {
    const val = inputVal.trim();
    if (val && !items.includes(val)) {
      onChange([...items, val]);
      setInputVal("");
    }
  };

  const remove = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <label className="text-xs font-black uppercase tracking-widest text-slate-300 mb-3 block">
        {label}
      </label>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder || "Añadir ítem..."}
          className="input-elite flex-1 py-3 px-4 text-sm"
        />
        <button
          type="button"
          onClick={add}
          className="px-4 py-3 bg-blue-600/30 text-blue-400 border border-blue-600/50 rounded-xl hover:bg-blue-600/50 transition-all font-bold"
        >
          <FaPlus />
        </button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, idx) => (
            <span
              key={idx}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-slate-300 text-sm font-bold rounded-xl border border-white/10"
            >
              {item}
              <button
                type="button"
                onClick={() => remove(idx)}
                className="text-slate-500 hover:text-red-400 transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Media uploader ────────────────────────────────────────────────────────────

function MediaUploader({
  media,
  coverUrl,
  videoUrl,
  onMediaChange,
  onCoverChange,
  onVideoChange,
}: {
  media: MediaItem[];
  coverUrl: string;
  videoUrl: string;
  onMediaChange: (m: MediaItem[]) => void;
  onCoverChange: (url: string) => void;
  onVideoChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");

  const uploadFile = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "proyectos");

    const res = await fetch(`${BACKEND_URL}/api/upload`, {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Error al subir archivo");
    }
    return res.json();
  };

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const results = await Promise.all(files.map(uploadFile));
      const newItems: MediaItem[] = results.map((r, index) => {
        const file = files[index];
        const resource_type: MediaItem["resource_type"] =
          file?.type?.startsWith("video/") ? "video" : "image";
        return {
          url: r.url,
          resource_type,
        };
      });
      onMediaChange([...media, ...newItems]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      alert(`Error subiendo archivo: ${msg}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const addByUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    const isVideo = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
    onMediaChange([...media, { url, resource_type: isVideo ? "video" : "image" }]);
    setUrlInput("");
  };

  const removeMedia = async (item: MediaItem) => {
    setDeletingUrl(item.url);
    try {
      await fetch(`${BACKEND_URL}/api/upload/delete?url=${encodeURIComponent(item.url)}`, {
        method: "DELETE",
      });
    } catch {}
    onMediaChange(media.filter((m) => m.url !== item.url));
    if (coverUrl === item.url) onCoverChange("");
    if (videoUrl === item.url) onVideoChange("");
    setDeletingUrl(null);
  };

  const setCover = (url: string) => {
    onCoverChange(coverUrl === url ? "" : url);
  };

  const setMainVideo = (url: string) => {
    onVideoChange(videoUrl === url ? "" : url);
  };

  return (
    <div className="space-y-6">
      <label className="text-xs font-black uppercase tracking-widest text-slate-300 block">
        Media del Proyecto
      </label>

      {/* Upload area */}
      <div
        className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-blue-500/50 transition-all cursor-pointer group"
        onClick={() => fileRef.current?.click()}
      >
        <FaCloudUploadAlt className="text-5xl text-slate-600 group-hover:text-blue-400 mx-auto mb-4 transition-colors" />
        <p className="text-slate-400 font-bold mb-2">Arrastra archivos o haz clic para subir</p>
        <p className="text-slate-600 text-sm">Imágenes y videos • Máx. 50MB</p>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFilesChange}
          className="hidden"
        />
      </div>

      {uploading && (
        <div className="flex items-center gap-3 p-4 bg-blue-900/30 border border-blue-500/30 rounded-xl text-blue-400 font-bold">
          <FaSpinner className="animate-spin" /> Subiendo archivos...
        </div>
      )}

      {/* URL input */}
      <div className="flex gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addByUrl(); } }}
          placeholder="O pega una URL de imagen/video..."
          className="input-elite flex-1 py-3 px-4 text-sm"
        />
        <button
          type="button"
          onClick={addByUrl}
          className="px-4 py-3 bg-slate-700 text-slate-300 border border-white/10 rounded-xl hover:bg-slate-600 transition-all font-bold"
        >
          <FaLink />
        </button>
      </div>

      {/* Media gallery */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {media.map((item, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl overflow-hidden border-2 transition-all ${
                coverUrl === item.url
                  ? "border-blue-500"
                  : videoUrl === item.url
                  ? "border-violet-500"
                  : "border-white/10"
              }`}
            >
              {/* Thumbnail */}
              {item.resource_type === "video" ? (
                <div className="h-32 bg-slate-800 flex items-center justify-center">
                  <FaVideo className="text-4xl text-slate-500" />
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt=""
                  className="h-32 w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}

              {/* Badges */}
              {coverUrl === item.url && (
                <span className="absolute top-2 left-2 bg-blue-600 text-white text-[9px] font-black uppercase px-2 py-1 rounded-lg">
                  Portada
                </span>
              )}
              {videoUrl === item.url && (
                <span className="absolute top-2 left-2 bg-violet-600 text-white text-[9px] font-black uppercase px-2 py-1 rounded-lg">
                  Video Principal
                </span>
              )}

              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/70 transition-all flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
                {item.resource_type === "image" && (
                  <button
                    type="button"
                    onClick={() => setCover(item.url)}
                    title="Usar como portada"
                    className={`p-2 rounded-xl text-xs font-black transition-all ${
                      coverUrl === item.url
                        ? "bg-blue-600 text-white"
                        : "bg-white/20 text-white hover:bg-blue-600"
                    }`}
                  >
                    <FaImage />
                  </button>
                )}
                {item.resource_type === "video" && (
                  <button
                    type="button"
                    onClick={() => setMainVideo(item.url)}
                    title="Video principal"
                    className={`p-2 rounded-xl text-xs font-black transition-all ${
                      videoUrl === item.url
                        ? "bg-violet-600 text-white"
                        : "bg-white/20 text-white hover:bg-violet-600"
                    }`}
                  >
                    <FaVideo />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(item)}
                  disabled={deletingUrl === item.url}
                  title="Eliminar"
                  className="p-2 rounded-xl bg-red-600/80 text-white hover:bg-red-500 transition-all"
                >
                  {deletingUrl === item.url ? (
                    <FaSpinner className="animate-spin text-xs" />
                  ) : (
                    <FaTrashAlt className="text-xs" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Proyecto Form Modal ───────────────────────────────────────────────────────

interface ProyectoFormProps {
  initial?: Proyecto | null;
  onSave: (data: FormData) => Promise<void>;
  onClose: () => void;
  saving: boolean;
  error: string;
}

function ProyectoForm({ initial, onSave, onClose, saving, error }: ProyectoFormProps) {
  const [form, setForm] = useState<FormData>(() =>
    initial
      ? {
          title: initial.title,
          description: initial.description,
          category: initial.category,
          price: initial.price,
          price_note: initial.price_note,
          featured: initial.featured,
          active: initial.active,
          order_index: initial.order_index,
          stack: [...initial.stack],
          results: [...initial.results],
          media: [...initial.media],
          cover_url: initial.cover_url,
          video_url: initial.video_url,
          demo_url: initial.demo_url || "",
          repo_url: initial.repo_url || "",
          tags: [...initial.tags],
          client_type: initial.client_type,
        }
      : { ...EMPTY_FORM }
  );

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof FormData>(key: K, val: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setValidationErrors((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "El título es requerido";
    if (form.title.trim().length < 2) errs.title = "El título debe tener al menos 2 caracteres";
    if (!form.description.trim()) errs.description = "La descripción es requerida";
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (
    event?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>,
  ) => {
    event?.preventDefault();
    if (!validate()) return;
    await onSave(form);
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/10 flex-shrink-0">
          <h2 className="text-2xl font-black text-white">
            {initial ? "✏️ Editar Proyecto" : "✨ Nuevo Proyecto"}
          </h2>
          <button
            onClick={onClose}
            className="p-3 bg-white/5 text-slate-400 rounded-xl hover:bg-white/10 hover:text-white transition-all"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body - scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Error global */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-400 font-bold">
              <FaExclamationTriangle /> {error}
            </div>
          )}

          {/* Título */}
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-300 mb-3 block">
              Título del Proyecto *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Ej: Tienda Online E-Commerce"
              className={`input-elite w-full ${validationErrors.title ? "border-red-500" : ""}`}
            />
            {validationErrors.title && (
              <p className="text-red-400 text-sm mt-2 font-bold">{validationErrors.title}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-300 mb-3 block">
              Descripción *
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              placeholder="Describe el proyecto, sus características y beneficios..."
              className={`input-elite w-full resize-none ${validationErrors.description ? "border-red-500" : ""}`}
            />
            {validationErrors.description && (
              <p className="text-red-400 text-sm mt-2 font-bold">{validationErrors.description}</p>
            )}
          </div>

          {/* Categoría */}
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-300 mb-3 block">
              Categoría
            </label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => set("category", cat.key)}
                  className={`p-4 rounded-xl border font-bold text-sm flex flex-col items-center gap-2 transition-all ${
                    form.category === cat.key
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="text-xs">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Precio */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-300 mb-3 block">
                Precio
              </label>
              <input
                type="text"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="Ej: $3,500 USD"
                className="input-elite w-full"
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-300 mb-3 block">
                Nota de precio
              </label>
              <input
                type="text"
                value={form.price_note}
                onChange={(e) => set("price_note", e.target.value)}
                placeholder="Ej: Desde / Según alcance"
                className="input-elite w-full"
              />
            </div>
          </div>

          {/* Tipo de cliente */}
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-300 mb-3 block">
              Tipo de Cliente
            </label>
            <div className="flex flex-wrap gap-3">
              {CLIENT_TYPES.map((ct) => (
                <button
                  key={ct}
                  type="button"
                  onClick={() => set("client_type", form.client_type === ct ? "" : ct)}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border ${
                    form.client_type === ct
                      ? "bg-emerald-600 border-emerald-500 text-white"
                      : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  {ct}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <TagInput
            label="Tags"
            items={form.tags}
            onChange={(v) => set("tags", v)}
            placeholder="React, Next.js, API..."
          />

          {/* Stack */}
          <TagInput
            label="Stack Tecnológico"
            items={form.stack}
            onChange={(v) => set("stack", v)}
            placeholder="React, Node.js, PostgreSQL..."
          />

          {/* Resultados */}
          <TagInput
            label="Resultados / Beneficios"
            items={form.results}
            onChange={(v) => set("results", v)}
            placeholder="300% más ventas, Reducción 50% tiempo..."
          />

          {/* Enlaces externos */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-300 mb-3 block">
                URL Demo
              </label>
              <div className="relative">
                <FaLink className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="url"
                  value={form.demo_url}
                  onChange={(e) => set("demo_url", e.target.value)}
                  placeholder="https://demo.tudominio.com"
                  className="input-elite w-full pl-10"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Se usa para el boton "Ver Demo" en la web publica.</p>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-300 mb-3 block">
                URL Repositorio (Git)
              </label>
              <div className="relative">
                <FaLink className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="url"
                  value={form.repo_url}
                  onChange={(e) => set("repo_url", e.target.value)}
                  placeholder="https://github.com/usuario/proyecto"
                  className="input-elite w-full pl-10"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Se usa para el boton "Ver Git" en el detalle del proyecto.</p>
            </div>
          </div>

          {/* Media */}
          <MediaUploader
            media={form.media}
            coverUrl={form.cover_url}
            videoUrl={form.video_url}
            onMediaChange={(m) => set("media", m)}
            onCoverChange={(u) => set("cover_url", u)}
            onVideoChange={(u) => set("video_url", u)}
          />

          {/* Toggles */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                key: "featured" as keyof FormData,
                label: "⭐ Proyecto Destacado",
                desc: "Aparece en la sección bestsellers",
                val: form.featured,
              },
              {
                key: "active" as keyof FormData,
                label: "👁️ Proyecto Activo",
                desc: "Visible en la página pública",
                val: form.active,
              },
            ].map((toggle) => (
              <div
                key={toggle.key}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  toggle.val
                    ? "border-emerald-500/50 bg-emerald-900/20"
                    : "border-white/10 bg-white/5"
                }`}
                onClick={() => set(toggle.key, !toggle.val as FormData[typeof toggle.key])}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-white text-sm">{toggle.label}</span>
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${
                    toggle.val ? "bg-emerald-500 border-emerald-400" : "border-white/30"
                  }`}>
                    {toggle.val && <FaCheck className="text-white text-xs" />}
                  </div>
                </div>
                <p className="text-slate-500 text-xs">{toggle.desc}</p>
              </div>
            ))}

            {/* Order index */}
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 block">
                Orden
              </label>
              <input
                type="number"
                min={0}
                value={form.order_index}
                onChange={(e) => set("order_index", Number(e.target.value))}
                className="input-elite w-full py-2 px-3 text-center text-xl font-black"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-4 p-8 border-t border-white/10 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-4 bg-white/5 text-slate-400 font-black rounded-xl hover:bg-white/10 hover:text-white transition-all border border-white/10"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-3 disabled:opacity-60 shadow-2xl shadow-blue-600/20"
          >
            {saving ? (
              <>
                <FaSpinner className="animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <FaSave /> {initial ? "Actualizar Proyecto" : "Crear Proyecto"}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Proyecto Card (list item) ─────────────────────────────────────────────────

function ProyectoRow({
  proyecto,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleFeatured,
}: {
  proyecto: Proyecto;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onToggleFeatured: () => void;
}) {
  const CATEGORY_LABELS: Record<string, string> = {
    web: "Web", ecommerce: "E-Commerce", sistemas: "Sistema", apps: "App", otro: "Otro",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${
        proyecto.active
          ? "bg-white/5 border-white/10 hover:border-white/20"
          : "bg-slate-900/50 border-white/5 opacity-60"
      }`}
    >
      {/* Cover / Icon */}
      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800 flex items-center justify-center text-2xl">
        {proyecto.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={proyecto.cover_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-slate-500">
            {proyecto.category === "web" ? <FaGlobe /> :
             proyecto.category === "ecommerce" ? <FaShoppingCart /> :
             proyecto.category === "sistemas" ? <FaDatabase /> :
             proyecto.category === "apps" ? <FaMobileAlt /> : <FaCode />}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-black text-white truncate">{proyecto.title}</h3>
          {proyecto.featured && <FaStar className="text-amber-500 text-xs flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 font-bold">
          <span className="px-2 py-0.5 bg-white/10 rounded-lg">
            {CATEGORY_LABELS[proyecto.category] || proyecto.category}
          </span>
          {proyecto.price && <span className="text-blue-400">{proyecto.price}</span>}
          {proyecto.tags.slice(0, 2).map((t) => (
            <span key={t} className="hidden md:block text-slate-600">#{t}</span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onToggleFeatured}
          title={proyecto.featured ? "Quitar destacado" : "Destacar"}
          className={`p-2.5 rounded-xl transition-all border ${
            proyecto.featured
              ? "bg-amber-600/20 border-amber-500/50 text-amber-400 hover:bg-amber-600/40"
              : "bg-white/5 border-white/10 text-slate-600 hover:text-amber-400 hover:border-amber-500/30"
          }`}
        >
          <FaStar className="text-sm" />
        </button>
        <button
          onClick={onToggleActive}
          title={proyecto.active ? "Desactivar" : "Activar"}
          className={`p-2.5 rounded-xl transition-all border ${
            proyecto.active
              ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-400 hover:bg-emerald-600/40"
              : "bg-white/5 border-white/10 text-slate-600 hover:text-emerald-400"
          }`}
        >
          {proyecto.active ? <FaEye className="text-sm" /> : <FaEyeSlash className="text-sm" />}
        </button>
        <button
          onClick={onEdit}
          title="Editar"
          className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/40 transition-all"
        >
          <FaEdit className="text-sm" />
        </button>
        <button
          onClick={onDelete}
          title="Eliminar"
          className="p-2.5 rounded-xl bg-red-600/10 border border-red-500/20 text-red-500 hover:bg-red-600/30 transition-all"
        >
          <FaTrash className="text-sm" />
        </button>
      </div>
    </motion.div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function ProyectoAdmin() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Proyecto | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<Proyecto | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Toast helpers
  const addToast = useCallback((type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch
  const fetchProyectos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/proyectos`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) {
        throw new Error("Formato invalido de proyectos");
      }

      const normalized = data
        .map((item) => mapBackendProyecto(item as BackendProyecto))
        .sort((a, b) => a.order_index - b.order_index || a.id - b.id);

      setProyectos(normalized);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setError(msg);
      addToast("error", `Error cargando proyectos: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchProyectos();
  }, [fetchProyectos]);

  // Filtered list
  const filteredProyectos = proyectos.filter((p) => {
    const matchSearch = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === "all" || p.category === filterCategory;
    const matchActive =
      filterActive === "all" ||
      (filterActive === "active" && p.active) ||
      (filterActive === "inactive" && !p.active);
    return matchSearch && matchCat && matchActive;
  });

  // CRUD
  const handleSave = async (data: FormData) => {
    setSaveError("");
    setSaving(true);
    try {
      const isEdit = !!editTarget;
      const url = isEdit
        ? `${BACKEND_URL}/api/proyectos/${editTarget!.id}`
        : `${BACKEND_URL}/api/proyectos/`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toBackendPayload(data, editTarget)),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `HTTP ${res.status}`);
      }
      const saved = mapBackendProyecto((await res.json()) as BackendProyecto);
      setProyectos((prev) =>
        isEdit
          ? prev.map((p) => (p.id === saved.id ? saved : p))
          : [...prev, saved].sort((a, b) => a.order_index - b.order_index || a.id - b.id)
      );
      setShowForm(false);
      setEditTarget(null);
      addToast("success", isEdit ? "Proyecto actualizado correctamente" : "Proyecto creado correctamente");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const urlsToDelete = Array.from(
        new Set(
          [confirmDelete.cover_url, confirmDelete.video_url, ...confirmDelete.media.map((m) => m.url)]
            .map((url) => url.trim())
            .filter((url) => url.length > 0),
        ),
      );

      await Promise.allSettled(
        urlsToDelete.map((url) =>
          fetch(`${BACKEND_URL}/api/upload/delete?url=${encodeURIComponent(url)}`, {
            method: "DELETE",
          }),
        ),
      );

      const res = await fetch(`${BACKEND_URL}/api/proyectos/${confirmDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `HTTP ${res.status}`);
      }
      setProyectos((prev) => prev.filter((p) => p.id !== confirmDelete.id));
      addToast("success", `Proyecto "${confirmDelete.title}" eliminado`);
      setConfirmDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      addToast("error", `Error eliminando: ${msg}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (p: Proyecto) => {
    try {
      const nextActive = !p.active;
      const res = await fetch(`${BACKEND_URL}/api/proyectos/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextActive ? (p.status || "En Produccion") : "Inactivo",
          results: JSON.stringify({
            ...toProjectMetaPayload(p),
            active: nextActive,
          }),
        }),
      });
      if (!res.ok) throw new Error();
      const updated = mapBackendProyecto((await res.json()) as BackendProyecto);
      setProyectos((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      addToast("info", `Proyecto ${updated.active ? "activado" : "desactivado"}`);
    } catch {
      addToast("error", "Error actualizando estado");
    }
  };

  const handleToggleFeatured = async (p: Proyecto) => {
    try {
      const nextFeatured = !p.featured;
      const res = await fetch(`${BACKEND_URL}/api/proyectos/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          results: JSON.stringify({
            ...toProjectMetaPayload(p),
            featured: nextFeatured,
          }),
        }),
      });
      if (!res.ok) throw new Error();
      const updated = mapBackendProyecto((await res.json()) as BackendProyecto);
      setProyectos((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      addToast("info", updated.featured ? "⭐ Proyecto destacado" : "Proyecto quitado de destacados");
    } catch {
      addToast("error", "Error actualizando destacado");
    }
  };

  // Stats
  const stats = {
    total: proyectos.length,
    active: proyectos.filter((p) => p.active).length,
    featured: proyectos.filter((p) => p.featured).length,
    inactive: proyectos.filter((p) => !p.active).length,
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Confirm delete dialog */}
      <AnimatePresence>
        {confirmDelete && (
          <ConfirmDialog
            isOpen
            title="Eliminar Proyecto"
            message={`¿Estás seguro de que deseas eliminar "${confirmDelete.title}"? Esta acción también borrará los archivos de Cloudinary y no se puede deshacer.`}
            onConfirm={handleDelete}
            onCancel={() => setConfirmDelete(null)}
            loading={deleting}
          />
        )}
      </AnimatePresence>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <ProyectoForm
            initial={editTarget}
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditTarget(null); setSaveError(""); }}
            saving={saving}
            error={saveError}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">📂 Gestión de Proyectos</h1>
          <p className="text-slate-500 font-bold">
            Administra el portafolio de proyectos del sitio público
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchProyectos}
            className="p-4 bg-white/5 border border-white/10 text-slate-400 rounded-2xl hover:bg-white/10 hover:text-white transition-all"
          >
            <FaRedo />
          </button>
          <button
            onClick={() => { setEditTarget(null); setSaveError(""); setShowForm(true); }}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-600/20 hover:opacity-90 transition-all"
          >
            <FaPlus /> Nuevo Proyecto
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total", val: stats.total, color: "text-white", bg: "bg-white/5" },
          { label: "Activos", val: stats.active, color: "text-emerald-400", bg: "bg-emerald-900/20" },
          { label: "Destacados", val: stats.featured, color: "text-amber-400", bg: "bg-amber-900/20" },
          { label: "Inactivos", val: stats.inactive, color: "text-slate-500", bg: "bg-slate-900/50" },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} border border-white/10 rounded-2xl p-6 text-center`}>
            <div className={`text-4xl font-black ${s.color} mb-1`}>{s.val}</div>
            <div className="text-xs text-slate-500 font-black uppercase tracking-widest">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar proyectos..."
            className="input-elite w-full pl-11 py-4"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input-elite py-4 px-5 min-w-[160px]"
        >
          <option value="all">Todas las categorías</option>
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value as typeof filterActive)}
          className="input-elite py-4 px-5 min-w-[140px]"
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <FaSpinner className="text-5xl text-blue-500 animate-spin mb-6" />
          <p className="text-slate-400 font-bold">Cargando proyectos...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <FaExclamationTriangle className="text-6xl text-red-500/70 mb-6" />
          <h3 className="text-2xl font-black text-white mb-3">Error al cargar</h3>
          <p className="text-slate-500 mb-8">{error}</p>
          <button
            onClick={fetchProyectos}
            className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all"
          >
            <FaRedo /> Reintentar
          </button>
        </div>
      ) : filteredProyectos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="text-6xl mb-6">📂</div>
          <h3 className="text-2xl font-black text-slate-400 mb-3">
            {proyectos.length === 0 ? "No hay proyectos" : "Sin resultados"}
          </h3>
          <p className="text-slate-600 mb-8">
            {proyectos.length === 0
              ? "Comienza creando tu primer proyecto"
              : "Prueba con otros filtros de búsqueda"}
          </p>
          {proyectos.length === 0 && (
            <button
              onClick={() => { setEditTarget(null); setShowForm(true); }}
              className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all"
            >
              <FaPlus /> Crear primer proyecto
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredProyectos.map((p) => (
              <ProyectoRow
                key={p.id}
                proyecto={p}
                onEdit={() => { setEditTarget(p); setSaveError(""); setShowForm(true); }}
                onDelete={() => setConfirmDelete(p)}
                onToggleActive={() => handleToggleActive(p)}
                onToggleFeatured={() => handleToggleFeatured(p)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Count */}
      {!loading && !error && filteredProyectos.length > 0 && (
        <div className="mt-8 text-center text-slate-600 text-sm font-bold">
          Mostrando {filteredProyectos.length} de {proyectos.length} proyectos
        </div>
      )}

      {/* Nuevo bloque admin para la cinta tecnologica publica de proyectos */}
      <section className="mt-14 pt-10 border-t border-white/10">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Cinta Tecnologica (Pagina Proyectos)
          </h2>
          <p className="text-slate-400 text-sm md:text-base mt-2">
            Gestiona aqui los logos y tecnologias que se muestran en la cinta animada del sitio publico.
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/50 to-slate-950/80 p-4 md:p-6">
          <AboutStackAdmin />
        </div>
      </section>
    </div>
  );
}
