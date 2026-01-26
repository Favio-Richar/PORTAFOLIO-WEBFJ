"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaBriefcase, FaSave, FaPlus, FaEdit, FaTrash,
    FaTimes, FaMapMarkerAlt, FaCalendarAlt, FaTools
} from "react-icons/fa";
import type { Experience } from "@/lib/data/experience";

interface Props {
    experiences: Experience[];
    onSave: (data: Experience[]) => void;
}

export default function ExperienceAdmin({ experiences: initialExperiences, onSave }: Props) {
    const [experiences, setExperiences] = useState(initialExperiences);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Experience | null>(null);

    useEffect(() => {
        setExperiences(initialExperiences);
    }, [initialExperiences]);

    const handleAdd = () => {
        setEditing({
            id: `new-${Date.now()}`,
            company: "",
            position: "",
            period: "",
            location: "",
            employmentType: "Full-time",
            description: "",
            technologies: [],
        });
        setModalOpen(true);
    };

    const handleEdit = (exp: Experience) => {
        setEditing({ ...exp });
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar este registro de experiencia?")) return;
        try {
            const res = await fetch(`http://localhost:8000/api/experiences/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Error al eliminar");

            const response = await fetch("http://localhost:8000/api/experiences");
            const data = await response.json();
            const mappedData = data.map((e: any) => ({
                ...e,
                id: e.id.toString(),
                employmentType: e.employment_type,
                technologies: typeof e.technologies === 'string' ? JSON.parse(e.technologies) : e.technologies
            }));
            setExperiences(mappedData);
            onSave(mappedData);
        } catch (error) {
            console.error(error);
            alert("Error al eliminar");
        }
    };

    const handleSaveItem = async (item: Experience) => {
        try {
            const isNew = item.id.startsWith('new-');
            const payload = {
                company: item.company,
                position: item.position,
                period: item.period,
                location: item.location || "",
                employment_type: item.employmentType || "Full-time",
                description: item.description,
                technologies: JSON.stringify(item.technologies)
            };

            const endpoint = isNew ? "http://localhost:8000/api/experiences" : `http://localhost:8000/api/experiences/${item.id}`;
            const method = isNew ? "POST" : "PUT";

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Error al guardar");

            const response = await fetch("http://localhost:8000/api/experiences");
            const data = await response.json();
            const mappedData = data.map((e: any) => ({
                ...e,
                id: e.id.toString(),
                employmentType: e.employment_type,
                technologies: typeof e.technologies === 'string' ? JSON.parse(e.technologies) : e.technologies
            }));
            setExperiences(mappedData);
            onSave(mappedData);
            setModalOpen(false);
            setEditing(null);
        } catch (error) {
            alert("Error al guardar en el servidor");
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-center">
                <h3 className="title-fire text-4xl font-black uppercase tracking-tighter flex items-center gap-4">
                    <FaBriefcase className="text-cyan-500" /> Experiencia Laboral
                </h3>
                <button
                    onClick={handleAdd}
                    className="px-8 py-4 bg-cyan-500 text-black font-black uppercase text-xs tracking-widest rounded-full hover:bg-cyan-400 transition-all btn-alive btn-shimmer"
                >
                    <FaPlus className="inline mr-2" /> Añadir Experiencia
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {experiences.map((exp) => (
                    <motion.div
                        key={exp.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card-pro p-8 border border-white/5 rounded-[3rem] group hover:border-cyan-500/30 transition-all flex flex-col"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <h4 className="text-xl font-black text-white uppercase leading-tight group-hover:text-cyan-400 transition-colors line-clamp-2">{exp.position}</h4>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(exp)} className="text-white/30 hover:text-cyan-400 p-2 transition-all"><FaEdit /></button>
                                <button onClick={() => handleDelete(exp.id)} className="text-white/30 hover:text-red-500 p-2 transition-all"><FaTrash /></button>
                            </div>
                        </div>
                        <p className="text-cyan-400 text-sm font-black mb-1 uppercase tracking-wider">{exp.company}</p>
                        <p className="text-white/40 text-xs font-bold mb-4">{exp.period}</p>
                        <p className="text-gray-500 text-xs line-clamp-3 mb-6 font-medium italic">"{exp.description}"</p>

                        <div className="mt-auto flex flex-wrap gap-2">
                            {exp.technologies.slice(0, 4).map((t, idx) => (
                                <span key={idx} className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-white/40 uppercase tracking-widest">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {modalOpen && editing && (
                    <ExperienceModal item={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSaveItem} />
                )}
            </AnimatePresence>
        </div>
    );
}

function ExperienceModal({ item, onClose, onSave }: { item: Experience, onClose: () => void, onSave: (item: Experience) => void }) {
    const [data, setData] = useState(item);

    // Parsear el periodo actual para inicializar los inputs de fecha si es posible
    // Formato esperado: "MES AÑO - MES AÑO" o "MES AÑO - ACTUALIDAD"
    const parsePeriod = (period: string) => {
        const parts = period.split(' - ');
        const start = parts[0] || '';
        const end = parts[1] || '';
        return { start, end };
    };

    const periodParts = parsePeriod(data.period);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isCurrent, setIsCurrent] = useState(data.period.toUpperCase().includes('ACTUALIDAD'));

    // Efecto para sincronizar el string de 'period' cuando cambian las fechas individuales
    useEffect(() => {
        if (!startDate) return;

        const formatMonthYear = (dateStr: string) => {
            if (!dateStr) return "";
            const d = new Date(dateStr);
            const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
            return `${months[d.getMonth()]} ${d.getFullYear()}`;
        };

        const startFormatted = formatMonthYear(startDate);
        const endFormatted = isCurrent ? "ACTUALIDAD" : formatMonthYear(endDate);

        if (startFormatted) {
            setData(prev => ({ ...prev, period: `${startFormatted} - ${endFormatted}` }));
        }
    }, [startDate, endDate, isCurrent]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="max-w-3xl w-full glass-card-pro border border-white/10 p-12 rounded-[4rem] max-h-[90vh] overflow-y-auto shadow-4xl custom-scrollbar"
            >
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                            <FaBriefcase />
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                            {item.id.startsWith('new-') ? 'Nueva Experiencia' : 'Editar Experiencia'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/5 text-white/30 hover:text-white hover:bg-red-500/20 transition-all flex items-center justify-center text-xl">
                        <FaTimes />
                    </button>
                </div>

                <div className="space-y-10">
                    {/* INFO PRINCIPAL */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-cyan-400 text-[10px] font-black uppercase tracking-widest ml-2">
                                <FaEdit className="text-[8px]" /> Cargo / Posición
                            </label>
                            <input
                                value={data.position}
                                onChange={(e) => setData({ ...data, position: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
                                placeholder="P.ej. Desarrollador Senior"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-cyan-400 text-[10px] font-black uppercase tracking-widest ml-2">
                                <FaPlus className="text-[8px]" /> Empresa
                            </label>
                            <input
                                value={data.company}
                                onChange={(e) => setData({ ...data, company: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
                                placeholder="P.ej. Google / Microsoft"
                            />
                        </div>
                    </div>

                    {/* FECHAS PROFESIONALES */}
                    <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] space-y-6">
                        <div className="flex items-center gap-2 text-cyan-400 text-[10px] font-black uppercase tracking-widest ml-2">
                            <FaCalendarAlt className="text-xs" /> Selección de Período
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-white/30 text-[9px] font-black uppercase ml-1">Fecha de Inicio</label>
                                <input
                                    type="month"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-cyan-500 transition-all color-scheme-dark"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="block text-white/30 text-[9px] font-black uppercase">Fecha de Fin</label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={isCurrent}
                                            onChange={(e) => setIsCurrent(e.target.checked)}
                                            className="hidden"
                                        />
                                        <div className={`w-3 h-3 rounded-full border border-cyan-500/50 flex items-center justify-center transition-all ${isCurrent ? 'bg-cyan-500 border-cyan-500' : 'bg-transparent'}`}>
                                            {isCurrent && <div className="w-1 h-1 bg-black rounded-full" />}
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-tighter transition-all ${isCurrent ? 'text-cyan-400' : 'text-white/20 group-hover:text-white/40'}`}>Trabajo Actual</span>
                                    </label>
                                </div>
                                <input
                                    type="month"
                                    value={endDate}
                                    disabled={isCurrent}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-cyan-500 transition-all color-scheme-dark ${isCurrent ? 'opacity-20 pointer-events-none' : ''}`}
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-white/20 uppercase">Resultado Período:</span>
                                <span className="px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs font-black text-cyan-400 uppercase tracking-widest animate-pulse">
                                    {data.period || "Selecciona fechas..."}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-cyan-400 text-[10px] font-black uppercase tracking-widest ml-2">
                                <FaMapMarkerAlt className="text-[8px]" /> Ubicación
                            </label>
                            <input
                                value={data.location || ""}
                                onChange={(e) => setData({ ...data, location: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-cyan-500 transition-all"
                                placeholder="P.ej. Remoto / Santiago, Chile"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-cyan-400 text-[10px] font-black uppercase tracking-widest ml-2">
                                <FaTools className="text-[8px]" /> Tipo de Contrato
                            </label>
                            <div className="relative">
                                <select
                                    value={data.employmentType}
                                    onChange={(e) => setData({ ...data, employmentType: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-cyan-500 appearance-none transition-all cursor-pointer"
                                >
                                    <option value="Full-time" className="bg-zinc-950 text-white p-4">Full-time (Tiempo Completo)</option>
                                    <option value="Contract" className="bg-zinc-950 text-white p-4">Contract (Contrato Directo)</option>
                                    <option value="Freelance" className="bg-zinc-950 text-white p-4">Freelance (Independiente)</option>
                                    <option value="Part-time" className="bg-zinc-950 text-white p-4">Part-time (Medio Tiempo)</option>
                                    <option value="Remoto" className="bg-zinc-950 text-white p-4">Remote (Trabajo Remoto)</option>
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                                    ▼
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-3 ml-2">Descripción de Responsabilidades</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData({ ...data, description: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] px-8 py-6 text-white/80 font-medium outline-none focus:border-cyan-500 focus:bg-white/10 transition-all h-40 resize-none leading-relaxed"
                            placeholder="Detalla tus logros y misiones clave..."
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="block text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-4 ml-2">Frameworks y Tecnologías (Enter para añadir)</label>
                        <div className="flex flex-wrap gap-2 p-6 bg-white/5 border border-white/5 rounded-[2.5rem]">
                            {data.technologies.map((tech, idx) => (
                                <motion.span
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-cyan-500/5 group"
                                >
                                    <span className="text-cyan-400">{tech}</span>
                                    <button
                                        onClick={() => setData({ ...data, technologies: data.technologies.filter((_, i) => i !== idx) })}
                                        className="text-white/20 hover:text-red-500 transition-colors"
                                    >
                                        <FaTimes className="text-[8px]" />
                                    </button>
                                </motion.span>
                            ))}
                            <input
                                type="text"
                                onKeyDown={(e: any) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const val = e.target.value.trim();
                                        if (val && !data.technologies.includes(val)) {
                                            setData({ ...data, technologies: [...data.technologies, val] });
                                            e.target.value = '';
                                        }
                                    }
                                }}
                                placeholder="Escribe tecnología..."
                                className="bg-transparent border-none outline-none text-xs font-bold text-white uppercase tracking-widest px-4 placeholder:text-white/10 min-w-[150px]"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mt-12 pt-8 border-t border-white/5">
                    <button
                        onClick={() => {
                            if (!data.position || !data.company || !data.period) {
                                alert("Por favor, completa los campos obligatorios (Cargo, Empresa y Período)");
                                return;
                            }
                            onSave(data);
                        }}
                        className="flex-1 py-6 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase text-xs tracking-[0.3em] rounded-full flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl shadow-cyan-500/20 group"
                    >
                        <FaSave className="group-hover:rotate-12 transition-transform" /> GUARDAR EXPERIENCIA v2.0
                    </button>
                    <button
                        onClick={onClose}
                        className="px-10 py-6 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white font-black uppercase text-xs tracking-widest rounded-full transition-all border border-white/10"
                    >
                        CANCELAR
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
