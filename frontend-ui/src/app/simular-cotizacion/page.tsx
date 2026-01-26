"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  FaLaptopCode,
  FaMobileAlt,
  FaServer,
  FaTools,
  FaChevronDown,
  FaArrowRight,
  FaCalculator,
  FaCheckCircle,
} from "react-icons/fa";

type Opcion = { id: string; label: string; price: number };
type Seccion = { titulo: string; tipo: "single" | "multiple"; opciones: Opcion[] };
type Servicio = { id: string; nombre: string; base: number; icon: React.ReactNode; secciones: Seccion[] };

const servicios: Servicio[] = [
  {
    id: "web",
    nombre: "Desarrollo Web",
    base: 400,
    icon: <FaLaptopCode />,
    secciones: [
      { titulo: "Tipo de solución", tipo: "single", opciones: [{ id: "landing", label: "Landing Page Profesional", price: 300 }, { id: "corporativa", label: "Plataforma Corporativa", price: 600 }, { id: "ecommerce", label: "Sistema E-commerce", price: 900 }] },
      { titulo: "Tecnologías Sugeridas", tipo: "multiple", opciones: [{ id: "react", label: "React / Next.js (Alta Velocidad)", price: 250 }, { id: "headless", label: "Headless CMS / API First", price: 400 }, { id: "pwa", label: "Progressive Web App", price: 350 }] },
      { titulo: "Módulos Avanzados", tipo: "multiple", opciones: [{ id: "auth", label: "Autenticación y Perfiles", price: 200 }, { id: "admin", label: "Panel Administrativo Senior", price: 400 }, { id: "seo", label: "Optimización SEO Técnica", price: 200 }] },
    ],
  },
  {
    id: "mobile",
    nombre: "Aplicaciones Móviles",
    base: 900,
    icon: <FaMobileAlt />,
    secciones: [
      { titulo: "Arquitectura de Plataforma", tipo: "single", opciones: [{ id: "android", label: "Android Nativo", price: 400 }, { id: "ios", label: "iOS Nativo", price: 400 }, { id: "flutter", label: "Flutter Cross-Platform", price: 600 }] },
      { titulo: "Componentes Críticos", tipo: "multiple", opciones: [{ id: "push", label: "Notificaciones Automatizadas", price: 200 }, { id: "payments", label: "Pasarela de Pagos Segura", price: 450 }, { id: "offline", label: "Sincronización Offline", price: 350 }] },
    ],
  },
  {
    id: "backend",
    nombre: "Sistemas y Backend",
    base: 800,
    icon: <FaServer />,
    secciones: [
      { titulo: "Diseño de API", tipo: "single", opciones: [{ id: "api", label: "Arquitectura RESTful", price: 400 }, { id: "micro", label: "Enfoque en Microservicios", price: 800 }] },
      { titulo: "Seguridad y Datos", tipo: "multiple", opciones: [{ id: "encryption", label: "Encriptación de Punto a Punto", price: 300 }, { id: "logs", label: "Auditoría de Logs Operativos", price: 200 }, { id: "scaling", label: "Auto-escalado en Nube", price: 500 }] },
    ],
  },
  {
    id: "soporte",
    nombre: "Infraestructura y Soporte",
    base: 150,
    icon: <FaTools />,
    secciones: [
      { titulo: "Modelo de Servicio", tipo: "single", opciones: [{ id: "proyect", label: "Intervención por Proyecto", price: 200 }, { id: "mensual", label: "Mantenimiento Corporativo", price: 600 }, { id: "enterprise", label: "SLA de Alta Disponibilidad", price: 1500 }] },
      { titulo: "Seguridad Física / Redes", tipo: "multiple", opciones: [{ id: "fortinet", label: "Configuración Firewall / UTM", price: 400 }, { id: "nas", label: "Storage Centralizado NAS", price: 300 }, { id: "vlan", label: "Segregación de Redes VLAN", price: 250 }] },
    ],
  },
];

const urgencias = [
  { label: "Normal", factor: 1 },
  { label: "Prioridad Alta", factor: 1.25 },
  { label: "Urgencia Crítica", factor: 1.5 },
];

export default function SimularCotizacionPage() {
  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [selecciones, setSelecciones] = useState<Record<string, Opcion[]>>({});
  const [urgencia, setUrgencia] = useState(urgencias[0]);
  const [open, setOpen] = useState<string | null>(null);

  const toggleOpcion = (sec: Seccion, opt: Opcion) => {
    setSelecciones((prev) => {
      const actuales = prev[sec.titulo] || [];
      if (sec.tipo === "single") return { ...prev, [sec.titulo]: [opt] };
      return { ...prev, [sec.titulo]: actuales.find(o => o.id === opt.id) ? actuales.filter((o) => o.id !== opt.id) : [...actuales, opt] };
    });
  };

  const total = () => {
    if (!servicio) return 0;
    let extras = 0;
    Object.values(selecciones).forEach((ops) => ops.forEach((o) => (extras += o.price)));
    return Math.round((servicio.base + extras) * urgencia.factor);
  };

  return (
    <div className="relative overflow-hidden pt-20 px-6 font-bold">

      {/* HEADER SIMULADOR */}
      <section className="text-center py-24">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10">
          <h2 className="section-title">
            <span className="block text-cyan-400 text-sm font-black tracking-[0.6em] uppercase mb-4">ENGINEERING ESTIMATOR</span>
            <span className="title-fire text-glow-blue bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] text-7xl md:text-8xl font-black uppercase tracking-tighter">Simulador</span>
          </h2>
          <p className="text-gray-400 mt-8 max-w-3xl mx-auto text-xl font-medium leading-relaxed">
            Configure las especificaciones técnicas de su infraestructura corporativa. Obtenga un presupuesto instantáneo bajo <span className="text-white font-black underline decoration-cyan-500/50">Estándares Industriales</span>.
          </p>
        </motion.div>
      </section>

      {/* SELECCIÓN DE UNIDAD TECNOLÓGICA */}
      <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto mb-20 relative z-10 font-bold">
        {servicios.map((s) => (
          <UnitCard key={s.id} s={s} isSelected={servicio?.id === s.id} onClick={() => { setServicio(s); setSelecciones({}); setOpen(null); }} />
        ))}
      </div>

      {/* CONFIGURACIÓN OPERATIVA */}
      <AnimatePresence mode="wait">
        {servicio && (
          <motion.div
            key={servicio.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-5xl mx-auto mb-40 relative z-10"
          >
            <SimulatorBox
              servicio={servicio}
              open={open}
              setOpen={setOpen}
              selecciones={selecciones}
              toggleOpcion={toggleOpcion}
              urgencia={urgencia}
              setUrgencia={setUrgencia}
              total={total()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UnitCard({ s, isSelected, onClick }: any) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(useSpring(y), [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(useSpring(x), [-0.5, 0.5], ["-10deg", "10deg"]);

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
      onClick={onClick}
      className={`p-10 glass-card-pro border transition-all cursor-pointer text-center rounded-[3.5rem] relative overflow-hidden group shadow-2xl ${isSelected ? "border-cyan-500 bg-cyan-500/10 shadow-3xl" : "border-white/5 hover:border-white/20"}`}
    >
      <div style={{ transform: "translateZ(30px)" }} className={`text-5xl mb-6 transition-transform group-hover:scale-110 flex justify-center ${isSelected ? "text-white" : "text-cyan-500/40 group-hover:text-cyan-400"}`}>
        {s.icon}
      </div>
      <h3 className="text-xl text-white font-black mb-3 uppercase tracking-tighter">{s.nombre}</h3>
      <p className="text-[10px] font-black tracking-[0.3em] text-white/20 uppercase">Desde USD {s.base}</p>
    </motion.div>
  );
}

function SimulatorBox({ servicio, open, setOpen, selecciones, toggleOpcion, urgencia, setUrgencia, total }: any) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(useSpring(y), [-0.5, 0.5], ["3deg", "-3deg"]);
  const rotateY = useTransform(useSpring(x), [-0.5, 0.5], ["-3deg", "3deg"]);

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
      className="glass-card-pro p-10 md:p-20 rounded-[5rem] border border-white/10 shadow-3xl relative overflow-hidden font-bold"
    >
      <div className="absolute top-0 right-0 p-12 text-cyan-500/5 text-[12rem] font-black select-none leading-none uppercase">BUILD</div>

      <h3 className="text-3xl text-white font-black mb-16 flex items-center gap-6 uppercase tracking-tighter">
        <span className="w-14 h-14 rounded-3xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-2xl">{servicio.icon}</span>
        Configuración del Sistema
      </h3>

      {servicio.secciones.map((sec: any) => (
        <div key={sec.titulo} className="mb-6">
          <button
            onClick={() => setOpen(open === sec.titulo ? null : sec.titulo)}
            className={`w-full p-10 rounded-[3rem] flex items-center justify-between transition-all font-black tracking-widest text-xs uppercase shadow-xl ${open === sec.titulo ? "bg-white/10 text-cyan-400 border border-cyan-500/30" : "glass-light border border-white/5 text-white/30 hover:text-white"}`}
          >
            {sec.titulo.toUpperCase()}
            <FaChevronDown className={`transition-transform duration-500 text-lg ${open === sec.titulo ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {open === sec.titulo && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="grid md:grid-cols-2 gap-4 pt-8">
                  {sec.opciones.map((o: any) => {
                    const activos = selecciones[sec.titulo] || [];
                    const activo = activos.find((act: any) => act.id === o.id);
                    return (
                      <motion.div
                        key={o.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleOpcion(sec, o)}
                        className={`p-7 rounded-[2.5rem] cursor-pointer flex justify-between items-center transition-all border group shadow-lg ${activo ? "bg-cyan-500 text-black border-cyan-500 shadow-cyan-500/20" : "glass-light border-white/5 hover:border-white/20"}`}
                      >
                        <span className="font-black text-xs uppercase tracking-widest">{o.label}</span>
                        <span className={`text-[10px] font-black tracking-widest ${activo ? "text-black" : "text-cyan-500"}`}>+USD {o.price}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* NIVEL DE PRIORIDAD */}
      <div className="mt-20 pt-20 border-t border-white/5">
        <p className="text-white/40 text-[10px] font-black tracking-[0.5em] uppercase mb-10 ml-6 flex items-center gap-3">
          <FaCalculator className="text-cyan-500" /> Nivel de Prioridad Operativa
        </p>
        <div className="flex flex-wrap gap-6">
          {urgencias.map((u) => (
            <button
              key={u.label}
              onClick={() => setUrgencia(u)}
              className={`px-12 py-6 rounded-full text-[10px] font-black tracking-widest uppercase transition-all border shadow-xl ${urgencia.label === u.label ? "bg-white text-black border-white shadow-2xl" : "glass-light text-white/20 border-white/5 hover:border-white/20 hover:text-white"}`}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>

      {/* RESULTADO FINANCIERO */}
      <div className="mt-24 p-12 md:p-16 rounded-[4.5rem] bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 text-center relative overflow-hidden group shadow-3xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent animate-pulse" />
        <p className="text-cyan-400 font-black tracking-[0.5em] text-xs uppercase mb-6">PRESUPUESTO ESTIMADO FINAL</p>

        <motion.p key={total} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-7xl md:text-8xl font-black text-white tracking-tighter mb-12 drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          USD ${total.toLocaleString()}
        </motion.p>

        <div className="flex flex-col md:flex-row gap-6 justify-center font-black">
          <a href="/cotizar" className="px-16 py-7 rounded-full btn-primary btn-alive btn-shimmer btn-border-glow text-sm tracking-[0.3em] uppercase flex items-center justify-center gap-4 group transition-all shadow-3xl">
            VALIDAR PROYECTO <FaArrowRight className="group-hover:translate-x-3 transition-transform" />
          </a>
          <button className="px-12 py-7 rounded-full glass-light border border-white/10 text-[11px] tracking-widest uppercase text-white/40 hover:text-white transition-all shadow-xl">
            GENERAR REPORTE TÉCNICO
          </button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-4 text-white/20 font-black text-[10px] uppercase tracking-widest">
          <FaCheckCircle className="text-cyan-500" /> ANÁLISIS PRELIMINAR SUJETO A AUDITORÍA TÉCNICA
        </div>
      </div>
    </motion.div>
  );
}
