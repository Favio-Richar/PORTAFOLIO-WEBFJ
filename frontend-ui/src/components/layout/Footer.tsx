"use client";

import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaEnvelope, FaInstagram } from "react-icons/fa";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      suppressHydrationWarning
      className="relative w-full py-6 mt-12 border-t border-white/5 bg-black/40 backdrop-blur-md font-bold"
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">

        {/* BRANDING & LEGAL */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-[9px] font-black uppercase tracking-[0.3em] text-white/30">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-cyan-500/40 animate-pulse shadow-[0_0_10px_#06b6d4]" />
            <p className="text-white/50 tracking-[0.4em]">NEXT LEVEL SOFTWARE PRO</p>
          </div>
          <span className="hidden md:inline text-white/5">|</span>
          <p suppressHydrationWarning>© {year} — TODOS LOS DERECHOS RESERVADOS</p>
          <span className="hidden md:inline text-white/5">|</span>
          <a href="/privacidad" className="hover:text-cyan-400 transition-colors duration-300">
            POLÍTICA DE PRIVACIDAD
          </a>
        </div>

        {/* SOCIAL ICONS */}
        <div className="flex items-center gap-4">
          <SocialIcon href="https://github.com/Favio-Richar" icon={<FaGithub />} color="#ffffff" />
          <SocialIcon href="https://linkedin.com/in/favio-jimenez" icon={<FaLinkedin />} color="#0077b5" />
          <SocialIcon href="mailto:contacto@levelsoftwarepro.com" icon={<FaEnvelope />} color="#06b6d4" />
          <SocialIcon href="https://instagram.com/favio.jimenez" icon={<FaInstagram />} color="#e4405f" />
        </div>

      </div>

      <div className="absolute inset-0 pointer-events-none opacity-[0.02] overflow-hidden">
        <div className="w-full h-[1px] bg-white animate-scan" />
      </div>
    </footer>
  );
}

function SocialIcon({ href, icon, color }: { href: string; icon: React.ReactNode; color: string }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{
        y: -4,
        scale: 1.1
      }}
      whileTap={{ scale: 0.95 }}
      style={{ "--hover-color": color } as React.CSSProperties}
      className="w-10 h-10 rounded-2xl glass-light border border-white/5 flex items-center justify-center text-white/20 transition-all duration-500 text-sm shadow-xl hover:text-[var(--hover-color)] hover:bg-[var(--hover-color)]/10 hover:border-[var(--hover-color)]/30"
    >
      {icon}
    </motion.a>
  );
}
