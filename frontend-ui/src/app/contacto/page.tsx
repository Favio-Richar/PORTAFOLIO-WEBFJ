"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import {
  FaPaperPlane,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaLocationDot,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaClock,
  FaTiktok,
  FaGithub,
} from "react-icons/fa6";
import dynamic from "next/dynamic";

const InteractiveMap = dynamic(() => import("@/components/layout/InteractiveMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[400px] bg-white/5 animate-pulse rounded-[3rem]" />,
});

const CONTACT_CONFIG = {
  phone: "+56 9 1234 5678",
  whatsapp: "56912345678",
  email: "contacto@levelsoftwarepro.com",
  address: "Santiago Centro, Chile",
  lat: -33.4569385,
  lng: -70.6482684,
  social: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
  },
};

const FAQS = [
  {
    q: "¿Cuál es vuestro horario de respuesta?",
    a: "Nuestro equipo técnico responde en un máximo de 24 horas hábiles. Para urgencias, el canal de WhatsApp está activo 24/7.",
  },
  {
    q: "¿Realizan consultorías presenciales?",
    a: "Sí, operamos principalmente de forma remota para clientes globales, pero podemos agendar reuniones presenciales en nuestra base de Santiago.",
  },
  {
    q: "¿Cómo es el proceso de presupuesto?",
    a: "Tras recibir su requerimiento, realizamos un análisis técnico preliminar y agendamos una videollamada de 15 min para definir el alcance exacto.",
  },
];

function QuickCard({
  icon,
  label,
  sub,
  link,
  colorClass,
  linkText,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  link: string;
  colorClass: string;
  linkText: string;
}) {
  return (
    <motion.a
      href={link}
      target="_blank"
      rel="noreferrer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="contact-card-pro group"
    >
      <div className="sweep-effect" />
      <div className="contact-card-head">
        <div className="card-icon-container" style={{ color: colorClass }}>
          <div className="pulse-ring" />
          <div className="icon-box bg-white/5 border border-white/10">{icon}</div>
        </div>
        <span className="card-action">{linkText}</span>
      </div>

      <div className="contact-card-body">
        <h3>{label}</h3>
        <p>{sub}</p>
      </div>

      <span className="card-link">Abrir</span>
    </motion.a>
  );
}

export default function Contacto() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<null | "sending" | "success" | "error">(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/enviar-cotizacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.name,
          email: form.email,
          telefono: form.phone,
          servicio: form.subject || "Consulta General",
          descripcion: form.message,
        }),
      });

      if (!res.ok) throw new Error("Error en la transmisión");

      setStatus("success");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No se pudo enviar el mensaje";
      setErrorMsg(message);
      setStatus("error");
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" as const } }
  };

  return (
    <div className="contact-elite-wrapper pb-40">
      {/* Background Layers */}
      <div className="bg-noise" />
      <div className="bg-mesh" />
      <div className="floating-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
      </div>

      <motion.div
        className="content-wrapper max-w-7xl mx-auto px-6 relative pt-40"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <header className="text-center mb-24">
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 backdrop-blur-md px-5 py-2 rounded-xl mb-8"
          >
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]" />
            <span className="text-blue-400 text-[10px] font-black tracking-[0.4em] uppercase">
              Global Engineering Center
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter uppercase"
          >
            Conectemos <span className="text-blue-500">_</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium"
          >
            Arquitectura de software avanzada y consultoría estratégica para empresas que exigen <span className="text-white font-bold tracking-tight">el máximo nivel digital</span>.
          </motion.p>
        </header>

        <div className="quick-contact-grid">
          <QuickCard
            icon={<FaWhatsapp />}
            label="WhatsApp"
            sub={CONTACT_CONFIG.phone}
            link={`https://wa.me/${CONTACT_CONFIG.whatsapp}`}
            colorClass="#25D366"
            linkText="Enlace Directo"
          />
          <QuickCard
            icon={<FaEnvelope />}
            label="E-mail"
            sub={CONTACT_CONFIG.email}
            link={`mailto:${CONTACT_CONFIG.email}`}
            colorClass="#EA4335"
            linkText="Enviar Propuesta"
          />
          <QuickCard
            icon={<FaPhone />}
            label="Teléfono"
            sub={CONTACT_CONFIG.phone}
            link={`tel:${CONTACT_CONFIG.phone.replace(/\s/g, "")}`}
            colorClass="#34A853"
            linkText="Llamada de Voz"
          />
          <QuickCard
            icon={<FaLocationDot />}
            label="Global HQ"
            sub={CONTACT_CONFIG.address}
            link={`https://www.google.com/maps?q=${CONTACT_CONFIG.lat},${CONTACT_CONFIG.lng}`}
            colorClass="#4285F4"
            linkText="Geo Localización"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32 items-stretch">
          <motion.div
            variants={itemVariants}
            className="glass-card-pro p-10 md:p-14 relative overflow-hidden !rounded-3xl"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-widest leading-none">
                Briefing <span className="text-blue-500">Tech</span>
              </h2>
              <div className="status-badge self-start md:self-auto">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                Operativo 24/7
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="relative group/field">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder=" "
                    className="form-input-premium peer w-full px-8 pt-8 pb-3 font-bold outline-none !rounded-xl"
                  />
                  <label className="absolute left-8 top-5 text-white/30 font-bold transition-all pointer-events-none peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-blue-400 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-blue-400 uppercase tracking-[0.2em]">
                    Nombre Corporativo
                  </label>
                </div>
                <div className="relative group/field">
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder=" "
                    className="form-input-premium peer w-full px-8 pt-8 pb-3 font-bold outline-none !rounded-xl"
                  />
                  <label className="absolute left-8 top-5 text-white/30 font-bold transition-all pointer-events-none peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-blue-400 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-blue-400 uppercase tracking-[0.2em]">
                    E-mail Institucional
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="relative group/field">
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder=" "
                    className="form-input-premium peer w-full px-8 pt-8 pb-3 font-bold outline-none !rounded-xl"
                  />
                  <label className="absolute left-8 top-5 text-white/30 font-bold transition-all pointer-events-none peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-blue-400 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-blue-400 uppercase tracking-[0.2em]">
                    Contacto Móvil
                  </label>
                </div>
                <div className="relative group/field">
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="form-input-premium peer w-full px-8 pt-8 pb-3 font-bold outline-none appearance-none cursor-pointer !rounded-xl"
                  >
                    <option value="" disabled hidden></option>
                    <option value="SaaS Architecture">SaaS Architecture</option>
                    <option value="Enterprise Systems">Enterprise Systems</option>
                    <option value="Digital Engineering">Digital Engineering</option>
                    <option value="Cloud Solutions">Cloud Solutions</option>
                  </select>
                  <label className="absolute left-8 top-5 text-white/30 font-bold transition-all pointer-events-none peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-blue-400 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-blue-400 uppercase tracking-[0.2em]">
                    Solución Requerida
                  </label>
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none text-xs">▼</span>
                </div>
              </div>

              <div className="relative group/field">
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder=" "
                  className="form-input-premium peer w-full px-8 pt-10 pb-4 font-bold outline-none resize-none !rounded-2xl"
                />
                <label className="absolute left-8 top-7 text-white/30 font-bold transition-all pointer-events-none peer-focus:top-3 peer-focus:text-[10px] peer-focus:text-blue-400 peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-blue-400 uppercase tracking-[0.2em]">
                  Descripción Técnica del Desafío
                </label>
              </div>

              <div className="flex flex-col gap-6">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="submit-btn-elite w-full py-6 text-white text-sm flex items-center justify-center gap-4"
                >
                  {status === "sending" ? (
                    "PROCESANDO SOLICITUD..."
                  ) : (
                    <>
                      <FaPaperPlane className="transform -rotate-12" />
                      <span>AGENDAR CONSULTA TÉCNICA</span>
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-4 opacity-50">
                  <div className="h-px bg-blue-500/30 flex-1" />
                  <p className="text-white font-black text-[9px] uppercase tracking-[0.4em]">
                    SLA: Respuesta en menos de 12 horas
                  </p>
                  <div className="h-px bg-blue-500/30 flex-1" />
                </div>
              </div>

              {status === "success" && (
                <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl text-center">
                  <p className="text-blue-400 font-black text-[10px] tracking-[0.3em] uppercase">
                    ✓ Transmisión completada. Procesando requerimiento.
                  </p>
                </div>
              )}
              {status === "error" && (
                <p className="text-red-400 font-semibold text-center text-sm mt-4 italic">
                  ERROR: {errorMsg || "Transmisión fallida"}
                </p>
              )}
            </form>
          </motion.div>

          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col gap-8"
          >
            <div className="map-container-pro h-[450px] !rounded-[2rem]">
              <InteractiveMap center={[CONTACT_CONFIG.lat, CONTACT_CONFIG.lng]} zoom={15} />
            </div>

            <div className="glass-card-pro !rounded-[2rem] p-10 relative overflow-hidden border-blue-500/20">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-white font-black text-2xl tracking-tighter uppercase mb-1">Global Base Santiago</h3>
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Hub de Ingeniería Digital</p>
                </div>
                <div className="status-badge bg-blue-500/10 border-blue-500/30 text-blue-400">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                  SISTEMA ACTIVO
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="flex items-center gap-5 text-slate-300">
                    <div className="w-12 h-12 rounded-xl bg-slate-500/10 flex items-center justify-center text-[#94a3b8] border border-slate-500/20 shadow-[0_0_15px_rgba(148,163,184,0.3)]">
                      <FaClock className="text-xl" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Operaciones</p>
                      <span className="text-sm font-black text-white">LUN - VIE: 08:00 - 19:00</span>
                    </div>
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=Santiago+Centro+Chile`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-5 text-blue-400 hover:text-blue-300 transition-all group/link"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#EA4335] flex items-center justify-center text-white shadow-[0_0_20px_rgba(234,67,53,0.5)]">
                      <FaLocationDot className="text-xl" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Navegación</p>
                      <span className="text-sm font-black border-b-2 border-[#EA4335]/40 pb-1">ACCEDER A GOOGLE MAPS</span>
                    </div>
                  </a>
                </div>

                <div className="flex flex-wrap gap-4 mt-4 md:mt-0 justify-start md:justify-end items-end flex-1">
                  <a href={CONTACT_CONFIG.social.facebook} target="_blank" rel="noreferrer" className="social-btn-pro !text-[#1877F2]" aria-label="Facebook">
                    <FaFacebookF />
                  </a>
                  <a href={CONTACT_CONFIG.social.instagram} target="_blank" rel="noreferrer" className="social-btn-pro !text-[#E4405F]" aria-label="Instagram">
                    <FaInstagram />
                  </a>
                  <a href={CONTACT_CONFIG.social.linkedin} target="_blank" rel="noreferrer" className="social-btn-pro !text-[#0A66C2]" aria-label="LinkedIn">
                    <FaLinkedinIn />
                  </a>
                  <a href={CONTACT_CONFIG.social.twitter} target="_blank" rel="noreferrer" className="social-btn-pro !text-[#1DA1F2]" aria-label="X">
                    <FaXTwitter />
                  </a>
                  <a href="#" target="_blank" rel="noreferrer" className="social-btn-pro !text-[#FFF]" aria-label="TikTok">
                    <FaTiktok />
                  </a>
                  <a href="#" target="_blank" rel="noreferrer" className="social-btn-pro !text-[#FFF]" aria-label="GitHub">
                    <FaGithub />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <section className="max-w-4xl mx-auto pt-20">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
              Protocolos de <span className="text-blue-500">Ejecución</span>
            </h2>
            <div className="w-16 h-1 bg-blue-500 mx-auto mt-6" />
          </motion.div>

          <div className="space-y-6">
            {FAQS.map((faq, idx) => (
              <motion.details
                key={idx}
                variants={itemVariants}
                className="glass-card-pro !rounded-xl p-8 cursor-pointer group hover:bg-blue-500/5 transition-all overflow-hidden border-blue-500/10"
              >
                <summary className="list-none flex items-center justify-between text-white font-black uppercase text-sm tracking-[0.3em] pr-4">
                  {faq.q}
                  <span className="text-blue-500 group-open:rotate-180 transition-transform duration-500">▼</span>
                </summary>
                <div className="mt-8 text-slate-400 font-bold leading-relaxed text-base border-l-4 border-blue-500 pl-6">
                  {faq.a}
                </div>
              </motion.details>
            ))}
          </div>
        </section>
      </motion.div>
    </div>
  );
}
