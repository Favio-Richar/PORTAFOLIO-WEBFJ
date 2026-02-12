"use client";

import { useState, useEffect } from "react";
import { FaImages, FaPlus, FaTrash, FaPlayCircle, FaImage, FaUpload, FaChevronRight, FaRegObjectGroup } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface MediaItem {
    id?: number;
    title: string;
    description: string;
    type: "image" | "video";
    url: string;
    order_index: number;
    active: boolean;
}

export default function MediaAdmin() {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [showAdd, setShowAdd] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [newItem, setNewItem] = useState<MediaItem>({
        title: "",
        description: "",
        type: "image",
        url: "",
        order_index: 0,
        active: true
    });

    const fetchMedia = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/media");
            if (res.ok) {
                const data = await res.json();
                setMediaItems(data.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)));
            }
        } catch (error) {
            console.error("Error loading media:", error);
        }
    };

    useEffect(() => {
        fetchMedia();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("http://localhost:8000/api/upload", {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setNewItem({
                    ...newItem,
                    url: data.url,
                    type: file.type.startsWith("video/") ? "video" : "image",
                    title: file.name.split(".")[0]
                });
            } else {
                alert("Error al subir archivo");
            }
        } catch (error) {
            alert("Error de conexión al subir");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if (!newItem.url) return alert("La URL es obligatoria");
        try {
            const res = await fetch("http://localhost:8000/api/media", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newItem)
            });
            if (res.ok) {
                setShowAdd(false);
                setNewItem({ title: "", description: "", type: "image", url: "", order_index: 0, active: true });
                fetchMedia();
            }
        } catch (error) {
            alert("Error al guardar");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Eliminar este elemento?")) return;
        try {
            const res = await fetch(`http://localhost:8000/api/media/${id}`, {
                method: "DELETE"
            });
            if (res.ok) fetchMedia();
        } catch (error) {
            alert("Error al eliminar");
        }
    };

    const photoItems = (mediaItems || []).filter(m => m.type === 'image');
    const videoItems = (mediaItems || []).filter(m => m.type === 'video');

    return (
        <div className="space-y-12 pb-20">
            {/* --- HEADER SaaS SECTION --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-[#0a0f1d] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent pointer-events-none" />
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-4 text-blue-500 font-black uppercase tracking-[0.4em] text-[10px]">
                        <FaRegObjectGroup />
                        <span>Gestión de Activos Elite</span>
                    </div>
                    <h3 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">
                        Pasarela <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Multimedia</span>
                    </h3>
                    <div className="flex gap-6 pt-2">
                        <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex flex-col gap-1">
                            <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Fotos cargadas</span>
                            <div className="flex items-end gap-2">
                                <span className={`text-2xl font-black ${photoItems.length >= 5 ? 'text-emerald-400' : 'text-blue-500'}`}>{photoItems.length}</span>
                                <span className="text-white/20 font-bold mb-1">/ 5</span>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex flex-col gap-1">
                            <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Videos activos</span>
                            <div className="flex items-end gap-2">
                                <span className={`text-2xl font-black ${videoItems.length >= 5 ? 'text-emerald-400' : 'text-blue-500'}`}>{videoItems.length}</span>
                                <span className="text-white/20 font-bold mb-1">/ 5</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    {(photoItems.length < 5 || videoItems.length < 5) && (
                        <button
                            onClick={() => setShowAdd(!showAdd)}
                            className={`group relative overflow-hidden px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all duration-500 ${showAdd
                                    ? "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                                    : "bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_50px_rgba(37,99,235,0.5)] hover:-translate-y-1"
                                }`}
                        >
                            <span className="flex items-center gap-3 relative z-10">
                                {showAdd ? <FaPlus className="rotate-45" /> : <FaPlus />}
                                {showAdd ? "Cerrar Panel" : "Añadir Nuevo Activo"}
                            </span>
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showAdd && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                        className="glass-card-pro p-1 bg-[#0a0f1d] rounded-[3rem] border border-blue-500/20 shadow-2xl overflow-hidden"
                    >
                        <div className="grid lg:grid-cols-2">
                            {/* Drop Zone */}
                            <div className="p-10 bg-white/5 border-r border-white/5 relative group">
                                <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black">1</div>
                                    <span className="text-white font-black uppercase tracking-widest text-[11px]">Subir Archivo de Origen</span>
                                </div>
                                <label className={`relative cursor-pointer h-56 rounded-[2rem] border-2 border-dashed border-white/10 hover:border-blue-500/50 transition-all flex flex-col items-center justify-center gap-4 bg-black/40 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div className="w-20 h-20 rounded-3xl bg-blue-600/10 flex items-center justify-center group-hover:bg-blue-600/20 transition-all">
                                        {isUploading ? <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent animate-spin rounded-full" /> : <FaUpload className="text-blue-500 text-3xl" />}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white font-black uppercase text-[11px] tracking-widest">{isUploading ? "Transfiriendo..." : "Seleccionar Multimedia"}</p>
                                        <p className="text-white/30 font-bold text-[9px] uppercase mt-1 tracking-widest">Soporta JPG, PNG, MP4</p>
                                    </div>
                                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*" />
                                </label>
                                {newItem.url && (
                                    <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] text-emerald-400 font-bold uppercase truncate">Asset ID: {newItem.url.split('/').pop()}</span>
                                    </div>
                                )}
                            </div>

                            {/* Info Form */}
                            <div className="p-10 space-y-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black">2</div>
                                    <span className="text-white font-black uppercase tracking-widest text-[11px]">Metadatos del Proyecto</span>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] ml-1">Título Descriptivo</label>
                                        <input
                                            value={newItem.title || ""}
                                            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                            className="w-full bg-black/60 border border-white/5 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-white/10"
                                            placeholder="Ej: Master Plan Digital v1.0"
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            onClick={handleSave}
                                            disabled={!newItem.url}
                                            className={`w-full py-6 rounded-2xl font-black uppercase text-xs tracking-[0.4em] flex items-center justify-center gap-4 transition-all duration-500 ${newItem.url
                                                    ? "bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-[0_15px_40px_rgba(37,99,235,0.2)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.4)] hover:-translate-y-1"
                                                    : "bg-white/5 text-white/20 grayscale cursor-not-allowed"
                                                }`}
                                        >
                                            Integrar a la Pasarela <FaChevronRight className="text-[10px]" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- GRID VIEW SaaS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {(mediaItems || []).map((item, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={item.id}
                        className="group bg-[#0a0f1d] rounded-[2rem] border border-white/5 hover:border-blue-500/40 transition-all duration-500 overflow-hidden shadow-xl"
                    >
                        <div className="aspect-video relative overflow-hidden bg-black/60">
                            {item.type === 'video' ? (
                                <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors" />
                                    <FaPlayCircle className="text-blue-500 text-5xl relative z-10 group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute bottom-3 right-3 text-[9px] font-black uppercase bg-blue-600 px-3 py-1 rounded-full text-white">Video</div>
                                </div>
                            ) : (
                                <>
                                    <img src={item.url} alt={item.title || ""} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                                    <div className="absolute bottom-3 right-3 text-[9px] font-black uppercase bg-emerald-600 px-3 py-1 rounded-full text-white">Imagen</div>
                                </>
                            )}

                            {/* Action Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <button
                                    onClick={() => item.id && handleDelete(item.id)}
                                    className="w-12 h-12 bg-red-500/20 border border-red-500/50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1 overflow-hidden">
                                    <h4 className="text-white font-black text-xs uppercase tracking-widest truncate">{item.title || "ASSET_UNNAMED"}</h4>
                                    <p className="text-white/20 font-mono text-[9px] truncate">{item.url}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {(mediaItems || []).length === 0 && !showAdd && (
                    <div className="col-span-full py-32 rounded-[3.5rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-4xl text-white/10">
                            <FaImages />
                        </div>
                        <div className="space-y-2">
                            <p className="text-white font-black uppercase tracking-[0.3em] text-[11px]">Repositorio Vacio</p>
                            <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">No hay activos vinculados a la pasarela</p>
                        </div>
                        <button onClick={() => setShowAdd(true)} className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all">
                            Iniciar Carga de Activos
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
