import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";


import "./globals.css"; // 👈 SOLO UN SISTEMA DE ESTILOS

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GlobalThemeBackground from "@/components/layout/GlobalThemeBackground";

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
      </body>
    </html>
  );
}
