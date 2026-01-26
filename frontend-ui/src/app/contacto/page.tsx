"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaPaperPlane,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";

const serviciosOpciones = [
  "Desarrollo Web Profesional",
  "Aplicaciones Móviles",
  "APIs / Backend Empresarial",
  "ERP / CRM Personalizado",
  "Automatización de Procesos",
  "DevOps / Infraestructura Cloud",
  "Soporte Técnico Especializado",
  "Seguridad y Auditoría TI",
  "Consultoría Tecnológica",
];

export default function Contacto() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    servicio: "",
    descripcion: "",
  });

  const [status, setStatus] = useState<null | "sending" | "success" | "error">(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.servicio) {
      setErrorMsg("Por favor, complete los campos obligatorios.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setErrorMsg("");
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v as string));
      const res = await fetch("/api/enviar-cotizacion", { method: "POST", body: data });
      if (!res.ok) throw new Error("Error al procesar la solicitud");
      setStatus("success");
      setForm({ nombre: "", email: "", telefono: "", servicio: "", descripcion: "" });
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="relative overflow-hidden pt-20 px-6 font-bold">

      {/* DECORACIÓN CORPORATIVA */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[200px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[200px] rounded-full pointer-events-none" />

      {/* HEADER CONTACTO */}
      <div className="text-center py-24 relative z-10">
        <h2 className="section-title">
          <span className="block text-cyan-400 text-sm font-black tracking-[0.6em] uppercase mb-4">COMMUNICATION CENTER</span>
          <span className="title-fire text-glow-blue bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] text-7xl md:text-8xl font-black uppercase tracking-tighter">Contacto</span>
        </h2>
        <p className="text-gray-400 mt-8 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
          Inicie la transmisión de su visión comercial. Diseñamos el puente estratégico entre su idea y la <span className="text-white font-black underline decoration-cyan-500/50">Realidad Digital</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-7xl mx-auto pb-40 relative z-10">

        {/* FORMULARIO DASHBOARD */}
        <div className="lg:col-span-3">
          <ContactForm form={form} status={status} errorMsg={errorMsg} handleChange={handleChange} handleSubmit={handleSubmit} />
        </div>

        {/* INFO LATERAL */}
        <div className="lg:col-span-2 flex flex-col gap-10">
          <ContactInfo />

          <motion.div whileHover={{ scale: 1.02 }} className="rounded-[4rem] overflow-hidden border border-white/10 shadow-3xl h-full grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-1000 relative group">
            <div className="absolute inset-0 bg-cyan-500/5 mix-blend-overlay group-hover:opacity-0 transition-opacity pointer-events-none" />
            <iframe className="w-full h-full min-h-[350px]" loading="lazy" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3330.4355862367835!2d-70.6482684!3d-33.4569385!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662c5a5281e36bd%3A0x85bd3f5a3fb47d42!2sSantiago%20Centro!5e0!3m2!1ses!2scl!4v1700000000000"></iframe>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ContactForm({ form, status, errorMsg, handleChange, handleSubmit }: any) {
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
      <form style={{ transform: "translateZ(30px)" }} onSubmit={handleSubmit} className="glass-card-pro p-10 md:p-14 rounded-[4rem] border border-white/10 shadow-3xl flex flex-col gap-8 relative overflow-hidden font-bold">
        <div className="absolute top-0 right-0 p-10 text-cyan-500/5 text-9xl font-black select-none uppercase">COMMS</div>

        {/* STATUS MESSAGES */}
        {(status === "success" || status === "error") && (
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`p-6 rounded-[2rem] text-center font-black tracking-widest text-xs border ${status === "success" ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
            {status === "success" ? "TRANSMISIÓN EXITOSA · SOLICITUD RECIBIDA CORRECTAMENTE" : `ERROR EN ENLACE TÉCNICO: ${errorMsg.toUpperCase()}`}
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-white/40 text-[10px] font-black tracking-[0.4em] uppercase ml-4">NOMBRE DEL CONTACTO</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} placeholder="INGRESAR NOMBRE" className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-white placeholder-white/10 focus:border-cyan-500 outline-none transition-all text-sm tracking-widest font-black" />
          </div>
          <div className="space-y-3">
            <label className="text-white/40 text-[10px] font-black tracking-[0.4em] uppercase ml-4">CANAL DE RESPUESTA</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="SU@EMAIL.COM" className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-white placeholder-white/10 focus:border-cyan-500 outline-none transition-all text-sm tracking-widest font-black" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-white/40 text-[10px] font-black tracking-[0.4em] uppercase ml-4">TELÉFONO DE IDENTIFICACIÓN</label>
            <input type="text" name="telefono" value={form.telefono} onChange={handleChange} placeholder="+56 9 XXXX XXXX" className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-white placeholder-white/10 focus:border-cyan-500 outline-none transition-all text-sm tracking-widest font-black" />
          </div>
          <div className="space-y-3">
            <label className="text-white/40 text-[10px] font-black tracking-[0.4em] uppercase ml-4">TIPO DE REQUERIMIENTO</label>
            <select name="servicio" value={form.servicio} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-full px-8 py-5 text-white outline-none focus:border-cyan-500 transition-all text-sm tracking-widest font-black appearance-none cursor-pointer">
              <option value="">SELECCIONAR SERVICIO...</option>
              {serviciosOpciones.map((s) => (<option value={s} key={s} className="bg-black text-white">{s.toUpperCase()}</option>))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-white/40 text-[10px] font-black tracking-[0.4em] uppercase ml-4">DETALLES DE LA MISIÓN</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="DESCRIBA LOS REQUERIMIENTOS TÉCNICOS O SU VISIÓN DE NEGOCIO..." className="w-full bg-white/5 border border-white/10 rounded-[3rem] px-8 py-6 text-white placeholder-white/10 focus:border-cyan-500 outline-none transition-all text-sm tracking-widest h-48 resize-none font-black" />
        </div>

        <button type="submit" disabled={status === "sending"} className="mt-4 w-full py-7 rounded-full btn-primary btn-alive btn-shimmer btn-border-glow flex justify-center items-center gap-4 text-xs font-black tracking-[0.5em] uppercase transition-all shadow-3xl">
          <FaPaperPlane className="text-lg" /> {status === "sending" ? "TRANSMITIENDO DATOS..." : "ESTABLECER ENLACE"}
        </button>

        <a href="https://wa.me/56912345678" target="_blank" className="flex justify-center items-center gap-4 text-cyan-500/40 hover:text-cyan-400 transition-all font-black text-[10px] tracking-[0.5em] uppercase">
          <FaWhatsapp className="text-xl" /> PROTOCOLO DE CONEXIÓN INMEDIATA
        </a>
      </form>
    </motion.div>
  );
}

function ContactInfo() {
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
      className="glass-card-pro p-10 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden group"
    >
      <div style={{ transform: "translateZ(30px)" }}>
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full" />

        <div className="flex items-center gap-6 mb-12 relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-3xl border border-cyan-500/20 shadow-2xl"><FaMapMarkerAlt /></div>
          <div>
            <h4 className="text-white font-black tracking-widest uppercase text-base mb-1">Base de Operaciones</h4>
            <p className="text-cyan-500/60 text-[10px] font-black uppercase tracking-[0.4em]">SANTIAGO · CHILE (DISPONIBILIDAD GLOBAL)</p>
          </div>
        </div>

        <div className="space-y-8 relative z-10">
          <div className="group/item flex items-center gap-6 cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/30 group-hover/item:text-cyan-400 group-hover/item:bg-cyan-500/10 transition-all border border-white/5"><FaEnvelope className="text-xl" /></div>
            <span className="text-white/50 group-hover/item:text-white transition-colors text-xs font-black tracking-tight">contacto@levelsoftwarepro.com</span>
          </div>
          <div className="group/item flex items-center gap-6 cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/30 group-hover/item:text-cyan-400 group-hover/item:bg-cyan-500/10 transition-all border border-white/5"><FaPhone className="text-xl" /></div>
            <span className="text-white/50 group-hover/item:text-white transition-colors text-xs font-black tracking-tight">+56 9 1234 5678</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
