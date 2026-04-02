"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FaFileAlt, FaFilePdf, FaFileInvoice, FaCertificate, FaReceipt,
  FaSearch, FaTimes, FaDownload, FaEye, FaPrint, FaFilter,
  FaChevronDown, FaChevronUp, FaExternalLinkAlt, FaSort,
  FaFileContract, FaBuilding, FaUser, FaCalendarAlt, FaDollarSign,
  FaClock, FaCheckCircle
} from "react-icons/fa";
import { adminFetch } from "@/lib/adminFetch";

// ─── Types ─────────────────────────────────────────────────────────────────────
type DocCategory = "cotizaciones" | "propuestas" | "asesoria" | "certificados" | "recibos" | "contratos";

interface Document {
  id: string | number;
  category: DocCategory;
  title: string;
  subtitle?: string;
  client?: string;
  date?: string;
  amount?: string | number;
  currency?: string;
  status?: string;
  folio?: string;
  url?: string;
  rawData?: Record<string, unknown>;
}

const CAT_CONFIG: Record<DocCategory, { label: string; icon: React.ReactNode; color: string; border: string; bg: string }> = {
  cotizaciones: { label: "Cotizaciones Web",  icon: <FaFileInvoice size={14}/>,  color: "#818cf8", border: "#6366f1", bg: "rgba(99,102,241,0.12)"  },
  propuestas:   { label: "Propuestas Elite",  icon: <FaFileContract size={14}/>, color: "#4ade80", border: "#22c55e", bg: "rgba(34,197,94,0.12)"   },
  asesoria:     { label: "Asesorías",          icon: <FaCalendarAlt size={14}/>,  color: "#f97316", border: "#ea580c", bg: "rgba(249,115,22,0.12)"  },
  certificados: { label: "Certificados",       icon: <FaCertificate size={14}/>,  color: "#fbbf24", border: "#d97706", bg: "rgba(251,191,36,0.12)"  },
  recibos:      { label: "Recibos / Boletas",  icon: <FaReceipt size={14}/>,      color: "#34d399", border: "#059669", bg: "rgba(52,211,153,0.12)"  },
  contratos:    { label: "Contratos",          icon: <FaBuilding size={14}/>,     color: "#e879f9", border: "#a21caf", bg: "rgba(232,121,249,0.12)" },
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Approved:  { bg: "rgba(34,197,94,0.15)",  color: "#4ade80" },
  Pending:   { bg: "rgba(251,191,36,0.15)", color: "#fbbf24" },
  Rejected:  { bg: "rgba(239,68,68,0.15)",  color: "#ef4444" },
  Draft:     { bg: "rgba(100,116,139,0.15)",color: "#94a3b8" },
  Sent:      { bg: "rgba(99,102,241,0.15)", color: "#818cf8" },
  Paid:      { bg: "rgba(16,185,129,0.15)", color: "#34d399" },
  confirmed: { bg: "rgba(34,197,94,0.15)",  color: "#4ade80" },
  pending:   { bg: "rgba(251,191,36,0.15)", color: "#fbbf24" },
  cancelled: { bg: "rgba(239,68,68,0.15)",  color: "#ef4444" },
};

function formatDate(s?: string | number) {
  if (!s) return "—";
  try {
    return new Date(String(s)).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return String(s); }
}

function formatAmount(amount?: string | number, currency?: string) {
  if (!amount) return null;
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return String(amount);
  const formatted = num.toLocaleString("es-CL", { minimumFractionDigits: 0 });
  return `${currency || "USD"} ${formatted}`;
}

// ─── Document Row ─────────────────────────────────────────────────────────────
function DocumentRow({ doc }: { doc: Document }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = CAT_CONFIG[doc.category];
  const statusStyle = STATUS_COLORS[doc.status || ""] || { bg: "rgba(100,116,139,0.12)", color: "#94a3b8" };

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 12, overflow: "hidden", transition: "all 0.2s",
    }}>
      {/* Main Row */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", cursor: "pointer" }}
        onClick={() => setExpanded(e => !e)}
      >
        {/* Category Icon */}
        <div style={{
          width: 40, height: 40, borderRadius: 10, background: cfg.bg,
          border: `1px solid ${cfg.border}30`, display: "flex", alignItems: "center", justifyContent: "center",
          color: cfg.color, flexShrink: 0
        }}>
          {cfg.icon}
        </div>

        {/* Title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <p style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 700, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {doc.title}
            </p>
            {doc.folio && (
              <span style={{ color: "#475569", fontSize: 10, background: "rgba(255,255,255,0.05)", padding: "2px 7px", borderRadius: 4, flexShrink: 0 }}>
                {doc.folio}
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 3, flexWrap: "wrap" }}>
            {doc.client && (
              <span style={{ color: "#64748b", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
                <FaUser size={9} /> {doc.client}
              </span>
            )}
            {doc.date && (
              <span style={{ color: "#64748b", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
                <FaCalendarAlt size={9} /> {formatDate(doc.date)}
              </span>
            )}
          </div>
        </div>

        {/* Amount */}
        {doc.amount && (
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{ color: "#4ade80", fontSize: 14, fontWeight: 800, margin: 0 }}>
              {formatAmount(doc.amount, doc.currency)}
            </p>
            <p style={{ color: "#475569", fontSize: 10, margin: 0 }}>Monto</p>
          </div>
        )}

        {/* Status */}
        {doc.status && (
          <span style={{
            background: statusStyle.bg, color: statusStyle.color,
            fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 6,
            flexShrink: 0, textTransform: "capitalize"
          }}>
            {doc.status}
          </span>
        )}

        {/* Category Badge */}
        <span style={{
          background: cfg.bg, border: `1px solid ${cfg.border}40`,
          color: cfg.color, fontSize: 9, fontWeight: 700, padding: "3px 8px",
          borderRadius: 5, flexShrink: 0, letterSpacing: "0.06em"
        }}>
          {cfg.label}
        </span>

        {/* Actions */}
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          {doc.url && (
            <a href={doc.url} target="_blank" onClick={e => e.stopPropagation()}
              style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 6, color: "#818cf8", padding: "6px 8px", display: "flex", alignItems: "center" }}>
              <FaExternalLinkAlt size={10} />
            </a>
          )}
          <button onClick={e => { e.stopPropagation(); window.print(); }}
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, color: "#64748b", padding: "6px 8px", cursor: "pointer" }}>
            <FaPrint size={10} />
          </button>
        </div>

        {/* Expand */}
        <div style={{ color: "#334155", flexShrink: 0 }}>
          {expanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && doc.rawData && (
        <div style={{
          padding: "0 16px 16px", borderTop: "1px solid rgba(255,255,255,0.05)",
          paddingTop: 14
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 10 }}>
            {Object.entries(doc.rawData).filter(([, v]) => v != null && v !== "" && typeof v !== "object").map(([k, v]) => (
              <div key={k} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: "8px 12px" }}>
                <p style={{ color: "#475569", fontSize: 10, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{k.replace(/_/g, " ")}</p>
                <p style={{ color: "#94a3b8", fontSize: 12, margin: 0, wordBreak: "break-word" }}>{String(v)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
function DocSection({ category, docs, collapsed, onToggle }: {
  category: DocCategory;
  docs: Document[];
  collapsed: boolean;
  onToggle: () => void;
}) {
  const cfg = CAT_CONFIG[category];
  if (docs.length === 0) return null;

  return (
    <div style={{ marginBottom: 20 }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12,
          background: cfg.bg, border: `1px solid ${cfg.border}40`,
          borderRadius: 12, padding: "13px 18px", cursor: "pointer", marginBottom: 10
        }}
      >
        <span style={{ color: cfg.color }}>{cfg.icon}</span>
        <span style={{ color: cfg.color, fontWeight: 800, fontSize: 14, flex: 1, textAlign: "left" }}>{cfg.label}</span>
        <span style={{ background: "rgba(255,255,255,0.1)", color: cfg.color, fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 6 }}>
          {docs.length}
        </span>
        <span style={{ color: cfg.color, opacity: 0.6 }}>
          {collapsed ? <FaChevronDown size={12} /> : <FaChevronUp size={12} />}
        </span>
      </button>
      {!collapsed && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {docs.map(d => <DocumentRow key={d.id} doc={d} />)}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DocumentsAdmin() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<DocCategory | "all">("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [collapsed, setCollapsed] = useState<Record<DocCategory, boolean>>({
    cotizaciones: false, propuestas: false, asesoria: true, certificados: true, recibos: true, contratos: true
  });

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const [quotesRes, proposalsRes, bookingsRes, certsRes] = await Promise.all([
        adminFetch("/api/enviar-cotizacion/admin/list"),
        adminFetch("/api/proposals/"),
        adminFetch("/api/admin/bookings"),
        adminFetch("/api/certifications"),
      ]);

      const all: Document[] = [];

      // Cotizaciones Web
      if (quotesRes.ok) {
        const quotes = await quotesRes.json();
        const arr = Array.isArray(quotes) ? quotes : (quotes.quotes || quotes.items || []);
        arr.forEach((q: Record<string, unknown>) => {
          all.push({
            id: `qt_${q.id}`,
            category: "cotizaciones",
            title: `Cotización: ${q.nombre || q.name || "Sin nombre"}`,
            subtitle: String(q.servicio || q.service || ""),
            client: String(q.nombre || q.name || ""),
            date: String(q.created_at || q.fecha || ""),
            amount: q.presupuesto ? String(q.presupuesto) : undefined,
            currency: "CLP",
            status: String(q.status || "pending"),
            folio: q.id ? `QT-${String(q.id).padStart(4, "0")}` : undefined,
            rawData: q as Record<string, unknown>,
          });
        });
      }

      // Propuestas Elite
      if (proposalsRes.ok) {
        const proposals = await proposalsRes.json();
        const arr = Array.isArray(proposals) ? proposals : (proposals.proposals || proposals.items || []);
        arr.forEach((p: Record<string, unknown>) => {
          all.push({
            id: `ep_${p.id}`,
            category: "propuestas",
            title: `Propuesta Elite: ${p.client_name || p.nombre || "Sin nombre"}`,
            subtitle: String(p.project_name || p.project_objective || ""),
            client: String(p.client_name || p.client_email || ""),
            date: String(p.created_at || ""),
            amount: (p.final_total ?? p.total_amount) as string | number | undefined,
            currency: String(p.currency || "USD"),
            status: String(p.status || "Draft"),
            folio: String(p.quote_number || ""),
            url: p.pdf_url ? String(p.pdf_url) : undefined,
            rawData: p as Record<string, unknown>,
          });
        });
      }

      // Asesorías
      if (bookingsRes.ok) {
        const bookings = await bookingsRes.json();
        const arr = Array.isArray(bookings) ? bookings : (bookings.bookings || bookings.items || []);
        arr.forEach((b: Record<string, unknown>) => {
          all.push({
            id: `ad_${b.id}`,
            category: "asesoria",
            title: `Asesoría: ${b.service_name || b.servicio || "Asesoría"}`,
            subtitle: String(b.booking_code || ""),
            client: String(b.customer_name || b.nombre || ""),
            date: String(b.date || b.created_at || ""),
            status: String(b.status || "pending"),
            folio: b.booking_code ? String(b.booking_code) : undefined,
            rawData: b as Record<string, unknown>,
          });
        });
      }

      // Certificados
      if (certsRes.ok) {
        const certs = await certsRes.json();
        const arr = Array.isArray(certs) ? certs : (certs.items || []);
        arr.forEach((c: Record<string, unknown>) => {
          all.push({
            id: `cert_${c.id}`,
            category: "certificados",
            title: `Certificado: ${c.title || c.nombre || "Sin título"}`,
            subtitle: String(c.issuer || c.institucion || ""),
            date: String(c.date || c.issue_date || ""),
            status: "Approved",
            url: c.credential_url ? String(c.credential_url) : undefined,
            rawData: c as Record<string, unknown>,
          });
        });
      }

      setDocs(all);
    } catch (err) {
      console.error("Error cargando documentos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  const toggleCollapsed = (cat: DocCategory) => {
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const filtered = docs.filter(d => {
    const matchesCat = filterCat === "all" || d.category === filterCat;
    const matchesStatus = filterStatus === "all" || d.status === filterStatus;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      d.title.toLowerCase().includes(q) ||
      (d.client || "").toLowerCase().includes(q) ||
      (d.folio || "").toLowerCase().includes(q);
    return matchesCat && matchesStatus && matchesSearch;
  });

  const grouped = Object.keys(CAT_CONFIG).reduce((acc, cat) => {
    acc[cat as DocCategory] = filtered.filter(d => d.category === cat);
    return acc;
  }, {} as Record<DocCategory, Document[]>);

  const total = docs.length;
  const pending = docs.filter(d => d.status === "pending" || d.status === "Pending").length;
  const approved = docs.filter(d => d.status === "Approved" || d.status === "confirmed").length;

  const allStatuses = [...new Set(docs.map(d => d.status).filter(Boolean))] as string[];

  return (
    <div style={{ padding: "24px 28px", minHeight: "100vh", color: "#e2e8f0" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", borderRadius: 12, padding: "10px 12px" }}>
            <FaFileAlt size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#e2e8f0", margin: 0 }}>Documentos</h1>
            <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>Cotizaciones · Propuestas · Asesorías · Certificados</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setCollapsed(prev => Object.fromEntries(Object.keys(CAT_CONFIG).map(k => [k, false])) as Record<DocCategory, boolean>)}
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#64748b", padding: "8px 12px", cursor: "pointer", fontSize: 12 }}>
            Expandir todo
          </button>
          <button onClick={() => setCollapsed(prev => Object.fromEntries(Object.keys(CAT_CONFIG).map(k => [k, true])) as Record<DocCategory, boolean>)}
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#64748b", padding: "8px 12px", cursor: "pointer", fontSize: 12 }}>
            Colapsar todo
          </button>
        </div>
      </div>

      {/* Stats (Modern KPIs) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total", value: total, color: "#818cf8", bg: "rgba(129,140,248,0.15)", border: "rgba(129,140,248,0.3)", icon: <FaFileAlt size={18} /> },
          { label: "Pendientes", value: pending, color: "#fbbf24", bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.3)", icon: <FaClock size={16} /> },
          { label: "Aprobados", value: approved, color: "#4ade80", bg: "rgba(74,222,128,0.15)", border: "rgba(74,222,128,0.3)", icon: <FaCheckCircle size={16} /> },
          { label: "Cotizaciones", value: docs.filter(d => d.category === "cotizaciones").length, color: "#6366f1", bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.25)", icon: <FaFileInvoice size={15} /> },
          { label: "Propuestas", value: docs.filter(d => d.category === "propuestas").length, color: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.25)", icon: <FaFileContract size={15} /> },
          { label: "Asesorías", value: docs.filter(d => d.category === "asesoria").length, color: "#f97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.25)", icon: <FaCalendarAlt size={15} /> },
          { label: "Certificados", value: docs.filter(d => d.category === "certificados").length, color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", icon: <FaCertificate size={15} /> },
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
            <div>
              <p style={{ color: s.color, fontSize: 22, fontWeight: 900, margin: 0, lineHeight: 1 }}>{s.value}</p>
              <p style={{ color: "#cbd5e1", fontSize: 11, margin: 0, fontWeight: 600, marginTop: 4, letterSpacing: "0.02em" }}>{s.label.toUpperCase()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 12px", gap: 8, minWidth: 240, flex: 1 }}>
          <FaSearch size={13} style={{ color: "#475569", flexShrink: 0 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por cliente, folio, título..."
            style={{ background: "none", border: "none", color: "#e2e8f0", flex: 1, fontSize: 13, outline: "none" }} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer" }}><FaTimes size={11} /></button>}
        </div>

        {/* Category Filter */}
        <select value={filterCat} onChange={e => setFilterCat(e.target.value as DocCategory | "all")}
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#94a3b8", padding: "8px 12px", fontSize: 13, cursor: "pointer", outline: "none" }}>
          <option value="all" style={{ background: "#1e293b" }}>Todas las categorías</option>
          {(Object.entries(CAT_CONFIG) as [DocCategory, typeof CAT_CONFIG[DocCategory]][]).map(([k, v]) => (
            <option key={k} value={k} style={{ background: "#1e293b" }}>{v.label}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#94a3b8", padding: "8px 12px", fontSize: 13, cursor: "pointer", outline: "none" }}>
          <option value="all" style={{ background: "#1e293b" }}>Todos los estados</option>
          {allStatuses.map(s => (
            <option key={s} value={String(s)} style={{ background: "#1e293b" }}>{String(s)}</option>
          ))}
        </select>

        <span style={{ color: "#334155", fontSize: 12 }}>{filtered.length} documentos</span>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 16 }}>
          <div style={{ width: 48, height: 48, border: "3px solid rgba(245,158,11,0.3)", borderTopColor: "#f59e0b", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <p style={{ color: "#475569" }}>Cargando documentos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#334155" }}>
          <FaFileAlt size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>{search ? "No se encontraron documentos con esa búsqueda" : "No hay documentos en esta categoría"}</p>
        </div>
      ) : (
        (Object.keys(CAT_CONFIG) as DocCategory[]).map(cat => (
          <DocSection
            key={cat}
            category={cat}
            docs={grouped[cat]}
            collapsed={collapsed[cat]}
            onToggle={() => toggleCollapsed(cat)}
          />
        ))
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
