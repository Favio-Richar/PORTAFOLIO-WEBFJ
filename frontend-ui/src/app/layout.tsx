import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Orbitron, Rajdhani } from "next/font/google";


import "./globals.css"; // 👈 SOLO UN SISTEMA DE ESTILOS
import "../styles/services-elite.scss";
import "../styles/blog-elite.scss";
import "../styles/contact-elite.scss";
import "../styles/clients-elite.scss";
import "../styles/projects-elite.scss";
import "../styles/logo-elite.scss";
import "../styles/home-elite.scss";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GlobalThemeBackground from "@/components/layout/GlobalThemeBackground";
import FloatingChat from "@/components/layout/FloatingChat";

// ======================
// FUENTES
// ======================
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["600", "700"],
});

// ======================
// METADATA
// ======================
export const metadata: Metadata = {
  title: "Portafolio – Favio Jiménez",
  description: "Portafolio profesional Full Stack",
};

// ======================
// ROOT LAYOUT
// ======================
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          ${playfair.variable}
          ${orbitron.variable}
          ${rajdhani.variable}
          min-h-screen
          antialiased
          relative
        `}
      >
        <GlobalThemeBackground />
        <Navbar />

        {/* 🔥 CONTENIDO FULL WIDTH */}
        <main className="relative w-full">
          {children}
        </main>

        <Footer />
        <FloatingChat />
      </body>
    </html>
  );
}
