"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaExternalLinkAlt, FaImage, FaFilePdf, FaVideo } from "react-icons/fa";

interface CertModalProps {
    viewingCert: string | null;
    onClose: () => void;
}

export default function CertModal({ viewingCert, onClose }: CertModalProps) {
    if (!viewingCert) return null;

    const isPdf = viewingCert.toLowerCase().includes('.pdf') || viewingCert.includes('application/pdf');
    const isVideo = viewingCert.toLowerCase().match(/\.(mp4|webm|ogg)$/) || viewingCert.includes('video/');

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-[1000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-4 md:p-8"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="max-w-6xl w-full bg-[#0a0a0c] border border-white/10 p-6 md:p-10 rounded-[3rem] md:rounded-[4rem] shadow-4xl overflow-hidden relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                {isPdf ? (
                                    <FaFilePdf className="text-red-500 text-xl" />
                                ) : isVideo ? (
                                    <FaVideo className="text-purple-500 text-xl" />
                                ) : (
                                    <FaImage className="text-cyan-500 text-xl" />
                                )}
                                <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
                                    Certificado de Validación
                                </h3>
                            </div>
                            <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">
                                SISTEMA DE VERIFICACIÓN EXTERNA
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <a
                                href={viewingCert}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hidden md:flex items-center gap-2 px-5 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-all font-bold text-xs uppercase"
                            >
                                <FaExternalLinkAlt /> Abrir Original
                            </a>
                            <button
                                onClick={onClose}
                                className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5 text-white/40 hover:text-white hover:bg-red-500/20 transition-all flex items-center justify-center text-xl"
                            >
                                <FaTimes />
                            </button>
                        </div>
                    </div>

                    {/* Content Container */}
                    <div className="bg-black rounded-3xl overflow-hidden aspect-[16/10] md:aspect-[16/9] shadow-inner border border-white/5 relative group">
                        {isPdf ? (
                            <iframe
                                src={`${viewingCert}#toolbar=0`}
                                className="w-full h-full border-none"
                                title="Certificado PDF"
                            />
                        ) : isVideo ? (
                            <video
                                src={viewingCert}
                                controls
                                autoPlay
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-900/20">
                                <img
                                    src={viewingCert}
                                    alt="Certificado"
                                    className="max-w-full max-h-full object-contain shadow-2xl"
                                />
                            </div>
                        )}

                        {/* Mobile Open Button */}
                        <a
                            href={viewingCert}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="md:hidden absolute bottom-4 right-4 p-4 bg-cyan-500 text-black rounded-full shadow-xl"
                        >
                            <FaExternalLinkAlt />
                        </a>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
