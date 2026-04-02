"use client";

import {
    FaHome, FaProjectDiagram, FaBlog, FaUsers, FaUserTie,
    FaClock, FaCogs, FaSignOutAlt, FaServicestack, FaCommentAlt,
    FaEnvelopeOpenText, FaUserPlus, FaAd, FaCalculator
} from "react-icons/fa";
import Link from "next/link";

interface AdminSidebarProps {
    activeSection: string;
    setActiveSection: (section: string, recordId?: string | number) => void;
    isCollapsed: boolean;
}

export default function AdminSidebar({ activeSection, setActiveSection, isCollapsed }: AdminSidebarProps) {

    const menuGroups = [
        {
            title: "Principal",
            items: [
                { id: "dashboard", label: "Dashboard", icon: <FaHome />, color: "cyan" }
            ]
        },
        {
            title: "Contenido",
            items: [
                { id: "projects", label: "Proyectos", icon: <FaProjectDiagram />, color: "blue" },
                { id: "services", label: "Servicios", icon: <FaServicestack />, color: "indigo" },
                { id: "advisories", label: "Asesorias", icon: <FaClock />, color: "sky" },
                { id: "blog", label: "Blog", icon: <FaBlog />, color: "violet" },
                { id: "testimonials", label: "Testimonios", icon: <FaCommentAlt />, color: "fuchsia" },
                { id: "ads", label: "Publicidad", icon: <FaAd />, color: "pink" }
            ]
        },
        {
            title: "Gestión",
            items: [
                { id: "clients", label: "Clientes", icon: <FaUsers />, color: "emerald" },
                { id: "quotes", label: "Cotizaciones", icon: <FaCalculator />, color: "orange" },
                { id: "messages", label: "Mensajes", icon: <FaEnvelopeOpenText />, color: "rose" },
                { id: "subscribers", label: "Suscriptores", icon: <FaUserPlus />, color: "teal" }
            ]
        },
        {
            title: "Personal",
            items: [
                { id: "about", label: "Sobre mi", icon: <FaUserTie />, color: "amber" },
            ]
        },
        {
            title: "Sistema",
            items: [
                { id: "contact", label: "Info. Contacto", icon: <FaCommentAlt />, color: "amber" },
                { id: "settings", label: "Configuración", icon: <FaCogs />, color: "slate" }
            ]
        }
    ];

    return (
        <div className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            {/* HEADER */}
            <div className="sidebar-header">
                <Link href="/" className="hover:opacity-80 transition-opacity">
                    <h1>PORTFOLIO<span className="text-red-600">ADMIN</span></h1>
                </Link>
            </div>

            {/* MENU */}
            <div className="sidebar-content custom-scrollbar">
                {menuGroups.map((group, idx) => (
                    <div key={idx} className="menu-group">
                        {idx > 0 && <div className="menu-divider" />}
                        {group.items.map(item => (
                            <div
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={`menu-item ${item.color} ${activeSection === item.id ? 'active' : ''}`}
                            >
                                <span className="icon">{item.icon}</span>
                                <span className="label">{item.label}</span>
                                {activeSection === item.id && <div className="glow-pill" />}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* FOOTER */}
            <div className="sidebar-footer">
                <div className="user-card">
                    <div className="avatar">FR</div>
                    <div className="info">
                        <h4>Favio Richar</h4>
                        <p>Super Admin</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        window.location.href = "/";
                    }}
                    className="w-full mt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-white bg-slate-800 hover:bg-red-700 py-3 transition-colors uppercase tracking-widest rounded-none border-t border-white/5"
                >
                    <FaHome /> Ver Sitio Web
                </button>
                <button
                    onClick={() => {
                        localStorage.removeItem("token");
                        window.location.href = "/auth/login";
                    }}
                    className="w-full flex items-center justify-center gap-2 text-[10px] font-bold text-red-500 hover:text-white hover:bg-red-600/20 py-3 transition-colors uppercase tracking-[0.2em]"
                >
                    <FaSignOutAlt /> CERRAR SESIÓN
                </button>
            </div>
        </div>
    );
}
