"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  FaSearch,
  FaClock,
  FaArrowRight,
} from "react-icons/fa";

const posts = [
  {
    id: "docker-guia",
    title: "Guía Completa de Docker — Producción",
    description: "Aprenda Docker desde sus fundamentos: instalación, contenedores, imágenes y despliegue profesional en entornos de alta disponibilidad.",
    image: "/img/guiaDocker.jpg",
    category: "DevOps",
    featured: true,
    readTime: 12,
  },
  {
    id: "typescript-basico",
    title: "Guía Profesional de TypeScript",
    description: "Domine el sistema de tipos, interfaces y utilidades modernas para proyectos escalables y libres de errores en tiempo de ejecución.",
    image: "/img/typescriptguia.jpg",
    category: "Backend",
    featured: true,
    readTime: 10,
  },
  {
    id: "react-hooks",
    title: "React Hooks — Patrones Reales",
    description: "Implementación avanzada de useState, useEffect y custom hooks siguiendo patrones modernos para interfaces reactivas de alto rendimiento.",
    image: "/img/react.jpg",
    category: "Frontend",
    featured: false,
    readTime: 8,
  },
];

const categories = ["Todos", ...Array.from(new Set(posts.map((p) => p.category)))];

export default function Blog() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");

  const filteredPosts = posts.filter((p) => {
    const matchFilter = filter === "Todos" || p.category === filter;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="relative overflow-hidden pt-20 px-6 font-bold">

      {/* DECORACIÓN FONDO */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[200px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[200px] rounded-full pointer-events-none" />

      {/* HEADER BLOG */}
      <section className="text-center py-20 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="section-title">
            <span className="block text-cyan-400 text-sm font-black tracking-[0.6em] uppercase mb-4">KNOWLEDGE BASE</span>
            <span className="title-fire text-glow-blue bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] text-7xl md:text-8xl font-black uppercase tracking-tighter">Blog</span>
          </h2>
          <p className="text-gray-400 mt-8 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
            Exploración técnica y arquitectónica. Guías estratégicas y análisis de <span className="text-white font-black underline decoration-cyan-500/50">Alto Rendimiento</span> para el desarrollo moderno.
          </p>
        </motion.div>
      </section>

      {/* BUSCADOR PROFESIONAL */}
      <div className="max-w-5xl mx-auto mb-24 relative z-10">
        <div className="glass-light p-2 rounded-full border border-white/10 flex items-center gap-4 px-10 mb-12 shadow-3xl focus-within:border-cyan-500/50 transition-all">
          <FaSearch className="text-cyan-500" />
          <input
            className="w-full bg-transparent py-5 text-white placeholder-white/10 outline-none text-sm tracking-widest uppercase font-black"
            placeholder="BUSCAR EN EL ARCHIVO DE CONOCIMIENTO..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-4 font-black">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-8 py-3 rounded-full text-[10px] tracking-widest uppercase transition-all border ${filter === cat
                ? "bg-cyan-500 text-black border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                : "glass-light text-white/40 border-white/10 hover:border-white/20 hover:text-white"
                }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ARTÍCULOS DESTACADOS */}
      <div className="max-w-7xl mx-auto mb-32 relative z-10">
        <h3 className="section-title !text-left mb-20">
          <span className="block text-cyan-400 text-sm font-black tracking-[0.3em] uppercase mb-2">HOT TOPICS</span>
          <span className="title-fire text-glow-blue bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.3)] text-4xl font-black uppercase">Contenido Destacado</span>
        </h3>

        <div className="grid md:grid-cols-2 gap-12">
          {posts.filter((p) => p.featured).map((p) => (
            <BlogCard key={p.id} p={p} featured />
          ))}
        </div>
      </div>

      {/* ARCHIVO COMPLETO */}
      <div className="max-w-7xl mx-auto pb-40 relative z-10">
        <h3 className="section-title !text-left mb-20">
          <span className="block text-cyan-400 text-sm font-black tracking-[0.3em] uppercase mb-2">KNOWLEDGE ARCHIVES</span>
          <span className="title-fire text-glow-blue bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.3)] text-4xl font-black uppercase">Explorar el Archivo</span>
        </h3>

        <div className="grid md:grid-cols-3 gap-8">
          {filteredPosts.map((p) => (
            <BlogCard key={p.id} p={p} />
          ))}
        </div>
      </div>

    </div>
  );
}

function BlogCard({ p, featured = false }: { p: any; featured?: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(useSpring(y), [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(useSpring(x), [-0.5, 0.5], ["-8deg", "8deg"]);

  const handleMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.article
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`${featured ? "glass-card-pro rounded-[4.5rem]" : "glass-light rounded-[3.5rem]"} border border-white/5 overflow-hidden group shadow-3xl cursor-pointer font-bold transition-all duration-500 hover:border-cyan-500/20`}
    >
      <Link href={`/post?id=${p.id}`}>
        <div style={{ transform: "translateZ(30px)" }} className={`relative ${featured ? "h-80" : "h-60"} overflow-hidden`}>
          <Image src={p.image} alt={p.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="absolute bottom-8 left-10">
            <span className="px-6 py-2 bg-cyan-500 text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
              {p.category.toUpperCase()}
            </span>
          </div>
        </div>
        <div style={{ transform: "translateZ(50px)" }} className="p-10 md:p-12">
          <h3 className={`${featured ? "text-3xl" : "text-xl"} text-white font-black mb-6 leading-tight group-hover:text-cyan-400 transition-colors uppercase tracking-tight`}>{p.title}</h3>
          <p className="text-gray-400 font-medium leading-relaxed mb-10 line-clamp-2 text-lg">{p.description}</p>
          <div className="flex items-center justify-between text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">
            <span className="flex items-center gap-2"><FaClock className="text-cyan-500" /> {p.readTime} MIN LECTURA</span>
            <span className="text-cyan-500 group-hover:translate-x-3 transition-transform">ANALIZAR PROTOCOLO →</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
