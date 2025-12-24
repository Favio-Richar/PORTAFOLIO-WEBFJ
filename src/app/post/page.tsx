"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/atom-one-dark.css";
import Link from "next/link";
import { FaArrowLeft, FaClock } from "react-icons/fa";

// =======================================================
// 🔥 DATOS LOCALES DEL FRONTEND (SIN BACKEND)
// =======================================================
const posts = [
  {
    id: "docker-guia",
    title: "Guía Completa de Docker — Desde Cero Hasta Producción",
    description: "Aprende Docker paso a paso con ejemplos reales.",
    image: "/img/guiaDocker.jpg",
    category: "DevOps",
    date: "2025",
    readTime: 8,
    content: `
# 🐳 Guía completa de Docker

Docker permite empaquetar aplicaciones dentro de contenedores para lograr entornos reproducibles y portables.

---

## 🔥 ¿Por qué usar Docker?

- Aislamiento total  
- Despliegues más rápidos  
- Paquetes portables  
- Perfecto para microservicios  

---

## 🛠 Instalación en Ubuntu

\`\`\`bash
sudo apt update
sudo apt install docker.io -y
sudo systemctl enable docker
sudo systemctl start docker
\`\`\`

---

## 🧪 Primer contenedor

\`\`\`bash
docker pull nginx
docker run -d -p 8080:80 nginx
\`\`\`

Abre tu navegador:  
👉 http://localhost:8080

---

## 📦 Dockerfile básico

\`\`\`dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm","start"]
\`\`\`

---

## 🚀 Construir imagen

\`\`\`bash
docker build -t mi-app .
\`\`\`

---

## 🔄 Ejecutar con Docker Compose

\`\`\`yaml
version: "3.9"
services:
  web:
    build: .
    ports:
      - "3000:3000"
    restart: always
\`\`\`

---

## ✅ Conclusión

Docker es una herramienta indispensable en DevOps, despliegues modernos y microservicios.
    `,
    related: [
      { id: "typescript-basico", title: "Guía Básica de TypeScript", description: "Conceptos esenciales del tipado moderno." }
    ]
  },

  {
    id: "typescript-basico",
    title: "Guía Básica de TypeScript",
    description: "Aprende conceptos modernos de TS.",
    image: "/img/typescriptguia.jpg",
    category: "Backend",
    date: "2025",
    readTime: 6,
    content: `
# 🔵 Introducción a TypeScript

TypeScript añade **tipado estático** y herramientas avanzadas a JavaScript.

---

## ✨ Beneficios
- Menos errores en producción  
- Mejor autocompletado  
- Código más mantenible  

---

## 📌 Tipos básicos

\`\`\`ts
let nombre: string = "Favio";
let edad: number = 25;
let activo: boolean = true;
\`\`\`

---

## 📌 Interfaces

\`\`\`ts
interface User {
  id: number;
  name: string;
}
\`\`\`

---

## 📌 Funciones tipadas

\`\`\`ts
function sumar(a: number, b: number): number {
  return a + b;
}
\`\`\`

---

## 🏁 Conclusión

TypeScript mejora tus proyectos grandes y modernos.
    `,
    related: [
      { id: "docker-guia", title: "Guía completa de Docker", description: "Contenedores, despliegues y más." }
    ]
  }
];

export default function PostPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    setPost(posts.find((p) => p.id === id) || null);
  }, [id]);

  if (!post) {
    return (
      <div className="text-center text-white py-40 text-xl">
        Artículo no encontrado.
      </div>
    );
  }

  const words = post.content.split(" ").length;
  const readTime = Math.ceil(words / 200);

  return (
    <section className="max-w-4xl mx-auto px-6 py-16 text-white">

      {/* Volver */}
      <Link
        href="/blog"
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-8"
      >
        <FaArrowLeft /> Volver al blog
      </Link>

      {/* Imagen principal */}
      <motion.img
        src={post.image}
        alt={post.title}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-96 object-cover rounded-2xl shadow-lg mb-10"
      />

      {/* Título */}
      <h1 className="text-5xl font-extrabold mb-4">{post.title}</h1>

      {/* Metadata */}
      <div className="flex items-center gap-4 text-gray-400 mb-10">
        <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs">
          {post.category}
        </span>
        <span>{post.date}</span>
        <span className="flex items-center gap-1">
          <FaClock /> {readTime} min lectura
        </span>
      </div>

      {/* Contenido Markdown */}
      <article className="prose prose-invert max-w-none prose-pre:bg-black/40 prose-pre:p-4 prose-pre:rounded-xl prose-img:rounded-xl">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeRaw]}
        >
          {post.content}
        </ReactMarkdown>
      </article>

      {/* Artículos relacionados */}
      <div className="mt-20">
        <h2 className="text-2xl font-bold mb-6">Artículos relacionados</h2>

        {post.related.length === 0 ? (
          <p className="text-gray-500">No hay artículos relacionados.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {post.related.map((rel: { id: string; title: string; description: string }, i: number) => (

              <Link
                key={i}
                href={`/post?id=${rel.id}`}
                className="bg-white/5 p-5 rounded-xl border border-white/10 hover:bg-white/10 transition"
              >
                <h3 className="font-bold text-white">{rel.title}</h3>
                <p className="text-gray-400 text-sm">{rel.description}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

    </section>
  );
}
