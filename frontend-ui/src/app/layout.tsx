import type { Metadata } from "next";


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

const resolvedMetadataBase = (() => {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").trim();
  try {
    return new URL(raw);
  } catch {
    return new URL("http://localhost:3000");
  }
})();

// ======================
// METADATA
// ======================
export const metadata: Metadata = {
  metadataBase: resolvedMetadataBase,
  title: "Next Level Software Pro | Ingeniería Digital de Élite",
  description: "Desarrollo de software a medida, aplicaciones móviles y consultoría TI de alto rendimiento. Elevamos estándares digitales con soluciones robustas y estéticas.",
  keywords: ["Desarrollo Web", "Software a Medida", "Apps Móviles", "Chile", "Ingeniería Digital", "SaaS", "Next Level"],
  openGraph: {
    title: "Next Level Software Pro | Ingeniería Digital de Élite",
    description: "Elevando estándares digitales con ingeniería de software de élite.",
    url: "https://nextlevelsoftwarepro.com",
    siteName: "Next Level Software Pro",
    images: [
      {
        url: "/img/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Next Level Software Pro",
      },
    ],
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Next Level Software Pro | Ingeniería Digital de Élite",
    description: "Elevando estándares digitales con ingeniería de software de élite.",
    images: ["/img/og-image.jpg"],
  },
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
