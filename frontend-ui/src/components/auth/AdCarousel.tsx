"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlay, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import API_BASE from "@/lib/apiBase";

interface MediaItem {
    type: 'image' | 'video';
    url: string;
}

interface Ad {
    id: number;
    title: string;
    media: string; // JSON string of MediaItem[]
    redirect_url?: string;
}

interface PlaylistItem {
    adId: number;
    title: string;
    redirectUrl?: string;
    type: 'image' | 'video';
    url: string;
}

export default function AdCarousel({
    position,
}: {
    position: string,
}) {
    const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/api/ads/public?position=${position}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.json();
            })
            .then((data: Ad[]) => {
                if (data && data.length > 0) {
                    const newPlaylist: PlaylistItem[] = [];
                    data.forEach(ad => {
                        try {
                            const mediaItems: MediaItem[] = JSON.parse(ad.media);
                            if (Array.isArray(mediaItems)) {
                                mediaItems.forEach(item => {
                                    newPlaylist.push({
                                        adId: ad.id,
                                        title: ad.title,
                                        redirectUrl: ad.redirect_url,
                                        type: item.type,
                                        url: item.url
                                    });
                                });
                            }
                        } catch (e) {
                            console.error("Error parsing media for ad", ad.id, e);
                        }
                    });

                    // Fallback if no valid media found but ads exist
                    if (newPlaylist.length === 0) {
                        // Add some default logic or leave empty
                    }
                    setPlaylist(newPlaylist);
                }
            })
            .catch((err) => console.log("Fetch error:", err));
    }, [position]);

    // Auto-advance
    useEffect(() => {
        if (playlist.length <= 1) return;

        const item = playlist[currentIndex];
        const duration = item.type === 'video' ? 10000 : 5000; // 10s for video (or listen to onEnded), 5s for image

        const timer = setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % playlist.length);
        }, duration);

        return () => clearTimeout(timer);
    }, [currentIndex, playlist]);

    if (playlist.length === 0) return null;

    const currentItem = playlist[currentIndex];

    return (
        <div className="relative w-full h-full overflow-hidden bg-black">
            <AnimatePresence mode="wait">
                <motion.div
                    key={`${currentItem.adId}-${currentItem.url}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 w-full h-full"
                >
                    {currentItem.type === 'video' ? (
                        <video
                            src={currentItem.url}
                            autoPlay
                            muted={isMuted}
                            loop={false}
                            playsInline
                            className="w-full h-full object-cover"
                            onEnded={() => setCurrentIndex((prev) => (prev + 1) % playlist.length)}
                        />
                    ) : (
                        <motion.img
                            key={currentItem.url}
                            initial={{ scale: 1.1, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                                scale: { duration: 10, ease: "linear" },
                                opacity: { duration: 1 }
                            }}
                            src={currentItem.url}
                            alt={currentItem.title}
                            className="w-full h-full object-cover"
                        />
                    )}

                    {/* Premium Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-12 lg:p-20">
                        <motion.div
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                            className="max-w-3xl"
                        >
                            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-600/20 backdrop-blur-md border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-4">
                                Featured Insight
                            </span>
                            <h2 className="text-5xl lg:text-7xl font-black text-white mb-8 tracking-tighter leading-none drop-shadow-2xl">
                                {currentItem.title}
                            </h2>

                            {currentItem.redirectUrl && (
                                <Link
                                    href={currentItem.redirectUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex items-center gap-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white font-black px-10 py-4 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                                >
                                    EXPLORAR PROYECTO
                                    <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                                        <FaPlay size={10} className="ml-1" />
                                    </div>
                                </Link>
                            )}
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Mute Button for Videos */}
            {currentItem.type === 'video' && (
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="absolute top-8 right-8 z-20 bg-black/50 p-3 rounded-full text-white backdrop-blur-md hover:bg-black/70 transition-colors"
                >
                    {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                </button>
            )}

            {/* Indicators */}
            <div className="absolute bottom-12 right-12 flex gap-3 z-20">
                {playlist.map((_, idx) => (
                    <div
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`cursor-pointer transition-all duration-500 rounded-full h-2 ${idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
