"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  FaLaptopCode,
  FaTools,
  FaNetworkWired,
  FaRobot,
  FaDatabase
} from "react-icons/fa";
import SectionTitle from "@/components/ui/SectionTitle";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

export default function Experiencia() {
  const [experiences, setExperiences] = useState<any[]>([]);

  useEffect(() => {
    const loadExperiences = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/experiences");
        if (res.ok) {
          const data = await res.json();
          // Mapear datos del backend al formato del frontend
          const mappedData = data.map((exp: any) => ({
            icon: <FaLaptopCode className="text-primary text-4xl" />,
            cargo: exp.position || "Sin posición",
            empresa: exp.company || "Sin empresa",
            año: exp.period || "Sin período",
            location: exp.location,
            type: exp.employment_type,
            desc: exp.description || "Sin descripción",
            skills: exp.technologies ?
              (typeof exp.technologies === 'string' ? JSON.parse(exp.technologies) : exp.technologies)
              : []
          }));
          setExperiences(mappedData.length > 0 ? mappedData : fallbackExp);
        } else {
          setExperiences(fallbackExp);
        }
      } catch (error) {
        console.error("Error cargando experiencias:", error);
        setExperiences(fallbackExp);
      }
    };
    loadExperiences();
  }, []);

  const fallbackExp = [
    {
      icon: <FaLaptopCode className="text-primary text-4xl" />,
      cargo: "Desarrollador Full Stack",
      empresa: "Proyectos Freelance",
      año: "2022 - Actualidad",
      desc:
        "Desarrollo de aplicaciones web, móviles y APIs con Python, FastAPI, Next.js, Flutter, PostgreSQL y Docker. Implementación de arquitecturas escalables, despliegue en VPS Linux, CI/CD, optimización de rendimiento y diseño UI/UX moderno.",
      skills: ["FastAPI", "Next.js", "Flutter", "PostgreSQL", "Docker", "VPS Linux"],
    },
    {
      icon: <FaRobot className="text-sky-400 text-4xl" />,
      cargo: "Automatización y Procesos",
      empresa: "Práctica Profesional – TI",
      año: "2023",
      desc:
        "Automatización de flujos empresariales con Power Automate, integración con correo corporativo, SharePoint y bases de datos. Creación de bots de automatización y scripts en Python para extracción/limpieza de datos.",
      skills: ["Power Automate", "Python", "SharePoint", "Automatización"],
    },
    {
      icon: <FaDatabase className="text-red-500 text-4xl" />,
      cargo: "Analista de Datos / SQL Server",
      empresa: "Práctica Profesional – Área TI",
      año: "2023",
      desc:
        "Administración de SQL Server, creación de vistas, procedimientos almacenados, consultas optimizadas, triggers, respaldos y mantenimiento preventivo. Integraciones con sistemas internos corporativos.",
      skills: ["SQL Server", "Consultas", "Optimización", "Procedimientos"],
    },
    {
      icon: <FaTools className="text-yellow-400 text-4xl" />,
      cargo: "Soporte TI / Técnico Informático",
      empresa: "PYMEs en Chile",
      año: "2021 - 2022",
      desc:
        "Instalación y configuración de sistemas, mantenimiento preventivo, reparación de equipos, instalación de software corporativo, Office, Windows, antivirus y redes empresariales.",
      skills: ["Windows", "Office", "Hardware", "Drivers", "Antivirus"],
    },
    {
      icon: <FaNetworkWired className="text-green-500 text-4xl" />,
      cargo: "Redes y Telecomunicaciones",
      empresa: "Servicios Técnicos TI",
      año: "2021 - Actualidad",
      desc:
        "Instalación de redes, routers, cableado estructurado, configuración de VLAN, WiFi empresarial y dispositivos IoT. Diagnóstico y solución de problemas de conectividad.",
      skills: ["Redes", "Cableado", "Routers", "IoT"],
    },
  ];

  useGSAP(() => {
    gsap.fromTo(".experience-card",
      { opacity: 0, x: (i) => i % 2 === 0 ? -100 : 100, filter: "blur(10px)" },
      {
        opacity: 1,
        x: 0,
        filter: "blur(0px)",
        duration: 1,
        stagger: 0.3,
        ease: "power4.out",
        scrollTrigger: {
          trigger: ".experience-container",
          start: "top 80%",
        }
      }
    );
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 py-32 relative overflow-hidden">
      <SectionTitle
        badge="Trayectoria y Logros"
        title="Experiencia Profesional"
        subtitle="Construyendo el futuro digital paso a paso con solidez técnica."
        align="center"
      />

      {/* Tarjetas de experiencia */}
      <div className="experience-container flex flex-col gap-12 relative max-w-5xl mx-auto">
        {(experiences.length > 0 ? experiences : fallbackExp).map((e: any, i: number) => (
          <ExperienceCard key={i} e={e} i={i} />
        ))}
      </div>
    </section>
  );
}

function ExperienceCard({ e, i }: { e: any, i: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

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
      initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: i * 0.1 }}
      viewport={{ once: true }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="experience-card group relative p-8 md:p-10 rounded-[2.5rem] glass-light border border-white/10 transition-colors duration-500 hover:border-cyan-500/40"
    >
      <div style={{ transform: "translateZ(40px)" }} className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
          <div className="w-16 h-16 bg-black/30 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-cyan-500/30 transition-colors shadow-2xl">
            {e.icon}
          </div>

          <div className="flex-1">
            <h3 className="title-fire text-2xl md:text-3xl font-bold text-white group-hover:text-cyan-400 transition-colors drop-shadow-md">
              {e.cargo}
            </h3>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <span className="text-cyan-400 font-bold tracking-wide uppercase text-sm">
                {e.empresa}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-white/60 font-medium text-sm italic">
                {e.año}
              </span>
              {(e.location || e.type) && (
                <>
                  <span className="text-white/40">•</span>
                  <span className="text-white/50 font-bold text-[10px] uppercase tracking-widest px-2 py-0.5 bg-white/5 rounded-md">
                    {e.location} {e.type && `(${e.type})`}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <p className="text-white/80 text-base md:text-lg leading-relaxed font-medium mb-8">
          {e.desc}
        </p>

        <div className="flex flex-wrap gap-2">
          {e.skills.map((skill: string, idx: number) => (
            <span
              key={idx}
              className="px-4 py-1.5 text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded-xl font-bold tracking-tight drop-shadow-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Decorative accent */}
      <div className="absolute top-8 right-8 w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}
