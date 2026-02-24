"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCertificate, FaSave, FaPlusCircle, FaEdit, FaTrashAlt, FaFileUpload, FaSearchPlus, FaSpinner, FaAward, FaCalendarAlt } from "react-icons/fa";
import type { Certification } from "@/lib/data/certifications";

interface Props {
    certifications: Certification[];
    onSave: (data: Certification[]) => void;
}

type RawCertificationResponse = Omit<Certification, "id" | "credentialUrl"> & {
    id: number | string;
    credential_url?: string | null;
};

const API_BASE = "http://localhost:8000";

const STUDY_LEVEL_OPTIONS = [
    "Titulo Profesional",
    "Ingenieria Informatica",
    "Certificacion",
    "Certificacion Tecnica",
    "Diplomado",
    "Curso Especializado",
    "Especializacion",
    "Bootcamp",
];

const BADGE_CATEGORY_OPTIONS = [
    "Grado Academico",
    "Ingenieria Informatica",
    "Certificacion",
    "Cloud",
    "Backend",
    "Frontend",
    "Data",
    "DevOps",
    "Agile",
    "Ciberseguridad",
    "Arquitectura",
    "IA",
];

const toCalendarDate = (rawDate?: string): string => {
    const value = (rawDate || "").trim();
    if (!value) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    if (/^\d{4}$/.test(value)) return `${value}-01-01`;

    const parts = value.split(" ");
    if (parts.length === 2 && /^\d{4}$/.test(parts[1])) {
        const monthMap: Record<string, string> = {
            ENE: "01",
            FEB: "02",
            MAR: "03",
            ABR: "04",
            MAY: "05",
            JUN: "06",
            JUL: "07",
            AGO: "08",
            SEP: "09",
            OCT: "10",
            NOV: "11",
            DIC: "12",
        };
        const month = monthMap[parts[0].toUpperCase()];
        if (month) return `${parts[1]}-${month}-01`;
    }
    return "";
};

const resolveVisualPreset = (level?: string, badge?: string): { icon: string; color: string } => {
    const normalizedLevel = (level || "").toLowerCase();
    const normalizedBadge = (badge || "").toLowerCase();

    if (
        normalizedLevel.includes("titulo profesional") ||
        normalizedLevel.includes("ingenieria informatica") ||
        normalizedBadge.includes("ingenieria informatica")
    ) {
        return { icon: "FaUserGraduate", color: "gold" };
    }
    if (normalizedBadge.includes("certificacion")) {
        return { icon: "FaCertificate", color: "blue" };
    }
    if (normalizedBadge.includes("cloud") || normalizedBadge.includes("devops")) {
        return { icon: "FaCertificate", color: "amber" };
    }
    if (normalizedBadge.includes("ciberseguridad")) {
        return { icon: "FaShieldAlt", color: "indigo" };
    }
    if (normalizedBadge.includes("data") || normalizedBadge.includes("ia")) {
        return { icon: "FaDatabase", color: "emerald" };
    }
    if (normalizedBadge.includes("arquitectura") || normalizedBadge.includes("backend")) {
        return { icon: "FaProjectDiagram", color: "blue" };
    }
    return { icon: "FaCertificate", color: "blue" };
};

export default function CertificationsAdmin({ certifications: initialCerts, onSave }: Props) {
    const [certifications, setCertifications] = useState(initialCerts);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Certification | null>(null);

    // Sincronizar estado local
    useEffect(() => {
        setCertifications(initialCerts);
    }, [initialCerts]);

    const deletePhysicalFile = async (url: string) => {
        if (!url || (!url.includes("localhost:8000/uploads/") && !url.includes("cloudinary.com"))) return;
        try {
            await fetch(`${API_BASE}/api/upload/delete?url=${encodeURIComponent(url)}`, {
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
            level: "Certificacion Tecnica",
            color: "blue",
            badge: "Cloud",
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
        if (id.startsWith("cert-new-")) {
            const updated = certifications.filter((item) => item.id !== id);
            setCertifications(updated);
            onSave(updated);
            return;
        }
        try {
            // Borrado físico del archivo si existe
            const itemToDelete = certifications.find(c => c.id === id);
            if (itemToDelete?.credentialUrl) {
                await deletePhysicalFile(itemToDelete.credentialUrl);
            }

            const res = await fetch(`${API_BASE}/api/certifications/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("No se pudo eliminar en el servidor");

            const response = await fetch(`${API_BASE}/api/certifications`);
            const data = await response.json();
            const mappedData = (data as RawCertificationResponse[]).map((c) => ({
                ...c,
                id: c.id.toString(),
                credentialUrl: c.credential_url || undefined
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
                level: item.level || "Certificacion Tecnica",
                color: item.color || "blue",
                badge: item.badge || null,
                credential_url: item.credentialUrl || null
            };

            const endpoint = isNew ? `${API_BASE}/api/certifications` : `${API_BASE}/api/certifications/${item.id}`;
            const method = isNew ? "POST" : "PUT";

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Error al guardar");

            const response = await fetch(`${API_BASE}/api/certifications`);
            const data = await response.json();
            const mappedData = (data as RawCertificationResponse[]).map((c) => ({
                ...c,
                id: c.id.toString(),
                credentialUrl: c.credential_url || undefined
            }));
            setCertifications(mappedData);
            onSave(mappedData);
            setModalOpen(false);
            setEditing(null);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Error desconocido";
            alert(`Error al guardar: ${message}`);
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-wrap justify-between items-center gap-3">
                <h3 className="title-fire text-4xl font-black uppercase tracking-tighter flex items-center gap-4">
                    <FaCertificate className="text-cyan-500 animate-pulse" /> Certificaciones
                </h3>
                                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={handleAdd} className="px-10 py-5 rounded-full btn-primary btn-alive btn-shimmer flex items-center gap-3 text-xs font-black uppercase shadow-xl shadow-cyan-500/10">
                        <FaPlusCircle /> Crear certificacion
                    </button>
                </div>
            </div>

            <p className="text-[11px] uppercase tracking-widest text-white/35">
                Estas tarjetas alimentan el bloque publico Sobre mi - Certificaciones y se guardan en base de datos.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {certifications.map((cert) => (
                    <motion.div
                        key={cert.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="admin-card group hover:border-cyan-500/30 transition-all flex flex-col relative overflow-hidden"
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
                                &quot;{cert.description}&quot;
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
    const [data, setData] = useState<Certification>(() => ({
        ...item,
        level: STUDY_LEVEL_OPTIONS.includes(item.level || "") ? (item.level || "Certificacion Tecnica") : "Certificacion Tecnica",
        badge: BADGE_CATEGORY_OPTIONS.includes(item.badge || "") ? (item.badge || "Cloud") : "Cloud",
    }));
    const [calendarDate, setCalendarDate] = useState<string>(() => toCalendarDate(item.date));
    const [uploading, setUploading] = useState(false);

    const deletePhysicalFile = async (url: string) => {
        if (!url || (!url.includes("localhost:8000/uploads/") && !url.includes("cloudinary.com"))) return;
        try {
            await fetch(`${API_BASE}/api/upload/delete?url=${encodeURIComponent(url)}`, {
                method: "DELETE",
            });
        } catch (error) {
            console.error("Error deleting physical file:", error);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${API_BASE}/api/upload`, {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error("Upload failed");
            const result = await res.json();

            if (data.credentialUrl) {
                await deletePhysicalFile(data.credentialUrl);
            }

            setData({ ...data, credentialUrl: result.url });
        } catch {
            alert("Error al subir el archivo.");
        } finally {
            setUploading(false);
        }
    };

    const removeFile = async () => {
        if (data.credentialUrl) {
            await deletePhysicalFile(data.credentialUrl);
            setData({ ...data, credentialUrl: "" });
        }
    };

    const sectionClass = "rounded-2xl border border-white/10 bg-[#0d1a32]/70 p-4 md:p-5";
    const labelClass = "block text-cyan-300 text-[10px] font-black uppercase tracking-[0.16em] mb-2";
    const inputClass = "w-full bg-[#111f3a] border border-white/15 rounded-xl px-4 py-3 text-white font-semibold outline-none focus:border-cyan-300 focus:bg-[#142646] transition-colors";

    return (
        <div className="fixed inset-0 z-[100] grid place-items-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                className="w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-[28px] border border-cyan-400/20 bg-[#071125] shadow-[0_28px_90px_rgba(0,0,0,0.68)] flex flex-col"
            >
                <div className="px-5 md:px-8 py-5 md:py-6 border-b border-cyan-400/15 bg-gradient-to-r from-[#11254a] via-[#0e2142] to-[#0b1934]">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/80 font-bold">Panel de certificaciones</p>
                            <h2 className="text-2xl md:text-[34px] leading-none font-black text-white flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-cyan-400/15 border border-cyan-300/35 grid place-items-center">
                                    <FaCertificate className="text-cyan-200" />
                                </span>
                                {item.id.startsWith("cert-new-") ? "Nueva Certificacion" : "Editar Certificacion"}
                            </h2>
                            <p className="text-sm text-slate-300/80">Completa los campos y vincula el archivo para mostrarlo en Sobre mi.</p>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-11 h-11 rounded-xl border border-white/15 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors grid place-items-center text-xl"
                            aria-label="Cerrar"
                        >
                            x
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 md:px-8 py-5 md:py-6 space-y-4 custom-scrollbar">
                    <section className={sectionClass}>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300 font-black mb-4">Datos principales</p>
                        <div className="grid lg:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Nombre de la certificacion</label>
                                <input
                                    value={data.title}
                                    onChange={(e) => setData({ ...data, title: e.target.value })}
                                    className={inputClass}
                                    placeholder="AWS Certified Solutions Architect"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Emisor / institucion</label>
                                <input
                                    value={data.issuer}
                                    onChange={(e) => setData({ ...data, issuer: e.target.value })}
                                    className={inputClass}
                                    placeholder="Amazon Web Services"
                                />
                            </div>
                        </div>
                    </section>

                    <section className={sectionClass}>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300 font-black mb-4">Clasificacion y fecha</p>
                        <div className="grid lg:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>
                                    <span className="inline-flex items-center gap-2"><FaCalendarAlt /> Fecha</span>
                                </label>
                                <input
                                    type="date"
                                    value={calendarDate}
                                    onChange={(e) => {
                                        const selected = e.target.value;
                                        setCalendarDate(selected);
                                        setData({ ...data, date: selected ? selected.slice(0, 4) : "" });
                                    }}
                                    className={`${inputClass} color-scheme-dark`}
                                    min="1950-01-01"
                                    max="2100-12-31"
                                />
                                <p className="text-[10px] mt-2 text-cyan-200/75 font-semibold uppercase tracking-wider">
                                    Año guardado: {data.date || "Pendiente"}
                                </p>
                            </div>

                            <div>
                                <label className={labelClass}>Nivel de estudio (categoria)</label>
                                <select
                                    value={data.level || "Certificacion Tecnica"}
                                    onChange={(e) => setData({ ...data, level: e.target.value })}
                                    className={`${inputClass} appearance-none cursor-pointer`}
                                >
                                    {STUDY_LEVEL_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>Badge (categoria)</label>
                                <select
                                    value={data.badge || "Cloud"}
                                    onChange={(e) => setData({ ...data, badge: e.target.value })}
                                    className={`${inputClass} appearance-none cursor-pointer`}
                                >
                                    {BADGE_CATEGORY_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className={sectionClass}>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300 font-black mb-4">Descripcion</p>
                        <label className={labelClass}>Descripcion / logros destacados</label>
                        <textarea
                            value={data.description || ""}
                            onChange={(e) => setData({ ...data, description: e.target.value })}
                            className={`${inputClass} min-h-[110px] resize-y`}
                            placeholder="Resume lo validado por esta certificacion."
                        />
                        <p className="text-[10px] text-slate-300/70 mt-3">
                            El icono y color de la tarjeta se asignan automaticamente segun la categoria elegida.
                        </p>
                    </section>

                    <section className="rounded-2xl border border-cyan-400/20 bg-cyan-500/[0.06] p-4 md:p-5">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-200 font-black">Credencial digital</p>
                            {data.credentialUrl && (
                                <a
                                    href={data.credentialUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] uppercase tracking-[0.15em] text-cyan-100 hover:text-white font-black inline-flex items-center gap-2"
                                >
                                    <FaSearchPlus /> Ver archivo actual
                                </a>
                            )}
                        </div>

                        <p className="text-[11px] text-amber-100/90 mb-4">
                            Debes subir archivo (PDF, imagen o video) o pegar enlace para habilitar &quot;Ver certificado&quot; en Sobre mi.
                        </p>

                        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-4">
                            <label className={`cursor-pointer block ${uploading ? "pointer-events-none opacity-80" : ""}`}>
                                <div className="rounded-2xl border-2 border-dashed border-cyan-300/30 hover:border-cyan-200/70 bg-[#0b1c36] hover:bg-[#102447] min-h-[130px] px-6 py-6 flex items-center justify-center transition-colors">
                                    <div className="text-center">
                                        <div className="mx-auto w-11 h-11 rounded-full bg-cyan-400/15 border border-cyan-300/40 grid place-items-center mb-3">
                                            {uploading ? <FaSpinner className="text-cyan-200 animate-spin" /> : <FaFileUpload className="text-cyan-200" />}
                                        </div>
                                        <p className="text-white font-black text-xs uppercase tracking-[0.14em]">
                                            {uploading ? "Subiendo..." : data.credentialUrl ? "Reemplazar archivo" : "Subir certificado"}
                                        </p>
                                        <p className="text-cyan-200/80 text-[11px] mt-1">PDF, JPG, PNG o MP4</p>
                                    </div>
                                </div>
                                <input type="file" accept=".pdf,image/*,video/*" onChange={handleFileUpload} className="hidden" />
                            </label>

                            <div className="space-y-3">
                                <div>
                                    <label className={labelClass}>Enlace de credencial</label>
                                    <input
                                        value={data.credentialUrl || ""}
                                        onChange={(e) => setData({ ...data, credentialUrl: e.target.value })}
                                        className={inputClass}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="rounded-xl border border-white/10 bg-[#0c1a34] px-4 py-3 flex items-center justify-between gap-3">
                                    <div className="text-xs text-white/80 truncate">
                                        {data.credentialUrl ? "Archivo vinculado correctamente" : "Sin archivo vinculado"}
                                    </div>
                                    {data.credentialUrl && <FaAward className="text-emerald-300 shrink-0" />}
                                </div>

                                {data.credentialUrl && (
                                    <button
                                        onClick={removeFile}
                                        className="w-full py-3 rounded-xl border border-red-400/30 bg-red-500/10 hover:bg-red-500/20 text-red-200 text-xs font-black uppercase tracking-widest transition-colors inline-flex items-center justify-center gap-2"
                                    >
                                        <FaTrashAlt /> Quitar archivo
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                <div className="px-5 md:px-8 py-4 md:py-5 border-t border-cyan-300/15 bg-[#0a152b]/95">
                    <div className="flex flex-col md:flex-row gap-3">
                        <button
                            onClick={() => {
                                if (!data.title || !data.issuer || !data.date) {
                                    alert("Por favor completa los campos principales.");
                                    return;
                                }
                                if (!data.credentialUrl) {
                                    alert("Debes subir o pegar el enlace del certificado para publicarlo.");
                                    return;
                                }
                                const visual = resolveVisualPreset(data.level, data.badge);
                                onSave({
                                    ...data,
                                    icon: visual.icon,
                                    color: visual.color,
                                });
                            }}
                            className="flex-1 py-3.5 rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-300 hover:to-sky-400 text-[#021122] font-black uppercase text-xs tracking-[0.2em] inline-flex items-center justify-center gap-3 shadow-[0_12px_34px_rgba(56,189,248,0.35)] transition-colors"
                        >
                            <FaSave /> Guardar certificacion
                        </button>
                        <button
                            onClick={onClose}
                            className="md:min-w-[170px] py-3.5 px-8 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-black uppercase tracking-widest transition-colors"
                        >
                            Descartar
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

