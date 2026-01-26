"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaClock, FaSave, FaPlus, FaEdit, FaTrash,
    FaTimes, FaHistory, FaCalendarAlt, FaRocket
} from "react-icons/fa";
import type { TimelineItem } from "@/lib/data/timeline";

interface Props {
    timeline: TimelineItem[];
    onSave: (data: TimelineItem[]) => void;
}

export default function TimelineAdmin({ timeline: initialTimeline, onSave }: Props) {
    const [timeline, setTimeline] = useState(initialTimeline);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<TimelineItem | null>(null);

    useEffect(() => {
        setTimeline(initialTimeline);
    }, [initialTimeline]);

    const handleAdd = () => {
        setEditing({
            id: `timeline-new-${Date.now()}`,
            year: "",
            title: "",
            desc: "",
            category: "Hito",
            icon: "rocket"
        });
        setModalOpen(true);
    };

    const handleEdit = (item: TimelineItem) => {
        setEditing({ ...item });
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar este hito del Timeline?")) return;
        try {
            const res = await fetch(`http://localhost:8000/api/timeline/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Error al eliminar");

            const response = await fetch("http://localhost:8000/api/timeline");
            const data = await response.json();
            const mappedData = data.map((t: any) => ({
                ...t,
                id: t.id.toString(),
                desc: t.description,
                category: t.category || "Hito",
                icon: t.icon || "rocket"
            }));
            setTimeline(mappedData);
            onSave(mappedData);
        } catch (error) {
            console.error(error);
            alert("Error al eliminar hito");
        }
    };

    const handleSaveItem = async (item: TimelineItem) => {
        try {
            const isNew = item.id.startsWith('timeline-new-');
            const payload = {
                year: item.year,
                title: item.title,
                description: item.desc,
                category: item.category,
                icon: item.icon
            };

            const endpoint = isNew ? "http://localhost:8000/api/timeline" : `http://localhost:8000/api/timeline/${item.id}`;
            const method = isNew ? "POST" : "PUT";

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Error al guardar");

            const response = await fetch("http://localhost:8000/api/timeline");
            const data = await response.json();
            const mappedData = data.map((t: any) => ({
                ...t,
                id: t.id.toString(),
                desc: t.description,
                category: t.category,
                icon: t.icon
            }));
            setTimeline(mappedData);
            onSave(mappedData);
            setModalOpen(false);
            setEditing(null);
        } catch (error) {
            alert("Error al sincronizar con el servidor.");
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-center">
                <h3 className="title-fire text-4xl font-black uppercase tracking-tighter flex items-center gap-4">
                    <FaClock className="text-emerald-400" /> Línea de Tiempo (Timeline)
                </h3>
                <button
                    onClick={handleAdd}
                    className="px-8 py-4 bg-emerald-500 text-black font-black uppercase text-xs tracking-widest rounded-full hover:bg-emerald-400 transition-all btn-alive btn-shimmer shadow-xl shadow-emerald-500/10"
                >
                    <FaPlus className="inline mr-2" /> Nuevo Hito
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {timeline.map((item) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card-pro p-8 border border-white/5 rounded-[3rem] group hover:border-emerald-500/30 transition-all flex flex-col h-full overflow-hidden"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <span className="px-5 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-inner">
                                {item.year}
                            </span>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(item)} className="text-white/20 hover:text-white p-2 transition-all"><FaEdit /></button>
                                <button onClick={() => handleDelete(item.id)} className="text-white/20 hover:text-red-500 p-2 transition-all"><FaTrash /></button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-xs text-emerald-500">
                                {item.category === 'Educación' ? <FaPlus className="text-[10px]" /> : <FaRocket className="text-[10px]" />}
                            </div>
                            <h4 className="text-xl font-black text-white leading-tight uppercase group-hover:text-emerald-400 transition-colors">
                                {item.title}
                            </h4>
                        </div>

                        <p className="text-white/30 text-[11px] leading-relaxed mb-8 font-medium italic">
                            {item.desc}
                        </p>

                        <div className="mt-auto flex justify-between items-center">
                            <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">{item.category || 'GENERAL'}</span>
                            <div className="w-10 h-10 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/10 group-hover:text-emerald-500/50 transition-colors shadow-inner">
                                <FaHistory />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {modalOpen && editing && (
                    <TimelineModal item={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSaveItem} />
                )}
            </AnimatePresence>
        </div>
    );
}

function TimelineModal({ item, onClose, onSave }: { item: TimelineItem, onClose: () => void, onSave: (item: TimelineItem) => void }) {
    const [data, setData] = useState(item);
    const [selectedMonth, setSelectedMonth] = useState("");

    // Categorías con iconos asociados
    const categories = [
        { name: "Hito", icon: "rocket" },
        { name: "Educación", icon: "graduation" },
        { name: "Trabajo", icon: "briefcase" },
        { name: "Logro", icon: "star" },
        { name: "Certificación", icon: "certificate" }
    ];

    useEffect(() => {
        if (selectedMonth) {
            const date = new Date(selectedMonth + "-01");
            const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
            const formatted = `${months[date.getMonth()]} ${date.getFullYear()}`;
            setData(prev => ({ ...prev, year: formatted }));
        }
    }, [selectedMonth]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="max-w-2xl w-full bg-[#0a0a0c] border border-white/10 rounded-[3rem] shadow-4xl overflow-hidden flex flex-col"
            >
                <div className="flex justify-between items-center p-10 border-b border-white/5">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                        <FaHistory className="text-emerald-400" /> {item.id.startsWith('timeline-new-') ? 'Registrar Hito' : 'Editar Hito'}
                    </h2>
                    <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/5 text-white/30 hover:text-white hover:bg-red-500/20 transition-all flex items-center justify-center text-xl">✕</button>
                </div>

                <div className="p-12 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="block text-emerald-400 text-[10px] font-black uppercase tracking-widest ml-2">Seleccionar Fecha</label>
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-emerald-500 transition-all color-scheme-dark"
                            />
                            <div className="flex items-center gap-2 mt-2 ml-2">
                                <span className="text-[8px] text-white/20 uppercase font-black">Resultado:</span>
                                <span className="text-[10px] text-emerald-400 font-bold uppercase">{data.year || 'No seleccionada'}</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="block text-emerald-400 text-[10px] font-black uppercase tracking-widest ml-2">Título del Logro</label>
                            <input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-emerald-500 transition-all"
                                placeholder="P.ej. Certificación en IA" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-emerald-400 text-[10px] font-black uppercase tracking-widest ml-2">Categoría e Icono</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {categories.map((cat) => (
                                <button
                                    key={cat.name}
                                    onClick={() => setData({ ...data, category: cat.name, icon: cat.icon })}
                                    className={`px-4 py-3 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 ${data.category === cat.name
                                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                            : 'bg-white/5 border-white/5 text-white/30 hover:border-white/20'
                                        }`}
                                >
                                    <FaRocket className="text-[8px]" /> {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-3 ml-2">Hito Detallado</label>
                        <textarea value={data.desc} onChange={(e) => setData({ ...data, desc: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] px-8 py-6 text-white/80 font-medium outline-none focus:border-emerald-500 transition-all h-40 resize-none leading-relaxed"
                            placeholder="Proporciona contexto profesional para esta etapa..." />
                    </div>
                </div>

                <div className="p-10 bg-white/[0.02] border-t border-white/5 flex gap-4">
                    <button onClick={() => {
                        if (!data.year || !data.title) {
                            alert("Por favor selecciona una fecha y un título.");
                            return;
                        }
                        onSave(data);
                    }} className="flex-1 py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-[0.2em] rounded-full flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-cyan-500/20 transition-all">
                        <FaSave className="inline mr-2" /> CONFIRMAR HITO v2.0
                    </button>
                    <button onClick={onClose} className="px-10 py-5 bg-white/5 text-white/40 hover:text-white rounded-full transition-all border border-white/10 font-black uppercase text-xs tracking-widest">
                        DESCARTAR
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
