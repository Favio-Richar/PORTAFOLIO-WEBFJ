"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { IconType } from "react-icons";
import {
  FaArrowRight,
  FaBullseye,
  FaCertificate,
  FaChartLine,
  FaCheck,
  FaClock,
  FaCode,
  FaDatabase,
  FaEnvelope,
  FaEye,
  FaFacebookF,
  FaGithub,
  FaGraduationCap,
  FaHandshake,
  FaInstagram,
  FaLaptopCode,
  FaLightbulb,
  FaLinkedin,
  FaLock,
  FaMobileAlt,
  FaPhone,
  FaProjectDiagram,
  FaRocket,
  FaShieldAlt,
  FaStar,
  FaTerminal,
  FaTwitter,
  FaUsers,
} from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";
import {
  SiAngular,
  SiAmazonwebservices,
  SiDocker,
  SiGraphql,
  SiKubernetes,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPython,
  SiReact,
  SiTensorflow,
  SiTypescript,
} from "react-icons/si";
import AboutReviewsSection from "@/components/reviews/AboutReviewsSection";
import CertModal from "@/app/sobre-mi/_CertModal";
import { defaultContact, type ContactData } from "@/lib/data/contact";
import "@/styles/about-elite.scss";

const EASE_ELITE: [number, number, number, number] = [0.25, 0.4, 0.25, 1];
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

type CertificationItem = {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description?: string;
  icon?: string;
  level?: string;
  color?: string;
  badge?: string;
  credentialUrl?: string;
};

type AboutStackEntry = {
  id?: number;
  name: string;
  icon_key?: string | null;
  color?: string | null;
  order_index?: number;
  active?: boolean;
};

type TeamMember = {
  id: number;
  name: string;
  role: string;
  description?: string;
  skills?: string;
  avatar_url?: string;
  icon?: string;
  gradient?: string;
  order: number;
  active: boolean;
  media_type: string;
};

type TerminalLogLine = {
  text?: string;
  tone?: string;
  tokens?: Array<{ text: string; tone: string }>;
  delay?: number;
};

const FALLBACK_CERTIFICATIONS: CertificationItem[] = [
  {
    id: "cert-ing-informatica",
    title: "Ingeniero Informatico",
    issuer: "Instituto Profesional",
    date: "2022",
    description: "Titulo profesional orientado a arquitectura de software, bases de datos y sistemas escalables.",
    icon: "FaUserGraduate",
    level: "Titulo Profesional",
    color: "gold",
    badge: "Grado Academico",
  },
  {
    id: "cert-aws",
    title: "AWS Certified Solutions Architect",
    issuer: "Amazon Web Services",
    date: "2023",
    icon: "FaCertificate",
    level: "Associate",
    color: "amber",
    badge: "Cloud",
  },
  {
    id: "cert-scrum",
    title: "Professional Scrum Master",
    issuer: "Scrum.org",
    date: "2022",
    icon: "FaChartLine",
    level: "PSM I",
    color: "blue",
    badge: "Agile",
  },
  {
    id: "cert-clean-code",
    title: "Clean Architecture in Practice",
    issuer: "Software Engineering Academy",
    date: "2024",
    icon: "FaLaptopCode",
    level: "Advanced",
    color: "emerald",
    badge: "Engineering",
  },
];

const FALLBACK_STACK: AboutStackEntry[] = [
  { name: "React", icon_key: "react", color: "#61DAFB", order_index: 0, active: true },
  { name: "Next.js", icon_key: "nextjs", color: "#F8FAFC", order_index: 1, active: true },
  { name: "Node.js", icon_key: "nodejs", color: "#339933", order_index: 2, active: true },
  { name: "Python", icon_key: "python", color: "#3776AB", order_index: 3, active: true },
  { name: "AWS", icon_key: "aws", color: "#FF9900", order_index: 4, active: true },
  { name: "Docker", icon_key: "docker", color: "#2496ED", order_index: 5, active: true },
  { name: "PostgreSQL", icon_key: "postgresql", color: "#4169E1", order_index: 6, active: true },
  { name: "MongoDB", icon_key: "mongodb", color: "#47A248", order_index: 7, active: true },
  { name: "GraphQL", icon_key: "graphql", color: "#E10098", order_index: 8, active: true },
  { name: "TypeScript", icon_key: "typescript", color: "#3178C6", order_index: 9, active: true },
  { name: "Kubernetes", icon_key: "kubernetes", color: "#326CE5", order_index: 10, active: true },
  { name: "TensorFlow", icon_key: "tensorflow", color: "#FF6F00", order_index: 11, active: true },
];

const normalizeStackKey = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const STACK_ICON_META: Record<string, { icon: IconType; color: string; slug?: string }> = {
  react: { icon: SiReact, color: "#61DAFB" },
  nextjs: { icon: SiNextdotjs, color: "#F8FAFC", slug: "nextdotjs" },
  nodejs: { icon: SiNodedotjs, color: "#339933", slug: "nodedotjs" },
  python: { icon: SiPython, color: "#3776AB" },
  aws: { icon: SiAmazonwebservices, color: "#FF9900", slug: "amazonwebservices" },
  docker: { icon: SiDocker, color: "#2496ED" },
  postgresql: { icon: SiPostgresql, color: "#4169E1" },
  mongodb: { icon: SiMongodb, color: "#47A248" },
  graphql: { icon: SiGraphql, color: "#E10098" },
  typescript: { icon: SiTypescript, color: "#3178C6" },
  kubernetes: { icon: SiKubernetes, color: "#326CE5" },
  tensorflow: { icon: SiTensorflow, color: "#FF6F00" },
  angular: { icon: SiAngular, color: "#DD0031" },
};

const CERT_ICON_META: Record<string, IconType> = {
  facertificate: FaCertificate,
  facode: FaCode,
  fadatabase: FaDatabase,
  fashieldalt: FaShieldAlt,
  faprojectdiagram: FaCode,
  fachartline: FaChartLine,
  farocket: FaRocket,
  fausergraduate: FaGraduationCap,
  fagraduationcap: FaGraduationCap,
  falaptopcode: FaLaptopCode,
};

const CERT_ACCENT_META: Record<string, string> = {
  amber: "#fbbf24",
  gold: "#fbbf24",
  yellow: "#facc15",
  orange: "#fb923c",
  blue: "#38bdf8",
  cyan: "#22d3ee",
  emerald: "#34d399",
  green: "#4ade80",
  rose: "#fb7185",
  red: "#f87171",
  indigo: "#818cf8",
  violet: "#a78bfa",
  purple: "#c084fc",
  gray: "#94a3b8",
  slate: "#94a3b8",
};

const normalizeCertKey = (value?: string): string => (value || "").toLowerCase().replace(/[^a-z0-9#-]/g, "");

const isProfessionalDegreeCard = (cert: CertificationItem): boolean => {
  const fingerprint = `${cert.title} ${cert.level || ""} ${cert.badge || ""} ${cert.issuer}`
    .toLowerCase()
    .trim();
  return fingerprint.includes("ingenier") || fingerprint.includes("titulo profesional") || fingerprint.includes("grado academico");
};

const resolveCertificationIcon = (cert: CertificationItem): IconType => {
  const key = normalizeCertKey(cert.icon);
  const badgeKey = normalizeCertKey(cert.badge);
  const levelKey = normalizeCertKey(cert.level);
  const titleKey = normalizeCertKey(cert.title);

  if (isProfessionalDegreeCard(cert) || badgeKey.includes("ingenieriainformatica")) return FaGraduationCap;
  if (titleKey.includes("movil") || titleKey.includes("mobile") || titleKey.includes("app")) return FaMobileAlt;
  if (badgeKey.includes("frontend")) return FaLaptopCode;
  if (badgeKey.includes("backend") || badgeKey.includes("arquitectura")) return FaCode;
  if (badgeKey.includes("cloud")) return SiAmazonwebservices;
  if (badgeKey.includes("devops")) return SiDocker;
  if (badgeKey.includes("data") || badgeKey.includes("ia")) return FaDatabase;
  if (badgeKey.includes("ciberseguridad")) return FaShieldAlt;
  if (levelKey.includes("certificacion") || badgeKey.includes("certificacion")) return FaCertificate;

  return CERT_ICON_META[key] || FaCertificate;
};

const resolveCertificationAccent = (cert: CertificationItem): string => {
  const normalizedColor = normalizeCertKey(cert.color);
  const badgeKey = normalizeCertKey(cert.badge);
  const titleKey = normalizeCertKey(cert.title);

  if (normalizedColor.startsWith("#")) return normalizedColor;
  if (normalizedColor && CERT_ACCENT_META[normalizedColor]) return CERT_ACCENT_META[normalizedColor];
  if (badgeKey.includes("frontend")) return "#61DAFB";
  if (badgeKey.includes("backend")) return "#60a5fa";
  if (badgeKey.includes("arquitectura")) return "#f59e0b";
  if (badgeKey.includes("cloud")) return "#f59e0b";
  if (badgeKey.includes("devops")) return "#22d3ee";
  if (badgeKey.includes("data") || badgeKey.includes("ia")) return "#34d399";
  if (badgeKey.includes("ciberseguridad")) return "#818cf8";
  if (titleKey.includes("movil") || titleKey.includes("mobile") || titleKey.includes("app")) return "#38bdf8";
  if (isProfessionalDegreeCard(cert)) return "#fbbf24";
  return "#38bdf8";
};

const resolveCanonicalStackKey = (value: string): string => {
  const rawKey = normalizeStackKey(value);
  if (!rawKey) return "";

  const key = rawKey.replace(/(v)?\d+$/, "") || rawKey;

  const exactAliases: Record<string, string> = {
    next: "nextjs",
    node: "nodejs",
    postgres: "postgresql",
    postgre: "postgresql",
    ts: "typescript",
    k8s: "kubernetes",
    tf: "tensorflow",
    angula: "angular",
  };

  if (exactAliases[key]) return exactAliases[key];
  if (STACK_ICON_META[key]) return key;

  const tokenAliases: Array<[string, string]> = [
    ["angular", "angular"],
    ["angula", "angular"],
    ["react", "react"],
    ["next", "nextjs"],
    ["node", "nodejs"],
    ["python", "python"],
    ["amazonwebservices", "aws"],
    ["aws", "aws"],
    ["docker", "docker"],
    ["postgres", "postgresql"],
    ["mongo", "mongodb"],
    ["graphql", "graphql"],
    ["typescript", "typescript"],
    ["kubernetes", "kubernetes"],
    ["tensor", "tensorflow"],
  ];

  for (const [token, target] of tokenAliases) {
    if (key.includes(token)) return target;
  }

  return key;
};

const resolveSimpleIconSlug = (canonicalKey: string): string => {
  if (!canonicalKey) return "";
  return STACK_ICON_META[canonicalKey]?.slug || canonicalKey;
};

const StackTechIcon = ({
  name,
  iconKey,
  color,
}: {
  name: string;
  iconKey?: string | null;
  color?: string | null;
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const canonicalKey = resolveCanonicalStackKey(iconKey || name);
  const knownMeta = STACK_ICON_META[canonicalKey];
  const iconColor = knownMeta?.color || color || "#94A3B8";

  if (knownMeta) {
    const KnownIcon = knownMeta.icon;
    return (
      <KnownIcon
        className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
        style={{ color: iconColor }}
      />
    );
  }

  const slug = resolveSimpleIconSlug(canonicalKey);
  if (slug && !imageFailed) {
    const src = `https://cdn.simpleicons.org/${slug}/${iconColor.replace("#", "")}`;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`${name} icon`}
        className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
        loading="lazy"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <FaCode
      className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
      style={{ color: iconColor }}
    />
  );
};

const TERMINAL_SCRIPT_SCENES: TerminalLogLine[][] = [
  [
    {
      tokens: [
        { text: "$ ", tone: "text-slate-500" },
        { text: "npm", tone: "text-sky-300" },
        { text: " run ", tone: "text-slate-200" },
        { text: "preflight", tone: "text-violet-300" },
        { text: " -- --env=production", tone: "text-amber-300" },
      ],
      delay: 900,
    },
    {
      tokens: [
        { text: "[14:20:01] ", tone: "text-cyan-400" },
        { text: "init workspace", tone: "text-slate-200" },
        { text: " ... ", tone: "text-slate-500" },
        { text: "ok", tone: "text-emerald-400" },
      ],
      delay: 620,
    },
    {
      tokens: [
        { text: "[14:20:02] ", tone: "text-cyan-400" },
        { text: "architecture.validator", tone: "text-sky-300" },
        { text: " ... ", tone: "text-slate-500" },
        { text: "ok", tone: "text-emerald-400" },
      ],
      delay: 620,
    },
    {
      tokens: [
        { text: "[14:20:03] ", tone: "text-cyan-400" },
        { text: "auth.policy", tone: "text-violet-300" },
        { text: " + ", tone: "text-slate-400" },
        { text: "roles.matrix", tone: "text-violet-300" },
        { text: " ... ", tone: "text-slate-500" },
        { text: "ok", tone: "text-emerald-400" },
      ],
      delay: 620,
    },
    {
      tokens: [
        { text: "[14:20:04] ", tone: "text-cyan-400" },
        { text: "schema.diff", tone: "text-sky-300" },
        { text: " --safe-mode", tone: "text-amber-300" },
        { text: " ... ", tone: "text-slate-500" },
        { text: "clean", tone: "text-lime-300" },
      ],
      delay: 620,
    },
    {
      tokens: [
        { text: "[14:20:05] ", tone: "text-cyan-400" },
        { text: "tests:", tone: "text-slate-200" },
        { text: "198", tone: "text-orange-300" },
        { text: " passed", tone: "text-emerald-400" },
        { text: " | coverage:", tone: "text-slate-200" },
        { text: "94%", tone: "text-orange-300" },
      ],
      delay: 750,
    },
    {
      tokens: [
        { text: "OK ", tone: "text-emerald-400" },
        { text: "release candidate generated", tone: "text-fuchsia-300" },
        { text: ": ", tone: "text-slate-300" },
        { text: "rc-2026.02.20", tone: "text-amber-200" },
      ],
      delay: 850,
    },
    {
      tokens: [
        { text: "const ", tone: "text-violet-300" },
        { text: "calidad", tone: "text-sky-300" },
        { text: " = new ", tone: "text-slate-200" },
        { text: "Estandar", tone: "text-yellow-200" },
        { text: "(", tone: "text-slate-300" },
        { text: "'sostenible'", tone: "text-orange-300" },
        { text: ");", tone: "text-slate-300" },
      ],
      delay: 980,
    },
  ],
  [
    {
      tokens: [
        { text: "$ ", tone: "text-slate-500" },
        { text: "./deploy.sh", tone: "text-sky-300" },
        { text: " --strategy=blue-green", tone: "text-amber-300" },
        { text: " --region=us-east-1", tone: "text-amber-300" },
      ],
      delay: 900,
    },
    {
      tokens: [
        { text: "[14:24:11] ", tone: "text-cyan-400" },
        { text: "build artifacts", tone: "text-slate-200" },
        { text: " ... ", tone: "text-slate-500" },
        { text: "done", tone: "text-emerald-400" },
      ],
      delay: 600,
    },
    {
      tokens: [
        { text: "[14:24:12] ", tone: "text-cyan-400" },
        { text: "provision infra", tone: "text-slate-200" },
        { text: " ... ", tone: "text-slate-500" },
        { text: "done", tone: "text-emerald-400" },
      ],
      delay: 600,
    },
    {
      tokens: [
        { text: "[14:24:13] ", tone: "text-cyan-400" },
        { text: "migrate db", tone: "text-slate-200" },
        { text: " (safe)", tone: "text-lime-300" },
        { text: " ... ", tone: "text-slate-500" },
        { text: "done", tone: "text-emerald-400" },
      ],
      delay: 600,
    },
    {
      tokens: [
        { text: "[14:24:14] ", tone: "text-cyan-400" },
        { text: "health-check ", tone: "text-slate-200" },
        { text: "/api", tone: "text-sky-300" },
        { text: ", ", tone: "text-slate-400" },
        { text: "/auth", tone: "text-sky-300" },
        { text: ", ", tone: "text-slate-400" },
        { text: "/metrics", tone: "text-sky-300" },
        { text: " ... ", tone: "text-slate-500" },
        { text: "pass", tone: "text-lime-300" },
      ],
      delay: 700,
    },
    {
      tokens: [
        { text: "[14:24:15] ", tone: "text-cyan-400" },
        { text: "traffic shift ", tone: "text-slate-200" },
        { text: "0%", tone: "text-orange-300" },
        { text: " -> ", tone: "text-slate-400" },
        { text: "25%", tone: "text-orange-300" },
        { text: " -> ", tone: "text-slate-400" },
        { text: "50%", tone: "text-orange-300" },
        { text: " -> ", tone: "text-slate-400" },
        { text: "100%", tone: "text-orange-300" },
      ],
      delay: 850,
    },
    {
      tokens: [
        { text: "OK ", tone: "text-emerald-400" },
        { text: "deployment completed", tone: "text-fuchsia-300" },
        { text: " with ", tone: "text-slate-300" },
        { text: "zero downtime", tone: "text-amber-200" },
      ],
      delay: 900,
    },
    {
      tokens: [
        { text: "kpi", tone: "text-sky-300" },
        { text: ".sync", tone: "text-yellow-200" },
        { text: "(", tone: "text-slate-300" },
        { text: "'acquisition'", tone: "text-orange-300" },
        { text: ",", tone: "text-slate-400" },
        { text: "'retention'", tone: "text-orange-300" },
        { text: ",", tone: "text-slate-400" },
        { text: "'ops'", tone: "text-orange-300" },
        { text: ") => ", tone: "text-slate-300" },
        { text: "stable", tone: "text-lime-300" },
      ],
      delay: 980,
    },
  ],
];

const normalizeSocialUrl = (value: string): string => {
  const normalized = value.trim();
  if (!normalized) return "";
  if (/^https?:\/\//i.test(normalized)) return normalized;
  return `https://${normalized.replace(/^@/, "")}`;
};

const normalizeCredentialUrl = (value: string): string => {
  const normalized = value.trim();
  if (!normalized) return "";
  if (/^https?:\/\//i.test(normalized)) return normalized;
  if (normalized.startsWith("//")) return `https:${normalized}`;
  if (normalized.startsWith("/")) return `${BACKEND_URL}${normalized}`;
  return `https://${normalized}`;
};

const normalizeContactData = (raw: Record<string, unknown>): ContactData => ({
  email: typeof raw.email === "string" && raw.email.trim() ? raw.email.trim() : defaultContact.email,
  phone: typeof raw.phone === "string" && raw.phone.trim() ? raw.phone.trim() : defaultContact.phone,
  whatsapp: typeof raw.whatsapp === "string" && raw.whatsapp.trim() ? raw.whatsapp.trim() : defaultContact.whatsapp,
  linkedin: typeof raw.linkedin === "string" ? raw.linkedin.trim() : defaultContact.linkedin,
  github: typeof raw.github === "string" ? raw.github.trim() : defaultContact.github,
  facebook: typeof raw.facebook === "string" ? raw.facebook.trim() : defaultContact.facebook,
  instagram: typeof raw.instagram === "string" ? raw.instagram.trim() : defaultContact.instagram,
  twitter: typeof raw.twitter === "string" ? raw.twitter.trim() : defaultContact.twitter,
  tiktok: typeof raw.tiktok === "string" ? raw.tiktok.trim() : defaultContact.tiktok,
  location: typeof raw.location === "string" && raw.location.trim() ? raw.location.trim() : defaultContact.location,
  lat: typeof raw.lat === "number" ? raw.lat : defaultContact.lat,
  lng: typeof raw.lng === "number" ? raw.lng : defaultContact.lng,
  hero_image: typeof raw.hero_image === "string" ? raw.hero_image.trim() : defaultContact.hero_image,
  hero_video: typeof raw.hero_video === "string" ? raw.hero_video.trim() : defaultContact.hero_video,
});

const RevealText = ({
  children,
  delay = 0,
  className = "",
}: {
  children: string;
  delay?: number;
  className?: string;
}) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: EASE_ELITE }}
      className={className}
    >
      {children}
    </motion.span>
  );
};

const Card3D = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX((y - centerY) / 20);
    setRotateY((centerX - x) / 20);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: "transform 0.1s ease-out",
      }}
      whileHover={{ scale: 1.02 }}
    >
      {children}
    </motion.div>
  );
};

const AnimatedCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const duration = 2000;
          const increment = target / (duration / 16);

          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, hasAnimated]);

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold gradient-text">
      {count}
      {suffix}
    </div>
  );
};

const VideoBackground = () => {
  return (
    <div className="absolute inset-0 bg-[#040404]">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-92"
        style={{
          backgroundImage: "url('/img/about-hero-candidate-1.jpg')",
          filter: "saturate(0.98) contrast(1.03) brightness(0.82)",
          transform: "scale(1.03)",
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,7,7,0.14)_0%,rgba(0,0,0,0.38)_100%)]" />
    </div>
  );
};

export default function SobreNosotrosPage() {
  const [viewingCert, setViewingCert] = useState<string | null>(null);
  const [certifications, setCertifications] = useState<CertificationItem[]>(FALLBACK_CERTIFICATIONS);
  const [aboutStack, setAboutStack] = useState<AboutStackEntry[]>(FALLBACK_STACK);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [contactData, setContactData] = useState<ContactData>(defaultContact);
  const [showMissionDetail, setShowMissionDetail] = useState(false);
  const [showVisionDetail, setShowVisionDetail] = useState(false);
  const [terminalSceneIdx, setTerminalSceneIdx] = useState(0);
  const [terminalVisibleLines, setTerminalVisibleLines] = useState<TerminalLogLine[]>([]);
  const terminalScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: number | null = null;
    const activeScene = TERMINAL_SCRIPT_SCENES[terminalSceneIdx] ?? [];

    const appendLine = (lineIndex: number) => {
      if (cancelled) return;

      if (lineIndex >= activeScene.length) {
        timer = window.setTimeout(() => {
          if (cancelled) return;
          setTerminalSceneIdx((prev) => (prev + 1) % TERMINAL_SCRIPT_SCENES.length);
        }, 1800);
        return;
      }

      const currentLine = activeScene[lineIndex];
      setTerminalVisibleLines((prev) => [...prev, currentLine]);
      timer = window.setTimeout(() => appendLine(lineIndex + 1), Math.max(currentLine.delay ?? 640, 320));
    };

    timer = window.setTimeout(() => {
      if (cancelled) return;
      setTerminalVisibleLines([]);
      appendLine(0);
    }, 380);

    return () => {
      cancelled = true;
      if (timer !== null) {
        window.clearTimeout(timer);
      }
    };
  }, [terminalSceneIdx]);

  useEffect(() => {
    const panel = terminalScrollRef.current;
    if (!panel) return;
    panel.scrollTo({ top: panel.scrollHeight, behavior: "smooth" });
  }, [terminalVisibleLines]);

  useEffect(() => {
    let isMounted = true;

    const loadCertifications = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/certifications`, { cache: "no-store" });
        if (!response.ok) return;

        const payload = (await response.json()) as Array<Record<string, unknown>>;
        if (!Array.isArray(payload) || payload.length === 0) return;

        const normalized = payload
          .map((item, index): CertificationItem | null => {
            const title = typeof item.title === "string" ? item.title.trim() : "";
            const issuer = typeof item.issuer === "string" ? item.issuer.trim() : "";
            const date = typeof item.date === "string" ? item.date.trim() : "";

            if (!title || !issuer || !date) return null;

            const credentialSnake = typeof item.credential_url === "string" ? item.credential_url : "";
            const credentialCamel = typeof item.credentialUrl === "string" ? item.credentialUrl : "";
            const credentialRaw = (credentialSnake || credentialCamel).trim();
            const credentialUrl = credentialRaw ? normalizeCredentialUrl(credentialRaw) : "";

            return {
              id: String(item.id ?? `cert-${index}`),
              title,
              issuer,
              date,
              description: typeof item.description === "string" ? item.description : undefined,
              icon: typeof item.icon === "string" ? item.icon : undefined,
              level: typeof item.level === "string" ? item.level : undefined,
              color: typeof item.color === "string" ? item.color : undefined,
              badge: typeof item.badge === "string" ? item.badge : undefined,
              credentialUrl: credentialUrl || undefined,
            };
          })
          .filter((cert): cert is CertificationItem => cert !== null);

        if (isMounted && normalized.length > 0) {
          setCertifications(normalized);
        }
      } catch {
        // Keep fallback certifications if backend is unavailable.
      }
    };

    loadCertifications();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadContactData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/contact`, { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as Record<string, unknown>;
        if (!isMounted || typeof payload !== "object" || payload === null) return;
        setContactData(normalizeContactData(payload));
      } catch {
        // Keep default contact data if backend is unavailable.
      }
    };

    loadContactData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadAboutStack = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/about-stack`, { cache: "no-store" });
        if (!response.ok) return;

        const payload = (await response.json()) as Array<Record<string, unknown>>;
        if (!Array.isArray(payload) || payload.length === 0) return;

        const normalized = payload
          .map((item): AboutStackEntry | null => {
            const name = typeof item.name === "string" ? item.name.trim() : "";
            if (!name) return null;

            return {
              id: typeof item.id === "number" ? item.id : undefined,
              name,
              icon_key: typeof item.icon_key === "string" ? item.icon_key.trim() : null,
              color: typeof item.color === "string" ? item.color.trim() : null,
              order_index: typeof item.order_index === "number" ? item.order_index : 0,
              active: typeof item.active === "boolean" ? item.active : true,
            };
          })
          .filter((entry): entry is AboutStackEntry => entry !== null)
          .filter((entry) => entry.active !== false)
          .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

        if (isMounted && normalized.length > 0) {
          setAboutStack(normalized);
        }
      } catch {
        // Keep fallback stack if backend is unavailable.
      }
    };

    loadAboutStack();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadTeam = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/team/`, { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as TeamMember[];
        if (isMounted && Array.isArray(payload)) {
          setTeamMembers(payload);
        }
      } catch (err) {
        console.error("Error loading team:", err);
      }
    };
    loadTeam();
    return () => { isMounted = false; };
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.8, ease: EASE_ELITE },
  };

  const businessMetrics = [
    {
      value: 10,
      suffix: "+",
      label: "anios construyendo productos digitales",
      detail: "Experiencia continua desde 2016",
    },
    {
      value: 180,
      suffix: "+",
      label: "proyectos lanzados",
      detail: "Web, software interno e integraciones",
    },
    {
      value: 96,
      suffix: "%",
      label: "clientes que repiten",
      detail: "Relacion a largo plazo y mejora continua",
    },
    {
      value: 14,
      suffix: "",
      label: "sectores atendidos",
      detail: "Retail, salud, logistica, educacion, fintech y mas",
    },
  ];

  const companyOverview = [
    {
      icon: FaUsers,
      title: "Quienes somos",
      color: "from-amber-300 to-yellow-500",
      description:
        "Somos un equipo de ingenieria y producto enfocado en construir software estable, escalable y alineado al negocio.",
      points: ["Equipo senior multidisciplinario", "Liderazgo tecnico cercano", "Cultura de calidad continua"],
    },
    {
      icon: FaProjectDiagram,
      title: "Que hacemos",
      color: "from-yellow-500 to-orange-500",
      description:
        "Disenamos y desarrollamos plataformas web, automatizaciones e integraciones que resuelven cuellos de botella operativos.",
      points: ["Aplicaciones web y paneles internos", "Automatizacion de procesos criticos", "Integracion con APIs y sistemas legacy"],
    },
    {
      icon: FaHandshake,
      title: "A quienes ayudamos",
      color: "from-orange-500 to-amber-500",
      description:
        "Trabajamos con empresas que ya venden, pero necesitan ordenar su operacion y crecer sin perder control ni visibilidad.",
      points: ["PYMEs en crecimiento", "Equipos con alta carga manual", "Negocios que requieren trazabilidad"],
    },
  ];

  const milestones = [
    {
      year: "2016",
      title: "Inicio de la firma",
      icon: FaRocket,
      description: "Nacimos como estudio tecnico para resolver plataformas internas y automatizacion para pymes.",
      impact: "12 proyectos en el primer anio",
    },
    {
      year: "2019",
      title: "Escala regional",
      icon: FaChartLine,
      description: "Ampliamos alcance a varios paises y consolidamos practicas de arquitectura modular.",
      impact: "Mas de 70 implementaciones activas",
    },
    {
      year: "2022",
      title: "Estandares enterprise",
      icon: FaLock,
      description: "Incorporamos seguridad por diseno, observabilidad y procesos de entrega continua.",
      impact: "Reduccion de incidentes criticos en produccion",
    },
    {
      year: "Hoy",
      title: "Partner de evolucion digital",
      icon: FaStar,
      description: "Acompanamos a empresas que requieren software serio para crecer con control y datos confiables.",
      impact: "Clientes con resultados medibles en 90 dias",
    },
  ];

  const valuePillars = [
    {
      icon: FaShieldAlt,
      title: "Transparencia operativa",
      description: "Planificacion visible, avances trazables y comunicacion sin ruido.",
      iconColor: "#22c55e",
      iconBg: "rgba(34, 197, 94, 0.16)",
      iconBorder: "rgba(34, 197, 94, 0.35)",
    },
    {
      icon: FaClock,
      title: "Compromiso de entrega",
      description: "Priorizamos impacto real y cumplimiento de objetivos acordados.",
      iconColor: "#38bdf8",
      iconBg: "rgba(56, 189, 248, 0.16)",
      iconBorder: "rgba(56, 189, 248, 0.35)",
    },
    {
      icon: FaLightbulb,
      title: "Mejora continua",
      description: "Medimos, iteramos y optimizamos para sostener crecimiento.",
      iconColor: "#facc15",
      iconBg: "rgba(250, 204, 21, 0.16)",
      iconBorder: "rgba(250, 204, 21, 0.35)",
    },
  ];

  const differentiators = [
    {
      icon: FaCode,
      title: "Arquitectura clara",
      description: "Codigo mantenible con estructura orientada a evolucion.",
      proof: "Documentacion tecnica y convenciones desde el inicio",
    },
    {
      icon: FaLock,
      title: "Seguridad por diseno",
      description: "Buenas practicas de autenticacion, permisos y proteccion de datos.",
      proof: "Revisiones de seguridad en cada etapa relevante",
    },
    {
      icon: FaChartLine,
      title: "Decisiones con datos",
      description: "Definimos KPIs tecnicos y de negocio desde discovery.",
      proof: "Dashboards de seguimiento para priorizar con evidencia",
    },
    {
      icon: FaHandshake,
      title: "Trabajo colaborativo",
      description: "Nos integramos con tu equipo y evitamos dependencia ciega.",
      proof: "Transferencia de conocimiento y handoff ordenado",
    },
    {
      icon: FaBullseye,
      title: "Foco en resultado",
      description: "No construimos por moda, construimos por impacto.",
      proof: "Cada modulo responde a un objetivo operativo concreto",
    },
    {
      icon: FaCheck,
      title: "Calidad verificable",
      description: "Testing funcional y validacion de escenarios clave.",
      proof: "Checklist de release y monitoreo post lanzamiento",
    },
  ];

  const impactCases = [
    {
      sector: "Logistica",
      challenge: "Operacion de despacho manual con demoras y errores de coordinacion.",
      solution: "Plataforma central para ordenes, rutas y estado en tiempo real.",
      result: "42% menos tiempo operativo y 31% menos incidencias internas en 4 meses.",
    },
    {
      sector: "Retail",
      challenge: "Catalogo y ventas en multiples canales sin sincronizacion confiable.",
      solution: "Integracion entre ecommerce, ERP y reportes comerciales automatizados.",
      result: "Inventario sincronizado y 27% de mejora en conversion online.",
    },
    {
      sector: "Servicios profesionales",
      challenge: "Procesos de atencion dispersos y baja trazabilidad comercial.",
      solution: "CRM operacional con automatizaciones de seguimiento y tableros de gestion.",
      result: "Respuesta comercial mas rapida y pipeline ordenado para crecimiento sostenido.",
    },
  ];

  const stackForRender = aboutStack.filter((item) => item.active !== false);

  const emailText = contactData.email || defaultContact.email;
  const phoneText = contactData.phone || defaultContact.phone;
  const socialLinks = [
    { icon: FaLinkedin, url: normalizeSocialUrl(contactData.linkedin), color: "#0A66C2" },
    { icon: FaGithub, url: normalizeSocialUrl(contactData.github), color: "#E5E7EB" },
    { icon: FaFacebookF, url: normalizeSocialUrl(contactData.facebook), color: "#1877F2" },
    { icon: FaInstagram, url: normalizeSocialUrl(contactData.instagram), color: "#E4405F" },
    { icon: FaTwitter, url: normalizeSocialUrl(contactData.twitter), color: "#1D9BF0" },
    { icon: FaTiktok, url: normalizeSocialUrl(contactData.tiktok), color: "#FF0050" },
    { icon: FaEnvelope, url: `mailto:${emailText}`, color: "#EA4335" },
  ].filter((item, index, source) => {
    if (!item.url) return false;
    return source.findIndex((entry) => entry.url === item.url) === index;
  });
  const activeTerminalScene = TERMINAL_SCRIPT_SCENES[terminalSceneIdx] ?? [];
  const terminalSceneDone = terminalVisibleLines.length >= activeTerminalScene.length;

  return (
    <div className="about-elite-container w-full overflow-hidden bg-zinc-950">
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <VideoBackground />

        <div className="relative z-20 max-w-6xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: EASE_ELITE }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-300/10 border border-amber-300/25 text-amber-100 text-sm font-medium backdrop-blur-md mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Sobre mi
          </motion.span>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-[0.95] tracking-tight">
            <RevealText delay={0.2}>Tecnologia con</RevealText>
            <br />
            <RevealText delay={0.4} className="gradient-text">
              criterio y resultado
            </RevealText>
          </h1>

          <motion.p
            className="text-lg md:text-2xl text-slate-300 max-w-4xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            Soy ingeniero de software y acompano a equipos que necesitan tecnologia estable para ordenar su operacion,
            mejorar decisiones y crecer con control.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <Link
              href="#historia"
              className="group relative px-8 py-4 bg-gradient-to-r from-amber-200 via-yellow-300 to-orange-300 text-zinc-950 font-bold rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_35px_rgba(245,158,11,0.35)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Conocer nuestra historia <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              href="#testimonios"
              className="px-8 py-4 border border-amber-300/30 text-amber-100 font-semibold rounded-full hover:bg-amber-400/10 hover:border-amber-200/50 transition-all backdrop-blur-sm"
            >
              Ver testimonios
            </Link>
          </motion.div>

          <motion.div
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            {businessMetrics.map((metric, i) => (
              <div key={i} className="hero-metric-chip premium-card text-center">
                <AnimatedCounter target={metric.value} suffix={metric.suffix} />
                <p className="text-slate-400 text-sm mt-2">{metric.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="identidad" className="about-section-identity py-28 px-4 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <motion.span className="text-amber-300 font-semibold text-sm tracking-widest uppercase mb-4 block" {...fadeInUp}>
              Identidad
            </motion.span>
            <motion.h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-6" {...fadeInUp}>
              Quienes somos, que hacemos y para quien
            </motion.h2>
            <motion.p className="text-slate-400 max-w-3xl mx-auto text-lg" {...fadeInUp}>
              Esta es la base de nuestra empresa: claridad estrategica, ejecucion tecnica y enfoque en impacto operativo.
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-3 gap-7">
            {companyOverview.map((item, i) => (
              <motion.article
                key={item.title}
                className="premium-card identity-card relative p-8 rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-md overflow-hidden"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.7 }}
              >
                <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl bg-gradient-to-br ${item.color} opacity-15`} />
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-xl`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-slate-300 leading-relaxed mb-6">{item.description}</p>
                <div className="space-y-3">
                  {item.points.map((point) => (
                    <div key={point} className="flex items-start gap-3 text-slate-300">
                      <FaCheck className="w-4 h-4 text-amber-300 mt-1 flex-shrink-0" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="historia" className="about-section-history py-32 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <motion.span className="text-amber-300 font-semibold text-sm tracking-widest uppercase mb-4 block" {...fadeInUp}>
              Historia y evolucion
            </motion.span>
            <motion.h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-8" {...fadeInUp}>
              Construimos sobre evidencia, no sobre promesas vacias
            </motion.h2>

            <div className="space-y-6">
              {milestones.map((step, i) => (
                <motion.div
                  key={step.year}
                  className="premium-card timeline-card relative rounded-2xl border border-white/10 bg-slate-900/35 p-6 md:p-7 overflow-hidden"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                >
                  <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-amber-400/10 blur-2xl" />
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <span className="px-3 py-1 rounded-full text-xs uppercase tracking-[0.2em] border border-amber-300/35 text-amber-200">
                      {step.year}
                    </span>
                    <div className="w-10 h-10 rounded-lg bg-amber-400/15 border border-amber-300/35 flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-amber-200" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                  </div>
                  <p className="text-slate-300 leading-relaxed mb-3">{step.description}</p>
                  <p className="text-sm text-amber-200 font-medium">{step.impact}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-4">
              <motion.h3 className="font-display text-3xl text-white mb-4" {...fadeInUp}>
                Indicadores de trayectoria
              </motion.h3>
              {businessMetrics.map((metric, i) => (
                <motion.div
                  key={metric.label}
                  className="premium-card metric-panel p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/65 to-slate-800/20"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                >
                  <AnimatedCounter target={metric.value} suffix={metric.suffix} />
                  <p className="text-white font-medium mt-2">{metric.label}</p>
                  <p className="text-slate-400 text-sm mt-1">{metric.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="about-section-prop py-32 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeInUp}>
            <span className="text-amber-300 font-semibold text-sm tracking-widest uppercase mb-4 block">Nuestra esencia</span>
            <h2 className="font-display text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
              Ingenieria de <span className="gradient-text">alto estandar</span>
            </h2>

            <div className="space-y-6 text-lg text-slate-300 leading-relaxed">
              <p>
                No buscamos ser una agencia mas. Somos una empresa de tecnologia que prioriza estructura, calidad y
                continuidad para que cada solucion siga funcionando cuando el negocio crece.
              </p>
              <p>
                Nuestro objetivo no es solo lanzar rapido: es que el software mantenga estabilidad, sea facil de
                evolucionar y genere resultados medibles en la operacion diaria.
              </p>
            </div>

            <div className="mt-10 grid sm:grid-cols-2 gap-4">
              {[
                "Arquitectura modular y escalable",
                "Estandares de seguridad aplicados",
                "Visibilidad de costos y rendimiento",
                "Documentacion para evolucion a largo plazo",
              ].map((item) => (
                <div key={item} className="premium-chip flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-slate-900/45">
                  <FaCheck className="w-4 h-4 text-amber-300 flex-shrink-0" />
                  <span className="text-slate-200 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="relative">
            <motion.div
              className="premium-card terminal-script-card relative z-10 bg-slate-800/45 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
              initial={{ opacity: 0, scale: 0.94, rotateY: 10 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
            >
              <div className="terminal-script-window bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl">
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/80 border-b border-white/5">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <span className="ml-4 text-slate-500 text-xs font-mono">ops@techcompany:~</span>
                  <span
                    className={`terminal-live-pill ml-auto text-[10px] font-semibold uppercase ${terminalSceneDone ? "text-amber-300" : "text-emerald-300"
                      }`}
                  >
                    {terminalSceneDone ? "rotando" : "en vivo"}
                  </span>
                </div>
                <div ref={terminalScrollRef} className="terminal-script-content p-6 font-mono text-sm leading-relaxed">
                  <div className="terminal-script-stream space-y-2">
                    {terminalVisibleLines.map((line, idx) => (
                      <motion.div
                        key={`terminal-line-${terminalSceneIdx}-${idx}`}
                        className="terminal-log-line"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.26, ease: EASE_ELITE }}
                      >
                        {line.tokens && line.tokens.length > 0 ? (
                          line.tokens.map((token, tokenIdx) => (
                            <span key={`token-${terminalSceneIdx}-${idx}-${tokenIdx}`} className={token.tone}>
                              {token.text}
                            </span>
                          ))
                        ) : (
                          <span className={line.tone ?? "text-slate-300"}>{line.text}</span>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <div className="terminal-cursor-line text-slate-500 mt-5">
                    {terminalSceneDone ? "$ esperando siguiente despliegue..." : "$ ejecutando pipeline --live"}
                    <span className="terminal-caret" />
                  </div>
                </div>
              </div>

              <motion.div
                className="absolute -top-5 -right-5 bg-gradient-to-br from-amber-500 to-orange-500 p-4 rounded-2xl shadow-xl"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <FaTerminal className="w-7 h-7 text-white" />
              </motion.div>

              <motion.div
                className="absolute bottom-4 left-4 bg-slate-900 p-4 rounded-2xl border border-white/10 shadow-xl"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.4 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-white text-sm font-semibold">Estandar activo</span>
                </div>
              </motion.div>
            </motion.div>

            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-3xl blur-3xl -z-10" />
          </div>
        </div>
      </section>

      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.span className="text-amber-300 font-semibold text-sm tracking-widest uppercase mb-4 block" {...fadeInUp}>
              Proposito
            </motion.span>
            <motion.h2 className="font-display text-5xl md:text-6xl font-bold text-white mb-6" {...fadeInUp}>
              Mision, vision y principios
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <Card3D className="mission-card premium-card group relative p-10 rounded-3xl bg-slate-800/30 border border-white/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <AnimatePresence mode="wait">
                {!showMissionDetail ? (
                  <motion.div
                    key="mission-summary"
                    className="relative z-10 h-full flex flex-col"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center mb-8 shadow-lg shadow-rose-500/25">
                      <FaBullseye className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="font-display text-3xl font-bold text-white mb-6">Nuestra mision</h3>
                    <p className="text-slate-300 text-lg leading-relaxed mb-6">
                      Ayudar a empresas a operar mejor mediante software robusto, claro y alineado con objetivos de negocio
                      reales.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowMissionDetail(true)}
                      className="mt-auto inline-flex items-center gap-2 text-amber-300 font-semibold hover:text-amber-200 transition-colors"
                    >
                      Enfoque de largo plazo <FaArrowRight />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="mission-detail"
                    className="relative z-10 h-full flex flex-col"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center mb-8 shadow-lg shadow-rose-500/25">
                      <FaBullseye className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="font-display text-3xl font-bold text-white mb-4">Enfoque de largo plazo</h3>
                    <p className="text-slate-300 text-base leading-relaxed mb-5">
                      Planificamos tecnologia para que siga funcionando y creciendo en el tiempo, no solo para una entrega rapida.
                    </p>
                    <div className="space-y-3 text-sm text-slate-200 mb-6">
                      <p className="flex items-start gap-2"><FaCheck className="text-emerald-300 mt-1 shrink-0" /> Arquitectura modular y escalable.</p>
                      <p className="flex items-start gap-2"><FaCheck className="text-emerald-300 mt-1 shrink-0" /> Seguridad y mantenibilidad desde el inicio.</p>
                      <p className="flex items-start gap-2"><FaCheck className="text-emerald-300 mt-1 shrink-0" /> Documentacion para continuidad operativa.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowMissionDetail(false)}
                      className="mt-auto inline-flex items-center gap-2 text-amber-300 font-semibold hover:text-amber-200 transition-colors"
                    >
                      Volver a mision <FaArrowRight />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card3D>

            <Card3D className="mission-card mission-card--accent premium-card group relative p-10 rounded-3xl bg-slate-800/30 border border-white/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <AnimatePresence mode="wait">
                {!showVisionDetail ? (
                  <motion.div
                    key="vision-summary"
                    className="relative z-10 h-full flex flex-col"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mb-8 shadow-lg shadow-sky-500/25">
                      <FaEye className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="font-display text-3xl font-bold text-white mb-6">Nuestra vision</h3>
                    <p className="text-slate-300 text-lg leading-relaxed mb-6">
                      Ser un socio tecnologico de referencia para organizaciones que quieren crecer con orden, control y
                      resiliencia operativa.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowVisionDetail(true)}
                      className="mt-auto inline-flex items-center gap-2 text-orange-300 font-semibold hover:text-orange-200 transition-colors"
                    >
                      Evolucion sostenida <FaArrowRight />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="vision-detail"
                    className="relative z-10 h-full flex flex-col"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mb-8 shadow-lg shadow-sky-500/25">
                      <FaEye className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="font-display text-3xl font-bold text-white mb-4">Evolucion sostenida</h3>
                    <p className="text-slate-300 text-base leading-relaxed mb-5">
                      Apuntamos a relaciones de largo plazo donde cada entrega mejore la operacion y deje base para el siguiente nivel.
                    </p>
                    <div className="space-y-3 text-sm text-slate-200 mb-6">
                      <p className="flex items-start gap-2"><FaCheck className="text-emerald-300 mt-1 shrink-0" /> Procesos medibles y trazables.</p>
                      <p className="flex items-start gap-2"><FaCheck className="text-emerald-300 mt-1 shrink-0" /> Roadmap tecnico alineado a negocio.</p>
                      <p className="flex items-start gap-2"><FaCheck className="text-emerald-300 mt-1 shrink-0" /> Mejora continua con datos reales.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowVisionDetail(false)}
                      className="mt-auto inline-flex items-center gap-2 text-orange-300 font-semibold hover:text-orange-200 transition-colors"
                    >
                      Volver a vision <FaArrowRight />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card3D>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {valuePillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                className="premium-card pillar-card p-6 rounded-2xl border border-white/10 bg-slate-900/35"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div
                  className="w-12 h-12 rounded-xl border flex items-center justify-center mb-4"
                  style={{ backgroundColor: pillar.iconBg, borderColor: pillar.iconBorder }}
                >
                  <pillar.icon className="w-5 h-5" style={{ color: pillar.iconColor }} />
                </div>
                <h4 className="text-white text-lg font-semibold mb-2">{pillar.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="diferenciales" className="about-section-diff py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.span className="text-amber-300 font-semibold text-sm tracking-widest uppercase mb-4 block" {...fadeInUp}>
              Diferenciales
            </motion.span>
            <motion.h2 className="font-display text-5xl md:text-6xl font-bold text-white mb-6" {...fadeInUp}>
              Por que trabajamos distinto
            </motion.h2>
            <motion.p className="text-slate-400 max-w-3xl mx-auto text-lg" {...fadeInUp}>
              Cada proyecto se ejecuta con estandares concretos para evitar deuda tecnica, retrabajo y decisiones
              improvisadas.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {differentiators.map((item, i) => (
              <motion.article
                key={item.title}
                className="premium-card differential-card p-7 rounded-2xl border border-white/10 bg-slate-900/45 hover:border-amber-300/35 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/15 to-orange-500/20 border border-amber-300/25 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-amber-200" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-300 mb-3 leading-relaxed">{item.description}</p>
                <p className="text-sm text-amber-200">{item.proof}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section-cases py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.span className="text-amber-300 font-semibold text-sm tracking-widest uppercase mb-4 block" {...fadeInUp}>
              Casos resumidos
            </motion.span>
            <motion.h2 className="font-display text-5xl md:text-6xl font-bold text-white mb-6" {...fadeInUp}>
              Impacto en escenarios reales
            </motion.h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-7">
            {impactCases.map((item, i) => (
              <motion.article
                key={item.sector}
                className="premium-card case-card rounded-3xl border border-white/10 bg-slate-900/45 overflow-hidden"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="p-7 border-b border-white/10 bg-gradient-to-r from-slate-900/80 to-slate-800/40">
                  <p className="text-xs uppercase tracking-[0.2em] text-amber-200 mb-2">Sector</p>
                  <h3 className="text-white text-2xl font-display font-semibold">{item.sector}</h3>
                </div>
                <div className="p-7 space-y-5">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Problema</p>
                    <p className="text-slate-200">{item.challenge}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Solucion</p>
                    <p className="text-slate-200">{item.solution}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-300/25">
                    <p className="text-sm text-amber-200 mb-1">Resultado</p>
                    <p className="text-white font-medium">{item.result}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="certificaciones" className="about-section-certs py-28 px-4 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <motion.span className="text-amber-300 font-semibold text-sm tracking-widest uppercase mb-4 block" {...fadeInUp}>
              Credenciales
            </motion.span>
            <motion.h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-5" {...fadeInUp}>
              Certificaciones y validaciones
            </motion.h2>
            <motion.p className="text-slate-400 text-lg max-w-3xl mx-auto" {...fadeInUp}>
              Formacion continua para sostener buenas decisiones tecnicas, seguridad y entregas consistentes.
            </motion.p>
            <motion.p className="text-amber-100/80 text-sm md:text-base max-w-3xl mx-auto mt-4" {...fadeInUp}>
              Incluye titulo profesional de Ingeniero Informatico y certificaciones tecnicas actualizadas.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {certifications.map((cert, i) => {
              const hasCredential = Boolean(cert.credentialUrl);
              const CertIcon = resolveCertificationIcon(cert);
              const accentColor = resolveCertificationAccent(cert);
              const isDegree = isProfessionalDegreeCard(cert);
              const certCardStyle = { "--cert-accent": accentColor } as const;

              return (
                <motion.article
                  key={cert.id}
                  className={`premium-card cert-card p-7 rounded-2xl border border-white/10 flex flex-col ${isDegree ? "cert-card--degree" : ""
                    }`}
                  style={certCardStyle as React.CSSProperties}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="cert-card__header mb-5">
                    <div className="cert-card__identity">
                      <span className="cert-card__icon" aria-hidden="true">
                        <CertIcon />
                      </span>
                      <div>
                        <p className="cert-card__issuer">{cert.issuer}</p>
                        <h3 className="cert-card__title">{cert.title}</h3>
                      </div>
                    </div>
                    <span className="cert-card__date">{cert.date}</span>
                  </div>

                  {cert.description ? <p className="cert-card__description mb-6">{cert.description}</p> : null}

                  <div className="mt-auto flex items-end justify-between gap-4 pt-2">
                    <div className="cert-card__meta">
                      {cert.level ? (
                        <span className="cert-card__chip cert-card__chip--level">
                          {cert.level}
                        </span>
                      ) : null}
                      {cert.badge ? (
                        <span className="cert-card__chip cert-card__chip--badge">
                          {cert.badge}
                        </span>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => hasCredential && setViewingCert(cert.credentialUrl ?? null)}
                      disabled={!hasCredential}
                      className={`cert-card__button ${hasCredential ? "is-active" : "is-disabled"}`}
                    >
                      {hasCredential ? "Ver certificado" : "Sin enlace"}
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="testimonios" className="py-0">
        <AboutReviewsSection pageContext="sobre-mi" />
      </section>

      <section className="about-section-stack pt-20 md:pt-24 pb-28 md:pb-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <motion.h2 className="font-display text-5xl font-bold text-white mb-6" {...fadeInUp}>
              Stack <span className="gradient-text">Tecnologico</span>
            </motion.h2>
            <motion.p className="text-slate-400 max-w-2xl mx-auto text-lg" {...fadeInUp}>
              Herramientas que usamos para construir productos robustos y preparados para evolucion.
            </motion.p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {stackForRender.map((tech, i) => {
              return (
                <motion.div
                  key={tech.id ?? `${tech.name}-${i}`}
                  className="premium-card stack-card group p-6 rounded-2xl bg-slate-800/20 border border-white/10 hover:border-amber-300/50 hover:bg-slate-800/40 transition-all cursor-default text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.04, y: -4 }}
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-700/45 flex items-center justify-center group-hover:bg-slate-700/65 transition-colors">
                    <StackTechIcon
                      name={tech.name}
                      iconKey={tech.icon_key}
                      color={tech.color}
                    />
                  </div>
                  <span className="text-slate-300 font-semibold group-hover:text-white transition-colors">{tech.name}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="equipo" className="py-24 px-4 bg-black/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content - Text and Button */}
          <motion.div
            className="flex flex-col items-center lg:items-start gap-6"
            {...fadeInUp}
          >
            <h2 className="text-center lg:text-left text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white max-w-lg leading-tight">
              Conozca al equipo que está <span className="gradient-text">dando forma al futuro.</span>
            </h2>
            <p className="text-center lg:text-left text-lg text-slate-300 max-w-md leading-relaxed">
              Nuestro diverso equipo de ingenieros, diseñadores e innovadores se dedica a crear agentes de IA que simplifican el trabajo y empoderan a las empresas de todo el mundo.
            </p>
            <Link
              href="#contacto"
              className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-full font-bold transition-all hover:scale-105 shadow-xl shadow-indigo-500/20"
            >
              Únete a nuestro equipo
              <FaArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Right Content - Image Gallery */}
          <div className="grid grid-cols-3 gap-5 max-w-lg mx-auto lg:mx-0">
            {/* Column 1 */}
            <div className="flex flex-col gap-5 pt-12">
              {[teamMembers[0], teamMembers[4]].map((member, i) => (
                <motion.div
                  key={member?.id || `fallback-c1-${i}`}
                  className="group relative overflow-hidden rounded-2xl aspect-[3/4] border border-white/10"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i }}
                  whileHover={{ y: -6, transition: { duration: 0.3 } }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                    src={member?.avatar_url || (i === 0 ? "https://images.unsplash.com/flagged/photo-1573740144655-bbb6e88fb18a?q=100&w=1200&auto=format&fit=crop" : "https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?q=100&w=1200&auto=format&fit=crop")}
                    alt={member?.name || "Team Member"}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-white text-sm font-bold">{member?.name || "Experto IA"}</p>
                    <p className="text-slate-300 text-xs">{member?.role || "Engineering"}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-5">
              {[teamMembers[1], teamMembers[3], teamMembers[5]].map((member, i) => (
                <motion.div
                  key={member?.id || `fallback-c2-${i}`}
                  className="group relative overflow-hidden rounded-2xl aspect-[3/4] border border-white/10"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 * i }}
                  whileHover={{ y: -6, transition: { duration: 0.3 } }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                    src={member?.avatar_url || (i === 0 ? "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=100&w=1200&auto=format&fit=crop" : i === 1 ? "https://images.unsplash.com/photo-1546961329-78bef0414d7c?q=100&w=1200&auto=format&fit=crop" : "https://images.unsplash.com/flagged/photo-1573740144655-bbb6e88fb18a?q=100&w=1200&auto=format&fit=crop")}
                    alt={member?.name || "Team Member"}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-white text-sm font-bold">{member?.name || "Experto IA"}</p>
                    <p className="text-slate-300 text-xs">{member?.role || "Design"}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-5 pt-8">
              {[teamMembers[2], teamMembers[6]].map((member, i) => (
                <motion.div
                  key={member?.id || `fallback-c3-${i}`}
                  className="group relative overflow-hidden rounded-2xl aspect-[3/4] border border-white/10"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 * i }}
                  whileHover={{ y: -6, transition: { duration: 0.3 } }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                    src={member?.avatar_url || (i === 0 ? "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=100&w=1200&auto=format&fit=crop" : "https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?q=100&w=1200&auto=format&fit=crop")}
                    alt={member?.name || "Team Member"}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-white text-sm font-bold">{member?.name || "Experto IA"}</p>
                    <p className="text-slate-300 text-xs">{member?.role || "Innovación"}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contacto" className="about-section-contact py-28 px-4 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 rounded-full bg-amber-400/10 border border-amber-300/35 text-amber-300 text-sm font-semibold mb-8"
          >
            Contacto institucional
          </motion.span>

          <motion.h2 className="font-display text-5xl md:text-6xl font-bold text-white mb-8 leading-tight" {...fadeInUp}>
            Si buscas un equipo serio, conversemos
          </motion.h2>
          <motion.p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto" {...fadeInUp}>
            Podemos revisar tu contexto, identificar prioridades y proponer una hoja de ruta realista para avanzar.
          </motion.p>

          <div className="flex flex-wrap gap-4 justify-center mb-10">
            <Link
              href={`mailto:${emailText}`}
              className="contact-primary-btn group px-10 py-5 bg-gradient-to-r from-amber-200 via-yellow-300 to-orange-300 text-zinc-950 rounded-full font-bold text-lg transition-all hover:scale-105 flex items-center gap-3"
            >
              <FaEnvelope className="group-hover:scale-110 transition-transform" />
              {emailText}
            </Link>

            <Link
              href={`tel:${phoneText.replace(/\s+/g, "")}`}
              className="contact-secondary-btn px-10 py-5 border border-amber-300/30 text-amber-100 rounded-full font-bold text-lg hover:bg-amber-400/10 transition-all flex items-center gap-3"
            >
              <FaPhone className="animate-pulse" />
              {phoneText}
            </Link>
          </div>

          <div className="flex justify-center gap-6">
            {socialLinks.map(({ icon: Icon, url, color }, i) => (
              <motion.a
                key={i}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="social-orb w-14 h-14 rounded-full bg-slate-900/70 border flex items-center justify-center transition-all"
                style={{
                  color,
                  borderColor: `${color}66`,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 20px rgba(0,0,0,0.35)",
                }}
                whileHover={{ y: -5, scale: 1.1, boxShadow: `0 0 24px ${color}66` }}
              >
                <Icon className="w-6 h-6" style={{ filter: `drop-shadow(0 0 8px ${color}66)` }} />
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      <CertModal viewingCert={viewingCert} onClose={() => setViewingCert(null)} />

    </div>
  );
}

