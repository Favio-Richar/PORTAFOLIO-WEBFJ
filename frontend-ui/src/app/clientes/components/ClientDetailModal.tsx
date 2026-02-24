"use client";

import { memo, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaPlayCircle } from "react-icons/fa";

type ClientMediaItem = {
  url: string;
  type?: "image" | "video" | string;
};

type ClientMetricItem = {
  label: string;
  improvement: string | number;
  before: string;
  after: string;
};

type ClientTimelineStep = {
  phase: string;
  duration: string;
  status: string;
};

type ClientDetailData = {
  id?: number | string;
  name: string;
  logo: ReactNode;
  logoColor?: string;
  industry: string;
  year: string;
  image?: string;
  media?: ClientMediaItem[];
  testimonial: string;
  author: string;
  role: string;
  metrics: ClientMetricItem[];
  services: string[];
  timeline: ClientTimelineStep[];
};

type ClientDetailModalProps = {
  selectedClient: ClientDetailData | null;
  onClose: () => void;
};

const ClientDetailModal = memo(({ selectedClient, onClose }: ClientDetailModalProps) => {
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);

  if (!selectedClient) return null;
  const mediaItems = selectedClient.media ?? [];
  const hasMediaCarousel = mediaItems.length > 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-0 md:p-10"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#050a18] w-full h-full relative flex flex-col"
      >
        <div className="p-8 md:p-12 border-b border-white/5 flex justify-between items-center bg-[#050a18]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-8">
            <div
              className="text-5xl md:text-6xl filter drop-shadow-[0_0_20px_rgba(14,165,233,0.3)] bg-white/5 w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center border border-white/10"
              style={{ color: selectedClient.logoColor || "white" }}
            >
              {selectedClient.logo}
            </div>
            <div>
              <h2 className="text-3xl md:text-5xl text-white font-[950] uppercase tracking-tight mb-2 leading-none">{selectedClient.name}</h2>
              <div className="flex gap-3">
                <span className="bg-sky-500/10 text-sky-400 px-4 py-1.5 rounded-full text-[10px] font-900 uppercase tracking-widest border border-sky-500/20">{selectedClient.industry}</span>
                <span className="bg-white/5 text-white/40 px-4 py-1.5 rounded-full text-[10px] font-900 uppercase tracking-widest border border-white/10">Proyecto {selectedClient.year}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all text-xl border border-white/10"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 md:p-20">
          <div className="max-w-[1600px] mx-auto">
            <div className="modal-dashboard-grid">
              <div className="hero-cell media-pasarela">
                <div className="main-media-viewer">
                  {(() => {
                    const currentMedia = mediaItems.length > 0
                      ? mediaItems[activeMediaIdx % mediaItems.length]
                      : { url: selectedClient.image, type: "image" };

                    if (currentMedia?.type === "video") {
                      return (
                        <video key={currentMedia.url} autoPlay muted loop playsInline className="w-full h-full object-cover">
                          <source src={currentMedia.url} type="video/mp4" />
                        </video>
                      );
                    }
                    return <img key={currentMedia?.url} src={currentMedia?.url} alt={selectedClient.name} className="w-full h-full object-cover" />;
                  })()}

                  {hasMediaCarousel && (
                    <div className="media-nav-overlay">
                      <button
                        onClick={() => setActiveMediaIdx((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)}
                        className="nav-btn prev"
                      >
                        <FaArrowLeft />
                      </button>
                      <button
                        onClick={() => setActiveMediaIdx((prev) => (prev + 1) % mediaItems.length)}
                        className="nav-btn next"
                      >
                        <FaArrowRight />
                      </button>
                    </div>
                  )}
                </div>

                {hasMediaCarousel && (
                  <div className="media-thumbnail-strip">
                    {mediaItems.map((m, idx: number) => (
                      <div
                        key={idx}
                        className={`mini-thumb ${idx === activeMediaIdx ? "active" : ""}`}
                        onClick={() => setActiveMediaIdx(idx)}
                      >
                        {m.type === "video" ? (
                          <video
                            src={m.url}
                            className="w-full h-full object-cover"
                            preload="metadata"
                            muted
                          />
                        ) : (
                          <img
                            src={m.url}
                            alt={`thumbnail-${idx}`}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&h=150&fit=crop";
                            }}
                          />
                        )}
                        {m.type === "video" && <div className="video-badge"><FaPlayCircle /></div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="vision-cell minimalist-detail">
                <div className="cell-header">
                  <span className="cell-title">Visión del Proyecto</span>
                  <div className="cell-line" />
                </div>
                <p className="text-white text-3xl md:text-5xl leading-[1.2] font-900 mb-12 tracking-tighter">
                  &quot;{selectedClient.testimonial}&quot;
                </p>
                <div className="flex items-center gap-6 p-8 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-xl">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center text-5xl border border-white/10 shadow-2xl" style={{ color: selectedClient.logoColor }}>
                    {selectedClient.logo}
                  </div>
                  <div>
                    <div className="text-lg font-900 text-white uppercase tracking-[0.2em] mb-1">{selectedClient.author}</div>
                    <div className="text-sm font-bold text-sky-400 uppercase tracking-[0.3em] opacity-80">{selectedClient.role}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="metrics-cell minimalist-section">
              <div className="cell-header">
                <span className="cell-title">Impacto en Negocio</span>
                <div className="cell-line" />
              </div>
              <div className="flex flex-wrap gap-8 justify-center">
                {selectedClient.metrics.map((m, idx: number) => (
                  <div key={idx} className="flex-1 min-w-[280px] max-w-[350px]">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-purple-500/20 rounded-[2rem] blur-xl group-hover:blur-2xl transition-all" />
                      <div className="relative p-8 rounded-[2rem] bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 hover:border-sky-500/30 transition-all">
                        <div className="flex items-center justify-between mb-6">
                          <span className="text-xs font-black text-white/50 uppercase tracking-[0.2em]">{m.label}</span>
                          <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-500/20 to-purple-500/20 border border-sky-500/30">
                            <span className="text-xs font-black text-sky-400">+{m.improvement}%</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="flex-1 text-center">
                            <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Antes</div>
                            <div className="text-xl font-bold text-white/40 line-through">{m.before}</div>
                          </div>

                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-purple-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                              <FaArrowRight className="text-white text-sm" />
                            </div>
                          </div>

                          <div className="flex-1 text-center">
                            <div className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-2">Ahora</div>
                            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-400">
                              {m.after}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="solutions-cell minimalist-section">
              <div className="cell-header">
                <span className="cell-title">Soluciones Aplicadas</span>
                <div className="cell-line" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {selectedClient.services.map((s: string) => (
                  <div key={s} className="flex items-center gap-4 p-5 bg-white/2 rounded-2xl border border-white/5 hover:border-sky-500/30 transition-all">
                    <FaCheckCircle className="text-sky-500 text-xl" />
                    <span className="text-white/90 font-800 uppercase tracking-widest text-xs">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="gallery-cell" />

            <div className="timeline-cell minimalist-section">
              <div className="cell-header">
                <span className="cell-title">Technical Timeline</span>
                <div className="cell-line" />
              </div>
              <div className="space-y-8">
                {selectedClient.timeline.map((step, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-white/2 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${step.status === "completed" ? "bg-sky-500" : "bg-purple-500 animate-pulse"}`} />
                      <div>
                        <div className="text-xs font-900 text-white uppercase tracking-widest mb-1">{step.phase}</div>
                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">{step.duration}</div>
                      </div>
                    </div>
                    <span className={`text-[8px] font-900 uppercase px-3 py-1 rounded-full border ${step.status === "completed" ? "border-sky-500/30 text-sky-400 bg-sky-500/5" : "border-purple-500/30 text-purple-400 bg-purple-500/5"}`}>
                      {step.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

ClientDetailModal.displayName = "ClientDetailModal";

export default ClientDetailModal;

