"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheckCircle,
  FaClock,
  FaExternalLinkAlt,
  FaFileAlt,
  FaShieldAlt,
  FaTimesCircle,
  FaUser,
  FaProjectDiagram,
  FaBriefcase,
  FaImage,
  FaArrowDown,
  FaCreditCard,
  FaPaypal,
  FaUniversity,
  FaCloudUploadAlt,
  FaDownload,
  FaEnvelope,
  FaArrowLeft,
  FaWhatsapp
} from "react-icons/fa";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type HistoryItem = {
  id?: number;
  action: string;
  created_at: string;
  stage_id?: string | null;
  stage_label?: string | null;
  summary?: string | null;
  report?: string | null;
  media_urls?: string[] | null;
};

type ProposalHeader = {
  quote_number: string;
  client_name?: string;
  client_company?: string;
  client_email?: string;
  client_phone?: string;
  client_address?: string;
  client_rut?: string;
  status?: string;
  items?: unknown;
  project_objective?: string | null;
  lead_time?: string | null;
  final_total?: number | string | null;
  currency?: string | null;
  sent_at?: string | null;
  accepted_at?: string | null;
  valid_days?: number | null;
  payment_method?: string | null;
  payment_receipt_url?: string | null;
  payment_status?: string | null;
};

type ScopeItem = {
  name: string;
  description?: string | null;
  includes?: string[];
  deliverables?: string[];
};

type TrackingStage = {
  id: string;
  label: string;
  status: "completed" | "current" | "pending";
  date?: string | null;
  progress_percent?: number | null;
  client_title?: string | null;
  description?: string | null;
  next_step?: string | null;
  report?: string | null;
  media_urls?: string[];
  summary?: string | null;
  completed?: boolean;
};

type TrackingPayload = {
  status: string;
  current_stage: string;
  progress_percent: number;
  stages: TrackingStage[];
  events: HistoryItem[];
  client_timeline?: HistoryItem[];
  current_stage_detail?: TrackingStage | null;
  next_stage_detail?: TrackingStage | null;
  latest_client_update?: HistoryItem | null;
  scope_items?: ScopeItem[];
};

const getApiBase = (): string =>
  process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const parseItems = (items: unknown): ScopeItem[] => {
  if (Array.isArray(items)) {
    return items.filter((item): item is ScopeItem => Boolean(item && typeof item === "object"));
  }
  if (typeof items !== "string") return [];
  try {
    const parsed = JSON.parse(items);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is ScopeItem => Boolean(item && typeof item === "object"))
      : [];
  } catch {
    return [];
  }
};

const formatDateTime = (value?: string | null): string => {
  if (!value) return "S/R";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "S/R";
  return date.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const formatMoney = (value?: string | number | null, currency?: string | null): string => {
  const safeCurrency = (currency || "CLP").toUpperCase();
  const amount = typeof value === "number" ? value : Number(value || 0);
  if (Number.isNaN(amount)) return `0 ${safeCurrency}`;
  if (safeCurrency === "CLP") {
    return `$${Math.round(amount).toLocaleString("es-CL")} ${safeCurrency}`;
  }
  return `${amount.toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${safeCurrency}`;
};

const PRINT_STYLES = `
  @media print {
    header, footer, .no-print, button, a, .bg-emerald-500, .bg-slate-800, .bg-black {
      display: none !important;
    }
    body {
      background: white !important;
      color: black !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    .min-h-screen {
      background: white !important;
      padding-bottom: 0 !important;
    }
    .max-w-[1240px] {
      max-width: 100% !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0px !important;
    }
    .border-slate-200, .border-slate-100 {
      border-color: #eee !important;
    }
    .bg-white {
      background: white !important;
      border: 1px solid #eee !important;
    }
    .text-slate-400, .text-slate-500 {
      color: #777 !important;
    }
    /* El header de la hoja (QT-xxxx) debe mantenerse */
    .bg-black.text-white {
       background: #000 !important;
       color: #fff !important;
       display: flex !important;
       print-color-adjust: exact;
    }
  }
`;

export default function QuoteTrackingPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [proposal, setProposal] = useState<ProposalHeader | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [tracking, setTracking] = useState<TrackingPayload | null>(null);

  useEffect(() => {
    if (!token) return;
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const resp = await fetch(`${getApiBase()}/api/proposals/public/${token}/history?ts=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (!resp.ok) {
          if (mounted) setError("No pudimos cargar el seguimiento de esta cotizacion.");
          return;
        }

        const data = await resp.json();
        if (!mounted) return;
        setProposal(data?.proposal || null);
        setHistory(Array.isArray(data?.history) ? data.history : []);
        setTracking(data?.tracking || null);
      } catch (err) {
        console.error(err);
        if (mounted) setError("Error de conexion al cargar la trazabilidad.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => { mounted = false; };
  }, [token]);

  const [paymentTab, setPaymentTab] = useState<"mp" | "paypal" | "transfer" | "webpay">("mp");
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const [paymentSettings, setPaymentSettings] = useState({
    bank_transfer_details: "",
    paypal_payment_url: "https://paypal.me/fav945",
    mercadopago_payment_url: "https://www.mercadopago.cl",
    transbank_payment_url: "#"
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(`${getApiBase()}/api/proposals/payment-settings`);
        if (res.ok) {
          const data = await res.json();
          setPaymentSettings(data);
        }
      } catch (err) {
        console.error("Error fetching payment settings:", err);
      }
    }
    fetchSettings();
  }, []);

   const handleDownloadPDF = async () => {
      setIsGeneratingPDF(true);
      const element = document.getElementById("tracking-sheet");
      if (!element) return;

      try {
         const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
            onclone: (doc) => {
               // 1. Limpieza Quirúrgica de Estilos (Evita romper el DOM)
               const styleTags = doc.getElementsByTagName("style");
               for (let i = 0; i < styleTags.length; i++) {
                  try {
                     const tag = styleTags[i];
                     if (tag.textContent) {
                        tag.textContent = tag.textContent
                           .replace(/oklch\([^)]+\)/g, "#000000")
                           .replace(/oklab\([^)]+\)/g, "#000000");
                     }
                  } catch (e) { /* silent skip */ }
               }

               // 2. Inyectar reset prioritario
               const s = doc.createElement("style");
               s.innerHTML = `
                  * { 
                     color-scheme: light !important; 
                     box-shadow: none !important;
                     text-shadow: none !important;
                  }
                  /* Forzar colores básicos para evitar cualquier función residual */
                  .bg-black { background-color: #000000 !important; color: #ffffff !important; }
                  .bg-emerald-500, .bg-[#849a3f] { background-color: #849a3f !important; color: #ffffff !important; }
                  h1, h2, h3, p, span { color: #000000 !important; }
               `;
               doc.head.appendChild(s);
            }
         });
         
         const imgData = canvas.toDataURL("image/png");
         const pdf = new jsPDF("p", "mm", "a4");
         const pdfWidth = pdf.internal.pageSize.getWidth();
         const pdfHeight = Math.min((canvas.height * pdfWidth) / canvas.width, 285);
         
         pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
         pdf.save(`seguimiento-${proposal?.quote_number || "proyecto"}.pdf`);
      } catch (err) {
         console.error("Error generating PDF:", err);
         alert("Error al generar PDF. Estamos trabajando en la compatibilidad de colores modernos. Por favor intenta de nuevo en unos segundos.");
      } finally {
         setIsGeneratingPDF(false);
      }
   };

  async function handleUploadReceipt(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploadingReceipt(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${getApiBase()}/api/proposals/${token}/payment-receipt-upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Error al subir el archivo');

      const data = await res.json();
      alert('¡Comprobante enviado con éxito! Administración lo validará pronto.');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Error al subir el comprobante. Inténtalo de nuevo.');
    } finally {
      setUploadingReceipt(false);
    }
  }

  const handleMPPayment = () => {
    alert("Redirigiendo a Pasarela Segura de Mercado Pago...");
    window.location.href = paymentSettings.mercadopago_payment_url || "https://www.mercadopago.cl"; 
  };

  const handlePayPalPayment = () => {
    alert("Redirigiendo a PayPal Global...");
    window.location.href = paymentSettings.paypal_payment_url || "https://paypal.me/fav945";
  };

  const handleWebpayPayment = () => {
    alert("Redirigiendo a Webpay Plus (Transbank)...");
    window.location.href = paymentSettings.transbank_payment_url || "#";
  };

  const scopeItems = useMemo(() => {
    const fromTracking = Array.isArray(tracking?.scope_items) ? tracking?.scope_items || [] : [];
    if (fromTracking.length > 0) return fromTracking;
    return parseItems(proposal?.items).slice(0, 4);
  }, [proposal?.items, tracking?.scope_items]);

  const currentStage = tracking?.current_stage_detail || tracking?.stages?.find((stage) => stage.status === "current") || null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="h-10 w-10 border-4 border-slate-200 border-t-[#849a3f] rounded-full animate-spin mb-4" />
        <p className="text-xs font-black uppercase tracking-widest text-[#849a3f]">Cargando Sistema de Seguimiento Interactivo...</p>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-black text-slate-800">Acceso Restringido</h2>
        <p className="mt-2 text-slate-500 font-medium">{error || "No se ha encontrado el proyecto."}</p>
      </div>
    );
  }

  return (
    <div id="tracking-sheet" className="min-h-screen bg-slate-100/50 text-[#1e293b] font-sans pb-32">
      <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />
      
      {/* 1. HEADER SEGUIMIENTO PROFESIONAL */}
      <header className="bg-white border-b border-slate-200 px-6 py-5 md:px-12 sticky top-0 z-50">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between">
          <div className="flex items-center gap-4">
             <a href={`/cotizacion/${token}`} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#849a3f] hover:translate-x-[-4px] transition-all">
                <FaArrowLeft /> Volver a la Propuesta
             </a>
             <div className="h-12 w-12 flex items-center justify-center bg-black text-white font-black rounded shadow-md text-xl">FJ</div>
             <div>
                <h1 className="text-sm font-black uppercase tracking-tight">SISTEMA DE SEGUIMIENTO OPERATIVO</h1>
                <p className="text-[10px] font-bold text-[#849a3f] tracking-[0.3em]">PROCESOS DE INGENIERÍA DIGITAL</p>
             </div>
          </div>
          <div className="text-right hidden sm:block">
             <div className="flex items-center gap-2 justify-end mb-1">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sincronización en Directo</p>
             </div>
             <p className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">ESTADO ACTUAL: {currentStage?.client_title || currentStage?.label || "ACTIVO"}</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-6 mt-10">
        
        {/* 2. DASHBOARD DE PROGRESO */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-10 flex flex-col lg:flex-row">
           <div className="bg-black text-white p-12 lg:w-3/5">
              <span className="inline-block bg-[#849a3f] px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest mb-6">Proyecto en Producción</span>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">{proposal.quote_number}</h2>
              <p className="text-xl md:text-2xl font-bold text-slate-300 uppercase tracking-tight">{proposal.client_company || proposal.client_name || "Enterprise Partner"}</p>
              
              <div className="mt-12 flex flex-wrap gap-6 pt-10 border-t border-white/10">
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Presupuesto</p>
                    <p className="text-xl font-black text-white">{formatMoney(proposal.final_total, proposal.currency)}</p>
                 </div>
                 <div className="border-l border-white/10 pl-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Lead Time</p>
                    <p className="text-xl font-black text-white">{proposal.lead_time || "4-6 Semanas"}</p>
                 </div>
                 <div className="border-l border-white/10 pl-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Encargado</p>
                    <p className="text-xl font-black text-[#849a3f]">FJ SOFTWARE PRO</p>
                 </div>
              </div>
           </div>
           
           <div className="lg:w-2/5 p-12 flex flex-col justify-center items-center bg-slate-50">
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6">PROGRESO EJECUTADO</p>
              <div className="relative h-40 w-40 flex items-center justify-center">
                 <svg className="h-full w-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-200" />
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-[#849a3f]" 
                       strokeDasharray={440} strokeDashoffset={440 - (440 * (tracking?.progress_percent ?? 0)) / 100} />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-slate-800 leading-none">{tracking?.progress_percent ?? 0}</span>
                    <span className="text-xs font-black text-slate-500">PORCENTAJE</span>
                 </div>
              </div>
           </div>
        </div>

        {/* 3. DATOS TÉCNICOS INTEGRADOS */}
        <div className="grid gap-8 lg:grid-cols-2 mb-10">
           {/* DATOS CLIENTE ACCORDION STYLE */}
           <div className="bg-white border border-slate-200 shadow-sm rounded overflow-hidden">
              <div className="bg-[#849a3f] px-6 py-4 text-white font-black text-xs uppercase tracking-widest flex items-center justify-between">
                 <span className="flex items-center gap-2"><FaUser /> DATOS DEL CLIENTE</span>
                 <FaArrowDown className="text-white/20" />
              </div>
              <div className="p-8 grid gap-4 text-sm font-bold">
                 <div className="flex border-b border-slate-50 pb-2"><span className="w-32 text-[11px] uppercase text-slate-400">Cliente:</span> <span className="text-slate-800 uppercase">{proposal.client_name || "----"}</span></div>
                 <div className="flex border-b border-slate-50 pb-2"><span className="w-32 text-[11px] uppercase text-slate-400">Empresa:</span> <span className="text-slate-800 uppercase">{proposal.client_company || "----"}</span></div>
                 <div className="flex border-b border-slate-50 pb-2"><span className="w-32 text-[11px] uppercase text-slate-400">Correo:</span> <span className="text-slate-800">{proposal.client_email || "----"}</span></div>
                 <div className="flex border-b border-slate-50 pb-2"><span className="w-32 text-[11px] uppercase text-slate-400">Teléfono:</span> <span className="text-slate-800">{proposal.client_phone || "----"}</span></div>
                 <div className="flex border-b border-slate-50 pb-2"><span className="w-32 text-[11px] uppercase text-slate-400">RUT / RFC:</span> <span className="text-slate-800">{proposal.client_rut || "S/R"}</span></div>
                 <div className="flex"><span className="w-32 text-[11px] uppercase text-slate-400">Dirección:</span> <span className="text-slate-800 uppercase line-clamp-1">{proposal.client_address || "----"}</span></div>
              </div>
           </div>

           {/* REFERENCIA EJECUTIVA */}
           <div className="bg-white border border-slate-200 shadow-sm rounded overflow-hidden">
              <div className="bg-[#849a3f] px-6 py-4 text-white font-black text-xs uppercase tracking-widest flex items-center justify-between">
                 <span className="flex items-center gap-2"><FaProjectDiagram /> REFERENCIA EJECUTIVA</span>
                 <FaArrowDown className="text-white/20" />
              </div>
              <div className="p-8 space-y-6">
                 <div>
                    <span className="text-[11px] font-black text-slate-400 uppercase block mb-1">Resumen del Objetivo:</span>
                    <p className="font-bold text-slate-700 leading-relaxed italic line-clamp-4">"{proposal.project_objective || "Se realizará la implementación técnica bajo requerimientos de alta calidad y arquitectura distribuida."}"</p>
                 </div>
                 <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                    <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded text-[9px] font-black uppercase tracking-widest border border-emerald-200">PRIORIDAD: CRITICAL</div>
                    <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-[9px] font-black uppercase tracking-widest border border-blue-200">ACCESO PÚBLICO</div>
                 </div>
              </div>
           </div>
        </div>

        {/* 4. DETALLE DEL SERVICIO (One Page Premium, etc.) */}
        <section className="bg-white border border-slate-200 shadow-sm rounded overflow-hidden mb-12">
           <div className="bg-[#849a3f] px-6 py-4 text-white font-black text-xs uppercase tracking-widest">
              <div className="flex items-center gap-2"><FaBriefcase /> ALCANCE TÉCNICO Y ESPECIFICACIONES</div>
           </div>
           <div className="p-10">
              <div className="grid gap-12 lg:grid-cols-2">
                 {scopeItems.map((item, idx) => (
                    <div key={idx} className="group transition-all border-l-4 border-slate-100 pl-8 hover:border-[#849a3f]">
                       <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-4">{item.name}</h3>
                       <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed line-clamp-3">{item.description}</p>
                       <ul className="space-y-3">
                          {item.includes?.map((inc, iIdx) => (
                             <li key={iIdx} className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-tight">
                                <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full" /> {inc}
                             </li>
                          ))}
                       </ul>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* 5. GESTIÓN DE PAGOS ACTIVA (Ecosistema Élite) */}
        {currentStage?.id === "payment_50" && (
           <div id="payment-section" className="mb-12 rounded-2xl border-4 border-[#849a3f] bg-white p-8 md:p-12 shadow-2xl overflow-hidden no-print">
              <div className="flex flex-col lg:flex-row gap-10">
                 {/* Información de Monto */}
                 <div className="lg:w-1/3 flex flex-col justify-center">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full font-black uppercase text-[9px] tracking-widest mb-4 inline-block w-fit">PAGO REQUERIDO AL 50%</span>
                    <h2 className="text-4xl font-black tracking-tighter text-slate-800 mb-4">Confirmar Inversión Inicial</h2>
                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-xl mt-4">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monto de Activación:</p>
                       <p className="text-4xl font-black text-[#849a3f] tracking-tighter">
                          {formatMoney(Number(proposal.final_total) / 2, proposal.currency)}
                       </p>
                    </div>
                 </div>

                 {/* Selector de Métodos de Pago */}
                 <div className="lg:w-2/3">
                    <div className="flex border-b border-slate-100 mb-6 overflow-x-auto no-scrollbar">
                       <button onClick={() => setPaymentTab("mp")} className={`pb-4 px-6 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${paymentTab === 'mp' ? 'text-[#849a3f] border-b-2 border-[#849a3f]' : 'text-slate-400'}`}>Mercado Pago / Tarjetas</button>
                       <button onClick={() => setPaymentTab("webpay")} className={`pb-4 px-6 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${paymentTab === 'webpay' ? 'text-[#849a3f] border-b-2 border-[#849a3f]' : 'text-slate-400'}`}>Transbank / Webpay</button>
                       <button onClick={() => setPaymentTab("paypal")} className={`pb-4 px-6 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${paymentTab === 'paypal' ? 'text-[#849a3f] border-b-2 border-[#849a3f]' : 'text-slate-400'}`}>PayPal Global</button>
                       <button onClick={() => setPaymentTab("transfer")} className={`pb-4 px-6 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${paymentTab === 'transfer' ? 'text-[#849a3f] border-b-2 border-[#849a3f]' : 'text-slate-400'}`}>Transferencia Bancaria</button>
                    </div>

                    <AnimatePresence mode="wait">
                       {paymentTab === "mp" && (
                          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                             <p className="text-sm font-bold text-slate-600 italic">Paga de forma segura con tu cuenta de Mercado Pago o tarjetas de crédito/débito locales.</p>
                             <button onClick={handleMPPayment} className="w-full h-16 bg-[#009ee3] text-white font-black rounded-xl hover:bg-[#008bd0] transition-all flex items-center justify-center gap-3 text-sm tracking-widest">
                                <FaCreditCard /> PAGAR CON MERCADO PAGO
                             </button>
                          </motion.div>
                       )}
                       {paymentTab === "webpay" && (
                          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                             <p className="text-sm font-bold text-slate-600 italic">Redirección oficial a Transbank Webpay Plus.</p>
                             <button onClick={handleWebpayPayment} className="w-full h-16 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-3 text-sm tracking-widest uppercase">
                                Ir a Webpay Plus
                             </button>
                          </motion.div>
                       )}
                       {paymentTab === "paypal" && (
                          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                             <p className="text-sm font-bold text-slate-600 italic">Ideal para pagos internacionales en USD o con saldo PayPal.</p>
                             <button onClick={handlePayPalPayment} className="w-full h-16 bg-black text-white font-black rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 text-sm tracking-widest">
                                <FaPaypal className="text-xl text-blue-400" /> PAGAR CON PAYPAL
                             </button>
                          </motion.div>
                       )}
                       {paymentTab === "transfer" && (
                          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                             <div className="grid grid-cols-2 gap-4 bg-slate-900 text-white p-6 rounded-xl text-[11px] font-bold">
                                {paymentSettings.bank_transfer_details ? (
                                    <div className="col-span-2 space-y-1" dangerouslySetInnerHTML={{ __html: paymentSettings.bank_transfer_details }} />
                                 ) : (
                                    <>
                                       <div><span className="text-slate-500 uppercase block mb-1">Banco:</span> BANCO FALABELLA</div>
                                       <div><span className="text-slate-500 uppercase block mb-1">Tipo:</span> CORRIENTE</div>
                                       <div><span className="text-slate-500 uppercase block mb-1">Titular:</span> FAVIO JIMENEZ</div>
                                       <div><span className="text-slate-500 uppercase block mb-1">Número:</span> 1-724-002786-7</div>
                                       <div><span className="text-slate-500 uppercase block mb-1">RUT:</span> 24.785.698-6</div>
                                       <div><span className="text-slate-500 uppercase block mb-1">Email comprobante:</span> FAVIO4515@GMAIL.COM</div>
                                    </>
                                 )}
                             </div>
                             
                             <div className="pt-4">
                                {proposal.payment_status === "verifying" ? (
                                   <div className="bg-amber-100 border border-amber-200 text-amber-700 p-4 rounded-lg flex items-center gap-3 font-black text-sm">
                                      <FaClock className="animate-spin" /> COMPROBANTE EN REVISIÓN POR ADMIN
                                   </div>
                                ) : (
                                   <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-6 hover:bg-slate-50 transition-all cursor-pointer">
                                      <FaCloudUploadAlt className="text-slate-300 text-3xl mb-2" />
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                         {uploadingReceipt ? "SUBIENDO..." : "SUBIR COMPROBANTE DE PAGO"}
                                      </span>
                                      <input type="file" className="hidden" onChange={handleUploadReceipt} accept="image/*,.pdf" />
                                   </label>
                                )}
                             </div>
                          </motion.div>
                       )}
                    </AnimatePresence>
                 </div>
              </div>
           </div>
        )}

        {proposal.payment_status === "paid" && (
           <div className="mb-12 bg-emerald-50 border-2 border-emerald-500 p-8 rounded-xl flex items-center gap-6 no-print">
              <div className="h-16 w-16 bg-emerald-500 text-white flex items-center justify-center rounded-full text-2xl shadow-lg">✓</div>
              <div>
                 <h3 className="text-2xl font-black text-emerald-800 tracking-tighter uppercase">Inversión Inicial Confirmada</h3>
                 <p className="text-sm font-bold text-emerald-700">El pago ha sido procesado exitosamente por administración. El proyecto se encuentra en ejecución.</p>
              </div>
           </div>
        )}

        {/* 6. ROADMAP INTERACTIVO (Evidencias y Reportes) */}
        <section className="space-y-8">
           <div className="flex items-center gap-4 mb-4">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.5em]">Trazabilidad de la Operación</h2>
              <div className="h-px flex-1 bg-slate-200" />
           </div>
           
           <div className="grid gap-6">
              {(tracking?.stages || [])
                .filter((s) => !["quote_created", "quote_sent", "client_review", "quote_approved"].includes(s.id))
                .map((stage, idx) => {
                   const isCompleted = stage.status === "completed" || stage.completed;
                   const isCurrent = stage.status === "current";
                   const isExpanded = selectedStageId === stage.id;
                   let effectiveMediaUrls = stage.media_urls || [];
                   if (stage.id === "payment_50" && proposal.payment_receipt_url) {
                     if (!effectiveMediaUrls.includes(proposal.payment_receipt_url)) {
                       effectiveMediaUrls = [proposal.payment_receipt_url, ...effectiveMediaUrls];
                     }
                   }
                   const hasMedia = Array.isArray(effectiveMediaUrls) && effectiveMediaUrls.length > 0;
                   const hasSummary = Boolean(stage.summary);

                   return (
                      <div 
                         key={stage.id} 
                         className={`bg-white border rounded-xl overflow-hidden transition-all ${
                            isCurrent ? "border-black shadow-lg ring-4 ring-slate-50" : "border-slate-200"
                         }`}
                      >
                         {/* Fila Principal de la Etapa */}
                         <div className="flex flex-col md:flex-row items-center justify-between p-6 md:p-8 gap-6">
                            <div className="flex items-center gap-6 w-full md:w-auto">
                               <div className={`h-14 w-14 shrink-0 flex items-center justify-center rounded-xl font-black text-xl border-2 transition-all ${
                                  isCompleted ? "bg-[#849a3f] border-[#849a3f] text-white" : 
                                  isCurrent ? "bg-black border-black text-white animate-pulse" : 
                                  "bg-slate-50 border-slate-100 text-slate-300"
                               }`}>
                                  {isCompleted ? "✓" : idx + 1}
                               </div>
                               <div>
                                  <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{stage.client_title || stage.label}</h4>
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                     <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded ${
                                        isCompleted ? "bg-emerald-100 text-emerald-700" : 
                                        isCurrent ? "bg-black text-white" : 
                                        "bg-slate-100 text-slate-400"
                                     }`}>
                                        {isCompleted ? "HITO COMPLETADO" : isCurrent ? "EN EJECUCIÓN" : "PENDIENTE"}
                                     </span>
                                     <span className="text-[9px] font-bold text-slate-400 uppercase">
                                        {isCompleted && stage.date ? `FINALIZADO EL ${formatDateTime(stage.date)}` : ""}
                                     </span>
                                  </div>
                               </div>
                            </div>
                            
                            <div className="flex gap-3 w-full md:w-auto">
                               {(isCompleted || isCurrent) && (
                                  <button 
                                     onClick={() => setSelectedStageId(isExpanded ? null : stage.id)}
                                     className={`flex-1 md:flex-none h-12 px-8 rounded font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 ${
                                        isExpanded ? "bg-black text-white" : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                                     }`}
                                  >
                                     <FaArrowDown className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} /> 
                                     {isExpanded ? "OCULTAR DETALLE" : "VER AVANCES Y EVIDENCIAS"}
                                  </button>
                               )}
                            </div>
                         </div>

                         {/* Área de Detalle Expandido (EVIDENCIAS) */}
                         <AnimatePresence>
                            {isExpanded && (
                               <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t border-slate-100 bg-slate-50/50 p-6 md:p-10"
                               >
                                  <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
                                     {/* Lado Reporte */}
                                     <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Reporte del Hito:</p>
                                        <div className="bg-white border border-slate-200 p-6 rounded-lg text-sm md:text-base font-bold leading-relaxed text-slate-700">
                                           {stage.summary || stage.description || "Hito verificado internamente bajo estándares de calidad. Sin descripción adicional."}
                                        </div>
                                        
                                        {isCurrent && stage.next_step && (
                                           <div className="mt-8 p-6 bg-black text-white rounded-lg">
                                              <p className="text-[9px] font-black text-[#849a3f] uppercase tracking-widest mb-2">Próxima Acción Programada:</p>
                                              <p className="text-base font-black tracking-tight">{stage.next_step}</p>
                                           </div>
                                        )}
                                     </div>

                                     {/* Lado Evidencias */}
                                     <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Evidencias Multimedia:</p>
                                        {hasMedia ? (
                                           <div className="grid gap-4">
                                              {effectiveMediaUrls.map((url, uIdx) => (
                                                 <a 
                                                   key={uIdx} 
                                                   href={url} 
                                                   target="_blank" 
                                                   className="flex items-center gap-4 bg-white border border-slate-200 p-4 rounded-lg hover:border-[#849a3f] transition-all group"
                                                 >
                                                    <div className="h-10 w-10 flex items-center justify-center bg-slate-100 rounded group-hover:bg-[#849a3f]/10 transition-all">
                                                       <FaImage className="text-slate-400 group-hover:text-[#849a3f]" />
                                                    </div>
                                                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Archivo de Verificación {uIdx + 1}</span>
                                                    <FaExternalLinkAlt className="ml-auto text-slate-300 text-[10px]" />
                                                 </a>
                                              ))}
                                           </div>
                                        ) : (
                                           <div className="bg-slate-100 border border-dashed border-slate-300 p-10 rounded-lg flex flex-col items-center justify-center text-center">
                                              <FaImage className="text-slate-300 mb-2 text-2xl" />
                                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Sin archivos multimedia<br/>Cargados en esta etapa</p>
                                           </div>
                                        )}
                                     </div>
                                  </div>
                               </motion.div>
                            )}
                         </AnimatePresence>
                      </div>
                   );
                })}
           </div>
        </section>

        {/* 7. RESUMEN FINAL / ACCIONES */}
        <div className="mt-20 p-10 bg-slate-800 rounded-xl text-white flex flex-col md:flex-row items-center justify-between gap-10 no-print">
           <div className="max-w-xl">
              <h3 className="text-3xl font-black tracking-tighter mb-4">Soporte Técnico Especializado</h3>
              <p className="text-sm font-bold text-slate-400 leading-relaxed">Si tiene dudas sobre las evidencias mostradas o prefiere una sesión de revisión en vivo, contacte a su ingeniero asignado directamente vía WhatsApp o Email.</p>
           </div>
           <div className="flex gap-4 w-full md:w-auto">
              <a 
                href={`mailto:ing@nextlevelsoftwarepro.com?subject=Consulta de Seguimiento - Folio ${proposal?.quote_number || 'Proyecto'}`}
                className="flex-1 bg-slate-700 text-white px-10 py-5 rounded font-black uppercase text-xs tracking-widest hover:bg-slate-600 transition-all shadow-lg text-center flex items-center justify-center gap-2"
              >
                <FaEnvelope /> Email
              </a>
              <a 
                href="https://wa.me/56971464296" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 bg-emerald-500 text-black px-10 py-5 rounded font-black uppercase text-xs tracking-widest hover:bg-emerald-400 transition-all shadow-lg text-center flex items-center justify-center gap-2"
              >
                <FaWhatsapp /> WhatsApp
              </a>
           </div>
        </div>

      </div>
    </div>
  );
}
