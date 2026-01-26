"use client";

import { useState, useEffect } from "react";
import {
    FaImage,
    FaVideo,
    FaSave,
    FaPlusCircle,
    FaSpinner,
    FaUserCircle,
    FaInfoCircle,
    FaCheckCircle,
    FaArrowRight,
    FaTrash
} from "react-icons/fa";
import type { ProfileData } from "@/lib/data/profile";

interface Props {
    profile: ProfileData;
    onSave: (data: ProfileData) => void;
}

export default function ProfileAdmin({ profile: initialProfile, onSave }: Props) {
    const [profile, setProfile] = useState(initialProfile);

    // Sincronizar estado interno cuando cambian los props del padre (ej: después de una carga/guardado)
    useEffect(() => {
        setProfile(initialProfile);
    }, [initialProfile]);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setUploadingImage(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("http://localhost:8000/api/upload", {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error("Upload failed");
            const result = await res.json();

            // Reemplazo: si existe imagen previa, borrarla del servidor
            if (profile.profileImage) {
                await deletePhysicalFile(profile.profileImage);
            }

            setProfile(prev => ({ ...prev, profileImage: result.url }));
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setVideoFile(file);
        setUploadingVideo(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("http://localhost:8000/api/upload", {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error("Upload failed");
            const result = await res.json();

            // Reemplazo: si existe video previo, borrarlo del servidor
            if (profile.profileVideo) {
                await deletePhysicalFile(profile.profileVideo);
            }

            setProfile(prev => ({ ...prev, profileVideo: result.url }));
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setUploadingVideo(false);
        }
    };

    const handleSave = async () => {
        setSaveStatus("saving");
        try {
            const response = await fetch("http://localhost:8000/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    full_name: profile.fullName,
                    title: profile.title,
                    profile_image: profile.profileImage,
                    profile_video: profile.profileVideo
                })
            });

            if (response.ok) {
                setSaveStatus("success");
                onSave(profile);
                setTimeout(() => setSaveStatus("idle"), 3000);
            } else {
                setSaveStatus("error");
                setTimeout(() => setSaveStatus("idle"), 3000);
            }
        } catch (error) {
            console.error("Error:", error);
            setSaveStatus("error");
            setTimeout(() => setSaveStatus("idle"), 3000);
        }
    };

    const handleDeleteImage = async () => {
        if (profile.profileImage) {
            await deletePhysicalFile(profile.profileImage);
            setProfile(prev => ({ ...prev, profileImage: "" }));
        }
    };

    const handleDeleteVideo = async () => {
        if (profile.profileVideo) {
            await deletePhysicalFile(profile.profileVideo);
            setProfile(prev => ({ ...prev, profileVideo: "" }));
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Header de Sección */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-10">
                <div>
                    <h3 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                        <FaUserCircle className="text-cyan-500" />
                        Perfil del Ingeniero
                    </h3>
                    <p className="text-gray-500 font-bold mt-2 text-sm uppercase tracking-widest">Configuración de identidad digital y presentación</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saveStatus === "saving"}
                    className={`px-12 py-5 rounded-full flex items-center gap-4 text-xs font-black uppercase transition-all duration-500 ${saveStatus === "success"
                        ? "bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                        : saveStatus === "error"
                            ? "bg-red-500 text-white"
                            : "btn-primary btn-alive btn-shimmer"
                        }`}
                >
                    {saveStatus === "saving" ? <FaSpinner className="animate-spin" /> : saveStatus === "success" ? <FaCheckCircle /> : <FaSave />}
                    {saveStatus === "saving" ? "Guardando..." : saveStatus === "success" ? "Guardado Correctamente" : saveStatus === "error" ? "Error al Guardar" : "Guardar Perfil v1.0"}
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
                {/* Columna Izquierda: Datos Básicos */}
                <div className="lg:col-span-2 space-y-10">
                    <section className="glass-card-pro p-12 border border-white/10 rounded-[3rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <FaInfoCircle className="text-8xl" />
                        </div>

                        <h4 className="text-cyan-400 text-xs font-black uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                            <FaArrowRight className="text-[8px]" /> Información de Identidad
                        </h4>

                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="block text-white/50 text-[10px] font-black uppercase tracking-widest ml-1">Nombre Completo</label>
                                <input
                                    value={profile.fullName}
                                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-cyan-500 focus:bg-white/10 transition-all shadow-inner"
                                    placeholder="Ej: Favio Jiménez"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="block text-white/50 text-[10px] font-black uppercase tracking-widest ml-1">Título Profesional</label>
                                <input
                                    value={profile.title}
                                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-cyan-500 focus:bg-white/10 transition-all shadow-inner"
                                    placeholder="Ej: Senior Software Architect"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Vídeo Sección */}
                    <section className="glass-card-pro p-12 border border-white/10 rounded-[3rem] space-y-8">
                        <h4 className="text-cyan-400 text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
                            <FaVideo className="text-lg" /> Presentación en Video
                        </h4>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="block text-white/70 text-xs font-bold font-mono tracking-tighter uppercase">Upload (Streaming 4D)</label>
                                    <label className={`cursor-pointer block ${uploadingVideo ? 'pointer-events-none opacity-50' : ''}`}>
                                        <div className="px-6 py-10 rounded-3xl glass-light border-2 border-dashed border-cyan-500/20 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all flex flex-col items-center justify-center gap-4 group">
                                            {uploadingVideo ? (
                                                <FaSpinner className="text-4xl text-cyan-500 animate-spin" />
                                            ) : (
                                                <FaPlusCircle className="text-4xl text-cyan-500/50 group-hover:text-cyan-500 group-hover:scale-110 transition-all" />
                                            )}
                                            <div className="text-center">
                                                <p className="text-white font-black text-xs uppercase tracking-widest">
                                                    {uploadingVideo ? "Procesando Stream..." : "Actualizar Video"}
                                                </p>
                                                <p className="text-white/30 text-[10px] mt-1 uppercase font-bold">MP4, WEBM (Max: 500MB)</p>
                                            </div>
                                        </div>
                                        <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                                    </label>

                                    {profile.profileVideo && (
                                        <button
                                            onClick={handleDeleteVideo}
                                            className="w-full mt-2 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 border border-red-500/20"
                                        >
                                            <FaTrash /> Eliminar Video Actual
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-white/70 text-xs font-bold font-mono tracking-tighter uppercase">External URI</label>
                                    <input
                                        value={profile.profileVideo}
                                        onChange={(e) => setProfile({ ...profile, profileVideo: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-cyan-500 font-mono text-xs outline-none focus:border-cyan-500 transition-all overflow-hidden text-ellipsis"
                                        placeholder="https://youtube.com/..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-white/30 text-[10px] font-black uppercase tracking-widest ml-1">Previsualización</label>
                                <div className="aspect-video bg-black rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center relative group">
                                    {profile.profileVideo ? (
                                        profile.profileVideo.includes('youtube') || profile.profileVideo.includes('vimeo') ? (
                                            <div className="text-white/20 text-center p-8">
                                                <FaVideo className="text-4xl mx-auto mb-4" />
                                                <p className="text-[10px] uppercase font-bold">Video Externo Configurado</p>
                                                <p className="text-[8px] opacity-50 break-all mt-2">{profile.profileVideo}</p>
                                            </div>
                                        ) : (
                                            <video
                                                key={profile.profileVideo}
                                                src={profile.profileVideo}
                                                className="w-full h-full object-cover"
                                                controls
                                            />
                                        )
                                    ) : (
                                        <div className="text-white/5 flex flex-col items-center">
                                            <FaVideo className="text-6xl" />
                                            <span className="text-[10px] mt-4 font-black uppercase tracking-tighter">Sin Video</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Columna Derecha: Imagen de Perfil */}
                <div className="space-y-8">
                    <section className="glass-card-pro p-10 border border-white/10 rounded-[3rem] sticky top-8">
                        <h4 className="text-cyan-400 text-xs font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                            <FaImage className="text-lg" /> Identidad Visual
                        </h4>

                        <div className="space-y-8">
                            <div className="relative group mx-auto w-full aspect-square max-w-[280px]">
                                <div className="absolute inset-0 bg-cyan-500/20 rounded-[3.5rem] blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-700" />
                                <div className="relative z-10 w-full h-full bg-black border border-white/10 rounded-[3.5rem] overflow-hidden group-hover:border-cyan-500/50 transition-all duration-700 shadow-4xl">
                                    {profile.profileImage ? (
                                        <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                                            <FaImage className="text-6xl text-white/5" />
                                        </div>
                                    )}
                                    {uploadingImage && (
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
                                            <FaSpinner className="text-4xl text-cyan-500 animate-spin" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className={`cursor-pointer block ${uploadingImage ? 'pointer-events-none' : ''}`}>
                                    <div className="px-6 py-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-white/10 transition-all flex items-center justify-center gap-3 group">
                                        <FaPlusCircle className="text-xl text-cyan-500/50 group-hover:text-cyan-500 transition-colors" />
                                        <span className="text-white font-black text-[10px] uppercase tracking-widest">Cambiar Imagen</span>
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </label>

                                {profile.profileImage && (
                                    <button
                                        onClick={handleDeleteImage}
                                        className="w-full py-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 border border-red-500/20"
                                    >
                                        <FaTrash /> Eliminar Foto Actual
                                    </button>
                                )}

                                <div className="space-y-3">
                                    <label className="block text-white/30 text-[10px] font-black uppercase tracking-widest ml-1">Direct Image URI</label>
                                    <input
                                        value={profile.profileImage}
                                        onChange={(e) => setProfile({ ...profile, profileImage: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-cyan-500/70 font-mono text-[10px] outline-none focus:border-cyan-500 transition-all overflow-hidden text-ellipsis"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
