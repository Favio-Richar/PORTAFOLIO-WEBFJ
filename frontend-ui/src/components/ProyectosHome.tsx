export default function ProyectosHome() {
  const proyectos = [
    {
      titulo: "SmartRent+",
      desc: "Plataforma completa de arriendos, ventas y ERP-lite.",
    },
    {
      titulo: "Mi Negocio Digital",
      desc: "Sistema web para PYMEs con productos, ventas y dashboard.",
    },
    {
      titulo: "Portafolio Profesional",
      desc: "Sitio personal moderno hecho con Next.js y Tailwind.",
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6">
      <h2 className="text-3xl font-bold text-blue-600 mb-6 text-center">
        Proyectos destacados
      </h2>

      <div className="grid md:grid-cols-3 gap-8">
        {proyectos.map((p) => (
          <div
            key={p.titulo}
            className="p-6 bg-white shadow rounded-lg hover:shadow-xl transition"
          >
            <h3 className="text-xl font-bold text-gray-900">{p.titulo}</h3>
            <p className="text-gray-600 mt-2">{p.desc}</p>
            <a
              href="/proyectos"
              className="text-blue-600 mt-4 inline-block font-semibold"
            >
              Ver más →
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
