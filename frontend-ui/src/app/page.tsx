import Hero from "@/components/home/Hero";
import ServiciosHome from "@/components/home/ServiciosHome";
import ProyectosHome from "@/components/home/ProyectosHome";
import Tecnologias from "@/components/home/Tecnologias";
import Experiencia from "@/components/home/Experiencia";
import Testimonios from "@/components/home/Testimonios";
import Certificaciones from "@/components/home/Certificaciones";
import ContactoHome from "@/components/home/ContactO";


export default function HomePage() {
  return (
    <>
      <Hero />

      <hr className="separator-glow" />
      <ServiciosHome />

      <hr className="separator-glow" />
      <ProyectosHome />

      <hr className="separator-glow" />
      <Tecnologias />

      <hr className="separator-glow" />
      <Experiencia />

      <hr className="separator-glow" />
      <Testimonios />

      <hr className="separator-glow" />
      <Certificaciones />

      <hr className="separator-glow" />
      <ContactoHome />
    </>
  );
}
