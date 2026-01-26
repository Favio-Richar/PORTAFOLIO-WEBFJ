"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCertificate, FaSave, FaPlusCircle, FaEdit, FaTrashAlt, FaTimes, FaFileUpload, FaSearchPlus, FaSpinner, FaAward, FaCalendarAlt } from "react-icons/fa";
import type { Certification } from "@/lib/data/certifications";

interface Props {
    certifications: Certification[];
    onSave: (data: Certification[]) => void;
}

export default function CertificationsAdmin({ certifications: initialCerts, onSave }: Props) {
    const [certifications, setCertifications] = useState(initialCerts);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Certification | null>(null);

    // Sincronizar estado local
    useEffect(() => {
        setCertifications(initialCerts);
    }, [initialCerts]);

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
            id: `cert-new-${Date.now()}`,
            title: "",
            issuer: "",
            date: "",
            description: "",
            icon: "FaCertificate",
            level: "Avanzado",
            color: "blue",
            badge: "",
            credentialUrl: "",
        });
        setModalOpen(true);
    };

    const handleEdit = (cert: Certification) => {
        setEditing(cert);
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar esta certificación?")) return;
        try {
            // Borrado físico del archivo si existe
            const itemToDelete = certifications.find(c => c.id === id);
            if (itemToDelete?.credentialUrl) {
                await deletePhysicalFile(itemToDelete.credentialUrl);
            }

            const res = await fetch(`http://localhost:8000/api/certifications/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("No se pudo eliminar en el servidor");

            const response = await fetch("http://localhost:8000/api/certifications");
            const data = await response.json();
            const mappedData = data.map((c: any) => ({
                ...c,
                id: c.id.toString(),
                credentialUrl: c.credential_url
            }));
            setCertifications(mappedData);
            onSave(mappedData);
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("Error al eliminar certificación");
        }
    };

    const handleSaveItem = async (item: Certification) => {
        try {
            const isNew = item.id.startsWith('cert-new-');

            const payload = {
                title: item.title,
                issuer: item.issuer,
                date: item.date,
                description: item.description || null,
                icon: item.icon || "FaCertificate",
                level: item.level || "Avanzado",
                color: item.color || "blue",
                badge: item.badge || null,
                credential_url: item.credentialUrl || null
            };

            const endpoint = isNew ? "http://localhost:8000/api/certifications" : `http://localhost:8000/api/certifications/${item.id}`;
            const method = isNew ? "POST" : "PUT";

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Error al guardar");

            const response = await fetch("http://localhost:8000/api/certifications");
            const data = await response.json();
            const mappedData = data.map((c: any) => ({
                ...c,
                id: c.id.toString(),
                credentialUrl: c.credential_url
            }));
            setCertifications(mappedData);
            onSave(mappedData);
            setModalOpen(false);
            setEditing(null);
        } catch (error: any) {
            alert(`Error al guardar: ${error.message}`);
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-center">
                <h3 className="title-fire text-4xl font-black uppercase tracking-tighter flex items-center gap-4">
                    <FaCertificate className="text-cyan-500 animate-pulse" /> Certificaciones
                </h3>
                <button onClick={handleAdd} className="px-10 py-5 rounded-full btn-primary btn-alive btn-shimmer flex items-center gap-3 text-xs font-black uppercase shadow-xl shadow-cyan-500/10">
                    <FaPlusCircle /> Añadir Certificación
                </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {certifications.map((cert) => (
                    <motion.div
                        key={cert.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card-pro p-8 border border-white/5 rounded-[3.5rem] group hover:border-cyan-500/30 transition-all flex flex-col relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <h4 className="text-xl font-black text-white leading-tight group-hover:text-cyan-400 transition-colors line-clamp-2 uppercase">{cert.title}</h4>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(cert)} className="text-white/20 hover:text-white p-2 transition-all"><FaEdit /></button>
                                <button onClick={() => handleDelete(cert.id)} className="text-white/20 hover:text-red-500 p-2 transition-all"><FaTrashAlt /></button>
                            </div>
                        </div>

                        <div className="space-y-1 mb-6">
                            <p className="text-cyan-400 text-xs font-black uppercase tracking-widest">{cert.issuer}</p>
                            <p className="text-white/30 text-[10px] font-bold uppercase">{cert.date} · {cert.level}</p>
                        </div>

                        {cert.description && (
                            <p className="text-white/20 text-[11px] leading-relaxed mb-6 italic line-clamp-2 border-l-2 border-white/5 pl-4">
                                "{cert.description}"
                            </p>
                        )}

                        <div className="mt-auto pt-6 border-t border-white/5 flex flex-wrap gap-2 items-center justify-between">
                            <div className="flex items-center gap-2">
                                {cert.badge && (
                                    <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[8px] font-black text-amber-500 uppercase tracking-widest">
                                        {cert.badge}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                {cert.credentialUrl && (
                                    <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full hover:bg-emerald-500/20 transition-all group/link">
                                        <FaAward className="text-emerald-500 text-[8px]" />
                                        <span className="text-emerald-500 text-[8px] font-black uppercase tracking-widest font-mono">VER CREDENCIAL</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {modalOpen && editing && (
                    <CertificationModal item={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSaveItem} />
                )}
            </AnimatePresence>
        </div>
    );
}

function CertificationModal({ item, onClose, onSave }: { item: Certification, onClose: () => void, onSave: (item: Certification) => void }) {
    const [data, setData] = useState(item);
    const [certFile, setCertFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    // Estados para el calendario real
    const [selectedMonth, setSelectedMonth] = useState("");

    // Efecto para formatear fecha automáticamente
    useEffect(() => {
        if (selectedMonth) {
            const d = new Date(selectedMonth + "-01");
            const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
            const formatted = `${months[d.getMonth()]} ${d.getFullYear()}`;
            setData(prev => ({ ...prev, date: formatted }));
        }
    }, [selectedMonth]);

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
            if (data.credentialUrl) {
                await deletePhysicalFile(data.credentialUrl);
            }

            setData({ ...data, credentialUrl: result.url });
        } catch (error) {
            alert("Error al subir el archivo.");
        } finally {
            setUploading(false);
        }
    };

    const removeFile = async () => {
        if (data.credentialUrl) {
            await deletePhysicalFile(data.credentialUrl);
            setData({ ...data, credentialUrl: "" });
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
                <div className="flex justify-between items-center p-10 border-b border-white/5 bg-cyan-500/5">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                        <FaCertificate className="text-cyan-500 animate-pulse" /> {item.id.startsWith('cert-new-') ? 'Nueva Certificación' : 'Editar Certificado'}
                    </h2>
                    <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/5 text-white/30 hover:text-white hover:bg-red-500/20 transition-all flex items-center justify-center text-xl">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="block text-cyan-400 text-[10px] font-black uppercase tracking-widest ml-2">Nombre de la Certificación</label>
                            <input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-cyan-500 transition-all focus:bg-white/10"
                                placeholder="E.g. Full Stack Web Developer" />
                        </div>
                        <div className="space-y-3">
                            <label className="block text-cyan-400 text-[10px] font-black uppercase tracking-widest ml-2">Emisor / Institución</label>
                            <input value={data.issuer} onChange={(e) => setData({ ...data, issuer: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-cyan-500 transition-all focus:bg-white/10"
                                placeholder="E.g. Udemy, Microsoft, Google" />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 items-end">
                        <div className="space-y-3">
                            <label className="block text-cyan-400 text-[10px] font-black uppercase tracking-widest ml-2 flex items-center gap-2"><FaCalendarAlt /> Fecha </label>
                            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-cyan-500 transition-all color-scheme-dark" />
                            <div className="text-[9px] text-cyan-500/50 font-black uppercase ml-2 italic">{data.date || "Pendiente"}</div>
                        </div>
                        <div className="space-y-3">
                            <label className="block text-cyan-400 text-[10px] font-black uppercase tracking-widest ml-2">Nivel</label>
                            <select value={data.level || "Avanzado"} onChange={(e) => setData({ ...data, level: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-cyan-500 transition-all appearance-none cursor-pointer">
                                <option value="Avanzado">Avanzado</option>
                                <option value="Experto">Experto</option>
                                <option value="Intermedio">Intermedio</option>
                                <option value="Título Profesional">Título Profesional</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="block text-cyan-400 text-[10px] font-black uppercase tracking-widest ml-2">Badge Superior</label>
                            <input value={data.badge || ""} onChange={(e) => setData({ ...data, badge: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-cyan-500 transition-all"
                                placeholder="E.g. Grado Académico" />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="block text-cyan-400 text-[10px] font-black uppercase tracking-widest ml-2">Icono (React Icon Name)</label>
                            <input value={data.icon || ""} onChange={(e) => setData({ ...data, icon: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-cyan-500 transition-all"
                                placeholder="E.g. FaCode, FaDatabase..." />
                        </div>
                        <div className="space-y-3">
                            <label className="block text-cyan-400 text-[10px] font-black uppercase tracking-widest ml-2">Color del Glow (Aura)</label>
                            <select value={data.color || "blue"} onChange={(e) => setData({ ...data, color: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-cyan-500 transition-all appearance-none cursor-pointer">
                                <option value="blue">Cian / Azul</option>
                                <option value="emerald">Esmeralda / Verde</option>
                                <option value="amber">Ámbar / Oro</option>
                                <option value="rose">Rosa / Red</option>
                                <option value="indigo">Índigo / Violeta</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-3 ml-2">Descripción / Logros Destacados</label>
                        <textarea value={data.description || ""} onChange={(e) => setData({ ...data, description: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] px-8 py-6 text-white/80 font-medium outline-none focus:border-cyan-500 transition-all h-32 resize-none leading-relaxed focus:bg-white/10"
                            placeholder="Describe lo que validaste con esta certificación..." />
                    </div>

                    <div className="pt-8 border-t border-white/5">
                        <div className="flex justify-between items-center mb-6 ml-2">
                            <label className="block text-cyan-400 text-[10px] font-black uppercase tracking-widest">Certificado Digital (PDF / Imagen)</label>
                            {data.credentialUrl && (
                                <a href={data.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyan-500/50 hover:text-cyan-400 flex items-center gap-2 font-black uppercase transition-all">
                                    <FaSearchPlus /> Previsualizar Actual
                                </a>
                            )}
                        </div>
                        <div className="grid md:grid-cols-2 gap-8 items-center bg-white/[0.01] p-8 rounded-[3rem] border border-white/5">
                            <label className={`cursor-pointer group block ${uploading ? 'pointer-events-none' : ''}`}>
                                <div className="p-10 rounded-[2.5rem] bg-black/40 border-2 border-dashed border-white/10 group-hover:border-cyan-500/50 transition-all flex flex-col items-center justify-center gap-4 hover:bg-cyan-500/5 relative overflow-hidden">
                                    {data.credentialUrl && (
                                        <div className="absolute top-4 right-4 z-20">
                                            <FaAward className="text-emerald-500 text-xl animate-bounce" />
                                        </div>
                                    )}
                                    {uploading ? (
                                        <FaSpinner className="text-2xl text-cyan-500 animate-spin" />
                                    ) : (
                                        <FaFileUpload className="text-2xl text-cyan-500 group-hover:scale-110 transition-transform" />
                                    )}
                                    <div className="text-center">
                                        <span className="text-white font-black text-[10px] uppercase tracking-[0.2em] block">{uploading ? "Subiendo..." : (data.credentialUrl ? "REEMPLAZAR ARCHIVO" : "CARGAR CERTIFICADO")}</span>
                                        {data.credentialUrl && <span className="text-emerald-500 text-[8px] font-black uppercase tracking-widest mt-1 block">Sincronizado con Éxito</span>}
                                    </div>
                                </div>
                                <input type="file" onChange={handleFileUpload} className="hidden" />
                            </label>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <span className="text-[9px] text-white/20 font-black uppercase ml-2">Enlace de Credencial Directo</span>
                                    <input value={data.credentialUrl || ""} onChange={(e) => setData({ ...data, credentialUrl: e.target.value })}
                                        className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-4 text-cyan-500 font-mono text-xs outline-none focus:border-cyan-500 transition-all"
                                        placeholder="https://credencial.com/..." />
                                </div>
                                {data.credentialUrl && (
                                    <button
                                        onClick={removeFile}
                                        className="w-full py-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 border border-red-500/20 shadow-lg shadow-red-500/5"
                                    >
                                        <FaTrashAlt /> Eliminar de forma permanente
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-10 bg-white/[0.02] border-t border-white/5 flex gap-4">
                    <button onClick={() => {
                        if (!data.title || !data.issuer || !data.date) {
                            alert("Por favor completa los campos principales.");
                            return;
                        }
                        onSave(data);
                    }} className="flex-1 py-6 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase text-xs tracking-[0.3em] rounded-full transition-all active:scale-95 shadow-2xl shadow-cyan-500/20 flex items-center justify-center gap-3">
                        <FaSave /> GUARDAR CERTIFICACIÓN v2.0
                    </button>
                    <button onClick={onClose} className="px-12 py-6 bg-white/5 text-white/40 hover:text-white rounded-full transition-all border border-white/10 font-black uppercase text-xs tracking-widest">
                        DESCARTE
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
