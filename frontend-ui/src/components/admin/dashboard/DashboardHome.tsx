import { useState, useEffect } from "react";
import { FaProjectDiagram, FaEye, FaEnvelope, FaChartLine, FaArrowUp, FaArrowDown, FaCalendarAlt, FaDownload, FaCheckDouble, FaTrash, FaDatabase, FaUsers } from "react-icons/fa";
import { VisitorChart, ProjectDistributionChart, RevenueChart } from "./DashboardCharts";
import API_BASE from "@/lib/apiBase";
import { adminFetch } from "@/lib/adminFetch";

interface DashboardStats {
    metrics: {
        projects: { total: number; label: string; trend: string };
        leads: { total: number; label: string; trend: string };
        quotes: { total: number; today: number; label: string; trend: string };
        subscribers: { total: number; label: string; trend: string };
    };
    charts?: {
        project_distribution: any[];
        revenue_history: any[];
        activity_trend: any[];
    };
    status: string;
    last_sync: string;
    recent_leads?: Array<{
        id: number;
        nombre: string;
        email: string;
        mensaje: string;
        status: string;
        created_at: string;
    }>;
    recent_inbox?: Array<{
        id: number;
        nombre: string;
        email: string;
        mensaje: string;
        status: string;
        created_at: string;
    }>;
}

interface DashboardHomeProps {
    setActiveSection: (section: string, recordId?: string | number) => void;
}

export default function DashboardHome({ setActiveSection }: DashboardHomeProps) {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await adminFetch(`${API_BASE}/api/admin/dashboard-stats/overview`);
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const metrics = stats?.metrics;
    
    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await adminFetch(`${API_BASE}/api/admin/dashboard-stats/overview`);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const res = await adminFetch(`${API_BASE}/api/admin/dashboard-stats/export`);
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `reporte_completo_${new Date().toISOString().slice(0,10)}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        } catch (err) { alert("Error al exportar reporte."); }
    };

    const handleMarkRead = async (id: number) => {
        const res = await adminFetch(`${API_BASE}/api/messages/${id}/read`, { method: "PATCH" });
        if (res.ok) fetchStats();
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Eliminar este lead permanentemente?")) return;
        const res = await adminFetch(`${API_BASE}/api/messages/${id}`, { method: "DELETE" });
        if (res.ok) fetchStats();
    };

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
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-none text-xs font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        <FaDownload /> Exportar Data
                    </button>
                </div>
            </div>
            
            {/* 📊 SENIOR OPERATIONAL OVERVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatusWidget label="Salud del Sistema" value="Óptimo" status="success" icon={<FaCheckDouble />} />
                <StatusWidget label="Base de Datos" value="Conectado" status="success" icon={<FaDatabase />} />
                <StatusWidget label="Mensajería" value="Activa" status="success" icon={<FaEnvelope />} />
                <StatusWidget label="Leads Recientes" value={(stats?.recent_leads?.length || 0).toString()} status="info" icon={<FaUsers />} />
            </div>

            {/* FUTHURISTIC GRID LAYOUT */}
            <div className="dashboard-grid">

                {/* 1. KEY METRICS ROW */}
                <div className="grid-row-metrics">
                    <div className="stat-card cyan">
                        <div className="icon-box" style={{ color: '#06b6d4' }}><FaProjectDiagram /></div>
                        <div className="stat-info">
                            <h4>{metrics?.projects?.label || "Proyectos Activos"}</h4>
                            <div className="value">{loading ? "..." : metrics?.projects?.total || 0}</div>
                            <div className="trend up"><FaArrowUp /> {metrics?.projects?.trend || "+0"}</div>
                        </div>
                        <div className="stat-chart-bg"></div>
                    </div>

                    <div className="stat-card violet">
                        <div className="icon-box" style={{ color: '#8b5cf6' }}><FaEye /></div>
                        <div className="stat-info">
                            <h4>{metrics?.leads?.label || "Leads Recibidos"}</h4>
                            <div className="value">{loading ? "..." : metrics?.leads?.total || 0}</div>
                            <div className="trend up"><FaArrowUp /> {metrics?.leads?.trend || "+12%"}</div>
                        </div>
                    </div>

                    <div className="stat-card rose">
                        <div className="icon-box" style={{ color: '#f43f5e' }}><FaEnvelope /></div>
                        <div className="stat-info">
                            <h4>{metrics?.quotes?.label || "Cotizaciones"}</h4>
                            <div className="value">{loading ? "..." : metrics?.quotes?.total || 0}</div>
                            <div className="trend up"><FaArrowUp /> {metrics?.quotes?.today || "0"} hoy</div>
                        </div>
                    </div>

                    <div className="stat-card amber">
                        <div className="icon-box" style={{ color: '#fbbf24' }}><FaChartLine /></div>
                        <div className="stat-info">
                            <h4>{metrics?.subscribers?.label || "Suscriptores"}</h4>
                            <div className="value">{loading ? "..." : metrics?.subscribers?.total || 0}</div>
                            <div className="trend up"><FaArrowUp /> {metrics?.subscribers?.trend || "+0"}</div>
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
                            <VisitorChart data={stats?.charts?.activity_trend || []} />
                        </div>
                    </div>

                    {/* PROJECT DISTRIBUTION (Side) */}
                    <div className="dashboard-card side-chart">
                        <div className="card-header">
                            <h3>Distribución</h3>
                        </div>
                        <div className="card-body chart-container flex items-center justify-center" style={{ height: '320px' }}>
                            <ProjectDistributionChart data={stats?.charts?.project_distribution || []} />
                        </div>
                    </div>
                </div>

                {/* 3. TABLES & REVENUE ROW */}
                <div className="grid-row-bottom">

                    {/* RECENT ACTIVITY (LEADS & MESSAGES) */}
                    <RecentActivityTable stats={stats} loading={loading} setActiveSection={setActiveSection} />

                    {/* REVENUE CHART */}
                    <div className="dashboard-card revenue-card">
                        <div className="card-header">
                            <h3>Balance Financiero</h3>
                        </div>
                        <div className="card-body chart-container" style={{ height: '250px' }}>
                            <RevenueChart data={stats?.charts?.revenue_history || []} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function StatusWidget({ label, value, status, icon }: { label: string, value: string, status: 'success' | 'info' | 'warning', icon: any }) {
    const colors = {
        success: 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10',
        info: 'text-blue-400 bg-blue-500/5 border-blue-500/10',
        warning: 'text-amber-400 bg-amber-500/5 border-amber-500/10'
    };

    return (
        <div className={`p-4 rounded-none border flex items-center gap-4 ${colors[status]} backdrop-blur-sm transition-all hover:bg-white/5`}>
            <div className="w-10 h-10 flex items-center justify-center bg-white/5 text-lg">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">{label}</p>
                <p className="text-lg font-black tracking-tight">{value}</p>
            </div>
        </div>
    );
}

function RecentActivityTable({ stats, loading, setActiveSection }: { stats: DashboardStats | null, loading: boolean, setActiveSection: any }) {
    const [activeTab, setActiveTab] = useState<'leads' | 'inbox'>('leads');
    
    const data = activeTab === 'leads' ? stats?.recent_leads : stats?.recent_inbox;
    const title = activeTab === 'leads' ? "Leads de Cotización" : "Mensajes del Inbox";
    const targetSection = activeTab === 'leads' ? "quotes" : "messages";
    const recordId = activeTab === 'leads' ? "leads" : undefined;

    return (
        <div className="dashboard-card table-card">
            <div className="card-header border-b border-white/5 !pb-0">
                <div className="flex gap-6">
                    <button 
                        onClick={() => setActiveTab('leads')}
                        className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === 'leads' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Leads de Cotización
                        {activeTab === 'leads' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]" />}
                    </button>
                    <button 
                        onClick={() => setActiveTab('inbox')}
                        className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === 'inbox' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Mensajes del Inbox
                        {activeTab === 'inbox' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]" />}
                    </button>
                </div>
                <button 
                    onClick={() => setActiveSection(targetSection, recordId)}
                    className="pb-4 text-[10px] text-slate-500 font-bold hover:text-white transition-colors"
                >
                    VER TODA LA GESTIÓN →
                </button>
            </div>
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="p-4 text-[10px] text-slate-500 uppercase font-black border-b border-white/5">Contacto</th>
                                <th className="p-4 text-[10px] text-slate-500 uppercase font-black border-b border-white/5">Resumen / Asunto</th>
                                <th className="p-4 text-[10px] text-slate-500 uppercase font-black border-b border-white/5">Estado</th>
                                <th className="p-4 text-[10px] text-slate-500 uppercase font-black border-b border-white/5 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} className="p-10 text-center text-slate-500 italic">Analizando registros...</td></tr>
                            ) : !data || data.length === 0 ? (
                                <tr><td colSpan={4} className="p-10 text-center text-slate-500">No hay {activeTab} recientes</td></tr>
                            ) : (
                                data.map((item) => (
                                    <tr 
                                        key={item.id} 
                                        onClick={() => setActiveSection(targetSection, activeTab === 'leads' ? 'leads' : undefined)}
                                        className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 flex items-center justify-center font-black text-[10px] ${activeTab === 'leads' ? 'bg-blue-500/10 text-blue-400' : 'bg-indigo-500/10 text-indigo-400'} border border-white/5`}>
                                                    {item.nombre.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-200 group-hover:text-white">{item.nombre}</span>
                                                    <span className="text-[10px] text-slate-500">{item.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-xs text-slate-400 max-w-[250px] truncate italic">"{item.mensaje}"</td>
                                        <td className="p-4">
                                            <div className={`inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter ${item.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-500'}`}>
                                                {item.status === 'pending' ? 'Pendiente' : 'Revisado'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end opacity-20 group-hover:opacity-100 transition-opacity">
                                                 <span className="text-[10px] font-bold text-indigo-400 tracking-widest">GESTIONAR →</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
