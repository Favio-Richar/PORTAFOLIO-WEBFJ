"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaStar, FaUserCircle, FaCheckCircle } from "react-icons/fa";

/* =====================
   DATOS DE TESTIMONIOS
   ===================== */
const testimoniosIniciales = [
  {
    nombre: "Carolina Muñoz",
    empresa: "FastPack Chile",
    comentario:
      "Automatizó procesos internos críticos y redujo tiempos operativos de forma notable. Excelente comunicación, profesional y eficiente.",
    rating: 5,
    foto: "",
    verificado: true,
    fecha: "2024",
    rol: "Jefa de Proyectos",
  },
  {
    nombre: "Ignacio Torres",
    empresa: "Grupo Estepa",
    comentario:
      "Implementó soluciones empresariales claves para nuestro negocio. Rápido, responsable y con conocimiento sólido.",
    rating: 5,
    foto: "",
    verificado: true,
    fecha: "2025",
    rol: "Gerente TI",
  },
  {
    nombre: "Valentina Rivas",
    empresa: "VR Beauty",
    comentario:
      "Mi sistema de reservas quedó hermoso y funcional. Aumentaron mis ventas y mejoró la atención a clientes.",
    rating: 4,
    foto: "",
    verificado: true,
    fecha: "2023",
    rol: "Emprendedora",
  },
];

const logosEmpresas = [
  "/logos/fastpack.svg",
  "/logos/estepa.svg",
  "/logos/spa.svg",
  "/logos/nextcl.svg",
]; // Tus logos reales luego

export default function Clientes() {
  const [reseñas, setReseñas] = useState(testimoniosIniciales);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    empresa: "",
    rol: "",
    comentario: "",
    rating: 0,
    foto: "",
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();

    const nueva = { ...form, verificado: false, fecha: "Pendiente" };
    setReseñas((prev) => [...prev, nueva]);

    setForm({
      nombre: "",
      empresa: "",
      rol: "",
      comentario: "",
      rating: 0,
      foto: "",
    });

    setShowModal(false);
  };

  return (
    <section className="relative max-w-6xl mx-auto px-6 py-20">

      {/* Glow de fondo */}
      <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-primary/10 blur-[150px] rounded-full"></div>

      {/* Título */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-extrabold text-white text-center mb-6"
      >
        Clientes y Testimonios
      </motion.h1>

      <p className="text-center text-gray-400 max-w-2xl mx-auto mb-12">
        Empresas y profesionales que confiaron en mi trabajo para impulsar sus sistemas,
        automatizar procesos y mejorar su presencia digital.
      </p>

      {/* =============================
          LOGOS DE CLIENTES
         ============================= */}
      <div className="flex items-center justify-center gap-10 mb-20 flex-wrap opacity-70">
        {logosEmpresas.map((logo, i) => (
          <img key={i} src={logo} className="h-12 grayscale hover:grayscale-0 transition" />
        ))}
      </div>

      {/* =============================
          ESTADÍSTICAS DE CONFIANZA
         ============================= */}
      <div className="grid md:grid-cols-3 gap-10 text-center mb-20">

        <div>
          <p className="text-5xl font-extrabold text-primary">+32</p>
          <p className="text-gray-300">Empresas atendidas</p>
        </div>

        <div>
          <p className="text-5xl font-extrabold text-primary">4.9 ★</p>
          <p className="text-gray-300">Promedio de satisfacción</p>
        </div>

        <div>
          <p className="text-5xl font-extrabold text-primary">+48</p>
          <p className="text-gray-300">Proyectos completados</p>
        </div>
      </div>

      {/* BOTÓN AGREGAR RESEÑA */}
      <div className="text-center mb-14">
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-black px-6 py-3 font-bold rounded-xl hover:bg-primary/80 transition shadow-lg"
        >
          + Dejar una reseña
        </button>
      </div>

      {/* =============================
          GRID DE RESEÑAS PROFESIONALES
         ============================= */}
      <div className="grid md:grid-cols-3 gap-10">
        {reseñas.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl p-7"
          >
            {/* Foto */}
            <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-primary bg-white/10 mb-4 flex items-center justify-center">
              {r.foto ? (
                <img src={r.foto} className="object-cover w-full h-full" />
              ) : (
                <FaUserCircle className="text-gray-300 text-6xl" />
              )}
            </div>

            {/* Nombre */}
            <h3 className="text-xl font-bold text-white text-center flex items-center justify-center gap-2">
              {r.nombre}
              {r.verificado && <FaCheckCircle className="text-green-400" title="Verificado" />}
            </h3>

            {r.empresa && (
              <p className="text-primary text-sm text-center font-semibold">{r.empresa}</p>
            )}

            {r.rol && (
              <p className="text-gray-400 text-xs text-center mb-2">{r.rol}</p>
            )}

            {/* Estrellas */}
            <div className="flex justify-center gap-1 mb-3">
              {Array.from({ length: r.rating }).map((_, idx) => (
                <FaStar key={idx} className="text-yellow-400" />
              ))}
            </div>

            {/* Comentario */}
            <p className="text-gray-300 text-center leading-relaxed">“{r.comentario}”</p>
          </motion.div>
        ))}
      </div>

      {/* =============================
          MODAL PARA DEJAR RESEÑA
         ============================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl w-full max-w-lg shadow-xl">

            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Dejar una reseña
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              <input
                className="input"
                placeholder="Tu nombre"
                required
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />

              <input
                className="input"
                placeholder="Empresa (opcional)"
                onChange={(e) => setForm({ ...form, empresa: e.target.value })}
              />

              <input
                className="input"
                placeholder="Cargo / Rol (opcional)"
                onChange={(e) => setForm({ ...form, rol: e.target.value })}
              />

              <textarea
                className="input h-28"
                placeholder="Tu comentario…"
                required
                onChange={(e) => setForm({ ...form, comentario: e.target.value })}
              />

              {/* Rating */}
              <div className="flex justify-center gap-2 my-3">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <FaStar
                    key={idx}
                    onClick={() => setForm({ ...form, rating: idx + 1 })}
                    className={`cursor-pointer text-3xl ${
                      form.rating >= idx + 1 ? "text-yellow-400" : "text-gray-500"
                    }`}
                  />
                ))}
              </div>

              <button className="bg-primary text-black font-bold py-3 rounded-xl hover:bg-primary/80 transition">
                Enviar
              </button>
            </form>

            <button
              onClick={() => setShowModal(false)}
              className="text-gray-300 block mx-auto mt-4 text-sm hover:text-white"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

    </section>
  );
}

/* ======== estilos extra (TAILWIND extender) ======== */
