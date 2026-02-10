"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChartLine,
  FaPlus,
  FaListUl,
  FaUsers,
  FaFileAlt,
  FaPrint,
  FaCheck,
  FaTimes,
  FaCalendarAlt,
  FaTrash,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaMapMarkerAlt,
  FaClock,
  FaFire,
  FaRocket,
  FaChevronRight,
  FaCalculator,
  FaRegLightbulb
} from "react-icons/fa";
import Image from "next/image";

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
  client_name: string;
  client_email: string;
  client_phone: string;
  client_company: string;
  client_address: string;
  contact_person: string;
  services: Service[];
  subtotal: number;
  discount_percent: number;
  discount_amount: number;
  tax_amount: number;
  final_total: number;
  valid_until: string;
  notes: string;
  terms: string;
  payment_terms: string;
  created_at: string;
  status: "Activa" | "Aceptada" | "Rechazada" | "Vencida";
  urgency_level: "normal" | "medio" | "alto" | "urgente";
  reference_number: string;
}

interface Client {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  totalQuotes: number;
  totalValue: number;
}

// --- Constants ---
const SERVICES: Service[] = [
  { id: 1, name: 'Consultoría Estratégic', category: 'Consultoría', price: 1500, description: 'Asesoramiento estratégico personalizado' },
  { id: 2, name: 'Desarrollo Web Básico', category: 'Desarrollo', price: 2500, description: 'Sitio web profesional con 5 páginas' },
  { id: 3, name: 'Desarrollo Web Avanzado', category: 'Desarrollo', price: 5000, description: 'Aplicación web con funcionalidades complejas' },
  { id: 4, name: 'E-commerce Estándar', category: 'E-commerce', price: 3500, description: 'Tienda online con hasta 100 productos' },
  { id: 5, name: 'E-commerce Premium', category: 'E-commerce', price: 7500, description: 'Tienda online con integraciones avanzadas' },
  { id: 6, name: 'Diseño Gráfico (5 piezas)', category: 'Diseño', price: 1200, description: 'Diseño de materiales de marketing' },
  { id: 7, name: 'Branding Completo', category: 'Diseño', price: 3000, description: 'Logo, guía de estilos y branding' },
  { id: 8, name: 'SEO (3 meses)', category: 'Marketing', price: 1800, description: 'Optimización SEO y posicionamiento' },
  { id: 9, name: 'Redes Sociales (1 mes)', category: 'Marketing', price: 1000, description: 'Gestión completa de redes sociales' },
  { id: 10, name: 'Mantenimiento Mensual', category: 'Soporte', price: 500, description: 'Actualizaciones y soporte técnico' },
  { id: 11, name: 'Hosting Anual', category: 'Infraestructura', price: 800, description: 'Hosting con soporte técnico incluido' },
  { id: 12, name: 'Capacitación (8 horas)', category: 'Capacitación', price: 1600, description: 'Capacitación personalizada para tu equipo' }
];

const PAYMENT_TERMS = [
  { id: 'immediate', label: 'Pago Inmediato (Anticipo 100%)', days: 0 },
  { id: 'net15', label: 'Pago Neto 15 días', days: 15 },
  { id: 'net30', label: 'Pago Neto 30 días', days: 30 },
  { id: 'net45', label: 'Pago Neto 45 días', days: 45 },
  { id: 'net60', label: 'Pago Neto 60 días', days: 60 },
  { id: '50_50', label: '50% Anticipo - 50% al Terminar', days: 0 }
];

export default function CotizarPage() {
  const [activeView, setActiveView] = useState<string>("dashboard");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("quotes_data");
    if (saved) {
      setQuotes(JSON.parse(saved));
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("quotes_data", JSON.stringify(quotes));
    }
  }, [quotes, isLoaded]);

  const stats = {
    total: quotes.length,
    revenue: quotes.reduce((acc, q) => acc + q.final_total, 0),
    active: quotes.filter(q => q.status === "Activa").length,
    accepted: quotes.filter(q => q.status === "Aceptada").length,
    clients: new Set(quotes.map(q => q.client_email)).size
  };

  const recentQuotes = [...quotes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

  if (!isLoaded) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="loading-spinner" /></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      {/* App Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FaCalculator className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Elite Quotes <span className="text-blue-500">Pro</span></h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Sistema de Gestión de Cotizaciones</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { id: "dashboard", icon: <FaChartLine />, label: "Dashboard" },
              { id: "new", icon: <FaPlus />, label: "Nueva" },
              { id: "list", icon: <FaListUl />, label: "Lista" },
              { id: "clients", icon: <FaUsers />, label: "Clientes" },
              { id: "reports", icon: <FaFileAlt />, label: "Reportes" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveView(tab.id); setSelectedQuote(null); }}
                className={`px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${activeView === tab.id
                  ? "bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-500/20"
                  : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                  }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content Areas */}
      <main className="max-w-7xl mx-auto p-6 md:p-8 relative z-10">
        <AnimatePresence mode="wait">
          {activeView === "dashboard" && <DashboardView quotes={quotes} stats={stats} recent={recentQuotes} onViewQuote={(q: Quote) => { setSelectedQuote(q); setActiveView("detail"); }} />}
          {activeView === "new" && <NewQuoteView onSave={(q: Quote) => { setQuotes([q, ...quotes]); setActiveView("list"); }} />}
          {activeView === "list" && <QuotesListView quotes={quotes} onViewQuote={(q: Quote) => { setSelectedQuote(q); setActiveView("detail"); }} />}
          {activeView === "detail" && selectedQuote && (
            <QuoteDetailView
              quote={selectedQuote}
              onBack={() => setActiveView("list")}
              onStatusChange={(id: string, status: Quote["status"]) => {
                const updated = quotes.map(q => q.id === id ? { ...q, status } : q);
                setQuotes(updated as Quote[]);
                setSelectedQuote({ ...selectedQuote, status } as Quote);
              }}
            />
          )}
          {activeView === "clients" && <ClientsView quotes={quotes} />}
          {activeView === "reports" && <ReportsView quotes={quotes} stats={stats} />}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- Sub-Components ---

function DashboardView({ stats, recent, onViewQuote, quotes }: { stats: any, recent: Quote[], onViewQuote: (q: Quote) => void, quotes: Quote[] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: "Total Cotizaciones", val: stats.total, icon: <FaFileAlt />, color: "text-blue-400", bg: "from-blue-600/20 to-transparent", trend: "Total histórico" },
          { label: "Ingresos Totales", val: `$${stats.revenue.toLocaleString()}`, icon: <FaChartLine />, color: "text-emerald-400", bg: "from-emerald-600/20 to-transparent", trend: "Valor acumulado" },
          { label: "Cotizaciones Activas", val: stats.active, icon: <FaClock />, color: "text-orange-400", bg: "from-orange-600/20 to-transparent", trend: "Pendientes de cierre" },
          { label: "Convertidas", val: stats.accepted, icon: <FaCheck />, color: "text-indigo-400", bg: "from-indigo-600/20 to-transparent", trend: "Aceptadas con éxito" },
          { label: "Clientes Únicos", val: stats.clients, icon: <FaUsers />, color: "text-purple-400", bg: "from-purple-600/20 to-transparent", trend: "Base de datos" }
        ].map((s, i) => (
          <div key={i} className="group p-6 rounded-[2rem] bg-slate-900/50 border border-white/5 hover:border-blue-500/30 transition-all">
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${s.bg} inline-block mb-4 shadow-inner`}>
              <span className={`text-xl ${s.color}`}>{s.icon}</span>
            </div>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">{s.label}</p>
            <h3 className="text-2xl font-black text-white tracking-tighter mb-2">{s.val}</h3>
            <p className="text-slate-600 text-[9px] font-bold uppercase">{s.trend}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="article-card p-10 rounded-[3rem] border border-white/5">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-3 italic">
            <span className="text-blue-500">📋</span> Cotizaciones Recientes
          </h2>
          <button className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-400 transition-colors">Ver Todas</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 pb-4">
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600">Referencia</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600">Cliente</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600 text-right">Monto Final</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600">Estado</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <p className="text-slate-500 italic text-sm">No hay registros aún. ¡Toca crear la primera!</p>
                  </td>
                </tr>
              ) : (
                recent.map((q: Quote) => (
                  <tr key={q.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-5">
                      <p className="text-sm font-bold text-blue-400">{q.quote_number}</p>
                      <p className="text-[9px] text-slate-600 font-bold uppercase">{new Date(q.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-4 py-5">
                      <p className="text-sm font-bold text-white">{q.client_name}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{q.client_company}</p>
                    </td>
                    <td className="px-4 py-5 text-right">
                      <p className="text-base font-black text-emerald-400">${q.final_total.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-5">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${q.status === "Aceptada" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        q.status === "Activa" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                          "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>{q.status}</span>
                    </td>
                    <td className="px-4 py-5">
                      <button onClick={() => onViewQuote(q)} className="text-slate-400 hover:text-white transition-colors">
                        <FaChevronRight />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function NewQuoteView({ onSave }: { onSave: (q: Quote) => void }) {
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [discount, setDiscount] = useState(0);
  const [formData, setFormData] = useState({
    client_name: "",
    client_company: "",
    client_email: "",
    client_phone: "",
    client_address: "",
    contact_person: "",
    reference_number: "",
    urgency_level: "normal" as const,
    payment_terms: "immediate",
    notes: "",
    terms: ""
  });

  const subtotal = selectedServices.reduce((acc, s) => acc + (s.customPrice! * s.quantity!), 0);
  const discountAmount = subtotal * (discount / 100);
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxAmount = subtotalAfterDiscount * 0.16;
  const total = subtotalAfterDiscount + taxAmount;

  const handleAddService = (serviceId: string) => {
    const service = SERVICES.find(s => s.id === parseInt(serviceId));
    if (service && !selectedServices.find(s => s.id === service.id)) {
      setSelectedServices([...selectedServices, { ...service, quantity: 1, customPrice: service.price }]);
    }
  };

  const handleRemoveService = (id: number) => {
    setSelectedServices(selectedServices.filter(s => s.id !== id));
  };

  const updateService = (id: number, field: string, val: any) => {
    setSelectedServices(selectedServices.map(s => s.id === id ? { ...s, [field]: val } : s));
  };

  const generateQuote = () => {
    if (!formData.client_name || !formData.client_email || selectedServices.length === 0) {
      alert("Por favor completa los campos obligatorios y añade al menos un servicio.");
      return;
    }

    const newQuote: Quote = {
      id: `quote-${Date.now()}`,
      quote_number: `QT-${Math.floor(100000 + Math.random() * 900000)}`,
      ...formData,
      services: selectedServices,
      subtotal,
      discount_percent: discount,
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      final_total: total,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      status: "Activa",
      payment_terms: PAYMENT_TERMS.find(t => t.id === formData.payment_terms)?.label || "Inmediato"
    };

    onSave(newQuote);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-8">
        {/* Client Info */}
        <div className="article-card p-10 rounded-[3rem] border border-white/5 bg-slate-900/40">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3 italic"><span className="text-blue-500">🏢</span> Información del Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Nombre Completo *" placeholder="Ej. Juan Pérez" value={formData.client_name} onChange={(v) => setFormData({ ...formData, client_name: v })} />
            <InputField label="Empresa *" placeholder="Nombre de la compañía" value={formData.client_company} onChange={(v) => setFormData({ ...formData, client_company: v })} />
            <InputField label="Email *" placeholder="cliente@correo.com" type="email" value={formData.client_email} onChange={(v) => setFormData({ ...formData, client_email: v })} />
            <InputField label="Teléfono *" placeholder="+56 9 XXXX XXXX" value={formData.client_phone} onChange={(v) => setFormData({ ...formData, client_phone: v })} />
            <div className="md:col-span-2">
              <InputField label="Dirección Física" placeholder="Calle, Ciudad, País" value={formData.client_address} onChange={(v) => setFormData({ ...formData, client_address: v })} />
            </div>
          </div>
        </div>

        {/* Services Selection */}
        <div className="article-card p-10 rounded-[3rem] border border-white/5 bg-slate-900/40">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3 italic"><span className="text-blue-500">🛠️</span> Configuración de Servicios</h3>

          <div className="flex gap-4 mb-8">
            <select
              className="flex-1 bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
              onChange={(e) => handleAddService(e.target.value)}
              value=""
            >
              <option value="">Añadir un servicio...</option>
              {SERVICES.map(s => <option key={s.id} value={s.id}>{s.name} - ${s.price}</option>)}
            </select>
          </div>

          <div className="space-y-4">
            {selectedServices.length === 0 ? (
              <div className="py-12 border-2 border-dashed border-white/5 rounded-3xl text-center">
                <FaRegLightbulb className="text-4xl text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Selecciona servicios para comenzar</p>
              </div>
            ) : (
              selectedServices.map(s => (
                <div key={s.id} className="p-6 rounded-2xl bg-slate-950/50 border border-white/5 flex flex-wrap items-center justify-between gap-6 group">
                  <div className="flex-1 min-w-[200px]">
                    <h4 className="font-bold text-white mb-1">{s.name}</h4>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{s.category}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Cant.</p>
                      <input
                        type="number"
                        min="1"
                        value={s.quantity}
                        onChange={(e) => updateService(s.id, "quantity", parseInt(e.target.value) || 1)}
                        className="w-16 bg-slate-900 border border-white/10 p-2 rounded-xl text-center text-sm font-bold outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Precio Unit.</p>
                      <input
                        type="number"
                        value={s.customPrice}
                        onChange={(e) => updateService(s.id, "customPrice", parseFloat(e.target.value) || 0)}
                        className="w-24 bg-slate-900 border border-white/10 p-2 rounded-xl text-center text-sm font-bold outline-none focus:border-blue-500 text-emerald-400"
                      />
                    </div>
                    <div className="text-right min-w-[80px]">
                      <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Subtotal</p>
                      <p className="font-black text-white">${(s.customPrice! * s.quantity!).toLocaleString()}</p>
                    </div>
                    <button onClick={() => handleRemoveService(s.id)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Options & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="article-card p-8 rounded-[2.5rem] border border-white/5 bg-slate-900/40">
            <h4 className="text-sm font-bold mb-6 uppercase tracking-widest text-blue-400">Opciones de Pago</h4>
            <div className="space-y-4">
              <select
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-blue-500 appearance-none cursor-pointer"
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
              >
                {PAYMENT_TERMS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <InputField label="Referencia / Proyecto" placeholder="Ej. WEB-2024-01" value={formData.reference_number} onChange={(v) => setFormData({ ...formData, reference_number: v })} />
            </div>
          </div>
          <div className="article-card p-8 rounded-[2.5rem] border border-white/5 bg-slate-900/40">
            <h4 className="text-sm font-bold mb-6 uppercase tracking-widest text-blue-400">Prioridad</h4>
            <div className="flex gap-2">
              {["normal", "medio", "alto", "urgente"].map(level => (
                <button
                  key={level}
                  onClick={() => setFormData({ ...formData, urgency_level: level as any })}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.urgency_level === level
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-black/40 border-white/5 text-slate-500 hover:text-slate-300"
                    }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Sidebar */}
      <div className="space-y-6">
        <div className="sticky top-32 article-card p-10 rounded-[3rem] border border-white/10 bg-gradient-to-br from-blue-600/5 to-purple-600/5 backdrop-blur-3xl">
          <h3 className="text-xl font-bold mb-8 italic">💰 Resumen Final</h3>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-sm font-bold text-slate-400">
              <span>Subtotal Bruto:</span>
              <span className="text-white">${subtotal.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-bold text-slate-400">Descuento (%):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-20 bg-slate-950 border border-white/10 p-2 rounded-xl text-center text-sm font-bold outline-none focus:border-red-500 text-red-400"
              />
            </div>

            <div className="flex justify-between text-sm font-bold text-red-400/80">
              <span>Ahorro Aplicado:</span>
              <span>-${discountAmount.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-sm font-bold text-slate-400">
              <span>IVA (16%):</span>
              <span className="text-white">${taxAmount.toLocaleString()}</span>
            </div>

            <div className="pt-6 border-t border-white/10 flex justify-between items-end">
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Inversión Final</p>
                <h4 className="text-4xl font-black text-white tracking-tighter">${total.toLocaleString()}</h4>
              </div>
              <div className="text-right">
                <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest">USD</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={generateQuote}
              className="w-full py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-blue-500/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              <FaCheck /> Generar Cotización
            </button>
            <p className="text-[9px] text-slate-500 text-center font-bold uppercase tracking-widest leading-relaxed">
              Vigencia de 30 días a partir de hoy. Sujeto a términos de servicio.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function QuotesListView({ quotes, onViewQuote }: { quotes: Quote[], onViewQuote: (q: Quote) => void }) {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = quotes.filter(q => {
    const matchesStatus = filter === "all" || q.status === filter;
    const matchesSearch = q.client_name.toLowerCase().includes(search.toLowerCase()) ||
      q.quote_number.toLowerCase().includes(search.toLowerCase()) ||
      q.client_company.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5">
        <h2 className="text-2xl font-bold italic"><span className="text-blue-500">📋</span> Explorador de Cotizaciones</h2>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar por cliente, N° o empresa..."
            className="flex-1 md:w-80 bg-slate-950 border border-white/10 rounded-2xl px-6 py-3 text-sm font-bold text-white outline-none focus:border-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="bg-slate-950 border border-white/10 rounded-2xl px-6 py-3 text-sm font-bold text-white outline-none focus:border-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Todos los Estados</option>
            <option value="Activa">Activas</option>
            <option value="Aceptada">Aceptadas</option>
            <option value="Rechazada">Rechazadas</option>
            <option value="Vencida">Vencidas</option>
          </select>
        </div>
      </div>

      <div className="article-card p-10 rounded-[3rem] border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 pb-4">
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600">Referencia</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600">Cliente</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600 text-right">Monto</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600 text-center">Estado</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600 text-right">Vencimiento</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((q) => (
                <tr key={q.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-6">
                    <p className="text-sm font-bold text-blue-400">{q.quote_number}</p>
                    <p className="text-[9px] text-slate-600 font-bold uppercase">{q.reference_number || "Sin Ref"}</p>
                  </td>
                  <td className="px-4 py-6">
                    <p className="text-sm font-bold text-white">{q.client_name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{q.client_company}</p>
                  </td>
                  <td className="px-4 py-6 text-right">
                    <p className="text-base font-black text-emerald-400">${q.final_total.toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${q.status === "Aceptada" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      q.status === "Activa" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                        "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>{q.status}</span>
                  </td>
                  <td className="px-4 py-6 text-right">
                    <p className="text-[10px] font-bold text-slate-400">{new Date(q.valid_until).toLocaleDateString()}</p>
                  </td>
                  <td className="px-4 py-6 text-center">
                    <button onClick={() => onViewQuote(q)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all group-hover:shadow-lg group-hover:shadow-blue-500/20">
                      <FaChevronRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-32 text-center">
              <FaRocket className="text-6xl text-slate-800 mx-auto mb-6 animate-pulse" />
              <p className="text-slate-500 italic">No se encontraron cotizaciones con esos criterios.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function QuoteDetailView({ quote, onBack, onStatusChange }: { quote: Quote, onBack: () => void, onStatusChange: (id: string, status: Quote["status"]) => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="max-w-4xl mx-auto space-y-8">
      {/* Actions Bar */}
      <div className="flex items-center justify-between bg-slate-900/50 p-6 rounded-[2rem] border border-white/5 print:hidden">
        <button onClick={onBack} className="px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-white/5 transition-all">← Volver</button>
        <div className="flex gap-4">
          <button onClick={() => window.print()} className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-white hover:bg-blue-600 transition-all shadow-xl shadow-black/20"><FaPrint /></button>
          <button onClick={() => onStatusChange(quote.id, "Aceptada")} className="px-6 py-3 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 flex items-center gap-2 hover:-translate-y-1 transition-all"><FaCheck /> Aceptar</button>
          <button onClick={() => onStatusChange(quote.id, "Rechazada")} className="px-6 py-3 rounded-2xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20 flex items-center gap-2 hover:-translate-y-1 transition-all"><FaTimes /> Rechazar</button>
        </div>
      </div>

      {/* Document View */}
      <div className="bg-white text-slate-900 p-12 md:p-20 rounded-[3rem] shadow-2xl relative overflow-hidden print:p-0 print:shadow-none print:rounded-none">
        {/* Document Header */}
        <div className="flex justify-between items-start mb-16">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-bold">FJ</div>
              <h2 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Favio Richar <span className="text-blue-600">Elite</span></h2>
            </div>
            <div className="space-y-1 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <p className="flex items-center gap-2"><FaBuilding className="text-blue-600" /> Soluciones Web de Alto Impacto</p>
              <p className="flex items-center gap-2"><FaMapMarkerAlt className="text-blue-600" /> Latam · Global Remote</p>
              <p className="flex items-center gap-2"><FaPhone className="text-blue-600" /> +56 9 XXXX XXXX</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-2">COTIZACIÓN</h1>
            <p className="text-xl font-black text-blue-600 mb-4">{quote.quote_number}</p>
            <div className="space-y-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <p>Fecha: {new Date(quote.created_at).toLocaleDateString()}</p>
              <p>Válidez: 30 Días</p>
              <p>Ref: {quote.reference_number || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Client & Billing Info */}
        <div className="grid grid-cols-2 gap-20 mb-16 border-y border-slate-100 py-10">
          <div>
            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Información del Cliente</h4>
            <h3 className="text-xl font-black text-slate-900 mb-2">{quote.client_name}</h3>
            <div className="space-y-1 text-sm font-bold text-slate-500">
              <p className="text-slate-900">{quote.client_company}</p>
              <p>{quote.client_email}</p>
              <p>{quote.client_phone}</p>
              <p>{quote.client_address}</p>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Detalles Técnicos</h4>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase">Prioridad</span>
                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{quote.urgency_level}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase">Plazos de Pago</span>
                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{quote.payment_terms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase">Estado Actual</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${quote.status === "Aceptada" ? "text-emerald-600" :
                  quote.status === "Activa" ? "text-blue-600" : "text-red-600"
                  }`}>{quote.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="mb-16">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Descripción del Servicio</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Cant.</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Precio Unit.</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quote.services.map((s, i) => (
                <tr key={i}>
                  <td className="px-6 py-6 font-bold text-slate-800">
                    <p>{s.name}</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">{s.category}</p>
                  </td>
                  <td className="px-6 py-6 text-center text-sm font-bold text-slate-500">{s.quantity}</td>
                  <td className="px-6 py-6 text-right text-sm font-bold text-slate-500">${s.price.toLocaleString()}</td>
                  <td className="px-6 py-6 text-right font-black text-slate-900">${(s.customPrice! * s.quantity!).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        <div className="flex justify-end pt-10 border-t border-slate-200">
          <div className="w-full md:w-80 space-y-4">
            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span>Subtotal:</span>
              <span>${quote.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-red-500 uppercase tracking-widest">
              <span>Descuento ({quote.discount_percent}%):</span>
              <span>-${quote.discount_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span>IVA (16%):</span>
              <span>${quote.tax_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-end pt-6 border-t border-slate-900 border-double">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inversión Final</span>
              <span className="text-4xl font-black text-slate-900 tracking-tighter">${quote.final_total.toLocaleString()} <span className="text-xs text-slate-400">USD</span></span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ClientsView({ quotes }: { quotes: Quote[] }) {
  const clientsMap = new Map<string, Client>();

  quotes.forEach(q => {
    if (!clientsMap.has(q.client_email)) {
      clientsMap.set(q.client_email, {
        name: q.client_name,
        email: q.client_email,
        phone: q.client_phone,
        company: q.client_company,
        address: q.client_address,
        totalQuotes: 0,
        totalValue: 0
      });
    }
    const c = clientsMap.get(q.client_email)!;
    c.totalQuotes++;
    c.totalValue += q.final_total;
  });

  const clients = Array.from(clientsMap.values()).sort((a, b) => b.totalValue - a.totalValue);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
      <div className="flex items-center justify-between bg-slate-900/40 p-10 rounded-[2.5rem] border border-white/5">
        <div>
          <h2 className="text-3xl font-bold italic mb-2 tracking-tight">👥 Directorio de Clientes</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Análisis de valor y engagement por cliente</p>
        </div>
        <div className="w-16 h-16 bg-blue-600/10 rounded-3xl flex items-center justify-center text-blue-500 text-2xl"><FaUsers /></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {clients.length === 0 ? (
          <div className="col-span-full py-32 text-center article-card border border-white/5 rounded-[3rem]">
            <FaRegLightbulb className="text-6xl text-slate-800 mx-auto mb-6" />
            <p className="text-slate-500 italic">No hay clientes registrados en el sistema.</p>
          </div>
        ) : (
          clients.map((c, i) => (
            <div key={i} className="article-card p-10 rounded-[3rem] border border-white/5 hover:border-blue-500/30 transition-all group">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl border border-white/5 shadow-inner">{c.name.charAt(0)}</div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{c.name}</h3>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{c.company}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium"> <FaEnvelope className="text-blue-500/50" /> {c.email}</div>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium"> <FaPhone className="text-blue-500/50" /> {c.phone}</div>
              </div>

              <div className="flex justify-between items-end pt-8 border-t border-white/5">
                <div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Cotizaciones</p>
                  <p className="text-2xl font-black text-white">{c.totalQuotes}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Valor Total (LTV)</p>
                  <p className="text-2xl font-black text-emerald-400">${c.totalValue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

function ReportsView({ quotes, stats }: { quotes: Quote[], stats: any }) {
  // Simplified reports view based on common dashboard metrics
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
      <div className="text-center py-20 bg-slate-900/40 rounded-[4rem] border border-white/5">
        <FaChartLine className="text-8xl text-blue-600/20 mx-auto mb-8" />
        <h2 className="text-4xl font-black italic tracking-tighter mb-4 text-white uppercase">Análisis de Rendimiento</h2>
        <p className="text-slate-500 font-black tracking-widest uppercase text-xs">Métricas en tiempo real de tu embudo de ventas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="article-card p-10 rounded-[3rem] border border-white/5">
          <h3 className="text-xl font-bold mb-8 italic">📊 Conversión de Cotizaciones</h3>
          <div className="space-y-6">
            <StatBar label="Aceptadas" val={stats.accepted} total={stats.total} color="bg-emerald-500" />
            <StatBar label="Activas" val={stats.active} total={stats.total} color="bg-blue-500" />
            <StatBar label="Rechazadas" val={quotes.filter(q => q.status === "Rechazada").length} total={stats.total} color="bg-red-500" />
          </div>
        </div>

        <div className="article-card p-10 rounded-[3rem] border border-white/5">
          <h3 className="text-xl font-bold mb-8 italic">⭐ Resumen Comercial</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-slate-950/50 border border-white/5">
              <p className="text-[9px] text-slate-500 font-bold uppercase mb-2">Ticket Promedio</p>
              <p className="text-2xl font-black text-white">${stats.total > 0 ? (stats.revenue / stats.total).toLocaleString() : 0}</p>
            </div>
            <div className="p-6 rounded-3xl bg-slate-950/50 border border-white/5">
              <p className="text-[9px] text-slate-500 font-bold uppercase mb-2">Tasa Aceptación</p>
              <p className="text-2xl font-black text-white">{stats.total > 0 ? ((stats.accepted / stats.total) * 100).toFixed(1) : 0}%</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatBar({ label, val, total, color }: { label: string, val: number, total: number, color: string }) {
  const percentage = total > 0 ? (val / total) * 100 : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
        <span className="text-slate-400">{label}</span>
        <span className="text-white">{val} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} className={`h-full ${color}`} />
      </div>
    </div>
  );
}

function InputField({ label, placeholder, value, onChange, type = "text" }: { label: string, placeholder: string, value: string, onChange: (v: string) => void, type?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] ml-2">{label}</label>
      <input
        type={type}
        className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white placeholder:text-slate-700 focus:border-blue-500 outline-none transition-all"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
