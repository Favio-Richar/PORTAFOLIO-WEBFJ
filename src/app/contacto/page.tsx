"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaPaperPlane,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";

const serviciosOpciones = [
  "Desarrollo Web Profesional",
  "Aplicaciones Móviles (Flutter)",
  "APIs / Backend (FastAPI – NestJS)",
  "ERP / CRM Empresarial",
  "Integraciones – Automatización",
  "DevOps / VPS / Docker",
  "Soporte Técnico",
  "Redes / Cableado",
  "Ciberseguridad",
  "Otro",
];

export default function Contacto() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    servicio: "",
    descripcion: "",
  });

  const [status, setStatus] =
    useState<null | "sending" | "success" | "error">(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nombre || !form.email || !form.servicio) {
      setErrorMsg("Completa los campos obligatorios.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v as string));

      const res = await fetch("/api/enviar-cotizacion", {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("Error al enviar el correo");

      setStatus("success");
      setForm({
        nombre: "",
        email: "",
        telefono: "",
        servicio: "",
        descripcion: "",
      });
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  };

  return (
    <section className="relative max-w-6xl mx-auto px-6 py-24">

      {/* Fondos decorativos */}
      <div className="absolute -top-20 left-0 w-[400px] h-[400px] bg-primary/20 blur-[180px] rounded-full"></div>
      <div className="absolute -bottom-20 right-0 w-[400px] h-[400px] bg-primary/10 blur-[200px] rounded-full"></div>

      {/* Título */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-extrabold text-center text-white"
      >
        Contáctame
      </motion.h1>

      <p className="text-gray-400 text-center max-w-2xl mx-auto mt-4">
        Cuéntame tu idea o necesidad. Te responderé con una cotización hecha a medida.
      </p>

      {/* GRID: FORMULARIO + MAPA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16">

        {/* FORMULARIO */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-xl flex flex-col gap-5"
        >
          {status === "success" && (
            <p className="bg-green-600/20 text-green-300 p-3 rounded text-center">
              ✔ Solicitud enviada correctamente
            </p>
          )}

          {status === "error" && (
            <p className="bg-red-600/20 text-red-300 p-3 rounded text-center">
              ❌ {errorMsg || "Hubo un error, inténtalo nuevamente."}
            </p>
          )}

          {/* Input genérico */}
          {[
            {
              label: "Nombre *",
              name: "nombre",
              placeholder: "Tu nombre",
            },
            {
              label: "Correo electrónico *",
              name: "email",
              placeholder: "ejemplo@correo.com",
              type: "email",
            },
            {
              label: "Teléfono / WhatsApp",
              name: "telefono",
              placeholder: "+56 9 1234 5678",
            },
          ].map((input) => (
            <div key={input.name}>
              <label className="text-gray-300 text-sm">{input.label}</label>
              <input
                type={input.type || "text"}
                name={input.name}
                value={(form as any)[input.name]}
                onChange={handleChange}
                placeholder={input.placeholder}
                className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:border-primary outline-none"
              />
            </div>
          ))}

          {/* SELECT SERVICIO */}
          <div>
            <label className="text-gray-300 text-sm">
              Tipo de servicio / proyecto *
            </label>
            <select
              name="servicio"
              value={form.servicio}
              onChange={handleChange}
              className="w-full bg-transparent text-white border border-white/20 rounded-xl px-4 py-2 focus:border-primary outline-none"
            >
              <option value="">Selecciona...</option>
              {serviciosOpciones.map((s) => (
                <option value={s} key={s} className="text-black">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* DESCRIPCIÓN */}
          <div>
            <label className="text-gray-300 text-sm">Descripción del proyecto</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Detalles del proyecto, requerimientos o problema..."
              className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-500 resize-none h-24"
            />
          </div>

          {/* BOTÓN */}
          <button
            type="submit"
            className="mt-2 bg-primary text-black font-semibold py-3 rounded-xl flex justify-center items-center gap-3 hover:bg-primary/80 transition"
          >
            <FaPaperPlane />
            {status === "sending" ? "Enviando..." : "Enviar solicitud"}
          </button>

          {/* WHATSAPP DIRECTO */}
          <a
            href="https://wa.me/56912345678?text=Hola%20quiero%20cotizar%20un%20servicio"
            target="_blank"
            className="mt-3 flex justify-center items-center gap-2 text-green-400 hover:text-green-300"
          >
            <FaWhatsapp /> Contactar por WhatsApp
          </a>
        </motion.form>

        {/* MAPA + INFORMACIÓN */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl overflow-hidden border border-white/10 shadow-xl"
        >
          {/* INFORMACIÓN */}
          <div className="p-6 bg-white/5 border-b border-white/10 backdrop-blur-xl">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FaMapMarkerAlt /> Mi ubicación
            </h3>
            <p className="text-gray-400 mt-2">Santiago, Chile</p>

            <div className="mt-4 space-y-1 text-gray-300 text-sm">
              <p className="flex items-center gap-2"><FaEnvelope /> contacto@levelsoftwarepro.com</p>
              <p className="flex items-center gap-2"><FaPhone /> +56 9 1234 5678</p>
            </div>
          </div>

          {/* MAPA GOOGLE (FUNCIONAL) */}
          <iframe
            className="w-full h-80"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3330.4355862367835!2d-70.6482684!3d-33.4569385!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662c5a5281e36bd%3A0x85bd3f5a3fb47d42!2sSantiago%20Centro!5e0!3m2!1ses!2scl!4v1700000000000"
          ></iframe>
        </motion.div>
      </div>
    </section>
  );
}
