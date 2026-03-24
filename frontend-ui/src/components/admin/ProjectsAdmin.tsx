"use client";

/**
 * ProyectoAdmin.tsx
 * Panel de administración completo para gestión de Proyectos.
 * CRUD, gestión de media (Cloudinary), validaciones y UX premium (Enterprise Edition).
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaImage, FaVideo,
  FaGlobe, FaShoppingCart, FaMobileAlt, FaDatabase, FaCode,
  FaCheck, FaExclamationTriangle, FaSpinner, FaEye, FaEyeSlash,
  FaStar, FaSearch, FaRedo,
  FaCloudUploadAlt, FaTrashAlt, FaLink,
  FaReact, FaNodeJs, FaPython, FaFigma
} from "react-icons/fa";
import {
  SiNextdotjs, SiTypescript, SiPostgresql, SiTailwindcss,
  SiMongodb, SiDocker, SiAmazon, SiGooglecloud
} from "react-icons/si";
import AboutStackAdmin from "./AboutStackAdmin";
import API_BASE from "@/lib/apiBase";
import { adminFetch } from "@/lib/adminFetch";

const BACKEND_URL = API_BASE;

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
  { key: "web", label: "Sitio Web", icon: <FaGlobe />, color: "#3b82f6", bg: "#3b82f620" },
  { key: "ecommerce", label: "E-Commerce", icon: <FaShoppingCart />, color: "#10b981", bg: "#10b98120" },
  { key: "sistemas", label: "Sistema", icon: <FaDatabase />, color: "#8b5cf6", bg: "#8b5cf620" },
  { key: "apps", label: "App Móvil", icon: <FaMobileAlt />, color: "#f59e0b", bg: "#f59e0b20" },
  { key: "otro", label: "Otro", icon: <FaCode />, color: "#94a3b8", bg: "#94a3b820" },
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
            className={`flex items-start gap-3 p-4 rounded-2xl border font-bold text-sm shadow-2xl backdrop-blur-xl ${t.type === "success"
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
          className="flex-1 py-4 px-5 text-sm bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 outline-none focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 font-medium shadow-inner transition-all"
        />
        <button
          type="button"
          onClick={add}
          className="px-5 py-4 bg-blue-600 border border-blue-500 text-white rounded-2xl hover:bg-blue-500 transition-all font-black shadow-lg shadow-blue-500/20"
        >
          <FaPlus />
        </button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, idx) => (
            <span
              key={idx}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 text-sm font-bold rounded-xl border border-slate-700"
            >
              {item}
              <button
                type="button"
                onClick={() => remove(idx)}
                className="text-slate-500 hover:text-red-400 bg-white/5 hover:bg-red-500/10 p-1 rounded-md transition-all ml-1"
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

    const res = await adminFetch(`${BACKEND_URL}/api/upload`, {
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
      await adminFetch(`${BACKEND_URL}/api/upload/delete?url=${encodeURIComponent(item.url)}`, {
        method: "DELETE",
      });
    } catch { }
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
          className="flex-1 py-3 px-4 text-sm bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 outline-none focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 font-medium shadow-inner transition-all"
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
              className={`relative rounded-2xl overflow-hidden border-2 transition-all ${coverUrl === item.url
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
                <img src={item.url} alt="" className="h-32 w-full object-cover" />
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
                    className={`p-2 rounded-xl text-xs font-black transition-all ${coverUrl === item.url ? "bg-blue-600 text-white" : "bg-white/20 text-white hover:bg-blue-600"
                      }`}
                  >
                    <FaImage />
                  </button>
                )}
                {item.resource_type === "video" && (
                  <button
                    type="button"
                    onClick={() => setMainVideo(item.url)}
                    className={`p-2 rounded-xl text-xs font-black transition-all ${videoUrl === item.url ? "bg-violet-600 text-white" : "bg-white/20 text-white hover:bg-violet-600"
                      }`}
                  >
                    <FaVideo />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(item)}
                  disabled={deletingUrl === item.url}
                  className="p-2 rounded-xl bg-red-600/80 text-white hover:bg-red-500 transition-all"
                >
                  {deletingUrl === item.url ? <FaSpinner className="animate-spin text-xs" /> : <FaTrashAlt className="text-xs" />}
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
  defaultFeatured?: boolean;
  onSave: (data: FormData) => Promise<void>;
  onClose: () => void;
  saving: boolean;
  error: string;
}

function ProyectoForm({ initial, defaultFeatured, onSave, onClose, saving, error }: ProyectoFormProps) {
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
      : { ...EMPTY_FORM, featured: defaultFeatured ?? false }
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

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
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
        className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between p-8 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              {initial ? <FaEdit className="text-white" /> : <FaPlus className="text-white" />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">
                {initial ? "✏️ Editar Proyecto" : "✨ Crear Nuevo Proyecto"}
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                {initial ? `Editando: ${initial.title}` : "Complete los campos para crear un nuevo proyecto"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 text-slate-400 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-all border border-white/10">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-400 font-bold">
              <FaExclamationTriangle /> {error}
            </div>
          )}

          {/* ── Selector Tipo de Proyecto (Destacado / Normal) ── */}
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-300 mb-4 block">Tipo de Proyecto</label>
            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => set("featured", true)}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                  form.featured
                    ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${form.featured ? "bg-amber-500 text-black" : "bg-white/10 text-slate-500"}`}>
                  <FaStar />
                </div>
                <div>
                  <h3 className={`font-black text-sm ${form.featured ? "text-amber-400" : "text-slate-400"}`}>Proyecto Destacado</h3>
                  <p className="text-slate-500 text-xs mt-1">Aparece en la sección principal y bestsellers</p>
                </div>
              </div>
              <div
                onClick={() => set("featured", false)}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                  !form.featured
                    ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${!form.featured ? "bg-blue-500 text-white" : "bg-white/10 text-slate-500"}`}>
                  <FaGlobe />
                </div>
                <div>
                  <h3 className={`font-black text-sm ${!form.featured ? "text-blue-400" : "text-slate-400"}`}>Proyecto Normal</h3>
                  <p className="text-slate-500 text-xs mt-1">Aparece en el catálogo general de proyectos</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-300 mb-3 block">Título del Proyecto *</label>
            <input
              type="text" value={form.title} onChange={(e) => set("title", e.target.value)}
              placeholder="Ej: Tienda Online E-Commerce"
              className={`w-full py-4 px-5 bg-slate-800/50 border rounded-2xl text-white placeholder-slate-500 outline-none focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 font-medium shadow-inner transition-all text-sm ${validationErrors.title ? "border-red-500" : "border-slate-700/50"}`}
            />
            {validationErrors.title && <p className="text-red-400 text-sm mt-2 font-bold">{validationErrors.title}</p>}
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-300 mb-3 block">Descripción *</label>
            <textarea
              value={form.description} onChange={(e) => set("description", e.target.value)}
              rows={4} placeholder="Describe el proyecto..."
              className={`w-full py-4 px-5 bg-slate-800/50 border rounded-2xl text-white placeholder-slate-500 outline-none focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 font-medium shadow-inner transition-all text-sm resize-none ${validationErrors.description ? "border-red-500" : "border-slate-700/50"}`}
            />
            {validationErrors.description && <p className="text-red-400 text-sm mt-2 font-bold">{validationErrors.description}</p>}
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-300 mb-3 block">Categoría</label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {CATEGORIES.map((cat) => {
                const isKnownCategory = CATEGORIES.some(c => c.key === form.category);
                // Si la categoría actual no está en la lista (o es exactamente "otro"), seleccionamos visualmente "Otro"
                const isSelected = isKnownCategory ? form.category === cat.key : cat.key === "otro";
                
                return (
                  <button
                    key={cat.key} type="button" 
                    onClick={() => {
                      if (cat.key === "otro") {
                        // Si hace click en Otro y ya era otro, no hacemos nada, si no, limpiamos para que escriba
                        if (isKnownCategory) set("category", "");
                      } else {
                        set("category", cat.key);
                      }
                    }}
                    style={isSelected ? {
                      backgroundColor: cat.bg,
                      borderColor: cat.color,
                      color: cat.color,
                      boxShadow: `0 4px 14px 0 ${cat.bg}`
                    } : {}}
                    className={`p-4 rounded-xl border font-bold text-sm flex flex-col items-center gap-2 transition-all ${
                      !isSelected && "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="text-xl" style={{ color: cat.color }}>{cat.icon}</span>
                    <span className="text-xs">{cat.label}</span>
                  </button>
                );
              })}
            </div>
            {/* Input para categoría personalizada si "Otro" está seleccionado */}
            {!CATEGORIES.some(c => c.key === form.category && c.key !== "otro") && (
              <div className="mt-4 p-5 bg-slate-800/30 border border-slate-700/50 rounded-2xl">
                 <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 block flex items-center gap-2">
                   <FaCode className="text-blue-500" /> Nombre de Categoría Personalizada
                 </label>
                 <input
                   type="text"
                   value={CATEGORIES.some(c => c.key === form.category) ? "" : form.category}
                   onChange={(e) => set("category", e.target.value)}
                   placeholder="Escribe tu categoría... (puedes incluir emojis 🚀)"
                   className="w-full py-4 px-5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 outline-none focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 font-medium shadow-inner transition-all text-sm"
                 />
                 <p className="text-slate-500 text-xs mt-2">Al escribir un nombre aquí, este proyecto se agrupará bajo esta nueva categoría.</p>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-300 mb-3 block">Precio</label>
              <input type="text" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="Ej: $3,500 USD" className="w-full py-4 px-5 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 outline-none focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 font-medium shadow-inner transition-all text-sm" />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-300 mb-3 block">Nota de precio</label>
              <input type="text" value={form.price_note} onChange={(e) => set("price_note", e.target.value)} placeholder="Ej: Desde / Según alcance" className="w-full py-4 px-5 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 outline-none focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 font-medium shadow-inner transition-all text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-300 mb-3 block">Tipo de Cliente</label>
            <div className="flex flex-wrap gap-3">
              {CLIENT_TYPES.map((ct) => (
                <button
                  key={ct} type="button" onClick={() => set("client_type", form.client_type === ct ? "" : ct)}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border ${form.client_type === ct ? "bg-emerald-600 border-emerald-500 text-white" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                    }`}
                >
                  {ct}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-300 mb-3 block">Tags Adicionales (Conceptos / Tipos)</label>
            <div className="flex flex-wrap gap-2 p-4 bg-slate-800/30 border border-slate-700/50 rounded-2xl">
              {["SaaS", "E-Commerce", "App Móvil", "Landing Page", "Dashboard", "UX/UI", "SEO", "B2B", "B2C", "MVP"].map((tagOption) => {
                const isSelected = form.tags.includes(tagOption);
                return (
                  <button
                    key={tagOption}
                    type="button"
                    onClick={() => {
                      if (isSelected) set("tags", form.tags.filter(t => t !== tagOption));
                      else set("tags", [...form.tags, tagOption]);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                      isSelected 
                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" 
                        : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {tagOption}
                  </button>
                );
              })}
            </div>
            <div className="mt-3">
              <TagInput label="" items={form.tags.filter(t => !["SaaS", "E-Commerce", "App Móvil", "Landing Page", "Dashboard", "UX/UI", "SEO", "B2B", "B2C", "MVP"].includes(t))} onChange={(v) => {
                const standardTags = form.tags.filter(t => ["SaaS", "E-Commerce", "App Móvil", "Landing Page", "Dashboard", "UX/UI", "SEO", "B2B", "B2C", "MVP"].includes(t));
                set("tags", [...standardTags, ...v]);
              }} placeholder="Añadir otro tag personalizado (ej. Fintech)..." />
            </div>
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-300 mb-3 block">Stack Tecnológico</label>
            <div className="flex flex-wrap gap-2 p-4 bg-slate-800/30 border border-slate-700/50 rounded-2xl">
              {[
                { name: "React", bg: "#61DAFB20", border: "#61DAFB", text: "#61DAFB", icon: <FaReact /> },
                { name: "Next.js", bg: "#FFFFFF20", border: "#FFFFFF", text: "#FFFFFF", icon: <SiNextdotjs /> },
                { name: "TypeScript", bg: "#3178C620", border: "#3178C6", text: "#3178C6", icon: <SiTypescript /> },
                { name: "Node.js", bg: "#33993320", border: "#339933", text: "#339933", icon: <FaNodeJs /> },
                { name: "Python", bg: "#3776AB20", border: "#3776AB", text: "#3776AB", icon: <FaPython /> },
                { name: "TailwindCSS", bg: "#06B6D420", border: "#06B6D4", text: "#06B6D4", icon: <SiTailwindcss /> },
                { name: "Figma", bg: "#F24E1E20", border: "#F24E1E", text: "#F24E1E", icon: <FaFigma /> },
                { name: "AWS", bg: "#FF990020", border: "#FF9900", text: "#FF9900", icon: <SiAmazon /> },
                { name: "Google Cloud", bg: "#4285F420", border: "#4285F4", text: "#4285F4", icon: <SiGooglecloud /> },
                { name: "MongoDB", bg: "#47A24820", border: "#47A248", text: "#47A248", icon: <SiMongodb /> },
                { name: "PostgreSQL", bg: "#4169E120", border: "#4169E1", text: "#4169E1", icon: <SiPostgresql /> },
                { name: "Docker", bg: "#2496ED20", border: "#2496ED", text: "#2496ED", icon: <SiDocker /> }
              ].map((stackOption) => {
                const isSelected = form.stack.includes(stackOption.name);
                return (
                  <button
                    key={stackOption.name}
                    type="button"
                    onClick={() => {
                      if (isSelected) set("stack", form.stack.filter(s => s !== stackOption.name));
                      else set("stack", [...form.stack, stackOption.name]);
                    }}
                    style={isSelected ? {
                      backgroundColor: stackOption.bg,
                      borderColor: stackOption.border,
                      color: stackOption.text,
                      boxShadow: `0 4px 14px 0 ${stackOption.bg}`
                    } : {}}
                    className={`px-4 py-2 flex items-center gap-2 rounded-xl text-xs font-black transition-all border ${
                      !isSelected && "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <span className="text-base" style={{ color: stackOption.text }}>{stackOption.icon}</span>
                    {stackOption.name}
                  </button>
                );
              })}
            </div>
            <div className="mt-3">
              <TagInput label="" items={form.stack.filter(s => !["React", "Next.js", "TypeScript", "Node.js", "Python", "TailwindCSS", "Figma", "AWS", "Google Cloud", "MongoDB", "PostgreSQL", "Docker"].includes(s))} onChange={(v) => {
                const standardStack = form.stack.filter(s => ["React", "Next.js", "TypeScript", "Node.js", "Python", "TailwindCSS", "Figma", "AWS", "Google Cloud", "MongoDB", "PostgreSQL", "Docker"].includes(s));
                set("stack", [...standardStack, ...v]);
              }} placeholder="Añadir otra tecnología (ej. Vue, Redis)..." />
            </div>
          </div>
          <TagInput label="Resultados" items={form.results} onChange={(v) => set("results", v)} placeholder="300% más ventas..." />

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-300 mb-3 block">URL Demo</label>
              <div className="relative">
                <FaLink className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="url" value={form.demo_url} onChange={(e) => set("demo_url", e.target.value)} placeholder="https://..." className="w-full py-4 pl-12 pr-5 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 outline-none focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 font-medium shadow-inner transition-all text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-300 mb-3 block">URL Git</label>
              <div className="relative">
                <FaLink className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="url" value={form.repo_url} onChange={(e) => set("repo_url", e.target.value)} placeholder="https://..." className="w-full py-4 pl-12 pr-5 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 outline-none focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 font-medium shadow-inner transition-all text-sm" />
              </div>
            </div>
          </div>

          <MediaUploader
            media={form.media} coverUrl={form.cover_url} videoUrl={form.video_url}
            onMediaChange={(m) => set("media", m)} onCoverChange={(u) => set("cover_url", u)} onVideoChange={(u) => set("video_url", u)}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <div
              onClick={() => set("active", !form.active)}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${form.active ? "border-emerald-500/50 bg-emerald-900/20" : "border-white/10 bg-white/5"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-white text-sm">👁️ Proyecto Activo</span>
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${form.active ? "bg-emerald-500 border-emerald-400" : "border-white/30"}`}>
                  {form.active && <FaCheck className="text-white text-xs" />}
                </div>
              </div>
              <p className="text-slate-500 text-xs">Visible en la página pública</p>
            </div>
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 block">Orden</label>
              <input type="number" min={0} value={form.order_index} onChange={(e) => set("order_index", Number(e.target.value))} className="w-full py-4 px-5 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white text-center text-xl font-black outline-none focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 font-medium shadow-inner transition-all" />
            </div>
          </div>
        </form>

        <div className="flex gap-4 p-8 border-t border-white/10 flex-shrink-0">
          <button onClick={onClose} disabled={saving} className="flex-1 py-4 bg-white/5 text-slate-400 font-black rounded-xl hover:bg-white/10 hover:text-white transition-all border border-white/10">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-3 disabled:opacity-60 shadow-2xl">
            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />} {initial ? "Actualizar Proyecto" : "Crear Proyecto"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Proyecto Row (Enterprise) ────────────────────────────────────────────────

function ProyectoRow({ proyecto, onEdit, onDelete, onToggleActive, onToggleFeatured }: any) {
  const CATEGORY_LABELS: any = { web: "Enterprise Web", ecommerce: "E-Commerce System", sistemas: "Core System", apps: "Mobile App", otro: "Custom Dev" };
  return (
    <motion.div layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={`group relative flex items-center gap-6 p-4 rounded-xl border transition-all duration-300 ${proyecto.active ? "bg-slate-900/40 border-white/5 hover:border-blue-500/30" : "bg-black/40 border-red-500/10 opacity-70 grayscale-[0.5]"}`}>
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 rounded-r-full ${proyecto.active ? (proyecto.featured ? "bg-amber-500" : "bg-blue-500") : "bg-slate-700"}`} />
      <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-950 border border-white/10">
        {proyecto.cover_url ? <img src={proyecto.cover_url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" /> : <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-700"><FaCode /></div>}
        {proyecto.featured && <div className="absolute top-1 right-1 bg-amber-500 text-black p-1 rounded-md"><FaStar className="text-[8px]" /></div>}
      </div>
      <div className="flex-1 min-w-0 font-sans">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-sm font-bold text-slate-100 truncate group-hover:text-white">{proyecto.title}</h3>
          <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded border border-white/10 text-slate-500">ID: {proyecto.id}</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-black uppercase text-slate-500">
          <span className="text-blue-400/80">{CATEGORY_LABELS[proyecto.category] || proyecto.category}</span>
          {proyecto.price && <span className="text-blue-500/50">|</span>}
          {proyecto.price && <span className="text-blue-400">{proyecto.price}</span>}
          {proyecto.client_type && <span className="hidden md:inline">| {proyecto.client_type}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 bg-black/20 p-1 rounded-xl border border-white/5">
        <button onClick={onToggleFeatured} className={`p-2 rounded-lg ${proyecto.featured ? "bg-amber-500/10 text-amber-500" : "text-slate-500 hover:text-amber-500"}`}><FaStar /></button>
        <button onClick={onToggleActive} className={`p-2 rounded-lg ${proyecto.active ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"}`}>{proyecto.active ? <FaEye /> : <FaEyeSlash />}</button>
        <button onClick={onEdit} className="p-2 rounded-lg text-slate-400 hover:text-white"><FaEdit /></button>
        <button onClick={onDelete} className="p-2 rounded-lg text-slate-600 hover:text-red-500"><FaTrash /></button>
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
  const [createAsFeatured, setCreateAsFeatured] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Proyecto | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(v => [...v, { id, type, message }]);
    setTimeout(() => setToasts(v => v.filter(t => t.id !== id)), 4000);
  }, []);

  const fetchProyectos = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await adminFetch(`${BACKEND_URL}/api/proyectos`);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setProyectos(data.map(mapBackendProyecto).sort((a: any, b: any) => a.order_index - b.order_index || b.id - a.id));
    } catch (err: any) { setError(err.message); addToast("error", err.message); } finally { setLoading(false); }
  }, [addToast]);

  useEffect(() => { fetchProyectos(); }, [fetchProyectos]);

  const filtered = proyectos.filter(p => {
    const mSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const mCat = filterCategory === "all" || p.category === filterCategory;
    const mActive = filterActive === "all" || (filterActive === "active" && p.active) || (filterActive === "inactive" && !p.active);
    return mSearch && mCat && mActive;
  });

  const featuredProjects = filtered.filter(p => p.featured);
  const regularProjects = filtered.filter(p => !p.featured);

  const handleSave = async (data: FormData) => {
    setSaving(true); setSaveError("");
    try {
      const isEdit = !!editTarget;
      const url = isEdit ? `${BACKEND_URL}/api/proyectos/${editTarget!.id}` : `${BACKEND_URL}/api/proyectos/`;
      const res = await adminFetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(toBackendPayload(data, editTarget)) });
      if (!res.ok) throw new Error("Save error");
      await fetchProyectos(); setShowForm(false); setEditTarget(null); addToast("success", "Synchronized");
    } catch (err: any) { setSaveError(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return; setDeleting(true);
    try {
      await adminFetch(`${BACKEND_URL}/api/proyectos/${confirmDelete.id}`, { method: "DELETE" });
      setProyectos(v => v.filter(p => p.id !== confirmDelete.id)); addToast("success", "Purged"); setConfirmDelete(null);
    } catch { addToast("error", "Failed"); } finally { setDeleting(false); }
  };

  const handleToggleActive = async (p: Proyecto) => {
    try {
      const nextActive = !p.active;
      const res = await adminFetch(`${BACKEND_URL}/api/proyectos/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextActive ? "En Produccion" : "Inactivo", results: JSON.stringify({ ...toProjectMetaPayload(p), active: nextActive }) }) });
      if (res.ok) fetchProyectos();
    } catch { addToast("error", "Error"); }
  };

  const handleToggleFeatured = async (p: Proyecto) => {
    try {
      const nextFeatured = !p.featured;
      const res = await adminFetch(`${BACKEND_URL}/api/proyectos/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ results: JSON.stringify({ ...toProjectMetaPayload(p), featured: nextFeatured }) }) });
      if (res.ok) fetchProyectos();
    } catch { addToast("error", "Error"); }
  };

  return (
    <div className="text-slate-300 font-sans space-y-8">
      <ToastContainer toasts={toasts} onDismiss={id => setToasts(v => v.filter(t => t.id !== id))} />
      <AnimatePresence>
        {confirmDelete && <ConfirmDialog isOpen title="Eliminar Proyecto" message={`¿Confirmar eliminación de "${confirmDelete.title}"?`} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} loading={deleting} />}
        {showForm && <ProyectoForm initial={editTarget} defaultFeatured={createAsFeatured} onSave={handleSave} onClose={() => { setShowForm(false); setEditTarget(null); }} saving={saving} error={saveError} />}
      </AnimatePresence>

      {/* ── Filtros y búsqueda (compartido) ── */}
      <div className="flex flex-col xl:flex-row gap-4 p-5 bg-slate-900/40 rounded-2xl border border-white/10">
        <div className="relative flex-1"><FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700" /><input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar proyectos..." className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm outline-none focus:border-blue-500/30 transition-colors" /></div>
        <div className="flex gap-3 min-w-max">
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-slate-500 outline-none"><option value="all">Categoría: Todas</option>{CATEGORIES.map(c => <option key={c.key} value={c.key}>Categoría: {c.label}</option>)}</select>
          <select value={filterActive} onChange={e => setFilterActive(e.target.value as any)} className="bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-slate-500 outline-none"><option value="all">Estado: Todos</option><option value="active">Estado: Activos</option><option value="inactive">Estado: Inactivos</option></select>
          <button onClick={fetchProyectos} className="p-4 bg-white/5 border border-white/10 text-slate-500 rounded-2xl hover:text-white hover:bg-white/10 transition-all" title="Actualizar"><FaRedo className={loading ? "animate-spin" : ""} /></button>
        </div>
      </div>

      {/* ═══════ BLOQUE 1: PROYECTOS DESTACADOS ═══════ */}
      <div className="bg-slate-900/40 border border-amber-500/15 rounded-2xl overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-white/10 bg-amber-500/[0.03]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center"><FaStar className="text-amber-500 text-lg" /></div>
            <div>
              <h2 className="text-lg font-black text-white">Proyectos Destacados</h2>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{featuredProjects.length} proyectos • Sección principal</p>
            </div>
          </div>
          <button onClick={() => { setEditTarget(null); setCreateAsFeatured(true); setShowForm(true); }} className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-black text-sm shadow-lg shadow-amber-500/20 hover:opacity-90 transition-all flex items-center gap-2">
            <FaPlus /> Crear Proyecto Destacado
          </button>
        </div>
        <div className="p-6">
          {loading ? <div className="py-12 text-center text-slate-700 animate-pulse font-bold text-xs uppercase tracking-widest">Cargando...</div> : featuredProjects.length === 0 ? <div className="py-12 text-center border-2 border-dashed border-amber-500/10 rounded-2xl text-slate-700 font-bold italic text-sm">No hay proyectos destacados aún. Crea tu primer proyecto destacado.</div> : <div className="grid grid-cols-1 gap-3">{featuredProjects.map(p => <ProyectoRow key={p.id} proyecto={p} onEdit={() => { setEditTarget(p); setCreateAsFeatured(true); setShowForm(true); }} onDelete={() => setConfirmDelete(p)} onToggleActive={() => handleToggleActive(p)} onToggleFeatured={() => handleToggleFeatured(p)} />)}</div>}
        </div>
      </div>

      {/* ═══════ BLOQUE 2: CATÁLOGO GENERAL ═══════ */}
      <div className="bg-slate-900/40 border border-blue-500/15 rounded-2xl overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-white/10 bg-blue-500/[0.03]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center"><FaGlobe className="text-blue-500 text-lg" /></div>
            <div>
              <h2 className="text-lg font-black text-white">Catálogo General</h2>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{regularProjects.length} proyectos • Portafolio completo</p>
            </div>
          </div>
          <button onClick={() => { setEditTarget(null); setCreateAsFeatured(false); setShowForm(true); }} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-black text-sm shadow-lg shadow-blue-500/20 hover:opacity-90 transition-all flex items-center gap-2">
            <FaPlus /> Crear Proyecto
          </button>
        </div>
        <div className="p-6">
          {loading ? <div className="py-12 text-center text-slate-700 animate-pulse font-bold text-xs uppercase tracking-widest">Cargando...</div> : regularProjects.length === 0 ? <div className="py-12 text-center border-2 border-dashed border-blue-500/10 rounded-2xl text-slate-700 font-bold italic text-sm">No se encontraron proyectos. Crea tu primer proyecto.</div> : <div className="grid grid-cols-1 gap-3">{regularProjects.map(p => <ProyectoRow key={p.id} proyecto={p} onEdit={() => { setEditTarget(p); setCreateAsFeatured(false); setShowForm(true); }} onDelete={() => setConfirmDelete(p)} onToggleActive={() => handleToggleActive(p)} onToggleFeatured={() => handleToggleFeatured(p)} />)}</div>}
        </div>
      </div>

      <div className="mt-20 pt-10 border-t border-white/5 pb-20">
        <div className="flex items-center gap-4 justify-between mb-8">
          <div><h2 className="text-2xl font-black text-white">Stack Tecnológico</h2><p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Tecnologías utilizadas en los proyectos</p></div>
          <div className="h-1 flex-1 mx-10 bg-slate-900 rounded-full overflow-hidden opacity-30"><div className="h-full bg-blue-500 w-1/3 animate-pulse" /></div>
        </div>
        <div className="bg-slate-900/20 border border-white/5 p-8 rounded-3xl"><AboutStackAdmin /></div>
      </div>
    </div>
  );
}
