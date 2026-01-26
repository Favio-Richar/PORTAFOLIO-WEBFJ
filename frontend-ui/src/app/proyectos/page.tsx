"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { FaGithub, FaExternalLinkAlt, FaPlayCircle, FaSpinner, FaTimes, FaLink, FaCodeBranch, FaBuilding, FaUserTie } from "react-icons/fa";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade, Navigation } from "swiper/modules";

// Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css/navigation";

export default function ProyectosPage() {
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/proyectos");
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((p: any) => ({
            id: p.id,
            titulo: p.title,
            categoria: p.category,
            estado: p.status,
            version: p.version,
            descripcion: p.description,
            img: p.image_url,
            media: typeof p.media === 'string' ? JSON.parse(p.media) : (p.media || []),
            demo: p.demo_url,
            repo: p.repo_url,
            stack: typeof p.stack === 'string' ? JSON.parse(p.stack) : (p.stack || []),
            deployment_date: p.deployment_date,
            client_name: p.client_name
          }));
          setProyectos(mapped);

          // Deep Linking: Auto-open project from hash
          const hash = window.location.hash.replace('#', '');
          if (hash) {
            const found = mapped.find((p: any) => p.titulo.toLowerCase().replace(/\s+/g, '-') === hash);
            if (found) setSelectedProject(found);
          }
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProyectos();
  }, []);

  const copyDirectLink = (titulo: string) => {
    const slug = titulo.toLowerCase().replace(/\s+/g, '-');
    const url = `${window.location.origin}${window.location.pathname}#${slug}`;
    navigator.clipboard.writeText(url);
    alert("Enlace directo copiado al portapapeles 🔗");
  };

  return (
    <div className="relative overflow-hidden pt-20 px-6 font-bold">

      {/* DECORACIÓN FONDO */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-cyan-500/5 blur-[200px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[180px] rounded-full pointer-events-none" />

      {/* HEADER PROYECTOS */}
      <section className="relative text-center py-24">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10">
          <h2 className="section-title">
            <span className="block text-cyan-400 text-sm font-black tracking-[0.6em] uppercase mb-4">PORTFOLIO DE INGENIERÍA</span>
            <span className="title-fire text-glow-blue bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] text-7xl md:text-8xl font-black uppercase tracking-tighter">Proyectos</span>
          </h2>
          <p className="text-gray-400 mt-8 max-w-3xl mx-auto text-xl font-medium leading-relaxed">
            Exhibición de <span className="text-white font-black underline decoration-cyan-500/50">Sistemas de Alto Impacto</span> diseñados con arquitectura profesional, escalabilidad y una experiencia de usuario excepcional.
          </p>
        </motion.div>
      </section>

      {/* GRID DE PROYECTOS */}
      <section className="max-w-7xl mx-auto py-20 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <FaSpinner className="text-5xl text-cyan-500 animate-spin" />
            <span className="text-white/20 font-black uppercase tracking-[0.5em] text-xs">Sincronizando Sistemas...</span>
          </div>
        ) : (
          <div className="grid gap-20">
            {proyectos.map((p, index) => (
              <ProjectCard key={index} p={p} onExpand={() => setSelectedProject(p)} />
            ))}
          </div>
        )}
      </section>

      {/* THEATER MODE MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-10 bg-black/98 backdrop-blur-3xl"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              className="relative max-w-6xl w-full h-full max-h-[90vh] glass-card-pro border border-white/20 shadow-[0_0_150px_rgba(6,182,212,0.2)] flex flex-col overflow-hidden rounded-[3rem]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-6 right-6 w-12 h-12 rounded-full glass-light border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all z-50"
              >
                <FaTimes />
              </button>

              {/* MODAL SWIPER (PRESENTATION) */}
              <div className="flex-1 w-full bg-black/20 relative group/presenter overflow-hidden">
                <Swiper
                  modules={[Autoplay, Pagination, Navigation]}
                  pagination={{ clickable: true }}
                  navigation
                  autoplay={{ delay: 6000 }}
                  className="w-full h-full"
                >
                  {(selectedProject.media.length > 0 ? selectedProject.media : [{ type: 'image', url: selectedProject.img }]).map((m: any, idx: number) => (
                    <SwiperSlide key={idx} className="relative w-full h-full">
                      <div className="w-full h-full flex items-center justify-center p-4 md:p-8">
                        {m.type === "image" ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={m.url}
                              alt={`${selectedProject.titulo} detail ${idx}`}
                              fill
                              className="object-contain drop-shadow-2xl"
                            />
                          </div>
                        ) : (
                          <video
                            src={m.url}
                            controls
                            autoPlay
                            className="max-w-full max-h-full rounded-2xl shadow-2xl border border-white/10"
                          />
                        )}
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* MODAL TEXT INFO */}
              <div className="p-8 md:p-12 bg-black/40 border-t border-white/10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6 mb-4">
                    <h3 className="text-3xl md:text-5xl font-black text-white italic tracking-tight uppercase">
                      {selectedProject.titulo}
                    </h3>
                    {selectedProject.deployment_date && (
                      <div className="relative group/cal-modal cursor-default perspective-1000 scale-75 md:scale-100 origin-left">
                        <div className="w-12 h-14 bg-white rounded-xl overflow-hidden shadow-xl flex flex-col items-center border border-white/20">
                          <div className="w-full h-4 bg-red-600 flex items-center justify-center text-[6px] font-black text-white uppercase tracking-tighter">
                            {new Date(selectedProject.deployment_date).toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')}
                          </div>
                          <div className="flex-1 flex flex-col items-center justify-center p-0.5 leading-none">
                            <span className="text-black text-lg font-black">{new Date(selectedProject.deployment_date).getDate()}</span>
                            <span className="text-black/30 text-[5px] font-bold">{new Date(selectedProject.deployment_date).getFullYear()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-white/60 text-lg md:text-xl font-medium max-w-3xl leading-relaxed italic">
                    {selectedProject.client_name && (
                      <span className="inline-flex items-center gap-2 px-4 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 not-italic font-black rounded-full text-[10px] uppercase tracking-widest mr-4 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                        <FaUserTie className="text-[12px]" /> {selectedProject.client_name}
                      </span>
                    )}
                    {selectedProject.descripcion}
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => copyDirectLink(selectedProject.titulo)}
                    className="px-8 py-4 glass-light border border-white/20 text-white font-black uppercase tracking-widest text-[9px] rounded-full hover:bg-white/10 transition-all italic flex items-center gap-2"
                  >
                    <FaLink className="text-cyan-400" /> COPIAR ENLACE
                  </button>
                  <a href={selectedProject.demo} target="_blank" className="px-8 py-4 btn-primary btn-alive text-black font-black uppercase tracking-widest text-[9px] rounded-full flex items-center gap-2 italic shadow-lg shadow-cyan-500/20">
                    LIVE DEMO <FaExternalLinkAlt />
                  </a>
                  <a href={selectedProject.repo} target="_blank" className="px-8 py-4 glass-light border border-white/20 text-white/50 hover:text-white font-black uppercase tracking-widest text-[9px] rounded-full transition-all italic flex items-center gap-2">
                    <FaGithub /> REPOSITORIO
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA FINAL */}
      <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="title-fire text-glow-blue bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] text-4xl md:text-6xl font-black leading-tight uppercase">¿Buscas arquitectura de clase mundial?</h3>
          <p className="text-gray-400 mt-8 text-xl font-medium">Transformemos tus requerimientos complejos en una solución técnica impecable y robusta.</p>
          <div className="mt-12">
            <a href="/contacto" className="inline-flex items-center gap-4 px-16 py-7 rounded-full btn-primary btn-alive btn-shimmer btn-border-glow text-base font-black tracking-[0.3em] uppercase transition-all shadow-3xl">
              INICIAR ENLACE TÉCNICO ⚡
            </a>
          </div>
        </div>
      </motion.section>

    </div>
  );
}

function ProjectCard({ p, onExpand }: { p: any, onExpand: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [lastCommit, setLastCommit] = useState<string | null>(null);

  useEffect(() => {
    const fetchGitHubStatus = async () => {
      if (p.repo && p.repo.includes("github.com")) {
        try {
          const parts = p.repo.replace("https://github.com/", "").split("/");
          if (parts.length >= 2) {
            const [owner, repo] = parts;
            const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`);
            if (res.ok) {
              const data = await res.json();
              if (data?.[0]?.commit?.author?.date) {
                const date = new Date(data[0].commit.author.date);
                setLastCommit(date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' }));
              }
            }
          }
        } catch (e) {
          console.error("GitHub API error:", e);
        }
      }
    };
    fetchGitHubStatus();
  }, [p.repo]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const mediaGallery = p.media.length > 0 ? p.media : [{ type: "image", url: p.img }];

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="group glass-card-pro border border-white/5 rounded-[4rem] overflow-hidden shadow-3xl transition-all duration-700 hover:border-cyan-500/30 font-bold cursor-pointer"
      onClick={onExpand}
    >
      <div className="grid md:grid-cols-2 gap-0 overflow-hidden h-[500px]">
        {/* LADO VISUAL - ENHANCED GALLERY */}
        <div style={{ transform: "translateZ(50px)" }} className="relative h-full overflow-hidden border-b md:border-b-0 md:border-r border-white/5">
          <Swiper
            modules={[Autoplay, Pagination, EffectFade]}
            effect="fade"
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            className="w-full h-full"
          >
            {mediaGallery.map((m: any, idx: number) => (
              <SwiperSlide key={idx} className="relative w-full h-full bg-black/40">
                {m.type === "image" ? (
                  <Image
                    src={m.url}
                    alt={`${p.titulo} gallery ${idx}`}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                ) : (
                  <video
                    src={m.url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none">
            <div className="px-8 py-4 rounded-full glass-light border border-white/20 text-white font-black tracking-widest text-[10px] uppercase shadow-2xl flex items-center gap-3">
              EXPLORAR GALERÍA <FaPlayCircle className="text-cyan-400" />
            </div>
          </div>

          <div className="absolute top-8 left-8 z-30">
            <span className="px-5 py-2 bg-black/60 backdrop-blur-md border border-white/10 text-white font-black text-[9px] uppercase tracking-widest rounded-full w-fit">
              {p.version}
            </span>
          </div>
        </div>

        {/* INFO LADO - UNIFIED AND EQUALIZED */}
        <div style={{ transform: "translateZ(30px)" }} className="p-8 md:p-12 flex flex-col justify-center relative bg-black/40 backdrop-blur-md overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
            <span className="text-cyan-400 text-[10px] font-black tracking-[0.4em] uppercase bg-cyan-400/10 px-6 py-2 rounded-full border border-cyan-500/20">
              {p.categoria}
            </span>
            {p.deployment_date && (
              <div className="relative group/cal-card cursor-default perspective-1000 scale-90">
                <div className="w-14 h-15 bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col items-center transform-gpu transition-all duration-300 group-hover/cal-card:-rotate-x-12 border border-white/20">
                  <div className="w-full h-4 bg-red-600 flex items-center justify-center text-[7px] font-black text-white uppercase tracking-tighter">
                    {new Date(p.deployment_date).toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')}
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center p-0.5 leading-none">
                    <span className="text-black text-xl font-black">{new Date(p.deployment_date).getDate()}</span>
                    <span className="text-black/30 text-[6px] font-bold">{new Date(p.deployment_date).getFullYear()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <h3 className="title-fire text-glow-blue bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.3)] text-3xl md:text-4xl font-black mb-4 leading-none uppercase tracking-tighter">
            {p.titulo}
          </h3>

          <div className="flex flex-wrap items-center gap-6 mb-8 text-[11px] font-black tracking-[0.2em] text-white/40 uppercase">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-500" /> {p.estado}</span>
            {p.client_name && (
              <span className="flex items-center gap-2 px-4 py-1.5 bg-cyan-500/5 border border-cyan-500/20 rounded-full text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                <FaUserTie className="text-[10px]" /> {p.client_name}
              </span>
            )}
          </div>

          <p className="text-gray-400 text-base md:text-lg font-medium leading-relaxed mb-8 line-clamp-3">
            {p.descripcion || (p as any).description}
          </p>

          <div className="flex flex-wrap gap-6 font-black mt-auto">
            <a href={p.demo} target="_blank" className="flex-1 md:flex-none inline-flex items-center justify-center gap-4 px-12 py-5 rounded-full btn-primary btn-alive btn-shimmer btn-border-glow text-xs tracking-widest uppercase shadow-xl transition-all">
              DEMO EN VIVO <FaExternalLinkAlt />
            </a>
            <a href={p.repo} target="_blank" className="flex-1 md:flex-none inline-flex items-center justify-center gap-4 px-12 py-5 rounded-full glass-light border border-white/10 text-white/40 hover:text-white transition-all text-xs tracking-widest uppercase">
              REPOSITORIO <FaGithub />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
