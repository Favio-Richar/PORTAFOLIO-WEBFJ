"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  SiNextdotjs,
  SiPython,
  SiFastapi,
  SiFlutter,
  SiPostgresql,
  SiThreedotjs
} from "react-icons/si";
import SectionTitle from "@/components/ui/SectionTitle";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [profileVideo, setProfileVideo] = useState("");
  const [profileImage, setProfileImage] = useState("https://ui-avatars.com/api/?name=Favio+Jimenez&background=06b6d4&color=fff&size=512");
  const [profileName, setProfileName] = useState("Favio Jiménez");
  const [profileTitle, setProfileTitle] = useState("Ingeniero de Software Full Stack");
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.profile_video) setProfileVideo(data.profile_video);
          if (data.profile_image) setProfileImage(data.profile_image);
          if (data.full_name) setProfileName(data.full_name);
          if (data.title) setProfileTitle(data.title);
        }
      } catch (error) {
        console.error("Error cargando perfil:", error);
      }
    };
    loadProfile();
  }, []);

  // 3D Tilt Effect Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
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

  useGSAP(() => {
    // Reveal CTAs
    gsap.to(".cta-group", {
      opacity: 1,
      y: 0,
      duration: 1.5,
      delay: 0.8,
      ease: "power4.out",
    });

    // Stagger Reveal Tech Stack
    gsap.to(".tech-stack-group", {
      opacity: 1,
      duration: 0.1,
      delay: 1.2
    });

    gsap.fromTo(".tech-item",
      { opacity: 0, scale: 0.8, y: 30 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.7)",
        delay: 1.2
      }
    );
  }, []);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden"
      aria-label="Presentación principal"
    >
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-12">

          {/* HEADER SECTION WITH GLASS EFFECT FOR READABILITY */}
          <div className="w-full">
            <SectionTitle
              badge="Desarrollador Full Stack & Consultor Tecnológico"
              title={profileName}
              subtitle="Transformo ideas complejas en soluciones digitales de alto impacto. Especialista en desarrollo web escalable, automatización y visión estratégica."
              align="center"
            />

            {/* CTAs */}
            <div className="cta-group flex flex-wrap justify-center gap-6 pt-8">
              <Link href="/contacto" className="btn-primary btn-alive btn-shimmer px-10 py-4 text-lg">
                Solicitar asesoría
              </Link>
              <Link href="/proyectos" className="btn-secondary px-10 py-4 text-lg border-white/10 hover:border-cyan-500/50 bg-white/5 backdrop-blur-sm">
                Ver proyectos reales
              </Link>
            </div>
          </div>

          {/* 3D MEDIA SECTION (IMAGE + VIDEO) */}
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="perspective-1000 w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch"
          >
            {/* 3D IMAGE CARD */}
            <motion.div
              style={{ rotateX, rotateY }}
              className="relative group rounded-3xl overflow-hidden glass-light border border-white/10 h-[350px] md:h-[450px]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
              <Image
                src={profileImage}
                fill
                alt={`${profileName} Profile`}
                className="object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute bottom-6 left-6 z-20">
                <h3 className="text-2xl font-bold text-white text-glow-blue">Fundador</h3>
                <p className="text-cyan-400 font-medium">NextLevelSoftwarePro</p>
              </div>
            </motion.div>

            {/* 3D VIDEO CARD */}
            <motion.div
              style={{ rotateX, rotateY }}
              onClick={() => profileVideo && setShowVideoModal(true)}
              className="relative group rounded-3xl overflow-hidden glass-light border border-white/10 h-[350px] md:h-[450px] flex items-center justify-center bg-transparent cursor-pointer"
            >
              <div className="flex flex-col items-center space-y-4 z-20">
                <div className="w-20 h-20 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                  <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-cyan-400 border-b-[12px] border-b-transparent translate-x-1" />
                </div>
                <p className="text-white font-bold tracking-widest uppercase text-sm drop-shadow-lg">Ver Presentación</p>
              </div>

              {/* Simulation of nested depth */}
              <div className="absolute inset-4 border border-white/5 rounded-2xl pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-transparent opacity-60" />
            </motion.div>
          </div>

          {/* TECH STACK FOOTER - REDISEÑO PRO */}
          <div className="tech-stack-group flex flex-wrap justify-center gap-6 pt-12">
            {[
              { name: "Next.js", icon: <SiNextdotjs className="text-white" /> },
              { name: "Python", icon: <SiPython className="text-yellow-400" /> },
              { name: "FastAPI", icon: <SiFastapi className="text-emerald-400" /> },
              { name: "Flutter", icon: <SiFlutter className="text-blue-400" /> },
              { name: "PostgreSQL", icon: <SiPostgresql className="text-blue-300" /> },
              { name: "Three.js", icon: <SiThreedotjs className="text-white" /> },
            ].map((tech, i) => (
              <div
                key={tech.name}
                className="tech-item flex items-center gap-3 px-6 py-3 rounded-2xl glass-light border border-white/10 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all duration-300 cursor-default group"
              >
                <span className="text-2xl group-hover:scale-120 transition-transform duration-300">
                  {tech.icon}
                </span>
                <span className="text-white/80 group-hover:text-white font-bold text-sm tracking-wide">
                  {tech.name}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* MODAL DE VIDEO */}
      {showVideoModal && profileVideo && (
        <div
          onClick={() => setShowVideoModal(false)}
          className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-5xl w-full glass-card-pro border border-white/10 p-8 rounded-[4rem]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-white uppercase">Video de Presentación</h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="px-6 py-3 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 font-bold uppercase text-sm"
              >
                Cerrar
              </button>
            </div>
            <div className="bg-black/30 rounded-3xl overflow-hidden">
              {profileVideo.includes('youtube') || profileVideo.includes('vimeo') || profileVideo.includes('iframe') ? (
                <iframe
                  src={profileVideo}
                  className="w-full h-[70vh]"
                  title="Video Presentación"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={profileVideo} controls className="w-full h-[70vh] object-contain" />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
