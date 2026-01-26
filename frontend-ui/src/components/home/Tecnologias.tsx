"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import {
  FaPython,
  FaReact,
  FaHtml5,
  FaCss3Alt,
  FaDatabase,
  FaAngular,
} from "react-icons/fa";

import {
  SiFastapi,
  SiFlutter,
  SiPostgresql,
  SiTypescript,
  SiNextdotjs,
  SiSass,
} from "react-icons/si";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { gsap } from "@/lib/gsap";
import SectionTitle from "@/components/ui/SectionTitle";

export default function Tecnologias() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const tech = [
    { name: "Python", icon: <FaPython size={50} className="text-[#3776AB]" />, color: "#3776AB" },
    { name: "FastAPI", icon: <SiFastapi size={50} className="text-[#05998B]" />, color: "#05998B" },
    { name: "Next.js", icon: <SiNextdotjs size={50} className="text-white" />, color: "#ffffff" },
    { name: "TypeScript", icon: <SiTypescript size={50} className="text-[#3178C6]" />, color: "#3178C6" },
    { name: "React", icon: <FaReact size={50} className="text-[#61DAFB]" />, color: "#61DAFB" },
    { name: "Flutter", icon: <SiFlutter size={50} className="text-[#02569B]" />, color: "#02569B" },
    { name: "PostgreSQL", icon: <SiPostgresql size={50} className="text-[#4169E1]" />, color: "#4169E1" },
    { name: "SQL Server", icon: <FaDatabase size={50} className="text-[#CC2927]" />, color: "#CC2927" },
    { name: "HTML5", icon: <FaHtml5 size={50} className="text-[#E34F26]" />, color: "#E34F26" },
    { name: "CSS3", icon: <FaCss3Alt size={50} className="text-[#1572B6]" />, color: "#1572B6" },
    { name: "SCSS", icon: <SiSass size={50} className="text-[#CC6699]" />, color: "#CC6699" },
    { name: "Angular", icon: <FaAngular size={50} className="text-[#DD0031]" />, color: "#DD0031" },
  ];

  useGSAP(() => {
    if (typeof window === "undefined") return;

    const wrappers = cardsRef.current?.querySelectorAll(".tech-card-wrapper");
    if (!wrappers) return;

    gsap.fromTo(
      wrappers,
      {
        opacity: 0,
        y: 80,
        scale: 0.5,
        rotateX: 45,
        z: -200,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        z: 0,
        duration: 1.2,
        stagger: {
          amount: 0.8,
          grid: "auto",
          from: "center",
        },
        ease: "elastic.out(1, 0.75)",
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 85%",
        },
      }
    );
  }, []);

  return (
    <section ref={sectionRef} className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <SectionTitle
          badge="Herramientas & Frameworks"
          title="Tecnologías Que Domino"
          subtitle="Stack moderno, escalable y usado en proyectos reales"
          align="center"
        />

        <p className="text-center text-white/50 max-w-2xl mx-auto text-lg mb-20 font-medium">
          Stack moderno, escalable y usado en proyectos reales de alto rendimiento.
        </p>

        <div
          ref={cardsRef}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8"
        >
          {tech.map((t, i) => (
            <div key={i} className="tech-card-wrapper">
              <TechCard t={t} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TechCard({ t }: { t: any }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

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
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      initial={{ y: 0 }}
      animate={{
        y: [0, -20, 0],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: Math.random() * 3
      }}
      className="tech-card group relative flex flex-col items-center justify-center p-8 rounded-[2.5rem] glass-card-pro border border-white/5 hover:border-white/20 transition-all duration-500 shadow-2xl overflow-hidden"
    >
      {/* Dynamic Brand Glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at center, ${t.color}, transparent 80%)` }}
      />

      <div
        style={{ transform: "translateZ(60px)" }}
        className="relative z-10 group-hover:scale-110 transition-transform duration-500"
      >
        <div className="filter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_20px_var(--tw-shadow-color)] transition-all duration-500" style={{ '--tw-shadow-color': t.color } as any}>
          {t.icon}
        </div>
      </div>

      <p
        style={{ transform: "translateZ(40px)" }}
        className="mt-6 font-black text-white/40 group-hover:text-white transition-colors duration-500 z-10 text-xs tracking-[0.2em] uppercase"
      >
        {t.name}
      </p>

      {/* Internal Glare Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
}
