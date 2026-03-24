"use client";

import { useEffect, useState, useCallback } from "react";
import {
    FaCogs, FaCheckCircle, FaExclamationTriangle, FaTimesCircle,
    FaSyncAlt, FaGoogle, FaEnvelope, FaMicrosoft, FaBell,
    FaShieldAlt, FaSave, FaPaperPlane
} from "react-icons/fa";
import API_BASE from "@/lib/apiBase";
import { adminFetch } from "@/lib/adminFetch";

interface HealthStatus {
    status: string;
    services: {
        [key: string]: {
            status: string;
            message: string;
        };
    };
    providers: {
        id: string;
        configured: boolean;
        is_default: boolean;
    }[];
}

interface Setting {
    key: string;
    value: string;
    description: string;
    group: string;
    is_sensitive: boolean;
    updated_at: string;
}

export default function SettingsAdmin() {
    const [health, setHealth] = useState<HealthStatus | null>(null);
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const loadData = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            const headers = { "Authorization": `Bearer ${token}` };

            // Fetch Health
            const healthRes = await adminFetch(`${API_BASE}/api/admin/health`, { headers });
            if (healthRes.ok) setHealth(await healthRes.json());

            // Fetch Settings
            const settingsRes = await adminFetch(`${API_BASE}/api/admin/settings`, { headers });
            if (settingsRes.ok) setSettings(await settingsRes.json());

        } catch (err) {
            setError("Error conectando con el servidor backend.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleToggle = (key: string) => {
        setSettings(prev => prev.map(s => {
            if (s.key === key) {
                return { ...s, value: s.value === "true" ? "false" : "true" };
            }
            return s;
        }));
    };

    const handleInputChange = (key: string, value: string) => {
        setSettings(prev => prev.map(s => {
            if (s.key === key) return { ...s, value };
            return s;
        }));
    };

    const saveSettings = async () => {
        setSaving(true);
        setNotice("");
        try {
            const token = localStorage.getItem("token");
            const res = await adminFetch(`${API_BASE}/api/admin/settings`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(settings.map(s => ({ key: s.key, value: s.value })))
            });

            if (res.ok) {
                setNotice("Configuraciones guardadas exitosamente.");
                setTimeout(() => setNotice(""), 3000);
            } else {
                throw new Error("Fallo al guardar configuraciones.");
            }
        } catch (err) {
            setError("Error al guardar cambios.");
        } finally {
            setSaving(false);
        }
    };

    const testEmail = async () => {
        setNotice("Enviando correo de prueba...");
        try {
            const token = localStorage.getItem("token");
            const res = await adminFetch(`${API_BASE}/api/admin/test-email`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                setNotice("¡Correo de prueba enviado con éxito! Revisa tu bandeja de entrada.");
            } else {
                throw new Error();
            }
        } catch (err) {
            setError("Error al enviar correo de prueba. Verifica la API de Resend.");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse text-cyan-400">
                <FaSyncAlt className="text-5xl animate-spin mb-4" />
                <p className="font-bold tracking-widest uppercase text-xs">Cargando sistema...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 fade-in-up">
            {/* HEADER */}
            <section className="border border-white/10 bg-[#070b14]/70 p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] pointer-events-none" />
                <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
                    <div>
                        <h2 className="text-4xl font-black text-white flex items-center gap-4">
                            <FaCogs className="text-cyan-400" />
                            Configuración del Sistema
                        </h2>
                        <p className="text-white/50 mt-2 text-sm max-w-2xl font-medium">
                            Gestión centralizada de integraciones, salud de APIs y parámetros críticos del sistema.
                        </p>
                    </div>
                    <button
                        onClick={loadData}
                        className="px-6 py-3 text-xs font-black uppercase tracking-[0.2em] border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-all flex items-center gap-3 active:scale-95"
                    >
                        <FaSyncAlt className={loading ? "animate-spin" : ""} />
                        Refrescar Estado
                    </button>
                </div>
            </section>

            {(error || notice) && (
                <div className="space-y-4">
                    {error && (
                        <div className="border border-red-500/30 bg-red-500/10 text-red-200 px-6 py-4 flex items-center gap-4 animate-shake">
                            <FaTimesCircle className="text-xl" />
                            <p className="text-sm font-bold">{error}</p>
                        </div>
                    )}
                    {notice && (
                        <div className="border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 px-6 py-4 flex items-center gap-4 animate-fade-in">
                            <FaCheckCircle className="text-xl" />
                            <p className="text-sm font-bold">{notice}</p>
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* HEALTH MONITOR */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="border border-white/10 bg-[#0a101f]/80 p-6 space-y-6">
                        <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                            Salud de Integraciones
                        </h3>

                        <div className="space-y-4">
                            {health && Object.entries(health.services).map(([name, data]) => (
                                <div key={name} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${name === 'resend' ? 'bg-orange-500/10 text-orange-400' :
                                                name === 'google_calendar' ? 'bg-blue-500/10 text-blue-400' :
                                                    'bg-indigo-500/10 text-indigo-400'
                                            }`}>
                                            {name === 'resend' ? <FaEnvelope /> : name === 'google_calendar' ? <FaGoogle /> : <FaMicrosoft />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white uppercase tracking-tighter">{name.replace('_', ' ')}</p>
                                            <p className="text-[10px] text-white/40 font-medium">{data.message}</p>
                                        </div>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)] ${data.status === 'ok' ? 'bg-green-500' :
                                            data.status === 'warning' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' :
                                                'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                                        }`} />
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={testEmail}
                            className="w-full py-4 bg-gradient-to-r from-orange-600/20 to-orange-400/10 border border-orange-500/30 text-orange-300 text-[10px] font-black uppercase tracking-[0.2em] hover:from-orange-600/30 hover:to-orange-400/20 transition-all flex items-center justify-center gap-3"
                        >
                            <FaPaperPlane />
                            Test de Correo (Resend)
                        </button>
                    </div>

                    <div className="border border-red-500/20 bg-red-500/5 p-6 space-y-4">
                        <div className="flex items-center gap-3 text-red-400">
                            <FaShieldAlt className="text-xl" />
                            <h3 className="text-sm font-black uppercase tracking-widest">Seguridad Blindada</h3>
                        </div>
                        <p className="text-xs text-red-200/60 leading-relaxed font-medium">
                            Los tokens de acceso y claves privadas están protegidos a nivel de servidor.
                            Este panel solo gestiona interruptores lógicos; la sensibilidad de tus datos permanece encriptada en el backend.
                        </p>
                    </div>
                </div>

                {/* DYNAMIC SETTINGS */}
                <div className="xl:col-span-2 space-y-8">
                    {/* MEETING PROVIDERS */}
                    <div className="border border-white/10 bg-[#0a101f]/80 p-8 space-y-6">
                        <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-4">
                            <FaGoogle className="text-cyan-400" />
                            Proveedores de Reuniones
                        </h3>
                        <p className="text-xs text-white/40 -mt-2">Define qué plataformas se mostrarán a tus clientes en el formulario de reserva.</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {health?.providers.map(p => (
                                <div key={p.id} className={`p-5 border transition-all relative overflow-hidden group ${p.configured
                                        ? "bg-white/5 border-white/10 hover:border-cyan-500/40"
                                        : "bg-red-500/5 border-red-500/10 grayscale opacity-60"
                                    }`}>
                                    <div className="flex flex-col gap-3 relative z-10">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300/70">{p.id.replace('_', ' ')}</span>
                                            {p.configured ? (
                                                <div className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[8px] font-bold border border-green-500/20">CONFIGURADO</div>
                                            ) : (
                                                <div className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[8px] font-bold border border-red-500/20">FALTA .ENV</div>
                                            )}
                                        </div>
                                        <h4 className="text-lg font-black text-white">{p.id === 'google_meet' ? 'Google Meet' : p.id === 'jitsi' ? 'Jitsi Meet' : 'Microsoft Teams'}</h4>
                                        <button
                                            disabled={!p.configured}
                                            onClick={() => handleInputChange("default_meeting_provider", p.id)}
                                            className={`mt-2 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${settings.find(s => s.key === "default_meeting_provider")?.value === p.id
                                                    ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-200"
                                                    : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                                                }`}
                                        >
                                            {settings.find(s => s.key === "default_meeting_provider")?.value === p.id ? "Predeterminado" : "Hacer Predeterminado"}
                                        </button>
                                    </div>
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rotate-45 translate-x-8 -translate-y-8" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SYSTEM TOGGLES */}
                    <div className="border border-white/10 bg-[#0a101f]/80 p-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-4">
                                <FaBell className="text-cyan-400" />
                                Comportamiento y Avisos
                            </h3>
                            <button
                                onClick={saveSettings}
                                disabled={saving}
                                className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(8,145,178,0.3)] transition-all flex items-center gap-3 disabled:opacity-50"
                            >
                                <FaSave />
                                {saving ? "Guardando..." : "Guardar Cambios"}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {settings.filter(s => s.key !== "default_meeting_provider").map(s => (
                                <div key={s.key} className="space-y-3 group">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-black text-white uppercase tracking-widest group-hover:text-cyan-300 transition-colors">
                                            {s.key.replace(/_/g, ' ')}
                                        </label>

                                        {s.value === "true" || s.value === "false" ? (
                                            <button
                                                onClick={() => handleToggle(s.key)}
                                                className={`relative w-12 h-6 transition-colors duration-300 rounded-none border ${s.value === "true" ? "bg-cyan-500/40 border-cyan-400" : "bg-white/5 border-white/20"
                                                    }`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 transition-all duration-300 ${s.value === "true" ? "left-7 bg-white shadow-[0_0_10px_white]" : "left-1 bg-white/30"
                                                    }`} />
                                            </button>
                                        ) : (
                                            <input
                                                type="number"
                                                value={s.value}
                                                onChange={(e) => handleInputChange(s.key, e.target.value)}
                                                className="w-16 bg-black/40 border border-white/10 text-white text-right px-2 py-1 text-xs outline-none focus:border-cyan-500"
                                            />
                                        )}
                                    </div>
                                    <p className="text-[10px] text-white/40 font-medium leading-relaxed italic">{s.description}</p>
                                    <div className="h-[1px] w-full bg-gradient-to-r from-white/10 to-transparent" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .fade-in-up {
                    animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-pulse {
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: .5; }
                }
                .animate-shake {
                    animation: shake 0.4s ease-in-out;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
            `}</style>
        </div>
    );
}
