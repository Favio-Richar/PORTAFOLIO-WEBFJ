"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

import {
  FaMobileAlt,
  FaLaptopCode,
  FaServer,
  FaDatabase,
  FaCloud,
  FaCogs,
  FaArrowRight,
  FaTools,
  FaDesktop,
  FaShieldAlt,
  FaSync,
  FaNetworkWired,
  FaWrench,
  FaCheckCircle,
} from "react-icons/fa";

// 🔵 SERVICIOS PRINCIPALES
const servicios = [
  {
    titulo: "Desarrollo Web Profesional",
    descripcion: "Sitios web modernos, rápidos, optimizados para SEO y adaptados a cualquier dispositivo.",
    largo: "Desarrollo completo con Next.js, SSR, ISG, SEO avanzado, paneles administrativos, dashboards y componentes personalizados para entornos corporativos.",
    icon: <FaLaptopCode />,
  },
  {
    titulo: "Aplicaciones Móviles",
    descripcion: "Aplicaciones para Android y iOS con rendimiento nativo y diseño profesional.",
    largo: "Apps creadas con Flutter, arquitectura limpia, integración con API, notificaciones push, autenticación segura y publicación en tiendas oficiales.",
    icon: <FaMobileAlt />,
  },
  {
    titulo: "APIs y Backend Empresarial",
    descripcion: "APIs rápidas y escalables con FastAPI o NestJS para sistemas móviles y web.",
    largo: "Autenticación JWT, gestión de roles, permisos, microservicios, dockerización, CI/CD y despliegue sólido en infraestructura VPS Linux.",
    icon: <FaServer />,
  },
  {
    titulo: "Bases de Datos y Modelado",
    descripcion: "Diseño experto de PostgreSQL con modelos optimizados y consultas eficientes.",
    largo: "Modelado profesional de bases de datos, índices, funciones SQL, triggers, migraciones y auditorías de datos empresariales.",
    icon: <FaDatabase />,
  },
  {
    titulo: "DevOps y Despliegues",
    descripcion: "Docker, VPS, NGINX, SSL, monitoreo y pipelines para proyectos profesionales.",
    largo: "Integración continua con GitHub Actions, escalamiento, certificados SSL, monitoreo de logs y seguridad en entornos de producción.",
    icon: <FaCloud />,
  },
  {
    titulo: "Sistemas Empresariales / ERP",
    descripcion: "Desarrollo de sistemas completos con ventas, inventario, reportes y gestión de usuarios.",
    largo: "Sistemas ERP/CRM personalizados con roles avanzados, dashboards dinámicos, reportes PDF, gráficas analíticas y soporte técnico extendido.",
    icon: <FaCogs />,
  },
];

const serviciosTecnicos = [
  { titulo: "Soporte Técnico", descripcion: "Solución de incidencias y mantenimiento TI.", icon: <FaTools /> },
  { titulo: "Optimización de Sistemas", descripcion: "Rendimiento máximo y estaciones de trabajo rápidas.", icon: <FaSync /> },
  { titulo: "Instalación Profesional", descripcion: "Software empresarial y perímetros de seguridad.", icon: <FaWrench /> },
  { titulo: "Hardware Corporativo", descripcion: "Configuración y mejora de estaciones de trabajo.", icon: <FaDesktop /> },
  { titulo: "Ciberseguridad", descripcion: "Protección contra amenazas y brechas de datos.", icon: <FaShieldAlt /> },
  { titulo: "Infraestructura de Red", descripcion: "Redes locales, conectividad y seguridad física.", icon: <FaNetworkWired /> },
];

export default function ServiciosPage() {
  const [modalData, setModalData] = useState<any>(null);

  return (
    <div className="relative overflow-hidden pt-20 px-6 font-bold">

      {/* MODAL PROFESIONAL */}
      <AnimatePresence>
        {modalData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center z-[500] p-6"
            onClick={() => setModalData(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card-pro border border-white/20 p-12 rounded-[4rem] max-w-4xl w-full shadow-3xl relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 blur-3xl rounded-full" />

              <div className="flex items-start justify-between mb-8">
                <div>
                  <span className="block text-cyan-400 text-xs font-black tracking-[0.5em] uppercase mb-4">ESPECIFICACIÓN TÉCNICA</span>
                  <h2 className="title-fire text-glow-blue bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.3)] text-5xl font-black uppercase">{modalData.titulo}</h2>
                </div>
                <div className="text-6xl text-cyan-500/20">{modalData.icon}</div>
              </div>

              <div className="space-y-8">
                <p className="text-xl text-white font-medium leading-relaxed">{modalData.descripcion}</p>
                <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10">
                  <p className="text-gray-400 font-medium leading-relaxed text-lg">{modalData.largo}</p>
                </div>
              </div>

              <div className="mt-12 flex flex-wrap gap-6 items-center justify-between font-black">
                <a href="/cotizar" className="px-12 py-5 rounded-full btn-primary btn-alive btn-shimmer btn-border-glow text-xs tracking-widest uppercase">
                  SOLICITAR PROPUESTA <FaCheckCircle className="ml-2" />
                </a>
                <button onClick={() => setModalData(null)} className="px-10 py-5 rounded-full glass-light border border-white/10 text-white/40 hover:text-white text-xs tracking-widest uppercase transition-all">
                  CERRAR VENTANA
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SERVICIOS */}
      <section className="relative text-center py-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/5 blur-[200px] rounded-full pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <h2 className="section-title">
            <span className="block text-cyan-400 text-sm font-black tracking-[0.6em] uppercase mb-4">ENGINEERING & DEVELOPMENT</span>
            <span className="title-fire text-glow-blue bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] text-7xl md:text-8xl font-black uppercase tracking-tighter">Servicios</span>
          </h2>
          <p className="text-gray-400 mt-8 max-w-3xl mx-auto text-xl font-medium leading-relaxed">
            Ingeniería de software de alto nivel, desarrollo moderno y ecosistemas digitales diseñados para alcanzar la <span className="text-white font-black underline decoration-cyan-500/50">Excelencia Corporativa</span>.
          </p>
          <div className="mt-12">
            <a href="/cotizar" className="inline-flex items-center gap-4 px-12 py-5 rounded-full btn-primary btn-alive btn-shimmer btn-border-glow text-sm font-black tracking-[0.2em] uppercase">
              COTIZAR PROYECTO <FaArrowRight />
            </a>
          </div>
        </motion.div>
      </section>

      {/* GRID DESARROLLO */}
      <section className="max-w-7xl mx-auto py-24 relative z-10">
        <h3 className="section-title mb-24 text-center">
          <span className="block text-cyan-400 text-sm font-black tracking-[0.3em] uppercase mb-2">OPERATIONAL UNITS</span>
          <span className="title-fire text-glow-blue bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.3)] text-4xl font-black uppercase">Desarrollo de Élite</span>
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {servicios.map((s, i) => (
            <ServiceCard key={i} s={s} onClick={() => setModalData(s)} />
          ))}
        </div>
      </section>

      {/* SOPORTE TÉCNICO PROFESIONAL */}
      <section className="max-w-7xl mx-auto py-24 border-t border-white/5">
        <h3 className="section-title mb-20 text-center">
          <span className="block text-cyan-400 text-sm font-black tracking-[0.3em] uppercase mb-2">INFRASTRUCTURE SUPPORT</span>
          <span className="title-fire text-glow-blue bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.3)] text-4xl font-black uppercase">Soporte Técnico Especializado</span>
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {serviciosTecnicos.map((s, i) => (
            <motion.div key={i} whileHover={{ scale: 1.05, y: -5 }} className="p-8 glass-light border border-white/5 rounded-[3rem] flex items-center gap-6 group hover:border-cyan-500/20 transition-all shadow-xl">
              <div className="text-4xl text-white/20 group-hover:text-cyan-400 transition-colors">{s.icon}</div>
              <div>
                <h4 className="text-lg text-white font-black uppercase">{s.titulo}</h4>
                <p className="text-white/40 text-[10px] mt-1 font-black uppercase tracking-widest">{s.descripcion}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA INFERIOR */}
      <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center py-32">
        <div className="max-w-4xl mx-auto">
          <span className="title-fire text-glow-blue bg-gradient-to-r from-cyan-300 to-cyan-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(6,182,212,0.5)] text-4xl md:text-6xl font-black uppercase tracking-tighter">Potenciamos tu estructura digital</span>
          <p className="text-gray-400 mt-8 text-xl font-medium">Sistemas resilientes, interfaces profesionales y un rendimiento sin compromisos. El estándar industrial a su servicio.</p>
          <div className="mt-12">
            <a href="/cotizar" className="inline-flex items-center gap-4 px-14 py-6 rounded-full btn-primary btn-alive btn-shimmer btn-border-glow text-base font-black tracking-[0.3em] uppercase font-bold">
              SOLICITAR CONSULTORÍA ⚡
            </a>
          </div>
        </div>
      </motion.section>

    </div>
  );
}

function ServiceCard({ s, onClick }: { s: any; onClick: () => void }) {
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

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onClick={onClick}
      className="group p-10 glass-card-pro border border-white/5 rounded-[4rem] shadow-2xl relative cursor-pointer overflow-hidden transition-all duration-500 hover:border-cyan-500/30 font-bold"
    >
      <div style={{ transform: "translateZ(50px)" }} className="absolute top-0 right-0 p-8 text-6xl text-cyan-500/5 group-hover:text-cyan-500/10 transition-colors">{s.icon}</div>
      <div style={{ transform: "translateZ(80px)" }} className="relative z-10">
        <div className="mb-8 p-4 w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform group-hover:border-cyan-500/30 shadow-2xl">
          {s.icon}
        </div>
        <h3 className="text-2xl text-white font-black uppercase mb-4 tracking-tighter">{s.titulo}</h3>
        <p className="text-gray-400 font-medium leading-relaxed mb-8">{s.descripcion}</p>
        <div className="inline-flex items-center gap-2 text-cyan-400 text-[10px] font-black tracking-widest uppercase group-hover:gap-4 transition-all">
          ANALIZAR DETALLES TÉCNICOS <FaArrowRight />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
    </motion.div>
  );
}
