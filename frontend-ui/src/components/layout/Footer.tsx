"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { FaGithub, FaLinkedin, FaInstagram, FaArrowRight } from "react-icons/fa";

export default function Footer() {
  const pathname = usePathname();
  const isServicesPage = pathname?.startsWith("/servicios");

  // Hide Footer on Auth and Admin pages
  if (pathname?.startsWith("/auth") || pathname?.startsWith("/admin")) {
    return null;
  }

  const year = new Date().getFullYear();
  const accentText = isServicesPage ? "text-cyan-300" : "text-indigo-500";
  const accentBorder = isServicesPage ? "border-cyan-400/70" : "border-indigo-500";
  const accentHoverBg = isServicesPage ? "group-hover:bg-cyan-500" : "group-hover:bg-indigo-500";
  const accentBullet = isServicesPage ? "bg-cyan-400" : "bg-indigo-500";
  const accentInputFocus = isServicesPage ? "focus:border-cyan-400" : "focus:border-indigo-500";
  const accentBtn = isServicesPage ? "hover:bg-cyan-400" : "hover:bg-indigo-400";

  return (
    <footer
      suppressHydrationWarning
      className={`relative w-full border-t border-white/10 text-slate-300 font-sans ${
        isServicesPage
          ? "bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.08),transparent_38%),radial-gradient(circle_at_85%_80%,rgba(16,185,129,0.08),transparent_42%),#05070d]"
          : "bg-[#050505]"
      }`}
    >
      {/* SOLID DECO LINE */}
      <div
        className={`w-full h-1 bg-gradient-to-r ${
          isServicesPage
            ? "from-cyan-500/50 via-sky-400/80 to-emerald-400/60"
            : "from-indigo-900 via-indigo-600 to-indigo-900"
        }`}
      />

      <div className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* COLUMN 1: BRAND */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${accentText} ${accentHoverBg} group-hover:text-white transition-all`}>
                <img src="/img/logo.nextlevelsoftwarepro.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-black tracking-tighter text-lg leading-none uppercase">Next Level</span>
                <div className="flex items-center gap-2">
                  <span className={`w-0 group-hover:w-4 h-[2px] ${accentBullet} transition-all duration-300`} />
                  <span className={`${accentText} font-bold tracking-[0.2em] text-[10px] uppercase`}>Software Pro</span>
                </div>
              </div>
            </Link>

            <p className="text-xs leading-relaxed text-slate-400 max-w-xs group-hover:text-slate-200 transition-colors">
              Elevando estándares digitales con ingeniería de software de élite. Soluciones robustas, escalables y estéticamente superiores.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <SocialIcon href="https://github.com/Favio-Richar" icon={<FaGithub />} />
              <SocialIcon href="https://linkedin.com/in/favio-jimenez" icon={<FaLinkedin />} />
              <SocialIcon href="https://instagram.com/favio.jimenez" icon={<FaInstagram />} />
            </div>
          </div>

          {/* COLUMN 2: SERVICES */}
          <div>
            <h3 className={`text-white font-black uppercase tracking-[0.2em] text-sm mb-6 border-l-2 ${accentBorder} pl-3`}>Servicios</h3>
            <ul className="space-y-3 text-xs font-medium uppercase tracking-wider text-slate-400">
              <li>
                <Link href="/servicios" className="hover:text-white transition-colors flex items-center gap-2 group">
                  <span className={`w-1 h-1 ${accentBullet} opacity-0 group-hover:opacity-100 transition-opacity`} /> Desarrollo Web
                </Link>
              </li>
              <li>
                <Link href="/servicios" className="hover:text-white transition-colors flex items-center gap-2 group">
                  <span className={`w-1 h-1 ${accentBullet} opacity-0 group-hover:opacity-100 transition-opacity`} /> Apps Móviles
                </Link>
              </li>
              <li>
                <Link href="/servicios" className="hover:text-white transition-colors flex items-center gap-2 group">
                  <span className={`w-1 h-1 ${accentBullet} opacity-0 group-hover:opacity-100 transition-opacity`} /> E-Commerce
                </Link>
              </li>
              <li>
                <Link href="/servicios" className="hover:text-white transition-colors flex items-center gap-2 group">
                  <span className={`w-1 h-1 ${accentBullet} opacity-0 group-hover:opacity-100 transition-opacity`} /> Consultoría TI
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: COMPANY */}
          <div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter group-hover:text-indigo-400 transition-colors">
              Favio<span className={accentText}>.JV</span>
            </h3>
            <ul className="space-y-3 text-xs font-medium uppercase tracking-wider text-slate-400">
              <li><Link href="/sobre-mi" className="hover:text-white transition-colors">Sobre Mí</Link></li>
              <li><Link href="/proyectos" className="hover:text-white transition-colors">Proyectos</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog Tech</Link></li>
              <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
            </ul>
          </div>

          {/* COLUMN 4: NEWSLETTER */}
          <div>
            <h3 className={`text-white font-black uppercase tracking-[0.2em] text-sm mb-6 border-l-2 ${accentBorder} pl-3`}>Newsletter</h3>
            <p className="text-xs text-slate-400 mb-4">Suscríbete para recibir actualizaciones tecnológicas y ofertas exclusivas.</p>
            <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="TU CORREO ELECTRÓNICO"
                className={`bg-[#0a0a0a] border border-white/20 px-4 py-3 text-xs text-white placeholder:text-slate-600 ${accentInputFocus} outline-none transition-colors uppercase font-bold tracking-wider`}
              />
              <button className={`bg-white text-black px-4 py-3 text-xs font-black uppercase tracking-[0.2em] ${accentBtn} transition-colors flex items-center justify-center gap-2`}>
                Suscribirse <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* COPYRIGHT STRIP */}
      <div className="border-t border-white/5 bg-[#020202] py-6 px-6">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          <p>© {year} Next Level Software Pro. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
            <Link href="/terminos" className="hover:text-white transition-colors">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ href, icon }: { href: string; icon: React.ReactNode }) {
  const pathname = usePathname();
  const isServicesPage = pathname?.startsWith("/servicios");
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-8 h-8 flex items-center justify-center bg-[#111] border border-white/10 text-slate-400 hover:text-white ${
        isServicesPage ? "hover:bg-cyan-500/80 hover:border-cyan-400/70" : "hover:bg-indigo-600 hover:border-indigo-500"
      } transition-all duration-300 rounded-sm`}
    >
      {icon}
    </a>
  );
}
