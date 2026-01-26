"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { FaWhatsapp, FaEnvelope, FaPhone, FaLinkedin } from "react-icons/fa";
import SectionTitle from "@/components/ui/SectionTitle";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

export default function ContactoHome() {
  const containerRef = useRef<HTMLDivElement>(null);

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
    gsap.to(".contact-box", {
      opacity: 1,
      y: 0,
      duration: 1.5,
      ease: "expo.out",
      scrollTrigger: {
        trigger: ".contact-box",
        start: "top 85%",
      }
    });

    gsap.fromTo(".contact-item-reveal",
      { opacity: 0, scale: 0.8, y: 50 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: ".contact-items-grid",
          start: "top 85%",
        }
      }
    );
  }, []);

  return (
    <section className="relative py-40 px-6 overflow-hidden bg-black/40">
      <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center">

        <SectionTitle
          badge="Elite Networking"
          title="¿Listo para iniciar tu visión?"
          subtitle="Respuesta inmediata para proyectos de alto impacto."
          align="center"
        />

        {/* 3D INTERACTIVE CONTACT BOX */}
        <div className="perspective-1000 w-full max-w-5xl">
          <motion.div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative group rounded-[4rem] glass-light p-10 md:p-16 border border-white/10 shadow-[0_0_100px_rgba(6,182,212,0.15)]"
          >
            <div style={{ transform: "translateZ(100px)" }} className="relative z-20 space-y-16">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* LinkedIn */}
                <ContactItem
                  href="https://linkedin.com/in/faviojimenez"
                  icon={<FaLinkedin />}
                  label="LinkedIn"
                  sub="Networking"
                  vibrantColor="#00A0DC"
                  className="bg-sky-500/10 hover:bg-sky-500/30 text-sky-400 border-sky-500/30"
                />

                {/* WhatsApp */}
                <ContactItem
                  href="https://wa.me/56911111111"
                  icon={<FaWhatsapp />}
                  label="WhatsApp"
                  sub="Instantáneo"
                  vibrantColor="#25D366"
                  className="bg-green-500/10 hover:bg-green-500/30 text-green-400 border-green-500/30"
                />

                {/* Correo */}
                <ContactItem
                  href="mailto:contacto@webfj.cl"
                  icon={<FaEnvelope />}
                  label="Email"
                  sub="Corporativo"
                  vibrantColor="#ffffff"
                  className="bg-white/5 hover:bg-white/20 text-white border-white/20"
                />

                {/* Llamada */}
                <ContactItem
                  href="tel:+56911111111"
                  icon={<FaPhone />}
                  label="Llamar"
                  sub="Urgente"
                  vibrantColor="#06b6d4"
                  className="bg-cyan-500/10 hover:bg-cyan-500/30 text-cyan-400 border-cyan-500/30"
                />

              </div>

              {/* CTA CENTRAL */}
              <div className="flex justify-center">
                <motion.a
                  href="/contacto"
                  whileHover={{ scale: 1.05, rotate: -1 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary btn-alive btn-shimmer btn-border-glow px-12 py-5 text-lg font-black tracking-widest italic"
                >
                  Agendar Consultoría Pro
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="mt-20 flex flex-col items-center gap-4">
          <p className="text-white/20 text-sm uppercase tracking-[0.3em] font-bold">Disponible Globalmente — Chile 🇨🇱</p>
          <div className="flex gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-cyan-500/60 animate-pulse delay-75" />
            <span className="w-2 h-2 rounded-full bg-cyan-500/30 animate-pulse delay-150" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactItem({ href, icon, label, sub, className, vibrantColor }: any) {
  const [particles, setParticles] = useState<any[]>([]);

  const triggerExplosion = () => {
    const newParticles = Array.from({ length: 15 }).map((_, i) => ({
      id: Math.random(),
      x: 0,
      y: 0,
      scale: 0.5 + Math.random() * 1.5,
      rotate: Math.random() * 360,
      angle: (i / 15) * Math.PI * 2 + (Math.random() * 0.5),
      speed: 100 + Math.random() * 200,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1200);
  };

  return (
    <div className="relative isolate contact-item-reveal">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 0, x: "-50%", y: "-50%" }}
            animate={{
              opacity: 0,
              scale: p.scale,
              x: Math.cos(p.angle) * p.speed - (50),
              y: Math.sin(p.angle) * p.speed - (50),
              rotate: p.rotate
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[100] text-3xl"
            style={{ color: vibrantColor, textShadow: `0 0 15px ${vibrantColor}` }}
          >
            {icon}
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={triggerExplosion}
        whileHover={{ y: -20, scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        className={`
          flex flex-col items-center justify-center p-8 rounded-[3.5rem] border backdrop-blur-xl
          transition-all duration-500 group/item shadow-2xl relative overflow-hidden
          ${className}
        `}
      >
        {/* Glow de fondo dinámico INTENSO */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500"
          style={{ background: `radial-gradient(circle at center, ${vibrantColor}, transparent 80%)` }}
        />

        <div className="text-6xl mb-6 group-hover/item:scale-125 group-hover/item:-rotate-12 transition-all duration-500 z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
          {icon}
        </div>
        <span className="font-black text-2xl mb-1 tracking-widest uppercase z-10 text-glow-blue">{label}</span>
        <span className="text-xs opacity-80 font-bold uppercase tracking-widest z-10">{sub}</span>

        {/* Pulse Pro */}
        <div className="absolute top-8 right-8 w-4 h-4 rounded-full bg-current opacity-30 animate-ping" />
        <div className="absolute top-8 right-8 w-3 h-3 rounded-full bg-current shadow-[0_0_15px_currentColor] z-10" />
      </motion.a>
    </div>
  );
}
