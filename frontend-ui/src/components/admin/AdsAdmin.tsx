"use client";

import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaToggleOn, FaToggleOff, FaImage, FaLink, FaAd, FaVideo, FaPhotoVideo, FaSpinner } from "react-icons/fa";
import API_BASE from "@/lib/apiBase";
import { adminFetch } from "@/lib/adminFetch";

interface MediaItem {
    type: 'image' | 'video';
    url: string;
}

interface Ad {
    id: number;
    title: string;
    media: string; // JSON string from DB
    redirect_url?: string;
    is_active: boolean;
    position: string;
}

export default function AdsAdmin() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    // Form State
    const [editingAd, setEditingAd] = useState<Ad | null>(null);
    const [title, setTitle] = useState("");
    const [redirectUrl, setRedirectUrl] = useState("");
    const [position, setPosition] = useState("login_hero");

    // Media State
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchAds();
    }, []);

    const fetchAds = async () => {
        try {
            const res = await adminFetch(`${API_BASE}/api/ads/`);
            if (res.ok) {
                const data = await res.json();
                setAds(data);
            }
        } catch (error) {
            console.error("Error fetching ads:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await adminFetch(`${API_BASE}/api/upload`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Error uploading file");

            const data = await res.json();
            const type = file.type.startsWith("video") ? "video" : "image";

            setMediaItems([...mediaItems, { type, url: data.url }]);
        } catch (error) {
            console.error("Error uploading:", error);
            alert("Error al subir el archivo");
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = "";
        }
    };

    const removeMediaItem = (index: number) => {
        setMediaItems(mediaItems.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mediaItems.length === 0 || !title) {
            alert("Debes agregar al menos un archivo multimedia y un título");
            return;
        }

        try {
            const url = editingAd
                ? `${API_BASE}/api/ads/${editingAd.id}`
                : `${API_BASE}/api/ads/`;

            const method = editingAd ? "PATCH" : "POST";

            const adRes = await adminFetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    media: mediaItems,
                    redirect_url: redirectUrl,
                    position,
                    is_active: editingAd ? editingAd.is_active : true
                }),
            });

            if (adRes.ok) {
                fetchAds();
                setShowForm(false);
                setEditingAd(null);
                setTitle("");
                setRedirectUrl("");
                setMediaItems([]);
            } else {
                alert("Error al guardar el anuncio");
            }
        } catch (error) {
            console.error("Error saving ad:", error);
        }
    };

    const handleEdit = (ad: Ad) => {
        setEditingAd(ad);
        setTitle(ad.title);
        setRedirectUrl(ad.redirect_url || "");
        setPosition(ad.position);
        try {
            setMediaItems(JSON.parse(ad.media));
        } catch {
            setMediaItems([]);
        }
        setShowForm(true);
    };

    const cancelEdit = () => {
        setEditingAd(null);
        setTitle("");
        setRedirectUrl("");
        setMediaItems([]);
        setShowForm(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Eliminar este anuncio?")) return;
        try {
            await adminFetch(`${API_BASE}/api/ads/${id}`, { method: "DELETE" });
            fetchAds();
        } catch (error) {
            console.error("Error deleting ad:", error);
        }
    };

    const toggleActive = async (ad: Ad) => {
        try {
            await adminFetch(`${API_BASE}/api/ads/${ad.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: !ad.is_active }),
            });
            fetchAds();
        } catch (error) {
            console.error("Error updating ad:", error);
        }
    };

    const getFirstMediaUrl = (mediaJson: string) => {
        try {
            const items: MediaItem[] = JSON.parse(mediaJson);
            return items.length > 0 ? items[0] : null;
        } catch {
            return null;
        }
    };

    return (
        <div className="space-y-0 animate-in fade-in duration-1000 font-sans selection:bg-sky-500/30">
            {/* Stealth Header - Obsidian & Azure */}
            <div className="bg-[#050505] border-b border-sky-950/30 p-12 relative overflow-hidden shadow-2xl">
                {/* Elite Cyan Aura */}
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-600/5 blur-[120px] pointer-events-none" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sky-900/5 blur-[100px] pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
                    <div>
                        <div className="flex items-center gap-6 mb-4">
                            <div className="w-1.5 h-12 bg-sky-600 shadow-[0_0_20px_rgba(14,165,233,0.4)]" />
                            <h2 className="text-5xl font-extrabold text-white tracking-tighter leading-none flex flex-col">
                                <span className="text-xs font-bold text-sky-500/60 tracking-[0.4em] mb-3 uppercase">Administrative Core</span>
                                <span className="uppercase">Gestión de <span className="text-sky-600">Publicidad</span></span>
                            </h2>
                        </div>
                    </div>

                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="group relative bg-sky-700 hover:bg-sky-600 text-white px-10 py-4 font-bold uppercase text-[11px] tracking-widest transition-all duration-300 border border-sky-500/20 shadow-[0_10px_30px_rgba(14,165,233,0.15)] active:scale-95 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                <FaPlus className="text-sm group-hover:rotate-90 transition-transform duration-300" /> Nuevo Anuncio
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </button>
                    )}
                </div>
            </div>

            {/* STEALTH FORM - Obsidian Luxe */}
            {showForm && (
                <div className="bg-[#080808] border-b border-white/5 p-12 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] animate-in slide-in-from-top-10 duration-700">
                    <div className="flex justify-between items-start mb-16">
                        <div>
                            <h3 className="text-3xl font-extrabold text-white tracking-tighter flex items-center gap-5 mb-4 uppercase">
                                <FaAd className="text-sky-600" /> {editingAd ? "Modificar Anuncio" : "Nueva Campaña"}
                            </h3>
                            <div className="h-0.5 w-20 bg-sky-600/50" />
                        </div>
                        <button onClick={cancelEdit} className="text-slate-600 hover:text-sky-500 transition-colors uppercase text-[11px] font-bold tracking-[0.3em] flex items-center gap-3 group">
                            <span className="text-xl group-hover:scale-125 transition-transform">×</span> Cancelar Operación
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                        <div className="space-y-12">
                            <div className="group/field">
                                <label className="block text-[11px] uppercase text-slate-500 font-bold tracking-[0.2em] mb-4 group-focus-within/field:text-sky-500 transition-colors">Título Descriptivo</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-[#030303] border border-white/5 p-5 text-white focus:border-sky-600/50 focus:bg-[#0a0a0a] outline-none font-medium transition-all placeholder:text-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                                    placeholder="Ingrese el título del anuncio..."
                                />
                            </div>
                            <div className="group/field">
                                <label className="block text-[11px] uppercase text-slate-500 font-bold tracking-[0.2em] mb-4 group-focus-within/field:text-sky-500 transition-colors">Enlace de Acción (URL)</label>
                                <div className="relative">
                                    <FaLink className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within/field:text-sky-600 transition-colors" />
                                    <input
                                        type="url"
                                        value={redirectUrl}
                                        onChange={(e) => setRedirectUrl(e.target.value)}
                                        className="w-full bg-[#030303] border border-white/5 p-5 pl-16 text-white focus:border-sky-600/50 focus:bg-[#0a0a0a] outline-none font-medium transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                                        placeholder="https://ejemplo.com/campaña"
                                    />
                                </div>
                            </div>
                            <div className="group/field">
                                <label className="block text-[11px] uppercase text-slate-500 font-bold tracking-[0.2em] mb-4 group-focus-within/field:text-sky-500 transition-colors">Posicionamiento en UI</label>
                                <div className="relative">
                                    <select
                                        value={position}
                                        onChange={(e) => setPosition(e.target.value)}
                                        className="w-full bg-[#030303] border border-white/5 p-5 text-white focus:border-sky-600/50 outline-none font-bold transition-all appearance-none cursor-pointer uppercase tracking-widest text-xs shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                                    >
                                        <option value="login_hero">Hero Carousel (Login)</option>
                                        <option value="login_sidebar">Barra Lateral (Login)</option>
                                        <option value="dashboard_banner">Banner Principal (Panel)</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-sky-600/50 text-xs">▼</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-12">
                            <label className="block text-[11px] uppercase text-slate-500 font-bold tracking-[0.2em]">Carga de Activos Multimedia</label>

                            <div className="border border-white/5 bg-[#030303] p-12 hover:border-sky-600/30 hover:bg-[#0a0a0a] transition-all text-center relative group shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                {uploading ? (
                                    <div className="flex flex-col items-center py-6">
                                        <FaSpinner className="animate-spin text-sky-600 text-5xl mb-6" />
                                        <span className="text-sky-500 font-bold text-[10px] uppercase tracking-[0.3em] animate-pulse">Procesando Archivos...</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-slate-700 group-hover:text-sky-500/80 py-6 transition-all duration-500">
                                        <FaPhotoVideo className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-500" />
                                        <span className="text-[11px] font-bold uppercase tracking-[0.3em]">Arrastrar o Seleccionar Multimedia</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-4 gap-5">
                                {mediaItems.map((item, idx) => (
                                    <div key={idx} className="relative aspect-square bg-black border border-white/5 group/item overflow-hidden shadow-2xl">
                                        {item.type === 'video' ? (
                                            <video src={item.url} className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={item.url} alt="preview" className="w-full h-full object-cover filter brightness-[0.6] group-hover/item:brightness-100 transition-all duration-500" />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeMediaItem(idx)}
                                            className="absolute inset-0 bg-sky-950/90 text-sky-500 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center font-black text-[10px] tracking-tighter uppercase"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={uploading || mediaItems.length === 0}
                                className="w-full relative group bg-[#0f0f0f] hover:bg-black text-white py-6 uppercase text-[11px] font-bold tracking-[0.4em] transition-all border border-white/5 hover:border-sky-600/50 shadow-2xl disabled:opacity-20 active:scale-[0.99] overflow-hidden"
                            >
                                <span className="relative z-10">{editingAd ? "Guardar Cambios" : "Lanzar Campaña Ahora"}</span>
                                <div className="absolute inset-0 bg-sky-600/5 group-hover:bg-sky-600/10 transition-colors" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* STEALTH GRID - Obsidian Monolith */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-white/5 bg-[#020202]">

                {loading && (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center text-center">
                        <FaSpinner className="animate-spin text-sky-600 text-6xl mb-6" />
                        <p className="text-white font-bold uppercase tracking-[0.3em] animate-pulse">Cargando Sistema Publicitario...</p>
                    </div>
                )}

                {!loading && ads.map((ad) => {
                    const firstMedia = getFirstMediaUrl(ad.media);
                    return (
                        <div key={ad.id} className="group relative bg-[#050505] border-r border-b border-white/5 flex flex-col transition-all duration-300 hover:z-20 hover:shadow-[inset_0_0_0_1px_rgba(56,189,248,0.6),0_0_20px_rgba(56,189,248,0.1)]">
                            {/* Media Section - Stealth Precision */}
                            <div className="relative h-64 overflow-hidden bg-black shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
                                {firstMedia ? (
                                    firstMedia.type === 'video' ? (
                                        <video src={firstMedia.url} autoPlay muted loop className={`w-full h-full object-cover filter contrast-[1.2] brightness-[0.5] group-hover:brightness-[1.1] group-hover:scale-105 transition-all duration-500 ${!ad.is_active && 'grayscale opacity-10'}`} />
                                    ) : (
                                        <img src={firstMedia.url} alt={ad.title} className={`w-full h-full object-cover filter contrast-[1.2] brightness-[0.5] group-hover:brightness-[1.1] group-hover:scale-105 transition-all duration-500 ${!ad.is_active && 'grayscale opacity-10'}`} />
                                    )
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/[0.03] bg-[#050505]">
                                        <FaAd className="text-[120px]" />
                                    </div>
                                )}

                                {/* Status Headers - Stealth Azure */}
                                <div className="absolute top-0 right-0 p-6 flex flex-col items-end gap-3 pointer-events-none">
                                    <div className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] leading-none border transition-all duration-500 ${ad.is_active ? 'bg-sky-950/80 border-sky-600 text-white shadow-[0_0_10px_rgba(14,165,233,0.4)]' : 'bg-slate-900/60 border-white/10 text-slate-400'}`}>
                                        {ad.is_active ? 'Estatus: Activo' : 'Estatus: Pausado'}
                                    </div>
                                    <div className="px-3 py-1 bg-black/80 text-[9px] font-bold text-slate-300 border border-white/10 uppercase tracking-widest">
                                        ID: {ad.position}
                                    </div>
                                </div>
                            </div>

                            {/* Content Section - Obsidian Matte */}
                            <div className="p-10 flex flex-col flex-grow relative shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
                                <h4 className="font-extrabold text-2xl text-white tracking-tighter mb-10 line-clamp-1 group-hover:text-sky-400 transition-colors duration-300 leading-tight uppercase drop-shadow-md">
                                    {ad.title}
                                </h4>

                                <div className="mt-auto space-y-10">
                                    <div className="grid grid-cols-2">
                                        <button
                                            onClick={() => handleEdit(ad)}
                                            className="bg-black hover:bg-sky-950/30 text-slate-400 hover:text-sky-400 font-bold py-4 text-[11px] uppercase tracking-[0.3em] transition-all border border-white/5 group/btn"
                                        >
                                            <span className="relative z-10">Editar</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(ad.id)}
                                            className="bg-black hover:bg-sky-900 text-slate-600 hover:text-white font-bold py-4 text-[11px] uppercase tracking-[0.3em] transition-all border border-l-0 border-white/5"
                                        >
                                            Eliminar
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-white/5 pt-8">
                                        <button
                                            onClick={() => toggleActive(ad)}
                                            className={`flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-500 ${ad.is_active ? 'text-slate-400 hover:text-sky-500' : 'text-slate-700 hover:text-white'
                                                }`}
                                        >
                                            {ad.is_active ? <><FaToggleOn size={26} className="text-sky-600 drop-shadow-[0_0_5px_rgba(14,165,233,0.5)]" /> Desactivar</> : <><FaToggleOff size={26} /> Activar</>}
                                        </button>

                                        {ad.redirect_url && (
                                            <a
                                                href={ad.redirect_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-12 h-12 flex items-center justify-center bg-transparent hover:bg-sky-950/20 border border-white/5 text-slate-700 hover:text-sky-500 transition-all duration-500 group/link"
                                                title="Visitar URL de Destino"
                                            >
                                                <FaLink size={16} className="group-hover/link:rotate-12 transition-transform" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {!loading && ads.length === 0 && (
                    <div className="col-span-full py-64 text-center bg-[#020202] border-r border-b border-white/5">
                        <FaAd className="text-[180px] mx-auto mb-10 text-white/[0.05]" />
                        <p className="text-white font-extrabold uppercase tracking-[1.5em] text-3xl">Búffer Vacío</p>
                        <p className="text-slate-500 mt-4 text-sm font-mono">No hay campañas activas. Inicia una nueva creación.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
