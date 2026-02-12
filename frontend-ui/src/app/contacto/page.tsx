"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
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
  loading: () => <div className="w-full h-full min-h-[400px] bg-white/5 animate-pulse rounded-none" />,
});

const CONTACT_CONFIG = {
  phone: "+56 9 1234 5678",
  whatsapp: "56912345678",
  email: "contacto@levelsoftwarepro.com",
  location: "Santiago Centro, Chile",
  address: "Santiago Centro, Chile",
  lat: -33.4569385,
  lng: -70.6482684,
  social: {
    facebook: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    tiktok: "",
    github: "", // Added
  },
  hero_image: "",
  hero_video: "",
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

const BRAND_COLORS = {
  location: "#EA4335", // Google Red
  phone: "#34A853", // Green
  email: "#4285F4", // Blue
  whatsapp: "#25D366", // WA Green
  facebook: "#1877F2",
  instagram: "#E4405F",
  linkedin: "#0A66C2",
  x: "#ffffff",
  tiktok: "#ff0050",
  github: "#6e5494",
};

function getCountryBadge(location: string) {
  const normalized = (location || "").toLowerCase();
  if (normalized.includes("chile") || normalized.includes(" santiago")) {
    return { code: "cl", name: "Chile" };
  }
  if (normalized.includes("argentina")) {
    return { code: "ar", name: "Argentina" };
  }
  if (normalized.includes("peru") || normalized.includes("perú")) {
    return { code: "pe", name: "Perú" };
  }
  if (normalized.includes("colombia")) {
    return { code: "co", name: "Colombia" };
  }
  if (normalized.includes("mexico") || normalized.includes("méxico")) {
    return { code: "mx", name: "México" };
  }
  return { code: "", name: "Internacional" };
}

function QuickCard({ icon, label, sub, link, iconColor, meta, hideIcon = false }: { icon: any; label: string; sub: string; link: string; iconColor: string; meta?: React.ReactNode; hideIcon?: boolean }) {
  return (
    <motion.a
      href={link}
      target="_blank"
      rel="noreferrer"
      whileHover={{ scale: 1.02, y: -2 }}
      className="flex items-start gap-3 p-4 !rounded-none border-white/5 group transition-all w-full relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #020617 0%, #0f172a 100%)",
        boxShadow: "inset 0 0 15px rgba(255, 255, 255, 0.02)"
      }}
    >
      {!hideIcon ? (
        <div
          className="w-12 h-12 rounded-none bg-black/40 border flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-all duration-500"
          style={{ color: iconColor, borderColor: `${iconColor}30`, boxShadow: `0 0 20px ${iconColor}20` }}
        >
          <div style={{ filter: `drop-shadow(0 0 10px ${iconColor}60)` }}>
            {icon}
          </div>
        </div>
      ) : null}
      <div className="flex-1">
        <h3 className="text-white font-black text-[10px] uppercase tracking-widest mb-1 opacity-80 group-hover:opacity-100 transition-opacity">{label}</h3>
        {meta ? (
          <p className="text-white/90 text-[9px] font-black uppercase tracking-wider mb-0.5">{meta}</p>
        ) : null}
        <p className="text-white/60 text-[10px] font-bold leading-tight drop-shadow-sm">{sub}</p>
      </div>
      <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-br from-transparent to-white/5 pointer-events-none" />
    </motion.a>
  );
}

function HQBlock() {
  const [time, setTime] = useState("");
  const [status, setStatus] = useState({ label: "CARGANDO...", sub: "", active: true });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Chile Time (Santiago)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "America/Santiago",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      };

      const clTimeStr = now.toLocaleTimeString("es-CL", options);
      setTime(clTimeStr);

      // Status Logic
      const clDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Santiago" }));
      const hours = clDate.getHours();
      const day = clDate.getDay();
      const isOpenDay = day >= 1 && day <= 5;
      const hoursLimit = { open: 8, close: 19 };

      if (isOpenDay && hours >= hoursLimit.open && hours < hoursLimit.close) {
        setStatus({ label: "SISTEMA ACTIVO", sub: `OPERATIVO | CIERRA 19:00 HRS`, active: true });
      } else {
        const nextDayLabel = day >= 5 ? "LUNES" : "MAÑANA";
        setStatus({ label: "FUERA DE LÍNEA", sub: `CERRADO | REANUDAMOS ${nextDayLabel} 08:00`, active: false });
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
      className={`p-5 !rounded-none relative overflow-hidden transition-all duration-700 shadow-2xl ${!status.active ? "opacity-90 grayscale-[0.2]" : ""
        }`}
      style={{
        background: "linear-gradient(135deg, #020617 0%, #0f172a 100%)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        boxShadow: status.active ? "0 0 50px rgba(0, 242, 255, 0.05), inset 0 0 20px rgba(255, 255, 255, 0.02)" : "none"
      }}
    >
      <div className="flex flex-col gap-5 relative z-10">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-black uppercase tracking-tighter leading-none" style={{ color: '#0047FF', textShadow: '0 0 20px rgba(0, 71, 255, 0.4)' }}>
              <span className="block">Digital Systems</span>
              <span className="block text-center mt-1">FJ</span>
            </h2>
            <p className="font-black text-[9px] tracking-[0.3em] uppercase" style={{ color: '#0047FF' }}>Hub de Ingeniería Digital</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className={`status-badge shrink-0 border border-white/10 ${status.active
              ? "!bg-emerald-950/30 !text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
              : "!bg-amber-950/30 !text-[#FFB800]"
              } text-[9px] py-1 px-3 font-black tracking-widest rounded-none`}>
              <span className={`w-1.5 h-1.5 ${status.active ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" : "bg-[#FFB800]"} rounded-full mr-2 inline-block`} />
              {status.label}
            </div>

            <div className="mt-1 bg-[#050b14] border border-[#0047FF]/20 px-4 py-2 rounded-none shadow-[inset_0_0_15px_rgba(0,71,255,0.05)] flex items-center gap-3 w-full justify-end">
              <div className="w-1.5 h-1.5 bg-[#0047FF] animate-pulse rounded-full shadow-[0_0_10px_#0047ff]" />
              <span className="font-black text-xl tracking-[0.2em] tabular-nums font-mono leading-none" style={{ color: '#0047FF', textShadow: '0 0 15px rgba(0, 71, 255, 0.6)' }}>
                {time}
              </span>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 bg-white/5 pr-4 rounded-none border border-white/5">
            <div className={`w-10 h-10 rounded-none flex items-center justify-center text-lg flex-shrink-0 transition-all ${status.active
              ? "bg-[#0047FF]/10 text-[#0047FF] shadow-[inset_0_0_10px_rgba(0,71,255,0.1)]"
              : "bg-white/5 text-white/30"
              }`}>
              <FaClock />
            </div>
            <div className="space-y-0.5 py-1">
              <p className="text-[8px] font-black uppercase tracking-[0.2em] leading-none mb-0.5" style={{ color: '#0047FF' }}>Horario de Operaciones</p>
              <p className="text-white font-bold text-[10px] uppercase tracking-wide leading-tight max-w-[150px]">{status.sub}</p>
            </div>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div className="flex-1">
            <div className={`p-3 border transition-all duration-500 ${status.active ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/5 bg-white/5"}`}>
              <p className="text-[7px] font-black uppercase tracking-[0.4em] leading-none mb-2" style={{ color: '#0047FF' }}>Estado Operativo</p>
              {status.active ? (
                <>
                  <p className="text-white font-black text-[11px] uppercase tracking-widest leading-tight">
                    Recepción de <span className="text-emerald-400">Solicitudes Activa</span>
                  </p>
                  <p className="text-white/40 text-[8px] font-medium leading-tight mt-1 underline decoration-emerald-500/30 underline-offset-4">Sistemas en tiempo real</p>
                </>
              ) : (
                <>
                  <p className="text-white/60 font-black text-[11px] uppercase tracking-widest leading-tight">Ciclo Operativo Cerrado</p>
                  <p className="text-white/30 text-[8px] font-medium leading-tight mt-1 underline decoration-white/10 underline-offset-4">Gestión al inicio de jornada</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {!status.active && (
        <div className="absolute inset-0 bg-[#020617]/50 backdrop-grayscale-[0.5] pointer-events-none" />
      )}
    </motion.div>
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
  const [contactData, setContactData] = useState(CONTACT_CONFIG);
  const [galleryMedia, setGalleryMedia] = useState<any[]>([]);
  const [currentMediaIdx, setCurrentMediaIdx] = useState(0);
  const mapLat = typeof contactData.lat === "number" ? contactData.lat : CONTACT_CONFIG.lat;
  const mapLng = typeof contactData.lng === "number" ? contactData.lng : CONTACT_CONFIG.lng;
  const phoneText = contactData.phone || CONTACT_CONFIG.phone;
  const emailText = contactData.email || CONTACT_CONFIG.email;
  const locationText = (contactData.location || CONTACT_CONFIG.address)
    .replace(/\bcl\s+chile\b/gi, "Chile")
    .replace(/\bcl\b(?=\s*,|\s*$)/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  const locationParts = locationText.split(",").map((p) => p.trim()).filter(Boolean);
  const popupStreet = locationParts[0] || "Av. Sta. Rosa 3573";
  const popupArea = locationParts.slice(1).join(", ") || "San Miguel, Región Metropolitana";
  const directionsUrl = `https://www.google.com/maps?q=${mapLat},${mapLng}`;
  const countryBadge = getCountryBadge(locationText);
  const whatsappRaw = contactData.whatsapp || phoneText;
  const whatsappDigits = whatsappRaw.replace(/\D/g, "");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Contact info
        const contactRes = await fetch("http://localhost:8000/api/contact");
        if (contactRes.ok) {
          const data = await contactRes.json();
          setContactData({
            ...data,
            social: {
              facebook: data.facebook || "",
              instagram: data.instagram || "",
              linkedin: data.linkedin || "",
              twitter: data.twitter || "",
              tiktok: data.tiktok || "",
              github: data.github || "", // Added
            }
          });
        }

        // Fetch Gallery Media (Las fotos y videos de tu pasarela)
        const mediaRes = await fetch("http://localhost:8000/api/media");
        if (mediaRes.ok) {
          const data = await mediaRes.json();
          setGalleryMedia(data.filter((m: any) => m.active));
        }
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };
    fetchData();
  }, []);

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

  // Ciclo automático para el fondo (Pasarela)
  useEffect(() => {
    if (galleryMedia.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentMediaIdx(prev => (prev + 1) % galleryMedia.length);
    }, 8000); // 8 segundos por media
    return () => clearInterval(interval);
  }, [galleryMedia.length]);

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="contact-elite-wrapper">
      <div className="bg-noise hidden" />
      <div className="bg-mesh hidden" />

      {/* Hero Section */}
      <section className="contact-hero min-h-[500px] flex items-center relative overflow-hidden">
        {/* Background Media (Integrado con la Pasarela Multimedia) */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-black">
          <AnimatePresence mode="wait">
            {galleryMedia.length > 0 ? (
              <motion.div
                key={galleryMedia[currentMediaIdx].url}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute inset-0"
              >
                {galleryMedia[currentMediaIdx].type === 'video' ? (
                  <video
                    autoPlay loop muted playsInline
                    className="w-full h-full object-cover shadow-2xl"
                  >
                    <source src={galleryMedia[currentMediaIdx].url} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={galleryMedia[currentMediaIdx].url}
                    alt="Gallery Background"
                    className="w-full h-full object-cover shadow-2xl"
                  />
                )}
              </motion.div>
            ) : (
              // Fallback a los datos antiguos si no hay galería
              <motion.div
                key="fallback"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                className="absolute inset-0"
              >
                {contactData.hero_video ? (
                  <video autoPlay loop muted playsInline className="w-full h-full object-cover shadow-2xl">
                    <source src={contactData.hero_video} type="video/mp4" />
                  </video>
                ) : contactData.hero_image ? (
                  <img src={contactData.hero_image} alt="Hero Background" className="w-full h-full object-cover shadow-2xl" />
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
          {/* Overlay gradient - Smoother and lighter for clarity */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#030712] z-10" />
        </div>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-10 w-full"
        >
          <div className="max-w-[1600px] mx-auto w-full">
            <p className="hero-subtitle mb-6 font-black tracking-[0.4em] uppercase" style={{ color: '#0047FF' }}>Global Engineering Center</p>
            <h1 className="hero-title" style={{ color: '#0047FF', textShadow: '0 0 30px rgba(0, 71, 255, 0.2)' }}>
              INICIEMOS UNA <br className="hidden md:block" />
              CONSULTA ESTRATÉGICA
            </h1>
            <div className="space-y-4 max-w-3xl">
              <p className="text-white font-black text-sm md:text-base uppercase tracking-widest leading-relaxed opacity-90">
                Explícanos tu desafío digital, proceso operativo o idea de desarrollo.
              </p>
              <p className="text-white/60 text-xs md:text-sm font-medium leading-relaxed">
                Evaluaremos tu requerimiento y definiremos la mejor solución técnica para transformar tu necesidad en resultados reales.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Block 2: Middle Section (Unified Block - FULL WIDTH RECTANGULAR) */}
      <section className="contact-middle-section pt-0 pb-0 relative z-20 w-full">
        <motion.div
          className="w-full"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="unified-glass-block p-10 md:p-14 lg:p-12 !rounded-none relative overflow-hidden backdrop-blur-3xl w-full">
            <div className="max-w-[1600px] mx-auto">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-16 lg:gap-24 items-stretch relative z-10">
                {/* LEFT: SEND MESSAGE (FORM) - 7 COLS */}
                <motion.div variants={itemVariants} className="xl:col-span-7 space-y-8 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h2 className="text-4xl font-black uppercase tracking-tighter" style={{ color: '#0047FF', textShadow: '0 0 20px rgba(0, 71, 255, 0.3)' }}>
                      Solicitar Consulta Técnica
                    </h2>
                    <div className="space-y-2">
                      <p className="text-white/60 text-[11px] font-bold uppercase tracking-wider leading-relaxed">
                        Comparte los detalles de tu requerimiento digital o desafío operativo.
                      </p>
                      <p className="text-white/30 text-[10px] font-medium leading-relaxed max-w-xl">
                        Nuestro equipo evaluará tu caso y te responderá con una propuesta estructurada y viable.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-blue-400/60 uppercase tracking-widest px-2">Nombre Corporativo</p>
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          placeholder="NOMBRE CORPORATIVO"
                          className="form-input-premium !rounded-none px-6 py-5 text-xs font-bold w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-blue-400/60 uppercase tracking-widest px-2">E-mail Institucional</p>
                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          required
                          placeholder="E-MAIL INSTITUCIONAL"
                          className="form-input-premium !rounded-none px-6 py-5 text-xs font-bold w-full"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-blue-400/60 uppercase tracking-widest px-2">Contacto Móvil</p>
                        <input
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          required
                          placeholder="CONTACTO MÓVIL"
                          className="form-input-premium !rounded-none px-6 py-5 text-xs font-bold w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-blue-400/60 uppercase tracking-widest px-2">Solución Requerida</p>
                        <select
                          name="subject"
                          value={form.subject}
                          onChange={handleChange}
                          className="form-input-premium !rounded-none px-6 py-5 text-xs font-bold w-full appearance-none bg-dark-deep cursor-pointer"
                        >
                          <option value="">SOLUCIÓN REQUERIDA</option>
                          <option value="software">Software a Medida</option>
                          <option value="cloud">Infraestructura Cloud</option>
                          <option value="ai">Inteligencia Artificial</option>
                          <option value="consultancy">Consultoría Técnica</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest px-2" style={{ color: '#0047FF' }}>Descripción Técnica del Desafío</p>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        placeholder="DESCRIPCIÓN TÉCNICA DEL DESAFÍO"
                        className="form-input-premium !rounded-none px-6 py-5 text-xs font-bold w-full resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="submit-btn-elite !w-full px-12 py-6 text-white text-[13px] font-black tracking-[0.4em] uppercase !rounded-none flex items-center justify-center gap-4 group transition-all"
                    >
                      <FaPaperPlane className="text-lg group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      {status === "sending" ? "PROCESANDO..." : "AGENDAR CONSULTA TÉCNICA"}
                    </button>
                  </form>
                </motion.div>

                {/* RIGHT: INFO STACK (HQ + CARDS + SOCIAL) - 5 COLS */}
                <motion.div variants={itemVariants} className="xl:col-span-5 space-y-8 flex flex-col">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] px-2" style={{ color: '#0047FF' }}>Status Operativo</p>
                    <HQBlock />
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] px-2" style={{ color: '#0047FF' }}>Canales Directos</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <QuickCard
                        icon={<FaLocationDot />}
                        label="Ubicación Base"
                        hideIcon
                        meta={
                          <span className="inline-flex items-center gap-1.5">
                            {countryBadge.code ? (
                              <img
                                src={`https://flagcdn.com/w20/${countryBadge.code}.png`}
                                alt={countryBadge.name}
                                className="w-4 h-3 object-cover border border-white/20"
                              />
                            ) : null}
                            <span>{countryBadge.name}</span>
                          </span>
                        }
                        sub={locationText}
                        link={`https://www.google.com/maps?q=${mapLat},${mapLng}`}
                        iconColor={BRAND_COLORS.location}
                      />
                      <QuickCard
                        icon={<FaPhone />}
                        label="Línea Móvil"
                        sub={phoneText}
                        link={`tel:${phoneText.replace(/\s/g, "")}`}
                        iconColor={BRAND_COLORS.phone}
                      />
                      <QuickCard
                        icon={<FaEnvelope />}
                        label="E-mail Institucional"
                        sub={emailText}
                        link={`mailto:${emailText}`}
                        iconColor={BRAND_COLORS.email}
                      />
                      <QuickCard
                        icon={<FaWhatsapp />}
                        label="WhatsApp Corporativo"
                        sub={contactData.whatsapp || phoneText}
                        link={`https://wa.me/${whatsappDigits}`}
                        iconColor={BRAND_COLORS.whatsapp}
                      />
                    </div>
                  </div>

                  {/* Integrated Social Links */}
                  <div className="space-y-3 mt-auto">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] px-2" style={{ color: '#0047FF' }}>Presencia Digital</p>
                    <div className="p-6 !rounded-none border-white/5" style={{ background: "linear-gradient(135deg, #020617 0%, #0f172a 100%)", boxShadow: "inset 0 0 20px rgba(255, 255, 255, 0.02)" }}>
                      <div className="flex flex-wrap gap-8">
                        {[
                          { icon: <FaFacebookF />, link: contactData.social.facebook, color: BRAND_COLORS.facebook },
                          { icon: <FaInstagram />, link: contactData.social.instagram, color: BRAND_COLORS.instagram },
                          { icon: <FaLinkedinIn />, link: contactData.social.linkedin, color: BRAND_COLORS.linkedin },
                          { icon: <FaXTwitter />, link: contactData.social.twitter, color: BRAND_COLORS.x },
                          { icon: <FaTiktok />, link: contactData.social.tiktok, color: BRAND_COLORS.tiktok },
                          { icon: <FaGithub />, link: contactData.social.github, color: BRAND_COLORS.github },
                        ].map((social, i) => (
                          <motion.a
                            key={i}
                            href={social.link || "#"}
                            target="_blank"
                            rel="noreferrer"
                            whileHover={{ scale: 1.1, filter: "brightness(1.5)", backgroundColor: `${social.color}20` }}
                            className="w-11 h-11 rounded-none bg-black/40 border border-white/5 flex items-center justify-center transition-all shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
                            style={{ color: social.color, borderColor: `${social.color}40`, boxShadow: `inset 0 0 10px ${social.color}10` }}
                          >
                            <div className="text-xl" style={{ filter: `drop-shadow(0 0 10px ${social.color}60)` }}>
                              {social.icon}
                            </div>
                          </motion.a>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>



      {/* Block 4: Map Section (Full Width Bottom - NO ROUNDED) */}
      <section className="w-full">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="map-container-pro h-[600px] w-full !rounded-none"
        >
          <InteractiveMap
            center={[mapLat, mapLng]}
            zoom={15}
            popupTitle="FJ Digital Systems"
            popupStreet={popupStreet}
            popupArea={popupArea}
            popupSchedule="Lun–Vie 08:00–19:00"
            directionsUrl={directionsUrl}
          />
        </motion.div>
      </section>
    </div>
  );
}
