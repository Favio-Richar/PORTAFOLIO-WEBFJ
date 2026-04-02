"use client";

import { useEffect, useState, useRef, type ChangeEvent, type ReactNode } from "react";
import {
    FaInbox, FaCircle, FaTrash, FaTimes,
    FaSyncAlt, FaEnvelopeOpenText, FaWhatsapp, FaRobot, FaHandshake,
    FaPaperPlane, FaPlusCircle, FaFilter,
    FaFileAlt, FaCalendarCheck, FaPaperclip, FaChevronRight, FaUserAlt,
    FaExternalLinkAlt, FaQuoteRight, FaCheckCircle,
    FaExclamationTriangle, FaEdit
} from "react-icons/fa";
import { adminFetch } from "@/lib/adminFetch";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: number;
    uid?: string;
    is_admin?: boolean;
    nombre: string;
    email: string;
    telefono?: string;
    mensaje: string;
    html_content?: string;
    subject?: string;
    status: string | "pending" | "read" | "trash";
    created_at: string;
    source: string;
    sender?: string;
    type: "quote" | "advisory" | "direct" | "imap" | "sent";
}

interface LeadHistoryEntry {
    id: number;
    sender: "client" | "admin" | "system";
    content: string;
    html_content?: string;
    subject?: string;
    channel: "email" | "whatsapp" | "note";
    created_at: string;
}

type Category = "all" | "imap" | "quote" | "advisory" | "sent";

interface ConvertibleLead {
    id: number;
    nombre: string;
    email: string;
    telefono?: string;
    mensaje: string;
    created_at: string;
}

interface ProposalSummary {
    id: number;
    quote_number: string;
    client_name: string;
    final_total: number;
    currency: string;
    public_token: string;
    status: string;
}

interface ServiceRecord {
    id: number;
    name: string;
    description?: string;
    price?: string;
    includes?: string;
}

interface ComboRecord extends ServiceRecord {
    combo_price?: string;
    note?: string;
}

interface ServiceCatalogItem {
    id: number;
    name: string;
    description: string;
    price: string;
    includes?: string;
    category: string;
}

export default function MessagesAdmin({ onConvert }: { onConvert?: (lead: ConvertibleLead) => void }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
    const [history, setHistory] = useState<LeadHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Category>("all");
    const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "read">("all");
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const [sendingReply, setSendingReply] = useState(false);
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [composeData, setComposeData] = useState({ to: "", subject: "", content: "" });
    const [composeAttachments, setComposeAttachments] = useState<File[]>([]);
    const [replyAttachments, setReplyAttachments] = useState<File[]>([]);
    const [proposals, setProposals] = useState<ProposalSummary[]>([]);
    const [services, setServices] = useState<ServiceCatalogItem[]>([]);
    const [isPickerOpen, setIsPickerOpen] = useState<'quote' | 'service' | null>(null);
    const [isMailSidebarCollapsed, setIsMailSidebarCollapsed] = useState(false);
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [phoneDraft, setPhoneDraft] = useState("");
    const [savingPhone, setSavingPhone] = useState(false);
    const [activeFolder, setActiveFolder] = useState<"inbox" | "unread" | "sent" | "spam" | "trash">("inbox");
    const chatEndRef = useRef<HTMLDivElement>(null);
    const chatTopRef = useRef<HTMLDivElement>(null);
    const replyAttachmentInputRef = useRef<HTMLInputElement>(null);
    const composeAttachmentInputRef = useRef<HTMLInputElement>(null);
    const PENDING_STATUSES = new Set(["pending", "confirmed", "active"]);
    const READ_STATUSES = new Set(["read", "reviewed", "processed", "contacted"]);

    const isAdminMessage = (message: Message) =>
        Boolean(message.is_admin || message.type === "sent" || message.status === "sent");

    const isUnreadMessage = (message: Message) =>
        PENDING_STATUSES.has(message.status) &&
        !isAdminMessage(message) &&
        message.status !== "trash" &&
        message.status !== "spam";

    const getRestoredStatus = (message: Message) =>
        message.type === "advisory" ? "confirmed" : "pending";

    const readArrayResponse = async <T,>(response: Response): Promise<T[]> => {
        if (!response.ok) return [];
        return (await response.json()) as T[];
    };

    const notify = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const normalizePhoneDigits = (value?: string | null) => String(value || "").replace(/\D/g, "");
    const normalizeEmailKey = (value?: string | null) => String(value || "").trim().toLowerCase();

    const mergeFiles = (current: File[], incoming: File[]) => {
        const seen = new Set(current.map((file) => `${file.name}-${file.size}-${file.lastModified}`));
        const next = [...current];

        for (const file of incoming) {
            const signature = `${file.name}-${file.size}-${file.lastModified}`;
            if (seen.has(signature)) continue;
            seen.add(signature);
            next.push(file);
        }

        return next;
    };

    const handleComposeAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;
        setComposeAttachments((prev) => mergeFiles(prev, files));
        event.target.value = "";
    };

    const handleReplyAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;
        setReplyAttachments((prev) => mergeFiles(prev, files));
        event.target.value = "";
    };

    useEffect(() => {
        if (!isComposeOpen) return;

        let isCancelled = false;

        const loadComposeResources = async () => {
            try {
                const [proposalRes, plansRes, addRes, combosRes] = await Promise.all([
                    adminFetch("/api/proposals/"),
                    adminFetch("/api/services-page/plans"),
                    adminFetch("/api/services-page/additional-services"),
                    adminFetch("/api/services-page/combos")
                ]);

                const [proposalData, plans, additional, combos] = await Promise.all([
                    proposalRes.ok ? proposalRes.json() : Promise.resolve([]),
                    readArrayResponse<ServiceRecord>(plansRes),
                    readArrayResponse<ServiceRecord>(addRes),
                    readArrayResponse<ComboRecord>(combosRes)
                ]);

                if (isCancelled) return;

                setProposals(proposalData as ProposalSummary[]);
                setServices([
                    ...plans.map((plan) => ({
                        id: plan.id,
                        name: plan.name,
                        description: plan.description || "",
                        price: String(plan.price || ""),
                        includes: plan.includes,
                        category: "Plan Profesional"
                    })),
                    ...additional.map((service) => ({
                        id: service.id,
                        name: service.name,
                        description: service.description || "",
                        price: String(service.price || ""),
                        includes: service.includes,
                        category: "Servicio Adicional"
                    })),
                    ...combos.map((combo) => ({
                        id: combo.id,
                        name: combo.name,
                        description: combo.note || combo.description || "",
                        price: String(combo.combo_price || combo.price || ""),
                        includes: combo.includes,
                        category: "Combo Enterprise"
                    }))
                ]);
            } catch (error) {
                console.error("Error loading compose resources:", error);
            }
        };

        void loadComposeResources();

        return () => {
            isCancelled = true;
        };
    }, [isComposeOpen]);

    const insertProposal = (p: ProposalSummary) => {
        const text = `Estimado/a ${p.client_name},\n\nLe adjunto el acceso a su Propuesta Comercial ${p.quote_number} por un total de ${p.final_total.toLocaleString()} ${p.currency}. \n\nPuede revisarla y gestionarla aquí: ${window.location.origin}/cotizacion/${p.public_token}\n\nQuedo atento a su aprobación técnica.\n\nSaludos.`;
        setComposeData(prev => ({ ...prev, content: text, subject: `Propuesta Comercial: ${p.quote_number}` }));
        setIsPickerOpen(null);
    };

    const insertService = (s: ServiceCatalogItem) => {
        const text = `Estimado/a,\n\nLe presento nuestro servicio "${s.name}".\n\nDescripción: ${s.description}\nInversión: ${s.price}\n\nIncluye: ${s.includes}\n\nQuedamos a su disposición para iniciar este proyecto.\n\nSaludos cordiales.`;
        setComposeData(prev => ({ ...prev, content: text }));
        setIsPickerOpen(null);
    };

    const insertTemplate = (type: 'welcome' | 'quote' | 'advisory') => {
        const templates = {
            welcome: "Estimado/a,\n\nGracias por contactar con nuestra agencia. Hemos recibido su consulta y un asesor especializado se pondrá en contacto pronto para profundizar en sus requerimientos.\n\nSaludos cordiales,\nEquipo de Consultoría IT.",
            quote: "Seleccione una cotización del historial para insertar datos reales.",
            advisory: "Seleccione un servicio del catálogo para insertar datos reales."
        };
        if (type === 'quote') setIsPickerOpen('quote');
        else if (type === 'advisory') setIsPickerOpen('service');
        else setComposeData(prev => ({ ...prev, content: templates[type] }));
    };

    const loadMessages = async () => {
        setLoading(true);
        try {
            const res = await adminFetch("/api/messages");
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error("Error loading messages:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadHistory = async (id: number, type: string, uid?: string) => {
        setLoadingHistory(true);
        try {
            const res = await adminFetch(`/api/messages/${id}/history?type=${type}&uid=${uid || ""}`);
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => { 
        loadMessages(); 
        const handleNewMessage = () => loadMessages();
        window.addEventListener('new_message_arrived', handleNewMessage);
        return () => window.removeEventListener('new_message_arrived', handleNewMessage);
    }, []);

    const formatLocalDate = (dateString: string | undefined) => {
        if (!dateString) return "";
        const utcString = dateString.includes('Z') || dateString.includes('+') ? dateString : `${dateString}Z`;
        return new Date(utcString).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    const formatShortDate = (dateString: string | undefined) => {
        if (!dateString) return "";
        const utcString = dateString.includes('Z') || dateString.includes('+') ? dateString : `${dateString}Z`;
        return new Date(utcString).toLocaleDateString();
    };

    const handleSelectMessage = async (msg: Message) => {
        // Seleccion rapida para no bloquear al usuario
        setSelectedMsg(msg);
        
        // Desmarcar punto azul y restar contador global
        if (isUnreadMessage(msg)) {
            try {
                // Actualizamos DB
                await adminFetch(`/api/messages/${msg.id}/read?uid=${msg.uid}&type=${msg.type}`, { method: 'PATCH' });
                // Actualizamos estado React local para que desaparezca el badge
                setMessages(prev => prev.map(m =>
                    m.uid === msg.uid || (!msg.uid && m.id === msg.id && m.type === msg.type)
                        ? { ...m, status: 'read' }
                        : m
                ));
                setSelectedMsg(prev => (prev ? { ...prev, status: "read" } : prev));
                // Avisamos a la Campanita/Menu que recalcule (HeaderBell)
                window.dispatchEvent(new Event('messages_updated'));
            } catch (error) {
                console.error("Error marcando mensaje como leido", error);
            }
        }
    };

    useEffect(() => {
        if (selectedMsg) {
            loadHistory(selectedMsg.id, selectedMsg.type, selectedMsg.uid);
            setPhoneDraft(selectedMsg.telefono || "");
            setIsEditingPhone(false);
            setReplyAttachments([]);
            // Scroll al INICIO para leer el email desde arriba
            setTimeout(() => chatTopRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        }
    }, [selectedMsg]);

    useEffect(() => {
        // Solo scroll al fondo si hay respuestas en el hilo
        if (history.length > 0) {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [history]);

    const handleReply = async (channel: "email" | "whatsapp" = "email") => {
        if (!selectedMsg || !replyContent.trim()) return;

        setSendingReply(true);
        try {
            const formData = new FormData();
            formData.append("content", replyContent);
            formData.append("channel", channel);
            replyAttachments.forEach((file) => formData.append("attachments", file));

            const res = await adminFetch(`/api/messages/${selectedMsg.id}/reply?type=${selectedMsg.type}&uid=${selectedMsg.uid || ""}`, {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                notify("Respuesta enviada con éxito.", 'success');
                setReplyContent("");
                setReplyAttachments([]);
                loadHistory(selectedMsg.id, selectedMsg.type, selectedMsg.uid);
                setMessages(prev => prev.map(m =>
                    m.uid === selectedMsg.uid || (m.id === selectedMsg.id && m.type === selectedMsg.type)
                        ? { ...m, status: "read" } : m
                ));
                setSelectedMsg(prev => (prev ? { ...prev, status: "read" } : prev));
                window.dispatchEvent(new Event('messages_updated'));
            } else {
                const errorData = await res.json().catch(() => null);
                notify(errorData?.detail || "No se pudo enviar la respuesta.", 'error');
            }
        } catch (error) {
            console.error("Error sending reply:", error);
            notify("Error enviando la respuesta.", 'error');
        } finally {
            setSendingReply(false);
        }
    };

    const deleteMessage = async (id: number, type: string, uid?: string) => {
        if (!confirm("¿Mover este mensaje a la papelera?")) return;
        try {
            const res = await adminFetch(`/api/messages/${id}?type=${type}&uid=${uid || ""}`, { method: "DELETE" });
            if (res.ok) {
                setMessages(prev => prev.map(m =>
                    ((uid && m.uid === uid) || (!uid && m.id === id && m.type === type))
                        ? { ...m, status: "trash" }
                        : m
                ));
                if (selectedMsg?.uid === uid || (selectedMsg?.id === id && selectedMsg?.type === type)) setSelectedMsg(null);
                window.dispatchEvent(new Event('messages_updated'));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const updateMessageStatus = async (id: number, type: string, newStatus: string, uid?: string) => {
        try {
            const res = await adminFetch(`/api/messages/${id}/status?type=${type}&uid=${uid || ""}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setMessages(prev => prev.map(m =>
                    ((uid && m.uid === uid) || (!uid && m.id === id && m.type === type))
                        ? { ...m, status: newStatus }
                        : m
                ));
                if (selectedMsg?.uid === uid || (selectedMsg?.id === id && selectedMsg?.type === type)) {
                    const shouldClearSelection =
                        activeFolder === "unread" ||
                        activeFolder === "spam" ||
                        activeFolder === "trash" ||
                        ((activeFolder === "inbox" || activeFolder === "sent") && (newStatus === "spam" || newStatus === "trash"));

                    if (shouldClearSelection) {
                        setSelectedMsg(null);
                    } else {
                        setSelectedMsg(prev => prev ? { ...prev, status: newStatus } : null);
                    }
                }
                notify(`Mensaje marcado como ${newStatus}`, 'success');
                window.dispatchEvent(new Event('messages_updated'));
            }
        } catch (error) {
            console.error(error);
            notify("Error al actualizar estado", 'error');
        }
    };

    const handleSendNewEmail = async () => {
        if (!composeData.to || !composeData.subject || !composeData.content) return;
        setSendingReply(true);
        try {
            const formData = new FormData();
            formData.append("to", composeData.to);
            formData.append("subject", composeData.subject);
            formData.append("content", composeData.content);
            composeAttachments.forEach((file) => formData.append("attachments", file));

            const res = await adminFetch("/api/messages/send", {
                method: "POST",
                body: formData
            });
            if (res.ok) {
                notify("Comunicación Senior emitida con éxito.", 'success');
                setIsComposeOpen(false);
                setComposeData({ to: "", subject: "", content: "" });
                setComposeAttachments([]);
                loadMessages();
                window.dispatchEvent(new Event('messages_updated'));
            } else {
                const errorData = await res.json().catch(() => null);
                notify(errorData?.detail || "No se pudo enviar el correo.", 'error');
            }
        } catch (error) {
            console.error(error);
            notify("Error enviando el correo.", 'error');
        } finally {
            setSendingReply(false);
        }
    };

    const handleOpenWhatsApp = () => {
        if (!selectedMsg) return;

        const cleanPhone = normalizePhoneDigits(selectedMsg.telefono);
        if (!cleanPhone) {
            notify("Falta número de teléfono", 'error');
            setIsEditingPhone(true);
            return;
        }

        window.open(`https://wa.me/${cleanPhone}`, "_blank", "noopener,noreferrer");
    };

    const handleConvertToQuote = () => {
        if (!selectedMsg || !onConvert) return;
        onConvert({
            id: selectedMsg.id,
            nombre: selectedMsg.nombre,
            email: selectedMsg.email,
            telefono: selectedMsg.telefono || "",
            mensaje: selectedMsg.mensaje,
            created_at: selectedMsg.created_at,
        });
    };

    const handleSavePhone = async () => {
        if (!selectedMsg) return;
        if (!phoneDraft.trim()) {
            notify("Falta número de teléfono", 'error');
            return;
        }

        setSavingPhone(true);
        try {
            const res = await adminFetch(`/api/messages/${selectedMsg.id}/phone?type=${selectedMsg.type}&uid=${selectedMsg.uid || ""}`, {
                method: "PATCH",
                body: JSON.stringify({ phone: phoneDraft.trim() })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                notify(errorData?.detail || "No se pudo guardar el número.", 'error');
                return;
            }

            const data = await res.json();
            const savedPhone = String(data.phone || phoneDraft).trim();
            const emailKey = normalizeEmailKey(data.email || selectedMsg.email);

            setMessages((prev) => prev.map((message) =>
                normalizeEmailKey(message.email) === emailKey
                    ? { ...message, telefono: savedPhone }
                    : message
            ));
            setSelectedMsg((prev) => (prev ? { ...prev, telefono: savedPhone } : prev));
            setPhoneDraft(savedPhone);
            setIsEditingPhone(false);
            notify("WhatsApp actualizado correctamente.", 'success');
        } catch (error) {
            console.error("Error saving phone:", error);
            notify("Error guardando el número.", 'error');
        } finally {
            setSavingPhone(false);
        }
    };

    const selectedPhoneDigits = normalizePhoneDigits(selectedMsg?.telefono);
    const unreadInboxCount = messages.filter(isUnreadMessage).length || undefined;
    const unreadGlobalCount = messages.filter(isUnreadMessage).length || undefined;

    const filteredMessages = messages.filter(m => {
        if (activeFolder === "trash") return m.status === 'trash';
        if (activeFolder === "spam") return m.status === 'spam';
        if (activeFolder === "sent") return isAdminMessage(m);

        // Filtro de No Leídos: todos los pendientes de cualquier fuente
        if (activeFolder === "unread") {
            return isUnreadMessage(m);
        }

        // Inbox normal: SOLO mostrar mensajes que vienen del CLIENTE o del SISTEMA (notificaciones)
        if (activeFolder === "inbox") {
            if (m.status === 'trash' || m.status === 'spam') return false;
            // Solo excluir mensajes explícitamente marcados como admin/enviados
            if (isAdminMessage(m)) return false;
        }

        if (currentCategory !== "all" && m.type !== currentCategory) return false;
        if (filterStatus === "pending") return isUnreadMessage(m);
        if (filterStatus === "read") return READ_STATUSES.has(m.status);
        return true;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return (
        <div className="flex bg-[#0a0c10] h-[calc(100vh-120px)] overflow-hidden">

            {/* GMAIL-STYLE INTERNAL SIDEBAR */}
            <div className={`bg-[#0d0f14] border-r border-white/5 flex flex-col transition-all duration-300 ${isMailSidebarCollapsed ? 'w-20 lg:w-20' : 'w-20 lg:w-72'}`}>
                <div className={`p-4 lg:p-6 flex ${isMailSidebarCollapsed ? 'flex-col items-center gap-3' : 'items-center justify-between gap-3'}`}>
                    <button
                        onClick={() => setIsComposeOpen(true)}
                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0047FF] to-[#00D1FF] flex items-center justify-center text-white shadow-[0_10px_40px_rgba(0,71,255,0.25)] hover:shadow-[0_15px_50px_rgba(0,71,255,0.35)] hover:-translate-y-0.5 transition-all duration-300"
                        title="Redactar nuevo correo"
                    >
                        <FaPlusCircle className="text-lg" />
                    </button>
                    <button
                        onClick={() => setIsMailSidebarCollapsed((prev) => !prev)}
                        className="w-11 h-11 rounded-2xl border border-white/10 bg-white/5 text-white/40 hover:text-white hover:border-[#0047FF]/30 transition-all flex items-center justify-center"
                        title={isMailSidebarCollapsed ? "Mostrar menú de correos" : "Ocultar menú de correos"}
                    >
                        <FaChevronRight className={`text-sm transition-transform duration-300 ${isMailSidebarCollapsed ? '' : 'rotate-180'}`} />
                    </button>
                </div>

                <div className="flex-1 py-4 space-y-1">
                    <NavItem
                        icon={<FaInbox className="text-blue-500" />}
                        label="Bandeja Entrada"
                        active={activeFolder === "inbox" && currentCategory === "all"}
                        onClick={() => { setActiveFolder("inbox"); setCurrentCategory("all"); }}
                        count={unreadInboxCount}
                        collapsed={isMailSidebarCollapsed}
                    />
                    <NavItem
                        icon={<FaEnvelopeOpenText className="text-cyan-400" />}
                        label="Emails Hostinger"
                        active={activeFolder === "inbox" && currentCategory === "imap"}
                        onClick={() => { setActiveFolder("inbox"); setCurrentCategory("imap"); }}
                        collapsed={isMailSidebarCollapsed}
                    />
                    <NavItem
                        icon={<FaCircle className="text-rose-500" />}
                        label="No Leídos"
                        active={activeFolder === "unread"}
                        onClick={() => { setActiveFolder("unread"); setCurrentCategory("all"); }}
                        count={unreadGlobalCount}
                        collapsed={isMailSidebarCollapsed}
                    />
                    <NavItem
                        icon={<FaFileAlt className="text-amber-500" />}
                        label="Cotizaciones"
                        active={activeFolder === "inbox" && currentCategory === "quote"}
                        onClick={() => { setActiveFolder("inbox"); setCurrentCategory("quote"); }}
                        collapsed={isMailSidebarCollapsed}
                    />
                    <NavItem
                        icon={<FaCalendarCheck className="text-indigo-400" />}
                        label="Asesorías"
                        active={activeFolder === "inbox" && currentCategory === "advisory"}
                        onClick={() => { setActiveFolder("inbox"); setCurrentCategory("advisory"); }}
                        collapsed={isMailSidebarCollapsed}
                    />
                    <div className="pt-6 mt-6 border-t border-white/5 mx-4">
                        {!isMailSidebarCollapsed && <span className="hidden lg:block text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 ml-4">Sistema Pro</span>}
                        <NavItem
                            icon={<FaPaperPlane className="text-emerald-400" />}
                            label="Enviados"
                            active={activeFolder === "sent"}
                            onClick={() => setActiveFolder("sent")}
                            collapsed={isMailSidebarCollapsed}
                        />
                        <NavItem
                            icon={<FaExclamationTriangle className="text-amber-500" />}
                            label="Spam"
                            active={activeFolder === "spam"}
                            onClick={() => setActiveFolder("spam")}
                            collapsed={isMailSidebarCollapsed}
                        />
                        <NavItem
                            icon={<FaTrash className="text-red-500" />}
                            label="Papelera"
                            active={activeFolder === "trash"}
                            onClick={() => setActiveFolder("trash")}
                            collapsed={isMailSidebarCollapsed}
                        />
                    </div>
                </div>
            </div>

            {/* MESSAGE LIST */}
            <div className="w-[350px] lg:w-[450px] bg-[#0d0f14] border-r border-white/5 flex flex-col">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#111319]/50 backdrop-blur-xl">
                    <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-3">
                        <FaFilter className="text-[#0047FF]" />
                        {activeFolder === 'unread' ? '🔴 Sin Gestionar' :
                            currentCategory === 'all' ? 'Bandeja de Entrada' :
                                currentCategory === 'quote' ? 'Cotizaciones' :
                                    currentCategory === 'imap' ? 'Emails Corporativos' :
                                        currentCategory === 'sent' ? 'Mensajes Enviados' : 'Asesorías'}
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={() => setFilterStatus('all')} className={`text-[9px] font-bold p-1 px-2 rounded ${filterStatus === 'all' ? 'bg-white/10 text-white' : 'text-white/20'}`}>TODOS</button>
                        <button onClick={() => setFilterStatus('pending')} className={`text-[9px] font-bold p-1 px-2 rounded ${filterStatus === 'pending' ? 'bg-[#0047FF] text-white' : 'text-white/20'}`}>NUEVOS</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-40 opacity-20">
                            <FaSyncAlt className="animate-spin text-2xl mb-4" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Sincronizando...</span>
                        </div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 opacity-10">
                            <FaInbox className="text-4xl mb-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Sin mensajes</span>
                        </div>
                    ) : (
                        filteredMessages.map(msg => (
                            <div
                                key={msg.uid || `${msg.type}-${msg.id}`}
                                onClick={() => handleSelectMessage(msg)}
                                className={`p-4 border-b border-white/5 cursor-pointer transition-all relative ${selectedMsg?.uid === msg.uid
                                        ? 'bg-[#1a1d24] border-l-4 border-l-[#0047FF]'
                                        : 'hover:bg-white/5 border-l-4 border-l-transparent'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${msg.type === 'direct' ? 'bg-emerald-500/10 text-emerald-400' :
                                            msg.type === 'advisory' ? 'bg-amber-500/10 text-amber-400' :
                                                'bg-blue-500/10 text-blue-400'
                                        }`}>
                                        {msg.source}
                                    </span>
                                    <span className="text-[9px] text-white/30 font-bold">{formatShortDate(msg.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {(msg.status === 'pending' || msg.status === 'confirmed') && <div className="w-2 h-2 bg-[#0047FF] rounded-full shrink-0" />}
                                    <h4 className={`text-sm truncate ${msg.status === 'pending' || msg.status === 'confirmed' ? 'text-white font-black' : 'text-white/50 font-medium'}`}>
                                        {msg.type === 'direct' ? (msg.subject || msg.nombre) : msg.nombre}
                                    </h4>
                                </div>
                                <p className="text-[11px] text-white/30 truncate mt-1">
                                    {msg.type === 'direct' ? msg.nombre : msg.mensaje.substring(0, 100)}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* CONVERSATION PANE */}
            <div className="flex-1 min-w-0 flex flex-col bg-[#0a0c10] overflow-hidden">
                {selectedMsg ? (
                    <div className="flex-1 flex flex-col h-full">
                        {/* HEADER */}
                        <div className="p-6 bg-[#0f1116] border-b border-white/5 flex justify-between items-center gap-4 shrink-0">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center font-black text-white text-lg shadow-xl ${selectedMsg.type === 'direct' ? 'bg-gradient-to-br from-emerald-600 to-teal-400' :
                                        'bg-gradient-to-br from-[#0047FF] to-[#00D1FF]'
                                    }`}>
                                    {selectedMsg.nombre[0]?.toUpperCase() || <FaUserAlt className="text-sm" />}
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-lg font-black text-white tracking-tighter uppercase truncate">{selectedMsg.subject || selectedMsg.nombre}</h2>
                                    <div className="flex flex-wrap items-center gap-3 mt-2">
                                        <p className="text-[10px] font-bold text-white/40">{selectedMsg.nombre} &lt;{selectedMsg.email}&gt;</p>
                                        {!isEditingPhone ? (
                                            <>
                                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.18em] ${
                                                    selectedPhoneDigits
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                        : 'bg-red-500/10 text-red-300 border-red-500/20'
                                                }`}>
                                                    {selectedPhoneDigits ? `WhatsApp ${selectedMsg.telefono}` : "Sin WhatsApp"}
                                                </span>
                                                <button
                                                    onClick={() => setIsEditingPhone(true)}
                                                    className="w-8 h-8 rounded-xl border border-white/10 bg-white/5 text-white/40 hover:text-white hover:border-[#0047FF]/40 transition-all flex items-center justify-center"
                                                    title="Editar WhatsApp"
                                                >
                                                    <FaEdit className="text-xs" />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-2xl px-3 py-2 max-w-full">
                                                <input
                                                    type="text"
                                                    value={phoneDraft}
                                                    onChange={(e) => setPhoneDraft(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            handleSavePhone();
                                                        }
                                                        if (e.key === "Escape") {
                                                            setIsEditingPhone(false);
                                                            setPhoneDraft(selectedMsg.telefono || "");
                                                        }
                                                    }}
                                                    placeholder="+56 9 1234 5678"
                                                    className="bg-transparent text-sm text-white min-w-[220px] max-w-[320px] focus:outline-none"
                                                />
                                                <button
                                                    onClick={handleSavePhone}
                                                    disabled={savingPhone}
                                                    className="px-3 py-1.5 rounded-xl bg-[#0047FF] text-white text-[10px] font-black uppercase tracking-[0.18em] disabled:opacity-50"
                                                >
                                                    {savingPhone ? <FaSyncAlt className="animate-spin" /> : "Guardar"}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsEditingPhone(false);
                                                        setPhoneDraft(selectedMsg.telefono || "");
                                                    }}
                                                    className="w-8 h-8 rounded-xl border border-white/10 bg-white/5 text-white/30 hover:text-white transition-all flex items-center justify-center"
                                                    title="Cancelar edición"
                                                >
                                                    <FaTimes className="text-xs" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                {/* Barra de Acciones Inteligente según la Carpeta/Estado */}
                                {selectedMsg.status === 'spam' && (
                                    <button
                                        onClick={() => updateMessageStatus(selectedMsg.id, selectedMsg.type, getRestoredStatus(selectedMsg), selectedMsg.uid)}
                                        className="h-10 px-5 rounded-full bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <FaCheckCircle className="text-xs" />
                                        No es Spam
                                    </button>
                                )}

                                {selectedMsg.status === 'trash' && (
                                    <button
                                        onClick={() => updateMessageStatus(selectedMsg.id, selectedMsg.type, getRestoredStatus(selectedMsg), selectedMsg.uid)}
                                        className="h-10 px-5 rounded-full bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <FaSyncAlt className="text-xs" />
                                        Restaurar
                                    </button>
                                )}

                                {selectedMsg.status !== 'spam' && selectedMsg.status !== 'trash' && selectedMsg.status !== 'sent' && !selectedMsg.is_admin && (
                                    <button
                                        onClick={() => updateMessageStatus(selectedMsg.id, selectedMsg.type, "spam", selectedMsg.uid)}
                                        className="h-10 px-5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-black transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <FaExclamationTriangle className="text-xs" />
                                        Marcar Spam
                                    </button>
                                )}

                                {selectedMsg.status !== 'trash' && (
                                    <button
                                        onClick={() => deleteMessage(selectedMsg.id, selectedMsg.type, selectedMsg.uid)}
                                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all shrink-0 border border-white/5"
                                        title="Mover a la Papelera"
                                    >
                                        <FaTrash />
                                    </button>
                                )}

                                <div className="w-px h-6 bg-white/5 mx-2" />

                                <button onClick={() => setSelectedMsg(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:text-white transition-all shrink-0 border border-white/5">
                                    <FaTimes />
                                </button>
                            </div>
                        </div>

                        {/* CONTENT AREA */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10 space-y-6 custom-scrollbar bg-[url('/grid.svg')] bg-fixed">
                            <div ref={chatTopRef} />

                            {/* Primer Mensaje Original */}
                            <div className="max-w-4xl mx-auto w-full">
                                {/* Recorta el header y el iframe interno para que respeten el radio del contenedor sin alterar el layout */}
                                <div className="w-full overflow-hidden bg-[#111319] border border-white/5 rounded-[32px] shadow-2xl group hover:border-[#0047FF]/30 transition-all duration-500">
                                    <div className="px-10 py-5 bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-[0.3em] border-b border-white/5 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-[#0047FF] rounded-full animate-pulse" />
                                            Mensaje Original
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span>{formatLocalDate(selectedMsg.created_at)}</span>
                                            {selectedMsg.html_content && (
                                                <a
                                                    href={`mailto:${selectedMsg.email}`}
                                                    target="_blank"
                                                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/35 hover:text-[#7c96ff] hover:bg-white/10 transition-all"
                                                    title="Abrir correo"
                                                >
                                                    <FaExternalLinkAlt className="text-xs" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    {selectedMsg.html_content ? (
                                        <div className="overflow-hidden rounded-b-[32px] bg-white">
                                            <iframe
                                                srcDoc={`<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;min-height:fit-content;overflow-x:hidden;background:#ffffff;}body{font-family:'Inter',sans-serif;color:#1a1a1a;line-height:1.6;word-wrap:break-word;}img{max-width:100%!important;height:auto!important;display:block;}table{max-width:100%!important;}a{color:#0047FF;text-decoration:none;word-break:break-all;}a:hover{text-decoration:underline;} .fj-mail-shell{padding:22px 24px 26px;}</style><base target="_blank"></head><body><div class="fj-mail-shell">${selectedMsg.html_content}</div></body></html>`}
                                                className="block w-full border-none bg-white"
                                                style={{ height: '300px' }}
                                                title="Email Content"
                                                sandbox="allow-popups allow-popups-to-escape-sandbox"
                                                referrerPolicy="no-referrer"
                                                onLoad={(e) => {
                                                    const iframe = e.currentTarget;
                                                    let doc: Document | null = null;

                                                    try {
                                                        doc = iframe.contentDocument || iframe.contentWindow?.document || null;
                                                    } catch {
                                                        // In sandboxed / cross-origin scenarios we keep the default iframe height.
                                                        doc = null;
                                                    }
                                                    
                                                    const resize = () => {
                                                        try {
                                                            if (!doc || !doc.body) return;
                                                            iframe.style.transition = 'none';
                                                            iframe.style.height = '1px';
                                                            const exactHeight = doc.documentElement.scrollHeight || doc.body.scrollHeight;
                                                            iframe.style.height = Math.max(150, exactHeight + 15) + 'px';
                                                        } catch {}
                                                    };
                                                    
                                                    try {
                                                        if (doc && doc.body) {
                                                            if (typeof ResizeObserver !== "undefined") {
                                                                const ob = new ResizeObserver(resize);
                                                                ob.observe(doc.body);
                                                            }
                                                        }
                                                    } catch {}
                                                    
                                                    resize();
                                                    setTimeout(resize, 800);
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="p-10">
                                            <div className="text-white/80 text-base leading-relaxed whitespace-pre-wrap font-medium max-w-2xl">
                                                {selectedMsg.mensaje}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Historial de Respuestas / Otros Mensajes */}
                            {loadingHistory ? (
                                <div className="flex justify-center p-10 opacity-10"><FaSyncAlt className="animate-spin text-4xl" /></div>
                            ) : (
                                history.filter(h => h.id !== selectedMsg.id).map((h, i) => (
                                    <div key={i} className={`flex flex-col ${h.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[85%] p-6 rounded-[28px] ${h.sender === 'admin'
                                                ? 'bg-gradient-to-br from-[#0047FF] to-[#0066FF] text-white shadow-xl rounded-tr-none'
                                                : 'bg-white/5 backdrop-blur-xl border border-white/10 text-white shadow-2xl rounded-tl-none'
                                            }`}>
                                            <div className="flex justify-between items-center mb-3 gap-8">
                                                <span className="text-[8px] font-black uppercase tracking-widest opacity-40">
                                                    {h.sender === 'admin' ? '✓ RESPUESTA DEL ADMINISTRADOR' : '✉ MENSAJE DEL CLIENTE'}
                                                </span>
                                                <span className="text-[8px] font-medium opacity-20 uppercase">
                                                    {formatLocalDate(h.created_at)}
                                                </span>
                                            </div>
                                            <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                                {h.content}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* REPLY FOOTER */}
                        <div className="pt-0 shrink-0 overflow-hidden">
                            <div className="w-full">
                                <div className="bg-[#10141b] border border-white/6 rounded-none p-2 flex flex-col focus-within:border-[#0047FF]/30 transition-all">
                                    <textarea
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        placeholder={`Responder a ${selectedMsg.nombre}...`}
                                        className="w-full bg-transparent px-5 pt-5 pb-4 text-white text-sm focus:outline-none resize-none min-h-[110px] custom-scrollbar"
                                    />
                                    {replyAttachments.length > 0 && (
                                        <div className="px-5 pb-2 flex flex-wrap gap-3">
                                            {replyAttachments.map((file, index) => (
                                                <div key={`${file.name}-${file.lastModified}-${index}`} className="px-4 py-2 bg-[#0047FF]/10 border border-[#0047FF]/20 rounded-2xl text-[10px] font-black text-white/80 flex items-center gap-3">
                                                    <FaFileAlt className="text-[#0047FF]" />
                                                    <span>{file.name}</span>
                                                    <button
                                                        onClick={() => setReplyAttachments((prev) => prev.filter((_, currentIndex) => currentIndex !== index))}
                                                        className="text-white/30 hover:text-white transition-colors"
                                                        title="Quitar adjunto"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center px-4 py-3 border-t border-white/5">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => replyAttachmentInputRef.current?.click()}
                                                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 transition-all"
                                                title="Adjuntar archivos"
                                            >
                                                <FaPaperclip className="text-lg" />
                                            </button>
                                            <input
                                                ref={replyAttachmentInputRef}
                                                type="file"
                                                className="hidden"
                                                multiple
                                                onChange={handleReplyAttachmentChange}
                                            />
                                            <button
                                                onClick={handleOpenWhatsApp}
                                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                                    selectedPhoneDigits
                                                        ? 'text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10'
                                                        : 'text-red-300 bg-red-500/5 hover:bg-red-500/10'
                                                }`}
                                                title={selectedPhoneDigits ? "Abrir WhatsApp" : "Falta número de teléfono"}
                                            >
                                                <FaWhatsapp className="text-xl" />
                                            </button>
                                            <button
                                                onClick={handleConvertToQuote}
                                                className="w-12 h-12 rounded-2xl flex items-center justify-center text-amber-500 bg-amber-500/5 hover:bg-amber-500/10 transition-all"
                                                title="Generar Cotización"
                                            >
                                                <FaQuoteRight className="text-lg" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleReply("email")}
                                            disabled={sendingReply || !replyContent.trim()}
                                            className="px-10 py-4 bg-gradient-to-r from-[#0047FF] to-[#0085FF] hover:brightness-110 disabled:opacity-30 text-white text-xs font-black uppercase tracking-[0.2em] rounded-[20px] flex items-center gap-4 shadow-2xl shadow-blue-500/20 transition-all active:scale-95"
                                        >
                                            {sendingReply ? <FaSyncAlt className="animate-spin" /> : <FaPaperPlane className="text-sm" />}
                                            Enviar Respuesta
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-[url('/grid.svg')] bg-fixed opacity-30">
                        <div className="w-32 h-32 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-10">
                            <FaInbox className="text-4xl text-white/20" />
                        </div>
                        <h2 className="text-2xl font-black text-white/40 uppercase tracking-tighter">Bandeja de Entrada Senior</h2>
                        <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em] mt-2">Sincronización Hostinger Activa</p>
                    </div>
                )}
            </div>

            {/* COMPOSE MODAL */}
            <AnimatePresence>
                {isComposeOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 sm:p-10"
                    >
                        <motion.div
                            initial={{ scale: 0.98, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.98, opacity: 0 }}
                            className="bg-[#050505] border border-white/5 w-full max-w-6xl rounded-[40px] shadow-[0_100px_200px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col md:flex-row h-[90vh]"
                        >
                            {/* Selector Lateral (Picker) */}
                            <AnimatePresence>
                                {isPickerOpen && (
                                    <motion.div
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: 350, opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        className="border-r border-white/5 bg-[#0a0a0a] flex flex-col h-full overflow-hidden"
                                    >
                                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                                            <h3 className="text-[10px] font-black text-[#0047FF] uppercase tracking-[0.4em]">
                                                {isPickerOpen === 'quote' ? 'Historial de Cotizaciones' : 'Catálogo de Servicios'}
                                            </h3>
                                            <button onClick={() => setIsPickerOpen(null)} className="text-white/20 hover:text-white transition-colors"><FaTimes /></button>
                                        </div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                                            {isPickerOpen === 'quote' ? (
                                                proposals.map(p => (
                                                    <button
                                                        key={`prop-${p.id}`}
                                                        onClick={() => insertProposal(p)}
                                                        className="w-full p-6 text-left bg-[#111] border border-white/5 rounded-2xl hover:bg-[#111] hover:border-[#0047FF]/40 transition-all group"
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="text-[9px] font-black text-white group-hover:text-[#0047FF] transition-colors">{p.quote_number}</span>
                                                            <span className={`text-[8px] px-2 py-1 rounded-full font-black uppercase tracking-tighter ${p.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{p.status}</span>
                                                        </div>
                                                        <div className="text-white/60 text-xs font-bold leading-tight mb-2 uppercase tracking-wide">{p.client_name}</div>
                                                        <div className="text-[10px] text-[#0047FF] font-black">{p.final_total.toLocaleString()} {p.currency}</div>
                                                    </button>
                                                ))
                                            ) : (
                                                services.map(s => (
                                                    <button
                                                        key={`serv-${s.category}-${s.id}`}
                                                        onClick={() => insertService(s)}
                                                        className="w-full p-6 text-left bg-[#111] border border-white/5 rounded-2xl hover:bg-[#111] hover:border-[#0047FF]/40 transition-all group"
                                                    >
                                                        <div className="text-[9px] font-black text-[#0047FF] uppercase tracking-[0.2em] mb-2">{s.category || 'Servicio Profesional'}</div>
                                                        <div className="text-white font-black text-sm mb-2 group-hover:translate-x-1 transition-transform">{s.name}</div>
                                                        <div className="text-white/40 text-[10px] line-clamp-2 mb-4 italic">{s.description}</div>
                                                        <div className="text-[11px] font-black text-white">{s.price}</div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Área Principal de Redacción */}
                            <div className="flex-1 flex flex-col h-full bg-[#050505]">
                                {/* Header Minimalista */}
                                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-[#0047FF] flex items-center justify-center text-white text-xl shadow-[0_10px_30px_rgba(0,71,255,0.4)]">
                                            <FaPaperPlane />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-white uppercase tracking-tighter leading-none">Senior Communication Center</h2>
                                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] mt-2">Enterprise Sales Operations Foundry</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsComposeOpen(false);
                                            setComposeAttachments([]);
                                        }}
                                        className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>

                                {/* Inputs */}
                                <div className="p-10 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] ml-2">Destinatario Ejecutivo</label>
                                            <input
                                                type="email"
                                                value={composeData.to}
                                                onChange={(e) => setComposeData(prev => ({ ...prev, to: e.target.value }))}
                                                placeholder="socio@enterprise.com"
                                                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-white text-sm focus:bg-white/[0.04] focus:border-[#0047FF]/40 outline-none transition-all shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] ml-2">Asunto de Negocio</label>
                                            <input
                                                type="text"
                                                value={composeData.subject}
                                                onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                                                placeholder="Propuesta Técnica / Acuerdos Operativos"
                                                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-white text-sm focus:bg-white/[0.04] focus:border-[#0047FF]/40 outline-none transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    {/* Toolbar Flotante */}
                                    <div className="flex flex-wrap items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-3xl">
                                        <button
                                            onClick={() => setIsPickerOpen('quote')}
                                            className="h-12 px-8 rounded-2xl bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all flex items-center gap-3 border border-amber-500/10"
                                        >
                                            <FaQuoteRight /> Inyectar Cotización
                                        </button>
                                        <button
                                            onClick={() => setIsPickerOpen('service')}
                                            className="h-12 px-8 rounded-2xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center gap-3 border border-emerald-500/10"
                                        >
                                            <FaCalendarCheck /> Catálogo de Servicios
                                        </button>
                                        <div className="h-6 w-px bg-white/10 mx-2" />
                                        <button
                                            onClick={() => insertTemplate('welcome')}
                                            className="h-12 px-6 rounded-2xl bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all flex items-center gap-3 border border-white/5"
                                        >
                                            <FaHandshake /> Bienvenida
                                        </button>
                                        <button
                                            onClick={() => composeAttachmentInputRef.current?.click()}
                                            className="h-12 w-12 rounded-2xl bg-white/5 text-white/40 hover:text-white transition-all flex items-center justify-center border border-white/5"
                                        >
                                            <FaPaperclip />
                                        </button>
                                        <input
                                            ref={composeAttachmentInputRef}
                                            type="file"
                                            className="hidden"
                                            multiple
                                            onChange={handleComposeAttachmentChange}
                                        />
                                    </div>

                                    <div className="relative group">
                                        <textarea
                                            value={composeData.content}
                                            onChange={(e) => setComposeData(prev => ({ ...prev, content: e.target.value }))}
                                            placeholder="Redacte aquí la comunicación profesional estratégica..."
                                            className="w-full bg-[#080808] border border-white/5 rounded-[40px] p-10 text-white text-base focus:border-[#0047FF]/40 outline-none transition-all min-h-[400px] shadow-2xl custom-scrollbar resize-none font-medium leading-relaxed"
                                        />
                                        <div className="absolute top-8 right-8 flex items-center gap-3 text-white/10 group-focus-within:text-[#0047FF]/40 transition-colors">
                                            <FaRobot className="text-2xl" />
                                            <span className="text-[8px] font-black uppercase tracking-[0.3em]">IA Engine Active</span>
                                        </div>
                                    </div>

                                    {composeAttachments.length > 0 && (
                                        <div className="flex flex-wrap gap-3 px-4">
                                            {composeAttachments.map((file, index) => (
                                                <div key={`${file.name}-${file.lastModified}-${index}`} className="px-5 py-3 bg-[#0047FF]/10 border border-[#0047FF]/20 rounded-2xl text-[10px] font-black text-white/80 flex items-center gap-3 animate-slide-up">
                                                    <FaFileAlt className="text-[#0047FF]" />
                                                    <span>{file.name}</span>
                                                    <button
                                                        onClick={() => setComposeAttachments((prev) => prev.filter((_, currentIndex) => currentIndex !== index))}
                                                        className="text-white/30 hover:text-white transition-colors"
                                                        title="Quitar adjunto"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Footer de Acción */}
                                <div className="p-10 border-t border-white/5 bg-white/[0.01] flex flex-col sm:flex-row justify-between items-center gap-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40">
                                            <FaCheckCircle />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest block">Canal Seguro</span>
                                            <span className="text-[8px] font-medium text-white/20 uppercase tracking-tighter">Encriptación de Punta a Punta Activa</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8 w-full sm:w-auto">
                                        <button
                                            onClick={() => {
                                                setIsComposeOpen(false);
                                                setComposeAttachments([]);
                                            }}
                                            className="flex-1 sm:flex-none text-white/40 font-black uppercase text-[10px] tracking-[0.3em] hover:text-white transition-all px-6"
                                        >
                                            Descartar
                                        </button>
                                        <button
                                            onClick={handleSendNewEmail}
                                            disabled={sendingReply || !composeData.to || !composeData.subject || !composeData.content}
                                            className="flex-1 sm:flex-none px-16 py-6 bg-gradient-to-r from-[#0047FF] to-[#0066FF] hover:brightness-110 disabled:opacity-20 text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-[24px] flex items-center justify-center gap-5 shadow-[0_25px_50px_rgba(0,71,255,0.4)] transition-all active:scale-95 border border-white/10"
                                        >
                                            {sendingReply ? <FaSyncAlt className="animate-spin" /> : <FaPaperPlane />}
                                            Emitir Comunicación
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-10 right-10 z-[200] flex items-center gap-4 bg-[#0a0c10]/80 backdrop-blur-2xl border border-white/10 p-5 px-8 rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)]"
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {notification.type === 'success' ? <FaCheckCircle className="text-xl" /> : <FaTimes className="text-xl" />}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Sistema FJ Notifica</p>
                            <p className="text-sm font-bold text-white tracking-tight">{notification.message}</p>
                        </div>
                        <button onClick={() => setNotification(null)} className="ml-6 text-white/10 hover:text-white transition-colors">
                            <FaTimes />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.1); }
            `}</style>
        </div>
    );
}

function NavItem({ icon, label, active, onClick, count, collapsed = false }: { icon: ReactNode, label: string, active: boolean, onClick: () => void, count?: number, collapsed?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center ${collapsed ? 'justify-center px-3 py-4' : 'justify-between px-8 py-5'} transition-all group relative duration-300 ${active ? 'text-[#0047FF]' : 'text-white/30 hover:bg-white/5 hover:text-white'
                }`}
            title={label}
        >
            {active && (
                <motion.div
                    layoutId="activeNav"
                    className="absolute inset-y-0 left-0 w-1.5 bg-[#0047FF] rounded-r-full shadow-[0_0_20px_rgba(0,71,255,0.5)]"
                />
            )}
            <div className={`flex items-center ${collapsed ? '' : 'gap-5'}`}>
                <span className={`text-[22px] transition-all duration-300 ${active ? 'scale-110' : 'opacity-40 group-hover:opacity-100 group-hover:scale-110'}`}>{icon}</span>
                {!collapsed && <span className={`hidden lg:block text-[10px] font-black uppercase tracking-[0.2em] ${active ? 'text-white' : 'opacity-100'}`}>{label}</span>}
            </div>
            {count ? (
                <span className={`${collapsed ? 'absolute top-2 right-2 flex min-w-[18px] h-[18px] px-1.5' : 'hidden lg:flex px-2 py-0.5'} bg-[#0047FF] text-white text-[9px] font-black rounded-full items-center justify-center shadow-[0_5px_15px_rgba(0,71,255,0.3)] animate-pulse`}>
                    {count}
                </span>
            ) : null}
            {!collapsed && <FaChevronRight className={`lg:hidden text-[10px] ${active ? 'opacity-100' : 'opacity-0'}`} />}
        </button>
    );
}
