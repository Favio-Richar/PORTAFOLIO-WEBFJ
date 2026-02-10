"use client";

import { useState, useEffect } from "react";
import {
    FaUserCircle, FaBriefcase, FaGraduationCap, FaCertificate, FaClock,
    FaImage, FaVideo, FaSave, FaPlusCircle, FaSpinner, FaInfoCircle, FaCheckCircle, FaArrowRight, FaTrash
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Sub-components
import ExperienceAdmin from "./ExperienceAdmin";
import EducationAdmin from "./EducationAdmin";
import CertificationsAdmin from "./CertificationsAdmin";
import TimelineAdmin from "./TimelineAdmin";

// Types
import type { ProfileData } from "@/lib/data/profile";
import type { Experience } from "@/lib/data/experience";
import type { Education } from "@/lib/data/education";
import type { Certification } from "@/lib/data/certifications";
import type { TimelineItem } from "@/lib/data/timeline";

interface Props {
    profile: ProfileData;
    experiences: Experience[];
    education: Education[];
    certifications: Certification[];
    timeline: TimelineItem[];
    onSaveProfile: (data: ProfileData) => void;
    onSaveExperience: (data: Experience[]) => void;
    onSaveEducation: (data: Education[]) => void;
    onSaveCertifications: (data: Certification[]) => void;
    onSaveTimeline: (data: TimelineItem[]) => void;
}

type TabType = 'identity' | 'experience' | 'education' | 'certifications' | 'timeline';

export default function ProfileAdmin({
    profile: initialProfile,
    experiences,
    education,
    certifications,
    timeline,
    onSaveProfile,
    onSaveExperience,
    onSaveEducation,
    onSaveCertifications,
    onSaveTimeline
}: Props) {

    const [activeTab, setActiveTab] = useState<TabType>('identity');

    // --- IDENTITY STATE & LOGIC ---
    const [profile, setProfile] = useState(initialProfile);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

    useEffect(() => { setProfile(initialProfile); }, [initialProfile]);

    const deletePhysicalFile = async (url: string) => {
        if (!url || !url.includes("localhost:8000/uploads/")) return;
        try {
            await fetch(`http://localhost:8000/api/upload/delete?url=${encodeURIComponent(url)}`, { method: "DELETE" });
        } catch (error) { console.error("Error deleting physical file:", error); }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const setter = type === 'image' ? setUploadingImage : setUploadingVideo;
        setter(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("http://localhost:8000/api/upload", { method: "POST", body: formData });
            if (!res.ok) throw new Error("Upload failed");
            const result = await res.json();

            if (type === 'image') {
                if (profile.profileImage) await deletePhysicalFile(profile.profileImage);
                setProfile(prev => ({ ...prev, profileImage: result.url }));
            } else {
                if (profile.profileVideo) await deletePhysicalFile(profile.profileVideo);
                setProfile(prev => ({ ...prev, profileVideo: result.url }));
            }
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setter(false);
        }
    };

    const handleSaveIdentity = async () => {
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
                onSaveProfile(profile);
                setTimeout(() => setSaveStatus("idle"), 3000);
            } else {
                setSaveStatus("error");
                setTimeout(() => setSaveStatus("idle"), 3000);
            }
        } catch (error) {
            console.error(error);
            setSaveStatus("error");
            setTimeout(() => setSaveStatus("idle"), 3000);
        }
    };

    // --- TABS CONFIG ---
    const tabs = [
        { id: 'identity', label: 'Identidad & Video', icon: <FaUserCircle /> },
        { id: 'experience', label: 'Experiencia', icon: <FaBriefcase /> },
        { id: 'education', label: 'Formación', icon: <FaGraduationCap /> },
        { id: 'certifications', label: 'Certificaciones', icon: <FaCertificate /> },
        { id: 'timeline', label: 'Timeline', icon: <FaClock /> },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">

            {/* TABS HEADER */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/50 border border-white/5 rounded-2xl w-full lg:w-fit backdrop-blur-sm">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                            ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <span className="text-lg">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* CONTENT AREA */}
            <div className="min-h-[600px] admin-panel-container">
                <AnimatePresence mode="wait">

                    {/* --- IDENTITY TAB --- */}
                    {activeTab === 'identity' && (
                        <motion.div
                            key="identity"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            <div className="flex justify-between items-center border-b border-white/5 pb-8">
                                <div>
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Identidad Digital</h3>
                                    <p className="text-slate-500 text-sm font-bold mt-1">Información principal, avatar y video de presentación.</p>
                                </div>
                                <button
                                    onClick={handleSaveIdentity}
                                    disabled={saveStatus === "saving"}
                                    className={`px-8 py-4 rounded-xl flex items-center gap-3 text-xs font-black uppercase transition-all ${saveStatus === "success" ? "bg-emerald-500 text-white" : "btn-primary btn-alive"}`}
                                >
                                    {saveStatus === "saving" ? <FaSpinner className="animate-spin" /> : <FaSave />}
                                    {saveStatus === "saving" ? "Guardando..." : "Guardar Cambios"}
                                </button>
                            </div>

                            <div className="grid lg:grid-cols-3 gap-8">
                                {/* INFO & VIDEO */}
                                <div className="lg:col-span-2 space-y-8">
                                    {/* BASIC INFO */}
                                    <div className="admin-card">
                                        <h4 className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                            <FaInfoCircle /> Datos Básicos
                                        </h4>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-slate-400 text-[10px] font-black uppercase ml-1">Nombre Completo</label>
                                                <input
                                                    value={profile.fullName}
                                                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-cyan-500 focus:bg-white/5 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-slate-400 text-[10px] font-black uppercase ml-1">Título Profesional</label>
                                                <input
                                                    value={profile.title}
                                                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-cyan-500 focus:bg-white/5 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* VIDEO */}
                                    <div className="admin-card">
                                        <h4 className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                            <FaVideo /> Video de Presentación
                                        </h4>
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <label className={`cursor-pointer block ${uploadingVideo ? 'opacity-50 pointer-events-none' : ''}`}>
                                                    <div className="px-6 py-8 rounded-2xl bg-slate-950 border border-dashed border-white/10 hover:border-cyan-500/50 transition-all flex flex-col items-center justify-center gap-3 group">
                                                        {uploadingVideo ? <FaSpinner className="text-2xl text-cyan-500 animate-spin" /> : <FaPlusCircle className="text-2xl text-slate-600 group-hover:text-cyan-500" />}
                                                        <span className="text-xs font-bold text-slate-400 group-hover:text-white">Subir MP4/WEBM</span>
                                                    </div>
                                                    <input type="file" accept="video/*" onChange={(e) => handleUpload(e, 'video')} className="hidden" />
                                                </label>
                                                <div className="space-y-2">
                                                    <label className="text-slate-400 text-[10px] font-black uppercase ml-1">URL Externa</label>
                                                    <input
                                                        value={profile.profileVideo}
                                                        onChange={(e) => setProfile({ ...profile, profileVideo: e.target.value })}
                                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-cyan-400 text-xs font-mono outline-none focus:border-cyan-500"
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            </div>

                                            <div className="aspect-video bg-black rounded-xl border border-white/10 overflow-hidden flex items-center justify-center">
                                                {profile.profileVideo ? (
                                                    profile.profileVideo.includes('http') && !profile.profileVideo.includes('localhost') ?
                                                        <div className="text-center p-4"><FaVideo className="text-4xl text-slate-700 mx-auto mb-2" /><p className="text-[10px] text-slate-500">Video Externo</p></div>
                                                        : <video src={profile.profileVideo} className="w-full h-full object-cover" controls />
                                                ) : (
                                                    <div className="text-slate-700 flex flex-col items-center"><FaVideo className="text-3xl mb-2" /><span className="text-[10px] font-bold">SIN VIDEO</span></div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* PROFILE IMAGE */}
                                <div className="admin-card h-fit sticky top-4">
                                    <h4 className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                        <FaImage /> Avatar
                                    </h4>
                                    <div className="relative aspect-square w-full max-w-[200px] mx-auto rounded-[2rem] overflow-hidden border-2 border-white/10 bg-black group mb-6">
                                        {profile.profileImage ? (
                                            <img src={profile.profileImage} className="w-full h-full object-cover" alt="Avatar" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-800"><FaUserCircle className="text-6xl" /></div>
                                        )}
                                        {uploadingImage && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><FaSpinner className="text-3xl text-cyan-500 animate-spin" /></div>}
                                    </div>
                                    <label className={`cursor-pointer w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 transition-all ${uploadingImage ? 'pointer-events-none opacity-50' : ''}`}>
                                        <FaPlusCircle className="text-cyan-500" />
                                        <span className="text-[10px] font-black text-white uppercase">Cambiar Imagen</span>
                                        <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'image')} className="hidden" />
                                    </label>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* --- OTHER TABS --- */}
                    {activeTab === 'experience' && (
                        <motion.div key="experience" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <ExperienceAdmin experiences={experiences} onSave={onSaveExperience} />
                        </motion.div>
                    )}

                    {activeTab === 'education' && (
                        <motion.div key="education" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <EducationAdmin education={education} onSave={onSaveEducation} />
                        </motion.div>
                    )}

                    {activeTab === 'certifications' && (
                        <motion.div key="certifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <CertificationsAdmin certifications={certifications} onSave={onSaveCertifications} />
                        </motion.div>
                    )}

                    {activeTab === 'timeline' && (
                        <motion.div key="timeline" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <TimelineAdmin timeline={timeline} onSave={onSaveTimeline} />
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
