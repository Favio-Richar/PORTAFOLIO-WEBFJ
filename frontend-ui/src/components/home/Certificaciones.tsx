"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { FaCode, FaDatabase, FaPython, FaDocker, FaMobileAlt, FaUserGraduate, FaTimes, FaSearchPlus, FaCheckCircle } from "react-icons/fa";
import { SiFastapi, SiNextdotjs } from "react-icons/si";
import SectionTitle from "@/components/ui/SectionTitle";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

/* ==========================================
   MAPA DE CLASES ESTÁTICAS (TAILWIND SAFE)
========================================== */
const glowColors: Record<string, string> = {
  blue: "bg-cyan-500/30",
  indigo: "bg-blue-600/30",
  emerald: "bg-emerald-500/30",
  sky: "bg-sky-400/30",
  gray: "bg-white/20",
  yellow: "bg-yellow-500/30",
  gold: "bg-amber-400/40",
};

/* ==========================================
   CERTIFICACIONES (PREPARADAS PARA ADMIN)
========================================== */
const certs = [
  {
    name: "Ingeniero Informático",
    desc: "Título Profesional de Grado Superior. Especialización en Arquitectura de Software, Redes e Inteligencia de Datos.",
    icon: <FaUserGraduate className="text-amber-400 text-5xl" />,
    level: "Título Profesional",
    color: "gold",
    certificateUrl: "https://images.unsplash.com/photo-1589330694653-ded6df03f754?q=80&w=1200", // Simulación
    badge: "Grado Académico",
  },
  {
    name: "Desarrollo Web Moderno",
    desc: "Arquitectura limpia, UI/UX, SSR, componentes reutilizables y micro-servicios frontales.",
    icon: <FaCode className="text-blue-400 text-4xl" />,
    level: "Avanzado",
    color: "blue",
    certificateUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200",
  },
  {
    name: "Python Profesional",
    desc: "Automatización, scripting avanzado, POO, data processing y backend robusto.",
    icon: <FaPython className="text-yellow-400 text-4xl" />,
    level: "Experto",
    color: "yellow",
    certificateUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200",
  },
  {
    name: "APIs con FastAPI",
    desc: "JWT, OAuth2, documentación OpenAPI, servicios escalables y de alto rendimiento.",
    icon: <SiFastapi className="text-emerald-400 text-4xl" />,
    level: "Avanzado",
    color: "emerald",
    certificateUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc48?q=80&w=1200",
  },
  {
    name: "Next.js & React",
    desc: "Frameworks modernos, SSR, ISR, API routes y optimización crítica de rendimiento.",
    icon: <SiNextdotjs className="text-white text-4xl" />,
    level: "Avanzado",
    color: "gray",
    certificateUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1200",
  },
  {
    name: "Bases de Datos PostgreSQL",
    desc: "Diseño de modelos, consultas optimizadas, índices, vistas y procedimientos almacenados.",
    icon: <FaDatabase className="text-indigo-400 text-4xl" />,
    level: "Intermedio",
    color: "indigo",
    certificateUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=1200",
  },
  {
    name: "Flutter Avanzado",
    desc: "Ecosistema móvil completo con arquitectura limpia, inyección de dependencias y Provider/BLoC.",
    icon: <FaMobileAlt className="text-sky-400 text-4xl" />,
    level: "Intermedio",
    color: "sky",
    certificateUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1200",
  },
  {
    name: "Fundamentos de Docker",
    desc: "Contenedores, imágenes, volúmenes, redes orchestración y despliegue continuo.",
    icon: <FaDocker className="text-blue-500 text-4xl" />,
    level: "Intermedio",
    color: "blue",
    certificateUrl: "https://images.unsplash.com/photo-1605745341112-85968b193ef5?q=80&w=1200",
  },
];

/* ==========================================
   CONFIGURACIÓN DE ICONOS DINÁMICOS
========================================== */
const iconMap: Record<string, any> = {
  FaUserGraduate: <FaUserGraduate className="text-amber-400 text-5xl" />,
  FaCode: <FaCode className="text-blue-400 text-4xl" />,
  FaPython: <FaPython className="text-yellow-400 text-4xl" />,
  SiFastapi: <SiFastapi className="text-emerald-400 text-4xl" />,
  SiNextdotjs: <SiNextdotjs className="text-white text-4xl" />,
  FaDatabase: <FaDatabase className="text-indigo-400 text-4xl" />,
  FaMobileAlt: <FaMobileAlt className="text-sky-400 text-4xl" />,
  FaDocker: <FaDocker className="text-blue-500 text-4xl" />,
  FaCertificate: <FaCode className="text-cyan-400 text-4xl" />, // Fallback
};

/* ==========================================
   COMPONENTE PRINCIPAL
========================================== */
export default function Certificaciones() {
  const [displayCerts, setDisplayCerts] = useState(certs); // Inicializar con el hardcoded

  useEffect(() => {
    const loadDynamicCerts = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/certifications");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const mapped = data.map((c: any) => ({
              name: c.title,
              desc: c.description,
              icon: iconMap[c.icon] || iconMap["FaCertificate"],
              level: c.level,
              color: c.color || "blue",
              certificateUrl: c.credential_url,
              badge: c.badge
            }));
            setDisplayCerts(mapped);
          }
        }
      } catch (error) {
        console.error("Error cargando certificaciones dinámicas:", error);
      }
    };
    loadDynamicCerts();
  }, []);

  return (
    <section className="relative max-w-7xl mx-auto px-6 py-32 overflow-hidden">

      {/* Glows Decorativos */}
      <div className="absolute -top-24 right-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 blur-[160px] rounded-full pointer-events-none"></div>

      <SectionTitle
        badge="Trayectoria Académica"
        title="Credenciales Profesionales"
        subtitle="Formación universitaria y certificaciones de alto nivel que avalan mi capacidad técnica en el diseño y construcción de ecosistemas digitales complejos."
        align="center"
      />

      {/* Grid Pro */}
      <div className="cert-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
        {displayCerts.map((c, i) => (
          <CertCard key={i} c={c} i={i} />
        ))}
      </div>
    </section>
  );
}

function CertCard({ c, i }: { c: any, i: number }) {
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

  const handleClick = () => {
    if (c.certificateUrl) {
      window.open(c.certificateUrl, "_blank");
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: i * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`group relative p-10 rounded-[3rem] glass-card-pro border transition-all duration-500 cursor-pointer overflow-hidden ${c.color === "gold" ? "border-amber-500/30 hover:border-amber-500/60" : "border-white/5 hover:border-cyan-500/40"
        }`}
    >
      {/* Dynamic Background Glow */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-20 blur-[80px] transition-all duration-700 pointer-events-none ${glowColors[c.color]}`}
      />

      <div style={{ transform: "translateZ(60px)" }} className="relative z-10 flex flex-col items-center">

        {/* TOP BADGE FOR SPECIAL CERTS */}
        {c.badge && (
          <div className="absolute -top-4 -right-4 px-3 py-1 bg-amber-500 text-black text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg transform rotate-12">
            {c.badge}
          </div>
        )}

        <div className="mb-8 p-6 rounded-[2rem] bg-black/20 border border-white/5 group-hover:scale-110 group-hover:border-cyan-500/20 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all duration-500">
          {c.icon}
        </div>

        <h3 className="title-fire text-xl md:text-2xl font-bold text-white text-center mb-4 drop-shadow-md group-hover:text-cyan-400 transition-colors uppercase tracking-tight leading-tight">
          {c.name}
        </h3>

        <p className="text-white/40 text-sm text-center font-medium leading-relaxed mb-8 line-clamp-3">
          {c.desc}
        </p>

        <div className="mt-auto w-full space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border tracking-widest uppercase transition-colors ${c.color === "gold"
              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
              : "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
              }`}>
              {c.level}
            </span>
          </div>

          <button
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full glass-light border border-white/10 group-hover:border-white/20 text-[10px] font-black text-white/40 group-hover:text-white uppercase tracking-widest transition-all"
          >
            {c.color === "gold" ? "VER TÍTULO" : "VER CERTIFICADO"} <FaSearchPlus className="group-hover:text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Subtle Scanner Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 h-1/2 w-full animate-pulse pointer-events-none" />
    </motion.div>
  );
}
