"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaProjectDiagram, FaSave, FaPlusCircle, FaEdit, FaTrashAlt,
    FaTimes, FaFileUpload, FaPlayCircle, FaSpinner, FaExternalLinkAlt,
    FaGithub, FaSearchPlus, FaCube, FaCode, FaImages, FaLink,
    FaCalendarAlt, FaBuilding
} from "react-icons/fa";

export interface MediaItem {
    type: 'image' | 'video';
    url: string;
}

export interface Project {
    id: string;
    title: string;
    category: string;
    status: string;
    version: string;
    description: string;
    image_url: string;
    video_url?: string;
    media: MediaItem[];
    demo_url: string;
    repo_url: string;
    stack: string[];
    deployment_date?: string;
    client_name?: string;
}

interface Props {
    projects: Project[];
    onSave: (data: Project[]) => void;
}

export default function ProjectsAdmin({ projects: initialProjects, onSave }: Props) {
    const [projects, setProjects] = useState(initialProjects);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Project | null>(null);

    useEffect(() => {
        setProjects(initialProjects);
    }, [initialProjects]);

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
            id: `proj-new-${Date.now()}`,
            title: "",
            category: "Desarrollo de Software",
            status: "En Desarrollo",
            version: "v1.0",
            description: "",
            image_url: "",
            video_url: "",
            media: [],
            demo_url: "",
            repo_url: "",
            stack: [],
            deployment_date: new Date().toISOString().split('T')[0],
            client_name: "",
        });
        setModalOpen(true);
    };

    const handleEdit = (proj: Project) => {
        setEditing(proj);
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar este proyecto y todos sus archivos asociados?")) return;
        try {
            const itemToDelete = projects.find(p => p.id === id);
            if (itemToDelete?.media) {
                for (const m of itemToDelete.media) {
                    await deletePhysicalFile(m.url);
                }
            }

            const res = await fetch(`http://localhost:8000/api/proyectos/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Error en servidor");

            const response = await fetch("http://localhost:8000/api/proyectos");
            const data = await response.json();
            const mappedData = data.map((p: any) => ({
                ...p,
                id: p.id.toString(),
                media: typeof p.media === 'string' ? JSON.parse(p.media) : (p.media || []),
                stack: typeof p.stack === 'string' ? JSON.parse(p.stack) : p.stack
            }));
            setProjects(mappedData);
            onSave(mappedData);
        } catch (error) {
            alert("Error al eliminar proyecto");
        }
    };

    const handleSaveItem = async (item: Project) => {
        try {
            const isNew = item.id.startsWith('proj-new-');
            const payload = {
                ...item,
                media: JSON.stringify(item.media),
                stack: JSON.stringify(item.stack)
            };
            // @ts-ignore
            delete payload.id;

            const endpoint = isNew ? "http://localhost:8000/api/proyectos" : `http://localhost:8000/api/proyectos/${item.id}`;
            const method = isNew ? "POST" : "PUT";

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Error al guardar");

            const response = await fetch("http://localhost:8000/api/proyectos");
            const data = await response.json();
            const mappedData = data.map((p: any) => ({
                ...p,
                id: p.id.toString(),
                media: typeof p.media === 'string' ? JSON.parse(p.media) : (p.media || []),
                stack: typeof p.stack === 'string' ? JSON.parse(p.stack) : p.stack
            }));
            setProjects(mappedData);
            onSave(mappedData);
            setModalOpen(false);
            setEditing(null);
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-center">
                <h3 className="title-fire text-4xl font-black uppercase tracking-tighter flex items-center gap-4">
                    <FaProjectDiagram className="text-cyan-500 animate-pulse" /> Proyectos
                </h3>
                <button onClick={handleAdd} className="px-10 py-5 rounded-full btn-primary btn-alive btn-shimmer flex items-center gap-3 text-xs font-black uppercase shadow-xl shadow-cyan-500/10">
                    <FaPlusCircle /> Nuevo Proyecto
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {projects.map((proj) => (
                    <motion.div
                        key={proj.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card-pro border border-white/5 rounded-[3.5rem] overflow-hidden group hover:border-cyan-500/30 transition-all"
                    >
                        <div className="relative h-48 bg-black/40">
                            {proj.image_url ? (
                                <img src={proj.image_url} alt={proj.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/10 uppercase font-black text-2xl tracking-[0.2em]">Sin Imagen</div>
                            )}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button onClick={() => handleEdit(proj)} className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md text-white/50 hover:text-cyan-400 transition-all flex items-center justify-center border border-white/10"><FaEdit /></button>
                                <button onClick={() => handleDelete(proj.id)} className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md text-white/50 hover:text-red-500 transition-all flex items-center justify-center border border-white/10"><FaTrashAlt /></button>
                            </div>
                            <div className="absolute bottom-4 left-6 flex gap-2">
                                <span className="px-4 py-1.5 bg-cyan-500 text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                    {proj.category}
                                </span>
                                <span className="px-4 py-1.5 bg-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-2">
                                    <FaImages size={8} /> {proj.media?.length || 0}
                                </span>
                            </div>
                        </div>
                        <div className="p-8 space-y-4">
                            <div className="flex justify-between items-start">
                                <h4 className="text-xl font-black text-white uppercase tracking-tighter leading-tight line-clamp-1">{proj.title}</h4>
                                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{proj.version}</span>
                            </div>
                            <p className="text-white/40 text-[11px] leading-relaxed line-clamp-2 italic border-l-2 border-white/5 pl-4">
                                {proj.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {proj.stack.slice(0, 5).map((s, i) => (
                                    <span key={i} className="px-2 py-1 bg-white/5 border border-white/5 rounded-lg text-[8px] font-black text-white/30 uppercase tracking-widest">{s}</span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {modalOpen && editing && (
                    <ProjectModal item={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSaveItem} />
                )}
            </AnimatePresence>
        </div>
    );
}

function ProjectModal({ item, onClose, onSave }: { item: Project, onClose: () => void, onSave: (item: Project) => void }) {
    // Robust initialization: ensure media is an array and stack is handled correctly
    const initialMedia = Array.isArray(item.media)
        ? item.media
        : (typeof item.media === 'string' ? JSON.parse(item.media as string) : []);

    const initialStack = Array.isArray(item.stack)
        ? item.stack
        : (typeof item.stack === 'string' ? JSON.parse(item.stack as string) : []);

    const [data, setData] = useState({
        ...item,
        media: initialMedia as MediaItem[],
        stack: initialStack as string[],
        stackInput: (initialStack as string[]).join(", ")
    });
    const [uploading, setUploading] = useState<"image" | "video" | null>(null);

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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(type);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("http://localhost:8000/api/upload", {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error("Upload failed");
            const result = await res.json();

            // Add to media gallery
            const newMediaItem: MediaItem = { type, url: result.url };
            const updatedMedia = [...(data.media || []), newMediaItem];

            // Si es el primer elemento, usarlo como portada
            let updateObj: any = { media: updatedMedia };
            if (!data.image_url && type === "image") updateObj.image_url = result.url;
            if (!data.video_url && type === "video") updateObj.video_url = result.url;

            setData({ ...data, ...updateObj });
        } catch (error) {
            alert("Error al subir archivo.");
        } finally {
            setUploading(null);
        }
    };

    const removeMediaItem = async (index: number) => {
        const itemToRemove = data.media[index];
        if (confirm("¿Borrar este archivo físicamente del servidor?")) {
            await deletePhysicalFile(itemToRemove.url);
            const updatedMedia = data.media.filter((_, i) => i !== index);

            // Si era la portada, buscar la siguiente imagen disponible
            let nextImageUrl = data.image_url;
            if (itemToRemove.url === data.image_url) {
                const nextImage = updatedMedia.find(m => m.type === 'image');
                nextImageUrl = nextImage ? nextImage.url : "";
            }

            let nextVideoUrl = data.video_url;
            if (itemToRemove.url === data.video_url) {
                const nextVideo = updatedMedia.find(m => m.type === 'video');
                nextVideoUrl = nextVideo ? nextVideo.url : "";
            }

            setData({ ...data, media: updatedMedia, image_url: nextImageUrl, video_url: nextVideoUrl });
        }
    };

    const setAsCover = (url: string, type: 'image' | 'video') => {
        if (type === 'image') setData({ ...data, image_url: url });
        if (type === 'video') setData({ ...data, video_url: url });
    };

    const prepareSave = () => {
        const stack = data.stackInput.split(",").map(s => s.trim()).filter(s => s !== "");
        const { stackInput, ...saveData } = data;
        onSave({ ...saveData, stack });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="max-w-6xl w-full bg-[#0a0a0c] border border-white/10 rounded-[4rem] shadow-4xl overflow-hidden flex flex-col max-h-[92vh]"
            >
                <div className="flex justify-between items-center p-10 border-b border-white/5 bg-cyan-500/5">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                        <FaProjectDiagram className="text-cyan-500 animate-pulse" /> {item.id.startsWith('proj-new-') ? 'Crear Nuevo Proyecto' : 'Configurar Sistema Multimedia'}
                    </h2>
                    <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/5 text-white/30 hover:text-white hover:bg-red-500/20 transition-all flex items-center justify-center text-xl">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
                    {/* BASICS */}
                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <label className="block text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Título del Proyecto</label>
                            <input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-white font-bold outline-none focus:border-cyan-500 transition-all focus:bg-white/10 text-lg"
                                placeholder="E.g. SmartRent+" />
                        </div>
                        <div className="space-y-4">
                            <label className="block text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Categoría</label>
                            <input value={data.category} onChange={(e) => setData({ ...data, category: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-white font-bold outline-none focus:border-cyan-500 transition-all focus:bg-white/10 text-lg"
                                placeholder="E.g. Plataforma Empresarial" />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        <div className="space-y-4">
                            <label className="block text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Estado</label>
                            <select value={data.status} onChange={(e) => setData({ ...data, status: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-white font-bold outline-none focus:border-cyan-500 transition-all appearance-none cursor-pointer">
                                <option value="En Producción">En Producción</option>
                                <option value="Producción Interna">Producción Interna</option>
                                <option value="En Desarrollo">En Desarrollo</option>
                                <option value="MVP / Beta">MVP / Beta</option>
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="block text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><FaBuilding /> Empresa / Cliente</label>
                            <input value={data.client_name || ""} onChange={(e) => setData({ ...data, client_name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-white font-bold outline-none focus:border-cyan-500 transition-all focus:bg-white/10"
                                placeholder="E.g. TechCorp Solutions" />
                        </div>
                        <div className="space-y-4">
                            <label className="block text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Build / Versión</label>
                            <input value={data.version} onChange={(e) => setData({ ...data, version: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-white font-bold outline-none focus:border-cyan-500 transition-all"
                                placeholder="E.g. v3.2" />
                        </div>
                    </div>

                    {/* DESCRIPTION FIELD */}
                    <div className="space-y-4">
                        <label className="block text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2 flex items-center gap-2">Descripción del Sistema</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData({ ...data, description: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-6 text-white font-medium outline-none focus:border-cyan-500 transition-all focus:bg-white/10 min-h-[150px] resize-none leading-relaxed"
                            placeholder="Describe la arquitectura y el impacto del sistema..."
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <label className="block text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><FaCode /> Stack Tecnológico (Separar por comas)</label>
                            <input value={data.stackInput} onChange={(e) => setData({ ...data, stackInput: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-8 py-6 text-cyan-500 font-mono text-xs outline-none focus:border-cyan-500 transition-all"
                                placeholder="React, FastAPI, PostgreSQL..." />
                        </div>
                        <div className="space-y-4">
                            <label className="block text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><FaCalendarAlt /> Fecha de Despliegue</label>
                            <input type="date" value={data.deployment_date || ""} onChange={(e) => setData({ ...data, deployment_date: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-white font-bold outline-none focus:border-cyan-500 transition-all appearance-none cursor-pointer" />
                        </div>
                    </div>

                    {/* ACCESOS */}
                    <div className="grid md:grid-cols-2 gap-10 pt-10 border-t border-white/5">
                        <div className="space-y-4">
                            <label className="block text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2 flex justify-between">
                                <span className="flex items-center gap-2"><FaExternalLinkAlt /> Enlace del Demo (En Vivo)</span>
                                {data.demo_url && data.demo_url !== "#" && (
                                    <button onClick={() => setData({ ...data, demo_url: "" })} className="text-red-500/50 hover:text-red-400 text-[8px] flex items-center gap-1 transition-colors font-black">LIMPIAR</button>
                                )}
                            </label>
                            <div className="relative">
                                <input value={data.demo_url === "#" ? "" : data.demo_url} onChange={(e) => setData({ ...data, demo_url: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-16 py-6 text-white font-bold outline-none focus:border-cyan-500 transition-all font-mono text-xs"
                                    placeholder="https://tu-proyecto.com" />
                                <FaLink className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="block text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2 flex justify-between">
                                <span className="flex items-center gap-2"><FaGithub /> Repositorio GitHub</span>
                                {data.repo_url && data.repo_url !== "#" && (
                                    <button onClick={() => setData({ ...data, repo_url: "" })} className="text-red-500/50 hover:text-red-400 text-[8px] flex items-center gap-1 transition-colors font-black">LIMPIAR</button>
                                )}
                            </label>
                            <div className="relative">
                                <input value={data.repo_url === "#" ? "" : data.repo_url} onChange={(e) => setData({ ...data, repo_url: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-16 py-6 text-white font-bold outline-none focus:border-cyan-500 transition-all font-mono text-xs"
                                    placeholder="https://github.com/usuario/proyecto" />
                                <FaGithub className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" />
                            </div>
                        </div>
                    </div>

                    {/* MULTIMEDIA GALLERY */}
                    <div className="pt-10 border-t border-white/5">
                        <div className="flex justify-between items-end mb-8 ml-2">
                            <div>
                                <label className="block text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em]">Galería Multimedia (Máx 10 activos)</label>
                                <p className="text-[9px] text-white/20 mt-1 uppercase font-bold tracking-widest italic">Selecciona la estrella ⭐ para definir portada o video principal.</p>
                            </div>
                            <div className="flex gap-4">
                                <label className={`cursor-pointer px-6 py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-[9px] font-black text-white hover:bg-cyan-500/20 transition-all flex items-center gap-2 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                    {uploading === "image" ? <FaSpinner className="animate-spin" /> : <FaFileUpload />} CARGAR IMAGEN
                                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} className="hidden" />
                                </label>
                                <label className={`cursor-pointer px-6 py-3 bg-blue-500/10 border border-blue-500/30 rounded-full text-[9px] font-black text-white hover:bg-blue-500/20 transition-all flex items-center gap-2 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                    {uploading === "video" ? <FaSpinner className="animate-spin" /> : <FaPlayCircle />} SUBIR VIDEO
                                    <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} className="hidden" />
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                            {data.media?.map((m, idx) => (
                                <motion.div key={idx} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative aspect-square rounded-3xl bg-black border border-white/5 overflow-hidden group">
                                    {m.type === 'image' ? (
                                        <img src={m.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-cyan-500/5">
                                            <FaPlayCircle className="text-3xl text-cyan-500" />
                                        </div>
                                    )}

                                    {/* Overlay Controls */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-center items-center gap-2">
                                        <button onClick={() => setAsCover(m.url, m.type)} className={`p-2 rounded-lg transition-all ${(m.type === 'image' && m.url === data.image_url) || (m.type === 'video' && m.url === data.video_url) ? 'bg-amber-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                                            ★
                                        </button>
                                        <button onClick={() => removeMediaItem(idx)} className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                            <FaTrashAlt />
                                        </button>
                                    </div>

                                    {/* Badge Status */}
                                    <div className="absolute top-2 left-2 flex gap-1">
                                        {m.type === 'image' && m.url === data.image_url && <span className="px-2 py-0.5 bg-cyan-500 text-black text-[7px] font-black uppercase rounded-full">PORTADA</span>}
                                        {m.type === 'video' && m.url === data.video_url && <span className="px-2 py-0.5 bg-blue-500 text-white text-[7px] font-black uppercase rounded-full">MASTER</span>}
                                    </div>
                                    <div className="absolute bottom-2 right-2 text-[7px] text-white/40 font-black uppercase tracking-widest">{m.type}</div>
                                </motion.div>
                            ))}
                            {(!data.media || data.media.length === 0) && (
                                <div className="col-span-full py-20 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center gap-4">
                                    <FaImages className="text-4xl text-white/5" />
                                    <span className="text-[10px] text-white/10 font-black uppercase tracking-widest italic text-center">Sin activos multimedia vinculados.<br />Empieza cargando una imagen o video.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-10 bg-cyan-500/5 border-t border-white/5 flex gap-6">
                    <button onClick={prepareSave} className="flex-1 py-7 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase text-sm tracking-[0.4em] rounded-[2rem] transition-all active:scale-95 shadow-2xl shadow-cyan-500/30 flex items-center justify-center gap-4">
                        <FaSave className="text-xl" /> ACTUALIZAR GALERÍA v2.0
                    </button>
                    <button onClick={onClose} className="px-16 py-7 bg-white/5 text-white/40 hover:text-white rounded-[2rem] transition-all border border-white/10 font-black uppercase text-xs tracking-widest">
                        ABORTAR
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
