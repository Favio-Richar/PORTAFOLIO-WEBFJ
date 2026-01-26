"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaGraduationCap, FaSave, FaPlus, FaEdit, FaTrash,
    FaTimes, FaUniversity, FaCalendarAlt, FaAward, FaMapMarkerAlt, FaSpinner
} from "react-icons/fa";
import type { Education } from "@/lib/data/education";

interface Props {
    education: Education[];
    onSave: (data: Education[]) => void;
}

export default function EducationAdmin({ education: initialEducation, onSave }: Props) {
    const [education, setEducation] = useState(initialEducation);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Education | null>(null);

    useEffect(() => {
        setEducation(initialEducation);
    }, [initialEducation]);

    const deletePhysicalFile = async (url: string) => {
        if (!url || !url.includes("localhost:8000/uploads/")) return;
        try {
            await fetch(`http://localhost:8000/api/upload/delete?url=${encodeURIComponent(url)}`, {
                method: "DELETE",
            });
        } catch (error) {
            console.error("Error deleting physical file:", error);
        }
    };

    const handleAdd = () => {
        setEditing({
            id: `edu-new-${Date.now()}`,
            degree: "",
            institution: "",
            fieldOfStudy: "",
            location: "",
            startYear: "",
            endYear: "",
            description: "",
            certificateUrl: "",
        });
        setModalOpen(true);
    };

    const handleEdit = (edu: Education) => {
        setEditing({ ...edu });
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar este registro académico?")) return;
        try {
            // Borrado físico del archivo si existe
            const itemToDelete = education.find(e => e.id === id);
            if (itemToDelete?.certificateUrl) {
                await deletePhysicalFile(itemToDelete.certificateUrl);
            }

            const res = await fetch(`http://localhost:8000/api/education/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Error al eliminar");

            const response = await fetch("http://localhost:8000/api/education");
            const data = await response.json();
            const mappedData = data.map((edu: any) => ({
                id: edu.id.toString(),
                degree: edu.degree,
                institution: edu.institution,
                fieldOfStudy: edu.field_of_study,
                location: edu.location,
                startYear: edu.start_year,
                endYear: edu.end_year,
                description: edu.description,
                certificateUrl: edu.certificate_url
            }));
            setEducation(mappedData);
            onSave(mappedData);
        } catch (error) {
            console.error(error);
            alert("Error al eliminar registro");
        }
    };

    const handleSaveItem = async (item: Education) => {
        try {
            const isNew = item.id.startsWith('edu-new-');
            const payload = {
                degree: item.degree,
                institution: item.institution,
                field_of_study: item.fieldOfStudy || "",
                location: item.location,
                start_year: item.startYear,
                end_year: item.endYear,
                description: item.description || "",
                certificate_url: item.certificateUrl || ""
            };

            const endpoint = isNew ? "http://localhost:8000/api/education" : `http://localhost:8000/api/education/${item.id}`;
            const method = isNew ? "POST" : "PUT";

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Error al guardar");

            const response = await fetch("http://localhost:8000/api/education");
            const data = await response.json();
            const mappedData = data.map((edu: any) => ({
                id: edu.id.toString(),
                degree: edu.degree,
                institution: edu.institution,
                fieldOfStudy: edu.field_of_study,
                location: edu.location,
                startYear: edu.start_year,
                endYear: edu.end_year,
                description: edu.description,
                certificateUrl: edu.certificate_url
            }));
            setEducation(mappedData);
            onSave(mappedData);
            setModalOpen(false);
            setEditing(null);
        } catch (error) {
            alert("Error al sincronizar con la base de datos.");
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-center">
                <h3 className="title-fire text-4xl font-black uppercase tracking-tighter flex items-center gap-4">
                    <FaGraduationCap className="text-cyan-500" /> Formación Académica
                </h3>
                <button
                    onClick={handleAdd}
                    className="px-8 py-4 bg-cyan-500 text-black font-black uppercase text-xs tracking-widest rounded-full hover:bg-cyan-400 transition-all btn-alive btn-shimmer"
                >
                    <FaPlus className="inline mr-2" /> Añadir Título
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {education.map((edu) => (
                    <motion.div
                        key={edu.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card-pro p-8 border border-white/5 rounded-[3.5rem] group hover:border-indigo-500/30 transition-all flex flex-col"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-3xl text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-black transition-all">
                                    <FaUniversity />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-white uppercase leading-tight group-hover:text-indigo-400 transition-colors line-clamp-1">{edu.degree}</h4>
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{edu.institution}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(edu)} className="text-white/20 hover:text-white p-2 transition-all"><FaEdit /></button>
                                <button onClick={() => handleDelete(edu.id)} className="text-white/20 hover:text-red-500 p-2 transition-all"><FaTrash /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-1">Período</span>
                                <p className="text-[10px] font-bold text-white/60 flex items-center gap-2">
                                    <FaCalendarAlt className="text-indigo-500/50" /> {edu.startYear} - {edu.endYear}
                                </p>
                            </div>
                            <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-1">Ubicación</span>
                                <p className="text-[10px] font-bold text-white/60 flex items-center gap-2 truncate">
                                    <FaMapMarkerAlt className="text-indigo-500/50" /> {edu.location}
                                </p>
                            </div>
                        </div>

                        {edu.description && (
                            <p className="text-white/30 text-[11px] leading-relaxed mb-6 italic line-clamp-2">
                                "{edu.description}"
                            </p>
                        )}

                        <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[8px] font-black text-indigo-400 uppercase tracking-widest">
                                {edu.fieldOfStudy}
                            </span>
                            {edu.certificateUrl && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                    <FaAward className="text-emerald-500 text-[8px]" />
                                    <span className="text-emerald-500 text-[8px] font-black uppercase tracking-widest">CERTIFICADO OK</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {modalOpen && editing && (
                    <EducationModal item={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSaveItem} />
                )}
            </AnimatePresence>
        </div>
    );
}

function EducationModal({ item, onClose, onSave }: { item: Education, onClose: () => void, onSave: (item: Education) => void }) {
    const [data, setData] = useState(item);
    const [certFile, setCertFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    // Estados para los calendarios reales
    const [startMonth, setStartMonth] = useState("");
    const [endMonth, setEndMonth] = useState("");
    const [isCurrent, setIsCurrent] = useState(!!(data.endYear && data.endYear.toUpperCase().includes('ACTUALIDAD')));

    // Efecto para formatear fechas automáticamente
    useEffect(() => {
        const formatMonthYear = (dateStr: string) => {
            if (!dateStr) return "";
            const d = new Date(dateStr + "-01");
            const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
            return `${months[d.getMonth()]} ${d.getFullYear()}`;
        };

        if (startMonth) {
            setData(prev => ({ ...prev, startYear: formatMonthYear(startMonth) }));
        }
        if (endMonth && !isCurrent) {
            setData(prev => ({ ...prev, endYear: formatMonthYear(endMonth) }));
        } else if (isCurrent) {
            setData(prev => ({ ...prev, endYear: "ACTUALIDAD" }));
        }
    }, [startMonth, endMonth, isCurrent]);

    const deletePhysicalFile = async (url: string) => {
        if (!url || !url.includes("localhost:8000/uploads/")) return;
        try {
            await fetch(`http://localhost:8000/api/upload/delete?url=${encodeURIComponent(url)}`, {
                method: "DELETE",
            });
        } catch (error) {
            console.error("Error deleting physical file:", error);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCertFile(file);
        setUploading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("http://localhost:8000/api/upload", {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error("Upload failed");
            const result = await res.json();

            // Reemplazo inteligente: borrar anterior si existe
            if (data.certificateUrl) {
                await deletePhysicalFile(data.certificateUrl);
            }

            setData({ ...data, certificateUrl: result.url });
        } catch (error) {
            alert("Error al subir el archivo.");
        } finally {
            setUploading(false);
        }
    };

    const removeCertificate = async () => {
        if (data.certificateUrl) {
            await deletePhysicalFile(data.certificateUrl);
            setData({ ...data, certificateUrl: "" });
            setCertFile(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="max-w-4xl w-full bg-[#0a0a0c] border border-white/10 rounded-[4rem] shadow-4xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="flex justify-between items-center p-10 border-b border-white/5 bg-indigo-500/5">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                        <FaAward className="text-indigo-500" /> {item.id.startsWith('edu-new-') ? 'Nueva Formación' : 'Editar Título'}
                    </h2>
                    <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/5 text-white/30 hover:text-white hover:bg-red-500/20 transition-all flex items-center justify-center text-xl">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar">
                    {/* INFO ACADÉMICA */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="block text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-3 ml-2">Título / Grado Académico</label>
                            <input value={data.degree} onChange={(e) => setData({ ...data, degree: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-indigo-500 transition-all"
                                placeholder="E.g. Ingeniero Informático" />
                        </div>
                        <div className="space-y-3">
                            <label className="block text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-3 ml-2">Especialidad / Campo de Estudio</label>
                            <input value={data.fieldOfStudy || ""} onChange={(e) => setData({ ...data, fieldOfStudy: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-indigo-500 transition-all"
                                placeholder="E.g. Desarrollo de Software" />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="block text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-3 ml-2">Universidad / Institución</label>
                            <input value={data.institution} onChange={(e) => setData({ ...data, institution: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-indigo-500 transition-all"
                                placeholder="E.g. Universidad Técnica" />
                        </div>
                        <div className="space-y-3">
                            <label className="block text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-3 ml-2">Ubicación (Ciudad, País)</label>
                            <input value={data.location} onChange={(e) => setData({ ...data, location: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-indigo-500 transition-all"
                                placeholder="E.g. Santiago, Chile" />
                        </div>
                    </div>

                    {/* SELECCIÓN DE FECHAS ELITE */}
                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-8">
                        <div className="flex items-center gap-3 text-indigo-400 text-[10px] font-black uppercase tracking-widest ml-2">
                            <FaCalendarAlt /> Período Académico
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="block text-white/30 text-[9px] font-black uppercase ml-1">Fecha de Inicio</label>
                                <input type="month" value={startMonth} onChange={(e) => setStartMonth(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-indigo-500 transition-all color-scheme-dark" />
                                <div className="text-[9px] text-indigo-400 font-bold uppercase ml-1 italic">{data.startYear || "Sin fecha"}</div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center mb-1 px-1">
                                    <label className="block text-white/30 text-[9px] font-black uppercase">Fecha de Egreso / Titulación</label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} className="hidden" />
                                        <div className={`w-3 h-3 rounded-full border border-indigo-500/50 flex items-center justify-center transition-all ${isCurrent ? 'bg-indigo-500 border-indigo-500' : 'bg-transparent'}`}>
                                            {isCurrent && <div className="w-1 h-1 bg-black rounded-full" />}
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-tighter transition-all ${isCurrent ? 'text-indigo-400' : 'text-white/20 group-hover:text-white/40'}`}>En curso</span>
                                    </label>
                                </div>
                                <input type="month" value={endMonth} disabled={isCurrent} onChange={(e) => setEndMonth(e.target.value)}
                                    className={`w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-indigo-500 transition-all color-scheme-dark ${isCurrent ? 'opacity-20 pointer-events-none' : ''}`} />
                                <div className="text-[9px] text-indigo-400 font-bold uppercase ml-1 italic">{isCurrent ? "ACTUALIDAD" : (data.endYear || "Sin fecha")}</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-3 ml-2">Resumen Académico / Logros</label>
                        <textarea value={data.description || ""} onChange={(e) => setData({ ...data, description: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] px-8 py-6 text-white/80 font-medium outline-none focus:border-indigo-500 transition-all h-32 resize-none leading-relaxed"
                            placeholder="Detalla tus menciones honrosas, promedio destacado o tesis..." />
                    </div>

                    <div className="pt-8 border-t border-white/5">
                        <label className="block text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-6 ml-2">Verificación de Título (Certificado)</label>
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <label className={`cursor-pointer group block ${uploading ? 'pointer-events-none' : ''}`}>
                                <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border-2 border-dashed border-white/10 group-hover:border-indigo-500/50 transition-all flex flex-col items-center justify-center gap-4 hover:bg-white/5 relative overflow-hidden">
                                    {data.certificateUrl && (
                                        <div className="absolute top-4 right-4 z-20">
                                            <FaAward className="text-emerald-500 text-xl animate-bounce" />
                                        </div>
                                    )}
                                    {uploading ? (
                                        <FaSpinner className="text-2xl text-indigo-500 animate-spin" />
                                    ) : (
                                        <FaPlus className="text-2xl text-indigo-500 group-hover:scale-110 transition-transform" />
                                    )}
                                    <div className="text-center">
                                        <span className="text-white font-black text-[10px] uppercase tracking-[0.2em] block">{uploading ? "Subiendo..." : (data.certificateUrl ? "Certificado Vinculado" : "Subir PDF/Imagen")}</span>
                                        {data.certificateUrl && <span className="text-emerald-500 text-[8px] font-black uppercase tracking-widest mt-1 block">¡ARCHIVO LISTO!</span>}
                                    </div>
                                </div>
                                <input type="file" onChange={handleFileUpload} className="hidden" />
                            </label>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <span className="text-[9px] text-white/20 font-black uppercase ml-2">URL del Certificado</span>
                                    <input value={data.certificateUrl || ""} onChange={(e) => setData({ ...data, certificateUrl: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-indigo-500 transition-all text-xs"
                                        placeholder="https://credencial.com/..." />
                                </div>

                                {data.certificateUrl && (
                                    <button
                                        onClick={removeCertificate}
                                        className="w-full py-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 border border-red-500/20"
                                    >
                                        <FaTrash /> Eliminar Archivo del Servidor
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-10 bg-white/[0.02] border-t border-white/5 flex gap-4">
                    <button onClick={() => {
                        if (!data.degree || !data.institution || !data.startYear) {
                            alert("Por favor completa los campos obligatorios.");
                            return;
                        }
                        onSave(data);
                    }} className="flex-1 py-6 bg-indigo-500 hover:bg-indigo-400 text-black font-black uppercase text-xs tracking-[0.3em] rounded-full transition-all active:scale-95 shadow-2xl shadow-indigo-500/20 flex items-center justify-center gap-3">
                        <FaSave /> GUARDAR FORMACIÓN v2.0
                    </button>
                    <button onClick={onClose} className="px-12 py-6 bg-white/5 text-white/40 hover:text-white rounded-full transition-all border border-white/10 font-black uppercase text-xs tracking-widest">
                        CANCELAR
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
