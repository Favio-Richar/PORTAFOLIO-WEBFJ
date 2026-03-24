"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaShareAlt, FaImage, FaFilePdf, FaVideo } from "react-icons/fa";
import { createPortal } from "react-dom";
import API_BASE from "@/lib/apiBase";

interface CertModalProps {
    viewingCert: string | null;
    onClose: () => void;
}

const BACKEND_URL = API_BASE;

export default function CertModal({ viewingCert, onClose }: CertModalProps) {
    const [loadedUrl, setLoadedUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!viewingCert) return;

        const previousOverflow = document.body.style.overflow;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [viewingCert, onClose]);

    if (!viewingCert) return null;

    const currentUrl = viewingCert;
    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: "Certificado",
                    text: "Te comparto este certificado.",
                    url: currentUrl,
                });
                return;
            }

            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(currentUrl);
                alert("Enlace del certificado copiado.");
                return;
            }

            window.open(currentUrl, "_blank", "noopener,noreferrer");
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") return;
            console.error("No se pudo compartir el certificado:", error);
        }
    };

    const fileUrl = currentUrl.toLowerCase();
    const isCloudinaryRawDoc = fileUrl.includes("/raw/upload/");
    const isPdf = /\.pdf([?#]|$)/i.test(fileUrl) || fileUrl.includes("application/pdf");
    const isVideo = /\.(mp4|webm|ogg)$/i.test(fileUrl) || fileUrl.includes("video/");
    const isDocument = isPdf || isCloudinaryRawDoc;
    const proxyViewerUrl = `${BACKEND_URL}/api/upload/view?url=${encodeURIComponent(currentUrl)}`;
    const viewerLoading = loadedUrl !== currentUrl;

    const documentSrc = isCloudinaryRawDoc
        ? `${proxyViewerUrl}#page=1&toolbar=1&navpanes=0&scrollbar=1&zoom=page-fit`
        : `${currentUrl}#page=1&toolbar=1&navpanes=0&scrollbar=1&zoom=page-fit`;

    const modalContent = (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="about-cert-modal-layer fixed inset-0 z-[1000] bg-black/96"
            >
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="relative w-full h-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
                        <button
                            onClick={handleShare}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 bg-black/65 text-white text-[11px] font-bold uppercase tracking-wide hover:bg-black/80 transition-colors"
                            type="button"
                        >
                            <FaShareAlt /> Compartir
                        </button>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-lg border border-white/20 bg-black/65 text-white/90 hover:bg-black/80 transition-colors grid place-items-center text-lg"
                            type="button"
                            aria-label="Cerrar modal"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="w-full h-full p-2 md:p-4">
                        <div className="mx-auto w-full max-w-[1240px] h-full bg-black relative overflow-hidden">
                            {viewerLoading ? (
                                <div className="absolute inset-0 z-20 grid place-items-center bg-black/25">
                                    <span className="px-4 py-2 rounded-full bg-black/70 border border-white/20 text-white text-[11px] font-bold uppercase tracking-[0.16em]">
                                        Cargando certificado...
                                    </span>
                                </div>
                            ) : null}

                            {isDocument ? (
                                    <iframe
                                        src={documentSrc}
                                        className="w-full h-full border-none bg-white"
                                        title="Certificado PDF"
                                        onLoad={() => setLoadedUrl(currentUrl)}
                                    />
                                ) : isVideo ? (
                                    <video
                                        src={currentUrl}
                                        controls
                                        autoPlay
                                        className="w-full h-full object-contain bg-black"
                                        onLoadedData={() => setLoadedUrl(currentUrl)}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-black">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={currentUrl}
                                            alt="Certificado"
                                            className="max-w-full max-h-full object-contain"
                                            onLoad={() => setLoadedUrl(currentUrl)}
                                        />
                                    </div>
                                )}
                        </div>
                    </div>

                    <div className="absolute left-3 bottom-3 z-30 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/15 bg-black/65 text-white/85 text-[10px] font-semibold uppercase tracking-wide">
                        {isDocument ? <FaFilePdf className="text-amber-300" /> : isVideo ? <FaVideo className="text-orange-300" /> : <FaImage className="text-yellow-300" />}
                        Certificado
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );

    if (typeof document === "undefined") return null;
    return createPortal(modalContent, document.body);
}
