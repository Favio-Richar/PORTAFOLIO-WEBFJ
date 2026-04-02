import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FaArrowLeft, FaCalendarAlt, FaClock, FaFire, FaTag, FaUserCircle } from "react-icons/fa";
import API_BASE from "@/lib/apiBase";
import { sanitizeHtmlContent } from "@/lib/sanitizeHtml";
import "@/styles/blog-elite.scss";

interface BackendBlogRecord {
  id: number;
  title: string;
  content: string;
  author?: string;
  category?: string;
  tags?: string;
  main_image_url?: string;
  created_at?: string;
}

interface BlogDetailPost {
  id: number;
  title: string;
  content: string;
  category: string;
  image: string;
  date: string;
  readTime: string;
  views: string;
  author: string;
  tags: string[];
}

const BLOG_CATEGORY_IMAGE_FALLBACK: Record<string, string> = {
  reservas: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1600",
  facturas: "https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=1600",
  seguridad: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1600",
  ecommerce: "https://images.unsplash.com/photo-1556742049-02e45308b01e?auto=format&fit=crop&q=80&w=1600",
  industria: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1600",
  estrategia: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1600",
};

const BLOG_DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1600";

const MOCK_DETAIL_POSTS: BlogDetailPost[] = [
  {
    id: 1,
    title: "Como un sistema de reservas aumento 200% las ventas de un hotel",
    category: "Casos de Exito",
    date: "15 Ene 2024",
    readTime: "5 min",
    views: "4.0K",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1600",
    author: "Equipo Editorial",
    tags: ["reservas", "hotel", "operaciones"],
    content:
      "<h3>Contexto del proyecto</h3><p>El hotel gestionaba reservas de forma manual, sin integracion con pagos ni calendario centralizado.</p><h3>Implementacion</h3><p>Se desarrollo un motor de reservas web con disponibilidad en tiempo real, pasarela de pago y notificaciones automaticas.</p><h3>Resultados</h3><p>En 6 meses, la ocupacion crecio 200%, se redujo el overbooking y el equipo operativo recupero horas de trabajo cada semana.</p>",
  },
  {
    id: 2,
    title: "Guia completa: que sistema de facturacion conviene para una empresa en crecimiento",
    category: "Guias Practicas",
    date: "12 Ene 2024",
    readTime: "8 min",
    views: "5.1K",
    image: "https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=1600",
    author: "Equipo Editorial",
    tags: ["facturacion", "gestion", "finanzas"],
    content:
      "<h3>El problema comun</h3><p>Muchas empresas crecen rapido pero siguen facturando con procesos manuales y errores recurrentes.</p><h3>Comparativa real</h3><p>Analizamos control de caja, automatizacion, integraciones, soporte y costo total de operacion.</p><h3>Recomendacion</h3><p>Centralizar ventas, clientes y facturacion en una plataforma integrada mejora control y evita cuellos de botella financieros.</p>",
  },
  {
    id: 3,
    title: "5 errores costosos en gestion de inventario y como evitarlos",
    category: "Tips y Consejos",
    date: "10 Ene 2024",
    readTime: "6 min",
    views: "6.0K",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1600",
    author: "Equipo Editorial",
    tags: ["inventario", "retail", "ecommerce"],
    content:
      "<h3>Errores frecuentes</h3><p>Stock sin visibilidad, reposicion tardia y compras sin criterio de demanda real.</p><h3>Como corregir</h3><p>Aplica alertas por rotacion, trazabilidad por lote y tableros diarios de movimiento.</p>",
  },
  {
    id: 4,
    title: "Por que un restaurante necesita un POS moderno para escalar operaciones",
    category: "Industria",
    date: "8 Ene 2024",
    readTime: "7 min",
    views: "4.2K",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1600",
    author: "Equipo Editorial",
    tags: ["restaurantes", "pos", "delivery"],
    content:
      "<h3>Operacion integrada</h3><p>Un POS moderno conecta caja, cocina, delivery y reportes para tomar decisiones con datos reales.</p>",
  },
  {
    id: 5,
    title: "Seguridad web para empresas: controles minimos para operar sin riesgo",
    category: "Seguridad",
    date: "5 Ene 2024",
    readTime: "6 min",
    views: "6.3K",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1600",
    author: "Equipo Editorial",
    tags: ["ciberseguridad", "infraestructura", "compliance"],
    content:
      "<h3>Base de seguridad</h3><p>HTTPS estricto, backups verificables, control de accesos y monitoreo continuo son el minimo para operar.</p>",
  },
  {
    id: 6,
    title: "Plataforma SaaS o desarrollo a medida: decision tecnica para directores",
    category: "Estrategia",
    date: "2 Ene 2024",
    readTime: "9 min",
    views: "7.5K",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1600",
    author: "Equipo Editorial",
    tags: ["saas", "software a medida", "estrategia"],
    content:
      "<h3>Criterio de decision</h3><p>La mejor opcion depende de riesgo, velocidad de salida y retorno esperado para el negocio.</p>",
  },
  {
    id: 7,
    title: "Automatizacion de cobranza: como mejorar flujo de caja sin aumentar equipo",
    category: "Tips y Consejos",
    date: "1 Ene 2024",
    readTime: "6 min",
    views: "3.2K",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1600",
    author: "Equipo Editorial",
    tags: ["cobranza", "flujo de caja", "automatizacion"],
    content:
      "<h3>Impacto directo</h3><p>Automatizar recordatorios y estado de deuda reduce mora y libera tiempo del equipo administrativo.</p>",
  },
  {
    id: 8,
    title: "Ecommerce profesional: que necesita una tienda para vender de forma estable",
    category: "Industria",
    date: "28 Dic 2023",
    readTime: "7 min",
    views: "4.8K",
    image: "https://images.unsplash.com/photo-1556742049-02e45308b01e?auto=format&fit=crop&q=80&w=1600",
    author: "Equipo Editorial",
    tags: ["ecommerce", "operaciones", "conversion"],
    content:
      "<h3>Base operativa</h3><p>La venta online sostenible depende de integrar catalogo, inventario, despacho y soporte en una misma operacion.</p>",
  },
];

const stripMarkup = (content: string): string =>
  content
    .replace(/<[^>]+>/g, " ")
    .replace(/\[[^\]]*]\(([^)]+)\)/g, " ")
    .replace(/[^\S\r\n]+/g, " ")
    .trim();

const estimateReadTime = (content: string): string => {
  const plain = stripMarkup(content);
  const words = plain ? plain.split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.round(words / 190));
  return `${minutes} min`;
};

const formatPostDate = (iso?: string): string => {
  if (!iso) return "Reciente";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Reciente";
  return date
    .toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" })
    .replace(".", "");
};

const extractFirstImage = (content: string): string | null => {
  if (!content) return null;
  const htmlMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (htmlMatch?.[1]) return htmlMatch[1];
  const markdownMatch = content.match(/!\[[^\]]*]\((https?:\/\/[^)]+)\)/i);
  if (markdownMatch?.[1]) return markdownMatch[1];
  return null;
};

const resolveCategoryImage = (category?: string): string => {
  const normalized = (category || "").toLowerCase();
  if (normalized.includes("seguridad")) return BLOG_CATEGORY_IMAGE_FALLBACK.seguridad;
  if (normalized.includes("guia") || normalized.includes("factura")) return BLOG_CATEGORY_IMAGE_FALLBACK.facturas;
  if (normalized.includes("caso") || normalized.includes("reserva")) return BLOG_CATEGORY_IMAGE_FALLBACK.reservas;
  if (normalized.includes("industria")) return BLOG_CATEGORY_IMAGE_FALLBACK.industria;
  if (normalized.includes("estrategia")) return BLOG_CATEGORY_IMAGE_FALLBACK.estrategia;
  if (normalized.includes("ecommerce")) return BLOG_CATEGORY_IMAGE_FALLBACK.ecommerce;
  return BLOG_DEFAULT_IMAGE;
};

const parseTags = (raw?: string): string[] => {
  if (!raw) return [];
  const trimmed = raw.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map((item) => String(item).trim()).filter(Boolean);
    } catch {
      return [];
    }
  }
  return trimmed.split(",").map((item) => item.trim()).filter(Boolean);
};

const ensureHtmlContent = (content: string): string => {
  if (!content.trim()) return "<p>Este articulo aun no tiene detalle publicado.</p>";
  if (/<[a-z][\s\S]*>/i.test(content)) return content;

  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`)
    .join("");
};

const ensureRichHtmlContent = (
  content: string,
  title: string,
  category: string,
  author: string
): string => {
  const baseHtml = ensureHtmlContent(content);
  const plain = stripMarkup(baseHtml);
  if (plain.length >= 420) return baseHtml;

  const cleanTitle = (title || "este articulo").trim();
  const cleanCategory = (category || "General").trim();
  const cleanAuthor = (author || "Equipo Editorial").trim();
  const contextLine = plain || "Se desarrolla una guia practica para resolver necesidades reales de negocio.";

  const generatedHtml = `
<h3>Contexto estrategico</h3>
<p><strong>${cleanCategory}</strong> | ${cleanAuthor}</p>
<p>${contextLine}</p>
<h3>Puntos clave de implementacion</h3>
<ul>
  <li>Definir una meta operativa concreta para ${cleanTitle.toLowerCase()}.</li>
  <li>Priorizar acciones de alto impacto con baja complejidad inicial.</li>
  <li>Medir avance con indicadores semanales y ajustes iterativos.</li>
</ul>
<h3>Plan de accion sugerido</h3>
<p>Aplicar un enfoque por etapas: diagnostico, implementacion controlada y optimizacion continua para sostener resultados.</p>
`;
  return `${baseHtml}${generatedHtml}`;
};

const mapBackendBlogToDetail = (item: BackendBlogRecord): BlogDetailPost => {
  const resolvedImage = item.main_image_url || extractFirstImage(item.content || "") || resolveCategoryImage(item.category);
  const fallbackViews = `${(3 + ((item.id || 1) % 6) * 0.7).toFixed(1)}K`;
  const tagList = parseTags(item.tags);
  const author = (item.author || "Equipo Editorial").trim() || "Equipo Editorial";
  const category = item.category || "General";
  const richContent = ensureRichHtmlContent(item.content || "", item.title || "Articulo", category, author);

  return {
    id: item.id,
    title: item.title || "Articulo sin titulo",
    content: richContent,
    category,
    image: resolvedImage,
    date: formatPostDate(item.created_at),
    readTime: estimateReadTime(richContent),
    views: fallbackViews,
    author,
    tags: tagList,
  };
};

const getBlogPostById = async (id: number): Promise<BlogDetailPost | null> => {
  try {
    const response = await fetch(`${API_BASE}/api/blog/${id}`, { cache: "no-store" });
    if (response.ok) {
      const payload = (await response.json()) as BackendBlogRecord;
      return mapBackendBlogToDetail(payload);
    }
  } catch {
    // Fallback below.
  }

  const fallback = MOCK_DETAIL_POSTS.find((post) => post.id === id) || null;
  if (!fallback) return null;
  return {
    ...fallback,
    content: ensureRichHtmlContent(fallback.content || "", fallback.title, fallback.category, fallback.author),
  };
};

export const dynamic = "force-dynamic";

export default async function BlogPostDetailPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const postId = Number(resolvedParams?.id);
  if (!Number.isFinite(postId) || postId <= 0) notFound();

  const post = await getBlogPostById(postId);
  if (!post) notFound();

  const safeHtml = sanitizeHtmlContent(
    ensureRichHtmlContent(post.content, post.title, post.category, post.author)
  );

  return (
    <div className="blog-page-wrapper min-h-screen py-16 md:py-24 bg-slate-950">
      <div className="blog-container max-w-5xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-xl border border-amber-300/35 bg-slate-900/75 px-4 py-2 text-sm font-semibold text-amber-200 hover:text-amber-100 hover:border-amber-300/60 transition-colors mb-8"
        >
          <FaArrowLeft className="text-xs" /> Volver al blog
        </Link>

        <article className="article-card overflow-hidden rounded-[2rem] border border-white/10">
          <div className="relative h-[260px] md:h-[420px]">
            <Image src={post.image} alt={post.title} fill unoptimized className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
            <span className="blog-card-category absolute right-5 top-5 rounded-lg px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white">
              {post.category}
            </span>
          </div>

          <div className="px-6 py-8 md:px-10 md:py-10">
            <h1 className="blog-main-title text-3xl md:text-5xl font-black leading-tight mb-6">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
              <span className="inline-flex items-center gap-2 text-slate-300">
                <FaCalendarAlt className="text-blue-400" /> {post.date}
              </span>
              <span className="inline-flex items-center gap-2">
                <FaClock className="text-blue-400" /> {post.readTime}
              </span>
              <span className="inline-flex items-center gap-2">
                <FaFire className="text-orange-500" /> {post.views} vistas
              </span>
              <span className="inline-flex items-center gap-2">
                <FaUserCircle className="text-slate-300" /> {post.author}
              </span>
            </div>

            {post.tags.length > 0 ? (
              <div className="mb-8 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-200"
                  >
                    <FaTag className="text-[9px]" /> {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div
              className="blog-content-rich text-[1.02rem] leading-8 text-slate-200 space-y-6"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
          </div>
        </article>
      </div>
    </div>
  );
}
