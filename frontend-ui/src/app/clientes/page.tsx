"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { FaStar, FaUserCircle, FaCheckCircle, FaQuoteRight, FaPlus } from "react-icons/fa";

const testimoniosIniciales = [
  {
    nombre: "Carolina Muñoz",
    empresa: "FastPack Chile",
    comentario: "Automatizó procesos internos críticos y redujo tiempos operativos de forma notable. Excelente comunicación, profesional y eficiente.",
    rating: 5,
    foto: "",
    verificado: true,
    fecha: "2024",
    rol: "Jefatura de Proyectos",
  },
  {
    nombre: "Ignacio Torres",
    empresa: "Grupo Estepa",
    comentario: "Implementó soluciones empresariales claves para nuestro negocio. Rápido, responsable y con conocimiento técnico sólido.",
    rating: 5,
    foto: "",
    verificado: true,
    fecha: "2025",
    rol: "Gerencia de TI",
  },
  {
    nombre: "Valentina Rivas",
    empresa: "VR Beauty",
    comentario: "El sistema de reservas es altamente funcional y estético. Se ha observado un incremento en la eficiencia de la atención a clientes.",
    rating: 5,
    foto: "",
    verificado: true,
    fecha: "2023",
    rol: "Fundadora",
  },
];

const logosEmpresas = [
  "/logos/fastpack.svg",
  "/logos/estepa.svg",
  "/logos/spa.svg",
  "/logos/nextcl.svg",
];

export default function Clientes() {
  const [reseñas, setReseñas] = useState(testimoniosIniciales);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nombre: "", empresa: "", rol: "", comentario: "", rating: 5, foto: "" });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const nueva = { ...form, verificado: false, fecha: "REVISIÓN PENDIENTE" };
    setReseñas((prev) => [nueva, ...prev]);
    setForm({ nombre: "", empresa: "", rol: "", comentario: "", rating: 5, foto: "" });
    setShowModal(false);
  };

  return (
    <div className="relative overflow-hidden pt-20 px-6 font-bold">

      {/* DECORACIÓN FONDO */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[200px] rounded-full pointer-events-none" />

      {/* HEADER CLIENTES */}
      <section className="text-center py-20 relative z-10">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <h2 className="section-title">
            <span className="block text-cyan-400 text-sm font-black tracking-[0.6em] uppercase mb-4">CORPORATE VALIDATION</span>
            <span className="title-fire text-glow-blue bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] text-7xl md:text-8xl font-black uppercase tracking-tighter">Clientes</span>
          </h2>
          <p className="text-gray-400 mt-8 max-w-3xl mx-auto text-xl font-medium leading-relaxed">
            Ecosistemas digitales que impulsan el éxito empresarial. Entidades líderes que confían en nuestra <span className="text-white font-black underline decoration-cyan-500/50 text-glow-blue">Ingeniería de Clase Mundial</span>.
          </p>
        </motion.div>
      </section>

      {/* LOGOS CORPORATIVOS */}
      <section className="max-w-6xl mx-auto mb-32 relative z-10 opacity-20 hover:opacity-100 transition-opacity duration-1000">
        <div className="flex flex-wrap justify-center items-center gap-16 md:gap-24">
          {logosEmpresas.map((logo, i) => (
            <motion.img
              key={i}
              src={logo}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: i * 0.7 }}
              className="h-10 grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer"
              alt={`Logo empresa ${i}`}
            />
          ))}
        </div>
      </section>

      {/* MÉTRICAS DE OPERACIÓN */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto mb-32 relative z-10">
        {[
          { val: "+32", label: "ENTIDADES CORPORATIVAS", color: "cyan" },
          { val: "4.9/5", label: "SATISFACCIÓN OPERATIVA", color: "blue" },
          { val: "+48", label: "DESPLIEGUES EXITOSOS", color: "cyan" },
          { val: "100%", label: "DISPONIBILIDAD TÉCNICA", color: "blue" }
        ].map((s, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -10, scale: 1.05 }}
            className="p-10 glass-light border border-white/5 rounded-[3.5rem] text-center group hover:border-cyan-500/20 transition-all shadow-2xl"
          >
            <p className="text-5xl font-black text-white mb-2 group-hover:scale-105 transition-transform tracking-tighter">{s.val}</p>
            <p className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase">{s.label}</p>
          </motion.div>
        ))}
      </section>

      {/* SECCIÓN TESTIMONIOS */}
      <section className="max-w-7xl mx-auto pb-32 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-24 gap-8">
          <h3 className="section-title !text-left !mb-0">
            <span className="block text-cyan-400 text-sm font-black tracking-[0.3em] uppercase mb-2">OPERATIONAL FEEDBACK</span>
            <span className="title-fire text-glow-blue bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.3)] text-4xl font-black uppercase">Testimonios Reales</span>
          </h3>
          <button onClick={() => setShowModal(true)} className="px-12 py-5 rounded-full btn-primary btn-alive btn-shimmer btn-border-glow text-xs font-black tracking-widest uppercase flex items-center gap-4 transition-all shadow-3xl">
            <FaPlus /> REGISTRAR RESEÑA
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {reseñas.map((r, i) => (
            <TestimonialCard key={i} r={r} />
          ))}
        </div>
      </section>

      {/* MODAL PARA RESEÑAS */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[500] flex items-center justify-center p-6" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="glass-card-pro p-12 md:p-16 rounded-[4.5rem] border border-white/20 max-w-2xl w-full relative overflow-hidden font-bold">
              <div className="absolute top-0 right-0 p-12 text-cyan-500/5 text-9xl font-black select-none uppercase">FEEDBACK</div>
              <h2 className="title-fire text-glow-blue bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.3)] text-4xl font-black mb-12 uppercase tracking-tighter">Registrar Reseña</h2>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-white/40 text-[10px] font-black tracking-[0.4em] uppercase ml-4">NOMBRE COMPLETO</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-white placeholder-white/10 outline-none focus:border-cyan-500 transition-all text-sm tracking-widest" placeholder="INGRESAR NOMBRE" required onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-white/40 text-[10px] font-black tracking-[0.4em] uppercase ml-4">EMPRESA</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-white placeholder-white/10 outline-none focus:border-cyan-500 transition-all text-sm tracking-widest" placeholder="NOMBRE EMPRESA" onChange={(e) => setForm({ ...form, empresa: e.target.value })} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-white/40 text-[10px] font-black tracking-[0.4em] uppercase ml-4">CARGO</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-white placeholder-white/10 outline-none focus:border-cyan-500 transition-all text-sm tracking-widest" placeholder="SU CARGO" onChange={(e) => setForm({ ...form, rol: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-white/40 text-[10px] font-black tracking-[0.4em] uppercase ml-4">COMENTARIO TÉCNICO</label>
                  <textarea className="w-full bg-white/5 border border-white/10 rounded-[3rem] px-8 py-6 text-white placeholder-white/10 outline-none focus:border-cyan-500 transition-all text-sm tracking-widest h-40 resize-none" placeholder="DESCRIBA SU EXPERIENCIA PROFESIONAL..." required onChange={(e) => setForm({ ...form, comentario: e.target.value })} />
                </div>

                <div className="flex justify-center gap-6 py-4">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <FaStar key={idx} onClick={() => setForm({ ...form, rating: idx + 1 })} className={`cursor-pointer text-4xl transition-all ${form.rating >= idx + 1 ? "text-cyan-400 scale-110 shadow-cyan-500" : "text-white/10 hover:text-white/30"}`} />
                  ))}
                </div>

                <button className="w-full py-6 rounded-full btn-primary btn-alive btn-shimmer btn-border-glow text-xs font-black tracking-[0.4em] uppercase transition-all shadow-3xl">ENVIAR PARA REVISIÓN TÉCNICA</button>
              </form>
              <button onClick={() => setShowModal(false)} className="block mx-auto mt-10 text-[10px] font-black text-white/20 hover:text-white tracking-[0.4em] uppercase transition-all">CANCELAR OPERACIÓN</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function TestimonialCard({ r }: { r: any }) {
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

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="p-12 glass-card-pro border border-white/5 rounded-[4.5rem] relative shadow-3xl flex flex-col items-center text-center font-bold overflow-hidden transition-all duration-500 hover:border-cyan-500/20"
    >
      <div style={{ transform: "translateZ(30px)" }} className="absolute top-8 right-10 text-cyan-500/5 text-7xl"><FaQuoteRight /></div>

      <div style={{ transform: "translateZ(80px)" }} className="relative mb-10 pt-4">
        <div className="w-28 h-28 rounded-[3rem] bg-gradient-to-br from-cyan-500/10 to-blue-600/10 flex items-center justify-center border border-white/10 shadow-3xl overflow-hidden">
          {r.foto ? <img src={r.foto} className="w-full h-full object-cover" alt={r.nombre} /> : <FaUserCircle className="text-7xl text-white/10" />}
        </div>
        {r.verificado && <div className="absolute -bottom-2 -right-2 bg-black border-2 border-cyan-500 text-cyan-400 p-2.5 rounded-full text-xs shadow-[0_0_15px_#06b6d4]"><FaCheckCircle /></div>}
      </div>

      <div style={{ transform: "translateZ(50px)" }}>
        <h4 className="text-2xl text-white font-black uppercase mb-3 tracking-tight">{r.nombre}</h4>
        <p className="text-cyan-400 text-[10px] font-black tracking-[0.4em] uppercase mb-8 opacity-60">{r.empresa} · {r.rol}</p>

        <div className="flex justify-center gap-2 mb-10 opacity-40">
          {Array.from({ length: 5 }).map((_, idx) => (
            <FaStar key={idx} className={idx < r.rating ? "text-cyan-400" : "text-white/10"} />
          ))}
        </div>

        <p className="text-gray-400 font-medium leading-[1.8] text-lg">
          “{r.comentario}”
        </p>
      </div>
    </motion.div>
  );
}
