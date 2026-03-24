"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import "highlight.js/styles/atom-one-dark.css";
import Link from "next/link";
import Image from "next/image";
import { FaArrowLeft, FaClock, FaCalendarAlt, FaShareAlt } from "react-icons/fa";
import API_BASE from "@/lib/apiBase";
import "@/styles/blog-elite.scss";

const markdownSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code || []), ["className"]],
    span: [...(defaultSchema.attributes?.span || []), ["className"]],
    pre: [...(defaultSchema.attributes?.pre || []), ["className"]],
  },
};

function PostContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${API_BASE}/api/blog/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching post:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-indigo-400 font-black tracking-[0.5em] uppercase">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-8" />
        Sincronizando Archivo...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6">
        <h2 className="text-6xl font-black uppercase mb-8 blog-title-gradient">Misión Fallida</h2>
        <p className="text-slate-500 font-bold tracking-[0.4em] uppercase mb-12">Protocolo no encontrado en el archivo</p>
        <Link href="/blog" className="px-10 py-5 rounded-3xl bg-white/5 border border-white/10 text-indigo-400 font-black tracking-widest uppercase hover:bg-white/10 transition-all">VOLVER AL BLOG</Link>
      </div>
    );
  }

  // Fallback image
  const imageUrl = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2426";

  return (
    <div className="blog-page-wrapper pt-32 pb-40">
      <div className="max-w-5xl mx-auto px-6 relative z-10">

        {/* BACK NAV */}
        <Link href="/blog" className="inline-flex items-center gap-4 text-slate-500 hover:text-white mb-16 font-black tracking-[0.4em] uppercase transition-all group text-xs">
          <FaArrowLeft className="group-hover:-translate-x-2 transition-transform text-indigo-500" /> Regresar al Repositorio
        </Link>

        {/* POST HERO */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative h-[600px] mb-20 rounded-[4rem] overflow-hidden border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.6)] group"
        >
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-[20s] group-hover:scale-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          <div className="absolute bottom-12 left-12 right-12">
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <span className="px-6 py-2 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl shadow-glow">
                Technical Insight
              </span>
              <div className="flex items-center gap-4 text-white/50 text-[10px] font-black uppercase tracking-widest">
                <FaClock className="text-indigo-400" /> 8 Min Read
              </div>
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-4">
              {post.title}
            </h1>
          </div>
        </motion.div>

        {/* CONTENT RAINBOW BORDER CONTAINER */}
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-[150px] -z-10 rounded-full" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-article-card !bg-slate-950/60 !p-12 md:!p-32 rounded-[4rem] mb-32 border border-white/10"
          >
            <div className="post-content-container">
              <article className="prose prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw, [rehypeSanitize, markdownSchema]]}
                >
                  {post.content}
                </ReactMarkdown>
              </article>
            </div>

            <div className="mt-24 pt-12 border-t border-white/5 flex justify-between items-center">
              <div className="flex gap-4">
                <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all">
                  <FaShareAlt />
                </button>
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                © 2026 ELITE ARCHIVE
              </div>
            </div>
          </motion.div>
        </div>

        {/* CALL TO ACTION */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-800 rounded-[3.5rem] p-16 md:p-24 text-center border border-white/20 shadow-glow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">¿Tienes un Desafío Técnico?</h2>
          <p className="text-indigo-100/70 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium">
            Transformamos problemas complejos en soluciones de software de alto rendimiento. Hablemos sobre tu próximo gran salto digital.
          </p>
          <Link href="/contacto" className="inline-block bg-white text-indigo-600 px-12 py-6 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-2xl">
            AGENDAR CONSULTORÍA ELITE
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function PostPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-indigo-400 font-black tracking-[0.5em] uppercase">
        SINCRONIZANDO TRANSMISIÓN...
      </div>
    }>
      <PostContent />
    </Suspense>
  );
}
