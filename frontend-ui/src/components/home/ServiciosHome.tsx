"use client";

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { FaTimes } from "react-icons/fa";
import SectionTitle from "@/components/ui/SectionTitle";

import { initialServices } from "@/lib/data/services";

export default function ServiciosHome() {
  const sectionRef = useRef<HTMLElement>(null);
  const [servicios, setServicios] = useState(initialServices);

  useEffect(() => {
    const saved = localStorage.getItem("portfolio_services");
    if (saved) {
      setServicios(JSON.parse(saved));
    }
  }, []);

  useGSAP(() => {
    gsap.fromTo(".services-grid",
      { opacity: 0, y: 100 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power4.out",
        scrollTrigger: {
          trigger: ".services-grid",
          start: "top 85%",
        }
      }
    );

    gsap.fromTo(".service-card",
      { opacity: 0, scale: 0.9, y: 50 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: ".services-grid",
          start: "top 80%",
        }
      }
    );
  }, []);

  return (
    <section ref={sectionRef} className="section relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <SectionTitle
          badge="Lo que elijo ofrecer"
          title="Servicios Especializados"
          subtitle="Enfoque de alto impacto para negocios modernos."
          align="center"
        />

        <div className="services-grid grid gap-8 md:grid-cols-2 lg:grid-cols-4 opacity-0">
          {servicios.map((s, i) => (
            <ServiceCard key={i} s={s} />
          ))}
        </div>

        <div className="text-center mt-24">
          <motion.a
            href="/cotizar"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-4 px-12 py-5 rounded-full btn-primary btn-alive btn-shimmer text-xl transition-all duration-300 group"
          >
            Solicitar un Servicio
            <span className="text-2xl group-hover:translate-x-2 transition-transform">→</span>
          </motion.a>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ s }: { s: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

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

  return (
    <>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="service-card group relative p-10 rounded-[2.5rem] glass-light border border-white/10 transition-all duration-500 hover:border-cyan-500/50 cursor-pointer"
      >
        <div style={{ transform: "translateZ(60px)" }} className="relative z-10">
          <motion.div
            onClick={() => setIsExpanded(true)}
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="w-24 h-24 mb-8 rounded-[1.5rem] overflow-hidden border-2 border-white/10 group-hover:border-cyan-500/50 transition-all shadow-2xl bg-black/40 group/img relative"
          >
            <Image
              src={s.icon}
              fill
              alt={s.title}
              quality={100}
              className="object-cover group-hover:brightness-110 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-cyan-500/0 group-hover/img:bg-cyan-500/10 transition-colors pointer-events-none" />
          </motion.div>

          <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors drop-shadow-xl tracking-tight">
            {s.title}
          </h3>

          <p className="text-base text-white/70 mb-8 leading-relaxed font-medium">
            {s.desc}
          </p>

          <ul className="space-y-3">
            {s.features.map((f: string, idx: number) => (
              <li key={idx} className="flex items-center gap-3 text-sm text-white/40 font-semibold group-hover:text-white/60 transition-colors">
                <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Glass depth effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]" />
      </motion.div>

      {/* 4D-LIKE MAGNIFICATION MODAL */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.5, rotateY: 90, opacity: 0 }}
              animate={{ scale: 1, rotateY: 0, opacity: 1 }}
              exit={{ scale: 0.5, rotateY: -90, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="relative max-w-4xl w-full aspect-square md:aspect-video rounded-[3rem] overflow-hidden border border-white/20 shadow-[0_0_100px_rgba(6,182,212,0.3)] glass-light"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={s.icon}
                fill
                alt={s.title}
                quality={100}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              <button
                onClick={() => setIsExpanded(false)}
                className="absolute top-8 right-8 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/20 z-50 shadow-2xl"
              >
                <FaTimes className="text-2xl" />
              </button>

              <div className="absolute bottom-12 left-12 right-12 z-10">
                <motion.h4
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-2xl"
                >
                  {s.title}
                </motion.h4>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl md:text-2xl text-cyan-400 font-bold bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-white/5 inline-block"
                >
                  {s.desc}
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
