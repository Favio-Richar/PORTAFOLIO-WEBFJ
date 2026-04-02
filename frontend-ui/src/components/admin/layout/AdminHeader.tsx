"use client";

import { useState, useEffect, useRef } from "react";
import { FaBell, FaEnvelope, FaBars, FaHome, FaCheckDouble, FaTrash, FaCalendarAlt, FaImages, FaFolderOpen } from "react-icons/fa";
import Link from "next/link";
import { adminFetch } from "@/lib/adminFetch";

interface AdminHeaderProps {
    toggleSidebar: () => void;
    activeSection: string;
    setActiveSection: (section: string, recordId?: string | number) => void;
}

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    link?: string;
    is_read: boolean;
    created_at: string;
}

export default function AdminHeader({ toggleSidebar, activeSection, setActiveSection }: AdminHeaderProps) {
    const [unreadNotifCount, setUnreadNotifCount] = useState(0);
    const [unreadMsgCount, setUnreadMsgCount] = useState(0);
    const [showNotifMenu, setShowNotifMenu] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [now, setNow] = useState<Date | null>(null);
    
    const notifRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const prevNotifCount = useRef(0);
    const prevMsgCount = useRef(0);

    // Enterprise Sound System (Senior Industrial)
    useEffect(() => {
        // Sonido discreto corporativo
        audioRef.current = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
        audioRef.current.volume = 0.4;
        
        // Inicializar reloj
        setNow(new Date());
        const clockInterval = setInterval(() => {
            setNow(new Date());
        }, 1000);
        return () => clearInterval(clockInterval);
    }, []);

    useEffect(() => {
        // Disparar sonido si HAY NUEVAS NOTIFICACIONES
        if (unreadNotifCount > prevNotifCount.current) {
            audioRef.current?.play().catch(() => {});
        }
        prevNotifCount.current = unreadNotifCount;
    }, [unreadNotifCount]);

    useEffect(() => {
        // Disparar sonido si HAY NUEVOS CORREOS O MENSAJES DEL CLIENTE
        if (unreadMsgCount > prevMsgCount.current) {
            audioRef.current?.play().catch(() => {});
            // Avisar a la bandeja de mensajes que recargue para mostrar el nuevo correo al instante
            if (typeof window !== "undefined") {
                window.dispatchEvent(new Event('new_message_arrived'));
            }
        }
        prevMsgCount.current = unreadMsgCount;
    }, [unreadMsgCount]);

    const loadCounts = async () => {
        try {
            const [notifRes, msgRes] = await Promise.all([
                adminFetch("/api/notifications/unread-count"),
                adminFetch("/api/messages/unread-count")
            ]);
            
            if (notifRes.ok) setUnreadNotifCount((await notifRes.json()).unread_count);
            if (msgRes.ok) setUnreadMsgCount((await msgRes.json()).unread_count);
        } catch (error) {
            console.error(error);
        }
    };

    const loadNotifications = async () => {
        try {
            const res = await adminFetch("/api/notifications");
            if (res.ok) setNotifications(await res.json());
        } catch (error) {
            console.error(error);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            const res = await adminFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
            if (res.ok) {
                setNotifications(prev => prev.map(n => n.id === id ? {...n, is_read: true} : n));
                setUnreadNotifCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const deleteNotification = async (id: number) => {
        try {
            const res = await adminFetch(`/api/notifications/${id}`, { method: "DELETE" });
            if (res.ok) {
                setNotifications(prev => prev.filter(n => n.id !== id));
                // Only decrement if it was unread
                const notif = notifications.find(n => n.id === id);
                if (notif && !notif.is_read) {
                    setUnreadNotifCount(prev => Math.max(0, prev - 1));
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const markAllRead = async () => {
        try {
            const res = await adminFetch("/api/notifications/read-all", { method: "PATCH" });
            if (res.ok) {
                setUnreadNotifCount(0);
                setNotifications(prev => prev.map(n => ({...n, is_read: true})));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const clearAllNotifications = async () => {
        if (!confirm("¿Deseas eliminar todas las notificaciones permanentemente?")) return;
        try {
            const res = await adminFetch("/api/notifications/clear-all", { method: "DELETE" });
            if (res.ok) {
                setNotifications([]);
                setUnreadNotifCount(0);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const initialLoadTimeout = window.setTimeout(() => {
            void loadCounts();
        }, 0);
        
        const handleMessagesUpdated = () => {
            void loadCounts();
        };
        window.addEventListener('messages_updated', handleMessagesUpdated);
        
        const interval = window.setInterval(() => {
            void loadCounts();
        }, 30000); // Poll every 30s
        return () => {
            window.clearTimeout(initialLoadTimeout);
            clearInterval(interval);
            window.removeEventListener('messages_updated', handleMessagesUpdated);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleNotifications = () => {
        if (!showNotifMenu) {
            loadNotifications();
        }
        setShowNotifMenu(!showNotifMenu);
    };

    const sectionLabelMap: Record<string, string> = {
        dashboard: "Dashboard",
        about: "Sobre mi",
        profile: "Sobre mi",
        projects: "Proyectos",
        services: "Servicios",
        advisories: "Asesorías",
        blog: "Blog",
        testimonials: "Testimonios",
        ads: "Publicidad",
        clients: "Clientes",
        quotes: "Cotizaciones",
        messages: "Mensajes (Inbox)",
        subscribers: "Suscriptores",
        contact: "Info. Contacto",
        settings: "Configuración",
        calendar: "Calendario",
        library: "Biblioteca",
        documents: "Documentos"
    };

    const sectionLabel = sectionLabelMap[activeSection] || activeSection.replace("-", " ");

    return (
        <div className="admin-header flex flex-wrap items-center justify-between gap-y-3" style={{ padding: "12px 20px" }}>
            {/* LEFT: TITLE & TOGGLE */}
            <div className="flex items-center gap-4 order-1">
                <button onClick={toggleSidebar} className="text-xl">
                    <FaBars />
                </button>
                <div className="header-title hidden md:block">
                    <h2 className="uppercase tracking-widest text-sm font-black text-indigo-400">Dashboard Panel</h2>
                    <p className="text-white font-bold text-lg capitalize">{sectionLabel}</p>
                </div>
            </div>

            {/* CENTER: 3 QUICK-ACCESS BUTTONS & LIVE CLOCK */}
            <div className="flex items-center gap-2 order-3 w-full lg:order-2 lg:w-auto justify-start md:justify-center overflow-x-auto pb-2 lg:pb-0 scroll-smooth" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
                <button
                    className="flex-shrink-0"
                    onClick={() => setActiveSection("calendar")}
                    title="Calendario"
                    style={{
                        display: "flex", alignItems: "center", gap: 7,
                        background: activeSection === "calendar" ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${activeSection === "calendar" ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`,
                        borderRadius: 8, color: activeSection === "calendar" ? "#818cf8" : "#64748b",
                        padding: "7px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700,
                        letterSpacing: "0.05em", transition: "all 0.15s"
                    }}
                >
                    <FaCalendarAlt size={13} /> Calendario
                </button>
                <button
                    className="flex-shrink-0"
                    onClick={() => setActiveSection("library")}
                    title="Biblioteca"
                    style={{
                        display: "flex", alignItems: "center", gap: 7,
                        background: activeSection === "library" ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${activeSection === "library" ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.08)"}`,
                        borderRadius: 8, color: activeSection === "library" ? "#4ade80" : "#64748b",
                        padding: "7px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700,
                        letterSpacing: "0.05em", transition: "all 0.15s"
                    }}
                >
                    <FaImages size={13} /> Biblioteca
                </button>
                <button
                    className="flex-shrink-0"
                    onClick={() => setActiveSection("documents")}
                    title="Documentos"
                    style={{
                        display: "flex", alignItems: "center", gap: 7,
                        background: activeSection === "documents" ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${activeSection === "documents" ? "rgba(245,158,11,0.5)" : "rgba(255,255,255,0.08)"}`,
                        borderRadius: 8, color: activeSection === "documents" ? "#fbbf24" : "#64748b",
                        padding: "7px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700,
                        letterSpacing: "0.05em", transition: "all 0.15s"
                    }}
                >
                    <FaFolderOpen size={13} /> Documentos
                </button>
                
                {/* Panel Reloj / Fecha en vivo Corporativo */}
                {now && (
                    <div className="flex-shrink-0" style={{
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        background: "#020617", border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 8, padding: "2px 14px",
                        boxShadow: "inset 0 0 10px rgba(0,0,0,0.8), 0 0 8px rgba(99,102,241,0.1)"
                    }}>
                        <span style={{ fontSize: 13, fontWeight: "bold", color: "#38bdf8", letterSpacing: "0.1em", fontFamily: "monospace" }}>
                            {now.getHours().toString().padStart(2, '0')}:
                            {now.getMinutes().toString().padStart(2, '0')}:
                            {now.getSeconds().toString().padStart(2, '0')}
                        </span>
                        <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: "bold", letterSpacing: "0.1em" }}>
                            {now.getFullYear()}-{(now.getMonth() + 1).toString().padStart(2, '0')}-{now.getDate().toString().padStart(2, '0')}
                        </span>
                    </div>
                )}
            </div>

            {/* RIGHT: ACTIONS */}
            <div className="header-actions flex items-center gap-4 order-2 lg:order-3">
                <Link
                    href="/"
                    className="hidden md:flex items-center gap-2 bg-slate-800 hover:bg-red-600 text-white px-4 py-2 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all border border-white/5 active:scale-95"
                >
                    <FaHome className="text-sm" /> Ver Sitio Web
                </Link>

                {/* MESSAGES BUTTON */}
                <button 
                    className="relative p-2 hover:scale-110 transition-transform duration-200"
                    onClick={() => setActiveSection("messages")}
                >
                    <FaEnvelope size={24} style={{ color: '#3b82f6' }} />
                    {unreadMsgCount > 0 && (
                        <span 
                            className="absolute top-1 right-1 w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-black text-white shadow-[0_0_10px_rgba(255,0,0,0.8)]"
                            style={{ backgroundColor: '#ff0000 !important' }}
                        >
                            {unreadMsgCount}
                        </span>
                    )}
                </button>

                {/* NOTIFICATIONS DROPDOWN */}
                <div className="relative" ref={notifRef}>
                    <button 
                        className="relative p-2 hover:scale-110 transition-transform duration-200"
                        onClick={toggleNotifications}
                    >
                        <FaBell size={24} style={{ color: '#fbbf24' }} />
                        {unreadNotifCount > 0 && (
                            <span 
                                className="absolute top-1 right-1 w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-black text-white shadow-[0_0_10px_rgba(255,0,0,0.8)] animate-pulse"
                                style={{ backgroundColor: '#ff0000 !important' }}
                            >
                                {unreadNotifCount}
                            </span>
                        )}
                    </button>

                    {showNotifMenu && (
                        <div className="absolute top-full right-0 mt-3 w-[85vw] md:w-[450px] max-w-lg bg-slate-900/98 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50 rounded-none overflow-hidden flex flex-col max-h-[550px] animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.12em]">Centro de Alertas</h4>
                                {unreadNotifCount > 0 && (
                                    <button 
                                        onClick={markAllRead} 
                                        title="Marcar todas como leídas"
                                        className="p-2 text-emerald-400 hover:text-emerald-300 transition-all border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 active:scale-95"
                                    >
                                        <FaCheckDouble size={16} style={{ filter: 'drop-shadow(0 0 5px rgba(16,185,129,0.4))' }} />
                                    </button>
                                )}
                            </div>
                            
                            <div className="flex-1 overflow-y-auto scrollbar-none style-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="p-10 text-center">
                                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Sin alertas nuevas</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/10">
                                        {notifications.map(n => {
                                            const typeColors: Record<string, string> = {
                                                success: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
                                                info: "text-blue-400 border-blue-500/30 bg-blue-500/10",
                                                error: "text-rose-400 border-rose-500/30 bg-rose-500/10",
                                            };
                                            const typeTag = typeColors[n.type] || typeColors.info;

                                            return (
                                                <div 
                                                    key={n.id} 
                                                    className={`p-6 hover:bg-white/[0.03] transition-all cursor-pointer relative group ${n.is_read ? 'opacity-50' : ''}`}
                                                    onClick={() => {
                                                        if (!n.is_read) markAsRead(n.id);
                                                        
                                                        let targetSection = "dashboard";
                                                        let recordId: string | number | undefined = undefined;

                                                        if (n.link) {
                                                            const path = n.link.toLowerCase();

                                                            // ── MENSAJES / INBOX (CORREO IMAP) ──────────────────
                                                            // MUST come before 'leads' check because messages != leads
                                                            if (path.includes("messages") || path.includes("inbox")) {
                                                                targetSection = "messages";

                                                            // ── COTIZACIONES / PROPUESTAS / QUOTES ──────────────
                                                            // /admin/quotes/123  /admin/proposals/123  /admin/cotizaciones
                                                            } else if (
                                                                path.includes("quotes") ||
                                                                path.includes("proposals") ||
                                                                path.includes("cotizacion")
                                                            ) {
                                                                targetSection = "quotes";
                                                                // Sub-pestaña leads: /admin/quotes/leads
                                                                if (path.endsWith("/leads") || path === "/admin/quotes/leads") {
                                                                    recordId = "leads";
                                                                } else {
                                                                    // Extraer ID numérico: /admin/quotes/42
                                                                    const match = path.match(/\/(?:quotes|proposals|cotizacion(?:es)?)\/(\d+)/);
                                                                    if (match) recordId = match[1];
                                                                }

                                                            // ── LEADS (solicitud de servicio del formulario web) ─
                                                            } else if (path.includes("/leads")) {
                                                                targetSection = "quotes";
                                                                recordId = "leads";

                                                            // ── ASESORÍAS / RESERVAS ────────────────────────────
                                                            } else if (path.includes("advisories") || path.includes("bookings") || path.includes("asesoria")) {
                                                                targetSection = "advisories";

                                                            // ── SUSCRIPTORES ────────────────────────────────────
                                                            } else if (path.includes("subscribers")) {
                                                                targetSection = "subscribers";

                                                            // ── PROYECTOS ───────────────────────────────────────
                                                            } else if (path.includes("projects") || path.includes("proyectos")) {
                                                                targetSection = "projects";

                                                            // ── BLOG ────────────────────────────────────────────
                                                            } else if (path.includes("blog")) {
                                                                targetSection = "blog";

                                                            // ── SERVICIOS ───────────────────────────────────────
                                                            } else if (path.includes("services") || path.includes("servicios")) {
                                                                targetSection = "services";

                                                            // ── FALLBACK: extraer última parte de la URL ─────────
                                                            } else {
                                                                const parts = n.link.split('/').filter(Boolean);
                                                                const last = parts[parts.length - 1] || "dashboard";
                                                                // Si la última parte es un número puro, usar la penúltima como sección
                                                                if (/^\d+$/.test(last) && parts.length >= 2) {
                                                                    targetSection = parts[parts.length - 2] || "dashboard";
                                                                    recordId = last;
                                                                } else {
                                                                    targetSection = last;
                                                                }
                                                            }
                                                        }

                                                        setActiveSection(targetSection, recordId);
                                                        setShowNotifMenu(false);
                                                    }}
                                                >
                                                    <div className="flex justify-between items-center mb-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border rounded-sm ${typeTag}`}>
                                                                {n.type || 'Sistema'}
                                                            </span>
                                                            <span className="text-[10px] text-slate-500 font-bold">
                                                                {new Date(n.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        
                                                        <button 
                                                            onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteNotification(n.id);
                                                            }}
                                                            className="p-2 hover:bg-red-500/10 rounded-full transition-all group/trash"
                                                        >
                                                            <FaTrash size={18} style={{ color: '#ff0000', filter: 'drop-shadow(0 0 5px rgba(255,0,0,0.5))' }} />
                                                        </button>
                                                    </div>
                                                    
                                                    <div className="flex flex-col gap-1.5 ml-1 pr-10">
                                                        <h5 className={`text-[14px] font-bold tracking-tight leading-tight ${n.is_read ? 'text-slate-500' : 'text-white'}`}>
                                                            {n.title}
                                                        </h5>
                                                        <p className={`text-[13px] leading-relaxed font-medium ${n.is_read ? 'text-slate-500' : 'text-slate-100'}`}>
                                                            {n.message}
                                                        </p>
                                                    </div>

                                                    {!n.is_read && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-blue-500 shadow-[2px_0_15px_rgba(59,130,246,0.8)]" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {notifications.length > 0 && (
                                <div className="p-8 bg-slate-900 border-t border-white/10 flex justify-center items-center">
                                    <button 
                                        onClick={clearAllNotifications}
                                        title="Limpiar todo el historial"
                                        className="w-20 h-20 flex items-center justify-center bg-red-600 border-2 border-red-500 rounded-3xl hover:bg-red-500 transition-all group/master shadow-[0_0_40px_rgba(255,0,0,0.4)] active:scale-90"
                                        style={{ backgroundColor: '#ff0000', borderColor: '#ff4444' }}
                                    >
                                        <FaTrash 
                                            size={32} 
                                            style={{ color: '#ffffff !important', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.8))' }} 
                                            className="group-hover/master:scale-110 transition-transform"
                                        />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/10 cursor-pointer group">
                    <div className="text-right hidden md:block">
                        <div className="text-xs font-bold text-white group-hover:text-red-500 transition-colors">Favio Richar</div>
                        <div className="text-[10px] text-slate-400">Super Admin</div>
                    </div>
                    <div className="w-10 h-10 rounded-none bg-gradient-to-br from-red-600 to-red-900 border-2 border-white/10 shadow-[0_0_15px_rgba(220,38,38,0.3)]"></div>
                </div>
            </div>
        </div>
    );
}
