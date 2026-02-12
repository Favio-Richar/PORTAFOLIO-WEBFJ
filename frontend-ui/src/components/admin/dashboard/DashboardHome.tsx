"use client";

import { FaProjectDiagram, FaEye, FaEnvelope, FaChartLine, FaArrowUp, FaArrowDown, FaCalendarAlt, FaDownload } from "react-icons/fa";
import { VisitorChart, ProjectDistributionChart, RevenueChart } from "./DashboardCharts"; // Import Charts

export default function DashboardHome() {
    return (
        <div className="admin-content fade-in-up">
            {/* HERDER & ACTIONS */}
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                        PANEL DE <span className="text-indigo-400">CONTROL</span>
                    </h2>
                    <p className="text-slate-400 font-medium">Bienvenido al sistema central, Favio.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-slate-800 text-slate-300 px-4 py-2 rounded-none text-xs font-bold hover:bg-slate-700 transition-all border border-white/5">
                        <FaCalendarAlt /> Últimos 30 días
                    </button>
                    <button className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-none text-xs font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20">
                        <FaDownload /> Exportar Data
                    </button>
                </div>
            </div>

            {/* FUTHURISTIC GRID LAYOUT */}
            <div className="dashboard-grid">

                {/* 1. KEY METRICS ROW */}
                <div className="grid-row-metrics">
                    <div className="stat-card cyan">
                        <div className="icon-box"><FaProjectDiagram /></div>
                        <div className="stat-info">
                            <h4>Proyectos Activos</h4>
                            <div className="value">12</div>
                            <div className="trend up"><FaArrowUp /> +2 este mes</div>
                        </div>
                        <div className="stat-chart-bg"></div> {/* Decorative BG */}
                    </div>

                    <div className="stat-card violet">
                        <div className="icon-box"><FaEye /></div>
                        <div className="stat-info">
                            <h4>Visitas Totales</h4>
                            <div className="value">8.4k</div>
                            <div className="trend up"><FaArrowUp /> +12% tráfico</div>
                        </div>
                    </div>

                    <div className="stat-card rose">
                        <div className="icon-box"><FaEnvelope /></div>
                        <div className="stat-info">
                            <h4>Mensajes Nuevos</h4>
                            <div className="value">45</div>
                            <div className="trend neutral">3 sin leer</div>
                        </div>
                    </div>

                    <div className="stat-card amber">
                        <div className="icon-box"><FaChartLine /></div>
                        <div className="stat-info">
                            <h4>Tasa Conversión</h4>
                            <div className="value">4.2%</div>
                            <div className="trend down"><FaArrowDown /> -0.5% baja</div>
                        </div>
                    </div>
                </div>

                {/* 2. MAIN CHARTS ROW */}
                <div className="grid-row-charts">
                    {/* VISITOR ANALYTICS (Large) */}
                    <div className="dashboard-card main-chart">
                        <div className="card-header">
                            <div>
                                <h3>Analítica de Tráfico</h3>
                                <p className="text-xs text-slate-400">Visitas vs Usuarios Únicos</p>
                            </div>
                            <div className="options">
                                <span className="active">Semana</span>
                                <span>Mes</span>
                            </div>
                        </div>
                        <div className="card-body chart-container" style={{ height: '320px' }}>
                            <VisitorChart />
                        </div>
                    </div>

                    {/* PROJECT DISTRIBUTION (Side) */}
                    <div className="dashboard-card side-chart">
                        <div className="card-header">
                            <h3>Distribución</h3>
                        </div>
                        <div className="card-body chart-container flex items-center justify-center" style={{ height: '320px' }}>
                            <ProjectDistributionChart />
                        </div>
                    </div>
                </div>

                {/* 3. TABLES & REVENUE ROW */}
                <div className="grid-row-bottom">

                    {/* RECENT MESSAGES TABLE */}
                    <div className="dashboard-card table-card">
                        <div className="card-header">
                            <h3>Mensajes Recientes</h3>
                            <button className="text-xs text-indigo-400 font-bold hover:underline">Ver Todos</button>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="p-4 text-xs text-slate-500 uppercase font-bold border-b border-white/5">Usuario</th>
                                            <th className="p-4 text-xs text-slate-500 uppercase font-bold border-b border-white/5">Asunto</th>
                                            <th className="p-4 text-xs text-slate-500 uppercase font-bold border-b border-white/5">Estado</th>
                                            <th className="p-4 text-xs text-slate-500 uppercase font-bold border-b border-white/5 text-right">Fecha</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { name: "Ana López", msg: "Interesada en Web Corp...", time: "Hace 2h", status: "Nuevo", color: "blue" },
                                            { name: "Carlos Ruiz", msg: "Cotización enviada...", time: "Hace 5h", status: "Leído", color: "slate" },
                                            { name: "Tech Corp", msg: "Propuesta de colaboración", time: "Ayer", status: "Pendiente", color: "amber" },
                                            { name: "Juan Pérez", msg: "Duda sobre precios", time: "Hace 2d", status: "Respondido", color: "emerald" },
                                        ].map((m, i) => (
                                            <tr key={i} className="hover:bg-white/5 transition-colors group cursor-pointer">
                                                <td className="p-4 flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-none flex items-center justify-center font-bold text-xs bg-slate-800 text-slate-300 ring-2 ring-transparent group-hover:ring-${m.color}-500 transition-all`}>
                                                        {m.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-200 group-hover:text-white">{m.name}</span>
                                                </td>
                                                <td className="p-4 text-sm text-slate-400">{m.msg}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-none text-[10px] font-bold uppercase bg-${m.color}-500/10 text-${m.color}-400 border border-${m.color}-500/20`}>
                                                        {m.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-xs text-slate-500 text-right font-mono">{m.time}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* REVENUE CHART */}
                    <div className="dashboard-card revenue-card">
                        <div className="card-header">
                            <h3>Balance Financiero</h3>
                        </div>
                        <div className="card-body chart-container" style={{ height: '250px' }}>
                            <RevenueChart />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
