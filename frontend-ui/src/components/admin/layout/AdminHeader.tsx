"use client";

import { FaSearch, FaBell, FaEnvelope, FaBars, FaHome } from "react-icons/fa";

interface AdminHeaderProps {
    toggleSidebar: () => void;
    activeSection: string;
}

export default function AdminHeader({ toggleSidebar, activeSection }: AdminHeaderProps) {
    return (
        <div className="admin-header">
            {/* LEFT: TITLE & TOGGLE */}
            <div className="flex items-center gap-6">
                <button onClick={toggleSidebar} className="text-xl">
                    <FaBars />
                </button>
                <div className="header-title hidden md:block">
                    <h2 className="uppercase tracking-widest text-sm font-black text-indigo-400">Dashboard Panel</h2>
                    <p className="text-white font-bold text-lg capitalize">{activeSection.replace('-', ' ')}</p>
                </div>
            </div>

            {/* CENTER: SEARCH (Optional) */}
            <div className="hidden lg:flex items-center bg-slate-800/50 rounded-full px-4 py-2 border border-white/5 w-96">
                <FaSearch className="text-slate-500 mr-3" />
                <input
                    type="text"
                    placeholder="Buscar proyecto, cliente o archivo..."
                    className="bg-transparent border-none text-sm text-white placeholder-slate-500 focus:outline-none w-full"
                />
            </div>

            {/* RIGHT: ACTIONS */}
            <div className="header-actions">
                <a
                    href="/"
                    className="flex items-center gap-2 bg-slate-800 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border border-white/5 active:scale-95 mr-4"
                >
                    <FaHome className="text-sm" /> Ver Sitio Web
                </a>

                <button className="relative">
                    <FaEnvelope />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>
                </button>
                <button className="relative">
                    <FaBell />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border border-slate-900"></span>
                </button>
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10 cursor-pointer group">
                    <div className="text-right hidden md:block">
                        <div className="text-xs font-bold text-white group-hover:text-red-500 transition-colors">Favio Richar</div>
                        <div className="text-[10px] text-slate-400">Super Admin</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-900 border-2 border-white/10 shadow-[0_0_15px_rgba(220,38,38,0.3)]"></div>
                </div>
            </div>
        </div>
    );
}
