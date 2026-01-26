"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FaLaptopCode, FaExternalLinkAlt, FaHammer, FaPlayCircle, FaTimes, FaExpandAlt, FaUserTie, FaClock } from "react-icons/fa";
import Link from "next/link";
import SectionTitle from "@/components/ui/SectionTitle";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade, Navigation } from "swiper/modules";

// Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css/navigation";

export default function ProyectosHome() {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/proyectos");
        if (res.ok) {
          const data = await res.json();
          setProjects(data.map((p: any) => {
            const slug = p.title.toLowerCase().replace(/\s+/g, '-');
            return {
              title: p.title,
              desc: p.description || p.descripcion,
              media: typeof p.media === 'string' ? JSON.parse(p.media) : (p.media || []),
              img: p.image_url,
              tech: typeof p.stack === 'string' ? JSON.parse(p.stack) : (p.stack || []),
              demoStatus: p.status === "En Producción" ? "ready" : "development",
              demoUrl: p.demo_url,
              internalUrl: `/proyectos#${slug}`,
              client_name: p.client_name,
              deployment_date: p.deployment_date,
            };
          }));
        }
      } catch (error) {
        console.error("Error loading home projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useGSAP(() => {
    if (loading) return;
    gsap.fromTo(".project-card",
      { opacity: 0, y: 100, rotateX: 30 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "expo.out",
        scrollTrigger: {
          trigger: ".projects-container",
          start: "top 85%",
        }
      }
    );
  }, [loading]);

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden bg-black/20">
      <div className="max-w-7xl mx-auto px-6 relative z-10">

        <SectionTitle
          badge="Portafolio Seleccionado"
          title="Ingeniería de Clase Mundial"
          subtitle="Proyectos de alto impacto diseñados para escalar globalmente."
          align="center"
        />

        <div className="projects-container grid gap-12 md:grid-cols-3 mt-20">
          {projects.map((p, i) => (
            <ProjectCard key={i} p={p} onExpand={() => setSelectedProject(p)} />
          ))}
        </div>
      </div>

      {/* THEATER MODE MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-3xl"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              className="relative max-w-6xl w-full h-full max-h-[90vh] glass-card-pro border border-white/20 shadow-[0_0_150px_rgba(6,182,212,0.2)] flex flex-col overflow-hidden"
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
                  autoplay={{ delay: 5000 }}
                  className="w-full h-full"
                >
                  {(selectedProject.media && selectedProject.media.length > 0 ? selectedProject.media : [{ type: 'image', url: selectedProject.img }]).map((m: any, idx: number) => (
                    <SwiperSlide key={idx} className="relative w-full h-full">
                      <div className="w-full h-full flex items-center justify-center p-4 md:p-8">
                        {m.type === "image" ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={m.url}
                              alt={`${selectedProject.title} detail ${idx}`}
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
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-6">
                      <h3 className="text-3xl md:text-5xl font-black text-white italic tracking-tight uppercase leading-none">
                        {selectedProject.title}
                      </h3>
                      {selectedProject.deployment_date && (
                        <div className="relative group/cal-modal cursor-default perspective-1000 scale-75 md:scale-90 origin-left">
                          <div className="w-12 h-14 bg-white rounded-xl overflow-hidden shadow-xl flex flex-col items-center border border-white/20">
                            <div className="w-full h-4 bg-red-600 flex items-center justify-center text-[6px] font-black text-white uppercase tracking-tighter">
                              {new Date(selectedProject.deployment_date).toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')}
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center p-1 leading-none">
                              <span className="text-black text-lg font-black">{new Date(selectedProject.deployment_date).getDate()}</span>
                              <span className="text-black/30 text-[5px] font-bold">{new Date(selectedProject.deployment_date).getFullYear()}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {selectedProject.client_name && (
                      <span className="inline-flex items-center gap-2 px-6 py-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-black rounded-full text-[10px] uppercase tracking-widest w-fit shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                        <FaUserTie className="text-[12px]" /> {selectedProject.client_name}
                      </span>
                    )}
                    <p className="text-white/60 text-lg md:text-xl font-medium max-w-3xl leading-relaxed italic mt-4">
                      {selectedProject.desc}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Link href={selectedProject.internalUrl} passHref>
                      <button className="px-10 py-5 bg-cyan-500 text-black font-black uppercase tracking-widest text-[10px] rounded-full hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] italic">
                        Detalles Pro
                      </button>
                    </Link>
                    {selectedProject.demoStatus === "ready" ? (
                      <a href={selectedProject.demoUrl} target="_blank" className="px-10 py-5 glass-light border border-cyan-500/50 text-cyan-400 font-black uppercase tracking-widest text-[10px] rounded-full hover:bg-cyan-500 hover:text-black transition-all italic shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                        Live Demo
                      </a>
                    ) : (
                      <button className="px-10 py-5 glass-light border border-white/5 text-white/20 font-black uppercase tracking-widest text-[10px] rounded-full cursor-not-allowed italic flex items-center gap-2">
                        <FaHammer className="text-[12px]" /> EN DESARROLLO
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ProjectCard({ p, onExpand }: { p: any, onExpand: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

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
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="project-card group relative p-8 rounded-[4rem] glass-card-pro border border-white/5 transition-all duration-500 hover:border-cyan-500/30 shadow-2xl overflow-hidden cursor-pointer"
      onClick={onExpand}
    >
      <div style={{ transform: "translateZ(100px)" }} className="relative z-10 flex flex-col h-full items-center text-center">

        {/* ENHANCED MEDIA CONTAINER */}
        <div className="relative rounded-[3rem] overflow-hidden w-full aspect-[4/3] md:aspect-square mb-10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/10 group/media">
          <Swiper
            modules={[Autoplay, Pagination, EffectFade]}
            effect="fade"
            pagination={{ clickable: true }}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            className="w-full h-full"
          >
            {p.media.map((m: any, idx: number) => (
              <SwiperSlide key={idx} className="relative w-full h-full bg-black/40">
                {m.type === "image" ? (
                  <Image
                    src={m.url}
                    alt={`${p.title} media ${idx}`}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover/media:scale-125"
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
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Expand Icon Overlay */}
          <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-all duration-500 bg-cyan-500/10 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white text-2xl shadow-2xl transform translate-y-10 group-hover/media:translate-y-0 transition-all duration-500">
              <FaExpandAlt />
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 px-6 py-2 rounded-full glass-light border border-white/20 text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
            <FaPlayCircle className="text-cyan-400" /> PRESENTACIÓN MULTIMEDIA
          </div>
        </div>

        {/* CONTENT CENTERED */}
        <div className="px-2 flex flex-col items-center w-full">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h3 className="title-fire text-2xl md:text-3xl font-bold text-white group-hover:text-cyan-400 transition-colors tracking-tight uppercase leading-none">
              {p.title}
            </h3>
            {p.deployment_date && (
              <div className="relative group/cal-card cursor-default perspective-1000 scale-50 origin-center">
                <div className="w-12 h-14 bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col items-center transform-gpu transition-all duration-300 group-hover/cal-card:-rotate-x-12 border border-white/20">
                  <div className="w-full h-4 bg-red-600 flex items-center justify-center text-[6px] font-black text-white uppercase tracking-tighter">
                    {new Date(p.deployment_date).toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')}
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center p-1 leading-none">
                    <span className="text-black text-lg font-black">{new Date(p.deployment_date).getDate()}</span>
                    <span className="text-black/30 text-[5px] font-bold">{new Date(p.deployment_date).getFullYear()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {p.client_name && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/5 border border-cyan-500/20 rounded-full text-cyan-400 text-[8px] font-black uppercase tracking-widest">
                <FaUserTie className="text-[9px]" /> {p.client_name}
              </span>
            )}
          </div>

          <p className="text-white/50 text-sm mb-8 leading-relaxed font-medium line-clamp-2 italic min-h-[40px] flex items-center justify-center">
            {p.desc}
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {p.tech.map((tech: string, idx: number) => (
              <span
                key={idx}
                className="text-[9px] px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/50 font-black uppercase tracking-[0.2em] group-hover:border-cyan-500/40 group-hover:text-cyan-400 transition-all"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-6 w-full max-w-[280px]">
            {/* CTA LINK */}
            <Link href={p.internalUrl} passHref className="flex-1" onClick={(e) => e.stopPropagation()}>
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="w-full inline-flex items-center justify-center gap-3 px-8 py-5 rounded-full btn-primary btn-alive btn-shimmer btn-border-glow text-[10px] font-black tracking-widest italic"
              >
                DETALLES <FaLaptopCode />
              </motion.button>
            </Link>

            {/* DEMO / STATUS */}
            <div onClick={(e) => e.stopPropagation()}>
              <DemoLink status={p.demoStatus} url={p.demoUrl} />
            </div>
          </div>
        </div>
      </div>

      {/* Extreme Glare */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#06b6d418] via-transparent to-[#ffffff08] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
    </motion.div>
  );
}

function DemoLink({ status, url }: { status: string, url: string }) {
  if (status === "ready") {
    return (
      <motion.a
        href={url}
        target="_blank"
        whileHover={{ scale: 1.1, rotate: 10 }}
        className="w-16 h-16 rounded-full glass-light border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all"
        title="Ver Demo en Vivo"
      >
        <FaExternalLinkAlt size={20} />
      </motion.a>
    );
  }

  return (
    <div className="relative group/demo">
      <motion.div
        className="w-16 h-16 rounded-full glass-light border border-white/10 flex items-center justify-center text-white/10 cursor-help"
        title="Este sistema está actualmente en construcción por ingeniería"
      >
        <FaHammer size={22} />
      </motion.div>

      <AnimatePresence>
        <motion.div
          className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl glass-card-pro border border-orange-500/40 text-[8px] font-black text-orange-400 uppercase tracking-[0.25em] whitespace-nowrap opacity-0 group-hover/demo:opacity-100 transition-all shadow-2xl z-[100]"
        >
          DESARROLLO ACTIVO 🚧
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
