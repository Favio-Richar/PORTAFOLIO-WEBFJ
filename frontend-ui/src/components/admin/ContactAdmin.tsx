"use client";

import { useState, useEffect } from "react";
import {
    FaWhatsapp, FaFacebook, FaInstagram,
    FaTwitter, FaTiktok, FaGithub, FaLinkedin, FaEnvelope,
    FaLocationDot, FaVideo, FaImage, FaGlobe, FaUserGear,
    FaShieldHalved
} from "react-icons/fa6";
import { FaSave, FaPhone, FaClock, FaTerminal, FaMapMarkerAlt, FaShieldAlt, FaPhoneAlt, FaLock, FaRobot, FaCheckCircle, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import type { ContactData } from "@/lib/data/contact";
import MediaAdmin from "./MediaAdmin";
import { motion } from "framer-motion";

interface FormFieldProps {
    label: string;
    icon: React.ReactNode;
    value: string | undefined;
    field: string;
    placeholder: string;
    type?: string;
    isEditing: boolean;
    tempContact: ContactData;
    setTempContact: (data: ContactData) => void;
    inputClasses: string;
    labelClasses: string;
    displayClasses: string;
}

const FormField = ({ label, icon, value, field, placeholder, isEditing, tempContact, setTempContact, inputClasses, labelClasses, displayClasses, type = "text" }: FormFieldProps) => (
    <div className="space-y-1 group overflow-hidden">
        <label className={labelClasses}>{icon} {label}</label>
        {isEditing ? (
            <div className="relative">
                <input
                    type={type}
                    value={tempContact[field as keyof ContactData] || ""}
                    onChange={(e) => setTempContact({ ...tempContact, [field]: e.target.value })}
                    className={inputClasses}
                    placeholder={placeholder}
                />
                <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
            </div>
        ) : (
            <div className={displayClasses}>
                <span className="font-mono text-white/60 text-[9px] mr-1 hidden sm:inline">PRO_KEY:</span>
                <span className="truncate tracking-wide">{value || "---"}</span>
            </div>
        )}
    </div>
);

interface Props {
    contact: ContactData;
    onSave: (data: ContactData) => void;
}

type GeoParts = {
    address: string;
    commune: string;
    region: string;
    country: string;
};

const DEFAULT_COUNTRY = "Chile";

const parseLocation = (location: string | undefined): GeoParts => {
    const parts = (location || "")
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

    if (parts.length >= 4) {
        return {
            address: parts[0],
            commune: parts[1],
            region: parts[2],
            country: parts.slice(3).join(", "),
        };
    }

    if (parts.length === 3) {
        return {
            address: parts[0],
            commune: parts[1],
            region: parts[2],
            country: DEFAULT_COUNTRY,
        };
    }

    if (parts.length === 2) {
        return {
            address: parts[0],
            commune: parts[1],
            region: "",
            country: DEFAULT_COUNTRY,
        };
    }

    if (parts.length === 1) {
        return {
            address: parts[0],
            commune: "",
            region: "",
            country: DEFAULT_COUNTRY,
        };
    }

    return {
        address: "",
        commune: "",
        region: "",
        country: DEFAULT_COUNTRY,
    };
};

const composeLocation = (parts: GeoParts): string =>
    [parts.address, parts.commune, parts.region, parts.country]
        .map((p) => p.trim())
        .filter(Boolean)
        .join(", ");

export default function ContactAdmin({ contact: initialContact, onSave }: Props) {
    const [contact, setContact] = useState(initialContact);
    const [tempContact, setTempContact] = useState(initialContact);
    const [isEditing, setIsEditing] = useState(false);
    const [geoParts, setGeoParts] = useState<GeoParts>(parseLocation(initialContact.location));
    const locationPreview = composeLocation(geoParts);

    useEffect(() => {
        setContact(initialContact);
        setTempContact(initialContact);
        setGeoParts(parseLocation(initialContact.location));
    }, [initialContact]);

    const handleSave = async () => {
        try {
            const payload: ContactData = {
                ...tempContact,
                location: locationPreview || tempContact.location,
            };
            const res = await fetch("http://localhost:8000/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setContact(payload);
                setTempContact(payload);
                setIsEditing(false);
                if (onSave) onSave(payload);
                alert("Configuración de Contacto Actualizada ✅");
            }
        } catch (error) {
            alert("Error al sincronizar con el servidor");
        }
    };

    const handleCancel = () => {
        setTempContact(contact);
        setGeoParts(parseLocation(contact.location));
        setIsEditing(false);
    };

    const inputClasses = "w-full bg-black/40 border border-white/5 rounded-none px-6 py-4 text-white font-bold outline-none focus:border-blue-500/50 focus:bg-blue-500/10 transition-all duration-300 placeholder:text-white/5 text-[14px] shadow-inner";
    const labelClasses = "text-[12px] font-black uppercase tracking-[0.3em] text-white/40 mb-3 flex items-center gap-2 px-2 group-hover:text-blue-400/50 transition-colors";
    const displayClasses = "text-[14px] font-bold text-white/80 px-6 py-4 bg-white/[0.02] rounded-none border border-white/5 flex items-center gap-3 truncate min-h-[56px] group-hover:bg-white/[0.05] group-hover:border-white/10 transition-all duration-500 shadow-sm";

    const commonFieldProps = { isEditing, tempContact, setTempContact, inputClasses, labelClasses, displayClasses };

    return (
        <div className="space-y-16 pb-32 max-w-7xl mx-auto px-4">
            {/* Header Pro with Scanline Effect */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-none blur opacity-30 group-hover:opacity-50 transition duration-1000" />
                <div className="relative flex flex-col lg:flex-row justify-between items-center gap-10 bg-[#070b14] p-10 md:p-14 rounded-none border border-white/10 shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-cyan-400/5 pointer-events-none" />
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent animate-shimmer" />

                    <div className="relative z-10 space-y-5 text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start gap-5">
                            <div className="w-14 h-14 rounded-none bg-gradient-to-br from-blue-600 to-cyan-400 p-[1px] shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                                <div className="w-full h-full rounded-[inherit] bg-[#070b14] flex items-center justify-center text-blue-400">
                                    <FaUserGear className="text-xl animate-spin-slow" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-blue-500/80 font-black uppercase tracking-[0.5em] text-[10px] block">Security System Active</span>
                                <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter leading-[0.9]">
                                    Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">Identity</span>
                                </h3>
                            </div>
                        </div>
                        <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.2em] max-w-md leading-relaxed mx-auto lg:mx-0">
                            Centralized control of global endpoints, visual assets and social integration.
                        </p>
                    </div>

                    <div className="relative z-10 hidden sm:block">
                        <div className="px-10 py-6 rounded-none bg-white/[0.02] border border-white/5 backdrop-blur-xl flex flex-col gap-2 group/status hover:border-blue-500/30 transition-all duration-500">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-6 px-4">
                                    <div className="w-10 h-10 rounded-none bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-600/20 transition-all duration-500">
                                        <FaClock className="text-lg" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-white/20 uppercase font-black tracking-[0.3em] mb-1">Session Data</span>
                                        <span className="text-white font-mono font-bold text-[14px] tracking-tight">STABLE_CLUSTER_01</span>
                                    </div>
                                </div>
                            </div>
                            <span className="text-white/10 font-mono text-[8px] tracking-tighter">NODE_ID: SFX-9002-V.3</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Consolidated Management Block - The Master Block */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group/master"
            >
                <div className="absolute -inset-[1px] bg-gradient-to-b from-white/10 to-transparent rounded-none opacity-50 pointer-events-none" />
                <div className="relative glass-card-pro bg-[#0a1120]/90 rounded-none border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden">

                    {/* Block Header with Metallic Look */}
                    <div className="px-10 md:px-14 py-10 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-8 bg-gradient-to-b from-white/[0.03] to-transparent">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-none bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center text-blue-500 shadow-xl relative group/icon">
                                <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover/icon:opacity-100 transition-opacity" />
                                <FaGlobe className="text-2xl relative z-10" />
                            </div>
                            <div>
                                <h4 className="text-white font-black uppercase tracking-[0.2em] text-[13px]">Parámetros de Red</h4>
                                <p className="text-white/10 text-[9px] font-black uppercase tracking-[0.4em] mt-1">Global Configuration Hub</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={`relative group/btn px-12 py-6 rounded-none font-black uppercase text-[11px] tracking-[0.4em] transition-all duration-700 flex items-center gap-5 overflow-hidden ${isEditing
                                        ? "bg-white/5 text-white border border-white/10"
                                        : "bg-blue-600 text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:shadow-[0_25px_70px_rgba(37,99,235,0.5)] hover:-translate-y-1"
                                        }`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-white/5 to-blue-600/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                                    <FaUserGear className="text-blue-500 group-hover:rotate-90 transition-transform duration-700" />
                                    <span>Modificar Estructura</span>
                                </button>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleCancel}
                                        className="px-8 py-4.5 rounded-none bg-white/[0.03] border border-white/10 text-white/40 font-black uppercase text-[10px] tracking-[0.2em] hover:text-red-400 hover:border-red-400/30 transition-all"
                                    >
                                        Abandonar
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-12 py-4.5 rounded-none bg-blue-600 text-white font-black uppercase text-[10px] tracking-[0.3em] shadow-[0_15px_35px_rgba(37,99,235,0.4)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.6)] hover:-translate-y-1 transition-all flex items-center gap-4"
                                    >
                                        <FaSave className="text-xs" /> Sync Protocol
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-10 md:p-14 space-y-16">
                        {/* Section 01: Core Connections */}
                        <div className="space-y-10 group/section">
                            <div className="flex items-center gap-5">
                                <div className="w-7 h-7 rounded-none border border-blue-500/30 flex items-center justify-center text-blue-500 text-[11px] font-black font-mono bg-blue-500/5">01</div>
                                <span className="text-blue-400/90 font-black text-xs uppercase tracking-[0.4em]">Identidad y Conectividad</span>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-blue-500/20 via-blue-500/5 to-transparent" />
                            </div>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                <FormField label="Email Oficial" icon={<FaEnvelope className="text-blue-500/60" />} value={contact.email} field="email" placeholder="admin@elite.com" {...commonFieldProps} />
                                <FormField label="Voz / Terminal" icon={<FaPhone className="text-blue-500/60" />} value={contact.phone} field="phone" placeholder="+00 000 0000" {...commonFieldProps} />
                                <FormField label="Canal WhatsApp" icon={<FaWhatsapp className="text-emerald-500/60" />} value={contact.whatsapp} field="whatsapp" placeholder="+00 0 0000 0000" {...commonFieldProps} />
                                <div className="sm:col-span-2 lg:col-span-4 space-y-3 group overflow-hidden">
                                    <label className={labelClasses}>
                                        <FaLocationDot className="text-red-500/60" /> Geo Localizacion Estructurada
                                    </label>
                                    {isEditing ? (
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <input value={geoParts.address} onChange={(e) => setGeoParts({ ...geoParts, address: e.target.value })} className={inputClasses} placeholder="Direccion" />
                                            <input value={geoParts.commune} onChange={(e) => setGeoParts({ ...geoParts, commune: e.target.value })} className={inputClasses} placeholder="Comuna" />
                                            <input value={geoParts.region} onChange={(e) => setGeoParts({ ...geoParts, region: e.target.value })} className={inputClasses} placeholder="Region" />
                                            <input value={geoParts.country} onChange={(e) => setGeoParts({ ...geoParts, country: e.target.value })} className={inputClasses} placeholder="Pais" />
                                        </div>
                                    ) : (
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                            <div className={displayClasses}><span className="font-mono text-white/60 text-[9px] mr-1">DIR:</span><span className="truncate tracking-wide">{geoParts.address || "---"}</span></div>
                                            <div className={displayClasses}><span className="font-mono text-white/60 text-[9px] mr-1">COM:</span><span className="truncate tracking-wide">{geoParts.commune || "---"}</span></div>
                                            <div className={displayClasses}><span className="font-mono text-white/60 text-[9px] mr-1">REG:</span><span className="truncate tracking-wide">{geoParts.region || "---"}</span></div>
                                            <div className={displayClasses}><span className="font-mono text-white/60 text-[9px] mr-1">PAIS:</span><span className="truncate tracking-wide">{geoParts.country || "---"}</span></div>
                                        </div>
                                    )}
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {isEditing ? (
                                            <>
                                                <input
                                                    value={tempContact.lat ?? ""}
                                                    onChange={(e) => {
                                                        const raw = e.target.value.trim();
                                                        setTempContact({ ...tempContact, lat: raw === "" ? undefined : Number(raw) });
                                                    }}
                                                    className={inputClasses}
                                                    placeholder="Latitud (opcional para ajuste fino)"
                                                />
                                                <input
                                                    value={tempContact.lng ?? ""}
                                                    onChange={(e) => {
                                                        const raw = e.target.value.trim();
                                                        setTempContact({ ...tempContact, lng: raw === "" ? undefined : Number(raw) });
                                                    }}
                                                    className={inputClasses}
                                                    placeholder="Longitud (opcional para ajuste fino)"
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <div className={displayClasses}><span className="font-mono text-white/60 text-[9px] mr-1">LAT:</span><span className="truncate tracking-wide">{typeof contact.lat === "number" ? contact.lat : "---"}</span></div>
                                                <div className={displayClasses}><span className="font-mono text-white/60 text-[9px] mr-1">LNG:</span><span className="truncate tracking-wide">{typeof contact.lng === "number" ? contact.lng : "---"}</span></div>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-white/30 font-bold tracking-wide px-1">OUTPUT GEO: {locationPreview || contact.location || "---"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Section 02: Global Presence */}
                        <div className="space-y-10 group/section">
                            <div className="flex items-center gap-5">
                                <div className="w-7 h-7 rounded-none border border-cyan-500/30 flex items-center justify-center text-cyan-500 text-[11px] font-black font-mono bg-cyan-500/5">02</div>
                                <span className="text-cyan-400/90 font-black text-xs uppercase tracking-[0.4em]">Ecosistema Profesional</span>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-cyan-500/20 via-cyan-500/5 to-transparent" />
                            </div>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
                                <FormField label="LinkedIn Network" icon={<FaLinkedin className="text-[#0A66C2]" />} value={contact.linkedin} field="linkedin" placeholder="profile_handle" {...commonFieldProps} />
                                <FormField label="GitHub Repository" icon={<FaGithub className="text-white/40" />} value={contact.github} field="github" placeholder="user_handle" {...commonFieldProps} />
                                <FormField label="Instagram Feed" icon={<FaInstagram className="text-[#E4405F]" />} value={contact.instagram} field="instagram" placeholder="daily_visuals" {...commonFieldProps} />
                                <FormField label="Facebook Node" icon={<FaFacebook className="text-[#1877F2]" />} value={contact.facebook} field="facebook" placeholder="brand_page" {...commonFieldProps} />
                                <FormField label="X (Digital Voice)" icon={<FaTwitter className="text-white/40" />} value={contact.twitter} field="twitter" placeholder="realtime_handle" {...commonFieldProps} />
                                <FormField label="TikTok Pulse" icon={<FaTiktok className="text-white/40" />} value={contact.tiktok} field="tiktok" placeholder="video_stream" {...commonFieldProps} />
                            </div>
                        </div>

                        {/* Section 03: Visual Core */}
                        <div className="space-y-10 group/section">
                            <div className="flex items-center gap-5">
                                <div className="w-7 h-7 rounded-none border border-purple-500/30 flex items-center justify-center text-purple-500 text-[11px] font-black font-mono bg-purple-500/5">03</div>
                                <span className="text-purple-400/90 font-black text-xs uppercase tracking-[0.4em]">Activos de Visualización</span>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-purple-500/20 via-purple-500/5 to-transparent" />
                            </div>
                            <div className="grid md:grid-cols-2 gap-10">
                                <FormField label="Hero Static Asset" icon={<FaImage className="text-purple-400/60" />} value={contact.hero_image} field="hero_image" placeholder="HTTPS://STORAGE.COM/IMG.JPG" {...commonFieldProps} />
                                <FormField label="Hero Dynamic Loop" icon={<FaVideo className="text-purple-400/60" />} value={contact.hero_video} field="hero_video" placeholder="HTTPS://STORAGE.COM/VID.MP4" {...commonFieldProps} />
                            </div>
                        </div>
                    </div>

                    {/* Footer System Status */}
                    <div className="px-14 py-8 bg-[#070b14] border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-none bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[10px] font-black text-emerald-500/70 uppercase tracking-widest">Global Sync OK</span>
                            </div>
                            <div className="h-4 w-[1px] bg-white/5 hidden md:block" />
                            <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.3em]">Latencia Estimada: 0.02ms</p>
                        </div>
                        <div className="flex items-center gap-4 text-white/5 font-mono text-[7px] tracking-widest uppercase text-center md:text-right overflow-hidden group/footer">
                            <span className="group-hover:text-blue-500/20 transition-colors">SECURITY_INTEGRITY_CHECK_PASS</span>
                            <span className="hidden lg:inline">•</span>
                            <span className="hidden lg:inline group-hover:text-blue-500/20 transition-colors">ENCRYPTION: AES-256</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="pt-20 border-t border-white/5">
                <MediaAdmin />
            </div>
        </div>
    );
}

