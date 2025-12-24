"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { FaSearch, FaTag, FaFire, FaClock, FaArrowRight } from "react-icons/fa";

// ============================================================
// 🔥 DATOS LOCALES DEL FRONTEND (NO BACKEND, NO FETCH)
// ============================================================
const posts = [
  {
    id: "docker-guia",
    title: "Guía Completa de Docker — Desde Cero Hasta Producción",
    description:
      "Aprende Docker desde cero: instalación, contenedores, imágenes, Dockerfile, buenas prácticas y despliegue profesional.",
    image: "/img/guiaDocker.jpg",
    category: "DevOps",
    featured: true,
    readTime: 12,
  },
  {
    id: "typescript-basico",
    title: "Guía Profesional de TypeScript — Tipado Moderno",
    description:
      "Domina tipos, interfaces, funciones tipadas, clases, utilidades modernas y buenas prácticas para proyectos escalables.",
    image: "/img/typescriptguia.jpg",
    category: "Backend",
    featured: true,
    readTime: 10,
  },
  {
    id: "react-hooks",
    title: "React Hooks — Guía Moderna y Completa",
    description:
      "Aprende useState, useEffect, useMemo, custom hooks, patrones reales y cómo optimizar apps con React.",
    image: "/img/react.jpg",
    category: "Frontend",
    featured: false,
    readTime: 8,
  },
];

// categorías únicas
const categories = ["Todos", ...Array.from(new Set(posts.map((p) => p.category)))];

export default function Blog() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");

  const filteredPosts = posts.filter((p) => {
    const matchFilter = filter === "Todos" || p.category === filter;
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());

    return matchFilter && matchSearch;
  });

  return (
    <section className="relative max-w-7xl mx-auto px-6 py-20 text-white">

      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-extrabold mb-4">Blog & Artículos</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Tutoriales, guías técnicas completas, arquitectura, DevOps, programación y más.
        </p>
      </motion.div>

      {/* BUSCADOR */}
      <div className="flex items-center gap-3 max-w-xl mx-auto mb-12 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
        <FaSearch className="text-gray-400" />
        <input
          className="bg-transparent text-white w-full outline-none"
          placeholder="Buscar artículos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* CATEGORÍAS */}
      <div className="flex flex-wrap justify-center gap-3 mb-14">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-5 py-2 rounded-full border transition ${
              filter === cat
                ? "bg-primary text-black border-primary"
                : "border-white/20 text-white hover:bg-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* DESTACADOS */}
      <h2 className="text-white text-3xl font-bold mb-6 flex items-center gap-2">
        <FaFire className="text-primary" /> Artículos Destacados
      </h2>

      <div className="grid md:grid-cols-2 gap-10 mb-20">
        {posts
          .filter((p) => p.featured)
          .map((p) => (
            <motion.div
              key={p.id}
              whileHover={{ scale: 1.04 }}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl"
            >
              <Link href={`/post?id=${p.id}`}>
                <Image
                  src={p.image}
                  alt={p.title}
                  width={900}
                  height={800}
                  className="w-full aspect-video object-cover"
                />
                <div className="p-6">
                  <span className="text-primary text-sm font-semibold flex gap-2 items-center">
                    <FaTag /> {p.category}
                  </span>
                  <h3 className="text-xl font-bold mt-2">{p.title}</h3>
                  <p className="text-gray-300 text-sm mt-2 line-clamp-3">
                    {p.description}
                  </p>
                  <div className="flex items-center text-gray-400 text-xs gap-2 mt-3">
                    <FaClock /> {p.readTime} min lectura
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
      </div>

      {/* TODOS LOS ARTÍCULOS */}
      <h2 className="text-white text-3xl font-bold mb-6">Todos los artículos</h2>

      <div className="grid md:grid-cols-3 gap-10">
        {filteredPosts.map((p) => (
          <motion.div
            key={p.id}
            whileHover={{ scale: 1.04 }}
            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
          >
            <Link href={`/post?id=${p.id}`}>
              <Image
                src={p.image}
                alt={p.title}
                width={600}
                height={400}
                className="w-full aspect-[16/10] object-cover"
              />
              <div className="p-5">
                <span className="text-primary text-sm">{p.category}</span>

                <h3 className="text-lg font-bold mt-1">{p.title}</h3>

                <p className="text-gray-400 text-sm mt-2 line-clamp-3">
                  {p.description}
                </p>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-gray-500 text-xs flex items-center gap-2">
                    <FaClock /> {p.readTime} min
                  </span>

                  <span className="text-primary text-sm flex items-center gap-1">
                    Leer más <FaArrowRight />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
