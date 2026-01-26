"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/atom-one-dark.css";
import Link from "next/link";
import Image from "next/image";
import { FaArrowLeft, FaClock, FaCalendarAlt, FaArrowRight } from "react-icons/fa";

const posts = [
  {
    id: "docker-guia",
    title: "Guía Completa de Docker — Producción",
    description: "Aprenda Docker desde sus fundamentos: instalación, contenedores, imágenes y despliegue profesional en entornos de alta disponibilidad.",
    image: "/img/guiaDocker.jpg",
    category: "DevOps",
    date: "2025",
    readTime: 12,
    content: `
# Guía Completa de Docker Corporativo

Docker permite empaquetar aplicaciones en contenedores para garantizar entornos reproducibles y altamente portables.

---

## Estrategia de Contenedores

- Aislamiento total de dependencias.
- Despliegues acelerados y consistentes.
- Portabilidad absoluta entre entornos.
- Optimización de microservicios distribuidos.

## Implementación Técnica

\`\`\`bash
# Actualización y despliegue
sudo apt update
sudo apt install docker.io -y
sudo systemctl enable docker
sudo systemctl start docker
\`\`\`

---

## Arquitectura de Imágenes

Construir imágenes eficientes requiere un diseño de Dockerfile optimizado.

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install --production
COPY . .
CMD ["npm", "start"]
\`\`\`

---

## Conclusión Estratégica

Docker representa el estándar industrial para la modernización de aplicaciones y la estabilidad estructural en la nube.
    `,
    related: [
      { id: "typescript-basico", title: "Guía Profesional de TypeScript", description: "Sistemas de tipos avanzados para backend." }
    ]
  },
  {
    id: "typescript-basico",
    title: "Guía Profesional de TypeScript",
    description: "Domine el sistema de tipos, interfaces y utilidades modernas para proyectos escalables y libres de errores en tiempo de ejecución.",
    image: "/img/typescriptguia.jpg",
    category: "Backend",
    date: "2025",
    readTime: 10,
    content: `
# Ingeniería de Tipado con TypeScript

TypeScript añade seguridad estática y herramientas de desarrollo avanzadas al ecosistema JavaScript.

---

## Beneficios Estructurales

- Detección temprana de errores críticos.
- Autocompletado inteligente y documentación viva.
- Refactorización segura en sistemas de gran escala.

## Implementación de Interfaces

\`\`\`ts
interface ServiceResponse<T> {
  id: string;
  payload: T;
  timestamp: Date;
  status: 'active' | 'archived';
}
\`\`\`

---

## Tipado de Funciones Críticas

La definición precisa de contratos en funciones garantiza la integridad del flujo de datos.

\`\`\`ts
function processLegacyData(data: Buffer): ServiceResponse<string> {
  // Lógica de procesamiento de alta fidelidad
  return {
    id: 'TX-1002',
    payload: 'DATA_VERIFIED',
    timestamp: new Date(),
    status: 'active'
  };
}
\`\`\`

---

## Conclusión de Ingeniería

Adoptar TypeScript es una decisión estratégica para equipos que priorizan la calidad de software y la mantenibilidad a largo plazo.
    `,
    related: [
      { id: "docker-guia", title: "Guía Completa de Docker — Producción", description: "Infraestructura y despliegue moderno." }
    ]
  }
];

function PostContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    setPost(posts.find((p) => p.id === id) || null);
  }, [id]);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white p-6">
        <h2 className="title-fire text-5xl font-black uppercase mb-4">Misión Fallida</h2>
        <p className="text-gray-500 font-bold tracking-[0.4em] uppercase mb-12">Protocolo no encontrado en el archivo</p>
        <Link href="/blog" className="px-10 py-4 rounded-full glass-light border border-white/10 text-cyan-400 font-black tracking-widest uppercase hover:bg-cyan-500/10 transition-all">VOLVER AL BLOG</Link>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden pt-20 px-6 font-bold">

      {/* DECORACIÓN FONDO */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-cyan-500/5 blur-[200px] rounded-full pointer-events-none" />

      <section className="max-w-4xl mx-auto py-20 relative z-10">

        {/* VOLVER */}
        <Link href="/blog" className="inline-flex items-center gap-4 text-white/30 hover:text-cyan-400 mb-16 font-black tracking-[0.4em] uppercase transition-all group text-xs">
          <FaArrowLeft className="group-hover:-translate-x-2 transition-transform" /> REGRESAR AL REPOSITORIO
        </Link>

        {/* HERO POST CON TILT SIMULADO */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative h-[550px] mb-20 rounded-[4.5rem] overflow-hidden border border-white/10 shadow-3xl group">
          <Image src={post.image} alt={post.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
            <span className="px-8 py-2.5 bg-cyan-500 text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-2xl">{post.category.toUpperCase()}</span>
            <div className="flex items-center gap-6 text-white/40 font-black tracking-[0.2em] text-[10px] uppercase">
              <span className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-full border border-white/5"><FaClock className="text-cyan-500" /> {post.readTime} MIN LECTURA</span>
              <span className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-full border border-white/5"><FaCalendarAlt className="text-cyan-500" /> {post.date}</span>
            </div>
          </div>
        </motion.div>

        {/* TÍTULO POST */}
        <h1 className="title-fire text-5xl md:text-6xl font-black mb-16 uppercase leading-[1.1] tracking-tighter">{post.title}</h1>

        {/* CONTENIDO ARTICLE GLASS-PRO */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card-pro p-10 md:p-20 rounded-[4.5rem] border border-white/5 shadow-3xl mb-32 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

          <article className="prose prose-invert max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-widest prose-headings:mb-10 prose-headings:mt-16 prose-p:text-gray-300 prose-p:text-xl prose-p:leading-relaxed prose-p:font-medium prose-pre:bg-black/60 prose-pre:p-10 prose-pre:rounded-[3rem] prose-pre:border prose-pre:border-white/5 prose-a:text-cyan-400 prose-strong:text-white prose-hr:border-white/5 prose-img:rounded-[3rem] prose-img:shadow-2xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight, rehypeRaw]}>
              {post.content}
            </ReactMarkdown>
          </article>
        </motion.div>

        {/* RELATED CONTENT */}
        {post.related.length > 0 && (
          <div className="pb-32">
            <h2 className="title-fire text-3xl font-black mb-12 uppercase tracking-widest">Contenido Adicional</h2>
            <div className="grid md:grid-cols-2 gap-10">
              {post.related.map((rel: any, i: number) => (
                <Link key={i} href={`/post?id=${rel.id}`} className="p-10 glass-light border border-white/5 rounded-[3.5rem] hover:border-cyan-500/30 group transition-all shadow-xl block">
                  <span className="text-cyan-400 text-[10px] font-black tracking-[0.4em] uppercase mb-3 block">ACCESS-ID: {rel.id}</span>
                  <h3 className="text-2xl text-white font-black mb-6 uppercase group-hover:text-cyan-300 transition-colors leading-tight tracking-tight">{rel.title}</h3>
                  <div className="flex items-center gap-3 text-white/30 text-[10px] font-black tracking-[0.4em] uppercase group-hover:text-white transition-all">
                    SINCRO-TÉCNICA <FaArrowRight className="group-hover:translate-x-3 transition-transform text-cyan-500" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </section>
    </div>
  );
}

export default function PostPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex flex-col items-center justify-center text-cyan-400 font-black animate-pulse tracking-[0.5em] uppercase">SINCRONIZANDO TRANSMISIÓN...</div>}>
      <PostContent />
    </Suspense>
  );
}
