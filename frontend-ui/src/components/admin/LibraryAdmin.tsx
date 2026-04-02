"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FaImages, FaVideo, FaFileImage, FaTrash, FaShare, FaDownload,
  FaSearch, FaTimes, FaExpand, FaSync, FaFilter, FaCheckSquare,
  FaSquare, FaGripHorizontal, FaList, FaCopy, FaCheck, FaFilm, FaDatabase
} from "react-icons/fa";
import { adminFetch } from "@/lib/adminFetch";

// ─── Types ────────────────────────────────────────────────────────────────────
type MediaType = "image" | "video" | "gif" | "raw";
type ViewMode = "grid" | "list";
type TabType = "all" | "image" | "video" | "gif";

interface MediaItem {
  public_id: string;
  url: string;
  thumbnail_url?: string;
  resource_type: string;
  format: string;
  width?: number;
  height?: number;
  bytes?: number;
  created_at?: string;
  folder?: string;
}

const TAB_CONFIG: Record<TabType, { label: string; icon: React.ReactNode; color: string }> = {
  all:   { label: "Todo",     icon: <FaImages size={14}/>,    color: "#818cf8" },
  image: { label: "Fotos",   icon: <FaFileImage size={14}/>, color: "#4ade80" },
  video: { label: "Videos",  icon: <FaVideo size={14}/>,     color: "#f97316" },
  gif:   { label: "GIFs",    icon: <FaFilm size={14}/>,      color: "#a78bfa" },
};

function formatBytes(bytes?: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

function formatDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

function getMediaType(item: MediaItem): MediaType {
  if (item.format === "gif") return "gif";
  if (item.resource_type === "video") return "video";
  return "image";
}

// ─── Media Card ───────────────────────────────────────────────────────────────
function MediaCard({
  item, selected, onSelect, onDelete, onPreview, viewMode
}: {
  item: MediaItem;
  selected: boolean;
  onSelect: (id: string) => void;
  onDelete: (item: MediaItem) => void;
  onPreview: (item: MediaItem) => void;
  viewMode: ViewMode;
}) {
  const [copied, setCopied] = useState(false);
  const type = getMediaType(item);
  const name = item.public_id.split("/").pop() || item.public_id;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(item.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (viewMode === "list") {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 14, padding: "10px 14px",
        background: selected ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${selected ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 10, cursor: "pointer", transition: "all 0.15s"
      }} onClick={() => onPreview(item)}>
        <button onClick={e => { e.stopPropagation(); onSelect(item.public_id); }}
          style={{ background: "none", border: "none", color: selected ? "#818cf8" : "#475569", cursor: "pointer", flexShrink: 0 }}>
          {selected ? <FaCheckSquare size={16} /> : <FaSquare size={16} />}
        </button>
        <div style={{ width: 48, height: 36, borderRadius: 6, overflow: "hidden", flexShrink: 0, background: "#0f172a" }}>
          {type === "video" ? (
            <video src={item.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
          ) : (
            <img src={item.thumbnail_url || item.url.replace(/\.pdf$/i, ".jpg")} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.currentTarget.src = item.url.replace(/\.pdf$/i, ".png"); }} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</p>
          <p style={{ color: "#475569", fontSize: 11, margin: 0 }}>{item.format?.toUpperCase()} · {formatBytes(item.bytes)} · {formatDate(item.created_at)}</p>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button onClick={handleCopy} style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 6, color: copied ? "#4ade80" : "#64748b", padding: "6px 8px", cursor: "pointer" }}>
            {copied ? <FaCheck size={11} /> : <FaCopy size={11} />}
          </button>
          <a href={item.url} download target="_blank" onClick={e => e.stopPropagation()}
            style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 6, color: "#64748b", padding: "6px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <FaDownload size={11} />
          </a>
          <button onClick={e => { e.stopPropagation(); onDelete(item); }}
            style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 6, color: "#ef4444", padding: "6px 8px", cursor: "pointer" }}>
            <FaTrash size={11} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onPreview(item)}
      style={{
        background: selected ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${selected ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 12, overflow: "hidden", cursor: "pointer",
        transition: "all 0.2s", position: "relative"
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: "relative", paddingBottom: "62.5%", background: "#0f172a", overflow: "hidden" }}>
        {type === "video" ? (
          <video src={item.url} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} muted />
        ) : (
          <img src={item.thumbnail_url || item.url.replace(/\.pdf$/i, ".jpg")} alt={name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.currentTarget.src = item.url.replace(/\.pdf$/i, ".png"); }} />
        )}
        {/* Type Badge */}
        <span style={{
          position: "absolute", top: 8, left: 8,
          background: type === "video" ? "rgba(249,115,22,0.9)" : type === "gif" ? "rgba(167,139,250,0.9)" : "rgba(74,222,128,0.9)",
          color: "#fff", fontSize: 9, fontWeight: 800, padding: "3px 7px", borderRadius: 5, letterSpacing: "0.08em"
        }}>
          {type.toUpperCase()}
        </span>
        {/* Select */}
        <button
          onClick={e => { e.stopPropagation(); onSelect(item.public_id); }}
          style={{
            position: "absolute", top: 8, right: 8,
            background: selected ? "#6366f1" : "rgba(0,0,0,0.6)",
            border: "none", borderRadius: 6, color: "#fff", padding: "4px 5px", cursor: "pointer"
          }}
        >
          {selected ? <FaCheckSquare size={13} /> : <FaSquare size={13} />}
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: "10px 12px" }}>
        <p style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600, margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</p>
        <p style={{ color: "#475569", fontSize: 10, margin: 0 }}>
          {formatBytes(item.bytes)}{item.width ? ` · ${item.width}×${item.height}` : ""} · {formatDate(item.created_at)}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 6, padding: "0 12px 12px" }}>
        <button onClick={e => { e.stopPropagation(); onPreview(item); }}
          style={{ flex: 1, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 6, color: "#818cf8", fontSize: 10, fontWeight: 700, padding: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <FaExpand size={9} /> Ver
        </button>
        <button onClick={handleCopy}
          style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, color: copied ? "#4ade80" : "#64748b", fontSize: 10, fontWeight: 700, padding: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          {copied ? <FaCheck size={9} /> : <FaCopy size={9} />} {copied ? "¡Copiado!" : "URL"}
        </button>
        <button onClick={e => { e.stopPropagation(); onDelete(item); }}
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, color: "#ef4444", padding: "6px 8px", cursor: "pointer" }}>
          <FaTrash size={10} />
        </button>
      </div>
    </div>
  );
}

// ─── Preview Modal ────────────────────────────────────────────────────────────
function PreviewModal({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const type = getMediaType(item);
  const name = item.public_id.split("/").pop() || item.public_id;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(item.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20
    }} onClick={onClose}>
      <div style={{ maxWidth: 900, width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", gap: 16 }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 15, margin: 0 }}>{name}</p>
            <p style={{ color: "#475569", fontSize: 12, margin: 0 }}>{item.format?.toUpperCase()} · {formatBytes(item.bytes)}{item.width ? ` · ${item.width}×${item.height}px` : ""}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleCopy} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, color: copied ? "#4ade80" : "#94a3b8", padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
              {copied ? <FaCheck /> : <FaCopy />} {copied ? "Copiado" : "Copiar URL"}
            </button>
            <a href={item.url} download target="_blank"
              style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, color: "#94a3b8", padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12, textDecoration: "none" }}>
              <FaDownload /> Descargar
            </a>
            <button onClick={onClose} style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 8, color: "#ef4444", padding: "8px 14px", cursor: "pointer" }}>
              <FaTimes />
            </button>
          </div>
        </div>
        {/* Media */}
        <div style={{ background: "#0a0f1e", borderRadius: 12, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", maxHeight: "70vh" }}>
          {type === "video" ? (
            <video src={item.url} controls autoPlay style={{ maxWidth: "100%", maxHeight: "70vh" }} />
          ) : (
            <img src={item.thumbnail_url || item.url.replace(/\.pdf$/i, ".jpg")} alt={name} style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }} onError={(e) => { e.currentTarget.src = item.url.replace(/\.pdf$/i, ".png"); }} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Library Admin ───────────────────────────────────────────────────────
export default function LibraryAdmin() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadLibrary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/upload/library?limit=200&include_raw=false");
      if (!res.ok) throw new Error("Error cargando biblioteca");
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError("No se pudo cargar la biblioteca. Verifica la configuración de Cloudinary.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadLibrary(); }, [loadLibrary]);

  const handleToggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    const visible = filtered.map(i => i.public_id);
    if (visible.every(id => selected.has(id))) {
      setSelected(prev => { const n = new Set(prev); visible.forEach(id => n.delete(id)); return n; });
    } else {
      setSelected(prev => new Set([...prev, ...visible]));
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`¿Eliminar "${item.public_id.split("/").pop()}"?`)) return;
    setDeleting(true);
    try {
      const type = getMediaType(item);
      const res = await adminFetch(`/api/upload/delete?url=${encodeURIComponent(item.url)}&resource_type=${type === "video" ? "video" : "image"}`, { method: "DELETE" });
      if (res.ok) {
        setItems(prev => prev.filter(i => i.public_id !== item.public_id));
        setSelected(prev => { const n = new Set(prev); n.delete(item.public_id); return n; });
      }
    } catch { /* ignore */ }
    setDeleting(false);
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`¿Eliminar ${selected.size} archivo(s) seleccionado(s)?`)) return;
    setDeleting(true);
    for (const id of selected) {
      const item = items.find(i => i.public_id === id);
      if (!item) continue;
      const type = getMediaType(item);
      await adminFetch(`/api/upload/delete?url=${encodeURIComponent(item.url)}&resource_type=${type === "video" ? "video" : "image"}`, { method: "DELETE" });
    }
    setItems(prev => prev.filter(i => !selected.has(i.public_id)));
    setSelected(new Set());
    setDeleting(false);
  };

  const filtered = items.filter(item => {
    const type = getMediaType(item);
    const name = item.public_id.toLowerCase();
    const matchesTab = activeTab === "all" || type === activeTab;
    const matchesSearch = !search || name.includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Stats
  const stats = {
    total: items.length,
    images: items.filter(i => getMediaType(i) === "image").length,
    videos: items.filter(i => getMediaType(i) === "video").length,
    gifs: items.filter(i => getMediaType(i) === "gif").length,
    totalSize: items.reduce((acc, i) => acc + (i.bytes || 0), 0),
  };

  return (
    <div style={{ padding: "24px 28px", minHeight: "100vh", color: "#e2e8f0" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ background: "linear-gradient(135deg,#10b981,#059669)", borderRadius: 12, padding: "10px 12px" }}>
            <FaImages size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#e2e8f0", margin: 0 }}>Biblioteca</h1>
            <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>Media de Cloudinary · {stats.total} archivos · {formatBytes(stats.totalSize)}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {selected.size > 0 && (
            <button onClick={handleDeleteSelected} disabled={deleting}
              style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, color: "#ef4444", padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <FaTrash size={12} /> Eliminar ({selected.size})
            </button>
          )}
          <button onClick={loadLibrary} disabled={loading}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#94a3b8", padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <FaSync size={12} className={loading ? "spin" : ""} /> Recargar
          </button>
          <button onClick={() => setViewMode(v => v === "grid" ? "list" : "grid")}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#94a3b8", padding: "8px 10px", cursor: "pointer" }}>
            {viewMode === "grid" ? <FaList size={14} /> : <FaGripHorizontal size={14} />}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Archivos", value: stats.total, color: "#6366f1", bg: "rgba(99,102,241,0.15)", border: "rgba(99,102,241,0.3)", icon: <FaImages size={16} /> },
          { label: "Fotos", value: stats.images, color: "#4ade80", bg: "rgba(74,222,128,0.15)", border: "rgba(74,222,128,0.3)", icon: <FaFileImage size={16} /> },
          { label: "Videos", value: stats.videos, color: "#f97316", bg: "rgba(249,115,22,0.15)", border: "rgba(249,115,22,0.3)", icon: <FaVideo size={16} /> },
          { label: "GIFs", value: stats.gifs, color: "#a78bfa", bg: "rgba(167,139,250,0.15)", border: "rgba(167,139,250,0.3)", icon: <FaFilm size={16} /> },
          { label: "Almacenamiento Total", value: formatBytes(stats.totalSize), color: "#818cf8", bg: "rgba(129,140,248,0.15)", border: "rgba(129,140,248,0.3)", icon: <FaDatabase size={16} /> },
        ].map(s => (
          <div key={s.label} style={{ 
            background: "linear-gradient(145deg, rgba(30,41,59,0.3), rgba(15,23,42,0.5))", 
            border: `1px solid rgba(255,255,255,0.05)`, 
            borderLeft: `3px solid ${s.color}`,
            borderRadius: 14, 
            padding: "16px",
            display: "flex", alignItems: "center", gap: 14,
            boxShadow: `0 4px 20px -8px ${s.bg}`,
          }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: s.bg, border: `1px solid ${s.border}`, color: s.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {s.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: s.color, fontSize: 22, fontWeight: 900, margin: 0, lineHeight: 1 }}>{s.value}</p>
              <p style={{ color: "#cbd5e1", fontSize: 11, margin: 0, fontWeight: 600, marginTop: 4, letterSpacing: "0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.label.toUpperCase()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 6 }}>
          {(Object.entries(TAB_CONFIG) as [TabType, typeof TAB_CONFIG[TabType]][]).map(([key, cfg]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              style={{
                background: activeTab === key ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${activeTab === key ? "#6366f1" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 8, color: activeTab === key ? cfg.color : "#64748b",
                padding: "7px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600
              }}>
              {cfg.icon} {cfg.label}
              <span style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, padding: "1px 6px", fontSize: 10 }}>
                {items.filter(i => key === "all" || getMediaType(i) === key).length}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "7px 12px", gap: 8 }}>
          <FaSearch size={13} style={{ color: "#475569", flexShrink: 0 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre..."
            style={{ background: "none", border: "none", color: "#e2e8f0", flex: 1, fontSize: 13, outline: "none" }} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer" }}><FaTimes size={11} /></button>}
        </div>

        {/* Select All */}
        <button onClick={handleSelectAll}
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#64748b", padding: "7px 12px", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <FaFilter size={11} /> Seleccionar Página ({filtered.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 16 }}>
          <div style={{ width: 48, height: 48, border: "3px solid rgba(99,102,241,0.3)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <p style={{ color: "#475569" }}>Cargando biblioteca de Cloudinary...</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#ef4444" }}>
          <FaImages size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 14 }}>{error}</p>
          <button onClick={loadLibrary} style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, color: "#818cf8", padding: "8px 16px", cursor: "pointer", marginTop: 12 }}>
            Reintentar
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#334155" }}>
          <FaImages size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>No hay archivos en esta categoría</p>
        </div>
      ) : viewMode === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16 }}>
          {filtered.map(item => (
            <MediaCard key={item.public_id} item={item} selected={selected.has(item.public_id)}
              onSelect={handleToggleSelect} onDelete={handleDelete} onPreview={setPreviewItem} viewMode="grid" />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(item => (
            <MediaCard key={item.public_id} item={item} selected={selected.has(item.public_id)}
              onSelect={handleToggleSelect} onDelete={handleDelete} onPreview={setPreviewItem} viewMode="list" />
          ))}
        </div>
      )}

      {previewItem && <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
