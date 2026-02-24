"use client";

import { useState, useEffect } from "react";
import { FaImages, FaPlus, FaTrash, FaPlayCircle, FaImage, FaUpload, FaChevronRight, FaRegObjectGroup } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

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
                setNewItem((prev) => ({
                    ...prev,
                    url: data.url,
                    type: file.type.startsWith("video/") ? "video" : "image",
                    title: file.name.split(".")[0]
                }));
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
        <div className="space-y-16">
            {/* Consolidated Media Block with Elite Styling */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group/master"
            >
                <div className="absolute -inset-[1px] bg-gradient-to-b from-white/10 to-transparent rounded-none opacity-50 pointer-events-none" />
                <div className="relative glass-card-pro bg-[#0a1120]/90 rounded-none border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden">

                    {/* Block Header with Scanline and Metallic Look */}
                    <div className="px-10 md:px-14 py-10 border-b border-white/5 flex flex-col lg:flex-row justify-between items-center gap-10 bg-gradient-to-b from-white/[0.03] to-transparent relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent animate-shimmer" />

                        <div className="relative z-10 flex items-center gap-8">
                            <div className="w-16 h-16 rounded-none bg-gradient-to-br from-cyan-600/80 to-blue-500/80 p-[1px] shadow-[0_0_25px_rgba(6,182,212,0.2)] group-hover/master:shadow-[0_0_40px_rgba(6,182,212,0.4)] transition-all duration-1000">
                                <div className="w-full h-full rounded-[inherit] bg-[#070b14] flex items-center justify-center text-cyan-400">
                                    <FaRegObjectGroup className="text-2xl animate-spin-slow" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <span className="text-cyan-500 font-bold uppercase tracking-[0.6em] text-[12px] block ml-1">Asset Orchestration System</span>
                                <h3 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
                                    Pasarela <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-300 to-cyan-500">Multimedia</span>
                                </h3>
                            </div>
                        </div>

                        <div className="relative z-10 flex items-center gap-6">
                            <div className="flex gap-4">
                                <div className="group/stat bg-white/[0.02] border border-white/5 px-8 py-5 rounded-none flex flex-col gap-1 min-w-[140px] hover:border-emerald-500/30 transition-all duration-500">
                                    <span className="text-[9px] text-white/20 uppercase font-black tracking-[0.3em]">Still Imagery</span>
                                    <div className="flex items-end gap-2">
                                        <span className="text-2xl font-black text-emerald-400/90 leading-none">{photoItems.length}</span>
                                        <span className="text-white/5 font-mono text-[9px] mb-1">/ 05</span>
                                    </div>
                                </div>
                                <div className="group/stat bg-white/[0.02] border border-white/5 px-8 py-5 rounded-none flex flex-col gap-1 min-w-[140px] hover:border-blue-500/30 transition-all duration-500">
                                    <span className="text-[9px] text-white/20 uppercase font-black tracking-[0.3em]">Cinematics</span>
                                    <div className="flex items-end gap-2">
                                        <span className="text-2xl font-black text-blue-500/90 leading-none">{videoItems.length}</span>
                                        <span className="text-white/5 font-mono text-[9px] mb-1">/ 05</span>
                                    </div>
                                </div>
                            </div>

                            {(photoItems.length < 5 || videoItems.length < 5) && (
                                <button
                                    onClick={() => setShowAdd(!showAdd)}
                                    className={`relative group/btn px-12 py-7 rounded-none font-black uppercase text-[12px] tracking-[0.4em] transition-all duration-700 flex items-center gap-5 overflow-hidden ${showAdd
                                        ? "bg-white/5 text-white border border-white/10"
                                        : "bg-blue-600 text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:shadow-[0_25px_70px_rgba(37,99,235,0.5)] hover:-translate-y-1"
                                        }`}
                                >
                                    {!showAdd && <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-white/10 to-blue-600/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />}
                                    {showAdd ? <FaPlus className="rotate-45 text-red-400" /> : <FaPlus className="text-white/80 group-hover:scale-125 transition-transform" />}
                                    <span className="relative z-10">{showAdd ? "Close Uplink" : "Inject Asset"}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <AnimatePresence>
                        {showAdd && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden bg-[#070b14]/50 border-b border-white/5"
                            >
                                <div className="grid lg:grid-cols-2 p-4">
                                    <div className="p-10">
                                        <label className={`relative group/drop cursor-pointer h-72 rounded-none border border-white/5 hover:border-blue-500/30 transition-all duration-700 flex flex-col items-center justify-center gap-6 bg-black/40 overflow-hidden ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover/drop:opacity-100 transition-opacity" />

                                            {newItem.url && !isUploading ? (
                                                <>
                                                    {newItem.type === "video" ? (
                                                        <video
                                                            src={newItem.url}
                                                            className="absolute inset-0 w-full h-full object-cover"
                                                            autoPlay
                                                            muted
                                                            loop
                                                            playsInline
                                                            controls
                                                        />
                                                    ) : (
                                                        <Image
                                                            src={newItem.url}
                                                            alt={newItem.title || "Preview multimedia"}
                                                            fill
                                                            unoptimized
                                                            className="object-cover"
                                                        />
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                                                    <div className="absolute top-4 right-4 px-4 py-1 text-[9px] font-black uppercase tracking-[0.2em] border border-white/20 bg-black/50 text-white/90">
                                                        {newItem.type === "video" ? "Cinematic" : "Still"}
                                                    </div>
                                                    <div className="absolute left-4 right-4 bottom-4 text-center z-10">
                                                        <p className="text-white font-black uppercase text-[11px] tracking-[0.2em]">Preview Ready</p>
                                                        <p className="text-white/60 font-mono text-[9px] uppercase tracking-wider mt-1">
                                                            Click para reemplazar antes de autorizar
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-24 h-24 rounded-none bg-blue-600/5 border border-blue-500/10 flex items-center justify-center relative z-10 group-hover/drop:scale-110 group-hover/drop:border-blue-500/30 transition-all duration-700">
                                                        <FaUpload className="text-blue-500/60 text-4xl group-hover/drop:text-blue-400" />
                                                    </div>
                                                    <div className="text-center relative z-10 space-y-2">
                                                        <p className="text-white font-black uppercase text-[12px] tracking-[0.2em]">Inject Multimedia</p>
                                                        <p className="text-white/10 font-mono text-[9px] uppercase tracking-widest mt-1">Accepts: RAW_JPG • PNG • MP4_ELITE</p>
                                                    </div>
                                                </>
                                            )}

                                            {isUploading ? (
                                                <div className="absolute inset-0 z-20 bg-black/70 backdrop-blur-[1px] flex flex-col items-center justify-center gap-4">
                                                    <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent animate-spin rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
                                                    <p className="text-white/90 font-black uppercase text-[10px] tracking-[0.3em]">Syncing...</p>
                                                </div>
                                            ) : null}

                                            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*" />
                                        </label>
                                    </div>
                                    <div className="p-10 space-y-10 flex flex-col justify-center">
                                        <div className="space-y-4 group/input">
                                            <label className="text-[12px] font-black uppercase text-white/40 tracking-[0.4em] ml-2 group-focus-within/input:text-blue-400/50 transition-colors">Descriptor Protocol</label>
                                            <div className="relative">
                                                <input
                                                    value={newItem.title || ""}
                                                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                                    className="w-full bg-black/40 border border-white/5 rounded-none px-8 py-6 text-white font-bold outline-none focus:border-blue-500/30 transition-all duration-500 placeholder:text-white/5 text-[14px] shadow-inner"
                                                    placeholder="Assign meta title..."
                                                />
                                                <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleSave}
                                            disabled={!newItem.url}
                                            className={`group/save w-full py-7 rounded-none font-black uppercase text-[12px] tracking-[0.5em] flex items-center justify-center gap-6 transition-all duration-700 relative overflow-hidden ${newItem.url
                                                ? "bg-gradient-to-r from-blue-800 to-blue-700 text-white shadow-[0_25px_60px_rgba(37,99,235,0.2)] hover:shadow-[0_30px_80px_rgba(37,99,235,0.4)] hover:-translate-y-1"
                                                : "bg-white/5 text-white/5 grayscale cursor-not-allowed"
                                                }`}
                                        >
                                            {newItem.url && <div className="absolute inset-0 bg-white/5 animate-pulse" />}
                                            <span className="relative z-10">Authorize Integration</span>
                                            <FaChevronRight className="text-[10px] relative z-10 group-hover/save:translate-x-2 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Elite Grid Area */}
                    <div className="p-10 md:p-14">
                        {mediaItems.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-10">
                                {mediaItems.map((item, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={item.id}
                                        className="group relative bg-[#070b14] rounded-none border border-white/5 hover:border-blue-500/40 transition-all duration-700 overflow-hidden shadow-2xl flex flex-col"
                                    >
                                        <div className="aspect-[4/5] relative overflow-hidden bg-black/60">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700 z-10" />

                                            {item.type === 'video' ? (
                                                <div className="w-full h-full relative group/vid">
                                                    <video
                                                        src={item.url}
                                                        className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105"
                                                        muted
                                                        autoPlay
                                                        loop
                                                        playsInline
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover/vid:opacity-0 transition-opacity duration-700 z-20">
                                                        <div className="w-12 h-12 rounded-none bg-blue-500/20 backdrop-blur-md border border-blue-500/30 flex items-center justify-center">
                                                            <FaPlayCircle className="text-blue-500/80 text-xl" />
                                                        </div>
                                                    </div>
                                                    <div className="absolute top-4 right-4 text-[7px] font-black uppercase tracking-[0.2em] bg-blue-600 px-4 py-1.5 rounded-none text-white z-20 shadow-lg">Cinematic</div>
                                                </div>
                                            ) : (
                                                <>
                                                    <Image
                                                        src={item.url}
                                                        alt={item.title || "Elite Asset"}
                                                        fill
                                                        unoptimized
                                                        className="object-cover opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
                                                    />
                                                    <div className="absolute top-4 right-4 text-[7px] font-black uppercase tracking-[0.2em] bg-emerald-600 px-4 py-1.5 rounded-full text-white z-20 shadow-lg">Still</div>
                                                </>
                                            )}

                                            <div className="absolute inset-x-0 bottom-0 p-6 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700 flex flex-col gap-3 z-30">
                                                <button
                                                    onClick={() => item.id && handleDelete(item.id)}
                                                    className="w-full py-3 bg-red-500/10 backdrop-blur-xl border border-red-500/30 text-red-500 rounded-sm flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all font-black uppercase text-[8px] tracking-[0.2em]"
                                                >
                                                    <FaTrash className="text-xs" /> Purge Asset
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-6 flex-1 flex flex-col justify-center relative bg-gradient-to-b from-[#0a1120] to-[#070b14]">
                                            <div className="flex flex-col gap-1.5 overflow-hidden">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-none bg-blue-500/30" />
                                                    <h4 className="text-white font-black text-[10px] uppercase tracking-[0.2em] truncate group-hover:text-blue-400 transition-colors">{item.title || "ANONYMOUS_ACT"}</h4>
                                                </div>
                                                <div className="flex items-center gap-2 pl-3.5">
                                                    <span className="text-white/5 font-mono text-[7px] uppercase tracking-tighter">DATA:</span>
                                                    <p className="text-white/10 font-mono text-[7px] truncate tracking-tighter uppercase">{item.url.split('/').pop()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-32 rounded-none border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-center space-y-8 group/empty relative overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.05),transparent)] opacity-0 group-hover/empty:opacity-100 transition-opacity duration-1000" />
                                <div className="w-24 h-24 rounded-sm bg-white/[0.02] border border-white/5 flex items-center justify-center text-4xl text-white/5 group-hover/empty:scale-110 group-hover/empty:text-blue-500/20 transition-all duration-700 relative z-10">
                                    <FaImages />
                                </div>
                                <div className="space-y-2 relative z-10">
                                    <p className="text-white/50 font-black uppercase tracking-[0.5em] text-[11px]">System Repository Empty</p>
                                    <p className="text-white/10 text-[9px] font-bold uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">No multimedia nodes synchronized with current protocol.</p>
                                </div>
                                {!showAdd && (
                                    <button
                                        onClick={() => setShowAdd(true)}
                                        className="relative z-10 px-12 py-5 bg-white/5 border border-white/10 rounded-sm text-white/60 font-black uppercase text-[10px] tracking-[0.3em] hover:bg-white/10 hover:text-white transition-all duration-500 shadow-xl"
                                    >
                                        Initiate Handshake
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Elite Footer Status */}
                    <div className="px-14 py-8 bg-[#070b14]/80 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-none bg-blue-500/40 animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Protocol Capacity</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-0.5 w-12 bg-white/5 rounded-none overflow-hidden">
                                    <div className="h-full bg-blue-500/50" style={{ width: `${(mediaItems.length / 10) * 100}%` }} />
                                </div>
                                <span className="text-[8px] font-mono text-white/10 uppercase tracking-tighter">{mediaItems.length} / 10 NODES</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-white/5 font-mono text-[7px] tracking-widest uppercase overflow-hidden group/f">
                            <span className="group-hover/f:text-blue-500 transition-colors">CLUSTER_STATUS: STABLE</span>
                            <span className="group-hover/f:text-blue-500 transition-colors opacity-30">|</span>
                            <span className="group-hover/f:text-blue-500 transition-colors">OPTIMIZATION: MAX</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
