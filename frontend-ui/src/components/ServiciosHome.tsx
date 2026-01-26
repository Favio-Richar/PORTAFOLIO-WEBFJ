export default function ServiciosHome() {
  const servicios = [
    {
      nombre: "Desarrollo Web",
      detalle: "Sitios modernos con Next.js, Python y PostgreSQL.",
    },
    {
      nombre: "Apps Móviles",
      detalle: "Aplicaciones rápidas y elegantes con Flutter.",
    },
    {
      nombre: "Soporte Tecnológico",
      detalle: "Mantenimiento, hosting, VPS y automatización.",
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6">
      <h2 className="text-3xl font-bold text-blue-600 mb-6 text-center">
        Servicios
      </h2>

      <div className="grid md:grid-cols-3 gap-8">
        {servicios.map((s) => (
          <div
            key={s.nombre}
            className="p-6 bg-white shadow rounded-lg hover:shadow-xl transition"
          >
            <h3 className="text-xl font-bold text-gray-900">{s.nombre}</h3>
            <p className="text-gray-600 mt-2">{s.detalle}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
