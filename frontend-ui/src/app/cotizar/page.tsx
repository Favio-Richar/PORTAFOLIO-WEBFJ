"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  FaPaperPlane,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaClipboardList,
  FaTools,
  FaCalculator,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";

export default function CotizarPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [presupuesto, setPresupuesto] = useState<number | null>(null);

  const servicios = [
    { label: "Desarrollo Web Profesional", base: 500 },
    { label: "Aplicaciones Móviles", base: 1200 },
    { label: "Backend / API Empresarial", base: 800 },
    { label: "ERP / Sistema a Medida", base: 2500 },
    { label: "Soporte Técnico Especializado", base: 150 },
    { label: "Seguridad y Auditoría", base: 300 },
  ];

  function simularPresupuesto(servicio: string) {
    const encontrado = servicios.find(s => s.label === servicio);
    setPresupuesto(encontrado ? encontrado.base : null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await fetch("/api/enviar-cotizacion", { method: "POST", body: formData });
      setLoading(false);
      setSuccess(true);
      e.currentTarget.reset();
      setPresupuesto(null);
    } catch (error) {
      setLoading(false);
      alert("Error en la transmisión. Reintente.");
    }
  }

  return (
    <div className="relative overflow-hidden pt-20 px-6 font-bold">

      {/* DECORACIÓN FONDO */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[200px] rounded-full pointer-events-none" />

      <section className="max-w-4xl mx-auto relative z-10 py-24">

        {/* HEADER COTIZAR */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-20">
          <h2 className="section-title">
            <span className="block text-cyan-400 text-sm font-black tracking-[0.6em] uppercase mb-4">PROJECT ESTIMATION</span>
            <span className="title-fire text-glow-blue bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] text-7xl md:text-8xl font-black uppercase tracking-tighter">Cotizar</span>
          </h2>
          <p className="text-gray-400 mt-8 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
            Inicie el análisis técnico de su próximo <span className="text-white font-black underline decoration-cyan-500/50">Desarrollo de Alto Impacto</span>. Definamos juntos los parámetros del éxito profesional.
          </p>
        </motion.div>

        {/* MENSAJE DE ÉXITO */}
        <AnimatePresence>
          {success && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 p-8 rounded-[3rem] text-center font-black tracking-widest text-xs mb-12 shadow-2xl">
              <FaCheckCircle className="inline-block text-2xl mb-2" />
              <div className="block uppercase">TRASMISIÓN EXITOSA · SOLICITUD DE COTIZACIÓN RECIBIDA PARA ANÁLISIS</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FORMULARIO COTIZAR CON 3D TILT */}
        <FormWrapper simularPresupuesto={simularPresupuesto} handleSubmit={handleSubmit} loading={loading} presupuesto={presupuesto} servicios={servicios} />
      </section>
    </div>
  );
}

function FormWrapper({ simularPresupuesto, handleSubmit, loading, presupuesto, servicios }: any) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(useSpring(y), [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(useSpring(x), [-0.5, 0.5], ["-5deg", "5deg"]);

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
    >
      <form style={{ transform: "translateZ(30px)" }} onSubmit={handleSubmit} className="glass-card-pro p-10 md:p-14 rounded-[4rem] border border-white/10 shadow-3xl space-y-10 relative overflow-hidden font-bold">
        <div className="absolute top-0 right-0 p-12 text-cyan-500/5 text-9xl font-black select-none uppercase">QUOTE</div>

        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="text-white/40 text-[10px] font-black tracking-[0.4em] uppercase ml-4 flex items-center gap-3">
              <FaUser className="text-cyan-500" /> IDENTIDAD PROFESIONAL
            </label>
            <input name="nombre" required placeholder="NOMBRE COMPLETO / EMPRESA" className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-white placeholder-white/10 focus:border-cyan-500 outline-none transition-all text-sm tracking-widest font-black" />
          </div>
          <div className="space-y-4">
            <label className="text-white/40 text-[10px] font-black tracking-[0.4em] uppercase ml-4 flex items-center gap-3">
              <FaEnvelope className="text-cyan-500" /> CANAL DE ENLACE
            </label>
            <input type="email" name="email" required placeholder="DIRECCIÓN@EMAIL.COM" className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-white placeholder-white/10 focus:border-cyan-500 outline-none transition-all text-sm tracking-widest font-black" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="text-white/40 text-[10px] font-black tracking-[0.4em] uppercase ml-4 flex items-center gap-3">
              <FaPhone className="text-cyan-500" /> TELÉFONO DE CONTACTO
            </label>
            <input name="telefono" placeholder="+56 9 XXXX XXXX" className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-white placeholder-white/10 focus:border-cyan-500 outline-none transition-all text-sm tracking-widest font-black" />
          </div>
          <div className="space-y-4">
            <label className="text-white/40 text-[10px] font-black tracking-[0.4em] uppercase ml-4 flex items-center gap-3">
              <FaTools className="text-cyan-500" /> UNIDAD DE NEGOCIO
            </label>
            <div className="relative">
              <select name="servicio" required onChange={(e) => simularPresupuesto(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-full px-8 py-5 text-white outline-none focus:border-cyan-500 transition-all text-sm tracking-widest appearance-none cursor-pointer font-black">
                <option value="">SELECCIONAR CATEGORÍA…</option>
                {servicios.map((s: any) => (<option key={s.label} value={s.label} className="bg-black text-white">{s.label.toUpperCase()}</option>))}
              </select>
            </div>
          </div>
        </div>

        {/* ESTIMADOR RÁPIDO */}
        <AnimatePresence>
          {presupuesto && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="p-10 rounded-[3rem] bg-cyan-500/5 border border-cyan-500/20 text-center space-y-4 shadow-2xl">
                <p className="text-cyan-400 font-black tracking-[0.5em] text-[10px] uppercase">PROCESAMIENTO ESTIMADO BASE</p>
                <p className="text-5xl font-extrabold text-white tracking-tighter">USD ${presupuesto}</p>
                <p className="text-white/20 text-[9px] font-black tracking-widest uppercase px-10">Este valor representa una referencia inicial para proyectos estándar. Sujeto a especificación técnica final.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          <label className="text-white/40 text-[10px] font-black tracking-[0.4em] uppercase ml-4 flex items-center gap-3">
            <FaClipboardList className="text-cyan-500" /> DESCRIPCIÓN DE REQUERIMIENTOS
          </label>
          <textarea name="descripcion" rows={6} required placeholder="DETALLE SU VISIÓN, OBJETIVOS CLAVE Y FUNCIONALIDADES REQUERIDAS PARA EL SISTEMA..." className="w-full bg-white/5 border border-white/10 rounded-[3rem] px-8 py-7 text-white placeholder-white/10 focus:border-cyan-500 outline-none transition-all text-sm tracking-widest resize-none font-black" />
        </div>

        <div className="pt-8 flex flex-col md:flex-row gap-8">
          <button type="submit" disabled={loading} className="flex-1 py-7 rounded-full btn-primary btn-alive btn-shimmer btn-border-glow flex justify-center items-center gap-4 text-xs font-black tracking-[0.5em] uppercase shadow-3xl">
            <FaPaperPlane className="text-lg" /> {loading ? "PROCESANDO SOLICITUD..." : "ENVIAR PARA ANÁLISIS"}
          </button>
          <a href="/simular-cotizacion" className="flex-1 py-7 rounded-full glass-light border border-white/10 flex justify-center items-center gap-4 text-xs font-black tracking-[0.3em] uppercase text-white/40 hover:text-white transition-all">
            <FaCalculator className="text-cyan-500" /> SIMULADOR DETALLADO <FaArrowRight />
          </a>
        </div>
      </form>
    </motion.div>
  );
}
