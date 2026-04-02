"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaChartLine, FaPlus, FaListUl, FaUsers, FaFileInvoice, FaCheck,
    FaTrash, FaPhone, FaChevronRight, FaPaperPlane,
    FaSearch, FaArrowLeft, FaExternalLinkAlt, FaUserShield, FaMoneyBillWave,
    FaUniversity, FaRegHandshake, FaLayerGroup, FaGem, FaChalkboardTeacher,
    FaSyncAlt, FaBullseye, FaShieldAlt, FaPrint, FaEnvelope, FaEllipsisV,
    FaFileAlt, FaBalanceScale, FaCogs, FaEdit, FaTimes, FaRegCopy
} from "react-icons/fa";
import { adminFetch } from "@/lib/adminFetch";

// --- Types ---
interface Service {
    id: number;
    name: string;
    description: string;
    price: string | number;
    type: 'plan' | 'combo' | 'additional' | 'advisory' | 'manual';
    includes?: string | string[];
    deliverables?: string | string[];
    category?: string;
    delivery?: string;
    ideal_for?: string;
    note?: string;
    timeline?: string;
    market_note?: string;
    result?: string;
    audience?: string | string[];
    payment_type?: string;
    segment?: string;
    duration?: string;
}

export interface Lead {
    id: number;
    nombre: string;
    email: string;
    telefono?: string;
    mensaje: string;
    created_at: string;
}

interface QuoteItem {
    id: number | string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    type: string;
    source_id?: number | string;
    service_type?: string;
    category?: string;
    includes?: string[];
    deliverables?: string[];
    timeline?: string;
    ideal_for?: string;
    delivery?: string;
    result?: string;
    audience?: string[];
    market_note?: string;
    payment_type?: string;
    note?: string;
    duration?: string;
}

interface Quote {
    id: number;
    quote_number: string;
    client_name: string;
    client_company?: string;
    client_rfc?: string;
    client_email: string;
    client_phone?: string;
    client_address?: string;
    currency: string;
    urgency_level?: string;
    valid_days: number;
    lead_time?: string;
    items: QuoteItem[] | string;
    subtotal: number;
    discount_percent: number;
    discount_amount: number;
    tax_percent: number;
    tax_amount: number;
    final_total: number;
    bank_name?: string;
    bank_account?: string;
    bank_clabe?: string;
    project_objective?: string;
    payment_terms?: string;
    legal_terms?: string;
    notes?: string;
    status: string;
    public_token?: string;
    created_at: string;
}

const STATUS_THEME: Record<string, string> = {
    "Pending": "bg-amber-100 text-amber-700 border-amber-200",
    "Sent": "bg-blue-100 text-blue-700 border-blue-200",
    "Approved": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Rejected": "bg-red-100 text-red-700 border-red-200",
    "Expired": "bg-slate-100 text-slate-600 border-slate-200"
};

const SERVICE_TYPE_LABEL: Record<string, string> = {
    plan: "Plan",
    combo: "Combo",
    additional: "Servicio adicional",
    advisory: "Asesoria",
    manual: "Manual"
};

const toOptionalText = (value: unknown): string | undefined => {
    if (typeof value !== "string") return undefined;
    const trimmed = value
        .replace(/\r\n/g, "\n")
        .replace(/\\r\\n/g, "\n")
        .replace(/\\n/g, "\n")
        .replace(/`r`n/g, "\n")
        .replace(/`n/g, "\n")
        .replace(/\u00a0/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    return trimmed || undefined;
};

const parseCurrencyAmount = (value: string | number | undefined): number => {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    if (typeof value !== "string") return 0;
    const raw = value.trim();
    if (!raw) return 0;

    const cleaned = raw.replace(/[^\d,.-]/g, "");
    if (!cleaned) return 0;

    if (/^-?\d{1,3}(\.\d{3})+$/.test(cleaned)) {
        const grouped = Number(cleaned.replace(/\./g, ""));
        return Number.isFinite(grouped) ? grouped : 0;
    }
    if (/^-?\d{1,3}(,\d{3})+$/.test(cleaned)) {
        const grouped = Number(cleaned.replace(/,/g, ""));
        return Number.isFinite(grouped) ? grouped : 0;
    }

    let normalized = cleaned;
    if (cleaned.includes(".") && cleaned.includes(",")) {
        normalized = cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")
            ? cleaned.replace(/\./g, "").replace(",", ".")
            : cleaned.replace(/,/g, "");
    } else if (cleaned.includes(",")) {
        normalized = cleaned.replace(/\./g, "").replace(",", ".");
    }

    const amount = Number(normalized);
    if (Number.isFinite(amount) && amount !== 0) return amount;

    const digitsOnly = cleaned.replace(/[^\d-]/g, "");
    const fallback = Number(digitsOnly);
    return Number.isFinite(fallback) ? fallback : 0;
};

const parseTextList = (value: unknown): string[] => {
    const splitList = (text: string): string[] =>
        text
            .replace(/\r\n/g, "\n")
            .replace(/\\r\\n/g, "\n")
            .replace(/\\n/g, "\n")
            .replace(/`r`n/g, "\n")
            .replace(/`n/g, "\n")
            .replace(/[•·]/g, "\n")
            .replace(/^\[|\]$/g, "")
            .split(/\n|;|,/)
            .map((part) => part.replace(/\s+/g, " ").trim().replace(/^['"]|['"]$/g, ""))
            .filter(Boolean);
    if (Array.isArray(value)) {
        return value.flatMap((item) => splitList(String(item)));
    }
    if (typeof value !== "string") return [];

    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
            return parsed.flatMap((item) => splitList(String(item)));
        }
    } catch {
        // If value is not JSON, continue with fallback split.
    }

    return trimmed
        .split(/\n|•|·|;/)
        .map((part) => part.trim())
        .filter(Boolean);
};

const formatInlineList = (items: string[] | undefined, limit = 4): string => {
    if (!items || items.length === 0) return "";
    const visible = items.slice(0, limit);
    const suffix = items.length > limit ? ` +${items.length - limit} mas` : "";
    return `${visible.join(", ")}${suffix}`;
};

const formatDocumentMoney = (value: number, currency = "CLP"): string => {
    const safeCurrency = (currency || "CLP").toUpperCase();
    const digits = safeCurrency === "CLP" ? 0 : 2;
    return `$${Number(value || 0).toLocaleString("es-CL", { minimumFractionDigits: digits, maximumFractionDigits: digits })} ${safeCurrency}`;
};

const formatDateLabel = (value: string | undefined, fallback = "Sin fecha"): string => {
    if (!value) return fallback;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? fallback : date.toLocaleDateString("es-CL");
};

const normalizeQuoteItem = (item: unknown, index: number): QuoteItem => {
    const raw = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
    const rawId = raw.id;
    const normalizedId = (typeof rawId === "string" || typeof rawId === "number")
        ? rawId
        : `item-${index + 1}`;
    const quantityRaw = Number(raw.quantity);
    const normalizedQuantity = Number.isFinite(quantityRaw) && quantityRaw > 0 ? quantityRaw : 1;

    return {
        id: normalizedId,
        name: toOptionalText(raw.name) || "Servicio profesional",
        description: toOptionalText(raw.description) || "",
        price: parseCurrencyAmount(raw.price as string | number | undefined),
        quantity: normalizedQuantity,
        type: String(raw.type ?? "manual"),
        source_id: (typeof raw.source_id === "string" || typeof raw.source_id === "number") ? raw.source_id : undefined,
        service_type: toOptionalText(raw.service_type) || SERVICE_TYPE_LABEL[String(raw.type ?? "manual")],
        category: toOptionalText(raw.category),
        includes: parseTextList(raw.includes),
        deliverables: parseTextList(raw.deliverables),
        timeline: toOptionalText(raw.timeline),
        ideal_for: parseTextList(raw.ideal_for).join(", ") || toOptionalText(raw.ideal_for),
        delivery: parseTextList(raw.delivery).join(", ") || toOptionalText(raw.delivery),
        result: toOptionalText(raw.result),
        audience: parseTextList(raw.audience),
        market_note: toOptionalText(raw.market_note),
        payment_type: toOptionalText(raw.payment_type),
        note: toOptionalText(raw.note),
        duration: toOptionalText(raw.duration),
    };
};

const parseQuoteItems = (items: Quote["items"] | undefined): QuoteItem[] => {
    if (Array.isArray(items)) return items.map((item, index) => normalizeQuoteItem(item, index));
    if (typeof items !== "string") return [];
    try {
        const parsed = JSON.parse(items);
        return Array.isArray(parsed) ? parsed.map((item, index) => normalizeQuoteItem(item, index)) : [];
    } catch {
        return [];
    }
};

const buildQuoteDraftFromLead = (lead: Lead): Partial<Quote> => ({
    client_name: lead.nombre,
    client_email: lead.email,
    client_phone: lead.telefono || "",
    project_objective: `Solicitud recibida: ${String(lead.mensaje || "").slice(0, 100)}...`,
    items: [],
    discount_percent: 0,
    tax_percent: 19,
    valid_days: 30,
    currency: "CLP",
});

interface QuotesAdminProps {
    prefilledLead?: Lead | null;
    onPrefillUsed?: () => void;
    preFilledQuoteId?: string | number | null;
}

export default function QuotesAdmin({ prefilledLead, onPrefillUsed, preFilledQuoteId }: QuotesAdminProps) {
    const [activeView, setActiveView] = useState<"dashboard" | "new" | "list" | "detail" | "leads">("dashboard");
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [catalog, setCatalog] = useState<Service[]>([]);
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
    const [quoteToEdit, setQuoteToEdit] = useState<Partial<Quote> | null>(null);
    const [systemHealth, setSystemHealth] = useState({ api: false, db: false });
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const [qResp, lResp, pResp, cResp, aResp, adResp] = await Promise.all([
                adminFetch("/api/proposals/"),
                adminFetch("/api/enviar-cotizacion/admin/list"),
                adminFetch("/api/services-page/plans"),
                adminFetch("/api/services-page/combos"),
                adminFetch("/api/services-page/additional-services"),
                adminFetch("/api/services-page/advisory-services")
            ]);

            if (!qResp.ok || !lResp.ok) throw new Error("Sync failure");

            const [qData, lData, pData, cData, aData, adData] = await Promise.all([
                qResp.json(), lResp.json(), pResp.json(), cResp.json(), aResp.json(), adResp.json()
            ]);

            setQuotes(Array.isArray(qData) ? qData : []);
            setLeads(Array.isArray(lData) ? lData : []);
            setSystemHealth({ api: true, db: true });
            
            setCatalog([
                ...(Array.isArray(pData) ? pData.map(i => ({
                    ...i,
                    type: 'plan',
                    description: i.description || "",
                    includes: i.includes,
                    category: i.category,
                    delivery: i.delivery,
                    ideal_for: i.ideal_for
                })) : []),
                ...(Array.isArray(cData) ? cData.map(i => ({
                    ...i,
                    name: i.title,
                    type: 'combo',
                    price: i.combo_price,
                    description: i.note || i.ideal || "",
                    includes: i.includes,
                    deliverables: i.deliverables,
                    timeline: i.timeline,
                    ideal_for: i.ideal,
                    note: i.note,
                    market_note: i.market_note,
                    segment: i.segment
                })) : []),
                ...(Array.isArray(aData) ? aData.map(i => ({
                    ...i,
                    type: 'additional',
                    description: i.description || "",
                    includes: i.includes,
                    payment_type: i.payment_type
                })) : []),
                ...(Array.isArray(adData) ? adData.map(i => ({
                    ...i,
                    name: i.title,
                    type: 'advisory',
                    description: i.result || "",
                    includes: i.includes,
                    result: i.result,
                    audience: i.audience,
                    market_note: i.market_note,
                    duration: i.duration
                })) : [])
            ]);

        } catch (error) {
            console.error(error);
            setSystemHealth({ api: false, db: false });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // Efecto para procesar el lead precargado desde el Inbox
    useEffect(() => {
        if (prefilledLead) {
            setActiveView("new");
            // El ComposerView manejará la conversión si se le pasa el lead en quoteToEdit (o similar)
            // Para simplificar, transformamos el lead en el formato que espera el compositor 'quoteToEdit'
            setQuoteToEdit(buildQuoteDraftFromLead(prefilledLead));
            if (onPrefillUsed) onPrefillUsed();
        }
    }, [prefilledLead, onPrefillUsed]);
    
    // Efecto para procesar el deep-linking desde notificaciones
    useEffect(() => {
        if (preFilledQuoteId) {
            // Caso especial para ir a la pestaña de Leads
            if (preFilledQuoteId === "leads") {
                setActiveView("leads");
                setSelectedQuote(null);
                return;
            }

            const loadSingleQuote = async () => {
                try {
                    const res = await adminFetch(`/api/proposals/${preFilledQuoteId}`);
                    if (res.ok) {
                        const data = await res.json();
                        // El backend retorna { proposal, history, tracking }
                        if (data && data.proposal) {
                            setSelectedQuote(data.proposal);
                            setActiveView("detail");
                        }
                    }
                } catch (err) {
                    console.error("Error loading deep-linked quote:", err);
                }
            };
            loadSingleQuote();
        }
    }, [preFilledQuoteId]);

    const stats = useMemo(() => {
        const approved = quotes.filter(q => q.status === 'Approved');
        const leadBase = leads.length;
        return {
            revenue: approved.reduce((acc, q) => acc + q.final_total, 0),
            pipeline: quotes.filter(q => q.status === 'Pending').reduce((acc, q) => acc + q.final_total, 0),
            count: quotes.length,
            leads: leads.length,
            conversion: leadBase > 0 ? Math.round((approved.length / leadBase) * 100) : 0
        };
    }, [quotes, leads]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-slate-500">Cargando Sistema de Gestión...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100">
            {/* 🏢 MODERN NAVIGATION HEADER */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                                <FaFileAlt size={18} />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900">Quotes<span className="text-blue-600">Pro</span></h1>
                        </div>
                        <div className="h-6 w-px bg-slate-200 mx-2" />
                        <nav className="flex items-center gap-1">
                            {[
                                { id: "dashboard", label: "Panel Principal", icon: <FaChartLine /> },
                                { id: "list", label: "Cotizaciones", icon: <FaListUl /> },
                                { id: "leads", label: "Leads", icon: <FaUsers /> }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveView(tab.id as any); setSelectedQuote(null); setQuoteToEdit(null); }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeView === tab.id ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={loadData} className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"><FaSyncAlt size={16} /></button>
                        <button 
                            onClick={() => { setQuoteToEdit(null); setActiveView("new"); setSelectedQuote(null); }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                        >
                            <FaPlus /> Nueva Cotización
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-[1600px] mx-auto px-8 py-10">
                <main>
                    <AnimatePresence mode="wait">
                        {activeView === "dashboard" && <DashboardView key="dash" stats={stats} recentQuotes={quotes.slice(0, 5)} health={systemHealth} onSelect={(q) => { setSelectedQuote(q); setActiveView("detail"); }} />}
                        {activeView === "new" && <ComposerView key="new" catalog={catalog} leads={leads} quoteToEdit={quoteToEdit} onCancel={() => { setActiveView("dashboard"); setQuoteToEdit(null); }} onSuccess={() => { loadData(); setActiveView("list"); setQuoteToEdit(null); }} />}
                        {activeView === "list" && <ListView key="list" quotes={quotes} onSelect={(q) => { setSelectedQuote(q); setActiveView("detail"); }} onEdit={(q) => { setQuoteToEdit(q); setActiveView("new"); }} onClone={async (q) => { if (confirm("¿Duplicar cotización?")) { await adminFetch(`/api/proposals/${q.id}/clone`, { method: "POST" }); loadData(); } }} onDelete={async (q) => { if (confirm("¿Eliminar PERMANENTEMENTE?")) { await adminFetch(`/api/proposals/${q.id}`, { method: "DELETE" }); loadData(); } }} />}
                        {activeView === "leads" && <LeadsView key="leads" leads={leads} onConvert={(lead) => { setQuoteToEdit(buildQuoteDraftFromLead(lead)); setActiveView("new"); setSelectedQuote(null); }} />}
                        {activeView === "detail" && selectedQuote && (
                            <DocumentView key="doc" quote={selectedQuote} onBack={() => setActiveView("list")} />
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

// --- 📊 DASHBOARD VIEW ---
function DashboardView({ stats, recentQuotes, health, onSelect }: { stats: any, recentQuotes: Quote[], health: { api: boolean, db: boolean }, onSelect: (q: Quote) => void }) {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Ventas Cerradas", val: `$${stats.revenue.toLocaleString()}`, icon: <FaCheck />, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Pipeline Activo", val: `$${stats.pipeline.toLocaleString()}`, icon: <FaChartLine />, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Leads Totales", val: stats.leads, icon: <FaUsers />, color: "text-orange-600", bg: "bg-orange-50" },
                    { label: "Conversión", val: `${stats.conversion}%`, icon: <FaRegHandshake />, color: "text-purple-600", bg: "bg-purple-50" }
                ].map((s, i) => (
                    <div key={i} className="bg-white border border-slate-200 p-6 rounded-xl hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center ${s.color} transition-transform group-hover:scale-110`}>{s.icon}</div>
                        </div>
                        <p className="text-sm font-bold text-slate-700 mb-1">{s.label}</p>
                        <h4 className="text-2xl font-extrabold text-slate-900 tracking-tight">{s.val}</h4>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="text-sm font-bold text-slate-900">Cotizaciones Recientes</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-100 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Cliente / Empresa</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 text-right">Monto Total</th>
                                    <th className="px-6 py-4 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentQuotes.map(q => (
                                    <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-900">{q.client_name}</p>
                                            <p className="text-xs text-slate-500">{q.client_company || 'Individual'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${STATUS_THEME[q.status] || STATUS_THEME["Pending"]}`}>{q.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-slate-900">${q.final_total.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => onSelect(q)} className="p-2 text-slate-400 hover:text-blue-600 transition-all"><FaChevronRight size={14}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {recentQuotes.length === 0 && <div className="py-20 text-center text-slate-400 text-sm">No hay registros recientes.</div>}
                    </div>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm h-fit">
                    <h4 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2"> <FaShieldAlt className="text-blue-600" /> Estado del Sistema</h4>
                    <div className="space-y-4">
                        {[
                            { label: "API Backend", status: health.api ? "Online" : "Offline", dot: health.api ? "bg-emerald-500" : "bg-red-500" },
                            { label: "Base de Datos", status: health.db ? "Sincronizada" : "Sin conexion", dot: health.db ? "bg-emerald-500" : "bg-red-500" },
                            { label: "Seguridad JWT", status: health.api ? "Protegido" : "Sin verificar", dot: health.api ? "bg-blue-500" : "bg-slate-300" }
                        ].map((p, i) => (
                            <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                                <span className="text-sm text-slate-600">{p.label}</span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${p.dot}`} />
                                    <span className="text-xs font-bold text-slate-900">{p.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- 📝 COMPOSER VIEW ---
function ComposerView({ catalog, leads, onCancel, onSuccess, quoteToEdit }: { catalog: Service[], leads: Lead[], onCancel: () => void, onSuccess: () => void, quoteToEdit: Partial<Quote> | null }) {
    const [selectedItems, setSelectedItems] = useState<QuoteItem[]>([]);
    const [discount, setDiscount] = useState(0);
    const [tax, setTax] = useState(19);
    const [showPreview, setShowPreview] = useState(false);
    
    const [formData, setFormData] = useState({
        client_name: "", client_company: "", client_rfc: "", client_email: "", client_phone: "", client_address: "",
        currency: "CLP", urgency_level: "Standard", valid_days: 30, 
        bank_name: "BANK OF NEW YORK MELLON", bank_account: "8881-2292-XXXX", bank_clabe: "012 345 6789 0123 4567 89",
        payment_terms: "50% Anticipo / 50% Finalización", project_objective: "",
        legal_terms: "Propiedad intelectual transferida tras pago completo.", notes: ""
    });

    const [isSuccess, setIsSuccess] = useState(false);
    const [lastCreatedQuote, setLastCreatedQuote] = useState<Quote | null>(null);

    const totals = useMemo(() => {
        const subtotal = selectedItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
        const discAmt = subtotal * (discount / 100);
        const taxAmt = (subtotal - discAmt) * (tax / 100);
        return { subtotal, discAmt, taxAmt, total: subtotal - discAmt + taxAmt };
    }, [selectedItems, discount, tax]);

    useEffect(() => {
        if (quoteToEdit) {
            setFormData({
                client_name: quoteToEdit.client_name || "", client_company: quoteToEdit.client_company || "",
                client_rfc: quoteToEdit.client_rfc || "", client_email: quoteToEdit.client_email || "",
                client_phone: quoteToEdit.client_phone || "", client_address: quoteToEdit.client_address || "",
                currency: quoteToEdit.currency || "CLP", urgency_level: quoteToEdit.urgency_level || "Standard", valid_days: quoteToEdit.valid_days || 30,
                bank_name: quoteToEdit.bank_name || "BANK OF NEW YORK MELLON",
                bank_account: quoteToEdit.bank_account || "8881-2292-XXXX",
                bank_clabe: quoteToEdit.bank_clabe || "012 345 6789 0123 4567 89",
                payment_terms: quoteToEdit.payment_terms || "50% Anticipo / 50% Finalizacion",
                project_objective: quoteToEdit.project_objective || "",
                legal_terms: quoteToEdit.legal_terms || "", notes: quoteToEdit.notes || ""
            });
            setDiscount(quoteToEdit.discount_percent || 0);
            setTax(quoteToEdit.tax_percent || 19);
            setSelectedItems(parseQuoteItems(quoteToEdit.items));
        }
    }, [quoteToEdit]);

    const buildItemFromService = (service: Service): QuoteItem => ({
        id: Math.floor(Date.now() + Math.random() * 1000),
        source_id: service.id,
        name: service.name,
        description: service.description || "",
        price: parseCurrencyAmount(service.price),
        quantity: 1,
        type: service.type,
        service_type: SERVICE_TYPE_LABEL[service.type] || "Servicio",
        category: toOptionalText(service.category),
        includes: parseTextList(service.includes),
        deliverables: parseTextList(service.deliverables),
        timeline: toOptionalText(service.timeline),
        ideal_for: toOptionalText(service.ideal_for),
        delivery: toOptionalText(service.delivery),
        result: toOptionalText(service.result),
        audience: parseTextList(service.audience),
        market_note: toOptionalText(service.market_note),
        payment_type: toOptionalText(service.payment_type),
        note: toOptionalText(service.note),
        duration: toOptionalText(service.duration),
    });

    const handleImportLead = (id: string) => {
        const l = leads.find(x => x.id === parseInt(id));
        if (l) {
            setFormData({ 
                ...formData, 
                client_name: l.nombre, 
                client_email: l.email, 
                client_phone: l.telefono || "",
                project_objective: `Suministro de servicios técnicos para: ${l.mensaje.substring(0, 80)}...`
            });
        }
    };

    const addItem = (compoundId: string) => {
        const [type, id] = compoundId.split('-');
        const s = catalog.find(x => x.id === parseInt(id) && x.type === type);
        if (s) {
            setSelectedItems([...selectedItems, buildItemFromService(s)]);
        }
    };

    const updateItem = (id: any, field: keyof QuoteItem, value: any) => {
        setSelectedItems(selectedItems.map(it => it.id === id ? { ...it, [field]: value } : it));
    };

    const removeItem = (id: any) => setSelectedItems(selectedItems.filter(it => it.id !== id));

    const submit = async () => {
        if (!formData.client_name || !formData.client_email) {
            alert("⚠️ El 'Nombre o Razón Social' y el 'Email Receptor' son datos obligatorios.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.client_email)) {
            alert("⚠️ El 'Email Receptor' debe tener un formato válido (ej. correo@empresa.com).");
            return;
        }
        if (selectedItems.length === 0) {
            alert("⚠️ Debes agregar al menos un concepto a la cotización.");
            return;
        }

        const payload = {
            ...formData,
            items: selectedItems,
            subtotal: totals.subtotal,
            discount_percent: discount,
            tax_percent: tax
        };
        try {
            const resolveLatestCreatedQuote = async (hint?: Partial<Quote> | null): Promise<Quote | null> => {
                try {
                    const listResp = await adminFetch("/api/proposals/");
                    if (!listResp.ok) return null;
                    const listData = await listResp.json();
                    if (!Array.isArray(listData) || listData.length === 0) return null;

                    const sorted = [...listData].sort((a, b) => {
                        const ta = new Date(a?.created_at || 0).getTime();
                        const tb = new Date(b?.created_at || 0).getTime();
                        return tb - ta;
                    });

                    if (hint?.quote_number) {
                        const byFolio = sorted.find((q) => q?.quote_number === hint.quote_number);
                        if (byFolio) return byFolio as Quote;
                    }

                    const byContact = sorted.find((q) =>
                        String(q?.client_email || "").toLowerCase() === String(formData.client_email || "").toLowerCase() &&
                        String(q?.client_name || "").toLowerCase() === String(formData.client_name || "").toLowerCase()
                    );

                    return (byContact || sorted[0]) as Quote;
                } catch {
                    return null;
                }
            };

            const editingQuoteId = typeof quoteToEdit?.id === "number" ? quoteToEdit.id : null;
            const url = editingQuoteId ? `/api/proposals/${editingQuoteId}` : "/api/proposals/";
            const method = editingQuoteId ? "PUT" : "POST";
            const resp = await adminFetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (resp.ok) {
                let data: Partial<Quote> | null = null;
                try {
                    const raw = await resp.text();
                    data = raw ? JSON.parse(raw) : null;
                } catch {
                    data = null;
                }

                const hasId = typeof data?.id === "number" && Number.isFinite(data.id);
                const recovered = hasId ? (data as Quote) : await resolveLatestCreatedQuote(data);

                console.log("Respuesta del guardado:", data, "Recuperada:", recovered);
                setLastCreatedQuote(recovered || (data as Quote) || null);
                setIsSuccess(true);
            } else {
                const errorData = await resp.json().catch(()=>({}));
                console.error("Backend validation error:", errorData);
                let msg = "Error al guardar la cotización.";
                if (errorData.detail) {
                    msg += `\nDetalle: ${JSON.stringify(errorData.detail)}`;
                }
                alert(msg);
            }
        } catch (err) { console.error(err); }
    };

    if (isSuccess) return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-32 bg-white border border-slate-200 rounded-2xl text-center shadow-xl">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-8">
                <FaCheck size={40} />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-2">Cotización Generada</h3>
            <p className="text-slate-500 mb-12">El documento se ha guardado correctamente como Folio #{lastCreatedQuote?.quote_number || lastCreatedQuote?.id || "?"}.</p>
            <div className="flex gap-4">
                <button 
                    onClick={async () => {
                        try {
                            let targetQuoteId = typeof lastCreatedQuote?.id === "number" ? lastCreatedQuote.id : null;

                            if (!targetQuoteId) {
                                const listResp = await adminFetch("/api/proposals/");
                                if (listResp.ok) {
                                    const listData = await listResp.json();
                                    if (Array.isArray(listData) && listData.length > 0) {
                                        const sorted = [...listData].sort((a, b) => {
                                            const ta = new Date(a?.created_at || 0).getTime();
                                            const tb = new Date(b?.created_at || 0).getTime();
                                            return tb - ta;
                                        });
                                        const byContact = sorted.find((q) =>
                                            String(q?.client_email || "").toLowerCase() === String(formData.client_email || "").toLowerCase() &&
                                            String(q?.client_name || "").toLowerCase() === String(formData.client_name || "").toLowerCase()
                                        );
                                        targetQuoteId = typeof byContact?.id === "number"
                                            ? byContact.id
                                            : (typeof sorted[0]?.id === "number" ? sorted[0].id : null);
                                        if (targetQuoteId && (!lastCreatedQuote?.id || lastCreatedQuote.id !== targetQuoteId)) {
                                            setLastCreatedQuote((byContact || sorted[0]) as Quote);
                                        }
                                    }
                                }
                            }

                            if(targetQuoteId) {
                                const sendResp = await adminFetch(`/api/proposals/${targetQuoteId}/send-email`, { method: "POST" });
                                if (sendResp.ok) alert("Correo enviado exitosamente al cliente.");
                                else alert("Fallo envío. Verifica los logs del servidor o intenta desde la lista.");
                            } else {
                                alert("No hay ID para enviar. La respuesta del servidor fue: " + JSON.stringify(lastCreatedQuote));
                            }
                        } catch (err) { alert("Surgió un error de red al intentar enviar."); }
                    }}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-3 hover:bg-blue-700 transition-all"
                >
                    <FaPaperPlane /> Enviar al Cliente
                </button>
                <button onClick={() => onSuccess()} className="px-8 py-3 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-all">Regresar al Listado</button>
            </div>
        </motion.div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pb-32">
            <div className="flex items-center justify-between mb-8">
                <button onClick={onCancel} className="text-slate-500 hover:text-slate-900 flex items-center gap-2 text-sm font-semibold transition-all">
                    <FaArrowLeft /> Cancelar y Volver
                </button>
                <h2 className="text-2xl font-bold text-slate-900">{quoteToEdit?.id ? `Editando Cotización #${quoteToEdit.quote_number || quoteToEdit.id}` : "Nueva Cotización"}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    {/* CLIENT INFO SECTION */}
                    <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
                            <h4 className="text-sm font-bold text-blue-600 flex items-center gap-2 tracking-wide uppercase"><FaUsers /> Datos del Cliente</h4>
                            <select onChange={e => handleImportLead(e.target.value)} className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-600 outline-none hover:border-blue-300">
                                <option value="">Importar desde Leads...</option>
                                {leads.map(l => <option key={l.id} value={l.id}>{l.nombre} ({l.email})</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Nombre o Razón Social" value={formData.client_name} onChange={v => setFormData({...formData, client_name: v})} />
                            <InputField label="Empresa" value={formData.client_company} onChange={v => setFormData({...formData, client_company: v})} />
                            <InputField label="Email Receptor" value={formData.client_email} onChange={v => setFormData({...formData, client_email: v})} />
                            <InputField label="Teléfono de Contacto" value={formData.client_phone} onChange={v => setFormData({...formData, client_phone: v})} />
                            <InputField label="RFC / Identificador Fiscal" value={formData.client_rfc} onChange={v => setFormData({...formData, client_rfc: v})} />
                            <InputField label="Dirección Comercial" value={formData.client_address} onChange={v => setFormData({...formData, client_address: v})} />
                        </div>
                    </div>

                    {/* ITEMS TABLE SECTION */}
                    <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
                            <h4 className="text-sm font-bold text-blue-600 flex items-center gap-2 tracking-wide uppercase"><FaLayerGroup /> Conceptos de la Cotización</h4>
                            <div className="flex gap-2">
                                <select onChange={e => { if(e.target.value) addItem(e.target.value); e.target.value = ""; }} className="bg-blue-600 text-white rounded px-3 py-1.5 text-xs font-bold outline-none cursor-pointer hover:bg-blue-700 transition-all">
                                    <option value="">+ Añadir desde Catálogo</option>
                                    {catalog.map(s => (
                                        <option key={`${s.type}-${s.id}`} value={`${s.type}-${s.id}`}>
                                            {s.name} - ${parseCurrencyAmount(s.price).toLocaleString()} CLP
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => setSelectedItems([...selectedItems, {
                                        id: Math.floor(Date.now() + Math.random() * 1000),
                                        name: "",
                                        description: "",
                                        price: 0,
                                        quantity: 1,
                                        type: "manual",
                                        service_type: "Manual",
                                        includes: [],
                                        deliverables: [],
                                        audience: []
                                    }])}
                                    className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-200 transition-all"
                                >
                                    + Manual
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3">Descripción del Servicio</th>
                                        <th className="px-4 py-3 w-20 text-center">Cant.</th>
                                        <th className="px-4 py-3 w-32 text-right">Unitario</th>
                                        <th className="px-4 py-3 w-32 text-right">Importe</th>
                                        <th className="px-4 py-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {selectedItems.map((it) => (
                                        <tr key={it.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-4">
                                                <input value={it.name} onChange={e => updateItem(it.id, 'name', e.target.value)} placeholder="Nombre del servicio..." className="w-full bg-transparent font-bold text-sm text-slate-900 outline-none mb-1 border-b border-transparent hover:border-slate-200 focus:border-blue-400" />
                                                <textarea value={it.description} onChange={e => updateItem(it.id, 'description', e.target.value)} placeholder="Detalle adicional..." className="w-full bg-transparent text-xs text-slate-500 outline-none resize-none h-6 hover:h-12 transition-all overflow-hidden" />
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {it.service_type && <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700">{it.service_type}</span>}
                                                    {it.category && <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-600">{it.category}</span>}
                                                </div>
                                                <div className="mt-2 space-y-1">
                                                    {it.includes && it.includes.length > 0 && (
                                                        <p className="text-[11px] text-slate-500 leading-relaxed">
                                                            <span className="font-bold text-slate-600">Incluye:</span> {formatInlineList(it.includes)}
                                                        </p>
                                                    )}
                                                    {it.deliverables && it.deliverables.length > 0 && (
                                                        <p className="text-[11px] text-slate-500 leading-relaxed">
                                                            <span className="font-bold text-slate-600">Entregables:</span> {formatInlineList(it.deliverables)}
                                                        </p>
                                                    )}
                                                    {it.timeline && (
                                                        <p className="text-[11px] text-slate-500 leading-relaxed">
                                                            <span className="font-bold text-slate-600">Timeline:</span> {it.timeline}
                                                        </p>
                                                    )}
                                                    {it.result && (
                                                        <p className="text-[11px] text-slate-500 leading-relaxed">
                                                            <span className="font-bold text-slate-600">Resultado:</span> {it.result}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <input type="number" value={it.quantity} onChange={e => updateItem(it.id, 'quantity', parseInt(e.target.value) || 0)} className="w-12 bg-slate-50 border border-slate-200 rounded p-1.5 text-center text-xs font-bold transition-all focus:ring-1 focus:ring-blue-400 outline-none" />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1.5 justify-end">
                                                    <span className="text-[10px] text-slate-400 font-bold">$</span>
                                                    <input type="number" value={it.price} onChange={e => updateItem(it.id, 'price', parseFloat(e.target.value) || 0)} className="w-24 bg-slate-50 border border-slate-200 rounded p-1.5 text-right text-xs font-bold transition-all focus:ring-1 focus:ring-blue-400 outline-none" />
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right font-black text-slate-900 text-sm">
                                                ${(it.price * it.quantity).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <button onClick={() => removeItem(it.id)} className="text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><FaTrash size={14} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {selectedItems.length === 0 && <div className="py-12 text-center text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-lg mt-4">Añade ítems para empezar la cotización</div>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Objetivos del Proyecto</label>
                            <textarea value={formData.project_objective} onChange={e => setFormData({...formData, project_objective: e.target.value})} placeholder="Describe brevemente la visión del proyecto..." className="w-full h-32 bg-slate-50 border border-slate-100 rounded-lg p-4 text-sm text-slate-700 outline-none focus:border-blue-300 transition-all resize-none" />
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Notas Internas</label>
                            <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Instrucciones especiales..." className="w-full h-32 bg-slate-50 border border-slate-100 rounded-lg p-4 text-sm text-slate-700 outline-none focus:border-blue-300 transition-all resize-none" />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-md sticky top-28">
                        <h4 className="text-sm font-bold text-slate-900 mb-8 border-b border-slate-50 pb-4 flex items-center gap-2"><FaMoneyBillWave className="text-emerald-500" /> Resumen</h4>
                        <div className="space-y-4 mb-10">
                            <SummaryRow label="Subtotal" value={totals.subtotal} />
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-slate-500">Dto. (%)</span>
                                <input type="number" value={discount} onChange={e => setDiscount(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))} className="w-16 bg-slate-50 border border-slate-200 rounded p-1.5 text-right text-xs font-bold outline-none" />
                            </div>
                            <SummaryRow label={`IVA (${tax}%)`} value={totals.taxAmt} />
                            
                            <div className="pt-8 mt-4 border-t-2 border-slate-50">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-900">Total Final</span>
                                    <span className="text-3xl font-black text-blue-600 tracking-tighter">${totals.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                                <p className="text-right text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{formData.currency}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button onClick={submit} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3 transition-all active:scale-95">
                                <FaCheck /> Generar Cotización
                            </button>
                            <button onClick={() => setShowPreview(true)} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-3.5 rounded-xl border border-slate-200 text-xs transition-all">Vista Previa</button>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showPreview && <PreviewModal formData={formData} items={selectedItems} totals={totals} onClose={() => setShowPreview(false)} />}
            </AnimatePresence>
        </motion.div>
    );
}

// --- 📋 LIST VIEW ---
function ListView({ quotes, onSelect, onEdit, onClone, onDelete }: { quotes: Quote[], onSelect: (q: Quote) => void, onEdit: (q: Quote) => void, onClone: (q: Quote) => void, onDelete: (q: Quote) => void }) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    
    const filtered = quotes.filter(q => {
        const matchesSearch = q.client_name?.toLowerCase().includes(search?.toLowerCase() || "") || q.client_company?.toLowerCase().includes(search?.toLowerCase() || "");
        const matchesStatus = statusFilter === "ALL" || q.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-2 rounded-xl flex items-center gap-4 shadow-sm">
                <div className="relative flex-1">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por cliente o empresa..." className="w-full bg-transparent pl-12 pr-4 py-3 text-sm text-slate-900 outline-none" />
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-transparent text-sm font-bold text-slate-600 outline-none px-4 py-3 cursor-pointer">
                    <option value="ALL">Todos los Estados</option>
                    <option value="Pending">Borrador / Pendiente</option>
                    <option value="Sent">Enviada</option>
                    <option value="Approved">Aceptada</option>
                    <option value="Rejected">Rechazada</option>
                </select>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left font-sans">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b">
                        <tr><th className="px-6 py-5">Folio</th><th className="px-6 py-5">Cliente</th><th className="px-6 py-5 text-center">Estado</th><th className="px-6 py-5 text-right">Monto</th><th className="px-6 py-5"></th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.map(q => (
                            <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-5 font-bold text-slate-900">{q.quote_number}</td>
                                <td className="px-6 py-5 font-bold text-slate-600">{q.client_name}</td>
                                <td className="px-6 py-5 text-center"><span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${STATUS_THEME[q.status]}`}>{q.status}</span></td>
                                <td className="px-6 py-5 text-right font-black text-slate-900">${q.final_total.toLocaleString()}</td>
                                <td className="px-6 py-5 text-right flex items-center justify-end gap-1">
                                    <button onClick={(e) => { e.stopPropagation(); onEdit(q); }} className="p-2 text-slate-400 hover:text-blue-600 transition-all rounded hover:bg-slate-50" title="Editar"><FaEdit size={14}/></button>
                                    <button onClick={(e) => { e.stopPropagation(); onClone(q); }} className="p-2 text-slate-400 hover:text-emerald-600 transition-all rounded hover:bg-slate-50" title="Duplicar"><FaRegCopy size={14}/></button>
                                    <button onClick={(e) => { e.stopPropagation(); onDelete(q); }} className="p-2 text-slate-400 hover:text-red-600 transition-all rounded hover:bg-slate-50" title="Eliminar"><FaTrash size={14}/></button>
                                    <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                    <button onClick={() => onSelect(q)} className="p-2 text-slate-400 hover:text-slate-900 transition-all rounded hover:bg-slate-50" title="Ver Detalle"><FaExternalLinkAlt size={14}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// --- 💬 LEADS VIEW ---
function LeadsView({ leads, onConvert }: { leads: Lead[], onConvert: (l: Lead) => void }) {
    if (!leads || leads.length === 0) return (
        <div className="flex flex-col items-center justify-center py-32 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
                <FaUsers size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No hay Leads todavía</h3>
            <p className="text-sm font-medium text-slate-500 max-w-sm">Aquí aparecerán todos los clientes potenciales que te contacten a través del formulario de tu sitio web.</p>
        </div>
    );

    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Table Header Wrapper */}
            <div className="bg-slate-50/80 border-b border-slate-200 px-8 py-4 hidden lg:grid lg:grid-cols-12 gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <div className="col-span-3">Contacto / Empresa</div>
                <div className="col-span-4">Mensaje / Requerimiento</div>
                <div className="col-span-2">Fecha Recepción</div>
                <div className="col-span-3 text-right">Acciones de Gestión</div>
            </div>

            <div className="divide-y divide-slate-100">
                {leads.map((l, idx) => (
                    <motion.div 
                        key={l.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="px-8 py-6 hover:bg-slate-50/50 transition-all group flex flex-col lg:grid lg:grid-cols-12 gap-4 items-center"
                    >
                        {/* Contact Column */}
                        <div className="col-span-3 flex items-center gap-4 w-full">
                            <div className="w-11 h-11 rounded-xl bg-blue-600/5 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-600/10 shrink-0">
                                {l.nombre ? l.nombre[0].toUpperCase() : '?'}
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-sm font-extrabold text-slate-900 truncate tracking-tight">{l.nombre || 'Desconocido'}</h4>
                                <p className="text-[11px] font-bold text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                                    <FaEnvelope className="text-[9px]" /> {l.email || 'Sin registro'}
                                </p>
                            </div>
                        </div>

                        {/* message Preview */}
                        <div className="col-span-4 w-full">
                            <div className="p-3 bg-slate-50/50 rounded-lg border border-slate-100 group-hover:bg-white group-hover:border-blue-100 transition-all">
                                <p className="text-xs text-slate-600 italic line-clamp-2 leading-relaxed">
                                    "{l.mensaje || 'Sin reporte de mensaje'}"
                                </p>
                            </div>
                        </div>

                        {/* Date Column */}
                        <div className="col-span-2 w-full lg:w-auto">
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-slate-900">
                                    {l.created_at ? new Date(l.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Vía Formulario Web</span>
                            </div>
                        </div>

                        {/* Actions Column */}
                        <div className="col-span-3 flex items-center justify-end gap-2 w-full lg:w-auto">
                            {l.telefono && (
                                <a 
                                    href={`https://wa.me/${l.telefono.replace(/\+/g, '').replace(/\s/g, '')}`} 
                                    target="_blank"
                                    className="p-2.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all border border-transparent hover:border-emerald-100"
                                    title="Contactar vía WhatsApp"
                                >
                                    <FaPhone className="text-sm" />
                                </a>
                            )}
                            <button 
                                onClick={() => onConvert(l)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-black uppercase tracking-wider shadow-lg shadow-blue-600/10 transition-all active:scale-95 whitespace-nowrap"
                            >
                                <FaRegHandshake size={14} />
                                Convertir a Cotización
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// --- 📄 DOCUMENT VIEW ---
function DocumentView({ quote, onBack }: { quote: Quote, onBack: () => void }) {
    const [sending, setSending] = useState(false);
    const sendEmail = async () => {
        if (!confirm("¿Confirmar envío comercial?")) return;
        setSending(true);
        try { await adminFetch(`/api/proposals/${quote.id}/send-email`, { method: "POST" }); alert("Propuesta enviada."); } catch (err) { console.error(err); } finally { setSending(false); }
    };

    const showTracking = ["Sent", "Approved", "Rejected"].includes(String(quote.status || ""));
    return (
        <div className="space-y-10">
             <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-sm print:hidden">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-bold px-4 py-2"><FaArrowLeft /> Listado</button>
                <div className="flex gap-2">
                    <button onClick={() => window.print()} className="p-2.5 text-slate-400 hover:text-slate-900"><FaPrint size={18}/></button>
                    {showTracking && (
                        <Link
                            href={`/admin/cotizaciones/${quote.id}/seguimiento`}
                            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-all inline-flex items-center gap-2"
                        >
                            <FaCogs size={12} /> Panel operativo (admin)
                        </Link>
                    )}
                    {quote.public_token && (
                        <a
                            href={`/cotizacion/${quote.public_token}/seguimiento`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all inline-flex items-center gap-2"
                        >
                            <FaExternalLinkAlt size={12} /> Vista cliente (pública)
                        </a>
                    )}
                    <button onClick={sendEmail} disabled={sending} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all">Enviar por Email</button>
                </div>
            </div>
            <div className="bg-white p-20 shadow-xl border border-slate-100 max-w-5xl mx-auto rounded-sm print:shadow-none">
                 <div className="flex justify-between items-start mb-20 pb-12 border-b-2 border-slate-900 font-sans">
                     <div><div className="w-16 h-16 bg-blue-600 rounded flex items-center justify-center text-white text-3xl font-black mb-4">E</div><h2 className="text-xl font-bold text-slate-900 uppercase">Cotización Comercial</h2><p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Engineering Agency Enterprise</p></div>
                     <div className="text-right">
                        <div><p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Folio</p><h4 className="text-5xl font-black text-slate-950 tracking-tighter">{quote.quote_number}</h4></div>
                        {quote.public_token && (
                            <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold print:hidden">
                                <FaRegCopy /> Token Asignado
                            </div>
                        )}
                     </div>
                 </div>
                 <div className="grid grid-cols-2 gap-20 mb-20">
                     <div className="bg-slate-50 p-8 rounded-lg uppercase font-bold text-xs"><h5 className="text-[10px] text-slate-400 tracking-widest mb-4">Receptor</h5><p className="text-lg text-slate-900">{quote.client_name}</p><p className="text-slate-500 mb-4">{quote.client_company}</p><p>{quote.client_email}</p></div>
                     <div className="text-right flex flex-col justify-end"><SummaryRow label="Subtotal" value={quote.subtotal} /><SummaryRow label="Dto" value={quote.discount_amount} /><SummaryRow label="IVA" value={quote.tax_amount} /><div className="h-px bg-slate-200 my-4" /><div className="flex justify-between items-end"><span className="text-xs font-bold uppercase text-slate-900">Total Neto</span><span className="text-4xl font-black text-blue-600 tracking-tighter">${quote.final_total?.toLocaleString()}</span></div></div>
                 </div>
                 <div className="mb-20">
                     <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-100 pb-2">Conceptos</h5>
                     <table className="w-full text-left font-sans italic text-sm">
                        <thead className="bg-slate-50/50"><tr><th className="py-2">Servicio</th><th className="py-2 text-center">Cant</th><th className="py-2 text-right">Monto</th></tr></thead>
                         <tbody className="divide-y">
                              {parseQuoteItems(quote.items).map((item, i) => (
                                  <tr key={i}>
                                      <td className="py-6 align-top">
                                          <p className="font-bold text-slate-900 not-italic">{item.name}</p>
                                          {item.description && <p className="text-xs font-normal text-slate-400 not-italic mt-1">{item.description}</p>}
                                          <div className="mt-2 flex flex-wrap gap-2">
                                              {item.service_type && <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700 not-italic">{item.service_type}</span>}
                                              {item.category && <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-600 not-italic">{item.category}</span>}
                                          </div>
                                          <div className="mt-2 space-y-1 not-italic">
                                              {item.includes && item.includes.length > 0 && <p className="text-[11px] text-slate-500"><span className="font-bold text-slate-600">Incluye:</span> {formatInlineList(item.includes)}</p>}
                                              {item.deliverables && item.deliverables.length > 0 && <p className="text-[11px] text-slate-500"><span className="font-bold text-slate-600">Entregables:</span> {formatInlineList(item.deliverables)}</p>}
                                              {item.timeline && <p className="text-[11px] text-slate-500"><span className="font-bold text-slate-600">Timeline:</span> {item.timeline}</p>}
                                              {item.ideal_for && <p className="text-[11px] text-slate-500"><span className="font-bold text-slate-600">Ideal para:</span> {item.ideal_for}</p>}
                                              {item.result && <p className="text-[11px] text-slate-500"><span className="font-bold text-slate-600">Resultado:</span> {item.result}</p>}
                                          </div>
                                      </td>
                                      <td className="py-6 text-center align-top">{item.quantity}</td>
                                      <td className="py-6 text-right font-black align-top">${(item.price * item.quantity).toLocaleString()}</td>
                                  </tr>
                               ))}
                         </tbody>
                     </table>
                 </div>

            </div>
            {showTracking && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm print:hidden max-w-5xl mx-auto">
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Seguimiento del proyecto</h5>
                    <p className="text-sm text-slate-600 mt-2 max-w-2xl">
                        Hay dos vistas diferentes: la <strong className="font-semibold text-slate-800">vista pública</strong> para que el cliente vea el avance,
                        y el <strong className="font-semibold text-slate-800">panel operativo</strong> donde gestionas fases, informes y enlaces.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                            href={`/admin/cotizaciones/${quote.id}/seguimiento`}
                            className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition-all"
                        >
                            <FaCogs size={12} /> Abrir panel operativo (admin)
                        </Link>
                        {quote.public_token && (
                            <a
                                href={`/cotizacion/${quote.public_token}/seguimiento`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-slate-100 text-slate-800 px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all"
                            >
                                <FaExternalLinkAlt size={12} /> Abrir vista cliente (pública)
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// --- 🛠️ HELPERS ---
function InputField({ label, value, onChange, placeholder = "" }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) {
    return (
        <div className="space-y-2"><label className="text-[10px] font-bold uppercase text-slate-500 tracking-wide ml-1">{label}</label><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all" /></div>
    );
}

function SummaryRow({ label, value }: { label: string, value: number }) {
    return (
        <div className="flex justify-between text-sm font-medium"><span className="text-slate-500">{label}</span><span className="text-slate-900 font-bold">${value.toLocaleString()}</span></div>
    );
}

function PreviewModal({ formData, items, totals, onClose }: { formData: any, items: QuoteItem[], totals: any, onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 md:p-10">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-5xl h-full max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50"><div><h3 className="text-sm font-bold text-slate-900">Vista Previa</h3><p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Simulación comercial</p></div><button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-all"><FaTimes className="text-slate-400" /></button></div>
                <div className="flex-1 overflow-y-auto p-12 bg-white">
                    <div className="border border-slate-100 p-16 shadow-inner rounded-sm bg-white">
                        <div className="flex justify-between items-start mb-16 pb-10 border-b-2 border-slate-900"><div className="space-y-4"><div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center text-white text-2xl font-black">E</div><h2 className="text-lg font-bold text-slate-900 uppercase">Cotización Comercial</h2></div><div className="text-right"><h4 className="text-4xl font-black text-slate-950 tracking-tighter">QT-PREVIEW</h4></div></div>
                        <div className="grid grid-cols-2 gap-12 mb-16"><div className="italic text-xs"><h5 className="text-[9px] font-bold text-slate-400 uppercase mb-3">Receptor</h5><p className="text-base font-bold text-slate-900">{formData.client_name || "[Cliente]"}</p><p className="text-sm text-slate-500">{formData.client_company}</p></div><div className="text-right space-y-2"><SummaryRow label="Subtotal" value={totals.subtotal} /><SummaryRow label="Dto" value={totals.discAmt} /><div className="flex justify-between text-base font-black text-blue-600 mt-4"><span>Total:</span><span>${totals.total.toLocaleString()}</span></div></div></div>
                        <table className="w-full text-left italic border-t pt-4"><thead><tr className="text-[10px] uppercase text-slate-400"><th>Servicio</th><th className="text-center">Cant</th><th className="text-right">Unitario</th></tr></thead>
                        <tbody>{items.map((it, i) => (
                            <tr key={i}>
                                <td className="py-4">
                                    <p className="font-bold">{it.name}</p>
                                    {it.description && <p className="text-[11px] text-slate-500 not-italic">{it.description}</p>}
                                    {it.includes && it.includes.length > 0 && <p className="text-[11px] text-slate-500 not-italic"><span className="font-semibold text-slate-600">Incluye:</span> {formatInlineList(it.includes)}</p>}
                                </td>
                                <td className="py-4 text-center">{it.quantity}</td>
                                <td className="py-4 text-right font-black">${it.price.toLocaleString()}</td>
                            </tr>
                        ))}</tbody></table>
                    </div>
                </div>
                <div className="px-8 py-5 border-t border-slate-100 flex justify-end bg-slate-50"><button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-600/10 active:scale-95">Continuar Editando</button></div>
            </motion.div>
        </div>
    );
}
