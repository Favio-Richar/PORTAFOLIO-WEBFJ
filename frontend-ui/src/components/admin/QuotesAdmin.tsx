"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaChartLine, FaPlus, FaListUl, FaUsers, FaFileAlt, FaCheck,
    FaTrash, FaBuilding, FaMapMarkerAlt, FaPhone, FaChevronRight,
    FaCalculator, FaPrint, FaWhatsapp, FaEnvelope, FaPaperPlane,
    FaSearch, FaArrowLeft, FaExternalLinkAlt, FaQuoteRight,
    FaShieldAlt, FaBriefcase, FaUserShield, FaGlobe, FaMoneyBillWave,
    FaCalendarAlt, FaUniversity, FaFileInvoice, FaFileSignature,
    FaClock
} from "react-icons/fa";

// --- Types ---
interface Service {
    id: number;
    name: string;
    category: string;
    price: number;
    description: string;
    quantity?: number;
    customPrice?: number;
}

interface Quote {
    id: string;
    quote_number: string;
    // --- Client Info ---
    client_name: string;
    client_company: string;
    client_rfc: string;
    client_email: string;
    client_phone: string;
    client_address: string;
    // --- Project Info ---
    currency: string;
    urgency_level: "Standard" | "Medium" | "High" | "Critical";
    valid_days: number;
    lead_time: string;
    // --- Financials ---
    services: Service[];
    subtotal: number;
    discount_percent: number;
    discount_amount: number;
    tax_percent: number;
    tax_amount: number;
    final_total: number;
    // --- Legal/Bank ---
    bank_name: string;
    bank_account: string;
    bank_clabe: string;
    payment_terms: string;
    notes: string;
    // --- Metadata ---
    created_at: string;
    valid_until: string;
    status: "Pending" | "Approved" | "Rejected" | "Expired";
}

// --- Enterprise Catalog ---
const ELITE_SERVICES: Service[] = [
    { id: 1, name: 'Cloud Infrastructure Architecture', category: 'Consulting', price: 3500, description: 'Scalable cloud design with high availability and security.' },
    { id: 2, name: 'Full-Stack Enterprise Platform', category: 'Development', price: 12000, description: 'Custom end-to-end software solution for large-scale operations.' },
    { id: 3, name: 'Mobile App Ecosystem (iOS/Android)', category: 'Development', price: 9500, description: 'Cross-platform mobile experience with native performance.' },
    { id: 4, name: 'Cybersecurity & Compliance Audit', category: 'Security', price: 2800, description: 'Rigorous penetration testing and risk assessment.' },
    { id: 5, name: 'Advanced AI & Data Analytics', category: 'AI', price: 5500, description: 'Neural network training and predictive model integration.' },
    { id: 6, name: 'Retainer: Managed Operations (Monthly)', category: 'Retainer', price: 1800, description: 'Continuous maintenance, updates, and 24/7 technical support.' }
];

const CURRENCIES = ["USD", "MXN", "EUR"];
const URGENCY_LEVELS = ["Standard", "Medium", "High", "Critical"];

export default function QuotesAdmin() {
    const [activeView, setActiveView] = useState<"dashboard" | "new" | "list" | "detail" | "clients">("dashboard");
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("enterprise_quotes_v1");
        if (saved) setQuotes(JSON.parse(saved));
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) localStorage.setItem("enterprise_quotes_v1", JSON.stringify(quotes));
    }, [quotes, isLoaded]);

    const stats = useMemo(() => ({
        revenue: quotes.reduce((acc, q) => acc + q.final_total, 0),
        count: quotes.length,
        active: quotes.filter(q => q.status === "Pending").length,
        converted: quotes.filter(q => q.status === "Approved").length,
        clients: new Set(quotes.map(q => q.client_email)).size
    }), [quotes]);

    if (!isLoaded) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Navigation Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-12 border-b border-white/10 print:hidden relative">
                <div className="absolute top-0 left-0 w-64 h-32 bg-red-600/5 blur-[100px] pointer-events-none" />
                <div>
                    <h1 className="text-5xl font-black text-white tracking-tighter flex items-center gap-6">
                        <span className="bg-red-600 px-6 py-2 rounded-2xl text-white font-black text-3xl shadow-3xl shadow-red-600/40 transform -skew-x-6">ELITE</span>
                        <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">SALES OPS</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-black uppercase tracking-[0.5em] mt-4 ml-1 opacity-80">Intelligence & Revenue Architecture</p>
                </div>

                <div className="flex bg-slate-900/40 backdrop-blur-3xl border border-white/10 p-2 rounded-[2rem] shadow-4xl">
                    {[
                        { id: "dashboard", icon: <FaChartLine />, label: "Market Overview" },
                        { id: "new", icon: <FaPlus />, label: "Deploy Proposal" },
                        { id: "list", icon: <FaListUl />, label: "Ledger Archive" },
                        { id: "clients", icon: <FaUsers />, label: "Global CRM" }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveView(tab.id as any); setSelectedQuote(null); }}
                            className={`flex items-center gap-4 px-10 py-5 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all duration-500 relative group overflow-hidden ${activeView === tab.id
                                ? "bg-red-600 text-white shadow-2xl shadow-red-600/40 scale-105"
                                : "text-slate-500 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <span className={`text-xl ${activeView === tab.id ? "animate-pulse" : "group-hover:scale-110 transition-transform"}`}>{tab.icon}</span>
                            <span className="hidden xl:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeView === "dashboard" && <DashboardView key="dash" stats={stats} recentQuotes={quotes.slice(0, 5)} onSelect={(q) => { setSelectedQuote(q); setActiveView("detail"); }} />}
                {activeView === "new" && <ComposerView key="new" setActiveView={setActiveView} onSave={(q) => { setQuotes([q, ...quotes]); setActiveView("list"); }} />}
                {activeView === "list" && <ListView key="list" quotes={quotes} onSelect={(q) => { setSelectedQuote(q); setActiveView("detail"); }} />}
                {activeView === "detail" && selectedQuote && (
                    <DocumentView
                        key="doc"
                        quote={selectedQuote}
                        onBack={() => setActiveView("list")}
                        onUpdateStatus={(st) => {
                            const updated = quotes.map(q => q.id === selectedQuote.id ? { ...q, status: st } : q);
                            setQuotes(updated as Quote[]);
                            setSelectedQuote({ ...selectedQuote, status: st } as any);
                        }}
                    />
                )}
                {activeView === "clients" && (
                    <CRMView
                        key="crm"
                        quotes={quotes}
                        onSelectClient={(email: string) => {
                            // Encontrar la última cotización de este cliente para mostrar el detalle
                            const last = quotes.find(q => q.client_email === email);
                            if (last) { setSelectedQuote(last); setActiveView("detail"); }
                        }}
                        onDeleteClient={(email: string) => {
                            if (confirm("Are you sure you want to delete all operation records for this entity?")) {
                                setQuotes(quotes.filter(q => q.client_email !== email));
                            }
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// --- Dashboard Component ---
function DashboardView({ stats, recentQuotes, onSelect }: { stats: any, recentQuotes: Quote[], onSelect: (q: Quote) => void }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                {[
                    { label: "Active Pipeline", val: `$${recentQuotes.filter(q => q.status === 'Pending').reduce((a, b) => a + b.final_total, 0).toLocaleString()}`, icon: <FaChartLine />, sub: "Revenue at Risk", color: "from-red-600 to-red-900" },
                    { label: "Conversion Rate", val: `${recentQuotes.length > 0 ? Math.round((recentQuotes.filter(q => (q.status as string) === 'Approved').length / recentQuotes.length) * 100) : 0}%`, icon: <FaCheck />, sub: "Strategic Growth", color: "from-slate-800 to-slate-950" },
                    { label: "Market Entities", val: new Set(recentQuotes.filter(q => q.client_email).map(q => q.client_email)).size, icon: <FaUsers />, sub: "Active Portfolio", color: "from-slate-800 to-slate-950" },
                    { label: "Portfolio Yield", val: `$${recentQuotes.reduce((a, b) => a + b.final_total, 0).toLocaleString()}`, icon: <FaMoneyBillWave />, sub: "Historical Asset Val", color: "from-slate-800 to-slate-950" }
                ].map((s, i) => (
                    <div key={i} className={`bg-slate-900/60 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] relative overflow-hidden group hover:border-red-600/50 transition-all shadow-3xl`}>
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[60px] rounded-full group-hover:bg-red-600/20 transition-all duration-1000`} />
                        <div className="relative z-10 flex flex-col gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center text-red-500 text-2xl shadow-inner">{s.icon}</div>
                            <div>
                                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">{s.label}</p>
                                <h4 className="text-4xl font-black text-white tracking-tighter leading-none mb-2 bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">{s.val}</h4>
                                <p className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest">{s.sub}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-12 shadow-4xl">
                    <h2 className="text-2xl font-black text-white mb-10 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-slate-500 shadow-inner"><FaClock size={16} /></div>
                        Strategic Ledger Archive
                    </h2>
                    <div className="space-y-6">
                        {recentQuotes.length === 0 ? (
                            <div className="py-24 text-center">
                                <FaFileAlt className="text-slate-800 text-6xl mx-auto mb-6 opacity-20" />
                                <p className="text-slate-600 text-sm font-black uppercase tracking-[0.3em]">No active records available</p>
                            </div>
                        ) : (
                            recentQuotes.map(q => (
                                <div key={q.id} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-red-600/[0.03] hover:border-red-600/20 transition-all duration-500">
                                    <div className="flex items-center gap-8">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center text-red-500 text-2xl group-hover:scale-110 transition-transform shadow-2xl"><FaQuoteRight /></div>
                                        <div>
                                            <h4 className="font-black text-xl text-white tracking-tight mb-1">{q.client_name}</h4>
                                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] flex items-center gap-3">
                                                <span className="text-red-500/80">{q.client_company}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                <span>{q.quote_number}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-10">
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-white tracking-tighter">${q.final_total.toLocaleString()}</p>
                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{q.currency} · NET YIELD</span>
                                        </div>
                                        <button onClick={() => onSelect(q)} className="w-14 h-14 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center text-slate-500 hover:bg-red-600 hover:text-white hover:border-red-500 transition-all duration-500 shadow-xl"><FaChevronRight size={14} /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-red-600/10 border border-red-500/20 p-8 rounded-[2.5rem]">
                        <h3 className="text-xs font-black text-red-400 uppercase tracking-widest mb-4">Security Protocol</h3>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium">All financial data is processed under RSA encryption standards. Proposals are cryptographically signed for verification.</p>
                    </div>
                    <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem]">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Quick Insights</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-bold uppercase">Avg. Deal Size:</span>
                                <span className="text-white font-bold">${stats.count > 0 ? (stats.revenue / stats.count).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-bold uppercase">Active Entities:</span>
                                <span className="text-white font-bold">{stats.clients}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// --- Multi-Step Composer ---
function ComposerView({ onSave, setActiveView }: {
    onSave: (q: Quote) => void,
    setActiveView: (v: "dashboard" | "new" | "list" | "detail" | "clients") => void
}) {
    const [step, setStep] = useState(1);
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);
    const [discount, setDiscount] = useState(0);
    const [tax, setTax] = useState(16);
    const [formData, setFormData] = useState({
        client_name: "", client_company: "", client_rfc: "", client_email: "", client_phone: "", client_address: "",
        currency: "USD", urgency_level: "Standard" as Quote["urgency_level"], valid_days: 30, lead_time: "4-6 Weeks",
        bank_name: "JPMorgan Chase / Global", bank_account: "8829-1002-XXXX", bank_clabe: "0123 4567 8901 2345 67",
        payment_terms: "50% Upfront, 50% on Launch", notes: "", terms: ""
    });

    const totals = useMemo(() => {
        const subtotal = selectedServices.reduce((acc, s) => acc + (s.customPrice! * s.quantity!), 0);
        const discAmt = subtotal * (discount / 100);
        const taxAmt = (subtotal - discAmt) * (tax / 100);
        return { subtotal, discountAmount: discAmt, taxAmount: taxAmt, total: subtotal - discAmt + taxAmt };
    }, [selectedServices, discount, tax]);

    const handleAdd = (id: string) => {
        const s = ELITE_SERVICES.find(x => x.id === parseInt(id));
        if (s && !selectedServices.find(x => x.id === s.id)) {
            setSelectedServices([...selectedServices, { ...s, quantity: 1, customPrice: s.price }]);
        }
    };

    const execute = () => {
        const quote: Quote = {
            id: `QT-${Date.now()}`,
            quote_number: `QT-26-${Math.floor(100 + Math.random() * 899)}`,
            ...formData,
            services: selectedServices,
            subtotal: totals.subtotal,
            discount_percent: discount,
            discount_amount: totals.discountAmount,
            tax_percent: tax,
            tax_amount: totals.taxAmount,
            final_total: totals.total,
            created_at: new Date().toISOString(),
            valid_until: new Date(Date.now() + formData.valid_days * 24 * 60 * 60 * 1000).toISOString(),
            status: "Pending"
        };
        onSave(quote);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 pb-20 items-start">
            <div className="lg:col-span-3 space-y-12">
                {/* Progress Bar */}
                <div className="flex gap-4 print:hidden">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`flex-1 h-2 rounded-full transition-all duration-500 ${step >= i ? 'bg-red-600 shadow-lg shadow-red-600/30' : 'bg-white/10'}`} />
                    ))}
                </div>

                <section className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-12 backdrop-blur-3xl">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                                <div className="flex items-center justify-between mb-8">
                                    <Header title="Legal Identity" subtitle="Acquisition of client fiscal information" icon={<FaUserShield />} />
                                    <button
                                        onClick={() => setActiveView("clients")}
                                        className="px-6 py-3 rounded-xl bg-red-600/10 border border-red-500/30 text-red-500 text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                                    >
                                        Load from CRM
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <InputField label="Entity / Client Name" val={formData.client_name} set={(v: string) => setFormData({ ...formData, client_name: v })} icon={<FaUsers />} />
                                    <InputField label="Official Company Name" val={formData.client_company} set={(v: string) => setFormData({ ...formData, client_company: v })} icon={<FaBuilding />} />
                                    <InputField label="Fiscal RFC / Tax ID" val={formData.client_rfc} set={(v: string) => setFormData({ ...formData, client_rfc: v })} icon={<FaFileContract />} />
                                    <InputField label="Primary Email" val={formData.client_email} set={(v: string) => setFormData({ ...formData, client_email: v })} icon={<FaEnvelope />} />
                                    <InputField label="Direct Contact (WhatsApp Number)" val={formData.client_phone} set={(v: string) => setFormData({ ...formData, client_phone: v })} icon={<FaPhone />} />
                                    <InputField label="Fiscal Address" val={formData.client_address} set={(v: string) => setFormData({ ...formData, client_address: v })} icon={<FaMapMarkerAlt />} />
                                </div>
                                <div className="pt-8 border-t border-white/5 flex justify-end">
                                    <button onClick={() => setStep(2)} className="px-12 py-5 rounded-2xl bg-red-600 text-white font-black text-sm uppercase tracking-widest hover:scale-105 shadow-2xl shadow-red-600/30 transition-all">Proceed to Strategy</button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                                <Header title="Mission Architecture" subtitle="Selection of service modules and operational terms" icon={<FaCalculator />} />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-black/20 p-8 rounded-3xl border border-white/5">
                                    <Select label="Financial Currency" val={formData.currency} set={(v: string) => setFormData({ ...formData, currency: v })} options={CURRENCIES} />
                                    <Select label="Mission Urgency" val={formData.urgency_level} set={(v: string) => setFormData({ ...formData, urgency_level: v as Quote["urgency_level"] })} options={URGENCY_LEVELS} />
                                    <InputField label="Lead Time / delivery" val={formData.lead_time} set={(v: string) => setFormData({ ...formData, lead_time: v })} icon={<FaClock />} />
                                    <div className="space-y-4">
                                        <label className="text-xs font-black uppercase text-slate-500 tracking-widest ml-1">Validity (Days)</label>
                                        <input type="number" value={formData.valid_days} onChange={e => setFormData({ ...formData, valid_days: parseInt(e.target.value) || 30 })} className="w-full bg-slate-950 border border-white/10 p-6 rounded-2xl text-white outline-none focus:border-red-600 font-bold text-lg" />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <select onChange={e => handleAdd(e.target.value)} className="w-full bg-slate-950 border border-red-600/30 rounded-3xl px-8 py-6 text-base font-black text-white outline-none cursor-pointer focus:border-red-600 transition-all">
                                        <option value="">+ ADD SERVICE MODULE FROM ELITE CATALOG</option>
                                        {ELITE_SERVICES.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()} - ${s.price}</option>)}
                                    </select>
                                    <div className="space-y-4">
                                        {selectedServices.map(s => (
                                            <div key={s.id} className="p-8 rounded-3xl bg-black/40 border border-white/5 flex flex-wrap items-center justify-between gap-6">
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-lg text-white mb-2">{s.name}</h4>
                                                    <p className="text-xs text-slate-500 font-medium">{s.description}</p>
                                                </div>
                                                <div className="flex items-center gap-8">
                                                    <div className="text-center">
                                                        <p className="text-[8px] font-black text-slate-600 uppercase mb-2">Units</p>
                                                        <input type="number" value={s.quantity} onChange={e => setSelectedServices(selectedServices.map(x => x.id === s.id ? { ...x, quantity: parseInt(e.target.value) || 1 } : x))} className="w-16 bg-slate-950 border border-white/10 p-3 rounded-xl text-center text-sm font-bold text-white outline-none" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[8px] font-black text-slate-600 uppercase mb-2">Rate</p>
                                                        <input type="number" value={s.customPrice} onChange={e => setSelectedServices(selectedServices.map(x => x.id === s.id ? { ...x, customPrice: parseFloat(e.target.value) || 1 } : x))} className="w-28 bg-slate-950 border border-white/10 p-3 rounded-xl text-center text-sm font-bold text-red-500 outline-none" />
                                                    </div>
                                                    <button onClick={() => setSelectedServices(selectedServices.filter(x => x.id !== s.id))} className="text-red-500 hover:scale-125 transition-transform"><FaTrash /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-white/5 flex justify-between">
                                    <button onClick={() => setStep(1)} className="px-10 py-5 rounded-2xl border border-white/10 text-slate-400 font-bold text-sm uppercase tracking-widest hover:bg-white/5 transition-all">Back</button>
                                    <button onClick={() => setStep(3)} className="px-12 py-5 rounded-2xl bg-red-600 text-white font-black text-sm uppercase tracking-widest hover:scale-105 shadow-2xl shadow-red-600/30 transition-all">Proceed to Financials</button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                                <Header title="Settlement Protocol" subtitle="Terms of payment and bank authorization details" icon={<FaUniversity />} />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-8">
                                        <InputField label="Bank Name" val={formData.bank_name} set={(v: string) => setFormData({ ...formData, bank_name: v })} icon={<FaUniversity />} />
                                        <InputField label="Account Number" val={formData.bank_account} set={(v: string) => setFormData({ ...formData, bank_account: v })} icon={<FaMoneyBillWave />} />
                                        <InputField label="CLABE (Interbank)" val={formData.bank_clabe} set={(v: string) => setFormData({ ...formData, bank_clabe: v })} icon={<FaGlobe />} />
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest ml-1">Payment Terms</label>
                                            <textarea value={formData.payment_terms} onChange={e => setFormData({ ...formData, payment_terms: e.target.value })} className="w-full h-32 bg-slate-950 border border-white/10 p-5 rounded-2xl text-sm font-medium text-slate-300 outline-none resize-none focus:border-red-600" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest ml-1">Strategic Project Notes</label>
                                            <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full h-32 bg-slate-950 border border-white/10 p-5 rounded-2xl text-sm font-medium text-slate-300 outline-none resize-none focus:border-red-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-white/5 flex justify-between">
                                    <button onClick={() => setStep(2)} className="px-10 py-5 rounded-2xl border border-white/10 text-slate-400 font-bold text-sm uppercase tracking-widest hover:bg-white/5 transition-all">Back</button>
                                    <button onClick={execute} className="px-12 py-5 rounded-full bg-red-600 text-white font-black text-base uppercase tracking-widest hover:scale-105 shadow-2xl shadow-red-600/40 transition-all flex items-center gap-4">
                                        <FaPaperPlane /> Deploy Final Proposal
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            </div>

            {/* Financial Sidebar Summary */}
            <div className="lg:col-span-1 sticky top-32 space-y-8">
                <div className="bg-slate-950 border-2 border-red-600/40 p-10 rounded-[3rem] shadow-4xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/10 blur-[80px] rounded-full group-hover:bg-red-600/20 transition-all duration-700" />
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-10 border-b border-white/5 pb-5">Live Recapitulation</h3>

                    <div className="space-y-6 text-xs font-bold uppercase tracking-widest text-slate-500">
                        <div className="flex justify-between"><span>Subtotal:</span><span className="text-white text-base">${totals.subtotal.toLocaleString()}</span></div>
                        <div className="flex items-center justify-between">
                            <span>Benefit %:</span>
                            <input type="number" value={discount} onChange={e => setDiscount(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))} className="w-20 bg-white/5 border border-white/10 rounded-xl p-3 text-center text-white outline-none focus:border-red-600 font-mono text-base" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Tax Rate %:</span>
                            <input type="number" value={tax} onChange={e => setTax(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))} className="w-20 bg-white/5 border border-white/10 rounded-xl p-3 text-center text-white outline-none focus:border-red-600 font-mono text-base" />
                        </div>
                        <div className="flex justify-between text-red-500 pt-2 font-black"><span>Applied IVA:</span><span>+ ${totals.taxAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
                    </div>

                    <div className="mt-12 pt-10 border-t-2 border-white/5">
                        <p className="text-xs font-black text-slate-700 uppercase tracking-[0.3em] mb-4">Allocated Amount</p>
                        <h4 className="text-6xl font-black text-white tracking-tighter leading-none">${totals.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h4>
                        <div className="mt-4 flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse shadow-lg shadow-red-600/50" />
                            <p className="text-xs font-bold text-red-500 uppercase tracking-widest">{formData.currency} · Finalized Net</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 rounded-[2.5rem] border border-white/5 bg-slate-900/40 text-center">
                    <FaShieldAlt className="text-red-500 text-3xl mx-auto mb-4" />
                    <p className="text-[10px] font-black text-slate-500 uppercase leading-relaxed tracking-widest">Authorized generated <br /> encrypted documents only.</p>
                </div>
            </div>
        </div>
    );
}

// --- List View ---
function ListView({ quotes, onSelect }: { quotes: Quote[], onSelect: (q: Quote) => void }) {
    const [search, setSearch] = useState("");
    const filtered = quotes.filter(q => q.client_name.toLowerCase().includes(search.toLowerCase()) || q.client_company.toLowerCase().includes(search.toLowerCase()));

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12 pb-20">
            <div className="flex bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl items-center gap-6 max-w-2xl shadow-3xl">
                <FaSearch className="text-red-500 text-xl ml-2" />
                <input type="text" placeholder="Search operational ledger by entity name..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-white font-black text-base w-full placeholder:text-slate-600 tracking-tight" />
            </div>

            <div className="overflow-hidden bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-4xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-950/50">
                            <th className="px-10 py-8 text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] border-b border-white/5">Operational ID</th>
                            <th className="px-10 py-8 text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] border-b border-white/5">Strategic Partner / Entity</th>
                            <th className="px-10 py-8 text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] border-b border-white/5 text-right">Settlement Yield</th>
                            <th className="px-10 py-8 text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] border-b border-white/5 text-center">Status</th>
                            <th className="px-10 py-8 text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] border-b border-white/5 text-center">Protocol</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {filtered.map(q => (
                            <tr key={q.id} className="group hover:bg-red-600/[0.02] transition-all duration-300">
                                <td className="px-10 py-8 font-black text-red-500 text-base tracking-tighter">{q.quote_number}</td>
                                <td className="px-10 py-8">
                                    <h5 className="font-black text-white text-lg tracking-tight mb-1 group-hover:text-red-500 transition-colors uppercase">{q.client_name}</h5>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{q.client_company}</p>
                                </td>
                                <td className="px-10 py-8 text-right">
                                    <p className="text-2xl font-black text-white tracking-tighter mb-0.5">${q.final_total.toLocaleString()}</p>
                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{q.currency} · NET</span>
                                </td>
                                <td className="px-10 py-8 text-center">
                                    <span className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-2xl ${q.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-600/10 text-red-500 border-red-600/20'}`}>{q.status}</span>
                                </td>
                                <td className="px-10 py-8 text-center">
                                    <button onClick={() => onSelect(q)} className="w-14 h-14 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center text-slate-500 hover:bg-red-600 hover:text-white hover:border-red-500 transition-all duration-500 mx-auto shadow-2xl group-hover:scale-110"><FaChevronRight size={14} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}

// --- Document Detail View (PDF Style) ---
function DocumentView({ quote, onBack, onUpdateStatus }: { quote: Quote, onBack: () => void, onUpdateStatus: (s: Quote["status"]) => void }) {
    const shareWA = () => {
        const text = `*PROPOSAL: ${quote.quote_number}*\n\nHola ${quote.client_name},\n\nHe preparado la propuesta comercial para *${quote.client_company}*.\n\n*Detalles de la Oferta:*\n- Inversión Total: $${quote.final_total.toLocaleString()} ${quote.currency}\n- Tiempo de Entrega: ${quote.lead_time}\n\nPuedes revisar los detalles aquí. ¿Quedo atento a tus comentarios!\n\nSaluda cordialmente,\nElite Ops Management`;
        const phone = quote.client_phone.replace(/\D/g, '');
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
    };

    const shareMail = () => {
        const sub = `Proposal: ${quote.quote_number} - ${quote.client_company}`;
        const body = `Dear ${quote.client_name},\n\nPlease find the project proposal for ${quote.client_company} attached.\n\nInvestment: $${quote.final_total.toLocaleString()} ${quote.currency}\nLead Time: ${quote.lead_time}\n\nBest regards,\nElite Ops Management`;
        window.location.href = `mailto:${quote.client_email}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`;
    };

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-6xl mx-auto space-y-10 pb-40">
            <div className="flex flex-wrap items-center justify-between gap-6 bg-slate-900 border border-white/10 p-6 rounded-[2rem] sticky top-32 z-50 shadow-4xl backdrop-blur-3xl print:hidden">
                <button onClick={onBack} className="flex items-center gap-3 px-8 py-4 rounded-xl text-xs font-black uppercase text-slate-500 hover:text-white transition-all"><FaArrowLeft /> Return to Archive</button>
                <div className="flex items-center gap-4">
                    <button onClick={() => window.print()} className="w-14 h-14 rounded-xl bg-white/5 text-white flex items-center justify-center hover:bg-white hover:text-slate-950 transition-all"><FaPrint size={18} /></button>
                    <button onClick={shareWA} className="px-10 py-5 rounded-xl bg-[#25D366] text-white text-sm font-black uppercase flex items-center gap-4 hover:scale-105 transition-all shadow-xl shadow-green-600/20"><FaWhatsapp size={22} /> Deploy WhatsApp</button>
                    <button onClick={shareMail} className="px-10 py-5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-black uppercase flex items-center gap-4 hover:bg-white/10 transition-all"><FaEnvelope size={20} /> Deploy Mail</button>
                    <div className="w-px h-12 bg-white/10 mx-2" />
                    <button onClick={() => onUpdateStatus("Approved")} className="px-12 py-5 rounded-xl bg-red-600 text-white text-sm font-black uppercase tracking-[0.2em] hover:bg-red-500 transition-all shadow-2xl shadow-red-600/40">Approve Proposal</button>
                </div>
            </div>

            {/* Formal Professional Document (Compact View) */}
            <div className="bg-white text-slate-950 p-10 rounded-xl shadow-5xl border border-slate-200 print:p-0 print:shadow-none print:rounded-none transition-all">
                <div className="max-w-[900px] mx-auto">
                    {/* Header: Company vs Document Info (Ultra Compact) */}
                    <div className="flex justify-between mb-8 pb-6 border-b-2 border-slate-900">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-slate-900 rounded-lg flex items-center justify-center text-white text-xl font-black">EL</div>
                            <div>
                                <h1 className="text-xl font-black tracking-tighter leading-none text-slate-950 uppercase">Elite Ops</h1>
                                <p className="text-[8px] font-black text-red-600 uppercase tracking-[0.4em] mt-1">Next Level Engineering</p>
                                <div className="text-[9px] font-bold text-slate-500 mt-2 flex items-center gap-4">
                                    <span className="flex items-center gap-1 uppercase tracking-tighter"><FaGlobe size={8} /> eliteops.technology</span>
                                    <span className="font-black text-slate-950">RFC: OPS260224-X4A</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="bg-slate-50 border border-slate-200 px-6 py-3 rounded-lg border-l-4 border-l-red-600">
                                <h2 className="text-[9px] font-black text-red-600 uppercase tracking-[0.3em] mb-1">PROPOSAL FOLIO</h2>
                                <h3 className="text-2xl font-black text-slate-950 tracking-tighter">{quote.quote_number}</h3>
                                <div className="text-[8px] font-black text-slate-500 uppercase flex gap-4 mt-1">
                                    <span>EMIS: {new Date(quote.created_at).toLocaleDateString()}</span>
                                    <span>VIG: {new Date(quote.valid_until).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Client & Metadata (Compact Grid) */}
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-slate-200/20 rounded-full -mr-10 -mt-10" />
                            <h5 className="text-[8px] font-black text-red-600 uppercase tracking-[0.4em] mb-2">BILL TO / CLIENT</h5>
                            <h4 className="text-base font-black text-slate-950 uppercase tracking-tight mb-1">{quote.client_name}</h4>
                            <div className="space-y-0.5 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                <p className="text-slate-950 font-black">{quote.client_company}</p>
                                <p className="font-black text-slate-700">RFC: {quote.client_rfc || "XAXX010101000"}</p>
                                <p>{quote.client_email}</p>
                            </div>
                        </div>
                        <div className="p-4 border border-slate-100 rounded-lg">
                            <h5 className="text-[8px] font-black text-red-600 uppercase tracking-[0.4em] mb-3">MISSION TERMS</h5>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                <div className="border-b border-slate-100 pb-1">
                                    <p className="text-[7px] font-black text-slate-400 uppercase">Priority</p>
                                    <p className="text-[10px] font-black text-slate-950 uppercase">{quote.urgency_level}</p>
                                </div>
                                <div className="border-b border-slate-100 pb-1">
                                    <p className="text-[7px] font-black text-slate-400 uppercase">Delivery</p>
                                    <p className="text-[10px] font-black text-slate-950 uppercase">{quote.lead_time}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[7px] font-black text-slate-400 uppercase">Payment Strategy</p>
                                    <p className="text-[10px] font-black text-slate-950 uppercase truncate">{quote.payment_terms}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Professional High-Density Table */}
                    <div className="mb-8 overflow-hidden border border-slate-900 rounded-lg">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900 text-white uppercase text-[8px] tracking-[0.4em] font-black">
                                    <th className="px-4 py-3 w-12 text-center">QTY</th>
                                    <th className="px-4 py-3">MODULE DESCRIPTION</th>
                                    <th className="px-4 py-3 text-right">UNIT RATE</th>
                                    <th className="px-4 py-3 text-right">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {quote.services.map((s, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-center font-black text-slate-950 text-xs">{s.quantity}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-black text-slate-950 text-[11px] uppercase tracking-tighter leading-none mb-1">{s.name}</div>
                                            <div className="text-[9px] font-medium text-slate-500 leading-tight line-clamp-1">{s.description}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right text-[10px] font-bold text-slate-500 font-mono">${s.customPrice?.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right text-xs font-black text-slate-950 font-mono">${(s.customPrice! * s.quantity!).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary & Settlement (Compact) */}
                    <div className="flex flex-col md:flex-row justify-between gap-10">
                        <div className="flex-1 space-y-6">
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <h5 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3 flex items-center gap-2"> <FaUniversity className="text-slate-950" /> SETTLEMENT ACCT</h5>
                                <div className="grid grid-cols-2 gap-4 text-[9px] font-bold text-slate-950 uppercase tracking-tighter">
                                    <div>
                                        <p className="text-slate-400 mb-1">Bank</p>
                                        <p>{quote.bank_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 mb-1">CLABE</p>
                                        <p className="text-red-600 font-black">{quote.bank_clabe}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h5 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Protocol Notes</h5>
                                <p className="text-[8px] font-bold text-slate-400 leading-tight uppercase tracking-widest">{quote.notes || "Official quote authenticated via Enterprise Sales Protocol. Subject to terms & conditions."}</p>
                            </div>
                        </div>

                        <div className="w-full md:w-72">
                            <div className="border-t-2 border-slate-900 pt-4 space-y-2">
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter text-slate-400"><span>Subtotal:</span> <span className="text-slate-950">${quote.subtotal.toLocaleString()}</span></div>
                                {quote.discount_percent > 0 && (
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter text-emerald-600"><span>Benefit ({quote.discount_percent}%):</span> <span>- ${quote.discount_amount.toLocaleString()}</span></div>
                                )}
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter text-slate-400"><span>IVA ({quote.tax_percent}%):</span> <span className="text-slate-950">${quote.tax_amount.toLocaleString()}</span></div>
                                <div className="pt-3 border-t border-slate-100 flex justify-between items-end">
                                    <div className="text-left">
                                        <p className="text-[7px] font-black text-red-600 uppercase tracking-widest">Grand Total</p>
                                        <p className="text-xs font-black text-slate-400 uppercase leading-none">{quote.currency}</p>
                                    </div>
                                    <span className="text-4xl font-black text-slate-950 tracking-tighter leading-none">${quote.final_total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Compact Signature Logic */}
                    <div className="mt-16 pt-8 border-t border-slate-100">
                        <div className="grid grid-cols-2 gap-16">
                            <div className="text-center">
                                <div className="h-px bg-slate-300 w-full mb-3 mx-auto" />
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Authorized Ops Manager</p>
                            </div>
                            <div className="text-center">
                                <div className="h-px bg-slate-300 w-full mb-3 mx-auto" />
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Client Strategic Approval</p>
                            </div>
                        </div>
                        <p className="text-center text-[7px] font-bold text-slate-300 uppercase tracking-[0.4em] mt-10">© 2026 Elite Ops · Secure One-Page Document Structure</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function CRMView({ quotes, onSelectClient, onDeleteClient }: { quotes: Quote[], onSelectClient: (email: string) => void, onDeleteClient: (email: string) => void }) {
    const clients = useMemo(() => {
        const map = new Map<string, any>();
        quotes.filter(q => q.client_email.trim() !== "").forEach(q => {
            if (!map.has(q.client_email)) map.set(q.client_email, { name: q.client_name || "Unknown Entity", company: q.client_company || "No Company", email: q.client_email, phone: q.client_phone || "No Phone", rfc: q.client_rfc || "No RFC", total: 0, count: 0 });
            const c = map.get(q.client_email); c.total += q.final_total; c.count++;
        });
        return Array.from(map.values()).sort((a, b) => b.total - a.total);
    }, [quotes]);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-40">
            <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] overflow-hidden shadow-4xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-950/50">
                            <th className="px-10 py-8 text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] border-b border-white/5">Strategic Entity</th>
                            <th className="px-10 py-8 text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] border-b border-white/5">Contact Information</th>
                            <th className="px-10 py-8 text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] border-b border-white/5 text-right">Yield Value</th>
                            <th className="px-10 py-8 text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] border-b border-white/5 text-center">Active Ops</th>
                            <th className="px-10 py-8 text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] border-b border-white/5 text-center">Protocol Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {clients.map(c => (
                            <tr key={c.email} className="group hover:bg-red-600/[0.02] transition-all duration-300">
                                <td className="px-10 py-8">
                                    <h4 className="text-xl font-black text-white tracking-tight mb-1 group-hover:text-red-500 transition-colors uppercase">{c.name}</h4>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2 border-l-2 border-red-600 pl-3">
                                        {c.company}
                                    </p>
                                </td>
                                <td className="px-10 py-8">
                                    <div className="space-y-1 text-[12px] font-bold text-slate-400">
                                        <p className="flex items-center gap-3"><FaEnvelope className="text-slate-700 font-black" size={10} /> {c.email}</p>
                                        <p className="flex items-center gap-3"><FaPhone className="text-slate-700 font-black" size={10} /> {c.phone}</p>
                                    </div>
                                </td>
                                <td className="px-10 py-8 text-right">
                                    <p className="text-2xl font-black text-white tracking-tighter mb-0.5">${c.total.toLocaleString()}</p>
                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Lifetime Revenue</span>
                                </td>
                                <td className="px-10 py-8 text-center text-2xl font-black text-red-600 tracking-tighter">
                                    {c.count}
                                </td>
                                <td className="px-10 py-8 text-center">
                                    <div className="flex items-center justify-center gap-4">
                                        <button
                                            onClick={() => onSelectClient(c.email)}
                                            className="w-14 h-14 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center text-slate-500 hover:bg-red-600 hover:text-white hover:border-red-500 transition-all duration-500 shadow-xl group-hover:scale-110"
                                            title="View Proposals"
                                        >
                                            <FaListUl size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDeleteClient(c.email)}
                                            className="w-14 h-14 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center text-slate-800 hover:bg-black hover:text-red-600 hover:border-red-600/50 transition-all duration-500 shadow-xl"
                                            title="Delete Entry"
                                        >
                                            <FaTrash size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}



// --- Internal UI Helpers ---
interface HeaderProps {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
}

function Header({ title, subtitle, icon }: HeaderProps) {
    return (
        <div className="flex items-center gap-8 mb-12">
            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-red-600/20 to-red-900/10 border border-red-500/30 text-red-500 flex items-center justify-center text-4xl shadow-3xl shadow-red-600/10 transform rotate-3 group-hover:rotate-0 transition-transform duration-500">{icon}</div>
            <div>
                <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-4">{title}</h3>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] mt-2 opacity-60 italic">{subtitle}</p>
            </div>
        </div>
    );
}

interface InputFieldProps {
    label: string;
    val: string;
    set: (v: string) => void;
    icon: React.ReactNode;
}

function InputField({ label, val, set, icon }: InputFieldProps) {
    return (
        <div className="space-y-4 group">
            <label className="text-[11px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2 group-focus-within:text-red-500 transition-colors uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 group-focus-within:animate-ping" />
                {label}
            </label>
            <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-red-500 transition-all font-black text-2xl">{icon}</span>
                <input
                    type="text"
                    value={val}
                    onChange={e => set(e.target.value)}
                    placeholder="ENTER DATA..."
                    className="w-full bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-3xl pl-16 pr-8 py-6 text-lg font-black text-white outline-none focus:border-red-600/50 focus:bg-slate-900 transition-all font-mono tracking-tighter shadow-inner"
                />
                <div className="absolute inset-0 rounded-3xl bg-red-600/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity" />
            </div>
        </div>
    );
}

interface SelectProps {
    label: string;
    val: string;
    set: (v: string) => void;
    options: string[];
}

function Select({ label, val, set, options }: SelectProps) {
    return (
        <div className="space-y-4 group">
            <label className="text-[11px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2 group-focus-within:text-red-500 transition-colors uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-focus-within:bg-red-600" />
                {label}
            </label>
            <div className="relative">
                <select
                    value={val}
                    onChange={e => set(e.target.value)}
                    className="w-full bg-slate-950/80 backdrop-blur-md border border-white/10 px-8 py-6 rounded-3xl text-lg text-white outline-none focus:border-red-600/50 focus:bg-slate-900 font-black appearance-none cursor-pointer tracking-tighter shadow-inner"
                >
                    {options.map((o: string) => <option key={o} value={o} className="bg-slate-950">{o.toUpperCase()}</option>)}
                </select>
                <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 group-focus-within:text-red-500">
                    <FaChevronRight className="rotate-90" />
                </div>
            </div>
        </div>
    );
}

interface ParamProps {
    label: string;
    val: string;
}

function Param({ label, val }: ParamProps) {
    return (
        <div className="flex justify-between items-baseline lg:flex-row-reverse border-b border-slate-100 pb-4">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-6">{label}</span>
            <span className="text-sm font-black text-slate-950 uppercase tracking-tighter">{val}</span>
        </div>
    );
}

function FaFileContract(props: React.SVGProps<SVGSVGElement>) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M480 32H164.7c-17.7 0-33.5 10.1-40.8 25.8L96 112H32c-17.7 0-32 14.3-32 32v224c0 17.7 14.3 32 32 32h64l27.9 54.2c7.3 15.7 23.1 25.8 40.8 25.8H480c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32zm-64 320H192v-32h224v32zm0-64H192v-32h224v32zm0-64H192v-32h224v32zm0-64h-96v-32h96v32zM384 96H128V64h256v32z"></path></svg>;
}
