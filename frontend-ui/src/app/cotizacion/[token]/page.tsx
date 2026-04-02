"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { FaCheckCircle, FaTimesCircle, FaFileSignature, FaShieldAlt, FaPrint, FaRegClock, FaGlobe } from "react-icons/fa";

interface QuoteItem {
  id?: number | string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  service_type?: string;
  category?: string;
  includes?: string[];
  deliverables?: string[];
  timeline?: string;
  ideal_for?: string;
  delivery?: string;
  result?: string;
}

interface PublicQuote {
  id: number;
  quote_number: string;
  public_token: string;
  client_name: string;
  client_company?: string;
  client_email: string;
  client_phone?: string;
  client_rfc?: string;
  client_address?: string;
  currency: string;
  valid_days: number;
  urgency_level?: string;
  lead_time?: string;
  items: QuoteItem[] | string;
  subtotal: number;
  discount_percent: number;
  discount_amount: number;
  tax_percent: number;
  tax_amount: number;
  final_total: number;
  project_objective?: string;
  payment_terms?: string;
  legal_terms?: string;
  notes?: string;
  status: string;
  created_at: string;
}

const BRAND_NAME = "Digital Engineering FJ";
const BRAND_TAGLINE = "Soluciones web y desarrollo comercial";

const SERVICE_TYPE_LABEL: Record<string, string> = { plan: "Plan", combo: "Combo", additional: "Servicio adicional", advisory: "Asesoria", manual: "Manual" };

const normalizeText = (v: unknown): string | undefined => {
  if (typeof v !== "string") return undefined;
  const x = v.replace(/\r\n/g, "\n").replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/`r`n/g, "\n").replace(/`n/g, "\n").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  return x || undefined;
};

const parseCurrencyAmount = (v: unknown): number => {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v !== "string") return 0;
  const raw = v.trim().replace(/[^\d,.-]/g, "");
  if (!raw) return 0;
  if (/^-?\d{1,3}(\.\d{3})+$/.test(raw)) return Number(raw.replace(/\./g, "")) || 0;
  if (/^-?\d{1,3}(,\d{3})+$/.test(raw)) return Number(raw.replace(/,/g, "")) || 0;
  let n = raw;
  if (raw.includes(".") && raw.includes(",")) n = raw.lastIndexOf(",") > raw.lastIndexOf(".") ? raw.replace(/\./g, "").replace(",", ".") : raw.replace(/,/g, "");
  else if (raw.includes(",")) n = raw.replace(/\./g, "").replace(",", ".");
  const amount = Number(n);
  if (Number.isFinite(amount)) return amount;
  const fallback = Number(raw.replace(/[^\d-]/g, ""));
  return Number.isFinite(fallback) ? fallback : 0;
};

const toSafeNumber = (v: unknown, fb = 0): number => (typeof v === "number" && Number.isFinite(v) ? v : typeof v === "string" ? parseCurrencyAmount(v) : fb);

const formatMoney = (v: unknown, currency = "CLP"): string => {
  const amount = toSafeNumber(v, 0);
  const digits = (currency || "CLP").toUpperCase() === "CLP" ? 0 : 2;
  return `$${amount.toLocaleString("es-CL", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
};

const splitList = (txt: string): string[] =>
  txt.replace(/\r\n/g, "\n").replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/`r`n/g, "\n").replace(/`n/g, "\n").replace(/[•·]/g, "\n").replace(/^\[|\]$/g, "").split(/\n|;|,/).map((p) => p.replace(/\s+/g, " ").trim().replace(/^['"]|['"]$/g, "")).filter(Boolean);

const parseTextList = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.flatMap((i) => splitList(String(i)));
  if (typeof v !== "string") return [];
  const t = v.trim();
  if (!t) return [];
  try {
    const parsed = JSON.parse(t);
    if (Array.isArray(parsed)) return parsed.flatMap((i) => splitList(String(i)));
  } catch {}
  return splitList(t);
};

const parseDateSafe = (v: unknown): Date | null => {
  if (!v) return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
};

const normalizeQuoteItem = (item: unknown, i: number): QuoteItem => {
  const r = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
  const qty = Number(r.quantity);
  const rawType = String(r.type ?? "manual");
  return {
    id: typeof r.id === "number" || typeof r.id === "string" ? r.id : `item-${i + 1}`,
    name: normalizeText(r.name) || "Servicio profesional",
    description: normalizeText(r.description) || "",
    price: parseCurrencyAmount(r.price),
    quantity: Number.isFinite(qty) && qty > 0 ? qty : 1,
    service_type: normalizeText(r.service_type) || SERVICE_TYPE_LABEL[rawType],
    category: normalizeText(r.category),
    includes: parseTextList(r.includes),
    deliverables: parseTextList(r.deliverables),
    timeline: normalizeText(r.timeline),
    ideal_for: parseTextList(r.ideal_for).join(", ") || normalizeText(r.ideal_for),
    delivery: parseTextList(r.delivery).join(", ") || normalizeText(r.delivery),
    result: normalizeText(r.result),
  };
};

const parseQuoteItems = (items: PublicQuote["items"] | undefined): QuoteItem[] => {
  if (Array.isArray(items)) return items.map((it, i) => normalizeQuoteItem(it, i));
  if (typeof items !== "string") return [];
  try {
    const parsed = JSON.parse(items);
    return Array.isArray(parsed) ? parsed.map((it, i) => normalizeQuoteItem(it, i)) : [];
  } catch {
    return [];
  }
};

const normalizePayload = (payload: unknown): PublicQuote => {
  const root = typeof payload === "object" && payload !== null ? (payload as Record<string, unknown>) : {};
  const source = typeof root.proposal === "object" && root.proposal !== null ? (root.proposal as Record<string, unknown>) : root;
  const r = source;
  const created = parseDateSafe(r.created_at) || new Date();
  return {
    id: toSafeNumber(r.id, 0),
    quote_number: normalizeText(r.quote_number) || "QT-SIN-FOLIO",
    public_token: normalizeText(r.public_token) || "",
    client_name: normalizeText(r.client_name) || "Cliente",
    client_company: normalizeText(r.client_company),
    client_email: normalizeText(r.client_email) || "correo@pendiente.com",
    client_phone: normalizeText(r.client_phone),
    client_rfc: normalizeText(r.client_rfc),
    client_address: normalizeText(r.client_address),
    currency: (normalizeText(r.currency) || "CLP").toUpperCase(),
    valid_days: Math.max(1, toSafeNumber(r.valid_days, 30)),
    urgency_level: normalizeText(r.urgency_level),
    lead_time: normalizeText(r.lead_time),
    items: Array.isArray(r.items) || typeof r.items === "string" ? (r.items as PublicQuote["items"]) : [],
    subtotal: toSafeNumber(r.subtotal, 0),
    discount_percent: toSafeNumber(r.discount_percent, 0),
    discount_amount: toSafeNumber(r.discount_amount, 0),
    tax_percent: toSafeNumber(r.tax_percent, 0),
    tax_amount: toSafeNumber(r.tax_amount, 0),
    final_total: toSafeNumber(r.final_total, 0),
    project_objective: normalizeText(r.project_objective),
    payment_terms: normalizeText(r.payment_terms),
    legal_terms: normalizeText(r.legal_terms),
    notes: normalizeText(r.notes),
    status: normalizeText(r.status) || "Pending",
    created_at: created.toISOString(),
  };
};

const getProposalApiBase = (): string => process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function PublicQuotePage() {
  const params = useParams();
  const token = params.token as string;
  const [quote, setQuote] = useState<PublicQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [successScreen, setSuccessScreen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    if (!token) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const apiBase = getProposalApiBase();
        const resp = await fetch(`${apiBase}/api/proposals/public/${token}?ts=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" }
        });
        if (!resp.ok) {
          if (mounted) setError("Cotizacion no encontrada, ha expirado o el enlace es invalido.");
          return;
        }
        const normalized = normalizePayload(await resp.json());
        if (!normalized.id && !normalized.public_token && normalized.quote_number === "QT-SIN-FOLIO") {
          if (mounted) setError("La propuesta no devolvio datos validos. Revisa el endpoint publico.");
          return;
        }
        if (!mounted) return;
        setQuote(normalized);
        setSuccessScreen(normalized.status === "Approved");
      } catch (e) {
        console.error(e);
        if (mounted) setError("Error de conexion al cargar el documento.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [token]);

  const handleAction = async (status: "Approved" | "Rejected") => {
    if (!confirm(`Estas seguro de que deseas ${status === "Approved" ? "ACEPTAR" : "RECHAZAR"} esta propuesta formal?`)) return;
    setActionLoading(true);
    try {
      const apiBase = getProposalApiBase();
      const resp = await fetch(`${apiBase}/api/proposals/public/${token}/action`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (resp.ok) {
        if (status === "Approved") setSuccessScreen(true);
        else alert("Propuesta rechazada. Nos pondremos en contacto pronto.");
      } else {
        alert("Hubo un error al procesar tu respuesta. Por favor intenta de nuevo.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center"><div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" /><p className="text-slate-500 font-medium">Accediendo a documento seguro...</p></div>;
  if (error || !quote) return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center"><div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6"><FaTimesCircle size={40} /></div><h2 className="text-2xl font-bold text-slate-900 mb-2">Enlace invalido</h2><p className="text-slate-500 max-w-md">{error}</p></div>;

  const items = parseQuoteItems(quote.items);
  const currency = (quote.currency || "CLP").toUpperCase();
  const createdAt = parseDateSafe(quote.created_at) || new Date();
  const validUntil = new Date(createdAt.getTime() + Math.max(1, toSafeNumber(quote.valid_days, 30)) * 24 * 60 * 60 * 1000);
  const statusMap: Record<string, { label: string; color: string }> = { Pending: { label: "Pendiente de revision", color: "bg-amber-100 text-amber-700" }, Sent: { label: "Enviado", color: "bg-blue-100 text-blue-700" }, Approved: { label: "Aceptada oficialmente", color: "bg-emerald-100 text-emerald-700" }, Rejected: { label: "Declinada", color: "bg-red-100 text-red-700" }, Expired: { label: "Vencida", color: "bg-slate-200 text-slate-700" } };
  const sMap = statusMap[quote.status] || statusMap.Pending;

  if (successScreen) {
    return <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"><motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10"><div className="w-28 h-28 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-7 ring-4 ring-emerald-500/30"><FaCheckCircle size={54} /></div><h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">CONTRATO APROBADO</h1><p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">La propuesta <strong className="text-white">{quote.quote_number}</strong> ha sido aceptada por <strong>{quote.client_name}</strong>.</p><button onClick={() => setSuccessScreen(false)} className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-bold border border-white/10">Revisar documento</button></motion.div><div className="absolute bottom-8 text-xs text-slate-500 flex items-center gap-2 font-mono uppercase tracking-widest"><FaShieldAlt /> Transaccion registrada de forma segura</div></div>;
  }

  return (
    <div className="min-h-screen bg-[#eef1ea] text-slate-900 py-10 px-4 md:py-16 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white border border-[#d6ddcc] rounded-xl p-4 md:p-6 mb-8 shadow-sm flex flex-col md:flex-row items-center justify-between sticky top-4 z-50 print:hidden backdrop-blur-md bg-white/90">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1"><FaShieldAlt className="text-[#6d8b35]" /> Portal de revision segura</h3>
            <p className="text-xs text-slate-500">Documento privado emitido para {quote.client_company || quote.client_name}.</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap justify-center gap-3">
            <button onClick={() => window.print()} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-2"><FaPrint /> Exportar PDF</button>
            <a
              href={`/cotizacion/${token}/seguimiento`}
              className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg flex items-center gap-2"
            >
              <FaRegClock /> Ver seguimiento
            </a>
            {(quote.status === "Pending" || quote.status === "Sent") && (
              <>
                <button disabled={actionLoading} onClick={() => handleAction("Rejected")} className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg">Rechazar</button>
                <button disabled={actionLoading} onClick={() => handleAction("Approved")} className="px-6 py-2.5 bg-[#6d8b35] hover:bg-[#587126] text-white text-xs font-bold rounded-lg flex items-center gap-2"><FaFileSignature /> Aceptar propuesta</button>
              </>
            )}
          </div>
        </div>

        <main className="bg-white border border-[#cfd7c5] shadow-2xl overflow-hidden print:shadow-none print:border-none p-6 md:p-12 relative">
          <header className="flex flex-col xl:flex-row justify-between items-start gap-8 mb-10 pb-8 border-b border-slate-300">
            <div className="flex-1">
              <div className="rounded-2xl border border-[#d9dfd2] bg-gradient-to-br from-white via-[#fbfcf8] to-[#f1f5e8] px-5 py-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center gap-5">
                  <div className="shrink-0 rounded-xl border border-[#d9dfd2] bg-white px-4 py-3 shadow-sm">
                    {!logoFailed ? (
                      <img
                        src="/img/digital-engineering-fj-logo.svg"
                        alt={BRAND_NAME}
                        className="h-12 md:h-14 w-[220px] md:w-[290px] object-contain object-left"
                        onError={() => setLogoFailed(true)}
                      />
                    ) : (
                      <div className="flex items-center gap-3 min-w-[220px]">
                        <div className="w-12 h-12 rounded-lg bg-[#6d8b35] text-white flex items-center justify-center text-lg font-black">DFJ</div>
                        <div>
                          <p className="text-lg font-black text-slate-950 leading-none">{BRAND_NAME}</p>
                          <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-[0.2em]">{BRAND_TAGLINE}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#6d8b35]">Propuesta empresarial</p>
                    <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-950 mt-1">Cotizacion comercial formal</h1>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">Documento de alcance, entregables, inversion y condiciones operativas para revision del cliente.</p>
                    <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${sMap.color}`}>Estado actual: {sMap.label}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full xl:w-[320px] rounded-2xl border border-[#d9dfd2] bg-white px-5 py-5 shadow-sm">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mb-2">Folio legal</p>
              <h2
                className="text-3xl md:text-4xl font-black tracking-tighter break-words leading-none"
                style={{ color: "#0f172a", WebkitTextFillColor: "#0f172a", opacity: 1, textShadow: "0 0 0 #0f172a" }}
              >
                {quote.quote_number}
              </h2>
              <div className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Fecha emision</span>
                  <span className="font-bold text-slate-900">{createdAt.toLocaleDateString("es-CL")}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Valido hasta</span>
                  <span className="font-bold text-slate-900">{validUntil.toLocaleDateString("es-CL")}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Moneda</span>
                  <span className="font-bold text-slate-900">{currency}</span>
                </div>
              </div>
            </div>
          </header>

          <div className="mb-8 bg-[#6d8b35] text-white px-4 py-2 text-sm font-black uppercase tracking-wide">
            Propuesta comercial / {quote.client_company || quote.client_name}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <section className="border border-slate-200 p-5">
              <h4 className="bg-[#6d8b35] text-white px-3 py-2 text-xs font-black uppercase tracking-[0.2em] mb-4">Datos del cliente</h4>
              <div className="space-y-2 text-sm text-slate-700">
                <p><span className="font-bold">Senor:</span> {quote.client_name}</p>
                <p><span className="font-bold">Empresa:</span> {quote.client_company || "No registrada"}</p>
                <p><span className="font-bold">Correo:</span> {quote.client_email}</p>
                {quote.client_phone && <p><span className="font-bold">Telefono:</span> {quote.client_phone}</p>}
                {quote.client_rfc && <p><span className="font-bold">RUT / RFC:</span> {quote.client_rfc}</p>}
                {quote.client_address && <p><span className="font-bold">Direccion:</span> {quote.client_address}</p>}
              </div>
            </section>

            <section className="border border-slate-200 p-5">
              <h4 className="bg-[#6d8b35] text-white px-3 py-2 text-xs font-black uppercase tracking-[0.2em] mb-4">Referencia ejecutiva</h4>
              <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                {quote.project_objective && <p><span className="font-bold">Objetivo:</span> {quote.project_objective}</p>}
                {quote.lead_time && <p><span className="font-bold">Tiempo estimado:</span> {quote.lead_time}</p>}
                {quote.urgency_level && <p><span className="font-bold">Prioridad:</span> {quote.urgency_level}</p>}
                {quote.notes && <p><span className="font-bold">Observaciones:</span> {quote.notes}</p>}
              </div>
            </section>
          </div>

          <section className="mb-10">
            <h4 className="bg-[#6d8b35] text-white px-4 py-2 text-sm font-black uppercase tracking-[0.2em] mb-4">Detalle del servicio</h4>
            <div className="space-y-6">
              {items.length === 0 ? (
                <div className="border border-slate-200 px-5 py-8 text-center text-sm text-slate-500">
                  No hay conceptos cargados en esta propuesta.
                </div>
              ) : items.map((item, idx) => (
                <article key={idx} className="border border-slate-200 p-5">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div>
                      <h5 className="text-xl font-black text-slate-900">{item.name}</h5>
                      {item.description && <p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.description}</p>}
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-sm text-slate-500">Cantidad: <span className="font-bold text-slate-900">{item.quantity}</span></p>
                      <p className="text-sm text-slate-500">Unitario: <span className="font-bold text-slate-900">{formatMoney(item.price, currency)} {currency}</span></p>
                      <p className="text-lg font-black text-[#6d8b35] mt-1">{formatMoney(toSafeNumber(item.price, 0) * toSafeNumber(item.quantity, 1), currency)} {currency}</p>
                    </div>
                  </div>

                  <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
                    {item.service_type && <li><span className="font-bold">Tipo:</span> {item.service_type}</li>}
                    {item.category && <li><span className="font-bold">Categoria:</span> {item.category}</li>}
                    {item.includes && item.includes.length > 0 && <li><span className="font-bold">Incluye:</span> {item.includes.join(", ")}</li>}
                    {item.deliverables && item.deliverables.length > 0 && <li><span className="font-bold">Entregables:</span> {item.deliverables.join(", ")}</li>}
                    {item.timeline && <li><span className="font-bold">Timeline:</span> {item.timeline}</li>}
                    {item.delivery && <li><span className="font-bold">Entrega:</span> {item.delivery}</li>}
                    {item.ideal_for && <li><span className="font-bold">Ideal para:</span> {item.ideal_for}</li>}
                    {item.result && <li><span className="font-bold">Resultado esperado:</span> {item.result}</li>}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <h4 className="bg-[#6d8b35] text-white px-4 py-2 text-sm font-black uppercase tracking-[0.2em] mb-4">Valores y forma de pago</h4>
            <div className="border border-slate-200 p-5 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                <p><span className="font-bold">Condiciones comerciales:</span> {quote.payment_terms || "50% de anticipo y saldo contra entrega final."}</p>
                <p><span className="font-bold">Condiciones legales:</span> {quote.legal_terms || "La propiedad intelectual se transfiere tras el pago completo."}</p>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-bold text-slate-900">{formatMoney(quote.subtotal, currency)} {currency}</span></div>
                {toSafeNumber(quote.discount_amount, 0) > 0 && <div className="flex justify-between text-emerald-700"><span>Descuento</span><span className="font-bold">- {formatMoney(quote.discount_amount, currency)} {currency}</span></div>}
                <div className="flex justify-between"><span className="text-slate-500">Impuestos ({toSafeNumber(quote.tax_percent, 0)}%)</span><span className="font-bold text-slate-900">{formatMoney(quote.tax_amount, currency)} {currency}</span></div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-end">
                  <span className="text-sm font-black uppercase tracking-wide text-slate-900">Total</span>
                  <span className="text-3xl font-black text-[#6d8b35]">{formatMoney(quote.final_total, currency)} {currency}</span>
                </div>
              </div>
            </div>
          </section>

          <div className="pt-8 border-t border-slate-200">
            <div className="rounded-2xl border border-[#d9dfd2] bg-[#f8faf5] px-6 py-6 text-center">
              <p className="font-black text-slate-900 uppercase tracking-[0.25em] mb-2">{BRAND_NAME}</p>
              <p className="text-sm text-slate-600">{BRAND_TAGLINE}</p>
              <div className="mt-4 h-px bg-gradient-to-r from-transparent via-[#6d8b35]/40 to-transparent" />
              <p className="mt-4 text-xs text-slate-500">Documento confidencial emitido para revision exclusiva del destinatario.</p>
              <p className="mt-1 text-xs text-slate-400">La aprobacion o rechazo de esta propuesta queda registrada en el sistema comercial.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
