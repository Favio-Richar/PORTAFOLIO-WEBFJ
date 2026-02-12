"use client";

import { useState, useEffect } from "react";
import {
    FaWhatsapp, FaFacebook, FaInstagram,
    FaTwitter, FaTiktok, FaGithub, FaLinkedin, FaEnvelope,
    FaLocationDot, FaVideo, FaImage, FaGlobe, FaUserGear
} from "react-icons/fa6";
import { FaSave, FaPhone } from "react-icons/fa";
import type { ContactData } from "@/lib/data/contact";
import MediaAdmin from "./MediaAdmin";
import { motion } from "framer-motion";

interface Props {
    contact: ContactData;
    onSave: (data: ContactData) => void;
}

export default function ContactAdmin({ contact: initialContact, onSave }: Props) {
    const [contact, setContact] = useState(initialContact);

    useEffect(() => {
        setContact(initialContact);
    }, [initialContact]);

    const handleSave = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(contact)
            });
            if (res.ok) {
                alert("Configuración de Contacto Actualizada ✅");
            }
        } catch (error) {
            alert("Error al sincronizar con el servidor");
        }
    };

    const inputClasses = "w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all placeholder:text-white/10 text-sm";
    const labelClasses = "text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-3 flex items-center gap-2 px-1";

    return (
        <div className="space-y-12 pb-20">
            {/* Header Pro */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-[#0a0f1d] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent pointer-events-none" />
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-4 text-blue-500 font-black uppercase tracking-[0.4em] text-[10px]">
                        <FaUserGear />
                        <span>Core Management System</span>
                    </div>
                    <h3 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">
                        Canales de <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Comunicación</span>
                    </h3>
                    <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest max-w-md leading-relaxed">
                        Control centralizado de identidades digitales, enlaces de contacto y activos de la pasarela hero.
                    </p>
                </div>

                <div className="relative z-10">
                    <button
                        onClick={handleSave}
                        className="group relative overflow-hidden px-10 py-5 rounded-2xl bg-blue-600 text-white font-black uppercase text-xs tracking-widest shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_50px_rgba(37,99,235,0.5)] transition-all duration-500 hover:-translate-y-1 flex items-center gap-3"
                    >
                        <FaSave className="text-sm group-hover:scale-110 transition-transform" />
                        Sincronizar Cambios
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-10">
                {/* Main Form Area */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Basic Info & Location */}
                    <div className="glass-card-pro p-10 bg-[#0a0f1d] rounded-[3rem] border border-white/5 shadow-2xl space-y-10">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                                <FaGlobe className="text-lg" />
                            </div>
                            <span className="text-white font-black uppercase tracking-widest text-xs">Identidad y Ubicación</span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className={labelClasses}><FaEnvelope className="text-blue-500/50" /> Punto de Contacto Email</label>
                                <input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })}
                                    className={inputClasses} placeholder="example@business.com" />
                            </div>
                            <div className="space-y-2">
                                <label className={labelClasses}><FaPhone className="text-blue-500/50" /> Línea Telefónica Directa</label>
                                <input value={contact.phone || ""} onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                                    className={inputClasses} placeholder="+00 0 0000 0000" />
                            </div>
                            <div className="space-y-2">
                                <label className={labelClasses}><FaWhatsapp className="text-emerald-500/50" /> Canal WhatsApp Business</label>
                                <input value={contact.whatsapp || ""} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                                    className={inputClasses} placeholder="+00 0 0000 0000" />
                            </div>
                            <div className="space-y-2">
                                <label className={labelClasses}><FaLocationDot className="text-red-500/50" /> Operación Geográfica</label>
                                <input value={contact.location || ""} onChange={(e) => setContact({ ...contact, location: e.target.value })}
                                    className={inputClasses} placeholder="Ciudad, País" />
                            </div>
                        </div>
                    </div>

                    {/* Social Infrastructure */}
                    <div className="glass-card-pro p-10 bg-[#0a0f1d] rounded-[3rem] border border-white/5 shadow-2xl space-y-10">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                            <div className="w-10 h-10 rounded-2xl bg-cyan-600/10 flex items-center justify-center text-cyan-500">
                                <FaGlobe className="text-lg" />
                            </div>
                            <span className="text-white font-black uppercase tracking-widest text-xs">Infraestructura Social</span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
                            <div className="space-y-2 group">
                                <label className={labelClasses}><FaLinkedin className="text-[#0077B5]" /> LinkedIn</label>
                                <input value={contact.linkedin || ""} onChange={(e) => setContact({ ...contact, linkedin: e.target.value })}
                                    className={inputClasses} placeholder="https://..." />
                            </div>
                            <div className="space-y-2 group">
                                <label className={labelClasses}><FaGithub className="text-white" /> GitHub</label>
                                <input value={contact.github || ""} onChange={(e) => setContact({ ...contact, github: e.target.value })}
                                    className={inputClasses} placeholder="https://..." />
                            </div>
                            <div className="space-y-2 group">
                                <label className={labelClasses}><FaFacebook className="text-[#1877F2]" /> Facebook</label>
                                <input value={contact.facebook || ""} onChange={(e) => setContact({ ...contact, facebook: e.target.value })}
                                    className={inputClasses} placeholder="https://..." />
                            </div>
                            <div className="space-y-2 group">
                                <label className={labelClasses}><FaInstagram className="text-[#E4405F]" /> Instagram</label>
                                <input value={contact.instagram || ""} onChange={(e) => setContact({ ...contact, instagram: e.target.value })}
                                    className={inputClasses} placeholder="https://..." />
                            </div>
                            <div className="space-y-2 group">
                                <label className={labelClasses}><FaTwitter className="text-[#1DA1F2]" /> X / Twitter</label>
                                <input value={contact.twitter || ""} onChange={(e) => setContact({ ...contact, twitter: e.target.value })}
                                    className={inputClasses} placeholder="https://..." />
                            </div>
                            <div className="space-y-2 group">
                                <label className={labelClasses}><FaTiktok className="text-white" /> TikTok</label>
                                <input value={contact.tiktok || ""} onChange={(e) => setContact({ ...contact, tiktok: e.target.value })}
                                    className={inputClasses} placeholder="https://..." />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Hero Fallback Control */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="glass-card-pro p-10 bg-gradient-to-b from-[#0a0f1d] to-[#04060b] rounded-[3rem] border border-blue-500/10 shadow-2xl space-y-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px] pointer-events-none" />

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                                    <FaImage />
                                </div>
                                <span className="text-white font-black uppercase tracking-widest text-[10px]">Hero Fallback</span>
                            </div>
                            <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                                Estos activos solo se mostrarán si no hay elementos activos en la pasarela multimedia.
                            </p>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className={labelClasses}><FaImage className="text-blue-500/50" /> Static Background</label>
                                <input value={contact.hero_image || ""} onChange={(e) => setContact({ ...contact, hero_image: e.target.value })}
                                    className={inputClasses} placeholder="URL de imagen fija" />
                            </div>
                            <div className="space-y-3">
                                <label className={labelClasses}><FaVideo className="text-blue-500/50" /> Cinematic Overlay</label>
                                <input value={contact.hero_video || ""} onChange={(e) => setContact({ ...contact, hero_video: e.target.value })}
                                    className={inputClasses} placeholder="URL de video (loop)" />
                            </div>
                        </div>
                    </div>

                    <div className="p-10 bg-blue-600/5 border border-blue-500/10 rounded-[3rem] space-y-4">
                        <p className="text-blue-400 font-black uppercase tracking-widest text-[10px]">System Note</p>
                        <p className="text-white/40 text-[10px] font-medium leading-relaxed uppercase tracking-tighter">
                            La sincronización es inmediata. Asegúrese de que todas las URLs comiencen con https:// para garantizar la integridad de la red.
                        </p>
                    </div>
                </div>
            </div>

            {/* Media Gallery Integration */}
            <div className="pt-20 border-t border-white/5">
                <MediaAdmin />
            </div>
        </div>
    );
}
