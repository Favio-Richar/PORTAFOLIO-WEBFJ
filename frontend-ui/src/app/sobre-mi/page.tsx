"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { initialTimeline } from "@/lib/data/timeline";
import { initialEducation } from "@/lib/data/education";
import type { TimelineItem } from "@/lib/data/timeline";
import type { Education } from "@/lib/data/education";

import {
  FaPython,
  FaGraduationCap,
  FaLaptopCode,
  FaMobileAlt,
  FaServer,
  FaCheckCircle,
  FaCubes,
  FaRocket,
  FaChartLine,
  FaGlobe,
  FaDatabase,
  FaChartBar,
  FaHistory,
  FaBriefcase,
  FaCertificate,
  FaStar,
} from "react-icons/fa";

import {
  SiFastapi,
  SiNextdotjs,
  SiFlutter,
  SiPostgresql,
  SiTypescript,
  SiDocker,
  SiLinux,
} from "react-icons/si";

import CertModal from "./_CertModal";

export default function SobreMi() {
  const [profileImg, setProfileImg] = useState("https://ui-avatars.com/api/?name=Favio+Jimenez&background=06b6d4&color=fff&size=512");
  const [profileVideo, setProfileVideo] = useState("");
  const [timeline, setTimeline] = useState<TimelineItem[]>(initialTimeline);
  const [education, setEducation] = useState<Education[]>(initialEducation);
  const [viewingCert, setViewingCert] = useState<string | null>(null);

  // Solid style for cards (requested by user: not transparent)
  const solidCardStyle = "bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]";

  useEffect(() => {
    const loadData = async () => {
      try {
        const profileRes = await fetch("http://localhost:8000/api/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.profile_image) setProfileImg(profileData.profile_image);
          if (profileData.profile_video) setProfileVideo(profileData.profile_video);
        }

        const timelineRes = await fetch("http://localhost:8000/api/timeline");
        if (timelineRes.ok) {
          const timelineData = await timelineRes.json();
          setTimeline(timelineData.map((t: any) => ({
            ...t,
            id: t.id.toString(),
            desc: t.description,
            category: t.category,
            icon: t.icon
          })));
        }

        const eduRes = await fetch("http://localhost:8000/api/education");
        if (eduRes.ok) {
          const eduData = await eduRes.json();
          const mappedEdu = eduData.map((item: any) => ({
            id: item.id.toString(),
            degree: item.degree,
            institution: item.institution,
            location: item.location,
            startYear: item.start_year,
            endYear: item.end_year,
            certificateUrl: item.certificate_url
          }));
          setEducation(mappedEdu);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    loadData();
  }, []);

  const skills = [
    { name: "Python", icon: <FaPython className="text-yellow-400 text-3xl" /> },
    { name: "FastAPI", icon: <SiFastapi className="text-emerald-400 text-3xl" /> },
    { name: "Next.js", icon: <SiNextdotjs className="text-white text-3xl" /> },
    { name: "TypeScript", icon: <SiTypescript className="text-blue-400 text-3xl" /> },
    { name: "Flutter", icon: <SiFlutter className="text-sky-400 text-3xl" /> },
    { name: "PostgreSQL", icon: <SiPostgresql className="text-indigo-400 text-3xl" /> },
    { name: "Docker", icon: <SiDocker className="text-blue-500 text-3xl" /> },
    { name: "Linux / VPS", icon: <SiLinux className="text-orange-400 text-3xl" /> },
    { name: "SQL Server", icon: <FaDatabase className="text-red-500 text-3xl" /> },
    { name: "Power BI", icon: <FaChartBar className="text-yellow-500 text-3xl" /> },
  ];

  return (
    <div className="relative overflow-hidden pt-20 px-6 font-bold bg-[#020202] min-h-screen">

      {/* ACTIVOS TECNOLÓGICOS FLOTANTES (FONDO 4D) - REMOVIDO POR PREFERENCIA DE LIMPIEZA */}
      {/* <FloatingAssets /> */}

      {/* DECORACIÓN CORPORATIVA AVANZADA */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-cyan-500/5 blur-[250px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/5 blur-[200px] rounded-full pointer-events-none" />

      {/* SECCIÓN HERO: PERFIL PORTAL */}
      <section className="max-w-7xl mx-auto py-32 relative z-10">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-24 lg:gap-32">
          <div className="lg:w-5/12 flex justify-center sticky top-32">
            <ProfilePortal src={profileImg} />
          </div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "circOut" }}
            className="lg:w-7/12 text-center lg:text-left pt-12"
          >
            <span className="inline-block text-cyan-400 text-sm font-black tracking-[0.6em] uppercase mb-6 bg-cyan-500/10 px-4 py-1 rounded-full border border-cyan-500/20">
              INGENIERO DE SOFTWARE FULL STACK
            </span>
            <h2 className="title-fire text-5xl md:text-7xl font-black mb-10 uppercase leading-[0.9] tracking-tighter">
              Pasión por la <br /> Excelencia
            </h2>

            <div className="max-w-2xl mx-auto lg:mx-0">
              <p className="text-gray-300 text-2xl leading-relaxed mb-8 font-bold">
                Soy <span className="text-white font-black underline decoration-cyan-500/50 underline-offset-8">Favio Jiménez</span>, un arquitecto de software comprometido con la creación de ecosistemas digitales que impulsan el futuro corporativo.
              </p>
            </div>

            {profileVideo && (
              <div className="mt-12">
                <div className={`${solidCardStyle} p-10 hover:border-cyan-500/30 transition-all group`}>
                  <h4 className="text-cyan-400 text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    Video de Presentación
                  </h4>
                  <div className="max-w-4xl mx-auto aspect-video rounded-3xl overflow-hidden bg-black shadow-inner border border-white/5">
                    {profileVideo.includes('youtube') || profileVideo.includes('vimeo') || profileVideo.includes('iframe') ? (
                      <iframe
                        src={profileVideo}
                        className="w-full h-full"
                        title="Video Presentación"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video src={profileVideo} controls className="w-full h-full object-contain" />
                    )}
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </section>

      {/* ÁREAS DE ESPECIALIZACIÓN (TARJETAS 4D SÓLIDAS) */}
      <section className="max-w-7xl mx-auto py-32 border-t border-white/5 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div>
            <span className="block text-cyan-400 text-sm font-black tracking-[0.3em] uppercase mb-4">CORE CAPABILITIES</span>
            <h3 className="title-fire text-5xl md:text-7xl font-black uppercase leading-none tracking-tighter">
              Inmunidad <br /> a la Mediocridad
            </h3>
          </div>
          <p className="text-gray-500 max-w-md font-bold text-lg leading-relaxed">
            Dominio total del stack tecnológico para entregar soluciones que no solo funcionan, sino que lideran su categoría.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: <FaLaptopCode />, title: "ARQUITECTURA WEB", desc: "Interfaces de alto impacto y sistemas escalables con Next.js.", gradient: "from-blue-500/10 to-transparent" },
            { icon: <FaMobileAlt />, title: "APP UNIVERSE", desc: "Apps nativas y multiplataforma con Flutter y UX impecable.", gradient: "from-purple-500/10 to-transparent" },
            { icon: <FaServer />, title: "BACKEND ENG", desc: "APIs robustas y arquitecturas distribuidas de alto rendimiento.", gradient: "from-emerald-500/10 to-transparent" },
            { icon: <FaCubes />, title: "DESARROLLO MODULAR", desc: "Sistemas básicos y avanzados bajo arquitectura de módulos escalables.", gradient: "from-cyan-500/10 to-transparent" },
          ].map((c, i) => (
            <SpecCard key={i} c={c} style={solidCardStyle} />
          ))}
        </div>
      </section>

      {/* TECH STACK VISUALIZER & RESULTS SÓLIDO */}
      <section className="max-w-7xl mx-auto py-32 grid lg:grid-cols-2 gap-32 border-t border-white/5 relative z-10">
        <div className="relative">
          <h3 className="title-fire text-5xl md:text-7xl font-black uppercase tracking-tighter mb-16 flex items-center gap-6 leading-none">
            Ecosistema de <br /> Arquitectura & SW <div className="h-[1px] flex-1 bg-white/5" />
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {skills.map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8, scale: 1.05 }}
                className={`${solidCardStyle} !p-8 flex flex-col items-center gap-6 group hover:border-cyan-500/30 transition-all relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-5xl transition-transform group-hover:rotate-12 duration-500 z-10">{s.icon}</span>
                <span className="text-white/80 group-hover:text-white font-black text-[10px] uppercase tracking-[0.2em] text-center z-10">{s.name}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-24">
          <div>
            <h3 className="title-fire text-5xl md:text-7xl font-black uppercase tracking-tighter mb-16 flex items-center gap-6 leading-none">
              Resultados <br /> Reales <div className="h-[1px] flex-1 bg-white/5" />
            </h3>
            <div className="space-y-6">
              {[
                { label: "Sistemas en Producción", val: "+20", desc: "Arquitecturas robustas operando 24/7.", icon: <FaRocket />, pct: "85%" },
                { label: "Optimización Operativa", val: "60%", desc: "Reducción de costos y tiempos demostrable.", icon: <FaChartLine />, pct: "60%" },
                { label: "Sectores Impactados", val: "08", desc: "Desde logística hasta finanzas y retail.", icon: <FaGlobe />, pct: "40%" },
              ].map((m, i) => (
                <div key={i} className={`${solidCardStyle} p-8 group hover:border-cyan-500/30 transition-all duration-500 relative overflow-hidden`}>
                  <div className="flex items-center gap-8 relative z-10">
                    <div className="text-5xl font-black text-white/5 group-hover:text-cyan-500 drop-shadow-[0_0_15px_rgba(6,182,212,0)] group-hover:drop-shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-700 min-w-[140px] italic">
                      {m.val}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-cyan-500 text-xl">{m.icon}</span>
                        <h5 className="text-white font-black uppercase text-sm tracking-widest">{m.label}</h5>
                      </div>
                      <p className="text-gray-500 text-xs font-bold leading-relaxed">{m.desc}</p>

                      {/* Technical Level Indicator */}
                      <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: m.pct }}
                          transition={{ duration: 1.5, delay: 0.5 + i * 0.2 }}
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EDUCATION & FORMACIÓN SÓLIDO */}
      <section className="max-w-7xl mx-auto py-32 border-t border-white/5 relative z-10">
        <div className="text-center mb-20">
          <span className="block text-cyan-400 text-[10px] font-black tracking-[0.4em] uppercase mb-4">ACADEMIC EXCELLENCE</span>
          <h3 className="title-fire text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
            Formación <br className="md:hidden" /> Académica
          </h3>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {education.map((edu, idx) => (
            <div
              key={edu.id || idx}
              onClick={() => edu.certificateUrl && setViewingCert(edu.certificateUrl)}
              className={`${solidCardStyle} p-10 flex items-center gap-10 hover:border-cyan-500/20 transition-all group relative overflow-hidden ${edu.certificateUrl ? 'cursor-pointer hover:scale-[1.01]' : ''}`}
            >
              <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-4xl text-cyan-500 border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                <FaGraduationCap />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl text-white font-black uppercase tracking-tight mb-2">{edu.degree}</h4>
                <p className="text-cyan-400 text-sm font-black tracking-[0.4em] uppercase">{edu.institution} · {edu.location}</p>
                <p className="text-gray-500 text-xs mt-2 font-bold">{edu.startYear} - {edu.endYear}</p>
                {edu.certificateUrl && (
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 rounded-full border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-colors">
                    <FaCheckCircle className="text-cyan-400" />
                    <span className="text-cyan-400 text-[10px] font-black uppercase tracking-widest">Validado</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TIMELINE (ACADEMIC ROUTE - REDISEÑO LIMPIO) */}
      <section className="max-w-4xl mx-auto py-32 border-t border-white/5 relative z-10">
        <div className="text-center mb-40">
          <span className="block text-cyan-400 text-[10px] font-black tracking-[0.4em] uppercase mb-4">ACADEMIC_EXCELLENCE_v3.0</span>
          <h3 className="title-fire text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
            Ruta de <br className="hidden md:block" /> Excelencia <br /> Académica
          </h3>
        </div>

        <div className="relative pl-12 md:pl-20">
          {/* Línea Lateral Estilizada */}
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-500/50 via-cyan-500/20 to-transparent" />

          <div className="space-y-24">
            {timeline.map((t, i) => (
              <TimelineItem key={t.id || i} t={t} index={i} style={solidCardStyle} />
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION (ELITE STYLE SÓLIDO) */}
      <section className="relative py-60 px-6 overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h3 className="title-fire text-5xl md:text-7xl font-black mb-12 uppercase leading-none tracking-tighter">
            Iniciemos <br /> tu Siguiente <br /> Gran <span className="text-cyan-500">Salto</span>
          </h3>
          <p className="text-gray-400 text-lg md:text-xl font-bold mb-16 max-w-3xl mx-auto leading-relaxed italic">
            No busques un programador convencional, busca un socio estratégico especializado en ingeniería de software.
            Juntos transformaremos tus ideas en sistemas de alto rendimiento con un retorno de inversión garantizado por la excelencia académica y técnica.
          </p>
          <motion.a
            href="/contacto"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 40px rgba(6,182,212,0.3)",
              backgroundColor: "rgba(6,182,212,0.1)",
              color: "#06b6d4"
            }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-6 px-16 py-8 rounded-full bg-white text-black border-2 border-transparent transition-all text-sm font-black tracking-[0.4em] uppercase shadow-[0_30px_60px_-15px_rgba(255,255,255,0.1)]"
          >
            SOLICITAR CONSULTORÍA ⚡
          </motion.a>
        </div>
      </section>



      {/* MODAL CERTIFICADO SÓLIDO */}
      <CertModal
        viewingCert={viewingCert}
        onClose={() => setViewingCert(null)}
      />
    </div>
  );
}

function TimelineItem({ t, index, style }: { t: any, index: number, style: string }) {
  // Mapeo dinámico de iconos según categoría
  const getIcon = (category: string) => {
    switch (category) {
      case 'Educación': return <FaGraduationCap />;
      case 'Trabajo': return <FaBriefcase />;
      case 'Logro': return <FaStar />;
      case 'Certificación': return <FaCertificate />;
      default: return <FaRocket />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.1 }}
      viewport={{ once: true }}
      className="relative flex items-start gap-12 group"
    >
      {/* 3D Token Icon */}
      <div className="absolute -left-[64px] md:-left-[100px] flex flex-col items-center">
        <div className="w-16 h-16 rounded-[1.5rem] bg-[#0a0a0c] border border-cyan-500/30 flex items-center justify-center text-2xl text-cyan-400 shadow-[0_15px_35px_-10px_rgba(6,182,212,0.4)] group-hover:shadow-[0_20px_45px_-10px_rgba(6,182,212,0.6)] group-hover:scale-110 transition-all duration-500 transform-gpu preserve-3d">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-[1.5rem]" />
          <div className="relative z-10 drop-shadow-[0_5px_10px_rgba(6,182,212,0.5)]">
            {getIcon(t.category)}
          </div>
        </div>
        <div className="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-500/20 mt-8 group-hover:bg-cyan-500/50 transition-colors" />
      </div>

      <div className="flex-1">
        <div className={`${style} p-10 group hover:border-cyan-500/40 transition-all relative overflow-hidden bg-white/[0.01]`}>
          <div className="flex items-center gap-4 mb-6">
            <span className="px-5 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black tracking-widest uppercase">
              {t.year}
            </span>
            {t.category && (
              <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">{t.category}</span>
            )}
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          <h4 className="text-3xl text-white font-black uppercase tracking-tight mb-4 group-hover:text-cyan-400 transition-colors">{t.title}</h4>
          <p className="text-gray-400 font-bold leading-relaxed text-base lg:text-lg italic opacity-70 group-hover:opacity-100 transition-opacity">
            {t.desc}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ProfilePortal({ src }: { src: string }) {
  const portalRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(useSpring(y, { stiffness: 100, damping: 20 }), [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(useSpring(x, { stiffness: 100, damping: 20 }), [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!portalRef.current) return;
    const rect = portalRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.div
      ref={portalRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, perspective: 1000, transformStyle: "preserve-3d" }}
      className="relative w-[320px] h-[420px] md:w-[420px] md:h-[540px] group"
    >
      <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-[4.5rem] group-hover:border-cyan-500/50 transition-all duration-700 pointer-events-none" />
      <div className="absolute -inset-6 border border-cyan-500/10 rounded-[6rem] animate-pulse pointer-events-none" />
      <div className="absolute inset-4 bg-black rounded-[4rem] group-hover:bg-[#0a0a0c] transition-all pointer-events-none border border-white/5" />

      <div
        style={{ transform: "translateZ(100px)" }}
        className="absolute inset-10 rounded-[3.5rem] overflow-hidden border border-white/20 shadow-4xl transition-transform duration-700 bg-black"
      >
        <Image
          src={src}
          fill
          alt="Profile"
          className="object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
          sizes="(max-width: 768px) 100vw, 420px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent h-[15%] w-full animate-scan pointer-events-none opacity-40 z-20" />
      </div>
      {/* Badge eliminado por solicitud del usuario para evitar solapamiento */}
    </motion.div>
  );
}

function SpecCard({ c, style }: any) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(useSpring(y), [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(useSpring(x), [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`${style} !p-12 hover:border-cyan-500/30 transition-all relative overflow-hidden group shadow-4xl`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
      <div style={{ transform: "translateZ(80px)" }} className="text-7xl mb-12 text-white/10 group-hover:text-cyan-500 transition-all duration-700 block">
        {c.icon}
      </div>
      <div style={{ transform: "translateZ(120px)" }}>
        <h4 className="text-3xl text-white font-black mb-6 uppercase tracking-tighter leading-none group-hover:text-cyan-400 transition-colors">{c.title}</h4>
        <p className="text-gray-400 font-bold leading-relaxed text-base group-hover:text-gray-300 transition-colors">{c.desc}</p>
      </div>
    </motion.div>
  );
}

function FloatingAssets() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: Math.random() * 2000 - 1000, y: Math.random() * 2000 - 1000, rotate: 0, scale: Math.random() * 0.5 + 0.5 }}
          animate={{ x: Math.random() * 2000 - 1000, y: Math.random() * 2000 - 1000, rotate: 360, scale: [0.5, 0.8, 0.5] }}
          transition={{ duration: Math.random() * 30 + 30, repeat: Infinity, ease: "linear" }}
          className="absolute text-cyan-500/10 font-mono text-[8vw] select-none uppercase font-black tracking-tighter"
        >
          {["01", "FJV", "ELITE", "TECH", "CORE"][i % 5]}
        </motion.div>
      ))}
    </div>
  );
}
