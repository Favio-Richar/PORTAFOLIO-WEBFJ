"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
} from "react-icons/fa6";
import dynamic from "next/dynamic";

// Dynamic import for Leaflet (No SSR)
const InteractiveMap = dynamic(() => import("@/components/layout/InteractiveMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[400px] bg-white/5 animate-pulse rounded-[3rem]" />
});

/* ================= CONFIG GLOBAL ================= */

const CONTACT_CONFIG = {
  company: "Level Software Pro",
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
  }
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

/* ================= COMPONENTS ================= */

function QuickCard({ icon, label, sub, link, colorClass, linkText }: any) {
  return (
    <motion.a
      href={link}
      target="_blank"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="contact-card-pro group"
    >
      <div className="card-icon-container" style={{ color: colorClass }}>
        <div className="pulse-ring" />
        <div className="icon-box bg-white/5 border border-white/10">
          {icon}
        </div>
      </div>
      <h3>{label}</h3>
      <p>{sub}</p>
      <span className="card-link text-indigo-400 group-hover:text-white">{linkText} →</span>
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

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/enviar-cotizacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.name,
          email: form.email,
          telefono: form.phone,
          servicio: form.subject || "Consulta General",
          descripcion: form.message
        }),
      });
      if (!res.ok) throw new Error("Error en la transmisión");
      setStatus("success");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err: any) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  return (
    <div className="contact-elite-wrapper min-h-screen pt-32 pb-40">
      {/* BACKGROUND SHAPES */}
      <div className="floating-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>

      <div className="content-wrapper max-w-7xl mx-auto px-6 relative z-10">

        {/* HEADER SECTION */}
        <header className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-md px-6 py-2 rounded-full mb-8"
          >
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            <span className="text-white/80 text-xs font-black tracking-[0.4em] uppercase">Communication Center</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter uppercase italic"
          >
            Contáctanos
          </motion.h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto font-medium">
            Establezca el puente estratégico entre su visión y la <span className="text-white">Realidad Digital</span>.
          </p>
        </header>

        {/* QUICK CONTACT GRID */}
        <div className="quick-contact-grid">
          <QuickCard
            icon={<FaWhatsapp />}
            label="WhatsApp"
            sub={CONTACT_CONFIG.phone}
            link={`https://wa.me/${CONTACT_CONFIG.whatsapp}`}
            colorClass="#22c55e"
            linkText="Chatear"
          />
          <QuickCard
            icon={<FaEnvelope />}
            label="Email"
            sub={CONTACT_CONFIG.email}
            link={`mailto:${CONTACT_CONFIG.email}`}
            colorClass="#ef4444"
            linkText="Enviar"
          />
          <QuickCard
            icon={<FaPhone />}
            label="Teléfono"
            sub={CONTACT_CONFIG.phone}
            link={`tel:${CONTACT_CONFIG.phone.replace(/\s/g, '')}`}
            colorClass="#3b82f6"
            linkText="Llamar"
          />
          <QuickCard
            icon={<FaLocationDot />}
            label="Ubicación"
            sub={CONTACT_CONFIG.address}
            link="#"
            colorClass="#a855f7"
            linkText="Ver Mapa"
          />
        </div>

        {/* MAIN INTERACTIVE SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">

          {/* FORM */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="glass-card-pro p-10 md:p-14 rounded-[3.5rem] border border-white/10 relative overflow-hidden"
          >
            <h2 className="text-3xl font-black text-white mb-8 uppercase italic tracking-widest">Enviar Mensaje</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <input name="name" value={form.name} onChange={handleChange} required placeholder="Nombre Completo" className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-white placeholder-white/20 focus:border-indigo-500 outline-none transition-all font-bold" />
                <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Email Corporativo" className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-white placeholder-white/20 focus:border-indigo-500 outline-none transition-all font-bold" />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Teléfono / WhatsApp" className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-white placeholder-white/20 focus:border-indigo-500 outline-none transition-all font-bold" />
                <select name="subject" value={form.subject} onChange={handleChange} className="w-full bg-black/60 border border-white/10 rounded-full px-8 py-5 text-white outline-none focus:border-indigo-500 transition-all font-bold appearance-none">
                  <option value="">Seleccionar Asunto</option>
                  <option value="Desarrollo Web">Desarrollo Web</option>
                  <option value="App Móvil">App Móvil</option>
                  <option value="API / Backend">API / Backend</option>
                  <option value="Consultoría">Consultoría</option>
                </select>
              </div>
              <textarea name="message" value={form.message} onChange={handleChange} required rows={4} placeholder="Detalles de su visión..." className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-6 text-white placeholder-white/20 focus:border-indigo-500 outline-none transition-all font-bold resize-none" />

              <button
                type="submit"
                disabled={status === "sending"}
                className="submit-btn-elite w-full py-6 rounded-full text-white font-black tracking-[0.3em] uppercase flex items-center justify-center gap-3"
              >
                {status === "sending" ? "Transmitiendo..." : (
                  <> <FaPaperPlane /> <span>Establecer Enlace</span> </>
                )}
              </button>

              {status === "success" && (
                <p className="text-indigo-400 font-black text-center text-xs tracking-widest mt-4">✓ TRANSMISIÓN EXITOSA</p>
              )}
            </form>
          </motion.div>

          {/* MAP & INFO */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col gap-10"
          >
            <div className="rounded-[3.5rem] overflow-hidden border border-white/10 h-full min-h-[400px] shadow-3xl">
              <InteractiveMap center={[CONTACT_CONFIG.lat, CONTACT_CONFIG.lng]} zoom={15} />
            </div>

            <div className="social-elite-section">
              <h3 className="text-white font-black uppercase italic tracking-widest text-lg mb-6">Redes Estratégicas</h3>
              <div className="social-grid">
                <a href={CONTACT_CONFIG.social.facebook} target="_blank" className="social-btn-pro fb"><FaFacebookF /></a>
                <a href={CONTACT_CONFIG.social.instagram} target="_blank" className="social-btn-pro ig"><FaInstagram /></a>
                <a href={CONTACT_CONFIG.social.linkedin} target="_blank" className="social-btn-pro li"><FaLinkedinIn /></a>
                <a href={CONTACT_CONFIG.social.twitter} target="_blank" className="social-btn-pro tw"><FaXTwitter /></a>
              </div>
            </div>
          </motion.div>

        </div>

        {/* FAQS SECTION */}
        <section className="max-w-4xl mx-auto pt-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Preguntas Frecuentes</h2>
            <div className="w-20 h-1 bg-indigo-500 mx-auto mt-4" />
          </div>
          <div className="space-y-6">
            {FAQS.map((faq, idx) => (
              <motion.details
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card-pro rounded-3xl p-8 cursor-pointer group hover:border-indigo-500/30 transition-all overflow-hidden"
              >
                <summary className="list-none flex items-center justify-between text-white font-black uppercase text-sm tracking-widest">
                  {faq.q}
                  <span className="text-indigo-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-6 text-gray-400 font-medium leading-relaxed">
                  {faq.a}
                </div>
              </motion.details>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
